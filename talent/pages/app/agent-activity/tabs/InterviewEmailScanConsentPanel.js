'use client';

import React, { useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { useInterviewEmailScanConsent } from '../useInterviewEmailScanConsent';

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
        {name}
    </span>
);

const Skel = ({ className = '', ...rest }) => (
    <span className={`aa-interview__skel ${className}`.trim()} aria-hidden {...rest} />
);

const InterviewEmailScanConsentPanel = () => {
    const [consentChecked, setConsentChecked] = useState(false);
    const [revokeModalOpen, setRevokeModalOpen] = useState(false);
    const {
        consentMeta,
        loading,
        consentSaving,
        consentRevoking,
        consentError,
        grantInterviewScanConsent,
        revokeInterviewScanConsent,
        clearConsentError,
    } = useInterviewEmailScanConsent();

    const handleGrantConsent = async () => {
        if (!consentChecked || consentSaving) return;
        clearConsentError();
        const ok = await grantInterviewScanConsent();
        if (ok) {
            setConsentChecked(false);
        }
    };

    const handleRevokeConsent = async () => {
        if (consentRevoking) return;
        clearConsentError();
        const ok = await revokeInterviewScanConsent();
        if (ok) {
            setRevokeModalOpen(false);
            setConsentChecked(false);
        }
    };

    if (loading) {
        return (
            <div className="aa-interview__consent aa-interview__consent--skeleton" aria-hidden>
                <Skel className="aa-interview__skel--consent-title" />
                <Skel className="aa-interview__skel--consent-copy" />
            </div>
        );
    }

    if (consentMeta?.has_consent) {
        return (
            <>
                <div
                    className="aa-interview__consent aa-interview__consent--active"
                    aria-label="Interview email scan consent status"
                >
                    <div className="aa-interview__consent-active-copy">
                        <p className="aa-interview__consent-active-title">
                            <MatIcon name="mark_email_read" aria-hidden />
                            Interview email scan is enabled
                        </p>
                        <p className="aa-interview__consent-active-detail">
                            Happpy Agent scans interview-related emails
                            {consentMeta?.gmail_email ? (
                                <span className="aa-interview__consent-email"> ({consentMeta.gmail_email})</span>
                            ) : null}
                            {' '}to learn which referral companies work for you and who reached out.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="aa-interview__consent-revoke-btn"
                        onClick={() => setRevokeModalOpen(true)}
                        disabled={consentRevoking}
                    >
                        <MatIcon name="link_off" aria-hidden />
                        {consentRevoking ? 'Removing…' : 'Remove consent'}
                    </button>
                </div>
                {consentError ? (
                    <p className="aa-interview__error aa-interview__error--consent" role="alert">
                        {consentError}
                    </p>
                ) : null}
                {revokeModalOpen ? (
                    <div
                        className="aa-interview__modal-backdrop"
                        role="presentation"
                        onMouseDown={() => {
                            if (!consentRevoking) setRevokeModalOpen(false);
                        }}
                    >
                        <div
                            className="aa-interview__modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="aa-interview-revoke-title"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <h3 id="aa-interview-revoke-title" className="aa-interview__modal-title">
                                Remove interview email scan consent?
                            </h3>
                            <p className="aa-interview__modal-copy">
                                Happpy Agent will stop scanning interview emails
                                {consentMeta?.gmail_email ? (
                                    <span className="aa-interview__consent-email"> ({consentMeta.gmail_email})</span>
                                ) : null}
                                . You can enable it again at any time.
                            </p>
                            <div className="aa-interview__modal-actions">
                                <button
                                    type="button"
                                    className="aa-interview__modal-cancel"
                                    onClick={() => setRevokeModalOpen(false)}
                                    disabled={consentRevoking}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="aa-interview__modal-confirm"
                                    onClick={handleRevokeConsent}
                                    disabled={consentRevoking}
                                >
                                    {consentRevoking ? 'Removing…' : 'Remove consent'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </>
        );
    }

    if (!consentMeta?.gmail_connected) {
        return (
            <>
                <div className="aa-interview__consent">
                    <div className="aa-interview__consent-top">
                        <span className="aa-interview__consent-icon-wrap" aria-hidden>
                            <MatIcon name="mail" className="aa-interview__consent-icon" />
                        </span>
                        <div>
                            <h2 className="aa-interview__consent-title">Connect Gmail to scan interview emails</h2>
                            <p className="aa-interview__consent-copy">
                                Happpy Agent needs your connected Gmail account to detect interview invites from
                                companies where your referral agent ran. This helps us learn which companies work
                                for you and which contacts led to interviews.
                            </p>
                        </div>
                    </div>
                    <div className="aa-interview__consent-footer">
                        <Link
                            className="aa-interview__consent-enable-btn"
                            to="/talent/job-agent/configure?tab=connected-accounts"
                        >
                            <MatIcon name="link" aria-hidden />
                            Connect Gmail
                        </Link>
                    </div>
                </div>
                {consentError ? (
                    <p className="aa-interview__error aa-interview__error--consent" role="alert">
                        {consentError}
                    </p>
                ) : null}
            </>
        );
    }

    return (
        <>
            <div className="aa-interview__consent">
                <div className="aa-interview__consent-top">
                    <span className="aa-interview__consent-icon-wrap" aria-hidden>
                        <MatIcon name="mail" className="aa-interview__consent-icon" />
                    </span>
                    <div>
                        <h2 className="aa-interview__consent-title">Allow interview email scan</h2>
                        <p className="aa-interview__consent-copy">
                            Happpy Agent will scan interview-related emails in your connected Gmail account
                            {consentMeta?.gmail_email ? (
                                <span className="aa-interview__consent-email"> ({consentMeta.gmail_email})</span>
                            ) : null}
                            . This helps the agent learn which referral companies lead to interviews and identify
                            who reached out to you. Only interview-related emails are read — not your other mail.
                        </p>
                    </div>
                </div>
                <div className="aa-interview__consent-footer">
                    <label className="aa-interview__consent-check-wrap" htmlFor="aa-interview-consent">
                        <span className="aa-interview__consent-checkbox-box">
                            <input
                                id="aa-interview-consent"
                                className="aa-interview__consent-checkbox"
                                type="checkbox"
                                checked={consentChecked}
                                onChange={(e) => setConsentChecked(e.target.checked)}
                            />
                            {consentChecked ? (
                                <MatIcon name="check" className="aa-interview__consent-checkbox-icon" />
                            ) : null}
                        </span>
                        <span className="aa-interview__consent-check">
                            I understand and allow Happpy Agent to scan my Gmail for interview emails from
                            companies where my referral agent ran.
                        </span>
                    </label>
                    <button
                        type="button"
                        className="aa-interview__consent-enable-btn"
                        onClick={handleGrantConsent}
                        disabled={!consentChecked || consentSaving}
                    >
                        <MatIcon name="verified_user" aria-hidden />
                        {consentSaving ? 'Saving…' : 'Enable interview scan'}
                    </button>
                </div>
            </div>
            {consentError ? (
                <p className="aa-interview__error aa-interview__error--consent" role="alert">
                    {consentError}
                </p>
            ) : null}
        </>
    );
};

export default InterviewEmailScanConsentPanel;
