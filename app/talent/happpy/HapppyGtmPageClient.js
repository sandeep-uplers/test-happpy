'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import HapppyGtmPublic from '@/talent/pages/access-public/happpy-gtm/HapppyGtmPublic';

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

export default function HapppyGtmPageClient() {
    if (!googleClientId) {
        return (
            <div style={{ padding: '2rem', fontFamily: 'Rubik, sans-serif', textAlign: 'center' }}>
                <h1>Configuration required</h1>
                <p>
                    Set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your environment (same value as UTS{' '}
                    <code>MIX_ATS_GOOGLE_CLIENT_ID</code>) to enable Google sign-in on this page.
                </p>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <HapppyGtmPublic />
        </GoogleOAuthProvider>
    );
}
