'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from '@/talent/navigation/routerCompat';
import { useDispatch, useSelector } from 'react-redux';
import {
    API_CONSENT_EMAIL_JOB_SCAN,
    API_GET_RECOMMENDED_EMAIL_JOBS,
    API_GET_RECOMMENDED_EMAIL_JOBS_META,
    API_GET_RECOMMENDED_JOBS,
    API_SINGLE_OPP,
    APP_URL,
    IMAGE_URL,
    isAutoRunConsentOn,
} from '../../../components/Constant';
import { GET_API, POST_API, DELETE_API, renderTextWithLinks } from '../../../components/Helper';
import { submitAutoRunRequest } from '../../../store/actions/UserActions';
import ReferralAgentPreviewModal from '../../../components/ReferralAgentPreviewModal';
import PasteJobLinkDrawer from './configure-tabs/PasteJobLinkDrawer';
import HapppyAllJobs from './HapppyAllJobs';
import useHapppyCompactJobsLayout from './useHapppyCompactJobsLayout';
import './HapppyRecommendedJobs.css';

const PAGE_SIZE = 20;
const MAX_QUEUE_LIMIT = 30;
const JOBS_QUEUE_ACTIVITY_PATH = '/talent/job-agent/my-activity?tab=jobs-in-queue';
const SKELETON_CARD_COUNT = 5;
const TOAST_DURATION_MS = 5000;
const GMAIL_SCAN_POLL_INTERVAL_MS = 10000;
const HELP_GUIDE_RAISE_TICKET_PATH = '/talent/job-agent/need-help';
const AUTO_RUN_CONFIGURE_PATH = '/talent/job-agent/configure?tab=auto-run';
const DEFAULT_DESCRIPTION_FALLBACK = 'Job description is not available for this role right now.';
const DEFAULT_RECOMMENDED_JOBS_TAB = 'all-jobs';
const VALID_RECOMMENDED_JOBS_TAB_IDS = ['all-jobs', 'recommended', 'gmail-scan'];


const GMAIL_CONSENT_PLATFORMS = ['LINKEDIN', 'NAUKRI', 'GLASSDOOR', 'INDEED'];

const GMAIL_CONSENT_INFO = [
    {
        icon: 'security',
        title: 'PRIVACY FIRST',
        copy: 'AES-256 encryption on all parsed data.',
    },
    {
        icon: 'sync',
        title: 'AUTO UPDATE',
        copy: 'Scan occurs every 6 hours automatically.',
    },
    {
        icon: 'notifications_active',
        title: 'ALERTS',
        copy: 'Get notified instantly on new job matches.',
    },
];

const JOB_BOARD_LABELS = {
    linkedin: 'LinkedIn',
    naukri: 'Naukri',
    glassdoor: 'Glassdoor',
    indeed: 'Indeed',
    wellfound: 'Wellfound',
    hirist: 'Hirist',
};

const JOB_BOARD_CHART_COLORS = {
    linkedin: '#0A66C2',
    naukri: '#4B6BFB',
    glassdoor: '#0CAA41',
    indeed: '#2164F3',
    wellfound: '#1F2937',
    hirist: '#E4572E',
};

const INBOX_SOURCE_RING_TRACK = '#E6E6EC';

/** Blue shades by rank (largest source = darkest, outer ring). Rings + legend stay in sync. */
const INBOX_SOURCE_CHART_COLORS = ['#3885d7', '#38add7', '#83cef4', '#a8ddf8'];

const getInboxSourceChartColor = (rankIndex) =>
    INBOX_SOURCE_CHART_COLORS[rankIndex] ?? INBOX_SOURCE_CHART_COLORS[INBOX_SOURCE_CHART_COLORS.length - 1];

/** Figma node 29711:97397 — exact ring geometry (px). */
const INBOX_SOURCE_RING_LAYERS = [
    { size: 84, offsetLeft: 0, offsetTop: 0, stroke: 4 },
    { size: 70, offsetLeft: 7, offsetTop: 7, stroke: 4 },
    { size: 56, offsetLeft: 14, offsetTop: 14, stroke: 4 },
    { size: 42, offsetLeft: 21, offsetTop: 21, stroke: 4 },
];

const INBOX_SOURCE_PIE_SIZE = INBOX_SOURCE_RING_LAYERS[0].size;

const MatIcon = ({ name, className = '', filled = false, ...rest }) => (
    <span
        className={`material-symbols-outlined${filled ? ' hra-rec__icon--fill' : ''}${className ? ` ${className}` : ''}`}
        {...rest}
    >
        {name}
    </span>
);

/** "All your boards, one feed" categories (mirrors the dashboard concept card). */
const JOB_BOARDS_FEED_CATEGORIES = [
    {
        id: 'product-companies',
        label: 'Product companies',
        dotColor: '#818cf8',
        boards: [
            { initials: 'in', name: 'LinkedIn', boardKey: 'linkedin', url: 'https://www.linkedin.com/jobs/' },
            { initials: 'Ih', name: 'Instahyre', url: 'https://www.instahyre.com/' },
            { initials: 'W', name: 'Wellfound', boardKey: 'wellfound', url: 'https://wellfound.com/jobs' },
            { initials: 'Cs', name: 'Cutshort', url: 'https://cutshort.io/' },
        ],
    },
    {
        id: 'source',
        label: 'Straight to the source',
        dotColor: '#34d399',
        boards: [
            { initials: 'Gh', name: 'Greenhouse', url: 'https://www.greenhouse.io/' },
            { initials: 'Lv', name: 'Lever', url: 'https://www.lever.co/' },
            { initials: 'Wd', name: 'Workday', url: 'https://www.workday.com/' },
        ],
    },
    {
        id: 'volume',
        label: 'Highest job volume',
        dotColor: '#9ca3af',
        boards: [
            { initials: 'N', name: 'Naukri', boardKey: 'naukri', url: 'https://www.naukri.com/' },
            { initials: 'In', name: 'Indeed', boardKey: 'indeed', url: 'https://www.indeed.com/' },
        ],
    },
    {
        id: 'remote',
        label: 'Remote and global',
        dotColor: '#fb923c',
        boards: [
            { initials: 'H', name: 'Hirist', boardKey: 'hirist', url: 'https://www.hirist.com/' },
            { initials: 'Y', name: 'Y Combinator', url: 'https://www.ycombinator.com/jobs' },
            { initials: 'Gd', name: 'Glassdoor', boardKey: 'glassdoor', url: 'https://www.glassdoor.com/' },
        ],
    },
];

const JOB_BOARDS_FEED_TOTAL = JOB_BOARDS_FEED_CATEGORIES.reduce(
    (sum, category) => sum + category.boards.length,
    0
);

