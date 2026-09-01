'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Link, useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import { API_OUTREACH_SUPPORT } from '@/talent/components/Constant';
import { GET_API, POST_API } from '@/talent/components/Helper';
import {
    ReferralAgentRaPersonCard,
    ReferralAgentYourPitchCard,
    REFERRAL_AGENT_RA_TEAM,
} from '@/talent/pages/app/linkedin/referralAgentRaTeam';

/** Same URL as JobAgentDashboardLayout — Chrome Web Store listing */
const CHROME_EXTENSION_URL =
    'https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en';

const TICKET_PAGE_LABEL = 'AgentJ / Job agent / Help Guide / Raise a Query';
const PER_PAGE = 10;

const NEED_HELP_PATH = '/talent/job-agent/need-help';
const GUIDE_VIEW = 'guide';
const GUIDE_PATH = `${NEED_HELP_PATH}?view=${GUIDE_VIEW}`;
const SEE_HOW_HAPPPY_ICON = '/images/talent/outreach/see-how-happpy-works-icon.svg';

const MatIcon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
        {name}
    </span>
);

/* -------------------------------------------------------------------------- */
/* "See How The Agent Works" sub-view — content lifted verbatim from the       */
/* previous JobAgentHowToUse.js page (Direct Outreach Flow + Tailor Resume +   */
/* "Before you use the agent" CTA). Only the page heading is new.              */
/* -------------------------------------------------------------------------- */

function ReferralAgentOutreachFlow() {
    return (
        <>
            <section className="jad-howto__ra-block" aria-label="Active target role">
                <div className="jad-howto__ra-target">
                    <div className="jad-howto__ra-target-ic">
                        <MatIcon name="work" className="jad-howto__ra-target-icin" />
                    </div>
                    <div>
                        <p className="jad-howto__ra-kicker">Active Target</p>
                        <h2 className="jad-howto__ra-jobtitle jad-font-headline">Senior Software Engineer</h2>
                        <p className="jad-howto__ra-company jad-font-body">
                            <MatIcon name="corporate_fare" className="jad-howto__ra-company-ic" />
                            Microsoft
                        </p>
                    </div>
                </div>
            </section>

            <section className="jad-howto__ra-block jad-howto__ra-block--flow" aria-labelledby="jad-howto-ra-flow-h">
                <div className="jad-howto__ra-flow-head">
                    <h3 id="jad-howto-ra-flow-h" className="jad-howto__ra-flow-h">
                        Direct Outreach Flow
                    </h3>
                </div>
                <div className="jad-howto__ra-flow-body">
                    <ul className="jad-howto__ra-team">
                        {REFERRAL_AGENT_RA_TEAM.map((m) => (
                            <ReferralAgentRaPersonCard key={m.name} member={m} MatIcon={MatIcon} />
                        ))}
                    </ul>
                    <ReferralAgentYourPitchCard
                        MatIcon={MatIcon}
                        jobTitle="Senior Software Engineer"
                        headingId="jad-howto-ra-you-h"
                    />
                </div>
            </section>
        </>
    );
}

