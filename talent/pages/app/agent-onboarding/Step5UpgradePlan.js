'use client';

import OnboardingStepStub from './OnboardingStepStub';
import './AgentOnboarding.css';

/**
 * Step 5 (side-step) — upgrade plan
 *
 * Placeholder. The ATS version renders HappyPlanCards and Razorpay checkout.
 */
export default function Step5UpgradePlan({ onBack, onPaymentSuccess }) {
    return (
        <OnboardingStepStub
            title="Choose a plan that works best for you"
            lede="Plan selection is not wired in this port yet. Go back to mode selection."
            ctaLabel="Back to mode"
            onAdvance={onPaymentSuccess || onBack}
            onBack={onBack}
        />
    );
}
