import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventTeamRegistrationResponseDto } from '@/types/EventAdmin';

export function useTeamRegistrations(eventId: string | undefined, teamId: string | null | undefined) {
  const query = useQuery<EventTeamRegistrationResponseDto>({
    queryKey: ['eventRegistrations', eventId, teamId],
    queryFn: async () => {
      const res = await apiClient.get<EventTeamRegistrationResponseDto>(
        `/EventRegistrations/event/${eventId}/team/${teamId}`
      );
      return res.data;
    },
    enabled: !!eventId && !!teamId,
  });

  return { teamRegistrationsQuery: query };
}
