export interface ItemComponent {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export interface ApiItem {
  id: number;
  name: string;
  slug?: string;
  category: string;
  /** Rank tier S/A/B/C/D from backend */
  rank?: string;
  /** Icon URL – may come as `image` or `icon_path` from API */
  icon_path?: string | null;
  image?: string | null;
  description?: string;
  /** Stats object (key→value record) or array */
  stats?: Record<string, string> | { key: string; label: string; value: string }[];
  recipe?: number[];
  /** Component items – can be ID (legacy) or full object */
  component_1?: ItemComponent | number | null;
  component_2?: ItemComponent | number | null;
  avg_placement?: number | null;
  /** e.g. "82.0%" – already a percentage string */
  win_rate?: string | null;
  /** e.g. "0.8%" – already a percentage string */
  pick_rate?: string | null;
  /** Backwards compatibility for the API which still sends 'frequency' instead of 'pick_rate' */
  frequency?: string | null;
  /** e.g. "66.2%" */
  top_4_rate?: string | null;
  /** May be a number or a string from the API */
  games_played?: number | string;
  best_users?: {
    avg_placement: number;
    pick_percent: string;
    champion: {
      name: string;
      icon_path: string;
    };
  }[] | null;
}
