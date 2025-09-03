import { Ladder } from '@/types/Ladder';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';

export function useLadder(seasonName?: string) {
  const ladderQuery = useQuery<Ladder[]>({
    queryKey: ['ladder', seasonName],
    queryFn: async () => {
      const res = await apiClient.get<Ladder[]>(`/seasons/${seasonName}/ladder`);
      return res.data;
    },
    enabled: !!seasonName,
  });

  return { ladderQuery };
}
