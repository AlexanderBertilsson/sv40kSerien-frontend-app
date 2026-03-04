import { View, StyleSheet, useColorScheme, ActivityIndicator, Image, ScrollView, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import apiClient from '@/src/components/httpClient/httpClient';
import { EventTeamStandingsDto } from '@/types/EventAdmin';
import { useEventContext } from '@/src/contexts/EventContext';

interface PlacingsViewProps {
  eventId: string;
}

export default function PlacingsView({ eventId }: PlacingsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { width: windowWidth } = useWindowDimensions();
  const { eventTeamId } = useEventContext();

  const standingsQuery = useQuery<EventTeamStandingsDto[]>({
    queryKey: ['eventStandings', eventId],
    queryFn: async () => {
      const res = await apiClient.get<EventTeamStandingsDto[]>(`/Events/${eventId}/standings`);
      return res.data;
    },
    enabled: !!eventId,
  });

  const rawStandings = standingsQuery.data ?? [];
  const activeStandings = rawStandings.filter((e) => e.status !== 'dropped');
  const droppedStandings = rawStandings.filter((e) => e.status === 'dropped');
  const standings = [...activeStandings, ...droppedStandings];

  const roundCount = standings.reduce((max, entry) => {
    const len = entry.roundResults?.length ?? 0;
    return len > max ? len : max;
  }, 0);

  if (standingsQuery.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (standingsQuery.isError) {
    return (
      <View style={styles.container}>
        <ThemedText style={[styles.emptyText, { color: theme.error }]}>
          Failed to load standings.
        </ThemedText>
      </View>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle" style={styles.title}>Standings</ThemedText>
        <ThemedText style={styles.emptyText}>
          Standings will be available once matches have been played.
        </ThemedText>
      </View>
    );
  }

  const getRankStyle = (rank: number) => {
    if (rank === 1) return { backgroundColor: hexToRgba('#FFD700', 0.15), borderColor: '#FFD700' };
    if (rank === 2) return { backgroundColor: hexToRgba('#C0C0C0', 0.15), borderColor: '#C0C0C0' };
    if (rank === 3) return { backgroundColor: hexToRgba('#CD7F32', 0.15), borderColor: '#CD7F32' };
    return { backgroundColor: theme.secondary, borderColor: 'transparent' };
  };

  const contentMinWidth = 28 + 120 + roundCount * 38 + 32 * 3 + 44 + 32;
  const availableWidth = windowWidth - 40; // parent padding
  const tableMinWidth = Math.max(contentMinWidth, availableWidth);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Standings</ThemedText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: tableMinWidth }}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: theme.icon }]}>
            <ThemedText style={[styles.headerCell, styles.rankCol]}>#</ThemedText>
            <ThemedText style={[styles.headerCell, styles.teamCol]}>Team</ThemedText>
            {Array.from({ length: roundCount }, (_, i) => (
              <ThemedText key={`rh-${i}`} style={[styles.headerCell, styles.roundCol]}>
                R{i + 1}
              </ThemedText>
            ))}
            <ThemedText style={[styles.headerCell, styles.statCol]}>W</ThemedText>
            <ThemedText style={[styles.headerCell, styles.statCol]}>D</ThemedText>
            <ThemedText style={[styles.headerCell, styles.statCol]}>L</ThemedText>
            <ThemedText style={[styles.headerCell, styles.scoreCol]}>Score</ThemedText>
            <ThemedText style={[styles.headerCell, styles.statCol]}>Pts</ThemedText>
          </View>

          {/* Rows */}
          <ScrollView>
            {standings.map((entry) => {
              const isMyTeam = eventTeamId === entry.team?.id;
              const isDropped = entry.status === 'dropped';
              const rankStyle = isDropped
                ? { backgroundColor: hexToRgba(theme.error, 0.05), borderColor: hexToRgba(theme.error, 0.3) }
                : getRankStyle(entry.currentRank);

              return (
                <View
                  key={entry.team?.id ?? entry.currentRank}
                  style={[
                    styles.row,
                    { backgroundColor: rankStyle.backgroundColor, borderColor: isMyTeam && !isDropped ? theme.tint : rankStyle.borderColor },
                    isMyTeam && !isDropped && styles.myTeamRow,
                    isDropped && styles.droppedRow,
                  ]}
                >
                  <ThemedText style={[styles.cell, styles.rankCol, styles.rankText, isDropped && styles.droppedText]}>
                    {isDropped ? '-' : entry.currentRank}
                  </ThemedText>
                  <View style={[styles.teamCol, styles.teamCell]}>
                    {entry.team?.logoUrl ? (
                      <Image source={{ uri: entry.team.logoUrl }} style={[styles.teamLogo, isDropped && styles.droppedImage]} />
                    ) : (
                      <View style={[styles.teamLogoPlaceholder, { backgroundColor: theme.icon }]}>
                        <ThemedText style={styles.teamLogoText}>
                          {entry.team?.name?.charAt(0) || '?'}
                        </ThemedText>
                      </View>
                    )}
                    <ThemedText style={[styles.cell, styles.teamName, isDropped && styles.droppedText]} numberOfLines={1}>
                      {entry.team?.name || 'Unknown'}
                    </ThemedText>
                    {isDropped && (
                      <View style={styles.droppedBadge}>
                        <ThemedText style={styles.droppedBadgeText}>Dropped</ThemedText>
                      </View>
                    )}
                  </View>
                  {Array.from({ length: roundCount }, (_, i) => {
                    const round = entry.roundResults?.find((r) => r.roundNumber === i + 1);
                    const score = round?.differentialScore ?? null;
                    const scoreColor = !round ? theme.icon : round.isWinner ? theme.success : round.isDraw ? theme.info : theme.error;
                    return (
                      <ThemedText key={`r-${i}`} style={[styles.cell, styles.roundCol, { color: scoreColor }]}>
                        {round ? (round.isBye ? 'BYE' : `${score}`) : '-'}
                      </ThemedText>
                    );
                  })}
                  <ThemedText style={[styles.cell, styles.statCol, { color: theme.success }]}>{entry.matchesWon}</ThemedText>
                  <ThemedText style={[styles.cell, styles.statCol, { color: theme.info }]}>{entry.matchesDrawn}</ThemedText>
                  <ThemedText style={[styles.cell, styles.statCol, { color: theme.error }]}>{entry.matchesLost}</ThemedText>
                  <ThemedText style={[styles.cell, styles.scoreCol]}>{entry.accumulatedScore}</ThemedText>
                  <ThemedText style={[styles.cell, styles.statCol, styles.ptsText]}>{entry.matchPoints}</ThemedText>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 12,
  },
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.6,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  myTeamRow: {
    borderWidth: 1.5,
  },
  cell: {
    fontSize: 14,
    textAlign: 'center',
  },
  rankCol: {
    width: 28,
  },
  rankText: {
    fontWeight: '700',
    fontSize: 15,
  },
  teamCol: {
    flex: 1,
    minWidth: 0,
  },
  teamCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  teamLogoPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  teamName: {
    textAlign: 'left',
    fontWeight: '500',
    flexShrink: 1,
  },
  statCol: {
    width: 32,
  },
  roundCol: {
    width: 38,
  },
  scoreCol: {
    width: 44,
  },
  ptsText: {
    fontWeight: '700',
  },
  droppedRow: {
    opacity: 0.5,
  },
  droppedText: {
    opacity: 0.6,
  },
  droppedImage: {
    opacity: 0.5,
  },
  droppedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  droppedBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '700',
  },
});
