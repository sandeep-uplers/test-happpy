'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from '@/talent/navigation/routerCompat';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import 'react-datepicker/dist/react-datepicker.css';
import { GET_API } from '../../../../components/Helper';
import { API_JOB_AGENT_AGENT_TAILOR_ACTIVITY, API_URL } from '../../../../components/Constant';
import { SET_TAILOR_MODAL_OPEN } from '../../../../store/actions/actionsTypes';
import { fetchAgentJD } from '../../../../store/actions/resumeActions';
import allActivityDummyData from './_allActivityDummyData';
import VerifyOutreachPerson from '../../linkedin/VerifyOutreachPerson';

/**
 * All Activity tab — table redesign of `JobAgentJobs`, matching Figma node
 * 28464:5995. Surfaces every Happpy Agent run (success, failure, queued,
 * cancelled) in one feed.
 *
 * Live data contract (mirrors `JobAgentJobs`):
 *   GET /talent/outreach/agent-tailor-activity?page&limit&run_by&agent&tailor&status&q&date_from&date_to
 *     → { status, message, data: { list: Row[], total: number } }
 *
 * `View Thread` expansion (Completed rows only):
 *   GET /talent/outreach/outreached-people?outreach_hr_id={id}
 *     → { status, message, data: { people: [...] } }
 *
 * USE_DUMMY_DATA short-circuits both calls and serves
 * `_allActivityDummyData.js` instead. Filters + pagination work client-side
 * in dummy mode and server-side in live mode.
 *
 * Run-by classification (two-bucket): every row resolves to either `you`
 * (talent started the agent — paste link, extension, recommended job, WhatsApp)
 * or `auto` (system auto-run, `talent_outreach_hrs.source = RunBySystem`).
 * Prefers `row.run_by` when present.
 */

const USE_DUMMY_DATA = false;
const DUMMY_LATENCY_MS = 220;
const PAGE_SIZE = 10;

/**
 * Page-level "Paste Job Link" dispatches this custom event after a
 * successful submit so this tab can refetch its rows. Owned by
 * `AgentActivity.js` — keep the string in sync if it changes there.
 */
const JOB_LINK_ADDED_EVENT = 'agent-activity:job-link-added';

/* ---------------- Constants ---------------- */

const OUTREACH_STATUS = {
    PENDING: 0,
    PROCESSING: 1,
    COMPLETED: 2,
    FAILED: 3,
    DATA_NOT_FOUND: 4,
    SCRAPPING_FAILED: 5,
    DISCARDED: 6,
    QUEUED: 7,
};

const RUN_BY = {
    YOU: 'you',
    AUTO: 'auto',
};

const RUN_BY_FILTER_OPTIONS = [
    { value: 'all', label: 'All runs' },
    { value: RUN_BY.YOU, label: 'You' },
    { value: RUN_BY.AUTO, label: 'Auto' },
];

const TAILOR_FILTER_OPTIONS = [
    { value: 'all', label: 'Show all' },
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
];

/** Display variant for the Status pill column. Maps multiple raw codes into one. */
const STATUS_VARIANT = {
    PENDING: 0,
    PROCESSING: 1,
    COMPLETED: 2,
    FAILED: 3,
    // DATA_NOT_FOUND: 4,
    // SCRAPPING_FAILED: 5,
    DISCARDED: 6,
    QUEUED: 7,
};

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All statuses' },
    { value: STATUS_VARIANT.PENDING, label: 'Pending' },
    { value: STATUS_VARIANT.COMPLETED, label: 'Success' },
    { value: STATUS_VARIANT.FAILED, label: 'Failed' },
    { value: STATUS_VARIANT.CANCELLED, label: 'Cancelled' },
    { value: STATUS_VARIANT.QUEUED, label: 'Queued' },
    { value: STATUS_VARIANT.DISCARDED, label: 'Discarded' },
];

/* ---------------- Helpers ---------------- */

function unwrapApiData(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) return body.data;
    return null;
}

/**
 * Resolves a row into one of the two run-by pills: `you` or `auto`.
 *
 * Prefers `row.run_by`. Falls back to `run_source` / nested `row.source`
 * matching the backend `RunBySystem` marker.
 */
function classifyRunBy(row) {
    const explicit = String(row?.run_by || '').toLowerCase();
    if (explicit === RUN_BY.AUTO) return RUN_BY.AUTO;
    if (explicit === RUN_BY.YOU || explicit === 'manual') return RUN_BY.YOU;
    const source = String(row?.run_source || row?.row?.run_source || '').toLowerCase();
    if (source === 'runbysystem') return RUN_BY.AUTO;
    return RUN_BY.YOU;
}

/** Maps a raw `outreach_status` code to one of the four design pill variants. */
function statusVariantForRow(row) {
    const code = Number(row?.status ?? row?.row?.outreach_status);
    if (code === OUTREACH_STATUS.COMPLETED) return STATUS_VARIANT.SENT;
    if (
        code === OUTREACH_STATUS.PENDING ||
        code === OUTREACH_STATUS.PROCESSING ||
        code === OUTREACH_STATUS.QUEUED ||
        code === OUTREACH_STATUS.DATA_NOT_FOUND
    ) {
        return STATUS_VARIANT.PENDING;
    }
    if (code === OUTREACH_STATUS.FAILED || code === OUTREACH_STATUS.SCRAPPING_FAILED) {
        return STATUS_VARIANT.FAILED;
    }
    if (code === OUTREACH_STATUS.DISCARDED) return STATUS_VARIANT.CANCELLED;
    const s = String(row?.status_string || '').toLowerCase();
    if (s.includes('cancel')) return STATUS_VARIANT.CANCELLED;
    if (s.includes('fail')) return STATUS_VARIANT.FAILED;
    if (s.includes('complete') || s.includes('sent') || s.includes('success')) return STATUS_VARIANT.SENT;
    return STATUS_VARIANT.PENDING;
}

function statusVariantLabel(variant) {
    if (variant === STATUS_VARIANT.SENT) return 'Sent';
    if (variant === STATUS_VARIANT.FAILED) return 'Failed';
    if (variant === STATUS_VARIANT.CANCELLED) return 'Cancelled';
    return 'Pending';
}

/** Splits "YYYY-MM-DD HH:mm:ss" into the two-line date format used in the cell. */
function formatActivityDateMultiline(input) {
    if (!input || typeof input !== 'string') return { date: '—', time: '' };
    const normalized = input.includes('T') ? input : input.replace(' ', 'T');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return { date: input, time: '' };
    const date = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
    const time = d
        .toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
        .replace(/\s/g, ' ');
    return { date, time: `at ${time}` };
}

const JOB_ROLE_MAX_CHARS = 28;

function formatJobRoleCell(jobTitle) {
    const raw = typeof jobTitle === 'string' ? jobTitle.trim() : '';
    if (!raw) return { display: 'View job', full: '' };
    if (raw.length <= JOB_ROLE_MAX_CHARS) return { display: raw, full: raw };
    return { display: `${raw.slice(0, JOB_ROLE_MAX_CHARS)}…`, full: raw };
}

function getRowKey(row, idx) {
    return `${row?.row?.outreach_hr_id ?? row?.row?.temp_id ?? row?.activity_date ?? 'row'}-${idx}`;
}

/**
 * Mirrors `isAgentCompletedRow` from `JobAgentJobs.js` — a row is treated as
 * an agent-completed (success) run when the agent ran (`used_agent === 'Yes'`)
 * AND the human-readable status mentions complete/success. We key off
 * `status_string` rather than the numeric code so the two surfaces stay in
 * lockstep even if the backend introduces additional success variants.
 */
function isAgentCompletedRow(row) {
    if (!row || row.used_agent !== 'Yes') return false;
    const s = String(row.status_string || '').toLowerCase();
    return s.includes('complete') || s.includes('success');
}

/**
 * Convert a "YYYY-MM-DD" string into a local-midnight `Date`. Returns `null`
 * for any falsy/invalid input. Kept tolerant on purpose so the picker can be
 * fed the raw filter strings without precondition checks.
 */
function parseYmd(value) {
    if (!value || typeof value !== 'string') return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Inverse of `parseYmd` — emits "" for nullish values so cleared pickers still satisfy our API contract. */
function toYmd(date) {
    if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/* ---------------- Icons ---------------- */

function BuildingIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="3" width="12" height="18" rx="1.5" />
            <path d="M16 8h4v13H4" />
            <path d="M8 7h4M8 11h4M8 15h4" />
        </svg>
    );
}

function PersonGlyph() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
        </svg>
    );
}

