import { Player } from '@/src/types/pairing';

/**
 * Ultra-simple AI for POC
 * Selects random players from the available pool
 * No delays, no strategy - just instant random selection
 */

export const selectRandom = (players: Player[], count: number): Player[] => {
  if (players.length === 0) return [];
  if (count >= players.length) return [...players];

  // Shuffle and take first 'count' players
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Randomly refuse one of two attackers
 */
export const refuseRandom = (attackers: [Player, Player]): Player => {
  return Math.random() > 0.5 ? attackers[0] : attackers[1];
};
