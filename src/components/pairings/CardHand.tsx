import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect, forwardRef, useRef } from 'react';
import { Player } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';
import PlayerCard from './PlayerCard';
import FaceDownCard from './FaceDownCard';

interface CardHandProps {
  team: 'A' | 'B';
  availablePlayers: Player[];
  faceDown?: boolean;
  onCardSelected?: (player: Player, cardRef: any) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  selectedCard?: Player | null;
  disabled?: boolean;
  compact?: boolean; // For sidebar mode - smaller cards, no labels
}

const CardHand = forwardRef<View, CardHandProps>(({
  team,
  availablePlayers,
  faceDown = false,
  onCardSelected,
  isExpanded = false,
  onToggleExpanded,
  selectedCard,
  disabled = false,
  compact = false,
}, ref) => {
  const theme = usePairingTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const teamColor = team === 'A' ? '#3b82f6' : '#ef4444';
  const teamName = team === 'A' ? 'Blue' : 'Red';

  // Calculate responsive margin based on screen height
  const marginPercentage = compact ? 0 : (windowHeight < 730 ? 0.06 : 0.1);
  const tenPercentMargin = windowHeight * marginPercentage;

  // Calculate responsive expanded height
  const expandedHeight = compact ? 80 : (windowWidth < 768 ? 120 : (windowHeight < 730 ? 100 : 140));

  // Calculate responsive card dimensions (match PlayerCard)
  const cardWidth = compact ? 45 : (windowHeight < 730 ? 65 : 80);
  const cardHeight = compact ? 65 : (windowHeight < 730 ? 95 : 120);

  // Show up to 5 cards in the hand
  const displayCards = availablePlayers.slice(0, 5);
  const cardCount = availablePlayers.length;

  // Calculate responsive scale based on screen width
  const getCardScale = () => {
    if (compact) return 0.35;
    if (windowWidth < 768) return 0.6;
    if (windowWidth < 1024) return 0.75;
    if (windowWidth < 1260) return 0.85;
    return 1.0;
  };

  const scale = getCardScale();
  const baseCardWidth = compact ? 45 : 80;
  const baseCardGap = compact ? 8 : 16;
  const baseCollapsedSpacing = compact ? 12 : 20;

  const scaledCardWidth = baseCardWidth * scale;
  const scaledCardGap = baseCardGap * scale;
  const scaledCollapsedSpacing = baseCollapsedSpacing * scale;
  const scaledExpandedSpacing = scaledCardWidth + scaledCardGap;

  const isMobile = windowWidth < 768;

  const collapsedWidth = cardCount > 0
    ? scaledCardWidth + (Math.min(cardCount - 1, 4) * scaledCollapsedSpacing)
    : 120;

  const expandedWidth = cardCount > 0
    ? isMobile
      ? collapsedWidth * 2.5
      : (cardCount * scaledExpandedSpacing) + scaledCardGap
    : 120;

  const containerWidth = useSharedValue(collapsedWidth);
  const containerHeight = useSharedValue(40);
  const verticalMargin = useSharedValue(tenPercentMargin);

  useEffect(() => {
    if (isExpanded) {
      containerWidth.value = withTiming(expandedWidth, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      containerHeight.value = withTiming(expandedHeight, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      verticalMargin.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      containerWidth.value = withTiming(collapsedWidth, {
        duration: 250,
        easing: Easing.in(Easing.ease),
      });
      containerHeight.value = withTiming(40, {
        duration: 250,
        easing: Easing.in(Easing.ease),
      });
      verticalMargin.value = withTiming(tenPercentMargin, {
        duration: 250,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [isExpanded, collapsedWidth, expandedWidth, tenPercentMargin, expandedHeight, isMobile]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    width: containerWidth.value,
    height: containerHeight.value,
  }));

  const marginAnimatedStyle = useAnimatedStyle(() => ({
    marginBottom: team === 'A' ? verticalMargin.value : 0,
    marginTop: team === 'B' ? verticalMargin.value / 2 : 0,
  }));

  const handleHandClick = () => {
    if (!disabled && !isExpanded && onToggleExpanded && cardCount > 0) {
      onToggleExpanded();
    }
  };

  const handleCardClick = (player: Player, cardRef: any) => {
    if (onCardSelected && !disabled) {
      onCardSelected(player, cardRef);
    }
  };

  return (
    <View ref={ref} collapsable={false} id="card-hand-container">
      <Animated.View
        id="hand-view"
        style={[
          {
            flexDirection: compact ? 'column' : 'row',
            alignItems: 'center',
            gap: compact ? theme.spacing.xs : theme.spacing.sm,
          },
          marginAnimatedStyle,
        ]}
      >
        {!compact && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.xs,
              minWidth: 120,
            }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: teamColor,
              }}
            />
            <Text
              style={{
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.bold as any,
                color: theme.colors.text,
              }}
            >
              {teamName} Team
            </Text>
            <View
              style={{
                paddingHorizontal: theme.spacing.xs,
                paddingVertical: 2,
                borderRadius: theme.borderRadius.sm,
                backgroundColor: theme.colors.background,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.gray[600],
                }}
              >
                {cardCount} left
              </Text>
            </View>
          </View>
        )}

        {compact && (
          <View
            style={{
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: 2,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: teamColor,
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: theme.colors.white,
                fontWeight: theme.typography.weights.bold as any,
              }}
            >
              {cardCount}
            </Text>
          </View>
        )}

        {cardCount > 0 ? (
          <Pressable
            onPress={handleHandClick}
            disabled={disabled || isExpanded}
            style={{ position: 'relative' }}
          >
            <Animated.View
              id="cards-container"
              style={[
                {
                  position: 'relative',
                  overflow: 'visible',
                  cursor: !disabled && !isExpanded ? 'pointer' : 'default',
                  paddingHorizontal: isExpanded ? 8 : 0,
                } as any,
                containerAnimatedStyle,
              ]}
            >
              {isExpanded && onToggleExpanded && (
                <Pressable
                  onPress={onToggleExpanded}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: theme.colors.gray[200],
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 11,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={16}
                    color={theme.colors.gray[700]}
                  />
                </Pressable>
              )}

              {displayCards.map((player, index) => {
                const isSelected = selectedCard?.id === player.id;

                return (
                  <CardInHand
                    key={faceDown ? `facedown-${index}` : player.id}
                    player={player}
                    index={index}
                    totalCards={displayCards.length}
                    expandedSpacing={scaledExpandedSpacing}
                    isExpanded={isExpanded}
                    isSelected={isSelected}
                    faceDown={faceDown}
                    team={team}
                    onPress={(cardRef) => handleCardClick(player, cardRef)}
                    theme={theme}
                    hasOtherSelected={!isSelected && selectedCard !== null}
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    isMobile={isMobile}
                    compact={compact}
                  />
                );
              })}
            </Animated.View>
          </Pressable>
        ) : (
          <View
            style={{
              width: 120,
              height: 40,
              backgroundColor: theme.colors.gray[100],
              borderRadius: theme.borderRadius.md,
              borderWidth: 2,
              borderStyle: 'dashed' as any,
              borderColor: theme.colors.gray[300],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                color: theme.colors.gray[500],
              }}
            >
              No cards
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
});

const calculateArcPosition = (index: number, totalCards: number) => {
  const arcRadius = 200;
  const arcSpan = 30;
  const centerIndex = (totalCards - 1) / 2;

  const angleOffset = ((index - centerIndex) / totalCards) * arcSpan;
  const angleRad = (angleOffset * Math.PI) / 180;

  return {
    x: Math.sin(angleRad) * arcRadius * 0.3,
    y: -Math.cos(angleRad) * arcRadius * 0.1 + 10,
    rotation: angleOffset,
  };
};

interface CardInHandProps {
  player: Player;
  index: number;
  totalCards: number;
  expandedSpacing: number;
  isExpanded: boolean;
  isSelected: boolean;
  faceDown: boolean;
  team: 'A' | 'B';
  onPress: (cardRef: any) => void;
  theme: any;
  hasOtherSelected: boolean;
  cardWidth: number;
  cardHeight: number;
  isMobile: boolean;
  compact: boolean;
}

function CardInHand({
  player,
  index,
  totalCards,
  expandedSpacing,
  isExpanded,
  isSelected,
  faceDown,
  team,
  onPress,
  theme,
  hasOtherSelected,
  cardWidth,
  cardHeight,
  isMobile,
  compact,
}: CardInHandProps) {
  const cardRef = useRef<any>(null);
  const arcPos = calculateArcPosition(index, totalCards);

  const translateX = useSharedValue(arcPos.x);
  const translateY = useSharedValue(arcPos.y);
  const scale = useSharedValue(0.4);
  const rotation = useSharedValue(arcPos.rotation);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isExpanded) {
      if (isMobile || compact) {
        const expandedArcSpan = 60;
        const centerIndex = (totalCards - 1) / 2;
        const angleOffset = ((index - centerIndex) / Math.max(totalCards - 1, 1)) * expandedArcSpan;
        const angleRad = (angleOffset * Math.PI) / 180;
        const expandedArcRadius = 300;

        const expandedX = Math.sin(angleRad) * expandedArcRadius * 0.5;
        const expandedY = -Math.cos(angleRad) * expandedArcRadius * 0.15 + 30;

        const zoomFactor = compact ? 1.2 : 1.0;

        translateX.value = withTiming(expandedX * zoomFactor, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(expandedY * zoomFactor, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(compact ? 0.7 : 0.8, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        rotation.value = withTiming(angleOffset * 0.4, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        translateX.value = withTiming(index * expandedSpacing, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(10, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(1.0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        rotation.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }
    } else {
      const arcPosition = calculateArcPosition(index, totalCards);

      if (isSelected) {
        translateX.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        translateY.value = withTiming(-5, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        scale.value = withTiming(0.5, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
        rotation.value = withTiming(0, {
          duration: 250,
          easing: Easing.out(Easing.cubic),
        });
      } else {
        translateX.value = withTiming(arcPosition.x, {
          duration: 250,
          easing: Easing.in(Easing.ease),
        });
        translateY.value = withTiming(arcPosition.y, {
          duration: 250,
          easing: Easing.in(Easing.ease),
        });
        scale.value = withTiming(0.4, {
          duration: 250,
          easing: Easing.in(Easing.ease),
        });
        rotation.value = withTiming(arcPosition.rotation, {
          duration: 250,
          easing: Easing.in(Easing.ease),
        });
      }
    }
  }, [isExpanded, index, totalCards, expandedSpacing, isMobile, isSelected]);

  useEffect(() => {
    if (isSelected && isExpanded) {
      scale.value = withTiming(1.1, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, {
        duration: 200,
      });
    } else if (hasOtherSelected && isExpanded) {
      scale.value = withTiming(1.0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(0.6, {
        duration: 200,
      });
    } else if (isExpanded) {
      scale.value = withTiming(1.0, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, {
        duration: 200,
      });
    }
  }, [isSelected, hasOtherSelected, isExpanded]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
    opacity: opacity.value,
    zIndex: isSelected ? 10 : 1,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
        },
        cardAnimatedStyle,
      ]}
    >
      {isExpanded ? (
        <Pressable onPress={() => onPress(cardRef.current)}>
          <View
            ref={cardRef}
            collapsable={false}
            style={{
              borderWidth: isSelected ? 3 : 0,
              borderColor: '#3b82f6',
              borderRadius: theme.borderRadius.md,
              padding: isSelected ? 2 : 0,
            }}
          >
            {faceDown ? (
              <FaceDownCard team={team} width={cardWidth} height={cardHeight} />
            ) : (
              <PlayerCard
                player={player}
                state="available"
                             />
            )}
          </View>
        </Pressable>
      ) : (
        <View
          ref={cardRef}
          collapsable={false}
          style={{
            borderWidth: isSelected ? 3 : 0,
            borderColor: '#3b82f6',
            borderRadius: theme.borderRadius.md,
            padding: isSelected ? 2 : 0,
          }}
        >
          {faceDown ? (
            <FaceDownCard team={team} width={cardWidth} height={cardHeight} />
          ) : (
            <PlayerCard
              player={player}
              state="available"
                         />
          )}
        </View>
      )}
    </Animated.View>
  );
}


export default CardHand;
