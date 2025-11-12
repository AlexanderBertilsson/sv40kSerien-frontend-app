import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { User } from '@/types/User';

interface UseUserSearchOptions {
  query: string;
  limit?: number;
  enabled?: boolean;
}

export function useUserSearch({ query, limit = 10, enabled = true }: UseUserSearchOptions) {
  const userSearchQuery = useQuery({
    queryKey: ['users', 'search', query, limit],
    queryFn: async () => {
      const res = await apiClient.get<User[]>('/users/search', {
        params: {
          query,
          limit,
        },
      });
      return res.data;
    },
    enabled: enabled && query.length >= 3,
    staleTime: 30000, // Cache for 30 seconds
  });

  return {
    userSearchQuery,
    users: userSearchQuery.data ?? [],
    isLoading: userSearchQuery.isLoading,
    isError: userSearchQuery.isError,
    error: userSearchQuery.error,
  };
}
