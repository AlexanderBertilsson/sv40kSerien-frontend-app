import { RosterTeam } from "./RosterTeam";
import { RosterPlayer } from "./RosterPlayer";

export interface Event {
  id: string;
  title: string;
  description: string;
  rounds: number;
  date: string;
  location: string;
  type: '8man' | '5man' | 'single';
  roster: RosterTeam[] | RosterPlayer[];
}