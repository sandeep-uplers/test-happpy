import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS, IMAGE_URL } from '../../../../components/Constant';
import { GET_API } from '../../../../components/Helper';

/**
 * Reminder Alerts tab — table redesign of the original
 * `JobAgentMissedReplies` page, matching Figma node 28481:7299.
 *
 * Data contract (live + fixture share the same shape):
 *   GET /talent/outreach/missed-positive-reply-followups?days=N
 *     → { rows: Row[], count: number }
 *
 * USE_DUMMY_DATA short-circuits the network call and serves
 * `_remindersDummyData.js` instead. Toggle to `false` once the live API is
 * ready; the fixture file can then be deleted.
 *
 * Row fields carried by the API (per fixture):
 *   medium, medium_label, outreach_employee_id, employee_name,
 *   employee_business_email, employee_linkedin_url, contact_type, contact_value,
 *   contact_display, thread_subject, reply_category, reply_summary,
 *   message_full, replied_at, thread_sent_at, gmail_thread_id,
 *   talent_gmail_email_id, talent_linkedin_message_id, from_email, to_email,
 *   job_title, company_name, company_logo
 *
 * `job_title`, `company_name`, and `company_logo` are now in the payload — the
 * "Job Details" cell uses them directly. Each is still tolerant of `null` /
 * missing so older payloads keep rendering with safe fallbacks.
 */

const PAGE_SIZE = 5;
const DEFAULT_DAYS = 15;

const LOOKBACK_OPTIONS = [
    { value: 7, label: 'Last 7 Days' },
    { value: 15, label: 'Last 15 Days' },
    { value: 30, label: 'Last 30 Days' },
    { value: 90, label: 'Last 90 Days' },
];

function unwrapApiData(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) return body.data;
    return null;
}

/** e.g. `13 May 2026, 11:06` (day-first, 24h). Mirrors JobAgentMissedReplies. */
function formatReplyWhen(input) {
    if (!input) return '—';
    try {
        const d = new Date(typeof input === 'string' && !input.includes('T') ? input.replace(' ', 'T') : input);
        if (Number.isNaN(d.getTime())) return String(input);
        return d.toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
        });
    } catch {
        return String(input);
    }
}

function getMedium(row) {
    const m = String(row?.medium || row?.contact_type || '').toLowerCase();
    if (m === 'linkedin') return 'linkedin';
    return 'email';
}

function getMediumLabel(row) {
    const direct = String(row?.medium_label || '').trim();
    if (direct) return direct;
    return getMedium(row) === 'linkedin' ? 'LinkedIn' : 'Gmail';
}

function getContactValue(row) {
    return String(row?.contact_value || row?.contact_display || '').trim();
}

function getReplyHref(row) {
    const raw = getContactValue(row);
    if (!raw) return null;
    if (getMedium(row) === 'linkedin') {
        return /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/\//, '')}`;
    }
    return `mailto:${raw}`;
}

function getInitials(name) {
    const t = String(name || '').trim();
    if (!t) return '?';
    const parts = t.split(/\s+/).slice(0, 2);
    return parts.map((s) => s[0] || '').join('').toUpperCase() || '?';
}

/** Hashed pastel for the contact avatar — keeps the same person stable in color. */
function avatarTone(seed) {
    const palette = [
        { bg: '#e8f0fe', fg: '#2e3f5d' },
        { bg: '#fde8e6', fg: '#7a2c25' },
        { bg: '#e7f6ec', fg: '#1f5b34' },
        { bg: '#fff4dc', fg: '#7a4f10' },
        { bg: '#efe6f7', fg: '#4a3068' },
        { bg: '#e3f3f5', fg: '#1f5a66' },
    ];
    let h = 0;
    const s = String(seed || '');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return palette[h % palette.length];
}

function BuildingIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <rect x="4" y="3" width="12" height="18" rx="1.5" />
            <path d="M16 8h4v13H4" />
            <path d="M8 7h4M8 11h4M8 15h4" />
        </svg>
    );
}

