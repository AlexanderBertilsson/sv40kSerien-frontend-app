import { View, Text, Pressable, Image, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import { TableLayout, Pairing } from '@/src/types/pairing';
import { Button } from './styled';
import PlayerCard from './PlayerCard';
import { FactionIcon, hasFactionIcon } from '@/src/components/FactionIcon';

// Fallback demo layout images (used when imageUrl is empty)
const DEMO_LAYOUT_IMAGES: Record<string, any> = {
  layout1: require('@/assets/docs/layouts/layout1.png'),
  layout2: require('@/assets/docs/layouts/layout2.png'),
  layout3: require('@/assets/docs/layouts/layout3.png'),
  layout4: require('@/assets/docs/layouts/layout4.png'),
  layout5: require('@/assets/docs/layouts/layout5.png'),
};

function getLayoutImageSource(layout: TableLayout): any {
  if (layout.imageUrl) {
    return { uri: layout.imageUrl };
  }
  return DEMO_LAYOUT_IMAGES[layout.id] || null;
}

interface LayoutSelectionModalProps {
  visible: boolean;
  availableLayouts: TableLayout[];
  tableNumber: number;
  teamName: string;
  teamColor: string;
  pairings: Pairing[];
  onSelectLayout: (layout: TableLayout) => void;
}

export default function LayoutSelectionModal({
  visible,
  availableLayouts,
  tableNumber,
  teamName,
  teamColor,
  pairings,
  onSelectLayout,
}: LayoutSelectionModalProps) {
  const theme = usePairingTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isMobile = windowWidth < 900;

  // Track selected layout before confirmation
  const [selectedLayout, setSelectedLayout] = useState<TableLayout | null>(null);
  // Toggle between layouts and pairings view
  const [viewMode, setViewMode] = useState<'layouts' | 'pairings'>('layouts');

  const handleConfirm = () => {
    if (selectedLayout) {
      onSelectLayout(selectedLayout);
      setSelectedLayout(null);
    }
  };

  if (!visible) return null;

  const sortedPairings = [...pairings].sort((a, b) => a.tableNumber - b.tableNumber);

  // Find the pairing for the current table being selected
  const currentPairing = pairings.find(p => p.tableNumber === tableNumber);

  // Calculate grid dimensions based on available layouts
  const layoutCount = availableLayouts.length;

  // Mobile: full screen overlay with flex layout
  if (isMobile) {
    // Calculate image size based on screen height to ensure everything fits
    const availableHeight = windowHeight - 120; // Account for header and footer
    const maxImageHeight = Math.min(availableHeight * 0.6, 100);
    const imageHeight = maxImageHeight;
    const imageWidth = imageHeight / 1.5;

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Backdrop */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Flex container for proper spacing */}
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 10,
          }}
        >
          {/* Top section - team label and toggle */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            <View
              style={{
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 4,
                backgroundColor: teamColor,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: 12,
                  fontWeight: theme.typography.weights.bold as any,
                }}
              >
                {teamName} - Table {tableNumber}
              </Text>
            </View>

            {/* Toggle button */}
            <Pressable
              onPress={() => setViewMode(viewMode === 'layouts' ? 'pairings' : 'layouts')}
              style={{
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: 4,
                backgroundColor: theme.colors.gray[700],
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <Text style={{ color: theme.colors.white, fontSize: 10 }}>
                {viewMode === 'layouts' ? 'View Pairings' : 'View Layouts'}
              </Text>
            </Pressable>
          </View>

          {/* Content container - centered with flex */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {viewMode === 'layouts' ? (
              <View style={{ alignItems: 'center', gap: 12 }}>
                {/* Current pairing indicator with arrow */}
                {currentPairing && (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.gray[400], fontSize: 9, marginBottom: 4 }}>
                      SELECTING FOR
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      borderWidth: 2,
                      borderColor: '#f59e0b',
                      borderRadius: theme.borderRadius.md,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      gap: 8,
                    }}>
                      {currentPairing.teamAPlayer.faction && hasFactionIcon(currentPairing.teamAPlayer.faction) ? (
                        <FactionIcon faction={currentPairing.teamAPlayer.faction} size={20} color="#3b82f6" />
                      ) : (
                        <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 10 }} numberOfLines={1}>
                          {currentPairing.teamAPlayer.faction || currentPairing.teamAPlayer.username || 'A'}
                        </Text>
                      )}
                      <View style={{
                        backgroundColor: '#f59e0b',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                      }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}>
                          T{tableNumber}
                        </Text>
                      </View>
                      {currentPairing.teamBPlayer.faction && hasFactionIcon(currentPairing.teamBPlayer.faction) ? (
                        <FactionIcon faction={currentPairing.teamBPlayer.faction} size={20} color="#ef4444" />
                      ) : (
                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 10 }} numberOfLines={1}>
                          {currentPairing.teamBPlayer.faction || currentPairing.teamBPlayer.username || 'B'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Layout grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {availableLayouts.map((layout) => {
                  const isSelected = selectedLayout?.id === layout.id;
                  return (
                    <Pressable
                      key={layout.id}
                      onPress={() => setSelectedLayout(layout)}
                      style={{
                        borderWidth: 3,
                        borderColor: isSelected ? teamColor : 'rgba(255,255,255,0.3)',
                        borderRadius: theme.borderRadius.md,
                        overflow: 'hidden',
                        backgroundColor: theme.colors.card,
                        transform: isSelected ? [{ scale: 1.05 }] : [],
                      }}
                    >
                      <Image
                        source={getLayoutImageSource(layout)}
                        style={{ width: imageWidth, height: imageHeight }}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: isSelected ? teamColor : 'rgba(0, 0, 0, 0.7)',
                          paddingVertical: 2,
                        }}
                      >
                        <Text style={{ color: theme.colors.white, fontSize: 8, fontWeight: 'bold' as any, textAlign: 'center' }}>
                          {layout.name}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
                </View>
              </View>
            ) : (
              /* Pairings view - layout image between faction icons */
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                {sortedPairings.length === 0 ? (
                  <Text style={{ color: theme.colors.white, fontSize: 14, textAlign: 'center' }}>
                    No pairings yet
                  </Text>
                ) : (
                  sortedPairings.map((pairing) => (
                    <View
                      key={pairing.tableNumber}
                      style={{
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      {/* Team A faction icon above */}
                      {pairing.teamAPlayer.faction && hasFactionIcon(pairing.teamAPlayer.faction) ? (
                        <FactionIcon faction={pairing.teamAPlayer.faction} size={18} color="#3b82f6" />
                      ) : (
                        <Text style={{ color: '#3b82f6', fontWeight: 'bold' as any, fontSize: 10 }} numberOfLines={1}>
                          {pairing.teamAPlayer.faction || pairing.teamAPlayer.username || 'A'}
                        </Text>
                      )}

                      {/* Layout image */}
                      <View
                        style={{
                          borderRadius: theme.borderRadius.md,
                          overflow: 'hidden',
                          borderWidth: 2,
                          borderColor: theme.colors.primary,
                        }}
                      >
                        {pairing.layout ? (
                          <Image
                            source={getLayoutImageSource(pairing.layout)}
                            style={{ width: imageWidth, height: imageHeight }}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={{ width: imageWidth, height: imageHeight, backgroundColor: theme.colors.gray[700] }} />
                        )}
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            paddingVertical: 2,
                          }}
                        >
                          <Text style={{ color: theme.colors.white, fontSize: 9, fontWeight: 'bold' as any, textAlign: 'center' }}>
                            T{pairing.tableNumber}
                          </Text>
                        </View>
                      </View>

                      {/* Team B faction icon below */}
                      {pairing.teamBPlayer.faction && hasFactionIcon(pairing.teamBPlayer.faction) ? (
                        <FactionIcon faction={pairing.teamBPlayer.faction} size={18} color="#ef4444" />
                      ) : (
                        <Text style={{ color: '#ef4444', fontWeight: 'bold' as any, fontSize: 10 }} numberOfLines={1}>
                          {pairing.teamBPlayer.faction || pairing.teamBPlayer.username || 'B'}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Bottom section - instruction text and confirm button */}
          <View style={{ alignItems: 'center', gap: 6 }}>
            {viewMode === 'layouts' ? (
              <>
                <Text style={{ color: theme.colors.white, fontSize: 11, textAlign: 'center' }}>
                  {selectedLayout
                    ? `Selected: ${selectedLayout.name}`
                    : `Tap a layout for Table ${tableNumber}`}
                </Text>
                {selectedLayout && (
                  <Pressable
                    onPress={handleConfirm}
                    style={{
                      backgroundColor: '#f59e0b',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: theme.borderRadius.sm,
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' as any, fontSize: 12 }}>
                      Confirm Layout
                    </Text>
                  </Pressable>
                )}
              </>
            ) : (
              <Text style={{ color: theme.colors.white, fontSize: 11, textAlign: 'center' }}>
                Current pairings ({sortedPairings.length} total)
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }

  // Desktop: card-style modal
  const columns = layoutCount <= 3 ? layoutCount : Math.ceil(layoutCount / 2);
  const imageWidth = Math.min((windowWidth - 200) / columns, 140);
  const imageHeight = imageWidth * 1.5;
  const cardScale = 0.7;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000,
      }}
    >
      {/* Modal content */}
      <View
        style={{
          backgroundColor: theme.colors.card,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          maxWidth: windowWidth - 40,
          maxHeight: windowHeight - 40,
        }}
      >
        {/* Header */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: theme.spacing.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.xs }}>
            <View
              style={{
                backgroundColor: teamColor,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.md,
              }}
            >
              <Text
                style={{
                  color: theme.colors.white,
                  fontSize: theme.typography.sizes.md,
                  fontWeight: theme.typography.weights.bold as any,
                }}
              >
                {teamName}
              </Text>
            </View>

            {/* Toggle button */}
            <Pressable
              onPress={() => setViewMode(viewMode === 'layouts' ? 'pairings' : 'layouts')}
              style={{
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                backgroundColor: theme.colors.gray[200],
                borderRadius: theme.borderRadius.sm,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={{ color: theme.colors.text, fontSize: theme.typography.sizes.sm }}>
                {viewMode === 'layouts' ? 'View Pairings' : 'View Layouts'}
              </Text>
            </Pressable>
          </View>

          <Text
            style={{
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.bold as any,
              color: theme.colors.text,
              textAlign: 'center',
            }}
          >
            {viewMode === 'layouts' ? `Select Layout for Table ${tableNumber}` : 'Current Pairings'}
          </Text>
          {viewMode === 'layouts' && (
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                color: theme.colors.gray[600],
                marginTop: theme.spacing.xs,
              }}
            >
              {selectedLayout
                ? `Selected: ${selectedLayout.name}`
                : 'Tap a layout to select'}
            </Text>
          )}
        </View>

        {viewMode === 'layouts' ? (
          <>
            {/* Current pairing indicator with arrow */}
            {currentPairing && (
              <View style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
                <Text style={{ color: theme.colors.gray[500], fontSize: 11, marginBottom: 6 }}>
                  SELECTING LAYOUT FOR
                </Text>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  borderWidth: 2,
                  borderColor: '#f59e0b',
                  borderRadius: theme.borderRadius.md,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  gap: 12,
                }}>
                  {currentPairing.teamAPlayer.faction && hasFactionIcon(currentPairing.teamAPlayer.faction) ? (
                    <FactionIcon faction={currentPairing.teamAPlayer.faction} size={28} color="#3b82f6" />
                  ) : (
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>
                      {currentPairing.teamAPlayer.faction || currentPairing.teamAPlayer.username || 'A'}
                    </Text>
                  )}
                  <View style={{
                    backgroundColor: '#f59e0b',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                      Table {tableNumber}
                    </Text>
                  </View>
                  {currentPairing.teamBPlayer.faction && hasFactionIcon(currentPairing.teamBPlayer.faction) ? (
                    <FactionIcon faction={currentPairing.teamBPlayer.faction} size={28} color="#ef4444" />
                  ) : (
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>
                      {currentPairing.teamBPlayer.faction || currentPairing.teamBPlayer.username || 'B'}
                    </Text>
                  )}
                </View>
               
              </View>
            )}

            {/* Layout grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: theme.spacing.sm,
              }}
            >
              {availableLayouts.map((layout) => {
                const isSelected = selectedLayout?.id === layout.id;
                return (
                  <Pressable
                    key={layout.id}
                    onPress={() => setSelectedLayout(layout)}
                    style={{
                      borderWidth: 3,
                      borderColor: isSelected ? teamColor : theme.colors.border,
                      borderRadius: theme.borderRadius.md,
                      overflow: 'hidden',
                      transform: isSelected ? [{ scale: 1.05 }] : [],
                    }}
                  >
                    <Image
                      source={getLayoutImageSource(layout)}
                      style={{
                        width: imageWidth,
                        height: imageHeight,
                      }}
                      resizeMode="contain"
                    />
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: isSelected ? teamColor : 'rgba(0, 0, 0, 0.6)',
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: theme.colors.white,
                          fontSize: theme.typography.sizes.xs,
                          fontWeight: theme.typography.weights.bold as any,
                          textAlign: 'center',
                        }}
                      >
                        {layout.name}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Confirm button */}
            {selectedLayout && (
              <View style={{ marginTop: theme.spacing.md, alignItems: 'center' }}>
                <Button onPress={handleConfirm} variant="primary">
                  Confirm Selection
                </Button>
              </View>
            )}
          </>
        ) : (
          /* Pairings view */
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.md, flexWrap: 'wrap' }}>
            {sortedPairings.map((pairing) => (
              <View
                key={pairing.tableNumber}
                style={{
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                  backgroundColor: theme.colors.background,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.sm,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                <View style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.sm,
                  paddingHorizontal: theme.spacing.sm,
                  paddingVertical: 4,
                }}>
                  <Text style={{ color: theme.colors.white, fontWeight: 'bold' as any, fontSize: 12 }}>
                    T{pairing.tableNumber}
                  </Text>
                </View>
                <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                  <PlayerCard player={pairing.teamAPlayer} state="paired" />
                </View>
                <Text style={{ color: theme.colors.gray[500], fontSize: 10 }}>vs</Text>
                <View style={{ transform: [{ scale: cardScale }], marginVertical: -8 }}>
                  <PlayerCard player={pairing.teamBPlayer} state="paired" />
                </View>
                {pairing.layout && (
                  <Text style={{ color: theme.colors.gray[500], fontSize: 10 }}>
                    {pairing.layout.name}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
