import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import {
  ConfigurationOptionsDto,
  AddRoundConfigRequest,
  RoundConfigDto,
} from '@/types/EventAdmin';

export function useRoundConfigAdmin(eventId: string | undefined, numberOfRounds: number = 0) {
  const queryClient = useQueryClient();

  const configOptionsQuery = useQuery<ConfigurationOptionsDto>({
    queryKey: ['configurationOptions'],
    queryFn: async () => {
      const res = await apiClient.get<ConfigurationOptionsDto>(
        '/admin/event/configuration/options'
      );
      return res.data;
    },
    staleTime: 60 * 60 * 1000,
  });

  // Fetch each round's config individually via the public endpoint
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

  const roundConfigsLoading = roundConfigQueries.some((q) => q.isLoading);

  const saveRoundConfigMutation = useMutation<void, Error, AddRoundConfigRequest>({
    mutationFn: async (data) => {
      await apiClient.put(`/admin/event/${eventId}/rounds/configuration`, data);
    },
    onSuccess: () => {
      // Invalidate all individual round config queries
      for (let i = 1; i <= numberOfRounds; i++) {
        queryClient.invalidateQueries({ queryKey: ['roundConfig', eventId, i] });
      }
    },
  });

  return {
    configOptionsQuery,
    roundConfigs,
    roundConfigsLoading,
    saveRoundConfigMutation,
  };
}
