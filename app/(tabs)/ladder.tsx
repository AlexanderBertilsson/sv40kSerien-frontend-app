import { View, StyleSheet, ScrollView, Image, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useLadder } from '@/hooks/useLadder';
import { useSeasons } from '@/hooks/useSeasons';
import { Season } from '@/types/Season';


export default function LadderScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  const { seasonsQuery: { data: seasons, isLoading: seasonsLoading } } = useSeasons();
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Set default season when seasons are loaded
  useEffect(() => {
    if (seasons && seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  const { ladderQuery: { data: ladder, isLoading: loading, error } } = useLadder(selectedSeason?.name);
  const handleSeasonSelect = (season: Season) => {
    setSelectedSeason(season);
    setDropdownVisible(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>    
      {/* Season Card */}
      {seasonsLoading ? (
        <ActivityIndicator size="large" color={theme.tint} />
      ) : selectedSeason ? (
        <View style={[styles.seasonCard, { backgroundColor: theme.secondary }]}>
          <View style={styles.seasonHeader}>
            <View style={styles.seasonInfo}>
              <ThemedText style={[styles.seasonName, { color: theme.text }]}>
                {selectedSeason.name}
              </ThemedText>
              <ThemedText style={[styles.seasonDates, { color: theme.text, opacity: 0.7 }]}>
                {new Date(selectedSeason.startDate).toLocaleDateString()} - {new Date(selectedSeason.endDate).toLocaleDateString()}
              </ThemedText>
            </View>
            <TouchableOpacity 
              style={[styles.dropdownButton, { backgroundColor: theme.background }]}
              onPress={() => setDropdownVisible(true)}
            >
              <ThemedText style={[styles.dropdownButtonText, { color: theme.tint }]}>
                Change Season
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ThemedText style={{ color: theme.text }}>No season selected</ThemedText>
      )}
      
      {/* Season Dropdown Modal */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={[styles.dropdownContainer, { backgroundColor: theme.secondary }]}>
            <ThemedText style={[styles.dropdownTitle, { color: theme.text }]}>Select Season</ThemedText>
            <FlatList
              data={seasons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.dropdownItem, selectedSeason?.id === item.id && { backgroundColor: theme.tint + '20' }]}
                  onPress={() => handleSeasonSelect(item)}
                >
                  <ThemedText style={[styles.dropdownItemText, { color: theme.text }]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.dropdownItemDates, { color: theme.text, opacity: 0.6 }]}>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
      
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      {loading && <ThemedText style={{ color: theme.text }}>Loading teams...</ThemedText>}
      {error && <ThemedText style={{ color: theme.error }}>{error instanceof Error ? error.message : 'Failed to fetch teams'}</ThemedText>}
      {!loading && !error && ladder?.map((row, index) => (
        <View key={row.id} style={[styles.card, { backgroundColor: theme.secondary }]}>  
          <View style={styles.row}>
            <View style={styles.rankCircle}>
              <ThemedText style={styles.rankText}>{index + 1}</ThemedText>
            </View>
            <Image
              source={{ uri: row.team.logoUrl || 'https://images.unsplash.com/photo-1599753894977-bc6c46289a76?q=80&w=400' }}
              style={styles.logo}
            />
            <View style={styles.teamInfo}>
              <Link href={`/team/${row.team.id}`} asChild>
                <Text style={{
                  fontWeight: 'bold',
                  color: theme.tint,
                  fontSize: 20,
                  marginBottom: 2,
                }}>{row.team.name}</Text>
              </Link>
              <ThemedText style={styles.teamStats}>
                Wins: <ThemedText style={{ color: theme.tint }}>{row.gamesWon}</ThemedText> | 
                Draws: <ThemedText style={{ color: theme.tint }}>{row.gamesDrawn}</ThemedText> | 
                Losses: <ThemedText style={{ color: theme.tint }}>{row.gamesLost}</ThemedText> | 
                Score: <ThemedText style={{ color: theme.tint }}>{row.score}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.teamStats}>
                Sportsmanship: <ThemedText style={{ color: theme.tint }}>{row.team.sportsmanshipLvl}</ThemedText>
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
  seasonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonInfo: {
    flex: 1,
  },
  seasonName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  seasonDates: {
    fontSize: 14,
  },
  dropdownButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E59500',
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  dropdownItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  dropdownItemDates: {
    fontSize: 12,
  },
});
