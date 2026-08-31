'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    fetchHapppyAgentPlan,
    storeRecommendedJobs,
} from '../../../../store/actions/UserActions';
import { trackHappyAgentMixpanel } from '../../../../store/actions/happyAgentTracking';
import UpgradePlanDrawer from './UpgradePlanDrawer';

/**
 * Outreach Mode tab — Figma node 28457:7066
 *
 * UI is visually identical to {@link Step4ModeSelection} from
 * `pages/app/agent-onboarding/` but uses its own `.hc-om-*` classes (defined
 * in `HapppyConfigure.css`) so this tab stays self-contained and does not
 * depend on `AgentOnboarding.css`.
 *
 * Behavioral differences from the onboarding step:
 *   - No scroll shell, no Back / Complete footer.
 *   - Clicking a card saves immediately via `storeRecommendedJobs` with a
 *     success/failure toast (Figma comp is named `ModeChangeWithToastMsg`).
 *   - After save we silently refresh `happpyAgent` so other surfaces
 *     (HapppyDashboard / topnav) reflect the new mode without a hard reload.
 */

const MODE_AUTO = 'auto';
const MODE_MANUAL = 'manual';

const AUTO_FEATURES = [
    'You choose the jobs/roles',
    'Agent finds relevant Linkedin/email contacts',
    'Sends referral messages automatically',
    'Follow-ups happen automatically',
];

const MANUAL_FEATURES = [
    'You choose the jobs/roles',
    'Review suggested referral contacts',
    'Edit & approve messages before sending',
    'Nothing is sent without your approval',
    'Full control over who gets contacted & what is sent',
];

/* -------------------------------------------------------------------------- */
/* Inline icons                                                                */
/* -------------------------------------------------------------------------- */

