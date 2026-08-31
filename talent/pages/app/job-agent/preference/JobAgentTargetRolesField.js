'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const flattenGroupedOptions = (groupedOptions = []) =>
    groupedOptions.flatMap((group) => group.options || []);

export default function JobAgentTargetRolesField({
    value = [],
    options = [],
    maxSelection = 3,
    onChange,
    error,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);
    const addBtnRef = useRef(null);
    const searchInputRef = useRef(null);

    const allOptions = useMemo(() => flattenGroupedOptions(options), [options]);
    const totalCount = allOptions.length;
    const selectedCount = value?.length || 0;
    const atMax = selectedCount >= maxSelection;

    const selectedIds = useMemo(
        () => new Set((value || []).map((item) => item.value)),
        [value]
    );

    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return options;

        return options
            .map((group) => ({
                ...group,
                options: (group.options || []).filter((option) =>
                    option.label.toLowerCase().includes(query)
                ),
            }))
            .filter((group) => group.options?.length > 0);
    }, [options, search]);

    const hasVisibleOptions = filteredGroups.some((group) => group.options?.length > 0);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            const target = event.target;
            const clickedInsideDropdown = dropdownRef.current?.contains(target);
            const clickedAddBtn = addBtnRef.current?.contains(target);

            if (!clickedInsideDropdown && !clickedAddBtn) {
                setIsOpen(false);
                setSearch('');
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const toggleDropdown = () => {
        setIsOpen((open) => !open);
        if (isOpen) setSearch('');
    };

    const handleToggleOption = (option) => {
        const isSelected = selectedIds.has(option.value);
        if (isSelected) {
            onChange((value || []).filter((item) => item.value !== option.value));
            return;
        }
        if (atMax) return;
        onChange([...(value || []), option]);
    };

    const handleRemove = (option) => {
        onChange((value || []).filter((item) => item.value !== option.value));
    };

    const renderOption = (option) => {
        const isSelected = selectedIds.has(option.value);
        const isDisabled = !isSelected && atMax;

        return (
            <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={isDisabled}
                className={`jad-target-roles__option${isSelected ? ' jad-target-roles__option--selected' : ''}${isDisabled ? ' jad-target-roles__option--disabled' : ''}`}
                onClick={() => handleToggleOption(option)}
            >
                <span className="jad-target-roles__option-check" aria-hidden="true">
                    {isSelected && '✓'}
                </span>
                <span className="jad-target-roles__option-label">{option.label}</span>
            </button>
        );
    };

    return (
        <div className={`jad-target-roles${error ? ' jad-target-roles--error' : ''}`}>
            <div className="jad-target-roles__header">
                <h4 className="jad-target-roles__title">Target roles</h4>
                <span className="jad-target-roles__badge">
                    <span className="jad-target-roles__badge-check" aria-hidden="true">✓</span>
                    up to {maxSelection}
                </span>
            </div>

            <div className="jad-target-roles__body">
                <div className="jad-target-roles__chips-row">
                    <button
                        type="button"
                        ref={addBtnRef}
                        className="jad-target-roles__add-btn"
                        onClick={toggleDropdown}
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M8 3.5V12.5M3.5 8H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Add role
                    </button>

                    {(value || []).map((role) => (
                        <span className="jad-target-roles__chip" key={role.value}>
                            <span className="jad-target-roles__chip-label">{role.label}</span>
                            <button
                                type="button"
                                className="jad-target-roles__chip-remove"
                                onClick={() => handleRemove(role)}
                                aria-label={`Remove ${role.label}`}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>

                {isOpen && (
                    <div
                        ref={dropdownRef}
                        className="jad-target-roles__dropdown"
                        role="listbox"
                        aria-multiselectable="true"
                    >
                        <div className="jad-target-roles__search">
                            <div className="jad-target-roles__search-field">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                    <circle cx="6.25" cy="6.25" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                                    <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                                </svg>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Type to add a role..."
                                    aria-label="Search roles"
                                />
                            </div>
                            <span className="jad-target-roles__search-count">{selectedCount} added</span>
                        </div>

                        <div className="jad-target-roles__options-scroll">
                            {filteredGroups.map((group) => (
                                <div className="jad-target-roles__group" key={group.label}>
                                    <div className="jad-target-roles__group-heading">
                                        <span className="jad-target-roles__group-label">{group.label}</span>
                                        <span className="jad-target-roles__group-count">{group.options.length}</span>
                                    </div>
                                    <div className="jad-target-roles__grid">
                                        {group.options.map((option) => renderOption(option))}
                                    </div>
                                </div>
                            ))}
                            {!hasVisibleOptions && (
                                <p className="jad-target-roles__empty">No roles match your search.</p>
                            )}
                        </div>
                    </div>
                )}

                <p className="jad-target-roles__meta">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 6.2V9.8M7 4.6V4.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {selectedCount} of {maxSelection} selected · pick from {totalCount} functions
                </p>
            </div>

            {error && <div className="error-msg">{error}</div>}
        </div>
    );
}
