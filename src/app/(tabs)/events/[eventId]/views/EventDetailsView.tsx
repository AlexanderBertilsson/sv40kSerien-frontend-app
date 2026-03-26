import { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  Linking,
  Platform,
  Image,
} from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors, hexToRgba } from '@/src/constants/Colors';
import { Event } from '@/types/Event';
import { useRoundConfigs } from '@/src/hooks/useRoundConfigs';
import { useSeasons } from '@/src/hooks/useSeasons';
import { RoundConfigDto, Deployment } from '@/types/EventAdmin';

interface EventDetailsViewProps {
  event: Event;
}

const DEPLOYMENT_LABELS: Record<Deployment, string> = {
  search_and_destroy: 'Search and Destroy',
  tipping_point: 'Tipping Point',
  hammer_and_anvil: 'Hammer and Anvil',
  dawn_of_war: 'Dawn of War',
  crucible_of_battle: 'Crucible of Battle',
  sweeping_engagement: 'Sweeping Engagement',
};

const PAIRING_STRATEGY_LABELS: Record<string, string> = {
  dutch_swiss: 'Dutch Swiss',
  round_robin: 'Round Robin',
  manual: 'Manual',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}



function SectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  return (
    <View style={[styles.sectionHeader, { borderBottomColor: hexToRgba(theme.text, 0.3) }]}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
    </View>
  );
}

const WIDE_BREAKPOINT = 768;

