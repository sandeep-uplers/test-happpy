import React from 'react';

function MatIcon({ name, className = '' }) {
    return (
        <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden>
            {name}
        </span>
    );
}

/**
 * Page-level company/role search for Job Referral Activity.
 * Controlled by the parent; filters apply to whichever tab is active.
 */
export default function ActivityGlobalSearch({ value, onChange, onClear, isActive = false }) {
    return (
        <div
            className={`aa-act__search-group aa-shell__search${isActive ? ' aa-act__search-group--active' : ''}`}
            role="search"
            aria-label={isActive ? 'Search company or role — filtering results' : 'Search company or role'}
        >
            <label className="aa-act__search-wrap">
                <span className="aa-act__sr-only">
                    {isActive ? 'Search company or role — filtering results' : 'Search company or role'}
                </span>
                <MatIcon name="search" className="aa-act__search-icon" />
                <input
                    type="text"
                    className="aa-act__search-input"
                    placeholder="Company or role…"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                    aria-label={isActive ? 'Search company or role — filtering results' : 'Search company or role'}
                />
                {value.trim() ? (
                    <button
                        type="button"
                        className="aa-act__search-clear"
                        onClick={onClear}
                        aria-label="Clear search"
                    >
                        <MatIcon name="close" className="aa-act__search-clear-icon" />
                    </button>
                ) : null}
            </label>
        </div>
    );
}
