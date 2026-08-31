import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { GET_API, DELETE_API } from '../../../../components/Helper';
import { API_URL, IMAGE_URL } from '../../../../components/Constant';
import jobsInQueueDummyData from './_jobsInQueueDummyData';
import { LogoSVG } from '../../../../assets/Logo';
import VerifyOutreachPerson from '../../linkedin/VerifyOutreachPerson';

/**
 * Jobs in Queue tab — table redesign of `PendingExternalJobsQueue`, matching
 * Figma node 28478:6604.
 *
 * Same data contract as the existing pending queue:
 *   GET /talent/outreach/get-external-apply-pending-jobs
 *     → { status, message, data: Row[] }
 *   DELETE /talent/outreach/external-apply-pending-jobs/{id}?external={0|1}
 *     → cancels the queued job
 *
 * USE_DUMMY_DATA short-circuits the network calls and uses
 * `_jobsInQueueDummyData.js` instead. Cancel still works (mutates the local
 * list with a toast) so the UI is fully clickable in dummy mode.
 *
 * Source classification rule (per design spec):
 *   external === false   → Uplers     (queued from an Uplers careers experience)
 *   external === true    → Extension  (captured by the browser extension on any
 *                                      external site — LinkedIn, company careers
 *                                      pages, etc.)
 *
 * Optional fields tolerated for forward-compat: `manual_mode` (toggles the
 * "On manual mode" badge + Review Outreach CTA) and `outreach_hr_id`
 * (destination of Review Outreach when backend wires it up).
 */

const USE_DUMMY_DATA = false;
const DUMMY_LATENCY_MS = 220;
const PAGE_SIZE = 10;

/** Source pill mapping. Keep ids stable so CSS `--source-{id}` modifiers work. */
const SOURCE = {
    UPLERS: 'uplers',
    EXTENSION: 'extension',
};

function classifySource(row) {
    return row?.external ? SOURCE.EXTENSION : SOURCE.UPLERS;
}

function sourceLabel(id) {
    if (id === SOURCE.EXTENSION) return 'Extension';
    return 'Uplers';
}

function getRowKey(row) {
    return `${row.external ? 'ext' : 'int'}:${row.id}`;
}

/* ---------------- Icons ---------------- */

function HelpIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 1.8-2.5 4" />
            <circle cx="12" cy="17" r="0.5" fill="currentColor" />
        </svg>
    );
}

function BuildingIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="3" width="12" height="18" rx="1.5" />
            <path d="M16 8h4v13H4" />
            <path d="M8 7h4M8 11h4M8 15h4" />
        </svg>
    );
}

/**
 * Puzzle-piece glyph that represents the browser extension. Stands in for any
 * extension-captured source (LinkedIn, company careers page, etc.) so the
 * queue surfaces a single, predictable pill regardless of the originating
 * site.
 */
function ExtensionGlyph() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5a2.5 2.5 0 0 0-5 0V5H4a2 2 0 0 0-2 2v3.8h1.5a2.7 2.7 0 1 1 0 5.4H2V20a2 2 0 0 0 2 2h3.8v-1.5a2.7 2.7 0 1 1 5.4 0V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
        </svg>
    );
}

/**
 * Stylised upward-arrow that stands in for the Uplers wordmark glyph in the
 * source pill. The brand icon isn't bundled in this folder; this keeps the
 * pill self-contained and recognisable as "platform-native".
 */
function UplersGlyph() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 3 L4 12 L8 12 L8 21 L16 21 L16 12 L20 12 Z" />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

/**
 * Small clock glyph used in the mobile card meta row to label the
 * "Added to queue:" timestamp. Mirrors the icon used on the mobile All
 * Activity cards so the two tabs feel visually unified.
 */
function ClockIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

/** Returns the uppercase initial used inside the company avatar tile. */
function getCompanyInitial(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return '—';
    return trimmed.charAt(0).toUpperCase();
}

