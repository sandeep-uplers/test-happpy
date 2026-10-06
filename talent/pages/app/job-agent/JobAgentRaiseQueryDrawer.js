'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    JobAgentRaiseQuery,
    TICKET_PAGE_LABEL_REFERRAL_LANDING,
} from './JobAgentHelpGuide';
import './JobAgentDashboard.css';

const MatIcon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
        {name}
    </span>
);

export default function JobAgentRaiseQueryDrawer({ open, onClose }) {
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
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (typeof document === 'undefined' || !open) return null;

    return createPortal(
        <div
            className="jad-raise-query-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Need help — raise a query"
        >
            <button
                type="button"
                className="jad-raise-query-drawer__backdrop"
                aria-label="Close raise a query"
                onClick={onClose}
            />
            <aside className="jad-raise-query-drawer__panel">
                <button
                    type="button"
                    className="jad-raise-query-drawer__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <MatIcon name="close" />
                </button>
                <div className="jad-raise-query-drawer__body">
                    <div className="job-agent-dashboard jad-raise-query-drawer__dashboard">
                        <JobAgentRaiseQuery
                            showGuideCta={false}
                            ticketPageLabel={TICKET_PAGE_LABEL_REFERRAL_LANDING}
                        />
                    </div>
                </div>
            </aside>
        </div>,
        document.body
    );
}
