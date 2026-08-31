'use client';

import React, { useMemo } from 'react';
import {
    formatJourneyStatusLabel,
    getJourneyStatusSlug,
    INTERVIEWS_PER_WEEK_OPTIONS,
    USER_JOURNEY_STATUS_SLUGS,
} from '../jobAgentUserJourney.utils';

const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
        <path
            d="M2.5 6.5L5.5 9.5L10.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const ReplyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.13281 5.16504L2.13574 5.36621C2.1755 6.36713 2.59097 7.31948 3.30273 8.03125C4.0616 8.7901 5.09391 9.21013 6.16699 9.19922V9.2002H11.8125L9.00488 12.0264L8.91602 12.1357C8.73672 12.4073 8.76598 12.7764 9.00488 13.0156C9.27808 13.2885 9.72082 13.2883 9.99414 13.0156H9.99512L13.9951 9.01562L13.9961 9.01367C14.0586 8.94973 14.1076 8.87426 14.1426 8.79199L14.1436 8.79297C14.2187 8.61908 14.2188 8.42192 14.1436 8.24805H14.1426C14.1076 8.1662 14.0583 8.09101 13.9961 8.02734L9.97949 4.01074L9.96191 3.99902C9.6912 3.82372 9.33521 3.85678 9.10059 4.07812C8.86626 4.29953 8.8134 4.65229 8.97266 4.93262L8.98633 4.95605L9.00488 4.97461L11.8125 7.80078H6.16504C5.46512 7.80746 4.79182 7.53204 4.29688 7.03711C3.80193 6.54216 3.52652 5.86887 3.5332 5.16895V3.83105C3.52803 3.44816 3.21887 3.13881 2.83594 3.13379H2.83105C2.44811 3.1388 2.13897 3.44815 2.13379 3.83105L2.13281 3.83398V5.16504Z" fill="#086D7E" stroke="#086D7E" stroke-width="0.4" />
    </svg>
);

