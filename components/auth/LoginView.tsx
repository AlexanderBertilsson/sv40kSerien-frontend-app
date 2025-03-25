import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useAuth } from '@/hooks/useAuth';

export function LoginView() {
  const { user, error, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.title}>Welcome, {user.username}!</ThemedText>
        {error && (
          <ThemedText style={styles.error}>{error}</ThemedText>
        )}
        <View style={styles.buttonContainer}>
          <ThemedText 
            style={styles.button}
            onPress={logout}
          >
            Logout
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Welcome to Warhammer 40k League</ThemedText>
      <ThemedText style={styles.subtitle}>Please log in to continue</ThemedText>
      {error && (
        <ThemedText style={styles.error}>{error}</ThemedText>
      )}
      <View style={styles.buttonContainer}>
        <ThemedText 
          style={styles.button}
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
    backgroundColor: '#002642',  // Dark blue from our palette
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E5DADA',  // Light gray from our palette
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E59500',  // Orange from our palette
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    fontSize: 14,
    color: '#840032',  // Deep red from our palette
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    backgroundColor: '#840032',  // Deep red from our palette
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    fontSize: 18,
    color: '#E5DADA',  // Light gray from our palette
    paddingVertical: 12,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
