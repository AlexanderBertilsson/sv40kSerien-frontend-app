import { Team } from '@/types/Team';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';

export type teamsProps = {
  teamIds?: string[];
};

export function useTeams({ teamIds }: teamsProps = {}) {
  const teamsQuery = useQuery<Team[]>({
    queryKey: ['teams', teamIds ? teamIds.join(',') : 'all'],
    queryFn: async () => {
      const res = await apiClient.get<Team[]>(`/teams`);
      return res.data;
    },
    enabled: !!teamIds
  });

  return { 
    teamsQuery
  };
}
