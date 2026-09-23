'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from '@/talent/navigation/routerCompat';
import { useDispatch, useSelector } from 'react-redux';
import {
    API_GET_RECOMMENDED_JOBS,
    API_SINGLE_OPP,
    APP_URL,
} from '../../../components/Constant';
import { GET_API, renderTextWithLinks } from '../../../components/Helper';
import { withHapppyAgentInfoQuery } from '../../../helpers/jobPath';
import { submitAutoRunRequest } from '../../../store/actions/UserActions';
import './JobAgentRecommendedJobs.css';

const PAGE_SIZE = 4;
const MAX_QUEUE_LIMIT = 30;
const SKELETON_CARD_COUNT = 4;
const DEFAULT_DESCRIPTION_FALLBACK = 'Job description is not available for this role right now.';

const MatIcon = ({ name, className = '', filled, ...rest }) => (
    <span
        className={`material-symbols-outlined${filled ? ' jad-icon--fill' : ''}${className ? ` ${className}` : ''}`}
        {...rest}
    >
        {name}
    </span>
);

function formatPostedAgo(value) {
    if (!value) return '';
    const dt = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return '';

    const diffMs = Date.now() - dt.getTime();
    if (diffMs < 0) return 'Just now';

    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;

    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

function formatYoe(min, max) {
    const low = Number(min) || 0;
    const high = Number(max) || 0;
    if (low === 0 && high === 0) return 'N/A';
    if (low === 0 && high !== 0) return `${high.toFixed(2)} yrs`;
    if (low !== 0 && high === 0) return `${low.toFixed(2)} yrs`;
    return `${low.toFixed(2)}-${high.toFixed(2)} yrs`;
}

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

function formatDescriptionHtml(raw, fallbackText) {
    const input = String(raw || '').trim();
    if (!input) return `<p>${escapeHtml(fallbackText)}</p>`;

    const safe = input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

    if (/[<][a-zA-Z!/]/.test(safe)) return safe;
    return `<p>${escapeHtml(safe).replace(/\n/g, '<br/>')}</p>`;
}

function normalizeCompanyLogo(value) {
    if (typeof value !== 'string') return '';
    const cleaned = value.trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'na') return '';
    return cleaned;
}