function AutoGlyph() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M13 2 4 14h8l-1 8 9-12h-8l1-8z" />
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
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

function PersonSearchIcon() {
    return (
        <svg className="aa-queue__pending-strip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="10" cy="8" r="4" />
            <path d="M2 22a8 8 0 0 1 13.5-5.8" />
            <circle cx="18" cy="18" r="3" />
            <path d="m22 22-1.5-1.5" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg className="aa-queue__pending-strip-btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
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

function KebabIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
        </svg>
    );
}

/**
 * Per-row kebab menu shown on each mobile card (Figma 29083:10416). Popover
 * always exposes:
 *   - "View Job" — opens `row.apply_url` in a new tab (kept as a real anchor
 *     so middle/right-click "open in new tab" works)
 *   - "Tailor Resume" — only when the row is still tailorable, mirroring the
 *     desktop `TailoredCell` rules: hidden when `used_tailor === 'Yes'` or
 *     the row landed in a terminal Discarded/Failed state, and hidden for
 *     non-product-talent users since they don't have tailor access.
 * Closes on outside click + Escape.
 */
function MobileRowMenu({ row, isProductTalent, onTailor }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    const link = String(row?.apply_url || '').trim();
    const statusCode = Number(row?.status ?? row?.row?.outreach_status);
    const isTerminal =
        statusCode === OUTREACH_STATUS.DISCARDED ||
        statusCode === OUTREACH_STATUS.FAILED;
    const showTailor = Boolean(
        isProductTalent && row?.used_tailor !== 'Yes' && !isTerminal
    );

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => {
            if (!wrapRef.current?.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div className="aa-act__card-menu" ref={wrapRef}>
            <button
                type="button"
                className={`aa-act__card-menu-btn${open ? ' is-open' : ''}`}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Row actions"
                onClick={() => setOpen((v) => !v)}
            >
                <KebabIcon />
            </button>
            {open ? (
                <div className="aa-act__card-menu-pop" role="menu">
                    {link ? (
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="aa-act__card-menu-item"
                            role="menuitem"
                            onClick={() => setOpen(false)}
                        >
                            View Job
                        </a>
                    ) : (
                        <span
                            className="aa-act__card-menu-item aa-act__card-menu-item--disabled"
                            role="menuitem"
                            aria-disabled="true"
                        >
                            View Job
                        </span>
                    )}
                    {showTailor ? (
                        <button
                            type="button"
                            className="aa-act__card-menu-item"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onTailor?.(row);
                            }}
                        >
                            Tailor Resume
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

/**
 * "Via" pill used on the mobile activity cards. Mirrors the desktop
 * `RunByPill` (You vs Auto) so mobile and PC stay in sync.
 */
function MobileViaPill({ row }) {
    const runBy = classifyRunBy(row);
    if (runBy === RUN_BY.AUTO) {
        return (
            <span className="aa-act__via aa-act__via--auto">
                <AutoGlyph />
                <span>Via: Auto</span>
            </span>
        );
    }
    return (
        <span className="aa-act__via aa-act__via--you">
            <PersonGlyph />
            <span>Via: You</span>
        </span>
    );
}

/** Plain colored "Status: Xyz" label used in the mobile card meta row. */
function MobileStatusInline({ row }) {
    const code = Number(row?.status);
    const label = row?.status_string || statusVariantLabel(statusVariantForRow(row));
    let modifier = 'pending';
    if (code === OUTREACH_STATUS.COMPLETED) modifier = 'sent';
    else if (code === OUTREACH_STATUS.FAILED || code === OUTREACH_STATUS.SCRAPPING_FAILED) modifier = 'failed';
    else if (code === OUTREACH_STATUS.DISCARDED) modifier = 'cancelled';
    else if (code === OUTREACH_STATUS.QUEUED) modifier = 'queued';
    return (
        <span className="aa-act__mob-status">
            <span className="aa-act__mob-status-label">Status:</span>{' '}
            <strong className={`aa-act__mob-status-value aa-act__mob-status-value--${modifier}`}>{label}</strong>
        </span>
    );
}

/**
 * Mobile card action button — wraps the same per-status decisions as the
 * desktop `ActionCell` (View Thread / Hide Thread / View Reply / View Queue)
 * but styled as the full-width pill from the mobile Figma. Returns `null`
 * when the row has no actionable affordance (failed / cancelled) so the
 * card collapses gracefully.
 */
/**
 * Mobile CTA — only rendered for rows that need a manual outreach review
 * (`row.row.manual_mode === true`). Opens the same right-side outreach
 * drawer the pending-strip "Take Action" button uses, pre-selected to this
 * row's `outreach_hr_id`. Rows that aren't in manual mode have no CTA.
 */
function MobileActionButton({ row, onReviewOutreach }) {
    if (!row?.row?.manual_mode) return null;
    const outreachHrId = row?.row?.outreach_hr_id ?? null;
    return (
        <button
            type="button"
            className="aa-act__card-btn"
            onClick={() => onReviewOutreach?.(outreachHrId)}
        >
            Review Outreach
        </button>
    );
}

function MobileActivityCard({
    row,
    idx,
    page,
    isProductTalent,
    expanded,
    onTailor,
    onReviewOutreach,
    reachedPeople,
    reachedLoading,
    reachedError,
}) {
    const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
    const dt = formatActivityDateMultiline(row.activity_date);
    const role = formatJobRoleCell(row.job_title);
    const link = String(row.apply_url || '').trim();

    return (
        <article className="aa-act__card">
            <header className="aa-act__card-meta">
                <ClockIcon />
                <span className="aa-act__card-meta-label">Last Activity:</span>
                <span className="aa-act__card-meta-date">{dt.date}</span>
                {dt.time ? <span className="aa-act__card-meta-time">{dt.time}</span> : null}
            </header>

            <div className="aa-act__card-body">
                <span className="aa-act__card-num" aria-hidden>{rowNum}</span>
                <div className="aa-act__card-info">
                    <div className="aa-act__card-title-row">
                        {link ? (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="aa-act__card-title"
                                title={role.full || role.display}
                            >
                                {role.display}
                            </a>
                        ) : (
                            <span className="aa-act__card-title" title={role.full}>{role.display}</span>
                        )}
                        <MobileViaPill row={row} />
                    </div>
                    <div className="aa-act__card-sub">
                        <span className="aa-act__card-company" title={row.company_name || ''}>
                            {row.company_name || '—'}
                        </span>
                        <span className="aa-act__card-sep" aria-hidden>·</span>
                        <MobileStatusInline row={row} />
                    </div>
                </div>
                <MobileRowMenu
                    row={row}
                    isProductTalent={isProductTalent}
                    onTailor={onTailor}
                />
            </div>

            <div className="aa-act__card-actions">
                <MobileActionButton row={row} onReviewOutreach={onReviewOutreach} />
            </div>

            {expanded ? (
                <div className="aa-act__card-expand">
                    <ReachedPeopleInline
                        people={reachedPeople}
                        loading={reachedLoading}
                        error={reachedError}
                    />
                </div>
            ) : null}
        </article>
    );
}

/* ---------------- Sub-components ---------------- */

function RunByPill({ id }) {
    if (id === RUN_BY.AUTO) {
        return (
            <span className="aa-act__source aa-act__source--auto">
                <AutoGlyph />
                <span>Auto</span>
            </span>
        );
    }
    return (
        <span className="aa-act__source aa-act__source--you">
            <PersonGlyph />
            <span>You</span>
        </span>
    );
}

const STATUS_TIP_CLOSE_MS = 280;

/**
 * Default tooltip text per status variant. Used when there's no row-specific
 * `discard_reason` to show — keeps the wording in sync with the column
 * header's help popover so the user sees the same explanation everywhere.
 */
function statusTipDescriptionForCode(statusCode) {
    const code = Number(statusCode);
    if (code === OUTREACH_STATUS.COMPLETED) {
        return 'Outreach finished. The reached people are recorded against this row.';
    }
    if (code === OUTREACH_STATUS.PROCESSING) {
        return 'The agent is actively finding contacts and sending outreach.';
    }
    if (code === OUTREACH_STATUS.PENDING || code === OUTREACH_STATUS.DATA_NOT_FOUND) {
        return 'The agent found employee data for this company; outreach will run shortly.';
    }
    if (code === OUTREACH_STATUS.FAILED || code === OUTREACH_STATUS.SCRAPPING_FAILED) {
        return 'The agent could not complete outreach. See the column header help for common causes.';
    }
    if (code === OUTREACH_STATUS.QUEUED) {
        return 'The agent is finding employees for this job, or it is waiting to start.';
    }
    if (code === OUTREACH_STATUS.DISCARDED) {
        return 'You stopped outreach for this job, or it was closed by the system.';
    }
    return '';
}
/**
 * Status pill — mirrors the data logic of `JobAgentJobs.js` `StatusPill`:
 *   - label is `row.status_string` (raw server label),
 *   - colour/background is driven by `row.status` via `jadPillClassForStatusCode`,
 *   - Failed / ScrappingFailed rows surface `row.discard_reason` in the tip
 *     (same as JAD); other rows show a generic per-status description.
 *
 * The leading status dot from the original AllActivity design is preserved
 * via the `aa-act__status-pill` modifier (flips the JAD pill from
 * `inline-block` to `inline-flex` so the dot sits cleanly to the left of
 * the label).
 *
 * Tooltip rendering uses the same portal + `getBoundingClientRect`
 * positioning as JAD `StatusPill`, so it never affects row height and is
 * never clipped by the table's `overflow: hidden`.
 */
function StatusPill({ row, tipId }) {
    const anchorRef = useRef(null);
    const popRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 300 });

    const code = Number(row?.status);
    const label = row?.status_string || '—';
    const pillClass = jadPillClassForStatusCode(code);

    const discardReason = String(row?.discard_reason || '').trim();
    const isFailed =
        code === OUTREACH_STATUS.FAILED || code === OUTREACH_STATUS.SCRAPPING_FAILED;
    const reason = isFailed && discardReason
        ? discardReason
        : statusTipDescriptionForCode(code);
    const hasTip = Boolean(reason);

    const clearCloseTimer = () => {
        if (closeTimerRef.current != null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const placePopover = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        const pop = popRef.current;
        const margin = 10;
        const gap = 4;
        const maxW = Math.min(300, window.innerWidth - margin * 2);
        const br = anchor.getBoundingClientRect();
        let left = br.left + br.width / 2 - maxW / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));
        let top = br.bottom + gap;
        if (pop) {
            const ph = pop.getBoundingClientRect().height;
            if (top + ph > window.innerHeight - margin) {
                top = Math.max(margin, br.top - ph - gap);
            }
        }
        setPos({ top, left, width: maxW });
    }, []);

    useLayoutEffect(() => {
        if (!open || !hasTip) return undefined;
        placePopover();
        const id = requestAnimationFrame(() => placePopover());
        return () => cancelAnimationFrame(id);
    }, [open, hasTip, placePopover, reason]);

    useEffect(() => {
        if (!open || !hasTip) return undefined;
        const onMove = () => placePopover();
        window.addEventListener('scroll', onMove, true);
        window.addEventListener('resize', onMove);
        return () => {
            window.removeEventListener('scroll', onMove, true);
            window.removeEventListener('resize', onMove);
        };
    }, [open, hasTip, placePopover]);

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => setOpen(false), STATUS_TIP_CLOSE_MS);
    };

    const show = () => {
        if (!hasTip) return;
        clearCloseTimer();
        setOpen(true);
    };

    const baseClass = `${pillClass} aa-act__status-pill${hasTip ? ' jad-jobs__pill--tip' : ''}`;

    const tooltip =
        open &&
        hasTip &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                ref={popRef}
                id={tipId}
                role="tooltip"
                className="jad-jobs__help-popover--portal jad-jobs__status-tip--portal"
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
            >
                <p className="jad-jobs__status-tip-text">{reason}</p>
            </div>,
            document.body
        );

    if (!hasTip) {
        return (
            <span className={baseClass}>
                <span className="aa-act__status-pill-dot" aria-hidden />
                {label}
            </span>
        );
    }

    return (
        <>
            <span
                ref={anchorRef}
                className={baseClass}
                aria-describedby={open ? tipId : undefined}
                onMouseEnter={show}
                onMouseLeave={scheduleClose}
                onFocus={show}
                onBlur={scheduleClose}
                tabIndex={0}
            >
                <span className="aa-act__status-pill-dot" aria-hidden />
                {label}
            </span>
            {tooltip}
        </>
    );
}

