'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useLocation, useNavigate } from '@/talent/navigation/routerCompat';
import { differenceInMonths } from 'date-fns';
import { identityReset } from '../../../helpers/Mixpanel';
import { fetchHapppyAgentPlan, logoutUser, fetchHapppyAgentDailyLimit, syncHapppyAgentDailyLimitFromStorage } from '../../../store/actions/UserActions';
import { HAPPPY_AGENT_DASHBOARD_CACHE_KEY } from '../../../helpers/happpyAgentDailyLimit';
import { API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS_PENDING } from '../../../components/Constant';
import { GET_API } from '../../../components/Helper';
import HapppyAgentLogo from '../../../components/common/HapppyAgentLogo';
import MatcherModalProvider from '../../../components/common/MatcherQueryModal';
import DailyReferralLimitTopnav from '../../../components/DailyReferralLimitWidget';
import ReferFriendDrawer, { ReferFriendTrigger } from './ReferFriendDrawer';
import LeaveReviewDrawer from './LeaveReviewDrawer';
import UpgradePlanDrawer from '../happpy-agent/configure-tabs/UpgradePlanDrawer';
import HappyAgentTemplateDrawer from '../agent-onboarding/HappyAgentTemplateDrawer';
import { JobAgentDashboardProvider } from './JobAgentDashboardContext';
import {
    clearOnboardingTemplatePending,
    clearPublicSignupHandoff,
    isOnboardingTemplatePending,
} from '../../../helpers/happyAgentPublicSignupSession';
import {
    AUTO_REPLY_TAB_SEEN_EVENT,
    readAutoReplyTabSeen,
} from '../happpy-agent/autoReplyTabSeen';
import './JobAgentDashboard.css';
function unwrapJobAgentApiPayload(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) {
        return body.data;
    }
    return null;
}

/** Same listing as outreach / job referral flows — Happpy Agent job journey on the web */
const CHROME_EXTENSION_URL =
    'https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en';

const CHROME_ICON_URL =
    'https://img.icons8.com/?size=100&id=PfmQUI56Ji0D&format=png&color=000000';

/**
 * Happpy Agent submenu — routes align with outreach surfaces.
 * `id` is required where two labels share the same `to` (React keys).
 * Order: inbound (Replies) → nurture (Follow-ups) → queue → manual → external job link.
 */
const REFERRAL_AGENT_SUBLINKS = [
    { id: 'job-applications', to: '/talent/job-agent/job-applications', label: 'Replies' },
    { id: 'follow', to: '/talent/job-agent/follow', label: 'Follow-ups' },
    { id: 'pending-job', to: '/talent/job-agent/pending-jobs', label: 'Queue Job' },
    // { id: 'outreach-request', to: '/talent/job-agent/outreach-request', label: 'Manual Outreach' },
    // { id: 'external-jobs', to: '/talent/job-agent/external-jobs', label: 'Paste Job Link' },
];

function isReferralAgentSectionPath(pathname) {
    if (pathname.startsWith('/talent/job-agent/job-referral')) return true;
    if (pathname.startsWith('/talent/job-agent/pending-jobs')) return true;
    if (pathname.startsWith('/talent/job-agent/outreach-request')) return true;
    if (pathname.startsWith('/talent/verify-outreach-person')) return true;
    return REFERRAL_AGENT_SUBLINKS.some(({ to }) => pathname === to);
}

/** Single Subscription sidebar route — surfaced as the yellow Upgrade/My Plan/Renew Plan pill.
 *  Transactions are now embedded inside the Subscription page itself, so the previous accordion
 *  with the `transaction` sublink has been retired in favour of one direct link. */
const SUBSCRIPTION_LINK_PATH = '/talent/job-agent/subscription';

const HELP_GUIDE_LINK_PATH = '/talent/job-agent/need-help';

const CONFIGURE_LINK_PATH = '/talent/job-agent/configure';
const UPDATE_PROFILE_PATH = '/talent/job-agent/update-profile';

/** Figma 2148:54619 — sidenav footer icons */
const SIDENAV_LEAVE_REVIEW_SPARKLE_SRC =
    '/images/talent/outreach/sidenav-leave-review-sparkle.svg';
const SIDENAV_LOGOUT_ICON_SRC = '/images/talent/outreach/sidenav-logout-icon.svg';
const SIDENAV_NEED_HELP_ICON_SRC = '/images/talent/outreach/sidenav-need-help-icon.svg';

function isSubscriptionSectionPath(pathname) {
    return (
        pathname === SUBSCRIPTION_LINK_PATH ||
        pathname.startsWith(`${SUBSCRIPTION_LINK_PATH}/`) ||
        // Keep the legacy /payments deep-link active-marked while it still exists in the app.
        pathname === '/talent/job-agent/payments' ||
        pathname.startsWith('/talent/job-agent/payments/')
    );
}

/**
 * Yellow pill CTA copy by plan state — matches the Figma:
 *  - never paid (no plan / on free trial / trial expired) → "Upgrade Plan"
 *  - active paid plan                                     → "My Plan"
 *  - paid plan expired                                    → "Renew Plan"
 */
function planCtaLabel({ plan, hasExpired, loaded, creditPlan = 0, creditLeft = 0 }) {
    /** Optimistic default during initial load — see lockOutreachSideNav for the same idea.
     *  Free-trial users will see a brief "My Plan" → "Upgrade Plan" flip when the API
     *  resolves, which is preferable to a "Loading…" placeholder per product. */
    if (!loaded) return 'My Plan';
    if (Number(creditPlan) === 1 && Number(creditLeft) > 0) return 'My Plan';
    const planNumber = Number(plan);
    if (planNumber === 2 && !hasExpired) return 'My Plan';
    if (planNumber === 2 && hasExpired) return 'Renew Plan';
    return 'Upgrade Plan';
}

/** Topnav gradient CTA (Figma 28447:30904) — trial, expired, or no plan. Active paid → Chrome ext. */
function shouldShowTopnavPlanUpgradeCta({ plan, hasExpired, planLoading, creditPlan = 0, creditLeft = 0 }) {
    if (planLoading) return false;
    if (Number(creditPlan) === 1 && Number(creditLeft) > 0) return false;
    if (plan == null || plan === '') return false;
    const planNumber = Number(plan);
    if (planNumber === 2 && !hasExpired) return false;
    return true;
}

function topnavPlanUpgradeCtaLabel({ plan, hasExpired }) {
    const planNumber = Number(plan);
    if (planNumber === 2 && hasExpired) return 'Renew plan';
    return 'Upgrade plan';
}

/** White bolt — Figma Bold / Essentional, UI / Bolt (28447:30905). */
const TopnavPlanUpgradeBoltIcon = () => (
    <svg
        className="job-agent-dashboard__topnav-plan-upgrade-btn-icon"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
            fill="currentColor"
        />
    </svg>
);

function TopnavPlanUpgradeCta({ plan, hasExpired }) {
    const label = topnavPlanUpgradeCtaLabel({ plan, hasExpired });

    return (
        <Link
            to={SUBSCRIPTION_LINK_PATH}
            className="job-agent-dashboard__topnav-plan-upgrade-btn job-agent-dashboard__topnav-utility jad-font-headline"
            aria-label={label}
        >
            <TopnavPlanUpgradeBoltIcon />
            <span className="job-agent-dashboard__topnav-plan-upgrade-btn-label">{label}</span>
        </Link>
    );
}

/** Up-arrow-in-circle icon from the Figma (Streamline Core, flipped). The circle + arrow are
 *  stroked with `currentColor` by default so it sits next to other Material Symbols Outlined
 *  icons in the sidebar (Figma 28478:7665). When the CTA is the active route, CSS swaps to a
 *  filled black circle with a white arrow (Figma 28515:53878 / 28501:48991). Stand-alone SVG so
 *  the layout doesn't depend on Material Symbols or external assets that expire. */
