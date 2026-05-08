// ── Types khớp với response enriched từ backend /api/v1/comps/ ──

export interface CompChampion {
  id: number;
  name: string;
  slug: string;
  cost: number;
  icon_path: string | null;
  splash_path: string | null;
}

export interface CompItem {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

export interface CompAugment {
  id: number;
  name: string;
  description: string | null;
  tier: number | null;
  image: string | null;
}

export interface CompBoardSlot {
  champion: CompChampion | null;
  items: CompItem[];
  is_three_star: boolean;
  hex: number | null;   // global hex index (0–27 với grid 4×7)
  row: number | null;   // hàng (0–3)
}

export interface CompActiveTrait {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  count: number;
  current_style: number;   // 0 = chưa kích hoạt, 1+ = mốc đã đạt
  total_styles: number;
}

export interface ApiComp {
  id: number;
  name: string;
  tier: string;                         // "S" | "A" | "B" | "C"
  playstyle: string | null;
  avg_placement: number | null;
  final_board: CompBoardSlot[] | null;
  carousel_priority: CompItem[];
  recommended_augments: CompAugment[];
  active_traits: CompActiveTrait[];
}
