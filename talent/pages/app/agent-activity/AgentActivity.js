'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import { GET_API } from '../../../components/Helper';
import { API_URL, IMAGE_URL } from '../../../components/Constant';
import RepliesTab from './tabs/RepliesTab';
import ReminderAlertsTab from './tabs/ReminderAlertsTab';
import JobsInQueueTab from './tabs/JobsInQueueTab';
import AllActivityTab from './tabs/AllActivityTab';
import InterviewBoardTab from './tabs/InterviewBoardTab';
import MascotRepliesIntro from './MascotRepliesIntro';
import PasteJobLinkDrawer from '../happpy-agent/configure-tabs/PasteJobLinkDrawer';
import './AgentActivity.css';

/* ---------------- Paste Job Link flow ----------------
 * Page-level "Paste Job Link" opens PasteJobLinkDrawer (same drawer used on
 * Configure / Recommended Jobs). Deep links (?add-job=1 / #add-job) open it
 * too. On success the drawer fires `agent-activity:job-link-added` so All
 * Activity and Jobs in Queue can refetch.
 */

/** Lightweight inline equivalent of the JAD `MatIcon` helper. */
function MatIcon({ name, className = '' }) {
    return (
        <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
            {name}
        </span>
    );
}

/**
 * Top-level shell for "My activity" — renders the sibling tabs from the
 * Job Referral Activity Figma. Active tab is mirrored to ?tab=… so the URL
 * is shareable and survives refresh; if the param is missing or invalid we
 * fall back to All Activity, unless a higher-priority tab (Interviews →
 * Responses → Reminder Alerts) has unread items, in which case we deep-link
 * the user there on first load. See `fetchTabCounts` below.
 */

const TABS = [
    { id: 'activity', label: 'All Activity' },
    { id: 'jobs-in-queue', label: 'Jobs in Queue' },
    { id: 'replies', label: 'Responses' },
    { id: 'reminders', label: 'Reminder Alerts' },
    { id: 'interviews', label: 'Interviews' },
];

const VALID_TAB_IDS = TABS.map((t) => t.id);
const DEFAULT_TAB = 'activity';

/**
 * Full-page blank state when there's no referral activity and no other tab
 * counts (Figma 1:33411). Renders instead of the title / tabs / panels —
 * "Paste job URL" opens PasteJobLinkDrawer.
 */
function ActivityPageEmptyState({ onPasteJobLink }) {
    return (
        <div className="aa-act__empty-state" role="status">
            <img
                className="aa-act__empty-state-illustration"
                src={`${IMAGE_URL}outreach/activity-empty-mascot.svg`}
                alt=""
                aria-hidden
            />
            <div className="aa-act__empty-state-body">
                <div className="aa-act__empty-state-text">
                    <p className="aa-act__empty-state-title">You have no referral activity yet</p>
                    <p className="aa-act__empty-state-subtitle">Start using Happpy Referral Agent now!</p>
                </div>
                <div className="aa-act__empty-state-cta">
                    <Link
                        to="/talent/job-agent/recommended-jobs"
                        className="aa-btn aa-btn--primary aa-act__empty-state-btn aa-act__empty-state-btn--primary"
                    >
                        See recommended jobs
                    </Link>
                    <button
                        type="button"
                        className="aa-btn aa-btn--secondary aa-act__empty-state-btn"
                        onClick={onPasteJobLink}
                    >
                        Paste job url for referral
                    </button>
                </div>
            </div>
        </div>
    );
}

/** Deep-link: open "Paste Job Link" modal via ?add-job=1 or #add-job (also ?paste-job=1 / #paste-job). */
const ADD_JOB_QUERY_KEYS = ['add-job', 'paste-job'];
const ADD_JOB_HASH_IDS = ['add-job', 'paste-job', 'paste-job-link'];
const ADD_JOB_OPEN_VALUES = new Set(['1', 'true', 'open', 'yes']);

function shouldOpenAddJobFromSearchParams(params) {
    return ADD_JOB_QUERY_KEYS.some((key) => {
        const v = (params.get(key) || '').trim().toLowerCase();
        return ADD_JOB_OPEN_VALUES.has(v);
    });
}

