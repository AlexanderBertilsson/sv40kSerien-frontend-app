// hooks/useEvents.ts
import { EventDetails } from '@/types/EventDetails';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';

export type EventsProps = {
  type?: '8man' | '5man' | 'single';
  upcomingOnly?: boolean;
};

export function useEvents({ type, upcomingOnly }: EventsProps = {}) {
  const eventsQuery = useQuery<EventDetails[]>({
    queryKey: ['events', type, upcomingOnly],
    queryFn: async () => {
      const res = await apiClient.get<EventDetails[]>(`/events`);
      return res.data;
    },
  });

  return { eventsQuery };
}
