/**
 * First-run flag for the Auto Reply configure tab.
 * Shared by JobAgentDashboardLayout (Configure "New" badge) and
 * HapppyConfigure (Auto Reply tab popover).
 */

export const AUTO_REPLY_TAB_SEEN_STORAGE_KEY = 'hc_auto_reply_tab_seen';
export const AUTO_REPLY_TAB_SEEN_EVENT = 'hc-auto-reply-tab-seen';

export function readAutoReplyTabSeen() {
    if (typeof window === 'undefined') return true;
    try {
        return window.localStorage.getItem(AUTO_REPLY_TAB_SEEN_STORAGE_KEY) === '1';
    } catch {
        return true;
    }
}

export function markAutoReplyTabSeen() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(AUTO_REPLY_TAB_SEEN_STORAGE_KEY, '1');
    } catch {
        /* localStorage may be unavailable — ignore. */
    }
    window.dispatchEvent(new CustomEvent(AUTO_REPLY_TAB_SEEN_EVENT));
}
