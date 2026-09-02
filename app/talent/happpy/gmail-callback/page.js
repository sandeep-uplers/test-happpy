import { Suspense } from 'react';
import HapppyGtmGmailCallback from '@/talent/pages/access-public/happpy-gtm/HapppyGtmGmailCallback';

export default function HapppyGtmGmailCallbackPage() {
    return (
        <Suspense fallback={null}>
            <HapppyGtmGmailCallback />
        </Suspense>
    );
}
