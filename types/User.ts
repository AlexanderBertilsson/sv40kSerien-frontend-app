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
  sportsmanshipProgress: number;
  sportsmanshipLevel: number;
  teamId: string;
}

export interface Profile extends User {
    isOrganizer?: boolean;
    teamRoles?: {
        role: string;
        teamId: string;
    }[];
}