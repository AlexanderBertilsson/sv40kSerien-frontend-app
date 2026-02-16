import { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, useColorScheme, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ThemedText from '@/src/components/ThemedText';
import { Colors } from '@/src/constants/Colors';
import { useAuthContext } from '@/src/contexts/AuthContext';
import { useEventContext } from '@/src/contexts/EventContext';
import { FactionIcon } from '@/src/components/FactionIcon';
import { useFactions, useCreateArmyList, useUpdateArmyList } from '@/src/hooks/useArmyList';
import { FactionDto, DetachmentDto } from '@/types/ArmyList';

interface PlayerDetailsViewProps {
  eventId: string;
}

export default function PlayerDetailsView({ eventId }: PlayerDetailsViewProps) {
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const { isAuthenticated } = useAuthContext();
  const { armyList, isRegistered } = useEventContext();
  const { factionsQuery } = useFactions();
  const { createArmyListMutation } = useCreateArmyList(eventId);
  const { updateArmyListMutation } = useUpdateArmyList(eventId);

  const [selectedFactionId, setSelectedFactionId] = useState<number | null>(null);
  const [selectedDetachmentId, setSelectedDetachmentId] = useState<number | null>(null);
  const [armyListText, setArmyListText] = useState('');
  const [showFactionPicker, setShowFactionPicker] = useState(false);
  const [showDetachmentPicker, setShowDetachmentPicker] = useState(false);

  const isUpdate = !!armyList?.id;

  const factions = factionsQuery.data ?? [];

  const selectedFaction = useMemo(() => {
    return factions.find(f => f.id === selectedFactionId) ?? null;
  }, [factions, selectedFactionId]);

  const detachments = useMemo(() => {
    if (!selectedFaction?.detachments) return [];
    return selectedFaction.detachments.filter(d => d.active);
  }, [selectedFaction]);

  const selectedDetachment = useMemo(() => {
    return detachments.find(d => d.id === selectedDetachmentId) ?? null;
  }, [detachments, selectedDetachmentId]);

  // Sync state from existing army list
  useEffect(() => {
    if (armyList && factions.length > 0) {
      if (armyList.list) setArmyListText(armyList.list);
      if (armyList.factionName) {
        const match = factions.find(f => f.name === armyList.factionName);
        if (match) {
          setSelectedFactionId(match.id);
          if (armyList.detachmentName && match.detachments) {
            const detMatch = match.detachments.find(d => d.name === armyList.detachmentName);
            if (detMatch) setSelectedDetachmentId(detMatch.id);
          }
        }
      }
    }
  }, [armyList, factions]);

  // Reset detachment when faction changes
  const handleFactionSelect = (faction: FactionDto) => {
    setSelectedFactionId(faction.id);
    setSelectedDetachmentId(null);
    setShowFactionPicker(false);
  };

  const handleDetachmentSelect = (detachment: DetachmentDto) => {
    setSelectedDetachmentId(detachment.id);
    setShowDetachmentPicker(false);
  };

  const canSubmit = selectedFactionId !== null && armyListText.trim().length > 0;
  const isSubmitting = createArmyListMutation.isPending || updateArmyListMutation.isPending;

  const handleSubmitList = async () => {
    if (!canSubmit || !selectedFactionId) return;

    const payload = {
      factionId: selectedFactionId,
      detachmentId: selectedDetachmentId,
      list: armyListText.trim(),
    };

    try {
      if (isUpdate) {
        await updateArmyListMutation.mutateAsync(payload);
      } else {
        await createArmyListMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error('Failed to submit army list:', error);
    }
  };

  const mutationError = createArmyListMutation.isError || updateArmyListMutation.isError;

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.emptyText}>
          Please log in to manage your army list.
        </ThemedText>
      </View>
    );
  }

  if (!isRegistered) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.emptyText}>
          You are not registered for this event.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Your Army List
      </ThemedText>

      {/* Faction Picker */}
      <ThemedText style={styles.label}>Faction</ThemedText>
      <Pressable
        style={[styles.pickerButton, { backgroundColor: theme.secondary, borderColor: theme.icon }]}
        onPress={() => { setShowFactionPicker(!showFactionPicker); setShowDetachmentPicker(false); }}
      >
        <View style={styles.pickerButtonContent}>
          {selectedFaction ? (
            <>
              <FactionIcon faction={selectedFaction.name || ''} size={20} color={theme.text} />
              <ThemedText>{selectedFaction.name}</ThemedText>
            </>
          ) : (
            <ThemedText style={{ opacity: 0.5 }}>Select faction...</ThemedText>
          )}
        </View>
        <MaterialCommunityIcons
          name={showFactionPicker ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={theme.icon}
        />
      </Pressable>

      {showFactionPicker && (
        <ScrollView style={[styles.pickerDropdown, { backgroundColor: theme.secondary, borderColor: theme.icon }]} nestedScrollEnabled>
          {factionsQuery.isLoading ? (
            <ActivityIndicator style={{ padding: 16 }} color={theme.tint} />
          ) : (
            factions.map(faction => (
              <Pressable
                key={faction.id}
                style={[
                  styles.pickerOption,
                  selectedFactionId === faction.id && { backgroundColor: theme.tint + '30' },
                ]}
                onPress={() => handleFactionSelect(faction)}
              >
                <FactionIcon faction={faction.name || ''} size={18} color={theme.text} />
                <ThemedText>{faction.name}</ThemedText>
              </Pressable>
            ))
          )}
        </ScrollView>
      )}

      {/* Detachment Picker */}
      {selectedFaction && detachments.length > 0 && (
        <>
          <ThemedText style={[styles.label, { marginTop: 12 }]}>Detachment</ThemedText>
          <Pressable
            style={[styles.pickerButton, { backgroundColor: theme.secondary, borderColor: theme.icon }]}
            onPress={() => { setShowDetachmentPicker(!showDetachmentPicker); setShowFactionPicker(false); }}
          >
            <ThemedText style={selectedDetachment ? undefined : { opacity: 0.5 }}>
              {selectedDetachment?.name || 'Select detachment...'}
            </ThemedText>
            <MaterialCommunityIcons
              name={showDetachmentPicker ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.icon}
            />
          </Pressable>

          {showDetachmentPicker && (
            <ScrollView style={[styles.pickerDropdown, { backgroundColor: theme.secondary, borderColor: theme.icon }]} nestedScrollEnabled>
              {detachments.map(detachment => (
                <Pressable
                  key={detachment.id}
                  style={[
                    styles.pickerOption,
                    selectedDetachmentId === detachment.id && { backgroundColor: theme.tint + '30' },
                  ]}
                  onPress={() => handleDetachmentSelect(detachment)}
                >
                  <ThemedText>{detachment.name}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </>
      )}

      {/* Army List Text */}
      <ThemedText style={[styles.label, { marginTop: 12 }]}>
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

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          {
            backgroundColor: canSubmit ? theme.tint : theme.secondary,
            opacity: canSubmit ? 1 : 0.5,
          }
        ]}
        onPress={handleSubmitList}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.submitButtonText}>
            {isUpdate ? 'Update Army List' : 'Upload Army List'}
          </ThemedText>
        )}
      </TouchableOpacity>

      {mutationError && (
        <ThemedText style={[styles.errorText, { color: theme.error }]}>
          Failed to submit army list. Please try again.
        </ThemedText>
      )}
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
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pickerDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
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
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
