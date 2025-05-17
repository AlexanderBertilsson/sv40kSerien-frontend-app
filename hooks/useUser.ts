import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/utils/User';

export function useUser(userId: string | undefined) {
  const userQuery = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/users/${userId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!userId,
  });

  return { userQuery };
}