function SourcePill({ id }) {
    if (id === SOURCE.EXTENSION) {
        return (
            <span className="aa-queue__source aa-queue__source--extension">
                <ExtensionGlyph />
                <span>Extension</span>
            </span>
        );
    }
    return (
        <span className="aa-queue__source aa-queue__source--uplers">
            <LogoSVG emblemOnly customStyle={{ width: '14px', height: '14px' }} />
            <span>Uplers</span>
        </span>
    );
}

/** Source-help popover that mirrors the `?` icon in the table header. */
function SourceHeader() {
    const [open, setOpen] = useState(false);
    return (
        <div className="aa-queue__th-help-wrap">
            <span>Source</span>
            <button
                type="button"
                className="aa-queue__th-help"
                aria-label="Source types: definitions"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                onBlur={() => setOpen(false)}
            >
                <HelpIcon />
            </button>
            {open ? (
                <div className="aa-queue__help-popover" role="tooltip">
                    <p className="aa-queue__help-title">Where the queued job came from</p>
                    <dl className="aa-queue__help-list">
                        <div>
                            <dt>
                                <SourcePill id={SOURCE.UPLERS} />
                            </dt>
                            <dd>Triggered from an Uplers careers experience.</dd>
                        </div>
                        <div>
                            <dt>
                                <SourcePill id={SOURCE.EXTENSION} />
                            </dt>
                            <dd>Captured by the browser extension on an external site (LinkedIn, company careers page, etc.).</dd>
                        </div>
                    </dl>
                </div>
            ) : null}
        </div>
    );
}

/**
 * "Via" pill used on the mobile queue cards. Same two-bucket classification
 * as the desktop `SourcePill` — extension-captured rows surface as a single
 * pill regardless of underlying site (LinkedIn / Naukri / company careers).
 */
function MobileViaPill({ id }) {
    if (id === SOURCE.UPLERS) {
        return (
            <span className="aa-queue__via aa-queue__via--uplers">
                <LogoSVG emblemOnly customStyle={{ width: '12px', height: '12px' }} />
                <span>Via: Uplers</span>
            </span>
        );
    }
    return (
        <span className="aa-queue__via aa-queue__via--extension">
            <ExtensionGlyph />
            <span>Via: Extension</span>
        </span>
    );
}

/**
 * Mobile card for a single queued row. Stacks meta (logo + role + via pill +
 * company + "Added to queue") above a button row that mirrors the desktop
 * actions (Cancel Outreach always; Review Outreach when manual approval is
 * pending). Pure presentation — all handlers come from the parent.
 */
function MobileQueueCard({
    row,
    absoluteRowNum,
    sourceId,
    onReviewOutreach,
    onCancel,
    isDeleting,
}) {
    const company = String(row.title || '').trim() || '—';
    const role = String(row.job_title || '').trim() || 'Open job posting';
    const link = String(row.external_link || '').trim();
    const date = String(row.date || '').trim() || '—';
    const hasPendingAction = Boolean(row.has_pending_action);

    return (
        <article className="aa-queue__card" data-row={absoluteRowNum}>
            <div className="aa-queue__card-body">
                <span className="aa-queue__card-initial" aria-hidden>
                    {getCompanyInitial(company)}
                </span>
                <div className="aa-queue__card-info">
                    <div className="aa-queue__card-title-row">
                        {link ? (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aa-queue__card-title"
                                title={role}
                            >
                                {role}
                            </a>
                        ) : (
                            <span className="aa-queue__card-title" title={role}>{role}</span>
                        )}
                        <MobileViaPill id={sourceId} />
                    </div>
                    <div className="aa-queue__card-sub">
                        <span className="aa-queue__card-company" title={company}>
                            {company}
                        </span>
                        <span className="aa-queue__card-sep" aria-hidden>·</span>
                        <span className="aa-queue__card-meta">
                            <ClockIcon />
                            <span className="aa-queue__card-meta-label">Added to queue:</span>
                            <span className="aa-queue__card-meta-date">{date}</span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="aa-queue__card-actions">
                <button
                    type="button"
                    className="aa-queue__card-btn aa-queue__card-btn--cancel"
                    disabled={isDeleting}
                    onClick={() => onCancel(row)}
                >
                    {isDeleting ? 'Cancelling…' : 'Cancel Outreach'}
                </button>
                {hasPendingAction ? (
                    <button
                        type="button"
                        className="aa-queue__card-btn aa-queue__card-btn--review"
                        onClick={() => onReviewOutreach(row)}
                    >
                        Review Outreach
                    </button>
                ) : null}
            </div>
        </article>
    );
}

