// hooks/useEvent.ts
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Event } from '@/types/utils/types/Event';

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      setLoading(true);
      try {
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/events/${eventId}`);
        const data = await res.json();
        setEvent(data);
      } catch (_err) {
        console.log(_err, "useEvent");
        setError('Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
}
