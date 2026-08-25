'use client';

import {
    HAPPPY_AGENT_DAILY_LIMIT_SET,
    HAPPPY_AGENT_DAILY_USED_INCREMENT,
    HAPPPY_AGENT_FAILED,
    HAPPPY_AGENT_RESET,
    HAPPPY_AGENT_SET,
    HAPPPY_AGENT_SET_LOADING,
} from '../actions/actionsTypes';

/**
 * Single source of truth for the Happpy Agent plan / outreach-step data.
 *
 * Powers the AgentJ sidebar pill ("Upgrade Plan" / "My Plan" / "Renew Plan"),
 * topnav badge, mobile dashboard plan card, and the JobAgentSubscription
 * current-plan section. Hydrated from API_GET_OUTREACH_STEP via the
 * fetchHapppyAgentPlan thunk; refreshed (silent + force) after a successful
 * Razorpay payment so every subscriber re-renders without a hard reload.
 * Daily run quota (`dailyUsed` / `dailyLimit`) and full dashboard stats (`dashboardData`)
 * are hydrated from get-outreach-dashboard-data; dailyUsed is incremented optimistically
 * after a successful agent run.
 */
const JOB_AGENT_OUTREACH_STEP_CACHE_KEY = 'job_agent_outreach_step_cache';
const HAPPPY_AGENT_DASHBOARD_CACHE_KEY = 'happpy_agent_dashboard_data_cache';

/** Seeds gmail/linkedin flags from localStorage so first paint after a hard
 *  reload doesn't briefly show the "Connect Gmail or LinkedIn" lock screen
 *  for users who are already connected. */
function readCachedConnections() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(JOB_AGENT_OUTREACH_STEP_CACHE_KEY);
        if (!raw) return null;
        const c = JSON.parse(raw);
        if (!c || typeof c !== 'object') return null;
        const gmail = !!c.gmail_connected;
        const linkedin = !!c.linkedin_connected;
        if (!gmail && !linkedin) return null;
        return { gmail_connected: gmail, linkedin_connected: linkedin };
    } catch {
        return null;
    }
}

/** Seeds dashboard stats from localStorage so refresh / new tab shows the last
 *  known get-outreach-dashboard-data payload until the API returns fresh values. */
function readCachedDashboardData() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(HAPPPY_AGENT_DASHBOARD_CACHE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return null;
        return data;
    } catch {
        return null;
    }
}

const cached = readCachedConnections();
const cachedDashboard = readCachedDashboardData();

const initialState = {
    /** True while we don't have any payload yet (controls full-page spinner on JobAgentSubscription). */
    loading: !cached,
    /** True while plan-specific fields are still being fetched (used by the topnav badge). */
    planLoading: true,
    /** True once the slice has been populated at least once; used by the thunk's short-circuit. */
    loaded: false,
    /** True only while an API_GET_OUTREACH_STEP request is actually in flight. Distinct from
     *  `loading` (which can be seeded true on first paint for users with no localStorage cache)
     *  so the thunk's de-dup check does NOT swallow the very first dispatch for fresh users. */
    inFlight: false,
    error: null,
    plan: null,
    plan_end_date: null,
    has_plan_expired: false,
    conversion_offer: null,
    credit_plan: 0,
    credit_left: 0,
    credit_added: 0,
    gmail_connected: cached?.gmail_connected ?? false,
    linkedin_connected: cached?.linkedin_connected ?? false,
    /** Full outreach-step payload kept around for pages that need fields beyond plan (status, step2, outreach_mode, etc.). */
    raw: null,
    /** Daily referral run quota — hydrated from get-outreach-dashboard-data; incremented on successful agent runs. */
    dailyLimitLoading: !cachedDashboard,
    dailyUsed: Number(cachedDashboard?.today_agent_runs) || 0,
    dailyLimit: Number(cachedDashboard?.max_limit) || 0,
    /** Preference completeness from get-outreach-dashboard-data — drives sidenav profile badge. */
    agentPrefFieldsSubmitted: cachedDashboard
        ? !!cachedDashboard.agent_pref_fields_submitted
        : true,
    dashboardPreferencesLoaded: !!cachedDashboard,
    /** Full get-outreach-dashboard-data payload (stats, limits, prefs, consent, etc.). */
    dashboardData: cachedDashboard,
};

export default function happpyAgentReducer(state = initialState, action) {
    switch (action.type) {
        case HAPPPY_AGENT_SET_LOADING:
            return {
                ...state,
                loading: action.payload?.loading ?? state.loading,
                planLoading: action.payload?.planLoading ?? state.planLoading,
                inFlight: action.payload?.inFlight ?? state.inFlight,
            };
        case HAPPPY_AGENT_SET:
            return {
                ...state,
                ...action.payload,
                loading: false,
                planLoading: false,
                loaded: true,
                inFlight: false,
                error: null,
            };
        case HAPPPY_AGENT_FAILED:
            return {
                ...state,
                loading: false,
                planLoading: false,
                inFlight: false,
                error: action.payload || 'failed',
            };
        case HAPPPY_AGENT_RESET:
            if (typeof window !== 'undefined') {
                try {
                    window.localStorage.removeItem(HAPPPY_AGENT_DASHBOARD_CACHE_KEY);
                } catch {
                    /* ignore */
                }
            }
            return {
                ...initialState,
                loading: false,
                planLoading: false,
                inFlight: false,
                gmail_connected: false,
                linkedin_connected: false,
                dailyLimitLoading: true,
                dailyUsed: 0,
                dailyLimit: 0,
                agentPrefFieldsSubmitted: true,
                dashboardPreferencesLoaded: false,
                dashboardData: null,
            };
        case HAPPPY_AGENT_DAILY_LIMIT_SET:
            return {
                ...state,
                dailyLimitLoading:
                    action.payload?.dailyLimitLoading !== undefined
                        ? action.payload.dailyLimitLoading
                        : state.dailyLimitLoading,
                dailyUsed:
                    action.payload?.dailyUsed !== undefined
                        ? Number(action.payload.dailyUsed) || 0
                        : state.dailyUsed,
                dailyLimit:
                    action.payload?.dailyLimit !== undefined
                        ? Number(action.payload.dailyLimit) || 0
                        : state.dailyLimit,
                agentPrefFieldsSubmitted:
                    action.payload?.agentPrefFieldsSubmitted !== undefined
                        ? action.payload.agentPrefFieldsSubmitted
                        : state.agentPrefFieldsSubmitted,
                dashboardPreferencesLoaded:
                    action.payload?.dashboardPreferencesLoaded !== undefined
                        ? action.payload.dashboardPreferencesLoaded
                        : state.dashboardPreferencesLoaded,
                dashboardData:
                    action.payload?.dashboardData !== undefined
                        ? action.payload.dashboardData
                        : state.dashboardData,
            };
        case HAPPPY_AGENT_DAILY_USED_INCREMENT:
            return {
                ...state,
                dailyUsed: state.dailyUsed + 1,
            };
        default:
            return state;
    }
}
