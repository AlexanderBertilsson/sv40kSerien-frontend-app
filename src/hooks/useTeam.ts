import { Team } from '@/types/Team';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '@/src/components/httpClient/httpClient';

export interface ImageMetadataDto {
  fileName: string;
  contentType: string;
}

export interface UpdateTeamImagesDto {
  logo: ImageMetadataDto | null;
  banner: ImageMetadataDto | null;
}

export interface UpdateTeamImagesResponseDto {
  logoSignedUrl: string | null;
  bannerSignedUrl: string | null;
}

export function useTeam(teamId: string) {

  const teamQuery = useQuery<Team>({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const res = await apiClient.get<Team>(`/teams/${teamId}`);
      return res.data;
    },
    enabled: !!teamId,
  });

  return { teamQuery };
}

export function useUpdateTeamImages(teamId: string) {
  const updateImagesMutation = useMutation({
    mutationFn: async (body: UpdateTeamImagesDto) => {
      const res = await apiClient.put<UpdateTeamImagesResponseDto>(
        `/Teams/${teamId}/images`,
        body,
      );
      return res.data;
    },
  });

  return { updateImagesMutation };
}
