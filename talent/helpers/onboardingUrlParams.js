'use client';

/**
 * Happy Agent onboarding URL flags — milestone / entry only (one param at a time).
 * While a step is in progress the URL keeps the previous milestone until the user completes the step.
 */
export const ONBOARDING_URL_PARAM = {
    /** Agent onboarding drawer opened (always set on open). */
    CONNECT_ACCOUNTS: 'connect-your-accounts',
    /** Deep-link handoff only — opens drawer; URL is then normalized to connect-your-accounts on open. */
    CREATE_PROFILE: 'create-profile',
    ACCOUNT_LINKED: 'account-linked',
    TRIAL_STARTED: 'trial-started',
    PROFILE_CREATED: 'profile-created',
    EXTENSION_AWARE: 'extension-aware',
    /** Template drawer (Step2TemplateSelection) opened on job-agent. */
    CREATE_TEMPLATES: 'create-templates',
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

/**
 * Builds a path + query for navigation (e.g. recommended jobs with `setupcomplete=true`).
 * Replaces any existing onboarding param so only one flag is present.
 */
export function pathWithOnboardingParam(pathname, paramName, value = 'true') {
    const base = pathname || '/';
    if (typeof window === 'undefined') {
        const join = base.includes('?') ? '&' : '?';
        return `${base}${join}${paramName}=${encodeURIComponent(value)}`;
    }
    const url = new URL(base, window.location.origin);
    Object.values(ONBOARDING_URL_PARAM).forEach((key) => {
        url.searchParams.delete(key);
    });
    if (paramName) {
        url.searchParams.set(paramName, value);
    }
    return `${url.pathname}${url.search}`;
}
