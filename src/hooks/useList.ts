import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { ArmyList } from '@/types/ArmyList';

export function useList(listId: string | undefined) {
  const listQuery = useQuery({
    queryKey: ['armyList', listId],
    queryFn: async () => {
      const res = await apiClient.get<ArmyList>(`/armylist/${listId}`);
      return res.data;
    },
    enabled: !!listId
  });

  return { listQuery };
}
