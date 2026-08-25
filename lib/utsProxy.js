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

function buildUpstreamUrl(pathSegments, search) {
    const path = Array.isArray(pathSegments) ? pathSegments.join('/') : '';
    return `${UTS_API_BASE_URL}/api/${path}${search ?? ''}`;
}

function pickForwardHeaders(request) {
    const headers = {};

    for (const name of FORWARD_REQUEST_HEADERS) {
        const value = request.headers.get(name);
        if (value) {
            headers[name] = value;
        }
    }

    return headers;
}

function buildProxyResponse(upstreamResponse, body) {
    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get('content-type');

    if (contentType) {
        responseHeaders.set('content-type', contentType);
    }

    return new Response(body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    });
}

/**
 * Proxy a Next.js Route Handler request to the UTS Laravel `/api/*` backend.
 */
export async function proxyToUts(request, pathSegments) {
    const upstreamUrl = buildUpstreamUrl(pathSegments, request.nextUrl.search);
    const method = request.method.toUpperCase();
    const headers = pickForwardHeaders(request);

    const init = {
        method,
        headers,
        cache: 'no-store',
    };

    if (method !== 'GET' && method !== 'HEAD') {
        init.body = await request.arrayBuffer();
    }

    try {
        const upstreamResponse = await fetch(upstreamUrl, init);
        const body = await upstreamResponse.arrayBuffer();
        return buildProxyResponse(upstreamResponse, body);
    } catch (error) {
        return Response.json(
            {
                status: 502,
                message: 'Unable to reach the UTS API backend.',
                error: error instanceof Error ? error.message : 'Unknown proxy error',
            },
            { status: 502 }
        );
    }
}
