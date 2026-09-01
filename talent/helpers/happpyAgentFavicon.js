export const HAPPPY_AGENT_FAVICON = '/images/talent/outreach/happpy-agent-favicon.ico';
export const DEFAULT_TALENT_FAVICON = '/favicon.ico';

/** Routes that should show the Happpy Agent favicon instead of the default Uplers one. */
export function isHapppyAgentFaviconPath(pathname) {
    return (
        pathname === '/talent/happpy-ai-agent' ||
        pathname.startsWith('/talent/happpy-ai-agent/') ||
        pathname === '/talent/happpy' ||
        pathname.startsWith('/talent/happpy/') ||
        pathname === '/talent/referral-ai-agent' ||
        pathname.startsWith('/talent/referral-ai-agent/') ||
        pathname === '/talent/job-agent' ||
        pathname.startsWith('/talent/job-agent/')
    );
}

export function syncTalentFavicon(pathname) {
    const href = isHapppyAgentFaviconPath(pathname) ? HAPPPY_AGENT_FAVICON : DEFAULT_TALENT_FAVICON;
    let link = document.querySelector("link[rel~='icon']");

    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }

    if (link.getAttribute('href') !== href) {
        link.setAttribute('href', href);
        link.type = 'image/x-icon';
    }
}
