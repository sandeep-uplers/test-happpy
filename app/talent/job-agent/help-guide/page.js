'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** UTS legacy path → /talent/job-agent/need-help */
export default function JobAgentHelpGuideRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/talent/job-agent/need-help');
    }, [router]);

    return null;
}
