export interface MostPlayedArmy {
  army: string;
  gamesPlayed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  heroImage: string;
  sportsmanship: number;
  sportsmanshipLevel: number;
  teamId: string;
  role: string;
  mostPlayedArmies: MostPlayedArmy[];
  gameRole: string;
  matchHistory: number[];
  winRate: number;
  avgVictoryPoints: number;
  achievements: number[];
}