export interface ApiAugment {
  id: number;
  name: string;
  slug?: string | null;
  description: string | null;
  tier: number | null;
  rank: string | null;
  image: string | null;
}
