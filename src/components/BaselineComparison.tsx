import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  I18nManager,
} from 'react-native';
import ar from '../i18n/ar.json';
import { radius, shadow, space, type } from '../theme/tokens';
import { button, c, rowRtl } from '../theme/ui';
import { JisrIcon } from './JisrIcon';

export interface BaselineComparisonProps {
  /** The AI-generated, tone-adapted message draft */
  aiDraft: string;
  /** The deterministic, static baseline template for the selected topic & recipient */
  baselineTemplate: string;
  /** Label for the recipient (e.g. 'صاحبي / صاحبتي') */
  recipientLabel?: string;
  /** False when the drafts are templates (AI unavailable), so the view says so */
  aiAvailable?: boolean;
  /** Optional callback when the user picks which version to send */
  onSelectDraft?: (selectedText: string, isAi: boolean) => void;
  /** Optional container style override */
  style?: ViewStyle;
}

/**
 * BaselineComparison Component (Layer 4: Trust & Transparency)
 *
 * Lets the user and evaluators compare the AI draft with the plain template and
 * judge for themselves. Product definition §4.4: if the AI output is not better,
 * the toggle must show that too, so the labels stay neutral and the view says
 * plainly when the "AI" draft is only the template.
 */
export const BaselineComparison: React.FC<BaselineComparisonProps> = ({
  aiDraft,
  baselineTemplate,
  recipientLabel,
  aiAvailable = true,
  onSelectDraft,
  style,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'baseline'>('ai');

  const currentText = activeTab === 'ai' ? aiDraft : baselineTemplate;

  const handleSelect = () => {
    onSelectDraft?.(currentText, activeTab === 'ai');
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header & Purpose Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <JisrIcon name="suggestion" size={20} color={c.lavender} />
          <Text style={styles.title}>{ar.trust.comparison_title}</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustBadgeText}>الذكاء الاصطناعي مقابل القالب</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        شوف الفرق بين صياغة الذكاء الاصطناعي والقالب العام الثابت
        {recipientLabel ? ` الموجه إلى (${recipientLabel})` : ''}:
      </Text>

      {/* Segmented Switcher */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'ai' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('ai')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'ai' }}
          accessibilityLabel="عرض صياغة الذكاء الاصطناعي"
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'ai' && styles.segmentTextActive,
            ]}
          >
            صياغة مخصصة (الذكاء الاصطناعي)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === 'baseline' && styles.segmentButtonActive,
          ]}
          onPress={() => setActiveTab('baseline')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'baseline' }}
          accessibilityLabel="عرض القالب الثابت"
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'baseline' && styles.segmentTextActive,
            ]}
          >
            قالب ثابت (بدون ذكاء اصطناعي)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Message Card */}
      <View
        style={[
          styles.messageCard,
          activeTab === 'ai' ? styles.messageCardAi : styles.messageCardBaseline,
        ]}
      >
        <View style={styles.cardHeader}>
          {activeTab === 'ai' && <JisrIcon name="suggestion" size={16} color={c.lavender} />}
          <Text style={[styles.cardIndicator, activeTab === 'ai' && styles.cardIndicatorAi]}>
            {activeTab === 'ai' ? ar.trust.ai_draft_label : ar.trust.baseline_template_label}
          </Text>
        </View>

        <Text style={styles.messageText}>{currentText}</Text>
      </View>

      {/* Insight Footer */}
      <View style={styles.insightBox}>
        <Text style={styles.insightText}>
          {aiAvailable ? ar.trust.why_different : ar.trust.template_only}
        </Text>
      </View>

      {/* Select / Use Button */}
      {onSelectDraft && (
        <TouchableOpacity
          style={[button.base, button.plain, styles.actionButton]}
          onPress={handleSelect}
          activeOpacity={0.85}
        >
          <JisrIcon name="check" size={20} color={c.ink} />
          <Text style={[button.label, button.labelPlain]}>
            {activeTab === 'ai' ? 'اعتمد صياغة الذكاء الاصطناعي' : 'اعتمد القالب الثابت'}
          </Text>
        </TouchableOpacity>
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
  trustBadge: {
    backgroundColor: c.surfaceSunken,
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.full,
  },
  trustBadgeText: {
    ...type.caption,
    color: c.inkMuted,
  },
  subtitle: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
    marginBottom: space[3],
  },
  segmentedControl: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: c.surfaceSunken,
    borderRadius: radius.md,
    padding: space[1],
    marginBottom: space[3],
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    paddingVertical: space[2],
    paddingHorizontal: space[2],
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: c.surfaceRaised,
    ...shadow.sm,
  },
  segmentText: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: c.green,
  },
  messageCard: {
    borderRadius: radius.md,
    padding: space[4],
    borderWidth: 1,
    minHeight: 110,
    justifyContent: 'center',
  },
  messageCardAi: {
    backgroundColor: c.lavenderSoft,
    borderColor: c.lavenderSoft,
  },
  messageCardBaseline: {
    backgroundColor: c.surfaceSunken,
    borderColor: c.line,
  },
  cardHeader: {
    flexDirection: rowRtl,
    alignItems: 'center',
    gap: space[1],
    marginBottom: space[2],
  },
  cardIndicator: {
    ...type.caption,
    color: c.inkMuted,
    textAlign: 'right',
  },
  cardIndicatorAi: {
    color: c.lavender,
  },
  messageText: {
    ...type.body,
    color: c.ink,
    textAlign: 'right',
  },
  insightBox: {
    marginTop: space[3],
    padding: space[3],
    backgroundColor: c.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
  },
  insightText: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
  },
  actionButton: {
    marginTop: space[3],
  },
});
