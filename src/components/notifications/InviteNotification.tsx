import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hexToRgba } from '@/src/constants/Colors';
import { Link } from 'expo-router';

interface InviteNotificationProps {
  inviteId: string;
  senderName: string;
  senderId: string;
  /** e.g. "invited you to join" */
  inviteMessage: string;
  /** Primary entity name (team name or event name) */
  targetName: string;
  /** Link destination for the primary entity */
  targetHref?: string;
  /** Optional logo/image URL */
  logoUrl?: string;
  /** Optional subtitle line below the target name */
  subtitle?: string;
  theme: any;
  onAccept?: (inviteId: string) => void;
  onReject?: (inviteId: string) => void;
}

export function InviteNotification({
  inviteId,
  senderName,
  senderId,
  inviteMessage,
  targetName,
  targetHref,
  logoUrl,
  subtitle,
  theme,
  onAccept,
  onReject,
}: InviteNotificationProps) {
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
          <Link href={`/user/${senderId}`} asChild>
            <Pressable>
              <Text style={[styles.senderName, { color: theme.tint }]}>
                {senderName}
              </Text>
            </Pressable>
          </Link>
          <Text style={[styles.inviteText, { color: theme.text }]}>
            {inviteMessage}
          </Text>
        </View>
      </View>

      <View style={styles.targetInfo}>
        {logoUrl && (
          <Image
            source={{ uri: logoUrl }}
            style={styles.targetLogo}
            resizeMode="cover"
          />
        )}
        <View style={styles.targetDetails}>
          {targetHref ? (
            <Link href={targetHref as any} asChild>
              <Pressable>
                <Text style={[styles.targetName, { color: theme.tint }]}>
                  {targetName}
                </Text>
              </Pressable>
            </Link>
          ) : (
            <Text style={[styles.targetName, { color: theme.text }]}>
              {targetName}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitleText, { color: theme.text }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          style={[
            styles.button,
            { backgroundColor: hexToRgba('#4CAF50', 0.9) },
          ]}
          onPress={() => onAccept?.(inviteId)}
        >
          <Ionicons name="checkmark" size={18} color="#fff" />
          <Text style={styles.buttonText}>Accept</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            { backgroundColor: hexToRgba('#f44336', 0.9) },
          ]}
          onPress={() => onReject?.(inviteId)}
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
  targetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  targetLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  targetDetails: {
    flex: 1,
    gap: 4,
  },
  targetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitleText: {
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
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
