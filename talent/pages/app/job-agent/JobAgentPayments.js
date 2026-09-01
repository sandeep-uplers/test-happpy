'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { API_TALENT_PAYMENT_TRANSACTIONS } from '../../../components/Constant';
import { GET_API } from '../../../components/Helper';

/** Must match backend max; listPaymentTransactions caps per_page at 100 */
const PER_PAGE = 5;

const MatIcon = ({ name, className = '' }) => (
    <span className={`material-symbols-outlined ${className}`.trim()}>{name}</span>
);

const STATUS_LABEL = {
    0: 'In progress',
    1: 'Completed',
    2: 'Failed',
    3: 'Refund initiated',
    4: 'Refund completed',
};

function PaymentStatusPill({ status }) {
    const label = STATUS_LABEL[status] ?? `Status ${status}`;
    if (status === 0) {
        return (
            <span className="jad-jobs__pill jad-jobs__pill--queue">
                <MatIcon name="schedule" className="jad-jobs__pill-icon" aria-hidden />
                {label}
            </span>
        );
    }
    if (status === 1) {
        return <span className="jad-jobs__pill jad-jobs__pill--success">{label}</span>;
    }
    if (status === 2) {
        return (
            <span className="jad-jobs__pill jad-jobs__pill--error">
                <MatIcon name="error" className="jad-jobs__pill-icon" aria-hidden />
                {label}
            </span>
        );
    }
    return <span className="jad-jobs__pill jad-jobs__pill--muted">{label}</span>;
}

function formatDateParts(iso) {
    if (!iso) return { main: '—', sub: '' };
    try {
        const d = parseISO(iso);
        return {
            main: format(d, 'd MMM yyyy'),
            sub: format(d, 'h:mm a'),
        };
    } catch {
        return { main: iso, sub: '' };
    }
}

