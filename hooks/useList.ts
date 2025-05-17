import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { useAuthContext } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
/* eslint-disable no-undef*/

export function useList(listId: string | undefined) {
  const { authTokens } = useAuthContext();

  const listQuery = useQuery({
    queryKey: ['armyList', listId],
    queryFn: async () => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/armylist/${listId}`, {
        headers: {
          'Authorization': `Bearer ${authTokens?.accessToken}`
        }
      });
      const data = await res.json();
      return data;
    },
    enabled: !!listId && !!authTokens?.idToken,
  });

  return { listQuery };
}
