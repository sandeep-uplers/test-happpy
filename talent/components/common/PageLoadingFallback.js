'use client';

import HapppyBatLoader from './HapppyBatLoader';

/** Full-screen route/chunk loader — test-happpy is Happpy-only, always use the bat. */
const PageLoadingFallback = () => <HapppyBatLoader />;

export default PageLoadingFallback;
