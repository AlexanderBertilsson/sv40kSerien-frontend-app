import { Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export type EventRegistrationBody = {
  teamId: string;
  captainId: string;
  playerIds: string[];
  coachIds: string[];
};

export function useEventRegistration(eventId: string) {
  const queryClient = useQueryClient();
  const eventRegistrationMutation = useMutation({
    mutationFn: async (body: EventRegistrationBody) => {
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/eventRegistrations/${eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      // Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await res.text();
      if (!text || text.trim() === '') {
        // Return a success indicator for empty responses
        return { success: true };
      }
      
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('Failed to parse JSON response:', error);
        throw new Error('Invalid JSON response from server');
      }
    },
    onSuccess: () => {
      // Invalidate events queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return { eventRegistrationMutation };
}
