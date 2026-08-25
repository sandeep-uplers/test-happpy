'use client';

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
