import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeamInvite } from '@/types/Notifications';
import { hexToRgba } from '@/src/constants/Colors';
import { Link } from 'expo-router';

interface TeamInviteNotificationProps {
  invite: TeamInvite;
  theme: any;
  // eslint-disable-next-line no-unused-vars
  onAccept?: (inviteId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onReject?: (inviteId: string) => void;
}

export function TeamInviteNotification({
  invite,
  theme,
  onAccept,
  onReject,
}: TeamInviteNotificationProps) {

  const acceptButtonRef = useRef<View>(null);

  const handleAcceptPress = () => {
    onAccept?.(invite.id);
  };

  return (
    <View
      style={[
        styles.notificationItem,
        {
          backgroundColor: theme.background,
          borderColor: hexToRgba(theme.tint, 0.2),
        },
      ]}
    >
      <View style={styles.inviteHeader}>
        <View style={styles.senderInfo}>
          <Link href={`/user/${invite.senderId}`} asChild>
            <Pressable>
              <Text style={[styles.senderName, { color: theme.tint }]}>
                {invite.senderName}
              </Text>
            </Pressable>
          </Link>
          <Text style={[styles.inviteText, { color: theme.text }]}>
            invited you to join
          </Text>
        </View>
      </View>

      <View style={styles.teamInfo}>
        {invite.team.logoUrl && (
          <Image
            source={{ uri: invite.team.logoUrl }}
            style={styles.teamLogo}
            resizeMode="cover"
          />
        )}
        <View style={styles.teamDetails}>
          <Text style={[styles.teamName, { color: theme.text }]}>
            {invite.team.name}
          </Text>
          <View style={styles.sportsmanshipBadge}>
            <Text style={[styles.sportsmanshipText, { color: theme.text }]}>
              Sportsmanship: {invite.team.sportsmanshipLvl}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          ref={acceptButtonRef}
          style={[
            styles.button,
            styles.acceptButton,
            { backgroundColor: hexToRgba('#4CAF50', 0.9) },
          ]}
          onPress={handleAcceptPress}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.buttonText}>Accept</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.rejectButton,
            { backgroundColor: hexToRgba('#f44336', 0.9) },
          ]}
          onPress={() => onReject?.(invite.id)}
        >
          <Ionicons name="close" size={18} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  inviteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  senderInfo: {
    flex: 1,
    gap: 4,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  inviteText: {
    fontSize: 13,
    opacity: 0.8,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  teamDetails: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sportsmanshipBadge: {
    alignSelf: 'flex-start',
  },
  sportsmanshipText: {
    fontSize: 12,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    // backgroundColor set dynamically
  },
  rejectButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
