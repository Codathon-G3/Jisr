import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  I18nManager,
} from 'react-native';
import ar from '../i18n/ar.json';

export interface Alignment {
  /** The phrase inside the generated draft */
  draftPhrase: string;
  /** The corresponding phrase from the user's original raw input */
  inputPhrase: string;
}

export interface FaithfulnessViewProps {
  /** The AI-generated message draft */
  draftText: string;
  /** The raw input written by the user */
  originalText: string;
  /** Alignment pairs returned by the backend /api/faithfulness endpoint */
  alignments?: Alignment[];
  /** Optional container style override */
  style?: ViewStyle;
}

/**
 * FaithfulnessView Component (Layer 4: Trust & Verification)
 *
 * Highlights the draft phrases that trace back to the user's own words (pairs the
 * backend has checked really occur in both texts, via /api/faithfulness). Anything
 * not highlighted was written by the AI, and the view says so, so the user knows
 * what to check before sending.
 */
export const FaithfulnessView: React.FC<FaithfulnessViewProps> = ({
  draftText,
  originalText,
  alignments = [],
  style,
}) => {
  // Compute highlighted segments of the draft
  const highlightedDraftSegments = useMemo(() => {
    if (!alignments || alignments.length === 0) {
      return [{ text: draftText, isHighlighted: false }];
    }

    const phrases = alignments
      .map((a) => a.draftPhrase.trim())
      .filter((p) => p.length > 0);

    if (phrases.length === 0) {
      return [{ text: draftText, isHighlighted: false }];
    }

    // Escape regex special chars and build match pattern
    const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'g');

    const parts = draftText.split(regex);
    return parts.map((part) => ({
      text: part,
      isHighlighted: phrases.includes(part),
    }));
  }, [draftText, alignments]);

  return (
    <View style={[styles.container, style]}>
      {/* Title & Integrity Badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{ar.trust.faithfulness_title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>مربوط بكلامك</Text>
        </View>
      </View>

      <Text style={styles.description}>{ar.trust.faithfulness_desc}</Text>

      {/* Draft Display with Highlighting */}
      <View style={styles.draftBox}>
        <Text style={styles.boxLabel}>نص الرسالة المقترحة:</Text>
        <Text style={styles.draftContent}>
          {highlightedDraftSegments.map((segment, index) =>
            segment.isHighlighted ? (
              <Text key={index} style={styles.highlightedText}>
                {segment.text}
              </Text>
            ) : (
              <Text key={index} style={styles.normalText}>
                {segment.text}
              </Text>
            )
          )}
        </Text>
      </View>

      {/* Source Reference Accordion / Card */}
      <View style={styles.sourceBox}>
        <Text style={styles.sourceLabel}>كلماتك الأصلية المدخلة:</Text>
        <Text style={styles.sourceText}>
          {originalText.trim().length > 0
            ? `"${originalText.trim()}"`
            : '(تم الاعتماد على خيارات المواضيع المحددة فقط)'}
        </Text>
      </View>

      {/* Alignment Proof Counter */}
      {alignments.length > 0 && (
        <View style={styles.counterRow}>
          <Text style={styles.counterText}>
            {alignments.length} عبارة مربوطة بكلامك. الباقي من صياغة الذكاء الاصطناعي.
          </Text>
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
  badge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  description: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'right',
    lineHeight: 19,
    marginBottom: 14,
  },
  draftBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  boxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'right',
    marginBottom: 6,
  },
  draftContent: {
    fontSize: 15,
    lineHeight: 25,
    color: '#1E293B',
    textAlign: 'right',
  },
  normalText: {
    color: '#334155',
  },
  highlightedText: {
    backgroundColor: '#BBF7D0',
    color: '#065F46',
    fontWeight: '700',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  sourceBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 12,
  },
  sourceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'right',
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    textAlign: 'right',
  },
  counterRow: {
    marginTop: 10,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'center',
  },
});
