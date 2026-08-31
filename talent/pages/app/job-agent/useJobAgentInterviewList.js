import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../../../components/Constant';
import { GET_API, POST_API } from '../../../components/Helper';

export function useJobAgentInterviewList({ detailed = false } = {}) {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submittingFeedback, setSubmittingFeedback] = useState(null);
    const [feedbackError, setFeedbackError] = useState('');

    const loadInterviewList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await GET_API(
                `${API_URL}talent/outreach/interview-list${detailed ? '?detailed=true' : ''}`
            );
            const body = res?.data;
            const list = body?.status === 'success' && Array.isArray(body.data) ? body.data : [];
            setCompanies(list);
        } catch {
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    }, [detailed]);

    useEffect(() => {
        loadInterviewList();
    }, [loadInterviewList]);

    const submitFeedback = useCallback(async (companyId, feedback) => {
        setFeedbackError('');
        setSubmittingFeedback({ companyId, feedback });
        try {
            const res = await POST_API(`${API_URL}talent/outreach/interview-feedback`, {
                company_id: companyId,
                feedback,
            });
            const body = res?.data;
            if (body?.status === 'success') {
                setCompanies((prev) =>
                    prev.map((company) =>
                        company.company_id === companyId
                            ? { ...company, feedback }
                            : company
                    )
                );
                return true;
            }
            setFeedbackError(body?.message || 'Unable to submit feedback. Please try again.');
            return false;
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.feedback?.[0] ||
                'Unable to submit feedback. Please try again.';
            setFeedbackError(message);
            return false;
        } finally {
            setSubmittingFeedback(null);
        }
    }, []);

    return {
        companies,
        loading,
        submittingFeedback,
        feedbackError,
        submitFeedback,
        clearFeedbackError: () => setFeedbackError(''),
    };
}

export function isInterviewFeedback(feedback) {
    return feedback == null || feedback === 'yes';
}

export function isFalseInterviewFeedback(feedback) {
    return feedback === 'no';
}

export function countInterviewFeedback(companies) {
    return companies.filter((company) => isInterviewFeedback(company.feedback)).length;
}

export function countFalseInterviewFeedback(companies) {
    return companies.filter((company) => isFalseInterviewFeedback(company.feedback)).length;
}

export function filterCompaniesByFeedbackView(companies, view) {
    if (view === 'false') {
        return companies.filter((company) => isFalseInterviewFeedback(company.feedback));
    }
    return companies.filter((company) => isInterviewFeedback(company.feedback));
}
