import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext';
import DeviceDrawer from '@/src/components/navigation/DeviceDrawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SafeAreaProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <DeviceDrawer />
            </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
