import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const AGENT_ACTIVITY_ALL_TAB = '/talent/job-agent/my-activity?tab=activity';
const POPOVER_WIDTH = 400;
const DESKTOP_VIEWPORT_MARGIN = 10;
const MOBILE_VIEWPORT_MARGIN = 16;
const MOBILE_MAX_WIDTH = 767;
const HOVER_BRIDGE_GAP = 8;

function getPopoverLayout(windowWidth) {
    const isMobile = windowWidth <= MOBILE_MAX_WIDTH;
    const margin = isMobile ? MOBILE_VIEWPORT_MARGIN : DESKTOP_VIEWPORT_MARGIN;
    const width = isMobile
        ? windowWidth - margin * 2
        : Math.min(POPOVER_WIDTH, windowWidth - margin * 2);

    return { isMobile, margin, width };
}

function MatIcon({ name, className = '' }) {
    return (
        <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
            {name}
        </span>
    );
}

function buildRecommendedJobPath(hrNumber) {
    return `/talent/job-agent/recommended-jobs?tab=all-jobs&activeJob=${encodeURIComponent(hrNumber)}`;
}

function getEntryNavigationPath(entry, section) {
    if (section === 'failed') {
        if (entry.hrNumber != null && String(entry.hrNumber).trim() !== '') {
            return buildRecommendedJobPath(entry.hrNumber);
        }
        return AGENT_ACTIVITY_ALL_TAB;
    }
    return AGENT_ACTIVITY_ALL_TAB;
}

function getEntryActionLabel(section) {
    return section === 'failed' ? 'View Job →' : 'View Details →';
}

function SectionHeader({ tone, icon, label, collapsible = false, collapsed = false, onToggle }) {
    return (
        <div className={`job-agent-dashboard__daily-limit-popover-section-head job-agent-dashboard__daily-limit-popover-section-head--${tone}`}>
            <div className="job-agent-dashboard__daily-limit-popover-section-head-main">
                <MatIcon name={icon} className="job-agent-dashboard__daily-limit-popover-section-icon" />
                <span className="job-agent-dashboard__daily-limit-popover-section-title">{label}</span>
                <span className="job-agent-dashboard__daily-limit-popover-section-rule" aria-hidden />
            </div>
            {collapsible ? (
                <button
                    type="button"
                    className="job-agent-dashboard__daily-limit-popover-section-toggle"
                    aria-expanded={!collapsed}
                    aria-label={collapsed ? 'Expand completed runs' : 'Collapse completed runs'}
                    onClick={onToggle}
                >
                    <MatIcon
                        name="expand_more"
                        className={`job-agent-dashboard__daily-limit-popover-section-chevron${
                            collapsed ? '' : ' job-agent-dashboard__daily-limit-popover-section-chevron--open'
                        }`}
                    />
                </button>
            ) : null}
        </div>
    );
}

function JobRow({ entry, section, tone, onNavigate }) {
    const actionLabel = getEntryActionLabel(section);

    return (
        <div className="job-agent-dashboard__daily-limit-popover-row">
            <button
                type="button"
                className="job-agent-dashboard__daily-limit-popover-row-main"
                onClick={() => onNavigate(getEntryNavigationPath(entry, section))}
            >
                <span className="job-agent-dashboard__daily-limit-popover-row-info">
                    <span
                        className={`job-agent-dashboard__daily-limit-popover-row-dot job-agent-dashboard__daily-limit-popover-row-dot--${tone}`}
                        aria-hidden
                    />
                    <span className="job-agent-dashboard__daily-limit-popover-row-text">
                        <span className="job-agent-dashboard__daily-limit-popover-row-role">{entry.role}</span>
                        <span className="job-agent-dashboard__daily-limit-popover-row-sep" aria-hidden>
                            •
                        </span>
                        <span className="job-agent-dashboard__daily-limit-popover-row-company">{entry.company}</span>
                    </span>
                </span>
                <span className="job-agent-dashboard__daily-limit-popover-row-action">{actionLabel}</span>
            </button>
            {section === 'failed' && entry.failureReason ? (
                <div className="job-agent-dashboard__daily-limit-popover-failure-details">
                    <p className="job-agent-dashboard__daily-limit-popover-failure-reason">{entry.failureReason}</p>
                    <p className="job-agent-dashboard__daily-limit-popover-failure-note">
                        Failed runs don&apos;t count toward your daily limit
                    </p>
                </div>
            ) : null}
        </div>
    );
}

