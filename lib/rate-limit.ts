/**
 * Simple in-memory rate limiter using sliding window algorithm
 *
 * Tracks requests per IP address and enforces configurable rate limits.
 * This is a basic implementation suitable for single-instance deployments.
 * For production multi-instance deployments, consider using Redis-based rate limiting.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RequestRecord {
  /** Array of timestamps for each request */
  requests: number[];
}

/** In-memory store of IP addresses and their request timestamps */
const requestStore = new Map<string, RequestRecord>();

/** Cleanup interval to prevent memory leaks - runs every 5 minutes */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/** Maximum number of IPs to track (prevent DoS via memory exhaustion) */
const MAX_TRACKED_IPS = 10000;

/**
 * Cleanup old request records to prevent memory leaks
 */
function cleanupOldRecords(): void {
  const now = Date.now();

  for (const [ip, record] of requestStore.entries()) {
    // Remove records older than 1 hour
    record.requests = record.requests.filter(timestamp => now - timestamp < 60 * 60 * 1000);

    // Delete IP entry if no recent requests
    if (record.requests.length === 0) {
      requestStore.delete(ip);
    }
  }

  // If store is still too large, remove oldest entries
  if (requestStore.size > MAX_TRACKED_IPS) {
    const sortedEntries = Array.from(requestStore.entries())
      .sort((a, b) => {
        const aLatest = Math.max(...a[1].requests);
        const bLatest = Math.max(...b[1].requests);
        return aLatest - bLatest;
      });

    // Keep only the most recent MAX_TRACKED_IPS / 2 entries
    const toKeep = sortedEntries.slice(-Math.floor(MAX_TRACKED_IPS / 2));
    requestStore.clear();
    toKeep.forEach(([ip, record]) => requestStore.set(ip, record));
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupOldRecords, CLEANUP_INTERVAL_MS);
}

/**
 * Extract client IP address from request headers
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const headers = request.headers;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  // Fallback to a default value (cannot get actual IP in serverless environments)
  return 'unknown';
}

/**
 * Check if request should be rate limited
 *
 * @param identifier - Unique identifier (typically IP address)
 * @param config - Rate limit configuration
 * @returns Object with limited status and retry info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): {
  limited: boolean;
  remaining: number;
  resetMs: number;
} {
  const now = Date.now();

  // Get or create request record for this identifier
  let record = requestStore.get(identifier);
  if (!record) {
    record = { requests: [] };
    requestStore.set(identifier, record);
  }

  // Remove requests outside the current window
  const windowStart = now - config.windowMs;
  record.requests = record.requests.filter(timestamp => timestamp > windowStart);

  // Check if limit exceeded
  const requestCount = record.requests.length;

  if (requestCount >= config.maxRequests) {
    // Rate limit exceeded
    const oldestRequest = Math.min(...record.requests);
    const resetMs = config.windowMs - (now - oldestRequest);

    return {
      limited: true,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  // Add current request timestamp
  record.requests.push(now);

  return {
    limited: false,
    remaining: config.maxRequests - requestCount - 1,
    resetMs: config.windowMs,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 *
 * @param config - Rate limit configuration
 * @returns Response if rate limited, null otherwise
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = rateLimit(request, { maxRequests: 30, windowMs: 60000 });
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Handle request...
 * }
 * ```
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig
): Response | null {
  const ip = getClientIp(request);
  const result = checkRateLimit(ip, config);

  if (result.limited) {
    const retryAfterSeconds = Math.ceil(result.resetMs / 1000);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfter: retryAfterSeconds,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfterSeconds.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + result.resetMs).toISOString(),
        },
      }
    );
  }

  // Not rate limited - return null to continue processing
  return null;
}

/**
 * Predefined rate limit configurations
 */
export const RATE_LIMITS = {
  /** 30 requests per minute - for form submissions */
  FORM_SUBMISSION: { maxRequests: 30, windowMs: 60 * 1000 },

  /** 10 requests per minute - for export operations */
  EXPORT: { maxRequests: 10, windowMs: 60 * 1000 },

  /** 5 requests per minute - for build operations */
  BUILD: { maxRequests: 5, windowMs: 60 * 1000 },

  /** 100 requests per minute - for general API usage */
  GENERAL: { maxRequests: 100, windowMs: 60 * 1000 },
} as const;
