import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventRegistration } from '@/src/types/EventRegistration';

export function useMyEventRegistration(eventId: string | undefined) {
  const query = useQuery<EventRegistration>({
    queryKey: ['eventRegistration', 'me', eventId],
    queryFn: async () => {
      const res = await apiClient.get<EventRegistration>(`/EventRegistrations/event/${eventId}/me`);
      return res.data;
    },
    enabled: !!eventId,
    retry: false,
  });

  return { myRegistrationQuery: query };
}
