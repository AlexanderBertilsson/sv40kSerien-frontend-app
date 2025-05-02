import { View, StyleSheet, useColorScheme, Image, ScrollView } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import TeamMembersPreview from '@/components/team/TeamMembersPreview';
import { useLocalSearchParams } from 'expo-router';
import { useTeam } from '@/hooks/useTeam';
import { useUsers } from '@/hooks/useUsers';

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
  const { users } = useUsers({ teamId: teamId as string });
  const { team, error } = useTeam(teamId as string);
  if(!team){
    return null;
  } 
  if(error) return null;
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: team.banner }}
          style={styles.bannerImage}
        />
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: team.logo }}
            style={styles.logoImage}
          />
        </View>
      </View>

      {/* Team Info */}
      <View style={styles.teamInfo}>
        <ThemedText style={styles.teamName}>{team.name}</ThemedText>
        <View style={styles.statsContainer}>
          <StatItem
            icon="star"
            value={team.sportsmanshipScore.toFixed(1)}
            label="Sportsmanship"
            theme={theme}
          />
          <StatItem
            icon="trophy"
            value={`${team.gameStats.winRate}%`}
            label="Win Rate"
            theme={theme}
          />
          <StatItem
            icon="gamepad"
            value={team.gameStats.avgVictoryPoints.toString()}
            label="Average Victory Points"
            theme={theme}
          />
        </View>
      </View>

      {/* Team Members Preview */}
      <TeamMembersPreview members={users} teamId={teamId as string} />

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
      <View style={styles.eventsSection}>
        <ThemedText style={styles.sectionTitle}>Upcoming Events</ThemedText>
        {team.calendar!.length > 0 ? (
          <ThemedText style={styles.eventCount}>
            {team.calendar!.length} upcoming events
          </ThemedText>
        ) : (
          <ThemedText style={styles.noEvents}>No upcoming events</ThemedText>
        )}
      </View>
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
});