const PlanCtaIcon = () => (
    <svg
        className="job-agent-dashboard__sidenav-plan-cta-icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle
            className="job-agent-dashboard__sidenav-plan-cta-icon-circle"
            cx="10"
            cy="10"
            r="8.5"
        />
        <path
            className="job-agent-dashboard__sidenav-plan-cta-icon-arrow"
            d="M10 14V6.5M10 6.5L6.75 9.75M10 6.5L13.25 9.75"
        />
    </svg>
);

const RECOMMENDED_JOBS_PATH = '/talent/job-agent/recommended-jobs';

/** Primary sidebar (above Referral block): overview → setup → reminders → activity → resumes. */
const navItems = [
    { to: '/talent/job-agent', label: 'Dashboard', end: true, icon: 'dashboard' },
    { to: CONFIGURE_LINK_PATH, label: 'Configure', end: false, icon: 'tune' },
    // { to: '/talent/job-agent/missed-replies', label: 'Reminders', end: true, icon: 'notifications' },
    // { to: '/talent/job-agent/jobs', label: 'Activity', end: false, icon: 'history' },
    { to: '/talent/job-agent/my-activity', label: 'My Activity', end: false, icon: 'inventory_2' },
    { to: RECOMMENDED_JOBS_PATH, label: 'Jobs', end: true, icon: 'work' },
    { to: '/talent/job-agent/tailor-resume', label: 'Resumes', end: false, icon: 'edit_document' },
];

/** Mobile bottom bar — Figma 28973:14793 (<768px). Primary routes only; overflow lives in the drawer. */
const MOBILE_BOTTOM_NAV_ITEMS = [
    { id: 'home', to: '/talent/job-agent', label: 'Home', end: true, icon: 'home' },
    { id: 'jobs', to: '/talent/job-agent/recommended-jobs', label: 'Jobs', end: true, icon: 'work' },
    { id: 'activity', to: '/talent/job-agent/my-activity', label: 'My Activity', end: false, icon: 'inventory_2' },
    { id: 'resumes', to: '/talent/job-agent/tailor-resume', label: 'My Resumes', end: false, icon: 'edit_document' },
    { id: 'configure', to: CONFIGURE_LINK_PATH, label: 'Configure', end: false, icon: 'tune' },
];

function isMobileBottomNavActive(item, pathname) {
    const p = pathname.replace(/\/+$/, '') || '/';
    switch (item.id) {
        case 'home':
            return p === '/talent/job-agent';
        case 'jobs':
            return (
                p === RECOMMENDED_JOBS_PATH ||
                p.startsWith(`${RECOMMENDED_JOBS_PATH}/`) ||
                p === '/talent/job-agent/all-jobs' ||
                p.startsWith('/talent/job-agent/all-jobs/')
            );
        case 'activity':
            return p.startsWith('/talent/job-agent/my-activity');
        case 'resumes':
            return p.startsWith('/talent/job-agent/tailor-resume');
        case 'configure':
            return p === CONFIGURE_LINK_PATH || p.startsWith(`${CONFIGURE_LINK_PATH}/`);
        default:
            return false;
    }
}

function mobileBottomNavTarget(item, lockOutreachSideNav) {
    if (lockOutreachSideNav && item.id !== 'configure') {
        return `${CONFIGURE_LINK_PATH}?tab=connected-accounts`;
    }
    return item.to;
}

/** Mobile drawer nav — Figma 28973:30190 (overflow items + full nav list). */
const MOBILE_DRAWER_NAV_ITEMS = [
    { id: 'dashboard', to: '/talent/job-agent', label: 'Dashboard', end: true, icon: 'home' },
    { id: 'activity', to: '/talent/job-agent/my-activity', label: 'My Activity', end: false, icon: 'description' },
    { id: 'jobs', to: RECOMMENDED_JOBS_PATH, label: 'Jobs', end: true, icon: 'work' },
    { id: 'resumes', to: '/talent/job-agent/tailor-resume', label: 'My Resumes', end: false, icon: 'edit_document' },
    { id: 'configure', to: CONFIGURE_LINK_PATH, label: 'Configure', end: false, icon: 'tune' },
    { id: 'profile', to: UPDATE_PROFILE_PATH, label: 'Profile', end: false, icon: 'manage_accounts' },
    { id: 'need-help', to: HELP_GUIDE_LINK_PATH, label: 'Help', end: false, icon: 'need-help' },
    { id: 'my-plan', to: SUBSCRIPTION_LINK_PATH, label: 'my-plan', end: false, icon: 'plan-cta' },
];

function isMobileDrawerNavActive(item, pathname) {
    if (item.id === 'my-plan') return isSubscriptionSectionPath(pathname);
    if (item.id === 'need-help') return isHelpGuidePath(pathname);
    if (item.id === 'profile') {
        return pathname === UPDATE_PROFILE_PATH || pathname.startsWith(`${UPDATE_PROFILE_PATH}/`);
    }
    const p = pathname.replace(/\/+$/, '') || '/';
    const target = item.to.replace(/\/+$/, '') || '/';
    if (item.end) return p === target;
    return p === target || p.startsWith(`${target}/`);
}

function isHelpGuidePath(pathname) {
    return (
        pathname === HELP_GUIDE_LINK_PATH ||
        pathname.startsWith(`${HELP_GUIDE_LINK_PATH}/`) ||
        pathname === '/talent/job-agent/help-guide' ||
        pathname.startsWith('/talent/job-agent/help-guide/')
    );
}

/**
 * Need help? — above My/Upgrade Plan in the sidenav (Figma 2148:54604).
 */
function SidenavNeedHelpLink({ helpActive, onNavigate, className = '' }) {
    return (
        <NavLink
            to={HELP_GUIDE_LINK_PATH}
            className={({ isActive }) =>
                `job-agent-dashboard__sidenav-link jad-font-headline${
                    isActive || helpActive ? ' job-agent-dashboard__sidenav-link--active' : ''
                }${className ? ` ${className}` : ''}`
            }
            aria-current={helpActive ? 'page' : undefined}
            onClick={onNavigate}
        >
            <span className="job-agent-dashboard__sidenav-inline-icon" aria-hidden="true">
                <img src={SIDENAV_NEED_HELP_ICON_SRC} alt="" width={20} height={20} />
            </span>
            <span className="job-agent-dashboard__sidenav-link-label">Help</span>
        </NavLink>
    );
}

/** Compact leave-a-review row — Figma 2164:57443. */
function SidenavLeaveReviewLink({ onLeaveReview, className = '' }) {
    return (
        <button
            type="button"
            className={`job-agent-dashboard__sidenav-leave-review${className ? ` ${className}` : ''}`}
            aria-label="Leave a review"
            onClick={onLeaveReview}
        >
            <img
                className="job-agent-dashboard__sidenav-leave-review-icon"
                src={SIDENAV_LEAVE_REVIEW_SPARKLE_SRC}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
            />
            <span className="job-agent-dashboard__sidenav-leave-review-text-wrap">
                <span className="job-agent-dashboard__sidenav-leave-review-text">
                    Enjoying HAPPPY? Leave a review
                </span>
                <span className="job-agent-dashboard__sidenav-leave-review-underline" aria-hidden="true" />
            </span>
        </button>
    );
}

/** Logout pill — Figma 2148:54628. */
function SidenavLogoutButton({ onClick, className = '' }) {
    return (
        <button
            type="button"
            className={`job-agent-dashboard__sidenav-logout-btn jad-font-headline${
                className ? ` ${className}` : ''
            }`}
            onClick={onClick}
        >
            <img
                className="job-agent-dashboard__sidenav-logout-btn-icon"
                src={SIDENAV_LOGOUT_ICON_SRC}
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
            />
            <span>Logout</span>
        </button>
    );
}

