'use client';

import {
    SESSION_KEY_LANDING_JOBS_BOARD_FILTER_RESET_HR,
    SESSION_KEY_LANDING_PENDING_ACTIVE_JOB_HR,
} from '../components/Constant';

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
/** Auth method from public landing (`otp`, `instant`, `google`) — drives onboarding step order. */
export const SESSION_KEY_PUBLIC_AUTH_PATH = 'happy_agent_public_auth_path';

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

export function setPublicAuthPath(authPath) {
    if (!authPath || typeof authPath !== 'string') return;
    const trimmed = authPath.trim();
    if (!trimmed) return;
    try {
        sessionStorage.setItem(SESSION_KEY_PUBLIC_AUTH_PATH, trimmed);
    } catch {
        /* ignore */
    }
}

export function getPublicAuthPath() {
    try {
        return sessionStorage.getItem(SESSION_KEY_PUBLIC_AUTH_PATH) || null;
    } catch {
        return null;
    }
}

export function clearPublicAuthPath() {
    try {
        sessionStorage.removeItem(SESSION_KEY_PUBLIC_AUTH_PATH);
    } catch {
        /* ignore */
    }
}

/** True when public signup used email OTP or instant login (accounts step first). */
export function isPublicEmailAuthPath(authPath) {
    return authPath === 'otp' || authPath === 'instant';
}

/** Clears pending flag, referral code, auth path, and any stored onboarding section. */
export function clearPublicSignupHandoff() {
    clearPublicSignupPending();
    clearPublicReferralCode();
    clearPublicOnbSection();
    clearPublicAuthPath();
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

export function setLandingPendingActiveJobHr(hrNumber) {
    const trimmed = hrNumber != null ? String(hrNumber).trim() : '';
    if (!trimmed) return;
    try {
        sessionStorage.setItem(SESSION_KEY_LANDING_PENDING_ACTIVE_JOB_HR, trimmed);
    } catch {
        /* ignore */
    }
}

export function getLandingPendingActiveJobHr() {
    try {
        return sessionStorage.getItem(SESSION_KEY_LANDING_PENDING_ACTIVE_JOB_HR) || null;
    } catch {
        return null;
    }
}

export function clearLandingPendingActiveJobHr() {
    try {
        sessionStorage.removeItem(SESSION_KEY_LANDING_PENDING_ACTIVE_JOB_HR);
    } catch {
        /* ignore */
    }
}

export function setLandingJobsBoardFilterResetForHr(hrNumber) {
    const trimmed = hrNumber != null ? String(hrNumber).trim() : '';
    if (!trimmed) return;
    try {
        sessionStorage.setItem(SESSION_KEY_LANDING_JOBS_BOARD_FILTER_RESET_HR, trimmed);
    } catch {
        /* ignore */
    }
}

export function getLandingJobsBoardFilterResetHr() {
    try {
        return sessionStorage.getItem(SESSION_KEY_LANDING_JOBS_BOARD_FILTER_RESET_HR) || null;
    } catch {
        return null;
    }
}

export function clearLandingJobsBoardFilterResetHr() {
    try {
        sessionStorage.removeItem(SESSION_KEY_LANDING_JOBS_BOARD_FILTER_RESET_HR);
    } catch {
        /* ignore */
    }
}

/** True when recommended-jobs should drop filters for a HappyJobAgent JobsBoard handoff. */
export function isLandingJobsBoardFilterResetHandoff(urlActiveJobHr) {
    const handoffHr = getLandingJobsBoardFilterResetHr();
    if (!handoffHr || urlActiveJobHr == null || String(urlActiveJobHr).trim() === '') {
        return false;
    }
    return String(handoffHr) === String(urlActiveJobHr).trim();
}
