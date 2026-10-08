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
        <Text style={styles.title}>{ar.trust.comparison_title}</Text>
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
          <Text style={styles.cardIndicator}>
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
          style={styles.actionButton}
          onPress={handleSelect}
          activeOpacity={0.85}
        >
          <Text style={styles.actionButtonText}>
            {activeTab === 'ai' ? 'اعتمد صياغة الذكاء الاصطناعي' : 'اعتمد القالب الثابت'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
  trustBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'right',
    marginBottom: 14,
    lineHeight: 19,
  },
  segmentedControl: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  messageCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    minHeight: 110,
    justifyContent: 'center',
  },
  messageCardAi: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  messageCardBaseline: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  cardHeader: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  cardIndicator: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'right',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#1E293B',
    textAlign: 'right',
  },
  insightBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  insightText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'right',
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 14,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
