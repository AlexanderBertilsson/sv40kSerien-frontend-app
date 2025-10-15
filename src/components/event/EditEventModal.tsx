import React from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { EventDetails } from '@/types/EventDetails';
import { hexToRgba } from '@/src/constants/Colors';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  editedEvent: Partial<EventDetails>;
  setEditedEvent: React.Dispatch<React.SetStateAction<Partial<EventDetails>>>;
  theme: any;
  loading: boolean;
  error: string | null;
}

const EditEventModal = ({ 
  visible, 
  onClose, 
  onUpdate, 
  editedEvent, 
  setEditedEvent, 
  theme, 
  loading, 
  error 
}: EditEventModalProps) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
          <ThemedText type="title">Edit Event</ThemedText>
          
          <ScrollView style={styles.formContainer}>
            <ThemedText>Title</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={editedEvent.title}
              onChangeText={(text) => setEditedEvent({...editedEvent, title: text})}
              placeholder="Event Title"
              placeholderTextColor={hexToRgba(theme.text, 0.5)}
            />
            
            <ThemedText>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
              value={editedEvent.description}
              onChangeText={(text) => setEditedEvent({...editedEvent, description: text})}
              placeholder="Event Description"
              placeholderTextColor={hexToRgba(theme.text, 0.5)}
              multiline
              numberOfLines={4}
            />
            
            <ThemedText>Rounds</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={editedEvent.rounds?.toString()}
              onChangeText={(text) => setEditedEvent({...editedEvent, rounds: parseInt(text) || 0})}
              placeholder="Number of Rounds"
              placeholderTextColor={hexToRgba(theme.text, 0.5)}
              keyboardType="numeric"
            />
            
            <ThemedText>Date</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={editedEvent.date}
              onChangeText={(text) => setEditedEvent({...editedEvent, date: text})}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={hexToRgba(theme.text, 0.5)}
            />
            
            <ThemedText>Location</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
              value={editedEvent.location}
              onChangeText={(text) => setEditedEvent({...editedEvent, location: text})}
              placeholder="Event Location"
              placeholderTextColor={hexToRgba(theme.text, 0.5)}
            />
            
            <ThemedText>Event Type</ThemedText>
            <View style={styles.typeSelector}>
              {['8man', '5man', 'single'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    { 
                      backgroundColor: editedEvent.type === type ? theme.tint : theme.background,
                    }
                  ]}
                  onPress={() => setEditedEvent({...editedEvent, type: type as '8man' | '5man' | 'single'})}
                >
                  <ThemedText style={{ 
                    color: editedEvent.type === type ? '#fff' : theme.text 
                  }}>
                    {type}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            
            {error && (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            )}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonCreate, { backgroundColor: theme.tint }]}
              onPress={onUpdate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <ThemedText style={{ color: '#fff' }}>Update</ThemedText>
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
    maxHeight: '80%',
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
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
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
  buttonCreate: {
    elevation: 2,
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
  },
});

export default EditEventModal;
