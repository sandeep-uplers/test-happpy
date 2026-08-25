'use client';

import React from 'react';
import { IMAGE_URL } from '../../../components/Constant';

const TRIAL_BENEFITS = [
    '2× your interviews - at no extra effort',
    'The agent finds referrals and applies for you',
    'No credit card needed',
    "You'll get the full 10-day trial, regardless of when you receive your first response.",
];

const getReferrerFirstName = (referrerName) => {
    const trimmed = String(referrerName || '').trim();
    if (!trimmed) return 'Your friend';
    return trimmed.split(/\s+/)[0];
};

const getReferrerInitial = (referrerName) => {
    const firstName = getReferrerFirstName(referrerName);
    return firstName.charAt(0).toUpperCase() || 'F';
};

export default function ReferralTrialUnlockedScreen({
    referrerName = '',
    trialDays = 10,
    onProceed,
    onClose,
}) {
    const displayName = getReferrerFirstName(referrerName);
    const referrerInitial = getReferrerInitial(referrerName);

    return (
        <div className="jad-referral-trial-unlocked" role="dialog" aria-labelledby="jad-referral-trial-unlocked-title">
            <button
                type="button"
                className="jad-referral-trial-unlocked__close"
                onClick={onClose}
                aria-label="Close"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className="jad-referral-trial-unlocked__content">
                <div className="jad-referral-trial-unlocked__hero">
                    <div className="jad-referral-trial-unlocked__invited-pill">
                        <span className="jad-referral-trial-unlocked__invited-avatar" aria-hidden>
                            {referrerInitial}
                        </span>
                        <span>{displayName} invited you</span>
                    </div>
                    <img
                        src={IMAGE_URL + 'outreach/mascot-celebrate.svg'}
                        alt=""
                        className="jad-referral-trial-unlocked__mascot"
                        aria-hidden
                    />
                </div>

                <div className="jad-referral-trial-unlocked__copy">
                    <h2 id="jad-referral-trial-unlocked-title" className="jad-referral-trial-unlocked__title">
                        You&apos;ve unlocked your {trialDays} day free trial!
                    </h2>
                    <p className="jad-referral-trial-unlocked__subtitle">
                        That&apos;s 3 days more than usual — because you used {displayName}&apos;s referral link
                    </p>
                </div>

                <ul className="jad-referral-trial-unlocked__benefits">
                    {TRIAL_BENEFITS.map((benefit) => (
                        <li key={benefit} className="jad-referral-trial-unlocked__benefit">
                            <span className="jad-referral-trial-unlocked__benefit-icon" aria-hidden>✓</span>
                            <span>{benefit}</span>
                        </li>
                    ))}
                </ul>

                <div className="jad-referral-trial-unlocked__trial-box">
                    <p className="jad-referral-trial-unlocked__trial-days">{trialDays} days left</p>
                    <p className="jad-referral-trial-unlocked__trial-label">on your extended trial</p>
                </div>

                <button type="button" className="jad-referral-trial-unlocked__cta" onClick={onProceed}>
                    <span>DONE</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
