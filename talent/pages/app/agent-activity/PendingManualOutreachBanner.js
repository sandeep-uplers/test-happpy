'use client';

import React from 'react';

const PENDING_BANNER_ICON_SRC = '/images/talent/outreach/mascot-exclaim.svg';

function PendingBannerArrowIcon() {
    return (
        <svg
            className="aa-act__pending-banner-btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
        </svg>
    );
}

/**
 * Top-of-page pending manual outreach banner (Figma Happpy-Agent Referral 3171:29371).
 * Shown above the My Activity title when the talent has HRs awaiting review.
 */
export default function PendingManualOutreachBanner({ loading, count, onReviewNow }) {
    if (!loading && (!count || count <= 0)) {
        return null;
    }

    if (loading) {
        return (
            <aside
                className="aa-act__pending-banner aa-act__pending-banner--skeleton"
                aria-hidden
            >
                <div className="aa-act__pending-banner-main">
                    <span className="aa-skel aa-skel--pending-banner-icon" />
                    <span className="aa-skel aa-skel--pending-banner-msg" />
                </div>
                <span className="aa-skel aa-skel--pending-banner-btn" />
            </aside>
        );
    }

    const jobLabel = count === 1 ? 'job' : 'jobs';

    return (
        <aside className="aa-act__pending-banner" aria-label="Pending manual outreach review">
            <div className="aa-act__pending-banner-main">
                <img
                    src={PENDING_BANNER_ICON_SRC}
                    alt=""
                    className="aa-act__pending-banner-icon"
                    width={46}
                    height={36}
                    aria-hidden
                />
                <p className="aa-act__pending-banner-msg">
                    Pending action for {count} {jobLabel}. Agent successfully found referral contacts!
                </p>
            </div>
            <button type="button" className="aa-act__pending-banner-cta" onClick={onReviewNow}>
                Review now
                <PendingBannerArrowIcon />
            </button>
        </aside>
    );
}
