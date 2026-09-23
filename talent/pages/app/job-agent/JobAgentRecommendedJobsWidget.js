'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { useDispatch } from 'react-redux';
import { API_GET_RECOMMENDED_JOBS, API_SINGLE_OPP } from '../../../components/Constant';
import { GET_API, renderTextWithLinks } from '../../../components/Helper';
import { withHapppyAgentInfoQuery } from '../../../helpers/jobPath';
import { submitAutoRunRequest } from '../../../store/actions/UserActions';
import './JobAgentRecommendedJobsWidget.css';

function unwrapApiData(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) {
        return body.data;
    }
    return null;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


function formatYoe(min, max) {
    const low = Number(min) || 0;
    const high = Number(max) || 0;
    if (low === 0 && high === 0) return 'N/A';
    if (low === 0 && high !== 0) return `${high.toFixed(2)} yrs`;
    if (low !== 0 && high === 0) return `${low.toFixed(2)} yrs`;
    return `${low.toFixed(2)}-${high.toFixed(2)} yrs`;
}


function formatDescriptionHtml(raw, fallbackText) {
    const input = String(raw || '').trim();
    if (!input) {
        return `<p>${escapeHtml(fallbackText)}</p>`;
    }

    // Strip executable tags while preserving formatting tags from JD HTML.
    const safe = input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    if (/[<][a-zA-Z!/]/.test(safe)) {
        return safe;
    }

    return `<p>${escapeHtml(safe).replace(/\n/g, '<br/>')}</p>`;
}

const CompanyIcon = (props) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 9h2M8 13h2M14 9h2M14 13h2M11 20v-3h2v3" />
    </svg>
);

function normalizeCompanyLogo(value) {
    if (typeof value !== 'string') return '';
    const cleaned = value.trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'na') return '';
    return cleaned;
}

