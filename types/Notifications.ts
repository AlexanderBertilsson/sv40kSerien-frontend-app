export interface Notification {
    notificationType: "team_invite" | "tournament_invite";
    payload: TeamInvite | TournamentInvite;
}

export interface TeamInvite {
    id: string;
    senderName: string;
    senderId: string;
    recieverId: string;
    team: {
        id: string;
        name: string;
        logoUrl?: string;
        bannerUrl?: string;
        sportsmanshipLvl: number;
    }
}

export interface TournamentInvite{

}