export default function DailyReferralLimitPopover({
    open,
    onClose,
    anchorRef,
    data = null,
    loading = false,
    onMouseEnter,
    onMouseLeave,
}) {
    const breakdown = data || { completed: [], failed: [], pending: [] };
    const wrapRef = useRef(null);
    const popRef = useRef(null);
    const [pos, setPos] = useState({
        top: 0,
        left: 0,
        width: POPOVER_WIDTH,
        placement: 'bottom',
    });
    const [completedCollapsed, setCompletedCollapsed] = useState(false);

    const placePopover = useCallback(() => {
        const anchor = anchorRef?.current;
        if (!anchor) return;

        const pop = popRef.current;
        const { isMobile, margin, width } = getPopoverLayout(window.innerWidth);
        const rect = anchor.getBoundingClientRect();

        let left = isMobile
            ? rect.left + rect.width / 2 - width / 2
            : rect.left;
        left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

        let placement = 'bottom';
        let top = rect.bottom;

        if (pop) {
            const popHeight = pop.getBoundingClientRect().height;
            const fitsBelow = top + HOVER_BRIDGE_GAP + popHeight <= window.innerHeight - margin;
            if (!fitsBelow) {
                const topPlacement = rect.top - HOVER_BRIDGE_GAP - popHeight;
                if (topPlacement >= margin) {
                    placement = 'top';
                    top = topPlacement;
                } else {
                    top = Math.max(margin, top);
                }
            }
        }

        setPos({ top, left, width, placement });
    }, [anchorRef]);

    useLayoutEffect(() => {
        if (!open) return undefined;
        placePopover();
        const id = requestAnimationFrame(() => placePopover());
        return () => cancelAnimationFrame(id);
    }, [open, placePopover, completedCollapsed, data]);

    useEffect(() => {
        if (!open) return undefined;
        const onMove = () => placePopover();
        window.addEventListener('scroll', onMove, true);
        window.addEventListener('resize', onMove);
        return () => {
            window.removeEventListener('scroll', onMove, true);
            window.removeEventListener('resize', onMove);
        };
    }, [open, placePopover]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (event) => {
            const target = event.target;
            if (anchorRef?.current?.contains(target)) return;
            if (wrapRef.current?.contains(target)) return;
            onClose();
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open, onClose, anchorRef]);

    const handleNavigate = (path) => {
        onClose();
        window.open(path, '_blank', 'noopener,noreferrer');
    };

    if (!open || typeof document === 'undefined') return null;

    const completedCount = breakdown.completed?.length ?? 0;
    const failedCount = breakdown.failed?.length ?? 0;
    const pendingCount = breakdown.pending?.length ?? 0;
    const isEmpty = completedCount === 0 && failedCount === 0 && pendingCount === 0;

    return createPortal(
        <div
            ref={wrapRef}
            className={`job-agent-dashboard__daily-limit-popover-wrap job-agent-dashboard__daily-limit-popover-wrap--${pos.placement}`}
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                ref={popRef}
                id="daily-referral-limit-popover"
                role="dialog"
                aria-label="Today's referral runs"
                className="job-agent-dashboard__daily-limit-popover"
            >
            {loading ? (
                <p className="job-agent-dashboard__daily-limit-popover-empty">Loading today&apos;s runs…</p>
            ) : isEmpty ? (
                <p className="job-agent-dashboard__daily-limit-popover-empty">No referral runs today yet.</p>
            ) : null}
            {!loading && completedCount > 0 ? (
                <section className="job-agent-dashboard__daily-limit-popover-section">
                    <SectionHeader
                        tone="completed"
                        icon="check_circle"
                        label={`COMPLETED (${completedCount})`}
                        collapsible
                        collapsed={completedCollapsed}
                        onToggle={() => setCompletedCollapsed((value) => !value)}
                    />
                    {!completedCollapsed ? (
                        <div className="job-agent-dashboard__daily-limit-popover-list">
                            {breakdown.completed.map((entry) => (
                                <JobRow
                                    key={entry.id}
                                    entry={entry}
                                    section="completed"
                                    tone="completed"
                                    onNavigate={handleNavigate}
                                />
                            ))}
                        </div>
                    ) : null}
                </section>
            ) : null}

            {!loading && failedCount > 0 ? (
                <section className="job-agent-dashboard__daily-limit-popover-section">
                    <SectionHeader tone="failed" icon="cancel" label={`FAILED (${failedCount})`} />
                    <div className="job-agent-dashboard__daily-limit-popover-list">
                        {breakdown.failed.map((entry) => (
                            <JobRow
                                key={entry.id}
                                entry={entry}
                                section="failed"
                                tone="failed"
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {!loading && pendingCount > 0 ? (
                <section className="job-agent-dashboard__daily-limit-popover-section">
                    <SectionHeader tone="pending" icon="schedule" label={`Pending (${pendingCount})`} />
                    <div className="job-agent-dashboard__daily-limit-popover-list">
                        {breakdown.pending.map((entry) => (
                            <JobRow
                                key={entry.id}
                                entry={entry}
                                section="pending"
                                tone="pending"
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        className="job-agent-dashboard__daily-limit-popover-view-all"
                        onClick={() => handleNavigate(AGENT_ACTIVITY_ALL_TAB)}
                    >
                        View All Activity →
                    </button>
                </section>
            ) : null}
            </div>
        </div>,
        document.body
    );
}
