import { Drawer } from 'expo-router/drawer';
import DeviceDrawerContent from './drawerContent/DeviceDrawerContent';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';

export default function DeviceDrawer() {
    const colorScheme = useColorScheme() ?? 'dark';
    const theme = Colors[colorScheme];
    return (
        <Drawer
            drawerContent={DeviceDrawerContent}
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
    )
}