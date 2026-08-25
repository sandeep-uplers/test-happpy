import { proxyToUts } from '@/lib/utsProxy';

async function handle(request, context) {
    const { path } = await context.params;
    return proxyToUts(request, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
