'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
    fetchHapppyAgentPlan,
    getOutreachTemplates,
    saveOutreachTemplate,
} from '../../../../store/actions/UserActions';
import { GmailIcon } from '../../../../assets/IconSVG';
import { API_OUTREACH_REWRITE_MESSAGE } from '../../../../components/Constant';
import { POST_API } from '../../../../components/Helper';
import TemplateEditor from '../../linkedin/TemplateEditor';

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const VAR_FIELDS = [
    '{{outreachEmployeeName}}',
    '{{jobTitle}}',
    '{{companyName}}',
    '{{jobLink}}',
];

/** templateType: 2 = Gmail, 1 = LinkedIn (matches OutreachConfigure / TemplateSelection convention) */
const GMAIL = 2;
const LINKEDIN = 1;

/** Same pending rule as HapppyDashboard.messageTemplatePending (happpyAgent.raw from Redux). */
function isMessageTemplatePending(happpyAgent) {
    if (!happpyAgent?.loaded) return false;
    const raw = happpyAgent.raw || {};
    const status2 = !!raw?.status?.step2;
    const hasGmail = !!raw?.step2?.gmail_template;
    const hasLinkedIn = !!raw?.step2?.linkedin_template;
    return !(status2 || (hasGmail && hasLinkedIn));
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

const LinkedInIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5" />
    </svg>
);

/** Radio button matching Figma — selected has filled inner dot, unselected is hollow. */
const RadioIcon = ({ selected }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="8" cy="8" r="7" stroke="#231f20" strokeWidth="1.5" fill="#ffffff" />
        {selected && <circle cx="8" cy="8" r="4" fill="#231f20" />}
    </svg>
);

const InfoIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="7" cy="7" r="6" stroke="#231f20" strokeWidth="1.2" />
        <path d="M7 6.2V10" stroke="#231f20" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="7" cy="4.3" r="0.7" fill="#231f20" />
    </svg>
);

const MatIcon = ({ name }) => (
    <span className="material-symbols-outlined" aria-hidden>
        {name}
    </span>
);

/* -------------------------------------------------------------------------- */
/* MessageTemplatesTab                                                         */
/* -------------------------------------------------------------------------- */

