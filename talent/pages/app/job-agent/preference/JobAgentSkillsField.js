'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function JobAgentSkillsField({
    value = [],
    options = [],
    maxSelection = 7,
    onSearch,
    onAdd,
    onRemove,
    isLoading = false,
    hasDefaultOptions = true,
    error,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const fieldRef = useRef(null);
    const inputRef = useRef(null);

    const selectedCount = value?.length || 0;
    const atMax = selectedCount >= maxSelection;
    const trimmedSearch = search.trim();
    const showDropdown = isOpen && (trimmedSearch.length >= 2 || options.length > 0);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (fieldRef.current && !fieldRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    const handleSearchChange = (event) => {
        const next = event.target.value;
        setSearch(next);
        setIsOpen(true);
        onSearch?.(next);
    };

    const handleAdd = (option) => {
        if (!option || atMax) return;
        onAdd?.(option);
        setSearch('');
        onSearch?.('');
        inputRef.current?.focus();
    };

    const getEmptyMessage = () => {
        if (isLoading) return 'Loading skills…';
        if (trimmedSearch.length >= 2) return 'No skills found';
        if (!hasDefaultOptions) return 'No skills available';
        return null;
    };

    const emptyMessage = getEmptyMessage();

    return (
        <div className={`jad-agent-skills${error ? ' jad-agent-skills--error' : ''}`}>
            <div
                ref={fieldRef}
                className={`jad-agent-skills__field${isFocused || isOpen ? ' jad-agent-skills__field--focused' : ''}`}
            >
                <div
                    className="jad-agent-skills__search"
                    onClick={() => inputRef.current?.focus()}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="7.25" cy="7.25" r="5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        onFocus={() => {
                            setIsFocused(true);
                            setIsOpen(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Type to add a skill..."
                        aria-label="Search skills"
                    />
                    <span className="jad-agent-skills__count">{selectedCount} added</span>
                </div>

                {showDropdown && (
                    <div className="jad-agent-skills__dropdown" role="listbox">
                        {options.length > 0 ? (
                            options.map((option, index) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="option"
                                    disabled={atMax}
                                    className={`jad-agent-skills__suggestion${index === 0 ? ' jad-agent-skills__suggestion--highlighted' : ''}${atMax ? ' jad-agent-skills__suggestion--disabled' : ''}`}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleAdd(option)}
                                >
                                    <span className="jad-agent-skills__suggestion-label">{option.label}</span>
                                    <span className="jad-agent-skills__suggestion-add">
                                        {index === 0 ? (
                                            <>
                                                <span aria-hidden="true">+</span> Add
                                            </>
                                        ) : (
                                            <span aria-hidden="true">+</span>
                                        )}
                                    </span>
                                </button>
                            ))
                        ) : (
                            emptyMessage && (
                                <p className="jad-agent-skills__empty">{emptyMessage}</p>
                            )
                        )}
                    </div>
                )}
            </div>

            <p className="jad-agent-skills__hint">
                Type-ahead with resume detection + role-based suggestions. No more hunting for the exact tag.
            </p>

            {selectedCount > 0 && (
                <div className="jad-skill-chips">
                    {value.map((skill, index) => (
                        <span className="jad-skill-chip" key={`agent-skill-${skill.value}-${index}`}>
                            <span className="jad-skill-chip__label">{skill.label}</span>
                            <button
                                type="button"
                                className="jad-skill-chip__remove"
                                onClick={() => onRemove?.(skill)}
                                aria-label={`Remove ${skill.label}`}
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                    <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {error && <div className="error-msg">{error}</div>}
        </div>
    );
}
