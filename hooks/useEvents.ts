// hooks/useEvents.ts
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Event } from '@/types/utils/types/Event';

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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const urlParams = buildEventsUrlParams({ type, upcomingOnly });
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/events${urlParams}`);
        const data = await res.json();
        setEvents(data);
      } catch (_err) {
        console.log(_err, "useEvents");
        setError('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [type, upcomingOnly]);

  return { events, loading, error };
}
