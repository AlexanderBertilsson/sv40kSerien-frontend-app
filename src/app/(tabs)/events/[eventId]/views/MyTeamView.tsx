import { useState } from 'react';
import { View, StyleSheet, useColorScheme, Image, Pressable, Text, ActivityIndicator } from 'react-native';
import { isAxiosError } from 'axios';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useEventContext } from '@/src/contexts/EventContext';
import { useTeamRegistrations } from '@/src/hooks/useTeamRegistrations';
import { useEventTeamInvite } from '@/src/hooks/useEventTeamInvite';
import { EventRegistrationMemberDto } from '@/types/EventAdmin';
import SearchUsersModal from '@/src/components/modals/SearchUsersModal';
import AlertModal, { AlertButton } from '@/src/components/common/AlertModal';
import Toast, { ToastType } from '@/src/components/common/Toast';
import { User } from '@/types/User';

interface MyTeamViewProps {
  eventId: string;
  maxPlayers?: number;
}

export default function MyTeamView({ eventId, maxPlayers }: MyTeamViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const { eventTeamId, isCaptain, isEventAdmin } = useEventContext();
  const { teamRegistrationsQuery } = useTeamRegistrations(eventId, eventTeamId);
  const members = teamRegistrationsQuery.data?.members ?? [];

  const players = members.filter((m) => m.eventRole?.toLowerCase() === 'player');
  const coaches = members.filter((m) => m.eventRole?.toLowerCase() !== 'player');

  const canManage = isCaptain || isEventAdmin;
  const canInvitePlayers = canManage && (!maxPlayers || players.length < maxPlayers);
  const canInviteCoaches = canManage && coaches.length < 2;

  const {
    inviteUserAsync,
    revokeInviteAsync,
    pendingInvites,
  } = useEventTeamInvite(eventId, eventTeamId);

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [inviteRole, setInviteRole] = useState<'player' | 'coach'>('player');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({ visible: false, title: '', message: '', buttons: [] });
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: '', type: 'info' });

  const openInviteModal = (role: 'player' | 'coach') => {
    setInviteRole(role);
    setSearchModalVisible(true);
  };

  const handleUserSelect = async (user: User) => {
    try {
      await inviteUserAsync({ userId: user.id, eventRole: inviteRole });
      setSearchModalVisible(false);
      setToastConfig({
        visible: true,
        message: `Invitation sent to ${user.username}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to invite user:', error);
      setSearchModalVisible(false);
      const message = isAxiosError(error) && error.response?.status === 400 && error.response?.data
        ? String(error.response.data)
        : 'Failed to send invitation. Please try again.';
      setToastConfig({
        visible: true,
        message,
        type: 'error',
      });
    }
  };

  const handleRevokeInvite = (inviteId: string, username: string) => {
    setAlertConfig({
      visible: true,
      title: 'Revoke Invitation',
      message: `Are you sure you want to revoke the invitation for ${username}?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              await revokeInviteAsync(inviteId);
              setToastConfig({
                visible: true,
                message: 'Invitation revoked',
                type: 'success',
              });
            } catch (error) {
              console.error('Failed to revoke invite:', error);
              setToastConfig({
                visible: true,
                message: 'Failed to revoke invitation. Please try again.',
                type: 'error',
              });
            }
          },
        },
      ],
    });
  };

  if (!eventTeamId) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={{ opacity: 0.6 }}>
          You are not registered for this event.
        </ThemedText>
      </View>
    );
  }

  if (teamRegistrationsQuery.isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  const linkStyle = { fontSize: 14, fontWeight: 'bold' as const, color: theme.tint };

  const renderMember = (member: EventRegistrationMemberDto) => (
    <View key={member.userId} style={styles.memberCard}>
      <Link href={`/user/${member.userId}`} asChild>
        <Pressable>
          <Image
            source={
              member.profilePictureUrl
                ? { uri: member.profilePictureUrl }
                : require('@/assets/images/emoji2.png')
            }
            style={styles.profileImage}
          />
        </Pressable>
      </Link>
      <View style={styles.memberInfo}>
        <Link href={`/user/${member.userId}`} asChild>
          <Text style={linkStyle}>{member.username}</Text>
        </Link>
        <View style={styles.roleRow}>
          {member.isCaptain && (
            <View style={[styles.badge, { backgroundColor: hexToRgba(theme.tint, 0.2) }]}>
              <ThemedText style={{ fontSize: 10, color: theme.tint }}>Captain</ThemedText>
            </View>
          )}
          {member.isAdmin && (
            <View style={[styles.badge, { backgroundColor: hexToRgba('#FF9800', 0.2) }]}>
              <ThemedText style={{ fontSize: 10, color: '#FF9800' }}>Admin</ThemedText>
            </View>
          )}
          {member.armyList && (
            <ThemedText style={styles.factionText}>
              {member.armyList.factionName}
            </ThemedText>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <>
      {/* Players Card */}
      <View style={[styles.card, { backgroundColor: hexToRgba(theme.secondary, 0.5) }]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Players</ThemedText>
          {canInvitePlayers && (
            <Pressable onPress={() => openInviteModal('player')} style={styles.inviteButton}>
              <Ionicons name="person-add-outline" size={20} color={theme.tint} />
              <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 13 }}>Invite</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.membersGrid}>
          {players.map(renderMember)}

          {/* Pending Invites */}
          {canManage && pendingInvites.map((invite) => (
            <View key={`pending-${invite.inviteId}`} style={[styles.memberCard, { opacity: 0.6 }]}>
              <Image
                source={
                  invite.user.profilePictureUrl
                    ? { uri: invite.user.profilePictureUrl }
                    : require('@/assets/images/emoji2.png')
                }
                style={styles.profileImage}
              />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {invite.user.username}
                </Text>
                <View style={styles.pendingStatus}>
                  <Ionicons name="time-outline" size={12} color={theme.text} />
                  <Text style={[styles.pendingText, { color: theme.text }]}>Pending</Text>
                </View>
              </View>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: hexToRgba(theme.text, 0.1) }]}
                onPress={() => handleRevokeInvite(invite.inviteId, invite.user.username)}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>
          ))}

          {/* Add Player Card */}
          {canInvitePlayers && (
            <View style={styles.memberCard}>
              <Pressable
                style={[styles.addButton, { borderColor: theme.tint }]}
                onPress={() => openInviteModal('player')}
              >
                <Ionicons name="add" size={24} color={theme.tint} />
              </Pressable>
              <View style={styles.memberInfo}>
                <Text style={[styles.addText, { color: theme.tint }]}>Add Player</Text>
              </View>
            </View>
          )}

          {players.length === 0 && !canManage && (
            <ThemedText style={{ opacity: 0.5, padding: 8 }}>No players yet</ThemedText>
          )}
        </View>
      </View>

      {/* Coaches Card */}
      {(coaches.length > 0 || canManage) && (
        <View style={[styles.card, { backgroundColor: hexToRgba(theme.secondary, 0.5) }]}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>Coaches</ThemedText>
            {canInviteCoaches && (
              <Pressable onPress={() => openInviteModal('coach')} style={styles.inviteButton}>
                <Ionicons name="person-add-outline" size={20} color={theme.tint} />
                <Text style={{ color: theme.tint, fontWeight: '600', fontSize: 13 }}>Invite</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.membersGrid}>
            {coaches.map(renderMember)}

            {/* Add Coach Card */}
            {canInviteCoaches && (
              <View style={styles.memberCard}>
                <Pressable
                  style={[styles.addButton, { borderColor: theme.tint }]}
                  onPress={() => openInviteModal('coach')}
                >
                  <Ionicons name="add" size={24} color={theme.tint} />
                </Pressable>
                <View style={styles.memberInfo}>
                  <Text style={[styles.addText, { color: theme.tint }]}>Add Coach</Text>
                </View>
              </View>
            )}

            {coaches.length === 0 && !canManage && (
              <ThemedText style={{ opacity: 0.5, padding: 8 }}>No coaches</ThemedText>
            )}
          </View>
        </View>
      )}

      <SearchUsersModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onUserSelect={handleUserSelect}
        title={`Invite ${inviteRole === 'player' ? 'Player' : 'Coach'}`}
      />

      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '', buttons: [] })}
      />

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        position="bottom-left"
        onHide={() => setToastConfig({ visible: false, message: '', type: 'info' })}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    padding: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  factionText: {
    fontSize: 11,
    opacity: 0.7,
  },
  pendingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cancelButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
