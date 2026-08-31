'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { storeRecommendedJobs } from '../../../store/actions/UserActions';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';

/**
 * Step 4 — "Choose your outreach mode"
 *
 * Mirrors {@link Step2} from `pages/app/linkedin/Step2.js` but as a fully
 * interactive picker:
 *   - Free-trial users (plan !== 2): Auto is preselected, Manual is presented
 *     desaturated/dimmed via CSS `filter` and the mascot bubble shows the
 *     "Upgrade plan" nudge.
 *   - Paid users (plan === 2): Both cards are selectable; the mascot bubble
 *     flips to a confirmation ("Auto / Manual Mode selected!") that mirrors
 *     the current selection.
 *
 * Props
 *  - outreachStepConfig: full /talent/outreach-step payload from the parent.
 *  - onRefresh:          () => void — refetch the config after we persist the
 *                        selected mode.
 *  - onAdvance:          () => void — invoked when the user hits "Complete
 *                        agent set up" (this is the final step, so the
 *                        drawer closes via the parent's STEPS guard).
 *  - onBack:             () => void — invoked by the circular back arrow.
 *  - onUpgrade:          () => void — opens the side-step pricing screen
 *                        when the user clicks "Upgrade plan" in the tooltip.
 */

const MODE_AUTO = 'auto';
const MODE_MANUAL = 'manual';

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

function BoltIcon({ size = 16 }) {
    return (
        <svg width={size}
            height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.77952 6.60925L5.82095 3.84722C7.14052 2.06186 7.80031 1.16917 8.41588 1.35782C9.03146 1.54646 9.03146 2.64134 9.03146 4.83109V5.03755C9.03146 5.82735 9.03146 6.22225 9.28382 6.46995L9.29717 6.48278C9.55498 6.72525 9.96598 6.72525 10.788 6.72525C12.2672 6.72525 13.0069 6.72525 13.2568 7.17388C13.261 7.18131 13.265 7.18879 13.2689 7.19634C13.5049 7.65191 13.0766 8.23132 12.2201 9.39013L10.1787 12.1521C8.85911 13.9375 8.19931 14.8302 7.58373 14.6415C6.96816 14.4529 6.96817 13.358 6.9682 11.1682L6.96821 10.9618C6.96822 10.172 6.96822 9.77713 6.71587 9.52942L6.70251 9.51659C6.44471 9.27412 6.03369 9.27412 5.21167 9.27412C3.73243 9.27412 2.9928 9.27412 2.74284 8.82549C2.7387 8.81807 2.73467 8.81058 2.73077 8.80304C2.4948 8.34746 2.92304 7.76806 3.77952 6.60925Z" fill="#231F20" />
        </svg>

    );
}

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

