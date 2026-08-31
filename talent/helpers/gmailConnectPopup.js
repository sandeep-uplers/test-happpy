'use client';

/** localStorage key — storage events reach the opener even when window.opener is null. */
export const GMAIL_CONNECT_STORAGE_KEY = 'happpy_gmail_connect_event';

const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/** Browser origin for Happpy — matches the tab the user opened (localhost vs 127.0.0.1). */
export function getHapppyFrontendOrigin() {
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin.replace(/\/$/, '');
    }
    return (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
}

/** True when both origins are the same host, or local-dev aliases (localhost ↔ 127.0.0.1). */
export function isSameHapppyFrontendOrigin(a, b) {
    if (!a || !b) return false;
    const left = a.replace(/\/$/, '');
    const right = b.replace(/\/$/, '');
    if (left === right) return true;

    try {
        const urlA = new URL(left);
        const urlB = new URL(right);
        if (urlA.protocol !== urlB.protocol) return false;
        if ((urlA.port || '') !== (urlB.port || '')) return false;
        return (
            LOCAL_DEV_HOSTS.has(urlA.hostname) &&
            LOCAL_DEV_HOSTS.has(urlB.hostname)
        );
    } catch {
        return false;
    }
}

/** Origins to try for postMessage when local dev hostnames differ. */
function getPostMessageTargetOrigins() {
    const origin = getHapppyFrontendOrigin();
    if (!origin) return ['*'];

    try {
        const url = new URL(origin);
        if (!LOCAL_DEV_HOSTS.has(url.hostname)) {
            return [origin];
        }
        const port = url.port ? `:${url.port}` : '';
        return [...LOCAL_DEV_HOSTS].map(
            (host) => `${url.protocol}//${host}${port}`,
        );
    } catch {
        return [origin];
    }
}

/** Gmail OAuth entry URL — ?happpy=1 tells UTS to redirect back to the Happpy frontend. */
export function buildGmailOAuthUrl(encId) {
    const base = getHapppyFrontendOrigin();
    const params = new URLSearchParams({ happpy: '1' });
    params.set('frontend_origin', base);
    return `${base}/auth/login/gmail/${encId}?${params.toString()}`;
}

/**
 * Notify the opener that Gmail OAuth finished. postMessage alone fails when the
 * popup crossed UTS (127.0.0.1:8001) during Google OAuth and opener was cleared.
 */
export function notifyGmailConnectResult(payload) {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(
            GMAIL_CONNECT_STORAGE_KEY,
            JSON.stringify({ ...payload, ts: Date.now() }),
        );
    } catch {
        /* private mode / quota */
    }

    if (window.opener && !window.opener.closed) {
        for (const targetOrigin of getPostMessageTargetOrigins()) {
            try {
                window.opener.postMessage(payload, targetOrigin);
            } catch {
                /* wrong target origin — try next alias */
            }
        }
    }
}

/** True when the popup is on the Happpy gmail-connect callback (verify in flight or done). */
export function isGmailConnectCallbackUrl(url) {
    return (
        typeof url === 'string' &&
        url.includes('/talent/gmail-connect/') &&
        !url.includes('/talent/gmail-connect/not-connected') &&
        !url.includes('error=')
    );
}

/**
 * Listen for Gmail connect results from the OAuth popup (postMessage + storage).
 * Returns a teardown function.
 */
export function listenForGmailConnectResult(onSuccess, onError) {
    if (typeof window === 'undefined') return () => {};

    const onMessage = (event) => {
        if (!isSameHapppyFrontendOrigin(event.origin, window.location.origin)) {
            return;
        }
        if (event.data?.type === 'GMAIL_CONNECT_SUCCESS') {
            onSuccess();
        } else if (event.data?.type === 'GMAIL_CONNECT_ERROR') {
            onError(event.data.message);
        }
    };

    const onStorage = (event) => {
        if (event.key !== GMAIL_CONNECT_STORAGE_KEY || !event.newValue) return;
        try {
            const data = JSON.parse(event.newValue);
            if (data.type === 'GMAIL_CONNECT_SUCCESS') {
                onSuccess();
            } else if (data.type === 'GMAIL_CONNECT_ERROR') {
                onError(data.message);
            }
        } catch {
            /* ignore malformed payload */
        }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);

    return () => {
        window.removeEventListener('message', onMessage);
        window.removeEventListener('storage', onStorage);
    };
}
