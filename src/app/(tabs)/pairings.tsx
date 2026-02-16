import { Team, TableLayout } from '@/src/types/pairing';
import { PairingInitData } from '@/src/hooks/usePairingState';
import PairingGame from '@/src/components/pairings/PairingGame';

// Mock data for standalone demo/practice mode
const MOCK_LAYOUTS: TableLayout[] = [
  { id: 'layout1', name: 'L1', imageUrl: '' },
  { id: 'layout2', name: 'L2', imageUrl: '' },
  { id: 'layout3', name: 'L3', imageUrl: '' },
  { id: 'layout4', name: 'L4', imageUrl: '' },
  { id: 'layout5', name: 'L5', imageUrl: '' },
];

// Static layout images for demo mode (maps layout id to require())
const DEMO_LAYOUT_IMAGES: Record<string, any> = {
  layout1: require('@/assets/docs/layouts/layout1.png'),
  layout2: require('@/assets/docs/layouts/layout2.png'),
  layout3: require('@/assets/docs/layouts/layout3.png'),
  layout4: require('@/assets/docs/layouts/layout4.png'),
  layout5: require('@/assets/docs/layouts/layout5.png'),
};

const MOCK_TEAM_A: Team = {
  id: 'A', name: 'Team Alpha', color: '#3b82f6',
  players: [
    { id: 'a1', color: '#3b82f6', team: 'A', username: 'Alex J', faction: 'Space Marines' },
    { id: 'a2', color: '#3b82f6', team: 'A', username: 'Ben S', faction: 'Death Guard' },
    { id: 'a3', color: '#3b82f6', team: 'A', username: 'Chris D', faction: 'Thousand Sons' },
    { id: 'a4', color: '#3b82f6', team: 'A', username: 'Dan L', faction: 'Orks' },
    { id: 'a5', color: '#3b82f6', team: 'A', username: 'Emma W', faction: 'Astra Militarum' },
  ],
};

const MOCK_TEAM_B: Team = {
  id: 'B', name: 'Team Bravo', color: '#ef4444',
  players: [
    { id: 'b1', color: '#ef4444', team: 'B', username: 'Frank C', faction: 'Tyranids' },
    { id: 'b2', color: '#ef4444', team: 'B', username: 'Grace K', faction: 'Necrons' },
    { id: 'b3', color: '#ef4444', team: 'B', username: 'Henry P', faction: 'Craftworld Eldar' },
    { id: 'b4', color: '#ef4444', team: 'B', username: 'Ivy W', faction: 'Adeptus Custodes' },
    { id: 'b5', color: '#ef4444', team: 'B', username: 'Jake B', faction: 'World Eaters' },
  ],
};

const MOCK_INIT_DATA: PairingInitData = {
  teamA: MOCK_TEAM_A,
  teamB: MOCK_TEAM_B,
  layouts: MOCK_LAYOUTS,
};

// Helper to get image source for a layout (supports both demo static images and URL-based)
function getLayoutImageSource(layout: TableLayout): any {
  if (layout.imageUrl) {
    return { uri: layout.imageUrl };
  }
  return DEMO_LAYOUT_IMAGES[layout.id] || null;
}

export default function PairingsScreen() {
  return (
    <PairingGame
      initData={MOCK_INIT_DATA}
      getLayoutImageSource={getLayoutImageSource}
    />
  );
}
