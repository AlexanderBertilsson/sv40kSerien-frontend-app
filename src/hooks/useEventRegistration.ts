import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

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
      const res = await apiClient.post(`/eventRegistrations/${eventId}`, body);
      
      // Check if response is ok
      if (!res.status) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // Check if response has content before parsing JSON
      const text = await res.data;
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
