'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    refreshHapppyAgentPlans,
    tailorResumeCaptureOrder,
    tailorResumeCreateOrder,
} from '../../../store/actions/resumeActions';
import {
    trackTailorPaymentSuccess,
    trackTailorPricePopupOpen,
} from '../../../store/actions/trackingActions';
import { SET_LOADER, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import {
    fetchHapppyAgentPlan,
    markHapppyAgentPlanRenewed,
} from '../../../store/actions/UserActions';
import JobAgentPayments from '../job-agent/JobAgentPayments';
import '../linkedin/OutreachAgent.css';
import './HapppySubscription.css';
import {
    CheckIcon,
    DISPLAY_ORDER,
    PLAN_COPY,
    PlanCard,
    getPlanReferralPricing,
    landingPlanCardProps,
    planCardReferralProps,
} from './HappyPlanCards';
import { API_OUTREACH_AGENT_PLANS, IMAGE_URL } from '../../../components/Constant';
import { GET_API } from '../../../components/Helper';
import { HAPPY_PRICING_RIBBON_STAR_SRC, HAPPPY_RAZORPAY_THEME_COLOR } from '../linkedin/happyAgentPageAssets';

const REFERRAL_REWARD_MASCOT_SRC = `${IMAGE_URL}outreach/mascot-celebrate.svg`;

function ActiveBadgeCheck() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="jad-sub-current__pill-check"
        >
            <circle cx="6" cy="6" r="6" fill="#2c7a4b" />
            <path
                d="M3.5 6.2l1.7 1.6L8.7 4.4"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function formatPlanEndDate(raw) {
    if (raw == null || raw === '') return null;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Mirror TailorPaymentScreen / Step5UpgradePlan — load Razorpay's checkout script lazily so the
 *  bundle stays small and the page renders before the SDK is fetched. */
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

/**
 * AgentJ — subscription surface aligned with the Figma designs.
 *  - Active paid plan → "Your current plan" card + read-only reference plans.
 *  - Trial / expired / no plan → "Choose a plan that works best for you!" with a 3-card grid.
 *
 * Razorpay flow is a thin wrapper around the same `tailorResumeCreateOrder` /
 * `tailorResumeCaptureOrder` actions used by {@link TailorPaymentScreen} so successful payments
 * flip the user's plan the same way they do from the resume drawer.
 */
const HapppySubscription = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;

    /** Single source of truth for plan status — store/reducers/happpyAgentReducer.js.
     *  Same slice the AgentJ layout subscribes to, so a refresh / payment-success here
     *  also updates the sidebar pill ("Renew Plan" → "My Plan") and topnav badge
     *  ("Plan expired" → "Happpy agent · Paid") without a hard reload. */
    const happpyAgent = useSelector((state) => state.happpyAgent);
    const [plans, setPlans] = useState({});
    const [pendingPlanId, setPendingPlanId] = useState(null);
    const autoCheckoutTriggeredRef = useRef(false);
    const referralDiscountPercent = Number(user?.happy_referral_total_discount) || 0;
    const hasReferralDiscount = referralDiscountPercent > 0;

    useEffect(() => {
        if (user?.agent_tailor_plans) {
            setPlans(user.agent_tailor_plans);
        }
    }, [user?.agent_tailor_plans]);

    useEffect(() => {
        refreshHapppyAgentPlans()(dispatch);
    }, []);

    useEffect(() => {
        trackTailorPricePopupOpen('happy_subscription_page');
    }, []);

    useEffect(() => {
        dispatch(fetchHapppyAgentPlan());
    }, [dispatch]);

    /** Spinner only while the slice has never loaded; subsequent silent refreshes
     *  (e.g. after payment) don't flip this back to true. */
    const isInitialLoading = happpyAgent.loading && !happpyAgent.loaded;

    const planNumber = Number(happpyAgent.plan);
    const isFreeTrialPlan = planNumber === 1;
    const isPaidPlan = planNumber === 2;
    const hasPlanExpired = !!happpyAgent.has_plan_expired;
    const hasActivePaidSubscription = isPaidPlan && !hasPlanExpired;
    const isNoPlan = happpyAgent.plan == null || happpyAgent.plan === '';

    const planEndFormatted = formatPlanEndDate(happpyAgent.plan_end_date);

    const handleTailorPaymentSuccess = useCallback(() => {
        /** Optimistic flip + silent forced refresh — see markHapppyAgentPlanRenewed.
         *  Avoids the brief "Plan expired" flash on the sidebar/topnav while the
         *  backend recomputes plan status after capture. */
        dispatch(markHapppyAgentPlanRenewed());
    }, [dispatch]);

    const startFreeTrial = () => {
        navigate('/talent/job-agent/configure');
    };

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
                                dispatch({
                                    type: UPDATE_CURRENT_USER,
                                    payload: {
                                        resume_tailored: captureResp?.data?.data,
                                    },
                                });
                                toast.success('Plan upgraded — welcome aboard!', { duration: 5000 });
                                handleTailorPaymentSuccess();
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
                                /* best-effort cancel — don't surface to user */
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
                toast.error('An error occurred while processing the payment.', { duration: 5000 });
            } finally {
                setPendingPlanId(null);
                dispatch({ type: SET_LOADER, payload: false });
            }
        },
        [dispatch, handleTailorPaymentSuccess, pendingPlanId, plans],
    );

    /**
     * Auto-open checkout when arriving with ?plan=1|3|4 (e.g. conversion discount claim).
     * Clears the query after triggering so refresh does not re-open Razorpay.
     */
    useEffect(() => {
        if (autoCheckoutTriggeredRef.current || pendingPlanId) return;

        const planParam = searchParams.get('plan') || searchParams.get('plan_id');
        const planId = Number(planParam);
        if (![1, 3, 4].includes(planId)) return;
        if (!plans?.[planId]) return;

        const planNumber = Number(happpyAgent.plan);
        const hasActivePaid =
            planNumber === 2 && !happpyAgent.has_plan_expired;
        if (hasActivePaid) {
            autoCheckoutTriggeredRef.current = true;
            const next = new URLSearchParams(searchParams);
            next.delete('plan');
            next.delete('plan_id');
            setSearchParams(next, { replace: true });
            return;
        }

        autoCheckoutTriggeredRef.current = true;
        const next = new URLSearchParams(searchParams);
        next.delete('plan');
        next.delete('plan_id');
        setSearchParams(next, { replace: true });
        handlePurchase(planId);
    }, [
        searchParams,
        setSearchParams,
        plans,
        pendingPlanId,
        handlePurchase,
        happpyAgent.plan,
        happpyAgent.has_plan_expired,
    ]);

    /**
     * Decide which CTA to render on the local ₹0 trial fallback card. Only
     * applies when the API has NOT returned `plans[4]` (otherwise the slot is
     * rendered as the regular ₹499 "Try It Out" paid card with a normal
     * purchase CTA). Behaviour by state:
     *  - No plan yet         → "Start Free Trial" (navigates to configure)
     *  - Active free trial   → disabled "Current Plan"
     *  - Trial expired       → disabled "Trial Ended"
     *  - Active paid / paid-expired → trial fallback hidden (returns null below)
     */
    const trialCtaState = useMemo(() => {
        if (isPaidPlan) return null;
        if (isFreeTrialPlan && hasPlanExpired) {
            return { label: 'Trial Ended', disabled: true, onClick: null };
        }
        if (isFreeTrialPlan) {
            return { label: 'Current Plan', disabled: true, onClick: null };
        }
        if (isNoPlan) {
            return { label: 'Start Free Trial', disabled: false, onClick: startFreeTrial };
        }
        return { label: 'Current Plan', disabled: true, onClick: null };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFreeTrialPlan, isPaidPlan, hasPlanExpired, isNoPlan]);

    /** Read-only reference plan card — used in the active-paid view so the user can see all plans
     *  without any purchase CTAs. */
    const renderReferencePlanCard = (planId) => {
        const copy = PLAN_COPY[planId];
        if (!copy) return null;
        if (planId === 4) return null;
        const planData = plans?.[planId];
        const { referralDiscountPercent: planReferralPercent, originalPlan } =
            planCardReferralProps(user, planId);
        const {
            hasReferralDiscount,
            originalListPrice,
            showReferralPriceCompare,
            priceText,
            priceSubtitle,
            commitmentNote,
            titleBadge,
        } = getPlanReferralPricing({
            planId,
            apiPlan: planData,
            copy,
            referralDiscountPercent: planReferralPercent,
            originalPlan,
        });

        return (
            <article
                key={planId}
                className={`jad-sub-ref-card${hasReferralDiscount ? ' jad-sub-ref-card--referral-discount' : ''
                    }`}
                aria-label={copy.title}
            >
                {copy.ribbon && (
                    <span className="jad-sub-ref-card__ribbon">
                        <img
                            className="jad-sub-plan-card__ribbon-star"
                            src={HAPPY_PRICING_RIBBON_STAR_SRC}
                            alt=""
                            aria-hidden="true"
                        />
                        {copy.ribbon}
                    </span>
                )}
                <div className="jad-sub-ref-card__head">
                    <div className="jad-sub-ref-card__title-row">
                        <h3 className="jad-sub-ref-card__title">{copy.title}</h3>
                        {titleBadge ? (
                            <span
                                className={`jad-sub-ref-card__save-badge${hasReferralDiscount
                                        ? ' jad-sub-ref-card__save-badge--referral'
                                        : ''
                                    }`}
                            >
                                {titleBadge}
                            </span>
                        ) : null}
                    </div>
                    <div
                        className={`jad-sub-ref-card__price-row${showReferralPriceCompare
                                ? ' jad-sub-ref-card__price-row--referral'
                                : ''
                            }`}
                    >
                        <span className="jad-sub-ref-card__price">
                            {priceText}
                            {!showReferralPriceCompare && (
                                <span aria-hidden="true">/</span>
                            )}
                        </span>
                        {showReferralPriceCompare ? (
                            <span className="jad-sub-ref-card__price-original">
                                ₹{originalListPrice}
                            </span>
                        ) : null}
                        {priceSubtitle ? (
                            <span className="jad-sub-ref-card__price-sub">{priceSubtitle}</span>
                        ) : null}
                    </div>
                    {commitmentNote && (
                        <span className="jad-sub-ref-card__price-commitment">
                            {commitmentNote}
                        </span>
                    )}
                </div>
                <p className="jad-sub-ref-card__desc">{copy.description}</p>
                <ul className="jad-sub-ref-card__features">
                    {copy.features.map((feature) => (
                        <li key={feature} className="jad-sub-ref-card__feature">
                            <CheckIcon className="jad-sub-ref-card__check" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </article>
        );
    };

    useEffect(() => {
        document.title = 'Subscription | AgentJ | Uplers';
    }, []);

    return (
        <>
            <div className="outreach-container job-agent-subscription-page job-agent-subscription-page--tailor-pay">
                <header className="jad-sub-page-head">
                    <button
                        type="button"
                        className="jad-sub-back"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <span className="material-symbols-outlined" aria-hidden>
                            arrow_back
                        </span>
                    </button>
                    {!isInitialLoading && (
                        <h1 className="jad-sub-page-title">
                            {hasActivePaidSubscription
                                ? 'Your current plan'
                                : 'Choose a plan that works best for you!'}
                        </h1>
                    )}
                </header>

                {hasReferralDiscount && !isInitialLoading ? (
                    <div className="jad-sub-referral-banner" role="status">
                        <img
                            className="jad-sub-referral-banner__mascot"
                            src={REFERRAL_REWARD_MASCOT_SRC}
                            alt=""
                            width={47}
                            height={40}
                            decoding="async"
                        />
                        <p className="jad-sub-referral-banner__text">
                            Congratulations! Your {referralDiscountPercent}% referral reward is
                            ready to be redeemed
                        </p>
                    </div>
                ) : null}

                {isInitialLoading ? (
                    <div
                        className="jad-subscription-fetch-state"
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                    >
                        <div className="jad-subscription-fetch-state__spinner" aria-hidden />
                        <p className="jad-subscription-fetch-state__text">Loading plans…</p>
                    </div>
                ) : hasActivePaidSubscription ? (
                    /* ---------- Design 1: active paid plan ---------- */
                    <div className="jad-subscription jad-subscription--active">

                        <section
                            className="jad-sub-current"
                            aria-labelledby="jad-sub-current-heading"
                        >
                            <div className="jad-sub-current__row">
                                <div className="jad-sub-current__text">
                                    <h2
                                        id="jad-sub-current-heading"
                                        className="jad-sub-current__plan-name"
                                    >
                                        Paid Plan
                                    </h2>
                                    {planEndFormatted && (
                                        <p className="jad-sub-current__date">
                                            Valid till{' '}
                                            <time
                                                dateTime={String(happpyAgent.plan_end_date)}
                                            >
                                                {planEndFormatted}
                                            </time>
                                        </p>
                                    )}
                                </div>
                                <span className="jad-sub-current__pill">
                                    <ActiveBadgeCheck />
                                    Current plan- Active
                                </span>
                            </div>
                        </section>

                        <p className="jad-sub-section-lede">
                            See all our plans for your future reference
                        </p>

                        <div className="jad-sub-ref-grid">
                            {DISPLAY_ORDER.filter((id) => id !== 4).map(renderReferencePlanCard)}
                        </div>
                    </div>
                ) : (
                    /* ---------- Design 2: choose a plan (trial / expired / no plan) ---------- */
                    <div className="jad-subscription jad-subscription--choose">
                        {hasPlanExpired && (
                            <p className="jad-sub-expired-note" role="status">
                                {isFreeTrialPlan
                                    ? 'Your free trial has ended. Upgrade to keep your agent running.'
                                    : 'Your previous plan has expired. Renew to keep your agent running.'}
                            </p>
                        )}

                        <div className="jad-sub-plan-grid">
                            {DISPLAY_ORDER.map((id) => (
                                <PlanCard
                                    key={id}
                                    planId={id}
                                    apiPlan={plans?.[id]}
                                    isPaidUserView={isPaidPlan}
                                    pendingPlanId={pendingPlanId}
                                    trialCta={trialCtaState}
                                    onPurchase={handlePurchase}
                                    paidCtaLabel="Purchase Plan"
                                    {...landingPlanCardProps(id)}
                                    {...planCardReferralProps(user, id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {!isInitialLoading && isPaidPlan && (
                    /* JobAgentPayments self-suppresses when the talent has no transactions yet,
                       so this section appears below the plan cards only after a real purchase. */
                    <section className="jad-sub-payments-section" aria-label="Transactions">
                        <JobAgentPayments embedded />
                    </section>
                )}
            </div>
        </>
    );
};

export default HapppySubscription;
