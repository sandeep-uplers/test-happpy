'use client';

import dynamic from 'next/dynamic';

const HapppySingleJobPage = dynamic(
    () => import('@/talent/pages/app/happpy-agent/HapppySingleJobPage'),
    { ssr: false },
);

export default function JobAgentSingleJobPage() {
    return <HapppySingleJobPage />;
}
