import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
/* eslint-disable no-undef*/
export function useUser(userId: string | undefined) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/users/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (_err) {
        console.log(_err, "useUser");
        setError('Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  return { user, loading, error };
}
