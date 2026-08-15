/**
 * Application-level rate limiting for the public /api/chat endpoint.
 *
 * Vercel functions are stateless and horizontally scaled, so an in-memory
 * limiter can only ever be per-instance protection — it cannot promise a hard
 * global cap across many cold instances. That is an acceptable tradeoff for a
 * small portfolio (warm instances usually absorb burst traffic), and adding an
 * external store (Redis/KV) for v1 would be needless complexity. If this were
 * ever abused heavily despite the per-instance windows, move the window store
 * to a shared KV and leave the interface here unchanged.
 *
 * Limits (sensible defaults for a small site):
 *   - burst:        5 requests / minute / client
 *   - sustained:   30 requests / hour / client
 *   - global burst: 20 requests / minute (whole app, best-effort)
 *   - global  :    120 requests / hour   (whole app, best-effort)
 */
export interface RateLimitConfig {
  burstPerMinute: number;
  perHour: number;
  globalPerMinute: number;
  globalPerHour: number;
}

export const DEFAULT_RATE_LIMITS: RateLimitConfig = {
  burstPerMinute: 5,
  perHour: 30,
  globalPerMinute: 20,
  globalPerHour: 120,
};

export interface RateLimiter {
  /** Returns true when the request is allowed, false when rate-limited. */
  isAllowed(clientKey: string): boolean;
  /** Clears every recorded request (used between test cases). */
  reset(): void;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

function createWindow() {
  const buckets = new Map<string, number[]>();
  return {
    record(key: string, now: number, windowMs: number, max: number): boolean {
      const cutoff = now - windowMs;
      const timestamps = (buckets.get(key) ?? []).filter((t) => t > cutoff);
      if (timestamps.length >= max) {
        buckets.set(key, timestamps);
        return false;
      }
      timestamps.push(now);
      buckets.set(key, timestamps);
      return true;
    },
    clear(): void {
      buckets.clear();
    },
  };
}

export function createRateLimiter(config: RateLimitConfig = DEFAULT_RATE_LIMITS): RateLimiter {
  const perIpMinute = createWindow();
  const perIpHour = createWindow();
  const globalMinute = createWindow();
  const globalHour = createWindow();

  return {
    isAllowed(clientKey: string): boolean {
      const now = Date.now();
      const key = `ip:${clientKey}`;
      return (
        perIpMinute.record(key, now, MINUTE_MS, config.burstPerMinute) &&
        perIpHour.record(key, now, HOUR_MS, config.perHour) &&
        globalMinute.record("global", now, MINUTE_MS, config.globalPerMinute) &&
        globalHour.record("global", now, HOUR_MS, config.globalPerHour)
      );
    },
    reset(): void {
      perIpMinute.clear();
      perIpHour.clear();
      globalMinute.clear();
      globalHour.clear();
    },
  };
}

/** Shared singleton for the production handler (one instance per warm VM). */
export const rateLimiter: RateLimiter = createRateLimiter();

/** Exposed for tests so the singleton can be reset between cases. */
export function resetRateLimiter(): void {
  rateLimiter.reset();
}