const JobAgentRecommendedJobsWidget = ({ maxItems = 10, showViewAll = false, compact = false, className = '' }) => {
    const dispatch = useDispatch();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runningJobId, setRunningJobId] = useState(null);
    const [brokenCompanyLogos, setBrokenCompanyLogos] = useState({});
    const [error, setError] = useState('');
    const [runResult, setRunResult] = useState('');
    const [jobModal, setJobModal] = useState({
        open: false,
        loading: false,
        title: '',
        company: '',
        descriptionHtml: '',
        applyUrl: '',
    });

    useEffect(() => {
        let cancelled = false;

        const loadJobs = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await GET_API(withHapppyAgentInfoQuery(`${API_GET_RECOMMENDED_JOBS}?limit=10`));
                if (cancelled) return;
                const data = unwrapApiData(response);
                setJobs(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) {
                    setJobs([]);
                    setError('Unable to load recommended jobs right now.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadJobs();
        return () => {
            cancelled = true;
        };
    }, []);

    const displayJobs = useMemo(() => jobs.slice(0, Math.max(1, maxItems)), [jobs, maxItems]);
    const skeletonItems = useMemo(
        () => Array.from({ length: Math.max(1, maxItems) }, (_, i) => i),
        [maxItems]
    );
    const getJobStableKey = (job, idx = 0) => {
        if (job?.id != null) return `id-${job.id}`;
        if (job?.HR_Number != null) return `hr-${job.HR_Number}`;
        if (job?.apply_url) return `url-${job.apply_url}`;
        return `idx-${idx}`;
    };

    const onRunReferralAgent = async (jobId) => {
        setRunningJobId(jobId);
        setRunResult('');
        setError('');
        try {
            const response = await dispatch(
                submitAutoRunRequest({
                    job_id: jobId,
                    source: 'recommended-job dashboard',
                })
            );
            const message = response?.data?.message || 'Happpy Agent started successfully.';
            setRunResult(message);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to run Happpy Agent.');
        } finally {
            setRunningJobId(null);
        }
    };

    const openJobDescription = async (job) => {
        const defaultDescription = 'Job description is not available for this role right now.';
        setJobModal({
            open: true,
            loading: true,
            title: job?.RequestForTalent || 'Role',
            company: job?.company_name || 'Company',
            descriptionHtml: `<p>${escapeHtml(defaultDescription)}</p>`,
            applyUrl: job?.apply_url || '',
        });

        try {
            const hrNumber = job?.HR_Number;
            if (!hrNumber) {
                setJobModal((prev) => ({ ...prev, loading: false }));
                return;
            }
            const response = await GET_API(withHapppyAgentInfoQuery(`${API_SINGLE_OPP}?hr_number=${encodeURIComponent(hrNumber)}`));
            const payload = response?.data || {};
            const descriptionRaw =
                payload?.JobDescription ??
                payload?.job_description ??
                payload?.Description ??
                payload?.description ??
                payload?.job_details?.description ??
                payload?.hr_detail?.description ??
                payload?.hr_detail?.job_description ??
                '';

            setJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatDescriptionHtml(descriptionRaw, defaultDescription),
            }));
        } catch {
            setJobModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const closeJobDescription = () => {
        setJobModal((prev) => ({ ...prev, open: false }));
    };

    return (
        <section
            className={`jad-rec-jobs${compact ? ' jad-rec-jobs--compact' : ''}${className ? ` ${className}` : ''}`}
            aria-label="Recommended jobs"
        >
            <header className="jad-rec-jobs__head">
                <div>
                    <h2 className="jad-rec-jobs__title">Recommended Jobs</h2>
                    <p className="jad-rec-jobs__subtitle">Top matches to quickly run your Happpy Agent.</p>
                </div>
            </header>

            {runResult ? <p className="jad-rec-jobs__result">{runResult}</p> : null}
            {error ? (
                <p className="jad-rec-jobs__error">{renderTextWithLinks(error, 'jad-rec-jobs__error-link')}</p>
            ) : null}

            <div className="jad-rec-jobs__list" aria-busy={loading}>
                {loading ? (
                    skeletonItems.map((key) => (
                        <article key={key} className="jad-rec-jobs__item jad-rec-jobs__item--skeleton" aria-hidden>
                            <div className="jad-rec-jobs__item-main">
                                <span className="jad-rec-jobs__skel-logo" />
                                <div className="jad-rec-jobs__meta">
                                    <span className="jad-rec-jobs__skel-line jad-rec-jobs__skel-line--title" />
                                    <span className="jad-rec-jobs__skel-line jad-rec-jobs__skel-line--company" />
                                    <span className="jad-rec-jobs__skel-line jad-rec-jobs__skel-line--extras" />
                                </div>
                            </div>
                            <span className="jad-rec-jobs__skel-line jad-rec-jobs__skel-line--btn" />
                        </article>
                    ))
                ) : displayJobs.length === 0 ? (
                    <p className="jad-rec-jobs__empty">No recommended jobs found right now.</p>
                ) : (
                    displayJobs.map((job, idx) => {
                        const jobStableKey = getJobStableKey(job, idx);
                        const logoUrl = normalizeCompanyLogo(job.company_logo);
                        const hasValidCompanyLogo = !!logoUrl && !brokenCompanyLogos[jobStableKey];
                        return (
                        <article key={jobStableKey} className="jad-rec-jobs__item">
                            <div className="jad-rec-jobs__item-main">
                                <div className="jad-rec-jobs__logo-wrap">
                                    {hasValidCompanyLogo ? (
                                        <>
                                            <img
                                                className="jad-rec-jobs__logo"
                                                src={logoUrl}
                                                alt=""
                                                width={36}
                                                height={36}
                                                onLoad={(e) => {
                                                    e.currentTarget.style.display = 'block';
                                                    const fallback = e.currentTarget.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'none';
                                                }}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    const fallback = e.currentTarget.nextElementSibling;
                                                    if (fallback) fallback.style.display = 'inline-flex';
                                                    setBrokenCompanyLogos((prev) => ({ ...prev, [jobStableKey]: true }));
                                                }}
                                            />
                                            <span
                                                className="jad-rec-jobs__logo-placeholder"
                                                aria-hidden
                                                style={{ display: 'none' }}
                                            >
                                                <CompanyIcon />
                                            </span>
                                        </>
                                    ) : (
                                        <span className="jad-rec-jobs__logo-placeholder" aria-hidden>
                                            <CompanyIcon />
                                        </span>
                                    )}
                                </div>
                                <div className="jad-rec-jobs__meta">
                                    <h3 className="jad-rec-jobs__job-title">{job.RequestForTalent || 'Role'}</h3>
                                    <p className="jad-rec-jobs__company">{job.company_name || 'Company'}</p>
                                    <p className="jad-rec-jobs__extras">
                                        {[job.city, job.ModeOfWork, ` ${formatYoe(job.YearOfExp, job.max_yoe)}`]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                </div>
                            </div>
                            <div className="jad-rec-jobs__item-actions">
                                <button
                                    type="button"
                                    className="jad-rec-jobs__run-btn"
                                    onClick={() => onRunReferralAgent(job.id)}
                                    disabled={runningJobId != null}
                                >
                                    {runningJobId === job.id ? 'Running...' : 'Run Agent'}
                                </button>
                                {job.apply_url ? (
                                    <a
                                        className="jad-rec-jobs__view-link"
                                        href={job.apply_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Job
                                    </a>
                                ) : (
                                    <button
                                        type="button"
                                        className="jad-rec-jobs__view-link"
                                        onClick={() => openJobDescription(job)}
                                    >
                                        View Job
                                    </button>
                                )}
                            </div>
                        </article>
                        );
                    })
                )}
            </div>

            {showViewAll ? (
                <div className="jad-rec-jobs__foot">
                    <Link className="jad-rec-jobs__all-link" to="/talent/job-agent/recommended-jobs">
                        View all recommended jobs
                    </Link>
                </div>
            ) : null}

            {jobModal.open ? (
                <div className="jad-rec-jobs__modal-backdrop" role="presentation" onClick={closeJobDescription}>
                    <div
                        className="jad-rec-jobs__modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Job description"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="jad-rec-jobs__modal-head">
                            <div>
                                <h3 className="jad-rec-jobs__modal-title">{jobModal.title}</h3>
                                <p className="jad-rec-jobs__modal-company">{jobModal.company}</p>
                            </div>
                            <button type="button" className="jad-rec-jobs__modal-close" onClick={closeJobDescription}>
                                ×
                            </button>
                        </div>

                        <div className="jad-rec-jobs__modal-body">
                            {jobModal.loading ? (
                                <p className="jad-rec-jobs__modal-text">Loading description...</p>
                            ) : (
                                <div
                                    className="jad-rec-jobs__modal-text"
                                    dangerouslySetInnerHTML={{ __html: jobModal.descriptionHtml }}
                                />
                            )}
                        </div>

                        <div className="jad-rec-jobs__modal-foot">
                            {jobModal.applyUrl ? (
                                <a
                                    className="jad-rec-jobs__modal-open-link"
                                    href={jobModal.applyUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open full job
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default JobAgentRecommendedJobsWidget;
