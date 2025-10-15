import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ThemedText from '../ThemedText';
import { EventTeam } from '../../../types/Event';

import { UserRow } from '../UserRow';

interface EventParticipantsProps {
  roster: EventTeam[];
  theme: any;
}

const EventParticipants = ({ roster, theme }: EventParticipantsProps) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<number>>(new Set());
  
  // Toggle team expansion
  const toggleTeamExpansion = (index: number) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getSportsmanshipColor = (level: number) => {
    if (level >= 4) return '#4CAF50'; // Green for high sportsmanship
    if (level >= 3) return '#FFC107'; // Yellow for medium sportsmanship
    return '#F44336'; // Red for low sportsmanship
  };

  const getSportsmanshipLabel = (level: number) => {
    if (level >= 4) return 'Excellent';
    if (level >= 3) return 'Good';
    if (level >= 2) return 'Fair';
    return 'Poor';
  };

  return (
    <View style={styles.sectionContainer}>
      <ThemedText type="subtitle">Participants ({roster?.length || 0} Teams)</ThemedText>
      <View style={[styles.separator, { backgroundColor: theme.secondary }]} />
      
      {roster && roster.length > 0 ? (
        <View style={styles.mobileContainer}>
          {roster.map((team, index) => {
            const isExpanded = expandedTeams.has(index);
            return (
              <View key={index} style={[styles.teamCard, { backgroundColor: theme.secondary }]}>
                {/* Team Header */}
                <TouchableOpacity 
                  style={styles.teamHeader}
                  onPress={() => toggleTeamExpansion(index)}
                  activeOpacity={0.7}
                >
                  <View style={styles.teamInfo}>
                    {team.logoUrl ? (
                      <Image 
                        source={{ uri: team.logoUrl }} 
                        style={styles.teamLogo}
                      />
                    ) : (
                      <View style={[styles.teamLogoPlaceholder, { backgroundColor: theme.tint }]}>
                        <ThemedText style={styles.teamLogoText}>
                          {team.teamName.charAt(0).toUpperCase()}
                        </ThemedText>
                      </View>
                    )}
                    <View style={styles.teamDetails}>
                      <ThemedText type="defaultSemiBold" style={styles.teamName}>
                        {team.teamName}
                      </ThemedText>
                      <View style={styles.sportsmanshipContainer}>
                        <View style={[
                          styles.sportsmanshipBadge, 
                          { backgroundColor: getSportsmanshipColor(team.sportsmanshipLvl) }
                        ]}>
                          <ThemedText style={styles.sportsmanshipText}>
                            {getSportsmanshipLabel(team.sportsmanshipLvl)} ({team.sportsmanshipLvl}/5)
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.teamStats}>
                    <ThemedText style={styles.playerCount}>
                      {team.users.length} {team.users.length === 1 ? 'Player' : 'Players'}
                    </ThemedText>
                    <ThemedText style={[styles.expandIcon, { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }]}>
                      ▼
                    </ThemedText>
                  </View>
                </TouchableOpacity>

                {/* Team Members - Expandable */}
                {isExpanded && (
                  <View style={styles.membersContainer}>
                    <View style={[styles.membersSeparator, { backgroundColor: theme.background }]} />
                    <ThemedText type="subtitle" style={styles.membersTitle}>
                      Team Members
                    </ThemedText>
                    
                    <View style={styles.membersGridMobile}>
                      {team.users.map((user) => <UserRow key={user.id} user={user} theme={theme} showSportsmanship />)}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No teams registered yet</ThemedText>
          <ThemedText style={styles.emptyStateSubtext}>Be the first to join this event!</ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 24,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  mobileContainer: {
    flexDirection: 'column',
  },
  teamCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  teamLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamLogoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    marginBottom: 4,
  },
  sportsmanshipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sportsmanshipBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportsmanshipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamStats: {
    alignItems: 'flex-end',
  },
  playerCount: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  expandIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  membersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  membersSeparator: {
    height: 1,
    width: '100%',
    marginBottom: 12,
  },
  membersTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  membersGridMobile: {
    flexDirection: 'column',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
});

export default EventParticipants;
