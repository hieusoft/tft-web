export interface ApiTrait {
  id: number;
  name: string;
  description: string | null;
  tier: string | null;
  placement: number | null;
  top4: string | null;
  pick_count: string | null;
  pick_percent: string | null;
  image: string | null;
  milestones: Record<string, unknown>[];
}
