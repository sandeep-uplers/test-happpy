'use client';

import OnboardingStepStub from './OnboardingStepStub';
import './AgentOnboarding.css';

/**
 * Step 2 — "Create your profile"
 *
 * Placeholder. The ATS version wraps JobAgentManagePreferences (~2k lines)
 * and is deferred from this port.
 */
export default function Step2ProfileCreation({ onAdvance, onBack }) {
    return (
        <OnboardingStepStub
            title="Create your profile"
            lede="This step is coming next. Continue to keep walking through the onboarding drawer."
            ctaLabel="Save & continue"
            onAdvance={onAdvance}
            onBack={onBack}
            footerClassName="agent-onb-footer--profile"
        />
    );
}
