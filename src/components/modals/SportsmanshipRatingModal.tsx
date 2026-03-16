import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';
import { Colors } from '../../constants/Colors';
import { useSubmitSportsmanshipRating } from '../../hooks/useSportsmanship';

interface SportsmanshipRatingModalProps {
  visible: boolean;
  onClose: () => void;
  gameId: string;
  opponentName: string;
}

export function SportsmanshipRatingModal({
  visible,
  onClose,
  gameId,
  opponentName,
}: SportsmanshipRatingModalProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { submitRatingMutation } = useSubmitSportsmanshipRating(gameId);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;
    try {
      await submitRatingMutation.mutateAsync({ rating: selectedRating });
    } catch (error) {
      console.error('Failed to submit sportsmanship rating:', error);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedRating(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <Pressable
        style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        onPress={handleClose}
      >
        <Pressable
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Rate Sportsmanship</ThemedText>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ThemedText style={[styles.opponentText, { color: theme.icon }]}>
            How was your game with {opponentName}?
          </ThemedText>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setSelectedRating(star)} style={styles.starButton}>
                <MaterialCommunityIcons
                  name={star <= selectedRating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= selectedRating ? '#F59E0B' : theme.icon}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.skipButton, { borderColor: theme.icon }]}
              onPress={handleClose}
            >
              <ThemedText style={[styles.skipButtonText, { color: theme.icon }]}>Skip</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: selectedRating > 0 ? theme.tint : 'rgba(255,255,255,0.1)' },
              ]}
              onPress={handleSubmit}
              disabled={selectedRating === 0 || submitRatingMutation.isPending}
            >
              {submitRatingMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  opponentText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default SportsmanshipRatingModal;
