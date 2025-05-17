// hooks/useUsers.ts
import { Platform } from 'react-native';
import { User } from '@/types/utils/User';
import { useQuery } from '@tanstack/react-query';
  
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
      const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
      const res = await fetch(`${url}/users${urlParams}`);
      const data = await res.json();
      return data;
    },
  });

  return { 
    usersQuery,
    // For backward compatibility
    users: usersQuery.data || [], 
    loading: usersQuery.isLoading, 
    error: usersQuery.error 
  };
}
