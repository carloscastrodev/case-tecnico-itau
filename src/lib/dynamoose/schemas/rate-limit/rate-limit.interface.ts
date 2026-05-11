export interface RateLimitKey {
  pk: string;
}

export interface RateLimit {
  ttl: number;
  totalHits: number;
  limit: number;
  blockDuration: number;
  blockExpiresAt: number;
  throttlerName: string;
  createdAt: string;
}

export type RateLimitWithKey = RateLimit & RateLimitKey;
