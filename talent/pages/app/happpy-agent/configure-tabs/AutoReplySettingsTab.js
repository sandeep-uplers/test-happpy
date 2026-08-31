'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { GET_API, POST_API } from '../../../../components/Helper';
import { API_URL } from '../../../../components/Constant';
import { GmailIcon } from '../../../../assets/IconSVG';
/**
 * Auto Reply Settings tab — Configure Happpy Agent email auto-replies.
 *
 * API:
 *   GET  /talent/outreach/get-auto-reply
 *   POST /talent/outreach/update-auto-reply
 *     body: { hours: 1–12, handle_auto_reply: boolean, auto_reply_categories: string[] }
 *
 * Categories mirror TalentOutreachBilling::selectableAutoReplyCategories() /
 * ReplyService::getValidCategories() — kinds of recruiter ask the agent may answer.
 */

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return { value: h, label: h === 1 ? 'After 1 hour' : `After ${h} hours` };
});

/** User-facing options for categories the agent auto-replies to (excludes "other"). */
const AUTO_REPLY_CATEGORIES = [
    {
        id: 'asking_talent_info',
        title: 'Talent details',
        hint: 'Salary/CTC, location, relocation, notice period, experience, skills, phone, and other profile details.',
    },
    {
        id: 'asking_email_source',
        title: 'Email source',
        hint: 'How or where you got the recruiter’s email / contact.',
    },
    {
        id: 'direct_apply',
        title: 'Application next step',
        hint: 'Apply via referral link, careers page, ATS, portal, or complete the application step.',
    },
    {
        id: 'asking_resume',
        title: 'Resume / CV',
        hint: 'Sharing or attaching your CV / updated resume.',
    },
    {
        id: 'asking_job_details',
        title: 'Job details',
        hint: 'Job ID, requisition ID, posting link, position code, or role name.',
    },
    {
        id: 'asking_to_connect',
        title: 'Connect further',
        hint: 'LinkedIn connect, join a call/meeting, or continue on another channel.',
    },
    {
        id: 'asking_confirmation',
        title: 'Confirmations',
        hint: 'Confirm interest, fitment, receipt of email, work conditions, or similar.',
    },
    {
        id: 'complete_assessment',
        title: 'Assessments',
        hint: 'Complete an assignment, screening test, or assessment questions.',
    },
];

const ALL_CATEGORY_IDS = AUTO_REPLY_CATEGORIES.map((c) => c.id);

const DEFAULT_SETTINGS = {
    handle_auto_reply: false,
    hours: 2,
    auto_reply_categories: [...ALL_CATEGORY_IDS],
};

const clampHours = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 1) return 2;
    if (n > 12) return 12;
    return Math.round(n);
};

const normalizeCategories = (raw) => {
    if (!Array.isArray(raw)) return [...ALL_CATEGORY_IDS];
    return ALL_CATEGORY_IDS.filter((id) => raw.includes(id));
};

/* -------------------------------------------------------------------------- */
/* Inline icons                                                                */
/* -------------------------------------------------------------------------- */

