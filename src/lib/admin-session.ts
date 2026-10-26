export const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;
export const LAST_ACTIVITY_KEY = "gnt_last_activity";

// Only return to pages on this admin site; auth/API URLs can create login loops.
export function loginDestination(callback: string | null, origin: string): string {
  try {
    const url = new URL(callback || "/", origin);
    const pathname = decodeURIComponent(url.pathname);
    if (url.origin !== origin ||
        /^\/(?:login|forgot-password|reset-password|verify-email|api|_next)(?:\/|$)/i.test(pathname)) {
      return "/";
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}

// A fresh sign-in starts a new idle window, regardless of the previous session.
export function activityTimestamp(stored: string | null | undefined, authenticatedAt?: number, now = Date.now()): number {
  const previous = Number(stored);
  if (!Number.isFinite(previous) || previous <= 0) return now;
  const candidates = [previous, authenticatedAt].filter(
    (value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0
  );
  return candidates.length ? Math.min(now, Math.max(...candidates)) : now;
}

export function startLoginActivity(): void {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch {
    // Cookie-based authentication must work even when browser storage is blocked.
  }
}
