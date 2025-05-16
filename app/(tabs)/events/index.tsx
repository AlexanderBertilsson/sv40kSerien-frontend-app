import { useState } from 'react';
import { View, StyleSheet, useColorScheme, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Colors, hexToRgba } from '@/constants/Colors';
import { useEvents } from '@/hooks/useEvents';
import { useEventManagement } from '@/hooks/useEventManagement';
import { Event } from '@/types/utils/types/Event';

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const { events, loading, error } = useEvents({ upcomingOnly: true });
  const { createEvent, loading: createLoading, error: createError } = useEventManagement();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    rounds: '3',
    date: new Date().toISOString().split('T')[0],
    location: '',
    type: '8man' as '8man' | '5man' | 'single',
    roster: [],
    userRole: "organizer" as "none" | "organizer" | "judge" 
  });

  const handleCreateEvent = async () => {
    const eventData = {
      ...newEvent,
      rounds: parseInt(newEvent.rounds),
      userRole: "organizer" as "none" | "organizer" | "judge" 
    };
    
    const result = await createEvent(eventData);
    if (result) {
      setModalVisible(false);
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        rounds: '3',
        date: new Date().toISOString().split('T')[0],
        location: '',
        type: '8man' as '8man' | '5man' | 'single',
        roster: [],
        userRole: "organizer" as "none" | "organizer" | "judge" 
      });
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={[styles.eventCard, { backgroundColor: theme.secondary }]}
      onPress={() => {
        // Using the segment-based navigation pattern that matches the file structure
        router.navigate({
          pathname: `/events/[eventId]`,
          params: { eventId: item.id }
        });
      }}
    >
      <ThemedText type="subtitle">{item.title}</ThemedText>
      <ThemedText>{new Date(item.date).toLocaleDateString()}</ThemedText>
      <ThemedText>{item.location}</ThemedText>
      <View style={styles.eventTypeTag}>
        <ThemedText style={styles.eventTypeText}>{item.type}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText type='title'>Events</ThemedText>
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.tint }]}
          onPress={() => setModalVisible(true)}
        >
          <ThemedText style={{ color: '#fff' }}>Create Event</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.tint} />
      ) : error ? (
        <ThemedText style={styles.errorText}>Error loading events: {error}</ThemedText>
      ) : events.length === 0 ? (
        <ThemedText>No upcoming events found</ThemedText>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          style={styles.eventsList}
          contentContainerStyle={styles.eventsListContent}
        />
      )}

      {/* Create Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
            <ThemedText type="title">Create New Event</ThemedText>
            
            <ScrollView style={styles.formContainer}>
              <ThemedText>Title</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({...newEvent, title: text})}
                placeholder="Event Title"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
              />
              
              <ThemedText>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({...newEvent, description: text})}
                placeholder="Event Description"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
                multiline
                numberOfLines={4}
              />
              
              <ThemedText>Rounds</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.rounds}
                onChangeText={(text) => setNewEvent({...newEvent, rounds: text})}
                placeholder="Number of Rounds"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
                keyboardType="numeric"
              />
              
              <ThemedText>Date</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({...newEvent, date: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
              />
              
              <ThemedText>Location</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({...newEvent, location: text})}
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
                        backgroundColor: newEvent.type === type ? theme.tint : theme.background,
                      }
                    ]}
                    onPress={() => setNewEvent({...newEvent, type: type as '8man' | '5man' | 'single'})}
                  >
                    <ThemedText style={{ 
                      color: newEvent.type === type ? '#fff' : theme.text 
                    }}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              {createError && (
                <ThemedText style={styles.errorText}>{createError}</ThemedText>
              )}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel, { borderColor: theme.tint }]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonCreate, { backgroundColor: theme.tint }]}
                onPress={handleCreateEvent}
                disabled={createLoading}
              >
                {createLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={{ color: '#fff' }}>Create</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  eventsList: {
    width: '100%',
  },
  eventsListContent: {
    paddingBottom: 20,
  },
  eventCard: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventTypeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#555',
    borderRadius: 4,
    marginTop: 8,
  },
  eventTypeText: {
    fontSize: 12,
    color: '#fff',
  },
  errorText: {
    color: '#ff6b6b',
    marginVertical: 10,
  },
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
  button: {
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
});
