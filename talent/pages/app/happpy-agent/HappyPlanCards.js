'use client';

import React from 'react';
import './HapppySubscription.css';
import './HappyPlanCards.css';
import {
    HAPPY_PRICING_CTA_ARROW_SRC,
    HAPPY_PRICING_FEATURED_GLOW_SRC,
    HAPPY_PRICING_RIBBON_SPARKLE_SRC,
    HAPPY_PRICING_RIBBON_STAR_SRC,
} from '../linkedin/happyAgentPageAssets';

/** Plans surfaced on the subscription page in Figma order: Trial → All In → Hustle.
 *  Hustle (1) and All In (3) always come from `user.agent_tailor_plans`. The id-4
 *  slot is polymorphic — same convention as TailorPaymentScreen:
 *    - `plans[4]` present  → render the API's ₹499 "Try It Out" paid card.
 *       The backend injects it only after the free trial has ended or the talent
 *       has a prior ₹499 transaction (see TalentService::getCvTransformPrice).
 *    - `plans[4]` absent   → render a local ₹0 free-trial card whose CTA is
 *       driven by `trialCta` (Start Free Trial / Current Plan / Trial Ended).
 *       Hidden entirely for paid users via `isPaidUserView`. */
export const DISPLAY_ORDER = [4, 3, 1];

/** All In — featured card on the Figma landing / subscription grids. */
export const LANDING_FEATURED_PLAN_ID = 3;

/** Shared featured + ribbon props matching the public landing pricing section. */
export function landingPlanCardProps(planId) {
    return {
        featured: planId === LANDING_FEATURED_PLAN_ID,
        showRibbon: planId === LANDING_FEATURED_PLAN_ID,
    };
}

/**
 * Referral-redeem props for {@link PlanCard} from auth user + plan id.
 * Uses `happy_referral_total_discount` and `agent_tailor_plans_original` from
 * API_ME / refreshHapppyAgentPlans — only surfaces compare UI when discount > 0.
 */
export function planCardReferralProps(user, planId) {
    if (planId !== 1 && planId !== 3) {
        return {};
    }
    const referralDiscountPercent = Number(user?.happy_referral_total_discount) || 0;
    if (referralDiscountPercent <= 0) {
        return { referralDiscountPercent: 0 };
    }
    return {
        referralDiscountPercent,
        originalPlan: user?.agent_tailor_plans_original?.[planId] ?? null,
    };
}

/**
 * Shared referral + All In per-month pricing for plan cards and reference cards.
 */
export function getPlanReferralPricing({
    planId,
    apiPlan,
    copy,
    referralDiscountPercent: referralDiscountPercentProp = 0,
    originalPlan = null,
}) {
    const referralDiscountPercent =
        (planId === 1 || planId === 3) && apiPlan
            ? Number(
                referralDiscountPercentProp ?? apiPlan.ReferralDiscountPercent,
            ) || 0
            : 0;
    const hasReferralDiscount = referralDiscountPercent > 0;
    const currentPlanPrice = apiPlan
        ? Number(apiPlan.PriceText ?? apiPlan.Price)
        : null;
    const originalListPrice = hasReferralDiscount
        ? originalPlan != null
            ? Number(originalPlan.PriceText ?? originalPlan.Price)
            : apiPlan?.OriginalPrice != null
                ? Number(apiPlan.OriginalPrice)
                : null
        : null;
    const showReferralPriceCompare =
        hasReferralDiscount &&
        Number.isFinite(originalListPrice) &&
        originalListPrice > 0 &&
        Number.isFinite(currentPlanPrice) &&
        currentPlanPrice < originalListPrice;

    const isAllInPlan = planId === 3 && !!apiPlan;
    const allInTotalPrice = isAllInPlan ? Number(apiPlan.PriceText) : null;
    const allInPerMonthPrice =
        isAllInPlan && !hasReferralDiscount && Number.isFinite(allInTotalPrice)
            ? Math.floor(allInTotalPrice / 3)
            : null;

    const priceText =
        allInPerMonthPrice != null
            ? `₹${allInPerMonthPrice}`
            : apiPlan
                ? `₹${apiPlan.PriceText}`
                : '—';
    const priceSubtitle = showReferralPriceCompare
        ? apiPlan?.ValidityText
            ? `for ${apiPlan.ValidityText}`
            : copy?.priceSubtitle
                ? copy.priceSubtitle.replace(/^For /i, 'for ')
                : ''
        : allInPerMonthPrice != null
            ? `Per month (₹${allInTotalPrice})`
            : apiPlan?.ValidityText
                ? `For ${apiPlan.ValidityText}`
                : copy?.priceSubtitle ?? '';
    const commitmentNote =
        isAllInPlan && !hasReferralDiscount ? 'with commitment of 3 months' : null;
    const titleBadge = hasReferralDiscount
        ? `${referralDiscountPercent}% referral discount`
        : copy?.badge ?? null;

    return {
        referralDiscountPercent,
        hasReferralDiscount,
        originalListPrice,
        showReferralPriceCompare,
        priceText,
        priceSubtitle,
        commitmentNote,
        titleBadge,
    };
}

