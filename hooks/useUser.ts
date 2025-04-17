import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
/* eslint-disable no-undef*/
export function useUser(username: string | undefined, authTokens: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || !authTokens?.idToken) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/users?username=${encodeURIComponent(username)}`, {
          headers: {
            'Authorization': `Bearer ${authTokens.accessToken}`
          }
        });
        const data = await res.json();
        setUser(data[0]);
      } catch (_err) {
        console.log(_err);
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username, authTokens]);

  return { user, loading, error };
}
