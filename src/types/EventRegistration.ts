import { ArmyList } from '@/types/ArmyList';

export interface EventRegistration {
  id: number;
  userId: string;
  teamId: string;
  eventId: string;
  armyListId: string | null;
  eventRole: number; // 0=Player, 1=Spectator
  isAdmin: boolean;
  isCaptain: boolean;
  armyList: ArmyList | null;
}