function CompanyMark({ logo, name }) {
    const [broken, setBroken] = useState(false);
    if (logo && !broken) {
        return (
            <span className="aa-reminders__company-logo">
                <img
                    src={logo}
                    alt=""
                    width={34}
                    height={34}
                    decoding="async"
                    loading="lazy"
                    onError={() => setBroken(true)}
                />
            </span>
        );
    }
    /**
     * The reminders API does not yet ship `company_name`/`company_logo`; the
     * caller passes a placeholder ("—") in that case. Fall back to a generic
     * domain glyph rather than rendering the literal "—" as initials.
     */
    const trimmed = String(name || '').trim();
    const hasMeaningfulName = trimmed && trimmed !== '—';
    if (!hasMeaningfulName) {
        return (
            <span
                className="aa-reminders__company-logo aa-reminders__company-logo--placeholder"
                aria-hidden
            >
                <BuildingIcon />
            </span>
        );
    }
    const tone = avatarTone(trimmed);
    return (
        <span
            className="aa-reminders__company-logo aa-reminders__company-logo--fallback"
            style={{ background: tone.bg, color: tone.fg }}
            aria-hidden
        >
            {getInitials(trimmed)}
        </span>
    );
}

function ContactAvatar({ name }) {
    const tone = avatarTone(name || 'contact');
    return (
        <span
            className="aa-reminders__avatar"
            style={{ background: tone.bg, color: tone.fg }}
            aria-hidden
        >
            {getInitials(name)}
        </span>
    );
}

function CheckCircleIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12.2 11 14.7l5-5.4" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/**
 * Mobile card for a single reminder row (Figma 28902:29995). One white
 * rounded card per row stacked vertically. Top block is the job (logo +
 * role + company · "1 +ve Reply"); middle is the recruiter contact strip
 * on the soft lavender background; bottom is a side-by-side "View Thread"
 * / "Reply Now" action row. Pure presentation — all handlers come from
 * the parent so desktop and mobile share the same modal + reply flow.
 */
