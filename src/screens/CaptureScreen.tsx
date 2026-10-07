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
import { colors } from '../theme';
import ar from '../i18n/ar.json';
import supportCardData from '../../safety/support-card.json';

export interface CaptureScreenProps {
  selectedChips: Chip[];
  onToggleChip: (chip: Chip) => void;
  selectedRecipient: Recipient;
  onSelectRecipient: (recipient: Recipient) => void;
  inputText: string;
  onChangeInputText: (text: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  /** True while the free text matches a crisis phrase; drafting is blocked. */
  crisisDetected?: boolean;
  onOpenSupport: () => void;
  historyCount: number;
  onClearHistory: () => void;
}

const CHIP_IDS = Object.keys(ar.chips) as Chip[];
const RECIPIENT_IDS = Object.keys(ar.recipients) as Recipient[];

/**
 * CaptureScreen (Screen 1: Stress & Context Capture)
 *
 * RTL native port of the web showcase's home form (src/app/page.js on main):
 * 1. Brand block with the Jisr mark, name and tagline.
 * 2. 7 everyday stress chips with multi-select support.
 * 3. Optional free text, screened live by the Guardian crisis check.
 * 4. 5 recipient selectors tailored to Libyan youth social dynamics.
 * 5. Sandboxed on-device history indicator with one-tap erase.
 * 6. Stated limits notice explaining Jisr is a writing companion, not a doctor.
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
  crisisDetected = false,
  onOpenSupport,
  historyCount,
  onClearHistory,
}) => {
  const isSubmitDisabled = selectedChips.length === 0 || isLoading || crisisDetected;

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.miniBridgeMark}>
          <Text style={styles.miniBridgeMarkText}>جسر</Text>
        </View>
        <Text style={styles.brandTitle}>{ar.app_name}</Text>
        <Text style={styles.brandTagline}>{ar.tagline}</Text>
      </View>

      {/* SECTION 1: Stress Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>شن أكثر حاجة شاغلة بالك هالفترة؟</Text>
        <Text style={styles.hint}>تقدر تختار أكثر من موضوع.</Text>

        <View style={styles.pillRow}>
          {CHIP_IDS.map((id) => {
            const isSelected = selectedChips.includes(id);
            return (
              <TouchableOpacity
                key={id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => onToggleChip(id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={ar.chips[id]}
              >
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                  {ar.chips[id]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: Optional Free-Text Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{ar.placeholders.user_input}</Text>

        <TextInput
          style={[styles.textInput, crisisDetected && styles.textInputAlert]}
          multiline
          numberOfLines={4}
          value={inputText}
          onChangeText={onChangeInputText}
          textAlign="right"
          textAlignVertical="top"
          accessibilityLabel={ar.placeholders.user_input}
        />

        {/* Guardian: drafting is blocked while a crisis phrase is present */}
        {crisisDetected && (
          <View style={styles.crisisBanner} accessibilityRole="alert">
            <Text style={styles.crisisBannerText}>{supportCardData.title_ar}</Text>
            <TouchableOpacity
              style={styles.crisisBannerButton}
              onPress={onOpenSupport}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.triggers.persistent_human_route}
            >
              <Text style={styles.crisisBannerButtonText}>
                {ar.triggers.persistent_human_route}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* SECTION 3: Recipient Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{ar.placeholders.search_recipient}</Text>

        <View style={styles.pillRow}>
          {RECIPIENT_IDS.map((id) => {
            const isSelected = selectedRecipient === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => onSelectRecipient(id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={ar.recipients[id]}
              >
                <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                  {ar.recipients[id]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.continueButton, isSubmitDisabled && styles.continueButtonDisabled]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={ar.buttons.start_drafting}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.continueButtonText}>{ar.buttons.start_drafting}</Text>
        )}
      </TouchableOpacity>

      {/* SECTION 4: Sandboxed History & Privacy */}
      <View style={styles.privacyCard}>
        <Text style={styles.privacyTitle}>الحفظ المحلي على جهازك</Text>
        <Text style={styles.privacyDescription}>
          بياناتك محفوظة على جهازك فقط ({historyCount} موضوع مسجل). لا نملك خوادم تخزن أسرارك أو تتتبعك.
        </Text>

        {historyCount > 0 && (
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={onClearHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.clearHistoryText}>{ar.buttons.clear_history}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stated Limits Notice */}
      <Text style={styles.limits}>{ar.limits.notice}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 31,
  },
  miniBridgeMark: {
    width: 86,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  miniBridgeMarkText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  brandTitle: {
    marginTop: 12,
    marginBottom: 7,
    color: colors.navy,
    fontSize: 39,
    fontWeight: '800',
  },
  brandTagline: {
    color: colors.green,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 27,
    textAlign: 'center',
  },
  section: {
    marginBottom: 27,
  },
  sectionTitle: {
    marginBottom: 10,
    color: colors.navy,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 29,
    textAlign: 'right',
  },
  hint: {
    marginTop: -4,
    marginBottom: 15,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
  pillRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  pillSelected: {
    backgroundColor: colors.green,
    borderColor: colors.green,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.18,
    shadowRadius: 11,
    elevation: 3,
  },
  pillLabel: {
    color: colors.navy,
    fontSize: 14,
  },
  pillLabelSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 110,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    color: colors.navy,
    fontSize: 15,
    lineHeight: 28,
  },
  textInputAlert: {
    borderColor: colors.safety,
  },
  crisisBanner: {
    marginTop: 12,
    padding: 16,
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(176, 67, 42, 0.18)',
    backgroundColor: colors.safetySoft,
  },
  crisisBannerText: {
    color: '#783323',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 26,
    textAlign: 'right',
  },
  crisisBannerButton: {
    alignSelf: 'stretch',
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.safety,
    alignItems: 'center',
  },
  crisisBannerButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  continueButton: {
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
  continueButtonDisabled: {
    opacity: 0.36,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  privacyCard: {
    marginTop: 21,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(47, 107, 79, 0.18)',
    backgroundColor: colors.greenSoft,
  },
  privacyTitle: {
    marginBottom: 6,
    color: colors.green,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'right',
  },
  privacyDescription: {
    color: colors.green,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'right',
  },
  clearHistoryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  clearHistoryText: {
    color: colors.safety,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  limits: {
    marginTop: 21,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 23,
    textAlign: 'center',
  },
});
