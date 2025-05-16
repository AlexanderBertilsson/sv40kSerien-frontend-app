export interface Team {
    id: string;
    name: string;
    logo?: string;
    banner?: string;
    sportsmanshipScore: number;
    rank: number;
    members: string[];
    gameStats: {
        winRate: number;
        avgVictoryPoints: number; 
    };
    matchHistory: string[];
    calendar: string[];
  }