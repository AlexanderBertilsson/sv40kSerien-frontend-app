export interface Event {
  id: string,
  title: string,
  description: string,
  rounds: number,
  winningTeamId: string,
  winningTeamName: string,
  location: string,
  eventType: {
    id: number,
    name: string,
    description: string
    playersPerTeam: number
  },
  createdByUserId: string,
  numberOfPlayers: number,
  startDate: string,
  endDate: string,
  playerPack: string,
  numberOfRegisteredPlayers: number,
  numberOfRegisteredTeams: number,
  registeredTeams: EventTeam[]
}

export interface EventTeam {
    id: string,
    teamName: string,
    logoUrl: string,
    sportsmanshipLvl: number,
    users: [
        {
          id: string,
          username: string,
          sportsmanshipLevel: number,
          profilePictureUrl: string,
          armyId: string,
          faction: string,
          detachment: string | null
        }
      ]
}
