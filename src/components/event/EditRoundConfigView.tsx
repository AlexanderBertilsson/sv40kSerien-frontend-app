import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { hexToRgba } from '@/src/constants/Colors';
import { useRoundConfigAdmin } from '@/src/hooks/useRoundConfigAdmin';
import {
  Deployment,
  LayoutOptionDto,
  RoundConfigRequestItem,
} from '@/types/EventAdmin';

interface EditRoundConfigViewProps {
  eventId: string;
  numberOfRounds: number;
  playersPerTeam: number;
  theme: any;
}

const DEPLOYMENT_LABELS: Record<Deployment, string> = {
  search_and_destroy: 'Search and Destroy',
  tipping_point: 'Tipping Point',
  hammer_and_anvil: 'Hammer and Anvil',
  dawn_of_war: 'Dawn of War',
  crucible_of_battle: 'Crucible of Battle',
  sweeping_engagement: 'Sweeping Engagement',
};

interface RoundState {
  deployment: Deployment | null;
  primaryMissionId: number | null;
  layoutIds: string[];
}

const EditRoundConfigView = ({
  eventId,
  numberOfRounds,
  playersPerTeam,
  theme,
}: EditRoundConfigViewProps) => {
  const {
    configOptionsQuery,
    roundConfigs,
    roundConfigsLoading,
    saveRoundConfigMutation,
  } = useRoundConfigAdmin(eventId, numberOfRounds);

  const [rounds, setRounds] = useState<RoundState[]>([]);
  const [expandedRound, setExpandedRound] = useState<number | null>(0);
  const hasInitialized = useRef(false);

  // Initialize round state from existing config once when data arrives
  useEffect(() => {
    if (hasInitialized.current) return;
    if (roundConfigsLoading) return;

    hasInitialized.current = true;
    const initial: RoundState[] = [];
    for (let i = 0; i < numberOfRounds; i++) {
      const existing = roundConfigs.find(
        (rc) => rc.roundNumber === i + 1
      );
      initial.push({
        deployment: existing?.deployment ?? null,
        primaryMissionId: existing?.primaryMission?.id ?? null,
        layoutIds: existing?.layouts?.map((l) => l.id) ?? [],
      });
    }
    setRounds(initial);
  }, [numberOfRounds, roundConfigs, roundConfigsLoading]);

  const options = configOptionsQuery.data;
  const isLoading = configOptionsQuery.isLoading || roundConfigsLoading;

  const updateRound = (index: number, updates: Partial<RoundState>) => {
    setRounds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleDeploymentChange = (roundIndex: number, deployment: Deployment) => {
    // Reset layouts when deployment changes since they're filtered by deployment
    updateRound(roundIndex, { deployment, layoutIds: [] });
  };

  const toggleLayout = (roundIndex: number, layoutId: string) => {
    const round = rounds[roundIndex];
    const isSelected = round.layoutIds.includes(layoutId);
    if (isSelected) {
      updateRound(roundIndex, {
        layoutIds: round.layoutIds.filter((id) => id !== layoutId),
      });
    } else if (round.layoutIds.length < playersPerTeam) {
      updateRound(roundIndex, {
        layoutIds: [...round.layoutIds, layoutId],
      });
    }
  };

  const getFilteredLayouts = (deployment: Deployment | null): LayoutOptionDto[] => {
    if (!deployment || !options?.layouts) return [];
    return options.layouts.filter((l) => l.deployment === deployment);
  };

  const isValid = rounds.every(
    (r) =>
      r.deployment !== null &&
      r.primaryMissionId !== null &&
      r.layoutIds.length === playersPerTeam
  );

  const handleSave = () => {
    const request: RoundConfigRequestItem[] = rounds.map((r, i) => ({
      roundNumber: i + 1,
      deployment: r.deployment!,
      primaryMissionId: r.primaryMissionId!,
      layoutIds: r.layoutIds,
    }));
    saveRoundConfigMutation.mutate({ rounds: request });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        {rounds.map((round, roundIndex) => {
          const isExpanded = expandedRound === roundIndex;
          const filteredLayouts = getFilteredLayouts(round.deployment);
          const roundComplete =
            round.deployment !== null &&
            round.primaryMissionId !== null &&
            round.layoutIds.length === playersPerTeam;

          return (
            <View
              key={roundIndex}
              style={[styles.roundCard, { backgroundColor: theme.background }]}
            >
              <TouchableOpacity
                style={styles.roundHeader}
                onPress={() =>
                  setExpandedRound(isExpanded ? null : roundIndex)
                }
              >
                <View style={styles.roundHeaderLeft}>
                  <ThemedText type="defaultSemiBold">
                    Round {roundIndex + 1}
                  </ThemedText>
                  {roundComplete && (
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: hexToRgba('#4CAF50', 0.2) },
                      ]}
                    >
                      <ThemedText style={{ color: '#4CAF50', fontSize: 11 }}>
                        Configured
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={{ opacity: 0.5 }}>
                  {isExpanded ? '▲' : '▼'}
                </ThemedText>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.roundContent}>
                  {/* Mission Selection */}
                  <ThemedText style={styles.sectionLabel}>Mission</ThemedText>
                  <View style={styles.optionGrid}>
                    {options?.primaryMissions?.map((mission) => (
                      <TouchableOpacity
                        key={mission.id}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor:
                              round.primaryMissionId === mission.id
                                ? theme.tint
                                : hexToRgba(theme.text, 0.1),
                          },
                        ]}
                        onPress={() =>
                          updateRound(roundIndex, {
                            primaryMissionId: mission.id,
                          })
                        }
                      >
                        <ThemedText
                          style={{
                            color:
                              round.primaryMissionId === mission.id
                                ? '#fff'
                                : theme.text,
                            fontSize: 12,
                          }}
                        >
                          {mission.name}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Deployment Selection */}
                  <ThemedText style={styles.sectionLabel}>Deployment</ThemedText>
                  <View style={styles.optionGrid}>
                    {options?.deployments?.map((dep) => (
                      <TouchableOpacity
                        key={dep}
                        style={[
                          styles.optionChip,
                          {
                            backgroundColor:
                              round.deployment === dep
                                ? theme.tint
                                : hexToRgba(theme.text, 0.1),
                          },
                        ]}
                        onPress={() =>
                          handleDeploymentChange(roundIndex, dep)
                        }
                      >
                        <ThemedText
                          style={{
                            color:
                              round.deployment === dep ? '#fff' : theme.text,
                            fontSize: 12,
                          }}
                        >
                          {DEPLOYMENT_LABELS[dep]}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Layout Selection */}
                  {round.deployment && (
                    <>
                      <ThemedText style={styles.sectionLabel}>
                        Layouts ({round.layoutIds.length}/{playersPerTeam})
                      </ThemedText>
                      {filteredLayouts.length === 0 ? (
                        <ThemedText style={{ opacity: 0.5, marginBottom: 8 }}>
                          No layouts available for this deployment
                        </ThemedText>
                      ) : (
                        <View style={styles.layoutGrid}>
                          {filteredLayouts.map((layout) => {
                            const isSelected = round.layoutIds.includes(
                              layout.id
                            );
                            const atLimit =
                              round.layoutIds.length >= playersPerTeam;
                            return (
                              <TouchableOpacity
                                key={layout.id}
                                style={[
                                  styles.layoutCard,
                                  {
                                    borderColor: isSelected
                                      ? theme.tint
                                      : hexToRgba(theme.text, 0.2),
                                    borderWidth: isSelected ? 2 : 1,
                                    opacity:
                                      !isSelected && atLimit ? 0.4 : 1,
                                  },
                                ]}
                                onPress={() =>
                                  toggleLayout(roundIndex, layout.id)
                                }
                                disabled={!isSelected && atLimit}
                              >
                                {layout.imageUrl ? (
                                  <Image
                                    source={{ uri: layout.imageUrl }}
                                    style={styles.layoutImage}
                                    resizeMode="contain"
                                  />
                                ) : (
                                  <View
                                    style={[
                                      styles.layoutImagePlaceholder,
                                      {
                                        backgroundColor: hexToRgba(
                                          theme.text,
                                          0.05
                                        ),
                                      },
                                    ]}
                                  />
                                )}
                                <ThemedText
                                  style={styles.layoutName}
                                  numberOfLines={2}
                                >
                                  {layout.name}
                                </ThemedText>
                                {isSelected && (
                                  <View
                                    style={[
                                      styles.selectedIndicator,
                                      { backgroundColor: theme.tint },
                                    ]}
                                  >
                                    <ThemedText
                                      style={{
                                        color: '#fff',
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ✓
                                    </ThemedText>
                                  </View>
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          {
            backgroundColor: isValid ? theme.tint : hexToRgba(theme.tint, 0.4),
          },
        ]}
        onPress={handleSave}
        disabled={!isValid || saveRoundConfigMutation.isPending}
      >
        {saveRoundConfigMutation.isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
            Save Round Configuration
          </ThemedText>
        )}
      </TouchableOpacity>

      {saveRoundConfigMutation.isError && (
        <ThemedText style={styles.errorText}>
          {saveRoundConfigMutation.error?.message || 'Failed to save'}
        </ThemedText>
      )}

      {saveRoundConfigMutation.isSuccess && (
        <ThemedText style={styles.successText}>
          Configuration saved!
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  scrollContent: {
    flex: 1,
  },
  roundCard: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  roundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  roundHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roundContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  layoutCard: {
    width: '48%',
    borderRadius: 8,
    padding: 8,
    position: 'relative',
  },
  layoutImage: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginBottom: 4,
  },
  layoutImagePlaceholder: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginBottom: 4,
  },
  layoutName: {
    fontSize: 11,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
  },
});

export default EditRoundConfigView;
