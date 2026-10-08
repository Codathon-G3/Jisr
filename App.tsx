import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Per-weight imports, so only the four weights in use are bundled into the app.
import { ReadexPro_500Medium } from '@expo-google-fonts/readex-pro/500Medium';
import { ReadexPro_600SemiBold } from '@expo-google-fonts/readex-pro/600SemiBold';
import { IBMPlexSansArabic_400Regular } from '@expo-google-fonts/ibm-plex-sans-arabic/400Regular';
import { IBMPlexSansArabic_500Medium } from '@expo-google-fonts/ibm-plex-sans-arabic/500Medium';

import {
  Chip,
  Draft,
  DraftSource,
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
import {
  recordChipSelections,
  getHistorySummary,
  clearHistory,
  checkChipRecurrence,
  isHistoryEnabled,
  setHistoryEnabled,
  getRetentionDays,
  setRetentionDays,
} from './src/services/storage';
import { DEFAULT_RETENTION_DAYS, RetentionDays } from './src/services/historyLogic';

import {
  BaselineComparison,
  FaithfulnessView,
  OutboundPreview,
  SupportCardModal,
  TriggerModal,
} from './src/components';
import { CaptureScreen } from './src/screens/CaptureScreen';
import { JisrIcon, JisrIconName } from './src/components/JisrIcon';
import { radius, shadow, space, type } from './src/theme/tokens';
import { button, c, rowRtl } from './src/theme/ui';

import ar from './src/i18n/ar.json';
import plainTemplatesData from './safety/plain-templates.json';
import statedLimits from './safety/stated-limits.json';

const TONE_KEYS: Tone[] = ['gentle', 'direct', 'formal'];

// Icon per recipient, from the mapping table in jisr-brand/BRAND.md.
const RECIPIENT_ICONS: Record<Recipient, JisrIconName> = {
  friend: 'person',
  sibling: 'relationships',
  parent: 'family',
  trusted_adult: 'person',
  counsellor: 'exams',
};

// The on-device crisis check waits for a short pause in typing, so the support
// card does not open in the middle of a phrase such as "نبي نموت من الضحك".
const CRISIS_DEBOUNCE_MS = 700;
const FAITHFULNESS_DEBOUNCE_MS = 800;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// Rayan's intro artwork (shared with the Next.js web showcase)
const INTRO_IMAGE = require('./public/brand/jisr-intro-mobile.png');
const INTRO_IMAGE_SIZE = { width: 941, height: 1672, cornerRadius: 20 };
const INTRO_AUTO_ENTER_MS = 4200;
const INTRO_FADE_MS = 650;

type Screen = 'intro' | 'capture' | 'drafting' | 'encouraged_out';

export default function App() {
  // Design-system fonts (names match fonts in src/theme/tokens.ts)
  const [fontsLoaded, fontError] = useFonts({
    ReadexPro_500Medium,
    ReadexPro_600SemiBold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
  });

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
  // Whether the drafts came from the AI or from the plain templates (R18)
  const [draftSource, setDraftSource] = useState<DraftSource>('ai');
  const [continuedAfterSupport, setContinuedAfterSupport] = useState(false);
  // The text the user chose to continue with after the support card (R10)
  const [acknowledgedText, setAcknowledgedText] = useState<string | null>(null);

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

  // Private on-device record (R5): off until the user turns it on
  const [historyOn, setHistoryOn] = useState(false);
  const [retentionDays, setRetention] = useState<RetentionDays>(DEFAULT_RETENTION_DAYS);
  const [historySummary, setHistorySummary] = useState<Partial<Record<Chip, number>>>({});

  const refreshHistory = useCallback(async () => {
    setHistorySummary(await getHistorySummary());
  }, []);

  useEffect(() => {
    isHistoryEnabled().then(setHistoryOn);
    getRetentionDays().then(setRetention);
    refreshHistory();
  }, [refreshHistory]);

  // Update live draft editor when switching tones or when drafts load
  useEffect(() => {
    if (drafts[currentTone]) {
      setEditedDraft(drafts[currentTone]);
    }
  }, [currentTone, drafts]);

  // Faithfulness alignments: only while the view is open, only for AI drafts, and
  // only after a pause in editing, so typing does not fire one model call per key.
  const debouncedDraft = useDebouncedValue(editedDraft, FAITHFULNESS_DEBOUNCE_MS);
  useEffect(() => {
    if (activeScreen !== 'drafting' || !showFaithfulness || draftSource !== 'ai' || !debouncedDraft) {
      return;
    }
    let cancelled = false;
    const source = inputText || (selectedChips[0] ? ar.chips[selectedChips[0]] : '');
    checkFaithfulness(source, debouncedDraft).then((res) => {
      if (!cancelled) setAlignments(res.alignments || []);
    });
    return () => {
      cancelled = true;
    };
  }, [activeScreen, showFaithfulness, draftSource, debouncedDraft, inputText, selectedChips]);

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

  // The capture box and the editable draft are screened on-device against
  // safety/crisis-phrases.json after a short pause in typing. Drafting itself is
  // also gated on the server (/api/generate-drafts) with the model layer.
  const debouncedInput = useDebouncedValue(inputText, CRISIS_DEBOUNCE_MS);
  const debouncedDraftForRisk = useDebouncedValue(editedDraft, CRISIS_DEBOUNCE_MS);
  const inputRisk = useMemo(() => checkLocalCrisis(debouncedInput), [debouncedInput]);
  const draftRisk = useMemo(
    () => (activeScreen === 'drafting' ? checkLocalCrisis(debouncedDraftForRisk) : null),
    [activeScreen, debouncedDraftForRisk]
  );
  const crisisDetected = inputRisk.riskDetected || Boolean(draftRisk?.riskDetected);
  // The user already saw the card for this exact text and chose to continue (R10).
  const crisisAcknowledged = acknowledgedText !== null && acknowledgedText === inputText;

  // A new match opens the support card, unless the user already chose to continue.
  useEffect(() => {
    if (!crisisDetected || crisisAcknowledged) return;
    setShowTriggerModal(false);
    setIsCrisisModal(true);
    setShowSupportModal(true);
  }, [crisisDetected, crisisAcknowledged]);

  const openSupport = () => {
    setIsCrisisModal(crisisDetected && !crisisAcknowledged);
    setShowSupportModal(true);
  };

  const showCrisisCard = () => {
    setShowTriggerModal(false);
    setIsCrisisModal(true);
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
  // picked 3+ times inside the retention window gets the pattern prompt instead.
  const handleContinue = async () => {
    if (selectedChips.length === 0) return;

    // Guardian: a crisis phrase shows the support card instead of drafting. If the
    // user already chose to continue, they get plain templates (R10).
    if (checkLocalCrisis(inputText).riskDetected || crisisAcknowledged) {
      if (crisisAcknowledged) {
        continueWithTemplates();
      } else {
        showCrisisCard();
      }
      return;
    }

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

  const showDrafts = (draftList: Draft[], source: DraftSource) => {
    const pick = (tone: Tone) => draftList.find((d) => d.tone === tone)?.text || '';
    const next: Record<Tone, string> = {
      gentle: pick('gentle'),
      direct: pick('direct'),
      formal: pick('formal'),
    };
    setDrafts(next);
    setDraftSource(source);
    setAlignments([]);
    setCurrentTone('gentle');
    setEditedDraft(next.gentle);
    setActiveScreen('drafting');
  };

  // After the support card, the user may still write to a trusted person (R10).
  // Plain templates only: the flagged text is never sent to the drafting model.
  const continueWithTemplates = () => {
    const chips: Chip[] = selectedChips.length > 0 ? selectedChips : ['other'];
    const fallback = getOfflineDrafts(chips, selectedRecipient);
    setSanitizedData({ sanitisedText: '', identifiersRemoved: [] });
    setContinuedAfterSupport(true);
    showDrafts(fallback.drafts, 'template');
  };

  // Main submission handler. /api/generate-drafts runs the Guardian risk check
  // (phrase list + model) on the server before any drafting.
  const handleStartDrafting = async () => {
    if (selectedChips.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار موضوع واحد على الأقل للمتابعة.');
      return;
    }
    if (checkLocalCrisis(inputText).riskDetected && !crisisAcknowledged) {
      showCrisisCard();
      return;
    }

    setShowTriggerModal(false);
    setIsLoading(true);
    setContinuedAfterSupport(false);

    try {
      // Private on-device record: chips only, and only if the user turned it on
      await recordChipSelections(selectedChips);
      refreshHistory();

      // Guardian, model layer: risk check before any drafting (identifier-free text).
      // /api/generate-drafts checks again on the server.
      if (inputText.trim()) {
        const risk = await checkRisk(inputText, selectedChips);
        if (risk.riskDetected) {
          showCrisisCard();
          return;
        }
      }

      // Identifiers are removed inside generateDrafts before anything is sent
      const response = await generateDrafts({
        text: inputText,
        chips: selectedChips,
        recipient: selectedRecipient,
        language: 'ar',
      });

      if (response.riskDetected) {
        showCrisisCard();
        return;
      }

      setSanitizedData({
        sanitisedText: response.sanitisedText,
        identifiersRemoved: response.identifiersRemoved,
      });
      showDrafts(response.drafts, response.usedFallbackTemplate ? 'template' : 'ai');
    } catch (error) {
      console.warn('Drafting error, falling back to offline templates:', error);
      const fallback = getOfflineDrafts(selectedChips, selectedRecipient, inputText);
      setSanitizedData({
        sanitisedText: fallback.sanitisedText,
        identifiersRemoved: fallback.identifiersRemoved,
      });
      showDrafts(fallback.drafts, 'template');
    } finally {
      setIsLoading(false);
    }
  };

  // Share via OS native share sheet (WhatsApp, Messenger, SMS handoff) with 0 telemetry.
  // Never blocked by the crisis check: sending a message to a person is the human route.
  const handleShare = async () => {
    if (!editedDraft) return;

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

  // Private on-device record controls (R5)
  const handleToggleHistory = async (enabled: boolean) => {
    await setHistoryEnabled(enabled); // turning it off also erases it
    setHistoryOn(enabled);
    refreshHistory();
  };

  const handleSelectRetention = async (days: RetentionDays) => {
    await setRetentionDays(days);
    setRetention(days);
    refreshHistory();
  };

  const handleClearHistory = async () => {
    await clearHistory();
    refreshHistory();
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
    setAcknowledgedText(null);
    setContinuedAfterSupport(false);
    setShowBaseline(false);
    setShowFaithfulness(false);
    setShowOutbound(false);
    setActiveScreen('capture');
  };

  const closeSupport = () => {
    setShowSupportModal(false);
    setIsCrisisModal(false);
  };

  // R10: after the card the user may still write their note to someone they trust.
  const handleContinueAfterSupport = () => {
    setAcknowledgedText(inputText);
    closeSupport();
    // On the drafting screen keep the user's own edits; otherwise start from templates.
    if (activeScreen !== 'drafting') {
      continueWithTemplates();
    }
  };

  const supportModal = (
    <SupportCardModal
      visible={showSupportModal}
      isCrisis={isCrisisModal}
      onClose={closeSupport}
      onContinue={isCrisisModal ? handleContinueAfterSupport : undefined}
    />
  );

  // The bundled fonts load in a moment; render once they are ready (or failed).
  if (!fontsLoaded && !fontError) {
    return <View style={styles.introRoot} />;
  }

  // ================= INTRO / SPLASH =================
  if (activeScreen === 'intro') {
    return (
      <SafeAreaProvider>
      <SafeAreaView style={styles.introRoot}>
        <StatusBar style="dark" />

        {/* Measured inside the safe area; the artwork is sized to fit it */}
        <View style={styles.introFill} onLayout={handleIntroLayout}>
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
              style={[button.base, styles.humanRouteButton]}
              onPress={openSupport}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={ar.triggers.persistent_human_route}
            >
              <JisrIcon name="talk" size={20} color={c.urgent} />
              <Text style={[button.label, styles.humanRouteText]}>
                {ar.triggers.persistent_human_route}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[button.base, button.primary, styles.introStartButton]}
              onPress={enterApp}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="ابدأ"
            >
              <Text style={[button.label, button.labelPrimary]}>ابدأ</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        </View>

        {supportModal}
      </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* ================= PERSISTENT HUMAN ROUTE ("تكلم مع حد توا") ================= */}
      <View style={styles.topBar}>
        <View style={styles.topBarSpacer} />
        <TouchableOpacity
          style={[button.base, styles.humanRouteButton]}
          onPress={openSupport}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={ar.triggers.persistent_human_route}
        >
          <JisrIcon name="talk" size={20} color={c.urgent} />
          <Text style={[button.label, styles.humanRouteText]}>
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
                historyEnabled={historyOn}
                onToggleHistory={handleToggleHistory}
                retentionDays={retentionDays}
                onSelectRetention={handleSelectRetention}
                historySummary={historySummary}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeScreen === 'drafting' && (
              /* ================= SCREEN 2: 3-TONE DRAFTING & TRUST ================= */
              <View>
                <View style={styles.draftHeader}>
                  <View style={styles.draftHeaderText}>
                    <Text style={styles.draftTitle}>اختر الصياغة اللي تريحك</Text>
                  </View>
                  <TouchableOpacity
                    style={[button.base, button.plain, styles.backButton]}
                    onPress={() => setActiveScreen('capture')}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="رجوع لتعديل الاختيارات"
                  >
                    <JisrIcon name="back" size={22} color={c.ink} />
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

                {/* Note card: the recipient strip, the editable draft, and who wrote it */}
                <View style={styles.noteCard}>
                  <View style={styles.noteTo}>
                    <JisrIcon name={RECIPIENT_ICONS[selectedRecipient]} size={18} color={c.wood} />
                    <Text style={styles.noteToText}>{ar.recipients[selectedRecipient]}</Text>
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
                    placeholderTextColor={c.inkMuted}
                    accessibilityLabel="نص الرسالة القابل للتعديل"
                  />

                  {/* Lavender only when the AI wrote it */}
                  <View
                    style={[
                      styles.noteChip,
                      draftSource === 'ai' ? styles.noteChipAi : styles.noteChipTemplate,
                    ]}
                  >
                    {draftSource === 'ai' && (
                      <JisrIcon name="suggestion" size={18} color={c.lavender} />
                    )}
                    <Text
                      style={[
                        styles.noteChipText,
                        draftSource === 'ai'
                          ? styles.noteChipTextAi
                          : styles.noteChipTextTemplate,
                      ]}
                    >
                      {draftSource === 'ai' ? ar.disclosure.badge : ar.disclosure.template_badge}
                    </Text>
                  </View>
                </View>

                {/* AI Disclosure (R18): says plainly when the text is only a template */}
                <View
                  style={[
                    styles.disclosureBox,
                    draftSource === 'ai' ? styles.disclosureBoxAi : styles.disclosureBoxTemplate,
                  ]}
                >
                  <Text
                    style={[
                      styles.disclosureBadge,
                      draftSource === 'ai' ? styles.disclosureTextAi : styles.disclosureTextTemplate,
                    ]}
                  >
                    {draftSource === 'ai' ? ar.disclosure.badge : ar.disclosure.template_badge}
                  </Text>
                  <Text
                    style={[
                      styles.disclosureNotice,
                      draftSource === 'ai' ? styles.disclosureTextAi : styles.disclosureTextTemplate,
                    ]}
                  >
                    {draftSource === 'ai'
                      ? ar.disclosure.notice
                      : continuedAfterSupport
                        ? ar.disclosure.after_support_notice
                        : ar.disclosure.template_notice}
                  </Text>
                  {/* Stated limits (R23) */}
                  <Text
                    style={[
                      styles.disclosureNotice,
                      draftSource === 'ai' ? styles.disclosureTextAi : styles.disclosureTextTemplate,
                    ]}
                  >
                    {statedLimits.ar_short}
                  </Text>
                </View>

                {/* Trust & Control Toggles */}
                <View style={styles.trustControlsRow}>
                  <TouchableOpacity
                    style={[styles.trustToggleBtn, showBaseline && styles.trustToggleBtnActive]}
                    onPress={() => setShowBaseline(!showBaseline)}
                    activeOpacity={0.8}
                    accessibilityState={{ expanded: showBaseline }}
                  >
                    <JisrIcon name="suggestion" size={16} color={c.lavender} />
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
                    <JisrIcon
                      name="check"
                      size={16}
                      color={showFaithfulness ? c.green : c.ink}
                    />
                    <Text
                      style={[
                        styles.trustToggleText,
                        showFaithfulness && styles.trustToggleTextActive,
                      ]}
                    >
                      {showFaithfulness ? 'إخفاء المصدر' : 'فحص المصدر'}
                    </Text>
                  </TouchableOpacity>

                  {/* Nothing left the device after the support card, so no outbound view */}
                  {!continuedAfterSupport && (
                    <TouchableOpacity
                      style={[styles.trustToggleBtn, showOutbound && styles.trustToggleBtnActive]}
                      onPress={() => setShowOutbound(!showOutbound)}
                      activeOpacity={0.8}
                      accessibilityState={{ expanded: showOutbound }}
                    >
                      <JisrIcon
                        name="preview"
                        size={16}
                        color={showOutbound ? c.green : c.ink}
                      />
                      <Text
                        style={[styles.trustToggleText, showOutbound && styles.trustToggleTextActive]}
                      >
                        {showOutbound ? 'إخفاء الخصوصية' : 'فحص الخصوصية'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* TRUST VIEW 1: Baseline Comparison */}
                {showBaseline && (
                  <BaselineComparison
                    aiDraft={drafts[currentTone]}
                    baselineTemplate={activeBaselineTemplate}
                    recipientLabel={ar.recipients[selectedRecipient]}
                    aiAvailable={draftSource === 'ai'}
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
                {showOutbound && !continuedAfterSupport && (
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
                    button.base,
                    button.primary,
                    styles.shareButton,
                    !editedDraft && button.disabled,
                  ]}
                  onPress={handleShare}
                  disabled={!editedDraft}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={ar.buttons.share}
                >
                  <JisrIcon name="share" size={20} color={c.onGreen} />
                  <Text style={[button.label, button.labelPrimary]}>{ar.buttons.share}</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeScreen === 'encouraged_out' && (
              /* ================= SCREEN 3: HANDOFF / READY ================= */
              <View style={styles.readyScreen}>
                <View style={styles.readyIcon}>
                  <JisrIcon name="check" size={36} color={c.green} />
                </View>
                <Text style={styles.readyBrand}>{ar.app_name}</Text>
                <Text style={styles.readyTitle}>{ar.handoff.ready_message}</Text>
                <Text style={styles.readyText}>
                  تذكر ديماً: مجرد كسر حاجز الصمت والحديث مع شخص تثق فيه هو البداية الحقيقية للشعور بالراحة.
                </Text>

                <TouchableOpacity
                  style={[button.base, button.primary, styles.fullWidth]}
                  onPress={handleStartNew}
                  activeOpacity={0.85}
                >
                  <JisrIcon name="edit" size={20} color={c.onGreen} />
                  <Text style={[button.label, button.labelPrimary]}>كتابة رسالة جديدة</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[button.base, button.plain, styles.fullWidth]}
                  onPress={() => setActiveScreen('drafting')}
                  activeOpacity={0.8}
                >
                  <JisrIcon name="back" size={20} color={c.ink} />
                  <Text style={[button.label, button.labelPlain]}>رجوع</Text>
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // ---------- Intro ----------
  introRoot: {
    flex: 1,
    backgroundColor: c.surface,
  },
  introFill: {
    flex: 1,
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
    bottom: space[6],
    alignItems: 'center',
    gap: space[3],
  },
  introStartButton: {
    minWidth: 148,
  },

  // ---------- Shell ----------
  safeArea: {
    flex: 1,
    backgroundColor: c.surface,
  },
  topBar: {
    flexDirection: rowRtl,
    alignItems: 'center',
    paddingHorizontal: space[4],
    paddingTop: space[2],
    paddingBottom: space[2],
  },
  topBarSpacer: {
    flex: 1,
  },
  // "Talk to someone now": urgent, always with words and an icon
  humanRouteButton: {
    backgroundColor: c.urgentSoft,
    borderColor: c.urgentSoft,
  },
  humanRouteText: {
    color: c.urgent,
  },
  contentFade: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: space[4],
    paddingBottom: space[6],
  },
  appCard: {
    width: '100%',
    paddingHorizontal: space[4],
    paddingVertical: space[6],
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.lg,
    ...shadow.sm,
  },

  // ---------- Drafting ----------
  draftHeader: {
    flexDirection: rowRtl,
    alignItems: 'flex-start',
    gap: space[3],
    marginBottom: space[2],
  },
  draftHeaderText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  draftTitle: {
    ...type.title,
    color: c.ink,
    textAlign: 'right',
  },
  backButton: {
    paddingHorizontal: space[3],
  },
  hint: {
    ...type.bodySm,
    marginBottom: space[4],
    color: c.inkMuted,
    textAlign: 'right',
  },
  toneButtons: {
    gap: space[2],
    marginBottom: space[6],
  },
  toneButton: {
    padding: space[3],
    gap: space[1],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
  },
  toneButtonSelected: {
    backgroundColor: c.greenSoft,
    borderColor: c.green,
  },
  toneLabel: {
    ...type.label,
    color: c.ink,
    textAlign: 'right',
  },
  toneDescription: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'right',
  },
  toneTextSelected: {
    color: c.green,
  },
  // NoteCard (docs/design-system/components/NoteCard.md)
  noteCard: {
    backgroundColor: c.surfaceRaised,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.sm,
  },
  noteTo: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[2],
    backgroundColor: c.woodSoft,
    paddingVertical: space[3],
    paddingHorizontal: space[6],
  },
  noteToText: {
    ...type.label,
    color: c.wood,
  },
  draftEditor: {
    ...type.body,
    minHeight: 180,
    paddingTop: space[4],
    paddingHorizontal: space[6],
    paddingBottom: space[3],
    color: c.ink,
  },
  noteChip: {
    flexDirection: rowRtl,
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: space[2],
    marginHorizontal: space[6],
    marginBottom: space[6],
    paddingVertical: space[2],
    paddingHorizontal: space[4],
    borderRadius: radius.full,
  },
  noteChipAi: {
    backgroundColor: c.lavenderSoft,
  },
  noteChipTemplate: {
    backgroundColor: c.surfaceSunken,
  },
  noteChipText: {
    ...type.label,
  },
  noteChipTextAi: {
    color: c.lavender,
  },
  noteChipTextTemplate: {
    color: c.inkMuted,
  },
  disclosureBox: {
    marginTop: space[4],
    padding: space[4],
    gap: space[1],
    borderRadius: radius.md,
  },
  disclosureBoxAi: {
    backgroundColor: c.lavenderSoft,
  },
  disclosureBoxTemplate: {
    backgroundColor: c.surfaceSunken,
  },
  disclosureBadge: {
    ...type.label,
    textAlign: 'right',
  },
  disclosureNotice: {
    ...type.bodySm,
    textAlign: 'right',
  },
  disclosureTextAi: {
    color: c.lavender,
  },
  disclosureTextTemplate: {
    color: c.ink,
  },
  trustControlsRow: {
    flexDirection: rowRtl,
    flexWrap: 'wrap',
    gap: space[2],
    marginTop: space[4],
    marginBottom: space[3],
  },
  trustToggleBtn: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[1],
    minHeight: 40,
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
  },
  trustToggleBtnActive: {
    backgroundColor: c.greenSoft,
    borderColor: c.green,
  },
  trustToggleText: {
    ...type.caption,
    color: c.ink,
  },
  trustToggleTextActive: {
    color: c.green,
  },
  trustModule: {
    marginBottom: space[3],
  },
  shareButton: {
    marginTop: space[2],
    alignSelf: 'stretch',
  },

  // ---------- Ready ----------
  readyScreen: {
    alignItems: 'center',
    paddingVertical: space[8],
    gap: space[3],
  },
  readyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyBrand: {
    ...type.label,
    color: c.ink,
  },
  readyTitle: {
    ...type.title,
    color: c.ink,
    textAlign: 'center',
  },
  readyText: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
