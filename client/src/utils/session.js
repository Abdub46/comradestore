// Generates (or reuses) a per-tab session id, used to group page views
// into "sessions" for analytics like bounce rate and average pages/session.
// Lives in sessionStorage, so a new tab/session starts fresh.
export function getSessionId() {
  let sessionId = sessionStorage.getItem('analyticsSessionId');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem('analyticsSessionId', sessionId);
  }
  return sessionId;
}