import { View, StyleSheet, ScrollView, Pressable, Image, Modal } from 'react-native';
import { ThemedText } from '../../../../components/ThemedText';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { ARMY_LISTS } from '../../../../assets/constants/Armylists';

interface Player {
  id: string;
  name: string;
  profileImage: string;
  faction: string;
  armyListUrl: string;
}

interface Game {
  player1Score: number;
  player2Score: number;
}

interface Match {
  id: string;
  date: string;
  player1: Player;
  player2: Player;
  games: Game[];
  primaryMission: string;
  deploymentMap: string;
  missionRules: string[];
  result: 'win' | 'loss' | 'draw';
  score: {
    team: number;
    opponent: number;
  };
  event: string;
}

export default function MatchHistoryScreen() {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedArmyList, setSelectedArmyList] = useState<string | null>(null);
  const [armyListContent, setArmyListContent] = useState<string>('');
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const showArmyList = (listUrl: string) => {
    try {
      // Extract list name from URL (e.g., 'NewRecruit-WTC' from '/Docs/ArmyLists/NewRecruit-WTC.txt')
      const listName = listUrl.split('/').pop()?.replace('.txt', '');
      if (listName && ARMY_LISTS[listName]) {
        setArmyListContent(ARMY_LISTS[listName]);
        setSelectedArmyList(listUrl);
      } else {
        throw new Error('Army list not found');
      }
    } catch (error) {
      console.error('Error loading army list:', error);
      setArmyListContent('Error loading army list. Please try again.');
      setSelectedArmyList(listUrl);
    }
  };

  // Mock match data
  const matches: Match[] = [
    {
      id: '1',
      date: '2025-03-28',
      player1: {
        id: '1',
        name: 'John Doe',
        profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
        faction: 'Chaos Daemons',
        armyListUrl: '/Docs/ArmyLists/NewRecruit-WTC.txt'
      },
      player2: {
        id: '2',
        name: 'Jane Smith',
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
        faction: 'Space Marines',
        armyListUrl: '/Docs/ArmyLists/NewRecruit-GW.txt'
      },
      games: [
        { player1Score: 15, player2Score: 5 },
        { player1Score: 8, player2Score: 12 },
        { player1Score: 10, player2Score: 10 },
        { player1Score: 20, player2Score: 0 },
        { player1Score: 7, player2Score: 13 }
      ],
      primaryMission: 'Take and Hold',
      deploymentMap: 'Hammer and Anvil',
      missionRules: ['No Man\'s Land', 'Objective Secured'],
      result: 'win',
      score: { team: 95, opponent: 85 },
      event: 'League Match'
    },
  ];

  const toggleMatch = (matchId: string) => {
    setExpandedMatch(expandedMatch === matchId ? null : matchId);
  };

  const getScoreColor = (score1: number, score2: number) => {
    if (score1 > score2) return theme.success;
    if (score1 < score2) return theme.error;
    return theme.text;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Match History</ThemedText>
      </View>

      <View style={styles.matchList}>
        {matches.map((match) => (
          <Pressable
            key={match.id}
            style={[styles.matchCard, { backgroundColor: theme.secondary }]}
            onPress={() => toggleMatch(match.id)}
          >
            <View style={styles.matchHeader}>
              <View style={styles.matchInfo}>
                <ThemedText style={styles.date}>{match.date}</ThemedText>
                <ThemedText style={styles.event}>{match.event}</ThemedText>
              </View>
              <View style={styles.scoreContainer}>
                <ThemedText 
                  style={[styles.score, { color: getScoreColor(match.score.team, match.score.opponent) }]}
                >
                  {match.score.team} - {match.score.opponent}
                </ThemedText>
              </View>
              <FontAwesome
                name={expandedMatch === match.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.text}
              />
            </View>

            {expandedMatch === match.id && (
              <View style={styles.expandedContent}>
                <View style={styles.missionInfo}>
                  <ThemedText style={styles.missionTitle}>Mission Details</ThemedText>
                  <ThemedText style={styles.missionDetail}>Primary: {match.primaryMission}</ThemedText>
                  <ThemedText style={styles.missionDetail}>Deployment: {match.deploymentMap}</ThemedText>
                  <ThemedText style={styles.missionDetail}>Rules: {match.missionRules.join(', ')}</ThemedText>
                </View>

                <View style={styles.gamesContainer}>
                  <ThemedText style={styles.gamesTitle}>Individual Games</ThemedText>
                  {match.games.map((game, index) => (
                    <View key={index} style={styles.gameRow}>
                      <View style={styles.playerInfo}>
                        <Image source={{ uri: match.player1.profileImage }} style={styles.playerImage} />
                        <View style={styles.playerDetails}>
                          <ThemedText style={styles.playerName}>{match.player1.name}</ThemedText>
                          <ThemedText style={styles.faction}>{match.player1.faction}</ThemedText>
                          <Pressable onPress={() => showArmyList(match.player1.armyListUrl)}>
                            <ThemedText style={styles.armyListLink}>View Army List</ThemedText>
                          </Pressable>
                        </View>
                      </View>

                      <ThemedText style={[styles.gameScore, { 
                        color: getScoreColor(game.player1Score, game.player2Score)
                      }]}>
                        {game.player1Score} - {game.player2Score}
                      </ThemedText>

                      <View style={[styles.playerInfo, styles.playerInfoRight]}>
                        <View style={styles.playerDetails}>
                          <ThemedText style={styles.playerName}>{match.player2.name}</ThemedText>
                          <ThemedText style={styles.faction}>{match.player2.faction}</ThemedText>
                          <Pressable onPress={() => showArmyList(match.player2.armyListUrl)}>
                            <ThemedText style={styles.armyListLink}>View Army List</ThemedText>
                          </Pressable>
                        </View>
                        <Image source={{ uri: match.player2.profileImage }} style={styles.playerImage} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Modal visible={!!selectedArmyList} animationType="slide" transparent>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Army List</ThemedText>
              <Pressable onPress={() => setSelectedArmyList(null)}>
                <FontAwesome name="close" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.armyListContent}>
              <ThemedText style={styles.armyListText}>{armyListContent}</ThemedText>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  matchCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
  },
  event: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  scoreContainer: {
    marginHorizontal: 16,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  missionInfo: {
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  missionDetail: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  gamesContainer: {
    marginTop: 8,
  },
  gamesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInfoRight: {
    justifyContent: 'flex-end',
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerDetails: {
    marginHorizontal: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  faction: {
    fontSize: 12,
    opacity: 0.7,
  },
  armyListLink: {
    fontSize: 12,
    color: '#4a9eff',
    marginTop: 2,
  },
  gameScore: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  armyListContent: {
    flex: 1,
  },
  armyListText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'monospace',
    whiteSpace: 'pre',
  },
});