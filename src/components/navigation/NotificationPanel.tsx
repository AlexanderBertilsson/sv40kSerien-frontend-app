import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, TeamInvite } from '@/types/Notifications';
import { hexToRgba } from '@/src/constants/Colors';
import { TeamInviteNotification } from '@/src/components/notifications/TeamInviteNotification';
import { useTeamInvite } from '@/src/hooks/useTeamInvite';
import { useNotifications } from '@/src/hooks/useNotifications';

interface NotificationPanelProps {
  theme: any;
  isExpanded?: boolean;
  // eslint-disable-next-line no-unused-vars
  onExpandedChange?: (expanded: boolean) => void;
}

export function NotificationPanel({
  theme,
  isExpanded: externalIsExpanded,
  onExpandedChange,
}: NotificationPanelProps) {
    const { notificationsQuery } = useNotifications();
  const { acceptInvite, rejectInvite } = useTeamInvite();
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  
  const toggleExpanded = (value: boolean) => {
    if (externalIsExpanded !== undefined) {
      onExpandedChange?.(value);
    } else {
      setInternalIsExpanded(value);
    }
  };
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [renderNotifications, setRenderNotifications] = useState<Notification[]>([]);

  const unreadCount = notificationsQuery.data?.length || 0;

  const handleAcceptTeamInvite = (inviteId: string) => {
    acceptInvite({ inviteId });
  };

  const handleRejectTeamInvite = (inviteId: string) => {
    rejectInvite({ inviteId });
  };

  useEffect(() => {
    // Update even if data is undefined/empty (204 response)
    if(notificationsQuery.data !== undefined){
        console.log('Notifications updated:', notificationsQuery.data)
      setRenderNotifications(notificationsQuery.data || []);
    }
  }, [notificationsQuery.data]);
  useEffect(() => {
    if (isExpanded) {
      // Slide down and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide up and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isExpanded, slideAnim, opacityAnim]);

  const renderNotification = (notification: Notification, index: number) => {
    switch (notification.notificationType) {
      case 'team_invite': {
        const teamInvite = notification.payload as TeamInvite;
        return (
          <TeamInviteNotification
            key={`team-invite-${index}`}
            invite={teamInvite}
            theme={theme}
            onAccept={handleAcceptTeamInvite}
            onReject={handleRejectTeamInvite}
          />
        );
      }
      case 'tournament_invite':
        // Placeholder for future implementation
        return null;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.iconButton,
          { backgroundColor: hexToRgba(theme.tint, 0.1) },
        ]}
        onPress={() => toggleExpanded(!isExpanded)}
      >
        <Ionicons name="mail-outline" size={24} color={theme.tint} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: '#f44336' }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </Pressable>

      {isExpanded && (
        <Animated.View
          style={[
            styles.notificationList,
            {
              backgroundColor: theme.secondary,
              borderColor: hexToRgba(theme.tint, 0.2),
              opacity: opacityAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
                {
                  scale: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.text }]}>
              Notifications
            </Text>
            <Pressable onPress={() => toggleExpanded(false)}>
              <Ionicons name="close" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {notificationsQuery.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.tint} />
              </View>
            ) : renderNotifications && renderNotifications.length > 0 ? (
              renderNotifications.map((notification, index) =>
                renderNotification(notification, index)
              )
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={48} color={hexToRgba(theme.text, 0.3)} />
                <Text style={[styles.emptyText, { color: hexToRgba(theme.text, 0.5) }]}>
                  No notifications
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10001,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  notificationList: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: 320,
    maxHeight: 500,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10001,
    zIndex: 10001,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 450,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
  },
});
