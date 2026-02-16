import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { PendingInviteDto } from '@/types/TeamInvite';

export function useEventTeamInvite(eventId: string | undefined, teamId: string | null | undefined) {
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: async ({ userId, eventRole }: { userId: string; eventRole: 'player' | 'coach' }) => {
      const res = await apiClient.post(
        `/EventRegistrations/event/${eventId}/team/${teamId}/invite`,
        { userId, eventRole },
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', eventId, teamId] });
      queryClient.invalidateQueries({ queryKey: ['eventInvites', 'pending', eventId] });
    },
  });

  const pendingInvitesQuery = useQuery<PendingInviteDto[]>({
    queryKey: ['eventInvites', 'pending', eventId],
    queryFn: async () => {
      const res = await apiClient.get<PendingInviteDto[]>(
        `/EventRegistrations/event/${eventId}/pending`
      );
      return res.data;
    },
    enabled: !!eventId && !!teamId,
    staleTime: 30000,
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await apiClient.patch(
        `/EventRegistrations/invite/${inviteId}/revoke`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventInvites', 'pending', eventId] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistrations', eventId, teamId] });
    },
  });

  return {
    inviteUser: inviteMutation.mutate,
    inviteUserAsync: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    inviteError: inviteMutation.error,
    revokeInvite: revokeInviteMutation.mutate,
    revokeInviteAsync: revokeInviteMutation.mutateAsync,
    isRevoking: revokeInviteMutation.isPending,
    pendingInvites: pendingInvitesQuery.data ?? [],
    pendingInvitesLoading: pendingInvitesQuery.isLoading,
  };
}
