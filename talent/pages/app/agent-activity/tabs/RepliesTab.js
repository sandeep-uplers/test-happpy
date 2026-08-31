'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { GET_API } from '../../../../components/Helper';
import { API_URL } from '../../../../components/Constant';
import repliesDummyData from './_repliesDummyData';
import { markReplySeen } from '../../../../store/actions/UserActions';

/**
 * Replies tab — table-based redesign of the existing JobApplicationsReplies
 * card view, matching the Figma frame at node 28484:8116.
 *
 * Data contract (live + fixture share the same shape):
 *   - GET /talent/outreach/get-outreach-agent?page=&per_page=&reply_type=
 *       → paginated list of jobs with embedded replies + messages.
 *   - GET /talent/outreach/get-outreach-agent-meta
 *       → totals used elsewhere; not surfaced in this redesign but kept for parity.
 *
 * USE_DUMMY_DATA short-circuits the network call and serves
 * `_repliesDummyData.js` instead. Toggle it back to `false` once the live API
 * is ready; the fixture file can then be deleted.
 */

const PAGE_SIZE = 10;
const USE_DUMMY_DATA = false;
const DUMMY_LATENCY_MS = 250;

function formatDate(input) {
    if (!input) return '—';
    const d = new Date(typeof input === 'string' && !input.includes('T') ? input.replace(' ', 'T') : input);
    if (Number.isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimestamp(t) {
    if (!t || typeof t !== 'string') return '';
    const [hh, mm] = t.split(':');
    const h = parseInt(hh, 10);
    if (Number.isNaN(h)) return '';
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${mm || '00'} ${ampm}`;
}

/** Pulls the most recent message timestamp across all replies on a job row. */
function lastActivityFromJob(job) {
    if (!job?.replies?.length) return job?.appliedDate || null;
    let latest = null;
    for (const reply of job.replies) {
        if (!reply?.messages?.length) continue;
        for (const msg of reply.messages) {
            const raw = msg?.date;
            if (!raw) continue;
            const ts = new Date(typeof raw === 'string' && !raw.includes('T') ? raw.replace(' ', 'T') : raw).getTime();
            if (!Number.isFinite(ts)) continue;
            if (latest == null || ts > latest) latest = ts;
        }
    }
    return latest != null ? new Date(latest).toISOString() : job?.appliedDate || null;
}

/**
 * Dedupe contacts across replies, but accumulate every source/sentiment/category
 * combination we saw — so when the same recruiter responds on both LinkedIn
 * and Gmail (or has both a positive and negative reply) the contact cell still
 * surfaces all of it without listing the person twice.
 */
function dedupeContacts(replies = []) {
    const byKey = new Map();
    for (const reply of replies) {
        const email = String(reply?.senderEmail || '').trim();
        const name = String(reply?.senderName || '').trim();
        const linkedinUrl = String(reply?.linkedinUrl || '').trim();
        const key = email.toLowerCase() || linkedinUrl.toLowerCase() || name.toLowerCase();
        if (!key) continue;
        const existing = byKey.get(key) || {
            name,
            email,
            linkedinUrl,
            sources: new Set(),
            categories: [],
            id: reply.id,
            seen: reply.seen,
        };
        if (!existing.email && email) existing.email = email;
        if (!existing.linkedinUrl && linkedinUrl) existing.linkedinUrl = linkedinUrl;
        if (!existing.name && name) existing.name = name;
        if (reply?.source) existing.sources.add(reply.source);
        if (reply?.replyCategory && !existing.categories.includes(reply.replyCategory)) {
            existing.categories.push(reply.replyCategory);
        }
        byKey.set(key, existing);
    }
    return Array.from(byKey.values()).map((c) => ({
        ...c,
        sources: Array.from(c.sources),
    }));
}

/** Stable identifier for a deduped contact — must match the key used in dedupeContacts. */
function contactKey(c) {
    if (!c) return '';
    return (
        String(c.email || '').trim().toLowerCase() ||
        String(c.linkedinUrl || '').trim().toLowerCase() ||
        String(c.name || '').trim().toLowerCase()
    );
}

/** Replies that belong to a given deduped contact (same dedupe rule). */
function repliesForContact(replies = [], contact) {
    if (!contact) return [];
    const key = contactKey(contact);
    if (!key) return [];
    return replies.filter((reply) => {
        const email = String(reply?.senderEmail || '').trim().toLowerCase();
        const linkedin = String(reply?.linkedinUrl || '').trim().toLowerCase();
        const name = String(reply?.senderName || '').trim().toLowerCase();
        const replyKey = email || linkedin || name;
        return replyKey === key;
    });
}

/** Most recent message timestamp (ISO) across an array of replies. */
function lastActivityFromReplies(replies = []) {
    let latest = null;
    for (const reply of replies) {
        if (!reply?.messages?.length) continue;
        for (const msg of reply.messages) {
            const raw = msg?.date;
            if (!raw) continue;
            const ts = new Date(typeof raw === 'string' && !raw.includes('T') ? raw.replace(' ', 'T') : raw).getTime();
            if (!Number.isFinite(ts)) continue;
            if (latest == null || ts > latest) latest = ts;
        }
    }
    return latest != null ? new Date(latest).toISOString() : null;
}

function CompanyLogo({ src, name }) {
    const [broken, setBroken] = useState(false);
    const initials = useMemo(() => {
        const t = String(name || '').trim();
        if (!t) return '?';
        const parts = t.split(/\s+/).slice(0, 2);
        return parts.map((s) => s[0] || '').join('').toUpperCase() || '?';
    }, [name]);

    if (!src || broken) {
        return (
            <span className="aa-replies__logo aa-replies__logo--fallback" aria-hidden>
                {initials}
            </span>
        );
    }
    return (
        <span className="aa-replies__logo">
            <img src={src} alt="" width={36} height={36} onError={() => setBroken(true)} loading="lazy" />
        </span>
    );
}

function GmailIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 0H5C2.239 0 0 2.239 0 5V19C0 21.761 2.239 24 5 24H19C21.761 24 24 21.761 24 19V5C24 2.239 21.761 0 19 0ZM8 19H5V9H8V19ZM6.5 7.5C5.671 7.5 5 6.829 5 6C5 5.171 5.671 4.5 6.5 4.5C7.329 4.5 8 5.171 8 6C8 6.829 7.329 7.5 6.5 7.5ZM20 19H17V13.5C17 11.57 15.43 10 13.5 10C11.57 10 10 11.57 10 13.5V19H7V9H10V10.5C10.8 9.4 12.2 8.7 13.5 8.7C16.5 8.7 19 11.2 19 14.2V19H20Z" />
        </svg>
    );
}

function SourceIcon({ source }) {
    return String(source || '').toLowerCase() === 'linkedin' ? <LinkedInIcon /> : <GmailIcon />;
}

function ChevronDownIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

/**
 * Small clock glyph used in the mobile card meta row to label the
 * "Last Activity:" timestamp. Matches the icon used on the All Activity
 * and Jobs in Queue mobile cards so the three tabs stay visually unified.
 */
function ClockIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

/**
 * Reusable expansion panel rendered both inside the desktop table cell and
 * inside the mobile card. Owns the full contact list + thread tree for a
 * single job. All toggling state is owned by the parent so desktop and
 * mobile stay in sync via the same `activeContactKey`.
 */
function RepliesPanel({ job, activeContactKey, onToggleContact }) {
    const contacts = dedupeContacts(job.replies);
    if (contacts.length === 0) return null;
    return (
        <div className="aa-replies-panel">
            <div className="aa-replies-panel__head">
                <h3 className="aa-replies-panel__title">
                    {contacts.length} recruiter
                    {contacts.length === 1 ? '' : 's'} replied
                </h3>
            </div>

            <ul className="aa-replies-panel__contacts">
                {contacts.map((c, i) => {
                    const key = contactKey(c) || `c-${i}`;
                    const isContactOpen = activeContactKey === key;
                    const contactReplies = repliesForContact(job.replies, c);
                    const sentiments = Array.from(
                        new Set(contactReplies.map((r) => r.sentiment).filter(Boolean))
                    );
                    const categories = Array.from(
                        new Set(contactReplies.map((r) => r.replyCategory).filter(Boolean))
                    );
                    const messageCount = contactReplies.reduce(
                        (sum, r) =>
                            sum + (Array.isArray(r.messages) ? r.messages.length : 0),
                        0
                    );
                    const contactLastActivity = lastActivityFromReplies(contactReplies);
                    const primarySource = c.sources[0] || 'gmail';
                    return (
                        <li
                            key={key}
                            className={`aa-contact-card${isContactOpen ? ' aa-contact-card--open' : ''}`}
                        >
                            <div className={`aa-contact-card__row ${c.seen === 0 ? 'reply-unseen' : ''}`}>
                                <span
                                    className={`aa-contact-card__avatar aa-contact-card__avatar--${primarySource === 'linkedin' ? 'linkedin' : 'gmail'}`}
                                    aria-hidden
                                >
                                    <SourceIcon source={primarySource} />
                                </span>

                                <div className="aa-contact-card__info">
                                    <div className="aa-contact-card__line">
                                        <span className="aa-contact-card__name">
                                            {c.name || c.email || c.linkedinUrl || 'Unknown contact'}
                                        </span>
                                        {c.sources.length > 1 ? (
                                            <span className="aa-contact-card__channels">
                                                {c.sources.map((s) => (
                                                    <span
                                                        key={s}
                                                        className={`aa-contact-card__channel aa-contact-card__channel--${s}`}
                                                        title={`Replied on ${s}`}
                                                    >
                                                        <SourceIcon source={s} />
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                        {sentiments.length > 0 ? (
                                            <span className="aa-contact-card__sentiments">
                                                {sentiments.map((s) => (
                                                    <span
                                                        key={s}
                                                        className={`aa-pill aa-pill--${s === 'positive' ? 'positive' : s === 'negative' ? 'negative' : 'muted'}`}
                                                    >
                                                        {s === 'positive'
                                                            ? 'Positive'
                                                            : s === 'negative'
                                                                ? 'Negative'
                                                                : 'Neutral'}
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="aa-contact-card__line aa-contact-card__line--meta">
                                        {c.email ? (
                                            <a
                                                href={`mailto:${c.email}`}
                                                className="aa-contact-card__link"
                                                title={c.email}
                                            >
                                                <GmailIcon />
                                                <span>{c.email}</span>
                                            </a>
                                        ) : null}
                                        {c.linkedinUrl ? (
                                            <a
                                                href={c.linkedinUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="aa-contact-card__link"
                                                title={c.linkedinUrl}
                                            >
                                                <LinkedInIcon />
                                                <span>LinkedIn profile</span>
                                            </a>
                                        ) : null}
                                    </div>

                                    {categories.length > 0 ? (
                                        <div className="aa-contact-card__intent">
                                            <span className="aa-contact-card__intent-label">
                                                Reply intent
                                            </span>
                                            <span className="aa-contact-card__intent-value">
                                                {categories.join(' · ')}
                                            </span>
                                        </div>
                                    ) : null}

                                    <div className="aa-contact-card__stats">
                                        <span>
                                            {messageCount} message
                                            {messageCount === 1 ? '' : 's'}
                                        </span>
                                        {contactLastActivity ? (
                                            <>
                                                <span aria-hidden>·</span>
                                                <span>
                                                    Last reply{' '}
                                                    {formatDate(contactLastActivity)}
                                                </span>
                                            </>
                                        ) : null}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className={`aa-btn aa-contact-card__cta${isContactOpen ? ' is-active' : ''}`}
                                    aria-expanded={isContactOpen}
                                    aria-controls={`aa-contact-thread-${job.id}-${i}`}
                                    onClick={() =>
                                        onToggleContact(key, c.id, primarySource)
                                    }
                                >
                                    {isContactOpen ? 'Hide thread' : 'View thread'}
                                    <span
                                        className={`aa-btn__chev${isContactOpen ? ' aa-btn__chev--open' : ''}`}
                                        aria-hidden
                                    >
                                        <ChevronDownIcon />
                                    </span>
                                </button>
                            </div>

                            {isContactOpen ? (
                                <div
                                    className="aa-contact-card__thread"
                                    id={`aa-contact-thread-${job.id}-${i}`}
                                >
                                    <div className="aa-thread">
                                        {contactReplies.map((reply) => {
                                            const hasMessages =
                                                Array.isArray(reply.messages) &&
                                                reply.messages.length > 0;
                                            return (
                                                <article
                                                    key={reply.id}
                                                    className={`aa-thread__card aa-thread__card--${reply.sentiment || 'neutral'}`}
                                                >
                                                    <header className="aa-thread__head">
                                                        <span
                                                            className={`aa-thread__source aa-thread__source--${reply.source === 'linkedin' ? 'linkedin' : 'gmail'}`}
                                                        >
                                                            <SourceIcon source={reply.source} />
                                                            {reply.source === 'linkedin'
                                                                ? 'LinkedIn'
                                                                : 'Gmail'}
                                                        </span>
                                                        {reply.replyCategory ? (
                                                            <span className="aa-thread__category-inline">
                                                                {reply.replyCategory}
                                                            </span>
                                                        ) : null}
                                                        <span
                                                            className={`aa-thread__sentiment aa-thread__sentiment--${reply.sentiment || 'neutral'}`}
                                                        >
                                                            {reply.sentiment === 'positive'
                                                                ? 'Positive'
                                                                : reply.sentiment === 'negative'
                                                                    ? 'Negative'
                                                                    : 'Neutral'}
                                                        </span>
                                                    </header>

                                                    {hasMessages ? (
                                                        <div className="aa-thread__messages">
                                                            {reply.messages.map((msg) => {
                                                                const isYou =
                                                                    String(msg.senderName || '')
                                                                        .toLowerCase() === 'you';
                                                                const sentByBot = Boolean(msg?.sentByBot);
                                                                return (
                                                                    <div
                                                                        key={msg.id}
                                                                        className={`aa-thread__message${isYou ? ' aa-thread__message--you' : ''}${sentByBot ? ' aa-thread__message--bot' : ''}`}
                                                                    >
                                                                        <div className="aa-thread__message-meta">
                                                                            <span className="aa-thread__message-sender">
                                                                                {msg.senderName ||
                                                                                    msg.sender ||
                                                                                    'Sender'}
                                                                                {sentByBot ? (
                                                                                    <span className="aa-thread__bot-badge">
                                                                                        Sent by HAPPPY
                                                                                    </span>
                                                                                ) : null}
                                                                            </span>
                                                                            <span>
                                                                                {formatDate(msg.date)}
                                                                                {msg.timestamp
                                                                                    ? ` · ${formatTimestamp(msg.timestamp)}`
                                                                                    : ''}
                                                                            </span>
                                                                        </div>
                                                                        <p className="aa-thread__message-body">
                                                                            {msg.message}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="aa-thread__no-messages">
                                                            No follow-up messages on this thread yet.
                                                            {reply.linkedinUrl ? (
                                                                <>
                                                                    {' '}
                                                                    <a
                                                                        href={reply.linkedinUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        Open LinkedIn conversation
                                                                    </a>
                                                                    .
                                                                </>
                                                            ) : null}
                                                        </p>
                                                    )}
                                                </article>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * Mobile card for a single job that received replies (Figma 28902:28940).
 * Header shows "Last Activity: <date>", body shows initial avatar + role
 * + company · reply counts, and a full-width CTA whose label flips between
 * "View Reply" (single reply) and "View Thread" (multiple). The expansion
 * panel is the same component the desktop table renders, just inlined
 * into the card so the user keeps context.
 */
function MobileRepliesCard({
    job,
    isExpanded,
    activeContactKey,
    onToggle,
    onToggleContact,
}) {
    const lastActivity = lastActivityFromJob(job);
    const totalReplies = job.totalReplies || job.replies?.length || 0;
    const positiveCount = job.positiveReplies || 0;
    const negativeCount = job.negativeReplies || 0;
    const hasReplies = totalReplies > 0;
    const isThread = totalReplies > 1;

    const buttonLabel = isExpanded
        ? isThread ? 'Hide Thread' : 'Hide Reply'
        : isThread ? 'View Thread' : 'View Reply';

    const company = String(job.companyName || '').trim() || '—';
    const role = String(job.jobTitle || '').trim() || 'Untitled role';
    const applyUrl = String(job.applyUrl || '').trim();
    const hasUnseen = Array.isArray(job.replies) && job.replies.some((r) => r.seen === 0);

    return (
        <article className={`aa-replies__card${hasUnseen ? ' reply-unseen' : ''}`}>
            <header className="aa-replies__card-meta">
                <ClockIcon />
                <span className="aa-replies__card-meta-label">Last Activity:</span>
                <span className="aa-replies__card-meta-date">
                    {formatDate(lastActivity)}
                </span>
            </header>

            <div className="aa-replies__card-body">
                <CompanyLogo src={job.companyLogo} name={company} />
                <div className="aa-replies__card-info">
                    {applyUrl ? (
                        <a
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aa-replies__card-title aa-replies__card-title--link"
                            title={role}
                            aria-label={`Open job posting for ${role} (opens in new tab)`}
                        >
                            {role}
                        </a>
                    ) : (
                        <span className="aa-replies__card-title" title={role}>
                            {role}
                        </span>
                    )}
                    <div className="aa-replies__card-sub">
                        <span className="aa-replies__card-company" title={company}>
                            {company}
                        </span>
                        {(positiveCount > 0 || negativeCount > 0) ? (
                            <span className="aa-replies__card-sep" aria-hidden>·</span>
                        ) : null}
                        <span className="aa-replies__card-counts">
                            {positiveCount > 0 ? (
                                <span className="aa-replies__card-count aa-replies__card-count--positive">
                                    {positiveCount} +ve {positiveCount === 1 ? 'Reply' : 'Replies'}
                                </span>
                            ) : null}
                            {positiveCount > 0 && negativeCount > 0 ? (
                                <span className="aa-replies__card-sep" aria-hidden>·</span>
                            ) : null}
                            {negativeCount > 0 ? (
                                <span className="aa-replies__card-count aa-replies__card-count--negative">
                                    {negativeCount} -ve {negativeCount === 1 ? 'Reply' : 'Replies'}
                                </span>
                            ) : null}
                            {positiveCount === 0 && negativeCount === 0 ? (
                                <span className="aa-replies__card-count aa-replies__card-count--muted">
                                    No replies
                                </span>
                            ) : null}
                        </span>
                    </div>
                </div>
            </div>

            {hasReplies ? (
                <button
                    type="button"
                    className={`aa-replies__card-btn${isExpanded ? ' is-active' : ''}`}
                    aria-expanded={isExpanded}
                    aria-controls={`aa-replies-mob-panel-${job.id}`}
                    onClick={onToggle}
                >
                    {buttonLabel}
                </button>
            ) : null}

            {isExpanded && hasReplies ? (
                <div
                    className="aa-replies__card-expand"
                    id={`aa-replies-mob-panel-${job.id}`}
                >
                    <RepliesPanel
                        job={job}
                        activeContactKey={activeContactKey}
                        onToggleContact={onToggleContact}
                    />
                </div>
            ) : null}
        </article>
    );
}

/** Filter dummy data the same way the API would (reply_type=positive|negative|all). */
function filterByReplyType(rows, replyTypeFilter) {
    if (!replyTypeFilter || replyTypeFilter === 'all') return rows;
    return rows.filter((job) => {
        if (replyTypeFilter === 'positive') return (job.positiveReplies || 0) > 0;
        if (replyTypeFilter === 'negative') return (job.negativeReplies || 0) > 0;
        return true;
    });
}

/** Mimic Laravel's paginator response shape so the UI stays generic. */
function paginate(rows, page, perPage) {
    const total = rows.length;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(Math.max(1, page), lastPage);
    const start = (safePage - 1) * perPage;
    const end = Math.min(start + perPage, total);
    return {
        list: rows.slice(start, end),
        total,
        per_page: perPage,
        current_page: safePage,
        last_page: lastPage,
        from: total === 0 ? 0 : start + 1,
        to: end,
    };
}

const RepliesTab = () => {
    const [jobs, setJobs] = useState([]);
    const [pagination, setPagination] = useState({
        total: 0,
        per_page: PAGE_SIZE,
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
    });
    const [page, setPage] = useState(1);
    const [replyTypeFilter, setReplyTypeFilter] = useState('positive'); // 'all' | 'positive' | 'negative'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedJobId, setExpandedJobId] = useState(null);
    /**
     * Per-job, the currently expanded contact thread within the panel.
     * Shape: { [jobId]: contactKey | null | undefined }.
     *  - undefined → use the single-contact auto-expand default
     *  - null      → user explicitly collapsed every thread on this job
     *  - string    → key of the active contact whose thread is open
     */
    const [expandedContactByJob, setExpandedContactByJob] = useState({});

    useEffect(() => {
        let cancelled = false;

        const applyResult = (apiData) => {
            if (cancelled) return;
            setJobs(Array.isArray(apiData.list) ? apiData.list : []);
            setPagination({
                total: apiData.total || 0,
                per_page: apiData.per_page || PAGE_SIZE,
                current_page: apiData.current_page || 1,
                last_page: apiData.last_page || 1,
                from: apiData.from || 0,
                to: apiData.to || 0,
            });
        };

        const loadDummy = () => {
            setLoading(true);
            setError(null);
            const handle = setTimeout(() => {
                if (cancelled) return;
                const filtered = filterByReplyType(repliesDummyData, replyTypeFilter);
                applyResult(paginate(filtered, page, PAGE_SIZE));
                setLoading(false);
            }, DUMMY_LATENCY_MS);
            return () => clearTimeout(handle);
        };

        const loadLive = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                params.set('page', String(page));
                params.set('per_page', String(PAGE_SIZE));
                if (replyTypeFilter && replyTypeFilter !== 'all') {
                    params.set('reply_type', replyTypeFilter);
                }
                const response = await GET_API(
                    `${API_URL}talent/outreach/get-outreach-agent?${params.toString()}`
                );
                if (cancelled) return;
                if (response?.data?.status === 200 && response?.data?.data) {
                    applyResult(response.data.data);
                } else {
                    setJobs([]);
                    setError('Failed to fetch replies');
                }
            } catch (err) {
                if (cancelled) return;
                setJobs([]);
                setError(err?.response?.data?.message || 'Failed to fetch replies');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (USE_DUMMY_DATA) {
            const cleanup = loadDummy();
            return () => {
                cancelled = true;
                cleanup && cleanup();
            };
        }
        loadLive();
        return () => {
            cancelled = true;
        };
    }, [page, replyTypeFilter]);

    const totalPages = pagination.last_page || 1;
    const isEmpty = !loading && jobs.length === 0;

    const handleFilterChange = (value) => {
        setReplyTypeFilter(value);
        setPage(1);
    };

    const toggleExpand = (jobId) => {
        setExpandedJobId((prev) => (prev === jobId ? null : jobId));
        setExpandedContactByJob((prev) => {
            const next = { ...prev };
            delete next[jobId];
            return next;
        });
    };

    /**
     * Mark a single contact's reply as seen on the backend, then locally flip
     * its `seen` flag so the green "unseen" highlight clears on the next render.
     * Shared by the explicit "View thread" click and the single-contact
     * auto-expand path so both routes converge on the same behaviour.
     */
    const markContactReplySeen = (jobId, contactId, contactSource) => {
        markReplySeen({ id: contactId, provider: contactSource })
            .then(() => {
                setJobs((prev) =>
                    prev.map((job) =>
                        job.id === jobId
                            ? {
                                ...job,
                                replies: job.replies.map((reply) =>
                                    reply.id === contactId ? { ...reply, seen: 1 } : reply
                                ),
                            }
                            : job
                    )
                );
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const toggleContactThread = (jobId, key, contactId, contactSource) => {
        const willOpen = expandedContactByJob[jobId] !== key;
        setExpandedContactByJob((prev) => {
            const current = prev[jobId];
            return {
                ...prev,
                [jobId]: current === key ? null : key,
            };
        });

        if (willOpen) {
            markContactReplySeen(jobId, contactId, contactSource);
        }
    };

    /**
     * When a row is expanded and its thread auto-opens because the job has a
     * single contact the user hasn't toggled yet, mark that contact seen too —
     * otherwise the highlight would stay on an already-visible thread.
     */
    useEffect(() => {
        if (expandedJobId == null) return;
        if (expandedContactByJob[expandedJobId] !== undefined) return;
        const job = jobs.find((j) => j.id === expandedJobId);
        if (!job) return;
        const contacts = dedupeContacts(job.replies);
        if (contacts.length !== 1) return;
        const only = contacts[0];
        if (only.seen === 0 && only.id != null) {
            markContactReplySeen(expandedJobId, only.id, only.sources[0] || 'gmail');
        }
    }, [expandedJobId, jobs, expandedContactByJob]);

    return (
        <section className="aa-replies" aria-labelledby="aa-replies-heading">
            <div className="aa-replies__header">
                <h2 id="aa-replies-heading" className="aa-replies__heading">
                    Jobs You Received Replies For
                </h2>
                <div className="aa-replies__filters" role="group" aria-label="Filter replies">
                    <label className="aa-replies__filter">
                        <span className="aa-replies__filter-label">Reply type</span>
                        <select
                            className="aa-replies__filter-select"
                            value={replyTypeFilter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                        >
                            <option value="all">All replies</option>
                            <option value="positive">Positive only</option>
                            <option value="negative">Negative only</option>
                        </select>
                    </label>
                </div>
            </div>

            {error ? (
                <div className="aa-replies__error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="aa-btn aa-btn--ghost" onClick={() => setPage(page)}>
                        Retry
                    </button>
                </div>
            ) : null}

            <div className="aa-table-wrap" aria-busy={loading}>
                <div className="aa-table-scroll">
                    <table className="aa-table" role="table">
                        <thead className="aa-table__thead">
                            <tr>
                                <th scope="col" className="aa-table__th aa-table__th--job">
                                    Job Details
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--type">
                                    Reply Type
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--last">
                                    Last Activity
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--action">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="aa-table__tbody">
                            {loading && jobs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="aa-table__td aa-table__td--state">
                                        <div className="aa-state aa-state--loading">
                                            <span className="aa-spinner" aria-hidden />
                                            <p>Loading replies…</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan={4} className="aa-table__td aa-table__td--state">
                                        <div className="aa-empty">
                                            <p className="aa-empty__title">No Replies Yet</p>
                                            <p className="aa-empty__body">
                                                Job replies will appear here when you run the Happpy Agent on jobs.
                                                Start activating the agent on jobs to see replies from recruiters and
                                                referrals
                                                {replyTypeFilter !== 'all' ? ' (try clearing the filter)' : ''}.
                                            </p>
                                            <div className="aa-empty__cta">
                                                <Link
                                                    to="/talent/job-agent/recommended-jobs"
                                                    className="aa-btn aa-btn--primary"
                                                >
                                                    SEE RECOMMENDED JOBS
                                                </Link>
                                                <Link
                                                    to="/talent/job-agent/external-jobs"
                                                    className="aa-btn aa-btn--secondary"
                                                >
                                                    PASTE JOB URL FOR REFERRAL
                                                </Link>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jobs.map((job) => {
                                    const contacts = dedupeContacts(job.replies);
                                    const lastActivity = lastActivityFromJob(job);
                                    const isExpanded = expandedJobId === job.id;
                                    const totalReplies = job.totalReplies || job.replies?.length || 0;
                                    const storedContactKey = expandedContactByJob[job.id];
                                    /* Auto-expand the only contact's thread if the user hasn't toggled anything yet. */
                                    const activeContactKey =
                                        storedContactKey === undefined && contacts.length === 1
                                            ? contactKey(contacts[0])
                                            : storedContactKey || null;
                                    return (
                                        <React.Fragment key={job.id}>
                                            <tr className={`aa-table__row ${job.replies?.some(reply => reply.seen === 0) ? 'reply-unseen' : ''}`}>
                                                <td className="aa-table__td aa-table__td--job">
                                                    <div className="aa-replies__job">
                                                        <CompanyLogo src={job.companyLogo} name={job.companyName} />
                                                        <div className="aa-replies__job-text">
                                                            {job.applyUrl ? (
                                                                <a
                                                                    href={job.applyUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="aa-replies__job-title aa-replies__job-title--link"
                                                                    title={job.jobTitle || 'Open job posting'}
                                                                    aria-label={`Open job posting for ${job.jobTitle || 'this role'} (opens in new tab)`}
                                                                >
                                                                    {job.jobTitle || 'Untitled role'}
                                                                </a>
                                                            ) : (
                                                                <span className="aa-replies__job-title" title={job.jobTitle}>
                                                                    {job.jobTitle || 'Untitled role'}
                                                                </span>
                                                            )}
                                                            <span className="aa-replies__job-sub">
                                                                <span className="aa-replies__job-company">
                                                                    {job.companyName || '—'}
                                                                </span>
                                                                {job.appliedDate ? (
                                                                    <>
                                                                        <span className="aa-replies__job-sub-sep" aria-hidden>·</span>
                                                                        <span className="aa-replies__job-applied">
                                                                            Run on {formatDate(job.appliedDate)}
                                                                        </span>
                                                                    </>
                                                                ) : null}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="aa-table__td aa-table__td--type">
                                                    <div className="aa-replies__type">
                                                        {job.positiveReplies > 0 ? (
                                                            <span className="aa-pill aa-pill--positive">
                                                                {job.positiveReplies} positive
                                                            </span>
                                                        ) : null}
                                                        {job.negativeReplies > 0 ? (
                                                            <span className="aa-pill aa-pill--negative">
                                                                {job.negativeReplies} negative
                                                            </span>
                                                        ) : null}
                                                        {!job.positiveReplies && !job.negativeReplies ? (
                                                            <span className="aa-pill aa-pill--muted">No replies</span>
                                                        ) : null}
                                                    </div>
                                                </td>
                                                <td className="aa-table__td aa-table__td--last">
                                                    <span className="aa-replies__last">
                                                        {formatDate(lastActivity)}
                                                    </span>
                                                </td>
                                                <td className="aa-table__td aa-table__td--action">
                                                    {totalReplies > 0 ? (
                                                        <button
                                                            type="button"
                                                            className={`aa-btn aa-btn--action${isExpanded ? ' is-active' : ''}`}
                                                            aria-expanded={isExpanded}
                                                            aria-controls={`aa-replies-panel-${job.id}`}
                                                            onClick={() => toggleExpand(job.id)}
                                                        >
                                                            <span className="aa-btn__label">
                                                                {isExpanded ? 'Hide replies' : 'View replies'}
                                                            </span>
                                                            <span className="aa-btn__count" aria-hidden>
                                                                {totalReplies}
                                                            </span>
                                                            <span
                                                                className={`aa-btn__chev${isExpanded ? ' aa-btn__chev--open' : ''}`}
                                                                aria-hidden
                                                            >
                                                                <ChevronDownIcon />
                                                            </span>
                                                        </button>
                                                    ) : (
                                                        <span className="aa-replies__muted">—</span>
                                                    )}
                                                </td>
                                            </tr>

                                            {isExpanded && contacts.length > 0 ? (
                                                <tr
                                                    className="aa-table__row aa-table__row--expansion"
                                                    id={`aa-replies-panel-${job.id}`}
                                                >
                                                    <td colSpan={4} className="aa-table__td aa-table__td--expansion">
                                                        <RepliesPanel
                                                            job={job}
                                                            activeContactKey={activeContactKey}
                                                            onToggleContact={(key, contactId, contactSource) =>
                                                                toggleContactThread(job.id, key, contactId, contactSource)
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {loading && jobs.length > 0 ? (
                    <div className="aa-table__overlay" aria-hidden>
                        <span className="aa-spinner" />
                    </div>
                ) : null}
            </div>

            {/*
              * Mobile card layout (Figma 28902:28940) — stacked, one card
              * per job that received replies. Sits alongside the desktop
              * table; the global `@media (max-width: 767px)` rule on
              * `.aa-table-wrap` hides the table below 768px while
              * `.aa-replies__cards` flips visible.
              */}
            <div className="aa-replies__cards" aria-busy={loading}>
                {loading && jobs.length === 0 ? (
                    <div className="aa-state aa-state--loading">
                        <span className="aa-spinner" aria-hidden />
                        <p>Loading replies…</p>
                    </div>
                ) : isEmpty ? (
                    <div className="aa-empty">
                        <p className="aa-empty__title">No Replies Yet</p>
                        <p className="aa-empty__body">
                            Job replies will appear here when you run the Happpy Agent on jobs.
                            Start activating the agent on jobs to see replies from recruiters and
                            referrals
                            {replyTypeFilter !== 'all' ? ' (try clearing the filter)' : ''}.
                        </p>
                        <div className="aa-empty__cta">
                            <Link
                                to="/talent/job-agent/recommended-jobs"
                                className="aa-btn aa-btn--primary"
                            >
                                SEE RECOMMENDED JOBS
                            </Link>
                            <Link
                                to="/talent/job-agent/external-jobs"
                                className="aa-btn aa-btn--secondary"
                            >
                                PASTE JOB URL FOR REFERRAL
                            </Link>
                        </div>
                    </div>
                ) : (
                    <ul className="aa-replies__card-list" role="list">
                        {jobs.map((job) => {
                            const contacts = dedupeContacts(job.replies);
                            const isExpanded = expandedJobId === job.id;
                            const storedContactKey = expandedContactByJob[job.id];
                            const activeContactKey =
                                storedContactKey === undefined && contacts.length === 1
                                    ? contactKey(contacts[0])
                                    : storedContactKey || null;
                            return (
                                <li
                                    key={`mob-${job.id}`}
                                    className="aa-replies__card-item"
                                >
                                    <MobileRepliesCard
                                        job={job}
                                        isExpanded={isExpanded}
                                        activeContactKey={activeContactKey}
                                        onToggle={() => toggleExpand(job.id)}
                                        onToggleContact={(key, contactId, contactSource) =>
                                            toggleContactThread(job.id, key, contactId, contactSource)
                                        }
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
                {loading && jobs.length > 0 ? (
                    <div className="aa-replies__cards-overlay" aria-hidden>
                        <span className="aa-spinner" />
                    </div>
                ) : null}
            </div>

            {!isEmpty && totalPages > 1 ? (
                <div className="aa-pager">
                    <button
                        type="button"
                        className="aa-btn aa-btn--ghost"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span className="aa-pager__info">
                        Page {pagination.current_page} of {pagination.last_page}
                        {pagination.total > 0 ? ` · ${pagination.total} jobs` : ''}
                    </span>
                    <button
                        type="button"
                        className="aa-btn aa-btn--ghost"
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            ) : null}
        </section>
    );
};

export default RepliesTab;
