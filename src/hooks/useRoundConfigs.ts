import { useQueries } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { RoundConfigDto } from '@/types/EventAdmin';

export function useRoundConfigs(eventId: string | undefined, numberOfRounds: number = 0) {
  const roundConfigQueries = useQueries({
    queries: Array.from({ length: numberOfRounds }, (_, i) => ({
      queryKey: ['roundConfig', eventId, i + 1],
      queryFn: async () => {
        const res = await apiClient.get<RoundConfigDto>(
          `/Events/${eventId}/rounds/${i + 1}/configuration`
        );
        return res.data;
      },
      enabled: !!eventId && numberOfRounds > 0,
      retry: false,
    })),
  });

  const roundConfigs = roundConfigQueries
    .map((q) => q.data)
    .filter((d): d is RoundConfigDto => !!d);

  const isLoading = roundConfigQueries.some((q) => q.isLoading);

  return { roundConfigs, isLoading };
}
