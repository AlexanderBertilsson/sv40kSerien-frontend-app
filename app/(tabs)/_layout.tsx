import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs 
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#E59500',  // Orange from our palette
                headerStyle: {
                    backgroundColor: '#002642',  // Dark blue from our palette
                },
                headerShadowVisible: false,
                headerTintColor: '#E5DADA',  // Light gray from our palette
                tabBarStyle: {
                    backgroundColor: '#02040F',  // Nearly black from our palette
                    borderTopColor: '#840032',  // Deep red from our palette
                    borderTopWidth: 1,
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24}/>
                    ),
                }}
            />
            <Tabs.Screen 
                name="(profile)" 
                options={{ 
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24}/>
                    ),
                }}
            />
        </Tabs>
    );
}