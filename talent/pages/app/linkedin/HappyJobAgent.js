'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import {
    API_GET_OUTREACH_STEP,
    API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH,
    SESSION_KEY_JOB_AGENT_DISPLAY_JOB_URLS,
    OUTREACH_JOURNEY_KEY_ONBOARDING_POP_OPENED,
    buildOnbPopOpenedSectionKey,
} from "../../../components/Constant";
import { GET_API, getClientDeviceMobileOrDesktop, POST_API } from "../../../components/Helper";
import { trackHappyAgentMixpanel, trackOutreachJourney } from "../../../store/actions/happyAgentTracking";
import { tailorResumeCaptureOrder, tailorResumeCreateOrder } from "../../../store/actions/resumeActions";
import { trackTailorPaymentSuccess } from "../../../store/actions/trackingActions";
import { SET_LOADER, UPDATE_CURRENT_USER } from "../../../store/actions/actionsTypes";
import TailorPaymentLoader from "../resume/payment/TailorPaymentLoader";
import "../../access-public/HappyJobAgentPublic.css";
import { getReferralCompaniesGrouped, REFERRAL_LOGO_BASE } from "../../access-public/referralCompaniesData";
import "../../access-public/ReferralJobAgentLanding.css";
import HappyAgentRunJourney from "./HappyAgentRunJourney";
import "./OutreachAgent.css";
import OutreachConfigureAccountsOnly from "./OutreachConfigureAccountsOnly";
import {
    DISPLAY_ORDER as HAPPY_PRICING_DISPLAY_ORDER,
    PlanCard as HappyPlanCard,
    landingPlanCardProps,
    planCardReferralProps,
} from "../happpy-agent/HappyPlanCards";
import {
    REFERRAL_AGENT_RA_TEAM,
    ReferralAgentRaPersonCard,
    ReferralAgentYourPitchCard,
} from "./referralAgentRaTeam";
import TestimonialsSlider from "./TestimonialsSlider";
import HappyAgentLandingNavbar from "../../../components/HappyAgentLandingNavbar";
import HapppyAgentLogo from "../../../components/common/HapppyAgentLogo";
import { REFERRAL_AI_AGENT_PATH } from "../../../components/HappyAiAgentLayout";
import MechanicalScoreboardNumber, { randomScoreboardStart } from "../../../components/common/MechanicalScoreboardNumber";
import WaveLoader from "../../../components/WaveLoader";
import AgentOnboarding from "../agent-onboarding/AgentOnboarding";
import {
    clearPublicOnbSection,
    clearPublicSignupHandoff,
    getPublicOnbSection,
    isPublicSignupPending,
    setPublicOnbSection,
} from "../../../helpers/happyAgentPublicSignupSession";
import {
    ONBOARDING_URL_PARAM,
} from "../../../helpers/onboardingUrlParams";
import {
    HAPPY_FAQ_ITEMS,
    HAPPY_FOOTER_COLUMNS,
    HAPPY_FOOTER_COPYRIGHT,
    HAPPY_FOOTER_INSTAGRAM_HREF,
    HAPPY_FOOTER_INSTAGRAM_LOGO_SRC,
    HAPPY_FOOTER_LINKEDIN_HREF,
    HAPPY_FOOTER_LINKEDIN_LOGO_SRC,
    HAPPY_FOOTER_NOTE,
    HAPPY_FOOTER_TAGLINE_LINES,
    HAPPY_HANDWRITING_CLASS,
    HAPPY_HERO_ASSET_BASE,
    HAPPY_HERO_BG_SIZES,
    HAPPY_HERO_BG_SRC,
    HAPPY_HERO_BG_WEBP_SRCSET,
    HAPPY_HERO_PRELOAD_ID,
    HAPPY_HERO_SUBTITLE_LINE_1,
    HAPPY_HERO_TITLE_HIGHLIGHT,
    HAPPY_HERO_TITLE_PREFIX,
    HAPPY_HERO_TRUST_ITEMS,
    HAPPY_HERO_TRUST_SPARKLE_SRC,
    HAPPY_HIW_HEADLINE_HIGHLIGHT_SRC,
    HAPPY_HOW_IT_WORKS_PILLARS,
    HAPPY_KINETIC_CONCLUSION_BODY,
    HAPPY_KINETIC_CONCLUSION_TITLE,
    HAPPY_KINETIC_CONCLUSION_UNDERLINE_PRIMARY_SRC,
    HAPPY_KINETIC_CONCLUSION_UNDERLINE_SECONDARY_SRC,
    HAPPY_KINETIC_EYEBROW,
    HAPPY_KINETIC_HEADER_SPARKLE_LARGE_SRC,
    HAPPY_KINETIC_HEADER_SPARKLE_SMALL_SRC,
    HAPPY_KINETIC_STEPS,
    HAPPY_KINETIC_SUBTITLE,
    HAPPY_KINETIC_TITLE,
    HAPPY_MANUAL_VS_AGENT_ROWS,
    HAPPY_MANUAL_VS_MANUAL_HEADER_ICON_SRC,
    HAPPY_MANUAL_VS_MANUAL_ROWS,
    HAPPY_MANUAL_VS_STATS,
    HAPPY_PRICING_EYEBROW,
    HAPPY_PRICING_FOOTNOTE,
    HAPPY_PRICING_TITLE,
    PUBLIC_LANDING_PLAN_FALLBACKS,
    HAPPY_PRIVACY_BADGES,
    HAPPY_PRIVACY_CARDS,
    HAPPY_PRIVACY_SPARKLE_SRC,
    HAPPY_PRIVACY_TITLE_UNDERLINE_SRC,
    HAPPY_SETUP_CHECKMARK_SRC,
    HAPPY_SETUP_HANDWRITING,
    HAPPY_TRY_FREE_SUBTITLE,
    HAPPY_TRY_FREE_TITLE_LINES,
    HAPPY_WORKS_ANYWHERE_FOOTER_HANDWRITING,
    HAPPY_WORKS_ANYWHERE_TITLE_UNDERLINE_SRC,
} from "./happyAgentPageAssets";
import { happyEnterClass, happyStaggerStyle, useHappySectionReveal } from "./happyLandingMotion";

if (typeof document !== "undefined" && document.getElementById("happpy-root")) {
}

const CHROME_WEBSTORE_URL =
    "https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en";

/** Naukri / Instahyre tiles in “Works anywhere” chip row */
const PLATFORM_LOGO_NAUKRI_SRC =
    "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Naukri_com_1746796515_ijvU9nVTTO.jpeg";
const PLATFORM_LOGO_INSTAHYRE_SRC =
    "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Instahyre_1746795705_E7VOAtDONR.jpeg";

/** “How it works” walkthrough — embed + canonical watch URL */
const HAPPY_HOW_YOUTUBE_VIDEO_ID = "7WA2iReAHC4";
const HAPPY_HOW_YOUTUBE_WATCH_URL = `https://www.youtube.com/watch?v=${HAPPY_HOW_YOUTUBE_VIDEO_ID}`;
const HAPPY_HOW_YOUTUBE_EMBED_URL = `https://www.youtube.com/embed/${HAPPY_HOW_YOUTUBE_VIDEO_ID}?rel=0`;

/** Landing page Vimeo demo (same ID as embed `src`) */
const HAPPY_AGENT_DEMO_VIMEO_VIDEO_ID = "1135057471";

/** Right “live preview” column — one pane per journey step (synced with HappyAgentRunJourney) */
const HAPPY_HIW_PREVIEW_ARIA = [
    "Preview: job you chose",
    "Preview: outreach to the right people",
    "Preview: your pitch and their reply",
];

/** Public landing copy for Happpy Agent */
/** Pixel slack for “fully in viewport” checks on `[data-happy-landing-section]` blocks (subpixel / browser UI) */
const HAPPY_LANDING_BLOCK_EDGE_PX = 3;

const HAPPY_WHO_FOR = [
    "You're an engineer with 3+ years of experience",
    "You have applied to 40+ jobs — heard back from almost none",
    "You refresh Wellfound before you brush your teeth",
    "You know referrals work. You just don't have any.",
    "You want the interview — not more applications, more tabs, more hope",
];

const HAPPY_WHO_NOT = [
    "You have under 2 years of experience",
    "You're not an engineer (no PM, design, sales, marketing, ops)",
    "You already have referrers at your target companies",
    "You're not actively looking",
    "You believe automation has no place in a job search",
];

const HAPPY_HOW_STEPS = [
    {
        num: "01",
        label: "Step 01",
        title: "Paste the job. Upload your resume.",
        desc: "Paste any LinkedIn, Wellfound, Indeed, or career page JD. Drop your resume PDF. Happpy Agent reads both.",
    },
    {
        num: "02",
        label: "Step 02",
        title: "One-time Resume Health Check + Transformation on your resume.",
        desc: "We diagnose the 12 ATS killers and recruiter red flags on your resume, then transform it into an ATS-optimised, recruiter-ready document — built to survive the 10-second scan.",
    },
    {
        num: "03",
        label: "Step 03",
        title: "We find 4 people inside the company.",
        desc: "Recruiters. Peers. Hiring Managers. Personalised outreach drafted from your Gmail and LinkedIn — in your voice.",
    },
    {
        num: "04",
        label: "Step 04",
        title: "Apply to the job.",
        desc: 'Most recruiters ask "did you apply?" before they refer you. We auto-fill the form in one click. Done in under a minute.',
    },
    {
        num: "05",
        label: "Step 05",
        title: "Outreach goes out overnight.",
        desc: "From your Gmail and LinkedIn. We follow up after 2 days if no one replies.",
    },
    {
        num: "06",
        label: "Step 06",
        title: "Go live in under a minute.",
        desc: "Finish account linking with one sign-in (~60 seconds). Review what’s going out, edit anything, send, and track replies. Tip: run on jobs posted in the last 24–48 hours for the fastest responses.",
    },
];

const CONTRAST_WITHOUT = [
    "You apply to 200 jobs",
    "You hear back from ~5",
    "You get 2 interviews (maybe)",
    "Your resume is the same in every application",
    "You cold-message 12 people on LinkedIn. 1 replies.",
    "You're still at your current company 90 days from now",
    "You're exhausted",
];

const CONTRAST_WITH = [
    "You apply to 200 jobs",
    "720 people hear from you at target companies",
    "You get 2x more interviews than doing it alone",
    "Your resume is transformed once — ATS-optimised, recruiter-tested, and reused for every job",
    "Happpy Agent reaches out. Follows up. Tracks everything.",
    "Under a minute to go fully live — a few minutes when you review sends, not 4 hours a day",
    "You're interviewing at Microsoft, Uber, Amazon, Razorpay, and Zeta",
];

const BIG_NAME_COMPANY_COUNT = 60;

/** Razorpay plan ids for `/api/talent/tailor/order/create` — Hustle ₹1,499 / Go All In ₹2,999 */
const HAPPY_PRICING_PLAN_HUSTLE = 1;
const HAPPY_PRICING_PLAN_GO_ALL_IN = 3;
const HAPPY_PRICING_PLAN_TRY_IT = 4;

/** Mixpanel `cta_source` strings preserved byte-identical with the legacy
 *  `.happy-pricing-html-*` cards so funnel reports stay continuous after the
 *  pricing-section re-skin. */
const HAPPY_PRICING_CTA_SOURCE_BY_PLAN_ID = {
    [HAPPY_PRICING_PLAN_TRY_IT]: "pricing_try_it",
    [HAPPY_PRICING_PLAN_HUSTLE]: "pricing_hustle",
    [HAPPY_PRICING_PLAN_GO_ALL_IN]: "pricing_go_all_in",
};

function loadRazorpayScript(src) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function HappyMatIcon({ name, className = "" }) {
    return (
        <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
            {name}
        </span>
    );
}

/** `?show_jobs_listing=true` renders the standalone job board inside the landing page. */
const JOBS_LISTING_QUERY_PARAM = "show_jobs_listing";

/**
 * Own chunk — nobody without the query param pays for the board's bundle.
 * `next/dynamic` replaces @loadable/component here; ssr is off because the
 * board is only ever reached behind a client-side query param.
 */
