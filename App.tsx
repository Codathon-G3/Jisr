import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  I18nManager,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  Chip,
  Recipient,
  Tone,
  IdentifierRemoved,
  Alignment,
} from './src/types';
import {
  checkRisk,
  generateDrafts,
  checkFaithfulness,
  getOfflineDrafts,
} from './src/services/api';
import { checkLocalCrisis } from './src/services/crisisCheck';
import { sanitizePii } from './src/services/piiSanitizer';
import {
  recordChipSelection,
  getHistory,
  clearHistory,
  checkChipRecurrence,
} from './src/services/storage';

import {
  BaselineComparison,
  FaithfulnessView,
  OutboundPreview,
  SupportCardModal,
  TriggerModal,
} from './src/components';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { colors } from './src/theme';

import ar from './src/i18n/ar.json';
import plainTemplatesData from './safety/plain-templates.json';

const TONE_KEYS: Tone[] = ['gentle', 'direct', 'formal'];

// Rayan's intro artwork (shared with the Next.js web showcase)
const INTRO_IMAGE = require('./public/brand/jisr-intro-mobile.png');
const LOGO_IMAGE = require('./public/brand/jisr-logo.png');
const INTRO_IMAGE_SIZE = { width: 941, height: 1672, cornerRadius: 20 };
const INTRO_AUTO_ENTER_MS = 4200;
const INTRO_FADE_MS = 650;

type Screen = 'intro' | 'capture' | 'drafting' | 'encouraged_out';

