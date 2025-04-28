import { Team } from "./Team";

export interface Profile {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  heroImage: string;
  sportsmanship: number;
  sportsmanshipLevel: number;
  role: string;
  mostPlayedArmies?: { army: string, gamesPlayed: number }[];
  gameRole?: string;
  matchHistory?: number[];
  winRate?: number;
  avgVictoryPoints?: number;
  achievements?: number[];  
  team: Team;
  // Add any other fields as needed
}