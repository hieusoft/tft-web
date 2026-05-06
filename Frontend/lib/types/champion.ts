export interface ApiSkill {
  id: number;
  name: string;
  description: string | null;
  icon_path: string | null;
}

export interface ApiChampion {
  id: number;
  name: string;
  cost: number;
  accent_color: string | null;
  icon_path: string | null;
  splash_path: string | null;
  skill: ApiSkill | null;
  avg_placement: number | null;
  top_4_rate: string | null;
  win_rate: string | null;
  match_count: number;
}

export interface ApiChampionSkill {
  name: string;
  mana_start: number;
  mana_max: number;
  description: string;
  ability_stats: Record<string, any>;
  icon_path: string;
}

export interface ApiChampionTrait {
  name: string;
  slug: string;
}

export interface ApiItemShort {
  id: number;
  name: string;
  image: string;
}

export interface ApiBestItem {
  item: ApiItemShort;
  avg_placement: number;
  win_rate: string;
  pick_percent: string;
}

export interface ApiBestBuild {
  item_1: ApiItemShort;
  item_2: ApiItemShort;
  item_3: ApiItemShort;
  avg_placement: number;
  win_rate: string;
}

export interface ApiChampionDetail {
  id: number;
  name: string;
  slug: string;
  cost: number;
  rank: string;
  avg_placement: number;
  win_rate: string;
  games_played: string;
  pick_rate: string;
  icon_path: string;
  splash_path: string;
  skill: ApiChampionSkill;
  traits: ApiChampionTrait[];
  base_stats: Record<string, string>; 
  best_builds: ApiBestBuild[];        
  best_items: ApiBestItem[];
}

