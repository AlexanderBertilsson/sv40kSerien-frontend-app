import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { ProfileHeader } from '../../../components/profile/ProfileHeader';
import { StatsOverview } from '../../../components/profile/StatsOverview';
import { TeamInfo } from '../../../components/profile/TeamInfo';
import { GameInfo } from '../../../components/profile/GameInfo';
import { AchievementsPreview } from '../../../components/profile/AchievementsPreview';

export default function ProfileScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <Image
            source="https://images.unsplash.com/photo-1615457938971-3ab96f76b879?q=80&w=1200&auto=format&fit=crop"
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', '#000']}
            style={styles.heroGradient}
          />
        </View>

        <ProfileHeader
          imageUrl="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=400&auto=format&fit=crop"
          level={42}
          username="Commander_Shadowblade"
          title="Adeptus Mechanicus Veteran"
        />

        <StatsOverview
          battles={127}
          winRate={76}
          points={2187}
        />

        <TeamInfo
          teamName="Forge World Metalica"
          teamLogo="https://images.unsplash.com/photo-1615457938971-3ab96f76b879?q=80&w=400&auto=format&fit=crop"
          role="Team Captain"
          sportsmanshipRating={4.8}
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
              description: 'Season 3 Victor',
            },
            {
              icon: '⚔️',
              title: 'Veteran',
              description: '100+ Battles',
            },
            {
              icon: '🎯',
              title: 'Tactical Genius',
              description: '10 Perfect Victories',
            },
          ]}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002642',  // Dark blue background
  },
  heroBanner: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
});