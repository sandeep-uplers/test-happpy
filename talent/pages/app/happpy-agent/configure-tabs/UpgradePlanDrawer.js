import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    refreshHapppyAgentPlans,
    tailorResumeCaptureOrder,
    tailorResumeCreateOrder,
} from '../../../../store/actions/resumeActions';
import {
    trackTailorPaymentSuccess,
    trackTailorPricePopupOpen,
} from '../../../../store/actions/trackingActions';
import { SET_LOADER, UPDATE_CURRENT_USER } from '../../../../store/actions/actionsTypes';
import {
    fetchHapppyAgentPlan,
    markHapppyAgentPlanRenewed,
} from '../../../../store/actions/UserActions';
import { trackHappyAgentMixpanel } from '../../../../store/actions/happyAgentTracking';
import { PlanCard, landingPlanCardProps, planCardReferralProps } from '../HappyPlanCards';
import '../HapppyConfigure.css';
import '../HapppySubscription.css';
import { IMAGE_URL } from '../../../../components/Constant';

const REFERRAL_REWARD_MASCOT_SRC = `${IMAGE_URL}outreach/mascot-celebrate.svg`;

const DRAWER_PLAN_ORDER = [3, 1];

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

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Plan picker drawer — Figma 28806:41118.
 * Mobile: bottom sheet (64px top gap, blurred backdrop). Desktop: right rail.
 * Opened from Outreach Mode when a free-trial user taps "Upgrade plan".
 */
const UpgradePlanDrawer = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;

    const [plans, setPlans] = useState({});
    const [pendingPlanId, setPendingPlanId] = useState(null);
    const referralDiscountPercent = Number(user?.happy_referral_total_discount) || 0;
    const hasReferralDiscount = referralDiscountPercent > 0;

    useEffect(() => {
        refreshHapppyAgentPlans()(dispatch);
    }, []);
    
    useEffect(() => {
        if (user?.agent_tailor_plans) {
            setPlans(user.agent_tailor_plans);
        }
    }, [user?.agent_tailor_plans]);

    useEffect(() => {
        if (!open) return undefined;
        trackTailorPricePopupOpen('configure_outreach_mode_drawer');
        trackHappyAgentMixpanel('agent_configure_mode_upgrade_drawer_opened').catch(() => {});
        return undefined;
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape' && !pendingPlanId) onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose, pendingPlanId]);

    const handlePaymentSuccess = useCallback(() => {
        dispatch(markHapppyAgentPlanRenewed());
        dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
        onClose();
    }, [dispatch, onClose]);

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
                    key: process.env.MIX_RAZORPAY_KEY_ID,
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
                                dispatch({
                                    type: UPDATE_CURRENT_USER,
                                    payload: {
                                        resume_tailored: captureResp?.data?.data,
                                    },
                                });
                                toast.success('Plan upgraded — welcome aboard!', { duration: 5000 });
                                handlePaymentSuccess();
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
                                /* best-effort cancel */
                            }
                            toast.error('Payment cancelled', { duration: 4000 });
                        },
                    },
                    prefill: {
                        name: orderResp?.notes?.name,
                        email: orderResp?.notes?.email,
                    },
                    notes: {},
                    theme: { color: '#231F20' },
                    config: {
                        display: {
                            preferences: { show_default_blocks: true },
                        },
                    },
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.open();
            } catch (error) {
                toast.error('An error occurred while processing the payment.', { duration: 5000 });
            } finally {
                setPendingPlanId(null);
                dispatch({ type: SET_LOADER, payload: false });
            }
        },
        [dispatch, handlePaymentSuccess, pendingPlanId, plans],
    );

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="hc-om-upgrade-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hc-om-upgrade-drawer-title"
        >
            <button
                type="button"
                className="hc-om-upgrade-drawer__backdrop"
                aria-label="Close plan picker"
                onClick={() => {
                    if (!pendingPlanId) onClose();
                }}
            />
            <aside
                className="hc-om-upgrade-drawer__panel job-agent-dashboard"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="hc-om-upgrade-drawer__close"
                    onClick={onClose}
                    disabled={!!pendingPlanId}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>

                <header className="hc-om-upgrade-drawer__head">
                    <h2 id="hc-om-upgrade-drawer-title" className="hc-om-upgrade-drawer__title">
                        Choose a plan that
                        <span className="hc-om-upgrade-drawer__title-line">works best for you!</span>
                    </h2>
                    <span className="hc-om-upgrade-drawer__underline" aria-hidden="true" />
                </header>

                <div className="hc-om-upgrade-drawer__body">
                    <div className="jad-sub-plan-grid hc-om-upgrade-drawer__grid">
                        {DRAWER_PLAN_ORDER.map((planId) => (
                            <PlanCard
                                key={planId}
                                planId={planId}
                                apiPlan={plans?.[planId]}
                                isPaidUserView={false}
                                pendingPlanId={pendingPlanId}
                                onPurchase={handlePurchase}
                                paidCtaLabel="Purchase Plan"
                                upgradeDrawer={true}
                                {...landingPlanCardProps(planId)}
                                {...planCardReferralProps(user, planId)}
                            />
                        ))}
                    </div>
                </div>

                {hasReferralDiscount ? (
                    <div className="hc-om-upgrade-drawer__referral-banner" role="status">
                        <img
                            className="hc-om-upgrade-drawer__referral-banner-mascot"
                            src={REFERRAL_REWARD_MASCOT_SRC}
                            alt=""
                            width={47}
                            height={40}
                            decoding="async"
                        />
                        <p className="hc-om-upgrade-drawer__referral-banner-text">
                            Congratulations! Your {referralDiscountPercent}% referral reward is ready
                            to be redeemed
                        </p>
                    </div>
                ) : null}
            </aside>
        </div>,
        document.body,
    );
};

export default UpgradePlanDrawer;
