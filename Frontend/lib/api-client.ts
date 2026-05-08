import type { ApiTrait } from "./types/trait";
import type { ApiChampion } from "./types/champion";
import type { ApiItem } from "./types/item";
import type { ApiAugment } from "./types/augment";
import type { ApiComp } from "./types/comp";
import { ApiGodDetail, ApiGodListItem } from "./types/god";

// Re-export types để code dùng api-client vẫn import được từ đây
export type { ApiTrait } from "./types/trait";
export type { ApiSkill, ApiChampion } from "./types/champion";
export type { ApiItem } from "./types/item";
export type { ApiAugment } from "./types/augment";
export type { ApiComp } from "./types/comp";
export type { ApiGodListItem, ApiGodDetail } from "./types/god";

// ── Fetch options ─────────────────────────────────────────────────────────────

interface FetchOptions {
  /** Next.js ISR revalidate in seconds. Default: 1800 (30 min) */
  revalidate?: number;
  /** Force no caching: 'no-store' */
  cache?: RequestCache;
  /** Extra request headers */
  headers?: Record<string, string>;
}

// ── Client class ──────────────────────────────────────────────────────────────

class TftApiClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly defaultRevalidate: number;

  constructor() {
    const apiUrl = typeof window === "undefined"
      ? (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)
      : process.env.NEXT_PUBLIC_API_URL;
    console.log("apiUrl", apiUrl);
    this.baseUrl = apiUrl?.replace(/\/$/, "") || "http://localhost:8000";
    console.log("this.baseUrl", this.baseUrl);
    this.apiKey = process.env.API_KEY ?? "";
    console.log("this.apiKey", this.apiKey);
    this.defaultRevalidate = 1800;
  }

  // ── Internal fetch helper ──────────────────────────────────────────────────

  private async get<T>(
    path: string,
    opts: FetchOptions = {}
  ): Promise<T | null> {
    const url = `${this.baseUrl}${path}`;
    try {
      const res = await fetch(url, {
        headers: {
          "X-API-Key": this.apiKey,
          ...opts.headers,
        },
        cache: opts.cache,
        next: opts.cache ? undefined : { revalidate: opts.revalidate ?? this.defaultRevalidate },
      });

      if (!res.ok) {
        console.error(`[api] GET ${path} -> ${res.status} ${res.statusText}`);
        return null;
      }

      return (await res.json()) as T;
    } catch (err) {
      console.error(`[api] GET ${path} failed:`, err);
      return null;
    }
  }

  // ── Resource methods ───────────────────────────────────────────────────────

  async getTraits(opts?: FetchOptions): Promise<ApiTrait[]> {
    return (await this.get<ApiTrait[]>("/api/v1/traits/", opts)) ?? [];
  }

  async getTrait(id: number, opts?: FetchOptions): Promise<ApiTrait | null> {
    return this.get<ApiTrait>(`/api/v1/traits/${id}`, opts);
  }

  async getChampions(opts?: FetchOptions): Promise<ApiChampion[]> {
    return (await this.get<ApiChampion[]>("/api/v1/champions/", opts)) ?? [];
  }

  async getChampion(
    id: number,
    opts?: FetchOptions
  ): Promise<ApiChampion | null> {
    return this.get<ApiChampion>(`/api/v1/champions/${id}`, opts);
  }
  
  async getChampionBySlug(
    slug: string,
    opts?: FetchOptions
  ): Promise<ApiChampion | null> {
    return this.get<ApiChampion>(`/api/v1/champions/${slug}`, opts);
  }

  async getItems(opts?: FetchOptions): Promise<ApiItem[]> {
    return (await this.get<ApiItem[]>("/api/v1/items/", opts)) ?? [];
  }

  async getItem(id: number, opts?: FetchOptions): Promise<ApiItem | null> {
    return this.get<ApiItem>(`/api/v1/items/${id}`, opts);
  }

  async getItemBySlug(slug: string, opts?: FetchOptions): Promise<ApiItem | null> {
    return this.get<ApiItem>(`/api/v1/items/${slug}`, opts);
  }

  async getAugments(opts?: FetchOptions): Promise<ApiAugment[]> {
    return (await this.get<ApiAugment[]>("/api/v1/augemnts/", opts)) ?? [];
  }

  async getAugment(
    id: number,
    opts?: FetchOptions
  ): Promise<ApiAugment | null> {
    return this.get<ApiAugment>(`/api/v1/augemnts/${id}`, opts);
  }

  async getGods(opts?: FetchOptions): Promise<ApiGodListItem[]> {
    return (await this.get<ApiGodListItem[]>("/api/v1/gods/", opts)) ?? [];
  }

  async getGod(id: number, opts?: FetchOptions): Promise<ApiGodDetail | null> {
    return this.get<ApiGodDetail>(`/api/v1/gods/${id}`, opts);
  }

  // ── Comps ─────────────────────────────────────────────────────────────────

  async getComps(opts?: FetchOptions): Promise<ApiComp[]> {
    return (await this.get<ApiComp[]>("/api/v1/comps/", opts)) ?? [];
  }

  async getComp(id: number, opts?: FetchOptions): Promise<ApiComp | null> {
    return this.get<ApiComp>(`/api/v1/comps/${id}`, opts);
  }


}

// ── Singleton export ──────────────────────────────────────────────────────────

const apiClient = new TftApiClient();
export default apiClient;
