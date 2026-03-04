import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';
import { User } from '@/types/User';
import { ImageMetadataDto } from '@/src/hooks/useTeam';

export interface UpdateUserImagesDto {
  profilePicture: ImageMetadataDto | null;
  heroImage: ImageMetadataDto | null;
}

export interface UpdateUserImagesResponseDto {
  profilePictureSignedUrl: string | null;
  heroImageSignedUrl: string | null;
}

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

export function useUpdateUserImages() {
  const updateImagesMutation = useMutation({
    mutationFn: async (body: UpdateUserImagesDto) => {
      const res = await apiClient.put<UpdateUserImagesResponseDto>(
        '/Users/me/images',
        body,
      );
      return res.data;
    },
  });

  return { updateImagesMutation };
}
