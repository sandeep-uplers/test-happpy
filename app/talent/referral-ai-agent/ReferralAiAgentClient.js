'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import HappyJobAgent from '@/talent/pages/app/linkedin/HappyJobAgent';

export default function ReferralAiAgentClient() {
    const router = useRouter();
    const { isAuthenticated, isAuthReady } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthReady && !isAuthenticated) {
            router.replace('/');
        }
    }, [isAuthReady, isAuthenticated, router]);

    if (!isAuthReady || !isAuthenticated) {
        return null;
    }

    return <HappyJobAgent />;
}
