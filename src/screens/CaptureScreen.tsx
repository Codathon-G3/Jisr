import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { Chip, Recipient } from '../types';
import ar from '../i18n/ar.json';

export interface CaptureScreenProps {
  selectedChips: Chip[];
  onToggleChip: (chip: Chip) => void;
  selectedRecipient: Recipient;
  onSelectRecipient: (recipient: Recipient) => void;
  inputText: string;
  onChangeInputText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  historyCount: number;
  onClearHistory: () => void;
}

const CHIP_LIST: { id: Chip; label: string; icon: string }[] = [
  { id: 'exams', label: ar.chips.exams, icon: '📚' },
  { id: 'family', label: ar.chips.family, icon: '🏡' },
  { id: 'work', label: ar.chips.work, icon: '💼' },
  { id: 'relationships', label: ar.chips.relationships, icon: '🤝' },
  { id: 'sleep', label: ar.chips.sleep, icon: '🌙' },
  { id: 'money', label: ar.chips.money, icon: '💳' },
  { id: 'other', label: ar.chips.other, icon: '💬' },
];

const RECIPIENT_LIST: { id: Recipient; label: string; icon: string }[] = [
  { id: 'friend', label: ar.recipients.friend, icon: '🧑‍🤝‍🧑' },
  { id: 'sibling', label: ar.recipients.sibling, icon: '👫' },
  { id: 'parent', label: ar.recipients.parent, icon: '👨‍👩‍👧' },
  { id: 'trusted_adult', label: ar.recipients.trusted_adult, icon: '🧑‍🦳' },
  { id: 'counsellor', label: ar.recipients.counsellor, icon: '🎓' },
];

/**
 * CaptureScreen (Screen 1: Stress & Context Capture)
 *
 * RTL Native Screen presenting:
 * 1. 7 everyday stress chips in RTL flexbox with multi-select support.
 * 2. 5 recipient selectors tailored to Libyan youth social dynamics.
 * 3. 1-3 line optional TextInput for brief personalized thoughts.
 * 4. Sandboxed on-device history indicator with one-tap erase.
 * 5. Stated limits notice explaining Jisr is a writing companion, not a doctor.
 */
export const CaptureScreen: React.FC<CaptureScreenProps> = ({
  selectedChips,
  onToggleChip,
  selectedRecipient,
  onSelectRecipient,
  inputText,
  onChangeInputText,
  onSubmit,
  isLoading = false,
  historyCount,
  onClearHistory,
}) => {
  const isSubmitDisabled = selectedChips.length === 0 || isLoading;

  return (
    <View style={styles.container}>
      {/* SECTION 1: Stress Chips */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>شن أكثر حاجة شاغلة بالك هالفترة؟</Text>
          <Text style={styles.sectionSubtitle}>
            تقدر تختار أكثر من موضوع بنقرة واحدة
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {CHIP_LIST.map((chip) => {
            const isSelected = selectedChips.includes(chip.id);
            return (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.chipButton,
                  isSelected && styles.chipButtonSelected,
                ]}
                onPress={() => onToggleChip(chip.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={chip.label}
              >
                <Text style={styles.chipIcon}>{chip.icon}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    isSelected && styles.chipLabelSelected,
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: Recipient Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>{ar.placeholders.search_recipient}</Text>
          <Text style={styles.sectionSubtitle}>
            لمن تبي تبعث الرسالة؟ الصياغة حتتعدل حسب الشخص
          </Text>
        </View>

        <View style={styles.recipientsContainer}>
          {RECIPIENT_LIST.map((rec) => {
            const isSelected = selectedRecipient === rec.id;
            return (
              <TouchableOpacity
                key={rec.id}
                style={[
                  styles.recipientButton,
                  isSelected && styles.recipientButtonSelected,
                ]}
                onPress={() => onSelectRecipient(rec.id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={rec.label}
              >
                <Text style={styles.recipientIcon}>{rec.icon}</Text>
                <Text
                  style={[
                    styles.recipientLabel,
                    isSelected && styles.recipientLabelSelected,
                  ]}
                >
                  {rec.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 3: Optional Free-Text Input */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>لو تحب، اكتب سطر أو سطرين بكلماتك</Text>
          <Text style={styles.sectionSubtitle}>
            اختياري تماماً. تقدر تعتمد على الاختيارات فوق بس.
          </Text>
        </View>

        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={3}
          placeholder={ar.placeholders.user_input}
          placeholderTextColor="#94A3B8"
          value={inputText}
          onChangeText={onChangeInputText}
          textAlign="right"
          textAlignVertical="top"
          accessibilityLabel="النص الاختياري"
        />
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitDisabled && styles.submitButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="تجهيز الرسالة"
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>تجهيز الرسالة ✨</Text>
        )}
      </TouchableOpacity>

      {/* SECTION 4: Sandboxed History & Privacy */}
      <View style={styles.privacyCard}>
        <View style={styles.privacyHeader}>
          <Text style={styles.privacyBadge}>🔒 خصوصية كاملة</Text>
          <Text style={styles.privacyTitle}>الحفظ المحلي على جهازك</Text>
        </View>

        <Text style={styles.privacyDescription}>
          بياناتك محفوظة على جهازك فقط ({historyCount} موضوع مسجل). لا نملك خوادم تخزن أسرارك أو تتتبعك.
        </Text>

        {historyCount > 0 && (
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={onClearHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.clearHistoryText}>
              🗑️ {ar.buttons.clear_history}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stated Limits Notice */}
      <View style={styles.limitsCard}>
        <Text style={styles.limitsText}>{ar.limits.notice}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'right',
    lineHeight: 18,
  },
  chipsContainer: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  chipButtonSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  recipientsContainer: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  recipientButton: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
  },
  recipientButtonSelected: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  recipientIcon: {
    fontSize: 14,
  },
  recipientLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  recipientLabelSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 85,
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  privacyCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 14,
  },
  privacyHeader: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    textAlign: 'right',
  },
  privacyBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  privacyDescription: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
    textAlign: 'right',
    marginBottom: 6,
  },
  clearHistoryButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 4,
  },
  clearHistoryText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  limitsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  limitsText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    lineHeight: 17,
  },
});
