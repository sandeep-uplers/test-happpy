import React, { useEffect, useRef, useState } from 'react';
import { APP_URL } from './Constant';
import {
    buildDailyLimitSegmentStates,
    displayDailyUsed,
    normalizeDailyReferralRunsForPopover,
} from '../helpers/happpyAgentDailyLimitLogic';
import DailyReferralLimitPopover from './DailyReferralLimitPopover';

const DAILY_LIMIT_INFO_ICON_SRC = `${APP_URL}assets/images/svg/fi_info.svg`;

/**
 * Daily referral-limit widget — Figma 2634:33427 (segmented block bar).
 * Block order: green (completed), red (failed), grey (pending), then empty (+1 empty per failed).
 */
export default function DailyReferralLimitTopnav({
    loading,
    used,
    limit,
    completedCount = 0,
    pendingCount = 0,
    failedCount = null,
    breakdown = null,
}) {
    const anchorRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [popoverOpen, setPopoverOpen] = useState(false);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const openPopover = () => {
        clearCloseTimer();
        setPopoverOpen(true);
    };

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => setPopoverOpen(false), 200);
    };

    useEffect(() => () => clearCloseTimer(), []);
    const safeLimit = Number(limit) || 0;
    const safeUsed = Math.max(0, Number(used) || 0);
    const displayUsed = displayDailyUsed(safeUsed, safeLimit);
    const popoverData = normalizeDailyReferralRunsForPopover(breakdown);

    if (loading) {
        return (
            <div className="job-agent-dashboard__daily-limit job-agent-dashboard__daily-limit--loading" aria-hidden>
                <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--label" />
                <div className="job-agent-dashboard__daily-limit-track-row">
                    <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--segments" />
                    <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--count" />
                </div>
            </div>
        );
    }

    if (safeLimit <= 0) return null;

    const safeFailed = Math.max(
        0,
        Number(failedCount ?? breakdown?.failed?.length) || 0,
    );
    const segmentStates = buildDailyLimitSegmentStates(
        completedCount,
        pendingCount,
        safeLimit,
        safeFailed,
    );

    return (
        <div className="job-agent-dashboard__daily-limit">
            <div
                ref={anchorRef}
                className={`job-agent-dashboard__daily-limit-trigger${
                    popoverOpen ? ' job-agent-dashboard__daily-limit-trigger--open' : ''
                }`}
                role="button"
                tabIndex={0}
                aria-label="View today's referral run breakdown"
                aria-expanded={popoverOpen}
                aria-controls="daily-referral-limit-popover"
                onClick={openPopover}
                onMouseEnter={openPopover}
                onMouseLeave={scheduleClose}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openPopover();
                    }
                }}
            >
                <span className="job-agent-dashboard__daily-limit-label">Daily referral runs</span>
                <div className="job-agent-dashboard__daily-limit-track-row">
                    <div
                        className="job-agent-dashboard__daily-limit-segments"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={safeLimit}
                        aria-valuenow={displayUsed}
                        aria-valuetext={`${displayUsed} of ${safeLimit} daily referral ${
                            safeLimit === 1 ? 'run' : 'runs'
                        } used`}
                    >
                        {segmentStates.map((state, index) => (
                            <span
                                key={index}
                                className={`job-agent-dashboard__daily-limit-segment job-agent-dashboard__daily-limit-segment--${state}`}
                                aria-hidden
                            />
                        ))}
                    </div>
                    <div className="job-agent-dashboard__daily-limit-meta">
                        <span className="job-agent-dashboard__daily-limit-count" aria-live="polite">
                            {displayUsed}/{safeLimit} today
                        </span>
                        <span className="job-agent-dashboard__daily-limit-info-icon-wrap" aria-hidden>
                            <img
                                className="job-agent-dashboard__daily-limit-info-icon"
                                src={DAILY_LIMIT_INFO_ICON_SRC}
                                alt=""
                            />
                        </span>
                    </div>
                </div>
            </div>
            <DailyReferralLimitPopover
                open={popoverOpen}
                onClose={() => setPopoverOpen(false)}
                anchorRef={anchorRef}
                data={popoverData}
                loading={loading}
                onMouseEnter={openPopover}
                onMouseLeave={scheduleClose}
            />
        </div>
    );
}
