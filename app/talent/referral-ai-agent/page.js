import { Suspense } from 'react';
import ReferralAiAgentClient from './ReferralAiAgentClient';

export default function ReferralAiAgentPage() {
    return (
        <Suspense fallback={null}>
            <ReferralAiAgentClient />
        </Suspense>
    );
}
