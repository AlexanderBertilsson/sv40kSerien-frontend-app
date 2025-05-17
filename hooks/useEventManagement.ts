// hooks/useEventManagement.ts
import { Platform } from 'react-native';
import { Event } from '@/types/utils/types/Event';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type EventInput = Omit<Event, 'id'>;
type EventUpdateInput = Partial<Omit<Event, 'id'>>;

export function useEventManagement() {
  const queryClient = useQueryClient();
  const apiUrl = Platform.OS === 'android' 
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID 
    : process.env.EXPO_PUBLIC_API_URL;

  // Create event mutation
  const createEventMutation = useMutation<Event, Error, EventInput>({
    mutationFn: async (eventData: EventInput) => {
      const response = await fetch(`${apiUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate events queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation<Event, Error, { id: string; data: EventUpdateInput }>({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`${apiUrl}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update event');
      }
      
      return await response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific event and events list
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation<boolean, Error, string>({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`${apiUrl}/events/${eventId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }
      
      return true;
    },
    onSuccess: (_, eventId) => {
      // Invalidate events list and remove event from cache
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.removeQueries({ queryKey: ['event', eventId] });
    },
  });

  // Join event mutation
  const joinEventMutation = useMutation<boolean, Error, { eventId: string; participantId: string }>({
    mutationFn: async ({ eventId, participantId }) => {
      const response = await fetch(`${apiUrl}/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to join event`);
      }
      
      return true;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific event
      queryClient.invalidateQueries({ queryKey: ['event', variables.eventId] });
    },
  });

  // No wrapper functions needed anymore

  return {
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
    joinEventMutation
  };
}
