'use client';

import OnboardingStepStub from './OnboardingStepStub';
import './AgentOnboarding.css';

/**
 * Step 3 — "Download Browser Extension"
 *
 * Placeholder. The ATS version talks to the Chrome Web Store and the
 * extension-engagement endpoint.
 */
export default function Step3ExtensionInstall({ onAdvance, onBack }) {
    return (
        <OnboardingStepStub
            title="Download the browser extension"
            lede="This step is coming next. Continue to keep walking through the onboarding drawer."
            ctaLabel="Next step"
            onAdvance={onAdvance}
            onBack={onBack}
        />
    );
}
