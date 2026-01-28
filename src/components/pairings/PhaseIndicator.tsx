import { View, Text, useWindowDimensions } from 'react-native';
import { Phase } from '@/src/types/pairing';
import { usePairingTheme } from '@/src/theme/pairingTheme';

interface PhaseIndicatorProps {
  currentPhase: Phase;
}

// Map phases to friendly descriptions
const getPhaseInfo = (phase: Phase): { title: string; description: string; round: number | null; step: number } => {
  const phaseMap: Record<Phase, { title: string; description: string; round: number | null; step: number }> = {
    'setup': { title: 'Setup', description: 'Preparing teams', round: null, step: 0 },
    'round1-defender': { title: 'Round 1 - Defenders', description: 'Select 1 defender', round: 1, step: 1 },
    'round1-defender-reveal': { title: 'Round 1 - Reveal', description: 'Revealing defenders', round: 1, step: 2 },
    'round1-attackers': { title: 'Round 1 - Attackers', description: 'Select 2 attackers', round: 1, step: 3 },
    'round1-attackers-reveal': { title: 'Round 1 - Reveal', description: 'Revealing attackers', round: 1, step: 4 },
    'round1-coin-flip': { title: 'Round 1 - Coin Flip', description: 'Determining table choice', round: 1, step: 5 },
    'round1-refuse': { title: 'Round 1 - Refusals', description: 'Refusing attackers', round: 1, step: 6 },
    'round1-layout-select': { title: 'Round 1 - Layouts', description: 'Selecting table layouts', round: 1, step: 7 },
    'round1-complete': { title: 'Round 1 - Complete', description: 'Pairings 1-2 created', round: 1, step: 8 },
    'round2-defender': { title: 'Round 2 - Defenders', description: 'Select 1 defender', round: 2, step: 9 },
    'round2-defender-reveal': { title: 'Round 2 - Reveal', description: 'Revealing defenders', round: 2, step: 10 },
    'round2-attackers': { title: 'Round 2 - Attackers', description: 'Select 2 attackers', round: 2, step: 11 },
    'round2-attackers-reveal': { title: 'Round 2 - Reveal', description: 'Revealing attackers', round: 2, step: 12 },
    'round2-refuse': { title: 'Round 2 - Refusals', description: 'Refusing attackers', round: 2, step: 13 },
    'round2-layout-select': { title: 'Round 2 - Layouts', description: 'Selecting table layouts', round: 2, step: 14 },
    'round2-complete': { title: 'Round 2 - Complete', description: 'Pairings 3-4 created', round: 2, step: 15 },
    'round3-auto-pair': { title: 'Round 3 - Auto Pair', description: 'Pairing 5 created', round: 3, step: 16 },
    'results': { title: 'Results', description: 'All pairings complete', round: null, step: 17 },
  };

  return phaseMap[phase] || { title: 'Unknown', description: '', round: null, step: 0 };
};

export default function PhaseIndicator({ currentPhase }: PhaseIndicatorProps) {
  const theme = usePairingTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 900;
  const phaseInfo = getPhaseInfo(currentPhase);
  const totalSteps = 17;
  const progress = (phaseInfo.step / totalSteps) * 100;

  return (
    <View
      style={{
        backgroundColor: theme.colors.card,
        borderRadius: isMobile ? theme.borderRadius.sm : theme.borderRadius.md,
        padding: isMobile ? theme.spacing.xs : theme.spacing.sm,
        borderWidth: isMobile ? 1 : 2,
        borderColor: theme.colors.primary,
        ...theme.shadows.sm,
      }}
    >
      {/* Header with title - round badge hidden on mobile (included in short title) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMobile ? 2 : theme.spacing.xs,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 10 : theme.typography.sizes.md,
            fontWeight: theme.typography.weights.bold as any,
            color: theme.colors.text,
          }}
          numberOfLines={1}
        >
          {phaseInfo.title}
        </Text>

        {/* Round badge - only on desktop since mobile uses short titles like "R1 Def" */}
        {!isMobile && phaseInfo.round && (
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: 4,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.sizes.xs,
                fontWeight: theme.typography.weights.bold as any,
                color: theme.colors.white,
              }}
            >
              Round {phaseInfo.round}
            </Text>
          </View>
        )}
      </View>

      {/* Description - hidden on mobile to save space */}
      {!isMobile && (
        <Text
          style={{
            fontSize: theme.typography.sizes.sm,
            color: theme.colors.gray[600],
            marginBottom: theme.spacing.sm,
          }}
        >
          {phaseInfo.description}
        </Text>
      )}

      {/* Progress bar */}
      <View
        style={{
          height: isMobile ? 4 : 6,
          backgroundColor: theme.colors.gray[200],
          borderRadius: theme.borderRadius.sm,
          overflow: 'hidden',
          marginBottom: isMobile ? 2 : theme.spacing.xs,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: theme.colors.primary,
          }}
        />
      </View>

      {/* Step counter */}
      <Text
        style={{
          fontSize: isMobile ? 8 : theme.typography.sizes.sm,
          color: theme.colors.gray[500],
          textAlign: 'right',
        }}
      >
        {isMobile ? `${phaseInfo.step}/${totalSteps}` : `Step ${phaseInfo.step} of ${totalSteps}`}
      </Text>
    </View>
  );
}
