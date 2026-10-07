'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { GET_API } from '../../../components/Helper';
import { API_GET_OUTREACH_STEP } from '../../../components/Constant';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';
import {
    clearPublicAuthPath,
    setOnboardingTemplatePending,
} from '../../../helpers/happyAgentPublicSignupSession';
import { publicSignupPaymentComplete } from '../../../helpers/happyAgentPublicTrialPayment';
import {
    ONBOARDING_URL_PARAM,
    setOnboardingActivityUrlParam,
} from '../../../helpers/onboardingUrlParams';
import { isDesktopPc } from '../../../helpers/happpyGtmOnboarding';
import Step1AccountConnection from './Step1AccountConnection';
import Step2ProfileCreation from './Step2ProfileCreation';
import Step3ExtensionInstall from './Step3ExtensionInstall';
// import Step4ModeSelection from './Step4ModeSelection';
// import Step5UpgradePlan from './Step5UpgradePlan';
import StepPublicSignupPayment from './StepPublicSignupPayment';
import './AgentOnboarding.css';
import { pageActivityTracker, storeRecommendedJobs } from '../../../store/actions/UserActions';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Unpaid onboarding step order (everyone: new signup + authenticated refresh).
 * Today: `'accounts-first'` → accounts → payment → profile → extension.
 * Switch to `'payment-first'` for payment → accounts → profile → extension.
 */
export const ONBOARDING_UNPAID_STEP_ORDER = 'accounts-first';

const STEPS_UNPAID_BY_ORDER = {
    'payment-first': ['payment', 'accounts', 'profile', 'extension' /* , 'mode' */],
    'accounts-first': ['accounts', 'payment', 'profile', 'extension' /* , 'mode' */],
};

/** After trial/plan is active — payment step omitted; same tail as the unpaid sequence. */
const STEPS_PAID = ['accounts', 'profile', 'extension' /* , 'mode' */];

const filterOnboardingExtensionStep = (steps) =>
    isDesktopPc() ? steps : steps.filter((step) => step !== 'extension');

function isGmailConnectedForOnboarding(user, outreachStepConfig) {
    if (outreachStepConfig?.status?.step1) {
        return true;
    }
    const outreach = user?.outreach ?? user?.userdata?.outreach ?? user?.userData?.outreach;
    return Boolean(outreach?.account_connected || outreach?.gmail_connected);
}

/** Extension install is desktop-only (same gate as Happpy GTM onboarding). */
const getActiveSteps = ({
    needsPayment,
    unpaidStepOrder = ONBOARDING_UNPAID_STEP_ORDER,
}) => {
    if (needsPayment) {
        const base =
            STEPS_UNPAID_BY_ORDER[unpaidStepOrder] ?? STEPS_UNPAID_BY_ORDER['accounts-first'];
        return filterOnboardingExtensionStep(base);
    }
    return filterOnboardingExtensionStep(STEPS_PAID);
};

/** Set when the user finishes a step (Next, Save & continue, or ₹99 pay success). */
const STEP_COMPLETED_URL_PARAM = {
    accounts: ONBOARDING_URL_PARAM.ACCOUNT_LINKED,
    payment: ONBOARDING_URL_PARAM.TRIAL_STARTED,
    profile: ONBOARDING_URL_PARAM.PROFILE_CREATED,
    extension: ONBOARDING_URL_PARAM.EXTENSION_AWARE,
};

const JOB_AGENT_DASHBOARD_ROUTE = '/talent/job-agent';

