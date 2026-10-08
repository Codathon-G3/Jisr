import React, { useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Image,
} from 'react-native';
import { Chip, Recipient } from '../types';
import { fonts, radius, space, type } from '../theme/tokens';
import { button, c, rowRtl } from '../theme/ui';
import { JisrIcon, JisrIconName } from '../components/JisrIcon';
import ar from '../i18n/ar.json';
import supportCardData from '../../safety/support-card.json';
import statedLimits from '../../safety/stated-limits.json';
import { OutboundPreview } from '../components/OutboundPreview';
import { sanitizePii } from '../services/piiSanitizer';
import { RETENTION_OPTIONS, RetentionDays } from '../services/historyLogic';

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
  /** Private on-device record (R5): off by default */
  historyEnabled: boolean;
  onToggleHistory: (enabled: boolean) => void;
  retentionDays: RetentionDays;
  onSelectRetention: (days: RetentionDays) => void;
  /** What is remembered: count per chip inside the retention window */
  historySummary: Partial<Record<Chip, number>>;
  onClearHistory: () => void;
}

const CHIP_IDS = Object.keys(ar.chips) as Chip[];
const RECIPIENT_IDS = Object.keys(ar.recipients) as Recipient[];

// Logo for light backgrounds (jisr-brand/web/wordmark.png, 1583 x 388).
const WORDMARK = require('../../public/brand/wordmark.png');
const WORDMARK_ASPECT = 1583 / 388;

// Icon per recipient, from the mapping table in jisr-brand/BRAND.md.
const RECIPIENT_ICONS: Record<Recipient, JisrIconName> = {
  friend: 'person',
  sibling: 'relationships',
  parent: 'family',
  trusted_adult: 'person',
  counsellor: 'exams',
};

