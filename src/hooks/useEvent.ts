import { Event } from '@/types/Event';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

export function useEvent(eventId: string | undefined) {
  const eventQuery = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const res = await apiClient.get<Event>(`/events/${eventId}`);
      return res.data;
    },
    enabled: !!eventId,
  });

  return { eventQuery };
}
