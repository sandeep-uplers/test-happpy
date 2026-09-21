#!/usr/bin/env node
/**
 * Integration smoke tests for Happpy routes and synced static assets.
 * Run against a live dev/prod server: npm run test:smoke
 */
const BASE = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3000';

const ROUTES = [
    '/',
    '/talent/happpy',
    '/talent/referral-ai-agent',
    '/talent/job-agent',
    '/talent/job-agent/recommended-jobs',
    '/talent/job-agent/all-jobs',
    '/talent/job-agent/configure',
    '/talent/job-agent/my-activity',
    '/talent/job-agent/subscription',
    '/talent/job-agent/tailor-resume',
    '/talent/job-agent/update-profile',
];

/** Landing-page assets from happyAgentPageAssets.js — extend when new sections ship. */
const ASSETS = [
    '/happpy-agent/how-it-works-pc.mp4',
    '/happpy-agent/how-it-works-mobile-final.mp4',
    '/images/talent/happpy-agent/wellfound-logo-black.png',
    '/images/talent/happpy-agent/lever-logo.png',
    '/images/talent/outreach/happpy-bat-fly.svg',
    '/images/talent/arrow-right.svg',
    '/images/talent/happpy-agent/topnav-run-agent-external-link.svg',
    '/images/talent/outreach/manual-vs/compare-arrow.svg',
    '/images/talent/outreach/privacy/shield.svg',
];

const ERROR_PATTERNS = [
    /Application error/i,
    /Internal Server Error/i,
    /Module not found/i,
    /Unhandled Runtime Error/i,
];

async function check(path, expectHtml = true) {
    const url = `${BASE}${path}`;
    const res = await fetch(url, { redirect: 'follow' });
    const body = expectHtml ? await res.text() : '';
    const ok = res.status === 200 && (!expectHtml || !ERROR_PATTERNS.some((re) => re.test(body)));
    return { path, status: res.status, ok, url };
}

let failed = 0;

console.log(`Smoke testing ${BASE}\n`);

for (const route of ROUTES) {
    const result = await check(route);
    const mark = result.ok ? 'PASS' : 'FAIL';
    if (!result.ok) failed += 1;
    console.log(`${mark} [${result.status}] ${route}`);
}

console.log('');

for (const asset of ASSETS) {
    const result = await check(asset, false);
    const mark = result.ok ? 'PASS' : 'FAIL';
    if (!result.ok) failed += 1;
    console.log(`${mark} [${result.status}] ${asset}`);
}

console.log(`\n${failed === 0 ? 'All checks passed.' : `${failed} check(s) failed.`}`);
process.exit(failed === 0 ? 0 : 1);
