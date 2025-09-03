// import React, { useState } from 'react';
// import { View, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
// import ThemedText from '@/components/ThemedText';
// import { useTeam } from '@/hooks/useTeam';
// import { SelectedPlayer } from '@/types/EventTeam';

// interface JoinTeamEventModalProps {
//   visible: boolean;
//   onClose: () => void;
//   // eslint-disable-next-line no-unused-vars
//   onJoin: (playerIds: SelectedPlayer[]) => void;
//   eventType: '8man' | '5man';
//   theme: any;
//   loading: boolean;
//   error: string | null;
//   teamId: string;
// }


// const JoinTeamEventModal = ({
//   visible,
//   onClose,
//   onJoin,
//   eventType,
//   theme,
//   loading,
//   error,
//   teamId
// }: JoinTeamEventModalProps) => {
//   const { playersQuery: { data: players } } = useTeam(teamId);
//   const [selectedPlayers, setSelectedPlayers] = useState<SelectedPlayer[]>([]);
//   const [selectEventRoleVisible, setSelectEventRoleVisible] = useState(false);
//   const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

//   const getPlayerCount = () => selectedPlayers.filter(player => player.role === 'player').length;
//   const getCoachCount = () => selectedPlayers.filter(player => player.role === 'coach').length;
//   const getCoachLimit = () => eventType === '5man' ? 2 : 3;
//   const getRequiredPlayers = () => eventType === '5man' ? 5 : 8;
//   const isFullTeam = () => getPlayerCount() === getRequiredPlayers() && getCoachCount() === getCoachLimit();

//   const togglePlayerSelection = (playerId: string, role?: 'player' | 'coach') => {
//     if (selectedPlayers.some(player => player.playerId === playerId)) {
//       setSelectedPlayers(selectedPlayers.filter(player => player.playerId !== playerId));
//     } else {

//       if (getPlayerCount() < getRequiredPlayers()) {
//         setSelectedPlayers([...selectedPlayers, { playerId, role: role || 'player' }]);
//       }
//       else if (getCoachCount() < getCoachLimit()) {
//         setSelectedPlayers([...selectedPlayers, { playerId, role: 'coach' }]);
//       }
//     }
//   };

//   const canSubmit = () => getPlayerCount() === getRequiredPlayers();

//   const handleSubmit = () => {
//     if (canSubmit()) {
//       onJoin(selectedPlayers);
//     }
//   };

