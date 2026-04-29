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
