/**
 * Cross-tab daily-limit sync — signal only, no cached counts.
 * Tab A bumps this key after a run + API refresh; other tabs listen via
 * `storage` and re-fetch `get-outreach-dashboard-data`.
 */
export const HAPPPY_AGENT_DAILY_LIMIT_SYNC_KEY = 'happpy_agent_daily_limit_sync';

export function broadcastHapppyAgentDailyLimitSync() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(HAPPPY_AGENT_DAILY_LIMIT_SYNC_KEY, String(Date.now()));
    } catch {
        /* ignore quota / private mode */
    }
}

export function clearHapppyAgentDailyLimitSync() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(HAPPPY_AGENT_DAILY_LIMIT_SYNC_KEY);
    } catch {
        /* ignore */
    }
}