function HowSubView({ onBack }) {
    return (
        <div className="jad-howto jad-howto--wide">
            <header className="jad-helpguide__subview-header">
                <button
                    type="button"
                    className="jad-helpguide__back"
                    onClick={onBack}
                    aria-label="Back to Raise a Query"
                >
                    <MatIcon name="arrow_back" />
                </button>
                <div className="jad-helpguide__subview-header-text">
                    <h1 className="jad-howto__h1 jad-font-headline">See How The Agent Works</h1>
                    <p className="jad-howto__sub jad-font-body">
                        Land 2x more interviews with Happpy Agent and Tailor Resume. <b>Happpy Agent</b> reaches the right people, <b>Tailor Resume</b> makes your resume fully ATS-friendly.
                    </p>
                </div>
            </header>

            <div className="jad-howto__split">
                <div className="jad-howto__split-col jad-howto__split-col--ra">
                    <ReferralAgentOutreachFlow />
                </div>
                <div className="jad-howto__split-col jad-howto__split-col--resume">
                    <section className="jad-howto__resume" aria-labelledby="howto-resume-h">
                        <div className="jad-howto__resume-top">
                            <div>
                                <h2 id="howto-resume-h" className="jad-howto__resume-title jad-font-headline">
                                    Power of Tailor Resume
                                </h2>
                                <p className="jad-howto__resume-lead jad-font-body">
                                    How Tailor Resume transforms your visibility.
                                </p>
                            </div>
                            <div className="jad-howto__resume-badge">
                                <MatIcon name="trending_up" className="jad-howto__resume-badge-ic" />
                                More ATS fit
                            </div>
                        </div>
                        <div className="jad-howto__resume-grid">
                            <div className="jad-howto__resume-col jad-howto__resume-col--generic">
                                <div className="jad-howto__resume-col-head">
                                    <h3 className="jad-howto__resume-col-t jad-howto__resume-col-t--generic">Generic CV</h3>
                                    <span className="jad-howto__resume-col-pct jad-howto__resume-col-pct--bad">50% Match</span>
                                </div>
                                <div className="jad-howto__resume-bar">
                                    <div
                                        className="jad-howto__resume-bar-fill jad-howto__resume-bar-fill--bad"
                                        style={{ width: '50%' }}
                                    />
                                </div>
                                <div className="jad-howto__resume-skel jad-howto__resume-skel--muted" aria-hidden>
                                    <div className="jad-howto__resume-line" />
                                    <div className="jad-howto__resume-line jad-howto__resume-line--w-3-4" />
                                    <div className="jad-howto__resume-line jad-howto__resume-line--w-5-6" />
                                    <div className="jad-howto__resume-line jad-howto__resume-line--w-2-3" />
                                </div>
                                <p className="jad-howto__resume-foot jad-howto__resume-foot--generic jad-font-body">
                                    Common issues: Missing keywords, generic job descriptions, manual formatting errors.
                                </p>
                            </div>
                            <div className="jad-howto__resume-col jad-howto__resume-col--tailored">
                                <div className="jad-howto__resume-deco" aria-hidden>
                                    <MatIcon name="verified" />
                                </div>
                                <div className="jad-howto__resume-col-head jad-howto__resume-col-head--z">
                                    <h3 className="jad-howto__resume-col-t jad-howto__resume-col-t--teal">After Tailor</h3>
                                    <span className="jad-howto__resume-col-pct jad-howto__resume-col-pct--good">94% Match</span>
                                </div>
                                <div className="jad-howto__resume-bar jad-howto__resume-bar--teal jad-howto__resume-col-head--z">
                                    <div
                                        className="jad-howto__resume-bar-fill jad-howto__resume-bar-fill--good"
                                        style={{ width: '94%' }}
                                    />
                                </div>
                                <div className="jad-howto__resume-skel" aria-hidden>
                                    <div className="jad-howto__resume-line-row jad-howto__resume-col-head--z">
                                        <div className="jad-howto__resume-line jad-howto__resume-line--teal" />
                                        <MatIcon name="auto_fix_high" className="jad-howto__resume-fix" />
                                    </div>
                                    <div className="jad-howto__resume-line jad-howto__resume-line--teal jad-howto__resume-line--w-3-4" />
                                    <div className="jad-howto__resume-line jad-howto__resume-line--teal jad-howto__resume-line--w-5-6" />
                                    <div className="jad-howto__resume-line jad-howto__resume-line--teal jad-howto__resume-line--w-2-3" />
                                </div>
                                <p className="jad-howto__resume-foot jad-howto__resume-foot--tail jad-font-body jad-howto__resume-col-head--z">
                                    Optimization: Keyword alignment, impact-driven metrics, ATS-friendly structure.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <section className="jad-howto__bottom-cta" aria-labelledby="howto-bottom-cta-h">
                <h2 id="howto-bottom-cta-h" className="jad-howto__bottom-cta-title jad-font-headline">
                    Before you use the agent
                </h2>
                <p className="jad-howto__bottom-cta-lead jad-font-body">
                    Configure the agent first. After setup, you can run outreach from the Chrome extension
                    on supported job pages.
                </p>
                <div className="jad-howto__bottom-cta-actions">
                    <Link to="/talent/job-agent/configure" className="jad-howto__bottom-cta-btn jad-font-headline">
                        <MatIcon name="tune" className="jad-howto__bottom-cta-btn-ic" />
                        Configure agent
                    </Link>
                    <a
                        className="jad-howto__bottom-cta-ext jad-font-body"
                        href={CHROME_EXTENSION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Get Chrome extension
                        <MatIcon name="open_in_new" className="jad-howto__bottom-cta-ext-ic" />
                    </a>
                </div>
            </section>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/* "Raise a Query" sub-view — content lifted verbatim from the previous        */
/* JobAgentTickets.js page (textarea form, table, read-modal). Only the page   */
/* heading and Submit button label are new per Figma 28515:54980.              */
/* -------------------------------------------------------------------------- */

const STATUS_PILL = {
    pending: 'jad-jobs__pill--pending',
    resolved: 'jad-jobs__pill--success',
    closed: 'jad-jobs__pill--muted',
    duplicate: 'jad-jobs__pill--tailor',
};

function statusPillClass(status) {
    const s = (status || 'pending').toLowerCase();
    return `jad-jobs__pill ${STATUS_PILL[s] || 'jad-jobs__pill--pending'}`;
}

function formatWhen(iso) {
    if (!iso) return '—';
    try {
        return format(parseISO(iso), 'd MMM yyyy, h:mm a');
    } catch {
        return iso;
    }
}

/** Mobile query list — date only (Figma 28973:14084) */
function formatQueryRaisedDate(iso) {
    if (!iso) return '—';
    try {
        return format(parseISO(iso), 'd MMMM yyyy');
    } catch {
        return iso;
    }
}

/** Mobile query list — team update read label from existing ticket fields */
function formatQueryReadLabel(row) {
    if (!row?.resolution_message?.trim()) {
        return '-Not Read-';
    }
    if (!row.updated_at) {
        return '-Not Read-';
    }
    try {
        return format(parseISO(row.updated_at), "d MMM''yy");
    } catch {
        return '-Not Read-';
    }
}

function truncate(str, len) {
    if (!str || typeof str !== 'string') return '—';
    const t = str.trim();
    if (t.length <= len) return t;
    return `${t.slice(0, len)}…`;
}

function statusLabelText(status) {
    const st = (status || 'pending').toLowerCase();
    return st
        .split(/[\s_]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function RaiseSubView({ onOpenGuide }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [message, setMessage] = useState('');
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [rangeFrom, setRangeFrom] = useState(null);
    const [rangeTo, setRangeTo] = useState(null);
    const [readTicket, setReadTicket] = useState(null);
    const readDialogRef = useRef(null);

    const fetchTickets = useCallback(async (pageNum) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_OUTREACH_SUPPORT}?per_page=${PER_PAGE}&page=${pageNum}`;
            const res = await GET_API(url);
            if (res?.data?.status !== 200) {
                setError(res?.data?.message || 'Could not load tickets.');
                setRows([]);
                return;
            }
            const payload = res?.data?.data || {};
            const t = payload.tickets;
            setRows(t?.data || []);
            setPage(t?.current_page ?? 1);
            setLastPage(t?.last_page ?? 1);
            setTotal(t?.total ?? 0);
            setRangeFrom(t?.from ?? null);
            setRangeTo(t?.to ?? null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Could not load tickets.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets(1);
    }, [fetchTickets]);

    useEffect(() => {
        const el = readDialogRef.current;
        if (!el) return;
        if (readTicket) {
            if (!el.open) el.showModal();
        } else if (el.open) {
            el.close();
        }
    }, [readTicket]);

    const totalPages = Math.max(lastPage, 1);

    const onSubmit = async (e) => {
        e.preventDefault();
        setFormError(null);
        setSuccessMsg(null);
        const trimmed = message.trim();
        if (!trimmed) {
            setFormError('Please describe your issue.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await POST_API(API_OUTREACH_SUPPORT, {
                message: trimmed,
                page: TICKET_PAGE_LABEL,
            });
            const ok = res?.data?.status === 200;
            const msg = res?.data?.message;
            if (ok) {
                setSuccessMsg(msg || 'Query submitted.');
                setMessage('');
                fetchTickets(1);
            } else {
                setFormError(msg || res?.data?.message || 'Could not submit query.');
            }
        } catch (err) {
            const m =
                err?.response?.data?.message ||
                err?.response?.data?.errors?.message?.[0] ||
                err?.message ||
                'Could not submit query.';
            setFormError(typeof m === 'string' ? m : 'Could not submit query.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="jad-jobs jad-helpguide-raise">
            <header className="jad-helpguide-raise__header">
                <div className="jad-helpguide-raise__header-text">
                    <h1 className="jad-jobs__title jad-font-headline">Raise a Query</h1>
                    <p className="jad-jobs__lead jad-font-body">
                        Raise a ticket for your job journey (Happpy agent, outreach). Our team will review
                        and update status here.
                    </p>
                </div>
                <button
                    type="button"
                    className="jad-helpguide-raise__guide-cta jad-font-headline"
                    onClick={onOpenGuide}
                >
                    <img
                        className="jad-helpguide-raise__guide-cta-icon"
                        src={SEE_HOW_HAPPPY_ICON}
                        alt=""
                        width={14}
                        height={14}
                        aria-hidden="true"
                    />
                    See how HAPPPY works
                </button>
            </header>

            <section className="jad-tickets__raise" aria-labelledby="jad-helpguide-raise-title">
                <form className="jad-tickets__form" onSubmit={onSubmit}>
                    <label
                        id="jad-helpguide-raise-title"
                        className="jad-tickets__label jad-font-body"
                        htmlFor="jad-helpguide-query-message"
                    >
                        What do you need help with?
                    </label>
                    <textarea
                        id="jad-helpguide-query-message"
                        className="jad-tickets__textarea jad-font-body"
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe your issue, steps to reproduce, or what you expected to happen…"
                        disabled={submitting}
                        maxLength={8000}
                    />
                    {formError && (
                        <p className="jad-tickets__form-error jad-font-body" role="alert">
                            {formError}
                        </p>
                    )}
                    {successMsg && (
                        <p className="jad-tickets__form-success jad-font-body" role="status">
                            {successMsg}
                        </p>
                    )}
                    <div className="jad-tickets__form-actions">
                        <button
                            type="submit"
                            className="jad-tickets__submit jad-font-headline"
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting…' : 'Submit Query'}
                        </button>
                    </div>
                </form>
            </section>

            {loading && (
                <div className="jad-jobs__table-wrap jad-payments__loading-wrap">
                    <div className="jad-payments__loading">
                        <div className="jad-payments__loading-spinner" aria-hidden />
                        <p className="jad-payments__loading-text jad-font-body">Loading queries…</p>
                    </div>
                </div>
            )}

            {!loading && error && (
                <p className="jad-payments__error-banner jad-font-body" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && (
                <div className="jad-helpguide-raise__history">
                    <div className="jad-helpguide-raise__history-divider" aria-hidden />
                    <h2 className="jad-helpguide__history-title jad-font-headline">Previously raised queries</h2>
                    <p className="jad-jobs__filter-meta jad-helpguide-raise__filter-meta jad-font-body">
                        {total === 0 ? (
                            <>No queries yet. Use the form above to raise your first query.</>
                        ) : (
                            <>
                                Showing <strong>{rangeFrom ?? 0}</strong>–<strong>{rangeTo ?? 0}</strong> of{' '}
                                <strong>{total}</strong> queries · Page <strong>{page}</strong> of{' '}
                                <strong>{totalPages}</strong>
                            </>
                        )}
                    </p>

                    <div className="jad-jobs__table-wrap jad-helpguide-raise__table-wrap--desktop">
                        <table className="jad-jobs__table">
                            <thead>
                                <tr>
                                    <th scope="col">No.</th>
                                    <th scope="col">Raised on</th>
                                    <th scope="col">Context</th>
                                    <th scope="col">Message</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Read</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="jad-jobs__empty">
                                            No queries yet. Submit the form above to contact the team.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, index) => {
                                        const sr = (page - 1) * PER_PAGE + index + 1;
                                        const st = (row.status || 'pending').toLowerCase();
                                        return (
                                            <tr key={row.id}>
                                                <td className="jad-jobs__sr">{sr}</td>
                                                <td className="jad-jobs__request-date">{formatWhen(row.created_at)}</td>
                                                <td className="jad-tickets__cell-page">{truncate(row.page, 40)}</td>
                                                <td className="jad-tickets__cell-msg">{truncate(row.message, 120)}</td>
                                                <td>
                                                    <span className={statusPillClass(st)}>{statusLabelText(row.status)}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="jad-jobs__page-btn jad-tickets__read-btn"
                                                        onClick={() => setReadTicket(row)}
                                                        aria-label={`Read query from ${formatWhen(row.created_at)}`}
                                                    >
                                                        <MatIcon name="article" />
                                                        <span>Read</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="jad-tickets__mobile" aria-label="Previously raised queries">
                        {rows.length === 0 ? (
                            <p className="jad-tickets__mobile-empty jad-font-body">
                                No queries yet. Submit the form above to contact the team.
                            </p>
                        ) : (
                            <ul className="jad-tickets__mobile-list">
                                {rows.map((row, index) => {
                                    const sr = (page - 1) * PER_PAGE + index + 1;
                                    const st = (row.status || 'pending').toLowerCase();
                                    const hasTeamUpdate = Boolean(row.resolution_message?.trim());
                                    const readLabel = formatQueryReadLabel(row);

                                    return (
                                        <li key={row.id} className="jad-tickets__mobile-item">
                                            <div className="jad-tickets__mobile-row">
                                                <div className="jad-tickets__mobile-main">
                                                    <span className="jad-tickets__mobile-index" aria-hidden>
                                                        {sr}
                                                    </span>
                                                    <div className="jad-tickets__mobile-body">
                                                        <p className="jad-tickets__mobile-raised jad-font-body">
                                                            <span className="jad-tickets__mobile-raised-label">Raised on: </span>
                                                            <span className="jad-tickets__mobile-raised-date">
                                                                {formatQueryRaisedDate(row.created_at)}
                                                            </span>
                                                        </p>
                                                        <p className="jad-tickets__mobile-meta jad-font-body">
                                                            {/* <span className="jad-tickets__mobile-read">
                                                                <span className="jad-tickets__mobile-meta-label">Read: </span>
                                                                <span
                                                                    className={
                                                                        hasTeamUpdate
                                                                            ? 'jad-tickets__mobile-read-value'
                                                                            : 'jad-tickets__mobile-read-empty'
                                                                    }
                                                                >
                                                                    {readLabel}
                                                                </span>
                                                            </span>
                                                            <span className="jad-tickets__mobile-dot" aria-hidden>
                                                                ·
                                                            </span> */}
                                                            <span className="jad-tickets__mobile-status">
                                                                <span className="jad-tickets__mobile-meta-label">Status: </span>
                                                                <span className={statusPillClass(st)}>
                                                                    {statusLabelText(row.status)}
                                                                </span>
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="jad-tickets__mobile-view jad-font-body"
                                                    onClick={() => setReadTicket(row)}
                                                    aria-label={`View query raised on ${formatQueryRaisedDate(row.created_at)}`}
                                                >
                                                    View Query
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <dialog
                        ref={readDialogRef}
                        className="jad-tickets__read-dialog"
                        onClose={() => setReadTicket(null)}
                        aria-labelledby="jad-helpguide-read-title"
                    >
                        {readTicket && (
                            <div className="jad-tickets__read-inner">
                                <div className="jad-tickets__read-head">
                                    <h2
                                        id="jad-helpguide-read-title"
                                        className="jad-tickets__read-title jad-font-headline"
                                    >
                                        Query
                                    </h2>
                                    <button
                                        type="button"
                                        className="jad-tickets__read-close"
                                        onClick={() => setReadTicket(null)}
                                        aria-label="Close"
                                    >
                                        <MatIcon name="close" />
                                    </button>
                                </div>
                                <dl className="jad-tickets__read-meta jad-font-body">
                                    <div className="jad-tickets__read-meta-row">
                                        <dt>Raised</dt>
                                        <dd>{formatWhen(readTicket.created_at)}</dd>
                                    </div>
                                    <div className="jad-tickets__read-meta-row">
                                        <dt>Context</dt>
                                        <dd>{readTicket.page?.trim() || '—'}</dd>
                                    </div>
                                    <div className="jad-tickets__read-meta-row">
                                        <dt>Status</dt>
                                        <dd>
                                            <span
                                                className={statusPillClass(
                                                    (readTicket.status || 'pending').toLowerCase()
                                                )}
                                            >
                                                {statusLabelText(readTicket.status)}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                                <div className="jad-tickets__read-block">
                                    <h3 className="jad-tickets__read-block-title jad-font-body">Your message</h3>
                                    <p className="jad-tickets__read-body jad-font-body">
                                        {readTicket.message?.trim() || '—'}
                                    </p>
                                </div>
                                <div className="jad-tickets__read-block">
                                    <h3 className="jad-tickets__read-block-title jad-font-body">Team update</h3>
                                    <p className="jad-tickets__read-body jad-font-body">
                                        {readTicket.resolution_message?.trim()
                                            ? readTicket.resolution_message.trim()
                                            : 'No update yet.'}
                                    </p>
                                </div>
                                <div className="jad-tickets__read-actions">
                                    <button
                                        type="button"
                                        className="jad-tickets__submit"
                                        onClick={() => setReadTicket(null)}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </dialog>

                    {total > 0 && (
                        <nav className="jad-jobs__pagination" aria-label="Queries pagination">
                            <div className="jad-jobs__pagination-row">
                                <span className="jad-jobs__pagination-spacer" aria-hidden />
                                <div className="jad-jobs__pagination-controls">
                                    <button
                                        type="button"
                                        className="jad-jobs__page-btn"
                                        onClick={() => fetchTickets(page - 1)}
                                        disabled={page <= 1}
                                        aria-label="Previous page"
                                    >
                                        <MatIcon name="chevron_left" />
                                        <span>Previous</span>
                                    </button>
                                    <span className="jad-jobs__pagination-status jad-font-body">
                                        Page {page} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="jad-jobs__page-btn"
                                        onClick={() => fetchTickets(page + 1)}
                                        disabled={page >= totalPages}
                                        aria-label="Next page"
                                    >
                                        <span>Next</span>
                                        <MatIcon name="chevron_right" />
                                    </button>
                                </div>
                            </div>
                        </nav>
                    )}
                </div>
            )}
        </div>
    );
}

function isGuideView(searchParams) {
    return searchParams?.get('view') === GUIDE_VIEW;
}

const JobAgentHelpGuide = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        const fromQuery = isGuideView(searchParams);
        const fromHash =
            typeof window !== 'undefined' && (window.location.hash || '').replace(/^#/, '') === GUIDE_VIEW;
        setShowGuide(fromQuery || fromHash);
    }, [searchParams]);

    useEffect(() => {
        document.title = showGuide
            ? 'See how the agent works | Need Help | Uplers'
            : 'Raise a query | Need Help | Uplers';
    }, [showGuide]);

    const openGuide = useCallback(() => {
        setShowGuide(true);
        navigate(GUIDE_PATH);
    }, [navigate]);

    const handleBackFromGuide = useCallback(() => {
        setShowGuide(false);
        navigate(NEED_HELP_PATH, { replace: true });
    }, [navigate]);

    return showGuide ? (
        <HowSubView onBack={handleBackFromGuide} />
    ) : (
        <RaiseSubView onOpenGuide={openGuide} />
    );
};

export default JobAgentHelpGuide;
