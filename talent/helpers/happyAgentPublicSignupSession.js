'use client';

/**
 * Ephemeral cross-route handoff for the public Happpy Agent signup flow:
 * Auth (public) → AgentOnboarding (logged-in landing) → Template drawer.
 *
 * Uses sessionStorage (same pattern as other Happy Agent session keys).
 */

export const SESSION_KEY_PUBLIC_SIGNUP_PENDING = 'happy_agent_public_signup_pending';
export const SESSION_KEY_PUBLIC_REFERRAL_CODE = 'happy_agent_public_referral_code';
/** Landing CTA section that opened auth before connect-your-accounts handoff. */
export const SESSION_KEY_PUBLIC_ONB_SECTION = 'happy_agent_public_onb_section';
/** Set when onboarding is fully completed; dashboard opens the template drawer. */
export const SESSION_KEY_ONBOARDING_TEMPLATE_PENDING = 'happy_agent_onboarding_template_pending';

export function setPublicSignupPending() {
    try {
        sessionStorage.setItem(SESSION_KEY_PUBLIC_SIGNUP_PENDING, '1');
    } catch {
        /* ignore */
    }
}

export function isPublicSignupPending() {
    try {
        return sessionStorage.getItem(SESSION_KEY_PUBLIC_SIGNUP_PENDING) === '1';
    } catch {
        return false;
    }
}

export function clearPublicSignupPending() {
    try {
        sessionStorage.removeItem(SESSION_KEY_PUBLIC_SIGNUP_PENDING);
    } catch {
        /* ignore */
    }
}

export function setPublicReferralCode(code) {
    if (!code || typeof code !== 'string') return;
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
        sessionStorage.setItem(SESSION_KEY_PUBLIC_REFERRAL_CODE, trimmed);
    } catch {
        /* ignore */
    }
}

export function getPublicReferralCode() {
    try {
        return sessionStorage.getItem(SESSION_KEY_PUBLIC_REFERRAL_CODE) || null;
    } catch {
        return null;
    }
}

export function clearPublicReferralCode() {
    try {
        sessionStorage.removeItem(SESSION_KEY_PUBLIC_REFERRAL_CODE);
    } catch {
        /* ignore */
    }
}

export function setPublicOnbSection(section) {
    if (!section || typeof section !== 'string') return;
    const trimmed = section.trim();
    if (!trimmed) return;
    try {
        sessionStorage.setItem(SESSION_KEY_PUBLIC_ONB_SECTION, trimmed);
    } catch {
        /* ignore */
    }
}

export function getPublicOnbSection() {
    try {
        return sessionStorage.getItem(SESSION_KEY_PUBLIC_ONB_SECTION) || null;
    } catch {
        return null;
    }
}

export function clearPublicOnbSection() {
    try {
        sessionStorage.removeItem(SESSION_KEY_PUBLIC_ONB_SECTION);
    } catch {
        /* ignore */
    }
}

/** Clears pending flag, referral code, and any stored onboarding section. */
export function clearPublicSignupHandoff() {
    clearPublicSignupPending();
    clearPublicReferralCode();
    clearPublicOnbSection();
}

export function setOnboardingTemplatePending() {
    try {
        sessionStorage.setItem(SESSION_KEY_ONBOARDING_TEMPLATE_PENDING, '1');
    } catch {
        /* ignore */
    }
}

export function isOnboardingTemplatePending() {
    try {
        return sessionStorage.getItem(SESSION_KEY_ONBOARDING_TEMPLATE_PENDING) === '1';
    } catch {
        return false;
    }
}

export function clearOnboardingTemplatePending() {
    try {
        sessionStorage.removeItem(SESSION_KEY_ONBOARDING_TEMPLATE_PENDING);
    } catch {
        /* ignore */
    }
}
