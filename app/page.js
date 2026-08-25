import { Suspense } from 'react';
import HappyJobAgentPublic from '@/talent/pages/access-public/HappyJobAgentPublic';

export default function HomePage() {
    return (
        <Suspense fallback={null}>
            <HappyJobAgentPublic />
        </Suspense>
    );
}
