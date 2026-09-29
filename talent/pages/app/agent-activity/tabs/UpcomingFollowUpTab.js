'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/talent/navigation/routerCompat';
import { toast } from 'react-hot-toast';
import {
    API_JOB_AGENT_UPCOMING_FOLLOWUPS,
    API_JOB_AGENT_UPCOMING_FOLLOWUPS_BLOCK,
} from '../../../../components/Constant';
import { GET_API, POST_API } from '../../../../components/Helper';

/**
 * Upcoming Follow-up tab — outbound follow-ups Happpy Agent will send on
 * Gmail and LinkedIn when no reply has arrived yet.
 *
 * Data contract:
 *   GET /talent/outreach/upcoming-followups
 *     → { rows: Row[], count: number }
 */

const PAGE_SIZE = 10;

const MEDIUM_FILTER = {
    ALL: 'all',
    GMAIL: 'gmail',
    LINKEDIN: 'linkedin',
};

function getRowKey(row) {
    if (getMedium(row) === 'linkedin') {
        return `linkedin:${row.talent_linkedin_message_id}`;
    }
    return `gmail:${row.talent_gmail_email_id}`;
}

function rowToBlockItem(row) {
    const isLinkedin = getMedium(row) === 'linkedin';
    return {
        channel: isLinkedin ? 'linkedin' : 'gmail',
        message_id: isLinkedin ? Number(row.talent_linkedin_message_id) : Number(row.talent_gmail_email_id),
    };
}

function unwrapApiData(res) {
    const body = res?.data;
    if (body && body.status === 200 && body.data !== undefined) return body.data;
    return null;
}

