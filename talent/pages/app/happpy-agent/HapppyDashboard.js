'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { differenceInMonths } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import { useJobAgentDashboardContext } from '../job-agent/JobAgentDashboardContext';
import {
    API_GET_RECOMMENDED_JOBS,
    API_SINGLE_OPP,
    API_URL,
    IMAGE_URL,
} from '../../../components/Constant';
import { GET_API, POST_API } from '../../../components/Helper';
import { submitAutoRunRequest } from '../../../store/actions/UserActions';
import ReferralAgentPreviewModal from '../../../components/ReferralAgentPreviewModal';
import DailyReferralLimitTopnav from '../../../components/DailyReferralLimitWidget';
import JobAgentProfileResumeHealth from '../job-agent/JobAgentProfileResumeHealth';
import { useJobAgentInterviewList } from '../job-agent/useJobAgentInterviewList';
import InterviewFeedbackModal from '../job-agent/InterviewFeedbackModal';
import './HapppyDashboard.css';
import HapppyAgentResumeHealth from './HapppyAgentResumeHealth';
import PasteJobLinkDrawer from './configure-tabs/PasteJobLinkDrawer';

/**
 * Happpy Agent dashboard home — Figma reskin of {@link JobAgentDashboardHome}.
 *
 * Renders one of four visual states driven by `state.happpyAgent.raw`:
 *  - 2 pending  → gradient "Hey! Complete your pending setup steps" card next to
 *                 the resume-health card; mascot + "Just 2 steps pending" badge.
 *  - 1 pending  → same layout, single step row inside the setup card.
 *  - 0 pending  → setup card hidden; resume-health card spans the full row.
 *  - score done → resume-health card flips to the red-ring "Needs Serious
 *                 Improvement" variant (driven by JobAgentProfileResumeHealth's
 *                 own `resumeHealthControl` state via the `happpy-figma` variant).
 *
 * Data reuses already-shipped endpoints — see {@link JobAgentDashboardHome} for
 * the parent implementation we are reskinning.
 */

const CHROME_EXTENSION_URL =
    'https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en';
const EXTENSION_STORAGE_KEY = 'outreach_chrome_extension_downloaded';
const RECOMMENDED_JOBS_LIMIT = 4;
const QUEUE_ENDPOINT_SOURCE = 'happpy-dashboard';
const NEXT_MOVES_CHIP_LIMIT = 3;
/** API doesn't expose row-level timestamps yet — keep the placeholder static
 *  so the design has a "freshness" line as approved in Figma. */
const NEXT_MOVES_STATIC_TIME = '2d ago';
const REPLIES_PATH = '/talent/job-agent/my-activity?tab=replies';
const REMINDERS_PATH = '/talent/job-agent/my-activity?tab=reminders';
const INTERVIEW_LIST_PATH = '/talent/job-agent/my-activity?tab=interviews';
const INTERVIEW_FEEDBACK_PROMPT_KEY = 'happpy_interview_feedback_prompt_seen';
const OUTREACH_REQUEST_PATH = '/talent/job-agent/my-activity?tab=activity&pendingManualReview=open';
const EMAIL_SCAN_PATH = '/talent/job-agent/recommended-jobs?tab=gmail-scan';
const REFER_FRIENDS_QUERY_KEY = 'refer_friends';

function shouldOpenReferFriendsFromSearchParams(searchParams) {
    const raw = (searchParams.get(REFER_FRIENDS_QUERY_KEY) || '').trim().toLowerCase();
    return raw === 'true' || raw === '1';
}

const MatIcon = ({ name, className = '', filled, ...rest }) => (
    <span
        className={`material-symbols-outlined${filled ? ' jad-icon--fill' : ''}${className ? ` ${className}` : ''
            }`}
        {...rest}
    >
        {name}
    </span>
);

const ArrowRightIcon = (props) => (
    <svg
        viewBox="0 0 20 20"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <path d="M4.17 10h11.66" />
        <path d="M10.83 5l5 5-5 5" />
    </svg>
);

const ClockIcon = (props) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
    </svg>
);

const ExtensionTipLinkedInLogo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <path
            fill="#0A66C2"
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
    </svg>
);

const ExtensionTipIndeedLogo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#2164f3" />
        <circle cx="12" cy="8" r="2.25" fill="#fff" />
        <rect x="10" y="11.5" width="4" height="8.5" rx="1.5" fill="#fff" />
    </svg>
);

const ExtensionTipWellfoundLogo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="5" fill="#FF4F64" />
        <path
            fill="#fff"
            d="M12 6l1.9 3.85 4.25.62-3.08 3 .74 4.28L12 14.9l-3.81 2.03.74-4.28-3.08-3 4.25-.62L12 6z"
        />
    </svg>
);

const ExtensionTipGoogleLogo = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
        <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
    </svg>
);

const EXTENSION_TIP_NAUKRI_LOGO_SRC =
    'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Naukri_com_1746796515_ijvU9nVTTO.jpeg';

const EXTENSION_TIP_PLATFORMS = [
    { id: 'linkedin', label: 'LinkedIn', Logo: ExtensionTipLinkedInLogo },
    { id: 'wellfound', label: 'Wellfound', Logo: ExtensionTipWellfoundLogo },
    { id: 'naukri', label: 'Naukri', logoSrc: EXTENSION_TIP_NAUKRI_LOGO_SRC },
    { id: 'google', label: 'Google careers', Logo: ExtensionTipGoogleLogo },
    { id: 'indeed', label: 'Indeed', Logo: ExtensionTipIndeedLogo },
    { id: 'career', label: '+ any career page' },
];

/** Lazy-load the same Razorpay-less / lightweight asset path as the legacy
 *  Step3 extension page so the local + server "downloaded" flag stays in
 *  sync across the onboarding drawer, OutreachConfigure, and this dashboard. */
function markExtensionEngagement() {
    try {
        localStorage.setItem(EXTENSION_STORAGE_KEY, 'true');
    } catch {
        /* private mode / quota — ignore */
    }
    POST_API(`${API_URL}talent/outreach/extension-engagement`, {
        chrome_extension_download: true,
    }).catch(() => { });
}

