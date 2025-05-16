import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import ThemedText from '@/components/ThemedText';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void;
  theme: any;
  loading: boolean;
}

const DeleteConfirmationModal = ({ 
  visible, 
  onClose, 
  onDelete, 
  theme, 
  loading 
}: DeleteConfirmationModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
          <ThemedText type="title">Confirm Delete</ThemedText>
          <ThemedText style={styles.confirmText}>
            Are you sure you want to delete this event? This action cannot be undone.
          </ThemedText>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.error }]}
              onPress={onDelete}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={{ color: '#fff' }}>Delete</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmText: {
    textAlign: 'center',
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
  },
  buttonCancel: {
    borderWidth: 1,
  },
});

export default DeleteConfirmationModal;
