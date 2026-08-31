import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-hot-toast";
import { useNavigate } from '@/talent/navigation/routerCompat';
import { useDispatch } from "react-redux";
import {
    API_OUTREACH_AGENT_PLANS,
    API_OUTREACH_CLAIM_CUSTOM_LIGHT_PLAN,
    API_OUTREACH_CLAIM_DISCOUNT_OFFER,
    API_OUTREACH_EXTEND_FREE_TRIAL,
} from "./Constant";
import { GET_API, POST_API } from "./Helper";
import { UPDATE_CURRENT_USER } from "../store/actions/actionsTypes";

const MASCOT_SRC = "/images/talent/outreach/mascot-exclaim.svg";
const DISCOUNT_PERCENT = 20;
const DISCOUNT_PLAN_IDS = ["1", "3"];
const CUSTOM_PLAN = {
    name: "Custom Light Plan",
    jobMin: 5,
    jobMax: 30,
    jobCost: 60,
    defaultJobs: 8,
    description: "Choose how many jobs you need — ₹60 per job.",
};

const FALLBACK_PLANS = {
    1: {
        Name: "Starter Plan",
        Price: 999,
        PriceText: 999,
        Validity: 30,
        ValidityText: "1 month",
        Description: "Best for trying it on a few immediate applications",
        CTA: "Get 1-Month Access",
    },
    3: {
        Name: "Elite Plan",
        Price: 2499,
        PriceText: 2499,
        Validity: 90,
        ValidityText: "3 months",
        Description: "Best for serious job search across multiple roles",
        CTA: "Get 3-Month Access",
    },
};

const FEEDBACK_OPTIONS = [
    {
        value: "need_more_time",
        label: "I need more time to try HAPPPY",
        offer: "extra_trial",
        extendReason: "explore",
    },
    {
        value: "price_too_high",
        label: "It's too expensive for me",
        offer: "discount",
    },
    {
        value: "custom_plan",
        label: "Something custom plan for light use, job-wise",
        offer: "custom",
    },
    {
        value: "responses_not_my_type",
        label: "The replies I got weren't a good fit",
        offer: "extra_trial",
        extendReason: "positive_response",
    },
];

const CONVERSION_OFFER_MESSAGES = {
    extend_days_3_free: "You've already claimed 3 extra free trial days.",
    extend_days_3_free_explore: "You've already claimed 3 extra free trial days.",
    extend_days_3_free_positive_response: "You've already claimed 3 extra free trial days.",
    "20_discount": "You've already claimed the 20% discount offer.",
    "20_discount_plan_799": "You've already claimed the 20% discount offer.",
    cheap_plan: "You've already claimed the custom plan offer.",
};

const getAlreadyClaimedMessage = (offer) =>
    CONVERSION_OFFER_MESSAGES[offer] || "You've already taken this offer.";

const formatInr = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const getDiscountedPrice = (price) =>
    Math.round(Number(price) * (1 - DISCOUNT_PERCENT / 100));

