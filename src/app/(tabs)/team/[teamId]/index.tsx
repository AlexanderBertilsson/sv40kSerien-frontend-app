import { useState } from 'react';
import { View, StyleSheet, useColorScheme, Image, ScrollView, Pressable } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { Link } from 'expo-router';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import TeamMembersPreview from '@/src/components/team/TeamMembersPreview';
import { useLocalSearchParams } from 'expo-router';
import { useTeam, useUpdateTeamImages } from '@/src/hooks/useTeam';
import { useAuthContext } from '@/src/contexts/AuthContext';
import Toast, { ToastType } from '@/src/components/common/Toast';
import UpdateTeamImagesModal from '@/src/components/modals/UpdateTeamImagesModal';
import { getSportsmanshipColor } from '@/src/components/common/SportsmanshipBar';

interface StatItemProps {
  icon: keyof typeof FontAwesome.glyphMap;
  value: string;
  label: string;
  theme: any;
}

export default function TeamScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { teamId } = useLocalSearchParams();
  const { teamQuery } = useTeam(teamId as string);
  const team = teamQuery.data;
  const { authUser } = useAuthContext();
  const { updateImagesMutation } = useUpdateTeamImages(teamId as string);

  const isTeamMember = authUser?.teamId === teamId;

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    message: string;
    type: ToastType;
  }>({ visible: false, message: '', type: 'info' });

  const uploadToS3 = async (signedUrl: string, imageUri: string) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type },
    });
    if (!uploadResponse.ok) throw new Error('Failed to upload to S3');
  };

  const isNewImage = (uri?: string) => {
    if (!uri) return false;
    return uri.startsWith('data:') || uri.startsWith('file://');
  };

  const handleUpdateImages = async (logoUri?: string, bannerUri?: string, imageMetadata?: any) => {
    const hasNewLogo = isNewImage(logoUri);
    const hasNewBanner = isNewImage(bannerUri);

    if (!hasNewLogo && !hasNewBanner) return;

    const result = await updateImagesMutation.mutateAsync({
      logo: hasNewLogo ? imageMetadata.logo : null,
      banner: hasNewBanner ? imageMetadata.banner : null,
    });

    const uploads: Promise<void>[] = [];
    if (result.logoSignedUrl && logoUri && hasNewLogo) {
      uploads.push(uploadToS3(result.logoSignedUrl, logoUri));
    }
    if (result.bannerSignedUrl && bannerUri && hasNewBanner) {
      uploads.push(uploadToS3(result.bannerSignedUrl, bannerUri));
    }
    if (uploads.length > 0) await Promise.all(uploads);

    await teamQuery.refetch();
    setToastConfig({ visible: true, message: 'Team images updated', type: 'success' });
  };

  if(!team){
    return null;
  }
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: team.bannerUrl }}
          style={styles.bannerImage}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: team.logoUrl }}
            style={styles.logoImage}
          />
        </View>
        {isTeamMember && (
          <Pressable
            style={[styles.editImageButton, { backgroundColor: hexToRgba(theme.background, 0.8) }]}
            onPress={() => setImageModalVisible(true)}
          >
            <Ionicons name="camera-outline" size={18} color={theme.text} />
          </Pressable>
        )}
      </View>

      {/* Team Info */}
      <View style={styles.teamInfo}>
        <ThemedText style={styles.teamName}>{team.name}</ThemedText>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="star-four-points" size={24} color={getSportsmanshipColor(team.sportsmanshipLvl)} />
            <ThemedText style={[styles.statValue, { color: getSportsmanshipColor(team.sportsmanshipLvl) }]}>{team.sportsmanshipLvl}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.text }]}>Sportsmanship</ThemedText>
          </View>
          <StatItem
            icon="trophy"
            // value={`${team.gameStats.winRate}%`}
            value={`100%`}
            label="Win Rate"
            theme={theme}
          />
          <StatItem
            icon="gamepad"
            // value={team.gameStats.avgVictoryPoints.toString()}
            value={"100"}
            label="Average Victory Points"
            theme={theme}
          />
        </View>
      </View>

      {/* Team Members Preview */}
      <TeamMembersPreview members={team.users} teamId={teamId as string} authUser={authUser} />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Link style={[styles.actionButton, { backgroundColor: theme.secondary }]} href="./[teamId]/matchHistory">
          <View style={styles.actionContent}>
            <FontAwesome name="history" size={20} color={theme.text} />
            <ThemedText style={styles.actionText}>Match History</ThemedText>
          </View>
        </Link>
      </View>

      {/* Upcoming Events */}
      {/* <View style={styles.eventsSection}>
        <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
        {team.calendar!.length > 0 ? (
          <ThemedText style={styles.eventCount}>
            {team.calendar!.length} upcoming events
          </ThemedText>
        ) : (
          <ThemedText style={styles.noEvents}>No upcoming events</ThemedText>
        )}
      </View> */}

      <UpdateTeamImagesModal
        visible={imageModalVisible}
        onClose={() => setImageModalVisible(false)}
        currentLogo={team.logoUrl}
        currentBanner={team.bannerUrl}
        onUpdate={handleUpdateImages}
      />

      <Toast
        visible={toastConfig.visible}
        message={toastConfig.message}
        type={toastConfig.type}
        position="bottom-left"
        onHide={() => setToastConfig({ visible: false, message: '', type: 'info' })}
      />
    </ScrollView>
  );
}

function StatItem({ icon, value, label, theme }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <FontAwesome name={icon} size={24} color={theme.text} style={styles.statIcon} />
      <ThemedText style={[styles.statValue, { color: theme.text }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.text }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroBanner: {
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 2,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'contain',
  },
  teamInfo: {
    marginTop: 50,
    padding: 20,
  },
  teamName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  eventsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventCount: {
    fontSize: 16,
  },
  noEvents: {
    fontSize: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  editImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
