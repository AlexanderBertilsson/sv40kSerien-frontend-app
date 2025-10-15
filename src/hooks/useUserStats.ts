import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { UserStatistics } from '@/types/UserStatistics';

export function useUserStats(userId: string | undefined) {
  const userStatsQuery = useQuery<UserStatistics>({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      const res = await apiClient.get<UserStatistics>(`/users/${userId}/gameStatistics`);
      return res.data;
    },
    enabled: !!userId,
  });

  return { userStatsQuery };
}
