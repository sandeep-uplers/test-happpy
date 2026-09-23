'use client';

// import { useGoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
// import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "@/talent/navigation/routerCompat";
import { HappyJobAgentContent } from "../../app/linkedin/HappyJobAgent";
import { HappyJobAgentPublicAuthDrawer } from "../HappyJobAgentPublic";
import HapppyGtmOnboarding from "./HapppyGtmOnboarding";
import {
    clearPublicAuthPath,
    getPublicAuthPath,
    isPublicEmailAuthPath,
    // setPublicAuthPath,
    setPublicReferralCode,
} from "../../../helpers/happyAgentPublicSignupSession";
import {
    ONBOARDING_URL_PARAM,
    pathWithOnboardingParam,
} from "../../../helpers/onboardingUrlParams";
import { getDomain } from "../../../components/Helper";
import {
    clearHapppyGtmOnboardingStatusCache,
    fetchHapppyGtmOnboardingStatus,
    HAPPPY_GTM_DISABLE_AUTO_SKIP,
    HAPPPY_GTM_RECOMMENDED_JOBS_PATH,
    optimisticStatusFromUser,
    patchHapppyGtmOnboardingStatus,
    prefetchHapppyGtmPreferencesIfNeeded,
    resolveHapppyGtmStep,
    trackHapppyGtm,
    trackHapppyGtmPublicPageVisit,
} from "../../../helpers/happpyGtmOnboarding";
import { trackHappyAgentPublicAuthCompleted } from "../../../store/actions/happyAgentTracking";
// import { socialGoogleCallback } from "../../../store/actions/signupApplyActions";
import { getProfilePercent } from "../../../store/actions/UserActions";
import "../HappyJobAgentPublic.css";

/** Same redirect as SocialSSO — required for `new-signup/google-callback` token exchange. */
// const GOOGLE_REDIRECT_URI = process.env.MIX_APP_URL + "/talent/auth/google-callback";

const HAPPPY_GTM_FINISH_JOBS_PATH = pathWithOnboardingParam(
    HAPPPY_GTM_RECOMMENDED_JOBS_PATH,
    ONBOARDING_URL_PARAM.SETUP_COMPLETE
);