function formatDateShort(input) {
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

function formatDateOnly(input) {
    if (!input) return '—';
    try {
        const d = new Date(typeof input === 'string' && !input.includes('T') ? input.replace(' ', 'T') : input);
        if (Number.isNaN(d.getTime())) return String(input);
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="3" width="12" height="18" rx="1.5" />
            <path d="M16 8h4v13H4" />
            <path d="M8 7h4M8 11h4M8 15h4" />
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

function UpcomingFuCheckbox({ checked, onChange, disabled = false, ariaLabel, inputRef }) {
    return (
        <label className="aa-upcoming-fu__check-wrap">
            <input
                ref={inputRef}
                type="checkbox"
                className="aa-upcoming-fu__check-input"
                checked={checked}
                disabled={disabled}
                aria-label={ariaLabel}
                onChange={(e) => onChange?.(e.target.checked)}
            />
            <span className="aa-upcoming-fu__check-box" aria-hidden="true" />
        </label>
    );
}

function CompanyMark({ logo, name, compact = false }) {
    const [broken, setBroken] = useState(false);
    const size = compact ? 28 : 34;
    const className = compact ? 'aa-upcoming-fu__company-logo' : 'aa-reminders__company-logo';

    if (logo && !broken) {
        return (
            <span className={className}>
                <img src={logo} alt="" width={size} height={size} decoding="async" loading="lazy" onError={() => setBroken(true)} />
            </span>
        );
    }
    const trimmed = String(name || '').trim();
    const hasMeaningfulName = trimmed && trimmed !== '—';
    if (!hasMeaningfulName) {
        return (
            <span className={`${className} aa-reminders__company-logo--placeholder`} aria-hidden>
                <BuildingIcon />
            </span>
        );
    }
    const tone = avatarTone(trimmed);
    return (
        <span
            className={`${className} aa-reminders__company-logo--fallback`}
            style={{ background: tone.bg, color: tone.fg }}
            aria-hidden
        >
            {getInitials(trimmed)}
        </span>
    );
}

function ChannelPill({ row }) {
    const isLi = getMedium(row) === 'linkedin';
    return (
        <span className={`aa-upcoming-fu__channel aa-upcoming-fu__channel--${isLi ? 'linkedin' : 'gmail'}`}>
            {getMediumLabel(row)}
        </span>
    );
}

function FilterChip({ label, value, options, onChange, ariaLabel }) {
    const current = options.find((o) => String(o.value) === String(value)) || options[0];
    return (
        <div className="aa-act__filter aa-upcoming-fu__filter">
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

function followUpStatusLabel(row) {
    if (row.follow_up_status === 'due') {
        return 'Due today';
    }
    const days = Number(row.days_until_follow_up ?? 0);
    if (days <= 0) return 'Due today';
    if (days === 1) return 'In 1 day';
    return `In ${days} days`;
}

function rowMatchesMediumFilter(row, mediumFilter) {
    if (mediumFilter === MEDIUM_FILTER.ALL) return true;
    if (mediumFilter === MEDIUM_FILTER.LINKEDIN) return getMedium(row) === 'linkedin';
    return getMedium(row) !== 'linkedin';
}

function MobileUpcomingCard({ row, selected, onSelectChange }) {
    const jobTitle = String(row.job_title || '').trim() || 'Referral outreach';
    const companyName = String(row.company_name || '').trim() || '—';
    const companyLogo = String(row.company_logo || '').trim() || null;
    const contactDisplay = getContactValue(row);
    const replyHref = getReplyHref(row);
    const isLi = getMedium(row) === 'linkedin';
    const externalAttrs = isLi ? { target: '_blank', rel: 'noopener noreferrer' } : {};
    const isDue = row.follow_up_status === 'due' || Number(row.days_until_follow_up ?? 0) <= 0;

    return (
        <article className={`aa-reminders__card aa-upcoming-fu__card${selected ? ' aa-upcoming-fu__card--selected' : ''}`}>
            <div className="aa-reminders__card-head">
                <CompanyMark logo={companyLogo} name={companyName} compact />
                <div className="aa-reminders__card-head-text">
                    <span className="aa-reminders__card-company" title={companyName}>{companyName}</span>
                    <span className="aa-reminders__card-title" title={jobTitle}>{jobTitle}</span>
                    <div className="aa-reminders__card-sub">
                        <ChannelPill row={row} />
                        <span className="aa-reminders__card-sep" aria-hidden>·</span>
                        <span className={`aa-reminders__card-count${isDue ? ' aa-reminders__card-count--positive' : ''}`}>
                            {followUpStatusLabel(row)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="aa-upcoming-fu__card-contact">
                <span className="aa-upcoming-fu__contact-name">{row.employee_name || '—'}</span>
                {contactDisplay && replyHref ? (
                    <a href={replyHref} className="aa-upcoming-fu__contact-link" title={contactDisplay} {...externalAttrs}>
                        {contactDisplay}
                    </a>
                ) : contactDisplay ? (
                    <span className="aa-upcoming-fu__contact-link">{contactDisplay}</span>
                ) : null}
            </div>

            <div className="aa-upcoming-fu__card-dates">
                <span><strong>Sent</strong> {formatDateShort(row.thread_sent_at)}</span>
                <span><strong>Due</strong> {formatDateOnly(row.follow_up_at)}</span>
            </div>

            <div className="aa-upcoming-fu__card-actions">
                <UpcomingFuCheckbox
                    checked={selected}
                    ariaLabel={`Select ${row.employee_name || 'contact'}`}
                    onChange={(checked) => onSelectChange(row, checked)}
                />
            </div>
        </article>
    );
}

function UpcomingTableRow({ row, selected, onSelectChange }) {
    const jobTitle = String(row.job_title || '').trim() || 'Referral outreach';
    const companyName = String(row.company_name || '').trim() || '—';
    const companyLogo = String(row.company_logo || '').trim() || null;
    const contactDisplay = getContactValue(row);
    const replyHref = getReplyHref(row);
    const isLi = getMedium(row) === 'linkedin';
    const isDue = row.follow_up_status === 'due' || Number(row.days_until_follow_up ?? 0) <= 0;

    return (
        <tr className={`aa-table__row aa-upcoming-fu__row${selected ? ' aa-upcoming-fu__row--selected' : ''}`}>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--select">
                <UpcomingFuCheckbox
                    checked={selected}
                    ariaLabel={`Select ${row.employee_name || 'contact'}`}
                    onChange={(checked) => onSelectChange(row, checked)}
                />
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--logo">
                <CompanyMark logo={companyLogo} name={companyName} compact />
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--company">
                <span className="aa-upcoming-fu__company-name" title={companyName}>{companyName}</span>
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--job">
                <span className="aa-upcoming-fu__job-title" title={jobTitle}>{jobTitle}</span>
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--contact">
                <span className="aa-upcoming-fu__contact-name">{row.employee_name || '—'}</span>
                {contactDisplay && replyHref ? (
                    <a
                        className="aa-upcoming-fu__contact-link"
                        href={replyHref}
                        {...(isLi ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        title={contactDisplay}
                    >
                        {contactDisplay}
                    </a>
                ) : contactDisplay ? (
                    <span className="aa-upcoming-fu__contact-link" title={contactDisplay}>{contactDisplay}</span>
                ) : null}
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--channel">
                <ChannelPill row={row} />
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--sent">
                <span className="aa-upcoming-fu__date">{formatDateShort(row.thread_sent_at)}</span>
            </td>
            <td className="aa-table__td aa-upcoming-fu__cell aa-upcoming-fu__cell--due">
                <span className="aa-upcoming-fu__date">{formatDateOnly(row.follow_up_at)}</span>
                <span className={`aa-upcoming-fu__due-badge${isDue ? ' aa-upcoming-fu__due-badge--today' : ''}`}>
                    {followUpStatusLabel(row)}
                </span>
            </td>
        </tr>
    );
}

function EmptyState({ filteredEmpty, mediumFilter }) {
    if (filteredEmpty) {
        const channelLabel =
            mediumFilter === MEDIUM_FILTER.GMAIL
                ? 'Gmail'
                : mediumFilter === MEDIUM_FILTER.LINKEDIN
                    ? 'LinkedIn'
                    : 'this channel';
        return (
            <div className="aa-empty">
                <p className="aa-empty__title">No {channelLabel} follow-ups</p>
                <p className="aa-empty__body">
                    Try switching the channel filter above, or check back after your next outreach run.
                </p>
            </div>
        );
    }

    return (
        <div className="aa-empty">
            <p className="aa-empty__title">No follow-ups scheduled</p>
            <p className="aa-empty__body">
                Either every outreach thread has a reply, or follow-ups are disabled in settings.
            </p>
        </div>
    );
}

const UpcomingFollowUpTab = ({ onCountsFetched }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [mediumFilter, setMediumFilter] = useState(MEDIUM_FILTER.ALL);
    const [selectedKeys, setSelectedKeys] = useState(() => new Set());
    const [bulkBusy, setBulkBusy] = useState(false);
    const onCountsFetchedRef = useRef(onCountsFetched);

    useEffect(() => {
        onCountsFetchedRef.current = onCountsFetched;
    }, [onCountsFetched]);

    const publishCount = useCallback((nextRows) => {
        onCountsFetchedRef.current?.(nextRows.length);
    }, []);

    useEffect(() => {
        const cancelledRef = { cancelled: false };

        const loadRows = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await GET_API(API_JOB_AGENT_UPCOMING_FOLLOWUPS);
                if (cancelledRef.cancelled) return;
                const payload = unwrapApiData(res);
                if (payload && Array.isArray(payload.rows)) {
                    const nextRows = payload.rows;
                    setRows(nextRows);
                    publishCount(nextRows);
                } else {
                    setRows([]);
                    publishCount([]);
                    setError('Couldn’t load upcoming follow-ups. Give it another try in a moment.');
                }
            } catch {
                if (!cancelledRef.cancelled) {
                    setRows([]);
                    publishCount([]);
                    setError('Couldn’t load upcoming follow-ups. Give it another try in a moment.');
                }
            } finally {
                if (!cancelledRef.cancelled) setLoading(false);
            }
        };

        loadRows();
        return () => {
            cancelledRef.cancelled = true;
        };
    }, [publishCount]);

    const applyBlockState = useCallback((items) => {
        const itemKeys = new Set(
            items.map((item) => `${item.channel}:${item.message_id}`)
        );
        setRows((prev) => {
            const next = prev.filter((row) => {
                const blockItem = rowToBlockItem(row);
                const key = `${blockItem.channel}:${blockItem.message_id}`;
                return !itemKeys.has(key);
            });
            publishCount(next);
            return next;
        });
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            items.forEach((item) => next.delete(`${item.channel}:${item.message_id}`));
            return next;
        });
    }, [publishCount]);

    const runBlockAction = useCallback(async (items) => {
        if (!items.length) return false;
        const res = await POST_API(API_JOB_AGENT_UPCOMING_FOLLOWUPS_BLOCK, { items });
        if (res?.data?.status !== 200) {
            throw new Error('Request failed');
        }
        applyBlockState(items);
        return true;
    }, [applyBlockState]);

    const onSelectChange = useCallback((row, checked) => {
        const rowKey = getRowKey(row);
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (checked) next.add(rowKey);
            else next.delete(rowKey);
            return next;
        });
    }, []);

    const runBulkBlock = useCallback(async () => {
        const items = rows
            .filter((row) => selectedKeys.has(getRowKey(row)))
            .map(rowToBlockItem);
        if (!items.length) return;

        setBulkBusy(true);
        try {
            await runBlockAction(items);
            toast.success(`Blocked ${items.length} follow-up${items.length === 1 ? '' : 's'}`);
            setSelectedKeys(new Set());
        } catch {
            toast.error('Couldn’t block selected follow-ups. Please try again.');
        } finally {
            setBulkBusy(false);
        }
    }, [runBlockAction, rows, selectedKeys]);

    const mediumCounts = useMemo(() => {
        let gmail = 0;
        let linkedin = 0;
        rows.forEach((row) => {
            if (getMedium(row) === 'linkedin') linkedin += 1;
            else gmail += 1;
        });
        return { all: rows.length, gmail, linkedin };
    }, [rows]);

    const filterOptions = useMemo(
        () => [
            { value: MEDIUM_FILTER.ALL, label: `All channels (${mediumCounts.all})` },
            { value: MEDIUM_FILTER.GMAIL, label: `Gmail (${mediumCounts.gmail})` },
            { value: MEDIUM_FILTER.LINKEDIN, label: `LinkedIn (${mediumCounts.linkedin})` },
        ],
        [mediumCounts]
    );

    const filteredRows = useMemo(
        () => rows.filter((row) => rowMatchesMediumFilter(row, mediumFilter)),
        [rows, mediumFilter]
    );

    useEffect(() => {
        setPage(0);
        setSelectedKeys(new Set());
    }, [mediumFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const safePage = Math.min(page, Math.max(0, totalPages - 1));
    const visibleRows = useMemo(() => {
        const start = safePage * PAGE_SIZE;
        return filteredRows.slice(start, start + PAGE_SIZE);
    }, [filteredRows, safePage]);

    const selectedCount = useMemo(
        () => rows.filter((row) => selectedKeys.has(getRowKey(row))).length,
        [rows, selectedKeys]
    );

    const allVisibleSelected = visibleRows.length > 0
        && visibleRows.every((row) => selectedKeys.has(getRowKey(row)));

    const onSelectAllVisible = useCallback((checked) => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (checked) {
                visibleRows.forEach((row) => next.add(getRowKey(row)));
            } else {
                visibleRows.forEach((row) => next.delete(getRowKey(row)));
            }
            return next;
        });
    }, [visibleRows]);

    const someVisibleSelected = visibleRows.some((row) => selectedKeys.has(getRowKey(row)));

    const clearSelection = useCallback(() => {
        setSelectedKeys(new Set());
    }, []);

    const rangeStart = filteredRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
    const rangeEnd = filteredRows.length === 0 ? 0 : Math.min(filteredRows.length, (safePage + 1) * PAGE_SIZE);

    const isEmpty = !loading && rows.length === 0;
    const isFilteredEmpty = !loading && rows.length > 0 && filteredRows.length === 0;
    const showEmpty = isEmpty || isFilteredEmpty;

    const countLabel = useMemo(() => {
        if (loading) return 'Loading…';
        const n = filteredRows.length;
        const word = n === 1 ? 'follow-up' : 'follow-ups';
        if (mediumFilter === MEDIUM_FILTER.GMAIL) return `${n} Gmail ${word}`;
        if (mediumFilter === MEDIUM_FILTER.LINKEDIN) return `${n} LinkedIn ${word}`;
        return `${n} scheduled ${word}`;
    }, [loading, filteredRows.length, mediumFilter]);

    const pagerSummary = useMemo(() => {
        if (filteredRows.length === 0) return '';
        const channel =
            mediumFilter === MEDIUM_FILTER.GMAIL
                ? 'Gmail'
                : mediumFilter === MEDIUM_FILTER.LINKEDIN
                    ? 'LinkedIn'
                    : 'follow-ups';
        return `Showing ${rangeStart}–${rangeEnd} of ${filteredRows.length} ${channel}`;
    }, [filteredRows.length, mediumFilter, rangeEnd, rangeStart]);

    const tableColSpan = 8;

    return (
        <section className="aa-reminders aa-upcoming-fu" aria-labelledby="aa-upcoming-fu-heading">
            <header className="aa-reminders__intro">
                <h2 id="aa-upcoming-fu-heading" className="aa-reminders__title">
                    Upcoming follow-ups
                </h2>
                <p className="aa-reminders__lede">
                    Happpy Agent will automatically send a follow-up on Gmail and LinkedIn when no reply
                    arrives after your configured interval.
                </p>
                <p className="aa-reminders__lede aa-reminders__lede--muted">
                    Select rows with the checkboxes, then use <strong>Block follow-up</strong> to stop those automatic follow-ups.
                    {' '}
                    <Link to="/talent/job-agent/configure?tab=follow-up-settings">Adjust follow-up settings</Link>
                </p>
            </header>

            <div className="aa-reminders__toolbar aa-upcoming-fu__toolbar">
                <div className="aa-act__filters aa-upcoming-fu__filters">
                    <FilterChip
                        label="Channel"
                        value={mediumFilter}
                        options={filterOptions}
                        onChange={setMediumFilter}
                        ariaLabel="Filter by channel"
                    />
                    <div className="aa-act__filter aa-upcoming-fu__count-filter">
                        <span className="aa-act__filter-label aa-upcoming-fu__count-label" aria-hidden="true">
                            &nbsp;
                        </span>
                        <p className="aa-upcoming-fu__count" aria-live="polite">
                            {countLabel}
                        </p>
                    </div>
                </div>
            </div>

            {!showEmpty && visibleRows.length > 0 ? (
                <div className="aa-upcoming-fu__actions" role="toolbar" aria-label="Follow-up selection actions">
                    <label className="aa-upcoming-fu__select-all">
                        <UpcomingFuCheckbox
                            checked={allVisibleSelected}
                            disabled={loading || bulkBusy}
                            ariaLabel="Select all on this page"
                            inputRef={(el) => {
                                if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                            }}
                            onChange={onSelectAllVisible}
                        />
                        <span>Select all on this page</span>
                    </label>
                    <button
                        type="button"
                        className="aa-btn aa-btn--secondary aa-upcoming-fu__block-btn"
                        disabled={bulkBusy || loading || selectedCount === 0}
                        onClick={runBulkBlock}
                    >
                        Block follow-up
                        {selectedCount > 0 ? ` (${selectedCount})` : ''}
                    </button>
                    {selectedCount > 0 ? (
                        <button
                            type="button"
                            className="aa-btn aa-btn--ghost aa-upcoming-fu__clear-btn"
                            disabled={bulkBusy}
                            onClick={clearSelection}
                        >
                            Clear
                        </button>
                    ) : null}
                </div>
            ) : null}

            {error ? (
                <div className="aa-replies__error" role="alert">
                    <p>{error}</p>
                </div>
            ) : null}

            <div className="aa-table-wrap" aria-busy={loading}>
                <div className="aa-table-scroll">
                    <table className="aa-table aa-table--upcoming-fu" role="table">
                        <thead className="aa-table__thead">
                            <tr>
                                <th scope="col" className="aa-table__th aa-table__th--uf-select" aria-label="Select row">
                                    <UpcomingFuCheckbox
                                        checked={allVisibleSelected}
                                        disabled={showEmpty || loading || bulkBusy || visibleRows.length === 0}
                                        ariaLabel="Select all on this page"
                                        inputRef={(el) => {
                                            if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                                        }}
                                        onChange={onSelectAllVisible}
                                    />
                                </th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-logo" aria-label="Company logo" />
                                <th scope="col" className="aa-table__th aa-table__th--uf-company">Company</th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-job">Job Title</th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-contact">Contact</th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-channel">Channel</th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-sent">Original Sent</th>
                                <th scope="col" className="aa-table__th aa-table__th--uf-due">Follow-up Due</th>
                            </tr>
                        </thead>
                        <tbody className="aa-table__tbody">
                            {loading && rows.length === 0 ? (
                                <tr>
                                    <td colSpan={tableColSpan} className="aa-table__td aa-table__td--state">
                                        <div className="aa-state aa-state--loading">
                                            <span className="aa-spinner" aria-hidden />
                                            <p>Loading upcoming follow-ups…</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : showEmpty ? (
                                <tr>
                                    <td colSpan={tableColSpan} className="aa-table__td aa-table__td--state">
                                        <EmptyState filteredEmpty={isFilteredEmpty} mediumFilter={mediumFilter} />
                                    </td>
                                </tr>
                            ) : (
                                visibleRows.map((row) => {
                                    const rowKey = getRowKey(row);
                                    return (
                                        <UpcomingTableRow
                                            key={rowKey}
                                            row={row}
                                            selected={selectedKeys.has(rowKey)}
                                            onSelectChange={onSelectChange}
                                        />
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

            <div className="aa-reminders__cards" aria-busy={loading}>
                {loading && rows.length === 0 ? (
                    <div className="aa-state aa-state--loading">
                        <span className="aa-spinner" aria-hidden />
                        <p>Loading upcoming follow-ups…</p>
                    </div>
                ) : showEmpty ? (
                    <EmptyState filteredEmpty={isFilteredEmpty} mediumFilter={mediumFilter} />
                ) : (
                    <ul className="aa-reminders__card-list" role="list">
                        {visibleRows.map((row, idx) => (
                            <li
                                key={`upcoming-m-${getRowKey(row)}`}
                                className="aa-reminders__card-item"
                            >
                                <MobileUpcomingCard
                                    row={row}
                                    selected={selectedKeys.has(getRowKey(row))}
                                    onSelectChange={onSelectChange}
                                />
                            </li>
                        ))}
                    </ul>
                )}
                {loading && rows.length > 0 ? (
                    <div className="aa-reminders__cards-overlay" aria-hidden>
                        <span className="aa-spinner" />
                    </div>
                ) : null}
            </div>

            {!showEmpty && totalPages > 1 ? (
                <div className="aa-pager aa-upcoming-fu__pager">
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
                        {pagerSummary ? ` · ${pagerSummary}` : ''}
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

            {!showEmpty && filteredRows.length > 0 && filteredRows.length <= PAGE_SIZE ? (
                <p className="aa-upcoming-fu__range-hint" aria-live="polite">
                    {pagerSummary}
                </p>
            ) : null}
        </section>
    );
};

export default UpcomingFollowUpTab;
