'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from '@/talent/navigation/routerCompat';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { GET_API, POST_API } from '../../../../components/Helper';
import { API_URL, IMAGE_URL } from '../../../../components/Constant';
import { GmailIcon } from '../../../../assets/IconSVG';
import { getAccountStatus } from '../../../../store/actions/UserActions';

/* -------------------------------------------------------------------------- */
/* Constants — same templates / API contract as OutreachSettings.js            */
/* -------------------------------------------------------------------------- */

const FOLLOWUP_TEMPLATES_GMAIL = [
    'Hi {{outreachEmployee}}, just checking if you had a chance to review my previous email about {{jobTitle}}. Looking forward to your feedback.',
    'Hello {{outreachEmployee}}, I wanted to follow up on my last email regarding {{jobTitle}}. Please let me know your thoughts whenever convenient.',
    'Hi {{outreachEmployee}}, following up to see if you had a moment to go through my earlier message on {{jobTitle}}. Appreciate your reply.',
    "Dear {{outreachEmployee}}, I'm reaching out again regarding my previous email about {{jobTitle}}. Could you kindly confirm your thoughts when possible?",
    'Hello {{outreachEmployee}}, this is a quick follow-up to my earlier email on {{jobTitle}}. Would love to hear back from you soon.',
    'Hi {{outreachEmployee}}, I wanted to check in and see if you had any updates after my last email regarding {{jobTitle}}. Thanks in advance!',
];

const FOLLOWUP_TEMPLATES_LINKEDIN = [
    'Hi {{outreachEmployee}}, just checking in regarding the {{jobTitle}}. I remain very interested and would be glad to share more if needed.',
    "Hello {{outreachEmployee}}, I wanted to follow up on the {{jobTitle}} role. Please let me know if there's anything else I can provide.",
    "Hi {{outreachEmployee}}, I'm reaching out to see if there are any updates on the {{jobTitle}}. Happy to share more details from my side if helpful.",
    "Hello {{outreachEmployee}}, following up on my previous note about the {{jobTitle}}. I'd love to explore how I might contribute.",
    'Hi {{outreachEmployee}}, just wanted to kindly follow up regarding the {{jobTitle}}. Still very enthusiastic about the opportunity.',
    'Hello {{outreachEmployee}}, checking in on the {{jobTitle}}. Please let me know if you need any additional details from me.',
    "Hi {{outreachEmployee}}, I wanted to follow up on the {{jobTitle}} and see if there's any update. Still very keen on the role.",
    "Hello {{outreachEmployee}}, just circling back on the {{jobTitle}}. Let me know if I can share anything further to support my application.",
    "Hi {{outreachEmployee}}, following up to express my continued interest in the {{jobTitle}}. I'd be happy to provide more information anytime.",
    "Hello {{outreachEmployee}}, I wanted to reconnect regarding the {{jobTitle}}. Please let me know if there's anything else you'd like from me.",
];

const INTERVAL_OPTIONS = [
    { value: 1, label: 'After 1 day' },
    { value: 2, label: 'After 2 days' },
    { value: 3, label: 'After 3 days' },
    { value: 4, label: 'After 4 days' },
    { value: 5, label: 'After 5 days' },
    { value: 6, label: 'After 6 days' },
    { value: 7, label: 'After 1 week' },
];

const DEFAULT_FU_SETTINGS = {
    disabled_followup_gmail: false,
    disabled_followup_linkedin: false,
    interval_days_gmail: 4,
    interval_days_linkedin: 4,
    message_gmail: FOLLOWUP_TEMPLATES_GMAIL[0],
    message_linkedin: FOLLOWUP_TEMPLATES_LINKEDIN[0],
};

const fallbackInterval = (v) => (v > 0 ? Number(v) : 4);

/* -------------------------------------------------------------------------- */
/* Inline icons                                                                */
/* -------------------------------------------------------------------------- */

const LinkedInLogo = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
    </svg>
);