//   return (
//     <>
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={visible}
//         onRequestClose={onClose}
//       >
//         <View style={styles.centeredView}>
//           <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
//             <ThemedText type="title">Join Team Event</ThemedText>
//             <View style={styles.formContainer}>
//               <ThemedText type="subtitle">
//                 Select {getRequiredPlayers()} players for this {eventType} event
//               </ThemedText>
//               {getPlayerCount() < getRequiredPlayers() && (
//                 <ThemedText style={styles.errorText}>
//                   Warning: Your team only has {getPlayerCount()} players. You need {getRequiredPlayers()} players for this event.
//                 </ThemedText>
//               )}
//               <ScrollView style={styles.scrollView}>
//                 {players?.map((player) => (
//                   <TouchableOpacity
//                     key={player.id}
//                     style={[
//                       styles.playerItem,
//                       {
//                         backgroundColor: selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id) ? theme.tint : theme.background,
//                       },
//                       (isFullTeam() && !selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id)) && styles.buttonDisabled
//                     ]}
//                     onPress={selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id) ? () => togglePlayerSelection(player.id) : () => {
//                       setCurrentPlayerId(player.id)
//                       setSelectEventRoleVisible(true)
//                     }}
//                     disabled={loading || (isFullTeam() && !selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id))}
//                   >
//                     <ThemedText style={{
//                       color: selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id) ? '#fff' : theme.text,
//                     }}>
//                       {player.username} {selectedPlayers.some(selectedPlayer => selectedPlayer.playerId === player.id) ? `(${selectedPlayers.find(selectedPlayer => selectedPlayer.playerId === player.id)?.role})` : ''}
//                     </ThemedText>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//               {error && (
//                 <ThemedText style={styles.errorText}>{error}</ThemedText>
//               )}
//             </View>
//             <View style={styles.modalButtons}>
//               <TouchableOpacity
//                 style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
//                 onPress={onClose}
//               >
//                 <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.modalButton, 
//                   styles.buttonCreate, 
//                   { backgroundColor: theme.tint },
//                   (!canSubmit()) && styles.buttonDisabled
//                 ]}
//                 onPress={handleSubmit}
//                 disabled={loading || !canSubmit()}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <ThemedText style={{ color: '#fff' }}>Join</ThemedText>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={selectEventRoleVisible}
//         onRequestClose={() => setSelectEventRoleVisible(false)}
//       >
//         <View style={styles.centeredView}>
//           <View style={[styles.modalView, { backgroundColor: theme.secondary }]}>
//             <ThemedText type="title">Select Event Role</ThemedText>
//             <View style={styles.roleModalButtons}>
//               {currentPlayerId && (
//                 <>
//                   <TouchableOpacity
//                     style={[
//                       styles.modalButton, 
//                       styles.buttonCreate, 
//                       { backgroundColor: theme.tint },
//                       (getRequiredPlayers() === getPlayerCount()) && styles.buttonDisabled
//                     ]}
//                     onPress={() => {
//                       togglePlayerSelection(currentPlayerId, 'player')
//                       setCurrentPlayerId(null)
//                       setSelectEventRoleVisible(false)

//                     }}
//                     disabled={loading || getRequiredPlayers() === getPlayerCount()}
//                   >
//                     {loading ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <ThemedText style={{ color: '#fff' }}>Player</ThemedText>
//                     )}
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[
//                       styles.modalButton, 
//                       styles.buttonCreate, 
//                       { backgroundColor: theme.tint },
//                       (getCoachLimit() === getCoachCount()) && styles.buttonDisabled
//                     ]}
//                     onPress={() => {
//                       togglePlayerSelection(currentPlayerId, 'coach')
//                       setCurrentPlayerId(null)
//                       setSelectEventRoleVisible(false)
//                     }}
//                     disabled={loading || getCoachLimit() === getCoachCount()}
//                   >
//                     {loading ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <ThemedText style={{ color: '#fff' }}>Coach</ThemedText>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               )}

//               <TouchableOpacity
//                 style={[styles.modalButton, styles.buttonCancel, { borderColor: theme.tint }]}
//                 onPress={() => setSelectEventRoleVisible(false)}
//               >
//                 <ThemedText style={{ color: theme.tint }}>Cancel</ThemedText>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </>
//   );


// };

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalView: {
//     width: '90%',
//     maxHeight: '80%',
//     borderRadius: 16,
//     padding: 20,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   formContainer: {
//     width: '100%',
//     marginVertical: 16,
//   },
//   scrollView: {
//     width: '100%',
//     maxHeight: 300,
//     marginVertical: 10,
//   },
//   playerItem: {
//     padding: 12,
//     borderRadius: 8,
//     marginVertical: 4,
//     width: '100%',
//   },
//   errorText: {
//     color: '#ff6b6b',
//     marginTop: 8,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: '100%',
//     marginTop: 16,
//   },
//   roleModalButtons: {
//     flexDirection: 'column',
//     justifyContent: 'space-evenly',
//     width: '100%',
//     marginTop: 16,
//     gap: 12,
//   },
//   modalButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     minWidth: '45%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   buttonCancel: {
//     borderWidth: 1,
//     backgroundColor: 'transparent',
//   },
//   buttonCreate: {
//     borderWidth: 0,
//   },
//   buttonDisabled: {
//     opacity: 0.5,
//     backgroundColor: '#999',
//   },
// });

// export default JoinTeamEventModal;
