// Tracks a guest's last homepage visit in localStorage, so the "Since You
// Last Visited" Pulse section has something real to compare against even
// for users without an account. Logged-in users don't need this - their
// last visit is tracked server-side via User.lastSeenAt.
const STORAGE_KEY = 'guestLastVisit';

// Reads the previously stored visit timestamp (or null if this is the
// guest's first visit) WITHOUT overwriting it yet - call recordVisitNow()
// separately once you're done using this value.
export function getGuestLastVisit() {
  return localStorage.getItem(STORAGE_KEY);
}

export function recordGuestVisitNow() {
  localStorage.setItem(STORAGE_KEY, new Date().toISOString());
}