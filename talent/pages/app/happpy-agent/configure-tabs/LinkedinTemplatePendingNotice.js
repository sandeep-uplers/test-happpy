import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const InfoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#086d7e" strokeWidth="1.2" />
        <path d="M7 6.2V10" stroke="#086d7e" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="4.3" r="0.7" fill="#086d7e" />
    </svg>
);

/**
 * Shared copy for LinkedIn-connected users who still need a LinkedIn message template.
 * Renders as a top-of-tab banner or a small post-connect popup.
 */
const LinkedinTemplatePendingNotice = ({
    variant = 'banner',
    open = false,
    onConfigure,
    onDismiss,
    onFocusLinkedinTemplate,
}) => {
    useEffect(() => {
        if (variant !== 'popup' || !open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onDismiss?.();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [variant, open, onDismiss]);

    const body = (
        <>
            <p className="hc-li-template-notice__title">LinkedIn connected — message template still needed</p>
            <p className="hc-li-template-notice__body">
                Your LinkedIn account is connected, but you haven&apos;t set up your LinkedIn outreach
                message yet. Add a template so the agent can send LinkedIn messages on your behalf.
            </p>
        </>
    );

    if (variant === 'popup') {
        if (!open || typeof document === 'undefined') return null;

        return createPortal(
            <div
                className="hc-li-template-popup-overlay"
                role="presentation"
                onClick={(e) => {
                    if (e.target === e.currentTarget) onDismiss?.();
                }}
            >
                <div
                    className="hc-li-template-popup"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="hc-li-template-popup-title"
                >
                    <div className="hc-li-template-notice hc-li-template-notice--popup">
                        <InfoIcon />
                        <div className="hc-li-template-notice__content">
                            <p id="hc-li-template-popup-title" className="hc-li-template-notice__title">
                                LinkedIn connected — message template still needed
                            </p>
                            <p className="hc-li-template-notice__body">
                                Your LinkedIn account is connected, but you haven&apos;t set up your LinkedIn
                                outreach message yet. Add a template so the agent can send LinkedIn messages
                                on your behalf.
                            </p>
                        </div>
                    </div>
                    <div className="hc-li-template-popup__actions">
                        <button
                            type="button"
                            className="hc-li-template-popup__btn hc-li-template-popup__btn--secondary"
                            onClick={onDismiss}
                        >
                            Later
                        </button>
                        <button
                            type="button"
                            className="hc-li-template-popup__btn hc-li-template-popup__btn--primary"
                            onClick={onConfigure}
                        >
                            Set up message template
                        </button>
                    </div>
                </div>
            </div>,
            document.body,
        );
    }

    return (
        <div className="hc-li-template-notice hc-li-template-notice--banner" role="status">
            <InfoIcon />
            <div className="hc-li-template-notice__content">
                {body}
                {onFocusLinkedinTemplate ? (
                    <button
                        type="button"
                        className="hc-li-template-notice__link"
                        onClick={onFocusLinkedinTemplate}
                    >
                        Set up LinkedIn template
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default LinkedinTemplatePendingNotice;
