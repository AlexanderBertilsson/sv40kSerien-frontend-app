export interface Team {
    id: string;
    name: string;
    logoUrl	?: string;
    bannerUrl?: string;
    sportsmanshipLvl: number;
    rank: number;
    users:  {
        id: string;
        username: string;
        email: string;
        sportsmanshipProgress: number;
        sportsmanshipLevel: number;
        profilePictureUrl: string;
        heroImageUrl: string;
        teamId: string;
      }[];
    gameStats: {
        winRate: number;
        avgVictoryPoints: number; 
    };
  }