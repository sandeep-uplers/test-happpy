'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { debounce } from "lodash";
import Select from "react-select";
import {
    API_ALL_OPP,
    API_OPP_LOCATION_MASTER,
    API_OPP_ROLE_MASTER,
    IMAGE_URL,
} from "../../../components/Constant";
import { customSelectTheme } from "../../../components/common/CustomStyleReactSelect";
import { GET_API, formattedJobCount, formattedYOE } from "../../../components/Helper";
import { engagementFilterMaster, experienceFilterMaster } from "../../../components/Masters";
import CompanyLogo from "../work-components/CompanyLogo";
import "./JobsBoard.css";

/**
 * Standalone job board — jobs from `API_ALL_OPP` behind five filters: years of experience,
 * job function, location, mode of work and sort.
 *
 * Deliberately self-contained: local state only, no Redux, no URL params and no dependency on
 * the `/talent/all-opportunities` page or its filter components, so it can be dropped into any
 * surface (landing pages included) without coupling the two experiences together.
 */

/** `sort_field` values the platform already sends; anything else is treated as relevance server-side. */
const SORT_OPTIONS = [
    { label: "Relevance", value: "relevance" },
    { label: "Newest first", value: "created_at" },
];

/**
 * react-select rather than a hand-rolled popover: the menu goes into a `document.body` portal
 * (`menuPortalTarget` below), so no host page's overflow or stacking context can clip it — the
 * failure mode the custom dropdown kept hitting on this landing page.
 */
const SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        minHeight: "44px",
        borderRadius: "10px",
        borderColor: state.isFocused ? "#231f20" : "#e2e2e2",
        boxShadow: "none",
        ":hover": { borderColor: "#b9b9b9" },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 10px" }),
    placeholder: (base) => ({ ...base, fontSize: "14px", color: "#6b6b6b" }),
    singleValue: (base) => ({ ...base, fontSize: "14px" }),
    multiValue: (base) => ({ ...base, backgroundColor: "#fff8d6", borderRadius: "6px" }),
    multiValueLabel: (base) => ({ ...base, fontSize: "12px" }),
    option: (base) => ({ ...base, fontSize: "14px", textAlign: "left" }),
    menu: (base) => ({ ...base, textAlign: "left" }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const SHARED_SELECT_PROPS = {
    theme: customSelectTheme,
    styles: SELECT_STYLES,
    classNamePrefix: "jobs-board-select",
    menuPlacement: "auto",
    menuPortalTarget: typeof document !== "undefined" ? document.body : null,
};

const EMPTY_FILTERS = {
    /** Single range like `"2,4"` — the API reads one from/to pair, not a set. */
    experience: "",
    /** Job function ids (`hrs.job_function_id`). */
    jobFunctions: [],
    /** City ids, or `stateid-<id>` for a whole state. */
    locations: [],
    /** Onsite / Hybrid / Remote. */
    modes: [],
    sort: "relevance",
};

export default function JobsBoard({
    title = "Browse open jobs",
    subtitle = "Filter live openings by experience, function, location and how you want to work.",
    pageSize = 12,
    /**
     * Adds the "Ask a referral" button to every card — the card's only action, there is deliberately
     * no link into the job detail page. Receives the job; resolve truthy to leave the button in its
     * requested state, falsy to reset it — a host that opens a connect-accounts popup instead of
     * queueing returns falsy so the talent can retry once connected.
     */
    onRunAgent = null,
}) {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [jobs, setJobs] = useState([]);
    const [jobsCount, setJobsCount] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [failed, setFailed] = useState(false);

    const [jobFunctionOptions, setJobFunctionOptions] = useState([]);
    const [jobFunctionLoading, setJobFunctionLoading] = useState(true);
    const [locationOptions, setLocationOptions] = useState([]);
    const [locationSearch, setLocationSearch] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    /** Only consulted on phones — the filter grid is always visible from 768px up. */
    const [filtersOpen, setFiltersOpen] = useState(false);

    /** Per-job referral state, keyed by HR number: `"running"` while in flight, `"done"` once requested. */
    const [runStates, setRunStates] = useState({});

    /** Guards against out-of-order responses: only the newest request may write to state. */
    const requestIdRef = useRef(0);

    const buildQuery = useCallback((requestedPage, isCount) => {
        const params = new URLSearchParams();
        params.set("pagination", String(pageSize));
        params.set("page", String(requestedPage));
        params.set("is_count", isCount ? "1" : "0");
        params.set("sort_field", filters.sort);

        if (filters.experience) {
            params.set("experience", filters.experience);
        }
        if (filters.jobFunctions.length > 0) {
            params.set("roles", filters.jobFunctions.map((item) => item.value).join(","));
        }
        if (filters.locations.length > 0) {
            params.set("locations", filters.locations.map((item) => item.value).join(","));
        }
        if (filters.modes.length > 0) {
            params.set("engagements", JSON.stringify(filters.modes.map((type) => ({ type }))));
        }
        return `?${params.toString()}`;
    }, [filters, pageSize]);

    useEffect(() => {
        let cancelled = false;
        GET_API(API_OPP_ROLE_MASTER)
            .then((res) => {
                if (cancelled) return;
                setJobFunctionOptions(Array.isArray(res?.data?.data) ? res.data.data : []);
            })
            .catch(() => {
                if (!cancelled) setJobFunctionOptions([]);
            })
            .finally(() => {
                if (!cancelled) setJobFunctionLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const fetchLocations = useCallback((search) => {
        setLocationLoading(true);
        GET_API(API_OPP_LOCATION_MASTER + (search ? `?search=${encodeURIComponent(search)}` : ""))
            .then((res) => setLocationOptions(Array.isArray(res?.data?.data) ? res.data.data : []))
            .catch(() => setLocationOptions([]))
            .finally(() => setLocationLoading(false));
    }, []);

    const debouncedFetchLocations = useMemo(() => debounce(fetchLocations, 400), [fetchLocations]);

    useEffect(() => {
        debouncedFetchLocations(locationSearch.trim());
        return debouncedFetchLocations.cancel;
    }, [locationSearch, debouncedFetchLocations]);

    // First page — reruns whenever a filter changes.
    useEffect(() => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setFailed(false);
        setPage(1);
        setJobsCount(null);

        GET_API(API_ALL_OPP + buildQuery(1, false))
            .then((res) => {
                if (requestId !== requestIdRef.current) return;
                setJobs(res?.data?.hrs?.data || []);
                setLoading(false);

                return GET_API(API_ALL_OPP + buildQuery(1, true)).then((countRes) => {
                    if (requestId !== requestIdRef.current) return;
                    setJobsCount(countRes?.data?.jobs_count ?? 0);
                });
            })
            .catch(() => {
                if (requestId !== requestIdRef.current) return;
                setJobs([]);
                setLoading(false);
                setFailed(true);
            });
    }, [buildQuery]);

    const loadMore = () => {
        const requestId = requestIdRef.current;
        const nextPage = page + 1;
        setLoadingMore(true);
        GET_API(API_ALL_OPP + buildQuery(nextPage, false))
            .then((res) => {
                if (requestId !== requestIdRef.current) return;
                setJobs((prev) => [...prev, ...(res?.data?.hrs?.data || [])]);
                setPage(nextPage);
            })
            .catch(() => { })
            .finally(() => {
                if (requestId === requestIdRef.current) setLoadingMore(false);
            });
    };

    const handleRunAgent = async (job) => {
        const key = job?.HR_Number;
        if (!onRunAgent || key == null || runStates[key]) return;

        setRunStates((prev) => ({ ...prev, [key]: "running" }));
        const clearKey = () => setRunStates((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
        });

        try {
            const queued = await onRunAgent(job);
            if (queued) {
                setRunStates((prev) => ({ ...prev, [key]: "done" }));
            } else {
                clearKey();
            }
        } catch {
            clearKey();
        }
    };

    const activeFilterCount = (filters.experience ? 1 : 0)
        + filters.jobFunctions.length
        + filters.locations.length
        + filters.modes.length;
    const hasActiveFilters = activeFilterCount > 0;

    const hasMore = jobsCount !== null && jobs.length < jobsCount;

    return (
        <div className="jobs-board">
            <header className="jobs-board__header">
                <h2 className="jobs-board__title">{title}</h2>
                {subtitle ? <p className="jobs-board__subtitle">{subtitle}</p> : null}
            </header>

            {/* Phone-only trigger (CSS hides it above 767px, where the filters are always shown)
                so five stacked selects don't push the jobs themselves below the fold. */}
            <button
                type="button"
                className="jobs-board__filters-toggle"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-expanded={filtersOpen}
                aria-controls="jobs-board-filters"
            >
                <span>Filters</span>
                {activeFilterCount > 0 ? <em className="jobs-board__filters-count">{activeFilterCount}</em> : null}
                <ChevronGlyph open={filtersOpen} />
            </button>

            <div
                className={`jobs-board__filters${filtersOpen ? "" : " jobs-board__filters--collapsed"}`}
                id="jobs-board-filters"
            >
                <div className="jobs-board__filter">
                    <label className="jobs-board__filter-label" htmlFor="jobs-board-experience">Years of experience</label>
                    <Select
                        {...SHARED_SELECT_PROPS}
                        inputId="jobs-board-experience"
                        options={experienceFilterMaster}
                        value={experienceFilterMaster.find((item) => item.value === filters.experience) || null}
                        onChange={(option) => setFilters((prev) => ({ ...prev, experience: option?.value || "" }))}
                        placeholder="Any experience"
                        isClearable
                        isSearchable={false}
                    />
                </div>

                <div className="jobs-board__filter">
                    <label className="jobs-board__filter-label" htmlFor="jobs-board-job-function">Job function</label>
                    <Select
                        {...SHARED_SELECT_PROPS}
                        inputId="jobs-board-job-function"
                        options={jobFunctionOptions}
                        value={filters.jobFunctions}
                        onChange={(options) => setFilters((prev) => ({ ...prev, jobFunctions: options ? [...options] : [] }))}
                        placeholder="All functions"
                        isMulti
                        isLoading={jobFunctionLoading}
                        closeMenuOnSelect={false}
                    />
                </div>

                <div className="jobs-board__filter">
                    <label className="jobs-board__filter-label" htmlFor="jobs-board-location">Location</label>
                    <Select
                        {...SHARED_SELECT_PROPS}
                        inputId="jobs-board-location"
                        options={locationOptions}
                        value={filters.locations}
                        onChange={(options) => setFilters((prev) => ({ ...prev, locations: options ? [...options] : [] }))}
                        onInputChange={(value, meta) => {
                            if (meta.action === "input-change") setLocationSearch(value);
                        }}
                        inputValue={locationSearch}
                        /* The master endpoint already searches and caps at 50 — don't filter its result again. */
                        filterOption={null}
                        isLoading={locationLoading}
                        placeholder="Any location"
                        noOptionsMessage={() => (locationLoading ? "Searching…" : "No locations found")}
                        isMulti
                        closeMenuOnSelect={false}
                    />
                </div>

                <div className="jobs-board__filter">
                    <label className="jobs-board__filter-label" htmlFor="jobs-board-mode">Mode of work</label>
                    <Select
                        {...SHARED_SELECT_PROPS}
                        inputId="jobs-board-mode"
                        options={engagementFilterMaster}
                        value={engagementFilterMaster.filter((option) => filters.modes.includes(option.value))}
                        onChange={(options) => setFilters((prev) => ({ ...prev, modes: (options || []).map((option) => option.value) }))}
                        placeholder="Any mode"
                        isMulti
                        isSearchable={false}
                        closeMenuOnSelect={false}
                    />
                </div>

                <div className="jobs-board__filter">
                    <label className="jobs-board__filter-label" htmlFor="jobs-board-sort">Sort</label>
                    <Select
                        {...SHARED_SELECT_PROPS}
                        inputId="jobs-board-sort"
                        options={SORT_OPTIONS}
                        value={SORT_OPTIONS.find((item) => item.value === filters.sort)}
                        onChange={(option) => setFilters((prev) => ({ ...prev, sort: option?.value || "relevance" }))}
                        isSearchable={false}
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <div className="jobs-board__chips">
                    <button
                        type="button"
                        className="jobs-board__clear-all"
                        onClick={() => setFilters((prev) => ({ ...EMPTY_FILTERS, sort: prev.sort }))}
                    >
                        Clear all filters
                    </button>
                </div>
            )}

            <div className="jobs-board__count" aria-live="polite">
                {loading
                    ? "Loading jobs…"
                    : jobsCount !== null
                        ? `Showing ${jobs.length} of ${formattedJobCount(jobsCount)} ${jobsCount === 1 ? "job" : "jobs"}`
                        : `Showing ${jobs.length} jobs`}
            </div>

            {loading ? (
                <div className="jobs-board__grid">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div className="jobs-board__card jobs-board__card--skeleton" key={`skeleton-${index}`} />
                    ))}
                </div>
            ) : failed ? (
                <div className="jobs-board__empty">
                    <p>We couldn’t load jobs just now.</p>
                    <button type="button" onClick={() => setFilters((prev) => ({ ...prev }))}>Try again</button>
                </div>
            ) : jobs.length === 0 ? (
                <div className="jobs-board__empty">
                    <img src={IMAGE_URL + "work/opportunities-not-found.svg"} alt="" />
                    <p>No jobs match these filters.</p>
                    <button type="button" onClick={() => setFilters(EMPTY_FILTERS)}>Clear filters</button>
                </div>
            ) : (
                <>
                    <div className="jobs-board__grid">
                        {jobs.map((job) => (
                            <JobsBoardCard
                                key={job.HR_Number}
                                job={job}
                                onRunAgent={onRunAgent ? handleRunAgent : null}
                                runState={runStates[job.HR_Number]}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="jobs-board__more">
                            <button type="button" onClick={loadMore} disabled={loadingMore}>
                                {loadingMore ? "Loading…" : "Load more jobs"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function JobsBoardCard({ job, onRunAgent, runState }) {
    const mustHaveSkills = (job.skills || [])
        .filter((item) => item?.skill?.type === "must_have")
        .map((item) => item.skill.name)
        .slice(0, 4);

    return (
        <article className="jobs-board__card">
            <div className="jobs-board__card-head">
                <div className="jobs-board__card-logo">
                    <CompanyLogo company={job.company} HR_Number={job.HR_Number} />
                </div>
                <div className="jobs-board__card-heading">
                    <h3>{job.RequestForTalent}</h3>
                    <span>{job.company?.company_name}</span>
                </div>
            </div>

            <ul className="jobs-board__card-meta">
                {job.YearOfExp ? <li>{formattedYOE(job.YearOfExp, job.max_yoe)}</li> : null}
                <li>{modeOfWorkLabel(job)}</li>
            </ul>

            {mustHaveSkills.length > 0 && (
                <div className="jobs-board__card-skills">
                    {mustHaveSkills.map((skill) => (
                        <span key={skill}>{skill}</span>
                    ))}
                </div>
            )}

            {onRunAgent && (
                <div className="jobs-board__card-actions">
                    <button
                        type="button"
                        className="jobs-board__card-run"
                        onClick={(event) => {
                            event.preventDefault();
                            onRunAgent(job);
                        }}
                        disabled={Boolean(runState)}
                    >
                        {runState === "running"
                            ? "Sending…"
                            : runState === "done"
                                ? "Referral requested"
                                : "Ask a referral"}
                    </button>
                </div>
            )}
        </article>
    );
}

function ChevronGlyph({ open }) {
    return (
        <svg
            className={`jobs-board__chevron${open ? " jobs-board__chevron--up" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Mirrors the platform's wording: `ModeOfWork` is stored as office/hybrid/remote. */
function modeOfWorkLabel(job) {
    const mode = (job.ModeOfWork || "").toLowerCase();
    const cities = job.job_location || [];
    const firstCity = cities[0]?.city_name;
    const extra = cities.length > 1 ? ` +${cities.length - 1} more` : "";

    if (mode === "remote") return job.city ? `Remote - ${job.city}` : "Remote";
    if (mode === "office") return firstCity ? `Onsite - ${firstCity}${extra}` : "Onsite";
    if (mode === "hybrid") return firstCity ? `Hybrid - ${firstCity}${extra}` : "Hybrid";
    return firstCity || job.city || "Location not specified";
}
