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
  mission?: PrimaryMissionDto | null;
  layout?: LayoutDto | null;
  winnerId?: string | null;
}

export interface PairingStateDto {
  id: string;
  status: string; // "pending", "in_progress", "completed"
  state: string | null;
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
  team1ConfirmedById?: string | null;
  team2ConfirmedById?: string | null;
  status: TeamMatchStatus;
  games?: GameDto[];
  pairingState?: PairingStateDto | null;
}

export interface LayoutDto {
  id: string;
  name: string;
  imageUrl: string;
  deployment: Deployment;
}

export interface RoundConfigDto {
  eventId: string;
  roundNumber: number;
  deployment: Deployment;
  primaryMission?: { id: number; name: string } | null;
  layouts: LayoutOptionDto[];
}

export interface EventRegistrationMemberDto {
  registrationId: number;
  userId: string;
  username: string;
  profilePictureUrl: string;
  sportsmanshipLevel: number;
  eventRole: string;
  isAdmin: boolean;
  isCaptain: boolean;
  armyList?: {
    id: string;
    name: string;
    factionName: string;
    detachmentName?: string;
    points: number;
    lastUpdated: string;
  } | null;
}

export interface EventTeamRegistrationResponseDto {
  eventId: string;
  teamId: string;
  eventTeamStatus?: string | null;
  members: EventRegistrationMemberDto[];
}

export type PlayerRole = 'Attacker' | 'Defender';

export interface PairingGameSideRequest {
  team: string;
  player: string;
  role: PlayerRole;
}

export interface GamePairingRequest {
  sides: PairingGameSideRequest[];
  missionId?: number | null;
  layoutId?: string | null;
}

export interface SubmitPairingsRequest {
  pairings: GamePairingRequest[];
}

// Pairing game API request types
export interface SelectDefenderRequest {
  teamId: string;
  defenderId: string;
}

export interface SelectAttackersRequest {
  teamId: string;
  attackerIds: string[];
}

export interface RefuseAttackerRequest {
  teamId: string;
  attackerId: string;
}

export interface SelectLayoutRequest {
  teamId: string;
  layoutId: string;
}

export interface PlayerScoreEntry {
  playerId: string;
  score: number;
}

export interface ReportScoreRequest {
  results: PlayerScoreEntry[];
}

// Deployment enum values from API
export type Deployment =
  | 'search_and_destroy'
  | 'tipping_point'
  | 'hammer_and_anvil'
  | 'dawn_of_war'
  | 'crucible_of_battle'
  | 'sweeping_engagement';

export interface PrimaryMissionDto {
  id: number;
  name: string;
}

export interface LayoutOptionDto {
  id: string;
  name: string;
  imageUrl: string;
  deployment: Deployment;
}

export interface ConfigurationOptionsDto {
  deployments: Deployment[];
  primaryMissions: PrimaryMissionDto[];
  layouts: LayoutOptionDto[];
}

export interface RoundConfigRequestItem {
  roundNumber: number;
  deployment: Deployment;
  primaryMissionId: number;
  layoutIds: string[];
}

export interface AddRoundConfigRequest {
  rounds: RoundConfigRequestItem[];
}

export interface TeamDetailsDto {
  id: string;
  name: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  sportsmanshipLvl: number;
}

export interface RoundResultDto {
  roundNumber: number;
  differentialScore: number;
  isBye: boolean;
  isWinner: boolean;
  isDraw: boolean;
  isCompleted: boolean;
}

export type EventTeamStandingStatus = 'active' | 'dropped';

export interface EventTeamStandingsDto {
  matchPoints: number;
  accumulatedScore: number;
  strengthOfSchedule: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesDrawn: number;
  matchesLost: number;
  currentRank: number;
  status?: EventTeamStandingStatus;
  team: TeamDetailsDto | null;
  roundResults: RoundResultDto[] | null;
}
