import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { User } from '@/types/User';

export function useMe() {
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiClient.get<User>(`/users/me`);
      return res;
    },
    enabled: true,
  });

  return { meQuery };
}
