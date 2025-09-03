// hooks/useEventManagement.ts
import { Platform } from 'react-native';
import { EventDetails } from '@/types/EventDetails';
import { useMutation, useQueryClient } from '@tanstack/react-query';

type EventInput = Omit<EventDetails, 'id'>;
type EventUpdateInput = Partial<Omit<EventDetails, 'id'>>;

export function useEventManagement() {
  const queryClient = useQueryClient();
  const apiUrl = Platform.OS === 'android' 
    ? process.env.EXPO_PUBLIC_API_URL_ANDROID 
    : process.env.EXPO_PUBLIC_API_URL;

  // Create event mutation
  const createEventMutation = useMutation<EventDetails, Error, EventInput>({
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
  const updateEventMutation = useMutation<EventDetails, Error, { id: string; data: EventUpdateInput }>({
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


  return {
    createEventMutation,
    updateEventMutation,
    deleteEventMutation,
  };
}
