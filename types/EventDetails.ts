export interface EventDetails  {
  id: string;
  title: string;
  description?: string;
  rounds: number;
  winningTeamId?: string;
  winningTeamName?: string;
  location: string;
  eventType: {
    id: number;
    name: string;
    description: string;
    playersPerTeam: number
  },
  createdByUserId: string,
  maxParticipants?: number | null,
  startDate: string,
  endDate: string,
  playerPack?: string,
  numberOfRegisteredPlayers: number,
  numberOfRegisteredTeams: number
}