import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

export function useEventInviteResponse() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const res = await apiClient.post(`/EventRegistrations/invite/${inviteId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['eventRegistration'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      const res = await apiClient.patch(`/EventRegistrations/invite/${inviteId}/reject`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    acceptInvite: acceptMutation.mutate,
    acceptInviteAsync: acceptMutation.mutateAsync,
    rejectInvite: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
}
