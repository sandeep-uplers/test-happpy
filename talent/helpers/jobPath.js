'use client';

export const JOB_AGENT_RECOMMENDED_JOBS_PATH = '/talent/job-agent/recommended-jobs';
export const JOB_AGENT_JOB_DETAIL_PATH = '/talent/job-agent/job';

/** Matches `useHapppyCompactJobsLayout` — split pane only at ≥1024px. */
const JOB_AGENT_COMPACT_MEDIA_QUERY = '(max-width: 1023px)';

export function getHrNumberFromPath(pathname = '') {
    const jobAgentMatch = pathname.match(/\/talent\/job-agent\/job\/([^/?]+)/);
    if (jobAgentMatch) {
        return decodeURIComponent(jobAgentMatch[1]).replaceAll('%20', '');
    }
    const match = pathname.match(/\/talent\/(?:all-opportunities|job)\/([^/?]+)/);
    return match ? decodeURIComponent(match[1]).replaceAll('%20', '') : null;
}

export function getSingleJobBasePath(pathname = '') {
    return pathname.includes('/talent/job/') ? '/talent/job/' : '/talent/all-opportunities/';
}

export function isSingleJobPath(pathname = '') {
    return Boolean(getHrNumberFromPath(pathname));
}

function isJobAgentCompactLayout() {
    if (typeof window === 'undefined' || !window.matchMedia) {
        return false;
    }
    return window.matchMedia(JOB_AGENT_COMPACT_MEDIA_QUERY).matches;
}

/**
 * Similar-job card href inside `/talent/job-agent`.
 * Desktop split pane → recommended-jobs?activeJob=HR_Number
 * Compact/mobile → /talent/job-agent/job/HR_Number
 */
export function getJobAgentSimilarJobHref(job) {
    const hrNumber = job?.HR_Number;
    if (!hrNumber) {
        return job?.link;
    }
    const encodedHr = encodeURIComponent(hrNumber);
    if (isJobAgentCompactLayout()) {
        return `${JOB_AGENT_JOB_DETAIL_PATH}/${encodedHr}`;
    }
    return `${JOB_AGENT_RECOMMENDED_JOBS_PATH}?activeJob=${encodedHr}`;
}
