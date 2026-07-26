import api from './api';
import { getSessionId } from '../utils/session';

// Fire-and-forget: callers never await this, and errors are always
// swallowed here. Analytics must never slow down or break navigation.
export function trackPageView(path) {
  api.post('/analytics/track', { path, sessionId: getSessionId() }).catch(() => {});
}
