import React from 'react';
import { SvgProps } from 'react-native-svg';

// Imperium factions
import AdeptusAstartes from '@/src/assets/faction-icons/adeptus-astartes.svg';
import AdeptaSororitas from '@/src/assets/faction-icons/adepta-sororitas.svg';
import AstraMilitarum from '@/src/assets/faction-icons/astra-militarum.svg';
import AdeptusMechanicus from '@/src/assets/faction-icons/adeptus-mechanicus.svg';
import AdeptusCustodes from '@/src/assets/faction-icons/adeptus-custodes.svg';
import ImperialKnights from '@/src/assets/faction-icons/imperial-knights.svg';
import ImperialAquila from '@/src/assets/faction-icons/imperial-aquila.svg';
import Deathwatch from '@/src/assets/faction-icons/deathwatch.svg';
import GreyKnights from '@/src/assets/faction-icons/grey-knights.svg';
import BlackTemplars from '@/src/assets/faction-icons/black-templars.svg';
import BloodAngels from '@/src/assets/faction-icons/blood-angels.svg';
import SpaceWolves from '@/src/assets/faction-icons/space-wolves.svg';
import DarkAngels from '@/src/assets/faction-icons/dark-angels.svg';

// Chaos factions
import ChaosStar from '@/src/assets/faction-icons/chaos-star-01.svg';
import HereticAstartes from '@/src/assets/faction-icons/heretic-astartes.svg';
import ChaosKnights from '@/src/assets/faction-icons/questor-traitoris.svg';
import ChaosDaemons from '@/src/assets/faction-icons/chaos-daemons.svg';
import DeathGuard from '@/src/assets/faction-icons/death-guard.svg';
import ThousandSons from '@/src/assets/faction-icons/thousand-sons.svg';
import EmperorsChildren from '@/src/assets/faction-icons/emperors-children-1.svg';
import WorldEaters from '@/src/assets/faction-icons/world-eaters-1.svg';


// Xenos factions
import Tyranids from '@/src/assets/faction-icons/tyranids.svg';
import Orks from '@/src/assets/faction-icons/orks.svg';
import CraftworldEldar from '@/src/assets/faction-icons/craftworld-eldar.svg';
import LeaguesOfVotann from '@/src/assets/faction-icons/leagues-of-votann.svg';
import GenestealerCults from '@/src/assets/faction-icons/genestealer-cults.svg';
import Necrons from '@/src/assets/faction-icons/necrons.svg';
import Drukhari from '@/src/assets/faction-icons/dark-eldar.svg';
import TauEmpire from '@/src/assets/faction-icons/fire-caste.svg';

// Type for SVG component
type SvgComponent = React.FC<SvgProps>;

// Mapping from faction name strings to SVG components
const FACTION_ICONS: Record<string, SvgComponent> = {
  // Imperium
  'Space Marines': AdeptusAstartes,
  'Adeptus Astartes': AdeptusAstartes,
  'Adepta Sororitas': AdeptaSororitas,
  'Astra Militarum': AstraMilitarum,
  'Adeptus Mechanicus': AdeptusMechanicus,
  'Adeptus Custodes': AdeptusCustodes,
  'Imperial Knights': ImperialKnights,
  'Imperial Agents': ImperialAquila,
  'Dark Angels': DarkAngels,
  'Space Wolves': SpaceWolves,
  'Blood Angels': BloodAngels,
  'Deathwatch': Deathwatch,
  'Grey Knights': GreyKnights,
  'Black Templars': BlackTemplars,

  // Chaos
  'Chaos': ChaosStar,
  'Chaos Space Marines': HereticAstartes,
  'Death Guard': DeathGuard,
  'Thousand Sons': ThousandSons,
  "Emperor's Children": EmperorsChildren,
  'Emperors Children': EmperorsChildren,
  'World Eaters': WorldEaters,
  'Chaos Daemons': ChaosDaemons,
  'Chaos Knights': ChaosKnights,


  // Xenos
  'Tyranids': Tyranids,
  'Orks': Orks,
  'Aeldari': CraftworldEldar,
  'Craftworlds': CraftworldEldar,
  'Eldar': CraftworldEldar,
  'Leagues of Votann': LeaguesOfVotann,
  'Votann': LeaguesOfVotann,
  'Genestealer Cults': GenestealerCults,
  'Genestealer Cult': GenestealerCults,
  'Necrons': Necrons,
  'Drukhari' : Drukhari,
  'Tau': TauEmpire,
  'Custodes': AdeptusCustodes,
};