const Step4ModeSelection = ({
    outreachStepConfig,
    onRefresh,
    onAdvance,
    onBack,
    onUpgrade,
}) => {
    const dispatch = useDispatch();

    /** plan === 2 is the paid plan that unlocks Manual mode (mirrors Step2.js). */
    const isPaidPlan = Number(outreachStepConfig?.plan) === 2;
    const savedMode = outreachStepConfig?.outreach_mode;

    /** Free-trial users are forced onto Auto; paid users default to their saved
     *  mode (or Auto if they've never picked one). */
    const [selectedMode, setSelectedMode] = useState(
        isPaidPlan ? savedMode || MODE_AUTO : MODE_AUTO
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSelectMode = (mode) => {
        if (isSaving) return;
        if (mode === MODE_MANUAL && !isPaidPlan) return;
        if (mode === selectedMode) return;
        setSelectedMode(mode);
        trackHappyAgentMixpanel('agent_onb_mode_selected', { mode }).catch(() => { });
    };

    const handleComplete = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
            await dispatch(
                storeRecommendedJobs({
                    jobs: [],
                    auto_run: selectedMode === MODE_AUTO,
                    outreach_mode: selectedMode,
                })
            );
            trackHappyAgentMixpanel('agent_onb_mode_step_completed', {
                mode: selectedMode,
            }).catch(() => { });
            if (typeof onRefresh === 'function') {
                try {
                    await onRefresh();
                } catch (e) {
                    // ignore — we'll still finish onboarding
                }
            }
            if (typeof onAdvance === 'function') onAdvance();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                'Could not save your preferred mode. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpgradeClick = () => {
        trackHappyAgentMixpanel('agent_onb_mode_upgrade_clicked').catch(() => { });
        if (typeof onUpgrade === 'function') onUpgrade();
    };

    const autoSelected = selectedMode === MODE_AUTO;
    const manualSelected = selectedMode === MODE_MANUAL;

    /** Tooltip variant:
     *   - 'upgrade' → free-trial users, prompts upgrade to unlock Manual
     *   - 'success' → paid users, confirms the current pick */
    const tooltipVariant = isPaidPlan ? 'success' : 'upgrade';
    const selectedModeLabel = manualSelected ? 'Manual Mode' : 'Auto Mode';

    return (
        <>
            <div className="agent-onb-scroll">
                <header className="agent-onb-step-header">
                    <h2 className="agent-onb-step-header__title">Choose your outreach mode</h2>
                    <p className="agent-onb-step-header__lede">
                        <span className="agent-onb-step-header__lede-strong in-block">
                            Choose how outreach runs!
                        </span>{' '}
                        You can change this later in your dashboard
                    </p>
                </header>

                <div className="agent-onb-mode-grid">
                    {/* ---------------- Auto Mode card (recommended) ---------------- */}
                    <button
                        type="button"
                        className={`agent-onb-mode-card agent-onb-mode-card--auto${autoSelected ? ' agent-onb-mode-card--selected' : ''
                            }`}
                        onClick={() => handleSelectMode(MODE_AUTO)}
                        aria-pressed={autoSelected}
                    >
                        <span className="agent-onb-mode-card__badge agent-onb-mode-card__badge--recommended">
                            Recommended
                        </span>
                        <span
                            className={`agent-onb-mode-card__check${autoSelected ? ' agent-onb-mode-card__check--on' : ''
                                }`}
                            aria-hidden="true"
                        >
                            {autoSelected && (
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
                            )}
                        </span>
                        <div className="agent-onb-mode-card__head">
                            <span className="agent-onb-mode-card__icon agent-onb-mode-card__icon--auto">
                                ⚡️
                            </span>
                            <div className="agent-onb-mode-card__head-text">
                                <h3 className="agent-onb-mode-card__title">Auto Mode</h3>
                                <p className="agent-onb-mode-card__subtitle">
                                    Let the agent handle outreach
                                </p>
                            </div>
                        </div>
                        <ul className="agent-onb-mode-card__features">
                            {AUTO_FEATURES.map((feature) => (
                                <li key={feature} className="agent-onb-mode-card__feature">
                                    <CheckIcon className="agent-onb-mode-card__feature-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className='nudge-container'>
                            <div className="agent-onb-mode-card__ideal">
                                Ideal for: Busy professionals wanting high efficiency
                            </div>
                        </div>
                    </button>

                    {/* ---------------- Manual Mode card (locked on free trial) ---------------- */}
                    <button
                        type="button"
                        className={`agent-onb-mode-card agent-onb-mode-card--manual${manualSelected ? ' agent-onb-mode-card--selected' : ''
                            }${!isPaidPlan ? ' agent-onb-mode-card--locked' : ''}`}
                        onClick={() => handleSelectMode(MODE_MANUAL)}
                        aria-pressed={manualSelected}
                        aria-disabled={!isPaidPlan}
                    >
                        {isPaidPlan && (
                            <span
                                className={`agent-onb-mode-card__check${manualSelected ? ' agent-onb-mode-card__check--on' : ''}`}
                                aria-hidden="true"
                            >
                                {manualSelected &&
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
                                }
                            </span>
                        )}
                        <div className="agent-onb-mode-card__head">
                            <span className="agent-onb-mode-card__icon agent-onb-mode-card__icon--manual">
                                👆
                            </span>
                            <div className="agent-onb-mode-card__head-text">
                                <h3 className="agent-onb-mode-card__title">Manual Mode</h3>
                                <p className="agent-onb-mode-card__subtitle">
                                    Review before we send
                                </p>
                            </div>
                        </div>
                        <ul className="agent-onb-mode-card__features">
                            {MANUAL_FEATURES.map((feature) => (
                                <li key={feature} className="agent-onb-mode-card__feature">
                                    <CheckIcon className="agent-onb-mode-card__feature-icon" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <div className='nudge-container'>
                            <div className="agent-onb-mode-card__ideal">
                                Ideal for: Those who want personalized outreach
                            </div>
                        </div>
                    </button>
                </div>
                <div className="agent-onb-mode-grid">
                    <div className={`agent-onb-blank-card`}></div>
                    <div className={`agent-onb-blank-card`}>
                        {!isPaidPlan && (
                            <div className="agent-onb-mode-tooltip-wrap">
                                <div
                                    className={`agent-onb-mode-tooltip agent-onb-mode-tooltip--${tooltipVariant}`}
                                    role="note"
                                >
                                    <img
                                        className="agent-onb-mode-tooltip__mascot"
                                        src="/images/talent/outreach/mascot-neutral.svg"
                                        alt=""
                                        aria-hidden="true"
                                    />
                                    <div className="agent-onb-mode-tooltip__bubble">

                                        <span className="agent-onb-mode-tooltip__text">
                                            You are currently on the free trial plan, upgrade your
                                            plan to access the Manual mode
                                        </span>
                                        <button
                                            type="button"
                                            className="agent-onb-mode-tooltip__cta"
                                            onClick={handleUpgradeClick}
                                        >
                                            <BoltIcon size={14} />
                                            <span>Upgrade plan</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Universal disclaimer — sits directly below the cards regardless
                    of plan, so the LinkedIn-connections guarantee is always visible. */}
                {isPaidPlan &&
                    <div className="agent-onb-mode-notice" role="note">
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
                            <span className="agent-onb-mode-notice__strong">never</span> directly
                            reach out to your 1st-degree LinkedIn connections. We&apos;ll always
                            inform you first and ask for your approval before contacting them.
                        </span>
                    </div>
                }
            </div>

            <div className="agent-onb-footer">
                <button
                    type="button"
                    className="agent-onb-footer__back"
                    onClick={onBack}
                    aria-label="Back to previous step"
                    disabled={isSaving}
                >
                    <svg
                        width="33"
                        height="33"
                        viewBox="0 0 33 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M25.9668 16.4004H6.83346"
                            stroke="#231F20"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663"
                            stroke="#231F20"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    className="agent-onb-footer__cta agent-onb-footer__cta--dark agent-onb-footer__cta--wide"
                    onClick={handleComplete}
                    disabled={isSaving}
                >
                    <span>{isSaving ? 'Saving…' : 'Go to dashboard'}</span>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default Step4ModeSelection;
