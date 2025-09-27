import { useQuery } from '@tanstack/react-query';
import apiClient from '@/components/httpClient/httpClient';
import { User } from '@/types/User';

export function useUser(userId: string | undefined) {
  const userQuery = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await apiClient.get<User>(`/users/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  return { userQuery };
}