function readExtensionDownloadedLocally() {
    try {
        return localStorage.getItem(EXTENSION_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function normalizeCompanyLogo(value) {
    if (typeof value !== 'string') return '';
    const cleaned = value.trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'na') return '';
    return cleaned;
}

function getInitial(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return '?';
    return trimmed.charAt(0).toUpperCase();
}

function formatYoeRange(min, max) {
    const low = Number(min) || 0;
    const high = Number(max) || 0;
    if (low === 0 && high === 0) return '';
    if (low === 0) return `${high} yrs`;
    if (high === 0) return `${low} yrs`;
    if (low === high) return `${low} yrs`;
    return `${low}\u2013${high} yrs`;
}

function buildJobDetailsParts(job) {
    const parts = [];
    const place = job?.ModeOfWork ? ((job?.city ? job?.city + ', ' : '') + job?.ModeOfWork) : '';
    if (place) parts.push(place);
    const yoeText = formatYoeRange(job?.YearOfExp, job?.max_yoe);
    if (yoeText) parts.push(yoeText);
    return parts;
}

function formatPostedAgo(value) {
    if (!value) return '';
    const dt = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return '';
    const diffMs = Date.now() - dt.getTime();
    if (diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

function unwrapApiData(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) {
        return body.data;
    }
    return null;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Mirrors the JobAgentRecommendedJobsWidget formatter: keep JD HTML formatting
 *  but strip executable tags, and fall back to escaped plain text otherwise. */
function formatJobDescriptionHtml(raw, fallbackText) {
    const input = String(raw || '').trim();
    if (!input) {
        return `<p>${escapeHtml(fallbackText)}</p>`;
    }

    const safe = input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    if (/[<][a-zA-Z!/]/.test(safe)) {
        return safe;
    }

    return `<p>${escapeHtml(safe).replace(/\n/g, '<br/>')}</p>`;
}

/** 3D-style coloured icons for Important Actions tiles — uses Figma-exported
 *  SVG illustrations stored in public/images/talent/happpy-actions/.
 *  `framed: true` icons (download, settings) need an extra white frosted-glass
 *  square behind them; the others bake the frame into the SVG itself. */
const TILE_ICON_BASE = `${IMAGE_URL}outreach/`;
const TileIcons = {
    download: { src: `${TILE_ICON_BASE}tile-extension.png`, },
    review: { src: `${TILE_ICON_BASE}tile-review.png`, },
    settings: { src: `${TILE_ICON_BASE}tile-config.png`, },
    followUp: { src: `${TILE_ICON_BASE}tile-followup.png`, },
    heart: { src: `${TILE_ICON_BASE}tile-heart.png`, },
    pasteJobLink: { src: `${TILE_ICON_BASE}tile-paste-job-link.svg`, },
};

/** Exact 16px line icons from the "Your Next Moves" Figma card. Paths are
 *  inlined (rather than referenced from an asset bundle) so the row icons
 *  stay perfectly in sync with the design without an extra HTTP round-trip.
 *  All strokes use `currentColor` so the icon colour follows the CSS
 *  `color` set on `.happpy-dash__nm-icon`. */
const NextMovesIcons = {
    briefcase: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M14.2143 3.92773H1.64286C1.01167 3.92773 0.5 4.43941 0.5 5.07059V14.2134C0.5 14.8446 1.01167 15.3563 1.64286 15.3563H14.2143C14.8455 15.3563 15.3571 14.8446 15.3571 14.2134V5.07059C15.3571 4.43941 14.8455 3.92773 14.2143 3.92773Z"
                fill="#ffffff"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.3571 3.92857V1.64286C11.3571 1.33975 11.2367 1.04906 11.0224 0.834735C10.8081 0.620408 10.5174 0.5 10.2143 0.5H5.64286C5.33975 0.5 5.04906 0.620408 4.83473 0.834735C4.62041 1.04906 4.5 1.33975 4.5 1.64286V3.92857"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    chat: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M6.88606 0.568359C5.65256 0.743803 4.48332 1.22789 3.4868 1.97572C2.49028 2.72355 1.69873 3.71091 1.18556 4.84623C0.672397 5.98156 0.454228 7.22808 0.551288 8.47022C0.64835 9.71235 1.0575 10.9099 1.74079 11.9517L0.500007 15.2983L4.65493 14.5471C5.72331 15.0703 6.90226 15.3278 8.09151 15.2977C9.28077 15.2675 10.4452 14.9507 11.4857 14.374C12.5262 13.7973 13.4121 12.9778 14.0679 11.9853C14.7238 10.9928 15.1302 9.8566 15.2529 8.6733"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.4532 6.19167C14.025 6.19167 15.2991 4.91754 15.2991 3.34584C15.2991 1.77412 14.025 0.5 12.4532 0.5C10.8816 0.5 9.60743 1.77412 9.60743 3.34584C9.60743 4.91754 10.8816 6.19167 12.4532 6.19167Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    alertTriangle: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <g transform="translate(0.5 0.643)">
                <path
                    d="M6.23485 1.22936L0.675904 11.9415C0.561291 12.1707 0.500647 12.4304 0.500005 12.695C0.499363 12.9595 0.558746 13.2197 0.672246 13.4495C0.785745 13.6794 0.949405 13.8709 1.14694 14.0051C1.34448 14.1392 1.56901 14.2114 1.79819 14.2143H12.9161C13.1453 14.2114 13.3698 14.1392 13.5673 14.0051C13.7649 13.8709 13.9285 13.6794 14.042 13.4495C14.1555 13.2197 14.2149 12.9595 14.2143 12.695C14.2136 12.4304 14.153 12.1707 14.0384 11.9415L8.47943 1.22936C8.36243 1.00671 8.19769 0.822626 8.00111 0.694871C7.80453 0.567116 7.58274 0.5 7.35714 0.5C7.13155 0.5 6.90976 0.567116 6.71317 0.694871C6.51659 0.822626 6.35185 1.00671 6.23485 1.22936Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M7.35742 6.35742V9.02409"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M7.35742 11.6895H7.36444"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </g>
        </svg>
    ),
    clock: (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M7.92857 15.3571C12.0313 15.3571 15.3571 12.0313 15.3571 7.92857C15.3571 3.82589 12.0313 0.5 7.92857 0.5C3.82589 0.5 0.5 3.82589 0.5 7.92857C0.5 12.0313 3.82589 15.3571 7.92857 15.3571Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.92773 5.07031V7.92746L10.8306 11.3103"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    ),
    zap: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.63954 1.44203C6.97691 0.859696 7.60016 0.50069 8.27492 0.5L8.28437 0.518841C9.32853 0.518841 10.175 1.36236 10.175 2.4029V6.27463H12.1034C12.8019 6.27244 13.4446 6.65415 13.775 7.26736C14.1055 7.88056 14.0697 8.62535 13.6821 9.20434L9.38093 15.6666C8.9175 16.3539 8.05813 16.6591 7.26301 16.4188C6.46789 16.1785 5.92339 15.449 5.9211 14.621V11.9362H3.89814C3.22135 11.9389 2.59474 11.5809 2.25517 10.9974C1.91561 10.414 1.9149 9.69422 2.2533 9.11013L6.63954 1.44203ZM8.61526 2.04762C8.52457 1.95901 8.40191 1.91051 8.27492 1.91304C8.10184 1.91363 7.94416 2.01229 7.86844 2.16739L3.4822 9.81666C3.40197 9.96279 3.40515 10.1403 3.49058 10.2835C3.57601 10.4266 3.73098 10.5142 3.89814 10.5138H6.39376C6.91584 10.5138 7.33906 10.9355 7.33906 11.4558V14.6116C7.34158 14.8162 7.4764 14.9958 7.67268 15.056C7.86896 15.1162 8.08178 15.0432 8.1993 14.8753L12.5194 8.40361C12.6178 8.25844 12.6273 8.07079 12.5439 7.91651C12.4606 7.76222 12.2982 7.66681 12.1223 7.66883H9.70234C9.18026 7.66883 8.75703 7.24707 8.75703 6.7268V2.38406C8.75705 2.25749 8.70596 2.13623 8.61526 2.04762Z" fill="#6B6B6B" />
        </svg>
    ),
    mail: (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.96673 0.379794L12.8004 3.74462C13.5519 4.26821 13.9994 5.12156 14 6.03214V11.0199C13.9981 11.8121 13.6789 12.5712 13.1125 13.13C12.5461 13.6889 11.779 14.0018 10.9798 14H3.02016C2.22104 14.0018 1.4539 13.6889 0.887505 13.13C0.321115 12.5712 0.0018693 11.8121 0 11.0199V6.03214C0.000600309 5.12156 0.448104 4.26821 1.1996 3.74462L6.03327 0.379794C6.57654 -0.126598 7.42346 -0.126598 7.96673 0.379794ZM12.364 12.3881C12.7319 12.026 12.9397 11.5338 12.9415 11.0199V6.03214C12.9316 5.47418 12.6538 4.95439 12.1935 4.63305L7.35988 1.26822L7.28226 1.21226C7.20793 1.13705 7.1062 1.09468 7 1.09468C6.8938 1.09468 6.79207 1.13705 6.71774 1.21226L6.64012 1.26822L1.80645 4.63305C1.34624 4.95439 1.06835 5.47418 1.05847 6.03214V11.0199C1.06034 11.5338 1.26806 12.026 1.63595 12.3881C2.00384 12.7502 2.50176 12.9525 3.02016 12.9507H10.9798C11.4982 12.9525 11.9962 12.7502 12.364 12.3881Z" fill="#6B6B6B" />
            <path d="M11.2833 6.30496L7.37399 9.01221C7.25826 9.12698 7.09936 9.18849 6.93581 9.18184C6.77226 9.1752 6.61897 9.101 6.5131 8.97724L2.71673 6.30496C2.56423 6.17421 2.35005 6.14072 2.16436 6.21859C1.97867 6.29645 1.85374 6.47215 1.84217 6.6717C1.8306 6.87124 1.93441 7.05997 2.10988 7.15841L5.84979 9.8027C6.15646 10.0857 6.55983 10.2432 6.97883 10.2434C7.37289 10.2335 7.74855 10.0761 8.03024 9.8027L11.8901 7.13043C12.112 6.96761 12.1704 6.66304 12.0242 6.43088C11.8532 6.19562 11.5235 6.1396 11.2833 6.30496Z" fill="#6B6B6B" />
        </svg>
    ),
};

const ChevronDownIcon = (props) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M8 3.33399L8 12.6673" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12.668 8L8.0013 12.6667L3.33464 8" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
);

const ACCORDION_ICONS = {
    recommended: '/images/talent/happpy-agent/accordion-pending-action.png',
    activity: '/images/talent/happpy-agent/accordion-activity.png',
    interviews: '/images/talent/happpy-agent/accordion-interviews.png',
};

const PENDING_STEP_ICONS = {
    preferences: NextMovesIcons.zap,
    'email-scan': NextMovesIcons.mail,
    templates: NextMovesIcons.alertTriangle,
    extension: (
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1314_22023)">
                <path d="M7.30566 3.10547H12.2002C11.6772 2.40876 11.0185 1.81819 10.2637 1.37891C9.27764 0.805089 8.14882 0.500977 7 0.500977C5.09894 0.500977 3.32436 1.31691 2.08594 2.74902L3.51855 5.22949C4.17432 3.93992 5.50637 3.09277 7 3.09277C7.10068 3.09277 7.2032 3.09755 7.30566 3.10547ZM7.30566 3.10547C7.31667 3.10632 7.32786 3.10648 7.33887 3.10742H7.3457C7.33027 3.1059 7.3162 3.10547 7.30566 3.10547ZM6.03125 13.4287H6.0293L6.02734 13.4277C6.02865 13.4279 6.02992 13.4285 6.03125 13.4287ZM13.1426 4.87109C13.3796 5.55384 13.5 6.26862 13.5 7.00098C13.5 8.72506 12.8328 10.3469 11.6201 11.5723C10.5736 12.6296 9.22781 13.2829 7.77148 13.4541L10.2275 9.2002L10.2266 9.19922C10.671 8.54877 10.9082 7.78963 10.9082 7.00098C10.9082 6.23299 10.6865 5.49946 10.2754 4.87109H13.1426ZM3.47559 8.68652C4.12423 10.0378 5.50161 10.9092 7 10.9092C7.06882 10.9092 7.13747 10.9059 7.20605 10.9023L5.77246 13.3838C4.34989 13.1114 3.04984 12.3654 2.09082 11.2617C1.06493 10.0809 0.500011 8.56763 0.5 7.00098C0.5 6.11959 0.68177 5.24829 1.02539 4.44434L3.47559 8.68652ZM7 4.88477C8.16629 4.88477 9.11621 5.83459 9.11621 7.00098C9.11619 8.16728 8.16629 9.11719 7 9.11719C5.83358 9.11719 4.88381 8.16729 4.88379 7.00098C4.88379 5.83462 5.83359 4.88477 7 4.88477Z" fill="white" stroke="#6B6B6B" />
            </g>
            <defs>
                <clipPath id="clip0_1314_22023">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    ),
};

/** Compact mascot illustration shown on the right of the greeting row when
 *  the user has pending setup steps. Vector glyph so we don't rely on any
 *  new asset bundle; mirrors the playful "agent" Figma sticker. */
const MascotIllustration = () => (
    <svg
        width="84"
        height="66"
        viewBox="0 0 84 66"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <ellipse cx="42" cy="58" rx="34" ry="4" fill="#000" opacity="0.06" />
        <path
            d="M22 16c0-6 6-10 12-10 4 0 7 2 8 5 1-3 4-5 8-5 6 0 12 4 12 10v2c5 1 9 5 9 11 0 7-7 13-15 13H28c-8 0-15-6-15-13 0-6 4-10 9-11v-2z"
            fill="#6E59C7"
        />
        <circle cx="34" cy="34" r="3.5" fill="#fff" />
        <circle cx="50" cy="34" r="3.5" fill="#fff" />
        <circle cx="34.5" cy="34" r="1.6" fill="#1a1a1a" />
        <circle cx="50.5" cy="34" r="1.6" fill="#1a1a1a" />
        <path
            d="M38 41c1.4 1.6 3.6 2.6 4 2.6S45.6 42.6 47 41"
            stroke="#1a1a1a"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
        <path d="M22 22l-6-8" stroke="#6E59C7" strokeWidth="3" strokeLinecap="round" />
        <path d="M62 22l6-8" stroke="#6E59C7" strokeWidth="3" strokeLinecap="round" />
        <circle cx="16" cy="14" r="3" fill="#FF6B5B" />
        <circle cx="68" cy="14" r="3" fill="#FF6B5B" />
    </svg>
);

const HapppyDashboard = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { openReferFriendDrawer } = useJobAgentDashboardContext() || {};
    const dispatch = useDispatch();
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const { user } = useSelector((state) => state.auth);
    /** Single source of truth for outreach-step status — see
     *  store/reducers/happpyAgentReducer.js. The layout already dispatches
     *  fetchHapppyAgentPlan on mount so we can read directly without
     *  re-fetching here. */
    const happpyAgent = useSelector((state) => state.happpyAgent);
    const { resumeHealthControl } = useSelector((state) => state.resume);
    const resumeHealthRef = useRef(null);

    const [statsLoading, setStatsLoading] = useState(true);
    const [positiveResponses, setPositiveResponses] = useState(0);
    const [unseenReplies, setUnseenReplies] = useState(0);
    const [queueCount, setQueueCount] = useState(0);
    const [tailoredCount, setTailoredCount] = useState(0);
    const [totalJobsRunCount, setTotalJobsRunCount] = useState(0);
    const [reminderCount, setReminderCount] = useState(0);
    /** From get-outreach-dashboard-data — false when skills, target roles, or company types are missing. */
    const [agentPrefFieldsSubmitted, setAgentPrefFieldsSubmitted] = useState(true);
    /** From get-outreach-dashboard-data — true when Gmail job-board email scan consent is on file. */
    const [consentEmailJobScan, setConsentEmailJobScan] = useState(true);
    /** From get-outreach-dashboard-data — true after talent/outreach/feedback submit. */
    const [hasSubmittedHapppyFeedback, setHasSubmittedHapppyFeedback] = useState(false);
    const [dashboardDataLoaded, setDashboardDataLoaded] = useState(false);

    const [manualOutreachHrs, setManualOutreachHrs] = useState([]);

    /** Reuse the same hook (and endpoint) JobAgentInterviewListWidget uses so
     *  the "Potential interviews" row stays in sync with the standalone widget. */
    const { companies: interviewCompanies, loading: interviewLoading } =
        useJobAgentInterviewList();

    const [interviewFeedbackOpen, setInterviewFeedbackOpen] = useState(false);

    const markInterviewFeedbackPromptSeen = useCallback(() => {
        try {
            sessionStorage.setItem(INTERVIEW_FEEDBACK_PROMPT_KEY, '1');
        } catch {
            /* ignore */
        }
    }, []);

    const dismissInterviewFeedbackPrompt = useCallback(() => {
        markInterviewFeedbackPromptSeen();
        setInterviewFeedbackOpen(false);
    }, [markInterviewFeedbackPromptSeen]);

    const completeInterviewFeedbackPrompt = useCallback(() => {
        markInterviewFeedbackPromptSeen();
        setHasSubmittedHapppyFeedback(true);
        setInterviewFeedbackOpen(false);
    }, [markInterviewFeedbackPromptSeen]);

    /** Deep link: /talent/job-agent?refer_friends=true opens ReferFriendDrawer, then strips the param. */
    useEffect(() => {
        if (!shouldOpenReferFriendsFromSearchParams(searchParams)) return;
        openReferFriendDrawer?.();
        const next = new URLSearchParams(searchParams);
        next.delete(REFER_FRIENDS_QUERY_KEY);
        setSearchParams(next, { replace: true });
    }, [searchParams, setSearchParams, openReferFriendDrawer]);

    useEffect(() => {
        if (
            interviewLoading
            || !dashboardDataLoaded
            || interviewCompanies.length === 0
            || hasSubmittedHapppyFeedback
        ) {
            return undefined;
        }

        let seen = false;
        try {
            seen = sessionStorage.getItem(INTERVIEW_FEEDBACK_PROMPT_KEY) === '1';
        } catch {
            seen = false;
        }
        if (seen) return undefined;

        const timer = window.setTimeout(() => {
            setInterviewFeedbackOpen(true);
        }, 3000);

        return () => window.clearTimeout(timer);
    }, [
        dashboardDataLoaded,
        hasSubmittedHapppyFeedback,
        interviewCompanies.length,
        interviewLoading,
    ]);

    const interviewFeedbackCompanyName = interviewCompanies[0]?.company_name || '';

    const [jobsLoading, setJobsLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [brokenLogos, setBrokenLogos] = useState({});
    const [queueingJobId, setQueueingJobId] = useState(null);
    const [queuedJobIds, setQueuedJobIds] = useState({});
    const [previewJob, setPreviewJob] = useState(null);
    const [pasteJobLinkOpen, setPasteJobLinkOpen] = useState(false);
    const [openAccordions, setOpenAccordions] = useState({
        recommended: true,
        activity: false,
    });
    const accordionsInitializedRef = useRef(false);
    const [jobModal, setJobModal] = useState({
        open: false,
        loading: false,
        title: '',
        company: '',
        descriptionHtml: '',
        applyUrl: '',
    });

    /** Local mirror so clicking "Download now" hides the row without waiting
     *  for the next outreach-step refresh. */
    const [extensionLocallyDownloaded, setExtensionLocallyDownloaded] = useState(() =>
        readExtensionDownloadedLocally(),
    );

    const { greeting, displayName } = useMemo(() => {
        const hour = new Date().getHours();
        let g = 'Good Evening';
        if (hour < 12) g = 'Good Morning';
        else if (hour < 17) g = 'Good Afternoon';

        if (isMobile) g = 'Hi';
        const first = user?.name?.trim()?.split(/\s+/)?.[0];
        return { greeting: g, displayName: first || 'Talent' };
    }, [user?.name]);

    const [manualPendingLoaded, setManualPendingLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setStatsLoading(true);
            try {
                const res = await GET_API(`${API_URL}talent/outreach/get-outreach-dashboard-data`);
                if (cancelled) return;
                const d = res?.data?.data || {};
                setPositiveResponses(Number(d.total_positive_replies) || 0);
                setUnseenReplies(Number(d.total_unseen_replies) || 0);
                setQueueCount(Number(d.jobs_in_queue) || 0);
                setTailoredCount(Number(d.total_tailored_resumes) || 0);
                setTotalJobsRunCount(Number(d.total_jobs_run) || 0);
                setReminderCount(Number(d.reminder_count) || 0);
                setAgentPrefFieldsSubmitted(d.agent_pref_fields_submitted);
                setConsentEmailJobScan(!!d.consent_email_job_scan);
                setHasSubmittedHapppyFeedback(!!d.has_submitted_happpy_feedback);
                setDashboardDataLoaded(true);
            } catch {
                /* keep defaults */
            } finally {
                if (!cancelled) setStatsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    /** Drives the "Review pending" row at the bottom of Your Next Moves —
     *  mirrors the loader used by JobAgentDashboardHome so both surfaces show
     *  the same pending companies. */
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await GET_API(
                    `${API_URL}talent/outreach/has-pending-action-manual-outreach-agent`,
                );
                if (cancelled) return;
                const body = res?.data;
                const payload = body?.data;
                if (
                    body?.status === 'success' &&
                    payload?.has_pending_action &&
                    Array.isArray(payload.hrs) &&
                    payload.hrs.length > 0
                ) {
                    setManualOutreachHrs(payload.hrs);
                } else {
                    setManualOutreachHrs([]);
                }
                setManualPendingLoaded(true);
            } catch {
                if (!cancelled) setManualOutreachHrs([]);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setJobsLoading(true);
            try {
                const res = await GET_API(`${API_GET_RECOMMENDED_JOBS}?limit=${RECOMMENDED_JOBS_LIMIT}`);
                if (cancelled) return;
                const data = unwrapApiData(res);
                setJobs(Array.isArray(data) ? data.slice(0, RECOMMENDED_JOBS_LIMIT) : []);
            } catch {
                if (!cancelled) setJobs([]);
            } finally {
                if (!cancelled) setJobsLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    /** Pending detection from the outreach-step payload + local extension flag.
     *  Mirrors the rules used by OutreachConfigure / Step3ExtensionInstall so
     *  the badge stays consistent with the actual setup state. */
    const raw = happpyAgent?.raw || null;
    const happpyAgentLoaded = !!happpyAgent?.loaded;

    const messageTemplatePending = useMemo(() => {
        if (!happpyAgentLoaded) return false;
        const status2 = !!raw?.status?.step2;
        const hasGmail = !!raw?.step2?.gmail_template;
        const hasLinkedIn = !!raw?.step2?.linkedin_template;
        return !(status2 || (hasGmail && hasLinkedIn));
    }, [happpyAgentLoaded, raw]);

    const extensionPending = useMemo(() => {
        if (!happpyAgentLoaded) return false;
        const serverDownloaded =
            !!raw?.status?.step3 || !!raw?.step3?.chrome_extension_download;
        return !serverDownloaded && !extensionLocallyDownloaded;
    }, [happpyAgentLoaded, raw, extensionLocallyDownloaded]);

    const preferencePending = useMemo(() => {
        if (!user || Object.keys(user).length === 0) return false;
        if (dashboardDataLoaded && !agentPrefFieldsSubmitted) return true;
        if (!(user?.last_preference_at || user?.last_preference_at === null)) return true;

        const lastPreferenceUpdate = differenceInMonths(
            new Date(),
            new Date(user.last_preference_at),
        );
        return lastPreferenceUpdate >= 3;
    }, [user?.status, user?.last_preference_at, dashboardDataLoaded, agentPrefFieldsSubmitted]);

    const preferenceMessage = useMemo(() => {
        const title = 'Profile update recommended';
        let description = 'Add your preferences for better referral results';

        if (dashboardDataLoaded && !agentPrefFieldsSubmitted) {
            description = 'Add your preferences for better referral results';
        } else if (user?.last_preference_at) {
            const monthsOld = differenceInMonths(
                new Date(),
                new Date(user.last_preference_at),
            );
            if (monthsOld >= 3) {
                description =
                    'Your preferences are over 3 months old. Update them for better referral results';
            }
        }

        return {
            title,
            description,
            setupLabel: `${title} - ${description}`,
        };
    }, [dashboardDataLoaded, agentPrefFieldsSubmitted, user?.last_preference_at]);

    const emailScanMessage = useMemo(
        () => ({
            title: 'Enable Email Scan',
            description:
                'Let Happpy Agent find jobs from your inbox and recommend referral-ready opportunities automatically',
            setupLabel:
                'Enable Email Scan - Let Happpy Agent find jobs from your inbox and recommend referral-ready opportunities automatically',
        }),
        [],
    );

    const emailScanPending = useMemo(
        () => dashboardDataLoaded && !consentEmailJobScan,
        [dashboardDataLoaded, consentEmailJobScan],
    );

    const pendingSteps = useMemo(() => {
        const list = [];
        if (preferencePending) {
            list.push({
                id: 'preferences',
                label: preferenceMessage.setupLabel,
                ctaLabel: 'UPDATE NOW',
                required: false,
                onClick: () => navigate('/talent/job-agent/update-profile'),
            });
        }
        if (emailScanPending) {
            list.push({
                id: 'email-scan',
                label: emailScanMessage.setupLabel,
                ctaLabel: 'CHECK IT OUT',
                required: false,
                onClick: () => navigate(EMAIL_SCAN_PATH),
            });
        }
        if (messageTemplatePending) {
            list.push({
                id: 'templates',
                label: 'Review your outreach message templates',
                ctaLabel: isMobile ? 'Review' : 'REVIEW NOW',
                required: true,
                onClick: () => navigate('/talent/job-agent/configure?tab=message-templates'),
            });
        }
        if (extensionPending) {
            list.push({
                id: 'extension',
                label: 'Download browser extension',
                ctaLabel: isMobile ? 'Download' : 'DOWNLOAD NOW',
                required: false,
                href: CHROME_EXTENSION_URL,
                external: true,
                onClick: () => {
                    markExtensionEngagement();
                    setExtensionLocallyDownloaded(true);
                },
            });
        }
        return list;
    }, [
        messageTemplatePending,
        extensionPending,
        preferencePending,
        preferenceMessage.setupLabel,
        emailScanPending,
        emailScanMessage.setupLabel,
        navigate,
    ]);

    /** Activity rows for the second accordion — replies, reminders, manual outreach. */
    const activityMoveRows = useMemo(() => {
        const rows = [];

        if (unseenReplies > 0) {
            rows.push({
                id: 'recruiters-replied',
                icon: NextMovesIcons.chat,
                title: `You have ${unseenReplies} new positive ${unseenReplies === 1 ? 'response' : 'responses'} `,
                description: 'Review now.',
                badge: { label: 'Positive reply' },
                ctaLabel: 'VIEW RESPONSES',
                ctaTo: REPLIES_PATH,
            });
        }

        if (reminderCount > 0) {
            rows.push({
                id: 'pending-action',
                icon: NextMovesIcons.alertTriangle,
                title: 'Pending action:',
                description: `You have ${reminderCount} pending recruiter ${reminderCount === 1 ? 'reply' : 'replies'} awaiting action`,
                inlineTitle: true,
                ctaLabel: 'RESPOND NOW',
                ctaTo: REMINDERS_PATH,
            });
        }

        if (manualOutreachHrs.length > 0) {
            rows.push({
                id: 'review-pending',
                icon: NextMovesIcons.clock,
                title: 'Review pending:',
                description: `You have ${manualOutreachHrs.length} job ${manualOutreachHrs.length === 1 ? 'referral is' : 'referrals are'} ready to be sent, waiting for your approval`,
                inlineTitle: true,
                chips: manualOutreachHrs.map((hr) => ({
                    name: hr.company_name || 'Company',
                    logo: hr.company_logo || '',
                })),
                ctaLabel: 'REVIEW OUTREACH',
                ctaTo: OUTREACH_REQUEST_PATH,
            });
        }

        return rows;
    }, [unseenReplies, reminderCount, manualOutreachHrs]);

    const interviewMoveRow = useMemo(() => {
        if (interviewLoading || interviewCompanies.length === 0) return null;
        return {
            id: 'potential-interviews',
            icon: NextMovesIcons.briefcase,
            title: 'Potential interviews',
            description:
                'you might have received interviews from a few companies because of HAPPPY',
            chips: interviewCompanies.map((c) => ({
                name: c.company_name || 'Company',
                logo: c.logo_url || '',
            })),
            ctaLabel: 'REVIEW NOW',
            ctaTo: INTERVIEW_LIST_PATH,
        };
    }, [interviewLoading, interviewCompanies]);

    const pendingCount = pendingSteps.length;
    const activityCount = activityMoveRows.length;
    const showNextMovesSection =
        dashboardDataLoaded &&
        manualPendingLoaded &&
        !interviewLoading &&
        (pendingCount > 0 || activityCount > 0 || interviewMoveRow);

    const toggleAccordion = useCallback((key) => {
        setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
    }, []);

    useEffect(() => {
        if (!showNextMovesSection || accordionsInitializedRef.current) return;
        accordionsInitializedRef.current = true;
        setOpenAccordions({
            recommended: pendingCount > 0,
            activity: pendingCount === 0 && activityCount > 0,
        });
    }, [showNextMovesSection, pendingCount, activityCount]);

    const handleStatClick = (key) => {
        if (key === 'positive-responses' && positiveResponses > 0) {
            navigate('/talent/job-agent/my-activity?tab=replies');
        } else if (key === 'jobs-in-queue' && queueCount > 0) {
            navigate('/talent/job-agent/my-activity?tab=jobs-in-queue');
        } else if (key === 'tailored-resumes' && tailoredCount > 0) {
            navigate('/talent/job-agent/tailor-resume');
        } else if (key === 'total-referrals' && totalJobsRunCount > 0) {
            navigate('/talent/job-agent/my-activity?tab=activity');
        }
    };

    const handleRunAgentClick = (job) => {
        if (!job || job.id == null) return;
        setPreviewJob(job);
    };

    const closeRunAgentPreview = useCallback(() => setPreviewJob(null), []);

    /** Open the inline job-description modal (parity with
     *  JobAgentRecommendedJobsWidget). Fetches details via API_SINGLE_OPP using
     *  the row's HR_Number and renders the JD HTML safely. */
    const openJobDescription = useCallback(async (job) => {
        const defaultDescription = 'Job description is not available for this role right now.';
        setJobModal({
            open: true,
            loading: true,
            title: job?.RequestForTalent || 'Role',
            company: job?.company_name || 'Company',
            descriptionHtml: `<p>${escapeHtml(defaultDescription)}</p>`,
            applyUrl: job?.apply_url || '',
        });

        try {
            const hrNumber = job?.HR_Number;
            if (!hrNumber) {
                setJobModal((prev) => ({ ...prev, loading: false }));
                return;
            }
            const response = await GET_API(`${API_SINGLE_OPP}?hr_number=${encodeURIComponent(hrNumber)}`);
            const payload = response?.data || {};
            const descriptionRaw =
                payload?.JobDescription ??
                payload?.job_description ??
                payload?.Description ??
                payload?.description ??
                payload?.job_details?.description ??
                payload?.hr_detail?.description ??
                payload?.hr_detail?.job_description ??
                '';

            setJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatJobDescriptionHtml(descriptionRaw, defaultDescription),
            }));
        } catch {
            setJobModal((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    const closeJobDescription = useCallback(() => {
        setJobModal((prev) => ({ ...prev, open: false }));
    }, []);

    const confirmRunAgent = useCallback(async ({ linkedin_message_id, gmail_message_id } = {}) => {
        if (previewJob?.id == null) {
            setPreviewJob(null);
            return;
        }
        const jobId = previewJob.id;
        setPreviewJob(null);
        setQueueingJobId(jobId);
        try {
            const payload = {
                job_id: jobId,
                source: QUEUE_ENDPOINT_SOURCE,
            };
            if (linkedin_message_id) payload.linkedin_message_id = linkedin_message_id;
            if (gmail_message_id) payload.gmail_message_id = gmail_message_id;
            await dispatch(submitAutoRunRequest(payload));
            setQueuedJobIds((prev) => ({ ...prev, [jobId]: true }));
        } catch {
            /* keep button enabled so the user can retry */
        } finally {
            setQueueingJobId(null);
        }
    }, [previewJob, dispatch]);

    const handleResumeHealthcheckTile = useCallback(() => {
        const handle = resumeHealthRef.current;
        if (!handle) return;
        // `open` picks REPORT when a previous report exists, LANDING otherwise.
        if (typeof handle.open === 'function') handle.open();
        else if (typeof handle.openLanding === 'function') handle.openLanding();
    }, []);

    const importantActions = [
        {
            id: 'extension',
            label: 'Download browser extension',
            icon: TileIcons.download,
            href: CHROME_EXTENSION_URL,
            external: true,
            onClick: () => {
                markExtensionEngagement();
                setExtensionLocallyDownloaded(true);
            },
        },
        {
            id: 'review',
            label: 'Review Outreach Messages',
            icon: TileIcons.review,
            to: '/talent/job-agent/configure?tab=message-templates',
        },
        {
            id: 'configure',
            label: 'Agent Configuration Settings',
            icon: TileIcons.settings,
            to: '/talent/job-agent/configure',
        },
        {
            id: 'follow',
            label: 'Follow-up Settings',
            icon: TileIcons.followUp,
            to: '/talent/job-agent/configure?tab=follow-up-settings',
        },
        {
            id: 'health',
            label: 'Resume Healthcheck',
            icon: TileIcons.heart,
            noClick: true,
        },
    ]

    const pageTitle = `Dashboard | Happpy Agent | Uplers`;

    const renderMoveRowText = (row) => {
        if (row.inlineTitle) {
            return (
                <>
                    <span className="happpy-dash__nm-text-strong">{row.title}</span> {row.description}
                </>
            );
        }
        return (
            <>
                <span className="happpy-dash__nm-text-strong">{row.title}</span>
                {row.description ? (
                    <>
                        <span aria-hidden> – </span>
                        {row.description}
                    </>
                ) : null}
            </>
        );
    };

    const renderMoveRowMeta = (row) => {
        if (!row.chips?.length && !row.time && !row.badge) return null;
        return (
            <div className="happpy-dash__nm-meta">
                {row.chips?.length ? (
                    <ul className="happpy-dash__nm-chips" aria-label="Companies">
                        {row.chips.slice(0, NEXT_MOVES_CHIP_LIMIT).map((chip, idx) => (
                            <li
                                key={`${row.id}-chip-${idx}`}
                                className="happpy-dash__nm-chip"
                                title={chip.name}
                            >
                                {chip.logo ? (
                                    <img
                                        src={chip.logo}
                                        alt=""
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span className="happpy-dash__nm-chip-fallback">
                                        {getInitial(chip.name)}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : null}
                {row.time ? <span className="happpy-dash__nm-time">{row.time}</span> : null}
                {row.badge ? (
                    <>
                        {row.time ? <span className="happpy-dash__nm-dot" aria-hidden /> : null}
                        <span className="happpy-dash__nm-badge">{row.badge.label}</span>
                    </>
                ) : null}
            </div>
        );
    };

    const renderAccordionActivityRow = (row) => (
        <li key={row.id} className="happpy-dash__acc-row">
            <div className="happpy-dash__acc-row-main">
                <span className="happpy-dash__nm-icon" aria-hidden>
                    {row.icon}
                </span>
                <div className="happpy-dash__nm-body">
                    <p className="happpy-dash__nm-text jad-font-body">{renderMoveRowText(row)}</p>
                    {renderMoveRowMeta(row)}
                </div>
            </div>
            <Link to={row.ctaTo} className="happpy-dash__acc-cta jad-font-headline">
                <span>{row.ctaLabel}</span>
                <ArrowRightIcon />
            </Link>
        </li>
    );

    const renderAccordionPendingRow = (step) => (
        <li key={step.id} className="happpy-dash__acc-row">
            <div className="happpy-dash__acc-row-main">
                <span className="happpy-dash__nm-icon" aria-hidden>
                    {PENDING_STEP_ICONS[step.id] || NextMovesIcons.zap}
                </span>
                <div className="happpy-dash__nm-body">
                    <p className="happpy-dash__nm-text jad-font-body">
                        {step.label}
                        {step.required ? (
                            <span className="happpy-dash__setup-step-required">
                                <span aria-hidden="true">!</span> Required
                            </span>
                        ) : null}
                    </p>
                </div>
            </div>
            {step.href ? (
                <a
                    className="happpy-dash__acc-cta jad-font-headline"
                    href={step.href}
                    target={step.external ? '_blank' : undefined}
                    rel={step.external ? 'noopener noreferrer' : undefined}
                    onClick={step.onClick}
                >
                    <span>{step.ctaLabel}</span>
                    <ArrowRightIcon />
                </a>
            ) : (
                <button
                    type="button"
                    className="happpy-dash__acc-cta jad-font-headline"
                    onClick={step.onClick}
                >
                    <span>{step.ctaLabel}</span>
                    <ArrowRightIcon />
                </button>
            )}
        </li>
    );

    const renderAccordionTrigger = ({ id, iconSrc, title, subtitle, isOpen, onToggle }) => (
        <button
            type="button"
            id={`happpy-dash-acc-trigger-${id}`}
            className="happpy-dash__acc-trigger"
            aria-expanded={isOpen}
            aria-controls={`happpy-dash-acc-panel-${id}`}
            onClick={onToggle}
        >
            <img className="happpy-dash__acc-icon" src={iconSrc} alt="" aria-hidden="true" />
            <p className="happpy-dash__acc-heading jad-font-body">
                <span className="happpy-dash__acc-heading-strong">{title}</span>
                {subtitle ? (
                    <>
                        <span className="happpy-dash__acc-heading-colon" aria-hidden>
                            :
                        </span>{' '}
                        <span className="happpy-dash__acc-heading-rest">{subtitle}</span>
                    </>
                ) : null}
            </p>
            <span
                className={`happpy-dash__acc-chevron${isOpen ? ' happpy-dash__acc-chevron--open' : ''}`}
                aria-hidden
            >
                <ChevronDownIcon />
            </span>
        </button>
    );

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    return (
        <div className="happpy-dash">
            <header className="happpy-dash__hero">
                <h1 className="happpy-dash__greeting jad-font-headline">
                    {greeting}, {displayName}
                </h1>
                {!happpyAgent?.planLoading ? (
                    <div className="happpy-dash__hero-limit">
                        <DailyReferralLimitTopnav
                            loading={happpyAgent?.dailyLimitLoading}
                            used={happpyAgent?.dailyUsed}
                            limit={happpyAgent?.dailyLimit}
                        />
                    </div>
                ) : null}
            </header>


            {jobsLoading ? (
                <section className="happpy-dash__jobs-card" aria-labelledby="happpy-dash-jobs-heading">
                    <header className="happpy-dash__jobs-head">
                        <h2
                            id="happpy-dash-jobs-heading"
                            className="happpy-dash__section-title jad-font-headline"
                        >
                            Recommended Jobs
                        </h2>
                    </header>

                    <div className="happpy-dash__jobs-scroll">
                        <ul className="happpy-dash__jobs-list" aria-busy>
                            {Array.from({ length: RECOMMENDED_JOBS_LIMIT }, (_, i) => i).map((key) => (
                                <li
                                    key={key}
                                    className="happpy-dash__job-card happpy-dash__job-card--skeleton"
                                    aria-hidden
                                >
                                    <div className="happpy-dash__job-card-top">
                                        <span className="happpy-dash__job-logo happpy-dash__skel happpy-dash__skel--logo" />
                                        <span className="happpy-dash__skel happpy-dash__skel--posted" />
                                    </div>
                                    <div className="happpy-dash__job-card-body">
                                        <span className="happpy-dash__skel happpy-dash__skel--title" />
                                        <span className="happpy-dash__skel happpy-dash__skel--company" />
                                        <span className="happpy-dash__skel happpy-dash__skel--details" />
                                    </div>
                                    <div className="happpy-dash__job-actions">
                                        <span className="happpy-dash__skel happpy-dash__skel--btn" />
                                        <span className="happpy-dash__skel happpy-dash__skel--btn" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            ) : jobs.length === 0 ? (
                <section
                    className="happpy-dash__anywhere"
                    aria-labelledby="happpy-dash-anywhere-heading"
                >
                    <div className="happpy-dash__anywhere-panel">
                        <header className="happpy-dash__anywhere-head">
                            <h2
                                id="happpy-dash-anywhere-heading"
                                className="happpy-dash__anywhere-title jad-font-headline"
                            >
                                Find referrals for any job, anywhere
                            </h2>
                            <p className="happpy-dash__anywhere-subtitle jad-font-body">
                                Most of our recommended jobs are in Product and IT,{' '}
                                <strong>but HAPPY works beyond our own job board!</strong>
                            </p>
                        </header>

                        <div className="happpy-dash__anywhere-cards">
                            <a
                                className="happpy-dash__anywhere-card"
                                href={CHROME_EXTENSION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    markExtensionEngagement();
                                    setExtensionLocallyDownloaded(true);
                                }}
                            >
                                <img
                                    className="happpy-dash__anywhere-card-icon"
                                    src={TileIcons.download.src}
                                    alt=""
                                    aria-hidden="true"
                                    width="48"
                                    height="48"
                                />
                                <div className="happpy-dash__anywhere-card-copy">
                                    <h3 className="happpy-dash__anywhere-card-title jad-font-headline">
                                        Run HAPPPY Agent on any job platform
                                    </h3>
                                    <p className="happpy-dash__anywhere-card-desc jad-font-body">
                                        Install our Browser Extension to use HAPPY on LinkedIn,
                                        Wellfound, Greenhouse, Lever and other career sites.
                                    </p>
                                </div>
                                <ArrowRightIcon className="happpy-dash__anywhere-card-arrow" />
                            </a>

                            <button
                                type="button"
                                className="happpy-dash__anywhere-card"
                                onClick={() => setPasteJobLinkOpen(true)}
                            >
                                <img
                                    className="happpy-dash__anywhere-card-icon"
                                    src={TileIcons.pasteJobLink.src}
                                    alt=""
                                    aria-hidden="true"
                                    width="48"
                                    height="48"
                                />
                                <div className="happpy-dash__anywhere-card-copy">
                                    <h3 className="happpy-dash__anywhere-card-title jad-font-headline">
                                        Pasting a job link below from any job board
                                    </h3>
                                    <p className="happpy-dash__anywhere-card-desc jad-font-body">
                                        HAPPY will identify the right people at that company and send
                                        personalised referral outreach messages on your behalf.
                                    </p>
                                </div>
                                <ArrowRightIcon className="happpy-dash__anywhere-card-arrow" />
                            </button>
                        </div>
                    </div>
                </section>
            ) : (
                <section className="happpy-dash__jobs-card" aria-labelledby="happpy-dash-jobs-heading">
                    <header className="happpy-dash__jobs-head">
                        <h2
                            id="happpy-dash-jobs-heading"
                            className="happpy-dash__section-title jad-font-headline"
                        >
                            Recommended Jobs
                        </h2>
                        <Link
                            to="/talent/job-agent/recommended-jobs"
                            className="happpy-dash__jobs-view-all jad-font-headline"
                        >
                            <span>VIEW ALL RECOMMENDED JOBS</span>
                            <ArrowRightIcon />
                        </Link>
                    </header>

                    <div className="happpy-dash__jobs-scroll">
                        <ul className="happpy-dash__jobs-list">
                            {jobs.map((job, idx) => {
                                const stableKey =
                                    job?.id != null
                                        ? `id-${job.id}`
                                        : job?.HR_Number != null
                                            ? `hr-${job.HR_Number}`
                                            : `idx-${idx}`;
                                const logoUrl = normalizeCompanyLogo(job.company_logo);
                                const showLogo = !!logoUrl && !brokenLogos[stableKey];
                                const detailParts = buildJobDetailsParts(job);
                                const postedAgo = formatPostedAgo(job.publish_datetime);
                                const isQueued = !!queuedJobIds[job.id];
                                const isQueueing = queueingJobId === job.id;
                                return (
                                    <li key={stableKey} className="happpy-dash__job-card">
                                        <div className="happpy-dash__job-card-top">
                                            <span className="happpy-dash__job-logo" aria-hidden>
                                                {showLogo ? (
                                                    <img
                                                        src={logoUrl}
                                                        alt=""
                                                        onError={() =>
                                                            setBrokenLogos((prev) => ({
                                                                ...prev,
                                                                [stableKey]: true,
                                                            }))
                                                        }
                                                    />
                                                ) : (
                                                    <span className="happpy-dash__job-logo-letter jad-font-headline">
                                                        {getInitial(job.company_name)}
                                                    </span>
                                                )}
                                            </span>
                                            {postedAgo ? (
                                                <span className="happpy-dash__job-posted jad-font-body">
                                                    <ClockIcon />
                                                    {postedAgo}
                                                </span>
                                            ) : null}
                                        </div>
                                        <div className="happpy-dash__job-card-body">
                                            <h3
                                                className="happpy-dash__job-title jad-font-body"
                                                title={job.RequestForTalent || 'Role'}
                                            >
                                                {job.RequestForTalent || 'Role'}
                                            </h3>
                                            <p className="happpy-dash__job-company jad-font-body">
                                                {job.company_name || 'Company'}
                                            </p>
                                            {detailParts.length > 0 ? (
                                                <p className="happpy-dash__job-details jad-font-body">
                                                    {detailParts.map((part, partIdx) => (
                                                        <React.Fragment key={part}>
                                                            {partIdx > 0 ? (
                                                                <span
                                                                    className="happpy-dash__job-details-dot"
                                                                    aria-hidden
                                                                />
                                                            ) : null}
                                                            <span>{part}</span>
                                                        </React.Fragment>
                                                    ))}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="happpy-dash__job-actions">
                                            {job.apply_url ? (
                                                <a
                                                    className="happpy-dash__job-btn happpy-dash__job-btn--ghost jad-font-headline"
                                                    href={job.apply_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    View Job
                                                </a>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="happpy-dash__job-btn happpy-dash__job-btn--ghost jad-font-headline"
                                                    onClick={() => openJobDescription(job)}
                                                >
                                                    View Job
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                className="happpy-dash__job-btn happpy-dash__job-btn--primary jad-font-headline"
                                                onClick={() => handleRunAgentClick(job)}
                                                disabled={isQueueing || isQueued || queueingJobId != null}
                                            >
                                                {isQueueing
                                                    ? 'Adding…'
                                                    : isQueued
                                                        ? 'In Queue'
                                                        : 'Run Agent'}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            <section className="happpy-dash__journey" aria-labelledby="happpy-dash-journey-heading">
                <h2
                    id="happpy-dash-journey-heading"
                    className="happpy-dash__section-title jad-font-headline"
                >
                    Your journey with Happpy Agent
                </h2>
                <div
                    className={`happpy-dash__stats${user?.is_product ? '' : ' happpy-dash__stats--three'}`}
                    aria-busy={statsLoading}
                >
                    <StatCard
                        label="Jobs ran by HAPPPY"
                        value={totalJobsRunCount}
                        loading={statsLoading}
                        onClick={() => handleStatClick('total-referrals')}
                        clickable={totalJobsRunCount > 0}
                    />
                    <StatCard
                        label="Jobs in Queue"
                        value={queueCount}
                        loading={statsLoading}
                        onClick={() => handleStatClick('jobs-in-queue')}
                        clickable={queueCount > 0}
                    />
                    <StatCard
                        label="Positive Responses"
                        value={positiveResponses}
                        loading={statsLoading}
                        onClick={() => handleStatClick('positive-responses')}
                        clickable={positiveResponses > 0}
                    />
                    {user?.is_product ? (
                        <StatCard
                            label="Resumes Tailored & Transformed"
                            value={tailoredCount}
                            loading={statsLoading}
                            onClick={() => handleStatClick('tailored-resumes')}
                            clickable={tailoredCount > 0}
                        />
                    ) : null}
                </div>
            </section>


            {showNextMovesSection ? (
                <div className="next-moves-wrapper">
                    <section
                        className="happpy-dash__next-moves"
                        aria-labelledby="happpy-dash-next-moves-heading"
                    >
                        <div className="happpy-dash__nm-bg" aria-hidden />
                        <h2
                            id="happpy-dash-next-moves-heading"
                            className="happpy-dash__nm-title jad-font-headline"
                        >
                            Your Next Moves
                        </h2>

                        <div className="happpy-dash__accordions">
                            {pendingCount > 0 ? (
                                <div
                                    className={`happpy-dash__acc${openAccordions.recommended ? ' happpy-dash__acc--open' : ''}`}
                                >
                                    {renderAccordionTrigger({
                                        id: 'recommended',
                                        iconSrc: ACCORDION_ICONS.recommended,
                                        title: `${pendingCount} Recommended Action${pendingCount === 1 ? '' : 's'}`,
                                        subtitle: "To enhance your referral experience",
                                        isOpen: openAccordions.recommended,
                                        onToggle: () => toggleAccordion('recommended'),
                                    })}
                                    {openAccordions.recommended ? (
                                        <div
                                            id="happpy-dash-acc-panel-recommended"
                                            className="happpy-dash__acc-panel"
                                            role="region"
                                            aria-labelledby="happpy-dash-acc-trigger-recommended"
                                        >
                                            <ul className="happpy-dash__acc-rows">
                                                {pendingSteps.map(renderAccordionPendingRow)}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {activityCount > 0 ? (
                                <div
                                    className={`happpy-dash__acc${openAccordions.activity ? ' happpy-dash__acc--open' : ''}`}
                                >
                                    {renderAccordionTrigger({
                                        id: 'activity',
                                        iconSrc: ACCORDION_ICONS.activity,
                                        title: `${activityCount} Important Pending Action${activityCount === 1 ? '' : 's'}`,
                                        subtitle: "Pending replies & approvals",
                                        isOpen: openAccordions.activity,
                                        onToggle: () => toggleAccordion('activity'),
                                    })}
                                    {openAccordions.activity ? (
                                        <div
                                            id="happpy-dash-acc-panel-activity"
                                            className="happpy-dash__acc-panel"
                                            role="region"
                                            aria-labelledby="happpy-dash-acc-trigger-activity"
                                        >
                                            <ul className="happpy-dash__acc-rows">
                                                {activityMoveRows.map(renderAccordionActivityRow)}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            {interviewMoveRow ? (
                                <Link
                                    to={interviewMoveRow.ctaTo}
                                    className="happpy-dash__acc happpy-dash__acc--link"
                                >
                                    <img
                                        className="happpy-dash__acc-icon"
                                        src={ACCORDION_ICONS.interviews}
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <p className="happpy-dash__acc-heading jad-font-body">
                                        <span className="happpy-dash__acc-heading-strong">
                                            {interviewMoveRow.title}
                                        </span>
                                        <span className="happpy-dash__acc-heading-colon" aria-hidden>
                                            :
                                        </span>{' '}
                                        <span className="happpy-dash__acc-heading-rest">
                                            {interviewMoveRow.description}
                                        </span>
                                    </p>
                                    <span className="happpy-dash__acc-chevron happpy-dash__acc-chevron--link" aria-hidden>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.33203 8H12.6654" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8 3.33398L12.6667 8.00065L8 12.6673" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </span>
                                </Link>
                            ) : null}
                        </div>
                    </section>
                </div>
            ) : null}

            <div className="happpy-dash__health-slot happpy-dash__health-slot--full">
                <HapppyAgentResumeHealth compact={false} />
            </div>

            <section className="happpy-dash__actions" aria-labelledby="happpy-dash-actions-heading">
                <h2
                    id="happpy-dash-actions-heading"
                    className="happpy-dash__section-title jad-font-headline"
                >
                    Important Actions
                </h2>
                <div className="happpy-dash__action-tiles-scroll">
                    <ul className="happpy-dash__action-tiles">
                        {importantActions.map((action) => {
                            const tileClass = 'happpy-dash__action-tile';
                            const inner = (
                                <>
                                    <span className="happpy-dash__action-icon">
                                        <img
                                            src={action.icon.src}
                                            alt=""
                                            aria-hidden="true"
                                            className="happpy-dash__action-icon-img"
                                        />
                                    </span>
                                    <span className="happpy-dash__action-label jad-font-body">
                                        {action.label}
                                    </span>
                                </>
                            );
                            return (
                                <li key={action.id} className="happpy-dash__action-tile-wrap">
                                    {action.href ? (
                                        <a
                                            className={tileClass}
                                            href={action.href}
                                            target={action.external ? '_blank' : undefined}
                                            rel={action.external ? 'noopener noreferrer' : undefined}
                                            onClick={action.onClick}
                                        >
                                            {inner}
                                        </a>
                                    ) : action.to ? (
                                        <Link
                                            className={tileClass}
                                            to={action.to}
                                            onClick={action.onClick}
                                        >
                                            {inner}
                                        </Link>
                                    ) : (
                                        <div
                                            className={`${tileClass} happpy-dash__action-tile--btn${action.noClick ? ' happpy-dash__action-tile--static' : ''}`}
                                        >
                                            {inner}
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <section
                className="happpy-dash__extension-tip"
                aria-labelledby="happpy-dash-extension-tip-heading"
            >
                <div className="happpy-dash__extension-tip-inner">
                    <div className="happpy-dash__extension-tip-copy">
                        <img
                            className="happpy-dash__extension-tip-mascot"
                            src={`${IMAGE_URL}outreach/mascot-pointer.svg`}
                            alt=""
                            aria-hidden="true"
                            width={63}
                            height={54}
                        />
                        <div className="happpy-dash__extension-tip-text">
                            <h2
                                id="happpy-dash-extension-tip-heading"
                                className="happpy-dash__extension-tip-title jad-font-body"
                            >
                                Did you know? I can help with referrals on any live job listing
                            </h2>
                            <p className="happpy-dash__extension-tip-desc jad-font-body">
                                Just install the Happpy Agent extension, open any job listing, and click
                                the floating Happpy Agent button to get started
                            </p>
                        </div>
                    </div>
                    <ul className="happpy-dash__extension-tip-chips" aria-label="Supported job platforms">
                        {EXTENSION_TIP_PLATFORMS.map((platform) => {
                            const Logo = platform.Logo;
                            return (
                                <li
                                    key={platform.id}
                                    className={`happpy-dash__extension-tip-chip happpy-dash__extension-tip-chip--${platform.id}`}
                                >
                                    {Logo ? (
                                        <span className="happpy-dash__extension-tip-chip-icon" aria-hidden>
                                            <Logo />
                                        </span>
                                    ) : null}
                                    {platform.logoSrc ? (
                                        <img
                                            className="happpy-dash__extension-tip-chip-icon happpy-dash__extension-tip-chip-icon--img"
                                            src={platform.logoSrc}
                                            alt=""
                                            width={15}
                                            height={15}
                                        />
                                    ) : null}
                                    <span>{platform.label}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {previewJob ? (
                <ReferralAgentPreviewModal
                    isOpen={!!previewJob}
                    onClose={closeRunAgentPreview}
                    onConfirm={confirmRunAgent}
                    selectedResume="profile"
                    noTailorHTML={true}
                    HR_Number={previewJob?.HR_Number}
                />
            ) : null}

            {jobModal.open ? (
                <div
                    className="happpy-dash__job-modal-backdrop"
                    role="presentation"
                    onClick={closeJobDescription}
                >
                    <div
                        className="happpy-dash__job-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Job description"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="happpy-dash__job-modal-head">
                            <div className="happpy-dash__job-modal-head-text">
                                <h3 className="happpy-dash__job-modal-title jad-font-headline">
                                    {jobModal.title}
                                </h3>
                                <p className="happpy-dash__job-modal-company jad-font-body">
                                    {jobModal.company}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="happpy-dash__job-modal-close"
                                onClick={closeJobDescription}
                                aria-label="Close job description"
                            >
                                ×
                            </button>
                        </div>

                        <div className="happpy-dash__job-modal-body">
                            {jobModal.loading ? (
                                <p className="happpy-dash__job-modal-text">Loading description…</p>
                            ) : (
                                <div
                                    className="happpy-dash__job-modal-text"
                                    dangerouslySetInnerHTML={{ __html: jobModal.descriptionHtml }}
                                />
                            )}
                        </div>

                        {jobModal.applyUrl ? (
                            <div className="happpy-dash__job-modal-foot">
                                <a
                                    className="happpy-dash__job-modal-open-link jad-font-headline"
                                    href={jobModal.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open full job
                                    <ArrowRightIcon />
                                </a>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <PasteJobLinkDrawer
                open={pasteJobLinkOpen}
                onClose={() => setPasteJobLinkOpen(false)}
            />

            <InterviewFeedbackModal
                open={interviewFeedbackOpen}
                companyName={interviewFeedbackCompanyName}
                onClose={dismissInterviewFeedbackPrompt}
                onSubmitted={completeInterviewFeedbackPrompt}
            />
        </div>
    );
};

const StatCard = ({ label, value, loading, onClick, clickable }) => {
    const Wrapper = clickable && onClick ? 'button' : 'div';
    const wrapperProps =
        clickable && onClick
            ? {
                type: 'button',
                onClick,
                className: 'happpy-dash__stat happpy-dash__stat--clickable',
            }
            : { className: 'happpy-dash__stat' };
    return (
        <Wrapper {...wrapperProps}>
            {loading ? (
                <span className="happpy-dash__skel happpy-dash__skel--value" aria-hidden />
            ) : (
                <span className="happpy-dash__stat-value jad-font-headline">{value}</span>
            )}
            <span className="happpy-dash__stat-label jad-font-body">{label}</span>
        </Wrapper>
    );
};

export default HapppyDashboard;