/**
 * Sidenav footer — refer card, logout pill, compact leave-a-review (Figma 2148:54619).
 */
function SidenavBottomSection({
    lockOutreachSideNav,
    onReferFriend,
    onLeaveReview,
    onLogout,
    referFriendClassName = '',
    className = '',
}) {
    return (
        <div
            className={`job-agent-dashboard__sidenav-bottom${
                className ? ` ${className}` : ''
            }`}
        >
            <div className="job-agent-dashboard__sidenav-bottom-actions">
                {!lockOutreachSideNav ? (
                    <ReferFriendTrigger onClick={onReferFriend} className={referFriendClassName} />
                ) : null}
                <SidenavLogoutButton onClick={onLogout} />
            </div>
            <SidenavLeaveReviewLink onLeaveReview={onLeaveReview} />
        </div>
    );
}

function mobileDrawerNavTarget(item, lockOutreachSideNav) {
    if (
        lockOutreachSideNav &&
        item.id !== 'configure' &&
        item.id !== 'profile' &&
        item.id !== 'need-help'
    ) {
        return `${CONFIGURE_LINK_PATH}?tab=connected-accounts`;
    }
    return item.to;
}

/** Shown inside the outreach block (after connections): Happpy Agent, then Top Jobs. */
const TOP_JOBS_NAV_ITEM = {
    to: '/talent/job-agent/recommended-jobs',
    label: 'Top Jobs',
    end: true,
    icon: 'work',
};

const TOPNAV_AVATAR =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAYkM9x8O9c6NFeOvkE0VkyHeI2pf65b3zCmfa6468UF1eoYRw3WrLsATjVhNjWf2CDMgCjtZZPGlXfELmCd16TpEbfnU0v-k-fiHBxUrVTajTFHEIiGbWVtGd8ZbG2m_s7n2L15guAJLliDITROUkXqRwkprWe4cH5Uy6DDNkQ4Ag2rXcQP2vOxFyfqZZ_yWnNamI428rLqwCVBIfpc76ZGrTrcQtSxEkedT0o--Xbb3h11PJqrpsdZRNjOsyQArSh09JgJYU4llUW';

function removeLocalKeysOnLogout() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key != 'uplers_auto_fill' && !key.toLocaleLowerCase().includes('resume')) {
            localStorage.removeItem(key);
        }
    }
}

const MatIcon = ({ name, className = '', filled }) => (
    <span
        className={`material-symbols-outlined${filled ? ' jad-icon--fill' : ''}${className ? ` ${className}` : ''}`}
    >
        {name}
    </span>
);

function formatReferralPlanDate(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch {
        return '';
    }
}

/** Mobile header plan copy — Figma 29106:177587 ("15 Jun'26"). */
function formatMobileHeaderPlanDate(iso) {
    if (!iso) return '';
    try {
        const d = new Date(iso);
        const day = d.getDate();
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const year = String(d.getFullYear()).slice(-2);
        return `${day} ${month}'${year}`;
    } catch {
        return '';
    }
}

/** Trial pill copy — Figma 912:21152 ("5 days left in trial"). */
function getTrialDaysLeft(planEndDate) {
    if (!planEndDate) return null;
    try {
        const end = new Date(planEndDate);
        if (Number.isNaN(end.getTime())) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.max(0, Math.round((end.getTime() - today.getTime()) / msPerDay));
    } catch {
        return null;
    }
}

function formatTrialDaysLeftLabel(planEndDate) {
    return 'Free trial';
    const daysLeft = getTrialDaysLeft(planEndDate);
    if (daysLeft == null) return 'Free trial';
    if (daysLeft === 1) return '1 day left in trial';
    return `${daysLeft} days left in trial`;
}

/**
 * Composite topnav cluster: daily-limit widget + Upgrade-to-Pro CTA for
 * non-paid users. Plan validity copy has moved to the sidebar pill, so this
 * cluster no longer renders the verbose "Happpy agent · Paid · Valid till …"
 * info badge. The daily-limit widget hides itself when `max_limit` is 0, so
 * the slot collapses naturally for users who don't have run-quota yet.
 */
function ReferralAgentTopnavCluster({
    referralPlan,
    dailyLimitLoading,
    dailyUsed,
    dailyLimit,
}) {
    if (referralPlan.planLoading) return null;

    const isPaidActive =
        Number(referralPlan.plan) === 2 && !referralPlan.has_plan_expired;

    return (
        <div className="job-agent-dashboard__plan-topnav-cluster">
            <DailyReferralLimitTopnav
                loading={dailyLimitLoading}
                used={dailyUsed}
                limit={dailyLimit}
            />
        </div>
    );
}

/**
 * Sidebar plan-validity pill (Figma 28478:7724). Shown at the top of the
 * sidenav-inner block, between the brand title and the user info card.
 *  - credit plan         → green pill, "Credit Plan · N jobs left"
 *  - trial (plan !== 2) → light blue chip, "N days left in trial" (Figma 912:21152)
 *  - paid (plan === 2)   → green pill, "Paid Plan · Valid till …"
 *  - expired             → red clickable pill linking to /talent/job-agent/subscription
 *  - empty / loading     → renders nothing (matches the Figma)
 */
function SidenavPlanPill({
    loading,
    plan,
    planEndDate,
    hasExpired,
    creditPlan = 0,
    creditLeft = 0,
    onNavigate,
    className = '',
}) {
    if (loading) return null;

    const extraClass = className ? ` ${className}` : '';
    const isCreditPlan = Number(creditPlan) === 1 && Number(creditLeft) > 0;

    if (isCreditPlan) {
        const jobsLeft = Number(creditLeft);
        const label = `Light Plan · ${jobsLeft} ${jobsLeft === 1 ? 'job' : 'jobs'} left`;
        return (
            <div
                className={`job-agent-dashboard__sidenav-plan-pill job-agent-dashboard__sidenav-plan-pill--credit jad-font-headline${extraClass}`}
                title={label}
            >
                {label}
            </div>
        );
    }

    if (hasExpired) {
        return (
            <Link
                to="/talent/job-agent/subscription"
                onClick={onNavigate}
                className={`job-agent-dashboard__sidenav-plan-pill job-agent-dashboard__sidenav-plan-pill--expired jad-font-headline${extraClass}`}
                aria-label="Plan expired, renew now"
                title="Plan expired · Renew"
            >
                Plan Expired · Renew
            </Link>
        );
    }

    if (plan != null) {
        const isTrial = Number(plan) !== 2;

        if (isTrial) {
            const label = formatTrialDaysLeftLabel(planEndDate);
            return (
                <div
                    className={`job-agent-dashboard__sidenav-plan-pill job-agent-dashboard__sidenav-plan-pill--trial jad-font-body${extraClass}`}
                    title={label}
                >
                    {label}
                </div>
            );
        }

        const isMobileHeader = className.includes('job-agent-dashboard__topnav-mobile-plan-pill');
        const till = isMobileHeader
            ? formatMobileHeaderPlanDate(planEndDate)
            : formatReferralPlanDate(planEndDate);
        const label = till ? `Paid Plan · Valid till ${till}` : 'Paid Plan';
        return (
            <div
                className={`job-agent-dashboard__sidenav-plan-pill job-agent-dashboard__sidenav-plan-pill--active jad-font-headline${extraClass}`}
                title={label}
            >
                {label}
            </div>
        );
    }

    return null;
}

function ConfigureNewDot() {
    return <span className="job-agent-dashboard__configure-new-dot" aria-hidden="true" />;
}

function NavIconWithNewDot({ icon, filled, className, showDot }) {
    if (!showDot) {
        return <MatIcon name={icon} filled={filled} className={className} />;
    }

    return (
        <span className="job-agent-dashboard__nav-icon-wrap">
            <MatIcon name={icon} filled={filled} className={className} />
            <ConfigureNewDot />
        </span>
    );
}

