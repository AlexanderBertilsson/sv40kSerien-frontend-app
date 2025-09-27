import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ThemedText from './ThemedText';
import { ArmyListModal } from './modals/armyListModal';
import { hexToRgba } from '../constants/Colors';

// Extended user interface for UserRow component
export interface UserRowData {
  id: string;
  username: string;
  profilePictureUrl?: string;
  armyId?: string;
  faction?: string;
  detachment?: string | null;
  sportsmanshipLevel?: number;
}

// eslint-disable-next-line no-unused-vars
type SelectionChangeHandler = (userId: string, selected: boolean) => void;

interface UserRowProps {
  user: UserRowData;
  theme: any;   
  showSportsmanship?: boolean;
  selectable?: boolean;
  onSelectionChange?: SelectionChangeHandler;
}

export function UserRow({ 
  user, 
  theme, 
  showSportsmanship = true,
  selectable = false,
  onSelectionChange
}: UserRowProps) {
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleSelection = () => {
    if (selectable) {
      const newSelected = !isSelected;
      setIsSelected(newSelected);
      onSelectionChange?.(user.id, newSelected);
    }
  };

  const getRowStyle = () => {
    const baseStyle: any[] = [styles.memberRow];
    if (selectable && isSelected) {
      baseStyle.push({
        backgroundColor: hexToRgba(theme.tint, 0.1),
        borderColor: hexToRgba(theme.tint, 0.3),
        borderWidth: 1,
      });
    }
    return baseStyle;
  };

  const RowContent = () => (
    <View style={getRowStyle()}>
      <View style={styles.playerInfo}>
        {user.profilePictureUrl ? (
          <Image 
            source={{ uri: user.profilePictureUrl }} 
            style={styles.playerImage}
          />
        ) : (
          <View style={[styles.playerImagePlaceholder, { backgroundColor: theme.tint }]}>
            <ThemedText style={styles.playerImageText}>
              {user.username.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
        )}
        <View style={styles.playerDetails}>
          <ThemedText style={[styles.playerName, { color: theme.text }]}>
            {user.username}
          </ThemedText>
          <ThemedText style={[styles.faction, { color: theme.text }]}>
            {user.faction}{user.detachment ? ` - ${user.detachment}` : ''}
          </ThemedText>
          
          {user.armyId && <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <ThemedText style={styles.armyListLink}>
              View Army List
            </ThemedText>
          </TouchableOpacity>}
        </View>
      </View>
      
      {/* Optional Sportsmanship Badge */}
      {showSportsmanship && user.sportsmanshipLevel !== undefined && (
        <View style={[
          styles.memberBadge, 
          { backgroundColor: getSportsmanshipColor(user.sportsmanshipLevel) }
        ]}>
          <ThemedText style={styles.memberBadgeText}>
            {getSportsmanshipLabel(user.sportsmanshipLevel)}
          </ThemedText>
          
        </View>
      )}
      {user.armyId && <ArmyListModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        armyListId={user.armyId}
      />}
    </View>
  );

  if (selectable) {
    return (
      <TouchableOpacity onPress={handleSelection} activeOpacity={0.7}>
        <RowContent />
      </TouchableOpacity>
    );
  }

  return <RowContent />;
}

const styles = StyleSheet.create({
  memberRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerDetails: {
    marginHorizontal: 8,
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  faction: {
    fontSize: 12,
    opacity: 0.7,
    flex: 1,
  },
  armyListLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a9eff',
    marginTop: 2,
  },
  memberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  memberBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
});