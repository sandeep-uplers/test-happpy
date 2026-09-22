'use client';

// import { useGoogleLogin } from "@react-oauth/google";
import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import Modal from "react-modal";
import OTPInput from "react-otp-input";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "@/talent/navigation/routerCompat";
import { ensureModalAppElement } from "../../helpers/setModalAppElement";
import {
    API_REFERRAL_AGENT_RESEND_OTP,
    API_REFERRAL_AGENT_VERIFY_OTP,
    LOGIN_IMAGE_URL,
} from "../../components/Constant";
import { getDomain, POST_API } from "../../components/Helper";
import {
    setPublicAuthPath,
    setPublicReferralCode,
    setPublicSignupPending,
} from "../../helpers/happyAgentPublicSignupSession";
import { buildReferralAiAgentPath } from "../../helpers/happyAgentUrlParams";
import { ONBOARDING_URL_PARAM } from "../../helpers/onboardingUrlParams";
import { trackHappyAgentMixpanel, trackHappyAgentPublicAuthCompleted } from "../../store/actions/happyAgentTracking";
// import { socialGoogleCallback } from "../../store/actions/signupApplyActions";
import { setCurrentUser, signupReferralAgent } from "../../store/actions/UserActions";
import { HappyJobAgentContent } from "../app/linkedin/HappyJobAgent";
import {
    HAPPY_PUBLIC_AUTH_CONTINUE_ARROW_SRC,
    HAPPY_PUBLIC_AUTH_INTERVIEW_COUNT,
    HAPPY_PUBLIC_AUTH_MASCOT_SRC,
    HAPPY_PUBLIC_AUTH_TRUST_COMPANIES,
    HAPPY_PUBLIC_AUTH_TRUST_HEADLINE,
    HAPPY_PUBLIC_AUTH_TRUST_HIGHLIGHT,
} from "../app/linkedin/happyAgentPageAssets";
import "./HappyJobAgentPublic.css";

ensureModalAppElement();

/** Same redirect as SocialSSO — required for `new-signup/google-callback` token exchange. */
// const GOOGLE_REDIRECT_URI = process.env.MIX_APP_URL + "/talent/auth/google-callback";

/**
 * GTM container `GTM-P6GXD64V` is served from the `<head>` in
 * `resources/views/talent/index.blade.php`, gated on the `happpy-ai-agent` path.
 */

