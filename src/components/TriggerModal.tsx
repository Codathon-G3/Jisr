import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import ar from '../i18n/ar.json';
import { radius, shadow, space, type } from '../theme/tokens';
import { backdrop, button, c, rowRtl } from '../theme/ui';
import { JisrIcon } from './JisrIcon';

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
              <JisrIcon name="edit" size={22} color={c.green} />
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
              style={[button.base, button.primary, styles.confirmButton]}
              onPress={onConfirm}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.start_drafting}
            >
              <Text style={[button.label, button.labelPrimary]}>
                {ar.buttons.start_drafting}
              </Text>
            </TouchableOpacity>

            {/* Secondary: Not Now */}
            <TouchableOpacity
              style={[button.base, button.plain, styles.cancelButton]}
              onPress={onDismiss}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.not_now}
            >
              <Text style={[button.label, button.labelPlain]}>
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
    backgroundColor: backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: space[4],
  },
  modalCard: {
    backgroundColor: c.surfaceRaised,
    borderRadius: radius.lg,
    padding: space[6],
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: c.line,
    ...shadow.lg,
  },
  headerRow: {
    flexDirection: rowRtl,
    alignItems: 'center',
    marginBottom: space[3],
    gap: space[3],
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: c.greenSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...type.heading,
    color: c.ink,
    textAlign: 'right',
    flex: 1,
  },
  messageText: {
    ...type.bodySm,
    color: c.ink,
    textAlign: 'right',
    marginBottom: space[6],
  },
  actionsRow: {
    flexDirection: rowRtl,
    gap: space[3],
  },
  confirmButton: {
    flex: 2,
  },
  cancelButton: {
    flex: 1,
  },
});
