import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';
import { UserStatistics } from '@/types/UserStatistics';

export function useTeamStats(teamId: string | undefined) {
  const teamStatsQuery = useQuery<UserStatistics[]>({
    queryKey: ['teamStats', teamId],
    queryFn: async () => {
      const res = await apiClient.get<UserStatistics[]>(`/teams/${teamId}/gameStatistics`);
      return res.data;
    },
    enabled: !!teamId,
  });

  return { teamStatsQuery };
}