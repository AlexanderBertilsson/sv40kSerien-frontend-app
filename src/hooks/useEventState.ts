import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventStateDto, TeamMatchDto, SubmitPairingsRequest, ReportScoreRequest } from '@/types/EventAdmin';

export function useEventState(eventId: string) {
  const eventStateQuery = useQuery<EventStateDto>({
    queryKey: ['eventState', eventId],
    queryFn: async () => {
      const res = await apiClient.get<EventStateDto>(`/Events/${eventId}/state`);
      return res.data;
    },
    enabled: !!eventId,
  });

  return { eventStateQuery };
}

export function useRoundMatches(eventId: string, roundNumber: number | null) {
  const roundMatchesQuery = useQuery<TeamMatchDto[]>({
    queryKey: ['roundMatches', eventId, roundNumber],
    queryFn: async () => {
      const res = await apiClient.get<TeamMatchDto[]>(
        `/Events/${eventId}/rounds/${roundNumber}/matches`
      );
      return res.data;
    },
    enabled: !!eventId && roundNumber !== null && roundNumber > 0,
  });

  return { roundMatchesQuery };
}

export function useSubmitPairings(eventId: string, teamMatchId: string) {
  const queryClient = useQueryClient();

  const submitPairingsMutation = useMutation({
    mutationFn: async (request: SubmitPairingsRequest) => {
      const res = await apiClient.post(
        `/TeamMatches/event/${eventId}/match/${teamMatchId}/pairings`,
        request
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roundMatches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventState', eventId] });
    },
  });

  return { submitPairingsMutation };
}

export function useReportGameScore(eventId: string, gameId: string) {
  const queryClient = useQueryClient();

  const reportScoreMutation = useMutation({
    mutationFn: async (request: ReportScoreRequest) => {
      const res = await apiClient.post(`/Games/${gameId}/score`, request);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roundMatches', eventId] });
    },
  });

  return { reportScoreMutation };
}

export function useConfirmTeamMatch(eventId: string, teamMatchId: string) {
  const queryClient = useQueryClient();

  const confirmMatchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post(
        `/TeamMatches/event/${eventId}/match/${teamMatchId}/confirm`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roundMatches', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventState', eventId] });
    },
  });

  return { confirmMatchMutation };
}
