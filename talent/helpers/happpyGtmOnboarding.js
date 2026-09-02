import Cookies from "js-cookie";
import {
    API_GET_OUTREACH_STEP,
    API_HAPPPY_GTM_ONBOARDING_STATUS,
    API_HAPPPY_PUBLIC_PAGE_VISIT,
    API_TALENT_PREFERENCES,
} from "../components/Constant";
import { buildFormData, GET_API, getDomain, POST_API } from "../components/Helper";
import { trackHappyAgentMixpanel, trackOutreachJourney } from "../store/actions/happyAgentTracking";
import { getTalentPreferences, profileUpsert } from "../store/actions/UserActions";

export const HAPPPY_GTM_PATH = "/talent/happpy";
export const HAPPPY_GTM_GMAIL_CALLBACK_PATH = "/talent/happpy/gmail-callback";
export const HAPPPY_GTM_RECOMMENDED_JOBS_PATH = "/talent/job-agent/recommended-jobs";

/** Same localStorage key as the existing extension step so install state stays in sync. */
export const HAPPPY_GTM_EXTENSION_STORAGE_KEY = "outreach_chrome_extension_downloaded";
const HAPPPY_GTM_EXTENSION_SEEN_KEY = "happpy_gtm_extension_seen";

export const getHapppyGtmGmailAuthStartUrl = () =>
    `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/login/gmail/happpy-gtm`;

export const HAPPPY_GTM_STEPS = ["prefs", "gmail", "extension"];

/** Testing only — set false before shipping. Disables skip-ahead + auto-redirect to recommended jobs. */
export const HAPPPY_GTM_DISABLE_AUTO_SKIP = true;

export const DEFAULT_PREFERRED_METHOD_VALUE = 2;

export const FALLBACK_PREFERRED_METHOD_OPTIONS = [
    { label: "Remote Only", value: 1 },
    { label: "Remote or Office", value: 2 },
];

export const formatPreferredMethodsFromApi = (preferredMethod, preferredMethodMaster, useAgentDefaults = false) => {
    const mapped = preferredMethod
        ? preferredMethod
            .map(({ preferred_method: methodValue }) =>
                preferredMethodMaster?.find((item) => item.value == methodValue)
            )
            .filter(Boolean)
        : [];

    if (!useAgentDefaults) {
        return mapped;
    }
    if (mapped.length === 0) {
        const defaultMethod = preferredMethodMaster?.find(
            (item) => item.value == DEFAULT_PREFERRED_METHOD_VALUE
        );
        return defaultMethod ? [defaultMethod] : [];
    }
    if (mapped.length > 1) {
        return [mapped[0]];
    }
    return mapped;
};

