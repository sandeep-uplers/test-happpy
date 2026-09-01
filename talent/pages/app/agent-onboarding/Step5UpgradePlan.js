'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    tailorResumeCaptureOrder,
    tailorResumeCreateOrder,
} from '../../../store/actions/resumeActions';
import {
    trackTailorPaymentSuccess,
    trackTailorPricePopupOpen,
} from '../../../store/actions/trackingActions';
import { SET_LOADER, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';
import { DISPLAY_ORDER, PlanCard, landingPlanCardProps, planCardReferralProps } from '../happpy-agent/HappyPlanCards';
import { HAPPPY_RAZORPAY_THEME_COLOR } from '../linkedin/happyAgentPageAssets';
import '../happpy-agent/HapppySubscription.css';

/**
 * Step 5 (side-step) — "Choose a plan that works best for you!"
 *
 * Branches off Step 4 when the user clicks "Upgrade plan" in the mascot
 * tooltip. NOT part of the linear STEPS array — entered via `onUpgrade`
 * from Step 4, exited via the circular back arrow which returns the user
 * to mode selection (NOT the templates step).
 *
 * Only shown to non-paid users (free trial). Plan cards reuse the shared
 * {@link PlanCard} renderer from HappyPlanCards.js — same surface as
 * HapppySubscription and TailorPaymentScreen.
 *
 * Props
 *  - onBack:             () => void — returns to Step 4.
 *  - onPaymentSuccess:   () => void — invoked after a captured Razorpay
 *                        payment so the parent can refresh status + auto-
 *                        return the user to Step 4.
 */

/** Load Razorpay's checkout script on demand — copied verbatim from
 *  TailorPaymentScreen so both flows behave identically. */
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

const Step5UpgradePlan = ({ onBack, onPaymentSuccess }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;
    const [plans, setPlans] = useState({});
    const [pendingPlanId, setPendingPlanId] = useState(null);

    useEffect(() => {
        if (user?.agent_tailor_plans) {
            setPlans(user.agent_tailor_plans);
        }
    }, [user?.agent_tailor_plans]);

    useEffect(() => {
        // Reuse the existing pricing-popup analytic so funnel reporting stays
        // consistent with the resume drawer surface.
        trackTailorPricePopupOpen('agent_onboarding_drawer');
        trackHappyAgentMixpanel('agent_onb_upgrade_screen_opened').catch(() => {});
    }, []);

    /** Free-trial users reach this screen from Step 4 — the ₹0 trial slot
     *  is always "Current Plan" unless the API injects the paid Try It Out
     *  card at id 4, in which case PlanCard handles it as a purchase CTA. */
    const trialCta = useMemo(
        () => ({ label: 'Current Plan', disabled: true, onClick: null }),
        [],
    );

    const handlePurchase = useCallback(
        async (planId) => {
            if (pendingPlanId) return;
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
                                'Error while creating order. Please try again.',
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
                            const captureResp = await tailorResumeCaptureOrder(
                                capturePayload,
                                false,
                            )(dispatch);
                            if (captureResp?.status === 200) {
                                trackTailorPaymentSuccess({ plan_id: planId });
                                trackHappyAgentMixpanel('agent_onb_upgrade_payment_success', {
                                    plan_id: planId,
                                }).catch(() => {});
                                dispatch({
                                    type: UPDATE_CURRENT_USER,
                                    payload: {
                                        resume_tailored: captureResp?.data?.data,
                                    },
                                });
                                toast.success('Plan upgraded — welcome aboard!', {
                                    duration: 5000,
                                });
                                if (typeof onPaymentSuccess === 'function') onPaymentSuccess();
                            }
                        } catch (err) {
                            toast.error(
                                err?.response?.data?.message ||
                                    'Something went wrong while capturing the order.',
                                { duration: 5000 },
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
                            } catch (e) {
                                // best-effort cancel — don't surface to user
                            }
                            toast.error('Payment cancelled', { duration: 4000 });
                        },
                    },
                    prefill: {
                        name: orderResp?.notes?.name,
                        email: orderResp?.notes?.email,
                    },
                    notes: {},
                    theme: { color: HAPPPY_RAZORPAY_THEME_COLOR },
                    config: {
                        display: {
                            preferences: { show_default_blocks: true },
                        },
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } catch (error) {
                toast.error('An error occurred while processing the payment.', {
                    duration: 5000,
                });
            } finally {
                setPendingPlanId(null);
                dispatch({ type: SET_LOADER, payload: false });
            }
        },
        [dispatch, onPaymentSuccess, pendingPlanId, plans],
    );

    return (
        <>
            <div className="agent-onb-scroll">
                <header className="agent-onb-step-header" style={{ marginBottom: '56px' }}>
                    <h2 className="agent-onb-step-header__title upgrade-title">
                        Choose a plan that{' '}
                        <span className="agent-onb-step-header__lede-strong in-block">
                            works best for you!
                        </span>
                    </h2>
                </header>

                <div className="job-agent-dashboard agent-onb-upgrade-plans">
                    <div className="jad-subscription jad-subscription--choose">
                        <div className="jad-sub-plan-grid">
                            {DISPLAY_ORDER.filter(planId => planId !== 4).map((planId) => (
                                <PlanCard
                                    key={planId}
                                    planId={planId}
                                    apiPlan={plans?.[planId]}
                                    isPaidUserView={false}
                                    pendingPlanId={pendingPlanId}
                                    trialCta={trialCta}
                                    onPurchase={handlePurchase}
                                    paidCtaLabel="Purchase Plan"
                                    {...landingPlanCardProps(planId)}
                                    {...planCardReferralProps(user, planId)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="agent-onb-footer">
                <button
                    type="button"
                    className="agent-onb-footer__back"
                    onClick={onBack}
                    aria-label="Back to mode selection"
                    disabled={!!pendingPlanId}
                >
                    <svg
                        width="33"
                        height="33"
                        viewBox="0 0 33 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M25.9668 16.4004H6.83346"
                            stroke="#231F20"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663"
                            stroke="#231F20"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <span className="agent-onb-footer__spacer" aria-hidden="true" />
            </div>
        </>
    );
};

export default Step5UpgradePlan;
