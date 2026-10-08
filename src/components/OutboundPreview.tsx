import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import ar from '../i18n/ar.json';
import { radius, shadow, space, type } from '../theme/tokens';
import { button, c, rowRtl } from '../theme/ui';
import { JisrIcon } from './JisrIcon';

export interface IdentifierRemoved {
  /** The sensitive text that was scrubbed (e.g. '0912345678') */
  original: string;
  /** The placeholder injected (e.g. '[phone]', '[name]', '[email]') */
  placeholder: '[name]' | '[phone]' | '[email]';
}

export interface OutboundPreviewProps {
  /** The sanitized text that will actually be sent to the backend LLM */
  sanitisedText: string;
  /** List of stripped PII identifiers detected locally on the device */
  identifiersRemoved?: IdentifierRemoved[];
  /** Optional callback to continue drafting */
  onConfirm?: () => void;
  /** Optional callback to go back and edit the text */
  onEdit?: () => void;
  /** Optional style override */
  style?: ViewStyle;
}

/**
 * OutboundPreview Component (Layer 4: Trust, Privacy & PII Transparency)
 *
 * Shows the user exactly what would leave the device for drafting, before it is
 * sent (requirement R16). Identifiers the sanitizer found are replaced; the user
 * corrects anything it missed by editing their own text.
 */
export const OutboundPreview: React.FC<OutboundPreviewProps> = ({
  sanitisedText,
  identifiersRemoved = [],
  onConfirm,
  onEdit,
  style,
}) => {
  const hasIdentifiers = identifiersRemoved.length > 0;

  const getPlaceholderLabel = (placeholder: string) => {
    switch (placeholder) {
      case '[phone]':
        return 'رقم هاتف';
      case '[name]':
        return 'اسم';
      case '[email]':
        return 'بريد إلكتروني';
      default:
        return 'بيانات شخصية';
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <JisrIcon name="preview" size={20} color={c.ink} />
          <Text style={styles.title}>{ar.trust.outbound_preview_title}</Text>
        </View>
        <View style={styles.shieldBadge}>
          <JisrIcon name="on-device" size={14} color={c.inkMuted} />
          <Text style={styles.shieldBadgeText}>تصفية محلية</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>{ar.trust.outbound_preview_desc}</Text>

      {/* Sanitized Text Preview Box */}
      <View style={styles.textBox}>
        <Text style={styles.sanitisedContent}>
          {sanitisedText.trim().length > 0
            ? sanitisedText
            : '(ما كتبتش نص، الصياغة بتعتمد على المواضيع بس)'}
        </Text>
      </View>

      {/* Scrubbed Items Notice */}
      {hasIdentifiers ? (
        <View style={styles.scrubbedSection}>
          <Text style={styles.scrubbedHeader}>
            تم استبدال البيانات التالية لحماية هويتك:
          </Text>
          <View style={styles.tagsRow}>
            {identifiersRemoved.map((item, index) => (
              <View key={index} style={styles.tagBadge}>
                <Text style={styles.tagText}>
                  {getPlaceholderLabel(item.placeholder)}: {item.placeholder}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.cleanSection}>
          <Text style={styles.cleanText}>{ar.trust.outbound_clean}</Text>
        </View>
      )}

      {/* Where the text goes */}
      <View style={styles.guaranteeBox}>
        <JisrIcon name="privacy" size={16} color={c.inkMuted} />
        <Text style={styles.guaranteeText}>{ar.trust.outbound_server_note}</Text>
      </View>

      {/* Action Buttons */}
      {(onConfirm || onEdit) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              style={[button.base, button.plain, styles.editButton]}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <JisrIcon name="edit" size={18} color={c.ink} />
              <Text style={[button.label, button.labelPlain]}>تعديل النص</Text>
            </TouchableOpacity>
          )}

          {onConfirm && (
            <TouchableOpacity
              style={[button.base, button.primary, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={[button.label, button.labelPrimary]}>متابعة الصياغة</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: c.surfaceRaised,
    borderRadius: radius.lg,
    padding: space[4],
    marginVertical: space[3],
    borderWidth: 1,
    borderColor: c.line,
    writingDirection: 'rtl',
    ...shadow.sm,
  },
  headerRow: {
    flexDirection: rowRtl,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space[2],
    gap: space[2],
  },
  titleRow: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[2],
    flexShrink: 1,
  },
  title: {
    ...type.heading,
    color: c.ink,
    textAlign: 'right',
    flexShrink: 1,
  },
  shieldBadge: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[1],
    backgroundColor: c.surfaceSunken,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
  },
  shieldBadgeText: {
    ...type.caption,
    color: c.inkMuted,
  },
  subtitle: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
    marginBottom: space[3],
  },
  textBox: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: space[4],
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: space[3],
  },
  sanitisedContent: {
    ...type.bodySm,
    color: c.ink,
    textAlign: 'right',
  },
  scrubbedSection: {
    backgroundColor: c.surfaceSunken,
    borderRadius: radius.md,
    padding: space[3],
    marginBottom: space[3],
  },
  scrubbedHeader: {
    ...type.label,
    color: c.ink,
    textAlign: 'right',
    marginBottom: space[2],
  },
  tagsRow: {
    flexDirection: rowRtl,
    flexWrap: 'wrap',
    gap: space[2],
  },
  tagBadge: {
    backgroundColor: c.surfaceRaised,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: c.line,
  },
  tagText: {
    ...type.caption,
    color: c.ink,
  },
  cleanSection: {
    backgroundColor: c.greenSoft,
    borderRadius: radius.md,
    padding: space[3],
    marginBottom: space[3],
  },
  cleanText: {
    ...type.bodySm,
    color: c.green,
    textAlign: 'right',
  },
  guaranteeBox: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[2],
    paddingVertical: space[1],
    marginBottom: space[3],
  },
  guaranteeText: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'right',
    flexShrink: 1,
  },
  actionsRow: {
    flexDirection: rowRtl,
    gap: space[3],
  },
  editButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});
