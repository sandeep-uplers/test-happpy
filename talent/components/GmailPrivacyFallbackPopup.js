'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IMAGE_URL } from './Constant';
import './GmailPrivacyFallbackPopup.css';

const GMAIL_SIGNUP_URL = 'https://accounts.google.com/signup';
const CLOSE_ICON_SRC = `${IMAGE_URL}outreach/gmail-privacy-close.svg`;

/**
 * Privacy tip shown when Gmail OAuth fails / is cancelled.
 * Shared by agent onboarding, LinkedIn AccountConnection, and Happpy Configure.
 */
export default function GmailPrivacyFallbackPopup({ open, onClose }) {
    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="gmail-privacy-fallback-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gmail-privacy-fallback-title"
        >
            <div className="gmail-privacy-fallback">
                <img src={IMAGE_URL + 'outreach/mascot-gmail-concern.svg'} className='mascot-gmail' />
                <button
                    type="button"
                    className="gmail-privacy-fallback__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <img src={CLOSE_ICON_SRC} alt="" width={40} height={40} />
                </button>

                <div className="gmail-privacy-fallback__header">
                    <h3 className="gmail-privacy-fallback__title" id="gmail-privacy-fallback-title">
                        Hey! Concerned about your personal Gmail?
                    </h3>
                    <p className="gmail-privacy-fallback__subtitle">
                        Smart move - many job seekers create a dedicated Gmail just for their job search
                    </p>
                </div>

                <div className="gmail-privacy-fallback__body">
                    <div className="gmail-privacy-fallback__tip">
                        <p className="gmail-privacy-fallback__tip-line">
                            <span className="gmail-privacy-fallback__tip-emoji" aria-hidden="true">💌 </span>
                            <strong>Tip:</strong>
                            {' '}
                            Create a free Gmail like:
                            {' '}
                            <code className="gmail-privacy-fallback__tip-email">yourname.jobs@gmail.com</code>
                        </p>
                        <p className="gmail-privacy-fallback__tip-line">
                            - takes 2 minutes and keeps everything organised.
                        </p>
                    </div>

                    <a
                        className="gmail-privacy-fallback__cta"
                        href={GMAIL_SIGNUP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Create a new gmail account
                    </a>
                </div>
            </div>
        </div>,
        document.body
    );
}
