import 'react-native-url-polyfill/auto'; // Essential for Realtime in Expo
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import apiClient from '@/src/components/httpClient/httpClient';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is not defined in environment variables');
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 10000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 10000),
  },
});

/**
 * Fetch the user's access token and set it on the Supabase Realtime connection.
 * - Web: calls GET /Auth/token (token is in HTTP-only cookies)
 * - Mobile: reads from SecureStore
 */
export async function setSupabaseRealtimeAuth(): Promise<void> {
  try {
    let accessToken: string | null = null;

    if (Platform.OS === 'web') {
      const res = await apiClient.get('/auth/token');
      accessToken = res.data?.accessToken ?? null;
    } else {
      accessToken = await SecureStore.getItemAsync('accessToken');
    }

    if (accessToken) {
      supabase.realtime.setAuth(accessToken);
    }
  } catch (error) {
    console.error('[Supabase Auth] Failed to set realtime auth:', error);
  }
}