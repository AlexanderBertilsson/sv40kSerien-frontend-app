// hooks/useUsers.ts
import { User } from '@/types/User';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';
  
export type usersProps = {
    teamId?: string,
    userIds?: string[],
};

function buildUsersUrlParams({ teamId, userIds }: usersProps): string {
  const params: string[] = [];
  if (teamId) params.push(`teamId=${encodeURIComponent(teamId)}`);
  if (userIds && userIds.length > 0) params.push(`userIds=${encodeURIComponent(userIds.join(','))}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}

export function useUsers({ teamId, userIds }: usersProps = {}) {
  const usersQuery = useQuery<User[]>({
    queryKey: ['users', teamId, userIds ? userIds.join(',') : undefined],
    queryFn: async () => {
      const urlParams = buildUsersUrlParams({ teamId, userIds });
      const res = await apiClient.get<User[]>(`/users${urlParams}`);
      return res.data;
    },
    enabled: !!teamId || !!userIds
  });

  return { 
    usersQuery,
    // For backward compatibility
    users: usersQuery.data || [], 
    loading: usersQuery.isLoading, 
    error: usersQuery.error 
  };
}
