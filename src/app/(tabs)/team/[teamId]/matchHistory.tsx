import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { ArmyListModal } from '@/src/components/modals/armyListModal';
import { MatchCard, MatchData } from '@/src/components/match/MatchCard';
import { mockMatches } from '@/assets/constants/mockMatchData';

export default function MatchHistoryScreen() {
  const [selectedArmyList, setSelectedArmyList] = useState<string | null>(null);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const handleArmyListPress = (armyListUrl: string) => {
    setSelectedArmyList(armyListUrl);
  };

  // Transform mock data to MatchData format
  const transformedMatches: MatchData[] = mockMatches.map((match) => ({
    id: match.id,
    date: match.date,
    event: match.event,
    team1: {
      name: match.team.name,
      logo: match.team.logo,
      players: match.team.players,
    },
    team2: {
      name: match.opponent.name,
      logo: match.opponent.logo,
      players: match.opponent.players,
    },
    team1Score: match.score.team,
    team2Score: match.score.opponent,
    isCompleted: true,
    games: match.games,
    primaryMission: match.primaryMission,
    deploymentMap: match.deploymentMap,
    missionRules: match.missionRules,
  }));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Match History</ThemedText>
      </View>

      <View style={styles.matchList}>
        {transformedMatches.map((match) => (
          <View key={match.id} style={styles.matchCardWrapper}>
            <MatchCard
              match={match}
              expandable={true}
              onArmyListPress={handleArmyListPress}
            />
          </View>
        ))}
      </View>

      <ArmyListModal
        visible={!!selectedArmyList}
        onClose={() => setSelectedArmyList(null)}
        armyListId={""}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  matchList: {
    padding: 16,
    gap: 12,
  },
  matchCardWrapper: {
    marginBottom: 12,
  },
});