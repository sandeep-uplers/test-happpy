'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { TOGGLE_MANAGE_PREFERENCES_MODAL } from '../../../store/actions/actionsTypes';
import { API_GET_OUTREACH_STEP } from '../../../components/Constant';
import { GET_API } from '../../../components/Helper';
import '../job-agent/JobAgentSubscription.css';
import Step1 from './Step1';
import {
    HAPPY_SETUP_HANDWRITING,
} from './happyAgentPageAssets';
import './OutreachAgent.css';

const REFERRAL_AGENT_TECH_JOB_FUNCTION_IDS = [1, 2, 3, 5, 6, 7, 9, 15, 16, 17, 18, 23];

const isTechRoleJobFunction = (jobFunctionId) => {
    if (jobFunctionId === undefined || jobFunctionId === null) return false;
    const id = Number(jobFunctionId);
    return !Number.isNaN(id) && REFERRAL_AGENT_TECH_JOB_FUNCTION_IDS.includes(id);
};

const hasLessThan2YearsExperience = (value) => {
    if (value === undefined || value === null || value === '') return true;
    const num = Number(value);
    return !Number.isNaN(num) && num < 2;
};

const shouldShowComingSoonBlock = (user) => {
    if (user?.outreach?.is_eligible) return false;
    const lessThan2Yrs = hasLessThan2YearsExperience(user?.total_experience);
    const notTechRole = !isTechRoleJobFunction(user?.job_function_id);
    return false;
    return lessThan2Yrs || notTechRole;
};

const DEFAULT_STEP_CONFIG = {
    loading: true,
    status: {
        step1: false,
        step2: false,
        step_job_recommendation: false,
    },
    step1: {
        gmail_connected: false,
        linkedin_connected: false,
    },
    all_over_status: false,
    step2: {
        gmail_template: false,
        linkedin_template: false,
    },
    plan: null,
    plan_end_date: null,
    outreach_mode: 'unknown',
};

const isTotalExperienceEmpty = (value) =>
    value === undefined || value === null || value === '';

const isProfileOrPreferencesOlderThan3Months = () => false;

/**
 * Minimal configure flow: Gmail (required) + LinkedIn (optional, still shown).
 * Full outreach checklist (modes, extension, templates) stays on the Job Agent dashboard.
 */
