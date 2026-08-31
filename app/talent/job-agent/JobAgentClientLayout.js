'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import JobAgentDashboardLayout from '@/talent/pages/app/job-agent/JobAgentDashboardLayout';

export default function JobAgentClientLayout({ children }) {
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

    return <JobAgentDashboardLayout>{children}</JobAgentDashboardLayout>;
}
