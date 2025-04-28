
import { View, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, Text } from 'react-native';
import { ProfileHeader } from '../../../../components/profile/ProfileHeader';
import { StatsOverview } from '../../../../components/profile/StatsOverview';
import { TeamInfo } from '../../../../components/profile/TeamInfo';
import { GameInfo } from '../../../../components/profile/GameInfo';
// import { AchievementsPreview } from '../../../../components/profile/AchievementsPreview';
import { Colors } from '@/constants/Colors';
import { useRef } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useUser';
import { useTeam } from '@/hooks/useTeam';
import { Profile } from '@/types/utils/types/Profile';

export default function UserScreen() {
  const scrollViewRef = useRef(null);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { userId } = useLocalSearchParams();
  const { user, loading: userLoading, error: userError } = useUser(userId as string);
  const { team, loading: teamLoading, error: teamError } = useTeam(user?.teamId);
  const loading = userLoading || teamLoading;
  const error = userError || teamError;
  

  let profile: Profile | null = null;
  if (user && team) {
    profile = { ...user, team } as Profile;
  }
  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.background,
  };

  const contentContainerStyle = {
    ...styles.contentContainer,
    backgroundColor: theme.background,
  };

  const statsLinkStyle = {
    ...styles.statsLink,
    backgroundColor: theme.secondary,
  };

  if (loading) {
    return (
      <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}> 
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}> 
        <Text style={{ color: theme.text }}>{error}</Text>
      </View>
    );
  }
  if (!profile) {
    return (
      <View style={[containerStyle, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}> 
        <Text style={{ color: theme.text }}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader
          username={profile.username}
          title={""}
          team={profile.team.name}
          sportsmanship={profile.sportsmanship}
          sportsmanshipLevel={profile.sportsmanshipLevel}
          profilePicture={profile.profilePicture}
          heroImage={profile.heroImage}
        />

        <View style={contentContainerStyle}>
          <View style={styles.section}>
              <TeamInfo
                teamName={profile.team.name}
                teamLogo={profile.team.logo ?? ""}
                role={profile.role}
                sportsmanshipRating={profile.sportsmanship}
                teamId={profile.team.id}
              />
          </View>
          <View style={styles.section}>
            <Link href={`/user/${userId}/stats`} asChild>
              <View style={statsLinkStyle}>
                <StatsOverview
                  battles={profile?.matchHistory?.length ?? 0}
                  winRate={profile?.winRate ?? 0}
                  points={profile?.avgVictoryPoints ?? 0}
                />
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={theme.icon}
                  style={styles.chevron}
                />
              </View>
            </Link>
          </View>

          <View style={styles.section}>
            <GameInfo
              role={profile.gameRole}
              armies={profile?.mostPlayedArmies ?? []}
            />
          </View>
{/* 
          <View style={styles.section}>
            <AchievementsPreview
              achievements={[
                { 
                  icon: '🏆', 
                  title: 'League Champion', 
                  description: 'Season 3 Victor' 
                },
                { 
                  icon: '⚔️', 
                  title: 'Veteran', 
                  description: '100+ Battles' 
                },
                { 
                  icon: '🎯', 
                  title: 'Tactical Genius', 
                  description: '10 Perfect Victories' 
                },
              ]}
            />
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  statsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 16,
  },
  chevron: {
    marginLeft: 'auto',
  },
});