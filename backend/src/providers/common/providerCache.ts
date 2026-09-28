import { env } from '../../config/env';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  retrievedAt: string;
}

export class ProviderCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTtlMs: number;

  constructor(ttlMinutes: number = env.WEATHER_CACHE_TTL_MINUTES) {
    this.defaultTtlMs = ttlMinutes * 60 * 1000;
  }

  public generateKey(
    provider: string,
    latitude: number,
    longitude: number,
    start: string,
    end: string,
    parameters: string = 'default'
  ): string {
    const lat = latitude.toFixed(4);
    const lon = longitude.toFixed(4);
    return `${provider.toUpperCase()}:${lat}:${lon}:${start}:${end}:${parameters}`;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlMinutes?: number): void {
    if (!data) return;

    // Guard: never cache structured provider errors as successful responses
    if (typeof data === 'object' && (data as any)?.status === 'ERROR') {
      return;
    }

    const ttlMs = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTtlMs;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
      retrievedAt: new Date().toISOString(),
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const providerCache = new ProviderCache();
