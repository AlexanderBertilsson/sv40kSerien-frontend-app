import { View, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useUsers } from '@/hooks/useUsers';
import { Link } from 'expo-router';

export default function TeamMembersScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const { teamId } = useLocalSearchParams();
  const { users } = useUsers({ teamId: teamId as string });

  const toggleMember = (memberId: string) => {
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  const linkStyle = {
    ...styles.memberName,
    ...styles.link,
    color: theme.tint
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Team Members</ThemedText>
      </View>
      <View style={styles.membersList}>
        {users.map((user) => (
          <Pressable
            key={user.id}
            style={[
              styles.memberCard,
              { backgroundColor: theme.secondary },
            ]}
            onPress={() => toggleMember(user.id)}
          >
            <View style={styles.memberHeader}>
              <Link href={`/user/${user.id}`} asChild>
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.profileImage}
                />
              </Link>
              <View style={styles.memberBasicInfo}>
                <Link href={`/user/${user.id}`} asChild>
                  <ThemedText style={linkStyle}>{user.username}</ThemedText>
                </Link>
                <ThemedText style={styles.memberRole}>{user.role}</ThemedText>
              </View>
              <FontAwesome
                name={expandedMember === user.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.text}      
              />
            </View>
            {expandedMember === user.id && (
              <View style={styles.memberDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesome name="star" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Sportsmanship</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {user.sportsmanshipLevel.toFixed(1)}
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {user.sportsmanship.toFixed(1)}
                    </ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome name="trophy" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Win Rate</ThemedText>
                    <ThemedText style={styles.detailValue}>{user.winRate}%</ThemedText>
                  </View>
                </View>
                <View style={[styles.detailRow, styles.matchRoleRow]}>
                  <View style={styles.detailItem}>
                    <FontAwesome 
                      name={user.gameRole === 'Defender' ? 'shield' :
                           user.gameRole === 'Attacker' ? 'bomb' :
                           user.gameRole === 'Blunter' ? 'hand-rock-o' :
                           'ban'} 
                      size={16} 
                      color={theme.text} 
                    />
                    <ThemedText style={styles.detailLabel}>Match Role</ThemedText>
                    <ThemedText style={styles.detailValue}>{user.gameRole}</ThemedText>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesome name="gamepad" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Games Played</ThemedText>
                    <ThemedText style={styles.detailValue}>{user.mostPlayedArmies.map((army) => army.gamesPlayed).reduce((a, b) => a + b)}</ThemedText>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesome name="cube" size={16} color={theme.text} />
                    <ThemedText style={styles.detailLabel}>Favorite Army</ThemedText>
                    <ThemedText style={styles.detailValue}>{user.mostPlayedArmies.sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0].army}</ThemedText>
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
  link: {
    textDecorationLine: 'underline', 
    fontWeight: 'bold'
  }
});