'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const MAX_PREFERRED_CITIES = 5;

export default function JobAgentWorkLocationField({
    currentLocation,
    onCurrentLocationChange,
    onCurrentLocationSearch,
    preferredCities = [],
    onPreferredCitiesChange,
    onPreferredLocationSearch,
    preferredMethods = [],
    methodOptions = [],
    onPreferredMethodsChange,
    locationOptions = [],
    locationLoadingType = null,
    errors = {},
    /** GTM slim prefs: preferred cities only, no current location / work method. */
    preferredCitiesOnly = false,
    /** Preferred cities + work method, without current location (Happpy GTM prefs). */
    hideCurrentLocation = false,
}) {
    const [openPanel, setOpenPanel] = useState(null);
    const [currentSearch, setCurrentSearch] = useState('');
    const [preferredSearch, setPreferredSearch] = useState('');

    const currentFieldRef = useRef(null);
    const preferredFieldRef = useRef(null);

    const selectedCityIds = useMemo(
        () => new Set(preferredCities.map((city) => city.value)),
        [preferredCities]
    );

    const selectedMethodValues = useMemo(
        () => new Set(
            preferredMethods
                .filter((method) => method?.value && method.value !== 'None')
                .map((method) => method.value)
        ),
        [preferredMethods]
    );

    const visibleMethodOptions = useMemo(
        () => methodOptions.filter((option) => option.value !== 'None'),
        [methodOptions]
    );

    const preferredCityCount = preferredCities.length;
    const atMaxCities = preferredCityCount >= MAX_PREFERRED_CITIES;

    const availablePreferredOptions = useMemo(
        () => locationOptions.filter((option) => !selectedCityIds.has(option.value)),
        [locationOptions, selectedCityIds]
    );

    useEffect(() => {
        if (!openPanel) return undefined;

        const handlePointerDown = (event) => {
            const target = event.target;
            const inCurrent = currentFieldRef.current?.contains(target);
            const inPreferred = preferredFieldRef.current?.contains(target);

            if (!inCurrent && !inPreferred) {
                setOpenPanel(null);
                setCurrentSearch('');
                setPreferredSearch('');
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [openPanel]);

    const closePanels = () => {
        setOpenPanel(null);
        setCurrentSearch('');
        setPreferredSearch('');
    };

    const handleCurrentSearchChange = (event) => {
        const value = event.target.value;
        setCurrentSearch(value);
        setOpenPanel('current');
        onCurrentLocationSearch?.(value);
    };

    const handlePreferredSearchChange = (event) => {
        const value = event.target.value;
        setPreferredSearch(value);
        setOpenPanel('preferred');
        onPreferredLocationSearch?.(value);
    };

    const handleSelectCurrent = (option) => {
        onCurrentLocationChange?.(option);
        closePanels();
    };

    const handleSelectPreferred = (option) => {
        if (selectedCityIds.has(option.value) || atMaxCities) {
            closePanels();
            return;
        }
        onPreferredCitiesChange?.([...preferredCities, option]);
        closePanels();
    };

    const removePreferredCity = (option) => {
        onPreferredCitiesChange?.(preferredCities.filter((city) => city.value !== option.value));
    };

    const toggleMethod = (option) => {
        if (selectedMethodValues.has(option.value)) {
            return;
        }
        onPreferredMethodsChange?.([option]);
    };

    const renderLocationOption = (option, onSelect, panelType) => (
        <button
            key={`${panelType}-${option.value}`}
            type="button"
            className="jad-work-location__location-option"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(option)}
        >
            <span className="jad-work-location__location-label">{option.label}</span>
        </button>
    );

    const isCurrentLoading = locationLoadingType === 'current_location';
    const isPreferredLoading = locationLoadingType === 'preferred_cities';

    const showErrorState = preferredCitiesOnly
        ? !!errors.preferred_cities
        : hideCurrentLocation
            ? !!(errors.preferred_cities || errors.preferred_method)
            : !!(errors.current_location || errors.preferred_cities || errors.preferred_method);

    return (
        <div className={`jad-work-location${showErrorState ? ' jad-work-location--error' : ''}`}>
            <h4 className="jad-work-location__title">
                {preferredCitiesOnly ? "Preferred location" : "Where & how you'll work"}
            </h4>

            {!preferredCitiesOnly && !hideCurrentLocation && (
            <div className="jad-work-location__current" ref={currentFieldRef}>
                <p className="jad-work-location__field-label required_label">Current location</p>
                <button
                    type="button"
                    className={`jad-work-location__current-trigger${openPanel === 'current' ? ' jad-work-location__current-trigger--open' : ''}`}
                    onClick={() => setOpenPanel((panel) => (panel === 'current' ? null : 'current'))}
                    aria-expanded={openPanel === 'current'}
                >
                    <div className="jad-work-location__current-value">
                        <span className="jad-work-location__current-label">
                            {currentLocation?.label || 'Search location'}
                        </span>
                        {currentLocation?.label && (
                            <span className="jad-work-location__current-badge">Current</span>
                        )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {openPanel === 'current' && (
                    <div className="jad-work-location__current-dropdown">
                        <div className="jad-work-location__search">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <circle cx="6.25" cy="6.25" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                value={currentSearch}
                                onChange={handleCurrentSearchChange}
                                placeholder="Search location"
                                aria-label="Search current location"
                                autoFocus
                            />
                        </div>
                        <div className="jad-work-location__current-options">
                            {isCurrentLoading ? (
                                <p className="jad-work-location__empty">Searching…</p>
                            ) : locationOptions.length > 0 ? (
                                locationOptions.map((option) => renderLocationOption(option, handleSelectCurrent, 'current'))
                            ) : (
                                <p className="jad-work-location__empty">
                                    {currentSearch ? 'No city found' : 'Please type your city name'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {errors.current_location && <div className="error-msg">{errors.current_location}</div>}
            </div>
            )}

            <div className="jad-work-location__current" ref={preferredFieldRef}>
                <p className={`jad-work-location__field-label${preferredCitiesOnly ? '' : ' required_label'}`}>
                    {preferredCitiesOnly ? 'Add up to 5 cities' : 'Preferred location'}
                </p>
                <button
                    type="button"
                    disabled={atMaxCities}
                    className={`jad-work-location__current-trigger${openPanel === 'preferred' ? ' jad-work-location__current-trigger--open' : ''}${atMaxCities ? ' jad-work-location__current-trigger--disabled' : ''}`}
                    onClick={() => {
                        if (atMaxCities) return;
                        setOpenPanel((panel) => (panel === 'preferred' ? null : 'preferred'));
                    }}
                    aria-expanded={openPanel === 'preferred'}
                >
                    <div className="jad-work-location__current-value">
                        <span className="jad-work-location__current-label">
                            {atMaxCities ? `Up to ${MAX_PREFERRED_CITIES} locations added` : 'Search location'}
                        </span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {openPanel === 'preferred' && (
                    <div className="jad-work-location__current-dropdown">
                        <div className="jad-work-location__search">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                <circle cx="6.25" cy="6.25" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                value={preferredSearch}
                                onChange={handlePreferredSearchChange}
                                placeholder="Search location"
                                aria-label="Search preferred location"
                                autoFocus
                            />
                        </div>
                        <div className="jad-work-location__current-options">
                            {isPreferredLoading ? (
                                <p className="jad-work-location__empty">Searching…</p>
                            ) : availablePreferredOptions.length > 0 ? (
                                availablePreferredOptions.map((option) => renderLocationOption(option, handleSelectPreferred, 'preferred'))
                            ) : (
                                <p className="jad-work-location__empty">
                                    {preferredSearch ? 'No city found' : 'Please type your city name'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
                {preferredCities.length > 0 && (
                    <div className="jad-work-location__chips-row jad-work-location__preferred-chips">
                        {preferredCities.map((city) => (
                            <span className="jad-work-location__chip" key={city.value}>
                                <span className="jad-work-location__chip-label">{city.label}</span>
                                <button
                                    type="button"
                                    className="jad-work-location__chip-remove"
                                    onClick={() => removePreferredCity(city)}
                                    aria-label={`Remove ${city.label}`}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {errors.preferred_cities && <div className="error-msg">{errors.preferred_cities}</div>}
            </div>

            {!preferredCitiesOnly && (
            <div className="jad-work-location__open-to">
                <p className="jad-work-location__open-to-label">Open to</p>
                <div className="jad-work-location__chips-row">
                    {visibleMethodOptions.map((option) => {
                        const isSelected = selectedMethodValues.has(option.value);
                        return (
                            <button
                                key={option.value}
                                type="button"
                                className={`jad-work-location__method-chip${isSelected ? ' jad-work-location__method-chip--selected' : ''}`}
                                onClick={() => toggleMethod(option)}
                                aria-pressed={isSelected}
                            >
                                <span>{option.label}</span>
                                {isSelected && (
                                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                                        <path
                                            d="M2.5 6.5L5.5 9.5L10.5 3.5"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>

                {errors.preferred_method && (
                    <div className="error-msg">
                        {errors.preferred_method}
                    </div>
                )}
            </div>
            )}
        </div>
    );
}

export { MAX_PREFERRED_CITIES };
