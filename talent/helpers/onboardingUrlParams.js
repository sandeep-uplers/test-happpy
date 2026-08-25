'use client';

/** Query-param keys emitted during the Happy Agent onboarding funnel. */
export const ONBOARDING_URL_PARAM = {
    CONNECT_ACCOUNTS: 'connect-your-accounts',
    ACCOUNT_LINKED: 'account-linked',
    PROFILE_CREATED: 'profile-created',
    EXTENSION_AWARE: 'extension-aware',
    OUTREACH_MODE_SELECTED: 'outreach-mode-selected',
    SETUP_COMPLETE: 'setupcomplete',
};

/** Logged-in landing handoff after public signup — opens AgentOnboarding on load. */
export const REFERRAL_AI_AGENT_ONBOARDING_PATH =
    `/talent/referral-ai-agent?${ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS}=true`;

/**
 * Sets a Happy Agent onboarding activity flag on the current page URL without
 * navigating or adding a history entry. Replaces any previous onboarding param
 * so only one onboarding flag is present at a time.
 *
 * @param {string} paramName — e.g. `connect-your-accounts`
 * @param {string} [value='true']
 */
export function setOnboardingActivityUrlParam(paramName, value = 'true') {
    if (typeof window === 'undefined' || !paramName) return;
    const url = new URL(window.location.href);
    Object.values(ONBOARDING_URL_PARAM).forEach((key) => {
        url.searchParams.delete(key);
    });
    url.searchParams.set(paramName, value);
    window.history.replaceState(window.history.state, '', url.toString());
}
