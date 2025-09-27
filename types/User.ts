export interface MostPlayedArmy {
  army: string;
  gamesPlayed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  heroImageUrl: string;
  sportsmanshipScore: number;
  sportsmanshipLevel: number;
  teamId: string;
}