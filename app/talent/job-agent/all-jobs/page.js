'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JobAgentAllJobsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/talent/job-agent/recommended-jobs?tab=all-jobs');
    }, [router]);

    return null;
}