const JobsInQueueTab = ({ maxLimit }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [onlyManualPending, setOnlyManualPending] = useState(false);
    const [page, setPage] = useState(0);
    const [pendingDeleteJob, setPendingDeleteJob] = useState(null);
    const [deletingKey, setDeletingKey] = useState(null);
    // Drawer state. `open` toggles the right-side drawer; `jobId` is the
    // outreach_hr_id to deep-link into VerifyOutreachPerson. Used by the
    // per-row "Review Outreach" button on rows with `has_pending_action`.
    const [outreachDrawer, setOutreachDrawer] = useState({ open: false, jobId: null });

    /* ---------------- Fetch ---------------- */

    const fetchRows = useCallback(async () => {
        if (USE_DUMMY_DATA) {
            setLoading(true);
            setError('');
            await new Promise((r) => setTimeout(r, DUMMY_LATENCY_MS));
            const list = Array.isArray(jobsInQueueDummyData?.data)
                ? jobsInQueueDummyData.data
                : [];
            setRows(list);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const response = await GET_API(`${API_URL}talent/outreach/get-external-apply-pending-jobs`);
            if (response?.data?.status === 200 && Array.isArray(response.data.data)) {
                setRows(response.data.data);
            } else {
                setRows([]);
            }
        } catch (err) {
            setRows([]);
            setError(err?.response?.data?.message || 'Could not load the pending queue.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);

    /**
     * Refresh the queue when the page-level "Paste Job Link" modal (in
     * `AgentActivity.js`) successfully submits — keep the event name in sync
     * with `JOB_LINK_ADDED_EVENT` declared there.
     */
    useEffect(() => {
        const onAdded = () => fetchRows();
        window.addEventListener('agent-activity:job-link-added', onAdded);
        return () => window.removeEventListener('agent-activity:job-link-added', onAdded);
    }, [fetchRows]);

    /* ---------------- Filter + page ---------------- */

    const filteredRows = useMemo(() => {
        if (!onlyManualPending) return rows;
        return rows.filter((r) => Boolean(r.has_pending_action));
    }, [rows, onlyManualPending]);

    /** Reset paging when the filtered set changes shape. */
    useEffect(() => {
        setPage(0);
    }, [onlyManualPending, rows.length]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages - 1);
    const visibleRows = useMemo(() => {
        const start = safePage * PAGE_SIZE;
        return filteredRows.slice(start, start + PAGE_SIZE);
    }, [filteredRows, safePage]);

    /* ---------------- Cancel ---------------- */

    const openCancel = (row) => setPendingDeleteJob(row);
    const closeCancel = () => {
        if (deletingKey) return;
        setPendingDeleteJob(null);
    };

    useEffect(() => {
        if (!pendingDeleteJob) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape' && !deletingKey) setPendingDeleteJob(null);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [pendingDeleteJob, deletingKey]);

    const confirmCancel = async () => {
        if (!pendingDeleteJob) return;
        const job = pendingDeleteJob;
        const key = getRowKey(job);
        try {
            setDeletingKey(key);
            if (USE_DUMMY_DATA) {
                await new Promise((r) => setTimeout(r, 220));
                setRows((prev) => prev.filter((r) => getRowKey(r) !== key));
                toast.success('Job removed from pending queue');
                setPendingDeleteJob(null);
                return;
            }
            const externalParam = job.external ? '1' : '0';
            const response = await DELETE_API(
                `${API_URL}talent/outreach/external-apply-pending-jobs/${job.id}?external=${externalParam}`
            );
            if (response?.data?.status === 200) {
                toast.success(response.data.message || 'Job removed from pending queue');
                setRows((prev) => prev.filter((r) => getRowKey(r) !== key));
                setPendingDeleteJob(null);
            } else {
                toast.error(response?.data?.message || 'Could not remove this job');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not remove this job');
        } finally {
            setDeletingKey(null);
        }
    };

    /* ---------------- Review Outreach drawer ---------------- */

    /**
     * Opens the manual outreach confirmation flow inside a right-side drawer
     * instead of a full-page navigation. `VerifyOutreachPerson` is mounted in
     * "embedded" mode (`embeddedJobId` + `onClose`) so it preselects the row's
     * outreach_hr_id and suppresses its internal route updates.
     */
    const openOutreachDrawer = useCallback((jobId) => {
        setOutreachDrawer({ open: true, jobId: jobId ?? null });
    }, []);

    const closeOutreachDrawer = useCallback(() => {
        setOutreachDrawer({ open: false, jobId: null });
        // The user may have submitted or discarded inside the drawer — refetch
        // the queue so the row's `has_pending_action` flag stays accurate.
        fetchRows();
    }, [fetchRows]);

    const handleReviewOutreach = (row) => {
        openOutreachDrawer(row?.outreach_hr_id ?? null);
    };

    /* ---------------- Drawer effects (Esc, body scroll lock) ---------------- */

    useEffect(() => {
        if (!outreachDrawer.open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') closeOutreachDrawer();
        };
        window.addEventListener('keydown', onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [outreachDrawer.open, closeOutreachDrawer]);

    /* ---------------- Render ---------------- */

    const isEmpty = !loading && filteredRows.length === 0;
    const total = filteredRows.length;

    return (
        <section className="aa-queue" aria-labelledby="aa-queue-heading">
            <h2 id="aa-queue-heading" className="aa-queue__heading">
                These roles are queued while the agent finds relevant contacts for referral outreach
            </h2>

            <div className="aa-queue__topline">
                <aside className="aa-queue__bento" aria-label="Daily limits">
                    <div className="aa-queue__bento-mascot" aria-hidden>
                        <img src={IMAGE_URL + "/outreach/mascot-neutral.svg"} alt="Mascot" />
                    </div>
                    <div className="aa-queue__bento-callout">
                        <p className="aa-queue__bento-body">
                            You can run referrals for up to {maxLimit} jobs per day. Daily referral limit reached?
                            Additional jobs will automatically join this queue!
                        </p>
                        <p className="aa-queue__bento-ps">
                            PS: Any new referral run after 9 PM will be taken up from 9 AM next day.
                        </p>
                    </div>
                </aside>

                {/* <label className="aa-queue__filter">
                    <input
                        type="checkbox"
                        className="aa-queue__filter-input"
                        checked={onlyManualPending}
                        onChange={(e) => setOnlyManualPending(e.target.checked)}
                    />
                    <span className="aa-queue__filter-box" aria-hidden />
                    <span className="aa-queue__filter-label">Only show manual approvals pending</span>
                </label> */}
            </div>

            {error ? (
                <div className="aa-replies__error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="aa-btn aa-btn--ghost" onClick={fetchRows}>
                        Retry
                    </button>
                </div>
            ) : null}

            <div className="aa-table-wrap" aria-busy={loading}>
                <div className="aa-table-scroll">
                    <table className="aa-table aa-table--queue" role="table">
                        <thead className="aa-table__thead">
                            <tr>
                                <th scope="col" className="aa-table__th aa-table__th--queue-num">No.</th>
                                <th scope="col" className="aa-table__th aa-table__th--queue-source">
                                    <SourceHeader />
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--queue-company">Company</th>
                                <th scope="col" className="aa-table__th aa-table__th--queue-role">Role</th>
                                <th scope="col" className="aa-table__th aa-table__th--queue-added">Added to Queue</th>
                                <th scope="col" className="aa-table__th aa-table__th--queue-action">Action</th>
                            </tr>
                        </thead>
                        <tbody className="aa-table__tbody">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="aa-table__td aa-table__td--state">
                                        <div className="aa-state aa-state--loading">
                                            <span className="aa-spinner" aria-hidden />
                                            <p>Loading the queue…</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan={6} className="aa-table__td aa-table__td--state">
                                        <div className="aa-empty">
                                            <p className="aa-empty__title">
                                                {onlyManualPending ? 'No manual approvals pending' : 'Queue is clear'}
                                            </p>
                                            <p className="aa-empty__body">
                                                {onlyManualPending
                                                    ? 'Uncheck the filter above to see all queued jobs.'
                                                    : 'Nothing waiting on the agent right now — new jobs you add will show up here.'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map((row, idx) => {
                                    const sourceId = classifySource(row);
                                    const company = String(row.title || '').trim() || '—';
                                    const role = String(row.job_title || '').trim();
                                    const link = String(row.external_link || '').trim();
                                    const has_pending_action = Boolean(row.has_pending_action);
                                    const rowKey = getRowKey(row);
                                    const isDeleting = deletingKey === rowKey;
                                    const absoluteRowNum = safePage * PAGE_SIZE + idx + 1;

                                    return (
                                        <tr key={rowKey} className="aa-table__row aa-queue__row">
                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--num">
                                                <span className="aa-queue__num">{absoluteRowNum}</span>
                                            </td>

                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--source">
                                                <SourcePill id={sourceId} />
                                            </td>

                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--company">
                                                <span className="aa-queue__company">
                                                    <span className="aa-queue__company-icon" aria-hidden>
                                                        <BuildingIcon />
                                                    </span>
                                                    <span className="aa-queue__company-name" title={company}>
                                                        {company}
                                                    </span>
                                                </span>
                                                {row.duplicate_job ? (
                                                    <span
                                                        className="aa-queue__dup-pill"
                                                        title="Another pending row shares this job"
                                                    >
                                                        Duplicate
                                                    </span>
                                                ) : null}
                                            </td>

                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--role">
                                                {link ? (
                                                    <a
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="aa-queue__role-link"
                                                        title={role || 'Open job posting'}
                                                    >
                                                        <span>{role || 'Open job posting'}</span>
                                                        <ExternalLinkIcon />
                                                    </a>
                                                ) : (
                                                    <span className="aa-queue__role-link aa-queue__role-link--plain">
                                                        {role || '—'}
                                                    </span>
                                                )}
                                                {has_pending_action ? (
                                                    <span className="aa-queue__manual-pill">has pending action</span>
                                                ) : null}
                                            </td>

                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--added">
                                                <span className="aa-queue__added">
                                                    {String(row.date || '').trim() || '—'}
                                                </span>
                                            </td>

                                            <td className="aa-table__td aa-queue__cell aa-queue__cell--action">
                                                <div className="aa-queue__actions">
                                                    {has_pending_action ? (
                                                        <button
                                                            type="button"
                                                            className="aa-btn aa-btn--review"
                                                            onClick={() => handleReviewOutreach(row)}
                                                        >
                                                            Review Outreach
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        className="aa-btn aa-btn--cancel"
                                                        disabled={isDeleting}
                                                        onClick={() => openCancel(row)}
                                                    >
                                                        {isDeleting ? '…' : 'Cancel'}
                                                    </button>
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
              * Mobile card layout (Figma 28902:31320) — stacked, one card
              * per queued row. Sits alongside the desktop table; the global
              * `@media (max-width: 767px)` rule on `.aa-table-wrap` hides
              * the table below 768px while `.aa-queue__cards` flips visible.
              */}
            <div className="aa-queue__cards" aria-busy={loading}>
                {loading && rows.length === 0 ? (
                    <div className="aa-state aa-state--loading">
                        <span className="aa-spinner" aria-hidden />
                        <p>Loading the queue…</p>
                    </div>
                ) : isEmpty ? (
                    <div className="aa-empty">
                        <p className="aa-empty__title">
                            {onlyManualPending ? 'No manual approvals pending' : 'Queue is clear'}
                        </p>
                        <p className="aa-empty__body">
                            {onlyManualPending
                                ? 'Uncheck the filter above to see all queued jobs.'
                                : 'Nothing waiting on the agent right now — new jobs you add will show up here.'}
                        </p>
                    </div>
                ) : (
                    <ul className="aa-queue__card-list" role="list">
                        {visibleRows.map((row, idx) => {
                            const sourceId = classifySource(row);
                            const rowKey = getRowKey(row);
                            const isDeleting = deletingKey === rowKey;
                            const absoluteRowNum = safePage * PAGE_SIZE + idx + 1;
                            return (
                                <li key={`mob-${rowKey}`} className="aa-queue__card-item">
                                    <MobileQueueCard
                                        row={row}
                                        absoluteRowNum={absoluteRowNum}
                                        sourceId={sourceId}
                                        onReviewOutreach={handleReviewOutreach}
                                        onCancel={openCancel}
                                        isDeleting={isDeleting}
                                    />
                                </li>
                            );
                        })}
                    </ul>
                )}
                {loading && rows.length > 0 ? (
                    <div className="aa-queue__cards-overlay" aria-hidden>
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
                        Page {safePage + 1} of {totalPages} · {total} {total === 1 ? 'job' : 'jobs'}
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

            {pendingDeleteJob ? (
                <div className="aa-modal" role="dialog" aria-modal="true" aria-labelledby="aa-queue-cancel-title">
                    <button
                        type="button"
                        className="aa-modal__backdrop"
                        aria-label="Close dialog"
                        onClick={closeCancel}
                    />
                    <div className="aa-modal__panel" role="document">
                        <div className="aa-modal__head">
                            <div>
                                <h3 id="aa-queue-cancel-title" className="aa-modal__title">
                                    Remove from pending queue?
                                </h3>
                                <p className="aa-modal__sub">
                                    {pendingDeleteJob.job_title ||
                                        pendingDeleteJob.title ||
                                        'This job'}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="aa-modal__close"
                                aria-label="Close"
                                onClick={closeCancel}
                                disabled={!!deletingKey}
                            >
                                ×
                            </button>
                        </div>
                        <div className="aa-modal__body">
                            <p className="aa-modal__pre">
                                This row will be removed from your referral queue. The Happpy Agent will
                                <strong> not </strong>
                                run outreach for it. You can add it back later from the extension or job link
                                paste flow.
                            </p>
                        </div>
                        <div className="aa-modal__foot aa-modal__foot--split">
                            <button
                                type="button"
                                className="aa-btn aa-btn--ghost"
                                disabled={!!deletingKey}
                                onClick={closeCancel}
                            >
                                Keep in queue
                            </button>
                            <button
                                type="button"
                                className="aa-btn aa-btn--cancel-confirm"
                                disabled={!!deletingKey}
                                onClick={confirmCancel}
                            >
                                {deletingKey ? 'Removing…' : 'Yes, remove'}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {outreachDrawer.open ? (
                <div
                    className="aa-drawer aa-drawer--outreach"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="aa-drawer-outreach-title"
                >
                    <button
                        type="button"
                        className="aa-drawer__backdrop"
                        aria-label="Close outreach review"
                        onClick={closeOutreachDrawer}
                    />
                    <aside className="aa-drawer__panel">
                        <header className="aa-drawer__head">
                            <h3 id="aa-drawer-outreach-title" className="aa-drawer__title">
                                Review Outreach
                            </h3>
                            <button
                                type="button"
                                className="aa-drawer__close"
                                aria-label="Close"
                                onClick={closeOutreachDrawer}
                            >
                                <CloseIcon />
                            </button>
                        </header>
                        <div className="aa-drawer__body">
                            <VerifyOutreachPerson
                                embeddedJobId={outreachDrawer.jobId}
                                onClose={closeOutreachDrawer}
                                jobsInQueue={true}
                            />
                        </div>
                    </aside>
                </div>
            ) : null}
        </section>
    );
};

export default JobsInQueueTab;
