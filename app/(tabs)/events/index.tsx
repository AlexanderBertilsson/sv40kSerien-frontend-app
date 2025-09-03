import { useState } from 'react';
import { View, StyleSheet, useColorScheme, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/components/ThemedText';
import { Colors, hexToRgba } from '@/constants/Colors';
import { useEvents } from '@/hooks/useEvents';
import { useEventManagement } from '@/hooks/useEventManagement';
import { EventDetails } from '@/types/EventDetails';

// Helper function to convert Error objects to strings
const getErrorMessage = (error: Error | unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'dark'; // Set dark as default
  const theme = Colors[colorScheme];
  const { eventsQuery } = useEvents({ upcomingOnly: true });
  const { createEventMutation } = useEventManagement();
  
  // Extract data from queries
  const events = eventsQuery.data || [];
  const loading = eventsQuery.isLoading;
  const error = eventsQuery.error;
  const createLoading = createEventMutation.isPending;
  const createError = createEventMutation.error;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    rounds: '3',
    location: '',
    numberOfPlayers: '8',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    playerPack: '',
    eventTypeId: '1'
  });

  const handleCreateEvent = async () => {
    const eventData = {
      title: newEvent.title,
      description: newEvent.description,
      rounds: parseInt(newEvent.rounds),
      location: newEvent.location,
      eventType: {
        id: parseInt(newEvent.eventTypeId),
        name: 'Tournament',
        description: 'Tournament event',
        playersPerTeam: parseInt(newEvent.numberOfPlayers)
      },
      createdByUserId: 'current-user-id', // This should come from auth context
      numberOfPlayers: parseInt(newEvent.numberOfPlayers),
      startDate: newEvent.startDate,
      endDate: newEvent.endDate,
      playerPack: newEvent.playerPack || undefined,
      numberOfRegisteredPlayers: 0,
      numberOfRegisteredTeams: 0
    };
    
    try {
      await createEventMutation.mutateAsync(eventData);
      setModalVisible(false);
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        rounds: '3',
        location: '',
        numberOfPlayers: '8',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        playerPack: '',
        eventTypeId: '1'
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const renderEventItem = ({ item }: { item: EventDetails }) => (
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
      <View style={styles.eventHeader}>
        <ThemedText type="subtitle">{item.title}</ThemedText>
        <View style={styles.eventTypeTag}>
          <ThemedText style={styles.eventTypeText}>{item.eventType.name}</ThemedText>
        </View>
      </View>
      
      {item.description && (
        <ThemedText style={styles.eventDescription}>{item.description}</ThemedText>
      )}
      
      <View style={styles.eventDetails}>
        <ThemedText style={styles.eventDetailText}>📍 {item.location}</ThemedText>
        <ThemedText style={styles.eventDetailText}>
          📅 {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </ThemedText>
        <ThemedText style={styles.eventDetailText}>🎯 {item.rounds} rounds</ThemedText>
        <ThemedText style={styles.eventDetailText}>👥 {item.numberOfRegisteredPlayers} / {item.numberOfPlayers}</ThemedText>
        <ThemedText style={styles.eventDetailText}>🚩 {item.numberOfRegisteredTeams} / {item.numberOfPlayers/item.eventType.playersPerTeam}</ThemedText>
      </View>
      
      {item.winningTeamId && (<View style={styles.eventStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{item.winningTeamName}</ThemedText>
            <ThemedText style={styles.statLabel}>🏆 Winner</ThemedText>
          </View>
      </View> )}
      
      {item.playerPack && (
        <ThemedText style={styles.playerPack}>📦 Player Pack: {item.playerPack}</ThemedText>
      )}
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
        <ThemedText style={styles.errorText}>Error loading events: {getErrorMessage(error)}</ThemedText>
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
              
              <ThemedText>Start Date</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.startDate}
                onChangeText={(text) => setNewEvent({...newEvent, startDate: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
              />
              
              <ThemedText>End Date</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.endDate}
                onChangeText={(text) => setNewEvent({...newEvent, endDate: text})}
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
              
              <ThemedText>Number of Players</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.numberOfPlayers}
                onChangeText={(text) => setNewEvent({...newEvent, numberOfPlayers: text})}
                placeholder="Maximum number of players"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
                keyboardType="numeric"
              />
              
              <ThemedText>Player Pack (Optional)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.playerPack}
                onChangeText={(text) => setNewEvent({...newEvent, playerPack: text})}
                placeholder="Player pack details"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
              />
              
              {createError && (
                <ThemedText style={styles.errorText}>{getErrorMessage(createError)}</ThemedText>
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
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailText: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.9,
  },
  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  playerPack: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