/**
 * Fixed bottom tab bar for viewports below 768px (Figma 28973:14793).
 * Active tab gets a yellow pill highlight behind the label; icons fill when active.
 */
function MobileBottomNav({ pathname, lockOutreachSideNav, showConfigureNewBadge }) {
    return (
        <nav className="job-agent-dashboard__bottom-nav" aria-label="Happpy Agent mobile navigation">
            {MOBILE_BOTTOM_NAV_ITEMS.map((item) => {
                const active = isMobileBottomNavActive(item, pathname);
                const highlight = lockOutreachSideNav ? item.id === 'configure' && active : active;

                return (
                    <NavLink
                        key={item.id}
                        to={mobileBottomNavTarget(item, lockOutreachSideNav)}
                        end={item.end}
                        className={`job-agent-dashboard__bottom-nav-link jad-font-headline${
                            highlight ? ' job-agent-dashboard__bottom-nav-link--active' : ''
                        }`}
                        aria-current={highlight ? 'page' : undefined}
                        aria-label={
                            item.id === 'configure' && showConfigureNewBadge
                                ? `${item.label}, new settings available`
                                : undefined
                        }
                    >
                        <span className="job-agent-dashboard__bottom-nav-link-inner">
                            <NavIconWithNewDot
                                icon={item.icon}
                                filled={highlight}
                                className="job-agent-dashboard__bottom-nav-icon"
                                showDot={item.id === 'configure' && showConfigureNewBadge}
                            />
                            <span className="job-agent-dashboard__bottom-nav-label-wrap">
                                <span className="job-agent-dashboard__bottom-nav-label">{item.label}</span>
                            </span>
                        </span>
                    </NavLink>
                );
            })}
        </nav>
    );
}

/**
 * Mobile slide-out drawer — Figma 28973:30190.
 * Full nav + profile, daily limit card, and logout. Desktop sidenav is unchanged.
 */
