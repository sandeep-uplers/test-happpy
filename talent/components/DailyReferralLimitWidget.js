import React from 'react';

/**
 * Daily referral-limit widget — Figma 28447:29414 (default) / 28366:28274 (full).
 * Bar fill is green while `used < limit`, blue when the user has hit the cap.
 * Renders a two-line skeleton while loading and hides itself when `limit <= 0`.
 */
export default function DailyReferralLimitTopnav({ loading, used, limit }) {
    const safeLimit = Number(limit) || 0;
    const safeUsed = Math.max(0, Number(used) || 0);
    const pct = safeLimit > 0 ? Math.min(100, Math.round((safeUsed / safeLimit) * 100)) : 0;
    const isFull = safeLimit > 0 && safeUsed >= safeLimit;

    if (loading) {
        return (
            <div className="job-agent-dashboard__daily-limit job-agent-dashboard__daily-limit--loading" aria-hidden>
                <div className="job-agent-dashboard__daily-limit-head">
                    <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--label" />
                    <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--count" />
                </div>
                <span className="job-agent-dashboard__daily-limit-skel job-agent-dashboard__daily-limit-skel--bar" />
            </div>
        );
    }

    if (safeLimit <= 0) return null;

    return (
        <div
            className="job-agent-dashboard__daily-limit"
            role="group"
            aria-label="Daily referral limit"
        >
            <div className="job-agent-dashboard__daily-limit-head">
                <span className="job-agent-dashboard__daily-limit-label">
                    Daily referral limit:{' '}
                    <strong className="job-agent-dashboard__daily-limit-label-strong">
                        {safeLimit} jobs
                    </strong>
                </span>
                <span className="job-agent-dashboard__daily-limit-count" aria-live="polite">
                    {Math.min(safeUsed, safeLimit)}/{safeLimit} today
                </span>
            </div>
            <div
                className={`job-agent-dashboard__daily-limit-bar${
                    isFull ? ' job-agent-dashboard__daily-limit-bar--full' : ''
                }`}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={safeLimit}
                aria-valuenow={Math.min(safeUsed, safeLimit)}
                aria-valuetext={`${safeUsed} of ${safeLimit} daily referral ${
                    safeLimit === 1 ? 'job' : 'jobs'
                } used`}
            >
                <div
                    className="job-agent-dashboard__daily-limit-bar-fill"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