/**
 * Mirrors the Tailored résumé cell from `JobAgentJobs.js`:
 *   - `used_tailor === 'Yes'`        → green check + "Yes"
 *   - status is Discarded (6) or
 *     Failed (3)                     → grey clock + "No" (no action possible)
 *   - otherwise                      → "Tailor Resume" action button
 *
 * The action button dispatches the same global tailor modal that
 * `JobAgentJobs.js` uses, so a row tailored here re-renders here and there.
 */
function TailoredCell({ row, onTailor }) {
    const value = row?.used_tailor;
    if (value === 'Yes') {
        return (
            <span className="aa-act__tailor aa-act__tailor--yes">
                <CheckCircleIcon />
                <span>Yes</span>
            </span>
        );
    }
    const statusCode = Number(row?.status ?? row?.row?.outreach_status);
    const isTerminal =
        statusCode === OUTREACH_STATUS.DISCARDED || statusCode === OUTREACH_STATUS.FAILED;
    if (isTerminal) {
        return (
            <span className="aa-act__tailor aa-act__tailor--no">
                <ClockIcon />
                <span>No</span>
            </span>
        );
    }
    return (
        <button
            type="button"
            className="aa-act__tailor-btn"
            onClick={() => onTailor && onTailor(row)}
        >
            Tailor Resume
        </button>
    );
}

function CompanyLogo({ src, name }) {
    const [broken, setBroken] = useState(false);
    if (!src || broken) {
        return (
            <span className="aa-act__logo aa-act__logo--fallback" aria-hidden>
                <BuildingIcon />
            </span>
        );
    }
    return (
        <span className="aa-act__logo">
            <img
                src={src}
                alt=""
                width={28}
                height={28}
                decoding="async"
                loading="lazy"
                onError={() => setBroken(true)}
            />
            <span className="aa-act__logo-sr">{name}</span>
        </span>
    );
}

/**
 * Run-by column help popover. Uses a portal-mounted tooltip and positioning
 * logic as our `StatusHeader`, so it never inherits typography from
 * `.aa-table__th` and never gets clipped by `.aa-table-wrap { overflow:
 * hidden }`.
 */

const SOURCE_HELP_CLOSE_MS = 280;

function SourceHelpTooltipBody() {
    return (
        <>
            <p className="jad-jobs__help-popover-title">Who started this referral run</p>
            <dl className="jad-jobs__help-dl">
                <div className="jad-jobs__help-dl-row">
                    <dt><RunByPill id={RUN_BY.YOU} /></dt>
                    <dd>You started the agent (job link, extension, recommended job, or WhatsApp).</dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><RunByPill id={RUN_BY.AUTO} /></dt>
                    <dd>Happpy Agent started this run automatically (Auto Run).</dd>
                </div>
            </dl>
        </>
    );
}

function SourceHeader() {
    const btnRef = useRef(null);
    const popRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 280 });

    const clearCloseTimer = () => {
        if (closeTimerRef.current != null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const placePopover = useCallback(() => {
        const btn = btnRef.current;
        if (!btn) return;
        const pop = popRef.current;
        const margin = 10;
        const gap = 6;
        const maxW = Math.min(280, window.innerWidth - margin * 2);
        const br = btn.getBoundingClientRect();
        let left = br.left + br.width / 2 - maxW / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));
        let top = br.bottom + gap;
        if (pop) {
            const ph = pop.getBoundingClientRect().height;
            if (top + ph > window.innerHeight - margin) {
                top = Math.max(margin, br.top - ph - gap);
            }
        }
        setPos({ top, left, width: maxW });
    }, []);

    useLayoutEffect(() => {
        if (!open) return undefined;
        placePopover();
        const id = requestAnimationFrame(() => placePopover());
        return () => cancelAnimationFrame(id);
    }, [open, placePopover]);

    useEffect(() => {
        if (!open) return undefined;
        const onMove = () => placePopover();
        window.addEventListener('scroll', onMove, true);
        window.addEventListener('resize', onMove);
        return () => {
            window.removeEventListener('scroll', onMove, true);
            window.removeEventListener('resize', onMove);
        };
    }, [open, placePopover]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => {
            const t = e.target;
            if (btnRef.current?.contains(t)) return;
            if (popRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => setOpen(false), SOURCE_HELP_CLOSE_MS);
    };

    const show = () => {
        clearCloseTimer();
        setOpen(true);
    };

    const tooltip =
        open &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                ref={popRef}
                id="aa-act-source-help-tooltip"
                role="tooltip"
                className="jad-jobs__help-popover--portal"
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
            >
                <SourceHelpTooltipBody />
            </div>,
            document.body
        );

    return (
        <div className="jad-jobs__th-inner">
            <span className="jad-jobs__th-text">Run by</span>
            <span className="jad-jobs__help-wrap">
                <button
                    ref={btnRef}
                    type="button"
                    className="jad-jobs__help-btn"
                    aria-label="Who ran the agent: definitions"
                    aria-expanded={open}
                    aria-controls={open ? 'aa-act-source-help-tooltip' : undefined}
                    onMouseEnter={show}
                    onMouseLeave={scheduleClose}
                    onFocus={show}
                >
                    <MaterialSymbol name="help" className="jad-jobs__help-icon" />
                </button>
            </span>
            {tooltip}
        </div>
    );
}

