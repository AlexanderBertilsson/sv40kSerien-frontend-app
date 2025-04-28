import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/ProfileContext';
import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <AuthProvider>
      <UserProvider>
        <SafeAreaProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Drawer
         screenOptions={{ drawerPosition: 'left', title: ''}}>
          <Drawer.Screen 
              name="login"
              options={{ 
                title: 'Login',
                headerShown: true,
              }} 
            />
          <Drawer.Screen 
            name="(tabs)" 
            options={{ 
              title: 'Home',
              // drawerItemStyle: {
              //   display: 'none',
              // },
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
        {/* <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.background,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              color: theme.text,
            },
            contentStyle: {
              backgroundColor: theme.background,
            },
          }}
        >
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
            }} 
          />
       
          <Stack.Screen 
            name="+not-found" 
            options={{ 
              title: 'Not Found',
              headerShown: true,
            }} 
          />
        </Stack>
        <SideMenu /> */}
      </SafeAreaProvider>
      </UserProvider>
    </AuthProvider>
  );
}