const JobsBoard = dynamic(() => import("../jobs-board/JobsBoard"), {
    ssr: false,
    loading: () => <WaveLoader />,
});

/** Session: job URL already auto-submitted via ?reference= background POST (avoid duplicate on refresh). */
const SESSION_KEY_REF_BATCH_BG_OK = "happy_agent_ref_batch_bg_ok";

function getRefBatchBgOkSet() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY_REF_BATCH_BG_OK);
        const o = raw ? JSON.parse(raw) : {};
        return o && typeof o === "object" ? o : {};
    } catch {
        return {};
    }
}

function markRefBatchBgOk(jobUrl) {
    try {
        const o = getRefBatchBgOkSet();
        o[jobUrl] = 1;
        sessionStorage.setItem(SESSION_KEY_REF_BATCH_BG_OK, JSON.stringify(o));
    } catch {
        /* ignore */
    }
}

function isRefBatchBgOk(jobUrl) {
    return Boolean(jobUrl && getRefBatchBgOkSet()[jobUrl]);
}

function looksLikeHttpUrl(value) {
    try {
        const u = new URL((value || "").trim());
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

/** Loads `https://player.vimeo.com/api/player.js` and resolves when `window.Vimeo.Player` exists */
function loadVimeoPlayerApi() {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("no window"));
    }
    if (window.Vimeo?.Player) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        const finish = () => {
            if (window.Vimeo?.Player) {
                resolve();
            } else {
                reject(new Error("Vimeo.Player missing"));
            }
        };
        const existing = document.querySelector('script[src*="player.vimeo.com/api/player.js"]');
        if (existing) {
            if (window.Vimeo?.Player) {
                resolve();
                return;
            }
            existing.addEventListener("load", finish);
            existing.addEventListener("error", () => reject(new Error("Vimeo script error")));
            return;
        }
        const script = document.createElement("script");
        script.src = "https://player.vimeo.com/api/player.js";
        script.async = true;
        script.onload = finish;
        script.onerror = () => reject(new Error("Vimeo script load failed"));
        document.head.appendChild(script);
    });
}

function decodeReferenceQueryParam(raw) {
    if (raw == null) return "";
    const s = String(raw).trim();
    if (!s) return "";
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
}