function shouldOpenAddJobFromHash() {
    if (typeof window === 'undefined') return false;
    const id = (window.location.hash || '').replace(/^#/, '').trim().toLowerCase();
    return ADD_JOB_HASH_IDS.includes(id);
}

function stripAddJobDeepLinkFromUrl(searchParams) {
    const next = new URLSearchParams(searchParams);
    ADD_JOB_QUERY_KEYS.forEach((key) => next.delete(key));
    const qs = next.toString();
    const path = window.location.pathname;
    const url = qs ? `${path}?${qs}` : path;
    window.history.replaceState(null, '', url);
}

const AgentActivity = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [pasteJobDrawerOpen, setPasteJobDrawerOpen] = useState(false);
    /** null = activity blank status unknown; true = unfiltered All Activity is empty */
    const [activityBlank, setActivityBlank] = useState(null);
    const hasTargetTab = useRef(null);

    const activeTab = useMemo(() => {
        const t = searchParams.get('tab');
        return VALID_TAB_IDS.includes(t) ? t : DEFAULT_TAB;
    }, [searchParams]);


    useEffect(() => {
        const t = searchParams.get('tab');
        if(t){
            hasTargetTab.current = true;
        }
    }, []);

    /** Normalize the URL when ?tab is missing/invalid so deep links stay stable. */
    useEffect(() => {
        const t = searchParams.get('tab');
        if (t !== activeTab) {
            const next = new URLSearchParams(searchParams);
            next.set('tab', activeTab);
            setSearchParams(next, { replace: true });
        }
    }, [activeTab, searchParams, setSearchParams]);

    /** Open paste-job drawer from ?add-job=1 / ?paste-job=1 or #add-job, then strip trigger from URL. */
    useEffect(() => {
        const fromQuery = shouldOpenAddJobFromSearchParams(searchParams);
        const fromHash = shouldOpenAddJobFromHash();
        if (!fromQuery && !fromHash) return;

        setPasteJobDrawerOpen(true);

        if (fromQuery) {
            const next = new URLSearchParams(searchParams);
            ADD_JOB_QUERY_KEYS.forEach((key) => next.delete(key));
            setSearchParams(next, { replace: true });
        }
        if (fromHash && typeof window !== 'undefined') {
            stripAddJobDeepLinkFromUrl(searchParams);
        }
    }, [searchParams, setSearchParams]);

    const closePasteJobDrawer = () => {
        setPasteJobDrawerOpen(false);
        if (shouldOpenAddJobFromSearchParams(searchParams)) {
            const next = new URLSearchParams(searchParams);
            ADD_JOB_QUERY_KEYS.forEach((key) => next.delete(key));
            setSearchParams(next, { replace: true });
        }
    };

    const [tabCounts, setTabCounts] = useState({
        replies: null,
        reminders: null,
        'jobs-in-queue': null,
        activity: null,
        interviews: null,
        max_limit: null,
    });

    const hasOtherTabData =
        (tabCounts.replies > 0) ||
        (tabCounts.reminders > 0) ||
        (tabCounts['jobs-in-queue'] > 0) ||
        (tabCounts.interviews > 0);

    /** Full blank: no All Activity rows and no other tab badges to show. */
    const showPageEmpty = activityBlank === true && !hasOtherTabData;

    const handleActivityFetched = (activityCount) => {
        setTabCounts((prev) => ({ ...prev, activity: activityCount }));
    };

    const fetchTabCounts = async () => {
        const res = await GET_API(`${API_URL}talent/outreach/get-outreach-dashboard-data`);
        const counts = res?.data?.data;
        setTabCounts((prev) => ({
            ...prev,
            replies: counts?.total_positive_replies,
            reminders: counts?.reminder_count,
            'jobs-in-queue': counts?.jobs_in_queue,
            interviews: counts?.interview_count,
            max_limit: counts?.max_limit,
        }));

        // Default-tab redirect runs only when the URL didn't already specify a
        // tab. Priority order (highest first):
        //   1) Interviews
        //   2) Responses (tab id: replies)
        //   3) Reminder Alerts
        //   4) All Activity — handled by the existing DEFAULT_TAB fallback, so
        //      no navigate() is needed.
        if (!hasTargetTab.current) {
            if (counts?.pending_interview_feedback_count > 0) {
                navigate('/talent/job-agent/my-activity?tab=interviews');
            } else if (counts?.total_positive_replies > 0) {
                navigate('/talent/job-agent/my-activity?tab=replies');
            } else if (counts?.reminder_count > 0) {
                navigate('/talent/job-agent/my-activity?tab=reminders');
            }
        }
    };

    useEffect(() => {
        fetchTabCounts();
    }, []);

    useEffect(() => {
        document.title = 'My activity | Happpy Agent | Uplers';
    }, []);

    const tabsTrackRef = useRef(null);

    const handleTabClick = (tabId) => {
        if (tabId === activeTab) return;
        const next = new URLSearchParams(searchParams);
        next.set('tab', tabId);
        setSearchParams(next);
    };

    /** Keep the active tab in view when the bar scrolls horizontally on narrow screens. */
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const track = tabsTrackRef.current;
        if (!track || window.matchMedia('(min-width: 768px)').matches) return undefined;

        const activeEl = track.querySelector('.aa-tab--active');
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        return undefined;
    }, [activeTab, tabCounts]);

    /**
     * Counts shown next to "Jobs in Queue" / "All Activity" in the design are
     * intentionally left null until those tabs land — we only render a badge
     * once a child tab provides its own count.
     */

    return (
        <>
            <div className="aa-page">
                <div className={`aa-shell${showPageEmpty ? ' aa-shell--blank' : ''}`}>
                    {showPageEmpty ? (
                        <>
                            <ActivityPageEmptyState
                                onPasteJobLink={() => setPasteJobDrawerOpen(true)}
                            />
                            {/* Keep All Activity mounted so paste-job refresh can clear blank. */}
                            <div className="aa-sr-only" aria-hidden="true">
                                <AllActivityTab
                                    onActivityFetched={handleActivityFetched}
                                    onBlankStateChange={setActivityBlank}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="aa-shell__header">
                                <h1 className="aa-title">Job Referral Activity</h1>
                                    <button
                                    type="button"
                                    className="jad-jobs__add-btn"
                                    onClick={() => setPasteJobDrawerOpen(true)}
                                >
                                    <MatIcon name="add" className="jad-jobs__add-btn-icon" />
                                    Paste Job Link
                                </button>
                            </div>

                            <nav className="aa-tabs">
                                <div
                                    className="aa-tabs__track"
                                    ref={tabsTrackRef}
                                    role="tablist"
                                    aria-label="My activity sections"
                                >
                                    {TABS.filter((tab) => tab.id == 'activity' || tabCounts[tab.id] > 0).map((tab, idx) => {
                                    const isActive = activeTab === tab.id;
                                    const count = tabCounts[tab.id];
                                    const showDivider = !isActive && idx < TABS.length - 1;
                                    return (
                                        <span key={tab.id} className="aa-tab-anchor">
                                            <button
                                                type="button"
                                                role="tab"
                                                id={`aa-tab-${tab.id}`}
                                                aria-selected={isActive}
                                                aria-controls={`aa-panel-${tab.id}`}
                                                tabIndex={isActive ? 0 : -1}
                                                className={`aa-tab${isActive ? ' aa-tab--active' : ''}${showDivider ? ' aa-tab--with-divider' : ''
                                                    }`}
                                                onClick={() => handleTabClick(tab.id)}
                                            >
                                                <span className="aa-tab__label">{tab.label}</span>
                                                {count != null ? (
                                                    <span className="aa-tab__count" aria-hidden="true">
                                                        {count}
                                                    </span>
                                                ) : null}
                                                {count != null ? (
                                                    <span className="aa-sr-only">, {count} items</span>
                                                ) : null}
                                            </button>
                                            {tab.id === 'replies' ? (
                                                <MascotRepliesIntro
                                                    enabled
                                                    activeTabIsReplies={activeTab === 'replies'}
                                                />
                                            ) : null}
                                        </span>
                                    );
                                    })}
                                </div>
                            </nav>

                            <div className="aa-panel">
                                {activeTab === 'replies' && (
                                    <div role="tabpanel" id="aa-panel-replies" aria-labelledby="aa-tab-replies">
                                        <RepliesTab />
                                    </div>
                                )}
                                {activeTab === 'reminders' && (
                                    <div role="tabpanel" id="aa-panel-reminders" aria-labelledby="aa-tab-reminders">
                                        <ReminderAlertsTab />
                                    </div>
                                )}
                                {activeTab === 'jobs-in-queue' && (
                                    <div role="tabpanel" id="aa-panel-queue" aria-labelledby="aa-tab-queue">
                                        <JobsInQueueTab maxLimit={tabCounts.max_limit} />
                                    </div>
                                )}
                                {activeTab === 'activity' && (
                                    <div role="tabpanel" id="aa-panel-activity" aria-labelledby="aa-tab-activity">
                                        <AllActivityTab
                                            onActivityFetched={handleActivityFetched}
                                            onBlankStateChange={setActivityBlank}
                                        />
                                    </div>
                                )}
                                {activeTab === 'interviews' && (
                                    <div role="tabpanel" id="aa-panel-interview" aria-labelledby="aa-tab-interview">
                                        <InterviewBoardTab
                                            onCountsFetched={(interviewCount) =>
                                                setTabCounts((prev) => ({ ...prev, interviews: interviewCount }))
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                <PasteJobLinkDrawer
                    open={pasteJobDrawerOpen}
                    onClose={closePasteJobDrawer}
                />
            </div>
        </>
    );
};

export default AgentActivity;