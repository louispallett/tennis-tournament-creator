const rateMap = new Map<string, { count: number; firstRequest: number }>();

export function rateLimitIP(ip: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry) {
    rateMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }

  const timePassed = now - entry.firstRequest;

  if (timePassed > windowMs) {
    rateMap.set(ip, { count: 1, firstRequest: now });
    return false;
  }

  if (entry.count >= max) return true;

  entry.count++;
  return false;
}