function MobileReminderCard({ row, onViewThread }) {
    const jobTitle = String(row.job_title || '').trim() || 'Referral outreach';
    const companyName = String(row.company_name || '').trim() || '—';
    const companyLogo = String(row.company_logo || '').trim() || null;
    const contactDisplay = String(row.contact_display || row.contact_value || '').trim();
    const replyHref = getReplyHref(row);
    const mediumLabel = getMediumLabel(row);
    const isLi = getMedium(row) === 'linkedin';
    const externalAttrs = isLi ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    return (
        <article className="aa-reminders__card">
            <div className="aa-reminders__card-head">
                <CompanyMark logo={companyLogo} name={companyName} />
                <div className="aa-reminders__card-head-text">
                    <span className="aa-reminders__card-title" title={jobTitle}>
                        {jobTitle}
                    </span>
                    <div className="aa-reminders__card-sub">
                        <span className="aa-reminders__card-company" title={companyName}>
                            {companyName}
                        </span>
                        <span className="aa-reminders__card-sep" aria-hidden>·</span>
                        <span className="aa-reminders__card-count aa-reminders__card-count--positive">
                            1 +ve Reply
                        </span>
                    </div>
                </div>
            </div>

            <div className="aa-reminders__card-contact">
                <ContactAvatar name={row.employee_name} />
                <div className="aa-reminders__card-contact-text">
                    <span className="aa-reminders__card-contact-name">
                        {row.employee_name || '—'}
                    </span>
                    <div className="aa-reminders__card-contact-meta">
                        <span
                            className={`aa-reminders__card-contact-medium aa-reminders__card-contact-medium--${isLi ? 'linkedin' : 'gmail'}`}
                        >
                            {mediumLabel}
                        </span>
                        {contactDisplay ? (
                            <>
                                <span className="aa-reminders__card-sep" aria-hidden>·</span>
                                {replyHref ? (
                                    <a
                                        href={replyHref}
                                        className="aa-reminders__card-contact-link"
                                        title={contactDisplay}
                                        {...externalAttrs}
                                    >
                                        {contactDisplay}
                                    </a>
                                ) : (
                                    <span
                                        className="aa-reminders__card-contact-link"
                                        title={contactDisplay}
                                    >
                                        {contactDisplay}
                                    </span>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="aa-reminders__card-actions">
                <button
                    type="button"
                    className="aa-reminders__card-btn aa-reminders__card-btn--view"
                    onClick={() => onViewThread(row)}
                >
                    View Thread
                </button>
                {replyHref ? (
                    <a
                        href={replyHref}
                        className="aa-reminders__card-btn aa-reminders__card-btn--reply"
                        {...externalAttrs}
                    >
                        Reply Now
                    </a>
                ) : (
                    <button
                        type="button"
                        className="aa-reminders__card-btn aa-reminders__card-btn--reply"
                        disabled
                        title="No contact channel available"
                    >
                        Reply Now
                    </button>
                )}
            </div>
        </article>
    );
}

const ReminderAlertsTab = () => {
    const [days, setDays] = useState(DEFAULT_DAYS);
    const [rows, setRows] = useState([]);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [messageModal, setMessageModal] = useState(null);
    const previouslyFocused = useRef(null);

    const closeModal = useCallback(() => setMessageModal(null), []);

    useEffect(() => {
        let cancelled = false;

        const apply = (nextRows, nextCount) => {
            if (cancelled) return;
            setRows(nextRows);
            setCount(typeof nextCount === 'number' ? nextCount : nextRows.length);
        };

        const loadLive = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await GET_API(
                    `${API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS}?days=${encodeURIComponent(String(days))}`
                );
                if (cancelled) return;
                const payload = unwrapApiData(res);
                if (payload && Array.isArray(payload.rows)) {
                    apply(payload.rows, payload.count);
                } else {
                    apply([], 0);
                    setError('Couldn’t load this list. Give it another try in a moment.');
                }
            } catch {
                if (!cancelled) {
                    apply([], 0);
                    setError('Couldn’t load this list. Give it another try in a moment.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadLive();
        return () => {
            cancelled = true;
        };
    }, [days]);

    /** Reset paging when the look-back window changes. */
    useEffect(() => {
        setPage(0);
    }, [days]);

    /** Modal: trap focus + restore on close, lock body scroll. */
    useEffect(() => {
        if (!messageModal) return;
        previouslyFocused.current = document.activeElement;
        const onKey = (e) => {
            if (e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
            if (previouslyFocused.current && typeof previouslyFocused.current.focus === 'function') {
                previouslyFocused.current.focus();
            }
        };
    }, [messageModal, closeModal]);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const visibleRows = useMemo(() => {
        const start = safePage * PAGE_SIZE;
        return rows.slice(start, start + PAGE_SIZE);
    }, [rows, safePage]);

    const total = count || rows.length;
    const isEmpty = !loading && rows.length === 0;
    const rangeLabel = useMemo(
        () => LOOKBACK_OPTIONS.find((o) => o.value === days)?.label || `Last ${days} Days`,
        [days]
    );

    const handleViewThread = (row) => {
        const fullMessage = String(row.message_full || row.reply_summary || '').trim();
        /**
         * Modal copy: keep the headline minimal; surface `thread_subject` and
         * `reply_category` separately inside the body so the user can scan the
         * recruiter's intent before reading the full message.
         */
        setMessageModal({
            title: row.employee_name ? `Conversation · ${row.employee_name}` : 'Conversation',
            subtitle: `${getMediumLabel(row)} · ${formatReplyWhen(row.replied_at || row.thread_sent_at)}`,
            subject: String(row.thread_subject || '').trim(),
            category: String(row.reply_category || '').trim(),
            body: fullMessage || 'No message body available for this thread yet.',
            replyHref: getReplyHref(row),
            replyLabel: getMedium(row) === 'linkedin' ? 'Open on LinkedIn' : 'Reply via email',
        });
    };

    return (
        <section className="aa-reminders" aria-labelledby="aa-reminders-heading">
            <header className="aa-reminders__intro">
                <h2 id="aa-reminders-heading" className="aa-reminders__title">
                    There are people waiting on you!
                </h2>
                <p className="aa-reminders__lede">
                    Happpy Agent flagged these as positive replies from the last {days} days. You haven’t sent
                    a follow-up in the thread yet, think of this as a gentle nudge.
                </p>
                <p className="aa-reminders__lede aa-reminders__lede--muted">
                    After your message lands, Happpy Agent will sync the thread and drop it off this list on
                    its own.
                </p>
            </header>

            <div className="aa-reminders__toolbar">
                <div className="aa-reminders__lookback">
                    <span className="aa-reminders__lookback-label">Look back</span>
                    <div className="aa-reminders__lookback-control">
                        <span className="aa-reminders__lookback-value">{rangeLabel}</span>
                        <ChevronDownIcon />
                        <select
                            className="aa-reminders__lookback-select"
                            aria-label="Look-back window"
                            value={String(days)}
                            onChange={(e) => setDays(Number(e.target.value) || DEFAULT_DAYS)}
                        >
                            {LOOKBACK_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <span className="aa-reminders__divider" aria-hidden />
                <p className="aa-reminders__count" aria-live="polite">
                    {loading ? 'Loading…' : `${total} ${total === 1 ? 'Job' : 'Jobs'} in the ${rangeLabel.toLowerCase()}`}
                </p>
            </div>

            {error ? (
                <div className="aa-replies__error" role="alert">
                    <p>{error}</p>
                    <button
                        type="button"
                        className="aa-btn aa-btn--ghost"
                        onClick={() => setDays((d) => d)}
                    >
                        Retry
                    </button>
                </div>
            ) : null}

            <div className="aa-table-wrap" aria-busy={loading}>
                <div className="aa-table-scroll">
                    <table className="aa-table aa-table--reminders" role="table">
                        <thead className="aa-table__thead">
                            <tr>
                                <th scope="col" className="aa-table__th aa-table__th--rem-job">
                                    Job Details
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--rem-contact">
                                    Referral Contact Info
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--rem-thread">
                                    Thread Summary
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--rem-action">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="aa-table__tbody">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="aa-table__td aa-table__td--state">
                                        <div className="aa-state aa-state--loading">
                                            <span className="aa-spinner" aria-hidden />
                                            <p>Loading reminders…</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan={4} className="aa-table__td aa-table__td--state">
                                        <div className="aa-empty">
                                            <p className="aa-empty__title">You’re all caught up!</p>
                                            <p className="aa-empty__body">
                                                Nothing matches this window — either you’ve already replied, or try
                                                a longer look-back above.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map((row, idx) => {
                                    /**
                                     * Job/company fields are now part of the API contract.
                                     * Each is still nullable, so we fall back to a friendly
                                     * label rather than rendering an empty cell when a row
                                     * (e.g. legacy data) is missing one of them.
                                     */
                                    const jobTitle = String(row.job_title || '').trim() || 'Referral outreach';
                                    const companyName = String(row.company_name || '').trim() || '—';
                                    const companyLogo = String(row.company_logo || '').trim() || null;
                                    const sentAt = row.thread_sent_at || row.replied_at;
                                    const sentiment = 'positive';
                                    const contactDisplay = String(row.contact_display || row.contact_value || '').trim();
                                    const replyHref = getReplyHref(row);
                                    const mediumLabel = getMediumLabel(row);
                                    const isLi = getMedium(row) === 'linkedin';
                                    /**
                                     * Stable key: prefer outreach record id, fall back to
                                     * channel-specific id, then array index for the
                                     * dummy-row case where ids may collide.
                                     */
                                    const key = `reminder-${row.outreach_employee_id ??
                                        row.talent_gmail_email_id ??
                                        row.talent_linkedin_message_id ??
                                        idx
                                        }`;

                                    return (
                                        <tr key={key} className="aa-table__row aa-reminders__row">
                                            <td className="aa-table__td aa-reminders__cell aa-reminders__cell--job">
                                                <div className="aa-reminders__job">
                                                    <CompanyMark logo={companyLogo} name={companyName} />
                                                    <div className="aa-reminders__job-text">
                                                        <span className="aa-reminders__job-title" title={jobTitle}>
                                                            {jobTitle}
                                                        </span>
                                                        <span className="aa-reminders__job-company">
                                                            {companyName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="aa-table__td aa-reminders__cell aa-reminders__cell--contact">
                                                <div className="aa-reminders__contact">
                                                    <ContactAvatar name={row.employee_name} />
                                                    <div className="aa-reminders__contact-text">
                                                        <span className="aa-reminders__contact-name">
                                                            {row.employee_name || '—'}
                                                        </span>
                                                        <span
                                                            className={`aa-reminders__contact-role aa-reminders__contact-role--${isLi ? 'linkedin' : 'gmail'
                                                                }`}
                                                        >
                                                            {mediumLabel}
                                                        </span>
                                                        {contactDisplay ? (
                                                            replyHref ? (
                                                                <a
                                                                    className="aa-reminders__contact-link"
                                                                    href={replyHref}
                                                                    {...(isLi
                                                                        ? { target: '_blank', rel: 'noopener noreferrer' }
                                                                        : {})}
                                                                    title={contactDisplay}
                                                                >
                                                                    {contactDisplay}
                                                                </a>
                                                            ) : (
                                                                <span
                                                                    className="aa-reminders__contact-link"
                                                                    title={contactDisplay}
                                                                >
                                                                    {contactDisplay}
                                                                </span>
                                                            )
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="aa-table__td aa-reminders__cell aa-reminders__cell--thread">
                                                <div className="aa-reminders__thread">
                                                    <div className="aa-reminders__thread-step">
                                                        <span
                                                            className="aa-reminders__thread-dot aa-reminders__thread-dot--sent"
                                                            aria-hidden
                                                        >
                                                            <CheckCircleIcon />
                                                        </span>
                                                        <div className="aa-reminders__thread-step-text">
                                                            <span className="aa-reminders__thread-title">
                                                                Referrall mail sent via Happpy Agent
                                                            </span>
                                                            <span className="aa-reminders__thread-date">
                                                                {formatReplyWhen(sentAt)}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={`aa-reminders__sentiment aa-reminders__sentiment--${sentiment}`}
                                                        >
                                                            {sentiment === 'positive'
                                                                ? 'Positive'
                                                                : sentiment === 'negative'
                                                                    ? 'Negative'
                                                                    : 'Neutral'}
                                                        </span>
                                                    </div>
                                                    <div className="aa-reminders__thread-connector" aria-hidden />
                                                    <div className="aa-reminders__thread-step aa-reminders__thread-step--waiting">
                                                        <span
                                                            className="aa-reminders__thread-dot aa-reminders__thread-dot--waiting"
                                                            aria-hidden
                                                        >
                                                            <ClockIcon />
                                                        </span>
                                                        <span className="aa-reminders__thread-waiting">
                                                            waiting for your reply…
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="aa-table__td aa-reminders__cell aa-reminders__cell--action">
                                                <div className="aa-reminders__actions">
                                                    <button
                                                        type="button"
                                                        className="aa-btn aa-btn--pill-outline"
                                                        onClick={() => handleViewThread(row)}
                                                    >
                                                        VIEW THREAD
                                                    </button>
                                                    {replyHref ? (
                                                        <a
                                                            href={replyHref}
                                                            className="aa-btn aa-btn--pill-primary"
                                                            {...(isLi
                                                                ? { target: '_blank', rel: 'noopener noreferrer' }
                                                                : {})}
                                                        >
                                                            REPLY
                                                        </a>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            className="aa-btn aa-btn--pill-primary"
                                                            disabled
                                                            title="No contact channel available"
                                                        >
                                                            REPLY
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {loading && rows.length > 0 ? (
                    <div className="aa-table__overlay" aria-hidden>
                        <span className="aa-spinner" />
                    </div>
                ) : null}
            </div>

            {/*
              * Mobile card layout (Figma 28902:29995) — one rounded card
              * per reminder row, stacked vertically with the same data the
              * desktop table renders. Sits alongside the table; the global
              * `@media (max-width: 767px)` rule on `.aa-table-wrap` hides
              * the table below 768px while `.aa-reminders__cards` flips on.
              */}
            <div className="aa-reminders__cards" aria-busy={loading}>
                {loading && rows.length === 0 ? (
                    <div className="aa-state aa-state--loading">
                        <span className="aa-spinner" aria-hidden />
                        <p>Loading reminders…</p>
                    </div>
                ) : isEmpty ? (
                    <div className="aa-empty">
                        <p className="aa-empty__title">You’re all caught up!</p>
                        <p className="aa-empty__body">
                            Nothing matches this window — either you’ve already replied, or try
                            a longer look-back above.
                        </p>
                    </div>
                ) : (
                    <ul className="aa-reminders__card-list" role="list">
                        {visibleRows.map((row, idx) => {
                            const key = `reminder-mob-${row.outreach_employee_id ??
                                row.talent_gmail_email_id ??
                                row.talent_linkedin_message_id ??
                                idx
                                }`;
                            return (
                                <li key={key} className="aa-reminders__card-item">
                                    <MobileReminderCard row={row} onViewThread={handleViewThread} />
                                </li>
                            );
                        })}
                    </ul>
                )}
                {loading && rows.length > 0 ? (
                    <div className="aa-reminders__cards-overlay" aria-hidden>
                        <span className="aa-spinner" />
                    </div>
                ) : null}
            </div>

            {!isEmpty && totalPages > 1 ? (
                <div className="aa-pager">
                    <button
                        type="button"
                        className="aa-btn aa-btn--ghost"
                        disabled={safePage <= 0 || loading}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        Previous
                    </button>
                    <span className="aa-pager__info">
                        Page {safePage + 1} of {totalPages}
                        {rows.length > 0 ? ` · ${rows.length} reminders` : ''}
                    </span>
                    <button
                        type="button"
                        className="aa-btn aa-btn--ghost"
                        disabled={safePage >= totalPages - 1 || loading}
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                        Next
                    </button>
                </div>
            ) : null}

            {!isEmpty && !loading ? (
                <aside className="aa-reminders__bento" aria-label="Tip">
                    <div className="aa-reminders__bento-mascot" aria-hidden>
                        <img src={IMAGE_URL + "/outreach/mascot-neutral.svg"} alt="Mascot" />
                    </div>
                    <div className="aa-reminders__bento-callout">
                        <p className="aa-reminders__bento-title">Don’t let these replies slip away!</p>
                        <p className="aa-reminders__bento-body">
                            Above are positive replies that can convert into interviews in the future, so you can
                            reply accordingly after reviewing the full thread. Sometimes, even a simple “Thank
                            you” helps keep the conversation active and improves your interview chances.
                        </p>
                    </div>
                </aside>
            ) : null}

            {messageModal ? (
                <div className="aa-modal" role="dialog" aria-modal="true" aria-labelledby="aa-reminders-modal-title">
                    <button
                        type="button"
                        className="aa-modal__backdrop"
                        aria-label="Close dialog"
                        onClick={closeModal}
                    />
                    <div className="aa-modal__panel" role="document">
                        <div className="aa-modal__head">
                            <div>
                                <h3 id="aa-reminders-modal-title" className="aa-modal__title">
                                    {messageModal.title}
                                </h3>
                                <p className="aa-modal__sub">{messageModal.subtitle}</p>
                            </div>
                            <button
                                type="button"
                                className="aa-modal__close"
                                aria-label="Close"
                                onClick={closeModal}
                            >
                                ×
                            </button>
                        </div>
                        <div className="aa-modal__body">
                            {messageModal.subject ? (
                                <div className="aa-modal__field">
                                    <span className="aa-modal__field-label">Original subject</span>
                                    <span className="aa-modal__field-value">{messageModal.subject}</span>
                                </div>
                            ) : null}
                            {messageModal.category ? (
                                <div className="aa-modal__summary">
                                    <span className="aa-modal__summary-label">Reply intent</span>
                                    <span className="aa-modal__summary-value">{messageModal.category}</span>
                                </div>
                            ) : null}
                            <div className="aa-modal__pre">{messageModal.body}</div>
                        </div>
                        {messageModal.replyHref ? (
                            <div className="aa-modal__foot">
                                <a
                                    href={messageModal.replyHref}
                                    className="aa-btn aa-btn--pill-primary"
                                    {...(messageModal.replyHref.startsWith('mailto:')
                                        ? {}
                                        : { target: '_blank', rel: 'noopener noreferrer' })}
                                    onClick={closeModal}
                                >
                                    {messageModal.replyLabel}
                                </a>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default ReminderAlertsTab;