import 'react-native-url-polyfill/auto'; // Essential for Realtime in Expo
import { createClient } from '@supabase/supabase-js';

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