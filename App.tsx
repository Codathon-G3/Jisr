import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
  Alert,
  I18nManager,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  Chip,
  Recipient,
  Tone,
  Draft,
  IdentifierRemoved,
  Alignment,
} from './src/types';
import {
  checkRisk,
  generateDrafts,
  checkFaithfulness,
  getOfflineDrafts,
} from './src/services/api';
import { sanitizePii } from './src/services/piiSanitizer';
import {
  recordChipSelection,
  getHistory,
  clearHistory,
  isHistoryEnabled,
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

import ar from './src/i18n/ar.json';
import plainTemplatesData from './safety/plain-templates.json';

const TONE_KEYS: Tone[] = ['gentle', 'direct', 'formal'];

export default function App() {
  // Capture inputs
  const [selectedChips, setSelectedChips] = useState<Chip[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>('friend');
  const [inputText, setInputText] = useState('');

  // Screen state
  const [activeScreen, setActiveScreen] = useState<'capture' | 'drafting' | 'encouraged_out'>('capture');
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isCrisisModal, setIsCrisisModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggerChipLabel, setTriggerChipLabel] = useState('');
  const [triggerIsRecurrence, setTriggerIsRecurrence] = useState(false);

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

  // Handle toggling of stress chips on CaptureScreen
  const handleToggleChip = async (chipId: Chip) => {
    const isSelected = selectedChips.includes(chipId);
    let updated: Chip[];

    if (isSelected) {
      updated = selectedChips.filter((id) => id !== chipId);
      setSelectedChips(updated);
    } else {
      updated = [...selectedChips, chipId];
      setSelectedChips(updated);

      // Check if this chip meets the pattern recurrence trigger (>= 3 times)
      const isRecurring = await checkChipRecurrence(chipId);
      const label = ar.chips[chipId];

      if (isRecurring) {
        setTriggerChipLabel(label);
        setTriggerIsRecurrence(true);
        setShowTriggerModal(true);
      } else if (updated.length === 1) {
        // Same-session gentle prompt on first chip selection
        setTriggerChipLabel(label);
        setTriggerIsRecurrence(false);
        setShowTriggerModal(true);
      }
    }
  };

  // Main submission handler: triggers Guardian risk screening and drafting engine
  const handleStartDrafting = async () => {
    if (selectedChips.length === 0) {
      Alert.alert('تنبيه', 'يرجى اختيار موضوع واحد على الأقل للمتابعة.');
      return;
    }

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

      const newDrafts: Record<Tone, string> = { gentle, direct, formal };
      setDrafts(newDrafts);
      setEditedDraft(newDrafts[currentTone] || gentle);

      // Transition to drafting screen
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
      setEditedDraft(fallbackDrafts[currentTone]);
      setActiveScreen('drafting');
    } finally {
      setIsLoading(false);
    }
  };

  // Share via OS native share sheet (WhatsApp, Messenger, SMS handoff) with 0 telemetry
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
    setShowBaseline(false);
    setShowFaithfulness(false);
    setShowOutbound(false);
    setActiveScreen('capture');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* ================= PERSISTENT TOP HEADER ================= */}
      <View style={styles.header}>
        {/* Brand Logo & Tagline */}
        <View style={styles.headerBrand}>
          <Text style={styles.headerTitle}>{ar.app_name}</Text>
          <Text style={styles.headerTagline}>{ar.tagline}</Text>
        </View>

        {/* PERSISTENT HUMAN ROUTE BUTTON ("تكلم مع حد توا") */}
        <TouchableOpacity
          style={styles.persistentSupportButton}
          onPress={() => {
            setIsCrisisModal(false);
            setShowSupportModal(true);
          }}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={ar.triggers.persistent_human_route}
        >
          <Text style={styles.persistentSupportIcon}>🕊️</Text>
          <Text style={styles.persistentSupportText}>
            {ar.triggers.persistent_human_route}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeScreen === 'capture' && (
          /* ================= SCREEN 1: CAPTURE ================= */
          <CaptureScreen
            selectedChips={selectedChips}
            onToggleChip={handleToggleChip}
            selectedRecipient={selectedRecipient}
            onSelectRecipient={setSelectedRecipient}
            inputText={inputText}
            onChangeInputText={setInputText}
            onSubmit={handleStartDrafting}
            isLoading={isLoading}
            historyCount={historyCount}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeScreen === 'drafting' && (
          /* ================= SCREEN 2: 3-TONE DRAFTING & TRUST ================= */
          <View style={styles.draftingContainer}>
            {/* AI Disclosure Badge */}
            <View style={styles.disclosureCard}>
              <View style={styles.disclosureHeader}>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>{ar.disclosure.badge}</Text>
                </View>
                <Text style={styles.disclosureTitle}>مساعدتك في الصياغة</Text>
              </View>
              <Text style={styles.disclosureNotice}>{ar.disclosure.notice}</Text>
            </View>

            {/* 3 Tone Selector Tabs */}
            <View style={styles.toneTabsRow}>
              {TONE_KEYS.map((toneKey) => {
                const isActive = currentTone === toneKey;
                return (
                  <TouchableOpacity
                    key={toneKey}
                    style={[styles.toneTab, isActive && styles.toneTabActive]}
                    onPress={() => setCurrentTone(toneKey)}
                    activeOpacity={0.8}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={ar.tones[toneKey].label}
                  >
                    <Text
                      style={[
                        styles.toneTabText,
                        isActive && styles.toneTabTextActive,
                      ]}
                    >
                      {ar.tones[toneKey].label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* In-Place Editable Draft Card */}
            <View style={styles.draftEditorCard}>
              <View style={styles.editorHeader}>
                <Text style={styles.editorHint}>
                  تقدر تعدل أي كلمة مباشرة في الصندوق تحت:
                </Text>
                <Text style={styles.toneDescription}>
                  {ar.tones[currentTone].description}
                </Text>
              </View>

              <TextInput
                style={styles.draftEditorInput}
                multiline
                value={editedDraft}
                onChangeText={setEditedDraft}
                textAlign="right"
                textAlignVertical="top"
                placeholder="اكتب رسالتك هنا..."
                placeholderTextColor="#94A3B8"
                accessibilityLabel="نص الرسالة القابل للتعديل"
              />
            </View>

            {/* Trust & Control Toggles Row */}
            <View style={styles.trustControlsRow}>
              <TouchableOpacity
                style={[
                  styles.trustToggleBtn,
                  showBaseline && styles.trustToggleBtnActive,
                ]}
                onPress={() => setShowBaseline(!showBaseline)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.trustToggleText,
                    showBaseline && styles.trustToggleTextActive,
                  ]}
                >
                  ⚖️ {showBaseline ? 'إخفاء المقارنة' : 'مقارنة مع القالب'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.trustToggleBtn,
                  showFaithfulness && styles.trustToggleBtnActive,
                ]}
                onPress={() => setShowFaithfulness(!showFaithfulness)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.trustToggleText,
                    showFaithfulness && styles.trustToggleTextActive,
                  ]}
                >
                  🔍 {showFaithfulness ? 'إخفاء المصدر' : 'فحص المصدر'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.trustToggleBtn,
                  showOutbound && styles.trustToggleBtnActive,
                ]}
                onPress={() => setShowOutbound(!showOutbound)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.trustToggleText,
                    showOutbound && styles.trustToggleTextActive,
                  ]}
                >
                  🔒 {showOutbound ? 'إخفاء الخصوصية' : 'فحص الخصوصية'}
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

            {/* Action 1: Native Share Sheet */}
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.share}
            >
              <Text style={styles.shareButtonText}>
                📤 {ar.buttons.share}
              </Text>
            </TouchableOpacity>

            {/* Action 2: Back to Edit Selections */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setActiveScreen('capture')}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>
                ← رجوع لتعديل الاختيارات
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeScreen === 'encouraged_out' && (
          /* ================= SCREEN 3: ENCOURAGED-OUT COMPLETION ================= */
          <View style={styles.encouragedContainer}>
            <View style={styles.encouragedCard}>
              <Text style={styles.encouragedIcon}>🎉</Text>
              <Text style={styles.encouragedTitle}>خطوة ممتازة وشجاعة!</Text>
              <Text style={styles.encouragedMessage}>
                {ar.handoff.ready_message}
              </Text>
              <Text style={styles.encouragedSubmessage}>
                تذكر ديماً: مجرد كسر حاجز الصمت والحديث مع شخص تثق فيه هو البداية الحقيقية للشعور بالراحة.
              </Text>

              <TouchableOpacity
                style={styles.startNewButton}
                onPress={handleStartNew}
                activeOpacity={0.85}
              >
                <Text style={styles.startNewButtonText}>
                  كتابة رسالة جديدة ✨
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= STATIC UNALTERABLE SUPPORT CARD MODAL ================= */}
      <SupportCardModal
        visible={showSupportModal}
        isCrisis={isCrisisModal}
        onClose={() => {
          setShowSupportModal(false);
          setIsCrisisModal(false);
        }}
      />

      {/* ================= WRITING TRIGGER MODAL ================= */}
      <TriggerModal
        visible={showTriggerModal}
        chipLabel={triggerChipLabel}
        isRecurrence={triggerIsRecurrence}
        onConfirm={() => {
          setShowTriggerModal(false);
          handleStartDrafting();
        }}
        onDismiss={() => setShowTriggerModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerBrand: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  headerTagline: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  persistentSupportButton: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  persistentSupportIcon: {
    fontSize: 14,
  },
  persistentSupportText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 36,
  },
  draftingContainer: {
    width: '100%',
  },
  disclosureCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderRightWidth: 4,
    borderRightColor: '#38BDF8',
    borderWidth: 1,
    borderColor: '#334155',
  },
  disclosureHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  aiBadge: {
    backgroundColor: '#0369A1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  disclosureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  disclosureNotice: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'right',
    lineHeight: 18,
  },
  toneTabsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    gap: 8,
    marginBottom: 14,
  },
  toneTab: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  toneTabActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  toneTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  toneTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  draftEditorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  editorHeader: {
    marginBottom: 10,
  },
  editorHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'right',
    marginBottom: 2,
  },
  toneDescription: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  draftEditorInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 130,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  trustControlsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  trustToggleBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#475569',
  },
  trustToggleBtnActive: {
    backgroundColor: '#0F766E',
    borderColor: '#2DD4BF',
  },
  trustToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  trustToggleTextActive: {
    color: '#FFFFFF',
  },
  trustModule: {
    marginBottom: 14,
  },
  shareButton: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  encouragedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  encouragedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  encouragedIcon: {
    fontSize: 48,
    marginBottom: 14,
  },
  encouragedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  encouragedMessage: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 12,
  },
  encouragedSubmessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  startNewButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  startNewButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
