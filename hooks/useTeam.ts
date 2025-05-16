import { Team } from '@/types/utils/types/Team';
import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types/utils/User';



export function useTeam(teamId: string) {

  const teamQuery = useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/teams/${teamId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!teamId,
  });

  const playersQuery = useQuery<User[]>({
    queryKey: ['players', teamId],
    queryFn: async () => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/users?teamId=${teamId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!teamId,
  });

  return { teamQuery, playersQuery };
}
