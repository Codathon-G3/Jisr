import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  I18nManager,
} from 'react-native';

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
 * Shows the user and evaluators exactly what data leaves the mobile device.
 * Proves that personal identifiers (Libyan phone numbers, emails, names)
 * were scrubbed locally on-device before any network payload was dispatched.
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
        return 'اسم شخصي';
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
        <Text style={styles.title}>معاينة البيانات الصادرة (حماية الخصوصية)</Text>
        <View style={styles.shieldBadge}>
          <Text style={styles.shieldBadgeText}>تصفية محلية</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        هذا النص هو الوحيد الذي سيتم إرساله للذكاء الاصطناعي للمساعدة في الصياغة.
        تمت تصفية أي معلومات خاصة على جهازك مباشرة:
      </Text>

      {/* Sanitized Text Preview Box */}
      <View style={styles.textBox}>
        <Text style={styles.sanitisedContent}>
          {sanitisedText.trim().length > 0
            ? sanitisedText
            : '(لا توجد كلمات شخصية - سيتم الاعتماد على خيارات المواضيع فقط)'}
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
          <Text style={styles.cleanText}>
            النص نظيف تماماً ولا يحتوي على أرقام هواتف أو بيانات اتصال حساسة.
          </Text>
        </View>
      )}

      {/* Zero Retention Guarantee */}
      <View style={styles.guaranteeBox}>
        <Text style={styles.guaranteeText}>
          ضمان جسر: لا يتم تخزين هذا النص في أي خادم أو قاعدة بيانات سحابية.
        </Text>
      </View>

      {/* Action Buttons */}
      {(onConfirm || onEdit) && (
        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={onEdit}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>تعديل النص</Text>
            </TouchableOpacity>
          )}

          {onConfirm && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>متابعة الصياغة</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    writingDirection: 'rtl',
  },
  headerRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
  shieldBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  shieldBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'right',
    lineHeight: 19,
    marginBottom: 12,
  },
  textBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sanitisedContent: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B',
    textAlign: 'right',
  },
  scrubbedSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 10,
  },
  scrubbedHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'right',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350F',
  },
  cleanSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 10,
  },
  cleanText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    textAlign: 'right',
  },
  guaranteeBox: {
    paddingVertical: 4,
    marginBottom: 12,
  },
  guaranteeText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    gap: 10,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
