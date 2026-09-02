import { Suspense } from 'react';
import HapppyGtmPageClient from './HapppyGtmPageClient';

export default function HapppyGtmPage() {
    return (
        <Suspense fallback={null}>
            <HapppyGtmPageClient />
        </Suspense>
    );
}