const AgentOnboarding = ({ isOpen, onClose, onAccountsStepChange, onExit }) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const authUser = useSelector((state) => state.auth)?.user;
    const [currentStep, setCurrentStep] = useState(0);
    const [outreachStepConfig, setOutreachStepConfig] = useState(null);
    const [stepConfigLoading, setStepConfigLoading] = useState(false);

    const hasActiveTrialOrPaidPlan = useCallback(() => {
        const sessionUser = JSON.parse(localStorage.getItem('user') || 'null');
        return (
            publicSignupPaymentComplete(sessionUser) || publicSignupPaymentComplete(authUser)
        );
    }, [authUser]);

    const needsPayment = !hasActiveTrialOrPaidPlan();

    const steps = useMemo(
        () =>
            getActiveSteps({
                needsPayment,
                unpaidStepOrder: ONBOARDING_UNPAID_STEP_ORDER,
            }),
        [needsPayment]
    );

    const stepsRef = useRef(steps);
    useEffect(() => {
        const prevSteps = stepsRef.current;
        if (prevSteps === steps) {
            return;
        }
        const stepKeyAtIndex = prevSteps[currentStep];
        if (stepKeyAtIndex && steps.includes(stepKeyAtIndex)) {
            setCurrentStep(steps.indexOf(stepKeyAtIndex));
        } else if (stepKeyAtIndex === 'payment' && !steps.includes('payment')) {
            const profileIdx = steps.indexOf('profile');
            setCurrentStep(profileIdx >= 0 ? profileIdx : 0);
        } else {
            setCurrentStep((idx) => Math.min(idx, Math.max(0, steps.length - 1)));
        }
        stepsRef.current = steps;
    }, [steps, currentStep]);

    const activeStepKey = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

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

    useEffect(() => {
        if (!isOpen) return;
        const sessionUser = JSON.parse(localStorage.getItem('user') || 'null');
        const alreadyPaid =
            publicSignupPaymentComplete(sessionUser) || publicSignupPaymentComplete(authUser);
        const unpaidOnOpen = !alreadyPaid;
        clearPublicAuthPath();
        setCurrentStep(0);
        stepsRef.current = getActiveSteps({
            needsPayment: unpaidOnOpen,
            unpaidStepOrder: ONBOARDING_UNPAID_STEP_ORDER,
        });
        fetchOutreachStep();
        setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS);
        trackHappyAgentMixpanel('agent_onb_popup_opened').catch(() => {});
        const newPath = {
            url: '/talent/referral-create-profile',
        };
        pageActivityTracker(newPath)(dispatch);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- authUser read once per open; omit to avoid reset on payment refresh
    }, [isOpen, fetchOutreachStep, dispatch]);

    const finishExit = (completed) => {
        const paid = hasActiveTrialOrPaidPlan();
        const gmailConnected = isGmailConnectedForOnboarding(authUser, outreachStepConfig);
        const wouldRedirectToDashboard = completed ? paid : paid && gmailConnected;
        if (completed) {
            setOnboardingTemplatePending();
        }
        if (!completed) {
            trackHappyAgentMixpanel('agent_onb_drawer_closed', {
                step: activeStepKey,
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

    const goToNextStep = async () => {
        const completedParam = STEP_COMPLETED_URL_PARAM[activeStepKey];
        if (completedParam) {
            setOnboardingActivityUrlParam(completedParam);
        }
        trackHappyAgentMixpanel('agent_onb_next_step', {
            from_step: activeStepKey,
        }).catch(() => {});

        if (activeStepKey === 'payment') {
            const profileIdx = steps.indexOf('profile');
            if (profileIdx >= 0) {
                setCurrentStep(profileIdx);
            } else {
                setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
            }
            return;
        }

        const isFinishing = activeStepKey === steps[steps.length - 1];
        if (isFinishing) {
            if (!hasActiveTrialOrPaidPlan()) {
                toast.error('Start your ₹99 trial or choose a plan before continuing.');
                return;
            }
            const needsDefaultMode =
                !outreachStepConfig?.outreach_mode ||
                outreachStepConfig.outreach_mode === 'unknown';
            if (needsDefaultMode) {
                try {
                    await dispatch(
                        storeRecommendedJobs({
                            jobs: [],
                            auto_run: true,
                            outreach_mode: 'auto',
                        })
                    );
                } catch (error) {
                    toast.error(
                        error?.response?.data?.message ||
                            'Could not save your preferred mode. Please try again.'
                    );
                    return;
                }
            }
            finishExit(true);
            return;
        }
        setCurrentStep((s) => s + 1);
    };

    const goToPrevStep = () => {
        trackHappyAgentMixpanel('agent_onb_prev_step', {
            from_step: activeStepKey,
        }).catch(() => {});

        setCurrentStep((s) => Math.max(0, s - 1));
    };

    const renderStep = () => {
        switch (activeStepKey) {
            case 'profile':
                return (
                    <Step2ProfileCreation
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                        showBack={currentStep > 0}
                        isLastStep={isLastStep}
                    />
                );
            case 'accounts':
                return (
                    <Step1AccountConnection
                        outreachStepConfig={outreachStepConfig}
                        stepConfigLoading={stepConfigLoading}
                        onRefresh={fetchOutreachStep}
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                        showBack={currentStep > 0}
                        isLastStep={isLastStep}
                    />
                );
            case 'payment':
                return (
                    <StepPublicSignupPayment
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                        onClose={handleClose}
                        showBack={currentStep > 0}
                    />
                );
            case 'extension':
                return (
                    <Step3ExtensionInstall
                        outreachStepConfig={outreachStepConfig}
                        onRefresh={fetchOutreachStep}
                        onAdvance={goToNextStep}
                        onBack={goToPrevStep}
                        isLastStep={isLastStep}
                    />
                );
            default:
                return null;
        }
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

            {renderStep()}
        </Modal>
    );
};

export default AgentOnboarding;
