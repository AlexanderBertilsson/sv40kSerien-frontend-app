import { View, StyleSheet, ScrollView, Pressable, Image, useWindowDimensions } from 'react-native';
import ThemedText from '../../../../components/ThemedText';
import { Colors } from '../../../../constants/Colors';
import { useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { ARMY_LISTS } from '../../../../assets/constants/Armylists';
import { ArmyListModal } from '../../../../components/modals/armyListModal';
import { mockMatches } from '../../../../assets/constants/mockMatchData';

export default function MatchHistoryScreen() {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [selectedArmyList, setSelectedArmyList] = useState<string | null>(null);
  // const [armyListContent, setArmyListContent] = useState<string>('');
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const isDeviceSize = width < 768; // Tablet/desktop breakpoint

  const showArmyList = (listName: string) => {
    try {
      if (ARMY_LISTS[listName]) {
        // setArmyListContent(ARMY_LISTS[listName]);
        setSelectedArmyList(listName);
      } else {
        throw new Error('Army list not found');
      }
    } catch (error) {
      console.error('Error loading army list:', error);
      // setArmyListContent('Error loading army list. Please try again.');
      setSelectedArmyList(listName);
    }
  };

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
        {mockMatches.map((match) => (
          <Pressable
            key={match.id}
            style={[styles.matchCard, { backgroundColor: theme.secondary }]}
            onPress={() => toggleMatch(match.id)}
          >
            <View style={styles.matchHeader}>
              <View style={[styles.teamsInfo, isDeviceSize && styles.teamsInfoMobile]}>
                <Image 
                  source={{ uri: match.team.logo }} 
                  style={styles.teamLogo} 
                />
                <ThemedText style={[styles.teamName, isDeviceSize && styles.teamNameMobile]} numberOfLines={1}>
                  {match.team.name}
                </ThemedText>
              </View>
              <View style={styles.scoreContainer}>
                <MaterialCommunityIcons name="sword-cross" size={24} color={theme.tint} />
                <ThemedText 
                  style={[styles.score, { color: getScoreColor(match.score.team, match.score.opponent) }]}
                >
                  {match.score.team} - {match.score.opponent}
                </ThemedText>
              </View>
              <View style={[styles.teamsInfo, styles.teamsInfoRight, isDeviceSize && styles.teamsInfoMobile]}>
                <Image 
                  source={{ uri: match.opponent.logo }} 
                  style={styles.teamLogo} 
                />
                <ThemedText style={[styles.teamName, styles.textAlignRight, isDeviceSize && styles.teamNameMobile]} numberOfLines={1}>
                  {match.opponent.name}
                </ThemedText>
              </View>
            </View>
            <View style={styles.matchHeader}>
              <View style={styles.matchInfo}>
                <ThemedText style={styles.date}>{match.date}</ThemedText>
                <ThemedText style={styles.event}>{match.event}</ThemedText>
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
                        <Image source={{ uri: match.team.players[index].profileImage }} style={styles.playerImage} />
                        <View style={styles.playerDetails}>
                          <ThemedText style={styles.playerName}>{match.team.players[index].name}</ThemedText>
                          <ThemedText style={styles.faction}>{match.team.players[index].faction}</ThemedText>
                          <Pressable onPress={() => showArmyList(match.team.players[index].armyListUrl)}>
                            <ThemedText style={styles.armyListLink}>View Army List</ThemedText>
                          </Pressable>
                        </View>
                      </View>

                      <View style={styles.gameScoreContainer}>
                        <MaterialCommunityIcons name="sword-cross" size={20} color={theme.tint} />
                        <ThemedText style={[
                          styles.gameScore,
                          { color: getScoreColor(game.player1Score, game.player2Score) }
                        ]}>
                          {game.player1Score} - {game.player2Score}
                        </ThemedText>
                      </View>

                      <View style={[styles.playerInfo, styles.playerInfoRight]}>
                        <View style={[styles.playerDetails, styles.playerDetailsRight]}>
                          <ThemedText style={[styles.playerName, styles.textAlignRight]}>{match.opponent.players[index].name}</ThemedText>
                          <ThemedText style={[styles.faction, styles.textAlignRight]}>{match.opponent.players[index].faction}</ThemedText>
                          <Pressable onPress={() => showArmyList(match.opponent.players[index].armyListUrl)}>
                            <ThemedText style={[styles.armyListLink, styles.textAlignRight]}>View Army List</ThemedText>
                          </Pressable>
                        </View>
                        <Image source={{ uri: match.opponent.players[index].profileImage }} style={styles.playerImage} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  teamsInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  teamsInfoMobile: {
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
  },
  teamsInfoRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  teamLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  teamNameMobile: {
    textAlign: 'center',
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexShrink: 0,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  faction: {
    fontSize: 12,
    opacity: 0.7,
    flexWrap: 'wrap',
  },
  armyListLink: {
    fontSize: 12,
    color: '#4a9eff',
    marginTop: 2,
  },
  gameScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20%',
  },
  gameScore: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  playerDetailsRight: {
    alignItems: 'flex-end',
    marginLeft: 0,
    marginRight: 8,
  },
  textAlignRight: {
    textAlign: 'right',
  },
});