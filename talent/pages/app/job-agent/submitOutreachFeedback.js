import axios from 'axios';
import { API_OUTREACH_FEEDBACK } from '../../../components/Constant';

/**
 * Submit Happpy product feedback to talent/outreach/feedback.
 * Strips client-only keys (negative_reasons / negative_detail) and maps them
 * to helped_most / fix_feedback when present.
 */
export async function submitOutreachFeedback(payload) {
    const bodyPayload = { ...payload };

    if (Array.isArray(bodyPayload.negative_reasons) && bodyPayload.negative_reasons.length) {
        bodyPayload.helped_most = bodyPayload.negative_reasons;
    }
    if (bodyPayload.negative_detail) {
        bodyPayload.fix_feedback = bodyPayload.negative_detail;
    }
    delete bodyPayload.negative_reasons;
    delete bodyPayload.negative_detail;

    const token = localStorage.getItem('token');
    const res = await axios.post(API_OUTREACH_FEEDBACK, bodyPayload, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });

    const body = res?.data || {};
    if (body.status !== 'success') {
        throw new Error(body.message || 'Failed to submit feedback.');
    }
    return body;
}
