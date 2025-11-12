import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext';  
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import DeviceDrawer from '../components/navigation/DeviceDrawer';

const MOBILE_BREAKPOINT = 768;

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  const { width } = useWindowDimensions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevents hydration mismatch
  }

  const isMobileWeb = width < MOBILE_BREAKPOINT;

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <SafeAreaProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              {isMobileWeb ? (
               <DeviceDrawer />
              ) : (
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" options={{ headerShown: false }} />
                </Stack>
              )}

            </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
