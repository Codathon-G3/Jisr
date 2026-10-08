import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
} from 'react-native';
import supportCardData from '../../safety/support-card.json';
import ar from '../i18n/ar.json';
import { SupportContact } from '../types';
import { fonts, radius, shadow, space, type } from '../theme/tokens';
import { backdrop, button, c, rowRtl } from '../theme/ui';
import { JisrIcon } from './JisrIcon';

export interface SupportCardModalProps {
  visible: boolean;
  onClose: () => void;
  isCrisis?: boolean;
  /**
   * Shown after a risk detection (requirement R10): the user may still write their
   * note to a trusted person. The caller continues with plain templates, so the
   * flagged text never reaches the drafting model.
   */
  onContinue?: () => void;
}

/**
 * SupportCardModal (Guardian Layer 2 & Persistent Human Route)
 *
 * Static, unalterable emergency support modal.
 * Reads directly from safety/support-card.json.
 * Renders ONLY verified contacts. If no verified contact exists, strictly
 * renders the approved fallback safety notice directing to trusted relatives
 * or emergency departments.
 */
export const SupportCardModal: React.FC<SupportCardModalProps> = ({
  visible,
  onClose,
  isCrisis = false,
  onContinue,
}) => {
  // Only display contacts that have verified === true
  const verifiedContacts: SupportContact[] = (
    (supportCardData.contacts as unknown as SupportContact[]) || []
  ).filter((contact) => contact && contact.verified === true);

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
        console.warn('Could not initiate phone call:', err);
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Safety banner: alert icon, heading in urgent, compassionate message */}
            <View style={styles.banner} accessibilityRole="alert">
              <View style={styles.bannerHeader}>
                <JisrIcon name="alert" size={28} color={c.urgent} />
                <View style={styles.bannerHeading}>
                  <Text style={styles.badgeText}>
                    {isCrisis ? 'تنبيه أمان' : 'دعم إنساني'}
                  </Text>
                  <Text style={styles.title}>{supportCardData.title_ar}</Text>
                </View>
              </View>
              <Text style={styles.messageText}>
                {supportCardData.message_ar}
              </Text>
            </View>

            {/* Verified Contacts List (if any are verified) */}
            {verifiedContacts.length > 0 ? (
              <View style={styles.contactsSection}>
                <Text style={styles.contactsSectionTitle}>
                  أرقام تم التحقق من عملها في ليبيا:
                </Text>
                {verifiedContacts.map((contact, index) => (
                  <View key={index} style={styles.contactItem}>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactNumber}>{contact.number}</Text>
                      {contact.verifiedOn && (
                        <Text style={styles.verifiedMeta}>
                          تم التحقق بتاريخ: {contact.verifiedOn}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[button.base, button.urgent]}
                      onPress={() => handleCall(contact.number)}
                      activeOpacity={0.8}
                    >
                      <JisrIcon name="phone" size={20} color={c.onUrgent} />
                      <Text style={[button.label, button.labelUrgent]}>اتصال الآن</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              /* Static Unaltered Fallback Box when no 24/7 hotline is verified */
              <View style={styles.fallbackBox}>
                <View style={styles.fallbackIconRow}>
                  <JisrIcon name="phone" size={20} color={c.urgent} />
                  <Text style={styles.fallbackTitle}>إشعار مهم للسلامة</Text>
                </View>
                <Text style={styles.fallbackText}>
                  {supportCardData.fallbackMessage_ar}
                </Text>
              </View>
            )}

            {/* Guidance & Stated Limits Note */}
            <View style={styles.limitsBox}>
              <Text style={styles.limitsText}>
                {supportCardData.continue_ar}
              </Text>
            </View>
          </ScrollView>

          {/* Continue to the note after a risk detection (R10) */}
          {isCrisis && onContinue && (
            <TouchableOpacity
              style={[button.base, button.primary, styles.continueButton]}
              onPress={onContinue}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={ar.buttons.continue_note}
            >
              <JisrIcon name="edit" size={20} color={c.onGreen} />
              <Text style={[button.label, button.labelPrimary]}>{ar.buttons.continue_note}</Text>
            </TouchableOpacity>
          )}

          {/* Close / Action Button */}
          <TouchableOpacity
            style={[button.base, button.plain]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[button.label, button.labelPlain]}>
              {isCrisis ? 'فهمت، والعودة إلى التطبيق' : 'إغلاق'}
            </Text>
          </TouchableOpacity>
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
    maxWidth: 480,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: c.line,
    ...shadow.lg,
  },
  // SafetyBanner (docs/design-system/components/SafetyBanner.md)
  banner: {
    backgroundColor: c.urgentSoft,
    borderRadius: radius.md,
    paddingVertical: space[4],
    paddingHorizontal: space[6],
    marginBottom: space[4],
  },
  bannerHeader: {
    flexDirection: rowRtl,
    alignItems: 'flex-start',
    gap: space[3],
    marginBottom: space[1],
  },
  bannerHeading: {
    flex: 1,
  },
  badgeText: {
    ...type.label,
    color: c.urgent,
    textAlign: 'right',
  },
  title: {
    ...type.heading,
    fontFamily: fonts.display,
    color: c.urgent,
    textAlign: 'right',
  },
  scrollArea: {
    marginBottom: space[4],
  },
  scrollContent: {
    paddingVertical: space[1],
  },
  messageText: {
    ...type.bodySm,
    color: c.ink,
    textAlign: 'right',
  },
  contactsSection: {
    marginBottom: space[4],
  },
  contactsSectionTitle: {
    ...type.label,
    color: c.ink,
    textAlign: 'right',
    marginBottom: space[2],
  },
  contactItem: {
    flexDirection: rowRtl,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: c.surfaceRaised,
    borderRadius: radius.md,
    padding: space[3],
    marginBottom: space[2],
    borderWidth: 1,
    borderColor: c.line,
    gap: space[2],
  },
  contactInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactName: {
    ...type.label,
    color: c.ink,
  },
  contactNumber: {
    ...type.bodySm,
    color: c.ink,
    direction: 'ltr',
    marginTop: space[1],
  },
  verifiedMeta: {
    ...type.caption,
    color: c.green,
    marginTop: space[1],
  },
  fallbackBox: {
    backgroundColor: c.surfaceSunken,
    borderRadius: radius.md,
    padding: space[4],
    marginBottom: space[3],
  },
  fallbackIconRow: {
    flexDirection: rowRtl,
    alignItems: 'center',
    marginBottom: space[2],
    gap: space[2],
  },
  fallbackTitle: {
    ...type.label,
    color: c.urgent,
    textAlign: 'right',
  },
  fallbackText: {
    ...type.bodySm,
    color: c.ink,
    textAlign: 'right',
  },
  limitsBox: {
    backgroundColor: c.surface,
    borderRadius: radius.md,
    padding: space[3],
    borderWidth: 1,
    borderColor: c.line,
  },
  limitsText: {
    ...type.bodySm,
    color: c.inkMuted,
    textAlign: 'right',
  },
  continueButton: {
    marginBottom: space[3],
  },
});
