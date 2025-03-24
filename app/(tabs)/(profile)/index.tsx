import { View, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function ProfileScreen() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ScrollView>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Image 
          source="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=400&auto=format&fit=crop"
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', '#25292e']}
          style={styles.gradient}
        />
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?q=80&w=400&auto=format&fit=crop"
            style={styles.profileImage}
            contentFit="cover"
          />
          <View style={styles.levelBadge}>
            <ThemedText style={styles.levelText}>LVL 42</ThemedText>
          </View>
        </View>

        <View style={styles.nameContainer}>
          <ThemedText style={styles.username}>Commander_Shadowblade</ThemedText>
          <ThemedText style={styles.title}>Adeptus Mechanicus Veteran</ThemedText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>127</ThemedText>
            <ThemedText style={styles.statLabel}>Battles</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>76%</ThemedText>
            <ThemedText style={styles.statLabel}>Win Rate</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={styles.statValue}>2187</ThemedText>
            <ThemedText style={styles.statLabel}>Points</ThemedText>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <ThemedText style={styles.sectionTitle}>Battle Honors</ThemedText>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementCard}>
              <ThemedText style={styles.achievementTitle}>🏆 League Champion</ThemedText>
              <ThemedText style={styles.achievementDesc}>Season 3 Victor</ThemedText>
            </View>
            <View style={styles.achievementCard}>
              <ThemedText style={styles.achievementTitle}>⚔️ Veteran</ThemedText>
              <ThemedText style={styles.achievementDesc}>100+ Battles</ThemedText>
            </View>
            <View style={styles.achievementCard}>
              <ThemedText style={styles.achievementTitle}>🎯 Tactical Genius</ThemedText>
              <ThemedText style={styles.achievementDesc}>10 Perfect Victories</ThemedText>
            </View>
            </View>
         </View>
      </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    
  },
  heroBanner: {
    height: 200,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  profileSection: {
    padding: 20,
    marginTop: -50,
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#ffd33d',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#ffd33d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  levelText: {
    color: '#25292e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  nameContainer: {
    marginTop: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 16,
    color: '#ffd33d',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    padding: 10,
  },
  statCard: {
    backgroundColor: '#2a2e35',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: '#ffd33d22',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffd33d',
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
  achievementsSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  achievementsGrid: {
    gap: 10,
  },
  achievementCard: {
    backgroundColor: '#2a2e35',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd33d22',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  achievementDesc: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});