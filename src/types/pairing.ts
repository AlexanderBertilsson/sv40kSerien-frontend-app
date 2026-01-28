// Core Types for 5-Player WTC Pairing System

export interface Player {
  id: string;
  initials: string;
  color: string;
  team: 'A' | 'B';
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

// Table layout types (5 unique layouts for 5 tables)
export type TableLayout = 'layout1' | 'layout2' | 'layout3' | 'layout4' | 'layout5';

export interface Pairing {
  id: string;
  tableNumber: number;
  teamAPlayer: Player;
  teamBPlayer: Player;
  createdInRound: 1 | 2 | 3;
  layout?: TableLayout;  // Selected table layout
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

// Initial state helpers
export const createInitialRoundState = (): RoundState => ({
  round: 1,
  teamADefender: null,
  teamBDefender: null,
  teamAAttackers: [],
  teamBAttackers: [],
  teamARefused: null,
  teamBRefused: null,
  tableChoiceToken: null,
});

export const createInitialPairingState = (teamA: Team, teamB: Team): PairingState => ({
  teamA,
  teamB,
  playerStates: new Map(),
  currentPhase: 'setup',
  round1: createInitialRoundState(),
  round2: { ...createInitialRoundState(), round: 2 },
  pairings: [],
  availableLayouts: ['layout1', 'layout2', 'layout3', 'layout4', 'layout5'],
  coinflipWinner: null,
  currentLayoutPicker: null,
  pendingLayoutForTable: null,
  isAIThinking: false,
  showReveal: false,
});