const StepperChevrons = ({ muted }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5 6.5l3-3 3 3" stroke={muted ? 'rgba(107,107,107,0.6)' : '#231f20'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5l3 3 3-3" stroke={muted ? 'rgba(107,107,107,0.6)' : '#231f20'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* -------------------------------------------------------------------------- */
/* AutoReplySettingsTab                                                        */
/* -------------------------------------------------------------------------- */

const AutoReplySettingsTab = () => {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await GET_API(`${API_URL}talent/outreach/get-auto-reply`);
            if (res?.data?.status === 200 && res?.data?.data) {
                const d = res.data.data;
                if (!mountedRef.current) return;
                setSettings({
                    handle_auto_reply: Boolean(d.handle_auto_reply),
                    hours: clampHours(d.hours ?? DEFAULT_SETTINGS.hours),
                    auto_reply_categories: normalizeCategories(d.auto_reply_categories),
                });
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to load auto-reply settings');
        } finally {
            if (mountedRef.current) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleToggle = (checked) => {
        if (checked && settings.auto_reply_categories.length === 0) {
            toast.error('Select at least one category to enable auto-reply');
            return;
        }
        setSettings((p) => ({ ...p, handle_auto_reply: checked }));
    };

    const handleHoursChange = (hours) => {
        setSettings((p) => ({ ...p, hours: clampHours(hours) }));
    };

    const handleCategoryToggle = (categoryId, checked) => {
        if (
            !checked
            && settings.handle_auto_reply
            && settings.auto_reply_categories.length === 1
            && settings.auto_reply_categories[0] === categoryId
        ) {
            toast.error('Select at least one category to keep auto-reply enabled');
            return;
        }
        setSettings((p) => {
            const set = new Set(p.auto_reply_categories);
            if (checked) set.add(categoryId);
            else set.delete(categoryId);
            return {
                ...p,
                auto_reply_categories: ALL_CATEGORY_IDS.filter((id) => set.has(id)),
            };
        });
    };

    const handleSave = async () => {
        if (settings.handle_auto_reply && settings.auto_reply_categories.length === 0) {
            toast.error('Select at least one category to enable auto-reply');
            return;
        }
        setIsSaving(true);
        try {
            const res = await POST_API(`${API_URL}talent/outreach/update-auto-reply`, {
                hours: clampHours(settings.hours),
                handle_auto_reply: Boolean(settings.handle_auto_reply),
                auto_reply_categories: settings.auto_reply_categories,
            });
            if (res?.data?.status === 200) {
                toast.success('Auto-reply settings saved');
            } else {
                toast.error(res?.data?.message || 'Failed to save');
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to save');
        } finally {
            if (mountedRef.current) setIsSaving(false);
        }
    };

    const enabled = settings.handle_auto_reply;
    const fieldsDisabled = !enabled;

    return (
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">
                Configure automatic email replies from your Happpy Agent
            </p>

            {isLoading ? (
                <div className="hc-loading">
                    <span className="hc-loading__spinner" />
                    Loading auto-reply settings…
                </div>
            ) : (
                <>
                    <section className={`hc-ar-card${!enabled ? ' hc-ar-card--off' : ''}`}>
                        <header className="hc-ar-card__head">
                            <span className="hc-ar-card__title">
                                <span className="hc-ar-card__title-icon"><GmailIcon /></span>
                                Email Auto-replies
                            </span>
                        </header>

                        <div className="hc-ar-card__body">
                            <label className="hc-ar-check">
                                <input
                                    type="checkbox"
                                    className="hc-ar-check__input"
                                    checked={enabled}
                                    onChange={(e) => handleToggle(e.target.checked)}
                                />
                                <span className="hc-ar-check__box" aria-hidden="true" />
                                <span className="hc-ar-check__label">
                                    Let agent handle the auto replies for email
                                </span>
                            </label>

                            <div className={`hc-ar-card__field${fieldsDisabled ? ' hc-ar-card__field--disabled' : ''}`}>
                                <label className="hc-ar-card__label" htmlFor="hc-ar-hours">
                                    After hours agent in action
                                </label>
                                <label className={`hc-fu-stepper${fieldsDisabled ? ' hc-fu-stepper--disabled' : ''}`}>
                                    <select
                                        id="hc-ar-hours"
                                        className="hc-fu-stepper__select"
                                        value={settings.hours}
                                        onChange={(e) => handleHoursChange(Number(e.target.value))}
                                        disabled={fieldsDisabled}
                                    >
                                        {HOUR_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <StepperChevrons muted={fieldsDisabled} />
                                </label>
                                <p className="hc-ar-card__hint">
                                    Wait this many hours after a recruiter message before the agent drafts and sends a reply.
                                </p>
                            </div>

                            <div className={`hc-ar-categories${fieldsDisabled ? ' hc-ar-categories--disabled' : ''}`}>
                                <p className="hc-ar-categories__title">
                                    Agent will auto-reply when recruiters ask for
                                </p>
                                <ul className="hc-ar-categories__list" role="group" aria-label="Auto-reply categories">
                                    {AUTO_REPLY_CATEGORIES.map((cat) => {
                                        const checked = settings.auto_reply_categories.includes(cat.id);
                                        return (
                                            <li key={cat.id} className="hc-ar-categories__item">
                                                <label className={`hc-ar-check hc-ar-check--category${fieldsDisabled ? ' hc-ar-check--disabled' : ''}`}>
                                                    <input
                                                        type="checkbox"
                                                        className="hc-ar-check__input"
                                                        checked={checked}
                                                        disabled={fieldsDisabled}
                                                        onChange={(e) => handleCategoryToggle(cat.id, e.target.checked)}
                                                    />
                                                    <span className="hc-ar-check__box" aria-hidden="true" />
                                                    <span className="hc-ar-categories__item-text">
                                                        <span className="hc-ar-categories__item-title">{cat.title}</span>
                                                        <span className="hc-ar-categories__item-hint">{cat.hint}</span>
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <div className="hc-footer">
                        <button
                            type="button"
                            className="hc-save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving && <span className="hc-save-btn__spinner" />}
                            {isSaving ? 'Saving…' : 'Save Auto-reply Settings'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default AutoReplySettingsTab;
