'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { API_URL } from '../../../../components/Constant';
import { DELETE_API, GET_API, POST_API } from '../../../../components/Helper';
import { trackHappyAgentMixpanel } from '../../../../store/actions/happyAgentTracking';

/**
 * Blocked Companies tab — Figma node 28463:8400
 *
 * Reuses the disabled-companies endpoints already powering
 * {@link OutreachSettings} (`pages/app/linkedin/OutreachSettings.js`,
 * lines 95–196) so blocking from this tab stays in sync with the legacy
 * outreach settings screen:
 *   - GET  /talent/outreach/settings/disabled-companies            — list
 *   - POST /talent/outreach/settings/disabled-companies            — add (body: { company_id })
 *   - DELETE /talent/outreach/settings/disabled-companies/{id}     — remove
 *   - GET  /talent/outreach/settings/companies?search=...          — typeahead
 *
 * UI matches the Figma: a single white card with a heading + description
 * + search input. Selected companies render as chips inside the card, and
 * the info-note below the card switches between the empty-state copy and
 * a live "N companies blocked" summary.
 */

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LEN = 2;

/* -------------------------------------------------------------------------- */
/* Inline icons + CompanyLogo                                                  */
/* -------------------------------------------------------------------------- */

function InfoCircleIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" stroke="#565b6c" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="#565b6c" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="#565b6c" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" stroke="#a09b93" strokeWidth="1.6" />
            <path
                d="M20 20l-3.5-3.5"
                stroke="#a09b93"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

