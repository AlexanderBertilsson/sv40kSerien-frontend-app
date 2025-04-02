import { View, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';

type MatchRole = 'First Defender' | 'Second Defender' | 'Attacker' | 'Blunter' | 'Refused';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  sportsmanshipRating: number;
  favoriteArmy: string;
  gamesPlayed: number;
  winRate: number;
  profileImage: string;
  commonMatchRole: MatchRole;
}

export default function TeamMembersScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  // TODO: Replace with API call
  const members: TeamMember[] = [
    {
      id: '1',
      name: 'John Doe',
      role: 'Team Captain',
      sportsmanshipRating: 4.5,
      favoriteArmy: 'Space Marines',
      gamesPlayed: 15,
      winRate: 70,
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
      commonMatchRole: 'First Defender',
    },
    {
      id: '2',
      name: 'Jane Smith',
      role: 'Coach',
      sportsmanshipRating: 4.8,
      favoriteArmy: 'Tyranids',
      gamesPlayed: 20,
      winRate: 65,
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
      commonMatchRole: 'Attacker',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      role: 'Player',
      sportsmanshipRating: 4.2,
      favoriteArmy: 'Orks',
      gamesPlayed: 10,
      winRate: 60,
      profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400",
      commonMatchRole: 'Blunter',
    },
  ];

  const toggleMember = (memberId: string) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Team Members</ThemedText>
      </View>
      <View style={styles.membersList}>
        {members.map((member) => (
          <Pressable
            key={member.id}
            style={[
              styles.memberCard,
              { backgroundColor: theme.secondary },
            ]}
            onPress={() => toggleMember(member.id)}
          >
            <View style={styles.memberHeader}>
              <Image
                source={{ uri: member.profileImage }}
                style={styles.profileImage}
              />
              <View style={styles.memberBasicInfo}>
                <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
              </View>
              <FontAwesome
                name={expandedMember === member.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.text}
              />
            </View>
            {expandedMember === member.id && (
              <View style={styles.memberDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesome name="star" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Sportsmanship</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {member.sportsmanshipRating.toFixed(1)}
                    </ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome name="trophy" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Win Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>{member.winRate}%</ThemedText>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesome name="gamepad" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Games Played</ThemedText>
                    <ThemedText style={styles.detailValue}>{member.gamesPlayed}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome name="cube" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Favorite Army</ThemedText>
                    <ThemedText style={styles.detailValue}>{member.favoriteArmy}</ThemedText>
                  </View>
                </View>
                <View style={[styles.detailRow, styles.matchRoleRow]}>
                  <View style={styles.detailItem}>
                    <FontAwesome 
                      name={member.commonMatchRole === 'First Defender' ? 'shield' :
                           member.commonMatchRole === 'Second Defender' ? 'shield' :
                           member.commonMatchRole === 'Attacker' ? 'bomb' :
                           member.commonMatchRole === 'Blunter' ? 'hand-rock-o' :
                           'ban'} 
                      size={16} 
                      color={theme.text} 
                    />
                    <ThemedText style={styles.detailLabel}>Match Role</ThemedText>
                    <ThemedText style={styles.detailValue}>{member.commonMatchRole}</ThemedText>
                  </View>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
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
  membersList: {
    padding: 16,
  },
  memberCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  memberBasicInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  memberDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchRoleRow: {
    justifyContent: 'center',
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});