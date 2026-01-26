import { useState } from 'react';
import { View, StyleSheet, useColorScheme, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useAuthContext } from '@/src/contexts/AuthContext';

interface PlayerDetailsViewProps {
  eventId: string;
}

export default function PlayerDetailsView({ eventId }: PlayerDetailsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { isAuthenticated } = useAuthContext();
  
  const [armyListText, setArmyListText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitList = async () => {
    if (!armyListText.trim()) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to upload army list
      console.log('Submitting army list for event:', eventId);
    } catch (error) {
      console.error('Failed to submit army list:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.emptyText}>
          Please log in to manage your army list.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Your Army List
      </ThemedText>
      
      <ThemedText style={styles.label}>
        Paste your army list below:
      </ThemedText>
      
      <TextInput
        style={[
          styles.textInput,
          { 
            backgroundColor: theme.secondary,
            color: theme.text,
            borderColor: theme.icon,
          }
        ]}
        multiline
        numberOfLines={15}
        placeholder="Paste your army list here..."
        placeholderTextColor={theme.icon}
        value={armyListText}
        onChangeText={setArmyListText}
        textAlignVertical="top"
      />
      
      <TouchableOpacity
        style={[
          styles.submitButton,
          { 
            backgroundColor: armyListText.trim() ? theme.tint : theme.secondary,
            opacity: armyListText.trim() ? 1 : 0.5,
          }
        ]}
        onPress={handleSubmitList}
        disabled={!armyListText.trim() || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.submitButtonText}>Upload Army List</ThemedText>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    opacity: 0.8,
  },
  emptyText: {
    fontStyle: 'italic',
    opacity: 0.7,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 200,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  submitButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
