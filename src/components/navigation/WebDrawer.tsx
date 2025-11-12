import { Drawer } from 'expo-router/drawer';
import WebDrawerContent from './drawerContent/WebDrawerContent';
import { Colors } from '@/src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function WebDrawer() {
     const colorScheme = useColorScheme() ?? 'dark';
     const theme = Colors[colorScheme];
     return (
          <Drawer
            drawerContent={WebDrawerContent}
            
            screenOptions={() => ({
            drawerPosition: 'left',
            title: '',
            headerStyle: { backgroundColor: theme.background  },
            headerTintColor: theme.text,
            drawerStyle: { backgroundColor: theme.secondary },
            drawerActiveTintColor: theme.tint,
            drawerInactiveTintColor: theme.text,
            drawerLabelStyle: { color: theme.text, fontWeight: 'bold' },

          })}>
          <Drawer.Screen
            name="index"
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
          <Drawer.Screen
            name="user/[userId]"
            options={{
              drawerItemStyle: { display:  'none' },
    
            }}
          />
          <Drawer.Screen
            name="team/[teamId]"
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
           <Drawer.Screen
            name="team/create"
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
          <Drawer.Screen
            name="ladder"
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
          <Drawer.Screen
            name="events"
            options={{
              drawerItemStyle: { display: 'none' },
            }}
          />
    
        </Drawer>
        );
}