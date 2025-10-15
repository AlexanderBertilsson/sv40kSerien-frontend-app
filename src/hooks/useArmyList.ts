import { ArmyList } from '@/types/ArmyList';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

export function useArmyList(armyListId: string | null) {
  const armyListQuery = useQuery<ArmyList>({
    queryKey: ['armylist', armyListId],
    queryFn: async () => {
      const res = await apiClient.get<ArmyList>(`/armylists/${armyListId}`);
      return res.data;
    },
    enabled: !!armyListId,
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  return { armyListQuery };
}
