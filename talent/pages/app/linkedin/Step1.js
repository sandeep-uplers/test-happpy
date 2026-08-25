'use client';

import React from 'react';
import AccountConnection from './AccountConnection';
import {
    HAPPY_SETUP_HANDWRITING,
} from './happyAgentPageAssets';
import './Step1.css';

const Step1 = ({ outreachStepConfig, onNext, onBack, onRefresh, accountsOnlyMode = false, onOpenAgentOnboarding, publicSignupMode = false }) => {
    return (
        <div className={`outreach-step outreach-step--jad${accountsOnlyMode ? ' outreach-step--accounts-only outreach-step--happy-setup-figma' : ''}`}>
            <div className="step-header-row">
                {/* <button type="button" onClick={onBack} className="step-back-to-overview-link" aria-label="Back to Overview">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Back to Overview</span>   
                </button> */}
                <div className="step-header">
                    {!(outreachStepConfig?.all_over_status) && ( <></>
                        // <div className="step-indicator">
                        //     <div className="step-number active">1</div>
                        //     <div className="step-line"></div>
                        //     <div className="step-number">2</div>
                        //     <div className="step-line"></div>
                        //     <div className="step-number">3</div>
                        //     <div className="step-line"></div>
                        //     <div className="step-number">4</div>
                        // </div>
                    )}
                    <h2 id={accountsOnlyMode ? 'happy-agent-setup-heading' : undefined}>
                        {outreachStepConfig?.all_over_status && !accountsOnlyMode
                            ? ''
                            : accountsOnlyMode
                              ? 'Join HAPPPY Agent'
                              : 'Join HAPPPY Agent'}
                    </h2>
                    {(!(outreachStepConfig?.all_over_status) || accountsOnlyMode) && (
                        <p className="step-lede">
                            {accountsOnlyMode ? (
                                <>
                                   Configure in less than 60 seconds
                                </>
                            ) : (
                                'Configure in less than 60 seconds'
                            )}
                        </p>
                    )}
                </div>
                <span className="step-header-row-spacer" aria-hidden="true" />
            </div>
            
            <AccountConnection
                outreachStepConfig={outreachStepConfig}
                onRefresh={onRefresh}
                accountsOnlyMode={accountsOnlyMode}
                onOpenAgentOnboarding={onOpenAgentOnboarding}
                publicSignupMode={publicSignupMode}
            />
            
            {!publicSignupMode &&
                <div className={`step-navigation${accountsOnlyMode ? ' step-navigation--accounts-only' : ''}`}>
                    {!accountsOnlyMode && (
                        <button type="button" className="primaryBtn" onClick={onBack} disabled={true}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back
                        </button>
                    )}

                    <button type="button" className="primaryBtn" onClick={onNext} disabled={!outreachStepConfig?.status?.step1}>
                        {accountsOnlyMode ? (
                            <>
                                <span className={`happy-setup-figma__dashboard-label happy-agent-handwriting--uppercase`}>
                                    {HAPPY_SETUP_HANDWRITING.openDashboard}
                                </span>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </>
                        ) : (
                            <>
                                Step 2
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            }
        </div>
    );
};

export default Step1;
