import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { PendingInviteDto } from '@/types/TeamInvite';

interface UsePendingTeamInvitesOptions {
  teamId: string;
  enabled?: boolean;
}

export function usePendingTeamInvites({ teamId, enabled = true }: UsePendingTeamInvitesOptions) {
  const pendingInvitesQuery = useQuery({
    queryKey: ['teamInvites', 'pending', teamId],
    queryFn: async () => {
      const res = await apiClient.get<PendingInviteDto[]>(`/teamInvites/${teamId}/pending`);
      return res.data;
    },
    enabled: enabled && !!teamId,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    pendingInvitesQuery,
    pendingInvites: pendingInvitesQuery.data ?? [],
    isLoading: pendingInvitesQuery.isLoading,
    isError: pendingInvitesQuery.isError,
    error: pendingInvitesQuery.error,
  };
}
