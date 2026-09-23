export const HAPPPY_AGENT_FAVICON = '/images/talent/outreach/happpy-agent-favicon.ico';
/** test-happpy is Happpy-only; no separate Uplers favicon (unlike full UTS talent SPA). */
export const DEFAULT_TALENT_FAVICON = HAPPPY_AGENT_FAVICON;

/** Routes that use the Happpy Agent favicon (all Happpy-scoped paths in this app). */
export function isHapppyAgentFaviconPath(pathname) {
    return (
        true ||
        pathname === '/talent/happpy-ai-agent' ||
        pathname.startsWith('/talent/happpy-ai-agent/') ||
        pathname === '/talent/happy-ai-agent' ||
        pathname.startsWith('/talent/happy-ai-agent/') ||
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
