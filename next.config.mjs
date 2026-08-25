/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'd1h53oncnz25tl.cloudfront.net',
            },
        ],
    },
    async rewrites() {
        const utsWeb = process.env.UTS_WEB_BASE_URL ?? 'http://127.0.0.1:8001';
        return [
            {
                source: '/auth/:path*',
                destination: `${utsWeb}/auth/:path*`,
            },
        ];
    },
};

export default nextConfig;
