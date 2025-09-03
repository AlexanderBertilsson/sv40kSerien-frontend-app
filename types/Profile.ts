import { Team } from "./Team";

export interface Profile {
  id: string;
  username: string;
  email: string;
  profilePictureUrl: string;
  heroImageUrl: string;
  sportsmanshipScore: number;
  sportsmanshipLevel: number;
  teamId: string;
  team?: Team;

}