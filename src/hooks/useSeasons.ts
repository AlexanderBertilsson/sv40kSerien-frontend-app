import { useQuery } from '@tanstack/react-query';
import { Season } from '@/types/Season';
import apiClient from '@/src/components/httpClient/httpClient';

export function useSeasons(enabled: boolean = true) {

  const seasonsQuery = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: async () => {
      const res = await apiClient.get<Season[]>(`/seasons`);
      return res.data;
    },
    enabled,
  });

  return { seasonsQuery };
}