const BoardsFeedLayersIcon = ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const BoardsFeedMailIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const BoardsFeedBellIcon = ({ size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
    </svg>
);

/**
 * "All your boards, one feed" concept card. Shows which job boards feed the
 * Gmail inbox scan, grouped by category, with per-board scan status.
 */
const JobBoardsFeedCard = ({ gmailEmail, scanningBoardKeys = [] }) => {
    const activeEmail = gmailEmail || 'your connected inbox';
    const scanningSet = useMemo(
        () => new Set((scanningBoardKeys || []).map((key) => String(key).toLowerCase())),
        [scanningBoardKeys]
    );
    const isBoardScanning = (board) => !!board.boardKey && scanningSet.has(board.boardKey);
    const feedingCount = Math.min(scanningSet.size, JOB_BOARDS_FEED_TOTAL);
    const progressAngle = JOB_BOARDS_FEED_TOTAL > 0
        ? Math.round((feedingCount / JOB_BOARDS_FEED_TOTAL) * 360)
        : 0;

    return (
        <section className="hra-rec__boards-feed" aria-label="All your boards, one feed">
            <div className="hra-rec__boards-feed-intro">
                <span className="hra-rec__boards-feed-badge" aria-hidden>
                    <BoardsFeedLayersIcon size={18} />
                </span>
                <h3 className="hra-rec__boards-feed-title">All your boards, one feed</h3>
            </div>
            <p className="hra-rec__boards-feed-copy">
                Turn on each board&apos;s alerts and Happpy gathers the top roles into one feed.
            </p>

            <div className="hra-rec__boards-feed-progress">
                <span
                    className="hra-rec__boards-feed-progress-ring"
                    style={{ background: `conic-gradient(var(--boards-purple) ${progressAngle}deg, #e5e7eb 0deg)` }}
                    aria-hidden
                >
                    <span className="hra-rec__boards-feed-progress-text">
                        {feedingCount}/{JOB_BOARDS_FEED_TOTAL}
                    </span>
                </span>
                <div className="hra-rec__boards-feed-progress-copy">
                    <p className="hra-rec__boards-feed-progress-head">boards feeding your inbox</p>
                    <p className="hra-rec__boards-feed-progress-sub">Turn on more for a fuller feed.</p>
                </div>
            </div>

            <div className="hra-rec__boards-feed-alert">
                <span className="hra-rec__boards-feed-alert-icon" aria-hidden>
                    <BoardsFeedMailIcon size={14} />
                </span>
                <div className="hra-rec__boards-feed-alert-copy">
                    <p className="hra-rec__boards-feed-alert-title">One rule: use the same email</p>
                    <p className="hra-rec__boards-feed-alert-text">
                        Subscribe to each board with{' '}
                        <span className="hra-rec__boards-feed-alert-email">{activeEmail}</span>
                        {' '}so the scan can read your alerts.
                    </p>
                </div>
            </div>

            <div className="hra-rec__boards-feed-groups">
                {JOB_BOARDS_FEED_CATEGORIES.map((category) => (
                    <div key={category.id} className="hra-rec__boards-feed-group">
                        <div className="hra-rec__boards-feed-group-head">
                            <span
                                className="hra-rec__boards-feed-group-dot"
                                style={{ backgroundColor: category.dotColor }}
                                aria-hidden
                            />
                            <span className="hra-rec__boards-feed-group-label">{category.label}</span>
                        </div>
                        <ul className="hra-rec__boards-feed-list">
                            {category.boards.map((board) => {
                                const scanning = isBoardScanning(board);
                                return (
                                    <li
                                        key={`${category.id}-${board.name}`}
                                        className={`hra-rec__boards-feed-item${
                                            scanning ? ' hra-rec__boards-feed-item--scanning' : ''
                                        }`}
                                    >
                                        <span className="hra-rec__boards-feed-board">
                                            <span className="hra-rec__boards-feed-board-icon" aria-hidden>
                                                {board.initials}
                                            </span>
                                            <span className="hra-rec__boards-feed-board-name">{board.name}</span>
                                        </span>
                                        {scanning ? (
                                            <span className="hra-rec__boards-feed-status">
                                                <span className="hra-rec__boards-feed-status-dot" aria-hidden />
                                                Scanning
                                            </span>
                                        ) : (
                                            <a
                                                className="hra-rec__boards-feed-alert-btn"
                                                href={board.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <BoardsFeedBellIcon size={11} />
                                                Get alerts
                                            </a>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

/** Figma 29796:19856 — queue-capacity pill with CSS hover tooltip. */
function QueueCapacityStatPill({ jobCount = MAX_QUEUE_LIMIT, dailyLimit }) {
    return (
        <div className="hra-rec__stat-pill hra-rec__stat-pill--with-info hra-rec__stat-pill--queue-tip">
            <span className="hra-rec__stat-pill-label">Queue Capacity</span>
            <span className="hra-rec__stat-pill-value">{jobCount} Jobs</span>
            <MatIcon name="info" className="hra-rec__stat-pill-info-icon" aria-hidden />
            <div className="hra-rec__stat-pill-tooltip" role="tooltip">
                <p className="hra-rec__stat-pill-tooltip-text">
                    {`After your daily limit of ${dailyLimit} referral runs - any new referral outreach request will be moved to `}
                    <Link to={JOBS_QUEUE_ACTIVITY_PATH} className="hra-rec__stat-pill-tooltip-link">
                        My Activity - Jobs Queue
                    </Link>
                </p>
            </div>
        </div>
    );
}

const JobBoardSourceIcon = ({ boardKey, label }) => {
    const size = 16;
    const common = { width: size, height: size, 'aria-hidden': true };

    switch (boardKey) {
        case 'linkedin':
            return (
                <svg {...common} viewBox="0 0 16 16" fill="none">
                    <rect width="16" height="16" rx="3" fill="#0A66C2" />
                    <path
                        d="M4.9 6.4h1.5V11H4.9V6.4zm.75-2.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM7.5 6.4h1.4v.7h0c.2-.4.7-.8 1.5-.8 1.5 0 1.8 1 1.8 2.3V11H10.5V8.7c0-.6 0-1.3-.8-1.3-.8 0-.9.6-.9 1.3V11H7.5V6.4z"
                        fill="#fff"
                    />
                </svg>
            );
        case 'naukri':
            return (
                <svg {...common} viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#265DF5" />
                    <path d="M10.4 11L10.3 11.8C7.7 9.4 6.9 8.6 6.8 8.3c0-.1 0-.2.1-.3.3-.4.7-.7 1.1-1 1.4 1.3 3.2 2.9 3.4 3z" fill="#fff" opacity="0.95" />
                    <circle cx="6.7" cy="5" r="1" fill="#fff" />
                </svg>
            );
        case 'indeed':
            return (
                <svg {...common} viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="8" fill="#F5F5F5" />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.3 12.9V8.4c.1 0 .2 0 .3 0 .6 0 1.2-.2 1.7-.5v4.9c0 .4-.1.7-.3.9-.2.2-.5.3-.8.3-.3 0-.6-.2-.8-.4-.2-.2-.3-.5-.3-.9zM7.3 2.1c1.3-.5 2.8-.4 3.9.5.2.2.4.4.5.7.1.4-.4 0-.5 0-.4-.2-.7-.4-1.1-.5-2.2-.7-4.2.5-5.5 2.4-.5.8-.9 1.7-1.1 2.6 0 .1 0 .2-.1.3 0 .1 0-.3 0-.3.1-.4.2-.8.3-1.2.6-2 2-3.7 4-4.5zM10.2 5.8c0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6 0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6z"
                        fill="#003A9B"
                    />
                </svg>
            );
        case 'glassdoor':
            return (
                <svg {...common} viewBox="0 0 16 16" fill="none">
                    <rect width="16" height="16" rx="8" fill="#0CAA41" />
                    <path d="M4.5 6.5h7v1.2h-7V6.5zm0 2.3h7V10h-7V8.8z" fill="#fff" />
                </svg>
            );
        default:
            return (
                <span className="hra-rec__inbox-source-icon-fallback" aria-hidden>
                    {(label || boardKey || '?').charAt(0).toUpperCase()}
                </span>
            );
    }
};

const InboxSourceProgressRing = ({ size, strokeWidth, percent, color, trackColor = INBOX_SOURCE_RING_TRACK }) => {
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const safePercent = Math.max(0, Math.min(100, percent));
    const dashLength = (safePercent / 100) * circumference;
    const gapLength = Math.max(0, circumference - dashLength);

    const rotationAngle = safePercent / 100 * 180;

    return (
        <svg
            className="hra-rec__inbox-source-ring"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            aria-hidden
        >
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={trackColor}
                strokeWidth={strokeWidth}
            />
            {safePercent > 0 && (
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    strokeDasharray={`${dashLength} ${gapLength}`}
                    transform={`rotate(-${rotationAngle} ${center} ${center})`}
                />
            )}
        </svg>
    );
};

const InboxSourcePieChart = ({ ringEntries, chartTotal, displayTotal }) => (
    <div className="hra-rec__inbox-source-pie">
        <div
            className="hra-rec__inbox-source-rings-stack"
            style={{ width: INBOX_SOURCE_PIE_SIZE, height: INBOX_SOURCE_PIE_SIZE }}
            role="img"
            aria-label="Jobs by source chart"
        >
            {ringEntries.map((entry, idx) => {
                const layer = INBOX_SOURCE_RING_LAYERS[idx];
                const pct = chartTotal > 0 ? Math.round((entry.value / chartTotal) * 100) : 0;

                return (
                    <div
                        key={entry.key}
                        className="hra-rec__inbox-source-ring-wrap"
                        style={{
                            width: layer.size,
                            height: layer.size,
                            left: layer.offsetLeft,
                            top: layer.offsetTop,
                        }}
                    >
                        <InboxSourceProgressRing
                            size={layer.size}
                            strokeWidth={layer.stroke}
                            percent={pct}
                            color={entry.color}
                        />
                    </div>
                );
            })}
        </div>
        <div className="hra-rec__inbox-source-total" aria-hidden>
            <span className="hra-rec__inbox-source-total-value">{displayTotal}</span>
            <span className="hra-rec__inbox-source-total-label">Jobs</span>
        </div>
    </div>
);

const InboxJobsBySourceChart = ({ breakdown = {}, totalJobs = 0 }) => {
    const chartEntries = useMemo(() => {
        const ranked = Object.entries(JOB_BOARD_LABELS)
            .map(([key, label]) => ({
                key,
                label,
                value: Number(breakdown[key]) || 0,
            }))
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value);

        return ranked.map((item, idx) => ({
            ...item,
            color: getInboxSourceChartColor(idx),
        }));
    }, [breakdown]);

    const chartTotal = useMemo(
        () => chartEntries.reduce((sum, item) => sum + item.value, 0),
        [chartEntries]
    );

    const displayTotal = totalJobs > 0 ? totalJobs : chartTotal;
    const ringEntries = chartEntries.slice(0, INBOX_SOURCE_RING_LAYERS.length);

    if (chartEntries.length === 0) {
        return (
            <div className="hra-rec__inbox-source-empty">
                <MatIcon name="pie_chart" className="hra-rec__inbox-source-empty-icon" />
                <p className="hra-rec__inbox-source-empty-copy">
                    <strong>No jobs found yet.</strong>
                    {' '}
                    Subscribe to job alerts from LinkedIn, Naukri, Indeed, or other boards to see your breakdown here.
                </p>
            </div>
        );
    }

    return (
        <div className="hra-rec__inbox-source-body">
            <InboxSourcePieChart
                ringEntries={ringEntries}
                chartTotal={chartTotal}
                displayTotal={displayTotal}
            />

            <div className="hra-rec__inbox-source-legend-panel">
                <ul className="hra-rec__inbox-source-legend" aria-label="Job board legend">
                    {chartEntries.map((item) => {
                        const pct = chartTotal > 0 ? Math.round((item.value / chartTotal) * 100) : 0;
                        return (
                            <li key={item.key} className="hra-rec__inbox-source-legend-item">
                                <div className="hra-rec__inbox-source-legend-head">
                                    <JobBoardSourceIcon boardKey={item.key} label={item.label} />
                                    <div className="hra-rec__inbox-source-legend-text">
                                        <span className="hra-rec__inbox-source-legend-label">{item.label}</span>
                                        <span className="hra-rec__inbox-source-legend-pct">{pct}%</span>
                                    </div>
                                </div>
                                <span className="hra-rec__inbox-source-legend-bar" aria-hidden>
                                    <span
                                        className="hra-rec__inbox-source-legend-bar-fill"
                                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                                    />
                                </span>
                                <span className="hra-rec__inbox-source-legend-count">
                                    {item.value} job{item.value === 1 ? '' : 's'}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

const ProgressRing = ({ percent = 100 }) => {
    const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
    const offset = 100 - safePercent;
    return (
        <div className="hra-rec__progress-ring" aria-hidden>
            <svg viewBox="0 0 36 36">
                <circle
                    className="hra-rec__progress-ring-track"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="transparent"
                    strokeWidth="3"
                />
                <circle
                    className="hra-rec__progress-ring-fill"
                    cx="18"
                    cy="18"
                    r="16"
                    fill="transparent"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="hra-rec__progress-ring-label">{safePercent}%</span>
        </div>
    );
};

const CheckCircleIcon = (props) => (
    <svg
        className="hra-rec__check-icon"
        viewBox="0 0 38 38"
        width="38"
        height="38"
        fill="none"
        stroke="#1f8b54"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <circle cx="19" cy="19" r="14.5" />
        <path d="M12.7 19.6l4.6 4.4 8-9" />
    </svg>
);

const CloseIcon = (props) => (
    <svg
        viewBox="0 0 12 12"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        {...props}
    >
        <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
    </svg>
);

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

function formatYoeRange(min, max) {
    const low = Number(min) || 0;
    const high = Number(max) || 0;
    if (low === 0 && high === 0) return '';
    if (low === 0) return `${high} yrs`;
    if (high === 0) return `${low} yrs`;
    if (low === high) return `${low} yrs`;
    return `${low}\u2013${high} yrs`;
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

function formatDescriptionHtml(raw, fallbackText) {
    const input = String(raw || '').trim();
    if (!input) return `<p>${escapeHtml(fallbackText)}</p>`;
    const safe = input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    if (/[<][a-zA-Z!/]/.test(safe)) return safe;
    return `<p>${escapeHtml(safe).replace(/\n/g, '<br/>')}</p>`;
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

function buildMetaLine(job) {
    const parts = [];
    if (job?.city) parts.push(job.city);
    if (job?.ModeOfWork) parts.push(job.ModeOfWork);
    const yoeText = formatYoeRange(job?.YearOfExp, job?.max_yoe);
    if (yoeText) parts.push(yoeText);
    return parts.join(' \u00B7 ');
}

function JobDescriptionModal({ jobModal, onClose }) {
    useEffect(() => {
        if (!jobModal.open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [jobModal.open]);

    useEffect(() => {
        if (!jobModal.open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [jobModal.open, onClose]);

    if (!jobModal.open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="hra-rec__modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="hra-rec__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hra-rec-modal-title"
                aria-describedby="hra-rec-modal-body"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="hra-rec__modal-head">
                    <div className="hra-rec__modal-heading">
                        <h3 id="hra-rec-modal-title" className="hra-rec__modal-title">
                            {jobModal.title}
                        </h3>
                        <p className="hra-rec__modal-company">{jobModal.company}</p>
                    </div>
                    <button
                        type="button"
                        className="hra-rec__modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <CloseIcon width="14" height="14" />
                    </button>
                </div>

                <div id="hra-rec-modal-body" className="hra-rec__modal-body">
                    {jobModal.loading ? (
                        <p className="hra-rec__modal-loading">Loading description…</p>
                    ) : (
                        <div
                            className="hra-rec__modal-description"
                            dangerouslySetInnerHTML={{ __html: jobModal.descriptionHtml }}
                        />
                    )}
                </div>

                {jobModal.applyUrl ? (
                    <div className="hra-rec__modal-foot">
                        <a
                            className="hra-rec__btn hra-rec__btn--ghost"
                            href={jobModal.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open full job
                        </a>
                    </div>
                ) : null}
            </div>
        </div>,
        document.body
    );
}

function RevokeConsentModal({ open, gmailEmail, revoking, onClose, onConfirm }) {
    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !revoking) onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, revoking, onClose]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="hra-rec__modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (!revoking && e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="hra-rec__modal hra-rec__modal--confirm"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hra-rec-revoke-modal-title"
                aria-describedby="hra-rec-revoke-modal-body"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="hra-rec__modal-head hra-rec__modal-head--confirm">
                    <div className="hra-rec__modal-heading">
                        <div className="hra-rec__confirm-icon-wrap" aria-hidden>
                            <MatIcon name="link_off" className="hra-rec__confirm-icon" />
                        </div>
                        <h3 id="hra-rec-revoke-modal-title" className="hra-rec__modal-title">
                            Remove Gmail scan consent?
                        </h3>
                    </div>
                    <button
                        type="button"
                        className="hra-rec__modal-close"
                        onClick={onClose}
                        disabled={revoking}
                        aria-label="Close"
                    >
                        <CloseIcon width="14" height="14" />
                    </button>
                </div>

                <div id="hra-rec-revoke-modal-body" className="hra-rec__modal-body hra-rec__modal-body--confirm">
                    <p className="hra-rec__confirm-copy">
                        Happpy Agent will stop scanning job board alert emails
                        {gmailEmail ? (
                            <span className="hra-rec__consent-email"> ({gmailEmail})</span>
                        ) : null}
                        . You can enable Gmail scan again at any time.
                    </p>
                </div>

                <div className="hra-rec__modal-foot hra-rec__modal-foot--confirm">
                    <button
                        type="button"
                        className="hra-rec__btn hra-rec__btn--ghost"
                        onClick={onClose}
                        disabled={revoking}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="hra-rec__btn hra-rec__btn--danger"
                        onClick={onConfirm}
                        disabled={revoking}
                    >
                        {revoking ? 'Removing…' : 'Remove consent'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

const GmailLogoIcon = ({ size = 20 }) => (
    <svg
        width={size}
        height={size}
        viewBox="52 42 88 66"
        fill="none"
        aria-hidden
        className="hra-rec__gmail-logo"
    >
        <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
        <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
);

/** Figma fi:link-2 — horizontal chain links for Remove consent. */
const RemoveConsentLinkIcon = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="hra-rec__revoke-btn-icon-svg"
    >
        <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const HapppyRecommendedJobs = () => {
    const dispatch = useDispatch();
    /** Single source of truth — see store/reducers/happpyAgentReducer.js. */
    const referralPlan = useSelector((state) => state.happpyAgent);
    const dailyUsed = referralPlan.dailyUsed;
    const dailyLimit = referralPlan.dailyLimit;
    const dailyLimitLoading = referralPlan.dailyLimitLoading;
    const isPaidPlan = Number(referralPlan.plan) === 2 && !referralPlan.has_plan_expired;

    const autoRunHapppyLoaded = referralPlan.dashboardPreferencesLoaded;
    const [searchParams, setSearchParams] = useSearchParams();

    /** Resolve active tab from `?tab=...`, falling back to default when missing/invalid. */
    const activeTab = useMemo(() => {
        const tab = searchParams.get('tab');
        return VALID_RECOMMENDED_JOBS_TAB_IDS.includes(tab) ? tab : DEFAULT_RECOMMENDED_JOBS_TAB;
    }, [searchParams]);

    const autoRunHapppy = useSelector(
        (state) => isAutoRunConsentOn(state.happpyAgent.dashboardData?.auto_run_consent_status),
    );

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [queueingJobId, setQueueingJobId] = useState(null);
    const [queuedJobIds, setQueuedJobIds] = useState({});
    const [brokenCompanyLogos, setBrokenCompanyLogos] = useState({});
    const [page, setPage] = useState(1);

    // auto run consent status is 0, 1, 2
    const [toast, setToast] = useState({
        open: false,
        kind: 'success',
        title: '',
        message: '',
        showQueueLink: false,
    });
    const toastTimerRef = useRef(null);
    const prevEmailBestForYouOnlyRef = useRef(null);
    const [jobModal, setJobModal] = useState({
        open: false,
        loading: false,
        title: '',
        company: '',
        descriptionHtml: '',
        applyUrl: '',
    });
    const [previewJob, setPreviewJob] = useState(null);
    const [emailMeta, setEmailMeta] = useState(null);
    const [emailMetaLoading, setEmailMetaLoading] = useState(false);
    const [emailJobs, setEmailJobs] = useState([]);
    const [emailJobsLoading, setEmailJobsLoading] = useState(false);
    const [consentSaving, setConsentSaving] = useState(false);
    const [consentRevoking, setConsentRevoking] = useState(false);
    const [revokeConsentModalOpen, setRevokeConsentModalOpen] = useState(false);
    const [consentChecked, setConsentChecked] = useState(false);
    const [emailBoardFilter, setEmailBoardFilter] = useState('all');
    const [emailBestForYouOnly, setEmailBestForYouOnly] = useState(false);
    const [emailSourceBreakdown, setEmailSourceBreakdown] = useState(null);
    const [matchFilterOpen, setMatchFilterOpen] = useState(false);
    const [sourceFilterOpen, setSourceFilterOpen] = useState(false);
    const [pasteJobLinkOpen, setPasteJobLinkOpen] = useState(false);
    const [inboxAsideDrawerOpen, setInboxAsideDrawerOpen] = useState(false);
    const matchFilterRef = useRef(null);
    const sourceFilterRef = useRef(null);
    const isCompactAllJobsLayout = useHapppyCompactJobsLayout();

    const TABS = [
        { id: 'all-jobs', label: 'All Jobs' },
        // { id: 'recommended', label: 'Recommended Jobs' },
        { id: 'gmail-scan', label: `Recommended${isCompactAllJobsLayout ? '' : ' Jobs'} from your Inbox` },
    ];

    useEffect(() => {
        if (!inboxAsideDrawerOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setInboxAsideDrawerOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [inboxAsideDrawerOpen]);

    const loadRecommendedJobs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await GET_API(`${API_GET_RECOMMENDED_JOBS}?limit=15`);
            const data = unwrapApiData(response);
            setJobs(Array.isArray(data) ? data : []);
            setPage(1);
        } catch {
            setJobs([]);
            setError('Unable to load recommended jobs right now.');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadEmailMeta = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setEmailMetaLoading(true);
        try {
            const response = await GET_API(API_GET_RECOMMENDED_EMAIL_JOBS_META);
            const data = unwrapApiData(response);
            setEmailMeta(data || null);
            return data;
        } catch {
            if (!silent) {
                setEmailMeta(null);
                setError('Unable to load Gmail scan details right now.');
            }
            return null;
        } finally {
            if (!silent) setEmailMetaLoading(false);
        }
    }, []);

    const loadEmailJobs = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setEmailJobsLoading(true);
        if (!silent) setError('');
        try {
            const response = await GET_API(
                `${API_GET_RECOMMENDED_EMAIL_JOBS}?best_for_you=${emailBestForYouOnly ? 'true' : 'false'}`
            );
            const data = unwrapApiData(response);
            setEmailJobs(Array.isArray(data) ? data : []);
            setEmailSourceBreakdown(response?.data?.breakdown || null);
            setPage(1);
        } catch (err) {
            if (!silent) {
                setEmailJobs([]);
                const message = err?.response?.data?.message || 'Unable to load Gmail scanned jobs right now.';
                setError(message);
            }
        } finally {
            if (!silent) setEmailJobsLoading(false);
        }
    }, [emailBestForYouOnly]);

    useEffect(() => {
        if (activeTab !== 'recommended') return;
        loadRecommendedJobs();
    }, [loadRecommendedJobs, activeTab]);

    useEffect(() => {
        loadEmailMeta({ silent: true });
    }, [loadEmailMeta]);

    useEffect(() => {
        if (activeTab !== 'gmail-scan') return undefined;

        let cancelled = false;
        const loadGmailTab = async () => {
            const meta = await loadEmailMeta();
            if (cancelled) return;
            if (meta?.has_consent && ((meta?.total_jobs ?? 0) > 0 || meta?.last_job_scan != null)) {
                await loadEmailJobs();
            }
        };

        loadGmailTab();
        return () => {
            cancelled = true;
        };
    }, [activeTab, loadEmailMeta, loadEmailJobs]);

    useEffect(() => {
        if (activeTab !== 'gmail-scan' || !emailMeta?.has_consent) return undefined;
        if (emailMeta?.last_job_scan != null || (emailMeta?.total_jobs ?? 0) > 0) return undefined;

        let cancelled = false;

        const refreshScanProgress = async () => {
            const meta = await loadEmailMeta({ silent: true });
            if (cancelled) return;
            if (meta?.last_job_scan != null || (meta?.total_jobs ?? 0) > 0) {
                await loadEmailJobs({ silent: true });
            }
        };

        refreshScanProgress();
        const poll = setInterval(refreshScanProgress, GMAIL_SCAN_POLL_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(poll);
        };
    }, [activeTab, emailMeta?.has_consent, emailMeta?.last_job_scan, emailMeta?.total_jobs, loadEmailMeta, loadEmailJobs]);

    const handleTabChange = useCallback(
        (tabId) => {
            if (tabId === activeTab) return;
            const next = new URLSearchParams(searchParams);
            if (tabId === DEFAULT_RECOMMENDED_JOBS_TAB) {
                next.delete('tab');
            } else {
                next.set('tab', tabId);
            }
            setSearchParams(next, { replace: false });
            setPage(1);
            setError('');
            setMatchFilterOpen(false);
            setSourceFilterOpen(false);
            setInboxAsideDrawerOpen(false);
            if (tabId !== 'gmail-scan') {
                setEmailBoardFilter('all');
                setEmailBestForYouOnly(false);
            }
        },
        [activeTab, searchParams, setSearchParams],
    );

    useEffect(() => {
        if (!matchFilterOpen && !sourceFilterOpen) return undefined;

        const handlePointerDown = (event) => {
            if (matchFilterRef.current && !matchFilterRef.current.contains(event.target)) {
                setMatchFilterOpen(false);
            }
            if (sourceFilterRef.current && !sourceFilterRef.current.contains(event.target)) {
                setSourceFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [matchFilterOpen, sourceFilterOpen]);

    const clearEmailJobFilters = () => {
        setEmailBoardFilter('all');
        setEmailBestForYouOnly(false);
        setPage(1);
        setMatchFilterOpen(false);
        setSourceFilterOpen(false);
    };

    useEffect(() => {
        setPage(1);
        setEmailSourceBreakdown(null);
    }, [emailBoardFilter, emailBestForYouOnly]);

    useEffect(() => {
        if (prevEmailBestForYouOnlyRef.current === emailBestForYouOnly) return;
        const isInitial = prevEmailBestForYouOnlyRef.current === null;
        prevEmailBestForYouOnlyRef.current = emailBestForYouOnly;
        if (isInitial) return;
        if (activeTab !== 'gmail-scan' || !emailMeta?.has_consent) return;
        if (emailMeta?.last_job_scan == null && (emailMeta?.total_jobs ?? 0) === 0) return;

        loadEmailJobs({ silent: true });
    }, [emailBestForYouOnly, activeTab, emailMeta?.has_consent, emailMeta?.last_job_scan, emailMeta?.total_jobs, loadEmailJobs]);

    const handleConsentSubmit = async () => {
        if (!consentChecked || consentSaving) return;
        setConsentSaving(true);
        setError('');
        try {
            const response = await POST_API(API_CONSENT_EMAIL_JOB_SCAN, {});
            const data = unwrapApiData(response);
            setEmailMeta((prev) => ({
                ...(prev || {}),
                has_consent: true,
                consent_email_job_scan: data?.consent_email_job_scan,
                gmail_email: data?.gmail_email ?? prev?.gmail_email,
                last_job_scan: null,
                total_jobs: 0,
            }));
            const refreshedMeta = await loadEmailMeta();
            if ((refreshedMeta?.total_jobs ?? 0) > 0 || refreshedMeta?.last_job_scan != null) {
                await loadEmailJobs();
            }
            showToast('success', 'We will scan job board emails from LinkedIn, Naukri, Glassdoor, and Indeed only.', {
                title: 'Gmail scan enabled',
            });
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to save consent right now.';
            setError(message);
            showToast('error', message);
        } finally {
            setConsentSaving(false);
        }
    };

    const handleRevokeConsent = async () => {
        if (consentRevoking || !emailMeta?.has_consent) return;

        setConsentRevoking(true);
        setError('');
        try {
            const response = await DELETE_API(API_CONSENT_EMAIL_JOB_SCAN);
            const data = unwrapApiData(response);
            setEmailMeta((prev) => ({
                ...(prev || {}),
                has_consent: false,
                consent_email_job_scan: null,
                gmail_connected: data?.gmail_connected ?? prev?.gmail_connected,
                gmail_email: data?.gmail_email ?? prev?.gmail_email,
            }));
            setEmailJobs([]);
            setEmailSourceBreakdown(null);
            setEmailBoardFilter('all');
            setEmailBestForYouOnly(false);
            setConsentChecked(false);
            setPage(1);
            setRevokeConsentModalOpen(false);
            showToast('success', 'Happpy Agent will no longer scan your job board alert emails.', {
                title: 'Gmail scan consent removed',
            });
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to remove consent right now.';
            setError(message);
            showToast('error', message);
        } finally {
            setConsentRevoking(false);
        }
    };

    const openRevokeConsentModal = () => {
        if (consentRevoking || !emailMeta?.has_consent) return;
        setRevokeConsentModalOpen(true);
    };

    const closeRevokeConsentModal = () => {
        if (consentRevoking) return;
        setRevokeConsentModalOpen(false);
    };

    useEffect(() => () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    }, []);

    const showToast = (kind, message, options = {}) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({
            open: true,
            kind,
            message,
            title: options.title || '',
            showQueueLink: Boolean(options.showQueueLink),
        });
        toastTimerRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, open: false }));
        }, TOAST_DURATION_MS);
    };

    const closeToast = () => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast((prev) => ({ ...prev, open: false }));
    };

    const onAddToQueue = async (job, { linkedin_message_id, gmail_message_id } = {}) => {
        const jobId = job?.id;
        if (jobId == null) return;

        setQueueingJobId(jobId);
        setError('');
        try {
            const payload = {
                job_id: jobId,
                source: 'recommended-job page',
            };
            if (job?.HR_Number == null) {
                payload.run_time = true;
            }
            if (linkedin_message_id) payload.linkedin_message_id = linkedin_message_id;
            if (gmail_message_id) payload.gmail_message_id = gmail_message_id;
            const response = await dispatch(submitAutoRunRequest(payload));
            const message = response?.data?.message || 'Job added to Happpy Agent queue!';
            setQueuedJobIds((prev) => ({ ...prev, [jobId]: true }));
            showToast('success', message, {
                title: 'Job added to referral queue!',
                showQueueLink: true,
            });
        } catch (err) {
            const message = err?.response?.data?.message || 'Failed to add job to Happpy Agent queue.';
            setError(message);
            showToast('error', message);
        } finally {
            setQueueingJobId(null);
        }
    };

    const openRunAgentPreview = (job) => {
        if (!job || job.id == null) return;
        setPreviewJob(job);
    };

    const closeRunAgentPreview = useCallback(() => {
        setPreviewJob(null);
    }, []);

    const confirmRunAgentFromPreview = useCallback((messageTemplateIds = {}) => {
        if (previewJob?.id == null) {
            setPreviewJob(null);
            return;
        }
        const job = previewJob;
        setPreviewJob(null);
        onAddToQueue(job, messageTemplateIds);
    }, [previewJob]);

    const openJobDescription = async (job) => {
        setJobModal({
            open: true,
            loading: true,
            title: job?.RequestForTalent || 'Role',
            company: job?.company_name || 'Company',
            descriptionHtml: `<p>${escapeHtml(DEFAULT_DESCRIPTION_FALLBACK)}</p>`,
            applyUrl: job?.apply_url || '',
        });

        const inlineDescription = job?.description || '';
        if (inlineDescription) {
            setJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatDescriptionHtml(inlineDescription, DEFAULT_DESCRIPTION_FALLBACK),
            }));
            return;
        }

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
                descriptionHtml: formatDescriptionHtml(descriptionRaw, DEFAULT_DESCRIPTION_FALLBACK),
            }));
        } catch {
            setJobModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const closeJobDescription = useCallback(() => {
        setJobModal((prev) => ({ ...prev, open: false }));
    }, []);

    const emailBoardCounts = useMemo(() => {
        if (emailSourceBreakdown) return emailSourceBreakdown;
        return emailBestForYouOnly
            ? (emailMeta?.best_for_you_breakdown || {})
            : (emailMeta?.breakdown || {});
    }, [
        emailSourceBreakdown,
        emailBestForYouOnly,
        emailMeta?.breakdown,
        emailMeta?.best_for_you_breakdown,
    ]);

    const filteredEmailJobs = useMemo(() => {
        if (emailBoardFilter === 'all') return emailJobs;
        return emailJobs.filter(
            (job) => String(job?.job_board || '').toLowerCase() === emailBoardFilter
        );
    }, [emailJobs, emailBoardFilter]);

    const emailBoardsWithJobs = useMemo(
        () =>
            Object.keys(JOB_BOARD_LABELS).filter((key) => (emailBoardCounts[key] || 0) > 0),
        [emailBoardCounts]
    );

    const hasActiveEmailFilters = emailBoardFilter !== 'all' || emailBestForYouOnly;
    const canFilterBestForYou = Boolean(emailMeta?.job_function_name);

    useEffect(() => {
        if (emailBoardFilter !== 'all' && !emailBoardsWithJobs.includes(emailBoardFilter)) {
            setEmailBoardFilter('all');
        }
    }, [emailBoardFilter, emailBoardsWithJobs]);

    const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
    const emailTotalPages = Math.max(1, Math.ceil(filteredEmailJobs.length / PAGE_SIZE));
    const isAllJobsTab = activeTab === 'all-jobs';
    const [allJobsToolbarHost, setAllJobsToolbarHost] = useState(null);

    useEffect(() => {
        if (!isAllJobsTab || !isCompactAllJobsLayout) {
            setAllJobsToolbarHost(null);
        }
    }, [isAllJobsTab, isCompactAllJobsLayout]);
    const isGmailTab = activeTab === 'gmail-scan';
    const isGmailScanInProgress = isGmailTab
        && emailMeta?.has_consent
        && (emailMeta?.total_jobs ?? 0) === 0
        && (emailMeta?.last_job_scan == null || emailMeta?.last_job_scan === '');
    const hasCompletedInboxJobScan = Boolean(
        emailMeta?.last_job_scan != null && emailMeta?.last_job_scan !== ''
    );
    const emailJobsPending = isGmailTab
        && emailMeta?.has_consent
        && !isGmailScanInProgress
        && emailJobs.length === 0
        && (emailMeta?.total_jobs ?? 0) > 0;
    const inboxJobsEmptyMessage = hasActiveEmailFilters
        ? 'No jobs match your filters. Try adjusting or clearing the filters above.'
        : (hasCompletedInboxJobScan ? "We didn't find any jobs in your inbox." : '');
    const activeJobs = isGmailTab ? filteredEmailJobs : jobs;
    const activeLoading = isGmailTab
        ? (emailMetaLoading || (!isGmailScanInProgress && (emailJobsLoading || emailJobsPending)))
        : loading;
    const activeTotalPages = isGmailTab ? emailTotalPages : totalPages;
    const currentPage = Math.min(page, activeTotalPages);
    const queuedCount = Object.keys(queuedJobIds).length;
    const queueFull = queuedCount >= MAX_QUEUE_LIMIT;
    const numericDailyLimit = Number(dailyLimit);
    const hasNumericDailyLimit = Number.isFinite(numericDailyLimit) && numericDailyLimit > 0;
    const dailyLimitReached = hasNumericDailyLimit && dailyUsed >= numericDailyLimit;
    const limitsNote =
        !isPaidPlan
            ? `Happpy Agent processes up to ${dailyLimit} jobs per day. Upgrade to a paid plan for 8 applications per day and Queue Mode.`
            : `Happpy Agent processes up to ${dailyLimit} jobs per day. Once you reach your daily limit, remaining jobs are automatically queued for the following days.`;
    const runsRemaining = hasNumericDailyLimit
        ? Math.max(0, numericDailyLimit - dailyUsed)
        : null;
    const runsRemainingPercent = hasNumericDailyLimit
        ? Math.round((runsRemaining / numericDailyLimit) * 100)
        : null;
    const runsRemainingNote = !hasNumericDailyLimit
        ? limitsNote
        : dailyLimitReached
            ? 'Daily limit reached. New runs will be moved to your queue.'
            : runsRemainingPercent === 100
                ? 'All runs remaining for today.'
                : `${runsRemaining} of ${numericDailyLimit} runs remaining today.`;
    const dailyLimitNumberForCopy = hasNumericDailyLimit ? numericDailyLimit : dailyLimit;
    const pageStart = activeJobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const pageEnd = Math.min(currentPage * PAGE_SIZE, activeJobs.length);
    const showingCountLabel = activeLoading
        ? null
        : activeJobs.length === 0
            ? ''
            : `Showing ${pageStart}-${pageEnd} of ${activeJobs.length}`;
    const tabCounts = {
        recommended: jobs.length,
        'gmail-scan': emailMeta?.total_jobs ?? emailJobs.length,
    };
    const pageTitle = isAllJobsTab
        ? 'All Jobs | Happpy Agent | Uplers'
        : isGmailTab
            ? 'Recommended jobs from inbox | Happpy Agent | Uplers'
            : 'Recommended jobs | Happpy Agent | Uplers';

    useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    const bentoLoading = dailyLimitLoading;
    const skeletonCards = useMemo(
        () => Array.from({ length: SKELETON_CARD_COUNT }, (_, idx) => idx),
        []
    );
    const pagedJobs = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return activeJobs.slice(start, start + PAGE_SIZE);
    }, [activeJobs, currentPage]);

    const renderJobBoardBadge = (job) => {
        const board = String(job?.job_board || '').toLowerCase();
        if (!board || !JOB_BOARD_LABELS[board]) return null;
        return (
            <span className={`hra-rec__board-pill hra-rec__board-pill--${board}`}>
                {JOB_BOARD_LABELS[board]}
            </span>
        );
    };

    const renderInboxFiltersSkeleton = () => (
        <div className="hra-rec__inbox-filters hra-rec__inbox-filters--skeleton" aria-hidden>
            <span className="hra-rec__skel hra-rec__skel--inbox-filter" />
            <span className="hra-rec__skel hra-rec__skel--inbox-filter" />
        </div>
    );

    const renderInboxFilterDropdown = ({
        label,
        menuId,
        triggerLabel,
        count,
        open,
        onToggle,
        containerRef,
        options,
    }) => (
        <div className="hra-rec__inbox-filter">
            <span className="hra-rec__inbox-filter-label">{label}</span>
            <div className="hra-rec__inbox-filter-menu" ref={containerRef}>
                <button
                    type="button"
                    id={`${menuId}-trigger`}
                    className="hra-rec__inbox-filter-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={`${menuId}-list`}
                    onClick={onToggle}
                >
                    <span className="hra-rec__inbox-filter-value">{triggerLabel}</span>
                    <span className="hra-rec__inbox-filter-count">{count}</span>
                    <MatIcon
                        name="expand_more"
                        className={`hra-rec__inbox-filter-chevron${open ? ' hra-rec__inbox-filter-chevron--open' : ''}`}
                    />
                </button>
                {open ? (
                    <ul
                        id={`${menuId}-list`}
                        className="hra-rec__inbox-filter-options"
                        role="listbox"
                        aria-labelledby={`${menuId}-trigger`}
                    >
                        {options.map((option) => (
                            <li key={option.id} role="option" aria-selected={option.active}>
                                <button
                                    type="button"
                                    className={`hra-rec__inbox-filter-option${option.active ? ' hra-rec__inbox-filter-option--active' : ''}`}
                                    onClick={option.onSelect}
                                >
                                    <span>{option.label}</span>
                                    <span className="hra-rec__inbox-filter-count">{option.count}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </div>
    );

    const renderInboxMoreButton = () => (
        <button
            type="button"
            className="hra-rec__inbox-more-btn"
            aria-label="Open jobs by source summary"
            onClick={() => {
                setMatchFilterOpen(false);
                setSourceFilterOpen(false);
                setInboxAsideDrawerOpen(true);
            }}
        >
            <MatIcon name="more_vert" className="hra-rec__inbox-more-btn-icon" />
        </button>
    );

    const getInboxFilterControlsState = () => {
        if (!isGmailTab || !emailMeta?.has_consent || isGmailScanInProgress) {
            return false;
        }
        if (emailJobsLoading && !emailSourceBreakdown && !emailMeta?.breakdown) {
            return 'skeleton';
        }
        if ((emailMeta?.total_jobs ?? 0) === 0 && emailJobs.length === 0) {
            return false;
        }
        if (!canFilterBestForYou && emailBoardsWithJobs.length <= 1) {
            return false;
        }
        return true;
    };

    const renderInboxFilterControls = () => {
        const matchCount = emailBestForYouOnly
            ? (emailMeta?.best_for_you_count ?? 0)
            : (emailMeta?.total_jobs ?? emailJobs.length);
        const sourceLabel = emailBoardFilter === 'all'
            ? 'All sources'
            : JOB_BOARD_LABELS[emailBoardFilter];
        const sourceCount = emailBoardFilter === 'all'
            ? (emailMeta?.total_jobs ?? emailJobs.length)
            : (emailBoardCounts[emailBoardFilter] ?? 0);

        return (
            <>
                {canFilterBestForYou ? renderInboxFilterDropdown({
                    label: 'Match',
                    menuId: 'hra-rec-match-filter',
                    triggerLabel: emailBestForYouOnly ? 'Best for you' : 'All jobs',
                    count: matchCount,
                    open: matchFilterOpen,
                    onToggle: () => {
                        setSourceFilterOpen(false);
                        setMatchFilterOpen((prev) => !prev);
                    },
                    containerRef: matchFilterRef,
                    options: [
                        {
                            id: 'all-jobs',
                            label: 'All jobs',
                            count: emailMeta?.total_jobs ?? emailJobs.length,
                            active: !emailBestForYouOnly,
                            onSelect: () => {
                                setEmailBestForYouOnly(false);
                                setMatchFilterOpen(false);
                            },
                        },
                        {
                            id: 'best-for-you',
                            label: 'Best for you',
                            count: emailMeta?.best_for_you_count ?? 0,
                            active: emailBestForYouOnly,
                            onSelect: () => {
                                setEmailBestForYouOnly(true);
                                setMatchFilterOpen(false);
                            },
                        },
                    ],
                }) : null}

                {emailBoardsWithJobs.length > 1 ? renderInboxFilterDropdown({
                    label: 'Job Source',
                    menuId: 'hra-rec-source-filter',
                    triggerLabel: sourceLabel,
                    count: sourceCount,
                    open: sourceFilterOpen,
                    onToggle: () => {
                        setMatchFilterOpen(false);
                        setSourceFilterOpen((prev) => !prev);
                    },
                    containerRef: sourceFilterRef,
                    options: [
                        {
                            id: 'all-sources',
                            label: 'All sources',
                            count: emailMeta?.total_jobs ?? emailJobs.length,
                            active: emailBoardFilter === 'all',
                            onSelect: () => {
                                setEmailBoardFilter('all');
                                setSourceFilterOpen(false);
                            },
                        },
                        ...emailBoardsWithJobs.map((boardKey) => ({
                            id: boardKey,
                            label: JOB_BOARD_LABELS[boardKey],
                            count: emailBoardCounts[boardKey] ?? 0,
                            active: emailBoardFilter === boardKey,
                            onSelect: () => {
                                setEmailBoardFilter(boardKey);
                                setSourceFilterOpen(false);
                            },
                        })),
                    ],
                }) : null}
            </>
        );
    };

    const renderGmailInboxToolbar = () => {
        const filterState = getInboxFilterControlsState();
        const showAsideTrigger = isGmailTab && emailMeta?.has_consent && !isGmailScanInProgress;

        if (!showAsideTrigger && !filterState) {
            return null;
        }

        if (filterState === 'skeleton') {
            return (
                <div className="hra-rec__inbox-filters-wrap">
                    <div className="hra-rec__inbox-filters-row">
                        {renderInboxFiltersSkeleton()}
                        {showAsideTrigger ? renderInboxMoreButton() : null}
                    </div>
                </div>
            );
        }

        return (
            <div className="hra-rec__inbox-filters-wrap">
                <div className="hra-rec__inbox-filters-row">
                    {filterState ? (
                        <div className="hra-rec__inbox-filters" aria-label="Filter Gmail scanned jobs">
                            {renderInboxFilterControls()}
                        </div>
                    ) : (
                        <div className="hra-rec__inbox-filters-spacer" aria-hidden />
                    )}
                    {showAsideTrigger ? renderInboxMoreButton() : null}
                </div>

                {filterState && hasActiveEmailFilters ? (
                    <button
                        type="button"
                        className="hra-rec__inbox-filters-clear"
                        onClick={clearEmailJobFilters}
                    >
                        Clear filters
                    </button>
                ) : null}

                {filterState && canFilterBestForYou && emailMeta?.job_function_name ? (
                    <p className="hra-rec__inbox-filters-hint">
                        Best for you matches your {emailMeta.job_function_name} profile.
                    </p>
                ) : null}
            </div>
        );
    };

    const renderGmailScanFilters = () => renderGmailInboxToolbar();

    const renderRaiseTicketButton = (className = '', { variant = 'button' } = {}) => {
        if (variant === 'text') {
            return (
                <p className={`hra-rec__inbox-help${className ? ` ${className}` : ''}`}>
                    Need help?{' '}
                    <Link className="hra-rec__inbox-help-link" to={HELP_GUIDE_RAISE_TICKET_PATH}>
                        Raise a Query
                    </Link>
                </p>
            );
        }

        return (
            <Link
                className={`hra-rec__help-ticket-btn${className ? ` ${className}` : ''}`}
                to={HELP_GUIDE_RAISE_TICKET_PATH}
            >
                <MatIcon name="support_agent" className="hra-rec__help-ticket-btn-icon" />
                <span>Raise a ticket if you need help</span>
            </Link>
        );
    };

    const renderGmailConsentActive = () => (
        <div className="hra-rec__consent-active hra-rec__consent-active--aside" aria-label="Gmail scan consent status">
            <div className="hra-rec__consent-active-head">
                <GmailLogoIcon size={20} />
                <p className="hra-rec__consent-active-title">Gmail scan is enabled</p>
            </div>
            <div className="hra-rec__consent-active-detail">
                <p className="hra-rec__consent-active-detail-line">
                    Scanning job board alerts
                    {emailMeta?.gmail_email ? (
                        <span className="hra-rec__consent-email"> ({emailMeta.gmail_email})</span>
                    ) : null}
                    .
                </p>
                <p className="hra-rec__consent-active-detail-line">You can remove consent at any time</p>
            </div>
            <button
                type="button"
                className="hra-rec__revoke-btn hra-rec__revoke-btn--inbox"
                onClick={openRevokeConsentModal}
                disabled={consentRevoking}
            >
                <RemoveConsentLinkIcon size={16} />
                <span className="hra-rec__revoke-btn-label">
                    {consentRevoking ? 'Removing…' : 'Remove consent'}
                </span>
            </button>
        </div>
    );

    const renderGmailScanProgress = () => (
        <div className="hra-rec__scan-progress" role="status" aria-live="polite">
            <div className="hra-rec__scan-progress-icon-wrap" aria-hidden>
                <MatIcon name="sync" className="hra-rec__scan-progress-icon" />
            </div>
            <h3 className="hra-rec__scan-progress-title">Happpy Agent is scanning your Gmail</h3>
            <p className="hra-rec__scan-progress-copy">
                We&apos;re looking through your job board alert emails from LinkedIn, Naukri, Glassdoor,
                and Indeed. This can take a few minutes — you can come back here when the scan is complete.
            </p>
            <div className="hra-rec__scan-progress-bar" aria-hidden>
                <span className="hra-rec__scan-progress-bar-fill" />
            </div>
        </div>
    );

    const renderGmailScanAsideContent = ({ variant = 'aside' } = {}) => {
        if (emailMetaLoading && !emailMeta) {
            return (
                <>
                    <div className="hra-rec__scan-chart-card hra-rec__scan-chart-card--inbox hra-rec__scan-chart-card--skeleton">
                        <span className="hra-rec__skel hra-rec__skel--inbox-chart-head" />
                        <div className="hra-rec__inbox-source-body hra-rec__inbox-source-body--skeleton">
                            <span className="hra-rec__skel hra-rec__skel--inbox-chart-rings" />
                            <span className="hra-rec__skel hra-rec__skel--inbox-chart-legend" />
                        </div>
                    </div>
                    <span className="hra-rec__skel hra-rec__skel--inbox-consent" />
                    <span className="hra-rec__skel hra-rec__skel--inbox-help" />
                </>
            );
        }

        const chartTotalJobs = emailBestForYouOnly
            ? (emailMeta?.best_for_you_count ?? 0)
            : (emailMeta?.total_jobs ?? 0);

        return (
            <>
                <JobBoardsFeedCard
                    gmailEmail={emailMeta?.gmail_email}
                    scanningBoardKeys={emailBoardsWithJobs}
                />
                {/* <div
                    className={`hra-rec__scan-chart-card hra-rec__scan-chart-card--inbox${
                        variant === 'drawer' ? ' hra-rec__scan-chart-card--drawer' : ''
                    }`}
                >
                    <div className="hra-rec__inbox-source-glow" aria-hidden />
                    <div className="hra-rec__scan-chart-card-head">
                        <MatIcon name="filter_list" className="hra-rec__scan-chart-card-icon-glyph" />
                        <p className="hra-rec__scan-breakdown-title">Jobs by source</p>
                    </div>
                    <InboxJobsBySourceChart
                        breakdown={emailBoardCounts}
                        totalJobs={chartTotalJobs}
                    />
                </div> */}
                {renderGmailConsentActive()}
                {renderRaiseTicketButton('hra-rec__inbox-help--aside', { variant: 'text' })}
            </>
        );
    };

    const renderGmailScanChartAside = () => {
        if (!isGmailTab || !emailMeta?.has_consent) return null;

        return (
            <aside className="hra-rec__gmail-aside hra-rec__gmail-aside--desktop" aria-label="Gmail scan summary">
                {renderGmailScanAsideContent()}
            </aside>
        );
    };

    const renderInboxAsideDrawer = () => {
        if (!inboxAsideDrawerOpen || typeof document === 'undefined') return null;

        return createPortal(
            <div
                className="hra-rec__inbox-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Jobs by source"
            >
                <button
                    type="button"
                    className="hra-rec__inbox-drawer__backdrop"
                    aria-label="Close jobs by source panel"
                    onClick={() => setInboxAsideDrawerOpen(false)}
                />
                <div
                    className="hra-rec__inbox-drawer__panel"
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <button
                        type="button"
                        className="hra-rec__inbox-drawer__close"
                        onClick={() => setInboxAsideDrawerOpen(false)}
                        aria-label="Close"
                    >
                        <CloseIcon width="16" height="16" />
                    </button>
                    <div className="hra-rec__inbox-drawer__body">
                        {renderGmailScanAsideContent({ variant: 'drawer' })}
                    </div>
                </div>
            </div>,
            document.body,
        );
    };

    const renderGmailConsentInfo = () => (
        <div className="hra-rec__consent-info-grid" aria-label="Gmail scan benefits">
            {GMAIL_CONSENT_INFO.map((item) => (
                <div key={item.title} className="hra-rec__consent-info-card">
                    <MatIcon name={item.icon} className="hra-rec__consent-info-icon" />
                    <h3 className="hra-rec__consent-info-title">{item.title}</h3>
                    <p className="hra-rec__consent-info-copy">{item.copy}</p>
                </div>
            ))}
        </div>
    );

    const renderGmailConsent = () => {
        if (!isGmailTab) return null;

        if (emailMetaLoading) {
            return (<></>);
        }

        if (emailMeta?.has_consent) return null;

        if (!emailMeta?.gmail_connected) {
            return (
                <div className="hra-rec__consent-wrap">
                    <div className="hra-rec__consent-panel">
                        <div className="hra-rec__consent-panel-inner">
                            <div className="hra-rec__consent-panel-top">
                                <div className="hra-rec__consent-icon-wrap">
                                    <MatIcon name="mail" className="hra-rec__consent-icon" />
                                </div>
                                <div className="hra-rec__consent-panel-copy">
                                    <h2 className="hra-rec__consent-title">Connect Gmail to scan job board emails</h2>
                                    <p className="hra-rec__consent-copy">
                                        Happpy Agent needs your connected Gmail account before it can scan job alerts from
                                        LinkedIn, Naukri, Glassdoor, and Indeed.
                                    </p>
                                </div>
                            </div>
                            <hr className="hra-rec__consent-divider" />
                            <div className="hra-rec__consent-panel-footer hra-rec__consent-panel-footer--solo">
                                <Link className="hra-rec__enable-btn" to="/talent/job-agent/configure?tab=connected-accounts">
                                    <MatIcon name="link" filled className="hra-rec__enable-btn-icon" />
                                    <span>Connect Gmail</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="hra-rec__consent-wrap">
                <div className="hra-rec__consent-panel">
                    <div className="hra-rec__consent-panel-inner">
                        <div className="hra-rec__consent-panel-top">
                            <div className="hra-rec__consent-icon-wrap">
                                <MatIcon name="mail" className="hra-rec__consent-icon" />
                            </div>
                            <div className="hra-rec__consent-panel-copy">
                                <h2 className="hra-rec__consent-title">Allow Gmail job board scan</h2>
                                <p className="hra-rec__consent-copy">
                                    Happpy Agent will scan job board emails in your connected Gmail account
                                    {emailMeta?.gmail_email ? (
                                        <span className="hra-rec__consent-email"> ({emailMeta.gmail_email})</span>
                                    ) : null}
                                    . We strictly only read alerts from job boards. No other emails or personal communications are ever accessed.
                                </p>
                            </div>
                        </div>

                        <hr className="hra-rec__consent-divider" />

                        <div className="hra-rec__consent-panel-footer">
                            <label className="hra-rec__consent-check-wrap" htmlFor="hra-rec-gmail-consent">
                                <span className="hra-rec__consent-checkbox-box">
                                    <input
                                        id="hra-rec-gmail-consent"
                                        className="hra-rec__consent-checkbox"
                                        type="checkbox"
                                        checked={consentChecked}
                                        onChange={(e) => setConsentChecked(e.target.checked)}
                                    />
                                    {consentChecked ? (
                                        <MatIcon name="check" filled className="hra-rec__consent-checkbox-icon" />
                                    ) : null}
                                </span>
                                <span className="hra-rec__consent-check">
                                    I understand and allow Happpy Agent to scan my job board alert emails only for the
                                    purpose of job recommendations.
                                </span>
                            </label>
                            <button
                                type="button"
                                className="hra-rec__enable-btn"
                                onClick={handleConsentSubmit}
                                disabled={!consentChecked || consentSaving}
                            >
                                <MatIcon name="bolt" filled className="hra-rec__enable-btn-icon" />
                                <span>{consentSaving ? 'Enabling…' : 'Enable Gmail Scan'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getJobSkillPills = (job) => {
        const pills = [];
        const yoe = formatYoeRange(job?.YearOfExp, job?.max_yoe);
        if (yoe && String(job?.YearOfExp) !== 'Recommended') {
            pills.push(`${yoe} Exp`);
        }
        const skills = Array.isArray(job?.skills) ? job.skills : [];
        skills.slice(0, 3).forEach((skill) => {
            if (skill) pills.push(skill);
        });
        return pills.slice(0, 4);
    };

    const renderJobLocationIcon = (job) => {
        const mode = String(job?.ModeOfWork || '').toLowerCase();
        if (mode.includes('remote')) return 'public';
        return 'location_on';
    };

    const renderPanelRowSkeleton = () => (
        <>
            <div className="hra-rec__row-main">
                <span className="hra-rec__avatar hra-rec__avatar--row hra-rec__avatar--skeleton" />
                <div className="hra-rec__row-info">
                    <span className="hra-rec__skel hra-rec__skel--row-title" />
                    <span className="hra-rec__skel hra-rec__skel--row-meta" />
                    <div className="hra-rec__skel-pills" aria-hidden>
                        <span className="hra-rec__skel hra-rec__skel--pill" />
                        <span className="hra-rec__skel hra-rec__skel--pill" />
                        <span className="hra-rec__skel hra-rec__skel--pill hra-rec__skel--pill-wide" />
                    </div>
                </div>
            </div>
            <div className="hra-rec__row-actions">
                <span className="hra-rec__skel hra-rec__skel--btn-outline" />
                <span className="hra-rec__skel hra-rec__skel--btn-dark" />
            </div>
        </>
    );

    const renderJobRows = (listJobs, listLoading, emptyMessage = '', { variant = 'card' } = {}) => {
        const isRowVariant = variant === 'row';
        const listClassName = isRowVariant ? 'hra-rec__list hra-rec__list--rows' : 'hra-rec__list';

        if (listLoading) {
            return (
                <ul className={listClassName} aria-label="Recommended jobs list">
                    {skeletonCards.map((card) => (
                        <li
                            key={card}
                            className={
                                isRowVariant
                                    ? 'hra-rec__row hra-rec__row--skeleton'
                                    : 'hra-rec__job-card hra-rec__job-card--skeleton'
                            }
                            aria-hidden
                        >
                            {isRowVariant ? renderPanelRowSkeleton() : (
                                <div className="hra-rec__job-card-main">
                                    <span className="hra-rec__avatar hra-rec__avatar--skeleton" />
                                    <div className="hra-rec__row-info">
                                        <span className="hra-rec__skel hra-rec__skel--title" />
                                        <span className="hra-rec__skel hra-rec__skel--meta" />
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            );
        }
        if (pagedJobs.length === 0) {
            return (
                <div className="hra-rec__empty" role="status">
                    <p>
                        {emptyMessage
                            || (isGmailTab
                                ? 'No scanned jobs yet.'
                                : 'No recommended jobs right now.')}
                    </p>
                </div>
            );
        }

        return (
            <ul className={listClassName} aria-label="Recommended jobs list">
                {pagedJobs.map((job, idx) => {
                    const isQueued = !!queuedJobIds[job.id];
                    const isQueueing = queueingJobId === job.id;
                    const jobStableKey = getJobStableKey(job, idx);
                    const logoUrl = normalizeCompanyLogo(job.company_logo);
                    const hasValidCompanyLogo =
                        !!logoUrl && !brokenCompanyLogos[jobStableKey];
                    const initial = getInitial(job.company_name);
                    const postedAgo = formatPostedAgo(job.publish_datetime);
                    const locationLabel = [job?.city, job?.ModeOfWork].filter(Boolean).join(', ');
                    const skillPills = getJobSkillPills(job);

                    return (
                        <li
                            key={jobStableKey}
                            className={isRowVariant ? 'hra-rec__row' : 'hra-rec__job-card'}
                        >
                            <div className={isRowVariant ? 'hra-rec__row-main' : 'hra-rec__job-card-main'}>
                                <span
                                    className={`hra-rec__avatar${isRowVariant ? ' hra-rec__avatar--row' : ''}`}
                                    aria-hidden
                                >
                                    {hasValidCompanyLogo ? (
                                        <img
                                            className="hra-rec__avatar-img"
                                            src={logoUrl}
                                            alt=""
                                            onError={() => {
                                                setBrokenCompanyLogos((prev) => ({
                                                    ...prev,
                                                    [jobStableKey]: true,
                                                }));
                                            }}
                                        />
                                    ) : (
                                        <span className="hra-rec__avatar-letter">{initial}</span>
                                    )}
                                </span>
                                <div className="hra-rec__row-info">
                                    <div className="hra-rec__row-title-row">
                                        <h3 className="hra-rec__row-title" title={job.RequestForTalent || 'Role'}>
                                            {job.RequestForTalent || 'Role'}
                                        </h3>
                                        {renderJobBoardBadge(job)}
                                    </div>
                                    <div className="hra-rec__job-meta-list">
                                        <span className="hra-rec__job-meta-item">
                                            <MatIcon name="business" className="hra-rec__job-meta-icon" />
                                            {job.company_name || 'Company'}
                                        </span>
                                        {locationLabel ? (
                                            <span className="hra-rec__job-meta-item">
                                                <MatIcon
                                                    name={renderJobLocationIcon(job)}
                                                    className="hra-rec__job-meta-icon"
                                                />
                                                {locationLabel}
                                            </span>
                                        ) : null}
                                        {postedAgo ? (
                                            <span className="hra-rec__job-meta-item">
                                                <MatIcon name="history" className="hra-rec__job-meta-icon" />
                                                Posted {postedAgo}
                                            </span>
                                        ) : null}
                                    </div>
                                    {skillPills.length > 0 ? (
                                        <div className="hra-rec__skill-pills">
                                            {skillPills.map((pill) => (
                                                <span key={`${jobStableKey}-${pill}`} className="hra-rec__skill-pill">
                                                    {pill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="hra-rec__row-actions">
                                {job.apply_url ? (
                                    <a
                                        className={`hra-rec__btn${isRowVariant ? ' hra-rec__btn--outline' : ' hra-rec__btn--ghost'}`}
                                        href={job.apply_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Job
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        className={`hra-rec__btn${isRowVariant ? ' hra-rec__btn--outline' : ' hra-rec__btn--ghost'}`}
                                        onClick={() => openJobDescription(job)}
                                    >
                                        View Job
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={`hra-rec__btn${isRowVariant ? ' hra-rec__btn--dark' : ' hra-rec__btn--run'}`}
                                    onClick={() => openRunAgentPreview(job)}
                                    disabled={
                                        isQueueing
                                        || isQueued
                                        || queueingJobId != null
                                        || (queueFull && !isQueued)
                                    }
                                >
                                    {!isRowVariant ? (
                                        <MatIcon name="play_arrow" className="hra-rec__btn-icon" />
                                    ) : null}
                                    {isQueueing
                                        ? 'Adding…'
                                        : queueFull && !isQueued
                                            ? 'Queue Full'
                                            : isQueued
                                                ? 'Added to Queue'
                                                : 'Run Agent'}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const goToPage = (next) => {
        const target = Math.min(Math.max(1, next), activeTotalPages);
        if (target === currentPage) return;
        setPage(target);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getJobStableKey = (job, idx = 0) => {
        if (job?.id != null) return `id-${job.id}`;
        if (job?.HR_Number != null) return `hr-${job.HR_Number}`;
        if (job?.apply_url) return `url-${job.apply_url}`;
        return `idx-${idx}`;
    };

    const formatPaginationDigit = (num) => String(num).padStart(2, '0');

    const renderGmailPagination = () => (
        !activeLoading && activeJobs.length > 0 && activeTotalPages > 1 ? (
            <nav className="hra-rec__pagination" aria-label="Recommended jobs pagination">
                <button
                    type="button"
                    className="hra-rec__page-step"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                >
                    ‹
                </button>
                <ul className="hra-rec__page-list">
                    {Array.from({ length: activeTotalPages }, (_, i) => i + 1).map((p) => (
                        <li key={p}>
                            <button
                                type="button"
                                className={`hra-rec__page-num${p === currentPage ? ' hra-rec__page-num--active' : ''}`}
                                onClick={() => goToPage(p)}
                                aria-current={p === currentPage ? 'page' : undefined}
                            >
                                {formatPaginationDigit(p)}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    className="hra-rec__page-step"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === activeTotalPages}
                    aria-label="Next page"
                >
                    ›
                </button>
            </nav>
        ) : null
    );

    const dailyLimitLabel = bentoLoading ? null : `${dailyLimit}/day`;

    const renderAutoRunNudge = () => {
        if (!autoRunHapppyLoaded || autoRunHapppy) return null;

        return (
            <Link
                className="hra-rec__auto-run-nudge"
                to={AUTO_RUN_CONFIGURE_PATH}
                aria-label="Configure HAPPPY to auto run on jobs when you are inactive"
            >
                <span className="hra-rec__auto-run-nudge-icon-wrap" aria-hidden>
                    <MatIcon name="schedule_send" className="hra-rec__auto-run-nudge-icon" />
                </span>
                <span className="hra-rec__auto-run-nudge-copy">
                    Want HAPPPY to auto run on jobs if you are inactive?
                </span>
                <MatIcon name="chevron_right" className="hra-rec__auto-run-nudge-arrow" aria-hidden />
            </Link>
        );
    };

    const renderTabsNav = () => (
        <nav className="hra-rec__tabs hra-rec__tabs--segmented" aria-label="Recommended jobs views">
            {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tabCounts[tab.id];
                const showCount = tab.id === 'recommended'
                    ? !loading
                    : tab.id === 'gmail-scan'
                        ? !emailMetaLoading && Boolean(emailMeta?.has_consent)
                        : false;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        className={`hra-rec__tab${isActive ? ' hra-rec__tab--active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        <span className="hra-rec__tab-label">{tab.label}</span>
                        {showCount ? (
                            <span className="hra-rec__tab-count" aria-hidden="true">
                                {count}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </nav>
    );

    const renderPageHead = () => (
        <header className="hra-rec__page-head">
            <div className="hra-rec__page-intro">
                <h1 className="hra-rec__page-title">Recommended Jobs</h1>
            </div>
            <div className="hra-rec__page-head-actions" aria-label="Referral limits and actions">
                <div className="hra-rec__page-head-stats">
                    {bentoLoading ? (
                        <>
                            <span className="hra-rec__skel hra-rec__skel--stat-pill" aria-hidden />
                            <span className="hra-rec__skel hra-rec__skel--stat-pill" aria-hidden />
                        </>
                    ) : (
                        <>
                            <div className={`hra-rec__stat-pill ${dailyLimitReached ? 'limit-reached' : ''}`}>
                                <span className="hra-rec__stat-pill-label">Daily limit of Referrals</span>
                                <span className="hra-rec__stat-pill-value">{dailyLimitLabel}</span>
                            </div>
                            <QueueCapacityStatPill dailyLimit={dailyLimit} />
                        </>
                    )}
                </div>
                <button
                    type="button"
                    className="hra-rec__paste-link"
                    onClick={() => setPasteJobLinkOpen(true)}
                >
                    <MatIcon name="add" className="hra-rec__paste-link-icon" aria-hidden />
                    <span className="hra-rec__paste-link-text">paste job link</span>
                </button>
            </div>
        </header>
    );

    const renderSectionHead = () => {
        if (isGmailTab) {
            return (
                <div className="hra-rec__section-head">
                    <div className="hra-rec__section-head-main">
                        <h2 className="hra-rec__section-title" />
                        {showingCountLabel ? (
                            <span className="hra-rec__count-pill">{showingCountLabel}</span>
                        ) : null}
                    </div>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="hra-rec__panel-head hra-rec__panel-head--skeleton" aria-hidden>
                    <span className="hra-rec__skel hra-rec__skel--panel-title" />
                    <div className="hra-rec__panel-actions">
                        <span className="hra-rec__skel hra-rec__skel--panel-count" />
                        <span className="hra-rec__skel hra-rec__skel--panel-link" />
                    </div>
                </div>
            );
        }

        return (
            <div className="hra-rec__panel-head">
                <h2 className="hra-rec__panel-title">Recommended Jobs for You</h2>
                <div className="hra-rec__panel-actions">
                    {showingCountLabel ? (
                        <p className="hra-rec__panel-count">{showingCountLabel}</p>
                    ) : null}
                    <a
                        className="hra-rec__more-link"
                        href={`${APP_URL}talent/all-opportunities`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <span>More jobs</span>
                        <MatIcon name="arrow_forward" className="hra-rec__arrow-icon" />
                    </a>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="hra-rec">
                {renderPageHead()}

                {/* <div className={`hra-rec__bento${isPaidPlan ? ' hra-rec__bento--single' : ''}`}>

                     {!isPaidPlan && !bentoLoading ? ( 
                        <section className="hra-rec__upgrade-card" aria-label="Upgrade plan">
                            <div className="hra-rec__upgrade-card-glow" aria-hidden />
                            <div className="hra-rec__upgrade-card-content">
                                <h3 className="hra-rec__upgrade-title">Maximize your job hunt</h3>
                                <p className="hra-rec__upgrade-copy">
                                    Happpy Agent processes up to {dailyLimit} jobs per day on Free. Upgrade to a paid
                                    plan for <strong>8 applications per day</strong> and unlock Queue Mode.
                                </p>
                                <Link className="hra-rec__upgrade-btn" to="/talent/job-agent/subscription">
                                    Upgrade Now
                                </Link>
                            </div>
                        </section>
                    ) : null} 
                </div>  */}

                {dailyLimitReached && isPaidPlan ? (
                    <aside className="hra-rec__tip" role="note" aria-label="Happpy Agent tip">
                        <span className="hra-rec__tip-mascot" aria-hidden>
                            <img
                                src={`${IMAGE_URL}outreach/mascot-think.svg`}
                                alt=""
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </span>
                        <div className="hra-rec__tip-bubble">
                            <span className="hra-rec__tip-arrow" aria-hidden />
                            <p className="hra-rec__tip-line hra-rec__tip-line--primary">
                                {`Hey! You've already run ${dailyLimitNumberForCopy} referrals today, including any jobs that were in queue since yesterday`}
                            </p>
                            <p className="hra-rec__tip-line hra-rec__tip-line--secondary">
                                You can still use me to start referral outreach, but any new requests started today will be moved to Jobs Queue
                            </p>
                        </div>
                    </aside>
                ) : null}

                {error && !toast.open && !isAllJobsTab ? (
                    <p className="hra-rec__error">
                        {renderTextWithLinks(error, 'hra-rec__error-link')}
                    </p>
                ) : null}

                {isAllJobsTab && isCompactAllJobsLayout ? (
                    <div className="hra-rec__all-jobs-sticky-head">
                        {renderTabsNav()}
                        <div
                            ref={setAllJobsToolbarHost}
                            className="hra-rec__all-jobs-toolbar-host"
                        />
                    </div>
                ) : (
                    renderTabsNav()
                )}

                {renderAutoRunNudge()}

                {!isAllJobsTab ? renderGmailConsent() : null}

                {isAllJobsTab ? (
                    <section className="hra-rec__jobs-card hra-rec__jobs-card--all-jobs" aria-busy={loading}>
                        <HapppyAllJobs
                            embedded
                            toolbarHost={isCompactAllJobsLayout ? allJobsToolbarHost : null}
                        />
                    </section>
                ) : isGmailTab && emailMeta?.has_consent ? (
                    <div className="hra-rec__gmail-layout">
                        <div className="hra-rec__gmail-main">
                            {isGmailScanInProgress ? renderGmailScanProgress() : null}
                            {!isGmailScanInProgress ? (
                                <>
                                    {renderGmailScanFilters()}
                                    <section className="hra-rec__jobs-card" aria-busy={activeLoading}>
                                        {renderJobRows(
                                            emailJobs,
                                            emailJobsLoading || emailJobsPending,
                                            inboxJobsEmptyMessage,
                                            { variant: 'row' }
                                        )}
                                    </section>
                                    <div className="hra-rec__inbox-pagination-wrap">
                                        {renderGmailPagination()}
                                    </div>
                                </>
                            ) : null}
                        </div>
                        {renderGmailScanChartAside()}
                    </div>
                ) : (
                    <section
                        className={isGmailTab ? 'hra-rec__jobs-section' : 'hra-rec__jobs-card'}
                        aria-busy={activeLoading}
                    >
                        {!isGmailTab ? renderSectionHead() : null}
                        {isGmailTab && !emailMeta?.has_consent ? renderJobRows([], emailMetaLoading) : null}
                        {!isGmailTab ? renderJobRows(jobs, loading, '', { variant: 'row' }) : null}
                    </section>
                )}

                {!isGmailTab && !isAllJobsTab ? renderGmailPagination() : null}
            </div>

            <PasteJobLinkDrawer
                open={pasteJobLinkOpen}
                onClose={() => setPasteJobLinkOpen(false)}
            />

            {renderInboxAsideDrawer()}

            <JobDescriptionModal jobModal={jobModal} onClose={closeJobDescription} />

            <RevokeConsentModal
                open={revokeConsentModalOpen}
                gmailEmail={emailMeta?.gmail_email}
                revoking={consentRevoking}
                onClose={closeRevokeConsentModal}
                onConfirm={handleRevokeConsent}
            />

            {previewJob ? (
                <ReferralAgentPreviewModal
                    isOpen={!!previewJob}
                    onClose={closeRunAgentPreview}
                    onConfirm={confirmRunAgentFromPreview}
                    selectedResume="profile"
                    noTailorHTML={true}
                    HR_Number={previewJob?.HR_Number}
                />
            ) : null}

            {toast.open ? (
                <div
                    className={`hra-rec__toast hra-rec__toast--${toast.kind}`}
                    role="status"
                    aria-live="polite"
                >
                    <span className="hra-rec__toast-icon" aria-hidden>
                        {toast.kind === 'success' ? (
                            <CheckCircleIcon />
                        ) : (
                            <CheckCircleIcon stroke="#b42318" />
                        )}
                    </span>
                    <div className="hra-rec__toast-body">
                        <p className="hra-rec__toast-title">
                            {toast.title || (toast.kind === 'success' ? 'Success' : 'Could not add to queue')}
                        </p>
                        <p className="hra-rec__toast-text">
                            {toast.showQueueLink ? (
                                <>
                                    You can check its status in{' '}
                                    <a
                                        href={`${APP_URL}talent/job-agent/my-activity?tab=jobs-in-queue`}
                                        className="hra-rec__toast-link"
                                    >
                                        ‘Jobs in Queue’
                                    </a>
                                </>
                            ) : (
                                renderTextWithLinks(toast.message, 'hra-rec__toast-link')
                            )}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="hra-rec__toast-close"
                        onClick={closeToast}
                        aria-label="Dismiss notification"
                    >
                        <CloseIcon />
                    </button>
                </div>
            ) : null}
        </>
    );
};

export default HapppyRecommendedJobs;
