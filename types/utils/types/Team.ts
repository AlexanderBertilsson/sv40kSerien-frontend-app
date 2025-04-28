export interface Team {
    id: string;
    name: string;
    logo?: string;
    banner?: string;
    sportsmanshipScore: number;
    rank: number;
    members: number[];
    gameStats: {
        winRate: number;
        avgVictoryPoints: number; 
    };
    matchHistory: number[];
    calendar: number[];
  }