function RemoveIcon() {
    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

function DefaultCompanyIcon({ className }) {
    return (
        <span className={className} aria-hidden="true">
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h6" />
            </svg>
        </span>
    );
}

/** Logo with graceful fallback when the URL is missing or fails to load. */
function CompanyLogo({ src, className }) {
    const [failed, setFailed] = useState(!src);
    if (!src || failed) return <DefaultCompanyIcon className={className} />;
    return (
        <img
            src={src}
            alt=""
            className={className}
            onError={() => setFailed(true)}
        />
    );
}

/* -------------------------------------------------------------------------- */
/* BlockedCompaniesTab                                                         */
/* -------------------------------------------------------------------------- */

const BlockedCompaniesTab = () => {
    const [blockedCompanies, setBlockedCompanies] = useState([]);
    const [blockedLoading, setBlockedLoading] = useState(false);

    const [search, setSearch] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [options, setOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const searchWrapRef = useRef(null);

    /** Fetch the blocked list once on mount (and after add/remove). */
    const fetchBlocked = useCallback(async () => {
        setBlockedLoading(true);
        try {
            const res = await GET_API(`${API_URL}talent/outreach/settings/disabled-companies`);
            if (res?.data?.status === 200 && Array.isArray(res?.data?.data)) {
                setBlockedCompanies(res.data.data);
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to load blocked companies');
        } finally {
            setBlockedLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlocked();
    }, [fetchBlocked]);

    /** Debounced typeahead — only fires when the input has ≥2 chars. */
    useEffect(() => {
        if (search.trim().length < MIN_SEARCH_LEN) {
            setOptions([]);
            setOptionsLoading(false);
            return undefined;
        }
        let cancelled = false;
        setOptionsLoading(true);
        const handle = setTimeout(async () => {
            try {
                const res = await GET_API(
                    `${API_URL}talent/outreach/settings/companies?search=${encodeURIComponent(
                        search.trim(),
                    )}`,
                );
                if (cancelled) return;
                const list =
                    res?.data?.status === 200 && Array.isArray(res?.data?.data)
                        ? res.data.data
                        : [];
                setOptions(list);
            } catch {
                if (!cancelled) setOptions([]);
            } finally {
                if (!cancelled) setOptionsLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);
        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [search]);

    /** Close dropdown when clicking outside the search wrapper. */
    useEffect(() => {
        if (!searchFocused) return undefined;
        const handler = (e) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
                setSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [searchFocused]);

    const blockedIds = useMemo(
        () => new Set(blockedCompanies.map((c) => c.company_id)),
        [blockedCompanies],
    );

    /** Options minus anything that is already blocked. */
    const visibleOptions = useMemo(
        () => options.filter((c) => !blockedIds.has(c.id)),
        [options, blockedIds],
    );

    const handleAdd = useCallback(
        async (company) => {
            if (adding) return;
            setAdding(true);
            try {
                const res = await POST_API(
                    `${API_URL}talent/outreach/settings/disabled-companies`,
                    { company_id: company.id },
                );
                if (res?.data?.status === 200 && res?.data?.data) {
                    setBlockedCompanies((prev) => [res.data.data, ...prev]);
                    setSearch('');
                    setOptions([]);
                    setSearchFocused(false);
                    trackHappyAgentMixpanel('agent_configure_company_blocked', {
                        company_id: company.id,
                    }).catch(() => { });
                    toast.success('Company added to blocked list');
                } else {
                    toast.error(res?.data?.message || 'Failed to block company');
                }
            } catch (e) {
                toast.error(e?.response?.data?.message || 'Failed to block company');
            } finally {
                setAdding(false);
            }
        },
        [adding],
    );

    const handleRemove = useCallback(async (item) => {
        if (!item?.id) return;
        setRemovingId(item.id);
        try {
            const res = await DELETE_API(
                `${API_URL}talent/outreach/settings/disabled-companies/${item.id}`,
            );
            if (res?.data?.status === 200) {
                setBlockedCompanies((prev) => prev.filter((c) => c.id !== item.id));
                trackHappyAgentMixpanel('agent_configure_company_unblocked', {
                    company_id: item.company_id,
                }).catch(() => { });
                toast.success('Company removed from blocked list');
            } else {
                toast.error(res?.data?.message || 'Failed to remove company');
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to remove company');
        } finally {
            setRemovingId(null);
        }
    }, []);

    const showDropdown =
        searchFocused && search.trim().length >= MIN_SEARCH_LEN;

    const blockedCount = blockedCompanies.length;
    const noteText = blockedLoading
        ? 'Loading blocked companies…'
        : blockedCount === 0
            ? 'You have not blocked any companies yet'
            : `${blockedCount} ${blockedCount === 1 ? 'company' : 'companies'} blocked`;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    return (
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">Companies you have blocked</p>

            <div className="hc-bc">
                <div className="hc-bc-card">

                    {isMobile ?
                        <h3 className="hc-bc-card__title">
                            The Happpy Agent will not run for jobs from companies you add below
                        </h3> :
                        <>
                            <h3 className="hc-bc-card__title">
                                The agent will{' '}
                                <span className="hc-bc-card__title-strong">automatically</span>{' '}
                                skip jobs from these companies
                            </h3>
                            <p className="hc-bc-card__desc">
                                The Happpy Agent will not run for jobs from companies you add below
                            </p>
                        </>
                    }

                    <div className="hc-bc-search" ref={searchWrapRef}>
                        <span className="hc-bc-search__icon" aria-hidden="true">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            className="hc-bc-search__input"
                            placeholder="Search companies to block (min 2 characters)..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSearchFocused(true);
                            }}
                            onFocus={() => setSearchFocused(true)}
                            aria-autocomplete="list"
                            aria-expanded={showDropdown}
                            aria-controls="hc-bc-search-listbox"
                        />

                        {showDropdown && (
                            <div className="hc-bc-search__dropdown" id="hc-bc-search-listbox" role="listbox">
                                {optionsLoading ? (
                                    <p className="hc-bc-search__hint">Searching…</p>
                                ) : visibleOptions.length === 0 ? (
                                    <p className="hc-bc-search__hint">
                                        {options.length === 0
                                            ? 'No companies match your search'
                                            : 'All matching companies are already blocked'}
                                    </p>
                                ) : (
                                    <ul className="hc-bc-search__list">
                                        {visibleOptions.map((c) => (
                                            <li key={c.id}>
                                                <button
                                                    type="button"
                                                    className="hc-bc-search__option"
                                                    role="option"
                                                    onClick={() => handleAdd(c)}
                                                    disabled={adding}
                                                >
                                                    <CompanyLogo
                                                        src={c.logo_url || c.company_logo}
                                                        className="hc-bc-search__option-logo"
                                                    />
                                                    <span className="hc-bc-search__option-name">
                                                        {c.company_name}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {blockedCompanies.length > 0 && (
                        <ul className="hc-bc-chips" aria-label="Blocked companies">
                            {blockedCompanies.map((item) => (
                                <li key={item.id} className="hc-bc-chip">
                                    <CompanyLogo
                                        src={item.company_logo}
                                        className="hc-bc-chip__logo"
                                    />
                                    <span className="hc-bc-chip__name">{item.company_name}</span>
                                    <button
                                        type="button"
                                        className="hc-bc-chip__remove"
                                        onClick={() => handleRemove(item)}
                                        disabled={removingId === item.id}
                                        aria-label={`Remove ${item.company_name}`}
                                    >
                                        <RemoveIcon />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <p className="hc-bc-note">
                    <InfoCircleIcon />
                    <span>{noteText}</span>
                </p>
            </div>
        </div>
    );
};

export default BlockedCompaniesTab;
