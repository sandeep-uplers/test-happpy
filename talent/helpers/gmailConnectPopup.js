'use client';

/** localStorage key — storage events reach the opener even when window.opener is null. */
export const GMAIL_CONNECT_STORAGE_KEY = 'happpy_gmail_connect_event';

/** Gmail OAuth entry URL — ?happpy=1 tells UTS to redirect back to the Happpy frontend. */
export function buildGmailOAuthUrl(encId) {
    const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, '');
    return `${base}/auth/login/gmail/${encId}?happpy=1`;
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
            JSON.stringify({ ...payload, ts: Date.now() })
        );
    } catch {
        /* private mode / quota */
    }

    if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
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
        if (event.origin !== window.location.origin) return;
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