const OutreachConfigureAccountsOnly = ({
    className = '',
    onAccountsStepChange,
    onOpenAgentOnboarding,
    dashboardPath = '/talent/job-agent/configure',
    publicSignupMode = false,
}) => {
    const router = useRouter();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const { user } = useSelector((state) => state.auth) || {};
    const [isLoading, setIsLoading] = useState(false);
    const [outreachStepConfig, setOutreachStepConfig] = useState(DEFAULT_STEP_CONFIG);
    const mountedRef = useRef(true);
    const onAccountsStepChangeRef = useRef(onAccountsStepChange);

    useEffect(() => {
        onAccountsStepChangeRef.current = onAccountsStepChange;
    }, [onAccountsStepChange]);

    const gmail = searchParams.get('gmail');

    const outreachStep = useCallback(() => {
        setIsLoading(true);
        /**
         * Runs after each GET outreach-step attempt (success, empty body, or error).
         * Parent landings (e.g. HappyJobAgent) rely on this to know Gmail/LinkedIn flags once the request has settled.
         */
        const finish = (configUpdate) => {
            if (mountedRef.current) {
                const next = { ...DEFAULT_STEP_CONFIG, ...configUpdate, loading: false };
                setOutreachStepConfig(next);
                setIsLoading(false);
                const cb = onAccountsStepChangeRef.current;
                if (typeof cb === 'function') {
                    cb({
                        gmailConnected: !!next?.status?.step1,
                        linkedinConnected: !!next?.step1?.linkedin_connected,
                    });
                }
            }
        };
        const timeoutId = setTimeout(() => {
            if (mountedRef.current) setIsLoading(false);
        }, 15000);

        if (publicSignupMode) {
            finish({});
            return;
        }

        GET_API(API_GET_OUTREACH_STEP)
            .then((res) => {
                const res_config = res?.data?.data;
                if (res_config && typeof res_config === 'object') {
                    finish(res_config);
                } else {
                    finish({});
                }
            })
            .catch((err) => {
                console.log('err', err);
                toast.error('Something went wrong. Please try again.');
                finish({});
            })
            .finally(() => {
                clearTimeout(timeoutId);
                if (mountedRef.current) setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        outreachStep();
    }, [outreachStep]);

    useEffect(() => {
        if (gmail === 'success') {
            outreachStep();
        }
    }, [gmail, outreachStep]);

    useEffect(() => {
        if (outreachStepConfig.loading || !user || Object.keys(user).length === 0) return;
        const jobFunctionEmpty = !user.job_function_id;
        const totalExpEmpty = isTotalExperienceEmpty(user.total_experience);
        const missingCriticalFields = jobFunctionEmpty && totalExpEmpty;
        const profileStale = isProfileOrPreferencesOlderThan3Months(user);
        if (missingCriticalFields || profileStale) {
            dispatch({ type: TOGGLE_MANAGE_PREFERENCES_MODAL, payload: true });
        }
    }, [
        outreachStepConfig.loading,
        user?.job_function_id,
        user?.total_experience,
        user?.profile_last_updated,
        user?.last_preference_at,
        dispatch,
    ]);

    const goToDashboard = () => {
        router.push(dashboardPath);
    };

    return (
        <div className={`outreach-container outreach-configure-page outreach-configure--accounts-only ${className}`.trim()}>
            {isLoading && (
                <div className="jad-subscription-fetch-state" role="status" aria-live="polite" aria-busy="true">
                    <div className="jad-subscription-fetch-state__spinner" aria-hidden />
                    <p className="jad-subscription-fetch-state__text">Loading setup…</p>
                </div>
            )}
            {/* <ManagePreferencesModal disableSkip={true} hideSaveAnalyzeResumeButton /> */}

            {!outreachStepConfig.loading && shouldShowComingSoonBlock(user) && (
                <div className="step-overview-section visible outreach-coming-soon-block" id="step-based-navigation">
                    <div className="outreach-coming-soon-card">
                        <span className="outreach-coming-soon-badge">Coming soon for you</span>
                        <div className="outreach-coming-soon-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h2 className="outreach-coming-soon-title">Thank you for connecting</h2>
                        <p className="outreach-coming-soon-lead">
                            We’re expanding the Happpy Agent to more roles and experience levels. You’re on the list—we’ll launch support for your profile soon.
                        </p>
                        <p className="outreach-coming-soon-reason">
                            Currently, the Agent supports tech roles such as Backend, Frontend, Full Stack, Data Science, ML/AI, DevOps, and other related engineering roles, and candidates should have more than 2 years of experience.
                        </p>
                    </div>
                </div>
            )}

            {!outreachStepConfig.loading && outreachStepConfig?.status?.step1 && !shouldShowComingSoonBlock(user) && (
                <div className="outreach-accounts-only-success happy-setup-figma__gmail-connected-banner" role="status">
                    <p>
                        <strong>Gmail connected.</strong> LinkedIn below is optional. Finish templates and other steps anytime in your Job Agent
                        dashboard.
                    </p>
                    <button type="button" className="outreach-accounts-only-dashboard-btn happy-setup-figma__dashboard-btn" onClick={() => router.push("/talent/job-agent/configure")}>
                        <span className={`happy-setup-figma__dashboard-label happy-agent-handwriting--uppercase`}>
                            {HAPPY_SETUP_HANDWRITING.openDashboard}
                        </span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            )}

            {!shouldShowComingSoonBlock(user) && (
                <div className="step-based-navigation-wrapper visible" id="happy-agent-step1-wrapper">
                    <Step1
                        outreachStepConfig={outreachStepConfig}
                        onNext={goToDashboard}
                        onBack={() => {}}
                        onRefresh={outreachStep}
                        accountsOnlyMode
                        publicSignupMode={publicSignupMode}
                        onOpenAgentOnboarding={onOpenAgentOnboarding}
                    />
                </div>
            )}
        </div>
    );
};

export default OutreachConfigureAccountsOnly;
