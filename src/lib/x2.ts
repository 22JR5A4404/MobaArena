const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const failedAttemptsMap = new Map<string, { count: number; lockedUntil: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count++;
  return { allowed: true };
}

export function checkBruteForce(key: string): { allowed: boolean; lockedUntil?: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record || now > record.lockedUntil) {
    failedAttemptsMap.set(key, { count: 0, lockedUntil: 0 });
    return { allowed: true };
  }

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    return { allowed: false, lockedUntil: record.lockedUntil };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(key);

  if (!record || now > record.lockedUntil) {
    failedAttemptsMap.set(key, { count: 1, lockedUntil: now + LOCKOUT_DURATION });
    return;
  }

  record.count++;
  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION;
  }
}

export function resetFailedAttempts(key: string): void {
  failedAttemptsMap.delete(key);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, 1000);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