function JobDescriptionModal({ jobModal, onClose }) {
    useEffect(() => {
        if (!jobModal.open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [jobModal.open]);

    useEffect(() => {
        if (!jobModal.open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [jobModal.open, onClose]);

    if (!jobModal.open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="jad-rec-page__modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="jad-rec-page__modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="jad-rec-modal-title"
                aria-describedby="jad-rec-modal-body"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="jad-rec-page__modal-head">
                    <div className="jad-rec-page__modal-heading">
                        <h3 id="jad-rec-modal-title" className="jad-rec-page__modal-title">
                            {jobModal.title}
                        </h3>
                        <p className="jad-rec-page__modal-company">{jobModal.company}</p>
                    </div>
                    <button
                        type="button"
                        className="jad-rec-page__modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <MatIcon name="close" aria-hidden />
                    </button>
                </div>

                <div id="jad-rec-modal-body" className="jad-rec-page__modal-body">
                    {jobModal.loading ? (
                        <p className="jad-rec-page__empty">Loading description...</p>
                    ) : (
                        <div
                            className="jad-rec-page__description-html"
                            dangerouslySetInnerHTML={{ __html: jobModal.descriptionHtml }}
                        />
                    )}
                </div>

                {jobModal.applyUrl ? (
                    <div className="jad-rec-page__modal-foot">
                        <a
                            className="jad-rec-page__btn jad-rec-page__btn--ghost"
                            href={jobModal.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open full job
                        </a>
                    </div>
                ) : null}
            </div>
        </div>,
        document.body
    );
}

const JobAgentRecommendedJobs = () => {
    const dispatch = useDispatch();
    const dailyLimit = useSelector((state) => state.happpyAgent.dailyLimit);
    const dailyLimitLoading = useSelector((state) => state.happpyAgent.dailyReferralRunsLoading);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [queueingJobId, setQueueingJobId] = useState(null);
    const [queuedJobIds, setQueuedJobIds] = useState({});
    const [runResult, setRunResult] = useState('');
    const [brokenCompanyLogos, setBrokenCompanyLogos] = useState({});
    const [page, setPage] = useState(1);
    const [jobModal, setJobModal] = useState({
        open: false,
        loading: false,
        title: '',
        company: '',
        descriptionHtml: '',
        applyUrl: '',
    });
    const [planType, setPlanType] = useState('free');

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await GET_API(withHapppyAgentInfoQuery(`${API_GET_RECOMMENDED_JOBS}?limit=15`));
                if (cancelled) return;
                const data = unwrapApiData(response);
                setJobs(Array.isArray(data) ? data : []);
                setPage(1);
                setPlanType(response?.data?.plan?.type || 'free');
            } catch {
                if (!cancelled) {
                    setJobs([]);
                    setError('Unable to load recommended jobs right now.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const onAddToQueue = async (jobId) => {
        setQueueingJobId(jobId);
        setRunResult('');
        setError('');
        try {
            const response = await dispatch(
                submitAutoRunRequest({
                    job_id: jobId,
                    source: 'recommended-job page',
                })
            );
            setRunResult(response?.data?.message || 'Job added to referral queue.');
            setQueuedJobIds((prev) => ({ ...prev, [jobId]: true }));
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to add job to referral queue.');
        } finally {
            setQueueingJobId(null);
        }
    };

    const openJobDescription = async (job) => {
        setJobModal({
            open: true,
            loading: true,
            title: job?.RequestForTalent || 'Role',
            company: job?.company_name || 'Company',
            descriptionHtml: `<p>${escapeHtml(DEFAULT_DESCRIPTION_FALLBACK)}</p>`,
            applyUrl: job?.apply_url || '',
        });

        const inlineDescription = job?.description || '';
        if (inlineDescription) {
            setJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatDescriptionHtml(inlineDescription, DEFAULT_DESCRIPTION_FALLBACK),
            }));
            return;
        }

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
                descriptionHtml: formatDescriptionHtml(descriptionRaw, DEFAULT_DESCRIPTION_FALLBACK),
            }));
        } catch {
            setJobModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const closeJobDescription = useCallback(() => {
        setJobModal((prev) => ({ ...prev, open: false }));
    }, []);

    const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const queuedCount = Object.keys(queuedJobIds).length;
    const queueFull = queuedCount >= MAX_QUEUE_LIMIT;
    const pageStart = jobs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const pageEnd = Math.min(currentPage * PAGE_SIZE, jobs.length);
    const skeletonCards = useMemo(
        () => Array.from({ length: SKELETON_CARD_COUNT }, (_, idx) => idx),
        []
    );
    const pagedJobs = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return jobs.slice(start, start + PAGE_SIZE);
    }, [jobs, currentPage]);

    const dailyLimitLabel =
        loading || dailyLimitLoading ? null : `${dailyLimit > 0 ? dailyLimit : '-'}/day`;
    const displayDailyLimit = dailyLimit > 0 ? dailyLimit : '-';
    const limitsNote =
        planType === 'free'
            ? `Happpy Agent processes up to ${displayDailyLimit} jobs per day. Upgrade to a paid plan for 8 applications per day and Queue Mode.`
            : `Happpy Agent processes up to ${displayDailyLimit} jobs per day. Once you reach your daily limit, remaining jobs are automatically queued for the following days.`;

    const goToPage = (next) => {
        const target = Math.min(Math.max(1, next), totalPages);
        if (target === currentPage) return;
        setPage(target);
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getJobStableKey = (job, idx = 0) => {
        if (job?.id != null) return `id-${job.id}`;
        if (job?.HR_Number != null) return `hr-${job.HR_Number}`;
        if (job?.apply_url) return `url-${job.apply_url}`;
        return `idx-${idx}`;
    };

    const renderJobCard = (job, idx, skeleton = false) => {
        if (skeleton) {
            return (
                <article key={idx} className="jad-rec-page__card jad-rec-page__card--skeleton" aria-hidden>
                    <div className="jad-rec-page__card-main">
                        <span className="jad-rec-page__logo-wrap">
                            <span className="jad-rec-page__logo-placeholder jad-rec-page__logo-placeholder--skeleton" />
                        </span>
                        <div className="jad-rec-page__info">
                            <span className="jad-rec-page__skel-line jad-rec-page__skel-line--title" />
                            <span className="jad-rec-page__skel-line jad-rec-page__skel-line--company" />
                            <div className="jad-rec-page__meta">
                                <span className="jad-rec-page__skel-line jad-rec-page__skel-line--chip" />
                                <span className="jad-rec-page__skel-line jad-rec-page__skel-line--chip" />
                                <span className="jad-rec-page__skel-line jad-rec-page__skel-line--chip-lg" />
                            </div>
                        </div>
                    </div>
                    <div className="jad-rec-page__actions">
                        <span className="jad-rec-page__skel-line jad-rec-page__skel-line--btn" />
                        <span className="jad-rec-page__skel-line jad-rec-page__skel-line--btn" />
                    </div>
                </article>
            );
        }

        const isQueued = !!queuedJobIds[job.id];
        const isQueueing = queueingJobId === job.id;
        const jobStableKey = getJobStableKey(job, idx);
        const logoUrl = normalizeCompanyLogo(job.company_logo);
        const hasValidCompanyLogo = !!logoUrl && !brokenCompanyLogos[jobStableKey];
        const yoeText = formatYoe(job.YearOfExp, job.max_yoe);
        const postedAgo = formatPostedAgo(job.publish_datetime);
        const modeLabel = job.ModeOfWork ? `Office: ${job.ModeOfWork}` : '';

        return (
            <article key={jobStableKey} className="jad-rec-page__card">
                <div className="jad-rec-page__card-main">
                    <span className="jad-rec-page__logo-wrap">
                        {hasValidCompanyLogo ? (
                            <>
                                <img
                                    className="jad-rec-page__logo"
                                    src={logoUrl}
                                    alt=""
                                    width={28}
                                    height={28}
                                    onError={() => {
                                        setBrokenCompanyLogos((prev) => ({ ...prev, [jobStableKey]: true }));
                                    }}
                                />
                                <span className="jad-rec-page__logo-placeholder" aria-hidden style={{ display: 'none' }}>
                                    <MatIcon name="business" />
                                </span>
                            </>
                        ) : (
                            <span className="jad-rec-page__logo-placeholder" aria-hidden>
                                <MatIcon name="business" />
                            </span>
                        )}
                    </span>
                    <div className="jad-rec-page__info">
                        <h3 className="jad-rec-page__job-title">{job.RequestForTalent || 'Role'}</h3>
                        <p className="jad-rec-page__company">{job.company_name || 'Company'}</p>
                        <ul className="jad-rec-page__meta">
                            {job.city ? (
                                <li className="jad-rec-page__meta-item" title="Location">
                                    <MatIcon name="location_on" aria-hidden />
                                    <span>{job.city}</span>
                                </li>
                            ) : null}
                            {modeLabel ? (
                                <li className="jad-rec-page__meta-item" title="Mode of work">
                                    <MatIcon name="apartment" aria-hidden />
                                    <span>{modeLabel}</span>
                                </li>
                            ) : null}
                            <li className="jad-rec-page__meta-item" title="Experience">
                                <MatIcon name="work" aria-hidden />
                                <span>{yoeText}</span>
                            </li>
                            {postedAgo ? (
                                <li
                                    className="jad-rec-page__meta-item"
                                    title={`Published ${job.publish_datetime || ''}`}
                                >
                                    <MatIcon name="schedule" aria-hidden />
                                    <span>Posted: {postedAgo}</span>
                                </li>
                            ) : null}
                        </ul>
                    </div>
                </div>

                <div className="jad-rec-page__actions">
                    <button
                        type="button"
                        className="jad-rec-page__btn jad-rec-page__btn--ghost"
                        onClick={() => openJobDescription(job)}
                    >
                        View Description
                    </button>
                    <button
                        type="button"
                        className="jad-rec-page__btn jad-rec-page__btn--primary"
                        onClick={() => onAddToQueue(job.id)}
                        disabled={
                            isQueueing ||
                            isQueued ||
                            queueingJobId != null ||
                            (queueFull && !isQueued)
                        }
                    >
                        {isQueueing
                            ? 'Running...'
                            : queueFull && !isQueued
                              ? 'Queue Full'
                              : isQueued
                                ? 'Queueing...'
                                : 'Run Agent'}
                    </button>
                </div>
            </article>
        );
    };

    useEffect(() => {
        document.title = 'Recommended jobs | Happpy Agent | Uplers';
    }, []);

    return (
        <>
            <div className="jad-rec-page">
                <section className="jad-rec-page__hero" aria-labelledby="jad-rec-hero-title">
                    <div className="jad-rec-page__hero-main">
                        <p className="jad-rec-page__eyebrow">
                            <MatIcon name="star" filled className="jad-rec-page__eyebrow-icon" aria-hidden />
                            Smart Job Matching
                        </p>
                        <h1 id="jad-rec-hero-title" className="jad-rec-page__title">
                            Recommended Jobs
                        </h1>
                        <p className="jad-rec-page__subtitle">
                            Curated opportunities aligned with your profile. Review roles, inspect full descriptions,
                            and add the best-fit jobs to your referral queue.
                        </p>
                    </div>

                    <div className="jad-rec-page__limit-card" role="note" aria-label="Agent run limits">
                        <div className="jad-rec-page__limit-head">
                            <div>
                                <p className="jad-rec-page__stat-label">Daily run limit</p>
                                <p className="jad-rec-page__stat-value">
                                    {loading ? (
                                        <span
                                            className="jad-rec-page__skel-line jad-rec-page__skel-line--stat"
                                            aria-hidden
                                        />
                                    ) : (
                                        dailyLimitLabel
                                    )}
                                </p>
                            </div>
                            <div className="jad-rec-page__limit-ring" aria-hidden />
                        </div>
                        <p className="jad-rec-page__limits-note">
                            {loading ? (
                                <span
                                    className="jad-rec-page__skel-line jad-rec-page__skel-line--panel-subtitle"
                                    aria-hidden
                                />
                            ) : (
                                limitsNote
                            )}
                        </p>
                        {planType === 'free' ? (
                            <Link className="jad-rec-page__upgrade-btn" to="/talent/job-agent/subscription">
                                Upgrade Plan
                            </Link>
                        ) : null}
                    </div>
                </section>

                {runResult ? <p className="jad-rec-page__result">{runResult}</p> : null}
                {error ? (
                    <p className="jad-rec-page__error">{renderTextWithLinks(error, 'jad-rec-page__error-link')}</p>
                ) : null}

                <section className="jad-rec-page__opportunities" aria-labelledby="jad-rec-opportunities-title">
                    <div className="jad-rec-page__panel-head">
                        <h2 id="jad-rec-opportunities-title" className="jad-rec-page__panel-title">
                            Open Opportunities
                        </h2>
                        <div className="jad-rec-page__panel-head-actions">
                            <p className="jad-rec-page__panel-subtitle">
                                {loading ? (
                                    <span
                                        className="jad-rec-page__skel-line jad-rec-page__skel-line--panel-subtitle"
                                        aria-hidden
                                    />
                                ) : (
                                    `Showing ${pageStart}-${pageEnd} of ${jobs.length}`
                                )}
                            </p>
                            <a
                                className="jad-rec-page__panel-more"
                                href={`${APP_URL}talent/all-opportunities`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                More Jobs
                            </a>
                        </div>
                    </div>

                    <div className="jad-rec-page__list" aria-label="Recommended jobs list" aria-busy={loading}>
                        {loading
                            ? skeletonCards.map((card) => renderJobCard(null, card, true))
                            : jobs.length === 0
                              ? (
                                    <div className="jad-rec-page__empty-state">
                                        <p className="jad-rec-page__empty-copy">
                                            We are refreshing job matches continuously. Please check again shortly for
                                            new roles.
                                        </p>
                                    </div>
                                )
                              : pagedJobs.map((job, idx) => renderJobCard(job, idx))}
                    </div>
                </section>

                {!loading && jobs.length > 0 && totalPages > 1 ? (
                    <nav className="jad-rec-page__pagination" aria-label="Recommended jobs pagination">
                        <button
                            type="button"
                            className="jad-rec-page__page-btn"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            ‹ Prev
                        </button>
                        <ul className="jad-rec-page__page-list">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <li key={p}>
                                    <button
                                        type="button"
                                        className={`jad-rec-page__page-num${p === currentPage ? ' jad-rec-page__page-num--active' : ''}`}
                                        onClick={() => goToPage(p)}
                                        aria-current={p === currentPage ? 'page' : undefined}
                                    >
                                        {p}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            type="button"
                            className="jad-rec-page__page-btn"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            Next ›
                        </button>
                    </nav>
                ) : null}
            </div>

            <JobDescriptionModal jobModal={jobModal} onClose={closeJobDescription} />
        </>
    );
};

export default JobAgentRecommendedJobs;
