import { ArmyList, FactionDto, CreateArmyListRequest, UpdateArmyListRequest } from '@/types/ArmyList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useFactions() {
  const factionsQuery = useQuery<FactionDto[]>({
    queryKey: ['factions'],
    queryFn: async () => {
      const res = await apiClient.get<FactionDto[]>('/ArmyLists/factions');
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  return { factionsQuery };
}

export function useCreateArmyList(eventId: string) {
  const queryClient = useQueryClient();

  const createArmyListMutation = useMutation({
    mutationFn: async (request: CreateArmyListRequest) => {
      const res = await apiClient.post<ArmyList>(`/ArmyLists/events/${eventId}`, request);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventRegistration', 'me', eventId] });
    },
  });

  return { createArmyListMutation };
}

export function useUpdateArmyList(eventId: string) {
  const queryClient = useQueryClient();

  const updateArmyListMutation = useMutation({
    mutationFn: async (request: UpdateArmyListRequest) => {
      const res = await apiClient.put<ArmyList>(`/ArmyLists/events/${eventId}`, request);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventRegistration', 'me', eventId] });
    },
  });

  return { updateArmyListMutation };
}
