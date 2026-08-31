'use client';

import { useState } from 'react';
import JobAgentManagePreferences from '../job-agent/JobAgentManagePreferences';
import '../job-agent/JobAgentUpdateProfile.css';
import '../../access-public/HappyJobAgentPublic.css';
import './AgentOnboarding.css';

const HAPPY_PUBLIC_PROFILE_FORM_ID = 'happy-onboarding-profile-form';

/**
 * Step 2 — "Create your profile"
 *
 * Profile preferences previously shown in HappyAgentProfileDrawer after
 * onboarding; now the second step inside AgentOnboarding.
 */
export default function Step2ProfileCreation({ onAdvance, onBack }) {
    const [saveLoading, setSaveLoading] = useState(false);
    const [prefsLoading, setPrefsLoading] = useState(true);
    const ctaDisabled = saveLoading || prefsLoading;

    return (
        <>
            <div className="agent-onb-scroll agent-onb-scroll--profile" id="agentOnbScroll">
                <header className="happy-public-profile-drawer__header happy-public-profile-drawer__header--in-onboarding">
                    <div className="happy-public-profile-drawer__header-main">
                        <img
                            src="/images/talent/outreach/mascot-chill.svg"
                            alt=""
                            className="happy-public-profile-drawer__mascot"
                            aria-hidden
                        />
                        <h2 className="happy-public-profile-drawer__title">
                            Hey! Let&apos;s{' '}
                            <span className="happy-public-profile-drawer__title-word">
                                create your profile
                                <img
                                    className="happy-public-profile-drawer__title-underline"
                                    src="/images/talent/outreach/create-profile-underline.svg"
                                    alt=""
                                    aria-hidden
                                />
                            </span>
                        </h2>
                    </div>
                </header>

                <div className="jad-update-profile-wrap happy-public-profile-drawer__prefs">
                    <JobAgentManagePreferences
                        isModalOpen
                        lastPreferenceUpdate={0}
                        setIsModalOpen={() => {}}
                        setIsModalLoading={() => {}}
                        successCallback={onAdvance}
                        disableSkip
                        twoColumnLocationPreferences
                        hideBuiltInFooter
                        formId={HAPPY_PUBLIC_PROFILE_FORM_ID}
                        onSaveLoadingChange={setSaveLoading}
                        onPreferencesLoadingChange={setPrefsLoading}
                        centeredResumeUpload
                    />
                </div>
            </div>

            <div className="agent-onb-footer agent-onb-footer--profile">
                <button
                    type="button"
                    className="agent-onb-footer__back"
                    onClick={onBack}
                    aria-label="Back to previous step"
                    disabled={ctaDisabled}
                >
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button
                    type="submit"
                    form={HAPPY_PUBLIC_PROFILE_FORM_ID}
                    className={`happy-public-profile-drawer__cta agent-onb-footer__cta agent-onb-footer__cta--dark${ctaDisabled ? ' happy-public-profile-drawer__cta--disabled' : ''}`}
                    disabled={ctaDisabled}
                    aria-busy={saveLoading || prefsLoading}
                >
                    <span>{saveLoading ? 'Saving…' : prefsLoading ? 'Loading…' : 'Save & continue'}</span>
                    {!ctaDisabled && (
                        <svg className="happy-public-profile-drawer__cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );
}