export const PLAN_COPY = {
    4: {
        title: 'Free Plan',
        ribbon: null,
        badge: null,
        priceSubtitle: '',
        description: 'Till your 1st response',
        features: [
            'Run agent on 4 jobs/day',
            'Tailor 12 resumes/day',
            'Gmail + LinkedIn outreach',
            'Auto outreach mode',
        ],
    },
    1: {
        title: 'Hustle Plan',
        badge: null,
        priceSubtitle: 'For 1 month',
        description: 'For candidates actively applying this month.',
        features: [
            'Run agent on 8 jobs/day',
            'Unlimited resume tailoring',
            'Gmail + LinkedIn outreach',
            'Auto or Manual outreach',
            'Auto follow-ups (2 days)',
            '7-day response guarantee',
        ],
    },
    3: {
        title: 'All In Plan',
        ribbon: 'Best Value',
        badge: 'Save 33%',
        priceSubtitle: 'For 3 months',
        description: 'For consistent outreach until you land interviews.',
        features: [
            'Run agent on 8 jobs/day',
            'Tailor 12 resumes/day',
            'Gmail + LinkedIn outreach',
            'Auto or Manual outreach',
            'Follow-ups start from the next day',
            'Priority support',
            '7-day response guarantee',
        ],
    },
};

export function CheckIcon({ className = 'jad-sub-check' }) {
    return (
        <svg
            className={className}
            width="13"
            height="14.3"
            viewBox="0 0 10 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.74854 0.300293C7.36084 3.7085 4.90723 6.86279 2.3877 9.76318C2.19727 9.98291 2.03125 10.0928 1.88965 10.0928C1.72852 10.0928 1.43799 9.66797 1.01807 8.81836C0.339355 7.44629 0 6.62598 0 6.35742C0 6.25977 0.065918 6.14502 0.197754 6.01318C0.480957 5.71533 0.681152 5.56641 0.79834 5.56641C0.905762 5.56641 1.02051 5.7373 1.14258 6.0791C1.46484 6.94824 1.8042 7.72217 2.16064 8.40088C4.63135 5.90088 7.0752 3.10059 9.49219 0L9.74854 0.300293Z" fill="currentColor" />
        </svg>
    );
}

/**
 * Shared plan-card renderer used by both the logged-in subscription page
 * (HapppySubscription.js) and the public landing pricing section
 * (HappyJobAgent.js). Behaviour mirrors the original `renderPlanCard`
 * verbatim — see HapppySubscription.js git history for the per-branch
 * rationale comments inlined below.
 *
 * @param {object} props
 * @param {1|3|4} props.planId
 * @param {object} [props.apiPlan]      Raw plan from `user.agent_tailor_plans`
 *                                       (or a hardcoded fallback). Undefined OK.
 * @param {number} [props.referralDiscountPercent]
 *                                       From `user.happy_referral_total_discount`.
 *                                       Compare UI renders only when &gt; 0.
 * @param {object} [props.originalPlan] List price from
 *                                       `user.agent_tailor_plans_original[planId]`.
 * @param {boolean} [props.isPaidUserView]
 *                                       Hides the ₹0 trial fallback card when
 *                                       the talent already has a paid plan.
 * @param {1|3|4|null} [props.pendingPlanId]
 *                                       Drives the "Opening checkout…" state
 *                                       and disables every CTA while a Razorpay
 *                                       order is in flight.
 * @param {{label: string, disabled: boolean, onClick: ?Function}} [props.trialCta]
 *                                       CTA descriptor for the ₹0 trial slot.
 *                                       Required when planId === 4 && !apiPlan.
 * @param {(planId: number) => void} [props.onPurchase]
 *                                       Click handler for paid cards
 *                                       (Hustle / All In / paid Try It Out).
 * @param {string} [props.paidCtaLabel]  Label shown on paid cards when idle —
 *                                       'Purchase Plan' on the subscription
 *                                       page, 'Pay now' on the public landing.
 * @param {boolean} [props.landingFigma]   Figma landing layout: CTA after features,
 *                                       handwriting pill buttons, dark featured card.
 */
