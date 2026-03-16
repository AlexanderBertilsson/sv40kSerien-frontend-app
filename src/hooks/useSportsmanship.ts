import { useMutation, useQuery, useQueries } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { SubmitSportsmanshipRatingRequest } from '@/types/Sportsmanship';

export function useSubmitSportsmanshipRating(gameId: string) {
  const submitRatingMutation = useMutation({
    mutationFn: async (request: SubmitSportsmanshipRatingRequest) => {
      const res = await apiClient.post<boolean>(`/Games/${gameId}/sportsmanship`, request);
      return res.data;
    },
  });

  return { submitRatingMutation };
}

export function useGetSportsmanshipRating(gameId: string, enabled = true) {
  const query = useQuery({
    queryKey: ['sportsmanship', gameId],
    queryFn: async () => {
      const res = await apiClient.get<boolean>(`/Games/${gameId}/sportsmanship`);
      return res.data;
    },
    enabled: enabled && !!gameId,
  });

  return { hasRated: query.data ?? false, isLoading: query.isLoading, query };
}

export function useSportsmanshipStatuses(gameIds: string[]) {
  const queries = useQueries({
    queries: gameIds.map((gameId) => ({
      queryKey: ['sportsmanship', gameId],
      queryFn: async () => {
        const res = await apiClient.get<boolean>(`/Games/${gameId}/sportsmanship`);
        return res.data;
      },
      enabled: !!gameId,
    })),
  });

  const unratedGameIds = new Set<string>();
  queries.forEach((q, i) => {
    if (q.isSuccess && !q.data) {
      unratedGameIds.add(gameIds[i]);
    }
  });

  return { unratedGameIds, isLoading: queries.some((q) => q.isLoading) };
}
