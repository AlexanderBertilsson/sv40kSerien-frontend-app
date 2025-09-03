export interface Ladder {
    id: string;
    seasonId: number;
    team: {
        id: string;
        name: string;
        logoUrl?: string;
        bannerUrl?: string;
        sportsmanshipLvl: number;
    }
    score: number;
    gamesWon: number;
    gamesLost: number;
    gamesDrawn: number;
    gamesPlayed: number;
}
