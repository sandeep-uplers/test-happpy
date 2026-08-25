'use client';

/**
 * Shared chrome for onboarding steps that are not ported yet (2–5).
 * Matches the scroll body + sticky footer pattern used by Step 1 so the
 * drawer layout does not collapse when those steps are reached.
 */
export default function OnboardingStepStub({
    title,
    lede,
    ctaLabel,
    onAdvance,
    onBack,
    footerClassName = '',
}) {
    return (
        <>
            <div className="agent-onb-scroll" id="agentOnbScroll">
                <header className="agent-onb-step-header">
                    <h2 className="agent-onb-step-header__title">{title}</h2>
                    {lede ? <p className="agent-onb-step-header__lede">{lede}</p> : null}
                </header>
            </div>
            <div className={`agent-onb-footer ${footerClassName}`.trim()}>
                {typeof onBack === 'function' ? (
                    <button
                        type="button"
                        className="agent-onb-footer__back"
                        onClick={onBack}
                        aria-label="Back to previous step"
                    >
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : (
                    <span />
                )}
                <button
                    type="button"
                    className="agent-onb-footer__cta agent-onb-footer__cta--dark"
                    onClick={onAdvance}
                >
                    <span>{ctaLabel}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                        <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </>
    );
}
