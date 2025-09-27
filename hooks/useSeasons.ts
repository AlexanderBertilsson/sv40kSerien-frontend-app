import { useQuery } from '@tanstack/react-query';
import { Season } from '@/types/Season';
import apiClient from '@/components/httpClient/httpClient';

export function useSeasons() {

  const seasonsQuery = useQuery<Season[]>({
    queryKey: ['seasons'],
    queryFn: async () => {
      const res = await apiClient.get<Season[]>(`/seasons`);
      return res.data;
    },
    enabled: true,
  });

  return { seasonsQuery };
}
