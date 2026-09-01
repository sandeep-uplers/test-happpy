'use client';

import { useEffect, useState } from 'react';

const COMPACT_MEDIA_QUERY = '(max-width: 1023px)';

function readCompactLayout() {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
    }
    return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
}

/** Mobile + tablet layout for Happpy All Jobs (split pane only at ≥1024px). */
export default function useHapppyCompactJobsLayout() {
    const [isCompact, setIsCompact] = useState(readCompactLayout);

    useEffect(() => {
        const mq = window.matchMedia(COMPACT_MEDIA_QUERY);
        const onChange = (event) => setIsCompact(event.matches);
        setIsCompact(mq.matches);
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', onChange);
            return () => mq.removeEventListener('change', onChange);
        }
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, []);

    return isCompact;
}