export function HappyJobAgentPublicAuthDrawer({
    isOpen,
    onClose,
    onAuthSuccess,
    onGoogleSignIn,
    googleAuthing,
    gtagFromWhere = "referral_agent_public_landing",
    onAuthCompleted,
}) {
    const { executeRecaptcha } = useGoogleReCaptcha();
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [submitLoading, setSubmitLoading] = useState(false);
    const [showOtpStep, setShowOtpStep] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpVerifyLoading, setOtpVerifyLoading] = useState(false);
    const [otpResendMessage, setOtpResendMessage] = useState("");
    /** Carried from email submit when OTP is required (`new_account` from signup API). */
    const [pendingNewAccount, setPendingNewAccount] = useState(null);

    const resetDrawer = useCallback(() => {
        setEmail("");
        setEmailError("");
        setSubmitLoading(false);
        setShowOtpStep(false);
        setPendingEmail("");
        setOtp("");
        setOtpError("");
        setOtpVerifyLoading(false);
        setOtpResendMessage("");
        setPendingNewAccount(null);
    }, []);

    const handleClose = useCallback(() => {
        resetDrawer();
        onClose();
    }, [onClose, resetDrawer]);

    useEffect(() => {
        if (!isOpen) {
            resetDrawer();
        }
    }, [isOpen, resetDrawer]);

    const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((value || "").trim());

    const handleEmailSubmit = async () => {
        const raw = (email || "").trim();
        if (!raw) {
            setEmailError("Please enter your email.");
            return;
        }
        if (!emailLooksValid(raw)) {
            setEmailError("Please enter a valid email address.");
            return;
        }
        setEmailError("");
        setSubmitLoading(true);
        try {
            const recaptchaToken = await executeRecaptcha("form_submit");
            const payloadFormData = new FormData();
            payloadFormData.append("email", raw);
            payloadFormData.append("g_recaptcha_response", recaptchaToken);

            const res = await signupReferralAgent(payloadFormData)(dispatch);
            const data = res?.data || {};

            window.dataLayer = window.dataLayer || [];
            if (typeof gtag === "undefined") {
                window.gtag = function () {
                    window.dataLayer.push(arguments);
                };
            }
            const registerEventPayload = {
                from_where: gtagFromWhere,
                email: data.email || data.data?.email || raw,
                new_account: data.new_account,
            };
            gtag("event", "user_register_via_referral_agent_public_page", registerEventPayload);
            // GTM Custom Event triggers only match `dataLayer.push({event})`, not gtag() arguments pushes.
            window.dataLayer.push({
                event: "user_register_via_referral_agent_public_page",
                ...registerEventPayload,
            });

            // Existing users: OTP required before login.
            if (data.requires_otp === true && data.email) {
                setPendingEmail(data.email);
                setPendingNewAccount(false);
                setShowOtpStep(true);
                setOtpError("");
                setOtpResendMessage("OTP sent to your email.");
                return;
            }

            // New users: backend auto-verifies and returns a token (no OTP step).
            if (data.requires_otp === false && data.authtoken && data.data) {
                const authCompletedPayload = {
                    newAccount: true,
                    authPath: "instant",
                };
                setPublicAuthPath("instant");
                if (onAuthCompleted) {
                    onAuthCompleted(authCompletedPayload);
                } else {
                    trackHappyAgentPublicAuthCompleted(authCompletedPayload).catch(() => { });
                }
                handleClose();
                onAuthSuccess?.();
                return;
            }

            toast.error("Something went wrong!", { duration: 3000 });
        } catch (err) {
            const fieldErrors = err && typeof err === "object" && err !== null && !err.response ? err : null;
            const rawEmailErr = fieldErrors?.email;
            const emailMsg = Array.isArray(rawEmailErr) ? rawEmailErr[0] : rawEmailErr;
            if (emailMsg) {
                setEmailError(emailMsg);
                toast.error(emailMsg, { duration: 3000 });
                return;
            }
            const ax = err?.response;
            if (ax?.status === 422) {
                toast.error(ax.data?.message || ax.data?.error || "Could not continue. Please check your email and try again.", {
                    duration: 3000,
                });
                return;
            }
            toast.error("Something went wrong!", { duration: 3000 });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOtpVerify = async () => {
        if (!pendingEmail) return;
        const trimmed = (otp || "").replace(/\D/g, "").slice(0, 6);
        if (trimmed.length !== 6) {
            setOtpError("Please enter the 6-digit code.");
            return;
        }
        setOtpError("");
        setOtpVerifyLoading(true);
        try {
            const { data } = await POST_API(API_REFERRAL_AGENT_VERIFY_OTP, { email: pendingEmail, otp: trimmed });
            if (data.status === 200 && data.authtoken && data.data) {
                Cookies.set("talent", true, { domain: getDomain(), secure: true, sameSite: "Strict" });
                localStorage.setItem("token", data.authtoken);
                localStorage.setItem("user", JSON.stringify(data.data));
                dispatch(setCurrentUser(data.data));
                const authCompletedPayload = {
                    newAccount: typeof pendingNewAccount === "boolean" ? pendingNewAccount : undefined,
                    authPath: "otp",
                };
                setPublicAuthPath("otp");
                if (onAuthCompleted) {
                    onAuthCompleted(authCompletedPayload);
                } else {
                    trackHappyAgentPublicAuthCompleted(authCompletedPayload).catch(() => { });
                }
                handleClose();
                onAuthSuccess?.();
            } else {
                setOtpError(data.errors?.otp?.[0] || "Invalid OTP. Please try again.");
            }
        } catch (err) {
            const msg = err.response?.data?.errors?.otp?.[0] || "Invalid OTP. Please try again.";
            setOtpError(msg);
        } finally {
            setOtpVerifyLoading(false);
        }
    };

    const handleOtpResend = async () => {
        if (!pendingEmail) return;
        setOtpError("");
        setOtpResendMessage("");
        try {
            const { data } = await POST_API(API_REFERRAL_AGENT_RESEND_OTP, { email: pendingEmail });
            if (data.status === 200) {
                setOtpResendMessage(data.message?.otp?.[0] || "OTP sent to your email.");
                setOtp("");
            } else {
                toast.error(data.errors?.otp?.[0] || data.errors?.email?.[0] || "Could not resend OTP.", { duration: 3000 });
            }
        } catch {
            toast.error("Could not resend OTP. Please try again.", { duration: 3000 });
        }
    };

    return (
        <Modal
            isOpen={!!isOpen}
            onRequestClose={handleClose}
            portalClassName="happy-public-auth-portal"
            overlayClassName="happy-public-auth-overlay happy-public-auth-overlay--side-panel"
            className="happy-public-auth-drawer happy-public-auth-drawer--side-panel"
            bodyOpenClassName="happy-public-auth-body-open"
            contentLabel="Sign in or create your account"
            shouldCloseOnOverlayClick
            shouldCloseOnEsc
        >
            <button type="button" className="happy-public-auth-close happy-public-auth-close--side-panel" onClick={handleClose} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className="happy-public-auth-drawer__body happy-public-auth-drawer__body--side-panel">
                {!showOtpStep ? (
                    <>
                        <header className="happy-public-auth-drawer__header">
                            <h2 className="happy-public-auth-title happy-public-auth-title--side-panel">Let&apos;s Get started!</h2>
                            <p className="happy-public-auth-lead happy-public-auth-lead--side-panel">
                                Enter your email to create your account or sign in
                            </p>
                        </header>

                        <div className="happy-public-auth-email-card">
                            <label className="happy-public-auth-label happy-public-auth-label--side-panel" htmlFor="happyPublicAuthEmail">
                                Your Email Address
                            </label>
                            <div className="happy-public-auth-email-row">
                                <input
                                    id="happyPublicAuthEmail"
                                    type="email"
                                    className="happy-public-auth-input happy-public-auth-input--side-panel"
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setEmailError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleEmailSubmit();
                                        }
                                    }}
                                    disabled={submitLoading || googleAuthing}
                                    data-hj-allow
                                />
                                <button
                                    type="button"
                                    className="happy-public-auth-continue-btn"
                                    onClick={handleEmailSubmit}
                                    disabled={submitLoading || googleAuthing}
                                    aria-busy={submitLoading}
                                >
                                    <span>{submitLoading ? "Sending…" : "continue"}</span>
                                    <img src={HAPPY_PUBLIC_AUTH_CONTINUE_ARROW_SRC} alt="" aria-hidden />
                                </button>
                            </div>
                            {emailError && <p className="happy-public-auth-error">{emailError}</p>}
                        </div>

                        {onGoogleSignIn && (
                            <>
                                <div className="happy-public-auth-divider happy-public-auth-divider--side-panel" aria-hidden="true">
                                    <span>OR</span>
                                </div>

                                {/* Continue with Google CTA — commented out on the public Happpy landing; GTM still passes onGoogleSignIn. */}
                                <button
                                    type="button"
                                    className="happy-public-auth-google-btn happy-public-auth-google-btn--side-panel"
                                    onClick={onGoogleSignIn}
                                    disabled={submitLoading || googleAuthing}
                                    aria-busy={googleAuthing}
                                >
                                    <img src={`${LOGIN_IMAGE_URL}/google-icon.svg`} alt="" aria-hidden />
                                    {googleAuthing ? "Signing in…" : "Continue with Google"}
                                </button>
                            </>
                        )}

                        <div className="happy-public-auth-footer">
                            <div className="happy-public-auth-gmail-promo">
                                <div className="happy-public-auth-gmail-promo__banner">
                                    <img
                                        className="happy-public-auth-gmail-promo__mascot"
                                        src={HAPPY_PUBLIC_AUTH_MASCOT_SRC}
                                        alt=""
                                        aria-hidden
                                    />
                                    <p className="happy-public-auth-gmail-promo__text">
                                        HAPPPY Agent helped secure over{" "}
                                        <strong>{HAPPY_PUBLIC_AUTH_INTERVIEW_COUNT} Interviews</strong> in just last 7 days!
                                    </p>
                                </div>
                            </div>
                            <section className="happy-public-auth-trust" aria-label="Companies hiring through Happpy">
                                <div className="happy-public-auth-trust__copy">
                                    <p className="happy-public-auth-trust__headline">{HAPPY_PUBLIC_AUTH_TRUST_HEADLINE}</p>
                                    <p className="happy-public-auth-trust__highlight">{HAPPY_PUBLIC_AUTH_TRUST_HIGHLIGHT}</p>
                                </div>
                                <ul className="happy-public-auth-trust__pills">
                                    {HAPPY_PUBLIC_AUTH_TRUST_COMPANIES.map((company) => (
                                        <li key={company.name} className="happy-public-auth-trust-pill">
                                            {company.logo && (
                                                <img
                                                    className="happy-public-auth-trust-pill__logo"
                                                    src={company.logo}
                                                    alt=""
                                                    width={company.width}
                                                    height={company.height}
                                                    aria-hidden
                                                />
                                            )}
                                            <span>{company.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </>
                ) : (
                    <>
                        <header className="happy-public-auth-drawer__header">
                            <h2 className="happy-public-auth-title happy-public-auth-title--side-panel">Verify your email</h2>
                            <p className="happy-public-auth-lead happy-public-auth-lead--side-panel">
                                We&apos;ve sent a 6-digit code to <strong>{pendingEmail}</strong> to confirm it&apos;s you.
                            </p>
                        </header>
                        <p className="happy-public-auth-hint happy-public-auth-hint--otp">
                            Check your Spam or Promotions folder if you don&apos;t see it.
                        </p>
                        <div className={`happy-public-auth-otp-wrap ${otpError ? "happy-public-auth-otp-wrap--error" : ""}`}>
                            <OTPInput
                                value={otp}
                                onChange={(value) => {
                                    setOtpError("");
                                    setOtp(value.replace(/\D/g, "").slice(0, 6));
                                }}
                                numInputs={6}
                                inputType="tel"
                                shouldAutoFocus
                                containerStyle={{
                                    gap: "10px",
                                    justifyContent: "center",
                                    flexWrap: "wrap",
                                }}
                                renderInput={(props) => (
                                    <input
                                        {...props}
                                        className="happy-public-auth-otp-input"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        data-hj-allow
                                        aria-label="OTP digit"
                                    />
                                )}
                            />
                        </div>
                        {otpError && <p className="happy-public-auth-error">{otpError}</p>}
                        {otpResendMessage && <p className="happy-public-auth-success">{otpResendMessage}</p>}
                        <p className="happy-public-auth-resend">
                            Didn&apos;t receive the code?{" "}
                            <button type="button" className="happy-public-auth-resend-btn" onClick={handleOtpResend}>
                                Resend
                            </button>
                        </p>
                        <button
                            type="button"
                            className="happy-public-auth-submit"
                            onClick={handleOtpVerify}
                            disabled={otpVerifyLoading || (otp || "").replace(/\D/g, "").length !== 6}
                        >
                            {otpVerifyLoading ? "Verifying…" : "Verify & continue"}
                        </button>
                        <button
                            type="button"
                            className="happy-public-auth-back"
                            onClick={() => {
                                setShowOtpStep(false);
                                setOtp("");
                                setOtpError("");
                                setOtpResendMessage("");
                            }}
                            disabled={otpVerifyLoading}
                        >
                            ← Change email
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
}

function HappyJobAgentPublicInner() {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
    // Continue with Google CTA disabled on this public landing.
    // const dispatch = useDispatch();
    // const [googleAuthing, setGoogleAuthing] = useState(false);
    const [searchParams] = useSearchParams();
    const publicPageViewTrackedRef = useRef(false);
    // const continueAfterGoogleRef = useRef(null);

    /** Persist ?r= as soon as the public page loads so it survives post-auth navigation. */
    useEffect(() => {
        const referralCode = searchParams.get("r");
        if (referralCode) {
            setPublicReferralCode(referralCode);
        }
    }, [searchParams]);

    /** Paid subscribers with a valid session belong on the dashboard, not the public landing. */
    useEffect(() => {
        if (isAuthenticated &&user?.outreach?.is_outreach_paid) {
            navigate("/talent/job-agent", { replace: true });
        }
        if (isAuthenticated && user?.expected_ctc) {
            navigate(buildReferralAiAgentPath(searchParams), { replace: true });
        }
        if (publicPageViewTrackedRef.current) {
            return;
        }
        publicPageViewTrackedRef.current = true;
        trackHappyAgentMixpanel("happy_agent_public_page_viewed", {
            entry_source: searchParams.get("src") || searchParams.get("entry_source") || searchParams.get("source")  || "direct",
            has_referral_code: !!searchParams.get("r"),
            has_reference_param: !!searchParams.get("reference"),
            current_url: window.location.href,
        }).catch(() => { });
    }, [navigate, isAuthenticated, searchParams, user?.outreach?.is_outreach_paid, user?.expected_ctc]);

    /**
     * Post-auth handoff (UTS: CONNECT_ACCOUNTS_PATH = ?create-profile=true).
     * Always navigates with create-profile — AgentOnboarding then picks the first
     * screen from session auth path: otp/instant → Connect Accounts; google → Create Profile.
     */
    const continueToConnectAccounts = useCallback(() => {
        setPublicSignupPending();
        navigate(
            buildReferralAiAgentPath(searchParams, {
                onboardingParam: ONBOARDING_URL_PARAM.CREATE_PROFILE,
            }),
            { replace: true },
        );
    }, [navigate, searchParams]);

    // Continue with Google CTA — commented out on this public landing (email/OTP only).
    // continueAfterGoogleRef.current = async () => {
    //     Cookies.set("talent", true, { domain: getDomain(), secure: true, sameSite: "Strict" });
    //     setGoogleAuthing(false);
    //
    //     window.dataLayer = window.dataLayer || [];
    //     if (typeof gtag === "undefined") {
    //         window.gtag = function () {
    //             window.dataLayer.push(arguments);
    //         };
    //     }
    //     const registerEventPayload = {
    //         from_where: "referral_agent_public_landing",
    //         auth_path: "google",
    //     };
    //     gtag("event", "user_register_via_referral_agent_public_page", registerEventPayload);
    //     window.dataLayer.push({
    //         event: "user_register_via_referral_agent_public_page",
    //         ...registerEventPayload,
    //     });
    //
    //     await POST_API(API_HAPPPY_PUBLIC_PAGE_VISIT_1, {}).catch(() => {});
    //     setPublicAuthPath("google");
    //     trackHappyAgentPublicAuthCompleted({ authPath: "google" }).catch(() => { });
    //     continueToConnectAccounts();
    // };
    //
    // const googleLogin = useGoogleLogin({
    //     flow: "auth-code",
    //     redirect_uri: GOOGLE_REDIRECT_URI,
    //     onSuccess: (codeResponse) => {
    //         socialGoogleCallback(codeResponse.code, "regular")(dispatch)
    //             .then(() => getProfilePercent(false)(dispatch).catch(() => {}))
    //             .then(() => continueAfterGoogleRef.current())
    //             .catch((err) => {
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
    //     setGoogleAuthing(true);
    //     googleLogin();
    // }, [googleAuthing, googleLogin]);

    const openAuthDrawer = useCallback(() => {
        if (isAuthenticated && user && Object.keys(user).length > 0) {
            if (user.expected_ctc) {
                navigate(buildReferralAiAgentPath(searchParams), { replace: true });
                return;
            }
            continueToConnectAccounts();
            return;
        }
        setAuthDrawerOpen(true);
    }, [continueToConnectAccounts, isAuthenticated, navigate, searchParams, user]);

    const closeAuthDrawer = useCallback(() => {
        setAuthDrawerOpen(false);
    }, []);

    return (
        <>
            <HappyJobAgentContent
                publicSignupMode
                onOpenAuthDrawer={openAuthDrawer}
                authDrawerOpen={authDrawerOpen}
            />
            <HappyJobAgentPublicAuthDrawer
                isOpen={authDrawerOpen}
                onClose={closeAuthDrawer}
                onAuthSuccess={continueToConnectAccounts}
                // Continue with Google CTA commented out — email/OTP only on this landing.
                // onGoogleSignIn={handleGoogleSignIn}
                // googleAuthing={googleAuthing}
            />
        </>
    );
}

export default function HappyJobAgentPublic() {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHAV3_SITEKEY}>
            <HappyJobAgentPublicInner />
        </GoogleReCaptchaProvider>
    );
}
