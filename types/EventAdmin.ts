export enum PairingStrategy {
  DutchSwiss = 'dutch_swiss',
  RoundRobin = 'round_robin',
  Manual = 'manual',
}

export interface CreateEventRequest {
  title: string;
  description?: string | null;
  numberOfRounds: number;
  location?: string | null;
  eventTypeId: number;
  maxParticipants?: number | null;
  hideLists: boolean;
  startDate: string;
  endDate: string;
  playerPack?: string | null;
  seasonId?: number | null;
  pairingStrategy: PairingStrategy;
  adminIds?: string[];
  refereeIds?: string[];
}

export interface UpdateEventRequest {
  title?: string | null;
  description?: string | null;
  numberOfRounds?: number | null;
  location?: string | null;
  eventTypeId?: number | null;
  maxParticipants?: number | null;
  hideLists?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  playerPack?: string | null;
  seasonId?: number | null;
  pairingStrategy?: PairingStrategy | null;
}

export interface EventType {
  id: number;
  name: string;
  description?: string | null;
  playersPerTeam: number;
  createdAt: string;
  updatedAt?: string | null;
}

export type RoundStatus = 'pending' | 'pairing_in_progress' | 'in_progress' | 'completed';

export interface RoundDto {
  id: string;
  eventId: string;
  roundNumber: number;
  status: RoundStatus;
  pairingStrategy?: PairingStrategy | null;
  startedAt?: string | null;
  completedAt?: string | null;
  hasPairings: boolean;
  matchCount: number;
}

export interface EventStateDto {
  event: import('./Event').Event;
  rounds: RoundDto[];
}

export type TeamMatchStatus = 'pending' | 'pairing' | 'in_progress' | 'completed';

export interface GameDto {
  id: string;
  teamMatchId: string;
  player1Id: string;
  player1Name: string;
  player1ArmyListId?: string;
  player1Faction?: string | null;
  player1Score: number;
  player1DifferentialScore: number;
  player2Id: string;
  player2Name: string;
  player2ArmyListId?: string;
  player2Faction?: string | null;
  player2Score: number;
  player2DifferentialScore: number;
  playedDate?: string | null;
  missionName?: string | null;
  deployment?: string | null;
  winnerId?: string | null;
}

export interface TeamMatchDto {
  id: string;
  eventId: string;
  roundId: string;
  team1Id: string;
  team1Name: string;
  team1Score: number;
  team1MatchPoints: number;
  team2Id?: string | null;
  team2Name?: string | null;
  team2Score: number;
  team2MatchPoints: number;
  isDraw: boolean;
  winnerId?: string | null;
  isBye: boolean;
  status: TeamMatchStatus;
  games?: GameDto[];
}

export type PlayerRole = 'Attacker' | 'Defender';

export interface PairingGameSideRequest {
  team: string;
  player: string;
  role: PlayerRole;
}

export interface PairingRequest {
  games: PairingGameSideRequest[];
}

export interface SubmitPairingsRequest {
  pairings: PairingRequest[];
}

export interface PlayerScoreEntry {
  playerId: string;
  score: number;
}

export interface ReportScoreRequest {
  results: PlayerScoreEntry[];
}
