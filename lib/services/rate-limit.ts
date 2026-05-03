// In-memory rate limiter using sliding window
const windows = new Map<string, number[]>();

function cleanup(now: number) {
  for (const [key, timestamps] of windows) {
    const filtered = timestamps.filter(t => now - t < 60000);
    if (filtered.length === 0) windows.delete(key);
    else windows.set(key, filtered);
  }
}

// Periodic cleanup
setInterval(() => cleanup(Date.now()), 60000);

export interface RateLimitRule {
  windowMs: number; // always 60000 (1 min)
  maxRequests: number;
}

export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  'auth': { windowMs: 60000, maxRequests: 10 },
  'generate': { windowMs: 60000, maxRequests: 3 },
  'chat': { windowMs: 60000, maxRequests: 10 },
  'default': { windowMs: 60000, maxRequests: 60 },
};

export function checkRateLimit(key: string, ruleName: string = 'default'): { allowed: boolean; retryAfter?: number } {
  const rule = RATE_LIMIT_RULES[ruleName] || RATE_LIMIT_RULES.default;
  const now = Date.now();

  let timestamps = windows.get(key) || [];
  timestamps = timestamps.filter(t => now - t < rule.windowMs);

  if (timestamps.length >= rule.maxRequests) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + rule.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  timestamps.push(now);
  windows.set(key, timestamps);
  return { allowed: true };
}

export function getRateLimitKey(pathname: string, userId?: number, ip?: string): { key: string; rule: string } {
  if (pathname.includes('/api/auth/')) {
    return { key: `auth:${ip || userId || 'anon'}`, rule: 'auth' };
  }
  if (pathname.includes('/api/studio/generate') || pathname.includes('/api/tools/generate')) {
    return { key: `gen:${userId || ip || 'anon'}`, rule: 'generate' };
  }
  if (pathname.includes('/api/chat/')) {
    return { key: `chat:${userId || ip || 'anon'}`, rule: 'chat' };
  }
  return { key: `api:${userId || ip || 'anon'}`, rule: 'default' };
}
