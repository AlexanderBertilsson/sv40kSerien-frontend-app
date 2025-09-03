import { Modal, Pressable, ScrollView, StyleSheet, View, Platform } from 'react-native';
import ThemedText from '../ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useArmyList } from '../../hooks/useArmyList';

interface ArmyListModalProps {
  visible: boolean;
  onClose: () => void;
  armyListId: string;
}

export function ArmyListModal({ visible, onClose, armyListId }: ArmyListModalProps) {
  const { armyListQuery } = useArmyList(armyListId);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable 
        style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}
        onPress={onClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Army List</ThemedText>
            <Pressable 
              onPress={onClose}
              style={styles.closeButton}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <ThemedText style={styles.modalText}>{armyListQuery.data?.list || 'No army list available'}</ThemedText>
            </ScrollView>
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
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
});