// Aliases for common variations in faction names
const FACTION_ALIASES: Record<string, string> = {
  // Short names (from API factionShortName)
  'SM': 'Space Marines',
  'CSM': 'Chaos Space Marines',
  'Astra': 'Astra Militarum',
  'eldar': 'Aeldari',
  'DE': 'Drukhari',
  'Nids': 'Tyranids',
  'CD': 'Chaos Daemons',
  'SOB': 'Adepta Sororitas',
  'AdMech': 'Adeptus Mechanicus',
  'IK': 'Imperial Knights',
  'Custodes': 'Adeptus Custodes',
  'GK': 'Grey Knights',
  'DG': 'Death Guard',
  'TS': 'Thousand Sons',
  'WE': 'World Eaters',
  'EC': "Emperor's Children",
  'GSC': 'Genestealer Cults',
  'LOV': 'Leagues of Votann',
  'CK': 'Chaos Knights',
  'IA': 'Imperial Agents',
  'BA': 'Blood Angels',
  'SW': 'Space Wolves',
  'DA': 'Dark Angels',
  'DW': 'Deathwatch',

  // Normalized names (from API factionNormalizedName)
  'SPACEMARINES': 'Space Marines',
  'CHAOSSPACEMARINES': 'Chaos Space Marines',
  'ASTRAMILITARUM': 'Astra Militarum',
  'ORKS': 'Orks',
  'AELDARI': 'Aeldari',
  'DRUKHARI': 'Drukhari',
  'TYRANIDS': 'Tyranids',
  'NECRONS': 'Necrons',
  'TAU': 'Tau',
  'CHAOSDAEMONS': 'Chaos Daemons',
  'ADEPTASORORITAS': 'Adepta Sororitas',
  'ADEPTUSMECHANICUS': 'Adeptus Mechanicus',
  'IMPERIALKNIGHTS': 'Imperial Knights',
  'CUSTODES': 'Adeptus Custodes',
  'GREYKNIGHTS': 'Grey Knights',
  'DEATHGUARD': 'Death Guard',
  'THOUSANDSONS': 'Thousand Sons',
  'WORLDEATERS': 'World Eaters',
  'EMPERORSCHILDREN': "Emperor's Children",
  'GENESTEALRCULTS': 'Genestealer Cults',
  'LEAGUESOFVOTANN': 'Leagues of Votann',
  'CHAOSKNIGHTS': 'Chaos Knights',
  'IMPERIALAGENTS': 'Imperial Agents',
  'BLOODANGELS': 'Blood Angels',
  'SPACEWOLVES': 'Space Wolves',
  'DARKANGELS': 'Dark Angels',
  'DEATHWATCH': 'Deathwatch',

  // Other common aliases
  'Astartes': 'Space Marines',
  'Guard': 'Astra Militarum',
  'IG': 'Astra Militarum',
  'AM': 'Adeptus Mechanicus',
  'Knights': 'Imperial Knights',
  'SoB': 'Adepta Sororitas',
  'Sisters': 'Adepta Sororitas',
  'TSons': 'Thousand Sons',
  'LoV': 'Leagues of Votann',
  'Squats': 'Leagues of Votann',
  'Dark Eldar': 'Drukhari',
  'Tau Empire': 'Tau',
};

function normalizeFactionName(name: string): string {
  // Check direct alias first
  if (FACTION_ALIASES[name]) {
    return FACTION_ALIASES[name];
  }
  // Check case-insensitive alias
  const upperName = name.toUpperCase();
  for (const [alias, canonical] of Object.entries(FACTION_ALIASES)) {
    if (alias.toUpperCase() === upperName) {
      return canonical;
    }
  }
  return name;
}

export interface FactionIconProps {
  faction: string;
  size?: number;
  color?: string;
  style?: object;
}

export function FactionIcon({ faction, size = 20, color, style }: FactionIconProps) {
  const normalizedFaction = normalizeFactionName(faction);
  const Icon = FACTION_ICONS[normalizedFaction] || FACTION_ICONS[faction];

  if (!Icon) {
    return null;
  }

  return (
    <Icon
      width={size}
      height={size}
      fill={color}
      style={style}
      // color={color}
      // stroke={color}
    />
  );
}

// Export utility for checking if a faction has an icon
export function hasFactionIcon(faction: string): boolean {
  const normalizedFaction = normalizeFactionName(faction);
  return !!(FACTION_ICONS[normalizedFaction] || FACTION_ICONS[faction]);
}

// Export the list of supported factions
export const SUPPORTED_FACTIONS = Object.keys(FACTION_ICONS);