function RoundCard({ config, theme }: { config: RoundConfigDto; theme: typeof Colors.dark }) {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const missionName = config.primaryMission?.name ?? 'Not set';
  const deploymentName = config.deployment ? DEPLOYMENT_LABELS[config.deployment] ?? config.deployment : 'Not set';

  return (
    <View style={[styles.roundCard, { backgroundColor: theme.secondary }]}>
      <TouchableOpacity
        style={styles.roundCardHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.roundCardHeaderLeft}>
          <ThemedText type="defaultSemiBold" style={styles.roundLabel}>Round {config.roundNumber}</ThemedText>
          <View style={[styles.roundDivider, { backgroundColor: hexToRgba(theme.text, 0.2) }]} />
          <ThemedText style={styles.roundMissionText} numberOfLines={1}>{missionName}</ThemedText>
          <View style={[styles.roundDivider, { backgroundColor: hexToRgba(theme.text, 0.2) }]} />
          <ThemedText style={styles.roundDeploymentText} numberOfLines={1}>{deploymentName}</ThemedText>
        </View>
        <ThemedText style={{ opacity: 0.5 }}>{expanded ? '\u25B2' : '\u25BC'}</ThemedText>
      </TouchableOpacity>

      {expanded && config.layouts && config.layouts.length > 0 && (
        <View style={styles.layoutsContainer}>
          <ThemedText style={[styles.layoutsLabel, { color: hexToRgba(theme.text, 0.6) }]}>
            Layouts
          </ThemedText>
          <View style={isWide ? styles.layoutGridWeb : styles.layoutGridMobile}>
            {config.layouts.map((layout) => (
              <View
                key={layout.id}
                style={[
                  isWide ? styles.layoutItemWeb : styles.layoutItemMobile,
                  { borderColor: hexToRgba(theme.text, 0.15) },
                ]}
              >
                {!isWide && (
                  <ThemedText style={styles.layoutNameMobile} numberOfLines={2}>{layout.name}</ThemedText>
                )}
                {layout.imageUrl ? (
                  <Image
                    source={{ uri: layout.imageUrl }}
                    style={[
                      isWide ? styles.layoutImageWeb : styles.layoutImageMobile,
                      { transform: [{ rotate: '90deg' }] },
                    ]}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.layoutImagePlaceholder, { backgroundColor: hexToRgba(theme.text, 0.05) }]} />
                )}
                {isWide && (
                  <ThemedText style={styles.layoutName} numberOfLines={2}>{layout.name}</ThemedText>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {expanded && (!config.layouts || config.layouts.length === 0) && (
        <View style={styles.layoutsContainer}>
          <ThemedText style={{ opacity: 0.5, fontSize: 13 }}>No layouts configured</ThemedText>
        </View>
      )}
    </View>
  );
}

export default function EventDetailsView({ event }: EventDetailsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { roundConfigs, isLoading: roundConfigsLoading } = useRoundConfigs(event.id, event.rounds);
  const { seasonsQuery } = useSeasons();
  const seasons = seasonsQuery.data || [];

  const seasonName = event.seasonId
    ? seasons.find((s) => s.id === event.seasonId)?.name ?? '...'
    : 'None';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const slotsText = event.maxParticipants
    ? `${event.numberOfRegisteredTeams} / ${event.maxParticipants}`
    : `${event.numberOfRegisteredTeams}`;

  const pairingLabel = event.pairingStrategy
    ? PAIRING_STRATEGY_LABELS[event.pairingStrategy] ?? event.pairingStrategy
    : '-';

  const handleOpenPlayerPack = () => {
    if (!event.playerPack) return;
    const url = /^https?:\/\//i.test(event.playerPack)
      ? event.playerPack
      : `https://${event.playerPack}`;
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
      {/* Meta Data Section */}
      <SectionHeader title="Event Info" />
      <View style={[styles.section, { backgroundColor: theme.secondary }]}>
        <InfoRow label="Title" value={event.title} />
        <InfoRow label="Season" value={seasonName} />
        <InfoRow label="Location" value={event.location || '-'} />
        <InfoRow label="Start Date" value={formatDate(event.startDate)} />
        <InfoRow label="End Date" value={formatDate(event.endDate)} />
        <InfoRow label="Pairing Strategy" value={pairingLabel} />
        <InfoRow label="Teams" value={slotsText} />
        {event.description ? (
          <View style={styles.descriptionContainer}>
            <ThemedText style={styles.infoLabel}>Description</ThemedText>
            <ThemedText style={styles.descriptionText}>{event.description}</ThemedText>
          </View>
        ) : null}
      </View>

      {/* FIDE Info Section */}
      {(event.initialTar != null || event.kFactor != null || event.weighting != null) && (
        <>
          <SectionHeader title="FIDE Rating Info" />
          <View style={[styles.section, { backgroundColor: theme.secondary }]}>
            {event.initialTar != null && <InfoRow label="Initial TAR" value={event.initialTar.toString()} />}
            {event.kFactor != null && <InfoRow label="K-Factor" value={event.kFactor.toString()} />}
            {event.weighting != null && <InfoRow label="Weighting" value={event.weighting.toString()} />}
          </View>
        </>
      )}

      {/* Player Pack Section */}
      {event.playerPack ? (
        <>
          <SectionHeader title="Player Pack" />
          <TouchableOpacity
            style={[styles.playerPackButton, { backgroundColor: theme.tint }]}
            onPress={handleOpenPlayerPack}
          >
            <ThemedText style={styles.playerPackText}>Open Player Pack</ThemedText>
          </TouchableOpacity>
        </>
      ) : null}

      {/* Round Configuration Section */}
      {event.rounds > 0 && (
        <>
          <SectionHeader title="Round Configuration" />
          {roundConfigsLoading ? (
            <ThemedText style={{ opacity: 0.5, marginTop: 8 }}>Loading rounds...</ThemedText>
          ) : roundConfigs.length === 0 ? (
            <ThemedText style={{ opacity: 0.5, marginTop: 8 }}>No round configuration set</ThemedText>
          ) : (
            <View style={styles.roundsList}>
              {roundConfigs
                .sort((a, b) => a.roundNumber - b.roundNumber)
                .map((config) => (
                  <RoundCard key={config.roundNumber} config={config} theme={theme} />
                ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    borderBottomWidth: 2,
    paddingBottom: 8,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  section: {
    borderRadius: 10,
    padding: 14,
  },
  infoRow: {
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingTop: 8,
  },
  descriptionText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  playerPackButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  playerPackText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  roundsList: {
    gap: 8,
  },
  roundCard: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  roundCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  roundCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  roundLabel: {
    fontSize: 14,
    width: 70,
  },
  roundDivider: {
    width: 1,
    height: 16,
  },
  roundMissionText: {
    fontSize: 14,
    width: 160,
    textAlign: 'center',
  },
  roundDeploymentText: {
    fontSize: 14,
    width: 160,
    textAlign: 'center',
  },
  layoutsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  layoutsLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  layoutGridWeb: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 10,
  },
  layoutGridMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  layoutItemWeb: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    borderWidth: 0,
    padding: 6,
    alignItems: 'center',
  },
  layoutItemMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    gap: 4,
  },
  layoutImageWeb: {
    width: '70%',
    aspectRatio: 1,
    borderRadius: 6,
    marginBottom: 4,
  },
  layoutImageMobile: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  layoutImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  layoutName: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
  },
  layoutNameMobile: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
