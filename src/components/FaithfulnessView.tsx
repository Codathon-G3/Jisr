import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import ar from '../i18n/ar.json';
import { fonts, radius, shadow, space, type } from '../theme/tokens';
import { c, rowRtl } from '../theme/ui';
import { JisrIcon } from './JisrIcon';

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
        <View style={styles.titleRow}>
          <JisrIcon name="check" size={20} color={c.green} />
          <Text style={styles.title}>{ar.trust.faithfulness_title}</Text>
        </View>
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
  },
  title: {
    ...type.heading,
    color: c.ink,
    textAlign: 'right',
  },
  badge: {
    backgroundColor: c.greenSoft,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
  },
  badgeText: {
    ...type.caption,
    color: c.green,
  },
  description: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
    marginBottom: space[3],
  },
  draftBox: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: space[4],
    borderWidth: 1,
    borderColor: c.line,
    marginBottom: space[3],
  },
  boxLabel: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'right',
    marginBottom: space[1],
  },
  draftContent: {
    ...type.body,
    color: c.ink,
    textAlign: 'right',
  },
  normalText: {
    color: c.ink,
  },
  highlightedText: {
    backgroundColor: c.greenSoft,
    color: c.green,
    fontFamily: fonts.bodyMedium,
  },
  sourceBox: {
    backgroundColor: c.surfaceSunken,
    borderRadius: radius.md,
    padding: space[3],
  },
  sourceLabel: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'right',
    marginBottom: space[1],
  },
  sourceText: {
    ...type.bodySm,
    color: c.ink,
    textAlign: 'right',
  },
  counterRow: {
    marginTop: space[3],
    alignItems: 'center',
  },
  counterText: {
    ...type.caption,
    color: c.green,
    textAlign: 'center',
  },
});
