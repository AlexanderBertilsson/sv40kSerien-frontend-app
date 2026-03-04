import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { RoundDto, EventStateDto, ReportScoreRequest } from '@/types/EventAdmin';

export function useEventAdmin(eventId: string) {
  const queryClient = useQueryClient();

  const invalidateEvent = () => {
    queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['eventState', eventId] });
  };

  // GET /Events/{id}/state (public endpoint)
  const eventStateQuery = useQuery<EventStateDto>({
    queryKey: ['eventState', eventId],
    queryFn: async () => {
      const res = await apiClient.get<EventStateDto>(`/Events/${eventId}/state`);
      return res.data;
    },
    enabled: !!eventId,
  });

  // POST /admin/event/{id}/open-registration
  const openRegistrationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/admin/event/${eventId}/open-registration`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/close-registration
  const closeRegistrationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/admin/event/${eventId}/close-registration`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/start
  const startEventMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/admin/event/${eventId}/start`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/rounds/generate
  const generateRoundMutation = useMutation<RoundDto, Error>({
    mutationFn: async () => {
      const res = await apiClient.post<RoundDto>(`/admin/event/${eventId}/rounds/generate`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/rounds/{roundNumber}/start
  const startRoundMutation = useMutation<RoundDto, Error, number>({
    mutationFn: async (roundNumber: number) => {
      const res = await apiClient.post<RoundDto>(`/admin/event/${eventId}/rounds/${roundNumber}/start`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/rounds/{roundNumber}/complete
  const completeRoundMutation = useMutation<RoundDto, Error, number>({
    mutationFn: async (roundNumber: number) => {
      const res = await apiClient.post<RoundDto>(`/admin/event/${eventId}/rounds/${roundNumber}/complete`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/rounds/{roundNumber}/repair
  const repairRoundMutation = useMutation<RoundDto, Error, number>({
    mutationFn: async (roundNumber: number) => {
      const res = await apiClient.post<RoundDto>(`/admin/event/${eventId}/rounds/${roundNumber}/repair`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/admins
  const addAdminMutation = useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await apiClient.post(`/admin/event/${eventId}/admins`, { userId });
    },
    onSuccess: invalidateEvent,
  });

  // DELETE /admin/event/{id}/admins/{userId}
  const removeAdminMutation = useMutation<void, Error, string>({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/admin/event/${eventId}/admins/${userId}`);
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/complete
  const completeEventMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(`/admin/event/${eventId}/complete`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  // POST /admin/event/{id}/teams/{teamId}/drop
  const dropTeamMutation = useMutation<boolean, Error, string>({
    mutationFn: async (teamId: string) => {
      const res = await apiClient.post<boolean>(`/admin/event/${eventId}/teams/${teamId}/drop`);
      return res.data;
    },
    onSuccess: invalidateEvent,
  });

  return {
    eventStateQuery,
    openRegistrationMutation,
    closeRegistrationMutation,
    startEventMutation,
    generateRoundMutation,
    startRoundMutation,
    completeRoundMutation,
    repairRoundMutation,
    addAdminMutation,
    removeAdminMutation,
    completeEventMutation,
    dropTeamMutation,
  };
}

export function useAdminUpdateGameScore(eventId: string, gameId: string) {
  const queryClient = useQueryClient();

  const adminUpdateScoreMutation = useMutation<boolean, Error, ReportScoreRequest>({
    mutationFn: async (request: ReportScoreRequest) => {
      const res = await apiClient.put<boolean>(`/admin/event/${eventId}/games/${gameId}/score`, request);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roundMatches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventState', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventStandings', eventId] });
    },
  });

  return { adminUpdateScoreMutation };
}
