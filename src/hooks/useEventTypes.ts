import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventType } from '@/types/EventAdmin';

export function useEventTypes() {
  const eventTypesQuery = useQuery<EventType[]>({
    queryKey: ['eventTypes'],
    queryFn: async () => {
      const res = await apiClient.get<EventType[]>('/EventTypes');
      return res.data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour - event types rarely change
  });

  return {
    eventTypesQuery,
    eventTypes: eventTypesQuery.data || [],
    isLoading: eventTypesQuery.isLoading,
    isError: eventTypesQuery.isError,
  };
}
