import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { hexToRgba } from '@/src/constants/Colors';
import { UpdateEventRequest, PairingStrategy, EventType } from '@/types/EventAdmin';
import { Season } from '@/types/Season';
import { useEventTypes } from '@/src/hooks/useEventTypes';
import { useSeasons } from '@/src/hooks/useSeasons';
import EditRoundConfigView from './EditRoundConfigView';

type ModalView = 'event' | 'rounds';

interface EditEventModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  editedEvent: UpdateEventRequest;
  setEditedEvent: React.Dispatch<React.SetStateAction<UpdateEventRequest>>;
  theme: any;
  loading: boolean;
  error: string | null;
  eventId?: string;
  numberOfRounds?: number;
  playersPerTeam?: number;
}

const EditEventModal = ({
  visible,
  onClose,
  onUpdate,
  editedEvent,
  setEditedEvent,
  theme,
  loading,
  error,
  eventId,
  numberOfRounds,
  playersPerTeam,
}: EditEventModalProps) => {
  const { eventTypes, isLoading: eventTypesLoading } = useEventTypes();
  const { seasonsQuery } = useSeasons();
  const seasons = seasonsQuery.data || [];
  const [seasonDropdownVisible, setSeasonDropdownVisible] = useState(false);
  const [activeView, setActiveView] = useState<ModalView>('event');

  const canShowRoundConfig = !!eventId && !!numberOfRounds && numberOfRounds > 0 && !!playersPerTeam;

  const getSelectedSeasonName = () => {
    if (editedEvent.seasonId === null || editedEvent.seasonId === undefined) return 'None';
    const season = seasons.find((s: Season) => s.id === editedEvent.seasonId);
    return season?.name || 'None';
  };

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

          {/* View Toggle */}
          {canShowRoundConfig && (
            <View style={[styles.viewToggle, { backgroundColor: theme.background }]}>
              <TouchableOpacity
                style={[
                  styles.toggleTab,
                  activeView === 'event' && { backgroundColor: theme.tint },
                ]}
                onPress={() => setActiveView('event')}
              >
                <ThemedText
                  style={{
                    color: activeView === 'event' ? '#fff' : theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Event Settings
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleTab,
                  activeView === 'rounds' && { backgroundColor: theme.tint },
                ]}
                onPress={() => setActiveView('rounds')}
              >
                <ThemedText
                  style={{
                    color: activeView === 'rounds' ? '#fff' : theme.text,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Round Config
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {activeView === 'event' ? (
            <>
              <ScrollView style={styles.formContainer}>
                <ThemedText>Title</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.title || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, title: text})}
                  placeholder="Event Title"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                />

                <ThemedText>Description</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.description || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, description: text})}
                  placeholder="Event Description"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                  multiline
                  numberOfLines={4}
                />

                <ThemedText>Event Type</ThemedText>
                {eventTypesLoading ? (
                  <ActivityIndicator size="small" color={theme.tint} />
                ) : (
                  <View style={styles.typeSelector}>
                    {eventTypes.map((type: EventType) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.typeOption,
                          { backgroundColor: editedEvent.eventTypeId === type.id ? theme.tint : theme.background }
                        ]}
                        onPress={() => setEditedEvent({...editedEvent, eventTypeId: type.id})}
                      >
                        <ThemedText style={{
                          color: editedEvent.eventTypeId === type.id ? '#fff' : theme.text,
                          fontSize: 12,
                        }}>
                          {type.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <ThemedText>Number of Rounds</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.numberOfRounds?.toString() || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, numberOfRounds: parseInt(text) || null})}
                  placeholder="Number of Rounds"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                  keyboardType="numeric"
                />

                <ThemedText>Start Date</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.startDate ? editedEvent.startDate.split('T')[0] : ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, startDate: text ? new Date(text).toISOString() : null})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                />

                <ThemedText>End Date</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.endDate ? editedEvent.endDate.split('T')[0] : ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, endDate: text ? new Date(text).toISOString() : null})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                />

                <ThemedText>Location</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.location || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, location: text})}
                  placeholder="Event Location"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                />

                <ThemedText>Max Participants</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.maxParticipants?.toString() || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, maxParticipants: parseInt(text) || null})}
                  placeholder="Maximum number of participants"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                  keyboardType="numeric"
                />

                <ThemedText>Season</ThemedText>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.background }]}
                  onPress={() => setSeasonDropdownVisible(true)}
                >
                  <ThemedText>{getSelectedSeasonName()}</ThemedText>
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
                              { backgroundColor: editedEvent.seasonId === item.id ? hexToRgba(theme.tint, 0.2) : 'transparent' }
                            ]}
                            onPress={() => {
                              setEditedEvent({...editedEvent, seasonId: item.id});
                              setSeasonDropdownVisible(false);
                            }}
                          >
                            <ThemedText style={{ color: editedEvent.seasonId === item.id ? theme.tint : theme.text }}>
                              {item.name}
                            </ThemedText>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </TouchableOpacity>
                </Modal>

                <ThemedText>Pairing Strategy</ThemedText>
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
                        { backgroundColor: editedEvent.pairingStrategy === strategy.value ? theme.tint : theme.background }
                      ]}
                      onPress={() => setEditedEvent({...editedEvent, pairingStrategy: strategy.value})}
                    >
                      <ThemedText style={{
                        color: editedEvent.pairingStrategy === strategy.value ? '#fff' : theme.text,
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
                    { backgroundColor: editedEvent.hideLists ? theme.tint : theme.background }
                  ]}
                  onPress={() => setEditedEvent({...editedEvent, hideLists: !editedEvent.hideLists})}
                >
                  <ThemedText style={{ color: editedEvent.hideLists ? '#fff' : theme.text }}>
                    {editedEvent.hideLists ? 'Yes - Lists Hidden' : 'No - Lists Visible'}
                  </ThemedText>
                </TouchableOpacity>

                <ThemedText>Player Pack</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                  value={editedEvent.playerPack || ''}
                  onChangeText={(text) => setEditedEvent({...editedEvent, playerPack: text})}
                  placeholder="Player pack URL or details"
                  placeholderTextColor={hexToRgba(theme.text, 0.5)}
                />

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
            </>
          ) : (
            <>
              <EditRoundConfigView
                eventId={eventId!}
                numberOfRounds={numberOfRounds!}
                playersPerTeam={playersPerTeam!}
                theme={theme}
              />
              <View style={[styles.modalButtons, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint, width: '100%' }]}
                  onPress={onClose}
                >
                  <ThemedText style={{ color: theme.tint }}>Close</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    marginTop: 12,
    width: '100%',
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
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

export default EditEventModal;
