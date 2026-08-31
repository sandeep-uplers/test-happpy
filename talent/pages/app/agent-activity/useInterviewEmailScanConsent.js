import { useCallback, useEffect, useState } from 'react';
import { API_CONSENT_INTERVIEW_EMAIL_SCAN, API_URL } from '../../../components/Constant';
import { DELETE_API, GET_API, POST_API } from '../../../components/Helper';

const EMPTY_CONSENT_META = {
    has_consent: false,
    consent_interview_email_scan: null,
    gmail_connected: false,
    gmail_email: null,
};

export function useInterviewEmailScanConsent() {
    const [consentMeta, setConsentMeta] = useState(EMPTY_CONSENT_META);
    const [loading, setLoading] = useState(true);
    const [consentSaving, setConsentSaving] = useState(false);
    const [consentRevoking, setConsentRevoking] = useState(false);
    const [consentError, setConsentError] = useState('');

    const loadConsentMeta = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GET_API(`${API_URL}talent/outreach/interview-list`);
            const body = res?.data;
            if (body?.meta && typeof body.meta === 'object') {
                setConsentMeta({
                    ...EMPTY_CONSENT_META,
                    ...body.meta,
                });
            }
        } catch {
            setConsentMeta(EMPTY_CONSENT_META);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConsentMeta();
    }, [loadConsentMeta]);

    const grantInterviewScanConsent = useCallback(async () => {
        setConsentError('');
        setConsentSaving(true);
        try {
            const res = await POST_API(API_CONSENT_INTERVIEW_EMAIL_SCAN, {});
            const body = res?.data;
            if (body?.status === 'success' && body?.data) {
                setConsentMeta({
                    ...EMPTY_CONSENT_META,
                    ...body.data,
                });
                return true;
            }
            setConsentError(body?.message || 'Unable to save consent. Please try again.');
            return false;
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to save consent. Please try again.';
            setConsentError(message);
            return false;
        } finally {
            setConsentSaving(false);
        }
    }, []);

    const revokeInterviewScanConsent = useCallback(async () => {
        setConsentError('');
        setConsentRevoking(true);
        try {
            const res = await DELETE_API(API_CONSENT_INTERVIEW_EMAIL_SCAN);
            const body = res?.data;
            if (body?.status === 'success' && body?.data) {
                setConsentMeta({
                    ...EMPTY_CONSENT_META,
                    ...body.data,
                });
                return true;
            }
            setConsentError(body?.message || 'Unable to remove consent. Please try again.');
            return false;
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to remove consent. Please try again.';
            setConsentError(message);
            return false;
        } finally {
            setConsentRevoking(false);
        }
    }, []);

    return {
        consentMeta,
        loading,
        consentSaving,
        consentRevoking,
        consentError,
        grantInterviewScanConsent,
        revokeInterviewScanConsent,
        clearConsentError: () => setConsentError(''),
    };
}
