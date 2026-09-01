import React, { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { isObjectVoid } from '../../../components/Masters';
import OppTabFilters from '../happy-jobs/filters/OppTabFilters';
import { buildAllJobsFilterChips, removeChipFromFilters } from './allJobsFilterChips';

function CloseIcon({ width = 16, height = 16 }) {
    return (
        <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
                d="M7.875 13.5C11.0196 13.5 13.5 11.0196 13.5 7.875C13.5 4.73044 11.0196 2.25 7.875 2.25C4.73044 2.25 2.25 4.73044 2.25 7.875C2.25 11.0196 4.73044 13.5 7.875 13.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M15.75 15.75L12.4875 12.4875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function AllJobsFilterDrawer({
    open,
    onClose,
    onApply,
    onClearAll,
    selectedFilters,
    setSelectedFilters,
    masterLoader,
    rangeInput,
    setRangeInput,
    subMaster,
    setSubMaster,
    searchValue,
    onSearchChange,
}) {
    const filterMasterData = useSelector(state => state.work)?.oppFilterMaster ?? {};

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onClose]);

    const activeChips = useMemo(
        () => buildAllJobsFilterChips(selectedFilters, subMaster, filterMasterData),
        [selectedFilters, subMaster, filterMasterData],
    );

    const handleRemoveChip = (chip) => {
        setSelectedFilters(removeChipFromFilters(selectedFilters, chip));
    };

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="jad-all-jobs-filter-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jad-all-jobs-filter-drawer-title"
        >
            <button
                type="button"
                className="jad-all-jobs-filter-drawer__backdrop"
                aria-label="Close filters"
                onClick={onClose}
            />
            <aside
                className="jad-all-jobs-filter-drawer__panel"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className="jad-all-jobs-filter-drawer__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>

                <header className="jad-all-jobs-filter-drawer__head">
                    <div className="jad-all-jobs-filter-drawer__head-copy">
                        <h2 id="jad-all-jobs-filter-drawer-title" className="jad-all-jobs-filter-drawer__title">
                            Filters
                        </h2>
                        <p className="jad-all-jobs-filter-drawer__subtitle">
                            Refine jobs by work mode, location, skills, and more
                        </p>
                    </div>
                    <button
                        type="button"
                        className="jad-all-jobs-filter-drawer__clear"
                        onClick={onClearAll}
                        disabled={isObjectVoid(selectedFilters) && !searchValue}
                    >
                        Clear all
                    </button>
                </header>

                <div className="jad-all-jobs-filter-drawer__search-wrap">
                    <span className="jad-all-jobs-filter-drawer__search-icon" aria-hidden>
                        <SearchIcon />
                    </span>
                    <input
                        type="search"
                        className="jad-all-jobs-filter-drawer__search-input"
                        placeholder="Search jobs by title, company, or keyword"
                        value={searchValue || ''}
                        onChange={(event) => onSearchChange(event.target.value)}
                        data-hj-allow
                        autoComplete="off"
                    />
                </div>

                {activeChips.length > 0 ? (
                    <div className="jad-all-jobs-filter-drawer__chips" aria-label="Active filters">
                        {activeChips.map((chip) => (
                            <button
                                key={chip.id}
                                type="button"
                                className="jad-all-jobs-filter-drawer__chip"
                                onClick={() => handleRemoveChip(chip)}
                                aria-label={`Remove ${chip.displayLabel} filter`}
                            >
                                {chip.sectionLabel ? (
                                    <span className="jad-all-jobs-filter-drawer__chip-text">
                                        <span className="jad-all-jobs-filter-drawer__chip-section">{chip.sectionLabel}</span>
                                        <span className="jad-all-jobs-filter-drawer__chip-value">{chip.label}</span>
                                    </span>
                                ) : (
                                    <span className="jad-all-jobs-filter-drawer__chip-label">{chip.label}</span>
                                )}
                                <CloseIcon width={12} height={12} />
                            </button>
                        ))}
                    </div>
                ) : null}

                <div className={`jad-all-jobs-filter-drawer__body${masterLoader ? ' is-loading' : ''}`}>
                    <OppTabFilters
                        layout="accordion"
                        selectedFilters={selectedFilters}
                        setSelectedFilters={setSelectedFilters}
                        masterLoader={masterLoader}
                        rangeInput={rangeInput}
                        setRangeInput={setRangeInput}
                        subMaster={subMaster}
                        setSubMaster={setSubMaster}
                    />
                </div>

                <footer className="jad-all-jobs-filter-drawer__foot">
                    <button
                        type="button"
                        className="jad-all-jobs-filter-drawer__btn jad-all-jobs-filter-drawer__btn--primary"
                        onClick={onApply}
                    >
                        Show results
                    </button>
                </footer>
            </aside>
        </div>,
        document.body,
    );
}
