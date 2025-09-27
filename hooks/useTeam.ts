import { Team } from '@/types/Team';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';

export function useTeam(teamId: string) {

  const teamQuery = useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await apiClient.get<Team>(`/teams/${teamId}`);
      return res.data;
    },
    enabled: !!teamId,
  });

  return { teamQuery };
}