/**
 * CaptureScreen (Screen 1: Stress & Context Capture)
 *
 * RTL native port of the web showcase's home form (src/app/page.js on main):
 * 1. Brand block with the Jisr mark, name and tagline.
 * 2. 7 everyday stress chips with multi-select support.
 * 3. Optional free text, screened live by the Guardian crisis check, with a live
 *    preview of exactly what would leave the device (R16) before anything is sent.
 * 4. 5 recipient selectors tailored to Libyan youth social dynamics.
 * 5. Private on-device record: off by default, retention window, what is
 *    remembered, one-tap erase (R5).
 * 6. Stated limits from safety/stated-limits.json (R23).
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
  historyEnabled,
  onToggleHistory,
  retentionDays,
  onSelectRetention,
  historySummary,
  onClearHistory,
}) => {
  const isSubmitDisabled = selectedChips.length === 0 || isLoading;
  const outbound = useMemo(() => sanitizePii(inputText), [inputText]);
  const rememberedChips = (Object.keys(historySummary) as Chip[]).filter(
    (chip) => (historySummary[chip] ?? 0) > 0
  );

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <Image
          source={WORDMARK}
          style={styles.wordmark}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
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
                <JisrIcon name={id} size={20} color={isSelected ? c.green : c.inkMuted} />
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
            <View style={styles.crisisBannerHeader}>
              <JisrIcon name="alert" size={28} color={c.urgent} />
              <Text style={styles.crisisBannerText}>{supportCardData.title_ar}</Text>
            </View>
            <TouchableOpacity
              style={[button.base, button.urgent]}
              onPress={onOpenSupport}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.triggers.persistent_human_route}
            >
              <JisrIcon name="talk" size={20} color={c.onUrgent} />
              <Text style={[button.label, button.labelUrgent]}>
                {ar.triggers.persistent_human_route}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* What would leave the device, shown before anything is sent (R16) */}
        {!crisisDetected && inputText.trim().length > 0 && (
          <OutboundPreview
            sanitisedText={outbound.sanitisedText}
            identifiersRemoved={outbound.identifiersRemoved}
            style={styles.outboundPreview}
          />
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
                <JisrIcon
                  name={RECIPIENT_ICONS[id]}
                  size={20}
                  color={isSelected ? c.green : c.inkMuted}
                />
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
        style={[
          button.base,
          button.primary,
          styles.continueButton,
          isSubmitDisabled && button.disabled,
        ]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={ar.buttons.start_drafting}
      >
        {isLoading ? (
          <ActivityIndicator color={c.onGreen} size="small" />
        ) : (
          <>
            <JisrIcon name="edit" size={20} color={c.onGreen} />
            <Text style={[button.label, button.labelPrimary]}>{ar.buttons.start_drafting}</Text>
          </>
        )}
      </TouchableOpacity>

      {/* SECTION 4: Private on-device record (R5) */}
      <View style={styles.privacyCard}>
        <View style={styles.privacyToggleRow}>
          <JisrIcon name="on-device" size={20} color={c.ink} />
          <Text style={[styles.privacyTitle, styles.privacyToggleLabel]}>
            {ar.history.toggle_label}
          </Text>
          <Switch
            value={historyEnabled}
            onValueChange={onToggleHistory}
            trackColor={{ false: c.lineStrong, true: c.green }}
            accessibilityLabel={ar.history.toggle_label}
          />
        </View>
        <Text style={styles.privacyDescription}>
          {historyEnabled ? ar.history.on_description : ar.history.off_description}
        </Text>

        {historyEnabled && (
          <>
            <Text style={styles.privacyDescription}>{ar.history.retention_label}</Text>
            <View style={styles.retentionRow}>
              {RETENTION_OPTIONS.map((days) => {
                const isSelected = retentionDays === days;
                return (
                  <TouchableOpacity
                    key={days}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => onSelectRetention(days)}
                    activeOpacity={0.8}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.pillLabel, isSelected && styles.pillLabelSelected]}>
                      {ar.history.retention_options[String(days) as '1' | '7' | '30']}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.privacyDescription}>
              {ar.history.remembered}{' '}
              {rememberedChips.length > 0
                ? rememberedChips
                    .map((chip) => `${ar.chips[chip]} (${historySummary[chip]})`)
                    .join('، ')
                : ar.history.empty}
            </Text>

            {rememberedChips.length > 0 && (
              <TouchableOpacity
                style={[button.base, button.quiet, styles.clearHistoryButton]}
                onPress={onClearHistory}
                activeOpacity={0.7}
              >
                <JisrIcon name="delete" size={18} color={c.ink} />
                <Text style={[button.label, button.labelPlain]}>{ar.buttons.clear_history}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Stated Limits Notice (R23) */}
      <Text style={styles.limits}>{statedLimits.ar}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  brand: {
    alignItems: 'center',
    marginBottom: space[8],
  },
  wordmark: {
    width: 132,
    height: 132 / WORDMARK_ASPECT,
    marginBottom: space[3],
  },
  brandTitle: {
    ...type.display,
    color: c.ink,
    marginBottom: space[1],
  },
  brandTagline: {
    ...type.bodySm,
    color: c.wood,
    textAlign: 'center',
  },
  section: {
    marginBottom: space[6],
  },
  sectionTitle: {
    ...type.heading,
    color: c.ink,
    textAlign: 'right',
    marginBottom: space[3],
  },
  hint: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
    marginTop: -space[2],
    marginBottom: space[3],
  },
  pillRow: {
    flexDirection: rowRtl,
    flexWrap: 'wrap',
    gap: space[2],
  },
  pill: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[2],
    minHeight: 44,
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
  },
  pillSelected: {
    backgroundColor: c.greenSoft,
    borderColor: c.green,
  },
  pillLabel: {
    ...type.label,
    color: c.ink,
  },
  pillLabelSelected: {
    color: c.green,
  },
  textInput: {
    ...type.body,
    minHeight: 120,
    padding: space[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surfaceRaised,
    color: c.ink,
  },
  textInputAlert: {
    borderColor: c.urgent,
  },
  // SafetyBanner (docs/design-system/components/SafetyBanner.md)
  crisisBanner: {
    marginTop: space[3],
    paddingVertical: space[4],
    paddingHorizontal: space[6],
    gap: space[3],
    borderRadius: radius.md,
    backgroundColor: c.urgentSoft,
  },
  crisisBannerHeader: {
    flexDirection: rowRtl,
    alignItems: 'flex-start',
    gap: space[3],
  },
  crisisBannerText: {
    ...type.heading,
    fontFamily: fonts.display,
    color: c.urgent,
    textAlign: 'right',
    flex: 1,
  },
  outboundPreview: {
    marginTop: space[3],
  },
  continueButton: {
    alignSelf: 'stretch',
  },
  privacyCard: {
    marginTop: space[6],
    padding: space[4],
    borderRadius: radius.md,
    backgroundColor: c.surfaceSunken,
    gap: space[2],
  },
  privacyToggleRow: {
    flexDirection: rowRtl,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  privacyToggleLabel: {
    flex: 1,
  },
  retentionRow: {
    flexDirection: rowRtl,
    flexWrap: 'wrap',
    gap: space[2],
    marginVertical: space[1],
  },
  privacyTitle: {
    ...type.label,
    color: c.ink,
    textAlign: 'right',
  },
  privacyDescription: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
  },
  clearHistoryButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: space[2],
  },
  limits: {
    ...type.bodySm,
    marginTop: space[6],
    color: c.inkMuted,
    textAlign: 'center',
  },
});