const TRIAL_FEEDBACK_MODAL_STYLES = `
.rap-trial-feedback-overlay.ReactModal__Overlay {
    background: rgba(25, 28, 30, 0.55) !important;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100000;
    position: fixed;
    inset: 0;
}
.rap-trial-feedback-modal.modal {
    position: relative;
    inset: auto;
    max-width: 560px;
    width: 100%;
    margin: auto;
    padding: 0;
    border: none;
    background: transparent;
    overflow: visible;
    outline: none;
}
.rap-trial-feedback-modal.modal--wide {
    max-width: 640px;
}
.rap-trial-feedback-modal__card {
    position: relative;
    background: #231f20;
    border-radius: 16px;
    padding: 2rem 2.5rem 2.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    animation: rapTrialFeedbackFadeIn 0.25s ease-out;
    font-family: "Rubik", "Montserrat", system-ui, sans-serif;
}
@keyframes rapTrialFeedbackFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
.rap-trial-feedback-modal__topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 1.3125rem;
    margin-bottom: 1.3125rem;
}
.rap-trial-feedback-modal__close {
    border: none;
    background: transparent;
    color: #6b6b6b;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    transition: color 0.2s ease;
}
.rap-trial-feedback-modal__close:hover {
    color: #ffffff;
}
.rap-trial-feedback-modal__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
}
.rap-trial-feedback-modal__mascot {
    width: 6rem;
    height: 4.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.rap-trial-feedback-modal__mascot img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
.rap-trial-feedback-modal__title {
    margin: 0 !important;
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    line-height: 1.17 !important;
    color: #ffffff !important;
    letter-spacing: -0.01em;
}
.rap-trial-feedback-modal__subtitle {
    margin: 0 !important;
    font-size: 0.75rem !important;
    line-height: 1.4 !important;
    color: #bababa !important;
}
.rap-trial-feedback-modal__options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
    text-align: left;
}
.rap-trial-feedback-modal__option {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    background: #4c4c4c;
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.rap-trial-feedback-modal__option:hover {
    background: #555555;
}
.rap-trial-feedback-modal__option--selected {
    background: #555555;
    box-shadow: inset 0 0 0 1.5px #46eccd;
}
.rap-trial-feedback-modal__option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}
.rap-trial-feedback-modal__radio {
    flex-shrink: 0;
    width: 1.125rem;
    height: 1.125rem;
    margin-top: 0.125rem;
    border-radius: 50%;
    border: 2px solid #bababa;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.2s ease;
}
.rap-trial-feedback-modal__option--selected .rap-trial-feedback-modal__radio {
    border-color: #46eccd;
}
.rap-trial-feedback-modal__radio-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #46eccd;
}
.rap-trial-feedback-modal__option-label {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.43;
    color: #ffffff;
}
.rap-trial-feedback-modal__offer {
    margin-top: 1.5rem;
}
.rap-trial-feedback-modal__callout {
    padding: 1rem 1.125rem;
    border-radius: 8px;
    background: #4c4c4c;
    text-align: center;
}
.rap-trial-feedback-modal__callout-highlight {
    display: block;
    margin-bottom: 0.375rem;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    color: #46eccd;
}
.rap-trial-feedback-modal__callout-text {
    margin: 0 !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    line-height: 1.43 !important;
    color: #ffffff !important;
}
.rap-trial-feedback-modal__plans {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}
.rap-trial-feedback-modal__plan {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 8px;
    background: #4c4c4c;
    text-align: left;
}
.rap-trial-feedback-modal__plan-badge {
    align-self: flex-start;
    padding: 0.2rem 0.5rem;
    border-radius: 999px;
    background: rgba(70, 236, 205, 0.18);
    color: #46eccd;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}
.rap-trial-feedback-modal__plan-name {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 700;
    line-height: 1.3;
    color: #ffffff;
}
.rap-trial-feedback-modal__plan-price-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0.375rem;
}
.rap-trial-feedback-modal__plan-price {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.2;
    color: #46eccd;
}
.rap-trial-feedback-modal__plan-price-old {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #bababa;
    text-decoration: line-through;
}
.rap-trial-feedback-modal__plan-meta {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #bababa;
}
.rap-trial-feedback-modal__plan-desc {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #ffffff;
    opacity: 0.9;
}
.rap-trial-feedback-modal__plan-cta {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 2.25rem;
    padding: 0.625rem 0.75rem;
    font-family: "Montserrat", "Rubik", system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border-radius: 28px;
    cursor: pointer;
    border: none;
    color: #231f20;
    background: #46eccd;
    transition: opacity 0.2s ease, transform 0.15s ease;
}
.rap-trial-feedback-modal__plan-cta:hover {
    opacity: 0.92;
}
.rap-trial-feedback-modal__plan-cta:active {
    transform: scale(0.98);
}
.rap-trial-feedback-modal__plan-cta:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}
.rap-trial-feedback-modal__plans-loading {
    margin: 0;
    padding: 1.5rem 1rem;
    text-align: center;
    color: #bababa;
    font-size: 0.875rem;
}
.rap-trial-feedback-modal__custom-card {
    padding: 1.25rem 1.125rem;
    border-radius: 8px;
    background: #4c4c4c;
    text-align: center;
}
.rap-trial-feedback-modal__custom-name {
    margin: 0 0 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #ffffff;
}
.rap-trial-feedback-modal__custom-price {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.1;
    color: #46eccd;
}
.rap-trial-feedback-modal__custom-jobs {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #ffffff;
}
.rap-trial-feedback-modal__custom-desc {
    margin: 0 0 1rem;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: #bababa;
}
.rap-trial-feedback-modal__custom-picker {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
}
.rap-trial-feedback-modal__custom-picker-label {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #ffffff;
}
.rap-trial-feedback-modal__custom-picker-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.rap-trial-feedback-modal__custom-range {
    flex: 1;
    width: 100%;
    accent-color: #46eccd;
    cursor: pointer;
}
.rap-trial-feedback-modal__custom-jobs-value {
    min-width: 2.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #46eccd;
    text-align: right;
}
.rap-trial-feedback-modal__custom-meta {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 500;
    color: #bababa;
}
.rap-trial-feedback-modal__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
}
.rap-trial-feedback-modal__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 2.5rem;
    padding: 0.75rem 1.5rem;
    font-family: "Montserrat", "Rubik", system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border-radius: 28px;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s ease, transform 0.15s ease;
    text-decoration: none;
    color: #231f20;
    background: #46eccd;
}
.rap-trial-feedback-modal__btn:hover {
    opacity: 0.92;
    color: #231f20;
}
.rap-trial-feedback-modal__btn:active {
    transform: scale(0.98);
}
.rap-trial-feedback-modal__btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}
.rap-trial-feedback-modal__link {
    border: none;
    background: transparent;
    padding: 0;
    font-family: "Montserrat", "Rubik", system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    color: #6b6b6b;
    cursor: pointer;
    transition: color 0.2s ease;
}
.rap-trial-feedback-modal__link:hover {
    color: #bababa;
}

@media (max-width: 575px) {
    .rap-trial-feedback-modal__card {
        padding: 1.5rem 1.25rem 1.75rem;
    }
    .rap-trial-feedback-modal__title {
        font-size: 1.25rem !important;
    }
    .rap-trial-feedback-modal__plans {
        grid-template-columns: 1fr;
    }
}
`;

