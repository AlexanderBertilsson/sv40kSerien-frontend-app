import { Modal, Pressable, ScrollView, StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import ThemedText from '../ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTeam } from '../../hooks/useTeam';
import { UserRow } from '../UserRow';
import { useState } from 'react';
import { useEventRegistration, EventRegistrationBody } from '../../hooks/useEventRegistration';

interface JoinEventModalProps {
  visible: boolean;
  onClose: () => void;
  eventData: {
    eventId: string;
    title: string;
    type: string;
    playersPerTeam: number;
  };
  teamId: string;
}

export function JoinEventModal({ visible, onClose, eventData, teamId }: JoinEventModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const { teamQuery } = useTeam(teamId);
  const { eventRegistrationMutation } = useEventRegistration(eventData.eventId);
  const theme = Colors[colorScheme];

  // State for selected users and their roles
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userRoles, setUserRoles] = useState<Record<string, 'player' | 'coach'>>({});
  const [captain, setCaptain] = useState<{name: string, id: string} | null>(null);

  const handleUserSelection = (userId: string, selected: boolean) => {
    const newSelectedUsers = new Set(selectedUsers);
    
    if (selected) {
      newSelectedUsers.add(userId);
      // Default to player role when selected
      setUserRoles(prev => ({ ...prev, [userId]: 'player' }));
    } else {
      newSelectedUsers.delete(userId);
      // Remove role and captain status when deselected
      setUserRoles(prev => {
        const newRoles = { ...prev };
        delete newRoles[userId];
        return newRoles;
      });
      if (captain?.id === userId) {
        setCaptain(null);
      }
    }
    
    setSelectedUsers(newSelectedUsers);
  };

  const setUserRole = (userId: string, role: 'player' | 'coach') => {
    setUserRoles(prev => ({ ...prev, [userId]: role }));
    // If setting as coach and they were captain, remove captain status
    if (role === 'coach' && captain?.id === userId) {
      setCaptain(null);
    }
  };

  const handleSetCaptain = (userId: string) => {
    // Only players can be captain
    if (userRoles[userId] === 'player') {
      setCaptain(captain?.id === userId ? null : {name: teamQuery.data?.users.find(u => u.id === userId)?.username || '', id: userId});
    }
  };

  const getPlayerCount = () => {
    return Object.values(userRoles).filter(role => role === 'player').length;
  };

  const getCoachCount = () => {
    return Object.values(userRoles).filter(role => role === 'coach').length;
  };

  const handleJoinEvent = async () => {
    if (!captain) {
      alert('Please select a captain before joining the event.');
      return;
    }

    if (getPlayerCount() === 0) {
      alert('Please select at least one player.');
      return;
    }

    if (getPlayerCount() > eventData.playersPerTeam) {
      alert(`Too many players selected. Maximum allowed: ${eventData.playersPerTeam}`);
      return;
    }

    const playerIds = Object.entries(userRoles)
      .filter(([, role]) => role === 'player')
      .map(([userId]) => userId);
    
    const coachIds = Object.entries(userRoles)
      .filter(([, role]) => role === 'coach')
      .map(([userId]) => userId);

    const registrationData: EventRegistrationBody = {
      teamId,
      captainId: captain.id,
      playerIds,
      coachIds,
    };

    try {
      await eventRegistrationMutation.mutateAsync(registrationData);
      alert('Successfully registered for the event!');
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register for the event. Please try again.');
    }
  };

  const canJoinEvent = () => {
    return selectedUsers.size > 0 && 
           captain !== null && 
           getPlayerCount() > 0 && 
           getPlayerCount() <= eventData.playersPerTeam;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable 
        style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Register for {eventData.title}</ThemedText>
            <Pressable 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <ThemedText style={styles.modalText}>{teamQuery.data?.name || 'No team available'}</ThemedText>
              
              {/* Team Composition Summary */}
              {selectedUsers.size > 0 && (
                <View style={[styles.summaryCard, { backgroundColor: theme.secondary, borderColor: theme.tint }]}>
                  <ThemedText style={[styles.summaryTitle, { color: theme.text }]}>Team Selection</ThemedText>
                  <ThemedText style={[styles.summaryText, { color: theme.text }]}>
                    Players: {getPlayerCount()}/{eventData.playersPerTeam} • Coaches: {getCoachCount()} • Captain: {captain ? teamQuery.data?.users.find(u => u.id === captain.id)?.username : 'None'}
                  </ThemedText>
                </View>
              )}

              {teamQuery.data?.users.map(user => (
                <View key={user.id}>
                  <UserRow 
                    user={user} 
                    theme={theme} 
                    selectable
                    onSelectionChange={handleUserSelection}
                  />
                  
                  {/* Role Selection - shown when user is selected */}
                  {selectedUsers.has(user.id) && (
                    <View style={[styles.roleSelection, { backgroundColor: theme.background, borderColor: theme.tint }]}>
                      <View style={styles.roleButtons}>
                        <TouchableOpacity 
                          style={[
                            styles.roleButton, 
                            { borderColor: theme.tint },
                            userRoles[user.id] === 'player' && { backgroundColor: theme.tint }
                          ]}
                          onPress={() => setUserRole(user.id, 'player')}
                        >
                          <ThemedText style={[
                            styles.roleButtonText,
                            { color: userRoles[user.id] === 'player' ? '#fff' : theme.text }
                          ]}>Player</ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[
                            styles.roleButton, 
                            { borderColor: theme.tint },
                            userRoles[user.id] === 'coach' && { backgroundColor: theme.tint }
                          ]}
                          onPress={() => setUserRole(user.id, 'coach')}
                        >
                          <ThemedText style={[
                            styles.roleButtonText,
                            { color: userRoles[user.id] === 'coach' ? '#fff' : theme.text }
                          ]}>Coach</ThemedText>
                        </TouchableOpacity>
                      </View>
                      
                      {/* Captain Button - only for players */}
                      {userRoles[user.id] === 'player' && (
                        <TouchableOpacity 
                          style={[
                            styles.captainButton, 
                            { borderColor: theme.tint },
                            captain?.id === user.id && { backgroundColor: theme.tint }
                          ]}
                          onPress={() => handleSetCaptain(user.id)}
                        >
                          <MaterialCommunityIcons 
                            name={captain?.id === user.id ? "star" : "star-outline"} 
                            size={16} 
                            color={captain?.id === user.id ? '#fff' : theme.text} 
                          />
                          <ThemedText style={[
                            styles.captainButtonText,
                            { color: captain?.id === user.id ? '#fff' : theme.text }
                          ]}>Captain</ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
            
            {/* Join Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[
                  styles.joinButton,
                  { 
                    backgroundColor: canJoinEvent() ? theme.tint : theme.text + '40',
                    opacity: eventRegistrationMutation.isPending ? 0.7 : 1
                  }
                ]}
                onPress={handleJoinEvent}
                disabled={!canJoinEvent() || eventRegistrationMutation.isPending}
              >
                <ThemedText style={[
                  styles.joinButtonText,
                  { color: canJoinEvent() ? '#fff' : theme.text }
                ]}>
                  {eventRegistrationMutation.isPending ? 'Joining...' : 'Join Event'}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
    maxWidth: 600,
    maxHeight: '80%',
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
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    marginBottom: 16,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    opacity: 0.8,
  },
  roleSelection: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  captainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  captainButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  joinButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});