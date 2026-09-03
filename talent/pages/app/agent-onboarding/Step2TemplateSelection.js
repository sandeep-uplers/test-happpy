import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GET_API } from '../../../components/Helper';
import { API_OUTREACH_DEFAULT_AUTO_TEMPLATES } from '../../../components/Constant';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import {
    fetchHapppyAgentPlan,
    getOutreachTemplates,
    saveOutreachTemplate,
} from '../../../store/actions/UserActions';
import { GmailIcon } from '../../../assets/IconSVG';
import { trackHappyAgentMixpanel } from '../../../store/actions/happyAgentTracking';
import {
    ONBOARDING_URL_PARAM,
    setOnboardingActivityUrlParam,
} from '../../../helpers/onboardingUrlParams';
import TemplateEditor from '../linkedin/TemplateEditor';

/**
 * Step 2 — "Set up your outreach message" (post-onboarding dashboard drawer)
 *
 * Two tabs (Gmail / LinkedIn) hosting three template options each:
 *   - Use Template 1 → first default template
 *   - Use Template 2 → second default template
 *   - Write your own message → blank editor
 *
 * Behaviour
 *   - Pre-populates each tab from the talent's saved template, falling back to
 *     the first default template if none has been saved yet.
 *   - Switching tabs silently autosaves the previous tab when its draft is
 *     dirty AND passes validation; invalid drafts are left untouched so the
 *     user sees full errors on NEXT STEP.
 *   - NEXT STEP saves the currently-active tab (strict validation: subject for
 *     Gmail + all four merge variables required) before advancing.
 *   - LinkedIn tab is locked when LinkedIn isn't connected — copy points users
 *     to Configure → Connected Accounts; they can still proceed with Gmail
 *     (LinkedIn is optional).
 */

const PROVIDER_LINKEDIN = 1;
const PROVIDER_GMAIL = 2;

const REQUIRED_VARS = [
    '{{outreachEmployeeName}}',
    '{{jobTitle}}',
    '{{companyName}}',
    '{{jobLink}}',
];

/** Inert state for both tabs — kept identical so the editor never sees `undefined`. */
const EMPTY_DRAFT = { subject: '', body: '' };

const tabBodyKey = (tab) =>
    tab === PROVIDER_LINKEDIN ? 'linkedin_template' : 'gmail_template';
const tabSubjectKey = (tab) =>
    tab === PROVIDER_LINKEDIN ? 'linkedin_template_subject' : 'gmail_template_subject';

const sanitiseHtml = (html = '') => (html || '').replace(/<[^>]*>/g, '').trim();

function LinkedinTabIcon() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 11-.001-4.126 2.063 2.063 0 010 4.126zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="#0077B5"
            />
        </svg>
    );
}

function InfoIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
    );
}

function LockIcon({ size = 14 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path
                d="M8 11V8a4 4 0 018 0v3"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
        </svg>
    );
}

