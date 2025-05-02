import { RosterPlayer } from "./RosterPlayer";

export interface RosterTeam {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  players: RosterPlayer[];
}