function MobileDrawerPanel({
    pathname,
    lockOutreachSideNav,
    referralPlan,
    dailyLimitLoading,
    dailyUsed,
    dailyLimit,
    displayName,
    userEmail,
    avatarSrc,
    onNavigate,
    onLogout,
    onReferFriend,
    onLeaveReview,
    planCtaCopy,
    showConfigureNewBadge,
}) {
    return (
        <div className="job-agent-dashboard__mobile-drawer">
            <div className="job-agent-dashboard__mobile-drawer-head">
                <Link
                    to={
                        lockOutreachSideNav
                            ? '/talent/referral-ai-agent'
                            : '/talent/job-agent'
                    }
                    className="job-agent-dashboard__mobile-drawer-brand jad-font-headline"
                    aria-label="Happpy Agent — Dashboard"
                    onClick={onNavigate}
                >
                    <HapppyAgentLogo className="job-agent-dashboard__topnav-wordmark" />
                </Link>
                <SidenavPlanPill
                    loading={referralPlan.planLoading}
                    plan={referralPlan.plan}
                    planEndDate={referralPlan.plan_end_date}
                    hasExpired={referralPlan.has_plan_expired}
                    creditPlan={referralPlan.credit_plan}
                    creditLeft={referralPlan.credit_left}
                    onNavigate={onNavigate}
                    className="job-agent-dashboard__mobile-drawer-plan-pill"
                />
            </div>

            <div className="job-agent-dashboard__mobile-drawer-profile">
                <img
                    className="job-agent-dashboard__mobile-drawer-avatar"
                    src={avatarSrc}
                    alt=""
                    width={48}
                    height={48}
                    decoding="async"
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        if (e.currentTarget.src !== TOPNAV_AVATAR) {
                            e.currentTarget.src = TOPNAV_AVATAR;
                        }
                    }}
                />
                <div className="job-agent-dashboard__mobile-drawer-profile-copy">
                    <p className="job-agent-dashboard__mobile-drawer-name jad-font-headline">{displayName}</p>
                    {userEmail ? (
                        <p className="job-agent-dashboard__mobile-drawer-email jad-font-body">{userEmail}</p>
                    ) : null}
                </div>
                <Link
                    to="/talent/job-agent/update-profile"
                    className="job-agent-dashboard__mobile-drawer-edit"
                    aria-label="Edit profile"
                    onClick={onNavigate}
                >
                    <MatIcon name="edit" />
                </Link>
            </div>

            <div className="job-agent-dashboard__mobile-drawer-divider" role="presentation" />

            <nav className="job-agent-dashboard__mobile-drawer-nav" aria-label="Happpy Agent menu">
                {MOBILE_DRAWER_NAV_ITEMS.map((item) => {
                    const active = isMobileDrawerNavActive(item, pathname);
                    const label =
                        item.id === 'my-plan'
                            ? planCtaCopy
                            : item.label;

                    return (
                        <NavLink
                            key={item.id}
                            to={mobileDrawerNavTarget(item, lockOutreachSideNav)}
                            end={item.end}
                            onClick={onNavigate}
                            className={`job-agent-dashboard__mobile-drawer-link jad-font-headline${
                                active ? ' job-agent-dashboard__mobile-drawer-link--active' : ''
                            }`}
                            aria-current={active ? 'page' : undefined}
                            aria-label={
                                item.id === 'configure' && showConfigureNewBadge
                                    ? `${label}, new settings available`
                                    : undefined
                            }
                        >
                            {item.icon === 'plan-cta' ? (
                                <PlanCtaIcon />
                            ) : item.icon === 'need-help' ? (
                                <span
                                    className="job-agent-dashboard__mobile-drawer-inline-icon"
                                    aria-hidden="true"
                                >
                                    <img
                                        src={SIDENAV_NEED_HELP_ICON_SRC}
                                        alt=""
                                        width={20}
                                        height={20}
                                    />
                                </span>
                            ) : (
                                <NavIconWithNewDot
                                    icon={item.icon}
                                    filled={active}
                                    showDot={item.id === 'configure' && showConfigureNewBadge}
                                />
                            )}
                            <span className="job-agent-dashboard__mobile-drawer-link-label">{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="job-agent-dashboard__mobile-drawer-divider bottom-divider" role="presentation" />

            {lockOutreachSideNav ? (
                <div
                    className="job-agent-dashboard__mobile-drawer-lock jad-font-body"
                    role="region"
                    aria-label="Connect an account to unlock navigation"
                >
                    <p className="job-agent-dashboard__mobile-drawer-lock-title jad-font-headline">
                        Connect Gmail or LinkedIn
                    </p>
                    <p className="job-agent-dashboard__mobile-drawer-lock-text">
                        Link at least one account in Configure Screen to use jobs, activity, and related sections.
                    </p>
                    <Link
                        className="job-agent-dashboard__mobile-drawer-lock-btn jad-font-headline"
                        to={`${CONFIGURE_LINK_PATH}?tab=connected-accounts`}
                        onClick={onNavigate}
                    >
                        Connect Accounts
                    </Link>
                </div>
            ) : (
                <div className="job-agent-dashboard__mobile-drawer-limit-wrap">
                    <DailyReferralLimitTopnav
                        loading={dailyLimitLoading}
                        used={dailyUsed}
                        limit={dailyLimit}
                    />
                </div>
            )}

            <div className="job-agent-dashboard__mobile-drawer-footer">
                <SidenavBottomSection
                    lockOutreachSideNav={lockOutreachSideNav}
                    onReferFriend={onReferFriend}
                    onLeaveReview={onLeaveReview}
                    onLogout={onLogout}
                    referFriendClassName="job-agent-dashboard__refer-friend-trigger--mobile"
                    className="job-agent-dashboard__sidenav-bottom--mobile"
                />
            </div>
        </div>
    );
}

const JobAgentDashboardLayout = ({ children }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    const { firstName, jobFunction } = useMemo(() => {
        const rawName = user?.name?.trim() || '';
        const first = rawName.split(/\s+/).filter(Boolean)[0] || '';
        const jobFunction =
            (typeof user?.job_function === 'string' && user.job_function.trim()) ||
            '';
        return {
            firstName: first || 'Talent',
            jobFunction,
        };
    }, [user?.name, user?.job_function]);

    const sidenavTitleDisplay = useMemo(() => {
        const t = String(firstName || '').trim();
        if (t.length <= 8) return t;
        return `${t.slice(0, 8)}...`;
    }, [firstName]);

    const topNavAvatarSrc = useMemo(() => {
        const pic = user?.profile_pic;
        if (typeof pic === 'string' && pic.trim()) return pic.trim();
        return TOPNAV_AVATAR;
    }, [user?.profile_pic]);

    const displayName = useMemo(() => {
        const raw = user?.name?.trim();
        return raw || 'Talent';
    }, [user?.name]);

    const userEmail = useMemo(() => {
        const raw = user?.email;
        return typeof raw === 'string' ? raw.trim() : '';
    }, [user?.email]);

    const referralSectionActive = useMemo(
        () => isReferralAgentSectionPath(location.pathname),
        [location.pathname]
    );

    /** Solid white main — avoids cream/grey gradient behind Run agent page */
    const isRunAgentPage = useMemo(() => {
        const p = location.pathname.replace(/\/+$/, '') || '/';
        return p === '/talent/job-agent/run-agent';
    }, [location.pathname]);

    const subscriptionSectionActive = useMemo(
        () => isSubscriptionSectionPath(location.pathname),
        [location.pathname]
    );

    /** Only the Referral accordion exists now. Need help? is a nav row above the plan CTA. */
    const initialOpenNavGroup = referralSectionActive ? 'referral' : null;
    const [openNavGroup, setOpenNavGroup] = useState(initialOpenNavGroup);

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const notificationsWrapRef = useRef(null);

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [referFriendDrawerOpen, setReferFriendDrawerOpen] = useState(false);
    const [leaveReviewDrawerOpen, setLeaveReviewDrawerOpen] = useState(false);
    const [upgradePlanDrawerOpen, setUpgradePlanDrawerOpen] = useState(false);
    const [onboardingTemplateDrawerOpen, setOnboardingTemplateDrawerOpen] = useState(false);

    /** After onboarding completes, open unclosable template drawer on dashboard. */
    useEffect(() => {
        if (!isOnboardingTemplatePending()) return;
        setOnboardingTemplateDrawerOpen(true);
    }, []);

    const handleOnboardingTemplateSaveSuccess = useCallback(() => {
        clearOnboardingTemplatePending();
        clearPublicSignupHandoff();
        setOnboardingTemplateDrawerOpen(false);
    }, []);

    /** Reply reminders page uses 15-day default; keep in sync for sidebar badge. */
    const [replyRemindersPending, setReplyRemindersPending] = useState(false);

    const [showConfigureNewBadge, setShowConfigureNewBadge] = useState(
        () => !readAutoReplyTabSeen(),
    );

    useEffect(() => {
        const syncSeen = () => setShowConfigureNewBadge(false);
        window.addEventListener(AUTO_REPLY_TAB_SEEN_EVENT, syncSeen);
        return () => window.removeEventListener(AUTO_REPLY_TAB_SEEN_EVENT, syncSeen);
    }, []);

    useEffect(() => {
        setShowConfigureNewBadge(!readAutoReplyTabSeen());
    }, [location.pathname, location.search]);

    /** Single source of truth — see store/reducers/happpyAgentReducer.js. */
    const referralPlan = useSelector((state) => state.happpyAgent);

    /** Daily referral-limit widget — global Redux state in `happpyAgent` slice. */
    const dailyLimitLoading = referralPlan.dailyLimitLoading;
    const dailyUsed = referralPlan.dailyUsed;
    const dailyLimit = referralPlan.dailyLimit;
    const agentPrefFieldsSubmitted = referralPlan.agentPrefFieldsSubmitted;
    const dashboardPreferencesLoaded = referralPlan.dashboardPreferencesLoaded;

    const preferencePending = useMemo(() => {
        if (!user || Object.keys(user).length === 0) return false;
        if (dashboardPreferencesLoaded && !agentPrefFieldsSubmitted) return true;
        if (!(user?.last_preference_at || user?.last_preference_at === null)) return true;

        const lastPreferenceUpdate = differenceInMonths(
            new Date(),
            new Date(user.last_preference_at),
        );
        return lastPreferenceUpdate >= 3;
    }, [
        user?.status,
        user?.last_preference_at,
        dashboardPreferencesLoaded,
        agentPrefFieldsSubmitted,
    ]);

    const planCtaCopy = useMemo(
        () =>
            planCtaLabel({
                plan: referralPlan.plan,
                hasExpired: referralPlan.has_plan_expired,
                loaded: referralPlan.loaded,
                creditPlan: referralPlan.credit_plan,
                creditLeft: referralPlan.credit_left,
            }),
        [
            referralPlan.plan,
            referralPlan.has_plan_expired,
            referralPlan.loaded,
            referralPlan.credit_plan,
            referralPlan.credit_left,
        ]
    );

    const showTopnavPlanUpgradeCta = useMemo(
        () =>
            shouldShowTopnavPlanUpgradeCta({
                plan: referralPlan.plan,
                hasExpired: referralPlan.has_plan_expired,
                planLoading: referralPlan.planLoading,
                creditPlan: referralPlan.credit_plan,
                creditLeft: referralPlan.credit_left,
            }),
        [
            referralPlan.plan,
            referralPlan.has_plan_expired,
            referralPlan.planLoading,
            referralPlan.credit_plan,
            referralPlan.credit_left,
        ]
    );

    /**
     * Happpy Agent / Top Jobs / Subscription / Help require Gmail or LinkedIn from Configure.
     * Activity sits in the primary strip with Reminders (same visibility rules).
     *
     * Optimistically show the full menu during the initial load — per product, the brief
     * "Loading…" lock screen is worse UX than a one-frame menu render that might collapse
     * to the lock state for genuinely disconnected first-time users. Returning users have
     * gmail/linkedin seeded from localStorage so they never flicker.
     */
    const lockOutreachSideNav = useMemo(() => {
        if (!referralPlan.loaded) return false;
        return !referralPlan.gmail_connected && !referralPlan.linkedin_connected;
    }, [referralPlan.loaded, referralPlan.gmail_connected, referralPlan.linkedin_connected]);

    /** Primary strip: full list when connected; only Configure when Gmail/LinkedIn are not linked */
    const primaryNavItems = useMemo(() => {
        if (lockOutreachSideNav) {
            return navItems.filter((item) => item.to === CONFIGURE_LINK_PATH);
        }
        return navItems;
    }, [lockOutreachSideNav]);

    useEffect(() => {
        if (lockOutreachSideNav) {
            setReplyRemindersPending(false);
            return;
        }
        let cancelled = false;
        GET_API(`${API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS_PENDING}?days=15`)
            .then((res) => {
                if (cancelled) return;
                const d = unwrapJobAgentApiPayload(res);
                setReplyRemindersPending(!!d?.pending);
            })
            .catch(() => {
                if (!cancelled) setReplyRemindersPending(false);
            });
        return () => {
            cancelled = true;
        };
    }, [lockOutreachSideNav, location.pathname]);

    useEffect(() => {
        if (referralSectionActive) setOpenNavGroup('referral');
    }, [referralSectionActive]);

    useEffect(() => {
        setMobileDrawerOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onResize = () => {
            if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                setMobileDrawerOpen(false);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!mobileDrawerOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') setMobileDrawerOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [mobileDrawerOpen]);

    useEffect(() => {
        dispatch(fetchHapppyAgentPlan());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchHapppyAgentDailyLimit({ skip: lockOutreachSideNav }));
    }, [dispatch, lockOutreachSideNav]);

    /** Reconcile daily run count when another tab records a run or user returns to this tab. */
    useEffect(() => {
        if (lockOutreachSideNav) return undefined;

        const onStorage = (e) => {
            if (e.key === HAPPPY_AGENT_DASHBOARD_CACHE_KEY) {
                dispatch(syncHapppyAgentDailyLimitFromStorage());
            }
        };
        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                dispatch(fetchHapppyAgentDailyLimit({ skip: false }));
            }
        };

        window.addEventListener('storage', onStorage);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('storage', onStorage);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [dispatch, lockOutreachSideNav]);

    useEffect(() => {
        if (!notificationsOpen) return;
        const onDoc = (e) => {
            const el = notificationsWrapRef.current;
            if (el && !el.contains(e.target)) setNotificationsOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setNotificationsOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDoc);
            document.removeEventListener('keydown', onKey);
        };
    }, [notificationsOpen]);

    const handleReferFriendOpen = useCallback(() => {
        setReferFriendDrawerOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleLeaveReviewOpen = useCallback(() => {
        setLeaveReviewDrawerOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleLogout = useCallback(
        (e) => {
            e.preventDefault();
            identityReset();
            sessionStorage.setItem('manual-logout', true);
            logoutUser()(dispatch)
                .then(() => {
                    navigate('/', { replace: true });
                    removeLocalKeysOnLogout();
                })
                .catch(() => {
                    sessionStorage.removeItem('manual-logout');
                });
        },
        [dispatch, navigate]
    );

    const hasNotifBadge = useMemo(() => {
        if (referralPlan.planLoading) return false;
        return (
            replyRemindersPending ||
            referralPlan.has_plan_expired ||
            referralPlan.plan == null
        );
    }, [
        referralPlan.planLoading,
        referralPlan.has_plan_expired,
        referralPlan.plan,
        replyRemindersPending,
    ]);

    useEffect(() => {
        document.title = 'Happpy Agent | Uplers';
    }, []);

    const dashboardOutletContext = useMemo(
        () => ({ referralPlan, openReferFriendDrawer: handleReferFriendOpen }),
        [referralPlan, handleReferFriendOpen],
    );

    return (
        <>
            <div className="job-agent-dashboard">
                <nav className="job-agent-dashboard__topnav" aria-label="Happpy Agent top navigation">
                    <div className="job-agent-dashboard__topnav-left">
                        <button
                            type="button"
                            className="job-agent-dashboard__menu-btn job-agent-dashboard__menu-btn--desktop"
                            aria-label={mobileDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileDrawerOpen}
                            aria-controls="job-agent-sidenav"
                            onClick={() => setMobileDrawerOpen((o) => !o)}
                        >
                            <MatIcon name={mobileDrawerOpen ? 'close' : 'menu'} />
                        </button>
                        {/* Brand + plan-pill stack: the pill sits directly under the
                            "Happpy Agent" wordmark (used to live at the top of the sidebar,
                            see SidenavPlanPill). On narrow viewports the CSS hides the pill
                            slot to keep the topnav from getting cramped. */}
                        <div className="job-agent-dashboard__topnav-brand-stack">
                            <Link
                                to={
                                    lockOutreachSideNav
                                        ? '/talent/referral-ai-agent'
                                        : '/talent/job-agent'
                                }
                                className="job-agent-dashboard__topnav-brand-link"
                                aria-label="Happpy Agent — Dashboard"
                            >
                                <HapppyAgentLogo className="job-agent-dashboard__topnav-wordmark" />
                            </Link>
                            <div className="job-agent-dashboard__topnav-plan-pill-slot">
                                <SidenavPlanPill
                                    loading={referralPlan.planLoading}
                                    plan={referralPlan.plan}
                                    planEndDate={referralPlan.plan_end_date}
                                    hasExpired={referralPlan.has_plan_expired}
                                    creditPlan={referralPlan.credit_plan}
                                    creditLeft={referralPlan.credit_left}
                                    onNavigate={() => setMobileDrawerOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                    <div
                        className="job-agent-dashboard__topnav-plan-wrap"
                        aria-label="Happpy Agent subscription"
                    >
                        <ReferralAgentTopnavCluster
                            referralPlan={referralPlan}
                            dailyLimitLoading={dailyLimitLoading}
                            dailyUsed={dailyUsed}
                            dailyLimit={dailyLimit}
                        />
                    </div>
                    <div className="job-agent-dashboard__topnav-mobile-plan">
                        <SidenavPlanPill
                            loading={referralPlan.planLoading}
                            plan={referralPlan.plan}
                            planEndDate={referralPlan.plan_end_date}
                            hasExpired={referralPlan.has_plan_expired}
                            creditPlan={referralPlan.credit_plan}
                            creditLeft={referralPlan.credit_left}
                            onNavigate={() => setMobileDrawerOpen(false)}
                            className="job-agent-dashboard__topnav-mobile-plan-pill"
                        />
                    </div>
                    <div className="job-agent-dashboard__topnav-right">
                        <a
                            className="job-agent-dashboard__topnav-extension job-agent-dashboard__topnav-utility"
                            href={CHROME_EXTENSION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                className="job-agent-dashboard__topnav-chrome-icon"
                                src={CHROME_ICON_URL}
                                alt=""
                                width={20}
                                height={20}
                            />
                            <span>Chrome & Brave Browser Extension</span>
                        </a>
                        {showTopnavPlanUpgradeCta &&
                            <TopnavPlanUpgradeCta
                                plan={referralPlan.plan}
                                hasExpired={referralPlan.has_plan_expired}
                            />
                        }
                        <div className="job-agent-dashboard__notif-wrap" ref={notificationsWrapRef}>
                            <button
                                type="button"
                                className="job-agent-dashboard__topnav-icon-btn job-agent-dashboard__topnav-notif-btn"
                                aria-label="Notifications"
                                aria-expanded={notificationsOpen}
                                aria-controls="job-agent-notifications-panel"
                                id="job-agent-notifications-trigger"
                                onClick={() => setNotificationsOpen((o) => !o)}
                            >
                                <MatIcon name="notifications" />
                                {hasNotifBadge ? (
                                    <span className="job-agent-dashboard__topnav-notif-badge" aria-hidden="true" />
                                ) : null}
                            </button>
                            {notificationsOpen ? (
                                <div
                                    className="job-agent-dashboard__notif-panel jad-font-body"
                                    id="job-agent-notifications-panel"
                                    role="region"
                                    aria-labelledby="job-agent-notifications-trigger"
                                >
                                    <p className="job-agent-dashboard__notif-panel-title">Notifications</p>
                                    {referralPlan.planLoading ? (
                                        <p className="job-agent-dashboard__notif-panel-msg">Loading…</p>
                                    ) : Number(referralPlan.credit_plan) === 1 && Number(referralPlan.credit_left) > 0 ? (
                                        <p className="job-agent-dashboard__notif-panel-msg">
                                            Credit Plan active — {Number(referralPlan.credit_left)}{' '}
                                            {Number(referralPlan.credit_left) === 1 ? 'job' : 'jobs'} left.
                                        </p>
                                    ) : referralPlan.plan != null && !referralPlan.has_plan_expired ? (
                                        Number(referralPlan.plan) === 2 ? (
                                            <p className="job-agent-dashboard__notif-panel-msg">
                                                Congratulations on your paid subscription
                                                {formatReferralPlanDate(referralPlan.plan_end_date)
                                                    ? ` for ${formatReferralPlanDate(referralPlan.plan_end_date)}.`
                                                    : '.'}
                                            </p>
                                        ) : (
                                            <p className="job-agent-dashboard__notif-panel-msg">
                                                Congratulations! Free trial active
                                                {formatReferralPlanDate(referralPlan.plan_end_date)
                                                    ? ` for ${formatReferralPlanDate(referralPlan.plan_end_date)}.`
                                                    : '.'}
                                            </p>
                                        )
                                    ) : referralPlan.has_plan_expired ? (
                                        <p className="job-agent-dashboard__notif-panel-msg job-agent-dashboard__notif-panel-msg--muted">
                                            Your plan has expired. Renew from My Plan section to keep using the referral
                                            agent.
                                        </p>
                                    ) : (
                                        <p className="job-agent-dashboard__notif-panel-msg job-agent-dashboard__notif-panel-msg--muted">
                                            No referral plan yet.{' '}
                                            <Link
                                                className="job-agent-dashboard__notif-panel-link"
                                                to="/talent/job-agent/subscription"
                                                onClick={() => setNotificationsOpen(false)}
                                            >
                                                Subscribe
                                            </Link>
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        <Link
                            to="/talent/job-agent/update-profile"
                            className="job-agent-dashboard__topnav-avatar-link job-agent-dashboard__topnav-utility"
                            aria-label="Update profile"
                            title="Update profile"
                        >
                            <img
                                className="job-agent-dashboard__topnav-avatar"
                                src={topNavAvatarSrc}
                                alt=""
                                width={32}
                                height={32}
                                decoding="async"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    if (e.currentTarget.src !== TOPNAV_AVATAR) {
                                        e.currentTarget.src = TOPNAV_AVATAR;
                                    }
                                }}
                            />
                        </Link>
                        <button
                            type="button"
                            className="job-agent-dashboard__menu-btn job-agent-dashboard__menu-btn--mobile"
                            aria-label={mobileDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileDrawerOpen}
                            aria-controls="job-agent-sidenav"
                            onClick={() => setMobileDrawerOpen((o) => !o)}
                        >
                            <MatIcon name={mobileDrawerOpen ? 'close' : 'menu'} />
                        </button>
                    </div>
                </nav>

                <div className="job-agent-dashboard__topnav-spacer" aria-hidden="true" />

                {mobileDrawerOpen ? (
                    <button
                        type="button"
                        className="job-agent-dashboard__sidenav-backdrop"
                        aria-label="Close navigation menu"
                        onClick={() => setMobileDrawerOpen(false)}
                    />
                ) : null}

                <aside
                    id="job-agent-sidenav"
                    className={`job-agent-dashboard__sidenav${mobileDrawerOpen ? ' job-agent-dashboard__sidenav--open' : ''}`}
                    aria-label="AgentJ sidebar"
                >
                    <button
                        type="button"
                        className="job-agent-dashboard__mobile-drawer-close"
                        aria-label="Close navigation menu"
                        onClick={() => setMobileDrawerOpen(false)}
                    >
                        <MatIcon name="chevron_right" />
                    </button>
                    <MobileDrawerPanel
                        pathname={location.pathname}
                        lockOutreachSideNav={lockOutreachSideNav}
                        referralPlan={referralPlan}
                        dailyLimitLoading={dailyLimitLoading}
                        dailyUsed={dailyUsed}
                        dailyLimit={dailyLimit}
                        displayName={displayName}
                        userEmail={userEmail}
                        avatarSrc={topNavAvatarSrc}
                        onNavigate={() => setMobileDrawerOpen(false)}
                        onLogout={handleLogout}
                        onReferFriend={handleReferFriendOpen}
                        onLeaveReview={handleLeaveReviewOpen}
                        planCtaCopy={planCtaCopy}
                        showConfigureNewBadge={showConfigureNewBadge}
                    />

                    <div className="job-agent-dashboard__sidenav-desktop">
                    <div className="job-agent-dashboard__sidenav-inner">
                        <div className="job-agent-dashboard__sidenav-brand-wrap">
                            {preferencePending ? (
                                <div
                                    className="job-agent-dashboard__sidenav-profile-badge jad-font-body"
                                    role="status"
                                >
                                    <MatIcon
                                        name="warning"
                                        className="job-agent-dashboard__sidenav-profile-badge-icon"
                                        aria-hidden
                                    />
                                    <span>Requires action!</span>
                                </div>
                            ) : null}
                            <NavLink
                                to={UPDATE_PROFILE_PATH}
                                className={({ isActive }) =>
                                    `job-agent-dashboard__sidenav-brand${isActive ? ' job-agent-dashboard__sidenav-brand--active' : ''}`
                                }
                                aria-label="Update profile"
                            >
                                <div className="job-agent-dashboard__sidenav-brand-main">
                                    <span className="job-agent-dashboard__sidenav-avatar-wrap">
                                        <img
                                            className="job-agent-dashboard__sidenav-avatar"
                                            src={topNavAvatarSrc}
                                            alt=""
                                            width={30}
                                            height={30}
                                            decoding="async"
                                            onError={(e) => {
                                                e.currentTarget.onerror = null;
                                                if (e.currentTarget.src !== TOPNAV_AVATAR) {
                                                    e.currentTarget.src = TOPNAV_AVATAR;
                                                }
                                            }}
                                        />
                                    </span>
                                    <div className="job-agent-dashboard__sidenav-titles">
                                        <p
                                            className="job-agent-dashboard__sidenav-title"
                                            title={firstName.length > 8 ? firstName : undefined}
                                        >
                                            {sidenavTitleDisplay}
                                        </p>
                                        <p
                                            className={`job-agent-dashboard__sidenav-sub${jobFunction ? '' : ' job-agent-dashboard__sidenav-sub--placeholder'}`}
                                        >
                                            {jobFunction || 'Job function'}
                                        </p>
                                    </div>
                                </div>
                                <span className="job-agent-dashboard__sidenav-brand-edit" aria-hidden="true">
                                    <MatIcon name="edit" />
                                </span>
                            </NavLink>
                        </div>

                        <nav className="job-agent-dashboard__sidenav-nav">
                            <div className="job-agent-dashboard__sidenav-nav-primary">
                            {primaryNavItems.map(({ to, label, end, icon, leaveDashboard }) => {
                                const remindersPendingHighlight =
                                    replyRemindersPending &&
                                    String(to).startsWith('/talent/job-agent/missed-replies');
                                const reminderIcon = remindersPendingHighlight ? 'notifications_active' : icon;
                                return (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        aria-label={
                                            remindersPendingHighlight
                                                ? `${label}, has pending reply reminders`
                                                : to === CONFIGURE_LINK_PATH && showConfigureNewBadge
                                                    ? `${label}, new settings available`
                                                    : leaveDashboard
                                                        ? `${label}, leaves AgentJ dashboard`
                                                        : undefined
                                        }
                                        title={
                                            remindersPendingHighlight
                                                ? 'You have reply reminders to review'
                                                : leaveDashboard
                                                    ? 'Opens Uplers Jobs (leaves this dashboard)'
                                                    : undefined
                                        }
                                        className={({ isActive }) =>
                                            `job-agent-dashboard__sidenav-link jad-font-headline${isActive ? ' job-agent-dashboard__sidenav-link--active' : ''}`
                                        }
                                    >
                                        <NavIconWithNewDot
                                            icon={reminderIcon}
                                            filled={remindersPendingHighlight}
                                            className={
                                                remindersPendingHighlight
                                                    ? 'job-agent-dashboard__sidenav-reminder-pending-icon'
                                                    : ''
                                            }
                                            showDot={to === CONFIGURE_LINK_PATH && showConfigureNewBadge}
                                        />
                                        <span
                                            className={`job-agent-dashboard__sidenav-link-label${remindersPendingHighlight
                                                    ? ' job-agent-dashboard__sidenav-reminder-pending-label'
                                                    : ''
                                                }`}
                                        >
                                            {label}
                                            {leaveDashboard ? (
                                                <MatIcon
                                                    name="open_in_new"
                                                    className="job-agent-dashboard__sidenav-link-external"
                                                    aria-hidden
                                                />
                                            ) : null}
                                        </span>
                                    </NavLink>
                                );
                            })}
                            </div>

                            <div
                                className={`job-agent-dashboard__sidenav-outreach-block${lockOutreachSideNav ? ' job-agent-dashboard__sidenav-outreach-block--locked' : ''}`}
                            >
                                <div className="job-agent-dashboard__sidenav-outreach-block-inner">
                                    {/* <div
                                        className={`job-agent-dashboard__sidenav-group${openNavGroup === 'referral' ? ' job-agent-dashboard__sidenav-group--open' : ''}`}
                                    >
                                        <button
                                            type="button"
                                            className={`job-agent-dashboard__sidenav-group-toggle jad-font-headline${referralSectionActive
                                                    ? ' job-agent-dashboard__sidenav-group-toggle--active'
                                                    : ''
                                                }`}
                                            aria-expanded={openNavGroup === 'referral'}
                                            onClick={() =>
                                                setOpenNavGroup((g) => (g === 'referral' ? null : 'referral'))
                                            }
                                        >
                                            <MatIcon name="robot" />
                                            <span className="job-agent-dashboard__sidenav-group-toggle-label">
                                                Happpy Agent
                                            </span>
                                            <MatIcon
                                                name="expand_more"
                                                className="job-agent-dashboard__sidenav-group-chevron"
                                            />
                                        </button>
                                        {openNavGroup === 'referral' && (
                                            <div
                                                className="job-agent-dashboard__sidenav-sub"
                                                role="group"
                                                aria-label="Happpy Agent"
                                            >
                                                {REFERRAL_AGENT_SUBLINKS.map(({ id, to, label }) => (
                                                    <NavLink
                                                        key={id}
                                                        to={to}
                                                        className={({ isActive }) =>
                                                            `job-agent-dashboard__sidenav-sublink jad-font-headline${isActive
                                                                ? ' job-agent-dashboard__sidenav-sublink--active'
                                                                : ''
                                                            }`
                                                        }
                                                    >
                                                        {label}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}
                                    </div> */}

                                    {/* <NavLink
                                        to={TOP_JOBS_NAV_ITEM.to}
                                        end={TOP_JOBS_NAV_ITEM.end}
                                        className={({ isActive }) =>
                                            `job-agent-dashboard__sidenav-link jad-font-headline${jobAgentConfigureNavIsActive(
                                                TOP_JOBS_NAV_ITEM.to,
                                                isActive,
                                                location.pathname
                                            )
                                                ? ' job-agent-dashboard__sidenav-link--active'
                                                : ''
                                            }`
                                        }
                                    >
                                        <MatIcon name={TOP_JOBS_NAV_ITEM.icon} />
                                        <span className="job-agent-dashboard__sidenav-link-label">
                                            {TOP_JOBS_NAV_ITEM.label}
                                        </span>
                                    </NavLink> */}
                                    <NavLink
                                        to={UPDATE_PROFILE_PATH}
                                        className={({ isActive }) =>
                                            `job-agent-dashboard__sidenav-link jad-font-headline${
                                                isActive ? ' job-agent-dashboard__sidenav-link--active' : ''
                                            }`
                                        }
                                    >
                                        <MatIcon name="manage_accounts" />
                                        <span className="job-agent-dashboard__sidenav-link-label">Profile</span>
                                    </NavLink>

                                    <SidenavNeedHelpLink
                                        helpActive={isHelpGuidePath(location.pathname)}
                                        onNavigate={() => setMobileDrawerOpen(false)}
                                    />

                                    {/* Subscription CTA — yellow pill (Figma 28515:53878 / 28501:48991). Label flips
                                            between "Upgrade Plan", "My Plan", and "Renew Plan" by plan state.
                                            Defaults to "My Plan" while the outreach-step slice is still loading so
                                            we don't flash a loader; see planCtaLabel for the trade-off. */}
                                    <NavLink
                                        to={SUBSCRIPTION_LINK_PATH}
                                        className={({ isActive }) =>
                                            `job-agent-dashboard__sidenav-link job-agent-dashboard__sidenav-plan-cta jad-font-headline${
                                                isActive || subscriptionSectionActive
                                                    ? ' job-agent-dashboard__sidenav-plan-cta--active'
                                                    : ''
                                            }`
                                        }
                                        aria-label={planCtaLabel({
                                            plan: referralPlan.plan,
                                            hasExpired: referralPlan.has_plan_expired,
                                            loaded: referralPlan.loaded,
                                            creditPlan: referralPlan.credit_plan,
                                            creditLeft: referralPlan.credit_left,
                                        })}
                                    >
                                        <PlanCtaIcon />
                                        <span className="job-agent-dashboard__sidenav-plan-cta-label">
                                            {planCtaLabel({
                                                plan: referralPlan.plan,
                                                hasExpired: referralPlan.has_plan_expired,
                                                loaded: referralPlan.loaded,
                                                creditPlan: referralPlan.credit_plan,
                                                creditLeft: referralPlan.credit_left,
                                            })}
                                        </span>
                                    </NavLink>

                                </div>
                                {lockOutreachSideNav ? (
                                    <div
                                        className="job-agent-dashboard__sidenav-outreach-lock jad-font-body"
                                        role="region"
                                        aria-label="Connect an account to unlock navigation"
                                    >
                                        <p className="job-agent-dashboard__sidenav-outreach-lock-title jad-font-headline">
                                            Connect Gmail or LinkedIn
                                        </p>
                                        <p className="job-agent-dashboard__sidenav-outreach-lock-text">
                                            Link at least one account in Configure to use Top Jobs, Referral
                                            Agent, and related sections.
                                        </p>
                                        <Link
                                            className="job-agent-dashboard__sidenav-outreach-lock-btn jad-font-headline"
                                            to={`${CONFIGURE_LINK_PATH}?tab=connected-accounts`}
                                            onClick={() => setMobileDrawerOpen(false)}
                                        >
                                            Connect Accounts
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </nav>

                        <div className="job-agent-dashboard__sidenav-footer">
                            <SidenavBottomSection
                                lockOutreachSideNav={lockOutreachSideNav}
                                onReferFriend={handleReferFriendOpen}
                                onLeaveReview={handleLeaveReviewOpen}
                                onLogout={handleLogout}
                            />
                        </div>
                    </div>
                    </div>
                </aside>

                <main
                    className={`job-agent-dashboard__main${isRunAgentPage ? ' job-agent-dashboard__main--plain-bg' : ''}`}
                >
                    <MatcherModalProvider>
                        <JobAgentDashboardProvider value={dashboardOutletContext}>
                            {children}
                        </JobAgentDashboardProvider>
                    </MatcherModalProvider>
                </main>

                <MobileBottomNav
                    pathname={location.pathname}
                    lockOutreachSideNav={lockOutreachSideNav}
                    showConfigureNewBadge={showConfigureNewBadge}
                />

                <ReferFriendDrawer
                    open={referFriendDrawerOpen}
                    onClose={() => setReferFriendDrawerOpen(false)}
                    onOpenUpgradePlan={() => setUpgradePlanDrawerOpen(true)}
                />
                <LeaveReviewDrawer
                    open={leaveReviewDrawerOpen}
                    onClose={() => setLeaveReviewDrawerOpen(false)}
                />
                <UpgradePlanDrawer
                    open={upgradePlanDrawerOpen}
                    onClose={() => setUpgradePlanDrawerOpen(false)}
                />
                <HappyAgentTemplateDrawer
                    isOpen={onboardingTemplateDrawerOpen}
                    onClose={handleOnboardingTemplateSaveSuccess}
                    onSaveSuccess={handleOnboardingTemplateSaveSuccess}
                    unclosable
                />
            </div>
        </>
    );
};

export default JobAgentDashboardLayout;
