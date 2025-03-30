import { View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export function LoginView() {


  const { user, error, isAuthenticated, login, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  if (isAuthenticated && user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.secondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <ThemedText style={[styles.backButtonText, { color: theme.text }]}>Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={[styles.title, { color: theme.text }]}>Welcome, {user.username}!</ThemedText>
        {error && (
          <ThemedText style={[styles.error, { color: theme.tint }]}>{error}</ThemedText>
        )}
        <View style={[styles.buttonContainer, { backgroundColor: theme.tint }]}>
          <ThemedText 
            style={[styles.button, { color: theme.ctaText }]}
            onPress={logout}
          >
            Logout
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: theme.secondary }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
        <ThemedText style={[styles.backButtonText, { color: theme.text }]}>Back</ThemedText>
      </TouchableOpacity>
      <ThemedText style={[styles.title, { color: theme.text }]}>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.tint }]}>Please log in to continue</ThemedText>
      {error && (
        <ThemedText style={[styles.error, { color: theme.tint }]}>{error}</ThemedText>
      )}
      <View style={[styles.buttonContainer, { backgroundColor: theme.tint }]}>
        <ThemedText 
          style={[styles.button, { color: theme.ctaText }]}
          onPress={login}
        >
          Login with Cognito
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 8,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    fontSize: 18,
    paddingVertical: 12,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
