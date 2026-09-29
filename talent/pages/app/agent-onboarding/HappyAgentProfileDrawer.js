'use client';

import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ensureModalAppElement } from '../../../helpers/setModalAppElement';
import JobAgentManagePreferences from '../job-agent/JobAgentManagePreferences';
import '../job-agent/JobAgentUpdateProfile.css';
import '../../access-public/HappyJobAgentPublic.css';

const HAPPY_PUBLIC_PROFILE_FORM_ID = 'happy-public-profile-form';

ensureModalAppElement();

/**
 * Legacy standalone profile drawer — profile creation now lives in onboarding
 * Step 2 (`Step2ProfileCreation.js`). Kept for reference; no longer mounted.
 *
 * @deprecated Use Step2ProfileCreation inside AgentOnboarding instead.
 */
export default function HappyAgentProfileDrawer({
    isOpen,
    onClose,
    onSaveSuccess,
    unclosable = false,
}) {
    const [saveLoading, setSaveLoading] = useState(false);
    const [canSubmit, setCanSubmit] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCanSubmit(false);
            setSaveLoading(false);
        }
    }, [isOpen]);

    const ctaDisabled = saveLoading || !canSubmit;

    const handleRequestClose = () => {
        if (unclosable) return;
        onClose?.();
    };

    return (
        <Modal
            isOpen={!!isOpen}
            onRequestClose={handleRequestClose}
            portalClassName="happy-public-profile-portal"
            overlayClassName="happy-public-profile-overlay"
            className="happy-public-profile-drawer"
            bodyOpenClassName="happy-public-profile-body-open"
            contentLabel="Create your profile"
            shouldCloseOnOverlayClick={!unclosable}
            shouldCloseOnEsc={!unclosable}
        >
            <header className="happy-public-profile-drawer__header">
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
                {!unclosable ? (
                    <button type="button" className="happy-public-profile-drawer__close" onClick={onClose} aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : null}
            </header>

            <div className="happy-public-profile-drawer__body">
                <div className="jad-update-profile-wrap happy-public-profile-drawer__prefs">
                    {isOpen && (
                        <JobAgentManagePreferences
                            isModalOpen
                            lastPreferenceUpdate={0}
                            setIsModalOpen={(open) => {
                                if (open === false) onClose?.();
                            }}
                            setIsModalLoading={() => {}}
                            successCallback={onSaveSuccess}
                            disableSkip
                            twoColumnLocationPreferences
                            hideBuiltInFooter
                            formId={HAPPY_PUBLIC_PROFILE_FORM_ID}
                            onSaveLoadingChange={setSaveLoading}
                            onCanSubmitChange={setCanSubmit}
                            centeredResumeUpload
                            saveRedirectPath="/talent/job-agent"
                        />
                    )}
                </div>
            </div>

            <footer className="happy-public-profile-drawer__footer">
                <button
                    type="submit"
                    form={HAPPY_PUBLIC_PROFILE_FORM_ID}
                    className={`happy-public-profile-drawer__cta${ctaDisabled ? ' happy-public-profile-drawer__cta--disabled' : ''}`}
                    disabled={ctaDisabled}
                    aria-busy={saveLoading}
                    aria-disabled={ctaDisabled}
                >
                    <span>{saveLoading ? 'Saving…' : 'Save & continue'}</span>
                    {!saveLoading && canSubmit && (
                        <svg className="happy-public-profile-drawer__cta-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                            <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>
            </footer>
        </Modal>
    );
}
