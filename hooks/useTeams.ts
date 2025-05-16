import { Platform } from 'react-native';
import { fetch } from 'expo/fetch';
import { Team } from '@/types/utils/types/Team';
import { useQuery } from '@tanstack/react-query';

export type teamsProps = {
  teamIds?: string[];
};

export function useTeams({ teamIds }: teamsProps = {}) {
  const teamsQuery = useQuery<Team[]>({
    queryKey: ['teams', teamIds ? teamIds.join(',') : 'all'],
    queryFn: async () => {
      // Use globalThis.process for React Native env safety
      const env = typeof process !== 'undefined' ? process.env : globalThis.process?.env;
      const url = Platform.OS === 'android' ? env?.EXPO_PUBLIC_API_URL_ANDROID : env?.EXPO_PUBLIC_API_URL;
      let endpoint = `${url}/teams`;
      if (teamIds && teamIds.length > 0) {
        endpoint += `?ids=${teamIds.join(',')}`;
      }
      const res = await fetch(endpoint);
      const data = await res.json();
      return data;
    },
  });

  return { 
    teamsQuery
  };
}