const StepperChevrons = ({ muted }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5 6.5l3-3 3 3" stroke={muted ? 'rgba(107,107,107,0.6)' : '#231f20'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9.5l3 3 3-3" stroke={muted ? 'rgba(107,107,107,0.6)' : '#231f20'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* -------------------------------------------------------------------------- */
/* Toggle (pill)                                                               */
/* -------------------------------------------------------------------------- */

const FollowUpToggle = ({ checked, disabled, onChange, ariaLabel }) => {
    const handleClick = () => {
        if (disabled) return;
        onChange(!checked);
    };

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={handleClick}
            className={`hc-fu-toggle${checked ? ' hc-fu-toggle--on' : ''}${disabled ? ' hc-fu-toggle--disabled' : ''}`}
        >
            <span className="hc-fu-toggle__track" aria-hidden="true">
                <span className="hc-fu-toggle__thumb" />
            </span>
            <span className="hc-fu-toggle__label">{checked ? 'Enabled' : 'Disabled'}</span>
        </button>
    );
};

/* -------------------------------------------------------------------------- */
/* Reusable card field controls                                                */
/* -------------------------------------------------------------------------- */

const IntervalSelect = ({ value, onChange, disabled }) => (
    <label className={`hc-fu-stepper${disabled ? ' hc-fu-stepper--disabled' : ''}`}>
        <select
            className="hc-fu-stepper__select"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            disabled={disabled}
        >
            {INTERVAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <StepperChevrons muted={disabled} />
    </label>
);

const TemplateSelect = ({ templates, message, onPickTemplate, disabled, idPrefix }) => {
    const selectedIdx = templates.findIndex((t) => t === (message || '').trim());
    const value = selectedIdx >= 0 ? String(selectedIdx) : 'custom';
    return (
        <label className={`hc-fu-stepper${disabled ? ' hc-fu-stepper--disabled' : ''}`}>
            <select
                className="hc-fu-stepper__select"
                value={value}
                onChange={(e) => {
                    if (e.target.value === 'custom') return;
                    const idx = Number(e.target.value);
                    onPickTemplate(templates[idx]);
                }}
                disabled={disabled}
                id={`${idPrefix}-template-select`}
            >
                {templates.map((_, i) => (
                    <option key={i} value={i}>{`Template ${i + 1}`}</option>
                ))}
                {selectedIdx < 0 && <option value="custom">Custom message</option>}
            </select>
            <StepperChevrons muted={disabled} />
        </label>
    );
};

/* -------------------------------------------------------------------------- */
/* Single channel card                                                         */
/* -------------------------------------------------------------------------- */

const ChannelCard = ({
    variant,            // 'gmail' | 'linkedin'
    title,
    icon,
    enabled,
    onToggle,
    interval,
    onIntervalChange,
    templates,
    message,
    onMessageChange,
    onPickTemplate,
    accountConnected,   // when false the card is locked-disabled regardless of `enabled`
    children,            // extra slot — used to render the LinkedIn-connect tooltip
}) => {
    const locked = !accountConnected;
    const fieldsDisabled = locked || !enabled;

    return (
        <section
            className={`hc-fu-card hc-fu-card--${variant}${locked ? ' hc-fu-card--locked' : ''}${!enabled && !locked ? ' hc-fu-card--off' : ''}`}
        >
            <header className="hc-fu-card__head">
                <span className="hc-fu-card__title">
                    <span className="hc-fu-card__title-icon">{icon}</span>
                    {title}
                </span>
                <FollowUpToggle
                    checked={!locked && enabled}
                    disabled={locked}
                    onChange={onToggle}
                    ariaLabel={`${title} toggle`}
                />
            </header>

            <div className="hc-fu-card__body">
                <div className="hc-fu-card__field">
                    <label className="hc-fu-card__label">
                        Send a follow-up if there&apos;s no reply after this long
                    </label>
                    <IntervalSelect value={interval} onChange={onIntervalChange} disabled={fieldsDisabled} />
                </div>

                <div className="hc-fu-card__field">
                    <label className="hc-fu-card__label">Follow up message template</label>
                    <TemplateSelect
                        templates={templates}
                        message={message}
                        onPickTemplate={onPickTemplate}
                        disabled={fieldsDisabled}
                        idPrefix={variant}
                    />
                </div>

                <div className="hc-fu-card__field hc-fu-card__field--full">
                    <label className="hc-fu-card__label">
                        Please retain {'{{'}outreachEmployee{'}}'} and {'{{'}jobTitle{'}}'} while personalising the message
                    </label>
                    <textarea
                        className="hc-fu-card__textarea"
                        rows={4}
                        value={message || ''}
                        onChange={(e) => onMessageChange(e.target.value)}
                        disabled={fieldsDisabled}
                        placeholder="Hi {{outreachEmployee}}, just checking…"
                    />
                </div>
            </div>

            {children}
        </section>
    );
};

/* -------------------------------------------------------------------------- */
/* FollowUpSettingsTab                                                         */
/* -------------------------------------------------------------------------- */

const FollowUpSettingsTab = () => {
    const [, setSearchParams] = useSearchParams();
    const dispatch = useDispatch();

    const [settings, setSettings] = useState(DEFAULT_FU_SETTINGS);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    /** Real connection state — derived from the same `getAccountStatus()` call
     *  used by ConnectedAccountsTab so this card reacts to live connect/disconnect
     *  actions taken elsewhere. `status === 2` means the LinkedIn account is
     *  fully linked & verified. */
    const [linkedinAccountConnected, setLinkedinAccountConnected] = useState(false);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fetchAccountStatus = useCallback(() => {
        return dispatch(getAccountStatus())
            .then((res) => {
                if (!mountedRef.current) return;
                setLinkedinAccountConnected(res?.data?.data?.linkedin?.status === 2);
            })
            .catch(() => {});
    }, [dispatch]);

    /* ── Fetch ──────────────────────────────────────────────────────────── */
    const fetchFollowupSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await GET_API(`${API_URL}talent/outreach/settings/followup`);
            if (res?.data?.status === 200 && res?.data?.data) {
                const d = res.data.data;
                setSettings({
                    disabled_followup_gmail: d.disabled_followup_gmail ?? d.disabled_followup ?? false,
                    disabled_followup_linkedin: d.disabled_followup_linkedin ?? d.disabled_followup ?? false,
                    interval_days_gmail: fallbackInterval(d.interval_days_gmail ?? d.interval_days ?? 4),
                    interval_days_linkedin: fallbackInterval(d.interval_days_linkedin ?? d.interval_days ?? 4),
                    message_gmail: d.message_gmail ?? d.message ?? FOLLOWUP_TEMPLATES_GMAIL[0],
                    message_linkedin: d.message_linkedin ?? d.message ?? FOLLOWUP_TEMPLATES_LINKEDIN[0],
                });
            }
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Failed to load follow-up settings');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFollowupSettings();
        fetchAccountStatus();
    }, [fetchFollowupSettings, fetchAccountStatus]);

    /* ── Field handlers ─────────────────────────────────────────────────── */
    const setGmailEnabled = (enabled) => setSettings((p) => ({ ...p, disabled_followup_gmail: !enabled }));
    const setLinkedinEnabled = (enabled) => setSettings((p) => ({ ...p, disabled_followup_linkedin: !enabled }));

    const setGmailInterval = (v) => setSettings((p) => ({ ...p, interval_days_gmail: v }));
    const setLinkedinInterval = (v) => setSettings((p) => ({ ...p, interval_days_linkedin: v }));

    const setGmailMessage = (v) => setSettings((p) => ({ ...p, message_gmail: v }));
    const setLinkedinMessage = (v) => setSettings((p) => ({ ...p, message_linkedin: v }));

    /* ── Validation ─────────────────────────────────────────────────────── */
    const validateChannel = (label, disabled, message) => {
        const msg = (message || '').trim();
        if (disabled || msg === '') return true;
        if (!msg.includes('{{outreachEmployee}}')) {
            toast.error(`${label}: the follow-up message must include the {{outreachEmployee}} variable.`);
            return false;
        }
        if (!msg.includes('{{jobTitle}}')) {
            toast.error(`${label}: the follow-up message must include the {{jobTitle}} variable.`);
            return false;
        }
        return true;
    };

    /* ── Save ───────────────────────────────────────────────────────────── */
    const handleSave = async () => {
        if (!validateChannel('Gmail', settings.disabled_followup_gmail, settings.message_gmail)) return;
        if (
            linkedinAccountConnected &&
            !validateChannel('LinkedIn', settings.disabled_followup_linkedin, settings.message_linkedin)
        ) return;

        setIsSaving(true);
        try {
            const res = await POST_API(`${API_URL}talent/outreach/settings/followup`, {
                disabled_followup_gmail: settings.disabled_followup_gmail,
                disabled_followup_linkedin: settings.disabled_followup_linkedin,
                interval_days: fallbackInterval(settings.interval_days_gmail),
                interval_days_gmail: fallbackInterval(settings.interval_days_gmail),
                interval_days_linkedin: fallbackInterval(settings.interval_days_linkedin),
                channel: 'both',
                message: settings.message_gmail || null,
                message_gmail: settings.message_gmail || null,
                message_linkedin: settings.message_linkedin || null,
            });
            if (res?.data?.status === 200) {
                toast.success('Follow-up settings saved');
            } else {
                const e = res?.data;
                const errMsg =
                    e?.errors?.message_gmail?.[0] ||
                    e?.errors?.message_linkedin?.[0] ||
                    e?.errors?.message?.[0] ||
                    e?.message ||
                    'Failed to save';
                toast.error(errMsg);
            }
        } catch (e) {
            const data = e?.response?.data;
            const errMsg =
                data?.errors?.message_gmail?.[0] ||
                data?.errors?.message_linkedin?.[0] ||
                data?.errors?.message?.[0] ||
                data?.message ||
                'Failed to save';
            toast.error(errMsg);
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Switch to Connected Accounts tab ───────────────────────────────── */
    const goToConnectedAccounts = () => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('tab', 'connected-accounts');
            return next;
        });
    };

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">
                Configure automatic follow-ups for no replies
            </p>

            {isLoading ? (
                <div className="hc-loading">
                    <span className="hc-loading__spinner" />
                    Loading follow-up settings…
                </div>
            ) : (
                <>
                    <div className="hc-fu-cards">
                        <ChannelCard
                            variant="gmail"
                            title="Gmail Follow-ups"
                            icon={<GmailIcon />}
                            enabled={!settings.disabled_followup_gmail}
                            onToggle={setGmailEnabled}
                            interval={settings.interval_days_gmail}
                            onIntervalChange={setGmailInterval}
                            templates={FOLLOWUP_TEMPLATES_GMAIL}
                            message={settings.message_gmail}
                            onMessageChange={setGmailMessage}
                            onPickTemplate={setGmailMessage}
                            accountConnected={true}
                        />

                        <ChannelCard
                            variant="linkedin"
                            title="LinkedIn Follow-ups"
                            icon={<LinkedInLogo />}
                            enabled={!settings.disabled_followup_linkedin}
                            onToggle={setLinkedinEnabled}
                            interval={settings.interval_days_linkedin}
                            onIntervalChange={setLinkedinInterval}
                            templates={FOLLOWUP_TEMPLATES_LINKEDIN}
                            message={settings.message_linkedin}
                            onMessageChange={setLinkedinMessage}
                            onPickTemplate={setLinkedinMessage}
                            accountConnected={linkedinAccountConnected}
                        >
                            {/* Connect-LinkedIn tooltip + mascot — only shown when LinkedIn isn't connected */}
                            {!linkedinAccountConnected && (
                                <aside className="hc-fu-connect" role="note">
                                    <span className="hc-fu-connect__mascot" aria-hidden="true">
                                        <img src={`${IMAGE_URL}outreach/mascot-think.svg`} alt="" />
                                    </span>
                                    <div className="hc-fu-connect__bubble">
                                        <span className="hc-fu-connect__pointer" aria-hidden="true" />
                                        <p className="hc-fu-connect__title">
                                            Looks like you haven&apos;t connected your LinkedIn account yet!
                                        </p>
                                        <button
                                            type="button"
                                            className="hc-fu-connect__btn"
                                            onClick={goToConnectedAccounts}
                                        >
                                            <LinkedInLogo />
                                            <span>CONNECT MY LINKEDIN ACCOUNT</span>
                                        </button>
                                        <div className="hc-fu-connect__ps">
                                            <p>
                                                PS: I&apos;ll never read your other conversations or access your
                                                profile settings. I can only read replies to referral messages
                                                I&apos;ve sent and you can disconnect my access anytime!
                                            </p>
                                        </div>
                                    </div>
                                </aside>
                            )}
                        </ChannelCard>
                    </div>

                    <div className="hc-footer">
                        <button
                            type="button"
                            className="hc-save-btn"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving && <span className="hc-save-btn__spinner" />}
                            {isSaving ? 'Saving…' : 'Save Follow-up Settings'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default FollowUpSettingsTab;