function HapppyGtmPublicInner() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { preferences: cachedPreferences } = useSelector((state) => state.profile) || {};
    const [searchParams] = useSearchParams();
    const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [status, setStatus] = useState(null);
    const [initialStep, setInitialStep] = useState("prefs");
    const [accountsFirstFlow, setAccountsFirstFlow] = useState(false);
    // Continue with Google CTA disabled on this GTM landing.
    // const [googleAuthing, setGoogleAuthing] = useState(false);
    const pageViewTrackedRef = useRef(false);
    // const openAfterGoogleRef = useRef(null);
    const cachedPreferencesRef = useRef(cachedPreferences);
    const bootstrapStartedRef = useRef(false);

    cachedPreferencesRef.current = cachedPreferences;

    const handleStatusChange = useCallback((next) => {
        patchHapppyGtmOnboardingStatus(next);
        setStatus(next);
    }, []);

    const loadStatusAndPrefetch = useCallback(
        async (authUser, { force = false } = {}) => {
            const next = await fetchHapppyGtmOnboardingStatus(authUser, dispatch, { force });
            setStatus(next);
            await prefetchHapppyGtmPreferencesIfNeeded(
                next,
                dispatch,
                cachedPreferencesRef.current
            );
            return next;
        },
        [dispatch]
    );

    const openDrawerWithStatus = useCallback(
        (known, { accountsFirst = false } = {}) => {
            const step = accountsFirst ? "gmail" : resolveHapppyGtmStep(known);
            if (step === "done" && !HAPPPY_GTM_DISABLE_AUTO_SKIP) {
                navigate(HAPPPY_GTM_FINISH_JOBS_PATH, { replace: true });
                return false;
            }
            setAccountsFirstFlow(accountsFirst);
            setInitialStep(step === "done" ? "prefs" : step);
            if (known) {
                patchHapppyGtmOnboardingStatus(known);
                setStatus(known);
            }
            setDrawerOpen(true);
            return true;
        },
        [navigate]
    );

    const refreshOnboardingInBackground = useCallback(
        (authUser, { force = false } = {}) =>
            loadStatusAndPrefetch(authUser, { force }).then((next) => {
                const step = resolveHapppyGtmStep(next);
                if (step === "done" && !HAPPPY_GTM_DISABLE_AUTO_SKIP) {
                    setDrawerOpen(false);
                    navigate(HAPPPY_GTM_FINISH_JOBS_PATH, { replace: true });
                    return next;
                }
                patchHapppyGtmOnboardingStatus(next);
                setStatus(next);
                return next;
            }),
        [loadStatusAndPrefetch, navigate]
    );

    const continueAfterAuth = useCallback(() => {
        Cookies.set("talent", true, { domain: getDomain(), secure: true, sameSite: "Strict" });
        const authUser = JSON.parse(localStorage.getItem("user") || "null");
        clearHapppyGtmOnboardingStatusCache();
        bootstrapStartedRef.current = true;
        trackHapppyGtmPublicPageVisit();
        // setGoogleAuthing(false);
        setAuthDrawerOpen(false);

        const authPath = getPublicAuthPath();
        const accountsFirst = isPublicEmailAuthPath(authPath);
        clearPublicAuthPath();

        const optimistic = optimisticStatusFromUser(authUser);
        openDrawerWithStatus(optimistic, { accountsFirst });

        getProfilePercent(false)(dispatch).catch(() => {});
        refreshOnboardingInBackground(authUser, { force: true });
    }, [dispatch, openDrawerWithStatus, refreshOnboardingInBackground]);

    const handleAuthCompleted = useCallback(({ newAccount, authPath } = {}) => {
        trackHappyAgentPublicAuthCompleted({ newAccount, authPath }).catch(() => {});
        if (authPath === "google") {
            trackHapppyGtm("happpy_gtm_google_login_completed");
        } else {
            trackHapppyGtm("happpy_gtm_email_auth_completed", {
                auth_path: authPath,
                ...(typeof newAccount === "boolean" ? { new_account: newAccount } : {}),
            });
        }
    }, []);

    useEffect(() => {
        if (pageViewTrackedRef.current) return;
        pageViewTrackedRef.current = true;
        trackHapppyGtm("happpy_gtm_landing_viewed", {
            entry_source: searchParams.get("src") || searchParams.get("entry_source") || "direct",
            is_authenticated: !!isAuthenticated,
        });
    }, [searchParams, isAuthenticated]);

    useEffect(() => {
        const referralCode = searchParams.get("r");
        if (referralCode) {
            setPublicReferralCode(referralCode);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!isAuthenticated) {
            setStatus(null);
            bootstrapStartedRef.current = false;
            clearHapppyGtmOnboardingStatusCache();
            return undefined;
        }

        const talentKey = user?.talent_id ?? user?.id;
        if (!talentKey || bootstrapStartedRef.current) {
            return undefined;
        }
        bootstrapStartedRef.current = true;

        let cancelled = false;
        loadStatusAndPrefetch(user).then((next) => {
            if (cancelled) return;
            const step = resolveHapppyGtmStep(next);
            if (step === "done" && !HAPPPY_GTM_DISABLE_AUTO_SKIP) {
                navigate(HAPPPY_GTM_FINISH_JOBS_PATH, { replace: true });
            } else {
                setInitialStep(step);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, loadStatusAndPrefetch, navigate, user?.id, user?.talent_id]);

    const finishToJobs = useCallback(() => {
        trackHapppyGtm("happpy_gtm_funnel_completed");
        setDrawerOpen(false);
        navigate(HAPPPY_GTM_FINISH_JOBS_PATH, { replace: true });
    }, [navigate]);

    const openOnboardingForAuthedUser = useCallback(() => {
        const known = status || optimisticStatusFromUser(user);
        if (!openDrawerWithStatus(known)) {
            return;
        }
        if (status) {
            prefetchHapppyGtmPreferencesIfNeeded(known, dispatch, cachedPreferencesRef.current);
            return;
        }
        refreshOnboardingInBackground(user);
    }, [dispatch, openDrawerWithStatus, refreshOnboardingInBackground, status, user]);

    // Continue with Google CTA — commented out on this GTM landing (email/OTP only).
    // openAfterGoogleRef.current = () => {
    //     window.dataLayer = window.dataLayer || [];
    //     if (typeof gtag === "undefined") {
    //         window.gtag = function () {
    //             window.dataLayer.push(arguments);
    //         };
    //     }
    //     const registerEventPayload = {
    //         from_where: "happpy_gtm_public_landing",
    //         auth_path: "google",
    //     };
    //     gtag("event", "user_register_via_referral_agent_public_page", registerEventPayload);
    //     window.dataLayer.push({
    //         event: "user_register_via_referral_agent_public_page",
    //         ...registerEventPayload,
    //     });
    //
    //     setPublicAuthPath("google");
    //     handleAuthCompleted({ authPath: "google" });
    //     continueAfterAuth();
    // };
    //
    // const googleLogin = useGoogleLogin({
    //     flow: "auth-code",
    //     redirect_uri: GOOGLE_REDIRECT_URI,
    //     onSuccess: (codeResponse) => {
    //         socialGoogleCallback(codeResponse.code, "regular")(dispatch)
    //             .then(() => openAfterGoogleRef.current())
    //             .catch((err) => {
    //                 trackHapppyGtm("happpy_gtm_google_login_failed");
    //                 const message = err?.response?.data?.message;
    //                 toast.error(
    //                     typeof message === "string" && message ? message : "Something went wrong!",
    //                     { duration: 6000 }
    //                 );
    //             })
    //             .finally(() => setGoogleAuthing(false));
    //     },
    //     onError: () => {
    //         setGoogleAuthing(false);
    //         trackHapppyGtm("happpy_gtm_google_login_failed");
    //         toast.error("Google sign-in failed. Please try again.", { duration: 6000 });
    //     },
    //     onNonOAuthError: () => {
    //         setGoogleAuthing(false);
    //     },
    // });
    //
    // const handleGoogleSignIn = useCallback(() => {
    //     if (googleAuthing) return;
    //     setAuthDrawerOpen(false);
    //     trackHapppyGtm("happpy_gtm_google_login_attempted");
    //     setGoogleAuthing(true);
    //     googleLogin();
    // }, [googleAuthing, googleLogin]);

    const openOnboarding = useCallback(() => {
        if (drawerOpen) return;
        trackHapppyGtm("happpy_gtm_cta_clicked");

        if (isAuthenticated) {
            openOnboardingForAuthedUser();
            return;
        }

        setAuthDrawerOpen(true);
    }, [drawerOpen, isAuthenticated, openOnboardingForAuthedUser]);

    const closeAuthDrawer = useCallback(() => {
        setAuthDrawerOpen(false);
    }, []);

    return (
        <>
            <HappyJobAgentContent
                publicSignupMode
                onOpenAuthDrawer={openOnboarding}
                authDrawerOpen={drawerOpen || authDrawerOpen}
            />
            <HappyJobAgentPublicAuthDrawer
                isOpen={authDrawerOpen}
                onClose={closeAuthDrawer}
                onAuthSuccess={continueAfterAuth}
                // Continue with Google CTA commented out — email/OTP only on this landing.
                // onGoogleSignIn={handleGoogleSignIn}
                // googleAuthing={googleAuthing}
                gtagFromWhere="happpy_gtm_public_landing"
                onAuthCompleted={handleAuthCompleted}
            />
            <HapppyGtmOnboarding
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                initialStep={initialStep}
                accountsFirst={accountsFirstFlow}
                onboardingStatus={status}
                onStatusChange={handleStatusChange}
                onFinish={finishToJobs}
            />
        </>
    );
}

export default function HapppyGtmPublic() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHAV3_SITEKEY}>
            <HapppyGtmPublicInner />
        </GoogleReCaptchaProvider>
    );
}
