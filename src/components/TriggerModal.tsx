import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from 'react-native';
import ar from '../i18n/ar.json';

export interface TriggerModalProps {
  visible: boolean;
  chipLabel: string;
  isRecurrence?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

/**
 * TriggerModal Component (Layer 3: Writing Triggers)
 *
 * Displays a gentle, empathetic dialog when:
 * 1. A user selects a stress chip for the first time in a session (same-session prompt).
 * 2. A user selects a stress chip that has recurred >= 3 times in local history (pattern recurrence).
 *
 * Prompts user with options to start drafting or decline gracefully without pressure.
 */
export const TriggerModal: React.FC<TriggerModalProps> = ({
  visible,
  chipLabel,
  isRecurrence = false,
  onConfirm,
  onDismiss,
}) => {
  const promptTemplate = isRecurrence
    ? ar.triggers.pattern_prompt
    : ar.triggers.same_session_prompt;

  const promptMessage = promptTemplate.replace('{chip}', chipLabel || 'هذا الموضوع');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header & Icon */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{isRecurrence ? '🌿' : '🕊️'}</Text>
            </View>
            <Text style={styles.title}>
              {isRecurrence ? 'ملاحظة لطيفة وداعمة' : 'دعوة للمساعدة في الكتابة'}
            </Text>
          </View>

          {/* Prompt Message */}
          <Text style={styles.messageText}>{promptMessage}</Text>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            {/* Primary: Start Drafting */}
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.start_drafting}
            >
              <Text style={styles.confirmButtonText}>
                {ar.buttons.start_drafting}
              </Text>
            </TouchableOpacity>

            {/* Secondary: Not Now */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onDismiss}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.not_now}
            >
              <Text style={styles.cancelButtonText}>
                {ar.buttons.not_now}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 440,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
    flex: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
    textAlign: 'right',
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    gap: 10,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
