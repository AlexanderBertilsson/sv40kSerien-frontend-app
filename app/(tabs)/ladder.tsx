import { View, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { Link } from 'expo-router';
import { useColorScheme } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useTeams } from '@/hooks/useTeams';

export default function LadderScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { teamsQuery: { data: teams, isLoading: loading, error } } = useTeams();

  // Sort teams by rank ascending (1 is top)
  const sortedTeams = (teams || []).slice().sort((a, b) => a.rank - b.rank);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>    
      <ThemedText style={[styles.title, { color: theme.text }]}>Team Ladder</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      {loading && <ThemedText style={{ color: theme.text }}>Loading teams...</ThemedText>}
      {error && <ThemedText style={{ color: theme.error }}>{error instanceof Error ? error.message : 'Failed to fetch teams'}</ThemedText>}
      {!loading && !error && sortedTeams.map((team) => (
        <View key={team.id} style={[styles.card, { backgroundColor: theme.secondary }]}>  
          <View style={styles.row}>
            <View style={styles.rankCircle}>
              <ThemedText style={styles.rankText}>{team.rank}</ThemedText>
            </View>
            <Image
              source={{ uri: team.logo || 'https://images.unsplash.com/photo-1599753894977-bc6c46289a76?q=80&w=400' }}
              style={styles.logo}
            />
            <View style={styles.teamInfo}>
              <Link href={`/team/${team.id}`} asChild>
                <Text style={{
                  fontWeight: 'bold',
                  color: theme.tint,
                  fontSize: 20,
                  marginBottom: 2,
                }}>{team.name}</Text>
              </Link>
              <ThemedText style={styles.teamStats}>
                Win Rate: <ThemedText style={{ color: theme.tint }}>{(team.gameStats?.winRate * 100).toFixed(1)}%</ThemedText> | 
                Avg VP: <ThemedText style={{ color: theme.tint }}>{team.gameStats?.avgVictoryPoints}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.teamStats}>
                Sportsmanship: <ThemedText style={{ color: theme.tint }}>{team.sportsmanshipScore.toFixed(2)}</ThemedText>
              </ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 6,
  },
  separator: {
    height: 2,
    marginBottom: 16,
    borderRadius: 2,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E59500',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#ccc',
  },
  teamInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  teamStats: {
    fontSize: 14,
    opacity: 0.8,
  },
});
