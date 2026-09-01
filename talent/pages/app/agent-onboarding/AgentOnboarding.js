'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useRouter } from 'next/navigation';
import { GET_API } from '../../../components/Helper';
import { API_GET_OUTREACH_STEP } from '../../../components/Constant';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';
import { setOnboardingTemplatePending } from '../../../helpers/happyAgentPublicSignupSession';
import {
    ONBOARDING_URL_PARAM,
    setOnboardingActivityUrlParam,
} from '../../../helpers/onboardingUrlParams';
import Step1AccountConnection from './Step1AccountConnection';
import Step2ProfileCreation from './Step2ProfileCreation';
import Step3ExtensionInstall from './Step3ExtensionInstall';
import Step4ModeSelection from './Step4ModeSelection';
import Step5UpgradePlan from './Step5UpgradePlan';
import './AgentOnboarding.css';
import { pageActivityTracker } from '../../../store/actions/UserActions';
import { useDispatch, useSelector } from 'react-redux';

if (typeof document !== 'undefined' && document.getElementById('happpy-root')) {
}

/**
 * Right-side drawer that hosts the new agent onboarding flow.
 *
 * Acts as the shared chrome (overlay, slide-in panel, close affordance) around
 * an ordered list of step components. Each step renders its own scroll body
 * AND its own sticky footer so the visual style (CTA color, back button,
 * warning chip) can vary per step without leaking into this parent.
 *
 * Props
 *  - isOpen:               boolean — controls drawer visibility.
 *  - onClose:              () => void — invoked on close (X / Esc / finish).
 *  - onAccountsStepChange: ({ gmailConnected, linkedinConnected }) => void
 *                          Fires whenever account status changes so the parent
 *                          landing page can update its hero CTA / banner state.
 *  - onExit:               optional ({ wouldRedirectToDashboard, completed }) => void
 *                          When provided, parent owns post-close navigation (no
 *                          internal dashboard navigate). Used by the public
 *                          signup handoff so the template drawer can open after
 *                          onboarding exits.
 */
const STEPS = ['accounts', 'profile', 'extension', 'mode'];

const STEP_COMPLETED_URL_PARAM = {
    accounts: ONBOARDING_URL_PARAM.ACCOUNT_LINKED,
    profile: ONBOARDING_URL_PARAM.PROFILE_CREATED,
    extension: ONBOARDING_URL_PARAM.EXTENSION_AWARE,
};

/** Route the user lands on after finishing (or bailing out of) onboarding
 *  once their Gmail account is connected — the Job Agent dashboard. */
const JOB_AGENT_DASHBOARD_ROUTE = '/talent/job-agent';

