'use client';

import toast from 'react-hot-toast';
import { API_URL } from '../components/Constant';
import { POST_API } from '../components/Helper';
import { getProfilePercent } from '../store/actions/UserActions';

export function outreachTrialPaid(user) {
    const outreach = user?.outreach ?? user?.userdata?.outreach ?? user?.userData?.outreach;
    return Boolean(outreach?.onboard_with_agent || outreach?.payment_received);
}

/** Paid ₹99 trial or a purchased agent/tailor plan — used to unlock onboarding payment step. */
export function publicSignupPaymentComplete(user) {
    if (outreachTrialPaid(user)) {
        return true;
    }
    const rt = user?.resume_tailored;
    if (rt && (rt.is_tailored_paid || rt.payment_received)) {
        return true;
    }
    const outreach = user?.outreach ?? user?.userdata?.outreach ?? user?.userData?.outreach;
    return Boolean(outreach?.is_outreach_paid || outreach?.payment_received);
}

export function isTalentApiSuccess(res) {
    if (!res || res.status !== 200) {
        return false;
    }
    const bodyStatus = res.data?.status;
    return bodyStatus === undefined || Number(bodyStatus) === 200;
}

function loadRazorpayScript(src) {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

/**
 * ₹99 Happpy Agent trial (`plan=trial`) via outreach payment APIs.
 * Returns true when the talent already paid or payment verified successfully.
 */
export async function payHappyAgentPublicTrial(dispatch, user) {
    const sessionUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (outreachTrialPaid(sessionUser) || outreachTrialPaid(user)) {
        return true;
    }

    const razorpaySDK = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!razorpaySDK) {
        toast.error('Razorpay SDK failed to load. Are you online?', { duration: 5000 });
        return false;
    }

    const result = await POST_API(`${API_URL}talent/outreach/submit-payment/trial`, {})
        .then((res) => res?.data?.data)
        .catch((err) => {
            toast.error(err?.response?.data?.message || 'Could not start payment. Please try again.', {
                duration: 5000,
            });
            return null;
        });

    if (!result) {
        return false;
    }

    const { id: order_id, amount, currency } = result;

    return new Promise((resolve) => {
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: amount.toString(),
            currency: currency || 'INR',
            name: result?.notes?.name || 'Happpy Agent',
            description: 'Happpy Agent trial — ₹99',
            order_id,
            handler: async function () {
                try {
                    const verifyPaymentResponse = await POST_API(`${API_URL}talent/outreach/verify-payment`, {
                        order_id,
                    });
                    if (isTalentApiSuccess(verifyPaymentResponse)) {
                        toast.success('Payment successful!', { duration: 5000 });
                        if (dispatch) {
                            await getProfilePercent(false)(dispatch);
                        }
                        resolve(true);
                    } else {
                        toast.error(
                            verifyPaymentResponse?.data?.message || 'Payment verification failed.',
                            { duration: 5000 }
                        );
                        resolve(false);
                    }
                } catch (err) {
                    toast.error(err?.response?.data?.message || 'Could not confirm payment.', { duration: 5000 });
                    resolve(false);
                }
            },
            modal: {
                escape: false,
                ondismiss: function () {
                    toast.error('Payment cancelled', { duration: 4000 });
                    resolve(false);
                },
            },
            prefill: {
                name: result?.notes?.name,
                email: result?.notes?.email,
            },
            theme: { color: '#0D94FB' },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
    });
}
