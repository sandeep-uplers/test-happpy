'use client';

import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { OUTREACH_JOURNEY_KEY_ONBOARDING_POP_OPENED } from "../../../components/Constant";
import {
    ONBOARDING_URL_PARAM,
    setOnboardingActivityUrlParam,
} from "../../../helpers/onboardingUrlParams";
import { trackHappyAgentMixpanel } from "../../../store/actions/happyAgentTracking";
import {
    applyHapppyGtmStepCompletion,
    getHapppyGtmStepOrder,
    HAPPPY_GTM_DISABLE_AUTO_SKIP,
    isDesktopPc,
    resolveHapppyGtmStep,
    trackHapppyGtm,
    trackHapppyGtmOutreachJourney,
} from "../../../helpers/happpyGtmOnboarding";
import HapppyGtmGmailStep from "./HapppyGtmGmailStep";
import HapppyGtmPreferencesStep from "./HapppyGtmPreferencesStep";
import HapppyGtmExtensionStep from "./HapppyGtmExtensionStep";
import "../../app/agent-onboarding/AgentOnboarding.css";
import "./HapppyGtmOnboarding.css";
import { ensureModalAppElement } from "../../../helpers/setModalAppElement";

ensureModalAppElement();

const STEP_COMPLETED_URL_PARAM = {
    prefs: ONBOARDING_URL_PARAM.PROFILE_CREATED,
    gmail: ONBOARDING_URL_PARAM.ACCOUNT_LINKED,
};

/** Align `agent_onb_*` Mixpanel step names with AgentOnboarding. */
const AGENT_ONB_STEP_KEY = {
    prefs: "profile",
    gmail: "accounts",
    extension: "extension",
};

export default function HapppyGtmOnboarding({
    isOpen,
    onClose,
    initialStep = "prefs",
    accountsFirst = false,
    onboardingStatus,
    onStatusChange,
    onFinish,
}) {
    const stepOrder = useMemo(
        () => getHapppyGtmStepOrder({ accountsFirst, desktop: isDesktopPc() }),
        [accountsFirst]
    );
    const [currentStep, setCurrentStep] = useState(initialStep);
    const currentStepIndex = stepOrder.indexOf(currentStep);

    useEffect(() => {
        if (!isOpen) return;
        setCurrentStep(initialStep || stepOrder[0] || "prefs");
    }, [isOpen, initialStep, stepOrder]);

    useEffect(() => {
        if (!isOpen) return;
        setOnboardingActivityUrlParam(
            accountsFirst ? ONBOARDING_URL_PARAM.CONNECT_ACCOUNTS : ONBOARDING_URL_PARAM.CREATE_PROFILE
        );
        trackHapppyGtmOutreachJourney(OUTREACH_JOURNEY_KEY_ONBOARDING_POP_OPENED);
        trackHappyAgentMixpanel("agent_onb_popup_opened").catch(() => {});
        trackHapppyGtm("happpy_gtm_drawer_opened", { step: initialStep || "prefs" });
        // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per drawer open, not when initialStep syncs
    }, [isOpen]);

    const applyResolvedStep = (resolved) => {
        if (resolved === "done") {
            if (typeof onFinish === "function") onFinish();
            return;
        }
        setCurrentStep(resolved);
    };

    const goToNextFrom = (fromStep) => {
        trackHappyAgentMixpanel("agent_onb_next_step", {
            from_step: AGENT_ONB_STEP_KEY[fromStep] || fromStep,
        }).catch(() => {});

        const completedParam = STEP_COMPLETED_URL_PARAM[fromStep];
        if (completedParam) {
            setOnboardingActivityUrlParam(completedParam);
        }

        if (fromStep === "extension") {
            if (typeof onFinish === "function") onFinish();
            return;
        }

        const nextStatus = applyHapppyGtmStepCompletion(onboardingStatus, fromStep);
        if (typeof onStatusChange === "function") {
            onStatusChange(nextStatus);
        }

        if (HAPPPY_GTM_DISABLE_AUTO_SKIP) {
            const idx = stepOrder.indexOf(fromStep);
            const next = idx >= 0 && idx + 1 < stepOrder.length ? stepOrder[idx + 1] : "done";
            applyResolvedStep(next);
            return;
        }

        applyResolvedStep(resolveHapppyGtmStep(nextStatus, { desktop: isDesktopPc() }));
    };

    const goToPrevStep = () => {
        trackHappyAgentMixpanel("agent_onb_prev_step", {
            from_step: AGENT_ONB_STEP_KEY[currentStep] || currentStep,
        }).catch(() => {});

        if (currentStepIndex > 0) {
            setCurrentStep(stepOrder[currentStepIndex - 1]);
        }
    };

    const handleClose = () => {
        trackHappyAgentMixpanel("agent_onb_drawer_closed", {
            step: AGENT_ONB_STEP_KEY[currentStep] || currentStep,
            redirected_to_dashboard: false,
        }).catch(() => {});
        trackHapppyGtm("happpy_gtm_drawer_closed", { step: currentStep });
        if (typeof onClose === "function") onClose();
    };

    const showBack = currentStepIndex > 0;

    const renderStep = () => {
        switch (currentStep) {
            case "gmail":
                return (
                    <HapppyGtmGmailStep
                        gmailConnected={!!onboardingStatus?.gmail_connected}
                        onAdvance={() => goToNextFrom("gmail")}
                        onBack={showBack ? goToPrevStep : undefined}
                    />
                );
            case "prefs":
                return (
                    <HapppyGtmPreferencesStep
                        onAdvance={() => goToNextFrom("prefs")}
                        onBack={showBack ? goToPrevStep : undefined}
                    />
                );
            case "extension":
                return (
                    <HapppyGtmExtensionStep
                        extensionDownloaded={!!onboardingStatus?.extension_downloaded}
                        onAdvance={() => goToNextFrom("extension")}
                        onBack={showBack ? goToPrevStep : undefined}
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
            portalClassName="agent-onb-portal happpy-gtm-onb-portal"
            overlayClassName="agent-onb-overlay"
            className="agent-onb-drawer"
            bodyOpenClassName="agent-onb-body-open happpy-gtm-onb-body-open"
            contentLabel="Happpy GTM onboarding"
            shouldCloseOnOverlayClick={false}
            shouldCloseOnEsc
        >
            <button type="button" className="agent-onb-close" onClick={handleClose} aria-label="Close onboarding">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {renderStep()}
        </Modal>
    );
}
