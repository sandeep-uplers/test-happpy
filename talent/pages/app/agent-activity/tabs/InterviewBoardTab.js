import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IMAGE_URL } from '../../../../components/Constant';
import {
    useJobAgentInterviewList,
} from '../../job-agent/useJobAgentInterviewList';
import InterviewEmailScanConsentPanel from './InterviewEmailScanConsentPanel';
import './InterviewBoardTab.css';

/**
 * Interview Board tab — 2-column kanban port of the standalone
 * JobAgentInterviewListPage, scoped to the Agent Activity nav.
 *
 * Reuses the existing data hook + endpoints; nothing new on the backend:
 *   GET  /talent/outreach/interview-list?detailed=true
 *   POST /talent/outreach/interview-feedback   body: { company_id, feedback }
 *
 * The detailed endpoint now returns one row per (company, job) so each agent
 * run lands on its own card, with `id`, `job_title`, and `applied_date`
 * surfaced for the new Figma layout. Non-detailed callers (dashboard tiles
 * + the interview-list widget) still receive unique-by-company rows.
 *
 * Column mapping (chosen because the POST endpoint only accepts `yes`/`no`
 * — there is no way to clear feedback back to null today):
 *   Pending column  = feedback === null  OR  feedback === 'no'
 *   Secured column  = feedback === 'yes'
 *
 * Items are NOT draggable. Pending cards have a "Yes, I Did" CTA that POSTs
 * feedback `yes`; Secured cards expose a kebab menu whose only action posts
 * feedback `no`. Feedback is stored per-company, so flipping one card flips
 * every (company, job) row that shares its company_id — the optimistic
 * update in `useJobAgentInterviewList.submitFeedback` handles that.
 */

const STATUS_LABELS = {
    screen_call: 'Screening call',
    interviewed_email: 'Interview email',
};

function statusLabel(status) {
    return STATUS_LABELS[status] || 'Interview opportunity';
}

/**
 * Format `YYYY-MM-DD` (or ISO) into the Figma "20 May'26" pattern. Returns an
 * empty string when the value is missing or unparseable so the meta row can
 * be hidden gracefully.
 */
function formatAppliedDate(input) {
    if (!input) return '';
    const raw = typeof input === 'string' && !input.includes('T') ? input.replace(' ', 'T') : input;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = String(d.getFullYear()).slice(-2);
    return `${day} ${month}'${year}`;
}

