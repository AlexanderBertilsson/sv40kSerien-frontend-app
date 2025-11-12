import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { Notification } from '@/types/Notifications';

export function useNotifications() {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get<Notification[]>(`/notifications`);
      return res.data;
    },
    refetchInterval: 300000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: true,
  });

  return { notificationsQuery };
}
