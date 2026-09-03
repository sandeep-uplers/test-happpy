import { exchangeGoogleAuthCodeForIdToken } from '@/lib/googleAuthCodeExchange';

const UTS_API_BASE_URL =
    process.env.UTS_API_BASE_URL?.replace(/\/$/, '') ?? 'http://127.0.0.1:8001';

const FORWARD_REQUEST_HEADERS = [
    'authorization',
    'content-type',
    'accept',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'ref_url',
    'tpt',
    'l',
];

function pickForwardHeaders(request) {
    const headers = { 'content-type': 'application/json', accept: 'application/json' };

    for (const name of FORWARD_REQUEST_HEADERS) {
        const value = request.headers.get(name);
        if (value) {
            headers[name] = value;
        }
    }

    return headers;
}

/**
 * Happpy standalone: GIS popup auth codes must be exchanged with redirect_uri
 * "postmessage". UTS SocialCallback (regular) expects a UTS-origin redirect URI,
 * so we exchange here and forward the ID token via the existing onetap path.
 */
export async function POST(request) {
    let body;

    try {
        body = await request.json();
    } catch {
        return Response.json(
            { status: 'failed', message: 'Invalid request body.' },
            { status: 400 },
        );
    }

    const { provider, code, type } = body ?? {};

    if (provider !== 'google' || type !== 'regular' || !code) {
        return Response.json(
            { status: 'failed', message: 'Unsupported Google signup payload.' },
            { status: 422 },
        );
    }

    try {
        const idToken = await exchangeGoogleAuthCodeForIdToken(code);
        const upstreamUrl = `${UTS_API_BASE_URL}/api/new-signup/google-callback`;
        const upstreamResponse = await fetch(upstreamUrl, {
            method: 'POST',
            headers: pickForwardHeaders(request),
            body: JSON.stringify({
                provider: 'google',
                code: idToken,
                type: 'onetap',
            }),
            cache: 'no-store',
        });

        const responseBody = await upstreamResponse.arrayBuffer();
        const responseHeaders = new Headers();
        const contentType = upstreamResponse.headers.get('content-type');

        if (contentType) {
            responseHeaders.set('content-type', contentType);
        }

        return new Response(responseBody, {
            status: upstreamResponse.status,
            statusText: upstreamResponse.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        return Response.json(
            {
                status: 'failed',
                message:
                    error instanceof Error && error.message
                        ? error.message
                        : 'Google sign-in failed.',
            },
            { status: 502 },
        );
    }
}
