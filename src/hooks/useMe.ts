import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { Profile } from '@/types/User';

interface UseMeOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean;
}

export function useMe(options?: UseMeOptions) {
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await apiClient.get<Profile>(`/users/me`);
      return res.data;
    },
    enabled: options?.enabled ?? false,
    refetchInterval: options?.refetchInterval ?? false,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options?.refetchOnReconnect ?? false,
    retry: options?.retry ?? false,
  });

  return { 
    meQuery,
    user: meQuery.data,
    isLoading: meQuery.isLoading,
    isError: meQuery.isError,
    refetch: meQuery.refetch,
  };
}
