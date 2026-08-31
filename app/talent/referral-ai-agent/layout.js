/*
 * UTS talent platform styles — same load order as resources/views/talent/index.blade.php.
 * Served from public/ so relative asset URLs in style.css resolve like the Laravel app.
 */
export default function ReferralAiAgentLayout({ children }) {
    return (
        <>
            <link href="/css/talent/global.css" rel="stylesheet" />
            <link href="/css/talent/style.css" rel="stylesheet" />
            <link href="/css/talent/custom.css" rel="stylesheet" />
            {children}
        </>
    );
}
