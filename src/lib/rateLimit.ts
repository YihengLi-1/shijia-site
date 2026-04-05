/**
 * Rate limiter with dual-mode support:
 *
 * PRODUCTION (Upstash Redis — recommended for Vercel):
 *   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment.
 *   Get both from https://console.upstash.com → create a Redis database → REST API.
 *   Rate limits persist across serverless instances and restarts.
 *
 * DEVELOPMENT / FALLBACK (in-memory):
 *   If the above env vars are not set, falls back to in-process memory.
 *   ⚠️  In-memory limits do NOT persist across Vercel serverless cold starts or
 *   multiple function instances — do not rely on this in production.
 */

type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

// ─── In-memory fallback store ─────────────────────────────────────────────────

const STORE_KEY = "__shijia_rate_limit_store__";

function getMemoryStore(): Map<string, RateBucket> {
  const g = globalThis as unknown as Record<string, unknown>;
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = new Map<string, RateBucket>();
  }
  return g[STORE_KEY] as Map<string, RateBucket>;
}

function cleanupExpired(store: Map<string, RateBucket>, now: number) {
  if (store.size < 5000) return;
  for (const [k, v] of store) {
    if (v.resetAt <= now) store.delete(k);
  }
}

function checkMemoryRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getMemoryStore();
  cleanupExpired(store, now);

  const prev = store.get(key);
  if (!prev || prev.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: Math.max(0, opts.max - 1), retryAfterSec: 0 };
  }

  if (prev.count >= opts.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((prev.resetAt - now) / 1000)),
    };
  }

  prev.count += 1;
  store.set(key, prev);
  return { ok: true, remaining: Math.max(0, opts.max - prev.count), retryAfterSec: 0 };
}

// ─── Upstash Redis implementation ────────────────────────────────────────────

function hasUpstash(): boolean {
  return !!(
    (process.env.UPSTASH_REDIS_REST_URL ?? "").trim() &&
    (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim()
  );
}

async function checkUpstashRateLimit(
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const url   = process.env.UPSTASH_REDIS_REST_URL!.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!;

  const windowSec = Math.ceil(opts.windowMs / 1000);
  const redisKey  = `rl:${key}`;

  // Atomic INCR + EXPIRE via pipeline
  const pipeline = [
    ["INCR", redisKey],
    ["EXPIRE", redisKey, windowSec, "NX"],  // only set TTL on first increment
    ["TTL", redisKey],
  ];

  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pipeline),
  });

  if (!res.ok) {
    // Upstash unavailable — fall back to memory
    return checkMemoryRateLimit(key, opts);
  }

  const results = await res.json();
  const count   = Number(results?.[0]?.result ?? 1);
  const ttl     = Number(results?.[2]?.result ?? windowSec);

  if (count > opts.max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, ttl),
    };
  }

  return {
    ok: true,
    remaining: Math.max(0, opts.max - count),
    retryAfterSec: 0,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function checkRateLimitAsync(
  key: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  if (hasUpstash()) {
    try {
      return await checkUpstashRateLimit(key, opts);
    } catch {
      // Upstash error → graceful fallback
      return checkMemoryRateLimit(key, opts);
    }
  }
  return checkMemoryRateLimit(key, opts);
}

/**
 * Synchronous wrapper (preserves backward compatibility with existing routes).
 * When Upstash is configured this runs the async check and returns a pending
 * promise — callers must await it. Existing callers that don't await will get
 * the memory fallback synchronously.
 */
export function checkRateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  // If no Upstash, stay fully synchronous
  if (!hasUpstash()) return checkMemoryRateLimit(key, opts);
  // With Upstash we can't be synchronous — fall back to memory (callers should
  // migrate to checkRateLimitAsync for true persistence)
  return checkMemoryRateLimit(key, opts);
}

// ─── IP extraction ────────────────────────────────────────────────────────────

export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  return "unknown";
}