function MultiSelectPills({ options = [], selectedValues = [], onToggle }) {
    const selectedSet = useMemo(() => new Set(selectedValues.map(String)), [selectedValues]);

    return (
        <div className="jad-journey__pills">
            {options.map((option) => {
                const isSelected = selectedSet.has(String(option.value));
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`jad-journey__pill${isSelected ? ' jad-journey__pill--selected' : ''}`}
                        onClick={() => onToggle(option.value)}
                        aria-pressed={isSelected}
                    >
                        {isSelected && <CheckIcon />}
                        <span>{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

function SegmentedControl({ options = [], value, onChange }) {
    return (
        <div className="jad-journey__segmented" role="group">
            {options.map((option) => {
                const isSelected = String(value) === String(option.value);
                return (
                    <button
                        key={option.value}
                        type="button"
                        className={`jad-journey__segment${isSelected ? ' jad-journey__segment--selected' : ''}`}
                        onClick={() => onChange(option.value)}
                        aria-pressed={isSelected}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

function Stepper({ value = 0, min = 0, max = 50, onChange }) {
    const numericValue = Number(value) || 0;

    return (
        <div className="jad-journey__stepper-row">
            <div className="jad-journey__stepper">
                <button
                    type="button"
                    className="jad-journey__stepper-btn"
                    onClick={() => onChange(Math.max(min, numericValue - 1))}
                    disabled={numericValue <= min}
                    aria-label="Decrease"
                >
                    −
                </button>
                <span className="jad-journey__stepper-value">{numericValue}</span>
                <button
                    type="button"
                    className="jad-journey__stepper-btn jad-journey__stepper-btn--plus"
                    onClick={() => onChange(Math.min(max, numericValue + 1))}
                    disabled={numericValue >= max}
                    aria-label="Increase"
                >
                    +
                </button>
            </div>
            <span className="jad-journey__stepper-suffix">per day</span>
        </div>
    );
}

export default function JobAgentJobJourneyStatusField({
    value,
    onChange,
    statusMaster = [],
    motivationsMaster = [],
    jobBoardsMaster = [],
    offerConcernsMaster = [],
    layoffMaster = [],
    error,
}) {
    const activeSlug = getJourneyStatusSlug(value?.status, statusMaster);
    const activeStatusLabel = activeSlug ? formatJourneyStatusLabel(activeSlug) : '';

    const updateJourney = (patch) => {
        onChange({ ...value, ...patch });
    };

    const updateStatusSection = (sectionKey, sectionPatch) => {
        onChange({
            ...value,
            [sectionKey]: {
                ...value?.[sectionKey],
                ...sectionPatch,
            },
        });
    };

    const toggleMultiValue = (sectionKey, fieldKey, itemValue) => {
        const current = value?.[sectionKey]?.[fieldKey] || [];
        const exists = current.some((entry) => String(entry) === String(itemValue));
        const next = exists
            ? current.filter((entry) => String(entry) !== String(itemValue))
            : [...current, itemValue];
        updateStatusSection(sectionKey, { [fieldKey]: next });
    };

    const renderFollowUp = () => {
        if (!activeSlug) return null;

        let content = null;

        if (activeSlug === USER_JOURNEY_STATUS_SLUGS.JUST_EXPLORING) {
            content = (
                <>
                    <p className="jad-journey__question">What would make you move?</p>
                    <MultiSelectPills
                        options={motivationsMaster}
                        selectedValues={value?.just_exploring?.motivations}
                        onToggle={(itemValue) =>
                            toggleMultiValue('just_exploring', 'motivations', itemValue)
                        }
                    />
                </>
            );
        } else if (activeSlug === USER_JOURNEY_STATUS_SLUGS.ACTIVELY_APPLYING) {
            content = (
                <>
                    <p className="jad-journey__question">How many jobs do you apply to per day?</p>
                    <Stepper
                        value={value?.actively_applying?.applications_per_day ?? 1}
                        min={0}
                        max={50}
                        onChange={(next) =>
                            updateStatusSection('actively_applying', { applications_per_day: next })
                        }
                    />
                    <p className="jad-journey__question">Which job boards are you using</p>
                    <MultiSelectPills
                        options={jobBoardsMaster}
                        selectedValues={value?.actively_applying?.job_boards}
                        onToggle={(itemValue) =>
                            toggleMultiValue('actively_applying', 'job_boards', itemValue)
                        }
                    />
                </>
            );
        } else if (activeSlug === USER_JOURNEY_STATUS_SLUGS.INTERVIEWING) {
            content = (
                <>
                    <p className="jad-journey__question">How many interviews are you getting per week?</p>
                    <SegmentedControl
                        options={INTERVIEWS_PER_WEEK_OPTIONS}
                        value={value?.interviewing?.interviews_per_week}
                        onChange={(next) =>
                            updateStatusSection('interviewing', { interviews_per_week: next })
                        }
                    />
                </>
            );
        } else if (activeSlug === USER_JOURNEY_STATUS_SLUGS.HAVE_AN_OFFER) {
            content = (
                <>
                    <p className="jad-journey__question">What&apos;s holding you back on the current offer?</p>
                    <MultiSelectPills
                        options={offerConcernsMaster}
                        selectedValues={value?.have_an_offer?.offer_concerns}
                        onToggle={(itemValue) =>
                            toggleMultiValue('have_an_offer', 'offer_concerns', itemValue)
                        }
                    />
                </>
            );
        } else if (activeSlug === USER_JOURNEY_STATUS_SLUGS.LAID_OFF) {
            content = (
                <>
                    <p className="jad-journey__question">
                        How many days since you were laid off / started notice?
                    </p>
                    <SegmentedControl
                        options={layoffMaster}
                        value={value?.laid_off?.days_since_layoff}
                        onChange={(next) =>
                            updateStatusSection('laid_off', { days_since_layoff: next })
                        }
                    />
                </>
            );
        }

        return (
            <div className="jad-journey__follow-up">
                <div className="jad-journey__follow-up-header">
                    <ReplyIcon />
                    <p>
                        A couple of things, since you&apos;re {activeStatusLabel.toLowerCase()}
                    </p>
                </div>
                <div className="jad-journey__follow-up-body">{content}</div>
            </div>
        );
    };

    return (
        <div className={`jad-journey${error ? ' jad-journey--error' : ''}`}>
            <h4 className="jad-journey__title">Where you&apos;re at right now</h4>

            <div className="jad-journey__status-row">
                {statusMaster.map((option) => {
                    const isSelected = String(value?.status) === String(option.value);
                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`jad-journey__status${isSelected ? ' jad-journey__status--selected' : ''}`}
                            onClick={() => updateJourney({ status: option.value })}
                            aria-pressed={isSelected}
                        >
                            {formatJourneyStatusLabel(option.label)}
                        </button>
                    );
                })}
            </div>

            {renderFollowUp()}

            {error && <div className="error-msg">{error}</div>}
        </div>
    );
}