const TrialFeedbackModal = ({ onClose, onBack, conversionOffer: conversionOfferProp = null }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState("reason");
    const [selectedReason, setSelectedReason] = useState("");
    const [plans, setPlans] = useState(null);
    const [plansLoading, setPlansLoading] = useState(false);
    const [offerSubmitting, setOfferSubmitting] = useState(false);
    const [conversionOffer, setConversionOffer] = useState(conversionOfferProp || null);
    const [offerStatusLoading, setOfferStatusLoading] = useState(!conversionOfferProp);
    const [customJobs, setCustomJobs] = useState(CUSTOM_PLAN.defaultJobs);

    const selectedOption = FEEDBACK_OPTIONS.find((o) => o.value === selectedReason);
    const offerType = selectedOption?.offer;
    const alreadyClaimed = !!conversionOffer;
    const customPrice = customJobs * CUSTOM_PLAN.jobCost;

    useEffect(() => {
        let cancelled = false;
        setOfferStatusLoading(true);

        GET_API(API_OUTREACH_AGENT_PLANS)
            .then((res) => {
                if (cancelled) return;
                const offer = res?.data?.data?.conversion_offer || null;
                setConversionOffer(offer);
                const apiPlans = res?.data?.data?.agent_tailor_plans;
                if (apiPlans && typeof apiPlans === "object") {
                    setPlans(apiPlans);
                }
            })
            .catch(() => {
                if (!cancelled && conversionOfferProp) {
                    setConversionOffer(conversionOfferProp);
                }
            })
            .finally(() => {
                if (!cancelled) setOfferStatusLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [conversionOfferProp]);

    useEffect(() => {
        if (step !== "offer" || offerType !== "discount") return;
        if (plans) return;

        let cancelled = false;
        setPlansLoading(true);

        GET_API(API_OUTREACH_AGENT_PLANS)
            .then((res) => {
                if (cancelled) return;
                const apiPlans = res?.data?.data?.agent_tailor_plans;
                setPlans(apiPlans && typeof apiPlans === "object" ? apiPlans : FALLBACK_PLANS);
                const offer = res?.data?.data?.conversion_offer || null;
                if (offer) setConversionOffer(offer);
            })
            .catch(() => {
                if (!cancelled) setPlans(FALLBACK_PLANS);
            })
            .finally(() => {
                if (!cancelled) setPlansLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [step, offerType, plans]);

    const handleContinue = () => {
        if (!selectedReason) return;
        setStep("offer");
    };

    const handleAcceptTrial = async () => {
        if (offerSubmitting) return;
        setOfferSubmitting(true);
        try {
            const res = await POST_API(API_OUTREACH_EXTEND_FREE_TRIAL, {
                reason: selectedOption?.extendReason || "explore",
            });
            if (res?.data?.status === "success") {
                toast.success(res.data.message || "Free trial extended by 3 days");
                if (onClose) onClose();
                return;
            }
            toast.error(res?.data?.message || "Could not extend free trial");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not extend free trial");
        } finally {
            setOfferSubmitting(false);
        }
    };

    const handleSelectDiscountPlan = async (planId) => {
        if (offerSubmitting) return;
        setOfferSubmitting(true);
        try {
            const res = await POST_API(API_OUTREACH_CLAIM_DISCOUNT_OFFER, {
                plan_id: Number(planId),
            });
            if (res?.data?.status === "success") {
                const data = res.data.data || {};
                if (data.agent_tailor_plans) {
                    dispatch({
                        type: UPDATE_CURRENT_USER,
                        payload: {
                            agent_tailor_plans: data.agent_tailor_plans,
                            agent_tailor_plans_original: data.agent_tailor_plans_original,
                        },
                    });
                }
                toast.success(res.data.message || "20% discount applied");
                if (onClose) onClose();
                const redirectUrl =
                    data.redirect_url ||
                    `/talent/job-agent/subscription?plan=${planId}`;
                navigate(redirectUrl);
                return;
            }
            toast.error(res?.data?.message || "Could not apply discount");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not apply discount");
        } finally {
            setOfferSubmitting(false);
        }
    };

    const handleAcceptCustom = async () => {
        if (offerSubmitting) return;
        const jobs = Number(customJobs);
        if (
            !Number.isInteger(jobs) ||
            jobs < CUSTOM_PLAN.jobMin ||
            jobs > CUSTOM_PLAN.jobMax
        ) {
            toast.error(`Choose between ${CUSTOM_PLAN.jobMin} and ${CUSTOM_PLAN.jobMax} jobs`);
            return;
        }
        setOfferSubmitting(true);
        try {
            const res = await POST_API(API_OUTREACH_CLAIM_CUSTOM_LIGHT_PLAN, { jobs });
            if (res?.data?.status === "success") {
                const data = res.data.data || {};
                if (data.agent_tailor_plans) {
                    dispatch({
                        type: UPDATE_CURRENT_USER,
                        payload: {
                            agent_tailor_plans: data.agent_tailor_plans,
                            agent_tailor_plans_original: data.agent_tailor_plans_original,
                        },
                    });
                }
                toast.success(res.data.message || "Custom Light Plan unlocked");
                if (onClose) onClose();
                const redirectUrl =
                    data.redirect_url ||
                    "/talent/job-agent/subscription?plan=4";
                navigate(redirectUrl);
                return;
            }
            toast.error(res?.data?.message || "Could not unlock custom plan");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Could not unlock custom plan");
        } finally {
            setOfferSubmitting(false);
        }
    };

    const handleDeclineOffer = () => {
        toast.success("Thanks for sharing your feedback!");
        if (onClose) onClose();
    };

    const renderReasonStep = () => (
        <>
            <header className="rap-trial-feedback-modal__hero">
                <div className="rap-trial-feedback-modal__mascot" aria-hidden>
                    <img src={MASCOT_SRC} alt="" />
                </div>
                <h2 className="rap-trial-feedback-modal__title">Something Else in Mind?</h2>
                <p className="rap-trial-feedback-modal__subtitle">
                    Tell us why you&apos;re not upgrading yet — pick the option that fits best.
                </p>
            </header>
            <div className="rap-trial-feedback-modal__options" role="radiogroup" aria-label="Feedback reason">
                {FEEDBACK_OPTIONS.map((option) => {
                    const isSelected = selectedReason === option.value;
                    return (
                        <label
                            key={option.value}
                            className={`rap-trial-feedback-modal__option${isSelected ? " rap-trial-feedback-modal__option--selected" : ""}`}
                        >
                            <input
                                type="radio"
                                name="trial-feedback-reason"
                                value={option.value}
                                checked={isSelected}
                                onChange={() => setSelectedReason(option.value)}
                            />
                            <span className="rap-trial-feedback-modal__radio" aria-hidden>
                                {isSelected ? <span className="rap-trial-feedback-modal__radio-dot" /> : null}
                            </span>
                            <span className="rap-trial-feedback-modal__option-label">{option.label}</span>
                        </label>
                    );
                })}
            </div>
            <footer className="rap-trial-feedback-modal__footer">
                <button
                    type="button"
                    className="rap-trial-feedback-modal__btn"
                    onClick={handleContinue}
                    disabled={!selectedReason}
                >
                    Continue
                </button>
                <button type="button" className="rap-trial-feedback-modal__link" onClick={onBack}>
                    Go Back
                </button>
            </footer>
        </>
    );

    const renderExtraTrialOffer = () => (
        <>
            <header className="rap-trial-feedback-modal__hero">
                <div className="rap-trial-feedback-modal__mascot" aria-hidden>
                    <img src={MASCOT_SRC} alt="" />
                </div>
                <h2 className="rap-trial-feedback-modal__title">Need a Bit More Time?</h2>
                <p className="rap-trial-feedback-modal__subtitle">
                    No worries — we can extend your free trial so you can keep exploring HAPPPY.
                </p>
            </header>
            <div className="rap-trial-feedback-modal__offer">
                <div className="rap-trial-feedback-modal__callout">
                    <span className="rap-trial-feedback-modal__callout-highlight">+3 days free trial</span>
                    <p className="rap-trial-feedback-modal__callout-text">
                        Want us to give you 3 more days on your free trial?
                    </p>
                </div>
            </div>
            <footer className="rap-trial-feedback-modal__footer">
                <button
                    type="button"
                    className="rap-trial-feedback-modal__btn"
                    onClick={handleAcceptTrial}
                    disabled={offerSubmitting}
                >
                    {offerSubmitting ? "Please wait…" : "Yes, Give Me 3 More Days"}
                </button>
                <button type="button" className="rap-trial-feedback-modal__link" onClick={handleDeclineOffer}>
                    No Thanks
                </button>
            </footer>
        </>
    );

    const renderDiscountOffer = () => {
        const planSource = plans || FALLBACK_PLANS;

        return (
            <>
                <header className="rap-trial-feedback-modal__hero">
                    <div className="rap-trial-feedback-modal__mascot" aria-hidden>
                        <img src={MASCOT_SRC} alt="" />
                    </div>
                    <h2 className="rap-trial-feedback-modal__title">Special {DISCOUNT_PERCENT}% Off</h2>
                    <p className="rap-trial-feedback-modal__subtitle">
                        We heard you on price — here&apos;s an exclusive discount on both plans.
                    </p>
                </header>
                <div className="rap-trial-feedback-modal__offer">
                    {plansLoading && !plans ? (
                        <p className="rap-trial-feedback-modal__plans-loading">Loading plans…</p>
                    ) : (
                        <div className="rap-trial-feedback-modal__plans">
                            {DISCOUNT_PLAN_IDS.map((planId) => {
                                const plan = planSource[planId] || FALLBACK_PLANS[planId];
                                if (!plan) return null;
                                const original = Number(plan.PriceText ?? plan.Price);
                                const discounted = getDiscountedPrice(original);
                                return (
                                    <div className="rap-trial-feedback-modal__plan" key={planId}>
                                        <span className="rap-trial-feedback-modal__plan-badge">
                                            {DISCOUNT_PERCENT}% off
                                        </span>
                                        <p className="rap-trial-feedback-modal__plan-name">{plan.Name}</p>
                                        <div className="rap-trial-feedback-modal__plan-price-row">
                                            <p className="rap-trial-feedback-modal__plan-price">
                                                {formatInr(discounted)}
                                            </p>
                                            <p className="rap-trial-feedback-modal__plan-price-old">
                                                {formatInr(original)}
                                            </p>
                                        </div>
                                        <p className="rap-trial-feedback-modal__plan-meta">
                                            For {plan.ValidityText}
                                        </p>
                                        <p className="rap-trial-feedback-modal__plan-desc">{plan.Description}</p>
                                        <button
                                            type="button"
                                            className="rap-trial-feedback-modal__plan-cta"
                                            onClick={() => handleSelectDiscountPlan(planId)}
                                            disabled={offerSubmitting}
                                        >
                                            {offerSubmitting ? "Please wait…" : (plan.CTA || "Get This Plan")}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <footer className="rap-trial-feedback-modal__footer">
                    <button type="button" className="rap-trial-feedback-modal__link" onClick={handleDeclineOffer}>
                        No Thanks
                    </button>
                </footer>
            </>
        );
    };

    const renderCustomOffer = () => (
        <>
            <header className="rap-trial-feedback-modal__hero">
                <div className="rap-trial-feedback-modal__mascot" aria-hidden>
                    <img src={MASCOT_SRC} alt="" />
                </div>
                <h2 className="rap-trial-feedback-modal__title">A Plan Built for Light Use</h2>
                <p className="rap-trial-feedback-modal__subtitle">
                    Pick how many jobs you need — pay only for what you use.
                </p>
            </header>
            <div className="rap-trial-feedback-modal__offer">
                <div className="rap-trial-feedback-modal__custom-card">
                    <p className="rap-trial-feedback-modal__custom-name">{CUSTOM_PLAN.name}</p>
                    <p className="rap-trial-feedback-modal__custom-price">{formatInr(customPrice)}</p>
                    <p className="rap-trial-feedback-modal__custom-jobs">
                        {customJobs} jobs · {formatInr(CUSTOM_PLAN.jobCost)} each
                    </p>
                    <p className="rap-trial-feedback-modal__custom-desc">{CUSTOM_PLAN.description}</p>
                    <div className="rap-trial-feedback-modal__custom-picker">
                        <p className="rap-trial-feedback-modal__custom-picker-label" id="custom-jobs-label">
                            How many jobs do you want?
                        </p>
                        <div className="rap-trial-feedback-modal__custom-picker-row">
                            <input
                                className="rap-trial-feedback-modal__custom-range"
                                type="range"
                                min={CUSTOM_PLAN.jobMin}
                                max={CUSTOM_PLAN.jobMax}
                                step={1}
                                value={customJobs}
                                onChange={(e) => setCustomJobs(Number(e.target.value))}
                                aria-labelledby="custom-jobs-label"
                                aria-valuemin={CUSTOM_PLAN.jobMin}
                                aria-valuemax={CUSTOM_PLAN.jobMax}
                                aria-valuenow={customJobs}
                            />
                            <span className="rap-trial-feedback-modal__custom-jobs-value" aria-hidden>
                                {customJobs}
                            </span>
                        </div>
                        <p className="rap-trial-feedback-modal__custom-meta">
                            Min {CUSTOM_PLAN.jobMin} · Max {CUSTOM_PLAN.jobMax} jobs
                        </p>
                    </div>
                </div>
            </div>
            <footer className="rap-trial-feedback-modal__footer">
                <button
                    type="button"
                    className="rap-trial-feedback-modal__btn"
                    onClick={handleAcceptCustom}
                    disabled={offerSubmitting}
                >
                    {offerSubmitting
                        ? "Please wait…"
                        : `Get Custom Plan · ${formatInr(customPrice)}`}
                </button>
                <button type="button" className="rap-trial-feedback-modal__link" onClick={handleDeclineOffer}>
                    No Thanks
                </button>
            </footer>
        </>
    );

    const renderOfferStep = () => {
        if (offerType === "discount") return renderDiscountOffer();
        if (offerType === "custom") return renderCustomOffer();
        return renderExtraTrialOffer();
    };

    const renderAlreadyClaimed = () => (
        <>
            <header className="rap-trial-feedback-modal__hero">
                <div className="rap-trial-feedback-modal__mascot" aria-hidden>
                    <img src={MASCOT_SRC} alt="" />
                </div>
                <h2 className="rap-trial-feedback-modal__title">Offer Already Claimed</h2>
                <p className="rap-trial-feedback-modal__subtitle">
                    You&apos;ve already used a special offer on this account.
                </p>
            </header>
            <div className="rap-trial-feedback-modal__offer">
                <div className="rap-trial-feedback-modal__callout">
                    <p className="rap-trial-feedback-modal__callout-text">
                        {getAlreadyClaimedMessage(conversionOffer)}
                    </p>
                </div>
            </div>
            <footer className="rap-trial-feedback-modal__footer">
                <button
                    type="button"
                    className="rap-trial-feedback-modal__btn"
                    onClick={() => {
                        if (onClose) onClose();
                        navigate("/talent/job-agent/subscription");
                    }}
                >
                    View Plans
                </button>
                <button type="button" className="rap-trial-feedback-modal__link" onClick={onBack || onClose}>
                    Go Back
                </button>
            </footer>
        </>
    );

    const renderLoading = () => (
        <p className="rap-trial-feedback-modal__plans-loading">Checking your offer status…</p>
    );

    let bodyContent = renderReasonStep();
    if (offerStatusLoading) {
        bodyContent = renderLoading();
    } else if (alreadyClaimed) {
        bodyContent = renderAlreadyClaimed();
    } else if (step === "offer") {
        bodyContent = renderOfferStep();
    }

    return (
        <Modal
            isOpen={true}
            className={`modal commonModal rap-trial-feedback-modal${!alreadyClaimed && step === "offer" && offerType === "discount" ? " modal--wide" : ""}`}
            overlayClassName="rap-trial-feedback-overlay"
            contentLabel="Tell us what's on your mind"
        >
            <style>{TRIAL_FEEDBACK_MODAL_STYLES}</style>
            <div className="rap-trial-feedback-modal__card">
                <div className="rap-trial-feedback-modal__topbar">
                    <button
                        type="button"
                        className="rap-trial-feedback-modal__close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {bodyContent}
            </div>
        </Modal>
    );
};

export default TrialFeedbackModal;
