import { View, StyleSheet, Image, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Link } from 'expo-router';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  profileImage: string;
}

interface TeamMembersPreviewProps {
  members: TeamMember[];
}

export default function TeamMembersPreview({ members }: TeamMembersPreviewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <Link href="./[teamId]/teamMembers" asChild>
      <Pressable>
        <View style={[styles.container, { backgroundColor: theme.secondary }]}>
          <ThemedText style={styles.title}>Team Members</ThemedText>
          <View style={styles.membersGrid}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <Image
                  source={{ uri: member.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400" }}
                  style={styles.profileImage}
                />
                <View style={styles.memberInfo}>
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  membersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    padding: 8,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 12,
    opacity: 0.7,
  },
});
