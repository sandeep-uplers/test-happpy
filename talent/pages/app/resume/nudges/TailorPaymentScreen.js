import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GET_API } from "../../../../components/Helper";
import { SET_LOADER, UPDATE_CURRENT_USER } from "../../../../store/actions/actionsTypes";
import { tailorResumeCaptureOrder, tailorResumeCreateOrder } from "../../../../store/actions/resumeActions";
import { trackTailorPaymentSuccess, trackTailorPricePopupOpen } from "../../../../store/actions/trackingActions";
import toast from "react-hot-toast";
import { touchpointDoneHrAssociate } from "../../../../store/actions/UserActions";
import ConfirmationModal from "../../../../components/common/ConfirmationModal";
import TailorPaymentLoader from "../payment/TailorPaymentLoader";
import { API_GET_OUTREACH_STEP } from "../../../../components/Constant";
import { DISPLAY_ORDER, PlanCard, landingPlanCardProps, planCardReferralProps } from "../../happpy-agent/HappyPlanCards";
import { HAPPPY_RAZORPAY_THEME_COLOR } from "../../linkedin/happyAgentPageAssets";
import "../../happpy-agent/HapppySubscription.css";

/** @param rootClassName Outer wrapper class; default keeps resume-editor / modal styling. AgentJ Subscription passes a neutral class to avoid global `.tailor-resume-payment-screen` rules. */
export default function TailorPaymentScreen({
    paymentScreenMsg,
    onSuccess,
    setApplySuccessScreen,
    confirmApplyDirectly,
    setConfirmApplyDirectly,
    handleClose,
    rootClassName = 'tailor-resume-payment-screen',
    tailorModalScreen = false,
    isFreeTrialPlanExpiredParent = false,
}) {
    const { user } = useSelector(state => state.auth);
    const [plans, setPlans] = useState({});
    const [paymentLoader, setPaymentLoader] = useState(false);
    const [pendingPlanId, setPendingPlanId] = useState(null);
    const { active_job } = useSelector((state) => state.resumeEditor);

    const dispatch = useDispatch();

    useEffect(() => {
        if (user?.agent_tailor_plans) {
            setPlans(user.agent_tailor_plans);
        }
    }, [user?.agent_tailor_plans]);

    useEffect(() => {
        trackTailorPricePopupOpen("tailor_right_side_drawer");
    }, []);

    const loadScript = (src) => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }
    const handleCreateOrder = async (planId) => {
        setPendingPlanId(planId);
        dispatch({ type: SET_LOADER, payload: true });
        try {
            const razorpaySDK = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!razorpaySDK) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                return;
            }

            const orderData = {
                plan_id: planId,
            };

            const result = await tailorResumeCreateOrder(orderData)(dispatch)
                .then((res) => {
                    return res?.data?.data;
                })
                .catch((err) => {
                    if (err?.response && err?.response?.data?.message) {
                        toast.error(err?.response?.data?.message || "Error while creating order", { duration: 5000 });
                    }
                    return null;
                })

            if (!result) return; // If order creation fails

            const { id: order_id, amount, currency } = result;

            // Razorpay Options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: amount.toString(),
                currency: currency,
                name: result?.notes?.name,
                order_id: order_id,

                // Payment Success Handler
                handler: async function (response) {
                    const data = {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        order_id: order_id,
                        payment_completed: true
                    };

                    try {
                        setPaymentLoader(true);
                        const captureResponse = await tailorResumeCaptureOrder(data, false)(dispatch);
                        if (captureResponse?.status === 200) {
                            trackTailorPaymentSuccess({ plan_id: planId });
                            let updateProfileObj = { resume_tailored: captureResponse?.data?.data };
                            dispatch({ type: UPDATE_CURRENT_USER, payload: updateProfileObj });
                            toast.success('Transaction success', { duration: 5000 });
                            // onSuccess handler of parent component
                            onSuccess();
                        }
                    } catch (err) {
                        const errorMessage = err?.response?.data?.message || "Something went wrong while capturing order";
                        toast.error(errorMessage, { duration: 5000 });
                    } finally {
                        setPaymentLoader(false);
                    }
                },

                // Payment Cancelled Handler
                modal: {
                    escape: false, // This is the crucial line
                    ondismiss: async function () {
                        const data = {
                            order_id: order_id,
                            payment_completed: false
                        };

                        try {
                            const cancelResponse = await tailorResumeCaptureOrder(data)(dispatch);
                            if (cancelResponse?.status === 200) {
                                toast.error('Payment cancelled', { duration: 5000 });
                            }
                        } catch (err) {
                            const errorMessage = err?.response?.data?.message || "Something went wrong.";
                            toast.error(errorMessage);
                        }
                    }
                },

                // Prefill and Notes
                prefill: {
                    name: result?.notes?.name,
                    email: result?.notes?.email,
                },
                notes: {
                },
                theme: {
                    color: HAPPPY_RAZORPAY_THEME_COLOR,
                },
                config: {
                    display: {
                        preferences: {
                            show_default_blocks: true // Do not show default blocks
                        }
                    }
                }
            };

            // Initialize and Open Razorpay Payment
            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while processing the payment.", { duration: 5000 });
        } finally {
            setPendingPlanId(null);
            dispatch({ type: SET_LOADER, payload: false });
        }
    }

    const handleApplyNow = async () => {
        if (active_job?.partner_job_tailor) {
            dispatch({ type: SET_LOADER, payload: true })
            // need to ensure that tailored resume is added in application in backend
            touchpointDoneHrAssociate(active_job.HR_Number, true)(dispatch)
                .then(res => {
                    setApplySuccessScreen(true);
                    if (confirmApplyDirectly) {
                        setConfirmApplyDirectly(false);
                    }
                }).catch(err => {
                    console.log('err', err);
                })
                .finally(() => {
                    dispatch({ type: SET_LOADER, payload: false })
                })
        }
    }
    const [outreachStepConfig, setOutreachStepConfig] = useState(null);
    const isFreeTrialPlanExpired = outreachStepConfig && Number(outreachStepConfig.plan) === 1 && outreachStepConfig.has_plan_expired;

    const fetchOutreachStep = () => {
        GET_API(API_GET_OUTREACH_STEP)
            .then((res) => {
                const res_config = res?.data?.data;
                if (res_config && typeof res_config === 'object') {
                    setOutreachStepConfig(res_config);
                }
            })
    };

    useEffect(() => {
        if (!isFreeTrialPlanExpiredParent) {
            fetchOutreachStep();
        }
    }, []);

    const showPaidTryItOut = isFreeTrialPlanExpired || isFreeTrialPlanExpiredParent;
    const visiblePlanIds = DISPLAY_ORDER.filter(
        (id) => showPaidTryItOut || id !== 4
    );

    return (
        <>
            {paymentLoader ? <TailorPaymentLoader /> : (
                <>
                    <div className={rootClassName}>
                        {tailorModalScreen &&
                            <div className="top-bar">
                                <h3 className="top-hed">Your job search just lost its <em>biggest advantage.</em></h3>
                                <p className="top-sub">Renew now and get both tools working together — resume tailoring + referral outreach.</p>
                            </div>
                        }
                        <div className="modal-body-pricing">
                            <div className="payment-screen-body">
                                {plans && Object.keys(plans).length > 0 && (
                                    <div className="job-agent-dashboard">
                                        <div className="jad-subscription jad-subscription--choose">
                                            <div className="jad-sub-plan-grid">
                                                {visiblePlanIds.map((planId) => (
                                                    <PlanCard
                                                        key={planId}
                                                        planId={planId}
                                                        apiPlan={plans?.[planId]}
                                                        isPaidUserView={false}
                                                        pendingPlanId={pendingPlanId}
                                                        onPurchase={handleCreateOrder}
                                                        paidCtaLabel="Purchase Plan"
                                                        {...landingPlanCardProps(planId)}
                                                        {...planCardReferralProps(user, planId)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                    {active_job?.partner_job_tailor && active_job?.non_paid_user_logging && (
                        <div className="payment-screen-footer">
                            <button className="outlinedBtn" onClick={handleApplyNow}>Skip resume tailoring & APPLY</button>
                        </div>
                    )}

                    <ConfirmationModal
                        isOpen={confirmApplyDirectly}
                        setOpen={setConfirmApplyDirectly}
                        title="Apply without Tailored Resume?"
                        text=""
                        primaryBtnText="Apply without Tailored Resume"
                        secondaryBtnText="Close without applying"
                        onPrimaryClick={() => handleApplyNow()}
                        onCancel={() => setConfirmApplyDirectly(false)}
                        onSecondaryClick={() => {
                            setConfirmApplyDirectly(false);
                            handleClose('', true);
                        }}
                        modalClass="confirm-close-tailor"
                    />
                </>
            )}
        </>
    )
}
