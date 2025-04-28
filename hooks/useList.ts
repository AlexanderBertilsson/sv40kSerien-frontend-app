import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { useAuthContext } from '@/contexts/AuthContext';
/* eslint-disable no-undef*/

export function useList(listId: string | undefined) {
  const [armyList, setArmyList] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authTokens } = useAuthContext();

  useEffect(() => {
    if (!listId || !authTokens?.idToken) return;
    setLoading(true);

    const fetchList = async () => {
      try {
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/armylist/${listId}`, {
          headers: {
            'Authorization': `Bearer ${authTokens.accessToken}`
          }
        });
        const data = await res.json();
        setArmyList(data);
      } catch (_err) {
        console.log(_err);
        setError('Failed to fetch army list');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [listId, authTokens]);

  return { armyList, loading, error };
}
