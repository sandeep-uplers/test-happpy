'use client';

import { v4 as uuidv4 } from "uuid";
import { API_OUTREACH_TRACK_JOURNEY, API_URL } from "../../components/Constant";
import { POST_API, getClientDeviceMobileOrDesktop } from "../../components/Helper";

const API_MIXPANEL_TRACKING = API_URL + "talent/mixpanel-tracking";

function ensureMixpanelSessionId() {
    if (typeof localStorage === "undefined") {
        return null;
    }
    let sessionId = localStorage.getItem("mixpanel_session_id");
    if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem("mixpanel_session_id", sessionId);
    }
    return sessionId;
}

/**
 * Sends a Happy Agent / Happy Job Agent analytics event to `talent/mixpanel-tracking`.
 * Works for authenticated and anonymous (public landing) visitors.
 * The server accepts legacy mapped keys and any allowlisted `happy_agent_*` event name (snake_case).
 *
 * @param {string} eventName — Mixpanel event id (e.g. `happy_agent_page_loaded`)
 * @param {Record<string, unknown>} [reqObj] — extra properties merged into `data`
 * @returns {Promise<{ status: number, data: object } | { status: number, data: { message: string } }>}
 */
export function trackHappyAgentMixpanel(eventName, reqObj = {}) {
    if (!eventName || typeof eventName !== "string") {
        return Promise.resolve({ status: 200, data: { message: "No event name" } });
    }
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const sessionId = ensureMixpanelSessionId();
    const payload = {
        event: eventName,
        data: {
            screen_width: typeof window !== "undefined" ? window.innerWidth : null,
            build_version: process.env.NEXT_PUBLIC_BUILD_VERSION,
            distinct_id: sessionId,
            is_authenticated: !!token,
            ...(reqObj && typeof reqObj === "object" ? reqObj : {}),
        },
    };
    return POST_API(API_MIXPANEL_TRACKING, payload);
}

/**
 * Records a step in the talent outreach journey (`POST /talent/outreach/track-journey`).
 * Fire-and-forget; skips when unauthenticated.
 *
 * @param {string} key — journey key (see OUTREACH_JOURNEY_KEY_* constants)
 * @param {Record<string, unknown>} [extraData] — optional extra fields merged into `data`
 */
/**
 * Public Happpy Agent auth completed (email instant login or OTP verify).
 * Fires before navigate to `/talent/referral-ai-agent`.
 */
export function trackHappyAgentPublicAuthCompleted({ newAccount, authPath } = {}) {
    const payload = {};
    if (typeof newAccount === "boolean") {
        payload.new_account = newAccount;
    }
    if (authPath) {
        payload.auth_path = authPath;
    }
    return trackHappyAgentMixpanel("happy_agent_public_auth_completed", payload);
}

export function trackOutreachJourney(key, extraData = {}) {
    if (!key || typeof key !== "string") {
        return Promise.resolve({ status: 200, data: { message: "No journey key" } });
    }
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
        return Promise.resolve({ status: 200, data: { message: "Tracking skipped (not authenticated)" } });
    }
    const payload = {
        key,
        data: {
            screensize: getClientDeviceMobileOrDesktop(),
            ...(extraData && typeof extraData === "object" ? extraData : {}),
        },
    };
    return POST_API(API_OUTREACH_TRACK_JOURNEY, payload);
}
