import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { UserProvider } from '@/src/contexts/ProfileContext';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/src/components/navigation/CustomDrawerContent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

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
          <UserProvider>
            <SafeAreaProvider>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
              <Drawer
                drawerContent={CustomDrawerContent}
                screenOptions={() => ({
                  drawerPosition: 'left',
                  title: '',
                  headerStyle: { backgroundColor: theme.background },
                  headerTintColor: theme.text,
                  drawerStyle: { backgroundColor: theme.secondary },
                  drawerActiveTintColor: theme.tint,
                  drawerInactiveTintColor: theme.text,
                  drawerLabelStyle: { color: theme.text, fontWeight: 'bold' },
                })}>
                <Drawer.Screen
                  name="(tabs)"
                  options={{
                    drawerItemStyle: {
                      display: 'none',
                    },
                  }}
                />
                <Drawer.Screen
                  name="+not-found"
                  options={{
                    drawerItemStyle: {
                      display: 'none',
                    },
                  }}
                />
              </Drawer>
            </SafeAreaProvider>
          </UserProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