export function isDesktopPc() {
    if (typeof window === "undefined") return true;
    const wideEnough = window.matchMedia("(min-width: 1024px)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    return wideEnough && finePointer;
}

export function isHapppyGtmPath(pathname) {
    return pathname === HAPPPY_GTM_PATH || pathname.startsWith(`${HAPPPY_GTM_PATH}/`);
}

export function persistHapppyGtmAuth(authtoken, user) {
    if (!authtoken || !user) return false;
    Cookies.set("talent", true, { domain: getDomain(), secure: true, sameSite: "Strict" });
    localStorage.setItem("token", authtoken);
    localStorage.setItem("user", JSON.stringify(user));
    return true;
}

export function markHapppyGtmExtensionSeen() {
    try {
        sessionStorage.setItem(HAPPPY_GTM_EXTENSION_SEEN_KEY, "1");
    } catch {
        /* private mode */
    }
}

export function hasHapppyGtmExtensionSeen() {
    try {
        return sessionStorage.getItem(HAPPPY_GTM_EXTENSION_SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

export function readExtensionDownloadedLocal() {
    try {
        return localStorage.getItem(HAPPPY_GTM_EXTENSION_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

export function isPrefsComplete(status) {
    if (!status) return false;
    const hasFn =
        status.job_function_id !== null &&
        status.job_function_id !== undefined &&
        status.job_function_id !== "";
    const exp = status.total_experience;
    const hasExp = exp !== null && exp !== undefined && String(exp).trim() !== "";
    return !!status.has_resume && hasFn && hasExp;
}

export function optimisticStatusFromUser(user) {
    if (!user) return normalizeHapppyGtmStatus({});
    return normalizeHapppyGtmStatus({
        gmail_connected: !!(user.outreach?.account_connected || user.outreach?.gmail_connected),
        has_resume: !!user.resume,
        job_function_id: user.job_function_id ?? null,
        total_experience: user.total_experience ?? "",
        extension_downloaded: readExtensionDownloadedLocal(),
    });
}

export function normalizeHapppyGtmStatus(raw = {}) {
    return {
        gmail_connected: !!raw.gmail_connected,
        has_resume: !!raw.has_resume,
        job_function_id: raw.job_function_id ?? null,
        total_experience:
            raw.total_experience === undefined || raw.total_experience === null
                ? ""
                : raw.total_experience,
        extension_downloaded: !!raw.extension_downloaded,
    };
}

export function resolveHapppyGtmStep(status, { desktop = isDesktopPc() } = {}) {
    if (HAPPPY_GTM_DISABLE_AUTO_SKIP) {
        return "prefs";
    }
    if (!isPrefsComplete(status)) return "prefs";
    if (!status?.gmail_connected) return "gmail";
    if (desktop && !status.extension_downloaded && !hasHapppyGtmExtensionSeen()) {
        return "extension";
    }
    return "done";
}

export function getLinearNextHapppyGtmStep(fromStep, { desktop = isDesktopPc() } = {}) {
    if (fromStep === "prefs") return "gmail";
    if (fromStep === "gmail") return desktop ? "extension" : "done";
    if (fromStep === "extension") return "done";
    return "done";
}

/** Mark the step just completed so skip-ahead works without another status GET. */
export function applyHapppyGtmStepCompletion(status, fromStep) {
    const base = normalizeHapppyGtmStatus(status || {});
    if (fromStep === "prefs") {
        return normalizeHapppyGtmStatus({
            ...base,
            has_resume: true,
            job_function_id: base.job_function_id ?? "saved",
            total_experience: base.total_experience === "" ? "0" : base.total_experience,
        });
    }
    if (fromStep === "gmail") {
        return normalizeHapppyGtmStatus({ ...base, gmail_connected: true });
    }
    if (fromStep === "extension") {
        return normalizeHapppyGtmStatus({
            ...base,
            extension_downloaded: true,
        });
    }
    return base;
}

export function shouldPrefetchHapppyGtmPreferences(status) {
    return !isPrefsComplete(status);
}

export async function prefetchHapppyGtmPreferencesIfNeeded(status, dispatch, cachedPreferences) {
    if (!shouldPrefetchHapppyGtmPreferences(status)) {
        return null;
    }
    return ensureTalentPreferences(dispatch, cachedPreferences).catch(() => null);
}

function pushHapppyGtmDataLayer(eventName, extra = {}) {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...extra });
}

export function trackHapppyGtm(eventName, extra = {}) {
    pushHapppyGtmDataLayer(eventName, extra);
    return trackHappyAgentMixpanel(eventName, extra).catch(() => {});
}

/** POST /talent/outreach/track-journey — same keys as AgentOnboarding / Step1. */
export function trackHapppyGtmOutreachJourney(key, extra = {}) {
    return trackOutreachJourney(key, extra).catch(() => {});
}

/** POST /talent/outreach/happpy-public-page-visit — records public Happpy landing origin after Gmail auth. */
export function trackHapppyGtmPublicPageVisit() {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
        return Promise.resolve({ status: 200, data: { message: "Tracking skipped (not authenticated)" } });
    }
    return POST_API(API_HAPPPY_PUBLIC_PAGE_VISIT, {}).catch(() => {});
}

let talentPreferencesInflight = null;

export async function ensureTalentPreferences(dispatch, cachedPreferences) {
    if (cachedPreferences?.talent) {
        return { data: cachedPreferences };
    }
    if (!dispatch) {
        return GET_API(API_TALENT_PREFERENCES);
    }
    if (!talentPreferencesInflight) {
        talentPreferencesInflight = getTalentPreferences(true)(dispatch).finally(() => {
            talentPreferencesInflight = null;
        });
    }
    return talentPreferencesInflight;
}

async function composeStatusFromExistingApis(user, dispatch) {
    let gmail_connected = false;
    let extension_downloaded = readExtensionDownloadedLocal();
    let has_resume = !!(user?.resume);
    let job_function_id = user?.job_function_id ?? null;
    let total_experience = user?.total_experience ?? "";

    const [stepRes, prefRes] = await Promise.all([
        GET_API(API_GET_OUTREACH_STEP).catch(() => null),
        ensureTalentPreferences(dispatch, null).catch(() => null),
    ]);

    const config = stepRes?.data?.data;
    if (config) {
        gmail_connected = !!(config?.status?.step1 || config?.step1?.gmail_connected);
        if (config?.status?.step3 || config?.step3?.chrome_extension_download) {
            extension_downloaded = true;
        }
    }

    const pref = prefRes?.data;
    if (pref) {
        has_resume = !!(pref?.resume || pref?.talent?.resume || has_resume);
        if (pref?.talent?.job_function_id != null) {
            job_function_id = pref.talent.job_function_id;
        }
        if (pref?.talent?.total_experience !== undefined && pref?.talent?.total_experience !== null) {
            total_experience = pref.talent.total_experience;
        }
    }

    return normalizeHapppyGtmStatus({
        gmail_connected,
        has_resume,
        job_function_id,
        total_experience,
        extension_downloaded,
    });
}

let dedicatedStatusUnavailable = false;
let onboardingStatusInflight = null;
let cachedOnboardingStatus = null;
let cachedOnboardingStatusKey = null;

function getOnboardingStatusCacheKey(user) {
    return user?.talent_id ?? user?.id ?? "anonymous";
}

export function clearHapppyGtmOnboardingStatusCache() {
    cachedOnboardingStatus = null;
    cachedOnboardingStatusKey = null;
    onboardingStatusInflight = null;
}

export function patchHapppyGtmOnboardingStatus(patch) {
    cachedOnboardingStatus = normalizeHapppyGtmStatus({
        ...(cachedOnboardingStatus || {}),
        ...patch,
    });
    return cachedOnboardingStatus;
}

/**
 * Single deduped GET talent/happpy-gtm/onboarding-status per talent session.
 * Falls back to outreach-step + get-preference only when the dedicated route is unavailable.
 */
export async function fetchHapppyGtmOnboardingStatus(user, dispatch, { force = false } = {}) {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
        return normalizeHapppyGtmStatus({});
    }

    const cacheKey = getOnboardingStatusCacheKey(user);
    if (!force && cachedOnboardingStatus && cachedOnboardingStatusKey === cacheKey) {
        return cachedOnboardingStatus;
    }
    if (!force && onboardingStatusInflight) {
        return onboardingStatusInflight;
    }

    onboardingStatusInflight = (async () => {
        if (!dedicatedStatusUnavailable) {
            try {
                const res = await GET_API(API_HAPPPY_GTM_ONBOARDING_STATUS);
                const data =
                    res?.data?.data && typeof res.data.data === "object" ? res.data.data : res?.data;
                if (data && typeof data === "object" && ("gmail_connected" in data || "has_resume" in data)) {
                    return normalizeHapppyGtmStatus({
                        ...data,
                        extension_downloaded: data.extension_downloaded || readExtensionDownloadedLocal(),
                    });
                }
            } catch {
                dedicatedStatusUnavailable = true;
            }
        }

        return composeStatusFromExistingApis(user, dispatch);
    })()
        .then((result) => {
            cachedOnboardingStatus = result;
            cachedOnboardingStatusKey = cacheKey;
            return result;
        })
        .finally(() => {
            onboardingStatusInflight = null;
        });

    return onboardingStatusInflight;
}

export async function saveHapppyGtmPreferences(
    { resumeData, resumeFileId, jobFunctionId, totalExperience, preferredCities, preferredMethods, currentLocation },
    dispatch
) {
    const value = {
        job_function: jobFunctionId,
        total_experience: totalExperience,
        preferred_cities: Array.isArray(preferredCities) ? preferredCities : [],
    };
    if (Array.isArray(preferredMethods) && preferredMethods.length > 0) {
        value.preferred_method = preferredMethods;
    }
    if (currentLocation?.value != null) {
        value.current_location = currentLocation;
    }
    if (resumeData) {
        value.resume = resumeData;
    }
    if (resumeFileId) {
        value.resume_file_id = resumeFileId;
    }
    const payload = { field: "happpy-quick-onboarding", value, save_source: "Happpy GTM Onboarding" };
    let formData = new FormData();
    for (const [key, data] of Object.entries(payload)) {
        formData = buildFormData(formData, data, key);
    }
    return profileUpsert(formData, true)(dispatch);
}
