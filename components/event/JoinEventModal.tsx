import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import ThemedText from '@/components/ThemedText';

interface JoinEventModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: () => void;
  theme: any;
  loading: boolean;
  error: string | null;
}

const JoinEventModal = ({ 
  visible, 
  onClose, 
  onJoin, 
  theme, 
  loading, 
  error 
}: JoinEventModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
          <ThemedText type="title">Join Event</ThemedText>
          
          <View style={styles.formContainer}>
            <ThemedText type="subtitle">
              Are you sure you want to join this event?
            </ThemedText>
            
            {error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
          </View>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCreate, { backgroundColor: theme.tint }]}
              onPress={onJoin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={{ color: '#fff' }}>Join</ThemedText>
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
  formContainer: {
    width: '100%',
    marginVertical: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonCreate: {
    borderWidth: 0,
  },
});

export default JoinEventModal;