/**
 * Status column help popover — literal clone of `StatusColumnHead` from
 * `JobAgentJobs.js`. Uses a portal-mounted tooltip (`createPortal` to
 * `document.body`) positioned against the help button's bounding rect so the
 * popover:
 *   - never inherits typography / `white-space` from `.aa-table__th`,
 *   - never gets clipped by `.aa-table-wrap { overflow: hidden }`,
 *   - never affects table row height (it lives outside the table DOM).
 *
 * Class names match `JobAgentJobs.js` exactly (`jad-jobs__*`) so the two
 * surfaces render the same. The matching CSS is duplicated into
 * `AgentActivity.css` so this file doesn't need to import the JAD dashboard
 * stylesheet.
 */

const STATUS_HELP_CLOSE_MS = 280;

/** Tiny inline equivalent of the JAD `MatIcon` helper. */
function MaterialSymbol({ name, className = '' }) {
    return (
        <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
            {name}
        </span>
    );
}

/** Maps an `OUTREACH_STATUS` code to the JAD pill class. Mirrors `statusPillClassForCode`. */
function jadPillClassForStatusCode(statusCode) {
    const code = Number(statusCode);
    if (code === OUTREACH_STATUS.COMPLETED) return 'jad-jobs__pill jad-jobs__pill--success';
    if (code === OUTREACH_STATUS.PROCESSING) return 'jad-jobs__pill jad-jobs__pill--processing';
    if (code === OUTREACH_STATUS.PENDING || code === OUTREACH_STATUS.DATA_NOT_FOUND) {
        return 'jad-jobs__pill jad-jobs__pill--pending';
    }
    if (code === OUTREACH_STATUS.FAILED || code === OUTREACH_STATUS.SCRAPPING_FAILED) {
        return 'jad-jobs__pill jad-jobs__pill--failed';
    }
    if (code === OUTREACH_STATUS.DISCARDED) return 'jad-jobs__pill jad-jobs__pill--pending';
    if (code === OUTREACH_STATUS.QUEUED) return 'jad-jobs__pill jad-jobs__pill--queue';
    return 'jad-jobs__pill jad-jobs__pill--queue';
}

/** Sample pill shown inside the help popover for each status variant. */
function StatusHelpPill({ label, statusCode }) {
    return <span className={jadPillClassForStatusCode(statusCode)}>{label}</span>;
}

function StatusHelpTooltipBody() {
    return (
        <>
            <p className="jad-jobs__help-popover-title">Happpy Agent run status</p>
            <dl className="jad-jobs__help-dl">
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Pending" statusCode={OUTREACH_STATUS.PENDING} /></dt>
                    <dd>The agent found employee data for this company; outreach will run shortly.</dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Processing" statusCode={OUTREACH_STATUS.PROCESSING} /></dt>
                    <dd>The agent is actively finding contacts and sending outreach.</dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Success" statusCode={OUTREACH_STATUS.COMPLETED} /></dt>
                    <dd>Outreach finished. Open the Success control in the table to see who was reached.</dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Failed" statusCode={OUTREACH_STATUS.FAILED} /></dt>
                    <dd>
                        The agent could not complete outreach. Hover a failed pill in the table for the exact
                        message. Common cases:
                        <ul className="jad-jobs__help-sublist">
                            <li>No publicly available Indian employee data for the company.</li>
                            <li>
                                First scrape attempt could not load company data — the agent retries automatically.
                            </li>
                            <li>
                                Contacts found on LinkedIn only, but your LinkedIn account is not connected to
                                Happpy Agent.
                            </li>
                            <li>Employees exist but no Indian contacts match your Gmail or LinkedIn channels.</li>
                            <li>The company was run many times — no new employees left to contact.</li>
                            <li>Happpy Agent was never started for this job.</li>
                        </ul>
                    </dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Queued" statusCode={OUTREACH_STATUS.QUEUED} /></dt>
                    <dd>
                        The agent is finding employees for this job, or it is waiting to start. If you have
                        already run 8 Happpy Agents today, extra jobs stay queued until the next day — then
                        they move to Pending and run.
                    </dd>
                </div>
                <div className="jad-jobs__help-dl-row">
                    <dt><StatusHelpPill label="Discarded" statusCode={OUTREACH_STATUS.DISCARDED} /></dt>
                    <dd>You stopped outreach for this job, or it was closed by the system.</dd>
                </div>
            </dl>
        </>
    );
}

/**
 * Content-only Status header (the surrounding `<th>` already lives in the
 * table markup). Otherwise an exact clone of JAD `StatusColumnHead`.
 */
