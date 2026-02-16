import { Player, Team, TableLayout } from '@/src/types/pairing';
import { EventRegistrationMemberDto, LayoutDto } from '@/types/EventAdmin';

export function mapApiPlayersToTeam(
  members: EventRegistrationMemberDto[],
  teamSide: 'A' | 'B',
  teamName: string,
  color: string,
): Team {
  const players: Player[] = members
    .filter(m => m.eventRole.toLowerCase() === 'player')
    .slice(0, 5)
    .map(m => ({
      id: m.userId,
      color,
      team: teamSide,
      username: m.username,
      profilePictureUrl: m.profilePictureUrl,
      faction: m.armyList?.factionName,
    }));

  return {
    id: teamSide,
    name: teamName,
    players,
    color,
  };
}

export function mapApiLayouts(apiLayouts: LayoutDto[]): TableLayout[] {
  return apiLayouts.map(l => ({
    id: l.id,
    name: l.name,
    imageUrl: l.imageUrl,
  }));
}
