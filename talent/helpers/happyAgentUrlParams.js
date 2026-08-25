'use client';

import { HAPPPY_AI_AGENT_PATH, REFERRAL_AI_AGENT_PATH } from '../components/HappyAiAgentLayout';

/** Query keys preserved when logging out from `/talent/referral-ai-agent`. */
export const HAPPY_AGENT_PRESERVED_PARAM_KEYS = ['r', 'reference', 'src', 'entry_source'];

const TALENT_LOGIN_PATH = '/login';

function toUrlSearchParams(source) {
    if (!source) return new URLSearchParams();
    if (source instanceof URLSearchParams) return new URLSearchParams(source);
    const raw = typeof source === 'string' ? source : '';
    const trimmed = raw.startsWith('?') ? raw.slice(1) : raw;
    return new URLSearchParams(trimmed);
}

function hasValue(value) {
    return value != null && String(value).trim() !== '';
}

export function isReferralAiAgentPath(pathname) {
    return (
        pathname === REFERRAL_AI_AGENT_PATH ||
        pathname.startsWith(`${REFERRAL_AI_AGENT_PATH}/`)
    );
}

function pickHappyAgentUrlParams(search) {
    const input = toUrlSearchParams(search);
    const picked = new URLSearchParams();
    for (const key of HAPPY_AGENT_PRESERVED_PARAM_KEYS) {
        const value = input.get(key);
        if (hasValue(value)) {
            picked.set(key, value);
        }
    }
    return picked;
}

/** Public landing path with preserved query params from the referral-ai-agent page. */
export function buildReferralAgentLogoutPath(search) {
    const qs = pickHappyAgentUrlParams(search).toString();
    return qs ? `${HAPPPY_AI_AGENT_PATH}?${qs}` : HAPPPY_AI_AGENT_PATH;
}

/** Post-logout destination: public agent landing (with params) or login. */
export function getTalentLogoutDestination({ pathname, search }) {
    if (isReferralAiAgentPath(pathname)) {
        return buildReferralAgentLogoutPath(search);
    }
    return TALENT_LOGIN_PATH;
}
