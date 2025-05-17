// hooks/useEvents.ts
import { Platform } from 'react-native';
import { Event } from '@/types/utils/types/Event';
import { useQuery } from '@tanstack/react-query';

export type EventsProps = {
  type?: '8man' | '5man' | 'single';
  upcomingOnly?: boolean;
};

function buildEventsUrlParams({ type, upcomingOnly }: EventsProps): string {
  const params: string[] = [];
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  if (upcomingOnly) params.push('upcomingOnly=true');
  return params.length > 0 ? `?${params.join('&')}` : '';
}

export function useEvents({ type, upcomingOnly }: EventsProps = {}) {
  const eventsQuery = useQuery<Event[]>({
    queryKey: ['events', type, upcomingOnly],
    queryFn: async () => {
      const urlParams = buildEventsUrlParams({ type, upcomingOnly });
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/events${urlParams}`);
      const data = await res.json();
      return data;
    },
  });

  return { eventsQuery };
}