function StatusHeader() {
    const btnRef = useRef(null);
    const popRef = useRef(null);
    const closeTimerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 320 });

    const clearCloseTimer = () => {
        if (closeTimerRef.current != null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const placePopover = useCallback(() => {
        const btn = btnRef.current;
        if (!btn) return;
        const pop = popRef.current;
        const margin = 10;
        const gap = 6;
        const maxW = Math.min(320, window.innerWidth - margin * 2);
        const br = btn.getBoundingClientRect();
        let left = br.left + br.width / 2 - maxW / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));
        let top = br.bottom + gap;
        if (pop) {
            const ph = pop.getBoundingClientRect().height;
            if (top + ph > window.innerHeight - margin) {
                top = Math.max(margin, br.top - ph - gap);
            }
        }
        setPos({ top, left, width: maxW });
    }, []);

    useLayoutEffect(() => {
        if (!open) return undefined;
        placePopover();
        const id = requestAnimationFrame(() => placePopover());
        return () => cancelAnimationFrame(id);
    }, [open, placePopover]);

    useEffect(() => {
        if (!open) return undefined;
        const onMove = () => placePopover();
        window.addEventListener('scroll', onMove, true);
        window.addEventListener('resize', onMove);
        return () => {
            window.removeEventListener('scroll', onMove, true);
            window.removeEventListener('resize', onMove);
        };
    }, [open, placePopover]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => {
            const t = e.target;
            if (btnRef.current?.contains(t)) return;
            if (popRef.current?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    const scheduleClose = () => {
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => setOpen(false), STATUS_HELP_CLOSE_MS);
    };

    const show = () => {
        clearCloseTimer();
        setOpen(true);
    };

    const tooltip =
        open &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                ref={popRef}
                id="aa-act-status-help-tooltip"
                role="tooltip"
                className="jad-jobs__help-popover--portal jad-jobs__status-help--portal"
                style={{ top: pos.top, left: pos.left, width: pos.width }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={scheduleClose}
            >
                <StatusHelpTooltipBody />
            </div>,
            document.body
        );

    return (
        <div className="jad-jobs__th-inner">
            <span className="jad-jobs__th-text">Status</span>
            <span className="jad-jobs__help-wrap">
                <button
                    ref={btnRef}
                    type="button"
                    className="jad-jobs__help-btn"
                    aria-label="Status types: definitions"
                    aria-expanded={open}
                    aria-controls={open ? 'aa-act-status-help-tooltip' : undefined}
                    onMouseEnter={show}
                    onMouseLeave={scheduleClose}
                    onFocus={show}
                >
                    <MaterialSymbol name="help" className="jad-jobs__help-icon" />
                </button>
            </span>
            {tooltip}
        </div>
    );
}

/** Compact dropdown styled as the cream filter chip from the Figma. */
function FilterChip({ label, value, options, onChange, ariaLabel }) {
    const current = options.find((o) => String(o.value) === String(value)) || options[0];
    return (
        <div className="aa-act__filter">
            <span className="aa-act__filter-label">{label}</span>
            <div className="aa-act__filter-control">
                <span className="aa-act__filter-value">{current?.label || ''}</span>
                <ChevronDownIcon />
                <select
                    className="aa-act__filter-select"
                    value={String(value)}
                    onChange={(e) => onChange(e.target.value)}
                    aria-label={ariaLabel || label}
                >
                    {options.map((opt) => (
                        <option key={String(opt.value)} value={String(opt.value)}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

/** Renders the action button(s) for a row based on its status + signals. */
function ActionCell({ row, expanded, onToggleThread }) {
    const variant = statusVariantForRow(row);
    const isManual = Boolean(row?.row?.manual_mode);
    const hasReply = Boolean(row?.has_reply || (row?.replies_count != null && row.replies_count > 0));

    if (variant === STATUS_VARIANT.SENT) {
        if (hasReply) {
            return (
                <button
                    type="button"
                    className="aa-act__btn aa-act__btn--outline"
                    onClick={() => onToggleThread(row)}
                >
                    View Reply
                </button>
            );
        }
        return (
            <button
                type="button"
                className={`aa-act__btn aa-act__btn--outline${expanded ? ' aa-act__btn--outline-active' : ''}`}
                onClick={() => onToggleThread(row)}
                aria-expanded={expanded}
            >
                {expanded ? 'Hide Thread' : 'View Thread'}
            </button>
        );
    }

    if (variant === STATUS_VARIANT.PENDING) {
        if (isManual) {
            return (
                <button
                    type="button"
                    className="aa-act__btn aa-act__btn--outline"
                    onClick={() => {
                        // eslint-disable-next-line no-console
                        console.warn('[AllActivityTab] Review pressed for row', row);
                    }}
                >
                    Review
                </button>
            );
        }
        return (
            <a
                href="?tab=jobs-in-queue"
                className="aa-act__btn aa-act__btn--outline"
            >
                View Queue
            </a>
        );
    }

    return <span className="aa-act__btn-na">-- NA --</span>;
}

/* ---------------- Reached-people inline expand ---------------- */

function normalizeOutreachedPeople(response) {
    const body = response?.data;
    if (!body || body.status !== 200 || body.data === undefined || body.data === null) return [];
    const people = body.data?.people;
    if (!Array.isArray(people)) return [];
    return people
        .filter((p) => p && typeof p === 'object')
        .map((p) => ({
            outreachEmployeeId: p.outreach_employee_id ?? null,
            fullName: typeof p.full_name === 'string' ? p.full_name.trim() : '',
            email: typeof p.email === 'string' ? p.email : '',
            linkedinUrl: typeof p.linkedin_url === 'string' ? p.linkedin_url : '',
            jobTitle: typeof p.job_title === 'string' ? p.job_title : '',
            gmailSent: Boolean(p.gmail_sent),
            linkedinSent: Boolean(p.linkedin_sent),
        }));
}

function ReachedPeopleInline({ people, loading, error }) {
    if (loading) {
        return (
            <div className="aa-act__reached aa-act__reached--state">
                <span className="aa-spinner" aria-hidden /> Loading reached people…
            </div>
        );
    }
    if (error) {
        return <div className="aa-act__reached aa-act__reached--error">{error}</div>;
    }
    if (!people || people.length === 0) {
        return (
            <div className="aa-act__reached aa-act__reached--empty">
                No reached people details found for this run.
            </div>
        );
    }
    return (
        <div className="aa-act__reached">
            <ol className="aa-act__reached-list">
                {people.map((p, idx) => {
                    const name =
                        p.fullName ||
                        (p.email ? p.email.split('@')[0] : '') ||
                        (p.linkedinUrl ? p.linkedinUrl.split('/').filter(Boolean).pop() : '') ||
                        `Contact ${idx + 1}`;
                    return (
                        <li key={`${p.outreachEmployeeId ?? idx}-${idx}`} className="aa-act__reached-row">
                            <span className="aa-act__reached-num">{String(idx + 1).padStart(2, '0')}</span>
                            <div className="aa-act__reached-meta">
                                <span className="aa-act__reached-name">{name}</span>
                                {p.jobTitle ? (
                                    <span className="aa-act__reached-role">{p.jobTitle}</span>
                                ) : null}
                            </div>
                            <div className="aa-act__reached-channels">
                                {p.gmailSent && p.email ? (
                                    <a className="aa-act__reached-chip aa-act__reached-chip--gmail" href={`mailto:${p.email}`}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#6c757d" aria-hidden>
                                            <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" />
                                        </svg>
                                        {p.email}
                                    </a>
                                ) : null}
                                {p.linkedinSent && p.linkedinUrl ? (
                                    <a
                                        className="aa-act__reached-chip aa-act__reached-chip--linkedin"
                                        href={p.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <svg
                                            className="aa-act__reached-chip-icon"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path fill="#0A66C2" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                ) : null}
                                {!p.gmailSent && !p.linkedinSent ? (
                                    <span className="aa-act__reached-chip aa-act__reached-chip--muted">No channel</span>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

/**
 * Cream-styled trigger button used as `customInput` for the two `DatePicker`
 * instances powering the "Last Activity" range filter. Mirrors the original
 * Figma design (text + tinted calendar tile) but is now a real, clickable
 * `<button>` so the picker reliably opens across browsers — replacing the
 * earlier hidden native `<input type="date">` overlay that blocked clicks on
 * Safari and Firefox.
 */
const DateRangeTrigger = React.forwardRef(function DateRangeTrigger(
    { value, onClick, placeholder, ariaLabel },
    ref
) {
    const isPlaceholder = !value;
    return (
        <button
            type="button"
            className="aa-act__date-input-wrap"
            onClick={onClick}
            ref={ref}
            aria-label={ariaLabel}
        >
            <span
                className={`aa-act__date-text${isPlaceholder ? ' aa-act__date-text--placeholder' : ''}`}
            >
                {value || placeholder}
            </span>
            <span className="aa-act__date-icon" aria-hidden>
                <CalendarIcon />
            </span>
        </button>
    );
});

/** Figma 29106:177049 — full-page blank state when the feed has no rows at all. */
/* ---------------- Main component ---------------- */

const PENDING_DRAWER_QUERY_KEY = 'pendingManualReview';
const PENDING_DRAWER_OPEN_VALUES = new Set(['1', 'true', 'yes', 'open']);

const AllActivityTab = ({ onActivityFetched, onBlankStateChange }) => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const pendingDrawerHandledRef = useRef(false);

    const [allRows, setAllRows] = useState([]); // dummy mode keeps the full list and filters client-side
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [page, setPage] = useState(1);
    const [runByFilter, setRunByFilter] = useState('all');
    const [tailorFilter, setTailorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [expanded, setExpanded] = useState({}); // { rowKey: true }
    const [reachedByKey, setReachedByKey] = useState({});
    const [reachedLoadingByKey, setReachedLoadingByKey] = useState({});
    const [reachedErrorByKey, setReachedErrorByKey] = useState({});

    /**
     * Bumped from a global `agent-activity:job-link-added` event (fired by
     * the page-level "Paste Job Link" modal in `AgentActivity.js`) so the
     * tab refetches and the newly-submitted job shows up at the top.
     */
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const onAdded = () => setRefreshKey((k) => k + 1);
        window.addEventListener(JOB_LINK_ADDED_EVENT, onAdded);
        return () => window.removeEventListener(JOB_LINK_ADDED_EVENT, onAdded);
    }, []);

    /* ---- Pending manual outreach strip + drawer (moved from JobsInQueueTab) ---- */

    // Mirrors JobAgentDashboardHome.js: GET has-pending-action-manual-outreach-agent
    // → hrs[]; drives the top "pending companies" strip.
    const [pendingManualHrs, setPendingManualHrs] = useState([]);
    const [pendingManualLoading, setPendingManualLoading] = useState(true);
    // Drawer state. `open` toggles the right-side drawer; `jobId` is the
    // outreach_hr_id to deep-link into VerifyOutreachPerson (null = let the
    // component show its own job-selection list — used by the strip's
    // Take Action button).
    const [outreachDrawer, setOutreachDrawer] = useState({ open: false, jobId: null });

    const fetchPendingManualHrs = useCallback(async () => {
        if (USE_DUMMY_DATA) {
            // No live endpoint in dummy mode — keep the strip hidden so the rest
            // of the tab can still be exercised offline.
            setPendingManualLoading(false);
            setPendingManualHrs([]);
            return;
        }
        try {
            setPendingManualLoading(true);
            const res = await GET_API(`${API_URL}talent/outreach/has-pending-action-manual-outreach-agent`);
            const body = res?.data;
            const payload = body?.data;
            if (
                body?.status === 'success' &&
                payload?.has_pending_action &&
                Array.isArray(payload.hrs) &&
                payload.hrs.length > 0
            ) {
                setPendingManualHrs(payload.hrs);
            } else {
                setPendingManualHrs([]);
            }
        } catch {
            setPendingManualHrs([]);
        } finally {
            setPendingManualLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingManualHrs();
    }, [fetchPendingManualHrs]);

    /**
     * Opens the manual outreach confirmation flow inside a right-side drawer
     * instead of a full-page navigation. `VerifyOutreachPerson` is mounted in
     * "embedded" mode (`embeddedJobId` + `onClose`) so it preselects a
     * specific outreach_hr_id and suppresses its internal route updates. Pass
     * `jobId` as `null` from the strip's Take Action button to surface the
     * job-selection list inside the drawer.
     */
    const openOutreachDrawer = useCallback((jobId) => {
        setOutreachDrawer({ open: true, jobId: jobId ?? null });
    }, []);

    const closeOutreachDrawer = useCallback(() => {
        setOutreachDrawer({ open: false, jobId: null });
        // The user may have submitted or discarded inside the drawer — refresh
        // both the activity feed (status may have flipped) and the strip.
        setRefreshKey((k) => k + 1);
        fetchPendingManualHrs();
    }, [fetchPendingManualHrs]);

    /* ---- Drawer effects (Esc, body scroll lock) ---- */

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

    /**
     * Deep link: `?pendingManualReview=true` (alongside `?tab=activity`) opens the
     * Review Outreach drawer with the job-selection list (same surface as the
     * pending strip's "Take Action" button), then strips the trigger from the
     * URL so a back-nav / refresh doesn't reopen it. The ref guard ensures we
     * only honor the deep link once per mount even if `searchParams` changes.
     */
    useEffect(() => {
        if (pendingDrawerHandledRef.current) return;
        const raw = (searchParams.get(PENDING_DRAWER_QUERY_KEY) || '').trim().toLowerCase();
        if (!PENDING_DRAWER_OPEN_VALUES.has(raw)) return;
        pendingDrawerHandledRef.current = true;
        setOutreachDrawer({ open: true, jobId: null });
        const next = new URLSearchParams(searchParams);
        next.delete(PENDING_DRAWER_QUERY_KEY);
        setSearchParams(next, { replace: true });
    }, []);

    /* ---- Fetch + filter ---- */

    const dummyFiltered = useMemo(() => {
        let list = allRows;
        if (runByFilter !== 'all') {
            list = list.filter((r) => classifyRunBy(r) === runByFilter);
        }
        if (tailorFilter !== 'all') {
            const want = tailorFilter === 'yes' ? 'Yes' : 'No';
            list = list.filter((r) => r.used_tailor === want);
        }
        if (statusFilter !== 'all') {
            list = list.filter((r) => statusVariantForRow(r) === statusFilter);
        }
        const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
        const toTs = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
        if (fromTs || toTs) {
            list = list.filter((r) => {
                const raw = r.activity_date || '';
                const t = new Date(raw.includes('T') ? raw : raw.replace(' ', 'T')).getTime();
                if (!Number.isFinite(t)) return true;
                if (fromTs && t < fromTs) return false;
                if (toTs && t > toTs) return false;
                return true;
            });
        }
        return list;
    }, [allRows, runByFilter, tailorFilter, statusFilter, dateFrom, dateTo]);

    const fetchData = useCallback(async () => {
        if (USE_DUMMY_DATA) {
            setLoading(true);
            setError('');
            await new Promise((r) => setTimeout(r, DUMMY_LATENCY_MS));
            setAllRows(allActivityDummyData);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', String(PAGE_SIZE));
            if (runByFilter !== 'all') params.set('run_by', runByFilter);
            if (tailorFilter !== 'all') params.set('tailor', tailorFilter);
            if (statusFilter !== 'all') params.set('status', statusFilter);
            if (dateFrom) params.set('date_from', dateFrom);
            if (dateTo) params.set('date_to', dateTo);
            const res = await GET_API(`${API_JOB_AGENT_AGENT_TAILOR_ACTIVITY}?${params.toString()}`);
            const data = unwrapApiData(res);
            if (!data || !Array.isArray(data.list)) {
                setRows([]);
                setTotal(0);
                setError('Unable to load activity. Try again in a moment.');
                return;
            }
            setRows(data.list);
            if (params.size <= 2) {
                onActivityFetched(data.list.length);
            }
            setTotal(typeof data.total === 'number' ? data.total : data.list.length);
        } catch (e) {
            setRows([]);
            setTotal(0);
            setError(e?.message || 'Unable to load activity. Try again in a moment.');
        } finally {
            setLoading(false);
        }
    }, [page, runByFilter, tailorFilter, statusFilter, dateFrom, dateTo, refreshKey]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /** Apply paging + counts in dummy mode after the in-memory filter runs. */
    useEffect(() => {
        if (!USE_DUMMY_DATA) return;
        setTotal(dummyFiltered.length);
        const start = (page - 1) * PAGE_SIZE;
        setRows(dummyFiltered.slice(start, start + PAGE_SIZE));
    }, [dummyFiltered, page]);

    /** Reset paging whenever a filter changes. */
    useEffect(() => {
        setPage(1);
    }, [runByFilter, tailorFilter, statusFilter, dateFrom, dateTo]);

    /* ---- Reached-people fetch on expand ---- */

    /**
     * Toggle the inline reached-people expansion for a row. The `rowKey`
     * argument MUST be the same value used by the render path (see
     * `getRowKey(row, idx)` in the rows.map below) — JAD `toggleReachedPeople`
     * uses the same convention. Falling back to a row-derived key keeps any
     * legacy caller (e.g. the currently-commented `ActionCell`) working, but
     * new call sites should always pass the rendered key explicitly so the
     * `expanded` / `reachedByKey` lookups line up.
     */
    const toggleThread = useCallback(
        async (row, rowKey) => {
            const key = rowKey ?? getRowKey(row, row?.row?.outreach_hr_id ?? '');
            const currentlyOpen = Boolean(expanded[key]);
            if (currentlyOpen) {
                setExpanded((p) => ({ ...p, [key]: false }));
                return;
            }
            setExpanded((p) => ({ ...p, [key]: true }));
            if (reachedByKey[key] || reachedLoadingByKey[key]) return;

            const outreachHrId = row?.row?.outreach_hr_id;
            if (!outreachHrId) {
                setReachedErrorByKey((p) => ({
                    ...p,
                    [key]: 'Reached-people details are unavailable for this row.',
                }));
                return;
            }

            setReachedLoadingByKey((p) => ({ ...p, [key]: true }));
            setReachedErrorByKey((p) => ({ ...p, [key]: '' }));

            try {
                if (USE_DUMMY_DATA) {
                    /**
                     * No live endpoint in dummy mode — render a tiny placeholder
                     * so the user can still see the inline expand interaction.
                     */
                    await new Promise((r) => setTimeout(r, 200));
                    setReachedByKey((p) => ({
                        ...p,
                        [key]: [
                            {
                                outreachEmployeeId: outreachHrId,
                                fullName: 'Sample contact',
                                email: 'sample.contact@example.com',
                                linkedinUrl: 'https://www.linkedin.com/in/sample-contact',
                                jobTitle: 'Hiring Manager',
                                gmailSent: true,
                                linkedinSent: true,
                            },
                        ],
                    }));
                } else {
                    const res = await GET_API(
                        `${API_URL}talent/outreach/outreached-people?outreach_hr_id=${encodeURIComponent(String(outreachHrId))}`
                    );
                    setReachedByKey((p) => ({
                        ...p,
                        [key]: normalizeOutreachedPeople(res),
                    }));
                }
            } catch (e) {
                setReachedErrorByKey((p) => ({
                    ...p,
                    [key]: e?.message || 'Unable to load reached-people details.',
                }));
            } finally {
                setReachedLoadingByKey((p) => ({ ...p, [key]: false }));
            }
        },
        [expanded, reachedByKey, reachedLoadingByKey]
    );

    /* ---- Tailor modal dispatch ---- */

    /**
     * Opens the global Tailor modal for a row. Mirrors `JobAgentJobs.js` —
     * when `hr_enc_id` is missing (extension-captured rows), it fetches the
     * job description via `fetchAgentJD` and then dispatches with the
     * external-JD payload.
     *
     * The AllActivityTab row shape stores the IDs under `row.row.*`, so we
     * fall back to that nested location when the top-level fields aren't
     * present.
     */
    const openTailorModalForRow = useCallback(
        (row) => {
            const inner = row?.row || {};
            const hrEncId = row?.hr_enc_id || inner.hr_enc_id;
            const outreachHrId = row?.outreach_hr_id || inner.outreach_hr_id;

            if (!hrEncId) {
                if (!outreachHrId) {
                    toast.error('Outreach job id not found !');
                    return;
                }
                fetchAgentJD(outreachHrId)(dispatch)
                    .then((res) => {
                        const readyJd = res?.data?.data?.job_description;
                        if (readyJd) {
                            dispatch({
                                type: SET_TAILOR_MODAL_OPEN,
                                payload: {
                                    hr_enc_id: row?.apply_url,
                                    is_external_jd: true,
                                    ready_jd: readyJd,
                                    outreach_hr_id: outreachHrId,
                                },
                            });
                        } else {
                            toast.error('Unable to fetch job description !');
                            dispatch({
                                type: SET_TAILOR_MODAL_OPEN,
                                payload: {
                                    hr_enc_id: row?.apply_url,
                                    is_external_jd: true,
                                    outreach_hr_id: outreachHrId,
                                },
                            });
                        }
                    })
                    .catch((err) => {
                        // eslint-disable-next-line no-console
                        console.log('err in fetchAgentJD', err);
                    });
                return;
            }

            dispatch({
                type: SET_TAILOR_MODAL_OPEN,
                payload: {
                    hr_enc_id: hrEncId,
                    outreach_hr_id: outreachHrId,
                    active_job: {
                        job_title: row?.job_title,
                        company: {
                            company_name: row?.company_name,
                            company_logo: row?.company_logo,
                        },
                        HR_Number: row?.HR_Number || inner.HR_Number,
                        aggregator_application_link:
                            row?.aggregator_application_link || inner.aggregator_application_link,
                        aggregator: row?.aggregator || inner.aggregator,
                    },
                },
            });
        },
        [dispatch]
    );

    /**
     * Listens for a global `job-agent:tailor-updated` event (dispatched after
     * the Tailor modal finishes) and flips `used_tailor` to 'Yes' for the
     * affected row so the cell re-renders immediately without a full refetch.
     * Matches the corresponding listener in `JobAgentJobs.js`.
     */
    useEffect(() => {
        const handleTailorUpdated = (e) => {
            const id = e?.detail?.activeOutreachHrId;
            if (!id) return;
            const flip = (list) =>
                list.map((r) => {
                    const rid = r?.outreach_hr_id || r?.row?.outreach_hr_id;
                    if (rid !== id || r?.used_tailor === 'Yes') return r;
                    return {
                        ...r,
                        used_tailor: 'Yes',
                        row: r?.row ? { ...r.row, used_tailor: 'Yes' } : r?.row,
                    };
                });
            setRows((prev) => flip(prev));
            setAllRows((prev) => flip(prev));
        };
        window.addEventListener('job-agent:tailor-updated', handleTailorUpdated);
        return () => window.removeEventListener('job-agent:tailor-updated', handleTailorUpdated);
    }, []);

    /* ---- Pagination ---- */

    const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
    const hasActiveFilters =
        runByFilter !== 'all' ||
        tailorFilter !== 'all' ||
        statusFilter !== 'all' ||
        Boolean(dateFrom) ||
        Boolean(dateTo);
    const isEmpty = !loading && rows.length === 0;
    const isBlankState = isEmpty && !hasActiveFilters;
    const isFilteredEmpty = isEmpty && hasActiveFilters;

    /**
     * Parent (`AgentActivity`) owns the full-page blank UI (no tabs / header).
     * Report blank only after the unfiltered fetch finishes so we don't flash
     * the empty screen while filters are active or data is still loading.
     */
    useEffect(() => {
        if (!onBlankStateChange || loading) return;
        onBlankStateChange(isBlankState);
    }, [isBlankState, loading, onBlankStateChange]);

    /** Build a small paginator window for the tile-style pager (max 5 tiles). */
    const pagerTiles = useMemo(() => {
        const tiles = [];
        const max = totalPages;
        const window = 5;
        if (max <= window) {
            for (let i = 1; i <= max; i++) tiles.push(i);
            return tiles;
        }
        let start = Math.max(1, page - 2);
        let end = Math.min(max, start + window - 1);
        start = Math.max(1, end - window + 1);
        for (let i = start; i <= end; i++) tiles.push(i);
        return tiles;
    }, [page, totalPages]);

    const { user } = useSelector((state) => state.auth);
    const isProductTalent = user.is_product;

    /* Parent owns the full-page blank UI; stay mounted so fetch/blank callbacks keep running. */
    if (isBlankState) {
        return null;
    }

    return (
        <section className="aa-act" aria-labelledby="aa-act-heading">
            <h2 id="aa-act-heading" className="aa-sr-only">All Activity</h2>
            {/* <div className="aa-act__legacy-strip" role="note">
                <span className="aa-act__legacy-strip-text">
                    Prefer the
                </span>
                <Link
                    to="/talent/job-agent/jobs"
                    className="aa-act__legacy-strip-link"
                    title="Open the previous Activity view"
                >
                    Old Interface
                </Link>
                <span className="aa-act__legacy-strip-text">?</span>
            </div> */}

            {pendingManualLoading ? (
                <div className="aa-queue__pending-strip aa-queue__pending-strip--skeleton" aria-hidden>
                    <span className="aa-skel aa-skel--pending-msg" />
                    <div className="aa-queue__pending-strip-end">
                        <div className="aa-queue__pending-strip-companies">
                            <span className="aa-skel aa-skel--pending-chip" />
                            <span className="aa-skel aa-skel--pending-chip" />
                        </div>
                        <span className="aa-skel aa-skel--pending-btn" />
                    </div>
                </div>
            ) : pendingManualHrs.length > 0 ? (
                <div className="aa-queue__pending-strip" role="region" aria-label="Pending manual outreach companies">
                    <p className="aa-queue__pending-strip-msg">
                        <PersonSearchIcon />
                        Pending action for {pendingManualHrs.length}{' '}
                        {pendingManualHrs.length === 1 ? 'company' : 'companies'}. Agent successfully found data.
                    </p>
                    <div className="aa-queue__pending-strip-end">
                        <button
                            type="button"
                            className="aa-queue__pending-strip-btn"
                            onClick={() => openOutreachDrawer(null)}
                        >
                            Take Action
                            <ArrowRightIcon />
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="aa-act__filters" role="region" aria-label="Activity filters">
                    <FilterChip
                        label="Run by"
                        value={runByFilter}
                        options={RUN_BY_FILTER_OPTIONS}
                        onChange={setRunByFilter}
                    />
                    {isProductTalent &&
                        <FilterChip
                            label="Tailored Resume"
                            value={tailorFilter}
                            options={TAILOR_FILTER_OPTIONS}
                            onChange={setTailorFilter}
                        />
                    }
                    <FilterChip
                        label="Referral Status"
                        value={statusFilter}
                        options={STATUS_FILTER_OPTIONS}
                        onChange={setStatusFilter}
                    />

                    <div className="aa-act__filters-spacer" aria-hidden />

                    <div className="aa-act__filter aa-act__filter--daterange">
                        <span className="aa-act__filter-label">Last Activity</span>
                        <div className="aa-act__date-range">
                            <DatePicker
                                selected={parseYmd(dateFrom)}
                                onChange={(date) => setDateFrom(toYmd(date))}
                                selectsStart
                                startDate={parseYmd(dateFrom)}
                                endDate={parseYmd(dateTo)}
                                maxDate={parseYmd(dateTo) || undefined}
                                dateFormat="dd-MM-yyyy"
                                placeholderText="dd-mm-yyyy"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                popperPlacement="bottom-start"
                                popperClassName="aa-act__date-popper"
                                calendarClassName="aa-act__date-calendar"
                                customInput={
                                    <DateRangeTrigger
                                        placeholder="dd-mm-yyyy"
                                        ariaLabel="Last activity from"
                                    />
                                }
                            />
                            <span className="aa-act__date-sep">to</span>
                            <DatePicker
                                selected={parseYmd(dateTo)}
                                onChange={(date) => setDateTo(toYmd(date))}
                                selectsEnd
                                startDate={parseYmd(dateFrom)}
                                endDate={parseYmd(dateTo)}
                                minDate={parseYmd(dateFrom) || undefined}
                                dateFormat="dd-MM-yyyy"
                                placeholderText="dd-mm-yyyy"
                                showMonthDropdown
                                showYearDropdown
                                dropdownMode="select"
                                popperPlacement="bottom-end"
                                popperClassName="aa-act__date-popper"
                                calendarClassName="aa-act__date-calendar"
                                customInput={
                                    <DateRangeTrigger
                                        placeholder="dd-mm-yyyy"
                                        ariaLabel="Last activity to"
                                    />
                                }
                            />
                            {(dateFrom || dateTo) ? (
                                <button
                                    type="button"
                                    className="aa-act__date-clear"
                                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                                    aria-label="Clear date range"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                    </div>
                </div>

            {error ? (
                <div className="aa-replies__error" role="alert">
                    <p>{error}</p>
                    <button type="button" className="aa-btn aa-btn--ghost" onClick={fetchData}>
                        Retry
                    </button>
                </div>
            ) : null}

            <>
                    <div className="aa-table-wrap" aria-busy={loading}>
                        <div className="aa-table-scroll">
                            <table className="aa-table aa-table--act" role="table">
                                <thead className="aa-table__thead">
                                    <tr>
                                        <th scope="col" className="aa-table__th aa-act__th--num">No.</th>
                                        <th scope="col" className="aa-table__th aa-act__th--source">
                                            <SourceHeader />
                                        </th>
                                        <th scope="col" className="aa-table__th aa-act__th--company">Company</th>
                                        <th scope="col" className="aa-table__th aa-act__th--role">Role</th>
                                        {isProductTalent && <th scope="col" className="aa-table__th aa-act__th--tailor">Tailored Resume</th>}
                                        <th scope="col" className="aa-table__th aa-act__th--status">
                                            <StatusHeader />
                                        </th>
                                        <th scope="col" className="aa-table__th aa-act__th--last">Last Activity</th>
                                        {/* <th scope="col" className="aa-table__th aa-act__th--action">Action</th> */}
                                    </tr>
                                </thead>
                                <tbody className="aa-table__tbody">
                                    {loading && rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="aa-table__td aa-table__td--state">
                                                <div className="aa-state aa-state--loading">
                                                    <span className="aa-spinner" aria-hidden />
                                                    <p>Loading activity…</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : isFilteredEmpty ? (
                                        <tr>
                                            <td colSpan={8} className="aa-table__td aa-table__td--state">
                                                <div className="aa-empty">
                                                    <p className="aa-empty__title">No activity yet</p>
                                                    <p className="aa-empty__body">
                                                        Nothing matches these filters. Try clearing them or widening the date range.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, idx) => {
                                            const runBy = classifyRunBy(row);
                                            const role = formatJobRoleCell(row.job_title);
                                            const link = String(row.apply_url || '').trim();
                                            const dt = formatActivityDateMultiline(row.activity_date);
                                            const key = getRowKey(row, idx);
                                            const isOpen = Boolean(expanded[key]);
                                            const absoluteRowNum = (page - 1) * PAGE_SIZE + idx + 1;
                                            const showReachedButton = isAgentCompletedRow(row);

                                            return (
                                                <React.Fragment key={key}>
                                                    <tr className="aa-table__row aa-act__row">
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--num">
                                                            <span className="aa-act__num">{absoluteRowNum}</span>
                                                        </td>
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--source">
                                                            <RunByPill id={runBy} />
                                                        </td>
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--company">
                                                            <div className="aa-act__company-cell">
                                                                <span className="aa-act__company">
                                                                    <CompanyLogo src={row.company_logo} name={row.company_name} />
                                                                    <span className="aa-act__company-name" title={row.company_name || ''}>
                                                                        {row.company_name || '—'}
                                                                    </span>
                                                                </span>
                                                                {showReachedButton ? (
                                                                    <button
                                                                        type="button"
                                                                        className={
                                                                            isOpen
                                                                                ? 'jad-jobs__pill jad-jobs__pill--success orange-pill jad-jobs__pill--toggle  jad-jobs__pill--toggle-open'
                                                                                : 'jad-jobs__pill jad-jobs__pill--success orange-pill jad-jobs__pill--toggle'
                                                                        }
                                                                        onClick={() => toggleThread(row, key)}
                                                                        aria-expanded={isOpen}
                                                                        aria-label={isOpen ? 'Hide reached people' : 'Show reached people'}
                                                                        title={isOpen ? 'Hide reached people' : 'Show reached people'}
                                                                    >
                                                                        <MaterialSymbol name="groups" className="jad-jobs__pill-icon" />
                                                                        <MaterialSymbol
                                                                            name={isOpen ? 'expand_less' : 'expand_more'}
                                                                            className="jad-jobs__pill-icon jad-jobs__pill-caret"
                                                                        />
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--role">
                                                            {link ? (
                                                                <a
                                                                    href={link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="aa-act__role-link"
                                                                    title={role.full || role.display}
                                                                >
                                                                    <span>{role.display}</span>
                                                                    <ExternalLinkIcon />
                                                                </a>
                                                            ) : (
                                                                <span className="aa-act__role-link aa-act__role-link--plain" title={role.full}>
                                                                    {role.display}
                                                                </span>
                                                            )}
                                                        </td>
                                                        {isProductTalent && (
                                                            <td className="aa-table__td aa-act__cell aa-act__cell--tailor">
                                                                <TailoredCell row={row} onTailor={openTailorModalForRow} />
                                                            </td>
                                                        )}
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--status">
                                                            <StatusPill row={row} tipId={`aa-act-status-tip-${key}`} />
                                                        </td>
                                                        <td className="aa-table__td aa-act__cell aa-act__cell--last">
                                                            <div className="aa-act__last">
                                                                <span className="aa-act__last-date">{dt.date}</span>
                                                                {dt.time ? (
                                                                    <span className="aa-act__last-time">{dt.time}</span>
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                        {/* <td className="aa-table__td aa-act__cell aa-act__cell--action">
                                                    <ActionCell
                                                        row={row}
                                                        expanded={isOpen}
                                                        onToggleThread={toggleThread}
                                                    />
                                                </td> */}
                                                    </tr>
                                                    {isOpen ? (
                                                        <tr className="aa-act__row-expand">
                                                            <td colSpan={8} className="aa-table__td aa-act__expand-cell">
                                                                <ReachedPeopleInline
                                                                    people={reachedByKey[key]}
                                                                    loading={reachedLoadingByKey[key]}
                                                                    error={reachedErrorByKey[key]}
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

                        {loading && rows.length > 0 ? (
                            <div className="aa-table__overlay" aria-hidden>
                                <span className="aa-spinner" />
                            </div>
                        ) : null}
                    </div>

                    {/*
              * Mobile card layout (Figma 28926:34331) — stacked, one card per
              * row. Lives alongside the table; CSS in AgentActivity.css swaps
              * visibility below 768px so we don't ship two DOM trees on
              * desktop while still keeping the data model identical.
              */}
                    <div className="aa-act__cards" aria-busy={loading}>
                        {loading && rows.length === 0 ? (
                            <div className="aa-state aa-state--loading">
                                <span className="aa-spinner" aria-hidden />
                                <p>Loading activity…</p>
                            </div>
                        ) : isFilteredEmpty ? (
                            <div className="aa-empty">
                                <p className="aa-empty__title">No activity yet</p>
                                <p className="aa-empty__body">
                                    Nothing matches these filters. Try clearing them or widening the date range.
                                </p>
                            </div>
                        ) : (
                            <ul className="aa-act__card-list" role="list">
                                {rows.map((row, idx) => {
                                    const key = getRowKey(row, idx);
                                    const isOpen = Boolean(expanded[key]);
                                    return (
                                        <li key={`mob-${key}`} className="aa-act__card-item">
                                            <MobileActivityCard
                                                row={row}
                                                idx={idx}
                                                page={page}
                                                isProductTalent={isProductTalent}
                                                expanded={isOpen}
                                                onTailor={openTailorModalForRow}
                                                onReviewOutreach={openOutreachDrawer}
                                                reachedPeople={reachedByKey[key]}
                                                reachedLoading={reachedLoadingByKey[key]}
                                                reachedError={reachedErrorByKey[key]}
                                            />
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {loading && rows.length > 0 ? (
                            <div className="aa-act__cards-overlay" aria-hidden>
                                <span className="aa-spinner" />
                            </div>
                        ) : null}
                    </div>

                    {!isBlankState && !isEmpty && totalPages > 1 ? (
                        <nav className="aa-act__pager" aria-label="Activity pagination">
                            <button
                                type="button"
                                className="aa-act__pager-arrow"
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                aria-label="Previous page"
                            >
                                ‹
                            </button>
                            {pagerTiles.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`aa-act__pager-tile${p === page ? ' aa-act__pager-tile--active' : ''}`}
                                    onClick={() => setPage(p)}
                                    aria-current={p === page ? 'page' : undefined}
                                >
                                    {String(p).padStart(2, '0')}
                                </button>
                            ))}
                            <button
                                type="button"
                                className="aa-act__pager-arrow"
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                aria-label="Next page"
                            >
                                ›
                            </button>
                        </nav>
                    ) : null}
                </>

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

export default AllActivityTab;