function CheckIcon({ className }) {
    return (
        <svg
            className={className}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function BoltIcon({ size = 14 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M3.77952 6.60925L5.82095 3.84722C7.14052 2.06186 7.80031 1.16917 8.41588 1.35782C9.03146 1.54646 9.03146 2.64134 9.03146 4.83109V5.03755C9.03146 5.82735 9.03146 6.22225 9.28382 6.46995L9.29717 6.48278C9.55498 6.72525 9.96598 6.72525 10.788 6.72525C12.2672 6.72525 13.0069 6.72525 13.2568 7.17388C13.261 7.18131 13.265 7.18879 13.2689 7.19634C13.5049 7.65191 13.0766 8.23132 12.2201 9.39013L10.1787 12.1521C8.85911 13.9375 8.19931 14.8302 7.58373 14.6415C6.96816 14.4529 6.96817 13.358 6.9682 11.1682L6.96821 10.9618C6.96822 10.172 6.96822 9.77713 6.71587 9.52942L6.70251 9.51659C6.44471 9.27412 6.03369 9.27412 5.21167 9.27412C3.73243 9.27412 2.9928 9.27412 2.74284 8.82549C2.7387 8.81807 2.73467 8.81058 2.73077 8.80304C2.4948 8.34746 2.92304 7.76806 3.77952 6.60925Z"
                fill="#231F20"
            />
        </svg>
    );
}

const SelectedCheck = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#2c7a4b"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* -------------------------------------------------------------------------- */
/* OutreachModeTab                                                             */
/* -------------------------------------------------------------------------- */

const OutreachModeTab = () => {
    const dispatch = useDispatch();

    const happpyAgent = useSelector((state) => state.happpyAgent);
    const raw = happpyAgent?.raw || null;
    const plan = raw?.plan ?? happpyAgent?.plan ?? null;
    const isPaidPlan = Number(plan) === 2;
    const savedMode = raw?.outreach_mode === MODE_MANUAL ? MODE_MANUAL : MODE_AUTO;

    /** Free-trial users are pinned to Auto — Manual is locked for them, so
     *  even a stale `manual` value from a previous paid plan still renders
     *  Auto as the active pick (mirrors Step4ModeSelection lines 96–98). */
    const effectiveMode = isPaidPlan ? savedMode : MODE_AUTO;

    const [selectedMode, setSelectedMode] = useState(effectiveMode);
    const [isSaving, setIsSaving] = useState(false);
    const [upgradeDrawerOpen, setUpgradeDrawerOpen] = useState(false);

    useEffect(() => {
        setSelectedMode(effectiveMode);
    }, [effectiveMode]);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const handleSelectMode = useCallback(
        async (mode) => {
            if (isSaving) return;
            if (mode === MODE_MANUAL && !isPaidPlan) return;
            if (mode === selectedMode) return;

            const previous = selectedMode;
            setSelectedMode(mode);
            setIsSaving(true);

            trackHappyAgentMixpanel('agent_configure_mode_changed', { mode }).catch(() => {});

            try {
                await dispatch(
                    storeRecommendedJobs({
                        jobs: [],
                        auto_run: mode === MODE_AUTO,
                        outreach_mode: mode,
                    }),
                );
                toast.success(mode === MODE_AUTO ? 'Auto Mode saved' : 'Manual Mode saved');
                /** Silent + force refresh so HapppyDashboard / topnav / other
                 *  surfaces reflect the new mode without a hard reload. */
                dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
            } catch (error) {
                if (mountedRef.current) setSelectedMode(previous);
                toast.error(
                    error?.response?.data?.message ||
                        'Could not save your preferences. Please try again.',
                );
            } finally {
                if (mountedRef.current) setIsSaving(false);
            }
        },
        [dispatch, isPaidPlan, isSaving, selectedMode],
    );

    const handleUpgradeClick = useCallback(() => {
        trackHappyAgentMixpanel('agent_configure_mode_upgrade_clicked').catch(() => {});
        setUpgradeDrawerOpen(true);
    }, []);

    const autoSelected = selectedMode === MODE_AUTO;
    const manualSelected = selectedMode === MODE_MANUAL;

    return (
        <>
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">Choose your outreach mode</p>

            <div className="hc-om-grid">
                {/* ---------------- Auto Mode column ---------------- */}
                <div className="hc-om-col">
                    <button
                        type="button"
                        className={`hc-om-card hc-om-card--auto${autoSelected ? ' hc-om-card--selected' : ''}`}
                        onClick={() => handleSelectMode(MODE_AUTO)}
                        aria-pressed={autoSelected}
                        disabled={isSaving && !autoSelected}
                    >
                        <span className="hc-om-card__badge hc-om-card__badge--recommended">
                            Recommended
                        </span>
                        <span
                            className={`hc-om-card__check${autoSelected ? ' hc-om-card__check--on' : ''}`}
                            aria-hidden="true"
                        >
                            {autoSelected && <SelectedCheck />}
                        </span>
                        <div className="hc-om-card__head">
                            <span className="hc-om-card__icon hc-om-card__icon--auto">⚡️</span>
                            <div className="hc-om-card__head-text">
                                <h3 className="hc-om-card__title">Auto Mode</h3>
                                <p className="hc-om-card__subtitle">
                                    Let the agent handle outreach
                                </p>
                            </div>
                        </div>
                        <ul className="hc-om-card__features">
                            {AUTO_FEATURES.map((feature) => (
                                <li key={feature} className="hc-om-card__feature">
                                    <CheckIcon className="hc-om-card__feature-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="hc-om-card__nudge">
                            <div className="hc-om-card__ideal">
                                Ideal for: Busy professionals wanting high efficiency
                            </div>
                        </div>
                    </button>
                </div>

                {/* ---------------- Manual Mode column (with upgrade tooltip) ---------------- */}
                <div className="hc-om-col">
                    <button
                        type="button"
                        className={`hc-om-card hc-om-card--manual${manualSelected ? ' hc-om-card--selected' : ''}${!isPaidPlan ? ' hc-om-card--locked' : ''}`}
                        onClick={() => handleSelectMode(MODE_MANUAL)}
                        aria-pressed={manualSelected}
                        aria-disabled={!isPaidPlan}
                        disabled={(isSaving && !manualSelected) || !isPaidPlan}
                    >
                        {isPaidPlan && (
                            <span
                                className={`hc-om-card__check${manualSelected ? ' hc-om-card__check--on' : ''}`}
                                aria-hidden="true"
                            >
                                {manualSelected && <SelectedCheck />}
                            </span>
                        )}
                        <div className="hc-om-card__head">
                            <span className="hc-om-card__icon hc-om-card__icon--manual">👆</span>
                            <div className="hc-om-card__head-text">
                                <h3 className="hc-om-card__title">Manual Mode</h3>
                                <p className="hc-om-card__subtitle">Review before we send</p>
                            </div>
                        </div>
                        <ul className="hc-om-card__features">
                            {MANUAL_FEATURES.map((feature) => (
                                <li key={feature} className="hc-om-card__feature">
                                    <CheckIcon className="hc-om-card__feature-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="hc-om-card__nudge">
                            <div className="hc-om-card__ideal">
                                Ideal for: Those who want personalized outreach
                            </div>
                        </div>
                    </button>

                    {!isPaidPlan && (
                        <div className="hc-om-tooltip" role="note">
                            <img
                                className="hc-om-tooltip__mascot"
                                src="/images/talent/outreach/mascot-neutral.svg"
                                alt=""
                                aria-hidden="true"
                            />
                            <div className="hc-om-tooltip__bubble">
                                <span className="hc-om-tooltip__text">
                                    You are currently on the free trial plan, upgrade your plan to
                                    access the Manual mode
                                </span>
                                <button
                                    type="button"
                                    className="hc-om-tooltip__cta"
                                    onClick={handleUpgradeClick}
                                >
                                    <BoltIcon size={14} />
                                    <span>Upgrade plan</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Paid-user disclaimer — same copy as Step4ModeSelection */}
            {isPaidPlan && (
                <div className="hc-om-notice" role="note">
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <circle cx="12" cy="12" r="9" stroke="#455873" strokeWidth="1.6" />
                        <path
                            d="M12 11v5"
                            stroke="#455873"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                        />
                        <circle cx="12" cy="8" r="1" fill="#455873" />
                    </svg>
                    <span>
                        In either mode, we will{' '}
                        <span className="hc-om-notice__strong">never</span> directly reach out to
                        your 1st-degree LinkedIn connections. We&apos;ll always inform you first
                        and ask for your approval before contacting them.
                    </span>
                </div>
            )}
        </div>

        <UpgradePlanDrawer
            open={upgradeDrawerOpen}
            onClose={() => setUpgradeDrawerOpen(false)}
        />
        </>
    );
};

export default OutreachModeTab;
