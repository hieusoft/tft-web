export interface ApiItemStat {
  key: string;
  label: string;
  value: string;
}

export interface ApiItem {
  id: number;
  name: string;
  category: string;
  icon_path: string | null;
  description: string;
  recipe: number[];
  stats: ApiItemStat[];
  avg_placement: number | null;
  top_4_rate: string | null;
  win_rate: string | null;
  games_played: number;
}
