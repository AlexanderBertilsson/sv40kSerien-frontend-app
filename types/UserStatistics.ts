export interface UserStatistics {
  userId: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  averageScore: number;
  winRatio: number;
  mostPlayedRole: string;
  mostPlayedArmies: {name: string, gamesPlayed: number}[];
}