/** Mobile meta row — "28 May, 2026" (Figma 29246:28739). */
function formatAppliedDateMobile(input) {
    if (!input) return '';
    const raw = typeof input === 'string' && !input.includes('T') ? input.replace(' ', 'T') : input;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '';
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}, ${d.getFullYear()}`;
}

const PENDING_SKELETON_ITEMS = [0, 1, 2];
const SECURED_SKELETON_ITEMS = [0];

/**
 * Static list rendered inside the "Interview tips for you" dropdown card.
 * Copy is pulled verbatim from the Figma source so design and product can
 * keep editing without touching React.
 */
const INTERVIEW_TIPS = [
    "At every stage, be ready to clearly explain why you're interested in the specific company and role.",
    "Take time beforehand to think through how your goals and qualifications connect to the role you're interviewing for.",
    "Review the job description and research the company - its products, services, mission, history, and culture - so you can judge whether it's the right fit for you and your goals.",
    'Come prepared with your own questions. An interview goes both ways; this is your chance to interview them too.',
];

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
        {name}
    </span>
);

const Skel = ({ className = '', ...rest }) => (
    <span className={`aa-interview__skel ${className}`.trim()} aria-hidden {...rest} />
);

function CardLogo({ company }) {
    return (
        <span className="aa-interview__logo">
            {company.logo_url ? (
                <img
                    src={company.logo_url}
                    alt=""
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : (
                <MatIcon name="business" aria-hidden />
            )}
        </span>
    );
}

/**
 * "Interview tips for you" mascot dropdown — Figma node 29246:9208 (closed)
 * and 29246:9009 (open). The mascot art reuses the existing outreach
 * mascot SVG so we don't ship another copy of the same character.
 *
 * Behaviour:
 *   - Click the pill to toggle the tips card.
 *   - Click outside the wrapper, or hit Escape, to close.
 *   - The card is absolutely positioned so opening it never reflows the
 *     header / board grid below.
 */
function InterviewTipsDropdown() {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handlePointer = (event) => {
            if (!wrapperRef.current) return;
            if (wrapperRef.current.contains(event.target)) return;
            setOpen(false);
        };
        const handleKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handlePointer);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handlePointer);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    return (
        <div
            ref={wrapperRef}
            className={`aa-interview__tips${open ? ' aa-interview__tips--open' : ''}`}
        >
            <span className="aa-interview__tips-mascot" aria-hidden>
                <img src={IMAGE_URL + 'outreach/mascot-neutral.svg'} alt="" />
            </span>
            <button
                type="button"
                className="aa-interview__tips-button"
                aria-expanded={open}
                aria-haspopup="true"
                aria-controls="aa-interview-tips-card"
                onClick={() => setOpen((prev) => !prev)}
            >
                <span className="aa-interview__tips-label aa-interview__tips-label--desktop">
                    Interview tips for you
                </span>
                <span className="aa-interview__tips-label aa-interview__tips-label--mobile">
                    Important Interview Tips for you
                </span>
                <MatIcon
                    name="expand_more"
                    className="aa-interview__tips-chevron"
                    aria-hidden
                />
            </button>
            {open ? (
                <div
                    id="aa-interview-tips-card"
                    className="aa-interview__tips-card"
                    role="region"
                    aria-label="Key Interview Tips to Remember"
                >
                    <div className="aa-interview__tips-card-head">
                        <MatIcon
                            name="lightbulb"
                            className="aa-interview__tips-card-icon"
                            aria-hidden
                        />
                        <h4 className="aa-interview__tips-card-title">
                            Key Interview Tips to Remember
                        </h4>
                    </div>
                    <ul className="aa-interview__tips-card-list">
                        {INTERVIEW_TIPS.map((tip) => (
                            <li key={tip}>{tip}</li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}

function CardMeta({ appliedDate, mobile = false }) {
    const formatted = mobile
        ? formatAppliedDateMobile(appliedDate)
        : formatAppliedDate(appliedDate);
    if (!formatted) return null;
    return (
        <div className={`aa-interview__card-meta${mobile ? ' aa-interview__card-meta--mobile' : ''}`}>
            <MatIcon
                name={mobile ? 'schedule' : 'history'}
                className="aa-interview__card-meta-icon"
                aria-hidden
            />
            <span className="aa-interview__card-meta-label">Agent ran:</span>
            <span className="aa-interview__card-meta-date">{formatted}</span>
        </div>
    );
}

function PendingInterviewCard({
    company,
    onMoveToSecured,
    isSubmittingYes,
    isSubmitting,
    mobile = false,
}) {
    const companyId = company.company_id;
    const jobTitle = company.job_title;
    return (
        <article className={`aa-interview__card${mobile ? ' aa-interview__card--mobile' : ''}`}>
            <CardMeta appliedDate={company.applied_date} mobile={mobile} />
            <div className="aa-interview__card-top">
                <CardLogo company={company} />
                <div className="aa-interview__card-body">
                    <h4 className="aa-interview__company-name">
                        {company.company_name || 'Company'}
                    </h4>
                    {jobTitle ? (
                        <p className="aa-interview__job-title">{jobTitle}</p>
                    ) : (
                        <p className="aa-interview__company-meta">
                            {statusLabel(company.status)}
                        </p>
                    )}
                </div>
            </div>
            <div className={`aa-interview__prompt-row${mobile ? ' aa-interview__prompt-row--mobile' : ''}`}>
                <p className="aa-interview__prompt">Did you secure an interview?</p>
                <button
                    type="button"
                    className="aa-interview__btn aa-interview__btn--yes"
                    disabled={isSubmitting}
                    onClick={() => onMoveToSecured(companyId)}
                >
                    {isSubmittingYes ? 'Saving…' : 'Yes, I Did'}
                </button>
            </div>
        </article>
    );
}

function SecuredInterviewCard({
    company,
    onRevert,
    isSubmitting,
    mobile = false,
}) {
    const companyId = company.company_id;
    const jobTitle = company.job_title;
    return (
        <article
            className={`aa-interview__card aa-interview__card--secured${mobile ? ' aa-interview__card--mobile' : ''}`}
        >
            <CardMeta appliedDate={company.applied_date} />
            <div className="aa-interview__card-top">
                <CardLogo company={company} />
                <div className="aa-interview__card-body">
                    <h4 className="aa-interview__company-name">
                        {company.company_name || 'Company'}
                    </h4>
                    {jobTitle ? (
                        <p className="aa-interview__job-title">{jobTitle}</p>
                    ) : (
                        <p className="aa-interview__company-meta">
                            {statusLabel(company.status)}
                        </p>
                    )}
                </div>
            </div>
            <SecuredKebabMenu submitting={isSubmitting} onRevert={() => onRevert(companyId)} />
        </article>
    );
}

/**
 * Kebab dropdown shown on Secured cards (Figma node 29220:9763 open state).
 * Single action — "Change Status Back To Pending" — posts feedback `no`.
 * Mirrors the close-on-outside-click + Escape pattern used by
 * `InterviewTipsDropdown` above so the two popovers behave identically.
 */
function SecuredKebabMenu({ onRevert, submitting }) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const handlePointer = (event) => {
            if (!wrapperRef.current) return;
            if (wrapperRef.current.contains(event.target)) return;
            setOpen(false);
        };
        const handleKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handlePointer);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handlePointer);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const handleRevertClick = () => {
        if (submitting) return;
        setOpen(false);
        onRevert();
    };

    return (
        <div
            ref={wrapperRef}
            className={`aa-interview__kebab-wrap${open ? ' aa-interview__kebab-wrap--open' : ''}`}
        >
            <button
                type="button"
                className="aa-interview__kebab"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((prev) => !prev)}
                disabled={submitting}
            >
                <MatIcon name="more_vert" aria-hidden />
            </button>
            {open ? (
                <div className="aa-interview__kebab-menu" role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        className="aa-interview__kebab-menu-item"
                        onClick={handleRevertClick}
                        disabled={submitting}
                    >
                        {submitting ? 'Saving…' : 'Change Status Back To Pending'}
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function SkeletonCard({ variant }) {
    const isSecured = variant === 'secured';
    return (
        <article
            className={`aa-interview__card aa-interview__card--skeleton${isSecured ? ' aa-interview__card--secured' : ''
                }`}
            aria-hidden
        >
            <Skel className="aa-interview__skel--meta" />
            <div className="aa-interview__card-top">
                <Skel className="aa-interview__skel--logo" />
                <div className="aa-interview__card-body">
                    <Skel className="aa-interview__skel--name" />
                    <Skel className="aa-interview__skel--status" />
                </div>
            </div>
            {isSecured ? (
                <Skel className="aa-interview__skel--kebab" />
            ) : (
                <Skel className="aa-interview__skel--btn" />
            )}
        </article>
    );
}

const InterviewBoardTab = ({ onCountsFetched }) => {
    const {
        companies,
        loading,
        submittingFeedback,
        feedbackError,
        submitFeedback,
        clearFeedbackError,
    } = useJobAgentInterviewList({ detailed: true });

    const [mobileTab, setMobileTab] = useState('pending');

    const { pending, secured } = useMemo(() => {
        const p = [];
        const s = [];
        companies.forEach((company) => {
            if (company.feedback === 'yes') {
                s.push(company);
            } else {
                p.push(company);
            }
        });
        return { pending: p, secured: s };
    }, [companies]);

    /**
     * Lift the total count up to AgentActivity so the tab badge can render
     * even when this panel is unmounted. We push it on every change so
     * optimistic moves keep the badge in sync (total is stable; only the
     * column split changes).
     */
    useEffect(() => {
        if (loading) return;
        if (typeof onCountsFetched === 'function') {
            onCountsFetched(companies.length);
        }
    }, [companies.length, loading, onCountsFetched]);

    const handleMoveToSecured = (companyId) => {
        clearFeedbackError();
        submitFeedback(companyId, 'yes');
    };

    const handleMoveToPending = (companyId) => {
        clearFeedbackError();
        submitFeedback(companyId, 'no');
    };

    const isSubmittingFor = (companyId, feedback) =>
        submittingFeedback?.companyId === companyId &&
        submittingFeedback?.feedback === feedback;

    return (
        <div className="aa-interview">
            <header className="aa-interview__head">
                <div className="aa-interview__head-text">
                    <h2 className="aa-interview__title aa-interview__title--desktop">
                        Interview Board
                    </h2>
                    <p className="aa-interview__subtitle aa-interview__subtitle--desktop">
                        HAPPPY reached real people inside these companies for you. Which ones
                        turned into interviews?
                    </p>
                    <p className="aa-interview__mobile-lede">
                        Which of these outreaches by Happpy Agent led to interviews?
                    </p>
                </div>
            </header>

            {/* <div className="aa-interview__consent-row">
                <InterviewEmailScanConsentPanel />
            </div> */}

            {/*
              * Mobile tab bar (Figma 29259:12132) — swaps between Pending and
              * Interviews Secured inside a single stacked list. Hidden on
              * desktop where the 2-column kanban board is shown instead.
              */}
            <div className="aa-interview__tabs" role="tablist" aria-label="Interview board columns">
                <button
                    type="button"
                    role="tab"
                    id="aa-interview-tab-pending"
                    className={`aa-interview__tab${mobileTab === 'pending' ? ' aa-interview__tab--active' : ''}`}
                    aria-selected={mobileTab === 'pending'}
                    aria-controls="aa-interview-panel-pending"
                    onClick={() => setMobileTab('pending')}
                >
                    <span className="aa-interview__tab-label">Pending</span>
                    <span className="aa-interview__tab-badge aa-interview__tab-badge--pending" aria-hidden>
                        {loading ? '—' : pending.length}
                    </span>
                </button>
                <button
                    type="button"
                    role="tab"
                    id="aa-interview-tab-secured"
                    className={`aa-interview__tab${mobileTab === 'secured' ? ' aa-interview__tab--active' : ''}`}
                    aria-selected={mobileTab === 'secured'}
                    aria-controls="aa-interview-panel-secured"
                    onClick={() => setMobileTab('secured')}
                >
                    <span className="aa-interview__tab-label">Interviews Secured</span>
                    <span className="aa-interview__tab-badge aa-interview__tab-badge--secured" aria-hidden>
                        {loading ? '—' : secured.length}
                    </span>
                </button>
            </div>

            <div className="aa-interview__tips-row">
                <InterviewTipsDropdown />
            </div>

            {feedbackError ? (
                <p className="aa-interview__error" role="alert">
                    {feedbackError}
                </p>
            ) : null}

            <div className="aa-interview__board">
                <section
                    className="aa-interview__column"
                    aria-busy={loading}
                    aria-label="Pending interviews"
                >
                    <div className="aa-interview__column-head">
                        <span className="aa-interview__dot aa-interview__dot--pending" aria-hidden />
                        <h3 className="aa-interview__column-title">Pending</h3>
                        <span
                            className="aa-interview__count aa-interview__count--pending"
                            aria-hidden={loading ? 'true' : undefined}
                        >
                            {loading ? '—' : pending.length}
                        </span>
                    </div>

                    <div className="aa-interview__cards">
                        {loading ? (
                            PENDING_SKELETON_ITEMS.map((key) => (
                                <SkeletonCard key={key} variant="pending" />
                            ))
                        ) : pending.length === 0 ? (
                            <p className="aa-interview__empty">
                                No pending interviews right now. Run Happpy Agent on more jobs to
                                build your pipeline.
                            </p>
                        ) : (
                            pending.map((company) => {
                                const companyId = company.company_id;
                                const submittingYes = isSubmittingFor(companyId, 'yes');
                                const submittingNo = isSubmittingFor(companyId, 'no');
                                return (
                                    <PendingInterviewCard
                                        key={company.id || `pending-${companyId}`}
                                        company={company}
                                        onMoveToSecured={handleMoveToSecured}
                                        isSubmittingYes={submittingYes}
                                        isSubmitting={submittingYes || submittingNo}
                                    />
                                );
                            })
                        )}
                    </div>
                </section>

                <section
                    className="aa-interview__column"
                    aria-busy={loading}
                    aria-label="Interviews secured"
                >
                    <div className="aa-interview__column-head">
                        <span className="aa-interview__dot aa-interview__dot--secured" aria-hidden />
                        <h3 className="aa-interview__column-title">Interviews Secured</h3>
                        <span
                            className="aa-interview__count aa-interview__count--secured"
                            aria-hidden={loading ? 'true' : undefined}
                        >
                            {loading ? '—' : secured.length}
                        </span>
                    </div>

                    <div className="aa-interview__cards">
                        {loading ? (
                            SECURED_SKELETON_ITEMS.map((key) => (
                                <SkeletonCard key={key} variant="secured" />
                            ))
                        ) : secured.length === 0 ? (
                            <p className="aa-interview__empty">
                                None yet. When you confirm an interview from the Pending column,
                                it lands here.
                            </p>
                        ) : (
                            secured.map((company) => {
                                const companyId = company.company_id;
                                const submittingNo = isSubmittingFor(companyId, 'no');
                                const submittingYes = isSubmittingFor(companyId, 'yes');
                                return (
                                    <SecuredInterviewCard
                                        key={company.id || `secured-${companyId}`}
                                        company={company}
                                        onRevert={handleMoveToPending}
                                        isSubmitting={submittingYes || submittingNo}
                                    />
                                );
                            })
                        )}
                    </div>
                </section>
            </div>

            {/*
              * Mobile stacked list (Figma 29246:28470) — one white rounded
              * container with hairline-separated rows. The active tab above
              * decides whether we show pending or secured cards. Desktop keeps
              * the 2-column kanban in `.aa-interview__board` (hidden below
              * 768px via CSS).
              */}
            <div
                className={`aa-interview__mobile-list${mobileTab === 'secured' ? ' aa-interview__mobile-list--secured' : ''}`}
                aria-busy={loading}
                role="tabpanel"
                id={mobileTab === 'pending' ? 'aa-interview-panel-pending' : 'aa-interview-panel-secured'}
                aria-labelledby={
                    mobileTab === 'pending'
                        ? 'aa-interview-tab-pending'
                        : 'aa-interview-tab-secured'
                }
            >
                {loading ? (
                    <ul
                        className={`aa-interview__mobile-card-list${mobileTab === 'secured' ? ' aa-interview__mobile-card-list--secured' : ''}`}
                        role="list"
                    >
                        {PENDING_SKELETON_ITEMS.map((key) => (
                            <li
                                key={`mob-skel-${key}`}
                                className={`aa-interview__mobile-card-item${mobileTab === 'secured' ? ' aa-interview__mobile-card-item--secured' : ''}`}
                            >
                                <SkeletonCard variant={mobileTab === 'secured' ? 'secured' : 'pending'} />
                            </li>
                        ))}
                    </ul>
                ) : mobileTab === 'pending' ? (
                    pending.length === 0 ? (
                        <p className="aa-interview__empty">
                            No pending interviews right now. Run Happpy Agent on more jobs to
                            build your pipeline.
                        </p>
                    ) : (
                        <ul className="aa-interview__mobile-card-list" role="list">
                            {pending.map((company) => {
                                const companyId = company.company_id;
                                const submittingYes = isSubmittingFor(companyId, 'yes');
                                const submittingNo = isSubmittingFor(companyId, 'no');
                                return (
                                    <li
                                        key={`mob-pending-${company.id || companyId}`}
                                        className="aa-interview__mobile-card-item"
                                    >
                                        <PendingInterviewCard
                                            company={company}
                                            onMoveToSecured={handleMoveToSecured}
                                            isSubmittingYes={submittingYes}
                                            isSubmitting={submittingYes || submittingNo}
                                            mobile
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )
                ) : secured.length === 0 ? (
                    <p className="aa-interview__empty">
                        None yet. When you confirm an interview from the Pending column,
                        it lands here.
                    </p>
                ) : (
                    <ul className="aa-interview__mobile-card-list aa-interview__mobile-card-list--secured" role="list">
                        {secured.map((company) => {
                            const companyId = company.company_id;
                            const submittingNo = isSubmittingFor(companyId, 'no');
                            const submittingYes = isSubmittingFor(companyId, 'yes');
                            return (
                                <li
                                    key={`mob-secured-${company.id || companyId}`}
                                    className="aa-interview__mobile-card-item aa-interview__mobile-card-item--secured"
                                >
                                    <SecuredInterviewCard
                                        company={company}
                                        onRevert={handleMoveToPending}
                                        isSubmitting={submittingYes || submittingNo}
                                        mobile
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default InterviewBoardTab;