import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  ScrollView,
  I18nManager,
} from 'react-native';
import supportCardData from '../../safety/support-card.json';
import { SupportContact } from '../types';
import { colors } from '../theme';

export interface SupportCardModalProps {
  visible: boolean;
  onClose: () => void;
  isCrisis?: boolean;
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
          {/* Header & Emergency Badge */}
          <View style={styles.headerRow}>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>
                {isCrisis ? 'تنبيه أمان' : 'دعم إنساني'}
              </Text>
            </View>
            <Text style={styles.title}>{supportCardData.title_ar}</Text>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Compassionate Message */}
            <Text style={styles.messageText}>
              {supportCardData.message_ar}
            </Text>

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
                      style={styles.callButton}
                      onPress={() => handleCall(contact.number)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.callButtonText}>اتصال الآن</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              /* Static Unaltered Fallback Box when no 24/7 hotline is verified */
              <View style={styles.fallbackBox}>
                <View style={styles.fallbackIconRow}>
                  
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

          {/* Close / Action Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isCrisis ? styles.crisisButton : styles.normalButton,
            ]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>
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
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.cream,
    borderRadius: 25,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(36, 54, 92, 0.1)',
    borderTopWidth: 5,
    borderTopColor: colors.safety,
  },
  headerRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.safety,
    textAlign: 'right',
    flex: 1,
  },
  alertBadge: {
    backgroundColor: colors.safetySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.safetyBorder,
    marginLeft: 8,
  },
  alertBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.safety,
  },
  scrollArea: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 23,
    color: colors.navy,
    textAlign: 'right',
    marginBottom: 16,
  },
  contactsSection: {
    marginBottom: 16,
  },
  contactsSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'right',
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.safetySoft,
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(176, 67, 42, 0.18)',
  },
  contactInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
  },
  contactNumber: {
    fontSize: 13,
    color: colors.navy,
    direction: 'ltr',
    marginTop: 2,
  },
  verifiedMeta: {
    fontSize: 11,
    color: colors.green,
    marginTop: 4,
  },
  callButton: {
    backgroundColor: colors.green,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  callButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  fallbackBox: {
    backgroundColor: colors.safetySoft,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(176, 67, 42, 0.18)',
    marginBottom: 14,
  },
  fallbackIconRow: {
    flexDirection: I18nManager.isRTL ? 'row' : 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fallbackIcon: {
    fontSize: 18,
  },
  fallbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#783323',
    textAlign: 'right',
  },
  fallbackText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#783323',
    textAlign: 'right',
  },
  limitsBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitsText: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
    lineHeight: 19,
  },
  actionButton: {
    paddingVertical: 13,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  normalButton: {
    backgroundColor: colors.green,
  },
  crisisButton: {
    backgroundColor: colors.safety,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
