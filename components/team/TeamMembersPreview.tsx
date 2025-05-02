import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import ThemedText from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import { User } from '@/types/utils/User';

interface TeamMembersPreviewProps {
  members: User[];
  teamId: string;
}

export default function TeamMembersPreview({ members, teamId }: TeamMembersPreviewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const linkStyle = {
    ...styles.memberName,
    ...styles.link,
    color: theme.tint
  };
  return (
    <>
      
      <View style={[styles.container, { backgroundColor: theme.secondary }]}>
        
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
        <ThemedText style={styles.title}>Team Members</ThemedText>
          <Link href={`./${teamId}/teamMembers`} asChild>
          <Pressable>
            <ThemedText style={linkStyle}>View all teamMembers</ThemedText>
          </Pressable>
        </Link>
        </View>
        <View style={styles.membersGrid}>
          {members.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <Link href={`/user/${member.id}`} asChild>
                <Image
                  source={{ uri: member.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400" }}
                  style={styles.profileImage}
                />
              </Link>
              <View style={styles.memberInfo}>
                <Link href={`/user/${member.id}`} asChild>
                  <Text style={linkStyle}>{member.username}</Text>
                </Link>
                <ThemedText style={styles.memberRole}>{member.role}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </>
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
  link: {
    fontWeight: 'bold'
  }
});
