
import { View, StyleSheet, ScrollView, useColorScheme, ActivityIndicator, Text } from 'react-native';
import { ProfileHeader } from '../../../../components/profile/ProfileHeader';
import { StatsOverview } from '../../../../components/profile/StatsOverview';
import { TeamInfo } from '../../../../components/profile/TeamInfo';
import { GameInfo } from '../../../../components/profile/GameInfo';
// import { AchievementsPreview } from '../../../../components/profile/AchievementsPreview';
import { Colors } from '@/src/constants/Colors';
import { useRef } from 'react';
import { Link, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/src/hooks/useUser';
import { useTeam } from '@/src/hooks/useTeam';
import { useUserStats } from '@/src/hooks/useUserStats';

export default function UserScreen() {
  const scrollViewRef = useRef(null);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { userId } = useLocalSearchParams();
  const { userQuery } = useUser(userId as string);
  const { teamQuery } = useTeam(userQuery.data?.teamId || '');
  const { userStatsQuery } = useUserStats(userId as string);

  const loading = userQuery.isLoading || teamQuery.isLoading || userStatsQuery.isLoading;
  const error = userQuery.error || teamQuery.error || userStatsQuery.error;


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
        {error instanceof Error ? <Text style={{ color: theme.text }}>{error.message}</Text> : <Text style={{ color: theme.text }}>{error}</Text>}
      </View>
    );
  }
  if (!userQuery.data) {
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
          username={userQuery.data.username}
          title={""}
          team={teamQuery.data?.name}
          sportsmanship={userQuery.data.sportsmanshipScore}
          sportsmanshipLevel={userQuery.data.sportsmanshipLevel}
          profilePicture={userQuery.data.profilePictureUrl}
          heroImage={userQuery.data.heroImageUrl}
        />
  
        <View style={contentContainerStyle}>
         {teamQuery.data && <View style={styles.section}>
              <TeamInfo
                teamName={teamQuery.data?.name}
                teamLogo={teamQuery.data?.logoUrl ?? ""}
                teamId={teamQuery.data?.id}
                sportsmanshipLvl={teamQuery.data?.sportsmanshipLvl}
              />
          </View>}
          <View style={styles.section}>
            <Link href={`/user/${userId}/stats`} asChild>
              <View style={statsLinkStyle}>
                <StatsOverview
                  battles={userStatsQuery.data?.gamesPlayed || 0}
                  winRate={userStatsQuery.data?.winRatio || 0}
                  points={userStatsQuery.data?.averageScore || 0}
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
              role={userStatsQuery.data?.mostPlayedRole || ""}
              armies={userStatsQuery.data?.mostPlayedArmies || []}
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