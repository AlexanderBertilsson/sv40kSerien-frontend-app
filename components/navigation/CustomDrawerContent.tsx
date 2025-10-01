import React, { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/ProfileContext";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import { View, Image, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "react-native";
import { Colors, hexToRgba } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const navigation = useNavigation();
  const { profile } = useUserContext();
  const { isAuthenticated, login, logout } = useAuthContext();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [homeHovered, setHomeHovered] = useState(false);
  const [loginHovered, setLoginHovered] = useState(false);

  const pressableHomeStyle = {
    ...styles.pressable,
    backgroundColor: homeHovered ? hexToRgba(theme.text, 0.1) : theme.secondary,
  };
  const pressableLoginStyle = {
    ...styles.pressable,
    backgroundColor: loginHovered ? hexToRgba(theme.text, 0.1) : theme.secondary,
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.secondary }]}> 
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {isAuthenticated && profile ? (
          <View style={styles.profileSimpleContainer}>
            <Image
              source={profile.profilePictureUrl ? { uri: profile.profilePictureUrl } : require('@/assets/images/emoji2.png')}
              style={[styles.avatar, { borderColor: theme.tint }]}
              resizeMode="cover"
            />
            <Text style={[styles.username, { color: theme.text }]}>{profile.username}</Text>
            {profile.email && (
              <Text style={[styles.email, { color: theme.text }]}>{profile.email}</Text>
            )}
          </View>
        ) : (
          <View style={{ height: 24 }} />
        )}
        <DrawerItemList {...props} />

        {isAuthenticated 
        ? <Pressable
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            logout();
          }}
          onHoverIn={() => setLoginHovered(true)}
          onHoverOut={() => setLoginHovered(false)}
          style={pressableLoginStyle}
        >
          <Ionicons
            name="log-out-outline"
            size={24}
            color={loginHovered ? theme.tint : theme.text}
            style={{ marginRight: 18}}
          />
          <Text style={{ color:theme.text, fontWeight: 'bold', fontSize: 16 }}>
            Logout
          </Text>
        </Pressable> 
        : <Pressable
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            login();
          }}
          onHoverIn={() => setLoginHovered(true)}
          onHoverOut={() => setLoginHovered(false)}
          style={pressableLoginStyle}
        >
          <Ionicons
            name="log-in-outline"
            size={24}
            color={loginHovered ? theme.tint : theme.text}
            style={{ marginRight: 18}}
          />
          <Text style={{ color:theme.text, fontWeight: 'bold', fontSize: 16 }}>
            Login
          </Text>
        </Pressable>}
        
        <Pressable
          onPress={() => {
            navigation.dispatch(DrawerActions.closeDrawer());
            router.replace("/");
          }}
          onHoverIn={() => setHomeHovered(true)}
          onHoverOut={() => setHomeHovered(false)}
          style={pressableHomeStyle}
        >
          <Ionicons
            name="home-outline"
            size={24}
            color={homeHovered ? theme.tint : theme.text}
            style={{ marginRight: 18}}
          />
          <Text style={{ color:theme.text, fontWeight: 'bold', fontSize: 16 }}>
            Home
          </Text>
        </Pressable>
      </DrawerContentScrollView>
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
  pressable: {
    marginTop: 8,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  }
});