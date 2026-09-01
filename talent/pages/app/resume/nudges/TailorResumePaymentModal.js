import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch, useSelector } from 'react-redux';
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { SET_LOADER, SET_TAILOR_MODAL_OPEN, UPDATE_CURRENT_USER } from '../../../../store/actions/actionsTypes';
import { tailorResumeCaptureOrder, tailorResumeCreateOrder } from '../../../../store/actions/resumeActions';
import { trackDownloadTailorExtensionClicked, trackTailorPaymentSuccess } from '../../../../store/actions/trackingActions';
import { HAPPPY_RAZORPAY_THEME_COLOR } from '../../linkedin/happyAgentPageAssets';


export default function TailorResumePaymentModal({ isOpen, setIsOpen, hrEncId = null, activeJob = null }) {
    const { user } = useSelector(state => state.auth);
    const planValidity = user?.resume_tailored?.tailored_plan_validity;
    const dispatch = useDispatch();
    const [plans, setPlans] = useState({});
    const [selectedPlan, setSelectedPlan] = useState(3);

    useEffect(() => {
        setPlans(user.agent_tailor_plans);
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
                        const captureResponse = await tailorResumeCaptureOrder(data)(dispatch);
                        if (captureResponse?.status === 200) {
                            trackTailorPaymentSuccess({ plan_id: planId });
                            let updateProfileObj = { resume_tailored: captureResponse?.data?.data };
                            dispatch({ type: UPDATE_CURRENT_USER, payload: updateProfileObj });
                            toast.success('Transaction success', { duration: 5000 });
                            { (hrEncId && activeJob) && dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: hrEncId, active_job: activeJob } }) };
                            setIsOpen(false);
                        }
                    } catch (err) {
                        const errorMessage = err?.response?.data?.message || "Something went wrong while capturing order";
                        toast.error(errorMessage, { duration: 5000 });
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
                        // hide:
                        //     [
                        //         { method: 'upi', flows: ["qr"] }
                        //     ],
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
            dispatch({ type: SET_LOADER, payload: false });
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            portalClassName="react-modal-portal"
            className="modal commonModal tailor-resume-payment-modal"
            shouldCloseOnOverlayClick={false}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content ">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setIsOpen(false)}>
                        <CloseModalIcon />
                    </button>
                    <div className="modal-body-pricing">

                        <div className="top-bar">
                            {/* <div className="exp-pill"><div className="exp-dot"></div><span>Your plan has expired</span></div> */}
                            <h2 className="top-hed">Your job search just<br />lost its <em>biggest advantage.</em></h2>
                            <p className="top-sub">Renew now and get both tools working together — resume tailoring + referral outreach. Most users get callbacks within 2 weeks.</p>
                        </div>

                        <div className="body">
                            <div className="section-lbl">What you get back</div>
                            <div className="feature-grid">
                                <div className="feat">
                                    <div className="feat-icon">📄</div>
                                    <div className="feat-body"><span className="feat-title">Resume tailored to exact JD</span><span className="feat-sub">ATS-optimised, keyword-matched in under 3 mins</span></div>
                                </div>
                                <div className="feat">
                                    <div className="feat-icon">🔌</div>
                                    <div className="feat-body"><span className="feat-title">Chrome extension</span><span className="feat-sub">1-click tailor from LinkedIn, Naukri, Indeed, any ATS</span></div>
                                </div>
                                <div className="feat">
                                    <div className="feat-icon">🧠</div>
                                    <div className="feat-body"><span className="feat-title">Resume memory</span><span className="feat-sub">Learns from past tailors — output gets sharper every time</span></div>
                                </div>
                                <div className="feat">
                                    <div className="feat-icon">📊</div>
                                    <div className="feat-body"><span className="feat-title">Skill mapping</span><span className="feat-sub">Improved quantification + placement built for recruiters</span></div>
                                </div>
                            </div>
                            {!user?.agent_tailored_paid &&
                                <>
                                    {user?.resume_tailored.payment_received &&
                                        <div className="free-features">
                                            <div className="ff-head">
                                                <div className="ff-badge">Free</div>
                                                <span className="ff-title">Happpy Agent — included with your plan</span>
                                            </div>
                                            <div className="ff-list">
                                                <div className="ff-item"><div className="ff-check">✓</div>One-click recruiter outreach</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>LinkedIn + email reach</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>Sends your tailored resume</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>Automated follow-ups</div>
                                            </div>
                                        </div>
                                    }
                                    {user?.outreach.payment_received &&
                                        <div className="free-features">
                                            <div className="ff-head">
                                                <div className="ff-badge">Free</div>
                                                <span className="ff-title">Tailor Resume — included with your plan</span>
                                            </div>
                                            <div className="ff-list">
                                                <div className="ff-item"><div className="ff-check">✓</div>Professional ATS-Optimized Templates</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>Unlimited resume tailoring during your active plan</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>Lifetime access to all created resumes</div>
                                                <div className="ff-item"><div className="ff-check">✓</div>Easy to modify with an in-built editor</div>
                                            </div>
                                        </div>
                                    }
                                </>
                            }

                            <div className="plans-label">Choose your plan</div>
                            {plans && Object.keys(plans).length > 0 &&
                                <>
                                    {displayOrder.map((planId, index) => (
                                        (user?.agent_tailored_paid || planId !== 1) &&
                                        <div
                                            className={`plan-card ${(planId == 3 && planId === selectedPlan) ? 'featured' : ''} ${planId === selectedPlan ? 'selected' : ''}`}
                                            onClick={() => setSelectedPlan(planId)}
                                        >
                                            {planId == 3 && <div className="best-badge">Best value</div>}
                                            <div className="plan-row">
                                                <div className={`plan-sel ${planId === selectedPlan ? 'on' : ''}`}></div>
                                                <span className="plan-name">{plans[planId].Name} {planId == 3 && <span className="plan-save">Save 33%</span>}</span>
                                                <div className="plan-price">
                                                    <span className="plan-amount">₹{plans[planId].PriceText}</span>
                                                    <span className="plan-period"> / {plans[planId].ValidityText}</span>
                                                </div>
                                            </div>
                                            {plans[planId].Description && <p className="plan-desc">For serious job search across multiple roles — {planId == 3 ? `₹${Math.round(plans[planId].PriceText / 3)}/month` : ''}</p>}
                                            {!user?.agent_tailored_paid &&
                                                <>
                                                    {user?.resume_tailored.payment_received &&
                                                        <div className="plan-free-tag">+ Happpy Agent FREE {planId == 3 ? "· Full 3 months" : ''}</div>
                                                    }
                                                    {user?.outreach.payment_received &&
                                                        <div className="plan-free-tag">+ Tailor Resume FREE {planId == 3 ? "· Full 3 months" : ''}</div>
                                                    }
                                                </>
                                            }
                                        </div>
                                    ))}

                                    <div className="divider"></div>

                                    <div className="total-row">
                                        <div className="total-label">Total today
                                            {!user?.agent_tailored_paid &&
                                                <>
                                                    {user?.resume_tailored.payment_received &&
                                                        <span id="total-sub-text">Happpy Agent worth ₹{plans[selectedPlan].PriceText} included free</span>
                                                    }
                                                    {user?.outreach.payment_received &&
                                                        <span id="total-sub-text">Tailor Resume worth ₹{plans[selectedPlan].PriceText} included free</span>
                                                    }
                                                </>
                                            }
                                        </div>
                                        <div>
                                            <div className="total-amount" id="total-amount">₹{plans[selectedPlan].PriceText}</div>
                                            <div className="total-sub" id="total-period">billed once · valid {plans[selectedPlan].ValidityText}</div>
                                        </div>
                                    </div>

                                    <button className="cta-btn" onClick={() => handleCreateOrder(selectedPlan)}>Renew {plans[selectedPlan].Name} — Get Both Tools →</button>
                                    <div className="secure-row">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L2 3v3c0 2.2 1.7 4.3 4 4.9C8.3 10.3 10 8.2 10 6V3L6 1z" fill="#9CA3AF" /></svg>
                                        Secure payment · Cancel anytime · Instant access
                                    </div>
                                </>
                            }
                        </div>

                        <div className="social-strip">
                            <div style={{ display: 'flex', gap: '-6px' }}>
                                <div className="avatar" style={{ background: '#1D4ED8' }}>A</div>
                                <div className="avatar" style={{ background: '#059669', marginLeft: '-8px' }}>S</div>
                                <div className="avatar" style={{ background: '#9333EA', marginLeft: '-8px' }}>R</div>
                            </div>
                            <p className="social-text"><strong>Anirudh B. tailored 31 resumes, got callbacks from 9–11 recruiters</strong> and is in 2nd round interviews. Most users who use both tools see responses within 2 weeks.</p>
                        </div>

                    </div>
                </div>
            </div>
        </Modal>
    )
}

const displayOrder = [1, 3];