const MessageTemplatesTab = () => {
    const dispatch = useDispatch();
    const referralPlan = useSelector((state) => state.happpyAgent);
    const { user } = useSelector((state) => state.auth) || {};

    const [templateType, setTemplateType] = useState(GMAIL);

    /** Saved templates from server */
    const [templates, setTemplates] = useState({ linkedin_template: '', gmail_template: '' });
    /** Default (AI-generated) templates list per provider */
    const [defaultTemplates, setDefaultTemplates] = useState({ linkedin_template: [], gmail_template: [] });

    /** Index into availableDefaults, or 'scratch' for a blank editor */
    const [selectedPill, setSelectedPill] = useState(null);

    const [customTemplate, setCustomTemplate] = useState({ title: '', message_template: '', provider: GMAIL });
    const [customTemplateErrors, setCustomTemplateErrors] = useState({});
    const [templateAppliedAt, setTemplateAppliedAt] = useState(null);

    const [isFetchingTemplates, setIsFetchingTemplates] = useState(false);
    const [isFetchingDefaults, setIsFetchingDefaults] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isRewriting, setIsRewriting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const autoSaveAttemptedRef = useRef(false);

    const refreshOutreachStep = useCallback(() => {
        dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
    }, [dispatch]);

    /* ── Fetch saved templates ──────────────────────────────────────────── */
    const fetchTemplates = useCallback(() => {
        setIsFetchingTemplates(true);
        dispatch(getOutreachTemplates())
            .then((res) => {
                setTemplates(res?.data?.data || { linkedin_template: '', gmail_template: '' });
            })
            .catch(() => {
                toast.error('Failed to load your templates. Please try again.');
            })
            .finally(() => {
                setIsFetchingTemplates(false);
            });
    }, [dispatch]);

    /* ── Fetch default templates ────────────────────────────────────────── */
    const fetchDefaultTemplates = useCallback(() => {
        setIsFetchingDefaults(true);
        axios
            .get('/api/talent/outreach/default-auto-templates')
            .then((res) => {
                setDefaultTemplates(res?.data?.data || { linkedin_template: [], gmail_template: [] });
            })
            .catch(() => {
                /* non-critical — pills just won't show */
            })
            .finally(() => {
                setIsFetchingDefaults(false);
            });
    }, []);

    useEffect(() => {
        fetchTemplates();
        fetchDefaultTemplates();
    }, [fetchTemplates, fetchDefaultTemplates]);

    /** Visiting the tab counts as "reviewed": persist the Gmail default when pending. */
    useEffect(() => {
        if (isFetchingTemplates || isFetchingDefaults) return;
        if (autoSaveAttemptedRef.current) return;
        if (!isMessageTemplatePending(referralPlan)) return;
        if (!referralPlan?.gmail_connected) return;
        if (templates.gmail_template?.trim()) return;

        const firstDefault = defaultTemplates.gmail_template?.[0];
        const defaultMessage = firstDefault?.message_template?.trim();
        if (!defaultMessage) return;

        autoSaveAttemptedRef.current = true;

        const payload = {
            provider: GMAIL,
            message_template: firstDefault.message_template,
            message_subject: firstDefault.title || firstDefault.message_subject || '',
        };

        dispatch(saveOutreachTemplate(payload))
            .then((res) => {
                if (res?.data?.status !== 'success') return;
                refreshOutreachStep();
            })
            .catch(() => {
                autoSaveAttemptedRef.current = false;
            });
    }, [
        isFetchingTemplates,
        isFetchingDefaults,
        referralPlan,
        templates.gmail_template,
        defaultTemplates.gmail_template,
        dispatch,
        refreshOutreachStep,
    ]);

    /* ── Sync editor when provider or saved/default templates change ─────── */
    useEffect(() => {
        const templateKey = templateType === LINKEDIN ? 'linkedin_template' : 'gmail_template';
        const savedBody = (templateType === LINKEDIN ? templates.linkedin_template : templates.gmail_template) || '';
        const savedSubject = templateType === LINKEDIN ? (templates.linkedin_template_subject || '') : (templates.gmail_template_subject || '');
        const availableDefaults = defaultTemplates[templateKey] || [];
        const bodyEmpty = !savedBody.trim();

        if (bodyEmpty && availableDefaults.length > 0) {
            const first = availableDefaults[0];
            setSelectedPill(0);
            setCustomTemplate({
                title: first.title || first.message_subject || '',
                message_template: first.message_template || '',
                provider: templateType,
            });
        } else {
            setSelectedPill(bodyEmpty ? 'scratch' : 0);
            setCustomTemplate({
                title: savedSubject,
                message_template: savedBody,
                provider: templateType,
            });
        }
        setTemplateAppliedAt(new Date());
        setCustomTemplateErrors({});
        setErrorMessage(null);
    }, [templateType, templates, defaultTemplates]);

    /* ── Pill selection handlers ────────────────────────────────────────── */
    const handlePillSelect = (pill) => {
        const templateKey = templateType === LINKEDIN ? 'linkedin_template' : 'gmail_template';
        const availableDefaults = defaultTemplates[templateKey] || [];

        setSelectedPill(pill);
        setCustomTemplateErrors({});
        setErrorMessage(null);

        if (pill === 'scratch') {
            setCustomTemplate({ title: '', message_template: '', provider: templateType });
        } else {
            const tpl = availableDefaults[pill];
            setCustomTemplate({
                title: tpl?.title || tpl?.message_subject || '',
                message_template: tpl?.message_template || '',
                provider: templateType,
            });
        }
        setTemplateAppliedAt(new Date());
    };

    /* ── Editor change ──────────────────────────────────────────────────── */
    const handleChange = (name, value) => {
        setCustomTemplate((prev) => ({ ...prev, [name]: value }));
        setTemplateAppliedAt(new Date());
    };

    /* ── AI rewrite ───────────────────────────────────────────────────── */
    const handleRewriteMessage = () => {
        setIsRewriting(true);
        setErrorMessage(null);
        POST_API(API_OUTREACH_REWRITE_MESSAGE, { provider: templateType })
            .then((res) => {
                if (res.data?.status !== 'success' || !res.data?.data) {
                    const msg = res?.data?.message || 'Failed to rewrite message. Please try again.';
                    toast.error(msg);
                    setErrorMessage(msg);
                    return;
                }
                const { message, subject } = res.data.data;
                setCustomTemplate((prev) => ({
                    ...prev,
                    message_template: message || prev.message_template,
                    ...(templateType === GMAIL && subject ? { title: subject } : {}),
                }));
                setTemplateAppliedAt(new Date());
                setCustomTemplateErrors({});
                toast.success('Message rewritten successfully');
            })
            .catch(() => {
                toast.error('Failed to rewrite message. Please try again.');
                setErrorMessage('Failed to rewrite message. Please try again.');
            })
            .finally(() => {
                setIsRewriting(false);
            });
    };

    /* ── Validation ─────────────────────────────────────────────────────── */
    const validate = () => {
        const errors = {};
        if (!customTemplate.message_template) {
            errors.message_template = 'Template message is required';
        } else {
            const missing = VAR_FIELDS.filter((f) => !customTemplate.message_template.includes(f));
            if (missing.length > 0) {
                errors.message_template = `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`;
            }
        }
        if (templateType === GMAIL && !customTemplate.title) {
            errors.title = 'Email subject is required';
        }
        setCustomTemplateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    /* ── Save ───────────────────────────────────────────────────────────── */
    const handleSave = async () => {
        setErrorMessage(null);
        if (!validate()) return;

        setIsSaving(true);
        const payload = {
            message_template: customTemplate.message_template || '',
            message_subject: customTemplate.title || '',
            provider: templateType,
        };

        try {
            const res = await dispatch(saveOutreachTemplate(payload));
            if (res?.data?.status === 'success') {
                toast.success('Template saved successfully');
                fetchTemplates();
                refreshOutreachStep();
            } else {
                const msg = res?.data?.message || 'Something went wrong. Please try again.';
                toast.error(msg);
                setErrorMessage(msg);
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Derived helpers ────────────────────────────────────────────────── */
    const templateKey = templateType === LINKEDIN ? 'linkedin_template' : 'gmail_template';
    const availableDefaults = defaultTemplates[templateKey] || [];
    const isLinkedinConnected = referralPlan?.linkedin_connected;

    const isLoading = isFetchingTemplates || isFetchingDefaults;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">Set up your outreach message</p>

            <div className="hc-card">
                {/* Sub-tab header */}
                <div className="hc-card__header">
                    <button
                        type="button"
                        className={`hc-subtab${templateType === GMAIL ? ' hc-subtab--active' : ''}`}
                        onClick={() => setTemplateType(GMAIL)}
                    >
                        <span className="hc-subtab__icon"><GmailIcon /></span>
                        Gmail Template
                    </button>
                    <button
                        type="button"
                        className={`hc-subtab${templateType === LINKEDIN ? ' hc-subtab--active' : ''}`}
                        onClick={() => setTemplateType(LINKEDIN)}
                    >
                        <span className="hc-subtab__icon"><LinkedInIcon /></span>
                        LinkedIn Template
                    </button>
                </div>

                {/* Card body */}
                <div className="hc-card__body">
                    {isLoading ? (
                        <div className="hc-loading">
                            <span className="hc-loading__spinner" />
                            Loading templates…
                        </div>
                    ) : (
                        <>
                            {/* Template pills (radio) */}
                            <div className="hc-pills" role="radiogroup" aria-label="Choose a template">
                                {availableDefaults.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        role="radio"
                                        aria-checked={selectedPill === index}
                                        className={`hc-pill${selectedPill === index ? ' hc-pill--active' : ''}`}
                                        onClick={() => handlePillSelect(index)}
                                    >
                                        <RadioIcon selected={selectedPill === index} />
                                        {isMobile ? `Template ${index + 1}` : `Use Template ${index + 1}`}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={selectedPill === 'scratch'}
                                    className={`hc-pill${selectedPill === 'scratch' ? ' hc-pill--active' : ''}`}
                                    onClick={() => handlePillSelect('scratch')}
                                >
                                    <RadioIcon selected={selectedPill === 'scratch'} />
                                    {isMobile ? "Write your own" : "Write your own message"}
                                </button>
                            </div>

                            <div className="hc-message-toolbar">
                                <button
                                    type="button"
                                    className="hc-rewrite-btn"
                                    onClick={handleRewriteMessage}
                                    disabled={isRewriting || isSaving}
                                >
                                    <MatIcon name="auto_awesome" />
                                    <span>{isRewriting ? 'Rewriting…' : 'Rewrite message'}</span>
                                </button>
                            </div>

                            {/* Fields */}
                            <div className="hc-fields">
                                {templateType === GMAIL && (
                                    <div className="hc-field">
                                        <label className="hc-field__label">Email Subject</label>
                                        <input
                                            type="text"
                                            className="hc-field__input"
                                            value={customTemplate.title || ''}
                                            onChange={(e) => handleChange('title', e.target.value)}
                                            placeholder={`Could you refer me for {{title}} at {{company}}?`}
                                        />
                                        {customTemplateErrors.title && (
                                            <p className="hc-field__error">{customTemplateErrors.title}</p>
                                        )}
                                    </div>
                                )}

                                <div className="hc-field">
                                    <label className="hc-field__label">Template Message</label>
                                    <div className="hc-field__editor-wrap">
                                        <TemplateEditor
                                            value={customTemplate.message_template || ''}
                                            onChange={(content) => handleChange('message_template', content)}
                                            hasError={!!customTemplateErrors.message_template}
                                            dynamicFields={VAR_FIELDS}
                                            showDynamicDropdowns
                                            templateAppliedAt={templateAppliedAt}
                                            scrollingContainer="#scrollContainer"
                                        />
                                    </div>
                                    {customTemplateErrors.message_template && (
                                        <p className="hc-field__error">{customTemplateErrors.message_template}</p>
                                    )}
                                    {errorMessage && (
                                        <p className="hc-field__error" style={{ fontSize: '13px' }}>{errorMessage}</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {/* Bottom note bar — flush against card bottom, rounded corners match card */}
                <div className="hc-info-bar">
                    <InfoIcon />
                    <span className="hc-info-bar__text">
                        Your outreach referrals will be sent using this template
                    </span>
                </div>
            </div>

            {/* Footer with save button (outside the card to match design) */}
            {!isLoading && (
                <div className="hc-footer">
                    {templateType === LINKEDIN && !isLinkedinConnected ? (
                        <p className="hc-linkedin-msg">
                            You can&apos;t update the LinkedIn template because you haven&apos;t connected LinkedIn with
                            the agent. However, no worries — it&apos;s optional, and you can still use the agent
                            without it.
                        </p>
                    ) : (
                        <button
                            type="button"
                            className="hc-save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving && <span className="hc-save-btn__spinner" />}
                            {isSaving ? 'Saving…' : 'Save Template'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessageTemplatesTab;
