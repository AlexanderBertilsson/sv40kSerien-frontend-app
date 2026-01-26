// hooks/useEventManagement.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventDetails } from '@/types/EventDetails';
import { CreateEventRequest, UpdateEventRequest } from '@/types/EventAdmin';

export function useEventManagement() {
  const queryClient = useQueryClient();

  // Create event mutation
  const createEventMutation = useMutation<EventDetails, Error, CreateEventRequest>({
    mutationFn: async (eventData: CreateEventRequest) => {
      const res = await apiClient.post<EventDetails>('/admin/event', eventData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation<EventDetails, Error, { id: string; data: UpdateEventRequest }>({
    mutationFn: async ({ id, data }) => {
      const res = await apiClient.put<EventDetails>(`/admin/event/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation<void, Error, string>({
    mutationFn: async (eventId: string) => {
      await apiClient.delete(`/admin/event/${eventId}`);
    },
    onSuccess: (_, eventId) => {
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
