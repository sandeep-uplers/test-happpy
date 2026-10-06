'use client';

import React, { useEffect, useState } from 'react';
import './UnsavedChangesBar.css';

/** Orange dot + label for mobile fixed bottom bar (and reuse in floating pill). */
export function UnsavedChangesIndicator({ saving = false, savedFlash = false }) {
    if (savedFlash) {
        return (
            <span className="unsaved-changes-indicator unsaved-changes-indicator--saved" role="status" aria-live="polite">
                Saved ✓
            </span>
        );
    }

    return (
        <span className="unsaved-changes-indicator" role="status" aria-live="polite">
            <span className="unsaved-changes-indicator__dot" aria-hidden="true" />
            {saving ? 'Saving…' : 'Unsaved changes'}
        </span>
    );
}

/**
 * Floating unsaved-changes pill for AgentJ update profile (desktop main column).
 */
export default function UnsavedChangesBar({
    dirty = false,
    saving = false,
    savedFlash = false,
    onSave,
    onDiscard,
    /** 'agent' offsets for job-agent sidebar; 'uts' is full-width. */
    layout = 'agent',
}) {
    const shouldShow = dirty || saving || savedFlash;
    const [mounted, setMounted] = useState(shouldShow);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (shouldShow) {
            setMounted(true);
            const frame = requestAnimationFrame(() => setVisible(true));
            return () => cancelAnimationFrame(frame);
        }
        setVisible(false);
        const timeout = window.setTimeout(() => setMounted(false), 300);
        return () => window.clearTimeout(timeout);
    }, [shouldShow]);

    if (!mounted) return null;

    return (
        <div
            className={`unsaved-changes-bar${layout === 'uts' ? ' unsaved-changes-bar--uts' : ''}${visible ? ' unsaved-changes-bar--visible' : ''}`}
            aria-hidden={!shouldShow}
        >
            <div className="unsaved-changes-bar__pill" role="status" aria-live="polite">
                {savedFlash ? (
                    <span className="unsaved-changes-bar__saved">Saved ✓</span>
                ) : (
                    <>
                        <UnsavedChangesIndicator saving={saving} savedFlash={false} />
                        <div className="unsaved-changes-bar__actions">
                            <button
                                type="button"
                                className="unsaved-changes-bar__discard"
                                onClick={onDiscard}
                                disabled={saving}
                            >
                                Discard
                            </button>
                            <button
                                type="button"
                                className="unsaved-changes-bar__save"
                                onClick={onSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving…' : 'Save Preferences'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
