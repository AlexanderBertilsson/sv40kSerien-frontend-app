import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import { useState } from 'react';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { User } from '@/types/User';
import { hexToRgba } from '@/src/constants/Colors';
import { Profile } from '@/types/User';
import { Ionicons } from '@expo/vector-icons';
import SearchUsersModal from '../modals/SearchUsersModal';
import { useTeamInvite } from '@/src/hooks/useTeamInvite';
import { usePendingTeamInvites } from '@/src/hooks/usePendingTeamInvites';
import AlertModal, { AlertButton } from '@/src/components/common/AlertModal';
import Toast, { ToastType } from '@/src/components/common/Toast';

interface TeamMembersPreviewProps {
  members: User[];
  teamId: string;
  authUser: Profile | null;
}

export default function TeamMembersPreview({ members, teamId, authUser }: TeamMembersPreviewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
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
  const { inviteUserAsync, revokeInviteAsync } = useTeamInvite();
  
  // Check if user has required role (admin, captain, or manager)
  const hasManagementRole = authUser?.teamRoles?.some(
    (role) => role.teamId === teamId && ['admin', 'captain', 'manager'].includes(role.role)
  );
  
  const { pendingInvites } = usePendingTeamInvites({
    teamId,
    enabled: !!hasManagementRole,
  });
  const linkStyle = {
    ...styles.memberName,
    ...styles.link,
    color: theme.tint
  };

  const handleUserSelect = async (user: User) => {
    try {
      await inviteUserAsync({ teamId, receiverId: user.id });
      setIsSearchModalVisible(false);
      setToastConfig({
        visible: true,
        message: `Invitation sent to ${user.username}`,
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to invite user:', error);
      setIsSearchModalVisible(false);
      setToastConfig({
        visible: true,
        message: 'Failed to send invitation. Please try again.',
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
              await revokeInviteAsync({ inviteId });
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

  const color = hexToRgba(theme.secondary, 0.5);
  return (
    <>
      
      <View style={[styles.container, { backgroundColor: color }]}>
        
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
        <ThemedText style={styles.title}>Team Members</ThemedText>
           {authUser?.teamRoles?.find((role) => role.teamId === teamId) && (
            <Pressable>
              <ThemedText style={linkStyle}>Manage members</ThemedText>
              <Ionicons name="person-add-outline" size={24} color={theme.tint} />
            </Pressable>
          )}
        </View>
        <View style={styles.membersGrid}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <Link href={`/user/${member.id}`} asChild>
                <Image
                  source={{ uri: member.profilePictureUrl || require('@/assets/images/emoji2.png') }}
                  style={styles.profileImage}
                />
              </Link>
              <View style={styles.memberInfo}>
                <Link href={`/user/${member.id}`} asChild>
                  <Text style={linkStyle}>{member.username}</Text>
                </Link>
                <ThemedText style={styles.memberRole}>{member.sportsmanshipLevel}</ThemedText>
              </View>
            </View>
          ))}
          
          {/* Pending Invites */}
          {hasManagementRole && pendingInvites.map((pendingInvite) => (
            <View key={`pending-${pendingInvite.inviteId}`} style={[styles.memberCard, styles.pendingCard, { opacity: 0.6 }]}>
              <Image
                source={{ uri: pendingInvite.user.profilePictureUrl || require('@/assets/images/emoji2.png') }}
                style={styles.profileImage}
              />
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.text }]}>{pendingInvite.user.username}</Text>
                <View style={styles.pendingStatus}>
                  <Ionicons name="time-outline" size={12} color={theme.text} />
                  <Text style={[styles.pendingText, { color: theme.text }]}>Pending</Text>
                </View>
              </View>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: hexToRgba(theme.text, 0.1) }]}
                onPress={() => handleRevokeInvite(pendingInvite.inviteId, pendingInvite.user.username)}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </Pressable>
            </View>
          ))}
          
          {/* Add Member Placeholder Card */}
          {hasManagementRole && (
            <View style={styles.memberCard}>
              <Pressable 
                style={[styles.addButton, { borderColor: theme.tint }]}
                onPress={() => setIsSearchModalVisible(true)}
              >
                <Ionicons name="add" size={24} color={theme.tint} />
              </Pressable>
              <View style={styles.memberInfo}>
                <Text style={[styles.addText, { color: theme.tint }]}>Add Member</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      
      {/* Search Users Modal */}
      <SearchUsersModal
        visible={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
        onUserSelect={handleUserSelect}
        title="Add Team Member"
      />
      
      {/* Alert Modal */}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertConfig({ visible: false, title: '', message: '', buttons: [] })}
      />
      
      {/* Toast Notification */}
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
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  memberRole: {
    fontSize: 12,
    opacity: 0.7,
  },
  link: {
    fontWeight: 'bold'
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
  pendingCard: {
    backgroundColor: 'transparent',
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
});