export function PlanCard({
    planId,
    apiPlan,
    isPaidUserView = false,
    pendingPlanId = null,
    trialCta = null,
    onPurchase,
    paidCtaLabel = 'Purchase Plan',
    featuredRibbon = null,
    showRibbon,
    featured,
    landingFigma = true,
    upgradeDrawer = false,
    referralDiscountPercent: referralDiscountPercentProp,
    originalPlan = null,
}) {
    const copy = PLAN_COPY[planId];
    if (!copy) return null;

    const ribbonText = featuredRibbon ?? copy.ribbon;
    const shouldShowRibbon = showRibbon ?? !!ribbonText;

    /** id 4 falls back to a ₹0 free-trial card only when the API hasn't
     *  injected the ₹499 "Try It Out" paid plan. When `plans[4]` is
     *  present we treat it like any other paid card. */
    const isFreeTrialSlot = planId === 4 && !apiPlan;
    const isFeatured = landingFigma
        ? featured === true
        : featured ?? !!(featuredRibbon ?? copy.ribbon);
    const isLoading = pendingPlanId === planId;

    // Free-trial fallback is meaningless for paid users (active or expired).
    // When `plans[4]` is returned for a paid user who previously paid ₹499,
    // we want the card to stay visible — that's why this only hides the
    // local fallback, not the API-backed paid card.
    if (isFreeTrialSlot && isPaidUserView) return null;

    const {
        hasReferralDiscount,
        originalListPrice,
        showReferralPriceCompare,
        priceText: paidPriceText,
        priceSubtitle: paidPriceSubtitle,
        commitmentNote,
        titleBadge,
    } = getPlanReferralPricing({
        planId,
        apiPlan,
        copy,
        referralDiscountPercent: referralDiscountPercentProp,
        originalPlan,
    });

    const priceText = isFreeTrialSlot ? '₹0' : paidPriceText;
    const priceSubtitle = isFreeTrialSlot ? '' : paidPriceSubtitle;

    /** When the API injects id 4 as the ₹499 "Try It Out" paid card we
     *  swap in the API's name/description and reuse Hustle's feature list
     *  — mirrors TailorPaymentScreen so the card sells the actual paid
     *  capability instead of the trial fallback's lower-tier features. */
    const isPaidTryItOut = planId === 4 && !!apiPlan;
    const cardTitle = isPaidTryItOut ? apiPlan.Name : copy.title;
    const cardDescription = isPaidTryItOut ? apiPlan.Description : copy.description;
    const cardFeatures = isPaidTryItOut ? PLAN_COPY[1].features : copy.features;

    /** The flat grey `--trial` treatment was designed for the disabled
     *  "Current Plan" / "Trial Ended" states (see HapppySubscription.css —
     *  "its CTA is the disabled element that signals 'current plan', not the
     *  card itself"). For a new visitor whose CTA is the actionable
     *  "Start Free Trial", the same treatment reads as deactivated and
     *  competes with the featured All In card next to it — so we only apply
     *  the modifier when the trial CTA is non-actionable. */
    const isTrialCtaDisabled = isFreeTrialSlot && !!trialCta?.disabled;
    const cardClass = [
        'jad-sub-plan-card',
        isFeatured ? 'jad-sub-plan-card--featured' : '',
        isTrialCtaDisabled ? 'jad-sub-plan-card--trial' : '',
        landingFigma ? 'jad-sub-plan-card--landing-figma' : '',
        upgradeDrawer ? 'from-upgrade-drawer' : '',
        hasReferralDiscount ? 'jad-sub-plan-card--referral-discount' : '',
        isFreeTrialSlot ? 'trial-or-after-free-trial' : '',
    ]
        .filter(Boolean)
        .join(' ');

    let ctaLabel;
    let ctaDisabled;
    let ctaOnClick;
    let ctaCurrent = false;

    if (isFreeTrialSlot) {
        ctaLabel = trialCta?.label || 'Current Plan';
        ctaDisabled = !!trialCta?.disabled || !!pendingPlanId;
        ctaOnClick = trialCta?.onClick || (() => { });
        ctaCurrent = !!trialCta?.disabled;
    } else {
        ctaLabel = isLoading ? 'Opening checkout…' : paidCtaLabel;
        ctaDisabled = !apiPlan || !!pendingPlanId;
        ctaOnClick = () => {
            if (typeof onPurchase === 'function') onPurchase(planId);
        };
    }

    const ctaButton = (
        <button
            type="button"
            className={`jad-sub-plan-card__cta${ctaCurrent ? ' jad-sub-plan-card__cta--current' : ''
                }${landingFigma && isFeatured ? ' jad-sub-plan-card__cta--featured' : ''}${landingFigma ? ' jad-sub-plan-card__cta--landing' : ''
                }`}
            onClick={ctaOnClick}
            disabled={ctaDisabled}
            aria-busy={isLoading}
        >
            {landingFigma ? (
                <>
                    <span
                        className={`jad-sub-plan-card__cta-label`}
                    >
                        {ctaLabel}
                    </span>
                    {isFeatured && !ctaCurrent && (
                        <img
                            className="jad-sub-plan-card__cta-arrow"
                            src={HAPPY_PRICING_CTA_ARROW_SRC}
                            alt=""
                            aria-hidden="true"
                        />
                    )}
                </>
            ) : (
                ctaLabel
            )}
        </button>
    );

    const cardBody = (
        <div className="jad-sub-plan-card__body">
            <p className="jad-sub-plan-card__desc">{cardDescription}</p>
            <ul className="jad-sub-plan-card__features">
                {cardFeatures.map((feature) => (
                    <li key={feature} className="jad-sub-plan-card__feature">
                        <CheckIcon className="jad-sub-plan-card__check" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <article className={cardClass} aria-label={cardTitle}>
            {shouldShowRibbon && ribbonText && (
                <span
                    className={`jad-sub-plan-card__ribbon${landingFigma ? ' jad-sub-plan-card__ribbon--figma' : ''
                        }`}
                >
                    {landingFigma && (
                        <>
                            <img
                                className="jad-sub-plan-card__ribbon-star"
                                src={HAPPY_PRICING_RIBBON_STAR_SRC}
                                alt=""
                                aria-hidden="true"
                            />
                            <img
                                className="jad-sub-plan-card__ribbon-sparkle"
                                src={HAPPY_PRICING_RIBBON_SPARKLE_SRC}
                                alt=""
                                aria-hidden="true"
                            />
                        </>
                    )}
                    {ribbonText}
                </span>
            )}
            <div className="jad-sub-plan-card__inner">
                {landingFigma && isFeatured && (
                    <img
                        className="jad-sub-plan-card__glow"
                        src={HAPPY_PRICING_FEATURED_GLOW_SRC}
                        alt=""
                        aria-hidden="true"
                    />
                )}
                <header className="jad-sub-plan-card__head">
                    <div className="jad-sub-plan-card__title-row">
                        <h3 className="jad-sub-plan-card__title">{cardTitle}</h3>
                        {titleBadge ? (
                            <span
                                className={`jad-sub-plan-card__save-badge${hasReferralDiscount
                                        ? ' jad-sub-plan-card__save-badge--referral'
                                        : ''
                                    }`}
                            >
                                {titleBadge}
                            </span>
                        ) : null}
                    </div>
                    <div
                        className={`jad-sub-plan-card__price-row${showReferralPriceCompare
                                ? ' jad-sub-plan-card__price-row--referral'
                                : ''
                            }`}
                    >
                        <span className="jad-sub-plan-card__price">
                            {priceText}
                            {!isFreeTrialSlot && !landingFigma && !showReferralPriceCompare && (
                                <span aria-hidden="true">/</span>
                            )}
                        </span>
                        {showReferralPriceCompare ? (
                            <span className="jad-sub-plan-card__price-original">
                                ₹{originalListPrice}
                            </span>
                        ) : null}
                        {priceSubtitle ? (
                            <span className="jad-sub-plan-card__price-sub">{priceSubtitle}</span>
                        ) : null}
                    </div>
                    {commitmentNote && (
                        <span className="jad-sub-plan-card__price-commitment">
                            {commitmentNote}
                        </span>
                    )}
                </header>

                {landingFigma ? (
                    <>
                        {cardBody}
                        {ctaButton}
                    </>
                ) : (
                    <>
                        {ctaButton}
                        {cardBody}
                    </>
                )}
            </div>
        </article>
    );
}
