import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { RoundConfigDto } from '@/types/EventAdmin';

export function useRoundConfiguration(eventId: string | undefined, roundNumber: number | null | undefined) {
  const query = useQuery<RoundConfigDto>({
    queryKey: ['roundConfig', eventId, roundNumber],
    queryFn: async () => {
      const res = await apiClient.get<RoundConfigDto>(
        `/Events/${eventId}/rounds/${roundNumber}/configuration`
      );
      return res.data;
    },
    enabled: !!eventId && roundNumber != null,
  });

  return { roundConfigQuery: query };
}
