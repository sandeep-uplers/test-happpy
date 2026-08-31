'use client';

import { ensureModalAppElement } from '../../../helpers/setModalAppElement';
import { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { GET_API } from '../../../components/Helper';
import { API_GET_OUTREACH_STEP } from '../../../components/Constant';
import Step2TemplateSelection from './Step2TemplateSelection';
import './AgentOnboarding.css';
import toast from 'react-hot-toast';

ensureModalAppElement();

/**
 * Post-onboarding template drawer — replaces HappyAgentProfileDrawer on the
 * dashboard for the public signup handoff.
 */
export default function HappyAgentTemplateDrawer({
    isOpen,
    onClose,
    onSaveSuccess,
    unclosable = false,
}) {
    const [outreachStepConfig, setOutreachStepConfig] = useState(null);

    const fetchOutreachStep = useCallback(() => {
        return GET_API(API_GET_OUTREACH_STEP)
            .then((res) => {
                const config = res?.data?.data;
                if (config && typeof config === 'object') {
                    setOutreachStepConfig(config);
                }
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        fetchOutreachStep();
    }, [isOpen, fetchOutreachStep]);

    const handleRequestClose = () => {
        if (unclosable) return;
        onClose?.();
    };

    const handleAdvance = () => {
        toast.success('Agent set up completed successfully');
        onSaveSuccess?.();
    };

    return (
        <Modal
            isOpen={!!isOpen}
            onRequestClose={handleRequestClose}
            portalClassName="agent-onb-portal"
            overlayClassName="agent-onb-overlay"
            className="agent-onb-drawer"
            bodyOpenClassName="agent-onb-body-open"
            contentLabel="Set up your outreach message"
            shouldCloseOnOverlayClick={!unclosable}
            shouldCloseOnEsc={!unclosable}
        >
            {!unclosable ? (
                <button
                    type="button"
                    className="agent-onb-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            ) : null}

            <Step2TemplateSelection
                outreachStepConfig={outreachStepConfig}
                onAdvance={handleAdvance}
                onBack={unclosable ? undefined : onClose}
                hideBack={unclosable}
                ctaLabel="Save My Templates"
            />
        </Modal>
    );
}
