import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

export function useTeamInvite() {
  const queryClient = useQueryClient();

  const acceptInviteMutation = useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const res = await apiClient.post(`/teaminvites/${inviteId}/accept`);
      return res.data;
    },
    onSuccess: () => {
        console.log("Invite accepted in useTeamInvite");
      // Invalidate notifications to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Invalidate user profile to update team info
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const rejectInviteMutation = useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const res = await apiClient.patch(`/teaminvites/${inviteId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate notifications to refresh the list
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const inviteUserMutation = useMutation({
    mutationFn: async ({ teamId, receiverId }: { teamId: string; receiverId: string }) => {
      const res = await apiClient.post(`/teamInvites/${teamId}/invite`, JSON.stringify(receiverId), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return res.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate team data to refresh members if needed
      queryClient.invalidateQueries({ queryKey: ['team'] });
      // Invalidate pending invites for this team
      queryClient.invalidateQueries({ queryKey: ['teamInvites', 'pending', variables.teamId] });
    },
  });

  const revokeInviteMutation = useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const res = await apiClient.patch(`/teamInvites/${inviteId}/revoke`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate pending invites to refresh the list
      queryClient.invalidateQueries({ queryKey: ['teamInvites', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });

  return {
    acceptInvite: acceptInviteMutation.mutate,
    rejectInvite: rejectInviteMutation.mutate,
    inviteUser: inviteUserMutation.mutate,
    inviteUserAsync: inviteUserMutation.mutateAsync,
    revokeInvite: revokeInviteMutation.mutate,
    revokeInviteAsync: revokeInviteMutation.mutateAsync,
    isAccepting: acceptInviteMutation.isPending,
    isRejecting: rejectInviteMutation.isPending,
    isInviting: inviteUserMutation.isPending,
    isRevoking: revokeInviteMutation.isPending,
    inviteError: inviteUserMutation.error,
    inviteSuccess: inviteUserMutation.isSuccess,
  };
}