const JobAgentPayments = ({ embedded = false }) => {
    const { user } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [rangeFrom, setRangeFrom] = useState(null);
    const [rangeTo, setRangeTo] = useState(null);

    const fetchPage = useCallback(async (pageNum) => {
        setLoading(true);
        setError(null);
        try {
            const url = `${API_TALENT_PAYMENT_TRANSACTIONS}?per_page=${PER_PAGE}&page=${pageNum}`;
            const res = await GET_API(url);
            if (res?.data?.status !== 200) {
                setError(res?.data?.message || 'Could not load payments.');
                setRows([]);
                return;
            }
            const payload = res?.data?.data || {};
            const tx = payload.transactions;
            setRows(tx?.data || []);
            setPage(tx?.current_page ?? 1);
            setLastPage(tx?.last_page ?? 1);
            setTotal(tx?.total ?? 0);
            setRangeFrom(tx?.from ?? null);
            setRangeTo(tx?.to ?? null);
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || 'Could not load payments.');
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    const emailLabel = useMemo(() => {
        const e = user?.email;
        return typeof e === 'string' && e.trim() ? e.trim() : '—';
    }, [user?.email]);

    const totalPages = Math.max(lastPage, 1);

    useEffect(() => {
        if (!embedded) {
            document.title = 'Transactions | AgentJ | Uplers';
        }
    }, [embedded]);

    return (
        <>
            <div className={`jad-jobs${embedded ? ' jad-jobs--embedded' : ''}`}>
                <header className="jad-jobs__header">
                    <h1 className="jad-jobs__title jad-font-headline">Transactions</h1>
                    <p className="jad-jobs__lead jad-font-body">
                        Invoices and purchases for tailor resume, outreach, resume transformation, and related services.
                    </p>
                </header>

                {loading && (
                    <div className="jad-jobs__table-wrap jad-payments__loading-wrap">
                        <div className="jad-payments__loading">
                            <div className="jad-payments__loading-spinner" aria-hidden />
                            <p className="jad-payments__loading-text jad-font-body">Loading payment history…</p>
                        </div>
                    </div>
                )}

                {!loading && error && (
                    <p className="jad-payments__error-banner jad-font-body" role="alert">
                        {error}
                    </p>
                )}

                {!loading && !error && (
                    <>
                        <p className="jad-jobs__filter-meta jad-font-body">
                            {total === 0 ? (
                                <>
                                    Email <strong>{emailLabel}</strong>
                                </>
                            ) : (
                                <>
                                    Showing <strong>{rangeFrom ?? 0}</strong>–<strong>{rangeTo ?? 0}</strong> of{' '}
                                    <strong>{total}</strong> transactions
                                </>
                            )}
                        </p>

                        <div className="jad-jobs__table-wrap jad-jobs__table-wrap--desktop">
                            <table className="jad-jobs__table">
                                <thead>
                                    <tr>
                                        <th scope="col">Sr</th>
                                        <th scope="col">Date</th>
                                        <th scope="col" className="jad-jobs__th-amount">
                                            Amount
                                        </th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Provider</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="jad-jobs__empty">
                                                No payment transactions yet. Purchases will appear here after you check
                                                out.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, index) => {
                                            const { main, sub } = formatDateParts(row.created_at);
                                            const sr = (page - 1) * PER_PAGE + index + 1;
                                            return (
                                                <tr key={row.id}>
                                                    <td className="jad-jobs__sr">{sr}</td>
                                                    <td className="jad-jobs__request-date">
                                                        <time dateTime={row.created_at || undefined}>
                                                            <span className="jad-jobs__date-line">{main}</span>
                                                            {sub ? (
                                                                <span className="jad-jobs__date-time">{sub}</span>
                                                            ) : null}
                                                        </time>
                                                    </td>
                                                    <td className="jad-jobs__amount">
                                                        {row.total_amount != null ? (
                                                            <>
                                                                <span className="jad-jobs__amount-curr">
                                                                    {row.currency || 'INR'}
                                                                </span>
                                                                {Number(row.total_amount).toLocaleString()}
                                                            </>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td>
                                                        <PaymentStatusPill status={row.status} />
                                                    </td>
                                                    <td className="jad-jobs__provider-cell">
                                                        {row.payment_provider || '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {embedded && (
                            <div className="jad-payments__mobile" aria-label="Transactions list">
                                {rows.length === 0 ? (
                                    <p className="jad-payments__mobile-empty jad-font-body">
                                        No payment transactions yet. Purchases will appear here after you check
                                        out.
                                    </p>
                                ) : (
                                    <ul className="jad-payments__mobile-list">
                                        {rows.map((row, index) => {
                                            const { main, sub } = formatDateParts(row.created_at);
                                            const sr = (page - 1) * PER_PAGE + index + 1;
                                            const provider = row.payment_provider || '—';

                                            return (
                                                <li key={row.id} className="jad-payments__mobile-item">
                                                    <div className="jad-payments__mobile-top">
                                                        <span
                                                            className="jad-payments__mobile-index"
                                                            aria-hidden
                                                        >
                                                            {sr}
                                                        </span>
                                                        <div className="jad-payments__mobile-summary">
                                                            <div className="jad-payments__mobile-date-row">
                                                                <time
                                                                    className="jad-payments__mobile-date"
                                                                    dateTime={row.created_at || undefined}
                                                                >
                                                                    {main}
                                                                </time>
                                                                <span className="jad-payments__mobile-amount">
                                                                    {row.total_amount != null ? (
                                                                        <>
                                                                            <span className="jad-payments__mobile-amount-curr">
                                                                                {row.currency || 'INR'}
                                                                            </span>
                                                                            {Number(row.total_amount).toLocaleString()}
                                                                        </>
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {(sub || provider !== '—') && (
                                                                <p className="jad-payments__mobile-meta">
                                                                    {[
                                                                        sub,
                                                                        provider !== '—'
                                                                            ? `${sub ? ' - Via ' : 'Via '}${provider}`
                                                                            : '',
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join('')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="jad-payments__mobile-foot">
                                                        <span className="jad-payments__mobile-status">
                                                            <span className="jad-payments__mobile-foot-label">
                                                                Status:
                                                            </span>
                                                            <PaymentStatusPill status={row.status} />
                                                        </span>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}

                        {total > 0 && (
                            <nav className="jad-jobs__pagination" aria-label="Payment history pagination">
                                <div className="jad-jobs__pagination-row">
                                    <span className="jad-jobs__pagination-spacer" aria-hidden />
                                    <div className="jad-jobs__pagination-controls">
                                        <button
                                            type="button"
                                            className="jad-jobs__page-btn"
                                            onClick={() => fetchPage(page - 1)}
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
                                            onClick={() => fetchPage(page + 1)}
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
                    </>
                )}
            </div>
        </>
    );
};

export default JobAgentPayments;
