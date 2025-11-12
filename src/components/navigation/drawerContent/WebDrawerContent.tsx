import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/src/contexts/AuthContext";
import { DrawerContentScrollView, DrawerItemList, useDrawerStatus } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter, Href } from "expo-router";
import { View, Image, Text, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { Colors } from '@/src/constants/Colors';
import DrawerItem from '@/src/components/navigation/DrawerItem';
import { NotificationPanel } from '@/src/components/navigation/NotificationPanel';

export default function WebDrawerContent(props: any) {
  const router = useRouter();
  const navigation = useNavigation();
  const { authUser, isAuthenticated, login, logout } = useAuthContext();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const [isNotificationPanelExpanded, setIsNotificationPanelExpanded] = useState(false);
  const drawerStatus = useDrawerStatus();

  // Close notification panel when drawer closes
  useEffect(() => {
    if (drawerStatus === 'closed') {
      setIsNotificationPanelExpanded(false);
    }
  }, [drawerStatus]);

  const handleNavigation = (path: Href) => {
    // Close drawer first using a timeout to ensure it processes
    try {
      navigation.dispatch(DrawerActions.closeDrawer());
    } catch (error) {
      // Silently handle if drawer action fails
      console.log('Drawer close action not handled, continuing with navigation', error);
    }
    // Use setTimeout to ensure drawer close is processed before navigation
    setTimeout(() => {
      router.push(path);
    }, 50);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.secondary }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {isAuthenticated && authUser ? (
          <View style={styles.profileSimpleContainer}>
            <Image
              source={authUser.profilePictureUrl ? { uri: authUser.profilePictureUrl } : require('@/assets/images/emoji2.png')}
              style={[styles.avatar, { borderColor: theme.tint }]}
              resizeMode="cover"
            />
            <Text style={[styles.username, { color: theme.text }]}>{authUser.username}</Text>
            {authUser.email && (
              <Text style={[styles.email, { color: theme.text }]}>{authUser.email}</Text>
            )}
          </View>
        ) : (
          <View style={{ height: 24 }} />
        )}
        <DrawerItemList {...props} />
        <DrawerItem
          label="Home"
          iconName="home-outline"
          onPress={() => handleNavigation("/")}
          theme={theme}
        />
        {isAuthenticated && authUser ? (
          <DrawerItem
            label="Profile"
            iconName="person-outline"
            onPress={() => handleNavigation(`/user/${authUser?.id}`)}
            theme={theme}
          />
        ) : null}

        {isAuthenticated && authUser && (
          authUser.teamId ? (
            <DrawerItem
              label="Team"
              iconName="flag-outline"
              onPress={() => handleNavigation(`/team/${authUser?.teamId}`)}
              theme={theme}
            />
          ) :
            <DrawerItem
              label="Team"
              iconName="flag-outline"
              onPress={() => handleNavigation(`/team/create`)}
              theme={theme}
            />)}

        <DrawerItem
          label="Events"
          iconName="calendar-outline"
          onPress={() => handleNavigation(`/events`)}
          theme={theme}
        />
        <DrawerItem
          label="Ladder"
          iconName="trophy-outline"
          onPress={() => handleNavigation(`/ladder`)}
          theme={theme}
        />
        
        {isAuthenticated
          ? <DrawerItem
            label="Logout"
            iconName="log-out-outline"
            onPress={() => {
              try {
                navigation.dispatch(DrawerActions.closeDrawer());
              } catch (error) {
                console.log('Drawer close action not handled', error);
              }
              setTimeout(() => logout(), 50);
            }}
            theme={theme}
          />
          : <DrawerItem
            label="Login web"
            iconName="log-in-outline"
            onPress={() => {
              try {
                navigation.dispatch(DrawerActions.closeDrawer());
              } catch (error) {
                console.log('Drawer close action not handled', error);
              }
              setTimeout(() => login(), 50);
            }}
            theme={theme}
          />}


      </DrawerContentScrollView>
      
      {/* Notification panel rendered outside scroll view to ensure it's always on top */}
      {isAuthenticated && authUser && (
        <View style={styles.notificationContainer}>
          <NotificationPanel

            theme={theme}
            isExpanded={isNotificationPanelExpanded}
            onExpandedChange={setIsNotificationPanelExpanded}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSimpleContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
    marginTop: 16,
  },
  notificationContainer: {
    position: 'absolute',
    top: 24,
    left: 16,
    zIndex: 10000,
    elevation: 10000,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    opacity: 0.7,
  },
});