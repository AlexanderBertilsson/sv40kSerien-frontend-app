import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { Notification, TeamInvite, TournamentInvite } from '@/types/Notifications';
import { hexToRgba } from '@/src/constants/Colors';
import { InviteNotification } from '@/src/components/notifications/InviteNotification';
import Toast, { ToastType } from '@/src/components/common/Toast';
import { useTeamInvite } from '@/src/hooks/useTeamInvite';
import { useEventInviteResponse } from '@/src/hooks/useEventInviteResponse';
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
  const { acceptInviteAsync: acceptTeamInviteAsync, rejectInvite: rejectTeamInvite } = useTeamInvite();
  const { acceptInviteAsync: acceptEventInviteAsync, rejectInvite: rejectEventInvite } = useEventInviteResponse();
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: '', type: 'info' });
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

  const handleAcceptTeamInvite = async (inviteId: string) => {
    try {
      await acceptTeamInviteAsync({ inviteId });
      setToastConfig({ visible: true, message: 'Team invite accepted!', type: 'success' });
    } catch (error) {
      const message = isAxiosError(error) && error.response?.status === 400 && error.response?.data
        ? String(error.response.data)
        : 'Failed to accept team invite.';
      setToastConfig({ visible: true, message, type: 'error' });
    }
  };

  const handleRejectTeamInvite = (inviteId: string) => {
    rejectTeamInvite({ inviteId });
  };

  const handleAcceptEventInvite = async (inviteId: string) => {
    try {
      await acceptEventInviteAsync({ inviteId });
      setToastConfig({ visible: true, message: 'Event invite accepted!', type: 'success' });
    } catch (error) {
      const message = isAxiosError(error) && error.response?.status === 400 && error.response?.data
        ? String(error.response.data)
        : 'Failed to accept invite.';
      setToastConfig({ visible: true, message, type: 'error' });
    }
  };

  const handleRejectEventInvite = (inviteId: string) => {
    rejectEventInvite({ inviteId });
  };

  useEffect(() => {
    // Update even if data is undefined/empty (204 response)
    if(notificationsQuery.data !== undefined){
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
        const invite = notification.payload as TeamInvite;
        return (
          <InviteNotification
            key={`team-invite-${index}`}
            inviteId={invite.id}
            senderName={invite.senderName}
            senderId={invite.senderId}
            inviteMessage="invited you to join"
            targetName={invite.team.name}
            logoUrl={invite.team.logoUrl}
            subtitle={`Sportsmanship: ${invite.team.sportsmanshipLvl}`}
            theme={theme}
            onAccept={handleAcceptTeamInvite}
            onReject={handleRejectTeamInvite}
          />
        );
      }
      case 'event_invite': {
        const invite = notification.payload as TournamentInvite;
        return (
          <InviteNotification
            key={`event-invite-${index}`}
            inviteId={invite.id}
            senderName={invite.senderName}
            senderId={invite.senderId}
            inviteMessage={`invited you as ${invite.eventRole} in`}
            targetName={invite.event.title}
            targetHref={`/events/${invite.event.id}`}
            logoUrl={invite.team.logoUrl}
            subtitle={invite.event.eventType ? `${invite.event.eventType} · ${invite.team.name}` : invite.team.name}
            theme={theme}
            onAccept={handleAcceptEventInvite}
            onReject={handleRejectEventInvite}
          />
        );
      }
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

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        position="bottom-left"
        onHide={() => setToastConfig({ visible: false, message: '', type: 'info' })}
      />
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