function persistJobAgentDisplayUrlsOnly(urls) {
    const cleaned = urls.map((s) => (s || "").trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    try {
        sessionStorage.setItem(SESSION_KEY_JOB_AGENT_DISPLAY_JOB_URLS, JSON.stringify(cleaned));
    } catch {
        /* ignore */
    }
}

function isAlreadyQueuedDashboardError(message) {
    if (!message || typeof message !== "string") return false;
    const t = message.toLowerCase();
    if (t.includes("already have job links")) return true;
    if (t.includes("already") && t.includes("job link") && (t.includes("dashboard") || t.includes("finish setup"))) return true;
    return false;
}

function shuffleArray(items) {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function CheckPolylineIcon({ className }) {
    return (
        <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function XIcon({ className }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}


function ArrowForwardIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.58 10.94L13.58 3.93996C13.1995 3.56126 12.6459 3.41431 12.1277 3.55447C11.6095 3.69463 11.2054 4.10061 11.0677 4.61947C10.9299 5.13834 11.0795 5.69126 11.46 6.06996L15.89 10.49H4.47998C3.65155 10.49 2.97998 11.1615 2.97998 11.99C2.97998 12.8184 3.65155 13.49 4.47998 13.49H15.89L11.46 17.91C11.0315 18.3389 10.9035 18.9836 11.1354 19.5438C11.3673 20.104 11.9137 20.4694 12.52 20.47C12.9225 20.464 13.3053 20.2943 13.58 20L20.58 13C21.1649 12.4143 21.1649 11.4656 20.58 10.88V10.94Z" fill="white" />
        </svg>
    );
}

/** Mid-page Get Started CTA — same pill as hero; shown when signup/onboarding is still needed. */
function HappyGetStartedSectionCta({ onClick, align = "center", label = "Get Started Now", howItWorks = false }) {
    return (
        <div
            className={
                align === "start"
                    ? "happy-agent-section-cta happy-agent-section-cta--align-start"
                    : "happy-agent-section-cta"
            }
        >
            <button
                type="button"
                className={`happy-agent-hero-mesh__pill happy-agent-hero-mesh__pill--primary happy-agent-section-cta__pill ${howItWorks ? "how-it-works" : ""}`}
                onClick={onClick}
            >
                <span className="happy-agent-hero-mesh__pill-label">{label}</span>
                <ArrowForwardIcon />
            </button>
        </div>
    );
}

function HeroPlayIcon({ className }) {
    return (
        <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
        </svg>
    );
}

/** Filled check-circle matching pricing.html Material Symbol (primary-container) */
function PricingCheckIcon({ className }) {
    return (
        <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="12" cy="12" r="12" fill="#ffc700" />
            <path d="M9 12.5l2 2 4-4" stroke="#6e5400" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/**
 * One row of the "Live results" interview-wall marquee. `items` is the row's company list
 * duplicated end-to-end (`[...row, ...row]`) so the CSS loop has no seam.
 * The second half is hidden from assistive tech / keyboard focus since it's a visual duplicate.
 *
 * Loop distance is measured once in JS (px) — animation starts only after measure is stable
 * so `--happy-marquee-shift` never changes mid-keyframes (that caused visible stutter).
 */
function HappyLiveResultsMarqueeRow({ items, reverse = false, onTrialCtaClick }) {
    const halfLen = items.length / 2;
    const trackRef = useRef(null);
    const shiftPxRef = useRef(0);
    const [trackReady, setTrackReady] = useState(false);

    useLayoutEffect(() => {
        const track = trackRef.current;
        if (!track || halfLen <= 0) return undefined;

        let cancelled = false;
        setTrackReady(false);
        shiftPxRef.current = 0;

        const applyShift = (rawShift) => {
            if (cancelled || rawShift <= 0) return;
            const shift = Math.round(rawShift * 100) / 100;
            if (shiftPxRef.current > 0 && Math.abs(shift - shiftPxRef.current) < 1) return;
            shiftPxRef.current = shift;
            track.style.setProperty("--happy-marquee-shift", `${shift}px`);
            setTrackReady(true);
        };

        const measure = () => {
            const children = track.children;
            const first = children[0];
            const firstOfDuplicateHalf = children[halfLen];
            if (!first || !firstOfDuplicateHalf) return;
            applyShift(firstOfDuplicateHalf.getBoundingClientRect().left - first.getBoundingClientRect().left);
        };

        const scheduleMeasure = () => {
            window.requestAnimationFrame(measure);
        };

        scheduleMeasure();

        const images = track.querySelectorAll("img");
        images.forEach((img) => {
            if (!img.complete) {
                img.addEventListener("load", scheduleMeasure, { once: true });
                img.addEventListener("error", scheduleMeasure, { once: true });
            }
        });

        const onResize = () => scheduleMeasure();
        window.addEventListener("resize", onResize);

        return () => {
            cancelled = true;
            window.removeEventListener("resize", onResize);
        };
    }, [halfLen, items]);

    return (
        <div
            className={`happy-agent-live-results__marquee-row${reverse ? " happy-agent-live-results__marquee-row--reverse" : ""}`}
        >
            <div
                className={`happy-agent-live-results__marquee-track${trackReady ? " happy-agent-live-results__marquee-track--ready" : ""}`}
                ref={trackRef}
            >
                {items.map((company, idx) => {
                    const isDuplicate = idx >= halfLen;
                    return (
                        <a
                            key={`${company.logo}-${company.name}-${idx}`}
                            href="#happy-agent-setup"
                            onClick={onTrialCtaClick}
                            data-cta-source="interview_wall_logo"
                            className="happy-agent-live-results__pill"
                            title={company.name}
                            tabIndex={isDuplicate ? -1 : 0}
                            aria-hidden={isDuplicate || undefined}
                        >
                            <span className="happy-agent-live-results__pill-logo">
                                <img
                                    src={REFERRAL_LOGO_BASE + company.logo}
                                    alt=""
                                    loading="eager"
                                    decoding="async"
                                />
                            </span>
                            <span className="happy-agent-live-results__pill-label">
                                {company.name.length > 22 ? `${company.name.slice(0, 20)}…` : company.name}
                            </span>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

function HappyJobAgentContent({
    publicSignupMode = false,
    onOpenAuthDrawer = null,
    authDrawerOpen = false,
} = {}) {
    const router = useRouter();
    const dispatch = useDispatch();
    const pathname = usePathname();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const profileData = useSelector((state) => state.profile?.profileData) || {};
    const [gmailAccountsConnected, setGmailAccountsConnected] = useState(false);
    /** True after `OutreachConfigureAccountsOnly` has reported via `onAccountsStepChange` (GET outreach step finished). */
    const [accountsStepChangeReceivedFromChild, setAccountsStepChangeReceivedFromChild] = useState(false);

    const searchParams = useSearchParams();
    /** Serialised query string, used where the ATS read `location.search`. */
    const search = searchParams.toString();
    /**
     * react-router's useSearchParams returned a [params, setParams] pair.
     * Next's is read-only, so writes rebuild the URL and go through the router
     * instead. The signature is unchanged, so call sites read the same.
     */
    const setSearchParams = useCallback(
        (next, { replace = false } = {}) => {
            const qs = next.toString();
            const url = qs ? `${pathname}?${qs}` : pathname;
            if (replace) router.replace(url);
            else router.push(url);
        },
        [router, pathname]
    );
    const referralLandingTrackedRef = useRef(false);

    /**
     * Read once on mount: the listing's filter bar owns the query string while it is open, so the
     * section must not depend on the flag still being there on later renders.
     * The jobs API is talent-authenticated, so the public variant of this landing never shows it.
     */
    const [jobsListingRequested] = useState(() => searchParams.get(JOBS_LISTING_QUERY_PARAM) === "true");
    const showJobsListing = jobsListingRequested && isAuthenticated && !publicSignupMode;

    /** Mixpanel funnel: authenticated landing on `/talent/referral-ai-agent` (once per mount). */
    useEffect(() => {
        if (publicSignupMode) return;
        if (!isAuthenticated) return;
        if (pathname !== REFERRAL_AI_AGENT_PATH) return;
        if (referralLandingTrackedRef.current) return;
        referralLandingTrackedRef.current = true;
        const params = new URLSearchParams(search);
        trackHappyAgentMixpanel("happy_agent_referral_landing_viewed", {
            from_public_signup: isPublicSignupPending(),
            connect_your_accounts: !!params.get(ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS),
            has_reference_param: !!params.get("reference"),
            entry_source: params.get("src") || params.get("entry_source") || "direct",
        }).catch(() => { });
    }, [publicSignupMode, isAuthenticated, pathname, search]);

    useEffect(() => {
        if (publicSignupMode) return;
        if (!accountsStepChangeReceivedFromChild) return;
        if (gmailAccountsConnected) return;
        const params = new URLSearchParams(search);
        trackHappyAgentMixpanel("happy_agent_page_loaded", {
            is_authenticated: !!isAuthenticated,
            has_reference_param: !!params.get("reference"),
            entry_source: params.get("src") || params.get("entry_source") || "direct",
            pathname: typeof window !== "undefined" ? window.location.pathname : "",
        }).catch(() => { });
    }, [publicSignupMode, isAuthenticated, search, gmailAccountsConnected, accountsStepChangeReceivedFromChild]);

    /** First name for hero copy — trimmed + sentence-case first letter for nicer personalization */
    const displayFirstName = useMemo(() => {
        const raw = typeof user?.name === "string" ? user.name.trim() : "";
        if (!raw) return "";
        const first = raw.split(/\s+/).filter(Boolean)[0] || "";
        if (!first) return "";
        return first.charAt(0).toUpperCase() + first.slice(1);
    }, [user?.name]);

    /** Active target role — user.userdata.job_title first, then profile fields, else Software Engineer */
    const activeTargetJobTitle = useMemo(() => {
        const u = user || {};
        const userdata = u.userdata ?? u.userData;
        const fromUserdata =
            userdata && typeof userdata === "object" && typeof userdata.job_title === "string"
                ? userdata.job_title.trim()
                : "";
        if (fromUserdata) return fromUserdata;
        const fallback =
            (typeof u.designation === "string" && u.designation.trim()) ||
            (typeof profileData?.designation === "string" && profileData.designation.trim()) ||
            (typeof u.job_title === "string" && u.job_title.trim()) ||
            "";
        return fallback || "Software Engineer";
    }, [user, profileData?.designation]);

    /** Syncs with HappyAgentRunJourney: 0 active target, 1 team grid only, 2 HM reply card */
    const [agentRunStep, setAgentRunStep] = useState(0);

    /** Right preview: stepped animation vs all blocks visible (steps 1–3) */
    const [hiwShowFullWorkflow, setHiwShowFullWorkflow] = useState(false);

    /** Live results scoreboard — random start animates to 255 when hero reveals */
    const [liveResultsInterviewStart] = useState(() => randomScoreboardStart(1, 20));

    const { ref: hiwRevealRef, revealed: hiwRevealed } = useHappySectionReveal({ threshold: 0.12 });
    const { ref: worksAnywhereRevealRef, revealed: worksAnywhereRevealed } = useHappySectionReveal();
    const { ref: manualVsRevealRef, revealed: manualVsRevealed } = useHappySectionReveal({ threshold: 0.1 });
    const { ref: privacyRevealRef, revealed: privacyRevealed } = useHappySectionReveal();
    const { ref: kineticRevealRef, revealed: kineticRevealed } = useHappySectionReveal();
    const { ref: pricingRevealRef, revealed: pricingRevealed } = useHappySectionReveal({ threshold: 0.08 });

    const referenceParamDecoded = useMemo(() => {
        let raw = null;
        try {
            raw = new URLSearchParams(search).get("reference");
        } catch {
            /* ignore */
        }
        if ((raw == null || String(raw).trim() === "") && typeof window !== "undefined") {
            try {
                raw = new URL(window.location.href).searchParams.get("reference");
            } catch {
                /* ignore */
            }
        }
        return decodeReferenceQueryParam(raw);
    }, [search]);

    const entrySourceFromQuery = useMemo(() => {
        let raw = null;
        try {
            const sp = new URLSearchParams(search);
            raw = sp.get("src") ?? sp.get("entry_source");
        } catch {
            /* ignore */
        }
        if ((raw == null || String(raw).trim() === "") && typeof window !== "undefined") {
            try {
                const sp = new URL(window.location.href).searchParams;
                raw = sp.get("src") ?? sp.get("entry_source");
            } catch {
                /* ignore */
            }
        }
        const s = raw != null ? String(raw).trim() : "";
        if (!s) return "";
        return s.length > 255 ? s.slice(0, 255) : s;
    }, [search]);

    const buildReferralJobLinksBatchPayload = useCallback(
        (urls) => {
            const cleaned = urls.map((s) => (s || "").trim()).filter(Boolean);
            const payload = { urls: cleaned, client_device: getClientDeviceMobileOrDesktop() };
            if (entrySourceFromQuery) payload.entry_source = entrySourceFromQuery;
            return payload;
        },
        [entrySourceFromQuery]
    );

    /** Token-backed session can have `user` not yet merged in Redux; POST_API uses Bearer from localStorage. */
    const loggedInReady = Boolean(isAuthenticated);
    const outreachAccountConnected = Boolean(user?.outreach?.account_connected);
    /** Limited cohort: free trial runs until first interview (backend: `conversion_source = interview_trial`). */
    const outreachFromUser = (user?.userdata ?? user?.userData)?.outreach ?? user?.outreach;
    const availableForInterviewTrial = Boolean(outreachFromUser?.avaiable_for_interview_trial);
    const trialPromoBadge = availableForInterviewTrial
        ? "Try Free Until Your First Interview"
        : "Try Free Until You Hear “Yes”";
    const trialChipLabel = availableForInterviewTrial
        ? "Free until your first interview"
        : "Free until you hear yes";

    /** Logged-in `/talent/referral-ai-agent?reference=<job url>`: queue in background. Optional `src` / `entry_source`. */
    useEffect(() => {
        if (!loggedInReady) return;
        if (outreachAccountConnected) return;
        const url = referenceParamDecoded.trim();
        if (!url || !looksLikeHttpUrl(url)) return;
        if (isRefBatchBgOk(url)) return;

        (async () => {
            try {
                const res = await POST_API(
                    API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH,
                    buildReferralJobLinksBatchPayload([url])
                );
                const body = res?.data;
                if (body?.status === "success") {
                    persistJobAgentDisplayUrlsOnly([url]);
                    markRefBatchBgOk(url);
                    return;
                }
                const msg = body?.message || "";
                if (isAlreadyQueuedDashboardError(msg)) {
                    markRefBatchBgOk(url);
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err?.message || "";
                if (isAlreadyQueuedDashboardError(msg)) {
                    markRefBatchBgOk(url);
                }
            }
        })();
    }, [loggedInReady, outreachAccountConnected, referenceParamDecoded, buildReferralJobLinksBatchPayload]);

    /**
     * No valid `?reference=` job URL: still POST so `OnboardJobs::syncForAuthenticatedTalent` runs
     * (talent_id + email on row; fixes empty `jobs` until user adds links). Runs each navigation to this page.
     */
    useEffect(() => {
        if (!loggedInReady) return;
        if (outreachAccountConnected) return;
        const ref = referenceParamDecoded.trim();
        if (ref && looksLikeHttpUrl(ref)) return;

        (async () => {
            try {
                await POST_API(
                    API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH,
                    buildReferralJobLinksBatchPayload([])
                );
            } catch {
                /* non-blocking */
            }
        })();
    }, [loggedInReady, outreachAccountConnected, referenceParamDecoded, buildReferralJobLinksBatchPayload, pathname, search]);

    useLayoutEffect(() => {
        const namePart = displayFirstName ? `${displayFirstName} · ` : "";
        document.title = `${process.env.NEXT_PUBLIC_APP_NAME} | ${namePart}Happpy Agent`;
        // const el = document.getElementById("happyJobAgentPublic");
        // if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        window.scrollTo(0, 0);
    }, [displayFirstName]);

    const [faqOpenIndex, setFaqOpenIndex] = useState(null);
    const [howVideoOpen, setHowVideoOpen] = useState(false);
    const [renewLoading, setRenewLoading] = useState(false);
    const [paymentLoader, setPaymentLoader] = useState(false);
    const [demoModalOpen, setDemoModalOpen] = useState(false);
    const [agentOnboardingOpen, setAgentOnboardingOpen] = useState(false);

    const handleAccountsStepChange = useCallback(({ gmailConnected }) => {
        setGmailAccountsConnected(!!gmailConnected);
        setAccountsStepChangeReceivedFromChild(true);
    }, []);

    const trackOnboardingPopOpened = useCallback((section) => {
        trackOutreachJourney(OUTREACH_JOURNEY_KEY_ONBOARDING_POP_OPENED).catch(() => { });
        if (section) {
            trackOutreachJourney(buildOnbPopOpenedSectionKey(section)).catch(() => { });
        }
    }, []);

    /** Hero / pricing / logo-wall CTAs that used to scroll to “START HERE” now open the activation modal. */
    const scrollToAccountSetup = useCallback((section = null) => {
        trackOnboardingPopOpened(section);
        setAgentOnboardingOpen(true);
    }, [trackOnboardingPopOpened]);

    /** New right-side drawer onboarding flow (replaces hero "Get Started for FREE" modal). */
    const openAgentOnboarding = useCallback((section = null) => {
        trackOnboardingPopOpened(section);
        setAgentOnboardingOpen(true);
    }, [trackOnboardingPopOpened]);

    /** Public-signup handoff: `?connect-your-accounts=true` auto-opens the drawer. */
    useEffect(() => {
        if (searchParams.get(ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS) !== "true") return;
        const section = getPublicOnbSection();
        clearPublicOnbSection();
        openAgentOnboarding(section);
    }, [searchParams, openAgentOnboarding]);

    const closeAgentOnboarding = useCallback(() => {
        setAgentOnboardingOpen(false);
    }, []);

    /** After onboarding exits: dashboard redirect; template drawer opens there when onboarding completed. */
    const handleAgentOnboardingExit = useCallback(
        ({ wouldRedirectToDashboard, completed }) => {
            if (wouldRedirectToDashboard) {
                router.replace("/talent/job-agent");
                return;
            }

            if (!completed) {
                clearPublicSignupHandoff();
            }
        },
        [router]
    );

    const openPublicAuth = useCallback(
        (e, section = null) => {
            e?.preventDefault?.();
            if (publicSignupMode) {
                if (section) {
                    setPublicOnbSection(section);
                }
            }
            if (typeof onOpenAuthDrawer === "function") {
                onOpenAuthDrawer();
            }
        },
        [onOpenAuthDrawer, publicSignupMode]
    );

    /** Pricing / final CTA / logo-wall links → open “Setup Here” modal */
    const onTrialCtaClick = useCallback(
        (e) => {
            e.preventDefault();
            const ctaSource = e?.currentTarget?.dataset?.ctaSource || "pricing_trial";
            const section = ctaSource === "interview_wall_logo" ? "interview_wall" : "pricing_trial";
            trackHappyAgentMixpanel("happy_agent_trial_section_scroll_to_setup_clicked", {
                placement: ctaSource,
            }).catch(() => { });
            if (publicSignupMode) {
                openPublicAuth(e, section);
                return;
            }
            scrollToAccountSetup(section);
        },
        [scrollToAccountSetup, publicSignupMode, openPublicAuth]
    );

    const handlePricingPayment = useCallback(
        async (planId, ctaSource) => {
            if (renewLoading) return;

            trackHappyAgentMixpanel("happy_agent_pricing_pay_now_clicked", {
                plan_id: planId,
                cta_source: ctaSource,
            }).catch(() => { });

            setRenewLoading(planId);
            dispatch({ type: SET_LOADER, payload: true });
            try {
                const razorpaySDK = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");
                if (!razorpaySDK) {
                    toast.error("Razorpay SDK failed to load. Are you online?");
                    return;
                }

                const result = await tailorResumeCreateOrder({ plan_id: planId })(dispatch)
                    .then((res) => res?.data?.data)
                    .catch((err) => {
                        const msg = err?.response?.data?.message || "Error while creating order";
                        toast.error(msg, { duration: 5000 });
                        return null;
                    });

                if (!result) return;

                const { id: order_id, amount, currency } = result;

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: amount.toString(),
                    currency,
                    name: result?.notes?.name,
                    order_id,
                    handler: async function (response) {
                        const data = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            order_id,
                            payment_completed: true,
                        };

                        try {
                            setPaymentLoader(true);
                            const captureResponse = await tailorResumeCaptureOrder(data, false)(dispatch);
                            if (captureResponse?.status === 200) {
                                trackTailorPaymentSuccess({ plan_id: planId });
                                dispatch({
                                    type: UPDATE_CURRENT_USER,
                                    payload: { resume_tailored: captureResponse?.data?.data },
                                });
                                toast.success("Payment successful", { duration: 5000 });
                                scrollToAccountSetup("payment_success");
                            }
                        } catch (err) {
                            const errorMessage =
                                err?.response?.data?.message || "Something went wrong while capturing order";
                            toast.error(errorMessage, { duration: 5000 });
                        } finally {
                            setPaymentLoader(false);
                        }
                    },
                    modal: {
                        escape: false,
                        ondismiss: async function () {
                            try {
                                const cancelResponse = await tailorResumeCaptureOrder({
                                    order_id,
                                    payment_completed: false,
                                })(dispatch);
                                if (cancelResponse?.status === 200) {
                                    toast.error("Payment cancelled", { duration: 5000 });
                                }
                            } catch (err) {
                                const errorMessage = err?.response?.data?.message || "Something went wrong.";
                                toast.error(errorMessage);
                            }
                        },
                    },
                    prefill: {
                        name: result?.notes?.name,
                        email: result?.notes?.email,
                    },
                    theme: { color: "#0D94FB" },
                    config: {
                        display: {
                            preferences: { show_default_blocks: true },
                        },
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } catch (error) {
                console.error(error);
                toast.error("An error occurred while processing the payment.", { duration: 5000 });
            } finally {
                setRenewLoading(false);
                dispatch({ type: SET_LOADER, payload: false });
            }
        },
        [dispatch, renewLoading, scrollToAccountSetup]
    );

    const scrollToDemo = () => {
        trackHappyAgentMixpanel("happy_agent_hero_watch_demo_clicked", {}).catch(() => { });
        setDemoModalOpen(true);
    };

    const scrollToLandingSection = useCallback((target) => {
        if (!target || typeof window === "undefined") {
            return;
        }
        const root = landingRootRef.current;
        const el =
            document.getElementById(target)
            || root?.querySelector(`[data-happy-landing-section="${target}"]`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    const closeDemoModal = useCallback(() => {
        trackHappyAgentMixpanel("happy_agent_demo_modal_closed", {}).catch(() => { });
        setDemoModalOpen(false);
    }, []);

    const landingRootRef = useRef(null);
    const landingBlockViewedRef = useRef(new Set());

    const demoVimeoIframeRef = useRef(null);
    const demoVideoPlayLoggedRef = useRef(false);
    const demoVideoMilestonesSentRef = useRef(new Set());

    /**
     * “Fully viewed” for any element with `data-happy-landing-section` (e.g. `<section>`, `<div>`):
     * (1) block height ≤ viewport → entire block fits inside viewport at once.
     * (2) block taller than viewport → user has scrolled so both top and bottom edges
     *     were inside the viewport at least once (full vertical extent covered).
     */
    useEffect(() => {
        const root = landingRootRef.current;
        if (!root || typeof window === "undefined") {
            return undefined;
        }
        const blockNodes = root.querySelectorAll("[data-happy-landing-section]");
        if (!blockNodes.length) {
            return undefined;
        }
        const landingBlocks = Array.from(blockNodes);

        const scrollProgressByKey = new Map();

        const markViewed = (blockEl) => {
            const key = blockEl.getAttribute("data-happy-landing-section");
            if (!key || landingBlockViewedRef.current.has(key)) {
                return;
            }
            landingBlockViewedRef.current.add(key);
            const domId = blockEl.id ? String(blockEl.id) : "";
            trackHappyAgentMixpanel("happy_agent_landing_section_viewed", {
                section_key: key,
                ...(domId ? { dom_id: domId } : {}),
            }).catch(() => { });
        };

        const edge = HAPPY_LANDING_BLOCK_EDGE_PX;

        const update = () => {
            const vh = window.innerHeight;
            for (const el of landingBlocks) {
                const key = el.getAttribute("data-happy-landing-section");
                if (!key || landingBlockViewedRef.current.has(key)) {
                    continue;
                }
                const rect = el.getBoundingClientRect();
                const h = rect.height;
                if (h <= 0) {
                    continue;
                }

                if (h <= vh + edge) {
                    const fullyOnScreen = rect.top >= -edge && rect.bottom <= vh + edge;
                    if (fullyOnScreen) {
                        markViewed(el);
                    }
                    continue;
                }

                let st = scrollProgressByKey.get(key);
                if (!st) {
                    st = { sawTop: false, sawBottom: false };
                    scrollProgressByKey.set(key, st);
                }
                st.sawTop = st.sawTop || (rect.top >= -edge && rect.top < vh - edge);
                st.sawBottom = st.sawBottom || (rect.bottom > edge && rect.bottom <= vh + edge);
                if (st.sawTop && st.sawBottom) {
                    markViewed(el);
                }
            }
        };

        let rafScheduled = false;
        const scheduleUpdate = () => {
            if (rafScheduled) {
                return;
            }
            rafScheduled = true;
            window.requestAnimationFrame(() => {
                rafScheduled = false;
                update();
            });
        };

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate, { passive: true });
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(scheduleUpdate) : null;
        if (ro) {
            ro.observe(root);
            landingBlocks.forEach((el) => ro.observe(el));
        }
        scheduleUpdate();

        return () => {
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            if (ro) {
                ro.disconnect();
            }
        };
    }, []);

    /** Vimeo demo: play start, 25/50/75/100% milestones, completion — via player.vimeo.com API */
    useEffect(() => {
        let cancelled = false;
        let player = null;

        const percentFromFraction = (fraction) =>
            Math.min(100, Math.max(0, Math.round(Number(fraction) * 100)));

        const sendEngagement = (payload) => {
            trackHappyAgentMixpanel("happy_agent_demo_video_engagement", {
                vimeo_video_id: HAPPY_AGENT_DEMO_VIMEO_VIDEO_ID,
                ...payload,
            }).catch(() => { });
        };

        const init = async () => {
            const iframe = demoVimeoIframeRef.current;
            if (!iframe) {
                return;
            }
            try {
                await loadVimeoPlayerApi();
            } catch {
                return;
            }
            if (cancelled || !demoVimeoIframeRef.current) {
                return;
            }
            const VimeoGlobal = window.Vimeo;
            if (!VimeoGlobal?.Player) {
                return;
            }
            try {
                player = new VimeoGlobal.Player(iframe);
            } catch {
                return;
            }

            let durationSeconds = 0;
            try {
                durationSeconds = await player.getDuration();
            } catch {
                durationSeconds = 0;
            }
            if (cancelled) {
                try {
                    await player.destroy();
                } catch {
                    /* ignore */
                }
                return;
            }

            const roundSec = (s) => Math.round(Number(s) * 100) / 100;

            player.on("play", () => {
                if (demoVideoPlayLoggedRef.current) {
                    return;
                }
                demoVideoPlayLoggedRef.current = true;
                player
                    .getCurrentTime()
                    .then((seconds) => {
                        const pct =
                            durationSeconds > 0 ? percentFromFraction(seconds / durationSeconds) : null;
                        sendEngagement({
                            action: "play_started",
                            current_second: roundSec(seconds),
                            percent_complete: pct,
                            duration_seconds: durationSeconds ? roundSec(durationSeconds) : null,
                        });
                    })
                    .catch(() => {
                        sendEngagement({
                            action: "play_started",
                            current_second: 0,
                            percent_complete: 0,
                            duration_seconds: durationSeconds ? roundSec(durationSeconds) : null,
                        });
                    });
            });

            player.on("timeupdate", (data) => {
                const seconds = typeof data?.seconds === "number" ? data.seconds : 0;
                const fraction =
                    typeof data?.percent === "number"
                        ? data.percent
                        : durationSeconds > 0
                            ? seconds / durationSeconds
                            : 0;
                const percent = percentFromFraction(fraction);
                for (const m of [25, 50, 75, 100]) {
                    if (percent >= m && !demoVideoMilestonesSentRef.current.has(m)) {
                        demoVideoMilestonesSentRef.current.add(m);
                        sendEngagement({
                            action: "milestone",
                            milestone_percent: m,
                            current_second: roundSec(seconds),
                            percent_complete: percent,
                            duration_seconds: durationSeconds ? roundSec(durationSeconds) : null,
                        });
                    }
                }
            });

            player.on("ended", () => {
                demoVideoMilestonesSentRef.current.add(100);
                sendEngagement({
                    action: "ended",
                    current_second: durationSeconds ? roundSec(durationSeconds) : null,
                    percent_complete: 100,
                    duration_seconds: durationSeconds ? roundSec(durationSeconds) : null,
                });
            });
        };

        init();

        return () => {
            cancelled = true;
            if (player) {
                try {
                    const d = player.destroy();
                    if (d && typeof d.catch === "function") {
                        d.catch(() => { });
                    }
                } catch {
                    /* ignore */
                }
            }
        };
    }, []);

    const [bigDisplayCompanies, setBigDisplayCompanies] = useState([]);

    /** Preload hero LCP image (covers client-side navigations; blade preloads first paint). */
    useLayoutEffect(() => {
        if (typeof document === "undefined") return undefined;
        if (document.getElementById(HAPPY_HERO_PRELOAD_ID)) return undefined;

        const link = document.createElement("link");
        link.id = HAPPY_HERO_PRELOAD_ID;
        link.rel = "preload";
        link.as = "image";
        link.type = "image/webp";
        link.imageSizes = HAPPY_HERO_BG_SIZES;
        link.imageSrcset = HAPPY_HERO_BG_WEBP_SRCSET;
        link.setAttribute("fetchpriority", "high");
        document.head.appendChild(link);

        return () => {
            link.remove();
        };
    }, []);

    /** Hero entrance animation runs after the HTML #initial-loader hides (see talent/index.blade.php). */
    const [heroReveal, setHeroReveal] = useState(() => {
        if (typeof window === "undefined") return false;
        try {
            return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (heroReveal) return;

        let cancelled = false;
        let rafId;

        const reveal = () => {
            if (!cancelled) setHeroReveal(true);
        };

        const waitForInitialLoader = () => {
            if (cancelled) return;
            const loader = document.getElementById("initial-loader");
            if (!loader) {
                reveal();
                return;
            }
            if (loader.classList.contains("fade-out")) {
                reveal();
                return;
            }
            rafId = window.requestAnimationFrame(waitForInitialLoader);
        };

        rafId = window.requestAnimationFrame(() => window.requestAnimationFrame(waitForInitialLoader));

        const fallbackId = window.setTimeout(reveal, 1200);

        return () => {
            cancelled = true;
            if (rafId != null) window.cancelAnimationFrame(rafId);
            window.clearTimeout(fallbackId);
        };
    }, [heroReveal]);

    useEffect(() => {
        // paid and not connected to gmail
        if (user?.outreach?.is_outreach_paid && outreachAccountConnected) {
            router.push('/talent/job-agent');
            return;
        }
    }, []);

    useEffect(() => {
        const groups = getReferralCompaniesGrouped();
        const seen = new Set();
        const uniqueCompanies = [];
        for (const g of groups) {
            for (const c of g.companies || []) {
                const name = (c.name || "").trim();
                const logo = (c.logo || "").trim();
                if (name && logo && !seen.has(name)) {
                    seen.add(name);
                    uniqueCompanies.push({ name, logo });
                }
            }
        }
        setBigDisplayCompanies(shuffleArray(uniqueCompanies).slice(0, BIG_NAME_COMPANY_COUNT));
    }, []);

    /** Hero live-results marquee — single full-bleed row, duplicated for seamless loop */
    const liveResultsMarqueeHero = useMemo(() => {
        if (bigDisplayCompanies.length === 0) return [];
        return [...bigDisplayCompanies, ...bigDisplayCompanies];
    }, [bigDisplayCompanies]);

    useEffect(() => {
        if (!howVideoOpen) return;
        const onEsc = (e) => {
            if (e.key === "Escape") setHowVideoOpen(false);
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [howVideoOpen]);

    /** LinkedIn “in” square — brand blue */
    /** LinkedIn “in” square — brand blue */
    function PlatformLogoLinkedIn({ className }) {
        return (
            <svg className={className} width="28" height="28" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <path
                    fill="#0A66C2"
                    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
            </svg>
        );
    }

    /** Indeed-style mark (blue tile + “i”) — not an official asset; recognizable shorthand */
    function PlatformLogoIndeed({ className }) {
        return (
            <svg className={className} width="28" height="28" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="4" fill="#2164f3" />
                <circle cx="12" cy="8" r="2.25" fill="#fff" />
                <rect x="10" y="11.5" width="4" height="8.5" rx="1.5" fill="#fff" />
            </svg>
        );
    }

    /** Wellfound — compact spark on brand rose (approximation for small UI) */
    function PlatformLogoWellfound({ className }) {
        return (
            <svg className={className} width="28" height="28" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="5" fill="#FF4F64" />
                <path
                    fill="#fff"
                    d="M12 6l1.9 3.85 4.25.62-3.08 3 .74 4.28L12 14.9l-3.81 2.03.74-4.28-3.08-3 4.25-.62L12 6z"
                />
            </svg>
        );
    }

    /** Any ATS / company careers — globe */
    function PlatformLogoCareerPage({ className }) {
        return (
            <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9.25" stroke="#384ad7" strokeWidth="1.75" />
                <ellipse cx="12" cy="12" rx="4.25" ry="9.25" stroke="#384ad7" strokeWidth="1.75" />
                <path d="M3 12h18" stroke="#384ad7" strokeWidth="1.75" strokeLinecap="round" />
                <path d="M5 7.5c2.2 1 4.4 1.5 7 1.5s4.8-.5 7-1.5M5 16.5c2.2-1 4.4-1.5 7-1.5s4.8.5 7 1.5" stroke="#384ad7" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
        );
    }

    /** Naukri — logo image (`lin_Naukri_com_1746796515_ijvU9nVTTO.jpeg`) */
    function PlatformLogoNaukri({ className }) {
        return (
            <img
                className={`${className || ""} happy-agent-platform-chip-logo--raster`.trim()}
                src={PLATFORM_LOGO_NAUKRI_SRC}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
            />
        );
    }

    /** Greenhouse ATS — small green “g” (shorthand mark, not official logo) */
    function PlatformLogoGreenhouse({ className }) {
        return (
            <svg className={className} width="28" height="28" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <text
                    x="12"
                    y="12"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#24b47e"
                    fontSize="16.5"
                    fontWeight="800"
                    fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
                    letterSpacing="-0.04em"
                >
                    g
                </text>
            </svg>
        );
    }

    /** Instahyre — logo image (`lin_Instahyre_1746795705_E7VOAtDONR.jpeg`) */
    function PlatformLogoInstahyre({ className }) {
        return (
            <img
                className={`${className || ""} happy-agent-platform-chip-logo--raster`.trim()}
                src={PLATFORM_LOGO_INSTAHYRE_SRC}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                decoding="async"
            />
        );
    }

    /** Glassdoor — compact green tile (Figma Section 4 chip) */
    function PlatformLogoGlassdoor({ className }) {
        return (
            <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <rect width="16" height="16" rx="3" fill="#0CAA41" />
                <path fill="#fff" d="M5.25 4.5h5.5v7H5.25z" />
                <path fill="#0CAA41" d="M7.25 4.5h1.5v7h-1.5z" />
            </svg>
        );
    }

    /** Lever ATS — blue circle mark (Figma Section 4 chip) */
    function PlatformLogoLever({ className }) {
        return (
            <svg className={className} width="16" height="16" viewBox="0 0 16 16" aria-hidden xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="8" fill="#1B3A8A" />
                <path
                    fill="#fff"
                    d="M5.2 11.2V4.8h2.45c1.42 0 2.28.74 2.28 1.95 0 1.22-.86 1.97-2.28 1.97H6.55v2.48H5.2zm1.35-3.55h1.05c.72 0 1.08-.34 1.08-.92 0-.57-.36-.9-1.08-.9H6.55v1.82z"
                />
            </svg>
        );
    }

    /** Any career page — blue dot (Figma Section 4) */
    function PlatformLogoCareerPageDot({ className }) {
        return <span className={`happy-agent-works-anywhere__career-dot ${className || ""}`.trim()} aria-hidden />;
    }

    const happyWorksAnywherePlatforms = useMemo(
        () => [
            { key: "linkedin", label: "LinkedIn", Logo: PlatformLogoLinkedIn },
            { key: "indeed", label: "Indeed", Logo: PlatformLogoIndeed },
            { key: "wellfound", label: "Wellfound", Logo: PlatformLogoWellfound },
            { key: "naukri", label: "Naukri", Logo: PlatformLogoNaukri },
            { key: "greenhouse", label: "Greenhouse", Logo: PlatformLogoGreenhouse },
            { key: "glassdoor", label: "Glassdoor", Logo: PlatformLogoGlassdoor },
            { key: "lever", label: "Lever", Logo: PlatformLogoLever },
            { key: "instahyre", label: "Instahyre", Logo: PlatformLogoInstahyre },
            { key: "career-page", label: "Any career page", Logo: PlatformLogoCareerPageDot },
        ],
        []
    );

    const [outreachStepConfig, setOutreachStepConfig] = useState(null);
    const isFreeTrialPlan = outreachStepConfig && Number(outreachStepConfig.plan) === 1;
    const isFreeTrialPlanExpired = isFreeTrialPlan && outreachStepConfig.has_plan_expired;
    /** Mirror of HapppySubscription.js's `trialCtaState` but bound to this page's
     *  `onTrialCtaClick` (opens the AgentOnboarding drawer) instead of
     *  navigating to /talent/job-agent/configure. The free-trial slot in
     *  `<HappyPlanCard />` consumes this `{ label, disabled, onClick }` shape. */
    const landingTrialCtaState = useMemo(() => {
        if (isFreeTrialPlanExpired) {
            return { label: "Trial Ended", disabled: true, onClick: null };
        }
        if (isFreeTrialPlan) {
            return { label: "Current Plan", disabled: true, onClick: null };
        }
        return { label: "Start Free Trial", disabled: false, onClick: onTrialCtaClick };
    }, [isFreeTrialPlan, isFreeTrialPlanExpired, onTrialCtaClick]);

    const publicPricingTrialCta = useMemo(
        () => ({
            label: "Start Free",
            disabled: false,
            onClick: (e) => openPublicAuth(e, "pricing_trial"),
        }),
        [openPublicAuth]
    );

    const publicPricingPaidCta = useCallback(() => {
        openPublicAuth(null, "pricing_plan_card");
    }, [openPublicAuth]);

    const showGetStartedSectionCta = publicSignupMode || !gmailAccountsConnected;
    const onGetStartedSectionCtaClick = useCallback((section) => {
        if (publicSignupMode) {
            openPublicAuth(null, section);
            return;
        }
        openAgentOnboarding(section);
    }, [publicSignupMode, openPublicAuth, openAgentOnboarding]);

    const showStickyMobileCta =
        showGetStartedSectionCta &&
        !agentOnboardingOpen &&
        !authDrawerOpen &&
        !demoModalOpen;

    const fetchOutreachStep = useCallback(() => {
        GET_API(API_GET_OUTREACH_STEP)
            .then((res) => {
                const res_config = res?.data?.data;
                if (res_config && typeof res_config === 'object') {
                    setOutreachStepConfig(res_config);
                }
            });
    }, []);

    useEffect(() => {
        if (publicSignupMode) return;
        fetchOutreachStep();
    }, [fetchOutreachStep, publicSignupMode]);

    /**
     * Jobs board "Ask a referral". The agent sends from the talent's Gmail, so an unconnected talent gets
     * the connect-accounts popup (`AgentOnboarding` opens on its `accounts` step) instead of a job
     * queued against nothing; returning false leaves the button ready to retry after connecting.
     *
     * Connected state comes from either source that reports it — `OutreachConfigureAccountsOnly`
     * further down the page, or the outreach-step fetch above — since whichever resolves first wins.
     */
    const handleJobsBoardRunAgent = useCallback(async (job) => {
        const gmailConnected = gmailAccountsConnected || Boolean(outreachStepConfig?.status?.step1);

        trackHappyAgentMixpanel("happy_agent_jobs_board_run_agent_clicked", {
            hr_number: job?.HR_Number ?? null,
            gmail_connected: gmailConnected,
        }).catch(() => { });

        if (!gmailConnected) {
            openAgentOnboarding("jobs_board_run_agent");
            return false;
        }

        const jobUrl = (job?.detail?.apply_url || "").trim()
            || `${window.location.origin}/talent/job/${job?.HR_Number}`;

        try {
            const res = await POST_API(
                API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH,
                buildReferralJobLinksBatchPayload([jobUrl])
            );
            const body = res?.data;
            if (body?.status === "success") {
                persistJobAgentDisplayUrlsOnly([jobUrl]);
                toast.success("Referral request added — your agent will reach out.");
                return true;
            }
            const message = body?.message || "";
            if (isAlreadyQueuedDashboardError(message)) {
                toast(message);
                return true;
            }
            toast.error(message || "Couldn’t request a referral for this job. Please try again.");
            return false;
        } catch (err) {
            const message = err?.response?.data?.message || "";
            if (isAlreadyQueuedDashboardError(message)) {
                toast(message);
                return true;
            }
            toast.error(message || "Couldn’t request a referral for this job. Please try again.");
            return false;
        }
    }, [gmailAccountsConnected, outreachStepConfig, openAgentOnboarding, buildReferralJobLinksBatchPayload]);

    /** Reserve scrollbar width so react-modal body lock does not shift fixed nav / layout. */
    useEffect(() => {
        const root = document.documentElement;
        root.classList.add("happy-job-agent-landing-active");
        return () => root.classList.remove("happy-job-agent-landing-active");
    }, []);

    const isPublicLandingNav = publicSignupMode && !isAuthenticated;

    if (paymentLoader) {
        return <TailorPaymentLoader />;
    }

    return (
        <div
            className={`outreach-container happy-job-agent-landing${showStickyMobileCta ? " happy-job-agent-landing--sticky-cta" : ""}`}
            id="happyJobAgentPublic"
            ref={landingRootRef}
        >
            <HappyAgentLandingNavbar
                variant={isPublicLandingNav ? "public" : "authenticated"}
                onLoginClick={
                    isPublicLandingNav
                        ? () => {
                            clearPublicOnbSection();
                            onOpenAuthDrawer?.();
                        }
                        : undefined
                }
                onGetStartedClick={
                    isPublicLandingNav
                        ? () => {
                            setPublicOnbSection("navbar");
                            onOpenAuthDrawer?.();
                        }
                        : () => onGetStartedSectionCtaClick("navbar")
                }
                showGetStarted={showGetStartedSectionCta}
                onOpenDashboardClick={() => {
                    trackHappyAgentMixpanel("happy_agent_hero_open_job_agent_dashboard_clicked", {}).catch(() => { });
                    router.push("/talent/job-agent");
                }}
            />

            {/* Hero — Figma photo header + live results strip (100vw) */}
            <section
                className={`happy-agent-hero-mesh${heroReveal ? " happy-landing-section--revealed" : ""}`}
                aria-label="Happpy Agent"
                data-happy-landing-section="open_banner"
            >
                <div className="happy-agent-hero-mesh__bg" aria-hidden="true">
                    <picture className="happy-agent-hero-mesh__bg-photo-wrap">
                        <source type="image/webp" srcSet={HAPPY_HERO_BG_WEBP_SRCSET} sizes={HAPPY_HERO_BG_SIZES} />
                        <img
                            className="happy-agent-hero-mesh__bg-photo"
                            src={HAPPY_HERO_BG_SRC}
                            srcSet={`${HAPPY_HERO_ASSET_BASE}/hero-bg.png 1536w`}
                            sizes={HAPPY_HERO_BG_SIZES}
                            alt=""
                            fetchPriority="high"
                            loading="eager"
                            decoding="async"
                        />
                    </picture>
                    <div className="happy-agent-hero-mesh__bg-overlay" />
                    <div className="happy-agent-hero-mesh__bg-fade-top" />
                    <div className="happy-agent-hero-mesh__bg-fade-bottom" aria-hidden="true" />
                </div>
                <div className="happy-agent-hero-mesh__inner happy-agent-hero-mesh__inner--with-landing-nav">
                    <p
                        className={`happy-agent-hero-mesh__trust ${happyEnterClass()}`}
                        style={happyStaggerStyle(0)}
                        aria-label="Why Happpy Agent"
                    >
                        {HAPPY_HERO_TRUST_ITEMS.map((item) => (
                            <span key={item} className="happy-agent-hero-mesh__trust-line">
                                <img
                                    src={HAPPY_HERO_TRUST_SPARKLE_SRC}
                                    alt=""
                                    className="happy-agent-hero-mesh__trust-sparkle"
                                    aria-hidden="true"
                                />
                                <span>{item}</span>
                            </span>
                        ))}
                    </p>

                    <h1 className={`happy-agent-hero-mesh__title ${happyEnterClass()}`} style={happyStaggerStyle(1)}>
                        <span className="happy-agent-hero-mesh__title-prefix">{HAPPY_HERO_TITLE_PREFIX}</span>
                        <span className="happy-agent-hero-mesh__title-highlight">{HAPPY_HERO_TITLE_HIGHLIGHT}</span>
                    </h1>

                    <div className={`happy-agent-hero-mesh__lead ${happyEnterClass()}`} style={happyStaggerStyle(2)}>
                        <p className="happy-agent-hero-mesh__lead-primary">
                            {HAPPY_HERO_SUBTITLE_LINE_1}
                        </p>
                    </div>

                    <div className={`happy-agent-hero-mesh__actions ${happyEnterClass()}`} style={happyStaggerStyle(3)}>
                        {publicSignupMode ? (
                            <button
                                type="button"
                                className="happy-agent-hero-mesh__pill happy-agent-hero-mesh__pill--primary HERO"
                                onClick={(e) => openPublicAuth(e, "hero")}
                            >
                                <span className="happy-agent-hero-mesh__pill-label">
                                    Get Started Now
                                </span>
                                <ArrowForwardIcon />
                            </button>
                        ) : !gmailAccountsConnected ? (
                            <button
                                type="button"
                                className="happy-agent-hero-mesh__pill happy-agent-hero-mesh__pill--primary HERO"
                                onClick={() => openAgentOnboarding("hero")}
                            >
                                <span className="happy-agent-hero-mesh__pill-label">
                                    Get Started Now
                                </span>
                                <ArrowForwardIcon />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="happy-agent-hero-mesh__pill happy-agent-hero-mesh__pill--primary HERO"
                                onClick={() => {
                                    trackHappyAgentMixpanel("happy_agent_hero_open_job_agent_dashboard_clicked", {}).catch(() => { });
                                    router.push("/talent/job-agent");
                                }}
                            >
                                <span className="happy-agent-hero-mesh__pill-label">Open Job Agent dashboard</span>
                                <ArrowForwardIcon />
                            </button>
                        )}
                    </div>
                </div>

                {/* Live Results — Figma 2232:12944 hero foot (heading + 100vw slider, gap 24px) */}
                <div
                    className="happy-agent-hero-mesh__live-results happy-agent-live-results happy-agent-live-results--hero"
                    id="interview-wall"
                    aria-labelledby="happy-agent-live-results-heading"
                    data-happy-landing-section="live_results"
                >
                    <div className="happy-agent-live-results__stack happy-agent-live-results__stack--hero">
                        <header
                            className={`happy-agent-live-results__header happy-agent-live-results__header--hero ${happyEnterClass()}`}
                            style={happyStaggerStyle(4)}
                        >
                            <p id="happy-agent-live-results-heading" className="happy-agent-live-results__eyebrow happy-agent-live-results__eyebrow--hero">
                                <span className="happy-agent-live-results__eyebrow-label">Live results</span>
                                <span className="happy-agent-live-results__eyebrow-dot" aria-hidden="true" />
                                <span className="happy-agent-live-results__eyebrow-stat">
                                    <MechanicalScoreboardNumber
                                        className="happy-agent-live-results__scoreboard"
                                        from={liveResultsInterviewStart}
                                        to={372}
                                        // suffix="+"
                                        active={heroReveal}
                                        duration={3200}
                                    />
                                    {" Interviews IN last 7 days."}
                                </span>
                            </p>
                        </header>

                        <div
                            className={`happy-agent-live-results__companies happy-agent-live-results__companies--hero ${happyEnterClass()}`}
                            style={happyStaggerStyle(5)}
                            id="positive-referrals"
                            aria-label="Companies where interviews were scheduled recently"
                        >
                            <HappyLiveResultsMarqueeRow
                                items={liveResultsMarqueeHero}
                                onTrialCtaClick={onTrialCtaClick}
                            />
                        </div>
                    </div>
                </div>
            </section>


            {showJobsListing ? (
                <section className="happy-agent-jobs-listing" id="happy-agent-jobs-listing">
                    <JobsBoard
                        subtitle="Filter live openings by experience, function, location and how you want to work — then ask your agent for a referral on the ones you want."
                        onRunAgent={handleJobsBoardRunAgent}
                    />
                </section>
            ) : null}

            {/* Conversion blocks: value prop, demo video, proof */}
            <div className="happy-outreach-reference-blocks">

                <section
                    ref={hiwRevealRef}
                    className={`happy-agent-hiw-figma${hiwRevealed ? " happy-landing-section--revealed" : ""}`}
                    aria-labelledby="happy-agent-value-heading"
                    data-happy-landing-section="value_strip"
                >
                    <div className="happy-agent-hiw-figma__inner">
                        <header className={`happy-agent-hiw-figma__header ${happyEnterClass()}`}>
                            <p className="happy-agent-hiw-figma__eyebrow">How it works</p>
                            {/* <h2 id="happy-agent-value-heading" className="happy-agent-hiw-figma__title">
                                <span className="happy-agent-hiw-figma__title-line">One click. Automated referrals.</span>
                                <span className="happy-agent-hiw-figma__title-line">Hiring Team-ready resume.</span>
                                <span className="happy-agent-hiw-figma__title-line happy-agent-hiw-figma__title-line--highlighted">
                                    More interviews.
                                    <img
                                        className="happy-agent-hiw-figma__title-highlight"
                                        src={HAPPY_HIW_HEADLINE_HIGHLIGHT_SRC}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                </span>
                            </h2> */}
                        </header>

                        {/* Old pillar-card grid — replaced by the animated how-it-works.html walkthrough below.
                        <ul className="happy-agent-hiw-figma__cards">
                            {HAPPY_HOW_IT_WORKS_PILLARS.map((pillar, index) => (
                                <li
                                    key={pillar.badge}
                                    className={`happy-agent-hiw-figma__card ${happyEnterClass("unfold")}`}
                                    style={happyStaggerStyle(index, 2)}
                                >
                                    <div className="happy-agent-hiw-figma__card-head">
                                        <div className="happy-agent-hiw-figma__card-icon" aria-hidden="true">
                                            <img src={pillar.iconSrc} alt="" />
                                        </div>
                                        <h3 className="happy-agent-hiw-figma__card-title">
                                            {pillar.titleLines.map((line) => (
                                                <span key={line} className="happy-agent-hiw-figma__card-title-line">
                                                    {line}
                                                </span>
                                            ))}
                                        </h3>
                                    </div>
                                    <p className="happy-agent-hiw-figma__card-body">{pillar.body}</p>
                                    <div className="happy-agent-hiw-figma__badge-wrap">
                                        <img
                                            className="happy-agent-hiw-figma__badge-underline"
                                            src={pillar.badgeUnderlineSrc}
                                            alt=""
                                            aria-hidden="true"
                                            style={{ "--happy-hiw-badge-rotate": pillar.badgeUnderlineRotate }}
                                        />
                                        <span className="happy-agent-hiw-figma__badge">{pillar.badge}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        */}

                        <div className={`happy-agent-hiw-figma__demo ${happyEnterClass()}`}>
                            <video
                                className="happy-agent-hiw-figma__demo-frame"
                                src="/happpy-agent/how-it-works-3.mp4"
                                poster="/happpy-agent/how-it-works-3-poster.jpg"
                                aria-label="How Happpy Agent works"
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                            />
                        </div>

                        {showGetStartedSectionCta ? (
                            <HappyGetStartedSectionCta onClick={() => onGetStartedSectionCtaClick("how_it_works")} howItWorks />
                        ) : null}
                    </div>
                </section>

                <div className="happy-outreach-testimonials-wrap" data-happy-landing-section="testimonials">
                    <TestimonialsSlider />
                </div>

                <section
                    ref={worksAnywhereRevealRef}
                    className={`happy-agent-works-anywhere${worksAnywhereRevealed ? " happy-landing-section--revealed" : ""}`}
                    id="happy-agent-works-anywhere"
                    aria-labelledby="happy-agent-works-anywhere-heading"
                    data-happy-landing-section="works_anywhere"
                >
                    <div className="happy-agent-works-anywhere__bg" aria-hidden="true">
                    </div>
                    <div className="happy-agent-works-anywhere__inner">
                        <header className={`happy-agent-works-anywhere__header ${happyEnterClass()}`}>
                            <h2 id="happy-agent-works-anywhere-heading" className="happy-agent-works-anywhere__title">
                                <span className="happy-agent-works-anywhere__title-text">Works anywhere</span>
                                <img
                                    className="happy-agent-works-anywhere__title-underline"
                                    src={HAPPY_WORKS_ANYWHERE_TITLE_UNDERLINE_SRC}
                                    alt=""
                                    aria-hidden="true"
                                />
                            </h2>
                            <p className="happy-agent-works-anywhere__lead">
                                Top job boards &amp; <strong>any company career page</strong> - paste a URL or click from
                                the Chrome and Brave browser extension.
                            </p>
                        </header>

                        <ul className="happy-agent-works-anywhere__chips" aria-label="Places Happpy Agent runs">
                            {happyWorksAnywherePlatforms.map(({ key, label, Logo }, index) => (
                                <li
                                    key={key}
                                    className={`happy-agent-works-anywhere__chip ${happyEnterClass("unfold")}`}
                                    style={happyStaggerStyle(index, 2)}
                                >
                                    <Logo className="happy-agent-works-anywhere__chip-icon" />
                                    <span className="happy-agent-works-anywhere__chip-label">{label}</span>
                                </li>
                            ))}
                        </ul>

                        <p className={`happy-agent-works-anywhere__footer ${happyEnterClass()}`}>
                            <span
                                className={`happy-agent-works-anywhere__footer-handwriting ${HAPPY_HANDWRITING_CLASS}`}
                            >
                                {HAPPY_WORKS_ANYWHERE_FOOTER_HANDWRITING}
                            </span>
                        </p>
                    </div>
                </section>

                <section
                    className="happy-agent-setup-figma"
                    id="happy-agent-setup"
                    aria-labelledby="happy-agent-setup-heading"
                    data-happy-landing-section="setup"
                    data-trial-chip-label={trialChipLabel}
                >
                    <div className="happy-agent-setup-figma__inner">
                        <OutreachConfigureAccountsOnly
                            className="happy-agent-setup-figma__configure"
                            onAccountsStepChange={handleAccountsStepChange}
                            onOpenAgentOnboarding={() => publicSignupMode ? openPublicAuth(null, "setup_section") : openAgentOnboarding("setup_section")}
                            publicSignupMode={publicSignupMode}
                        />
                    </div>
                </section>

                <section
                    ref={privacyRevealRef}
                    className={`happy-agent-privacy-figma${privacyRevealed ? " happy-landing-section--revealed" : ""}`}
                    aria-labelledby="happy-agent-privacy-heading"
                    data-happy-landing-section="data-policy"
                >
                    <div className="happy-agent-privacy-figma__inner">
                        <header className={`happy-agent-privacy-figma__header ${happyEnterClass()}`}>
                            <p className="happy-agent-privacy-figma__eyebrow">Trust &amp; Safety</p>
                            <h2 id="happy-agent-privacy-heading" className="happy-agent-privacy-figma__title">
                                Your privacy &amp; data{" "}
                                <span className="happy-agent-privacy-figma__title-highlight">
                                    security
                                    <img
                                        className="happy-agent-privacy-figma__title-underline"
                                        src={HAPPY_PRIVACY_TITLE_UNDERLINE_SRC}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                </span>
                            </h2>
                        </header>

                        <div className="happy-agent-privacy-figma__body">
                            <ul className="happy-agent-privacy-figma__cards">
                                {HAPPY_PRIVACY_CARDS.map((card, index) => (
                                    <li
                                        key={card.title}
                                        className={`happy-agent-privacy-figma__card ${happyEnterClass("unfold")}`}
                                        style={happyStaggerStyle(index, 2)}
                                    >
                                        <h3 className="happy-agent-privacy-figma__card-title">{card.title}</h3>
                                        <ul className="happy-agent-privacy-figma__list">
                                            {card.items.map((item) => (
                                                <li key={item} className="happy-agent-privacy-figma__item">
                                                    <img
                                                        className="happy-agent-privacy-figma__check"
                                                        src={HAPPY_SETUP_CHECKMARK_SRC}
                                                        alt=""
                                                        aria-hidden="true"
                                                    />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>

                            <div className="happy-agent-privacy-figma__badges">
                                {HAPPY_PRIVACY_BADGES.map((badge) => (
                                    <div
                                        key={badge.label}
                                        className="happy-agent-privacy-figma__badge-wrap"
                                        style={{ "--happy-privacy-badge-rotate": badge.rotate }}
                                    >
                                        <img
                                            className="happy-agent-privacy-figma__badge-underline"
                                            src={badge.underlineSrc}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <span
                                            className={`happy-agent-privacy-figma__badge-label ${HAPPY_HANDWRITING_CLASS}`}
                                        >
                                            {badge.label}
                                        </span>
                                        {badge.sparkle ? (
                                            <img
                                                className="happy-agent-privacy-figma__badge-sparkle"
                                                src={HAPPY_PRIVACY_SPARKLE_SRC}
                                                alt=""
                                                aria-hidden="true"
                                            />
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    ref={manualVsRevealRef}
                    className={`happy-agent-manual-vs-figma${manualVsRevealed ? " happy-landing-section--revealed" : ""}`}
                    id="happy-agent-manual-vs"
                    aria-labelledby="happy-agent-manual-vs-heading"
                    data-happy-landing-section="manual_vs"
                >
                    <div className="happy-agent-manual-vs-figma__inner">
                        <header className={`happy-agent-manual-vs-figma__header ${happyEnterClass()}`}>
                            <h2 id="happy-agent-manual-vs-heading" className="happy-agent-manual-vs-figma__title">
                                <span className="happy-agent-manual-vs-figma__title-muted">
                                    Manual Job hunt takes hours.
                                </span>
                                <span className="happy-agent-manual-vs-figma__title-emphasis">
                                    HAPPPY Agent does it in seconds.
                                </span>
                            </h2>
                        </header>

                        <div className="happy-agent-manual-vs-figma__body">
                            <div className="happy-agent-manual-vs-figma__compare">
                                <article className={`happy-agent-manual-vs-figma__panel happy-agent-manual-vs-figma__panel--manual ${happyEnterClass("left")}`}>
                                    <header className="happy-agent-manual-vs-figma__panel-header">
                                        <img
                                            className="happy-agent-manual-vs-figma__panel-header-icon"
                                            src={HAPPY_MANUAL_VS_MANUAL_HEADER_ICON_SRC}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <h3 className="happy-agent-manual-vs-figma__panel-title">Manual Job Hunt</h3>
                                    </header>

                                    <ul className="happy-agent-manual-vs-figma__rows happy-agent-manual-vs-figma__rows--manual">
                                        {HAPPY_MANUAL_VS_MANUAL_ROWS.map(({ number, text, iconSrc }, index) => (
                                            <li
                                                key={number}
                                                className={`happy-agent-manual-vs-figma__row happy-agent-manual-vs-figma__row--manual ${happyEnterClass("manual-row")}`}
                                                style={happyStaggerStyle(index)}
                                            >
                                                <span className="happy-agent-manual-vs-figma__row-stripe" aria-hidden="true" />
                                                <div className="happy-agent-manual-vs-figma__pill happy-agent-manual-vs-figma__pill--manual">
                                                    <div className="happy-agent-manual-vs-figma__pill-main">
                                                        <span className="happy-agent-manual-vs-figma__pill-num">{number}</span>
                                                        <span className="happy-agent-manual-vs-figma__pill-text">{text}</span>
                                                    </div>
                                                    <span className="happy-agent-manual-vs-figma__pill-icon-wrap">
                                                        <img src={iconSrc} alt="" aria-hidden="true" />
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </article>

                                <article className={`happy-agent-manual-vs-figma__panel happy-agent-manual-vs-figma__panel--agent ${happyEnterClass("right")}`}>
                                    <header className="happy-agent-manual-vs-figma__panel-header">
                                        <span className="happy-agent-manual-vs-figma__agent-logo-wrap" aria-hidden="true">
                                            <HapppyAgentLogo
                                                variant="mark-only"
                                                className="happy-agent-manual-vs-figma__agent-logo-lockup"
                                                ariaLabel=""
                                            />
                                        </span>
                                        <h3 className="happy-agent-manual-vs-figma__panel-title">With HAPPPY Agent</h3>
                                    </header>

                                    <ul className="happy-agent-manual-vs-figma__rows happy-agent-manual-vs-figma__rows--agent">
                                        {HAPPY_MANUAL_VS_AGENT_ROWS.map(({ number, text, iconSrc }, index) => (
                                            <li
                                                key={number}
                                                className={`happy-agent-manual-vs-figma__row happy-agent-manual-vs-figma__row--agent ${happyEnterClass("agent-row")}`}
                                                style={happyStaggerStyle(index)}
                                            >
                                                <div className="happy-agent-manual-vs-figma__pill happy-agent-manual-vs-figma__pill--agent">
                                                    <div className="happy-agent-manual-vs-figma__pill-main">
                                                        <span className="happy-agent-manual-vs-figma__pill-num">{number}</span>
                                                        <span className="happy-agent-manual-vs-figma__pill-text">{text}</span>
                                                    </div>
                                                    <span className="happy-agent-manual-vs-figma__pill-icon-wrap">
                                                        <img src={iconSrc} alt="" aria-hidden="true" />
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </article>
                            </div>

                            {/* <ul className="happy-agent-manual-vs-figma__stats">
                                {HAPPY_MANUAL_VS_STATS.map(({ value, label }, index) => (
                                    <li
                                        key={label}
                                        className={`happy-agent-manual-vs-figma__stat ${happyEnterClass("unfold")}`}
                                        style={happyStaggerStyle(index)}
                                    >
                                        <p className="happy-agent-manual-vs-figma__stat-value">{value}</p>
                                        <p className="happy-agent-manual-vs-figma__stat-label">{label}</p>
                                    </li>
                                ))}
                            </ul> */}
                        </div>
                    </div>
                </section>


                {/* <div className="use-case-video-section happy-agent-demo-figma" id="happy-agent-demo" data-happy-landing-section="demo-video">
                    <header className="happy-agent-demo-figma__header">
                        <p className="happy-agent-demo-figma__eyebrow">Demo video</p>
                        <h2 id="happy-agent-demo-heading" className="happy-agent-demo-figma__title">
                            See it run on real jobs
                        </h2>
                    </header>
                    <div className="video-container happy-agent-video-frame">
                        <iframe
                            ref={demoVimeoIframeRef}
                            src={`https://player.vimeo.com/video/${HAPPY_AGENT_DEMO_VIMEO_VIDEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&transparent=1&controls=1&autoplay=0&muted=0&loop=0&dnt=1`}
                            title="Happpy Agent demo"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                            allowFullScreen
                            referrerPolicy="strict-origin-when-cross-origin"
                            className="vimeo-player-minimal happy-agent-vimeo-iframe"
                        />
                    </div>
                    {showGetStartedSectionCta ? (
                        <HappyGetStartedSectionCta onClick={() => onGetStartedSectionCtaClick("demo_video")} />
                    ) : null}
                </div> */}

            </div>

            <section
                ref={pricingRevealRef}
                className={`happy-agent-pricing-figma${pricingRevealed ? " happy-landing-section--revealed" : ""}`}
                id="pricing"
                data-happy-landing-section="pricing"
                aria-labelledby="happy-agent-pricing-heading"
            >
                <div className="happy-agent-pricing-figma__inner">
                    <header className={`happy-agent-pricing-figma__header ${happyEnterClass()}`}>
                        <p className="happy-agent-pricing-figma__eyebrow">{HAPPY_PRICING_EYEBROW}</p>
                        <h2 id="happy-agent-pricing-heading" className="happy-agent-pricing-figma__title">
                            {HAPPY_PRICING_TITLE}
                        </h2>
                    </header>

                    <div className="job-agent-dashboard happy-agent-pricing-figma__cards">
                        <div className="jad-sub-plan-grid">
                            {HAPPY_PRICING_DISPLAY_ORDER.map((id) => (
                                <HappyPlanCard
                                    key={id}
                                    planId={id}
                                    apiPlan={
                                        publicSignupMode
                                            ? PUBLIC_LANDING_PLAN_FALLBACKS[id]
                                            : user?.agent_tailor_plans?.[id]
                                    }
                                    isPaidUserView={false}
                                    pendingPlanId={publicSignupMode ? null : renewLoading || null}
                                    trialCta={publicSignupMode ? publicPricingTrialCta : landingTrialCtaState}
                                    {...landingPlanCardProps(id)}
                                    {...(publicSignupMode ? {} : planCardReferralProps(user, id))}
                                    onPurchase={(planId) => {
                                        if (publicSignupMode) {
                                            publicPricingPaidCta();
                                            return;
                                        }
                                        if (!gmailAccountsConnected) {
                                            openAgentOnboarding("pricing_plan_card");
                                            return;
                                        }
                                        handlePricingPayment(
                                            planId,
                                            HAPPY_PRICING_CTA_SOURCE_BY_PLAN_ID[planId]
                                            || "pricing_unknown"
                                        );
                                    }}
                                    paidCtaLabel={
                                        (publicSignupMode || !gmailAccountsConnected) ? "Start Free for Now" : "Purchase Plan"
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    <p className="happy-agent-pricing-figma__footnote">{HAPPY_PRICING_FOOTNOTE}</p>
                </div>
            </section>

            <section
                ref={kineticRevealRef}
                className={`happy-agent-kinetic-figma${kineticRevealed ? " happy-landing-section--revealed" : ""}`}
                aria-labelledby="happy-agent-kinetic-heading"
                data-happy-landing-section="kinetic_results"
            >
                <div className="happy-agent-kinetic-figma__inner">
                    <header className={`happy-agent-kinetic-figma__header ${happyEnterClass()}`}>
                        <p className="happy-agent-kinetic-figma__eyebrow">{HAPPY_KINETIC_EYEBROW}</p>
                        <div className="happy-agent-kinetic-figma__title-row">
                            <h2 id="happy-agent-kinetic-heading" className="happy-agent-kinetic-figma__title">
                                {HAPPY_KINETIC_TITLE}
                            </h2>
                            <span className="happy-agent-kinetic-figma__sparkles" aria-hidden="true">
                                <img
                                    className="happy-agent-kinetic-figma__sparkle happy-agent-kinetic-figma__sparkle--large"
                                    src={HAPPY_KINETIC_HEADER_SPARKLE_LARGE_SRC}
                                    alt=""
                                />
                                <img
                                    className="happy-agent-kinetic-figma__sparkle happy-agent-kinetic-figma__sparkle--small"
                                    src={HAPPY_KINETIC_HEADER_SPARKLE_SMALL_SRC}
                                    alt=""
                                />
                            </span>
                        </div>
                        <p className="happy-agent-kinetic-figma__sub">{HAPPY_KINETIC_SUBTITLE}</p>
                    </header>

                    <ol className="happy-agent-kinetic-figma__timeline">
                        {HAPPY_KINETIC_STEPS.map((step, index) => (
                            <li
                                key={step.time}
                                className={`happy-agent-kinetic-figma__step ${happyEnterClass("unfold")}`}
                                style={happyStaggerStyle(index, 2)}
                            >
                                <div className="happy-agent-kinetic-figma__time">{step.time}</div>
                                <div className="happy-agent-kinetic-figma__rail" aria-hidden="true">
                                    <span className="happy-agent-kinetic-figma__dot" />
                                    {!step.isLast ? <span className="happy-agent-kinetic-figma__line" /> : null}
                                </div>
                                <div className="happy-agent-kinetic-figma__content">
                                    <h3 className="happy-agent-kinetic-figma__step-title">{step.title}</h3>
                                    {step.bodyLines ? (
                                        <p className="happy-agent-kinetic-figma__step-body">
                                            {step.bodyLines.map((line) => (
                                                <span key={line} className="happy-agent-kinetic-figma__step-body-line">
                                                    {line}
                                                </span>
                                            ))}
                                        </p>
                                    ) : (
                                        <p className="happy-agent-kinetic-figma__step-body">{step.body}</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>

                    <div className={`happy-agent-kinetic-figma__conclusion ${happyEnterClass()}`}>
                        <div className="happy-agent-kinetic-figma__conclusion-title-wrap">
                            <h3 className={`happy-agent-kinetic-figma__conclusion-title ${HAPPY_HANDWRITING_CLASS}`}>
                                {HAPPY_KINETIC_CONCLUSION_TITLE}
                            </h3>
                            <img
                                className="happy-agent-kinetic-figma__conclusion-underline happy-agent-kinetic-figma__conclusion-underline--primary"
                                src={HAPPY_KINETIC_CONCLUSION_UNDERLINE_PRIMARY_SRC}
                                alt=""
                                aria-hidden="true"
                            />
                            <img
                                className="happy-agent-kinetic-figma__conclusion-underline happy-agent-kinetic-figma__conclusion-underline--secondary"
                                src={HAPPY_KINETIC_CONCLUSION_UNDERLINE_SECONDARY_SRC}
                                alt=""
                                aria-hidden="true"
                            />
                        </div>
                        <p className="happy-agent-kinetic-figma__conclusion-body">{HAPPY_KINETIC_CONCLUSION_BODY}</p>
                    </div>
                    {showGetStartedSectionCta ? (
                        <HappyGetStartedSectionCta
                            onClick={() => onGetStartedSectionCtaClick("kinetic_results")}
                            align="start"
                        />
                    ) : null}
                </div>
            </section>

            <section
                className="happy-agent-faq-figma"
                id="faq"
                aria-labelledby="happy-agent-faq-heading"
                data-happy-landing-section="faq"
            >
                <div className="happy-agent-faq-figma__inner">
                    <header className="happy-agent-faq-figma__header">
                        <h2 id="happy-agent-faq-heading" className="happy-agent-faq-figma__title">
                            FAQ
                        </h2>
                        <p className="happy-agent-faq-figma__sub">Tap a question to expand.</p>
                    </header>

                    <div className="happy-agent-faq-figma__grid" role="list">
                        {HAPPY_FAQ_ITEMS.map((item, idx) => {
                            const isOpen = faqOpenIndex === idx;
                            const panelId = `happy-agent-faq-panel-${idx}`;
                            return (
                                <div
                                    key={item.q}
                                    className={`happy-agent-faq-figma__item ${isOpen ? "happy-agent-faq-figma__item--open" : ""}`}
                                    role="listitem"
                                >
                                    <button
                                        type="button"
                                        className="happy-agent-faq-figma__trigger"
                                        aria-expanded={isOpen}
                                        aria-controls={panelId}
                                        id={`happy-agent-faq-trigger-${idx}`}
                                        onClick={() => {
                                            const nextOpen = faqOpenIndex !== idx;
                                            trackHappyAgentMixpanel("happy_agent_faq_item_toggled", {
                                                faq_question: item.q,
                                                action: nextOpen ? "open" : "close",
                                            }).catch(() => { });
                                            setFaqOpenIndex((prev) => (prev === idx ? null : idx));
                                        }}
                                    >
                                        <span className="happy-agent-faq-figma__q">{item.q}</span>
                                        <span className="happy-agent-faq-figma__toggle" aria-hidden="true">
                                            <span
                                                className={`happy-agent-faq-figma__toggle-icon happy-agent-faq-figma__toggle-icon--plus${isOpen ? "" : " happy-agent-faq-figma__toggle-icon--visible"}`}
                                            >
                                                +
                                            </span>
                                            <span
                                                className={`happy-agent-faq-figma__toggle-icon happy-agent-faq-figma__toggle-icon--minus${isOpen ? " happy-agent-faq-figma__toggle-icon--visible" : ""}`}
                                            >
                                                −
                                            </span>
                                        </span>
                                    </button>
                                    <div
                                        id={panelId}
                                        className="happy-agent-faq-figma__panel"
                                        role="region"
                                        aria-labelledby={`happy-agent-faq-trigger-${idx}`}
                                        aria-hidden={!isOpen}
                                    >
                                        <div className="happy-agent-faq-figma__panel-inner">
                                            <p className="happy-agent-faq-figma__a">{item.a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section
                className="happy-agent-try-free-figma"
                aria-labelledby="happy-agent-try-free-heading"
                data-happy-landing-section="try_free_cta"
            >
                <div className="happy-agent-try-free-figma__bg" aria-hidden="true" />
                <div className="happy-agent-try-free-figma__inner">
                    <header className="happy-agent-try-free-figma__header">
                        <h2 id="happy-agent-try-free-heading" className="happy-agent-try-free-figma__title">
                            {HAPPY_TRY_FREE_TITLE_LINES.map((line) => (
                                <span key={line} className="happy-agent-try-free-figma__title-line">
                                    {line}
                                </span>
                            ))}
                        </h2>
                        <p className="happy-agent-try-free-figma__sub">{HAPPY_TRY_FREE_SUBTITLE}</p>
                    </header>

                    <button
                        type="button"
                        className="happy-agent-try-free-figma__pill"
                        onClick={() => {
                            if (publicSignupMode) {
                                openPublicAuth(null, "try_free_band");
                                return;
                            }
                            if (gmailAccountsConnected) {
                                trackHappyAgentMixpanel("happy_agent_try_free_open_dashboard_clicked", {}).catch(() => { });
                                router.push("/talent/job-agent");
                                return;
                            }
                            trackHappyAgentMixpanel("happy_agent_try_free_get_started_clicked", {
                                entry_point: "try_free_band",
                            }).catch(() => { });
                            openAgentOnboarding("try_free_band");
                        }}
                    >
                        {publicSignupMode || !gmailAccountsConnected ? (
                            <span className={`happy-agent-try-free-figma__pill-text ${HAPPY_HANDWRITING_CLASS} happy-agent-handwriting--uppercase`}>
                                Get Started Now
                            </span>
                        ) : (
                            <span className={`happy-agent-try-free-figma__pill-label ${HAPPY_HANDWRITING_CLASS} happy-agent-handwriting--uppercase`}>
                                {HAPPY_SETUP_HANDWRITING.openDashboard}
                            </span>
                        )}
                        <span className="happy-agent-try-free-figma__pill-icon" aria-hidden="true">
                            <ArrowForwardIcon />
                        </span>
                    </button>
                </div>
            </section>

            <footer
                className="happy-agent-footer-figma"
                data-happy-landing-section="footer"
            >
                <div className="happy-agent-footer-figma__inner">
                    <div className="happy-agent-footer-figma__top">
                        <div className="happy-agent-footer-figma__brand">
                            <a
                                href="#happyJobAgentPublic"
                                className="happy-agent-footer-figma__logo-link"
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                            >
                                <HapppyAgentLogo
                                    className="happy-agent-footer-figma__logo"
                                    ariaLabel="Happpy Agent"
                                />
                                <span className="happy-agent-footer-figma__logo-byline">by uplers</span>
                            </a>
                            <p className="happy-agent-footer-figma__tagline">
                                {HAPPY_FOOTER_TAGLINE_LINES.map((line) => (
                                    <span key={line} className="happy-agent-footer-figma__tagline-line">
                                        {line}
                                    </span>
                                ))}
                            </p>
                            <div className="happy-agent-footer-figma__social">
                                <span className="happy-agent-footer-figma__social-label">Find us on:</span>
                                <a
                                    className="happy-agent-footer-figma__social-link"
                                    href={HAPPY_FOOTER_LINKEDIN_HREF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Find us on LinkedIn"
                                >
                                    <img
                                        className="happy-agent-footer-figma__social-icon"
                                        src={HAPPY_FOOTER_LINKEDIN_LOGO_SRC}
                                        alt=""
                                        width={24}
                                        height={24}
                                        decoding="async"
                                    />
                                </a>
                                <a
                                    className="happy-agent-footer-figma__social-link"
                                    href={HAPPY_FOOTER_INSTAGRAM_HREF}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Find us on Instagram"
                                >
                                    <img
                                        className="happy-agent-footer-figma__social-icon"
                                        src={HAPPY_FOOTER_INSTAGRAM_LOGO_SRC}
                                        alt=""
                                        width={24}
                                        height={24}
                                        decoding="async"
                                    />
                                </a>
                            </div>
                        </div>

                        <nav className="happy-agent-footer-figma__nav" aria-label="Footer">
                            {HAPPY_FOOTER_COLUMNS.map((column) => (
                                <div key={column.title} className="happy-agent-footer-figma__column">
                                    <p className="happy-agent-footer-figma__column-title">{column.title}</p>
                                    <ul className="happy-agent-footer-figma__links">
                                        {column.links.map((link) => (
                                            <li key={link.label}>
                                                {link.href ? (
                                                    <a
                                                        className="happy-agent-footer-figma__link"
                                                        href={link.href}
                                                        {...(link.external
                                                            ? { target: "_blank", rel: "noopener noreferrer" }
                                                            : {})}
                                                    >
                                                        {link.label}
                                                    </a>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="happy-agent-footer-figma__link happy-agent-footer-figma__link--button"
                                                        onClick={() => scrollToLandingSection(link.scrollTarget)}
                                                    >
                                                        {link.label}
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>

                    <div className="happy-agent-footer-figma__bottom">
                        <p className="happy-agent-footer-figma__copyright">{HAPPY_FOOTER_COPYRIGHT}</p>
                        <p className="happy-agent-footer-figma__note">{HAPPY_FOOTER_NOTE}</p>
                    </div>
                </div>
            </footer>

            <Modal
                isOpen={demoModalOpen}
                onRequestClose={closeDemoModal}
                portalClassName="happy-agent-modal-portal"
                overlayClassName="happy-agent-modal-overlay"
                className="happy-agent-modal happy-agent-modal--demo"
                bodyOpenClassName="happy-agent-modal-open"
                contentLabel="Demo video"
                shouldCloseOnOverlayClick={false}
                shouldCloseOnEsc={true}
            >
                <div className="happy-agent-modal-shell">
                    <button
                        type="button"
                        className="happy-agent-modal-close"
                        onClick={closeDemoModal}
                        aria-label="Close demo video"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="happy-agent-modal-body happy-agent-modal-body--demo">
                        <header className="happy-agent-modal-heading">
                            <h2>Demo video</h2>
                            <p>See how the Happpy Agent runs on real jobs — same engine as Happpy Agent</p>
                        </header>
                        <div className="happy-agent-video-frame happy-agent-video-frame--modal">
                            {demoModalOpen && (
                                <iframe
                                    src={`https://player.vimeo.com/video/${HAPPY_AGENT_DEMO_VIMEO_VIDEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0&transparent=1&controls=1&autoplay=1&muted=0&loop=0&dnt=1`}
                                    title="Happpy Agent demo"
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                    allowFullScreen
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="happy-agent-vimeo-iframe"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Modal>

            {!publicSignupMode ? (
                <AgentOnboarding
                    isOpen={agentOnboardingOpen}
                    onClose={closeAgentOnboarding}
                    onAccountsStepChange={handleAccountsStepChange}
                    onExit={handleAgentOnboardingExit}
                />
            ) : null}

            {showStickyMobileCta ? (
                <div className="happy-agent-sticky-mobile-cta" data-happy-sticky-cta>
                    <button
                        type="button"
                        className="happy-agent-sticky-mobile-cta__btn"
                        onClick={() => onGetStartedSectionCtaClick("sticky_mobile")}
                    >
                        <span>Get Started Now</span>
                        <ArrowForwardIcon />
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export { HappyJobAgentContent };

export default function HappyJobAgent() {
    return <HappyJobAgentContent />;
}
