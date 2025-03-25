import { View, StyleSheet, ScrollView } from 'react-native';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { StatsOverview } from '../../../components/profile/StatsOverview';
import { TeamInfo } from '../../../components/profile/TeamInfo';
import { GameInfo } from '../../../components/profile/GameInfo';
import { AchievementsPreview } from '../../../components/profile/AchievementsPreview';
import { colors } from '@/constants/theme';
import { useRef } from 'react';

export default function ProfileScreen() {
  const scrollViewRef = useRef(null);

  return (
    <View style={styles.container}>
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

        <View style={styles.contentContainer}>
        <TeamInfo
            teamName="Forge World Metalica"
            teamLogo="https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400"
            role="Team Captain"
            sportsmanshipRating={4.8}
          />
          
          <StatsOverview
            battles={127}
            winRate={76}
            points={2187}
          />

         

          <GameInfo
            role="Defender"
            armies={[
              { name: 'Adeptus Mechanicus', gamesPlayed: 85 },
              { name: 'Imperial Knights', gamesPlayed: 32 },
              { name: 'Necrons', gamesPlayed: 10 },
            ]}
          />

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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkNavy,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
});