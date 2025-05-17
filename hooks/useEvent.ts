// hooks/useEvent.ts
import { Platform } from 'react-native';
import { Event } from '@/types/utils/types/Event';
import { useQuery } from '@tanstack/react-query';

export function useEvent(eventId: string | undefined) {
  const eventQuery = useQuery<Event>({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/events/${eventId}`);
      const data = await res.json();
      return data;
    },
    enabled: !!eventId,
  });

  return { eventQuery };
}
