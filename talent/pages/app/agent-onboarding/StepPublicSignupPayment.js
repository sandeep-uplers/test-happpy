'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    isTalentApiSuccess,
    payHappyAgentPublicTrial,
    publicSignupPaymentComplete,
} from '../../../helpers/happyAgentPublicTrialPayment';
import { getProfilePercent } from '../../../store/actions/UserActions';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';
import {
    tailorResumeCaptureOrder,
    tailorResumeCreateOrder,
} from '../../../store/actions/resumeActions';
import { trackTailorPaymentSuccess, trackTailorPricePopupOpen } from '../../../store/actions/trackingActions';
import { SET_LOADER, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import { getPlanReferralPricing, planCardReferralProps } from '../happpy-agent/HappyPlanCards';
import {
    ONBOARDING_URL_PARAM,
    setOnboardingActivityUrlParam,
} from '../../../helpers/onboardingUrlParams';

/** Full-plan upsell on this step — off for now (1mo / 3mo cards, divider, footnote). */
const SHOW_PAID_PLAN_UPSELL = false;

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const TRIAL_FEATURES = [
    'Agent runs until your first positive reply',
    '4 jobs a day · 4 people found inside each company',
    'Personalised outreach from your own Gmail and LinkedIn',
    'Auto follow-up after 2 days - which you can configure to your wish',
];

const FULL_PLAN_FEATURES = [
    'Everything in trial',
    'Increased agent run limit to 8 jobs a day',
    'Unlimited resume healthcheck and transformation',
];

const PUBLIC_FULL_PLANS = [
    {
        planId: 1,
        tag: '1 MONTH',
        saveBadge: null,
        featured: false,
        fallbackPrice: '₹1,999',
        fallbackSubtitle: 'per month',
    },
    {
        planId: 3,
        tag: '3 MONTHS',
        saveBadge: 'SAVE 17%',
        featured: true,
        fallbackPrice: '₹4,999',
        fallbackSubtitle: '₹1,666 a month',
    },
];

function PublicFullPlanCard({
    config,
    apiPlan,
    referralProps,
    pendingPlanId,
    onChoose,
}) {
    const { planId, tag, saveBadge, featured, fallbackPrice, fallbackSubtitle } = config;
    const pricing = getPlanReferralPricing({
        planId,
        apiPlan,
        copy: { priceSubtitle: fallbackSubtitle },
        ...referralProps,
    });

    const priceText = apiPlan ? pricing.priceText : fallbackPrice;
    const priceSubtitle = apiPlan ? pricing.priceSubtitle : fallbackSubtitle;
    const badge =
        pricing.titleBadge ||
        (pricing.hasReferralDiscount ? `${pricing.referralDiscountPercent}% referral discount` : saveBadge);
    const isLoading = pendingPlanId === planId;
    const disabled = !!pendingPlanId;

    return (
        <article
            className={[
                'agent-onb-public-pay__plan',
                featured ? 'agent-onb-public-pay__plan--featured' : '',
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="agent-onb-public-pay__plan-head">
                <p className="agent-onb-public-pay__plan-tag">{tag}</p>
                {badge ? <span className="agent-onb-public-pay__plan-chip">{badge}</span> : null}
            </div>
            <div className="agent-onb-public-pay__plan-price">
                <p className="agent-onb-public-pay__plan-amount">{priceText}</p>
                {pricing.showReferralPriceCompare ? (
                    <p className="agent-onb-public-pay__plan-compare">
                        <span className="agent-onb-public-pay__plan-compare-old">
                            ₹{pricing.originalListPrice}
                        </span>
                        {priceSubtitle}
                    </p>
                ) : (
                    <p className="agent-onb-public-pay__plan-sub">{priceSubtitle}</p>
                )}
            </div>
            <ul className="agent-onb-public-pay__plan-features">
                {FULL_PLAN_FEATURES.map((line) => (
                    <li key={line}>
                        <span className="agent-onb-public-pay__check agent-onb-public-pay__check--dark" aria-hidden>
                            ✓
                        </span>
                        <span>{line}</span>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className={[
                    'agent-onb-public-pay__plan-cta',
                    featured ? 'agent-onb-public-pay__plan-cta--primary' : '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                disabled={disabled}
                onClick={() => onChoose(planId)}
            >
                {isLoading ? 'Opening checkout…' : 'CHOOSE PLAN'}
            </button>
        </article>
    );
}

/**
 * Public-signup onboarding step — ₹99 trial or full plan before profile setup (Figma 3628:33186).
 */
const StepPublicSignupPayment = ({ onAdvance, onBack, onClose, showBack }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;
    const [plans, setPlans] = useState({});
    const [pendingPlanId, setPendingPlanId] = useState(null);
    const [trialCheckoutLoading, setTrialCheckoutLoading] = useState(false);
    const [paidConfirmed, setPaidConfirmed] = useState(() => publicSignupPaymentComplete(user));

    useEffect(() => {
        if (user?.agent_tailor_plans) {
            setPlans(user.agent_tailor_plans);
        }
    }, [user?.agent_tailor_plans]);

    useEffect(() => {
        trackTailorPricePopupOpen('agent_onboarding_public_signup');
        trackHappyAgentMixpanel('agent_onb_public_payment_opened').catch(() => {});
    }, []);

    useEffect(() => {
        if (publicSignupPaymentComplete(user)) {
            setPaidConfirmed(true);
        }
    }, [user]);

    const advanceAfterPayment = useCallback(async () => {
        setPaidConfirmed(true);
        await getProfilePercent(false)(dispatch).catch(() => {});
        setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.TRIAL_STARTED);
    }, [dispatch]);

    const checkoutBusy = trialCheckoutLoading || !!pendingPlanId;

    const handleTrialPay = useCallback(async () => {
        if (paidConfirmed || checkoutBusy) return;
        setTrialCheckoutLoading(true);
        trackHappyAgentMixpanel('agent_onb_public_trial_checkout_started').catch(() => {});
        const ok = await payHappyAgentPublicTrial(dispatch, user);
        setTrialCheckoutLoading(false);
        if (ok) {
            trackHappyAgentMixpanel('agent_onb_public_trial_payment_success').catch(() => {});
            await advanceAfterPayment();
        }
    }, [advanceAfterPayment, checkoutBusy, dispatch, paidConfirmed, user]);

    const trialCtaLabel = useMemo(() => {
        if (paidConfirmed) return 'Trial started';
        if (trialCheckoutLoading) return 'Opening checkout…';
        return 'PAY ₹99 AND START AGENT';
    }, [paidConfirmed, trialCheckoutLoading]);

    const trialCtaLabelMobile = useMemo(() => {
        if (paidConfirmed) return 'Trial started';
        if (trialCheckoutLoading) return 'Opening checkout…';
        return 'PAY ₹99 AND START';
    }, [paidConfirmed, trialCheckoutLoading]);

    const handlePurchase = useCallback(
        async (planId) => {
            if (pendingPlanId || trialCheckoutLoading) return;
            if (!plans?.[planId]) {
                toast.error('Plan unavailable. Please refresh and try again.');
                return;
            }
            setPendingPlanId(planId);
            dispatch({ type: SET_LOADER, payload: true });

            try {
                const razorpayLoaded = await loadRazorpayScript();
                if (!razorpayLoaded) {
                    toast.error('Razorpay SDK failed to load. Are you online?');
                    return;
                }

                const orderResp = await tailorResumeCreateOrder({ plan_id: planId })(dispatch)
                    .then((res) => res?.data?.data)
                    .catch((err) => {
                        toast.error(
                            err?.response?.data?.message ||
                                'Error while creating order. Please try again.'
                        );
                        return null;
                    });

                if (!orderResp) return;
                const { id: order_id, amount, currency } = orderResp;

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: amount.toString(),
                    currency,
                    name: orderResp?.notes?.name,
                    order_id,
                    handler: async (response) => {
                        const capturePayload = {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            order_id,
                            payment_completed: true,
                        };
                        try {
                            const captureResp = await tailorResumeCaptureOrder(capturePayload, false)(dispatch);
                            if (isTalentApiSuccess(captureResp)) {
                                trackTailorPaymentSuccess({ plan_id: planId });
                                trackHappyAgentMixpanel('agent_onb_public_upgrade_payment_success', {
                                    plan_id: planId,
                                }).catch(() => {});
                                dispatch({
                                    type: UPDATE_CURRENT_USER,
                                    payload: {
                                        resume_tailored: captureResp?.data?.data,
                                    },
                                });
                                toast.success('Plan activated — welcome aboard!', { duration: 5000 });
                                await advanceAfterPayment();
                            } else {
                                toast.error(
                                    captureResp?.data?.message || 'Payment verification failed.',
                                    { duration: 5000 }
                                );
                            }
                        } catch (err) {
                            toast.error(
                                err?.response?.data?.message ||
                                    'Something went wrong while capturing the order.',
                                { duration: 5000 }
                            );
                        }
                    },
                    modal: {
                        escape: false,
                        ondismiss: async () => {
                            try {
                                await tailorResumeCaptureOrder({
                                    order_id,
                                    payment_completed: false,
                                })(dispatch);
                            } catch {
                                /* best-effort */
                            }
                            toast.error('Payment cancelled', { duration: 4000 });
                        },
                    },
                    prefill: {
                        name: orderResp?.notes?.name,
                        email: orderResp?.notes?.email,
                    },
                    theme: { color: '#231F20' },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } catch {
                toast.error('An error occurred while processing the payment.', { duration: 5000 });
            } finally {
                setPendingPlanId(null);
                dispatch({ type: SET_LOADER, payload: false });
            }
        },
        [advanceAfterPayment, dispatch, pendingPlanId, plans, trialCheckoutLoading]
    );

    const whyBlock = (
        <div className="agent-onb-public-pay__why">
            <div className="agent-onb-public-pay__why-copy">
                <p className="agent-onb-public-pay__why-title">Why we charge ₹99</p>
                <p className="agent-onb-public-pay__why-body">
                    Every message the agent sends lands in a real person&apos;s inbox. When it was free, people ran it on
                    useless jobs they didn&apos;t want, and recruiters/hiring managers stopped replying to everyone.
                </p>
                <p className="agent-onb-public-pay__why-foot">
                    ₹99 is a filter. It costs enough that you only run it on jobs you actually want.
                </p>
            </div>
        </div>
    );

    return (
        <div className="agent-onb-public-pay-step">
            <div className="agent-onb-scroll agent-onb-scroll--public-payment">
                <div className="agent-onb-public-pay">
                    <section className="agent-onb-public-pay__hero" aria-labelledby="agent-onb-public-pay-title">
                        <div className="agent-onb-public-pay__hero-card">
                            <div className="agent-onb-public-pay__hero-head">
                                <p id="agent-onb-public-pay-title" className="agent-onb-public-pay__hero-lede">
                                    Start your agent for just
                                </p>
                                {onClose ? (
                                    <button
                                        type="button"
                                        className="agent-onb-public-pay__hero-close"
                                        onClick={onClose}
                                        aria-label="Close"
                                    >
                                        ✕
                                    </button>
                                ) : null}
                            </div>
                            <div className="agent-onb-public-pay__hero-price">
                                <span className="agent-onb-public-pay__hero-amount">₹99</span>
                                <span className="agent-onb-public-pay__hero-badge">Trial</span>
                            </div>
                            <ul className="agent-onb-public-pay__hero-features">
                                {TRIAL_FEATURES.map((line) => (
                                    <li key={line}>
                                        <span className="agent-onb-public-pay__check" aria-hidden>
                                            ✓
                                        </span>
                                        <span>{line}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="agent-onb-public-pay__hero-note">
                                <span className="agent-onb-public-pay__hero-note--desktop">
                                    No auto-renew. No card stored. Nothing charged again unless you choose a plan.
                                </span>
                                <span className="agent-onb-public-pay__hero-note--mobile">
                                    No auto-renew · No card stored · Nothing charged again
                                </span>
                            </p>
                        </div>
                        {whyBlock}
                    </section>

                    <button
                        type="button"
                        className="agent-onb-public-pay__trial-cta agent-onb-public-pay__trial-cta--inline"
                        onClick={handleTrialPay}
                        disabled={paidConfirmed || checkoutBusy}
                    >
                        {trialCtaLabel}
                    </button>

                    {SHOW_PAID_PLAN_UPSELL ? (
                        <>
                            <div className="agent-onb-public-pay__divider" role="presentation">
                                <span className="agent-onb-public-pay__divider-line" />
                                <span className="agent-onb-public-pay__divider-text">
                                    or skip ahead to a full plan
                                </span>
                                <span className="agent-onb-public-pay__divider-line" />
                            </div>

                            <div className="agent-onb-public-pay__plans">
                                {PUBLIC_FULL_PLANS.map((config) => (
                                    <PublicFullPlanCard
                                        key={config.planId}
                                        config={config}
                                        apiPlan={plans?.[config.planId]}
                                        referralProps={planCardReferralProps(user, config.planId)}
                                        pendingPlanId={pendingPlanId}
                                        onChoose={handlePurchase}
                                    />
                                ))}
                            </div>

                            <p className="agent-onb-public-pay__footnote">
                                Already paid ₹99? It is adjusted against your first plan.
                            </p>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="agent-onb-public-pay__sticky-foot" aria-label="Payment actions">
                <div className="agent-onb-public-pay__sticky-row">
                    {showBack ? (
                        <button
                            type="button"
                            className="agent-onb-footer__back agent-onb-public-pay__sticky-back"
                            onClick={onBack}
                            aria-label="Back to previous step"
                            disabled={checkoutBusy}
                        >
                            <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ) : null}
                    {paidConfirmed ? (
                        <button
                            type="button"
                            className="agent-onb-public-pay__sticky-next"
                            onClick={onAdvance}
                            disabled={checkoutBusy}
                        >
                            <span>Next step</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="agent-onb-public-pay__trial-cta agent-onb-public-pay__trial-cta--sticky"
                            onClick={handleTrialPay}
                            disabled={checkoutBusy}
                        >
                            <span className="agent-onb-public-pay__trial-cta-label agent-onb-public-pay__trial-cta-label--desktop">
                                {trialCtaLabel}
                            </span>
                            <span className="agent-onb-public-pay__trial-cta-label agent-onb-public-pay__trial-cta-label--mobile">
                                {trialCtaLabelMobile}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            <div className="agent-onb-footer agent-onb-footer--public-payment">
                {showBack ? (
                    <button
                        type="button"
                        className="agent-onb-footer__back"
                        onClick={onBack}
                        aria-label="Back to account connection"
                        disabled={checkoutBusy}
                    >
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : (
                    <span className="agent-onb-footer__spacer" aria-hidden="true" />
                )}
                <button
                    type="button"
                    className="agent-onb-footer__cta"
                    onClick={onAdvance}
                    disabled={!paidConfirmed || checkoutBusy}
                >
                    <span>Next step</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StepPublicSignupPayment;
