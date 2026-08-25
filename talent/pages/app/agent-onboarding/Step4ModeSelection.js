'use client';

import OnboardingStepStub from './OnboardingStepStub';
import './AgentOnboarding.css';

/**
 * Step 4 — "Choose your outreach mode"
 *
 * Placeholder. The ATS version persists Auto / Manual and can branch into
 * the upgrade-plan side-step via onUpgrade.
 */
export default function Step4ModeSelection({ onAdvance, onBack }) {
    return (
        <OnboardingStepStub
            title="Choose your outreach mode"
            lede="This step is coming next. Continue to finish the onboarding drawer."
            ctaLabel="Complete agent set up"
            onAdvance={onAdvance}
            onBack={onBack}
        />
    );
}
