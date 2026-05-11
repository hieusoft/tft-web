export interface ApiGodListItem {
    id: number;
    slug?: string;
    name: string;
    trait: string;
    rank: string;
    unique: number;
    image: string;
    boon_augment_id: number;
  }
  
  export interface ApiGodDetail extends ApiGodListItem {
    augment?: {
      name: string;
      description: string;
      image: string;
    };
    stages?: {
      stage: string;
      rewards: {
        icon: string;
        text: string;
      }[];
    }[];
  }