const AgentOnboarding = ({ isOpen, onClose, onAccountsStepChange, onExit }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [currentStep, setCurrentStep] = useState(0);
    const [outreachStepConfig, setOutreachStepConfig] = useState(null);
    const [stepConfigLoading, setStepConfigLoading] = useState(false);
    /** Side-step toggle for the upgrade-plan screen. When true we render the
     *  pricing branch instead of the current linear step; the user returns to
     *  Step 4 via the back arrow OR auto-returns on payment success. */
    const [showUpgrade, setShowUpgrade] = useState(false);

    /** Pull the outreach checklist so steps can drive their CTA enabled state. */
    const fetchOutreachStep = useCallback(() => {
        setStepConfigLoading(true);
        return GET_API(API_GET_OUTREACH_STEP)
            .then((res) => {
                const config = res?.data?.data;
                if (config && typeof config === 'object') {
                    setOutreachStepConfig(config);
                    if (typeof onAccountsStepChange === 'function') {
                        onAccountsStepChange({
                            gmailConnected: !!config?.status?.step1,
                            linkedinConnected: !!config?.step1?.linkedin_connected,
                        });
                    }
                }
            })
            .catch(() => {})
            .finally(() => setStepConfigLoading(false));
    }, [onAccountsStepChange]);

    /** Refetch the checklist whenever the drawer is (re)opened so we never show stale state. */
    useEffect(() => {
        if (!isOpen) return;
        setCurrentStep(0);
        setShowUpgrade(false);
        fetchOutreachStep();
        trackHappyAgentMixpanel('agent_onb_popup_opened').catch(() => {});
        setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS);
        let newPath= {
            url: "/talent/referral-connect-accounts",
        }
        pageActivityTracker(newPath)(dispatch)
    }, [isOpen, fetchOutreachStep]);

    const openUpgrade = () => {
        trackHappyAgentMixpanel('agent_onb_upgrade_opened', {
            from_step: STEPS[currentStep],
        }).catch(() => {});
        setShowUpgrade(true);
    };

    const closeUpgrade = () => {
        trackHappyAgentMixpanel('agent_onb_upgrade_closed').catch(() => {});
        setShowUpgrade(false);
    };

    /** Razorpay success — refresh outreach state, then return the user to
     *  Step 4 so they can confirm Manual mode against their new plan. */
    const handleUpgradeSuccess = () => {
        fetchOutreachStep();
        setShowUpgrade(false);
    };

    /** Once Gmail is hooked up the user has effectively activated the agent,
     *  so any exit from the drawer (X / Esc / finishing the last step) should
     *  drop them on the Job Agent dashboard rather than back on the marketing
     *  landing page they came from — unless the parent supplies `onExit`. */
    const shouldRedirectToDashboard = () =>
        !!outreachStepConfig?.status?.step1;

    const finishExit = (completed) => {
        const wouldRedirectToDashboard = completed || shouldRedirectToDashboard();
        if (completed) {
            setOnboardingTemplatePending();
        }
        if (!completed) {
            trackHappyAgentMixpanel('agent_onb_drawer_closed', {
                step: STEPS[currentStep],
                redirected_to_dashboard: wouldRedirectToDashboard && typeof onExit !== 'function',
            }).catch(() => {});
        }
        if (typeof onClose === 'function') onClose();
        if (typeof onExit === 'function') {
            onExit({ wouldRedirectToDashboard, completed: !!completed });
            return;
        }
        if (wouldRedirectToDashboard) {
            router.push(JOB_AGENT_DASHBOARD_ROUTE);
        }
    };

    const handleClose = () => {
        finishExit(false);
    };

    const goToNextStep = () => {
        const completedParam = STEP_COMPLETED_URL_PARAM[STEPS[currentStep]];
        if (completedParam) {
            setOnboardingActivityUrlParam(completedParam);
        }
        trackHappyAgentMixpanel('agent_onb_next_step', {
            from_step: STEPS[currentStep],
        }).catch(() => {});
        if (currentStep + 1 >= STEPS.length) {
            finishExit(true);
            return;
        }
        setCurrentStep((s) => s + 1);
    };

    const goToPrevStep = (backToProfile = false) => {
        trackHappyAgentMixpanel('agent_onb_prev_step', {
            from_step: STEPS[currentStep],
        }).catch(() => {});

        if(backToProfile) {
            setCurrentStep((s) => Math.max(0, s - 2));
            return;
        }
        setCurrentStep((s) => Math.max(0, s - 1));
    };

    const renderStep = () => {
        switch (STEPS[currentStep]) {
            case 'accounts':
                return (
                    <Step1AccountConnection
                        outreachStepConfig={outreachStepConfig}
                        stepConfigLoading={stepConfigLoading}
                        onRefresh={fetchOutreachStep}
                        onAdvance={goToNextStep}
                    />
                );
            case 'profile':
                return (
                    <Step2ProfileCreation
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                    />
                );
            case 'extension':
                return (
                    <Step3ExtensionInstall
                        outreachStepConfig={outreachStepConfig}
                        onRefresh={fetchOutreachStep}
                        onAdvance={goToNextStep}
                        onBack={() => goToPrevStep(Boolean(user?.expected_ctc))}
                    />
                );
            case 'mode':
                return (
                    <Step4ModeSelection
                        outreachStepConfig={outreachStepConfig}
                        onRefresh={fetchOutreachStep}
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                        onUpgrade={openUpgrade}
                    />
                );
            default:
                return null;
        }
    };

    const renderBody = () => {
        if (showUpgrade) {
            return (
                <Step5UpgradePlan
                    onBack={closeUpgrade}
                    onPaymentSuccess={handleUpgradeSuccess}
                />
            );
        }
        return renderStep();
    };

    return (
        <Modal
            isOpen={!!isOpen}
            onRequestClose={handleClose}
            portalClassName="agent-onb-portal"
            overlayClassName="agent-onb-overlay"
            className="agent-onb-drawer"
            bodyOpenClassName="agent-onb-body-open"
            contentLabel="Agent onboarding"
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc
        >
            <button
                type="button"
                className="agent-onb-close"
                onClick={handleClose}
                aria-label="Close onboarding"
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M18 6L6 18M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {renderBody()}
        </Modal>
    );
};

export default AgentOnboarding;
