import toast from 'react-hot-toast';
import { startOutreachAgent } from '../store/actions/UserActions';

/**
 * Runs Happpy Agent from ReferralAgentPreviewModal onConfirm.
 * Returns a promise so the preview modal can show AgentRunSuccessModal on success.
 */
export async function runOutreachAgentFromPreviewConfirm(
    dispatch,
    {
        hrEncId,
        source,
        payloadHtml = '',
        linkedin_message_id = null,
        gmail_message_id = null,
        why_good_fit = '',
    },
) {
    if (!hrEncId) {
        const message = 'Job details are still loading. Please try again.';
        toast.error(message);
        throw new Error(message);
    }

    const payload = {
        hr_id: hrEncId,
        source,
        why_good_fit,
        is_tailored: !!payloadHtml,
        ...(payloadHtml ? { html: payloadHtml } : {}),
        ...(linkedin_message_id ? { linkedin_message_id } : {}),
        ...(gmail_message_id ? { gmail_message_id } : {}),
    };

    const res = await startOutreachAgent(payload)(dispatch);
    const status = res?.data?.status;

    if (status === 'redirect') {
        const message = 'Please connect your Gmail and LinkedIn accounts to use the Happpy Agent.';
        toast.error(message);
        throw new Error(message);
    }

    if (status !== 'success') {
        const message = res?.data?.message || 'Something went wrong. Please try again.';
        toast.error(message);
        throw new Error(message);
    }

    return res;
}