const Step2TemplateSelection = ({
    outreachStepConfig,
    onAdvance,
    onBack,
    hideBack = false,
    ctaLabel = 'Next step',
}) => {
    const dispatch = useDispatch();

    const refreshOutreachStep = useCallback(() => {
        dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
    }, [dispatch]);

    const [activeTab, setActiveTab] = useState(PROVIDER_GMAIL);
    const [templates, setTemplates] = useState({
        gmail_template: '',
        gmail_template_subject: '',
        linkedin_template: '',
        linkedin_template_subject: '',
    });
    const [defaultTemplates, setDefaultTemplates] = useState({
        gmail_template: [],
        linkedin_template: [],
    });

    /** Per-tab editing state — keys: 1 (LinkedIn), 2 (Gmail). */
    const [modes, setModes] = useState({ 1: 'scratch', 2: 'scratch' });
    const [drafts, setDrafts] = useState({ 1: EMPTY_DRAFT, 2: EMPTY_DRAFT });
    const [dirty, setDirty] = useState({ 1: false, 2: false });
    const [errors, setErrors] = useState({ 1: {}, 2: {} });
    const [templateAppliedAt, setTemplateAppliedAt] = useState({ 1: null, 2: null });

    const [isLoading, setIsLoading] = useState(false);
    const [isSavingNext, setIsSavingNext] = useState(false);
    const [isAutosaving, setIsAutosaving] = useState(false);
    const [tooltipDismissed, setTooltipDismissed] = useState(false);

    /** Mutable copy of drafts/modes/dirty used inside callbacks that can't rely on closures. */
    const draftsRef = useRef(drafts);
    const modesRef = useRef(modes);
    const dirtyRef = useRef(dirty);
    useEffect(() => { draftsRef.current = drafts; }, [drafts]);
    useEffect(() => { modesRef.current = modes; }, [modes]);
    useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

    const linkedinConnected = !!outreachStepConfig?.step1?.linkedin_connected;

    /** Post–mode-selection handoff lands on /job-agent; set the funnel param here
     *  so it survives the redirect away from the onboarding landing page. */
    useEffect(() => {
        setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.OUTREACH_MODE_SELECTED);
    }, []);

    /** Initial load — saved templates + the two default templates per provider. */
    useEffect(() => {
        let cancelled = false;

        const loadTemplates = dispatch(getOutreachTemplates())
            .then((res) => res?.data?.data || {})
            .catch(() => ({}));

        const loadDefaults = GET_API(API_OUTREACH_DEFAULT_AUTO_TEMPLATES)
            .then((res) => res?.data?.data || {})
            .catch(() => ({ linkedin_template: [], gmail_template: [] }));

        setIsLoading(true);
        Promise.all([loadTemplates, loadDefaults])
            .then(([saved, defaults]) => {
                if (cancelled) return;
                const nextTemplates = {
                    gmail_template: saved.gmail_template || '',
                    gmail_template_subject: saved.gmail_template_subject || '',
                    linkedin_template: saved.linkedin_template || '',
                    linkedin_template_subject: saved.linkedin_template_subject || '',
                };
                const nextDefaults = {
                    gmail_template: defaults.gmail_template || [],
                    linkedin_template: defaults.linkedin_template || [],
                };
                setTemplates(nextTemplates);
                setDefaultTemplates(nextDefaults);
                hydrateDrafts(nextTemplates, nextDefaults);
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    /** Seed both tabs' editors from the API response (saved → custom; otherwise default 1). */
    const hydrateDrafts = (savedTemplates, defaults) => {
        const stamp = Date.now();
        const nextDrafts = {};
        const nextModes = {};
        const nextStamps = {};

        [PROVIDER_LINKEDIN, PROVIDER_GMAIL].forEach((tab) => {
            const savedBody = savedTemplates[tabBodyKey(tab)] || '';
            const savedSubject = savedTemplates[tabSubjectKey(tab)] || '';
            const tabDefaults = defaults[tabBodyKey(tab)] || [];

            if (savedBody.trim()) {
                nextDrafts[tab] = { subject: savedSubject, body: savedBody };
                nextModes[tab] = 'template1';
            } else if (tabDefaults.length > 0) {
                const first = tabDefaults[0];
                nextDrafts[tab] = {
                    subject: first?.message_subject || first?.title || '',
                    body: first?.message_template || '',
                };
                nextModes[tab] = 'template1';
            } else {
                nextDrafts[tab] = EMPTY_DRAFT;
                nextModes[tab] = 'scratch';
            }
            nextStamps[tab] = stamp;
        });

        setDrafts(nextDrafts);
        setModes(nextModes);
        setTemplateAppliedAt(nextStamps);
        setDirty({ 1: false, 2: false });
        setErrors({ 1: {}, 2: {} });
    };

    /** Validate the draft for the given tab using the existing strict rules. */
    const validateDraft = (tab, draft) => {
        const next = {};
        const body = draft?.body || '';
        const bodyText = sanitiseHtml(body);

        if (tab === PROVIDER_GMAIL && !draft?.subject?.trim()) {
            next.subject = 'Subject is required';
        }
        if (!bodyText) {
            next.body = 'Template is required';
        } else {
            const missing = REQUIRED_VARS.filter((v) => !body.includes(v));
            if (missing.length) {
                next.body = `${missing.join(', ')} is required`;
            }
        }
        return next;
    };

    /** Persist one tab's draft. Returns true on success. */
    const persistTab = async (tab, { silent = false } = {}) => {
        const draft = draftsRef.current[tab];
        if (!draft) return false;

        const payload = {
            message_template: draft.body || '',
            message_subject: draft.subject || '',
            provider: tab,
        };

        try {
            const res = await dispatch(saveOutreachTemplate(payload));
            if (res?.data?.status === 'success') {
                setDirty((d) => ({ ...d, [tab]: false }));
                setTemplates((prev) => ({
                    ...prev,
                    [tabBodyKey(tab)]: payload.message_template,
                    [tabSubjectKey(tab)]: payload.message_subject,
                }));
                refreshOutreachStep();
                if (!silent) {
                    toast.success(
                        tab === PROVIDER_GMAIL
                            ? 'Gmail template saved'
                            : 'LinkedIn template saved'
                    );
                }
                return true;
            }
            if (!silent) {
                toast.error(res?.data?.message || 'Something went wrong. Please try again.');
            }
            return false;
        } catch (err) {
            if (!silent) {
                toast.error(
                    err?.response?.data?.message || 'Something went wrong. Please try again.'
                );
            }
            return false;
        }
    };

    /** Tab switch — silent autosave when the outgoing tab is dirty + valid. */
    const handleTabChange = async (nextTab) => {
        if (nextTab === activeTab) return;

        const currentTab = activeTab;
        const currentDraft = draftsRef.current[currentTab];
        const isDirty = dirtyRef.current[currentTab];

        // Only autosave when the user actually changed something AND it's valid;
        // we don't want to flash validation errors when they just peek at the other tab.
        if (
            isDirty &&
            currentTab === PROVIDER_GMAIL &&
            Object.keys(validateDraft(currentTab, currentDraft)).length === 0
        ) {
            setIsAutosaving(true);
            await persistTab(currentTab, { silent: true });
            setIsAutosaving(false);
        }
        if (
            isDirty &&
            currentTab === PROVIDER_LINKEDIN &&
            linkedinConnected &&
            Object.keys(validateDraft(currentTab, currentDraft)).length === 0
        ) {
            setIsAutosaving(true);
            await persistTab(currentTab, { silent: true });
            setIsAutosaving(false);
        }

        trackHappyAgentMixpanel('agent_onb_template_tab_switched', {
            to: nextTab === PROVIDER_GMAIL ? 'gmail' : 'linkedin',
        }).catch(() => { });
        setActiveTab(nextTab);
    };

    const handleChipSelect = (tab, mode) => {
        const tabDefaults = defaultTemplates[tabBodyKey(tab)] || [];
        let nextDraft = drafts[tab];

        if (mode === 'template1') {
            const t = tabDefaults[0];
            if (!t) return;
            nextDraft = {
                subject: t.message_subject || t.title || '',
                body: t.message_template || '',
            };
        } else if (mode === 'template2') {
            const t = tabDefaults[1];
            if (!t) return;
            nextDraft = {
                subject: t.message_subject || t.title || '',
                body: t.message_template || '',
            };
        } else if (mode === 'scratch') {
            // do not change a thing if user previously had a draft
            nextDraft = EMPTY_DRAFT;
        }

        setDrafts((prev) => ({ ...prev, [tab]: nextDraft }));
        setModes((prev) => ({ ...prev, [tab]: mode }));
        setDirty((prev) => ({ ...prev, [tab]: true }));
        setErrors((prev) => ({ ...prev, [tab]: {} }));
        setTemplateAppliedAt((prev) => ({ ...prev, [tab]: Date.now() }));

        trackHappyAgentMixpanel('agent_onb_template_chip_selected', {
            tab: tab === PROVIDER_GMAIL ? 'gmail' : 'linkedin',
            mode,
        }).catch(() => { });
    };

    const handleDraftChange = (tab, key, value) => {
        setDrafts((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: value } }));
        setDirty((prev) => ({ ...prev, [tab]: true }));
        if (errors[tab]?.[key]) {
            setErrors((prev) => ({ ...prev, [tab]: { ...prev[tab], [key]: undefined } }));
        }
    };

    /** NEXT STEP — strict validate the active tab, save it, then advance. */
    const handleNext = async () => {
        // LinkedIn tab when locked: just advance.
        if (activeTab === PROVIDER_LINKEDIN && !linkedinConnected) {
            setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.SETUP_COMPLETE);
            onAdvance?.();
            return;
        }

        const currentDraft = drafts[activeTab];
        const validation = validateDraft(activeTab, currentDraft);
        if (Object.keys(validation).length) {
            setErrors((prev) => ({ ...prev, [activeTab]: validation }));
            toast.error('Please fix the errors before continuing.');
            return;
        }

        setIsSavingNext(true);
        const ok = dirty[activeTab]
            ? await persistTab(activeTab, { silent: true })
            : true;
        setIsSavingNext(false);

        if (ok) {
            trackHappyAgentMixpanel('agent_onb_template_step_completed', {
                tab: activeTab === PROVIDER_GMAIL ? 'gmail' : 'linkedin',
            }).catch(() => { });
            setOnboardingActivityUrlParam(ONBOARDING_URL_PARAM.SETUP_COMPLETE);
            onAdvance?.();
        }
    };

    /** Active draft helpers for terser JSX. */
    const tab = activeTab;
    const tabDefaults = defaultTemplates[tabBodyKey(tab)] || [];
    const draft = drafts[tab] || EMPTY_DRAFT;
    const draftErrors = errors[tab] || {};
    const mode = modes[tab] || 'scratch';
    const isLinkedinLocked = tab === PROVIDER_LINKEDIN && !linkedinConnected;

    /** Banner copy depends on whether the user is using a default vs custom message. */
    const bannerText = useMemo(() => {
        if (mode === 'scratch') {
            return 'Create your own referral outreach message. If left blank, Template 1 will be used by default.';
        }
        return 'Your outreach referrals will be sent using this template';
    }, [mode]);

    return (
        <>
            <div className="agent-onb-scroll" id="agentOnbScroll">
                <header className="agent-onb-step-header">
                    <h2 className="agent-onb-step-header__title">Set up your outreach message</h2>
                    <p className="agent-onb-step-header__lede">
                        Create your own message or personalise the default messages your agent will send
                    </p>
                </header>

                <div className="agent-onb-tpl-wrap">
                    <div className="agent-onb-tpl-card">
                        {/* ---------------- Tab strip ---------------- */}
                        <div className="agent-onb-tpl-card__tabs-wrap">
                            <div className="agent-onb-tpl-card__tabs" role="tablist">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === PROVIDER_GMAIL}
                                    className={`agent-onb-tpl-card__tab${tab === PROVIDER_GMAIL ? ' agent-onb-tpl-card__tab--active' : ''
                                        }`}
                                    onClick={() => handleTabChange(PROVIDER_GMAIL)}
                                    disabled={isSavingNext}
                                >
                                    <span className="agent-onb-tpl-card__tab-icon">
                                        <GmailIcon />
                                    </span>
                                    <span>Gmail Template</span>
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={tab === PROVIDER_LINKEDIN}
                                    className={`agent-onb-tpl-card__tab${tab === PROVIDER_LINKEDIN ? ' agent-onb-tpl-card__tab--active' : ''
                                        }`}
                                    onClick={() => handleTabChange(PROVIDER_LINKEDIN)}
                                    disabled={isSavingNext}
                                >
                                    <span className="agent-onb-tpl-card__tab-icon">
                                        <LinkedinTabIcon />
                                    </span>
                                    <span>LinkedIn Template</span>
                                </button>
                            </div>
                            {isAutosaving && (
                                <span className="agent-onb-tpl-card__saving" aria-live="polite">
                                    Saving…
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="agent-onb-tpl-card__locked">
                                <p className="agent-onb-tpl-card__locked-lede">Loading templates…</p>
                            </div>
                        ) : isLinkedinLocked ? (
                            <div className="agent-onb-tpl-card__locked">
                                <span className="agent-onb-tpl-card__locked-icon">
                                    <LockIcon size={20} />
                                </span>
                                <h3 className="agent-onb-tpl-card__locked-title">
                                    LinkedIn isn’t connected yet
                                </h3>
                                <p className="agent-onb-tpl-card__locked-lede">
                                    To set up a LinkedIn template, connect your account from Configure →
                                    Connected Accounts. It’s optional — you can still continue with just
                                    Gmail for now.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* ---------------- Chip row ---------------- */}
                                <div className="agent-onb-tpl-card__chips" role="radiogroup">
                                    {tabDefaults[0] && (
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={mode === 'template1'}
                                            className={`agent-onb-tpl-card__chip${mode === 'template1' ? ' agent-onb-tpl-card__chip--active' : ''
                                                }`}
                                            onClick={() => handleChipSelect(tab, 'template1')}
                                        >
                                            <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                            <span>Use Template 1</span>
                                        </button>
                                    )}
                                    {tabDefaults[1] && (
                                        <button
                                            type="button"
                                            role="radio"
                                            aria-checked={mode === 'template2'}
                                            className={`agent-onb-tpl-card__chip${mode === 'template2' ? ' agent-onb-tpl-card__chip--active' : ''
                                                }`}
                                            onClick={() => handleChipSelect(tab, 'template2')}
                                        >
                                            <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                            <span>Use Template 2</span>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        role="radio"
                                        aria-checked={mode === 'scratch'}
                                        className={`agent-onb-tpl-card__chip${mode === 'scratch' ? ' agent-onb-tpl-card__chip--active' : ''
                                            }`}
                                        onClick={() => handleChipSelect(tab, 'scratch')}
                                    >
                                        <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                        <span>Write your own message</span>
                                    </button>
                                </div>

                                {/* ---------------- Form ---------------- */}
                                <div className="agent-onb-tpl-card__form">
                                    {tab === PROVIDER_GMAIL && (
                                        <div className="agent-onb-tpl-card__field">
                                            <label
                                                className="agent-onb-tpl-card__label"
                                                htmlFor="agent-onb-tpl-subject"
                                            >
                                                Email Subject
                                            </label>
                                            <input
                                                id="agent-onb-tpl-subject"
                                                type="text"
                                                className={`agent-onb-tpl-card__input${draftErrors.subject ? ' agent-onb-tpl-card__input--error' : ''
                                                    }`}
                                                placeholder="Could you refer me for {{jobTitle}} at {{companyName}}?"
                                                value={draft.subject}
                                                onChange={(e) =>
                                                    handleDraftChange(tab, 'subject', e.target.value)
                                                }
                                            />
                                            {draftErrors.subject && (
                                                <p className="agent-onb-tpl-card__error">{draftErrors.subject}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="agent-onb-tpl-card__field">
                                        <label className="agent-onb-tpl-card__label">Template Message</label>
                                        <div
                                            className={`agent-onb-tpl-card__editor${draftErrors.body ? ' agent-onb-tpl-card__editor--error' : ''
                                                }`}
                                        >
                                            <TemplateEditor
                                                key={`tpl-editor-${tab}-${mode}`}
                                                placeholder="Enter text here..."
                                                value={draft.body}
                                                onChange={(content) =>
                                                    handleDraftChange(tab, 'body', content)
                                                }
                                                hasError={!!draftErrors.body}
                                                scrollingContainer="#agentOnbScroll"
                                                dynamicFields={REQUIRED_VARS}
                                                showDynamicDropdowns
                                                templateAppliedAt={templateAppliedAt[tab]}
                                            />
                                        </div>
                                        {draftErrors.body && (
                                            <p className="agent-onb-tpl-card__error">{draftErrors.body}</p>
                                        )}
                                    </div>
                                </div>

                                {/* ---------------- Info banner ---------------- */}
                                <div className="agent-onb-tpl-card__banner" role="note">
                                    <InfoIcon />
                                    <span>{bannerText}</span>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>

            <div className={`agent-onb-footer${hideBack ? ' agent-onb-footer--no-back' : ''}`}>
                {/* "Write your own" coach-mark — anchored to the footer so the
                    mascot can dangle down over the footer's top edge. */}
                {mode === 'scratch' && !isLinkedinLocked && !tooltipDismissed && !isLoading && (
                    <div className="agent-onb-tpl-tooltip">
                        <div className="agent-onb-tpl-tooltip__inner">
                            <button
                                type="button"
                                className="agent-onb-tpl-tooltip__close"
                                onClick={() => setTooltipDismissed(true)}
                                aria-label="Dismiss tip"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M18 6L6 18M6 6L18 18"
                                        stroke="currentColor"
                                        strokeWidth="2.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>
                            <span className="agent-onb-tpl-tooltip__text">
                                {tab === PROVIDER_GMAIL
                                    ? 'A brief and personalized email creates a stronger first impression'
                                    : 'A brief and personalized message creates a stronger first impression'}
                            </span>
                        </div>
                        <img
                            className="agent-onb-tpl-tooltip__mascot"
                            src="/images/talent/outreach/mascot-neutral.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </div>
                )}

                {!hideBack ? (
                    <button
                        type="button"
                        className="agent-onb-footer__back"
                        onClick={onBack}
                        aria-label="Back to previous step"
                        disabled={isSavingNext}
                    >
                        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.9668 16.4004H6.83346" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                ) : null}
                <button
                    type="button"
                    className="agent-onb-footer__cta agent-onb-footer__cta--dark"
                    onClick={handleNext}
                    disabled={isLoading || isSavingNext}
                >
                    <span>{isSavingNext ? 'Saving…' : ctaLabel}</span>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M5 12h14M13 6l6 6-6 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default Step2TemplateSelection;
