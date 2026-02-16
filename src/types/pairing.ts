// Core Types for 5-Player WTC Pairing System

export interface Player {
  id: string;
  color: string;
  team: 'A' | 'B';
  username?: string;
  profilePictureUrl?: string;
  faction?: string;
}

export interface Team {
  id: 'A' | 'B';
  name: string;
  players: Player[];
  color: string;
}

export type PlayerState =
  | 'available'      // In pool, not yet used
  | 'defender'       // Selected as defender this round
  | 'attacker'       // Selected as attacker this round
  | 'refused'        // Refused by opponent
  | 'paired';        // Permanently paired

export interface TableLayout {
  id: string;
  name: string;
  imageUrl: string;
}

export interface Pairing {
  id: string;
  tableNumber: number;
  teamAPlayer: Player;
  teamBPlayer: Player;
  createdInRound: 1 | 2 | 3;
  layout?: TableLayout;
}

export type Phase =
  | 'setup'                    // Initial team creation
  | 'round1-defender'          // Round 1: Select defenders
  | 'round1-defender-reveal'   // Round 1: Reveal defenders
  | 'round1-attackers'         // Round 1: Select attackers
  | 'round1-attackers-reveal'  // Round 1: Reveal attackers
  | 'round1-coin-flip'         // Round 1: Coinflip for table choice
  | 'round1-refuse'            // Round 1: Refuse attackers
  | 'round1-layout-select'     // Round 1: Select table layouts
  | 'round1-complete'          // Round 1: Show pairings created
  | 'round2-defender'          // Round 2: Select defenders
  | 'round2-defender-reveal'   // Round 2: Reveal defenders
  | 'round2-attackers'         // Round 2: Select attackers
  | 'round2-attackers-reveal'  // Round 2: Reveal attackers
  | 'round2-refuse'            // Round 2: Refuse attackers
  | 'round2-layout-select'     // Round 2: Select table layouts
  | 'round2-complete'          // Round 2: Show pairings created
  | 'round3-auto-pair'         // Round 3: Auto-pair last players
  | 'results';                 // Final results view

export interface RoundState {
  round: 1 | 2 | 3;
  teamADefender: Player | null;
  teamBDefender: Player | null;
  teamAAttackers: Player[];
  teamBAttackers: Player[];
  teamARefused: Player | null;
  teamBRefused: Player | null;
  tableChoiceToken: 'A' | 'B' | null;
}

export interface PairingState {
  // Team data
  teamA: Team;
  teamB: Team;

  // Player tracking
  playerStates: Map<string, PlayerState>;

  // Current phase
  currentPhase: Phase;

  // Round data
  round1: RoundState;
  round2: RoundState;

  // Pairings
  pairings: Pairing[];

  // Layout selection state
  availableLayouts: TableLayout[];           // Layouts not yet assigned
  coinflipWinner: 'A' | 'B' | null;          // Winner of Round 1 coinflip (persists)
  currentLayoutPicker: 'A' | 'B' | null;     // Who is currently picking a layout
  pendingLayoutForTable: number | null;      // Which table number needs a layout

  // UI state
  isAIThinking: boolean;
  showReveal: boolean;
}

// Multiplayer types

// Server uses '1' | '2' for team identifiers
export type ServerTeamId = '1' | '2';

export type ActionMessage =
  | { action: 'defender_played'; team: ServerTeamId }
  | { action: 'attacker_1_played'; team: ServerTeamId }
  | { action: 'attacker_2_played'; team: ServerTeamId }
  | { action: 'refusal_played'; team: ServerTeamId }
  | { action: 'layout_selected'; team: ServerTeamId; tableNumber: number };

export interface ServerRoundState {
  team1Defender: string | null;
  team2Defender: string | null;
  team1Attackers: string[];
  team2Attackers: string[];
  team1Refused: string | null;
  team2Refused: string | null;
  team1Layout: string | null;
  team2Layout: string | null;
  team1LayoutTable: number | null;
  team2LayoutTable: number | null;
}

export interface ServerPairingResult {
  tableNumber: number;
  team1Player: string;
  team2Player: string;
  layoutId: string | null;
  createdInRound: number;
}

export interface ServerPairingState {
  currentPhase: Phase;
  coinflipWinner: ServerTeamId | null;
  currentLayoutPicker: ServerTeamId | null;
  round1: ServerRoundState;
  round2: ServerRoundState;
  pairings: ServerPairingResult[];
  availableLayoutIds: string[];
}

export type PairingTransactionType =
  | 'select_defender'
  | 'select_attacker_1'
  | 'select_attacker_2'
  | 'refuse_attacker'
  | 'select_layout';

export interface PairingTransactionLog {
  transactionType: PairingTransactionType;
  entityId: string;
}

// Initial state helpers
const createInitialRoundState = (): RoundState => ({
  round: 1,
  teamADefender: null,
  teamBDefender: null,
  teamAAttackers: [],
  teamBAttackers: [],
  teamARefused: null,
  teamBRefused: null,
  tableChoiceToken: null,
});

export const createInitialPairingState = (teamA: Team, teamB: Team, layouts: TableLayout[]): PairingState => ({
  teamA,
  teamB,
  playerStates: new Map(),
  currentPhase: 'setup',
  round1: createInitialRoundState(),
  round2: { ...createInitialRoundState(), round: 2 },
  pairings: [],
  availableLayouts: layouts,
  coinflipWinner: null,
  currentLayoutPicker: null,
  pendingLayoutForTable: null,
  isAIThinking: false,
  showReveal: false,
});
