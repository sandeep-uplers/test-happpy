'use client';

import { useEffect } from 'react';

export const HAPPY_AI_AGENT_PATH_PREFIX = '/talent/happy-ai-agent';

export const REFERRAL_AI_AGENT_PATH = '/talent/referral-ai-agent';

/** GTM concise landing — exact `/talent/happpy` or `/talent/happpy/…` (not happpy-ai-agent). */
export const HAPPPY_GTM_LANDING_PATH = '/talent/happpy';

export function isHapppyGtmLandingPath(pathname) {
    return pathname === HAPPPY_GTM_LANDING_PATH || pathname.startsWith(`${HAPPPY_GTM_LANDING_PATH}/`);
}

/** True for `/talent/happy-ai-agent` and nested paths (not other routes that merely contain the string). */
export function isHappyAiAgentPublicPath(pathname) {
    return pathname === HAPPY_AI_AGENT_PATH_PREFIX || pathname.startsWith(`${HAPPY_AI_AGENT_PATH_PREFIX}/`);
}

/**
 * The public landing. In the ATS this lived at /talent/happpy-ai-agent; in this
 * standalone app it is the site root, so anything that navigates "back to the
 * public page" (logout, most notably) lands on "/".
 */
export const HAPPPY_AI_AGENT_PATH = '/';
const HAPPPY_AI_AGENT_PATH_PREFIX = HAPPPY_AI_AGENT_PATH;

/** True on any route wrapped by `HappyAiAgentLayout` (public + authenticated agent pages). */
export function isHappyAiAgentLayoutPath(pathname) {
    return (
        isHappyAiAgentPublicPath(pathname) ||
        pathname === HAPPPY_AI_AGENT_PATH_PREFIX ||
        pathname.startsWith(`${HAPPPY_AI_AGENT_PATH_PREFIX}/`) ||
        pathname === REFERRAL_AI_AGENT_PATH ||
        pathname.startsWith(`${REFERRAL_AI_AGENT_PATH}/`) ||
        isHapppyGtmLandingPath(pathname)
    );
}

/**
 * Paths where default platform Hotjar (6525988) is not injected in App.js.
 * Dedicated Happpy Agent Hotjar (6702760) is injected when HappyAiAgentLayout mounts.
 */
export function skipsPlatformHotjar(pathname) {
    return (
        isHappyAiAgentPublicPath(pathname) ||
        pathname === REFERRAL_AI_AGENT_PATH ||
        pathname.startsWith(`${REFERRAL_AI_AGENT_PATH}/`) ||
        isHapppyGtmLandingPath(pathname)
    );
}

/** Hotjar site for Happpy Agent routes wrapped by this layout */
const HOTJAR_SITE_ID = 6702760;

export default function HappyAiAgentLayout({ children }) {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_APP_ENV !== 'production') return;
        if (document.getElementById('happy-ai-agent-hotjar')) return;

        const script = document.createElement('script');
        script.id = 'happy-ai-agent-hotjar';
        script.async = true;
        script.type = 'text/javascript';
        script.innerHTML = `
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:${HOTJAR_SITE_ID},hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `;
        document.head.appendChild(script);
    }, []);

    return children ?? null;
}