export default function App() {
  // Capture inputs
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>('friend');
  const [inputText, setInputText] = useState('');

  // Screen state
  const [activeScreen, setActiveScreen] = useState<Screen>('intro');
  const [isLoading, setIsLoading] = useState(false);

  // Intro / splash
  const introOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const introFinishedRef = useRef(false);
  const [introArea, setIntroArea] = useState({ width: 0, height: 0 });

  // Modals state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isCrisisModal, setIsCrisisModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggerChipLabel, setTriggerChipLabel] = useState('');
  const [triggerIsRecurrence, setTriggerIsRecurrence] = useState(false);
  // Selection the user answered "not now" to; continuing with it skips the prompt
  const [dismissedSelectionKey, setDismissedSelectionKey] = useState('');

  // Drafts & Tone
  const [drafts, setDrafts] = useState<Record<Tone, string>>({
    gentle: '',
    direct: '',
    formal: '',
  });
  const [currentTone, setCurrentTone] = useState<Tone>('gentle');
  const [editedDraft, setEditedDraft] = useState('');

  // Trust & Control Views
  const [showBaseline, setShowBaseline] = useState(false);
  const [showFaithfulness, setShowFaithfulness] = useState(false);
  const [showOutbound, setShowOutbound] = useState(false);
  const [sanitizedData, setSanitizedData] = useState<{
    sanitisedText: string;
    identifiersRemoved: IdentifierRemoved[];
  }>({
    sanitisedText: '',
    identifiersRemoved: [],
  });
  const [alignments, setAlignments] = useState<Alignment[]>([]);

  // Sandboxed On-Device History
  const [historyCount, setHistoryCount] = useState(0);

  // Load history count on mount
  useEffect(() => {
    getHistory().then((items) => setHistoryCount(items.length));
  }, []);

  // Update live draft editor when switching tones or when drafts load
  useEffect(() => {
    if (drafts[currentTone]) {
      setEditedDraft(drafts[currentTone]);
    }
  }, [currentTone, drafts]);

  // Update faithfulness alignments when edited draft changes
  useEffect(() => {
    if (activeScreen === 'drafting' && editedDraft) {
      const source = inputText || (selectedChips[0] ? ar.chips[selectedChips[0]] : '');
      checkFaithfulness(source, editedDraft).then((res) => {
        setAlignments(res.alignments || []);
      });
    }
  }, [activeScreen, editedDraft, inputText, selectedChips]);

  // ---------------- Intro ----------------

  const enterApp = useCallback(() => {
    if (introFinishedRef.current) return;
    introFinishedRef.current = true;

    Animated.timing(introOpacity, {
      toValue: 0,
      duration: INTRO_FADE_MS,
      useNativeDriver: true,
    }).start(() => {
      setActiveScreen('capture');
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }).start();
    });
  }, [introOpacity, contentOpacity]);

  // The intro enters the app on its own after a few seconds, but waits while
  // the support card is open so the human route is never cut short.
  useEffect(() => {
    if (activeScreen !== 'intro' || showSupportModal) return;
    const timer = setTimeout(enterApp, INTRO_AUTO_ENTER_MS);
    return () => clearTimeout(timer);
  }, [activeScreen, showSupportModal, enterApp]);

  const introImageStyle = useMemo(() => {
    const scale = Math.min(
      introArea.width / INTRO_IMAGE_SIZE.width,
      introArea.height / INTRO_IMAGE_SIZE.height
    );
    return {
      width: INTRO_IMAGE_SIZE.width * scale,
      height: INTRO_IMAGE_SIZE.height * scale,
      borderRadius: INTRO_IMAGE_SIZE.cornerRadius * scale,
    };
  }, [introArea]);

  const handleIntroLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setIntroArea({ width, height });
  };

  // ---------------- Guardian: live crisis interception ----------------

  const [debouncedInputText, setDebouncedInputText] = useState(inputText);
  const [debouncedEditedDraft, setDebouncedEditedDraft] = useState(editedDraft);
  const [dismissedCrisisText, setDismissedCrisisText] = useState('');

  // 700ms debounce prevents mid-phrase false alarms while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputText(inputText);
    }, 700);
    return () => clearTimeout(timer);
  }, [inputText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedEditedDraft(editedDraft);
    }, 700);
    return () => clearTimeout(timer);
  }, [editedDraft]);

  const inputRisk = useMemo(() => checkLocalCrisis(debouncedInputText), [debouncedInputText]);
  const draftRisk = useMemo(
    () => (activeScreen === 'drafting' ? checkLocalCrisis(debouncedEditedDraft) : null),
    [activeScreen, debouncedEditedDraft]
  );
  const crisisDetected = inputRisk.riskDetected || Boolean(draftRisk?.riskDetected);

  // A new match opens the support card, unless already dismissed for this exact text
  useEffect(() => {
    if (!crisisDetected) return;
    const currentRiskText = inputRisk.riskDetected ? debouncedInputText : debouncedEditedDraft;
    if (currentRiskText && currentRiskText === dismissedCrisisText) return;

    setShowTriggerModal(false);
    setIsCrisisModal(true);
    setShowSupportModal(true);
  }, [crisisDetected, debouncedInputText, debouncedEditedDraft, dismissedCrisisText, inputRisk.riskDetected]);

  const openSupport = () => {
    setIsCrisisModal(crisisDetected);
    setShowSupportModal(true);
  };

  // ---------------- Capture ----------------

  // Compute deterministic baseline template for the selected chip, recipient, and tone
  const activeBaselineTemplate = useMemo(() => {
    const chip = selectedChips[0];
    if (!chip) return '';
    const topicLabels = plainTemplatesData.topic_labels as Record<string, string>;
    const topic = topicLabels[chip] || ar.chips[chip] || 'موضوع شاغلني';
    const templates = plainTemplatesData[currentTone] as Record<string, string>;
    const raw = templates[selectedRecipient] || templates.friend;
    return raw.replace(/\[topic\]/g, topic).replace(/\{topic\}/g, topic);
  }, [selectedChips, selectedRecipient, currentTone]);

  const selectedTopicLabel = selectedChips.map((id) => ar.chips[id]).join('، ');
  const selectionKey = [...selectedChips].sort().join('|');

  const handleToggleChip = (chipId: Chip) => {
    setSelectedChips((current) =>
      current.includes(chipId)
        ? current.filter((id) => id !== chipId)
        : [...current, chipId]
    );
  };

  // "Continue" opens the writing invitation, as on the web showcase. A chip
  // picked 3+ times before gets the pattern prompt instead.
  const handleContinue = async () => {
    if (selectedChips.length === 0 || crisisDetected) return;

    if (selectionKey === dismissedSelectionKey) {
      handleStartDrafting();
      return;
    }

    let recurringChip: Chip | undefined;
    for (const chip of selectedChips) {
      if (await checkChipRecurrence(chip)) {
        recurringChip = chip;
        break;
      }
    }

    setTriggerChipLabel(recurringChip ? ar.chips[recurringChip] : selectedTopicLabel);
    setTriggerIsRecurrence(Boolean(recurringChip));
    setShowTriggerModal(true);
  };

  const handleNotNow = () => {
    setDismissedSelectionKey(selectionKey);
    setShowTriggerModal(false);
  };

  // Main submission handler: triggers Guardian risk screening and drafting engine
  const handleStartDrafting = async () => {
    if (selectedChips.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار موضوع واحد على الأقل للمتابعة.');
      return;
    }

    setShowTriggerModal(false);
    setIsLoading(true);

    try {
      // 1. GUARDIAN LAYER PRE-DRAFTING CHECK (Zero-latency regex + backend /api/check-risk)
      const riskCheckResult = await checkRisk(inputText, selectedChips);

      if (riskCheckResult.riskDetected) {
        // Crisis detected: HALT drafting immediately and present unalterable SupportCardModal
        setIsLoading(false);
        setIsCrisisModal(true);
        setShowSupportModal(true);
        return;
      }

      // 2. PRIVACY & PII SANITIZATION
      const pii = sanitizePii(inputText);
      setSanitizedData(pii);

      // 3. SANDBOXED ON-DEVICE HISTORY RECORDING
      await recordChipSelection(selectedChips[0], selectedRecipient);
      const updatedHistory = await getHistory();
      setHistoryCount(updatedHistory.length);

      // 4. 3-TONE DRAFTING ENGINE (FastAPI with deterministic safety/plain-templates.json fallback)
      const response = await generateDrafts({
        text: inputText,
        chips: selectedChips,
        recipient: selectedRecipient,
        language: 'ar',
      });

      const gentle = response.drafts.find((d) => d.tone === 'gentle')?.text || '';
      const direct = response.drafts.find((d) => d.tone === 'direct')?.text || '';
      const formal = response.drafts.find((d) => d.tone === 'formal')?.text || '';

      setDrafts({ gentle, direct, formal });
      setCurrentTone('gentle');
      setEditedDraft(gentle);
      setActiveScreen('drafting');
    } catch (error) {
      console.warn('Drafting error, falling back to offline templates:', error);
      const fallback = getOfflineDrafts(selectedChips, selectedRecipient, inputText);
      const fallbackDrafts: Record<Tone, string> = {
        gentle: fallback.drafts.find((d) => d.tone === 'gentle')?.text || '',
        direct: fallback.drafts.find((d) => d.tone === 'direct')?.text || '',
        formal: fallback.drafts.find((d) => d.tone === 'formal')?.text || '',
      };
      setDrafts(fallbackDrafts);
      setCurrentTone('gentle');
      setEditedDraft(fallbackDrafts.gentle);
      setActiveScreen('drafting');
    } finally {
      setIsLoading(false);
    }
  };

  // Share via OS native share sheet (WhatsApp, Messenger, SMS handoff) with 0 telemetry
  const handleShare = async () => {
    if (!editedDraft || crisisDetected) return;

    try {
      const result = await Share.share({
        message: editedDraft,
        title: ar.app_name,
      });

      if (result.action === Share.sharedAction) {
        // Handed off successfully to chosen platform: show encouraged-out screen
        setActiveScreen('encouraged_out');
      }
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  // Clear local sandboxed history
  const handleClearHistory = async () => {
    await clearHistory();
    setHistoryCount(0);
    Alert.alert('تم المسح', 'تم مسح السجل المحلي لجهازك بالكامل بنجاح.');
  };

  // Reset session to start a new draft
  const handleStartNew = () => {
    setSelectedChips([]);
    setInputText('');
    setSelectedRecipient('friend');
    setCurrentTone('gentle');
    setEditedDraft('');
    setDismissedSelectionKey('');
    setShowBaseline(false);
    setShowFaithfulness(false);
    setShowOutbound(false);
    setActiveScreen('capture');
  };

  const supportModal = (
    <SupportCardModal
      visible={showSupportModal}
      isCrisis={isCrisisModal}
      onClose={() => {
        setShowSupportModal(false);
        setIsCrisisModal(false);
        const currentRiskText = inputRisk.riskDetected ? debouncedInputText : debouncedEditedDraft;
        setDismissedCrisisText(currentRiskText);
      }}
    />
  );

  // ================= INTRO / SPLASH =================
  if (activeScreen === 'intro') {
    return (
      <View style={styles.introRoot} onLayout={handleIntroLayout}>
        <StatusBar style="dark" translucent={false} backgroundColor={colors.introFrame} />

        <Animated.View style={[styles.introContent, { opacity: introOpacity }]}>
          {introArea.width > 0 && (
            <Image
              source={INTRO_IMAGE}
              style={introImageStyle}
              resizeMode="cover"
              accessible
              accessibilityLabel={`${ar.app_name} — جسر لطيف نحو شخص تثق به`}
            />
          )}

          <View style={styles.introActions}>
            {/* PERSISTENT HUMAN ROUTE (also reachable from the intro) */}
            <TouchableOpacity
              style={[styles.humanRouteButton, styles.introHumanRoute]}
              onPress={openSupport}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={ar.triggers.persistent_human_route}
            >
              <Text style={styles.humanRouteText}>
                {ar.triggers.persistent_human_route}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.introStartButton}
              onPress={enterApp}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="ابدأ"
            >
              <Text style={styles.introStartText}>ابدأ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {supportModal}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" translucent={false} backgroundColor={colors.cream} />

      {/* ================= PERSISTENT HUMAN ROUTE ("تكلم مع حد توا") ================= */}
      <View style={styles.topBar}>
        {activeScreen !== 'intro' && activeScreen !== 'capture' ? (
          <Image
            source={LOGO_IMAGE}
            style={styles.topBarLogo}
            resizeMode="contain"
            accessibilityLabel={ar.app_name}
          />
        ) : null}
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={styles.humanRouteButton}
          onPress={openSupport}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={ar.triggers.persistent_human_route}
        >
          <Text style={styles.humanRouteText}>
            {ar.triggers.persistent_human_route}
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.contentFade, { opacity: contentOpacity }]}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.appCard}>
            {activeScreen === 'capture' && (
              /* ================= SCREEN 1: CAPTURE ================= */
              <CaptureScreen
                selectedChips={selectedChips}
                onToggleChip={handleToggleChip}
                selectedRecipient={selectedRecipient}
                onSelectRecipient={setSelectedRecipient}
                inputText={inputText}
                onChangeInputText={setInputText}
                onSubmit={handleContinue}
                isLoading={isLoading}
                crisisDetected={inputRisk.riskDetected}
                onOpenSupport={openSupport}
                historyCount={historyCount}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeScreen === 'drafting' && (
              /* ================= SCREEN 2: 3-TONE DRAFTING & TRUST ================= */
              <View>
                <View style={styles.draftHeader}>
                  <View style={styles.draftHeaderText}>
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>{ar.disclosure.badge}</Text>
                    </View>
                    <Text style={styles.draftTitle}>اختر الصياغة اللي تريحك</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.smallBackButton}
                    onPress={() => setActiveScreen('capture')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="رجوع لتعديل الاختيارات"
                  >
                    <Text style={styles.smallBackButtonText}>←</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                  اختار الأسلوب الأقرب ليك، وبعدها تقدر تعدّل أي كلمة قبل المشاركة.
                </Text>

                {/* 3 Tone Cards: لطيف / مباشر / رسمي */}
                <View style={styles.toneButtons}>
                  {TONE_KEYS.map((toneKey) => {
                    const isActive = currentTone === toneKey;
                    return (
                      <TouchableOpacity
                        key={toneKey}
                        style={[styles.toneButton, isActive && styles.toneButtonSelected]}
                        onPress={() => setCurrentTone(toneKey)}
                        activeOpacity={0.8}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isActive }}
                        accessibilityLabel={ar.tones[toneKey].label}
                      >
                        <Text style={[styles.toneLabel, isActive && styles.toneTextSelected]}>
                          {ar.tones[toneKey].label}
                        </Text>
                        <Text
                          style={[styles.toneDescription, isActive && styles.toneTextSelected]}
                        >
                          {ar.tones[toneKey].description}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* In-Place Editable Draft */}
                <TextInput
                  style={styles.draftEditor}
                  multiline
                  value={editedDraft}
                  onChangeText={setEditedDraft}
                  textAlign="right"
                  textAlignVertical="top"
                  placeholder="اكتب رسالتك هنا..."
                  placeholderTextColor={colors.muted}
                  accessibilityLabel="نص الرسالة القابل للتعديل"
                />

                {/* AI Disclosure */}
                <View style={styles.disclosureBox}>
                  <Text style={styles.disclosureBadge}>{ar.disclosure.badge}</Text>
                  <Text style={styles.disclosureNotice}>{ar.disclosure.notice}</Text>
                </View>

                {/* Trust & Control Toggles */}
                <View style={styles.trustControlsRow}>
                  <TouchableOpacity
                    style={[styles.trustToggleBtn, showBaseline && styles.trustToggleBtnActive]}
                    onPress={() => setShowBaseline(!showBaseline)}
                    activeOpacity={0.8}
                    accessibilityState={{ expanded: showBaseline }}
                  >
                    <Text
                      style={[styles.trustToggleText, showBaseline && styles.trustToggleTextActive]}
                    >
                      {showBaseline ? 'إخفاء المقارنة' : 'مقارنة مع القالب'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.trustToggleBtn,
                      showFaithfulness && styles.trustToggleBtnActive,
                    ]}
                    onPress={() => setShowFaithfulness(!showFaithfulness)}
                    activeOpacity={0.8}
                    accessibilityState={{ expanded: showFaithfulness }}
                  >
                    <Text
                      style={[
                        styles.trustToggleText,
                        showFaithfulness && styles.trustToggleTextActive,
                      ]}
                    >
                      {showFaithfulness ? 'إخفاء المصدر' : 'فحص المصدر'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.trustToggleBtn, showOutbound && styles.trustToggleBtnActive]}
                    onPress={() => setShowOutbound(!showOutbound)}
                    activeOpacity={0.8}
                    accessibilityState={{ expanded: showOutbound }}
                  >
                    <Text
                      style={[styles.trustToggleText, showOutbound && styles.trustToggleTextActive]}
                    >
                      {showOutbound ? 'إخفاء الخصوصية' : 'فحص الخصوصية'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* TRUST VIEW 1: Baseline Comparison */}
                {showBaseline && (
                  <BaselineComparison
                    aiDraft={editedDraft}
                    baselineTemplate={activeBaselineTemplate}
                    recipientLabel={ar.recipients[selectedRecipient]}
                    onSelectDraft={(text) => setEditedDraft(text)}
                    style={styles.trustModule}
                  />
                )}

                {/* TRUST VIEW 2: Faithfulness Alignment */}
                {showFaithfulness && (
                  <FaithfulnessView
                    draftText={editedDraft}
                    originalText={
                      inputText || (selectedChips[0] ? ar.chips[selectedChips[0]] : '')
                    }
                    alignments={alignments}
                    style={styles.trustModule}
                  />
                )}

                {/* TRUST VIEW 3: Outbound PII Preview */}
                {showOutbound && (
                  <OutboundPreview
                    sanitisedText={
                      sanitizedData.sanitisedText ||
                      (selectedChips[0] ? ar.chips[selectedChips[0]] : '')
                    }
                    identifiersRemoved={sanitizedData.identifiersRemoved}
                    onEdit={() => setActiveScreen('capture')}
                    style={styles.trustModule}
                  />
                )}

                {/* Native Share Sheet */}
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!editedDraft || crisisDetected) && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleShare}
                  disabled={!editedDraft || crisisDetected}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={ar.buttons.share}
                >
                  <Text style={styles.primaryButtonText}>{ar.buttons.share}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeScreen === 'encouraged_out' && (
              /* ================= SCREEN 3: HANDOFF / READY ================= */
              <View style={styles.readyScreen}>
                <Image
                  source={LOGO_IMAGE}
                  style={styles.readyLogo}
                  resizeMode="contain"
                  accessibilityLabel={ar.app_name}
                />
                <View style={styles.readyIcon}>
                  <Text style={styles.readyIconText}>✓</Text>
                </View>
                <Text style={styles.readyTitle}>{ar.handoff.ready_message}</Text>
                <Text style={styles.readyText}>
                  تذكر ديماً: مجرد كسر حاجز الصمت والحديث مع شخص تثق فيه هو البداية الحقيقية للشعور بالراحة.
                </Text>

                <TouchableOpacity
                  style={[styles.primaryButton, styles.fullWidth]}
                  onPress={handleStartNew}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryButtonText}>كتابة رسالة جديدة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryButton, styles.fullWidth]}
                  onPress={() => setActiveScreen('drafting')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>رجوع</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </Animated.View>

      {/* ================= STATIC UNALTERABLE SUPPORT CARD MODAL ================= */}
      {supportModal}

      {/* ================= WRITING TRIGGER MODAL ================= */}
      <TriggerModal
        visible={showTriggerModal}
        chipLabel={triggerChipLabel}
        isRecurrence={triggerIsRecurrence}
        onConfirm={handleStartDrafting}
        onDismiss={handleNotNow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ---------- Intro ----------
  introRoot: {
    flex: 1,
    backgroundColor: colors.introFrame,
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    gap: 14,
  },
  introHumanRoute: {
    backgroundColor: 'rgba(250, 246, 239, 0.94)',
    shadowColor: colors.navy,
    shadowOpacity: 0.12,
  },
  introStartButton: {
    minWidth: 148,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.green,
    alignItems: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  introStartText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },

  // ---------- Shell ----------
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  topBar: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  topBarLogo: {
    width: 75,
    height: 23,
    marginHorizontal: 4,
  },
  topBarSpacer: {
    flex: 1,
  },
  humanRouteButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.safetyBorder,
    backgroundColor: colors.safetySoft,
    shadowColor: colors.safety,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.1,
    shadowRadius: 11,
    elevation: 3,
  },
  humanRouteText: {
    color: colors.safety,
    fontSize: 13,
    fontWeight: '800',
  },
  contentFade: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 22,
  },
  appCard: {
    width: '100%',
    paddingHorizontal: 17,
    paddingVertical: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.93)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    shadowColor: colors.brown,
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.09,
    shadowRadius: 32,
    elevation: 4,
  },

  // ---------- Drafting ----------
  draftHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'flex-start',
    gap: 13,
    marginBottom: 8,
  },
  draftHeaderText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  smallBackButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(62, 43, 5, 0.18)',
    backgroundColor: colors.white,
  },
  smallBackButtonText: {
    color: colors.brown,
    fontSize: 16,
    fontWeight: '800',
  },
  aiBadge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.lavenderSoft,
  },
  aiBadgeText: {
    color: colors.lavender,
    fontSize: 12,
    fontWeight: '800',
  },
  draftTitle: {
    marginTop: 7,
    color: colors.navy,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'right',
    lineHeight: 32,
  },
  hint: {
    marginBottom: 15,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  toneButtons: {
    gap: 9,
    marginTop: 7,
    marginBottom: 22,
  },
  toneButton: {
    padding: 13,
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(106, 88, 166, 0.18)',
    backgroundColor: colors.white,
  },
  toneButtonSelected: {
    backgroundColor: colors.lavenderSoft,
    borderColor: colors.lavender,
  },
  toneLabel: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  toneDescription: {
    color: colors.navy,
    fontSize: 12,
    lineHeight: 19,
    opacity: 0.8,
    textAlign: 'right',
  },
  toneTextSelected: {
    color: colors.lavender,
  },
  draftEditor: {
    minHeight: 180,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.navy,
    fontSize: 15,
    lineHeight: 28,
  },
  disclosureBox: {
    marginTop: 15,
    padding: 16,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(106, 88, 166, 0.2)',
    backgroundColor: colors.lavenderSoft,
  },
  disclosureBadge: {
    color: colors.lavender,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: 6,
  },
  disclosureNotice: {
    color: colors.lavender,
    fontSize: 13,
    lineHeight: 23,
    textAlign: 'right',
  },
  trustControlsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
    marginBottom: 14,
  },
  trustToggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  trustToggleBtnActive: {
    backgroundColor: colors.greenSoft,
    borderColor: colors.green,
  },
  trustToggleText: {
    color: colors.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  trustToggleTextActive: {
    color: colors.green,
  },
  trustModule: {
    marginBottom: 14,
  },

  // ---------- Buttons ----------
  primaryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.36,
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(62, 43, 5, 0.18)',
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.brown,
    fontSize: 15,
    fontWeight: '800',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },

  // ---------- Ready ----------
  readyScreen: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  readyLogo: {
    width: 150,
    height: 46,
    marginBottom: 16,
  },
  readyIcon: {
    width: 72,
    height: 72,
    marginBottom: 19,
    borderRadius: 26,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.18,
    shadowRadius: 15,
    elevation: 4,
  },
  readyIconText: {
    color: colors.white,
    fontSize: 34,
  },
  readyBrand: {
    color: colors.navy,
    fontSize: 15,
    fontWeight: '800',
  },
  readyTitle: {
    marginVertical: 12,
    color: colors.navy,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
  },
  readyText: {
    marginBottom: 18,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 26,
    textAlign: 'center',
  },
});
