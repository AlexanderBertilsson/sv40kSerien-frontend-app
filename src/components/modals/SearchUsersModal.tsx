import { View, Text, TextInput, Modal, Pressable, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '@/src/constants/Colors';
import { useUserSearch } from '@/src/hooks/useUserSearch';
import { User } from '@/types/User';

interface SearchUsersModalProps {
  visible: boolean;
  onClose: () => void;
  //eslint-disable-next-line
  onUserSelect: (user: User) => void;
  title?: string;
}

export default function SearchUsersModal({ 
  visible, 
  onClose, 
  onUserSelect,
  title = "Search Users"
}: SearchUsersModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const [searchQuery, setSearchQuery] = useState('');
  
  const { users, isLoading } = useUserSearch({ 
    query: searchQuery,
    limit: 10,
  });

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setSearchQuery('');
    onClose();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Pressable
      style={[styles.userItem, { backgroundColor: theme.secondary }]}
      onPress={() => handleUserSelect(item)}
    >
      <Image
        source={{ uri: item.profilePictureUrl || require('@/assets/images/emoji2.png') }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: theme.text }]}>{item.username}</Text>
        {item.email && (
          <Text style={[styles.email, { color: theme.text + '80' }]}>{item.email}</Text>
        )}
      </View>
      <Ionicons name="add-circle-outline" size={24} color={theme.tint} />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={theme.text} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View style={[styles.searchContainer, { backgroundColor: theme.secondary }]}>
            <Ionicons name="search" size={20} color={theme.text + '80'} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by username or email..."
              placeholderTextColor={theme.text + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.text + '80'} />
              </Pressable>
            )}
          </View>

          {/* Search hint */}
          {searchQuery.length > 0 && searchQuery.length < 3 && (
            <Text style={[styles.hint, { color: theme.text + '80' }]}>
              Type at least 3 characters to search
            </Text>
          )}

          {/* Results */}
          <View style={styles.resultsContainer}>
            {isLoading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.tint} />
              </View>
            ) : searchQuery.length >= 3 && users.length === 0 ? (
              <View style={styles.centerContent}>
                <Ionicons name="search-outline" size={48} color={theme.text + '40'} />
                <Text style={[styles.emptyText, { color: theme.text + '80' }]}>
                  No users found
                </Text>
              </View>
            ) : searchQuery.length >= 3 ? (
              <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.centerContent}>
                <Ionicons name="people-outline" size={48} color={theme.text + '40'} />
                <Text style={[styles.emptyText, { color: theme.text + '80' }]}>
                  Start typing to search for users
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsContainer: {
    flex: 1,
    minHeight: 300,
  },
  listContent: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
