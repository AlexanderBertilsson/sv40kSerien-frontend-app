import { Modal, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import ThemedText from '../ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmButtonColor?: string;
}

export function ConfirmModal({ 
  visible, 
  onClose, 
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  confirmButtonColor,
}: ConfirmModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable 
        style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{title}</ThemedText>
            <Pressable 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          
          <View style={styles.modalBody}>
            <ThemedText style={styles.messageText}>{message}</ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable 
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.secondary }]}
              onPress={onClose}
              disabled={isLoading}
            >
              <ThemedText style={styles.buttonText}>{cancelText}</ThemedText>
            </Pressable>
            
            <Pressable 
              style={[
                styles.button, 
                styles.confirmButton, 
                { backgroundColor: confirmButtonColor || theme.success }
              ]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={[styles.buttonText, styles.confirmButtonText]}>{confirmText}</ThemedText>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    marginBottom: 24,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  confirmButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#fff',
  },
});
