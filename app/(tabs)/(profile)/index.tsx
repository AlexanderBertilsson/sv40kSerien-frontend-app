import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { StatsOverview } from '../../../components/profile/StatsOverview';
import { TeamInfo } from '../../../components/profile/TeamInfo';
import { GameInfo } from '../../../components/profile/GameInfo';
import { AchievementsPreview } from '../../../components/profile/AchievementsPreview';
import { Colors } from '@/constants/Colors';
import { useRef } from 'react';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const scrollViewRef = useRef(null);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

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

  return (
    <View style={containerStyle}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        <ProfileHeader
          username="Commander_Shadowblade"
          title="Adeptus Mechanicus Veteran"
          team="Forge World Metalica"
          sportsmanship={85}
          sportsmanshipLevel={3}
        />

        <View style={contentContainerStyle}>
          <View style={styles.section}>
            <TeamInfo
              teamName="Forge World Metalica"
              teamLogo="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400"
              role="Team Captain"
              sportsmanshipRating={4.8}
            />
          </View>
          
          <View style={styles.section}>
            <Link href="/(tabs)/(profile)/stats" asChild>
              <View style={statsLinkStyle}>
                <StatsOverview
                  battles={127}
                  winRate={76}
                  points={2187}
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
              role="Defender"
              armies={[
                { name: 'Adeptus Mechanicus', gamesPlayed: 85 },
                { name: 'Imperial Knights', gamesPlayed: 32 },
                { name: 'Necrons', gamesPlayed: 10 },
              ]}
            />
          </View>

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
          </View>
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