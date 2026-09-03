const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

/**
 * Exchange a GIS auth-code (popup flow) for tokens.
 * Popup UX uses redirect_uri "postmessage" — not the Happpy or UTS site URL.
 */
export async function exchangeGoogleAuthCodeForIdToken(code) {
    const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '')
        .replace(/^['"]|['"]$/g, '')
        .trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth is not configured on the Happpy server.');
    }

    const body = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const detail =
            typeof payload.error_description === 'string'
                ? payload.error_description
                : typeof payload.error === 'string'
                  ? payload.error
                  : 'Google token exchange failed';
        throw new Error(detail);
    }

    if (!payload.id_token) {
        throw new Error('Google did not return an ID token.');
    }

    return payload.id_token;
}
