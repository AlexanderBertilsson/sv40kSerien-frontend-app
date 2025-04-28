// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { User } from '@/types/utils/User';
  
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

export function useUsers({ teamId, userIds }: usersProps) {

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const urlParams = buildUsersUrlParams({ teamId, userIds });
        const url = (Platform.OS === 'android' ? process.env.EXPO_PUBLIC_API_URL_ANDROID : process.env.EXPO_PUBLIC_API_URL);
        const res = await fetch(`${url}/users${urlParams}`);
        const data = await res.json();
        setUsers(data);
      } catch (_err) {
        console.log(_err)
        setError('Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [teamId, userIds]);

  return { users, loading, error };
}
