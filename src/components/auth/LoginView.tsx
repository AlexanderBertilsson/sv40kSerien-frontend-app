import { View, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { Colors } from '@/src/constants/Colors';
import { Button } from '@/src/components/ui/Button';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function LoginView() {
  const { authUser: user, error, isAuthenticated, login, logout } = useAuthContext();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  if (isAuthenticated && user?.username) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: theme.secondary }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <ThemedText style={[styles.backButtonText, { color: theme.text }]}>Back</ThemedText>
        </TouchableOpacity>
        <View style={styles.content}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Welcome back
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.text }]}>
            {user?.username}
          </ThemedText>
          {error && (
            <ThemedText style={[styles.error, { color: theme.tint }]}>
              {error}
            </ThemedText>
          )}
          <Button 
            onPress={logout}
            title="Logout"
          />
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
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: theme.text }]}>
          Welcome to SV40K Series
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.text }]}>
          Please log in to continue
        </ThemedText>
        {error && (
          <ThemedText style={[styles.error, { color: theme.tint }]}>
            {error}
          </ThemedText>
        )}
        <Button 
          onPress={login}
          title="Login with Cognito"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
