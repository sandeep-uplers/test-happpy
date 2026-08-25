'use client';

export { useInView } from 'react-intersection-observer';

/**
 * The ATS version picked between `react-intersection-observer` and a lazily
 * loaded polyfill at module scope, based on `typeof IntersectionObserver`.
 * That cannot survive server rendering: the server bundle resolves to the
 * polyfill wrapper (four hooks) while the browser bundle resolves to the bare
 * library (one hook), so the two renders disagree on hook order and hydration
 * fails.
 *
 * IntersectionObserver has been Baseline since 2019 and Next.js 16 only
 * supports browsers well above that, so the polyfill branch was already dead in
 * practice — every real browser ran this exact code path.
 */
