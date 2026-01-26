import { useState } from 'react';
import { View, StyleSheet, useColorScheme, FlatList, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { useEvents } from '@/src/hooks/useEvents';
import { useEventManagement } from '@/src/hooks/useEventManagement';
import { useEventTypes } from '@/src/hooks/useEventTypes';
import { useSeasons } from '@/src/hooks/useSeasons';
import { EventDetails } from '@/types/EventDetails';
import { CreateEventRequest, PairingStrategy } from '@/types/EventAdmin';

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
  const { eventTypes, isLoading: eventTypesLoading } = useEventTypes();
  const { seasonsQuery } = useSeasons();
  const seasons = seasonsQuery.data || [];
  
  // Extract data from queries
  const events = eventsQuery.data || [];
  const loading = eventsQuery.isLoading;
  const error = eventsQuery.error;
  const createLoading = createEventMutation.isPending;
  const createError = createEventMutation.error;
  
  const [modalVisible, setModalVisible] = useState(false);
  const [seasonDropdownVisible, setSeasonDropdownVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    numberOfRounds: '3',
    location: '',
    maxParticipants: '40',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    playerPack: '',
    eventTypeId: 0,
    seasonId: null as number | null,
    hideLists: false,
    pairingStrategy: PairingStrategy.DutchSwiss,
  });

  const handleCreateEvent = async () => {
    const eventData: CreateEventRequest = {
      title: newEvent.title,
      description: newEvent.description || null,
      numberOfRounds: parseInt(newEvent.numberOfRounds),
      location: newEvent.location || null,
      eventTypeId: newEvent.eventTypeId,
      maxParticipants: parseInt(newEvent.maxParticipants) || null,
      hideLists: newEvent.hideLists,
      startDate: new Date(newEvent.startDate).toISOString(),
      endDate: new Date(newEvent.endDate).toISOString(),
      playerPack: newEvent.playerPack || null,
      seasonId: newEvent.seasonId,
      pairingStrategy: newEvent.pairingStrategy,
    };
    
    try {
      await createEventMutation.mutateAsync(eventData);
      setModalVisible(false);
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        numberOfRounds: '3',
        location: '',
        maxParticipants: '40',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        playerPack: '',
        eventTypeId: 0,
        seasonId: null,
        hideLists: false,
        pairingStrategy: PairingStrategy.DutchSwiss,
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
              <ThemedText>Title *</ThemedText>
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

              <ThemedText>Event Type *</ThemedText>
              {eventTypesLoading ? (
                <ActivityIndicator size="small" color={theme.tint} />
              ) : (
                <View style={styles.typeSelector}>
                  {eventTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        { 
                          backgroundColor: newEvent.eventTypeId === type.id ? theme.tint : theme.background,
                        }
                      ]}
                      onPress={() => setNewEvent({...newEvent, eventTypeId: type.id})}
                    >
                      <ThemedText style={{ 
                        color: newEvent.eventTypeId === type.id ? '#fff' : theme.text,
                        fontSize: 12,
                      }}>
                        {type.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <ThemedText>Number of Rounds *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.numberOfRounds}
                onChangeText={(text) => setNewEvent({...newEvent, numberOfRounds: text})}
                placeholder="Number of Rounds"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
                keyboardType="numeric"
              />
              
              <ThemedText>Start Date *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.startDate}
                onChangeText={(text) => setNewEvent({...newEvent, startDate: text})}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
              />
              
              <ThemedText>End Date *</ThemedText>
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
              
              <ThemedText>Max Participants</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.maxParticipants}
                onChangeText={(text) => setNewEvent({...newEvent, maxParticipants: text})}
                placeholder="Maximum number of participants"
                placeholderTextColor={hexToRgba(theme.text, 0.5)}
                keyboardType="numeric"
              />

              <ThemedText>Season (Optional)</ThemedText>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: theme.background }]}
                onPress={() => setSeasonDropdownVisible(true)}
              >
                <ThemedText>
                  {newEvent.seasonId === null 
                    ? 'None' 
                    : seasons.find(s => s.id === newEvent.seasonId)?.name || 'None'}
                </ThemedText>
                <ThemedText style={{ opacity: 0.5 }}>▼</ThemedText>
              </TouchableOpacity>

              <Modal
                animationType="fade"
                transparent={true}
                visible={seasonDropdownVisible}
                onRequestClose={() => setSeasonDropdownVisible(false)}
              >
                <TouchableOpacity
                  style={styles.dropdownOverlay}
                  activeOpacity={1}
                  onPress={() => setSeasonDropdownVisible(false)}
                >
                  <View style={[styles.dropdownModal, { backgroundColor: theme.secondary }]}>
                    <ThemedText type="subtitle" style={styles.dropdownTitle}>Select Season</ThemedText>
                    <FlatList
                      data={[{ id: null, name: 'None' }, ...seasons]}
                      keyExtractor={(item) => item.id?.toString() || 'none'}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            { backgroundColor: newEvent.seasonId === item.id ? hexToRgba(theme.tint, 0.2) : 'transparent' }
                          ]}
                          onPress={() => {
                            setNewEvent({...newEvent, seasonId: item.id});
                            setSeasonDropdownVisible(false);
                          }}
                        >
                          <ThemedText style={{ color: newEvent.seasonId === item.id ? theme.tint : theme.text }}>
                            {item.name}
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>

              <ThemedText>Pairing Strategy *</ThemedText>
              <View style={styles.typeSelector}>
                {[
                  { value: PairingStrategy.DutchSwiss, label: 'Dutch Swiss' },
                  { value: PairingStrategy.RoundRobin, label: 'Round Robin' },
                  { value: PairingStrategy.Manual, label: 'Manual' },
                ].map((strategy) => (
                  <TouchableOpacity
                    key={strategy.value}
                    style={[
                      styles.typeOption,
                      { backgroundColor: newEvent.pairingStrategy === strategy.value ? theme.tint : theme.background }
                    ]}
                    onPress={() => setNewEvent({...newEvent, pairingStrategy: strategy.value})}
                  >
                    <ThemedText style={{ 
                      color: newEvent.pairingStrategy === strategy.value ? '#fff' : theme.text,
                      fontSize: 12,
                    }}>
                      {strategy.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText>Hide Army Lists</ThemedText>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: newEvent.hideLists ? theme.tint : theme.background }
                ]}
                onPress={() => setNewEvent({...newEvent, hideLists: !newEvent.hideLists})}
              >
                <ThemedText style={{ color: newEvent.hideLists ? '#fff' : theme.text }}>
                  {newEvent.hideLists ? 'Yes - Lists Hidden' : 'No - Lists Visible'}
                </ThemedText>
              </TouchableOpacity>
              
              <ThemedText>Player Pack (Optional)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEvent.playerPack}
                onChangeText={(text) => setNewEvent({...newEvent, playerPack: text})}
                placeholder="Player pack URL or details"
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
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 16,
  },
  dropdownTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  dropdownItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
});
