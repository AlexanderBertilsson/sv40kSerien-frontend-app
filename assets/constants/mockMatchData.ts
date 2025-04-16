export interface Player {
  id: string;
  name: string;
  profileImage: string;
  faction: string;
  armyListUrl: string;
}

export interface Game {
  player1Score: number;
  player2Score: number;
}

export interface Match {
  id: string;
  date: string;
  games: Game[];
  primaryMission: string;
  deploymentMap: string;
  missionRules: string[];
  result: 'win' | 'loss' | 'draw';
  score: {
    team: number;
    opponent: number;
  };
  event: string;
  team: {
    name: string;
    logo: string;
    players: Player[];
    score: number;
  };
  opponent: {
    name: string;
    logo: string;
    players: Player[];
    score: number;
  };
}

export const mockMatches: Match[] = [
  {
    id: '1',
    date: '2025-03-28',
    team: {
      name: "Imperial Fists",
      logo: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=200&h=200&fit=crop",
      players: [
        {
          id: '1',
          name: 'Marcus Aurelius',
          profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
          faction: 'Space Marines',
          armyListUrl: 'NewRecruit-GW'
        },
        {
          id: '2',
          name: 'Julia Domna',
          profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
          faction: 'Imperial Knights',
          armyListUrl: 'NewRecruit-GW'
        },
        {
          id: '3',
          name: 'Lucius Verus',
          profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=400",
          faction: 'Adeptus Mechanicus',
          armyListUrl: 'NewRecruit-WTC'
        },
        {
          id: '4',
          name: 'Claudia Augusta',
          profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400",
          faction: 'Sisters of Battle',
          armyListUrl: 'NewRecruit-GW'
        },
        {
          id: '5',
          name: 'Septimius Severus',
          profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400",
          faction: 'Imperial Guard',
          armyListUrl: 'NewRecruit-WTC'
        }
      ],
      score: 60,
    },
    opponent: {
      name: "Chaos Warband",
      logo: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=200&h=200&fit=crop",
      players: [
        {
          id: '6',
          name: 'Abaddon',
          profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=400",
          faction: 'Black Legion',
          armyListUrl: 'NewRecruit-WTC'
        },
        {
          id: '7',
          name: 'Mortarion',
          profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=400",
          faction: 'Death Guard',
          armyListUrl: 'NewRecruit-GW'
        },
        {
          id: '8',
          name: 'Magnus',
          profileImage: "https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=80&w=400",
          faction: 'Thousand Sons',
          armyListUrl: 'NewRecruit-WTC'
        },
        {
          id: '9',
          name: 'Lucius',
          profileImage: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400",
          faction: "Emperor's Children",
          armyListUrl: 'NewRecruit-GW'
        },
        {
          id: '10',
          name: 'Typhus',
          profileImage: "https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?q=80&w=400",
          faction: 'Death Guard',
          armyListUrl: 'NewRecruit-WTC'
        }
      ],
      score: 40,
    },
    games: [
      { player1Score: 15, player2Score: 5 },
      { player1Score: 8, player2Score: 12 },
      { player1Score: 10, player2Score: 10 },
      { player1Score: 20, player2Score: 0 },
      { player1Score: 7, player2Score: 13 }
    ],
    primaryMission: 'Take and Hold',
    deploymentMap: 'Hammer and Anvil',
    missionRules: ['No Man\'s Land', 'Objective Secured'],
    result: 'win',
    score: { team: 60, opponent: 40 },
    event: 'League Match'
  },
];
