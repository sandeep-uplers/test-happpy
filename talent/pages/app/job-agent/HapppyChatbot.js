'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from '@/talent/navigation/routerCompat';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { HapppyAgentIcon } from '../../../components/common/HapppyAgentLogo';
import {
    API_GET_OUTREACH_TEMPLATES,
    API_GET_RECOMMENDED_JOBS,
    API_SINGLE_OPP,
    API_JOB_AGENT_AGENT_TAILOR_ACTIVITY,
    API_OUTREACH_SUPPORT,
    API_STORE_OUTREACH_TEMPLATE,
    API_URL,
} from '../../../components/Constant';
import {
    DELETE_API,
    GET_API,
    POST_API,
    buildFormData,
    checkIfFilePasswordProtected,
    formattedCTC,
    sanitizePayload,
} from '../../../components/Helper';
import { validateContactNo, validateURL } from '../../../components/profile/formValidations';
import { withHapppyAgentInfoQuery } from '../../../helpers/jobPath';
import {
    displayDailyUsed,
    parseDailyReferralRunsResponse,
} from '../../../helpers/happpyAgentDailyLimitLogic';
import {
    connectLinkedin,
    disconnectGmail,
    disconnectLinkedin,
    fetchDailyReferralRuns,
    fetchHapppyAgentPlan,
    generateAwsUploadUrl,
    getAccountStatus,
    getTalentPreferences,
    profileUpsert,
    storeRecommendedJobs,
    submitAutoRunRequest,
    submitReferralJobApplyByLink,
    verifyLinkedin,
} from '../../../store/actions/UserActions';
import { validateWordsOnly } from '../../../components/profile/formValidations';
import TemplateEditor, { rawToDisplay } from '../linkedin/TemplateEditor';
import { SET_PROFILE_DATA, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import HapppyChatFullscreenView from './HapppyChatFullscreenView';
import './HapppyChatbot.css';

const OutreachMessageHtmlPreview = ({ html, emptyLabel = 'Not set' }) => {
    const body = String(html || '').trim();
    if (!body) {
        return <p className="happpy-chatbot__status-line">{emptyLabel}</p>;
    }
    return (
        <div
            className="happpy-chatbot__message-html"
            dangerouslySetInnerHTML={{ __html: rawToDisplay(body) }}
        />
    );
};

export const HAPPPY_CHATBOT_OPEN_PASTE_JOB = 'happpy-chatbot:open-paste-job';
export const HAPPPY_CHATBOT_OPEN = 'happpy-chatbot:open';
export const HAPPPY_CHAT_PAGE_PATH = '/talent/job-agent/chat';

export function isHapppyChatPagePath(pathname) {
    const path = String(pathname || '');
    return path === HAPPPY_CHAT_PAGE_PATH || path.startsWith(`${HAPPPY_CHAT_PAGE_PATH}/`);
}

const FILE_REGEX = /(\.pdf|\.docx)$/i;
const MAX_FILE_SIZE_KB = 2048;
const JOB_LINK_ADDED_EVENT = 'agent-activity:job-link-added';
const URL_RE = /https?:\/\/[^\s<>"']+/i;
const TICKET_STATUS_PATH = '/talent/job-agent/need-help';
const TICKET_PAGE_LABEL = 'HAPPPY Chatbot';
const PLAN_PATH = '/talent/job-agent/subscription';
const OUTREACH_MODE_PATH = '/talent/job-agent/configure?tab=outreach-mode';
const MESSAGE_TEMPLATES_PATH = '/talent/job-agent/configure?tab=message-templates';
const BLOCKED_COMPANIES_PATH = '/talent/job-agent/configure?tab=blocked-companies';
const OUTREACH_PROVIDER_LINKEDIN = 1;
const OUTREACH_PROVIDER_GMAIL = 2;
const OUTREACH_TEMPLATE_VARS = [
    '{{outreachEmployeeName}}',
    '{{jobTitle}}',
    '{{companyName}}',
    '{{jobLink}}',
];
const FOLLOWUP_SETTINGS_PATH = '/talent/job-agent/configure?tab=follow-up-settings';
const FOLLOWUP_SETTINGS_API = `${API_URL}talent/outreach/settings/followup`;
const FOLLOWUP_CHANNEL_GMAIL = 'gmail';
const FOLLOWUP_CHANNEL_LINKEDIN = 'linkedin';
const FOLLOWUP_VAR_FIELDS = ['{{outreachEmployee}}', '{{jobTitle}}'];
const FOLLOWUP_INTERVAL_OPTIONS = [
    { value: 1, label: 'After 1 day' },
    { value: 2, label: 'After 2 days' },
    { value: 3, label: 'After 3 days' },
    { value: 4, label: 'After 4 days' },
    { value: 5, label: 'After 5 days' },
    { value: 6, label: 'After 6 days' },
    { value: 7, label: 'After 1 week' },
    { value: 14, label: 'After 2 weeks' },
];
const FOLLOWUP_TEMPLATES_GMAIL = [
    'Hi {{outreachEmployee}}, just checking if you had a chance to review my previous email about {{jobTitle}}. Looking forward to your feedback.',
    'Hello {{outreachEmployee}}, I wanted to follow up on my last email regarding {{jobTitle}}. Please let me know your thoughts whenever convenient.',
];
const FOLLOWUP_TEMPLATES_LINKEDIN = [
    'Hi {{outreachEmployee}}, just checking in regarding the {{jobTitle}}. I remain very interested and would be glad to share more if needed.',
    'Hello {{outreachEmployee}}, I wanted to follow up on the {{jobTitle}} role. Please let me know if there\'s anything else I can provide.',
];
const DISCONNECT_REASON_MIN = 3;
/** Backend loads at most 30 messages for model context — nudge users before replies degrade. */
const LONG_CHAT_HINT_THRESHOLD = 30;
const MODE_AUTO = 'auto';
const MODE_MANUAL = 'manual';

function isRealNameComplete(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed || trimmed.length < 2) return false;
    if (/^(user|talent|guest|unknown|test|there)$/i.test(trimmed)) return false;
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return false;
    return parts.every((part) => part.length >= 2 && validateWordsOnly(part));
}

const PROFILE_NOTICE_OPTIONS = [
    'Immediately',
    '15 Days',
    '30 Days',
    '45 Days',
    '60 Days',
    'More than 60 Days',
];

function emptyProfileDraft() {
    return {
        contact_number: '',
        joining_period: '',
        current_ctc: '',
        expected_ctc: '',
        total_experience: '',
        linkedin_id: '',
    };
}

function normalizeProfilePhone(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizeJoiningPeriod(raw) {
    const text = String(raw || '').trim();
    if (!text) return '';
    const exact = PROFILE_NOTICE_OPTIONS.find((item) => item.toLowerCase() === text.toLowerCase());
    if (exact) return exact;
    const lower = text.toLowerCase();
    if (/(immediate|immediately|0 day|no notice)/.test(lower)) return 'Immediately';
    if (/(15|two week|2 week|within 2)/.test(lower)) return '15 Days';
    if (/(30|one month|1 month|four week|4 week)/.test(lower)) return '30 Days';
    if (/45/.test(lower)) return '45 Days';
    if (/(60|two month|2 month)/.test(lower)) return '60 Days';
    if (/(90|three month|3 month|more than 60|more than 8)/.test(lower)) return 'More than 60 Days';
    return text;
}

function parseMoneyLpa(raw) {
    if (raw === '' || raw == null) return null;
    const cleaned = String(raw).replace(/[^\d.]/g, '');
    if (!cleaned) return null;
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
}

function parseExperienceYears(raw) {
    if (raw === '' || raw == null) return null;
    const cleaned = String(raw).replace(/\s+/g, '');
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(cleaned)) return null;
    return cleaned;
}

function normalizeLinkedinUrl(raw) {
    let url = String(raw || '').trim();
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
    }
    return url;
}

function parseProfileToolArguments(args = {}) {
    const src = args && typeof args === 'object' ? args : {};
    const out = {};
    const phone = src.contact_number ?? src.phone;
    if (phone != null && String(phone).trim() !== '') {
        out.contact_number = normalizeProfilePhone(phone);
    }
    const notice = src.joining_period ?? src.notice_period;
    if (notice != null && String(notice).trim() !== '') {
        out.joining_period = normalizeJoiningPeriod(notice);
    }
    const currentCtc = src.current_ctc ?? src.ctc;
    if (currentCtc != null && String(currentCtc).trim() !== '') {
        const val = parseMoneyLpa(currentCtc);
        if (val != null) out.current_ctc = val;
    }
    const expectedCtc = src.expected_ctc ?? src.ectc;
    if (expectedCtc != null && String(expectedCtc).trim() !== '') {
        const val = parseMoneyLpa(expectedCtc);
        if (val != null) out.expected_ctc = val;
    }
    const experience = src.total_experience ?? src.experience;
    if (experience != null && String(experience).trim() !== '') {
        const val = parseExperienceYears(experience);
        if (val != null) out.total_experience = val;
    }
    const linkedin = src.linkedin_id ?? src.linkedin_url ?? src.linkedin;
    if (linkedin != null && String(linkedin).trim() !== '') {
        out.linkedin_id = normalizeLinkedinUrl(linkedin);
    }
    return out;
}

function buildProfileDraftFromTalent(talent = {}, user = {}) {
    const currentCtc = formattedCTC(talent.current_ctc);
    const expectedCtc = formattedCTC(talent.expected_ctc);
    return {
        contact_number: normalizeProfilePhone(talent.contact_number || user?.contact_number || ''),
        joining_period: talent.joining_period || '',
        current_ctc: currentCtc !== '' ? String(currentCtc) : '',
        expected_ctc: expectedCtc !== '' ? String(expectedCtc) : '',
        total_experience: talent.total_experience != null && talent.total_experience !== ''
            ? String(talent.total_experience)
            : '',
        linkedin_id: talent.linkedin_id || '',
    };
}

function validateProfileUpdates(updates) {
    const errors = {};
    const keys = Object.keys(updates);
    if (!keys.length) {
        errors.form = 'Fill at least one field to update.';
        return errors;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'contact_number')) {
        if (!validateContactNo(updates.contact_number)) {
            errors.contact_number = 'Enter a valid 10-digit mobile number.';
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'joining_period')) {
        const np = normalizeJoiningPeriod(updates.joining_period);
        if (!PROFILE_NOTICE_OPTIONS.includes(np)) {
            errors.joining_period = 'Choose a notice period from the list.';
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'total_experience')) {
        if (!parseExperienceYears(updates.total_experience)) {
            errors.total_experience = 'Use years like 3, 5.5, or 4.11.';
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'current_ctc')) {
        const ctc = Number(updates.current_ctc);
        if (!Number.isFinite(ctc)) {
            errors.current_ctc = 'Enter current salary in lakhs (LPA).';
        } else if (ctc > 0 && ctc <= 1) {
            errors.current_ctc = 'Current salary must be more than 1 LPA.';
        } else if (ctc >= 500) {
            errors.current_ctc = 'Current salary looks too high — use lakhs per year.';
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'expected_ctc')) {
        const ctc = Number(updates.expected_ctc);
        if (!Number.isFinite(ctc)) {
            errors.expected_ctc = 'Enter expected salary in lakhs (LPA).';
        } else if (ctc >= 0 && ctc <= 1) {
            errors.expected_ctc = 'Expected salary must be more than 1 LPA.';
        } else if (ctc >= 500) {
            errors.expected_ctc = 'Expected salary looks too high — use lakhs per year.';
        }
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'linkedin_id')) {
        const linkedinId = normalizeLinkedinUrl(updates.linkedin_id);
        if (!validateURL(linkedinId) || !linkedinId.toLowerCase().split('linkedin.com/')[1]) {
            errors.linkedin_id = 'Use a full LinkedIn URL, e.g. https://www.linkedin.com/in/username';
        } else if (!linkedinId.includes('https://')) {
            errors.linkedin_id = 'LinkedIn URL must start with https://';
        }
    }
    return errors;
}

function profileUpdatesFromDraft(draft) {
    const updates = {};
    if (String(draft.contact_number || '').trim()) {
        updates.contact_number = normalizeProfilePhone(draft.contact_number);
    }
    if (String(draft.joining_period || '').trim()) {
        updates.joining_period = normalizeJoiningPeriod(draft.joining_period);
    }
    if (String(draft.current_ctc || '').trim()) {
        const val = parseMoneyLpa(draft.current_ctc);
        if (val != null) updates.current_ctc = val;
    }
    if (String(draft.expected_ctc || '').trim()) {
        const val = parseMoneyLpa(draft.expected_ctc);
        if (val != null) updates.expected_ctc = val;
    }
    if (String(draft.total_experience || '').trim()) {
        const val = parseExperienceYears(draft.total_experience);
        if (val != null) updates.total_experience = val;
    }
    if (String(draft.linkedin_id || '').trim()) {
        updates.linkedin_id = normalizeLinkedinUrl(draft.linkedin_id);
    }
    return updates;
}

function profileSummaryLines(updates) {
    const lines = [];
    if (updates.contact_number) lines.push(`Phone: ${updates.contact_number}`);
    if (updates.joining_period) lines.push(`Notice period: ${updates.joining_period}`);
    if (updates.current_ctc != null) lines.push(`Current CTC: ${updates.current_ctc} LPA`);
    if (updates.expected_ctc != null) lines.push(`Expected CTC: ${updates.expected_ctc} LPA`);
    if (updates.total_experience) lines.push(`Total experience: ${updates.total_experience} years`);
    if (updates.linkedin_id) lines.push(`LinkedIn: ${updates.linkedin_id}`);
    return lines;
}

function emptyOutreachMessageDraft(provider = OUTREACH_PROVIDER_GMAIL) {
    return {
        provider,
        message_template: '',
        message_subject: '',
    };
}

function parseOutreachProvider(raw) {
    const text = String(raw ?? '').trim().toLowerCase();
    if (!text) return null;
    if (text === '1' || text === 'linkedin') return OUTREACH_PROVIDER_LINKEDIN;
    if (text === '2' || text === 'gmail' || text === 'email') return OUTREACH_PROVIDER_GMAIL;
    return null;
}

function outreachProviderLabel(provider) {
    return Number(provider) === OUTREACH_PROVIDER_LINKEDIN ? 'LinkedIn' : 'Gmail';
}

function parseOutreachMessageArguments(args = {}) {
    const src = args && typeof args === 'object' ? args : {};
    const out = {};
    const provider = parseOutreachProvider(src.provider ?? src.channel);
    if (provider) out.provider = provider;
    const body = src.message_template ?? src.message ?? src.body ?? src.template;
    if (body != null && String(body).trim() !== '') {
        out.message_template = String(body);
    }
    const subject = src.message_subject ?? src.subject ?? src.title;
    if (subject != null && String(subject).trim() !== '') {
        out.message_subject = String(subject);
    }
    return out;
}

function validateOutreachMessageDraft({ provider, message_template, message_subject }) {
    const errors = {};
    const body = String(message_template || '').trim();
    if (!body) {
        errors.message_template = 'Outreach message is required.';
    } else {
        const missing = OUTREACH_TEMPLATE_VARS.filter((token) => !body.includes(token));
        if (missing.length) {
            errors.message_template = `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required.`;
        }
    }
    if (Number(provider) === OUTREACH_PROVIDER_GMAIL && !String(message_subject || '').trim()) {
        errors.message_subject = 'Gmail subject is required.';
    }
    return errors;
}

function outreachTemplatesSummary(data = {}) {
    const gmailBody = String(data.gmail_template || '').trim();
    const linkedinBody = String(data.linkedin_template || '').trim();
    const lines = [
        `Gmail subject: ${data.gmail_template_subject?.trim() || 'Not set'}`,
        `Gmail message: ${gmailBody ? `set (${gmailBody.length} chars)` : 'Not set'}`,
        `LinkedIn message: ${linkedinBody ? `set (${linkedinBody.length} chars)` : 'Not set'}`,
    ];
    return {
        lines,
        toolResult: lines.join('\n'),
        cards: {
            type: 'outreach-message-status',
            gmail: {
                subject: data.gmail_template_subject || '',
                message: data.gmail_template || '',
            },
            linkedin: {
                message: data.linkedin_template || '',
            },
            footerTo: MESSAGE_TEMPLATES_PATH,
            footerLabel: 'Open message templates',
        },
    };
}

function fallbackFollowupInterval(value) {
    const days = Number(value);
    return days > 0 ? days : 4;
}

function emptyFollowupDraft() {
    return {
        disabled_followup_gmail: false,
        disabled_followup_linkedin: false,
        interval_days_gmail: 4,
        interval_days_linkedin: 4,
        message_gmail: FOLLOWUP_TEMPLATES_GMAIL[0],
        message_linkedin: FOLLOWUP_TEMPLATES_LINKEDIN[0],
    };
}

function normalizeFollowupSettings(data = {}) {
    return {
        disabled_followup_gmail: data.disabled_followup_gmail ?? data.disabled_followup ?? false,
        disabled_followup_linkedin: data.disabled_followup_linkedin ?? data.disabled_followup ?? false,
        interval_days_gmail: fallbackFollowupInterval(data.interval_days_gmail ?? data.interval_days ?? 4),
        interval_days_linkedin: fallbackFollowupInterval(data.interval_days_linkedin ?? data.interval_days ?? 4),
        message_gmail: data.message_gmail ?? data.message ?? FOLLOWUP_TEMPLATES_GMAIL[0],
        message_linkedin: data.message_linkedin ?? data.message ?? FOLLOWUP_TEMPLATES_LINKEDIN[0],
    };
}

function followupIntervalLabel(days) {
    const match = FOLLOWUP_INTERVAL_OPTIONS.find((item) => item.value === Number(days));
    return match?.label || `After ${days} days`;
}

function parseFollowupChannel(raw) {
    const text = String(raw ?? '').trim().toLowerCase();
    if (!text || text === 'both') return null;
    if (text === 'gmail' || text === 'email') return FOLLOWUP_CHANNEL_GMAIL;
    if (text === 'linkedin') return FOLLOWUP_CHANNEL_LINKEDIN;
    return null;
}

function parseFollowupArguments(args = {}) {
    const src = args && typeof args === 'object' ? args : {};
    const out = {};
    const channel = parseFollowupChannel(src.channel);
    if (channel) out.channel = channel;

    if (src.enabled != null) out.enabled = Boolean(src.enabled);
    if (src.disabled_followup_gmail != null) out.disabled_followup_gmail = Boolean(src.disabled_followup_gmail);
    if (src.disabled_followup_linkedin != null) out.disabled_followup_linkedin = Boolean(src.disabled_followup_linkedin);

    const interval = src.interval_days ?? src.interval;
    if (interval != null && String(interval).trim() !== '') {
        out.interval_days = Number(interval);
    }
    if (src.interval_days_gmail != null) out.interval_days_gmail = Number(src.interval_days_gmail);
    if (src.interval_days_linkedin != null) out.interval_days_linkedin = Number(src.interval_days_linkedin);

    const message = src.message ?? src.message_template ?? src.body;
    if (message != null && String(message).trim() !== '') out.message = String(message);
    if (src.message_gmail != null && String(src.message_gmail).trim() !== '') out.message_gmail = String(src.message_gmail);
    if (src.message_linkedin != null && String(src.message_linkedin).trim() !== '') out.message_linkedin = String(src.message_linkedin);

    return out;
}

function applyFollowupPatch(draft, patch = {}) {
    const next = { ...draft };
    const channel = patch.channel;

    if (patch.enabled != null) {
        if (!channel || channel === FOLLOWUP_CHANNEL_GMAIL) {
            next.disabled_followup_gmail = !patch.enabled;
        }
        if (!channel || channel === FOLLOWUP_CHANNEL_LINKEDIN) {
            next.disabled_followup_linkedin = !patch.enabled;
        }
    }
    if (patch.disabled_followup_gmail != null) next.disabled_followup_gmail = patch.disabled_followup_gmail;
    if (patch.disabled_followup_linkedin != null) next.disabled_followup_linkedin = patch.disabled_followup_linkedin;

    const applyInterval = (field, value) => {
        if (value == null || Number.isNaN(Number(value))) return;
        next[field] = Number(value);
    };

    if (patch.interval_days != null) {
        if (!channel || channel === FOLLOWUP_CHANNEL_GMAIL) applyInterval('interval_days_gmail', patch.interval_days);
        if (!channel || channel === FOLLOWUP_CHANNEL_LINKEDIN) applyInterval('interval_days_linkedin', patch.interval_days);
    }
    applyInterval('interval_days_gmail', patch.interval_days_gmail);
    applyInterval('interval_days_linkedin', patch.interval_days_linkedin);

    if (patch.message != null) {
        if (!channel || channel === FOLLOWUP_CHANNEL_GMAIL) next.message_gmail = patch.message;
        if (!channel || channel === FOLLOWUP_CHANNEL_LINKEDIN) next.message_linkedin = patch.message;
    }
    if (patch.message_gmail != null) next.message_gmail = patch.message_gmail;
    if (patch.message_linkedin != null) next.message_linkedin = patch.message_linkedin;

    return next;
}

function validateFollowupChannel(label, disabled, message) {
    const msg = String(message || '').trim();
    if (disabled || !msg) return null;
    if (!msg.includes('{{outreachEmployee}}')) {
        return `${label}: include {{outreachEmployee}} in the follow-up message.`;
    }
    if (!msg.includes('{{jobTitle}}')) {
        return `${label}: include {{jobTitle}} in the follow-up message.`;
    }
    return null;
}

function validateFollowupDraft(draft, { linkedinConnected = true } = {}) {
    const gmailErr = validateFollowupChannel('Gmail', draft.disabled_followup_gmail, draft.message_gmail);
    if (gmailErr) return gmailErr;
    if (linkedinConnected) {
        const linkedinErr = validateFollowupChannel(
            'LinkedIn',
            draft.disabled_followup_linkedin,
            draft.message_linkedin,
        );
        if (linkedinErr) return linkedinErr;
    }
    return null;
}

function followupPostPayload(draft) {
    return {
        disabled_followup_gmail: draft.disabled_followup_gmail,
        disabled_followup_linkedin: draft.disabled_followup_linkedin,
        interval_days_gmail: fallbackFollowupInterval(draft.interval_days_gmail),
        interval_days_linkedin: fallbackFollowupInterval(draft.interval_days_linkedin),
        channel: 'both',
        message_gmail: draft.message_gmail || null,
        message_linkedin: draft.message_linkedin || null,
    };
}

function followupSettingsSummary(settings) {
    const lines = [
        `Gmail: ${settings.disabled_followup_gmail ? 'Disabled' : 'Enabled'} · ${followupIntervalLabel(settings.interval_days_gmail)}`,
        `LinkedIn: ${settings.disabled_followup_linkedin ? 'Disabled' : 'Enabled'} · ${followupIntervalLabel(settings.interval_days_linkedin)}`,
    ];
    return {
        lines,
        toolResult: lines.join('\n'),
        cards: {
            type: 'followup-settings-status',
            settings,
            footerTo: FOLLOWUP_SETTINGS_PATH,
            footerLabel: 'Open follow-up settings',
        },
    };
}

function mergeProfileDraft(base, patch = {}) {
    return {
        ...base,
        ...Object.fromEntries(
            Object.entries(patch).map(([key, value]) => {
                if (value == null) return [key, base[key]];
                if (key === 'contact_number') return [key, normalizeProfilePhone(value)];
                if (key === 'joining_period') return [key, normalizeJoiningPeriod(value)];
                if (key === 'linkedin_id') return [key, normalizeLinkedinUrl(value)];
                if (key === 'current_ctc' || key === 'expected_ctc') {
                    const num = parseMoneyLpa(value);
                    return [key, num != null ? String(num) : String(value)];
                }
                if (key === 'total_experience') {
                    const exp = parseExperienceYears(value);
                    return [key, exp != null ? String(exp) : String(value)];
                }
                return [key, String(value)];
            }),
        ),
    };
}

// The AI provider and model are resolved server-side from config/happpy_chat.php.
const CHAT_API = `${API_URL}talent/happpy-chat`;

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
        {name}
    </span>
);

const HapppyRecommendedJobDescriptionModal = ({ modal, onClose }) => {
    useEffect(() => {
        if (!modal?.open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [modal?.open]);

    useEffect(() => {
        if (!modal?.open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [modal?.open, onClose]);

    if (!modal?.open || typeof document === 'undefined') return null;

    return createPortal(
        <div
            className="happpy-chatbot__jd-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="happpy-chatbot__jd-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="happpy-chatbot-jd-title"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="happpy-chatbot__jd-head">
                    <div className="happpy-chatbot__jd-heading">
                        <h3 id="happpy-chatbot-jd-title" className="happpy-chatbot__jd-title">
                            {modal.title}
                        </h3>
                        <p className="happpy-chatbot__jd-company">{modal.company}</p>
                    </div>
                    <button
                        type="button"
                        className="happpy-chatbot__jd-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <MatIcon name="close" aria-hidden />
                    </button>
                </div>
                <div className="happpy-chatbot__jd-body">
                    {modal.loading ? (
                        <p className="happpy-chatbot__jd-loading">Loading description…</p>
                    ) : (
                        <div
                            className="happpy-chatbot__jd-html"
                            dangerouslySetInnerHTML={{ __html: modal.descriptionHtml }}
                        />
                    )}
                </div>
                {modal.applyUrl ? (
                    <div className="happpy-chatbot__jd-foot">
                        <a
                            className="happpy-chatbot__mini-btn"
                            href={modal.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Open full job
                        </a>
                    </div>
                ) : null}
            </div>
        </div>,
        document.body,
    );
};

const HapppyRecommendedJobsCards = ({
    cards,
    brokenRecommendedLogos,
    setBrokenRecommendedLogos,
    runningJobId,
    onRun,
    onOpenDescription,
}) => {
    const [expanded, setExpanded] = useState(false);
    const items = Array.isArray(cards?.items) ? cards.items : [];
    const initialCount = Math.min(RECOMMENDED_INITIAL_COUNT, items.length);
    const visibleItems = expanded ? items : items.slice(0, initialCount);
    const hiddenCount = Math.max(0, items.length - initialCount);

    return (
        <div className="happpy-chatbot__cards happpy-chatbot__cards--recommended">
            {cards.filterSummary ? (
                <p className="happpy-chatbot__rec-filter-note">
                    Filters:
                    {' '}
                    {cards.filterSummary}
                </p>
            ) : null}
            {visibleItems.map((job, idx) => {
                const display = jobDisplay(job);
                const jobKey = getRecommendedJobStableKey(job, idx);
                const logoUrl = normalizeCompanyLogo(job.company_logo);
                const hasLogo = !!logoUrl && !brokenRecommendedLogos[jobKey];
                const yoeText = formatRecommendedYoe(job.YearOfExp, job.max_yoe);
                const postedAgo = formatPostedAgo(job.publish_datetime);
                const metaParts = [
                    job.city,
                    job.ModeOfWork,
                    yoeText,
                    postedAgo ? `Posted ${postedAgo}` : '',
                ].filter(Boolean);
                return (
                    <article key={jobKey} className="happpy-chatbot__card happpy-chatbot__card--recommended">
                        <div className="happpy-chatbot__rec-main">
                            <span className="happpy-chatbot__rec-logo-wrap" aria-hidden>
                                {hasLogo ? (
                                    <img
                                        className="happpy-chatbot__rec-logo"
                                        src={logoUrl}
                                        alt=""
                                        width={32}
                                        height={32}
                                        onError={() => {
                                            setBrokenRecommendedLogos((prev) => ({
                                                ...prev,
                                                [jobKey]: true,
                                            }));
                                        }}
                                    />
                                ) : (
                                    <span className="happpy-chatbot__rec-logo-placeholder">
                                        <MatIcon name="business" />
                                    </span>
                                )}
                            </span>
                            <div className="happpy-chatbot__rec-info">
                                <p className="happpy-chatbot__card-title" title={display.title}>
                                    {job.RequestForTalent || display.title}
                                </p>
                                <p className="happpy-chatbot__card-meta" title={display.company}>
                                    {job.company_name || display.company || 'Company'}
                                </p>
                                {metaParts.length ? (
                                    <p className="happpy-chatbot__rec-meta-line" title={metaParts.join(' · ')}>
                                        {metaParts.join(' · ')}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        <div className="happpy-chatbot__rec-actions">
                            <button
                                type="button"
                                className="happpy-chatbot__mini-btn"
                                onClick={() => onOpenDescription(job)}
                            >
                                Description
                            </button>
                            <button
                                type="button"
                                className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                                disabled={runningJobId === job.id}
                                onClick={() => onRun(job)}
                            >
                                {runningJobId === job.id ? 'Starting…' : 'Run'}
                            </button>
                        </div>
                    </article>
                );
            })}
            {hiddenCount > 0 && !expanded ? (
                <button
                    type="button"
                    className="happpy-chatbot__mini-btn happpy-chatbot__rec-show-more"
                    onClick={() => setExpanded(true)}
                >
                    Show
                    {' '}
                    {hiddenCount}
                    {' '}
                    more
                </button>
            ) : null}
            {expanded && hiddenCount > 0 ? (
                <button
                    type="button"
                    className="happpy-chatbot__mini-btn happpy-chatbot__rec-show-more"
                    onClick={() => setExpanded(false)}
                >
                    Show less
                </button>
            ) : null}
            {cards.footerTo ? (
                <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                    {cards.footerLabel}
                </Link>
            ) : null}
        </div>
    );
};

function unwrapApiData(res) {
    const body = res?.data;
    if (
        body
        && (
            (Number(body.status) >= 200 && Number(body.status) < 300)
            || body.status === 'success'
        )
        && body.data !== undefined
    ) {
        return body.data;
    }
    return null;
}

function extractHttpUrl(text) {
    const match = String(text || '').match(URL_RE);
    return match ? match[0].replace(/[.,;)]+$/, '') : '';
}

function isValidHttpUrl(raw) {
    try {
        const u = new URL((raw || '').trim());
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

function nextId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatWhen(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatPlanDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function describePlan(planState) {
    const creditPlan = Number(planState?.credit_plan);
    const creditLeft = Number(planState?.credit_left);
    if (creditPlan === 1 && creditLeft > 0) {
        return `Light Plan · ${creditLeft} ${creditLeft === 1 ? 'job' : 'jobs'} left`;
    }
    if (planState?.has_plan_expired) return 'Plan expired';
    if (Number(planState?.plan) === 2) {
        const till = formatPlanDate(planState?.plan_end_date);
        return till ? `Paid Plan · Valid till ${till}` : 'Paid Plan';
    }
    if (planState?.plan != null && planState?.plan !== '') return 'Free trial';
    return 'No plan';
}

function companyLabel(row) {
    return String(row?.company_name || row?.name || row?.company_id || 'Company').trim();
}

function parseTicketItems(text) {
    const raw = String(text || '');
    if (!/Recent tickets:|Ticket status page:/i.test(raw) && !/\d+\.\s+\S+\s+\(\d{4}-\d{2}-\d{2}T/.test(raw)) {
        return [];
    }
    const body = raw.replace(/^[\s\S]*?(?:Recent tickets:\s*)/i, '');
    const items = [];
    const re = /(\d+)\.\s+([A-Za-z_]+)(?:\s+\(([^)]+)\))?(?:\s+[·•-]\s+([^—\n]+))?\s*[—-]\s+(.+?)(?=\s+\d+\.\s+[A-Za-z_]+(?:\s+\(|\s+[·•-])|\s*$)/g;
    let match = re.exec(body);
    while (match) {
        items.push({
            status: match[2],
            created_at: (match[3] || match[4] || '').trim(),
            message: match[5].trim(),
        });
        match = re.exec(body);
    }
    return items;
}

function parseAccountCard(text) {
    const raw = String(text || '');
    if (!/Gmail:/i.test(raw) || !/LinkedIn:/i.test(raw)) return null;
    const gmail = raw.match(/Gmail:\s*(.+?)(?=\s+LinkedIn:|$)/i);
    const linkedin = raw.match(/LinkedIn:\s*(.+?)(?=\s+Resume(?: on file)?:|$)/i);
    const resume = raw.match(/Resume(?: on file)?:\s*(.+?)\s*$/i);
    if (!gmail && !linkedin) return null;
    const resumeValue = resume ? resume[1].trim() : '';
    return {
        type: 'account',
        gmailLine: gmail ? `Gmail: ${gmail[1].trim()}` : null,
        linkedinLine: linkedin ? `LinkedIn: ${linkedin[1].trim()}` : null,
        resume: resumeValue && !/^none$/i.test(resumeValue) ? resumeValue : null,
    };
}

function cardsFromDump(text, existing) {
    if (
        existing?.type === 'tickets'
        || existing?.type === 'account'
        || existing?.type === 'ticket-form'
        || existing?.type === 'plan'
        || existing?.type === 'info'
        || existing?.type === 'disconnect-form'
        || existing?.type === 'outreach-mode'
        || existing?.type === 'blocked-companies'
    ) {
        return existing;
    }
    const tickets = parseTicketItems(text);
    if (tickets.length) {
        return {
            type: 'tickets',
            items: tickets,
            footerTo: TICKET_STATUS_PATH,
            footerLabel: 'Open ticket status',
        };
    }
    return parseAccountCard(text) || existing || null;
}

function formatReadableMessage(text) {
    let out = String(text || '').replace(/\r\n/g, '\n').trim();
    if (!out) return '';
    out = out.replace(/:\s+(?=\d+\.\s)/g, ':\n');
    out = out.replace(/([^\n])\s+(\d+)\.\s+/g, '$1\n$2. ');
    out = out.replace(/([.!?])\s+[-–—]\s+/g, '$1\n- ');
    out = out.replace(/([.!?])\s+((?:If you|I can|Want me|Let me|Would you|Feel free|Need me))/gi, '$1\n$2');
    return out.replace(/\n{3,}/g, '\n\n').trim();
}

function stripStructuredDump(text) {
    const raw = String(text || '');
    const next = raw
        .replace(/\s*Ticket status page:\s*\S+/i, '')
        .replace(/\s*Recent tickets:\s*[\s\S]*$/i, '')
        .replace(/\s*Gmail:\s*.+?(?:\s+LinkedIn:\s*.+?)?(?:\s+Resume(?: on file)?:.+)?\s*$/i, '')
        .trim();
    return formatReadableMessage(next || raw);
}

function breakStatusLines(text) {
    return formatReadableMessage(String(text || '')
        .replace(/\s+Ticket status page:/g, '\nTicket status page:')
        .replace(/\s+Recent tickets:/g, '\n\nRecent tickets:')
        .replace(/\s+(Gmail:)/g, '\n$1')
        .replace(/\s+(LinkedIn:)/g, '\n$1')
        .replace(/\s+(Resume on file:)/g, '\n$1'));
}

function visibleAssistantText(msg, cards) {
    const stripped = stripStructuredDump(msg?.text);
    if (stripped) return stripped;
    if (cards?.type === 'tickets') return 'Here are your recent support tickets.';
    if (cards?.type === 'account') return 'Here is your connected account status.';
    if (cards?.type === 'plan') return 'Here is your current HAPPPY plan.';
    if (cards?.type === 'info') return 'Here is your current HAPPPY info.';
    if (cards?.type === 'outreach-mode') return 'Here is your outreach mode.';
    if (cards?.type === 'blocked-companies') return 'Here are the companies HAPPPY will skip.';
    if (cards?.type === 'profile-form') return 'Update your profile details in the form below.';
    if (cards?.type === 'outreach-message-status') return 'Here are your default outreach messages.';
    if (cards?.type === 'outreach-message-form') return 'Update your default outreach message below.';
    if (cards?.type === 'followup-settings-status') return 'Here are your Gmail and LinkedIn follow-up settings.';
    if (cards?.type === 'followup-settings-form') return 'Update your follow-up settings below.';
    return breakStatusLines(msg?.text || '');
}

function cardsForStoredTool(toolName, toolResult) {
    if (toolName === 'upload_resume') return { type: 'resume-upload' };
    if (toolName === 'update_real_name') return { type: 'real-name-form' };
    if (toolName === 'update_talent_profile') return { type: 'profile-form' };
    if (toolName === 'show_outreach_default_message') return { type: 'outreach-message-status' };
    if (toolName === 'update_outreach_default_message') {
        if (/Update your default outreach message below/i.test(String(toolResult || ''))) {
            return { type: 'outreach-message-form' };
        }
        return { type: 'outreach-message-status' };
    }
    if (toolName === 'show_followup_settings') return { type: 'followup-settings-status' };
    if (toolName === 'update_followup_settings') {
        if (/Update your follow-up settings below/i.test(String(toolResult || ''))) {
            return { type: 'followup-settings-form' };
        }
        return { type: 'followup-settings-status' };
    }
    if (toolName === 'onboarding') {
        const raw = String(toolResult || '');
        if (/upload your resume|Choose a PDF|PDF or DOCX resume/i.test(raw)) {
            return { type: 'resume-upload' };
        }
    }
    if (toolName === 'connect_linkedin') return { type: 'linkedin-form' };
    if (toolName === 'show_account_status') {
        return parseAccountCard(toolResult) || { type: 'account' };
    }
    if (toolName === 'show_ticket_status' || toolName === 'raise_ticket') {
        return {
            type: 'tickets',
            items: parseTicketItems(toolResult),
            footerTo: TICKET_STATUS_PATH,
            footerLabel: 'Open ticket status',
        };
    }
    return null;
}

function shouldShowToolResult(msg) {
    const result = String(msg?.toolResult || '');
    if (!result || result === String(msg?.text || '')) return false;
    const type = msg?.cards?.type;
    if (
        type === 'faq'
        || type === 'queue'
        || type === 'recommended'
        || type === 'runs'
        || type === 'replies'
        || type === 'tickets'
        || type === 'account'
        || type === 'ticket-form'
        || type === 'plan'
        || type === 'info'
        || type === 'disconnect-form'
        || type === 'outreach-mode'
        || type === 'blocked-companies'
        || type === 'profile-form'
        || type === 'outreach-message-status'
        || type === 'outreach-message-form'
        || type === 'followup-settings-status'
        || type === 'followup-settings-form'
    ) {
        return false;
    }
    if (parseTicketItems(result).length || parseAccountCard(result)) return false;
    return true;
}

function formatChatExport({ sessionId, title, summary, messages }) {
    const lines = [
        '# HAPPPY Chat export',
        `Exported at: ${new Date().toISOString()}`,
        sessionId ? `Session: ${sessionId}` : 'Session: unsaved',
        title ? `Title: ${title}` : null,
        summary ? `Summary: ${summary}` : null,
        '',
        '---',
        '',
    ].filter((line) => line !== null);

    messages.forEach((msg) => {
        const who = msg.role === 'user' ? 'You' : 'HAPPPY';
        lines.push(`${who}:`);
        lines.push(msg.text || '');
        if (msg.toolName) {
            const url = msg.toolArguments?.url ? ` url=${msg.toolArguments.url}` : '';
            lines.push(`[tool: ${msg.toolName}${url}]`);
        }
        if (msg.toolResult) {
            lines.push(`[result: ${msg.toolResult}]`);
        }
        if (msg.cards?.type) {
            lines.push(`[cards: ${msg.cards.type}]`);
        }
        lines.push('');
    });

    return lines.join('\n').trim();
}

function formatThreadStamp(date = new Date()) {
    const time = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const today = new Date();
    const sameDay = date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
    const day = sameDay
        ? 'Today'
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${day} • ${time}`;
}

function accountEmail(account) {
    return String(account?.email || account?.gmail_email || '').trim();
}

function formatAccountLine(label, account) {
    if (!account || Number(account.status) !== 2) {
        if (Number(account?.status) === 1) {
            const email = accountEmail(account);
            return email ? `${label}: needs verification (${email})` : `${label}: needs verification`;
        }
        return `${label}: not connected`;
    }
    const email = accountEmail(account);
    return email ? `${label}: connected as ${email}` : `${label}: connected`;
}

function looksLikeHost(value) {
    const text = String(value || '').trim();
    if (!text) return false;
    return /^(https?:\/\/|www\.)/i.test(text) || /^[a-z0-9.-]+\.[a-z]{2,}(?:\/|$)/i.test(text);
}

function hostFromUrl(url) {
    try {
        return new URL(url).hostname.replace(/^www\./i, '');
    } catch {
        return '';
    }
}

function jobDisplay(job) {
    const rawTitle = String(job?.RequestForTalent || job?.job_title || job?.jobTitle || '').trim();
    const rawCompany = String(job?.company_name || job?.companyName || '').trim();
    const sourceLabel = String(job?.title || '').trim();
    const link = job?.external_link || job?.apply_url || job?.applyUrl || '';
    const host = hostFromUrl(link) || (looksLikeHost(sourceLabel) ? sourceLabel.replace(/^www\./i, '') : '');
    const title = rawTitle && !looksLikeHost(rawTitle)
        ? rawTitle
        : (looksLikeHost(sourceLabel) ? (host ? `Job on ${host}` : 'Queued job') : (sourceLabel || 'Queued job'));
    const company = rawCompany
        || (!looksLikeHost(sourceLabel) ? sourceLabel : '')
        || '';
    const date = job?.date || job?.appliedDate || '';
    const source = job?.external
        ? 'Extension'
        : (host.includes('linkedin') ? 'LinkedIn' : host);

    return { title, company, date, source, host };
}

function formatJobLine(job, index) {
    const display = jobDisplay(job);
    const bits = [display.title];
    if (display.company) bits.push(`at ${display.company}`);
    if (display.date) bits.push(`· ${display.date}`);
    else if (display.source) bits.push(`· ${display.source}`);
    return `${index + 1}. ${bits.join(' ')}`;
}

const RECOMMENDED_JD_FALLBACK = 'Job description is not available for this role right now.';
const RECOMMENDED_FETCH_MAX = 25;
const RECOMMENDED_DISPLAY_MAX = 12;
/** In-chat recommended tool: show this many cards before "Show more" (no inner scroll). */
const RECOMMENDED_INITIAL_COUNT = 3;
const RECOMMENDED_RUN_MAX = 6;

function normalizeCompanyLogo(value) {
    if (typeof value !== 'string') return '';
    const cleaned = value.trim();
    if (!cleaned) return '';
    const lower = cleaned.toLowerCase();
    if (lower === 'null' || lower === 'undefined' || lower === 'n/a' || lower === 'na') return '';
    return cleaned;
}

function formatRecommendedYoe(min, max) {
    const low = Number(min) || 0;
    const high = Number(max) || 0;
    if (low === 0 && high === 0) return '';
    if (low === 0 && high !== 0) return `${high.toFixed(1)} yrs`;
    if (low !== 0 && high === 0) return `${low.toFixed(1)} yrs`;
    return `${low.toFixed(1)}–${high.toFixed(1)} yrs`;
}

function formatPostedAgo(value) {
    if (!value) return '';
    const dt = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return '';
    const diffMs = Date.now() - dt.getTime();
    if (diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

function escapeHtmlForJd(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDescriptionHtml(raw, fallbackText = RECOMMENDED_JD_FALLBACK) {
    const input = String(raw || '').trim();
    if (!input) return `<p>${escapeHtmlForJd(fallbackText)}</p>`;
    const safe = input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    if (/[<][a-zA-Z!/]/.test(safe)) return safe;
    return `<p>${escapeHtmlForJd(safe).replace(/\n/g, '<br/>')}</p>`;
}

function getRecommendedJobStableKey(job, idx = 0) {
    if (job?.id != null) return `id-${job.id}`;
    if (job?.HR_Number != null) return `hr-${job.HR_Number}`;
    if (job?.apply_url) return `url-${job.apply_url}`;
    return `idx-${idx}`;
}

function parseRecommendedJobsFilters(args = {}) {
    const src = args && typeof args === 'object' ? args : {};
    const filters = {};
    const city = src.city ?? src.location;
    if (city != null && String(city).trim()) filters.city = String(city).trim();
    const company = src.company ?? src.company_name;
    if (company != null && String(company).trim()) filters.company = String(company).trim();
    const keyword = src.keyword ?? src.query ?? src.title ?? src.search;
    if (keyword != null && String(keyword).trim()) filters.keyword = String(keyword).trim();

    const remoteFlag = src.remote_only ?? src.remote_only_jobs ?? src.remote;
    if (remoteFlag === true || remoteFlag === 1 || String(remoteFlag).toLowerCase() === 'true') {
        filters.modeOfWork = 'Remote';
    } else {
        const mode = src.mode_of_work ?? src.mode ?? src.work_mode;
        if (mode != null && String(mode).trim()) {
            const m = String(mode).trim().toLowerCase();
            if (m.includes('remote')) filters.modeOfWork = 'Remote';
            else if (m.includes('hybrid')) filters.modeOfWork = 'Hybrid';
            else if (m.includes('office') || m.includes('on-site') || m.includes('onsite')) filters.modeOfWork = 'On-site';
            else filters.modeOfWork = String(mode).trim();
        }
    }

    const minYoe = src.min_yoe ?? src.min_experience ?? src.experience_min;
    const maxYoe = src.max_yoe ?? src.max_experience ?? src.experience_max;
    if (minYoe != null && String(minYoe).trim() !== '') {
        const n = Number(minYoe);
        if (Number.isFinite(n)) filters.minYoe = n;
    }
    if (maxYoe != null && String(maxYoe).trim() !== '') {
        const n = Number(maxYoe);
        if (Number.isFinite(n)) filters.maxYoe = n;
    }

    const limitRaw = src.limit ?? src.count;
    if (limitRaw != null && String(limitRaw).trim() !== '') {
        const n = Math.min(RECOMMENDED_DISPLAY_MAX, Math.max(1, parseInt(limitRaw, 10) || 8));
        filters.limit = n;
    }

    return filters;
}

function recommendedJobsHasFilters(filters = {}) {
    return Boolean(
        filters.city
        || filters.company
        || filters.keyword
        || filters.modeOfWork
        || filters.minYoe != null
        || filters.maxYoe != null,
    );
}

function jobModeMatchesFilter(job, modeFilter) {
    const jobMode = String(job?.ModeOfWork || '').trim().toLowerCase();
    const want = String(modeFilter || '').trim().toLowerCase();
    if (!want) return true;
    if (want === 'remote') return jobMode.includes('remote');
    if (want === 'hybrid') return jobMode.includes('hybrid');
    if (want === 'on-site' || want === 'onsite') {
        return jobMode.includes('office') || jobMode.includes('site') || jobMode.includes('on-site');
    }
    return jobMode.includes(want);
}

function filterRecommendedJobs(jobs, filters = {}) {
    const list = Array.isArray(jobs) ? jobs : [];
    if (!recommendedJobsHasFilters(filters)) return list;

    return list.filter((job) => {
        if (filters.city) {
            const city = String(job?.city || '').toLowerCase();
            if (!city.includes(filters.city.toLowerCase())) return false;
        }
        if (filters.company) {
            const company = String(job?.company_name || '').toLowerCase();
            if (!company.includes(filters.company.toLowerCase())) return false;
        }
        if (filters.keyword) {
            const needle = filters.keyword.toLowerCase();
            const hay = [
                job?.RequestForTalent,
                job?.company_name,
                job?.description,
            ].map((part) => String(part || '').toLowerCase()).join(' ');
            if (!hay.includes(needle)) return false;
        }
        if (filters.modeOfWork && !jobModeMatchesFilter(job, filters.modeOfWork)) return false;

        const jobMin = Number(job?.YearOfExp) || 0;
        const jobMax = Number(job?.max_yoe) || jobMin || 0;
        if (filters.minYoe != null) {
            const effectiveMax = jobMax > 0 ? jobMax : jobMin;
            if (effectiveMax < filters.minYoe) return false;
        }
        if (filters.maxYoe != null && jobMin > filters.maxYoe) return false;

        return true;
    });
}

function formatRecommendedJobsFilterSummary(filters = {}) {
    const parts = [];
    if (filters.city) parts.push(`city: ${filters.city}`);
    if (filters.company) parts.push(`company: ${filters.company}`);
    if (filters.keyword) parts.push(`keyword: ${filters.keyword}`);
    if (filters.modeOfWork) parts.push(`work mode: ${filters.modeOfWork}`);
    if (filters.minYoe != null) parts.push(`min experience: ${filters.minYoe} yrs`);
    if (filters.maxYoe != null) parts.push(`max experience: ${filters.maxYoe} yrs`);
    return parts.join(' · ');
}

function formatRecommendedJobLine(job, index) {
    const title = job?.RequestForTalent || jobDisplay(job).title;
    const company = job?.company_name || jobDisplay(job).company;
    const bits = [title];
    if (company) bits.push(`at ${company}`);
    if (job?.city) bits.push(`· ${job.city}`);
    if (job?.ModeOfWork) bits.push(`· ${job.ModeOfWork}`);
    const yoe = formatRecommendedYoe(job?.YearOfExp, job?.max_yoe);
    if (yoe) bits.push(`· ${yoe}`);
    const idSuffix = job?.id != null ? ` · job_id: ${job.id}` : '';
    return `${index + 1}. ${bits.join(' ')}${idSuffix}`;
}

function parseRecommendedJobsFromToolResult(text) {
    const jobs = [];
    String(text || '').split('\n').forEach((line) => {
        const idMatch = line.match(/job_id:\s*(\d+)/i);
        if (!idMatch) return;
        const id = Number(idMatch[1]);
        if (!Number.isFinite(id)) return;
        let head = line.replace(/\s*·\s*job_id:\s*\d+.*$/i, '').replace(/^\s*\d+\.\s*/, '').trim();
        let title = head;
        let company = '';
        const atIdx = head.search(/\s+at\s+/i);
        if (atIdx > 0) {
            title = head.slice(0, atIdx).trim();
            company = head.slice(atIdx).replace(/^\s+at\s+/i, '').trim();
            company = company.split('·')[0].trim();
        }
        jobs.push({
            id,
            RequestForTalent: title || 'Role',
            company_name: company,
        });
    });
    return jobs;
}

function findLastRecommendedJobList(messages, cacheRef) {
    const list = Array.isArray(messages) ? messages : [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
        const msg = list[i];
        if (msg?.role !== 'assistant') continue;
        if (msg.cards?.type === 'recommended' && Array.isArray(msg.cards.items) && msg.cards.items.length) {
            return msg.cards.items;
        }
        if (
            msg.toolName === 'show_recommended_jobs'
            || /^Recommended jobs \(/i.test(String(msg.toolResult || ''))
        ) {
            const parsed = parseRecommendedJobsFromToolResult(msg.toolResult);
            if (parsed.length) return parsed;
        }
    }
    if (cacheRef?.current?.jobs?.length) {
        return cacheRef.current.jobs;
    }
    return [];
}

function resolveRecommendedJobsToRun(args, jobList) {
    if (!Array.isArray(jobList) || !jobList.length) return [];
    const src = args && typeof args === 'object' ? args : {};
    const seen = new Set();
    const out = [];

    const addJob = (job) => {
        const id = Number(job?.id);
        if (!Number.isFinite(id) || seen.has(id)) return;
        seen.add(id);
        out.push(job);
    };

    if (src.all === true || src.run_all === true || src.all_in_list === true) {
        jobList.forEach(addJob);
    } else if (src.all_visible === true || src.visible_only === true) {
        jobList.slice(0, RECOMMENDED_INITIAL_COUNT).forEach(addJob);
    } else if (src.first === true || src.first_job === true) {
        addJob(jobList[0]);
    } else {
        const rawIds = src.job_ids ?? src.job_id ?? src.ids;
        const idList = Array.isArray(rawIds) ? rawIds : (rawIds != null ? [rawIds] : []);
        idList.forEach((rawId) => {
            const job = jobList.find((item) => Number(item.id) === Number(rawId));
            if (job) addJob(job);
        });

        const rawIndices = src.indices ?? src.index ?? src.positions ?? src.rank;
        const indexList = Array.isArray(rawIndices) ? rawIndices : (rawIndices != null ? [rawIndices] : []);
        indexList.forEach((rawIndex) => {
            const n = parseInt(rawIndex, 10);
            if (Number.isFinite(n) && n >= 1 && n <= jobList.length) {
                addJob(jobList[n - 1]);
            }
        });

        const companyNeedle = src.company ?? src.company_name;
        if (companyNeedle && !out.length) {
            const needle = String(companyNeedle).trim().toLowerCase();
            jobList.forEach((job) => {
                if (String(job?.company_name || '').toLowerCase().includes(needle)) {
                    addJob(job);
                }
            });
        }
    }

    return out.slice(0, RECOMMENDED_RUN_MAX);
}

function describeRecommendedJob(job) {
    const title = job?.RequestForTalent || jobDisplay(job).title;
    const company = job?.company_name || jobDisplay(job).company;
    return company ? `${title} at ${company}` : title;
}

function extractOutreachList(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.list)) return payload.list;
    if (Array.isArray(payload?.data)) return payload.data;
    if (payload?.list && typeof payload.list === 'object') return Object.values(payload.list);
    return [];
}

function flattenReplyCards(jobs, tone) {
    const cards = [];
    (jobs || []).forEach((job) => {
        const replies = Array.isArray(job.replies) ? job.replies : [];
        const matched = replies.filter((reply) => !tone || reply.sentiment === tone);
        if (!matched.length) {
            cards.push({
                id: job.id,
                jobTitle: job.jobTitle || job.job_title || 'Role',
                companyName: job.companyName || job.company_name || 'Company',
            });
            return;
        }
        matched.forEach((reply) => {
            cards.push({
                id: `${job.id}-${reply.id}`,
                jobTitle: job.jobTitle || job.job_title || 'Role',
                companyName: job.companyName || job.company_name || 'Company',
                senderName: reply.senderName,
                senderEmail: reply.senderEmail,
                source: reply.source,
            });
        });
    });
    return cards;
}

function formatReplyLine(card, index) {
    const who = card.senderName ? ` — ${card.senderName}` : '';
    const via = card.source ? ` via ${card.source}` : '';
    return `${index + 1}. ${card.jobTitle} at ${card.companyName}${who}${via}`;
}

function statusLabel(status) {
    return String(status || 'pending')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ticketStatusLine(row, index) {
    const status = statusLabel(row.status || 'pending');
    const when = formatWhen(row.created_at || row.raised_at);
    const snippet = String(row.message || '').replace(/\s+/g, ' ').slice(0, 80);
    return `${index + 1}. ${status}${when ? ` · ${when}` : ''}${snippet ? ` — ${snippet}` : ''}`;
}

const FollowupStatusPanel = ({ cards, onLoad }) => {
    const [settings, setSettings] = useState(cards.settings || null);
    const [loading, setLoading] = useState(!cards.settings);

    useEffect(() => {
        if (cards.settings) {
            setSettings(cards.settings);
            setLoading(false);
            return undefined;
        }
        let cancelled = false;
        onLoad()
            .then((data) => {
                if (!cancelled) setSettings(data);
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [cards.settings, onLoad]);

    if (loading) {
        return <p className="happpy-chatbot__status-line">Loading follow-up settings…</p>;
    }
    if (!settings) {
        return <p className="happpy-chatbot__status-line">Could not load follow-up settings.</p>;
    }

    const channelBlock = (label, disabled, intervalDays, message) => {
        const msg = String(message || '').trim();
        return (
            <>
                <p className="happpy-chatbot__card-title">{label}</p>
                <p className="happpy-chatbot__status-line">
                    {disabled ? 'Disabled' : `Enabled · ${followupIntervalLabel(intervalDays)}`}
                </p>
                {!disabled && msg ? (
                    <p className="happpy-chatbot__followup-preview">{msg}</p>
                ) : null}
            </>
        );
    };

    return (
        <div className="happpy-chatbot__cards">
            <article className="happpy-chatbot__card happpy-chatbot__card--status">
                {channelBlock(
                    'Gmail follow-up',
                    settings.disabled_followup_gmail,
                    settings.interval_days_gmail,
                    settings.message_gmail,
                )}
            </article>
            <article className="happpy-chatbot__card happpy-chatbot__card--status">
                {channelBlock(
                    'LinkedIn follow-up',
                    settings.disabled_followup_linkedin,
                    settings.interval_days_linkedin,
                    settings.message_linkedin,
                )}
            </article>
            {cards.footerTo ? (
                <Link to={cards.footerTo} className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary">
                    {cards.footerLabel || 'Open follow-up settings'}
                </Link>
            ) : null}
        </div>
    );
};

const TypingDots = () => (
    <span className="happpy-chatbot__typing" aria-hidden>
        <span />
        <span />
        <span />
    </span>
);

function prefersReducedMotion() {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const TypewriterText = ({ text, active, onTick, onDone }) => {
    const full = String(text || '');
    const skip = !active || prefersReducedMotion() || full === '';
    const [shown, setShown] = useState(skip ? full : '');
    const onTickRef = useRef(onTick);
    const onDoneRef = useRef(onDone);
    onTickRef.current = onTick;
    onDoneRef.current = onDone;

    useEffect(() => {
        if (skip) {
            setShown(full);
            onDoneRef.current?.();
            return undefined;
        }
        setShown('');
        let index = 0;
        const chunk = full.length > 220 ? 4 : full.length > 100 ? 2 : 1;
        const delay = full.length > 220 ? 10 : 16;
        const timer = window.setInterval(() => {
            index = Math.min(full.length, index + chunk);
            setShown(full.slice(0, index));
            onTickRef.current?.();
            if (index >= full.length) {
                window.clearInterval(timer);
                onDoneRef.current?.();
            }
        }, delay);
        return () => window.clearInterval(timer);
    }, [full, skip]);

    return shown;
};

const TypedAssistantBlock = ({ msg, renderCards, onTick }) => {
    const shouldAnimate = Boolean(msg.animate) && !prefersReducedMotion();
    const [ready, setReady] = useState(!shouldAnimate);
    const cards = cardsFromDump(`${msg.text || ''}\n${msg.toolResult || ''}`, msg.cards);
    const displayText = visibleAssistantText({ ...msg, cards }, cards);

    return (
        <>
            <div className="happpy-chatbot__bubble">
                <TypewriterText
                    text={displayText}
                    active={shouldAnimate}
                    onTick={onTick}
                    onDone={() => setReady(true)}
                />
                {shouldAnimate && !ready ? (
                    <span className="happpy-chatbot__caret" aria-hidden />
                ) : null}
            </div>
            {ready ? (
                <>
                    {shouldShowToolResult({ ...msg, cards }) ? (
                        <div className="happpy-chatbot__tool-result">{breakStatusLines(msg.toolResult)}</div>
                    ) : null}
                    {renderCards(cards)}
                </>
            ) : null}
        </>
    );
};

const HapppyChatbot = ({ variant = 'dock' } = {}) => {
    const isFullscreen = variant === 'fullscreen';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const happpyAgent = useSelector((state) => state.happpyAgent);
    const [open, setOpen] = useState(isFullscreen);
    const [busy, setBusy] = useState(false);
    const [draft, setDraft] = useState('');
    const [pendingTool, setPendingTool] = useState(null);
    const [linkedinForm, setLinkedinForm] = useState({ email: '', password: '', code: '' });
    const [linkedinNeedsCode, setLinkedinNeedsCode] = useState(false);
    const [ticketDraft, setTicketDraft] = useState('');
    const [disconnectDraft, setDisconnectDraft] = useState('');
    const [realNameDraft, setRealNameDraft] = useState('');
    const [profileDraft, setProfileDraft] = useState(emptyProfileDraft);
    const [outreachMessageDraft, setOutreachMessageDraft] = useState(emptyOutreachMessageDraft());
    const [outreachShowHtmlSource, setOutreachShowHtmlSource] = useState(false);
    const [followupDraft, setFollowupDraft] = useState(() => emptyFollowupDraft());
    const [followupLinkedinConnected, setFollowupLinkedinConnected] = useState(false);
    const [blockSearch, setBlockSearch] = useState('');
    const [blockOptions, setBlockOptions] = useState([]);
    const [blockOptionsLoading, setBlockOptionsLoading] = useState(false);
    const blockSearchTimerRef = useRef(null);
    const [runningJobId, setRunningJobId] = useState(null);
    const [brokenRecommendedLogos, setBrokenRecommendedLogos] = useState({});
    const [recommendedJobModal, setRecommendedJobModal] = useState({
        open: false,
        loading: false,
        title: '',
        company: '',
        descriptionHtml: '',
        applyUrl: '',
    });
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);
    const [typeTick, setTypeTick] = useState(0);
    const threadRef = useRef(null);
    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    const executedToolsRef = useRef(new Set());
    const lastJobLinkRef = useRef({ url: '', at: 0 });
    const recommendedJobsCacheRef = useRef({ jobs: [], at: 0 });

    const firstName = useMemo(() => {
        const first = user?.name?.trim()?.split(/\s+/)?.[0];
        return first || 'there';
    }, [user?.name]);

    const threadStamp = useMemo(
        () => formatThreadStamp(),
        [activeSessionId, open],
    );

    const [messages, setMessages] = useState(() => [
        {
            id: 'welcome',
            role: 'assistant',
            text: `Hi ${firstName}. I’m the HAPPPY Chatbot. I can run a job from a link, show recommended jobs, list agent runs, surface replies, check the queue, connect Gmail or LinkedIn, upload a resume, or answer how HAPPPY Agent works.`,
        },
    ]);

    const showLongChatHint = useMemo(
        () => !historyOpen && messages.length > LONG_CHAT_HINT_THRESHOLD,
        [historyOpen, messages.length],
    );

    useEffect(() => {
        const el = threadRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }, [messages, busy, open, typeTick]);

    useEffect(() => () => {
        if (blockSearchTimerRef.current) {
            window.clearTimeout(blockSearchTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (isFullscreen) return undefined;
        const openChat = () => setOpen(true);
        window.addEventListener(HAPPPY_CHATBOT_OPEN, openChat);
        return () => window.removeEventListener(HAPPPY_CHATBOT_OPEN, openChat);
    }, [isFullscreen]);

    const pushMessages = useCallback((items) => {
        setMessages((prev) => [...prev, ...items.map((item) => ({
            ...item,
            id: item.id || nextId(),
            animate: item.role === 'assistant' && item.animate !== false,
        }))]);
    }, []);

    const patchMessage = useCallback((messageId, patch) => {
        if (!messageId) return;
        setMessages((prev) => prev.map((msg) => {
            if (msg.id !== messageId) return msg;
            const next = typeof patch === 'function' ? patch(msg) : patch;
            return { ...msg, ...next };
        }));
    }, []);

    const persistToolResult = useCallback(async (sessionId, dbMessageId, result) => {
        if (!sessionId || !dbMessageId || !result) return;
        try {
            await POST_API(`${CHAT_API}/sessions/${sessionId}/messages/${dbMessageId}/tool-result`, {
                result: String(result).slice(0, 4000),
            });
        } catch {
            /* next-turn context is best-effort */
        }
    }, []);

    const applyToolOutcome = useCallback((messageId, outcome, dbMessageId = null, sessionId = null) => {
        if (!outcome) return;
        if (messageId) {
            patchMessage(messageId, {
                cards: outcome.cards ?? null,
                toolResult: outcome.toolResult || null,
                ...(outcome.text != null
                    ? { text: outcome.text, animate: false }
                    : {}),
            });
        } else {
            pushMessages([
                {
                    role: 'assistant',
                    text: outcome.text || outcome.toolResult || '',
                    cards: outcome.cards || null,
                    animate: false,
                },
            ]);
        }
        if (outcome.toolResult) {
            persistToolResult(sessionId || activeSessionId, dbMessageId, outcome.toolResult);
        }
    }, [activeSessionId, patchMessage, persistToolResult, pushMessages]);

    const refreshSessions = useCallback(async () => {
        const response = await GET_API(`${CHAT_API}/sessions`);
        const data = unwrapApiData(response);
        const list = Array.isArray(data) ? data : [];
        setSessions(list);
        return list;
    }, []);

    const loadSession = useCallback(async (sessionId) => {
        if (!sessionId) return;
        setChatLoading(true);
        try {
            const response = await GET_API(`${CHAT_API}/sessions/${sessionId}`);
            const data = unwrapApiData(response);
            if (!data?.session) return;
            setActiveSessionId(data.session.id);
            const loaded = (data.messages || []).map((message) => {
                const id = `db-${message.id}`;
                return {
                    id,
                    role: message.role,
                    text: message.content,
                    toolName: message.tool_name || null,
                    toolArguments: message.tool_arguments || {},
                    toolResult: message.tool_result || null,
                    cards: cardsForStoredTool(message.tool_name, message.tool_result),
                    animate: false,
                };
            });
            executedToolsRef.current = new Set(
                loaded.filter((message) => message.toolName).map((message) => message.id),
            );
            setMessages(loaded);
            setHistoryOpen(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not load this chat.');
        } finally {
            setChatLoading(false);
        }
    }, []);

    const startNewChat = useCallback(() => {
        setActiveSessionId(null);
        executedToolsRef.current = new Set();
        lastJobLinkRef.current = { url: '', at: 0 };
        setPendingTool(null);
        setDisconnectDraft('');
        setBlockSearch('');
        setBlockOptions([]);
        setMessages([
            {
                id: 'welcome-new',
                role: 'assistant',
                text: `Hi ${firstName}. Start a new conversation with HAPPPY.`,
            },
        ]);
        setHistoryOpen(false);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, [firstName]);

    useEffect(() => {
        if (!open) return undefined;
        let cancelled = false;
        const boot = async () => {
            setChatLoading(true);
            try {
                const sessionList = await refreshSessions();
                if (cancelled) return;
                if (!activeSessionId && sessionList[0]?.id) {
                    await loadSession(sessionList[0].id);
                }
            } catch {
                if (!cancelled) toast.error('Could not load saved HAPPPY chats.');
            } finally {
                if (!cancelled) setChatLoading(false);
            }
        };
        boot();
        return () => {
            cancelled = true;
        };
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const runJobWithLink = useCallback(
        async (url) => {
            const cleaned = (url || '').trim();
            if (!isValidHttpUrl(cleaned)) {
                setPendingTool('run_job_with_link');
                return {
                    toolResult: 'Paste a full job URL (https://…) and I’ll queue Happpy Agent on it. You can also open the paste-job drawer.',
                    cards: {
                        type: 'actions',
                        items: [{ kind: 'paste-drawer', label: 'Open paste job link' }],
                    },
                };
            }
            const last = lastJobLinkRef.current;
            if (last.url === cleaned && Date.now() - last.at < 20000) {
                return { toolResult: 'That job link was already sent a moment ago.' };
            }
            const res = await dispatch(submitReferralJobApplyByLink({ url: cleaned }));
            if (res?.data?.status !== 'success') {
                throw new Error(res?.data?.message || 'Could not start the agent on that link.');
            }
            lastJobLinkRef.current = { url: cleaned, at: Date.now() };
            window.dispatchEvent(new CustomEvent(JOB_LINK_ADDED_EVENT));
            return {
                toolResult: res?.data?.message
                    || "We’ve received your request. The agent will start in the background — it may take 20–30 minutes.",
            };
        },
        [dispatch],
    );

    const showRecommendedJobs = useCallback(async (toolArguments = {}) => {
        const filters = parseRecommendedJobsFilters(toolArguments);
        const displayLimit = filters.limit || 8;
        const fetchLimit = recommendedJobsHasFilters(filters)
            ? RECOMMENDED_FETCH_MAX
            : Math.max(displayLimit, 12);

        const response = await GET_API(
            withHapppyAgentInfoQuery(`${API_GET_RECOMMENDED_JOBS}?limit=${fetchLimit}`),
        );
        const data = unwrapApiData(response);
        const allJobs = Array.isArray(data) ? data : [];
        const filtered = filterRecommendedJobs(allJobs, filters);
        const jobs = filtered.slice(0, displayLimit);
        const filterSummary = formatRecommendedJobsFilterSummary(filters);

        if (!jobs.length) {
            const filterNote = filterSummary ? ` Filters applied: ${filterSummary}.` : '';
            return {
                toolResult: `No recommended jobs matched.${filterNote} Try broader filters, update preferences, or paste a job link.`,
                cards: {
                    type: 'actions',
                    items: [
                        { kind: 'link', label: 'See all recommended jobs', to: '/talent/job-agent/recommended-jobs' },
                        { kind: 'link', label: 'Manage preferences', to: '/talent/manage-preferences' },
                    ],
                },
            };
        }

        const resultLines = [
            filterSummary
                ? `Recommended jobs (${jobs.length} shown, filters: ${filterSummary}):`
                : `Recommended jobs (${jobs.length}):`,
            ...jobs.map(formatRecommendedJobLine),
        ];
        if (recommendedJobsHasFilters(filters) && filtered.length > jobs.length) {
            resultLines.push(`(${filtered.length} roles matched; showing top ${jobs.length}.)`);
        } else if (allJobs.length > jobs.length && recommendedJobsHasFilters(filters)) {
            resultLines.push(`(${allJobs.length} loaded from feed before filters.)`);
        }

        recommendedJobsCacheRef.current = { jobs, at: Date.now() };

        return {
            toolResult: resultLines.join('\n'),
            cards: {
                type: 'recommended',
                items: jobs,
                filterSummary: filterSummary || null,
                footerTo: '/talent/job-agent/recommended-jobs',
                footerLabel: 'View all recommended jobs',
            },
        };
    }, []);

    const runRecommendedJobs = useCallback(async (toolArguments = {}, messageList = []) => {
        const jobList = findLastRecommendedJobList(messageList, recommendedJobsCacheRef);
        if (!jobList.length) {
            return {
                toolResult: 'No recommended jobs in this chat yet. Ask to show recommended jobs first, then tell me which to run (e.g. first job, jobs 1 and 2, or all).',
                cards: {
                    type: 'actions',
                    items: [
                        { kind: 'link', label: 'See all recommended jobs', to: '/talent/job-agent/recommended-jobs' },
                    ],
                },
            };
        }

        const toRun = resolveRecommendedJobsToRun(toolArguments, jobList);
        if (!toRun.length) {
            return {
                toolResult: `Could not match that to the last recommended list (${jobList.length} roles). Use list numbers 1–${jobList.length}, job_id from the list, {"first":true}, {"all_visible":true}, or {"all":true}.`,
            };
        }

        const successes = [];
        const failures = [];
        for (const job of toRun) {
            try {
                const response = await dispatch(
                    submitAutoRunRequest({
                        job_id: job.id,
                        source: 'happpy-chatbot-recommended',
                    }),
                );
                successes.push({
                    job,
                    message: response?.data?.message || 'Added to referral queue.',
                });
            } catch (err) {
                failures.push({
                    job,
                    message: err?.response?.data?.message || 'Could not queue this job.',
                });
            }
        }

        const lines = [];
        if (successes.length) {
            lines.push(`Queued HAPPPY Agent on ${successes.length} recommended job(s):`);
            successes.forEach((row, idx) => {
                lines.push(`${idx + 1}. ${describeRecommendedJob(row.job)} — ${row.message}`);
            });
        }
        if (failures.length) {
            lines.push(`Could not queue ${failures.length} job(s):`);
            failures.forEach((row, idx) => {
                lines.push(`${idx + 1}. ${describeRecommendedJob(row.job)} — ${row.message}`);
            });
        }
        if (successes.length) {
            window.dispatchEvent(new CustomEvent(JOB_LINK_ADDED_EVENT));
        }

        return { toolResult: lines.join('\n') };
    }, [dispatch]);

    const showAgentRuns = useCallback(async () => {
        const response = await GET_API(`${API_JOB_AGENT_AGENT_TAILOR_ACTIVITY}?page=1&limit=6&agent=yes`);
        const payload = unwrapApiData(response);
        const list = Array.isArray(payload?.list) ? payload.list.slice(0, 6) : [];
        if (!list.length) {
            return {
                toolResult: 'No agent runs yet. Paste a job link or pick a recommended job to start.',
                cards: {
                    type: 'actions',
                    items: [{ kind: 'link', label: 'Open My Activity', to: '/talent/job-agent/my-activity?tab=activity' }],
                },
            };
        }
        return {
            toolResult: `Agent runs (${list.length}):\n${list.map((row, index) => formatJobLine(row, index)).join('\n')}`,
            cards: {
                type: 'runs',
                items: list,
                footerTo: '/talent/job-agent/my-activity?tab=activity',
                footerLabel: 'See all agent runs',
            },
        };
    }, []);

    const showReplies = useCallback(async () => {
        const [metaRes, posRes, negRes] = await Promise.all([
            GET_API(`${API_URL}talent/outreach/get-outreach-agent-meta`),
            GET_API(`${API_URL}talent/outreach/get-outreach-agent?page=1&per_page=10&reply_type=positive`),
            GET_API(`${API_URL}talent/outreach/get-outreach-agent?page=1&per_page=10&reply_type=negative`),
        ]);
        const meta = unwrapApiData(metaRes) || {};
        const posJobs = extractOutreachList(unwrapApiData(posRes));
        const negJobs = extractOutreachList(unwrapApiData(negRes));
        const positiveCards = flattenReplyCards(posJobs, 'positive');
        const negativeCards = flattenReplyCards(negJobs, 'negative');
        const countedPositive = Number(meta.total_positive_replies ?? 0);
        const countedNegative = Number(meta.total_negative_replies ?? 0);
        const parts = [
            `Replies counted: ${countedPositive} positive, ${countedNegative} negative.`,
            `Replies loaded for display: ${positiveCards.length} positive, ${negativeCards.length} negative.`,
        ];
        if (positiveCards.length) {
            parts.push(`Positive:\n${positiveCards.map(formatReplyLine).join('\n')}`);
        }
        if (negativeCards.length) {
            parts.push(`Negative:\n${negativeCards.map(formatReplyLine).join('\n')}`);
        }
        const mismatch = (countedPositive > 0 && !positiveCards.length)
            || (countedNegative > 0 && !negativeCards.length);
        if (mismatch) {
            parts.push(
                'The replies page count does not match the list we can show. Open My Activity or raise a ticket at /talent/job-agent/need-help.',
            );
        }
        if (!positiveCards.length && !negativeCards.length) {
            return {
                toolResult: parts.join('\n'),
                cards: {
                    type: 'actions',
                    items: [
                        { kind: 'link', label: 'Open replies page', to: '/talent/job-agent/my-activity?tab=replies' },
                        { kind: 'link', label: 'Raise a ticket / view status', to: TICKET_STATUS_PATH },
                        { kind: 'raise-ticket', label: 'Raise a ticket here' },
                    ],
                },
            };
        }
        return {
            toolResult: parts.join('\n'),
            cards: {
                type: 'replies',
                positives: positiveCards.slice(0, 10),
                negatives: negativeCards.slice(0, 10),
                footerTo: '/talent/job-agent/my-activity?tab=replies',
                footerLabel: 'Open all replies',
            },
        };
    }, []);

    const showQueue = useCallback(async () => {
        const response = await GET_API(`${API_URL}talent/outreach/get-external-apply-pending-jobs`);
        const rows = unwrapApiData(response);
        const list = Array.isArray(rows) ? rows.slice(0, 8) : [];
        if (!list.length) {
            return {
                toolResult: 'Your job queue is empty.',
                cards: {
                    type: 'actions',
                    items: [
                        { kind: 'link', label: 'Open queue tab', to: '/talent/job-agent/my-activity?tab=jobs-in-queue' },
                    ],
                },
            };
        }
        return {
            toolResult: `Jobs in queue (${list.length}):\n${list.map(formatJobLine).join('\n')}`,
            cards: {
                type: 'queue',
                items: list,
                footerTo: '/talent/job-agent/my-activity?tab=jobs-in-queue',
                footerLabel: 'Open full queue',
            },
        };
    }, []);

    const connectGmail = useCallback(async (messageId) => {
        const statusRes = await dispatch(getAccountStatus());
        const gmail = statusRes?.data?.data?.gmail;
        const linkedin = statusRes?.data?.data?.linkedin;
        if (gmail?.status === 2) {
            return {
                toolResult: formatAccountLine('Gmail', gmail),
                cards: { type: 'account', gmail, linkedin },
            };
        }
        if (!user?.enc_id) {
            return { toolResult: 'I could not start Gmail connect because your account id is missing. Refresh and try again.' };
        }
        const gmailUrl = `${process.env.MIX_APP_URL}/auth/login/gmail/${user.enc_id}`;
        const popup = window.open(
            gmailUrl,
            'Gmail OAuth',
            `width=600,height=700,scrollbars=yes,resizable=yes,left=${window.screen.width / 2 - 300},top=${window.screen.height / 2 - 350}`,
        );
        if (!popup) {
            toast.error('Please allow popups to connect Gmail');
            return { toolResult: 'Pop-ups are blocked. Allow pop-ups for this site, then try Connect Gmail again.' };
        }
        applyToolOutcome(messageId, { toolResult: 'Finish Gmail in the popup. I’ll confirm here when it connects.' });

        return new Promise((resolve) => {
            let resolved = false;
            const finish = async (ok, message) => {
                if (resolved) return;
                resolved = true;
                window.clearInterval(timer);
                window.clearTimeout(timeout);
                window.removeEventListener('message', onMessage);
                if (ok) {
                    let connected = null;
                    try {
                        const refreshed = await dispatch(getAccountStatus());
                        connected = refreshed?.data?.data?.gmail || null;
                    } catch {
                        /* status refresh is best-effort */
                    }
                    toast.success('Gmail account connected successfully!');
                    resolve({
                        text: 'Thank you for connecting Gmail! Happpy will send outreach from that inbox.',
                        toolResult: connected
                            ? formatAccountLine('Gmail', connected)
                            : 'Gmail connected.',
                        cards: connected ? { type: 'account', gmail: connected } : null,
                    });
                } else {
                    resolve({ toolResult: message || 'Gmail connection did not finish. Try again when you are ready.' });
                }
            };
            const onMessage = (event) => {
                if (event.origin !== window.location.origin) return;
                const type = event.data?.type;
                if (type === 'GMAIL_CONNECT_SUCCESS' || type === 'HAPPPY_GTM_GMAIL_AUTH_SUCCESS') {
                    if (!popup.closed) popup.close();
                    finish(true);
                } else if (type === 'GMAIL_CONNECT_ERROR' || type === 'HAPPPY_GTM_GMAIL_AUTH_ERROR') {
                    if (!popup.closed) popup.close();
                    finish(false, event.data?.message);
                }
            };
            window.addEventListener('message', onMessage);
            const timer = window.setInterval(() => {
                try {
                    if (popup.closed) {
                        finish(false, 'Gmail window closed before connecting.');
                        return;
                    }
                    const popupUrl = popup.location.href;
                    if (popupUrl.includes('gmail=success') || popupUrl.includes('/talent/happpy/gmail-callback')) {
                        if (!popup.closed) popup.close();
                        finish(true);
                    } else if (popupUrl.includes('error=')) {
                        if (!popup.closed) popup.close();
                        finish(false, 'Gmail connection failed');
                    }
                } catch {
                    /* cross-origin during Google handshake */
                }
            }, 500);
            const timeout = window.setTimeout(() => {
                if (!popup.closed) popup.close();
                finish(false, 'Gmail connection timed out. Please try again.');
            }, 600000);
        });
    }, [applyToolOutcome, dispatch, user?.enc_id]);

    const saveRealName = useCallback(async (rawName) => {
        const name = String(rawName || '').trim().replace(/\s+/g, ' ');
        if (!isRealNameComplete(name)) {
            throw new Error('Enter your full legal name (first and last, letters only).');
        }
        const payload = new FormData();
        payload.append('field', 'name');
        payload.append('value', name);
        const saved = await profileUpsert(payload, true)(dispatch);
        if (saved?.data?.status && Number(saved.data.status) >= 400) {
            throw new Error(saved?.data?.message || 'Could not save your name.');
        }
        dispatch({ type: SET_PROFILE_DATA, payload: { name } });
        dispatch({ type: UPDATE_CURRENT_USER, payload: { name } });
        setPendingTool(null);
        setRealNameDraft('');
        const first = name.split(/\s+/)[0] || name;
        return {
            text: `Thank you, ${first}! I've saved your name for job applications.`,
            toolResult: `Name updated: ${name}`,
            cards: { type: 'info', lines: [`Name: ${name}`] },
        };
    }, [dispatch]);

    const updateRealName = useCallback(async (suggestedName) => {
        const candidate = String(suggestedName || '').trim().replace(/\s+/g, ' ');
        if (candidate && isRealNameComplete(candidate)) {
            return saveRealName(candidate);
        }
        setPendingTool('update_real_name');
        setRealNameDraft(isRealNameComplete(user?.name) ? user.name : '');
        return {
            toolResult: 'Enter your full legal name (first and last) as it should appear on applications.',
            cards: { type: 'real-name-form' },
        };
    }, [saveRealName, user?.name]);

    const submitRealNameForm = useCallback(async (e, messageId = null) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const outcome = await saveRealName(realNameDraft);
            if (messageId) {
                applyToolOutcome(messageId, outcome);
            } else {
                pushMessages([{
                    role: 'assistant',
                    text: outcome.text || outcome.toolResult,
                    cards: outcome.cards,
                    animate: false,
                }]);
            }
            toast.success('Name saved');
        } catch (err) {
            toast.error(err?.response?.data?.errors?.value?.[0] || err?.message || 'Could not save your name.');
        } finally {
            setBusy(false);
        }
    }, [applyToolOutcome, busy, pushMessages, realNameDraft, saveRealName]);

    const loadProfileDraft = useCallback(async () => {
        const res = await dispatch(getTalentPreferences(true));
        return buildProfileDraftFromTalent(res?.data?.talent || {}, user);
    }, [dispatch, user]);

    const persistProfileUpdates = useCallback(async (updates) => {
        const obj = {};
        if (updates.contact_number) {
            obj.contact_number = updates.contact_number;
            obj.contact_number_country_code = '+91';
        }
        if (updates.joining_period) obj.joining_period = updates.joining_period;
        if (updates.total_experience) obj.total_experience = updates.total_experience;
        if (updates.linkedin_id) obj.linkedin_id = updates.linkedin_id;
        if (updates.current_ctc != null) {
            obj.current_ctc = Math.round(Number(updates.current_ctc) * 100000);
        }
        if (updates.expected_ctc != null) {
            obj.expected_ctc = Math.round(Number(updates.expected_ctc) * 100000);
        }

        const payload = {
            field: 'preferences',
            value: Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [key, sanitizePayload(key, value)]),
            ),
            save_source: 'HAPPPY Chatbot',
        };
        let payloadFormData = new FormData();
        Object.entries(payload).forEach(([key, data]) => {
            payloadFormData = buildFormData(payloadFormData, data, key);
        });

        const saved = await profileUpsert(payloadFormData, true)(dispatch);
        if (saved?.data?.status && Number(saved.data.status) >= 400) {
            throw new Error(saved?.data?.message || 'Could not save your profile.');
        }
        const data = saved?.data?.data || {};
        dispatch({
            type: SET_PROFILE_DATA,
            payload: data,
        });
        const userPatch = {};
        if (updates.contact_number) userPatch.contact_number = updates.contact_number;
        if (data.name) userPatch.name = data.name;
        if (Object.keys(userPatch).length) {
            dispatch({ type: UPDATE_CURRENT_USER, payload: userPatch });
        }
        setPendingTool(null);
        const lines = profileSummaryLines(updates);
        return {
            text: 'Your profile is updated.',
            toolResult: lines.length ? lines.join('\n') : 'Profile updated.',
            cards: {
                type: 'info',
                lines: lines.length ? lines : ['Profile saved.'],
            },
        };
    }, [dispatch]);

    const updateTalentProfile = useCallback(async (toolArguments = {}) => {
        const parsed = parseProfileToolArguments(toolArguments);
        if (Object.keys(parsed).length) {
            const errors = validateProfileUpdates(parsed);
            if (Object.keys(errors).length) {
                const draft = mergeProfileDraft(await loadProfileDraft(), parsed);
                setProfileDraft(draft);
                setPendingTool('update_talent_profile');
                const firstError = Object.values(errors)[0];
                return {
                    text: firstError,
                    toolResult: 'Fix the highlighted fields and save again.',
                    cards: { type: 'profile-form' },
                };
            }
            return persistProfileUpdates(parsed);
        }
        setProfileDraft(await loadProfileDraft());
        setPendingTool('update_talent_profile');
        return {
            toolResult: 'Update phone, notice period, salary, experience, or LinkedIn below. Leave a field blank to keep it unchanged.',
            cards: { type: 'profile-form' },
        };
    }, [loadProfileDraft, persistProfileUpdates]);

    const submitProfileForm = useCallback(async (e, messageId = null) => {
        e.preventDefault();
        if (busy) return;
        const updates = profileUpdatesFromDraft(profileDraft);
        const errors = validateProfileUpdates(updates);
        if (Object.keys(errors).length) {
            toast.error(Object.values(errors)[0]);
            return;
        }
        setBusy(true);
        try {
            const outcome = await persistProfileUpdates(updates);
            if (messageId) {
                applyToolOutcome(messageId, outcome);
            } else {
                pushMessages([{
                    role: 'assistant',
                    text: outcome.text || outcome.toolResult,
                    cards: outcome.cards,
                    animate: false,
                }]);
            }
            toast.success('Profile updated');
        } catch (err) {
            toast.error(err?.response?.data?.errors?.value?.[0] || err?.message || 'Could not save your profile.');
        } finally {
            setBusy(false);
        }
    }, [applyToolOutcome, busy, persistProfileUpdates, profileDraft, pushMessages]);

    const loadOutreachTemplates = useCallback(async () => {
        const response = await GET_API(API_GET_OUTREACH_TEMPLATES);
        const body = response?.data;
        if (body?.status !== 'success' && body?.status !== 200) {
            throw new Error(body?.message || 'Could not load outreach messages.');
        }
        return body?.data || {};
    }, []);

    const buildOutreachEditorDraft = useCallback((templates, provider = OUTREACH_PROVIDER_GMAIL) => {
        const isLinkedin = Number(provider) === OUTREACH_PROVIDER_LINKEDIN;
        return {
            provider: isLinkedin ? OUTREACH_PROVIDER_LINKEDIN : OUTREACH_PROVIDER_GMAIL,
            message_template: isLinkedin
                ? (templates.linkedin_template || '')
                : (templates.gmail_template || ''),
            message_subject: isLinkedin
                ? (templates.linkedin_template_subject || '')
                : (templates.gmail_template_subject || ''),
        };
    }, []);

    const persistOutreachDefaultMessage = useCallback(async (draft) => {
        const errors = validateOutreachMessageDraft(draft);
        if (Object.keys(errors).length) {
            throw new Error(Object.values(errors)[0]);
        }
        const payload = {
            provider: draft.provider,
            message_template: draft.message_template,
            message_subject: draft.message_subject || '',
        };
        const response = await POST_API(API_STORE_OUTREACH_TEMPLATE, payload);
        const body = response?.data;
        if (body?.status !== 'success') {
            throw new Error(body?.message || 'Could not save your outreach message.');
        }
        dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
        setPendingTool(null);
        const templates = await loadOutreachTemplates();
        const summary = outreachTemplatesSummary(templates);
        const label = outreachProviderLabel(draft.provider);
        return {
            text: `Your ${label} default outreach message is saved.`,
            toolResult: `${label} message updated.\n${summary.toolResult}`,
            cards: summary.cards,
        };
    }, [dispatch, loadOutreachTemplates]);

    const showOutreachDefaultMessage = useCallback(async () => {
        const templates = await loadOutreachTemplates();
        const summary = outreachTemplatesSummary(templates);
        return {
            text: 'Here are your default outreach messages.',
            toolResult: summary.toolResult,
            cards: summary.cards,
        };
    }, [loadOutreachTemplates]);

    const updateOutreachDefaultMessage = useCallback(async (toolArguments = {}) => {
        const templates = await loadOutreachTemplates();
        const parsed = parseOutreachMessageArguments(toolArguments);
        const provider = parsed.provider || OUTREACH_PROVIDER_GMAIL;

        if (parsed.message_template) {
            const draft = {
                provider,
                message_template: parsed.message_template,
                message_subject: parsed.message_subject
                    ?? (Number(provider) === OUTREACH_PROVIDER_GMAIL
                        ? (templates.gmail_template_subject || '')
                        : (templates.linkedin_template_subject || '')),
            };
            try {
                return await persistOutreachDefaultMessage(draft);
            } catch (err) {
                setOutreachMessageDraft(draft);
                setOutreachShowHtmlSource(false);
                setPendingTool('update_outreach_default_message');
                return {
                    text: err?.message || 'Fix the message and try again.',
                    toolResult: 'Update your default outreach message below.',
                    cards: { type: 'outreach-message-form' },
                };
            }
        }

        setOutreachMessageDraft(buildOutreachEditorDraft(templates, provider));
        setOutreachShowHtmlSource(false);
        setPendingTool('update_outreach_default_message');
        return {
            toolResult: 'Update your default outreach message below.',
            cards: { type: 'outreach-message-form' },
        };
    }, [buildOutreachEditorDraft, loadOutreachTemplates, persistOutreachDefaultMessage]);

    const submitOutreachMessageForm = useCallback(async (e, messageId = null) => {
        e.preventDefault();
        if (busy) return;
        const errors = validateOutreachMessageDraft(outreachMessageDraft);
        if (Object.keys(errors).length) {
            toast.error(Object.values(errors)[0]);
            return;
        }
        setBusy(true);
        try {
            const outcome = await persistOutreachDefaultMessage(outreachMessageDraft);
            if (messageId) {
                applyToolOutcome(messageId, outcome);
            } else {
                pushMessages([{
                    role: 'assistant',
                    text: outcome.text || outcome.toolResult,
                    cards: outcome.cards,
                    animate: false,
                }]);
            }
            toast.success('Outreach message saved');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Could not save your outreach message.');
        } finally {
            setBusy(false);
        }
    }, [
        applyToolOutcome,
        busy,
        outreachMessageDraft,
        persistOutreachDefaultMessage,
        pushMessages,
    ]);

    const resolveLinkedinConnected = useCallback(async () => {
        const statusRes = await dispatch(getAccountStatus());
        return Number(statusRes?.data?.data?.linkedin?.status) === 2;
    }, [dispatch]);

    const loadFollowupSettings = useCallback(async () => {
        const response = await GET_API(FOLLOWUP_SETTINGS_API);
        const body = response?.data;
        if (body?.status !== 200 && body?.status !== 'success') {
            throw new Error(body?.message || 'Could not load follow-up settings.');
        }
        return normalizeFollowupSettings(body?.data || {});
    }, []);

    const persistFollowupSettings = useCallback(async (draft) => {
        const linkedinConnected = await resolveLinkedinConnected();
        const validationError = validateFollowupDraft(draft, { linkedinConnected });
        if (validationError) {
            throw new Error(validationError);
        }
        let body;
        try {
            const response = await POST_API(FOLLOWUP_SETTINGS_API, followupPostPayload(draft));
            body = response?.data;
        } catch (err) {
            const data = err?.response?.data;
            const errMsg = data?.errors?.message_gmail?.[0]
                || data?.errors?.message_linkedin?.[0]
                || data?.message
                || err?.message
                || 'Could not save follow-up settings.';
            throw new Error(errMsg);
        }
        if (body?.status !== 200 && body?.status !== 'success') {
            const errMsg = body?.errors?.message_gmail?.[0]
                || body?.errors?.message_linkedin?.[0]
                || body?.message
                || 'Could not save follow-up settings.';
            throw new Error(errMsg);
        }
        setPendingTool(null);
        const settings = normalizeFollowupSettings(body?.data || draft);
        const summary = followupSettingsSummary(settings);
        return {
            text: 'Your follow-up settings are saved.',
            toolResult: summary.toolResult,
            cards: summary.cards,
        };
    }, [resolveLinkedinConnected]);

    const showFollowupSettings = useCallback(async () => {
        const settings = await loadFollowupSettings();
        const summary = followupSettingsSummary(settings);
        return {
            text: 'Here are your Gmail and LinkedIn follow-up settings.',
            toolResult: summary.toolResult,
            cards: summary.cards,
        };
    }, [loadFollowupSettings]);

    const followupPatchIsActionable = (parsed) => {
        if (!parsed || typeof parsed !== 'object') return false;
        return (
            parsed.enabled != null
            || parsed.disabled_followup_gmail != null
            || parsed.disabled_followup_linkedin != null
            || parsed.interval_days != null
            || parsed.interval_days_gmail != null
            || parsed.interval_days_linkedin != null
            || (parsed.message != null && String(parsed.message).trim() !== '')
            || (parsed.message_gmail != null && String(parsed.message_gmail).trim() !== '')
            || (parsed.message_linkedin != null && String(parsed.message_linkedin).trim() !== '')
        );
    };

    const openFollowupSettingsForm = useCallback(async () => {
        const [settings, linkedinConnected] = await Promise.all([
            loadFollowupSettings(),
            resolveLinkedinConnected(),
        ]);
        setFollowupDraft(settings);
        setFollowupLinkedinConnected(linkedinConnected);
        setPendingTool('update_followup_settings');
        return {
            toolResult: 'Update your follow-up settings below.',
            cards: { type: 'followup-settings-form', linkedinConnected },
        };
    }, [loadFollowupSettings, resolveLinkedinConnected]);

    const updateFollowupSettings = useCallback(async (toolArguments = {}) => {
        const parsed = parseFollowupArguments(toolArguments);
        if (!followupPatchIsActionable(parsed)) {
            return openFollowupSettingsForm();
        }

        const current = await loadFollowupSettings();
        const draft = applyFollowupPatch(current, parsed);
        try {
            return await persistFollowupSettings(draft);
        } catch (err) {
            const linkedinConnected = await resolveLinkedinConnected();
            setFollowupDraft(draft);
            setFollowupLinkedinConnected(linkedinConnected);
            setPendingTool('update_followup_settings');
            return {
                text: err?.message || 'Fix the follow-up settings and try again.',
                toolResult: 'Update your follow-up settings below.',
                cards: { type: 'followup-settings-form', linkedinConnected },
            };
        }
    }, [
        loadFollowupSettings,
        openFollowupSettingsForm,
        persistFollowupSettings,
        resolveLinkedinConnected,
    ]);

    const submitFollowupSettingsForm = useCallback(async (e, messageId = null) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const outcome = await persistFollowupSettings(followupDraft);
            if (messageId) {
                applyToolOutcome(messageId, outcome);
            } else {
                pushMessages([{
                    role: 'assistant',
                    text: outcome.text || outcome.toolResult,
                    cards: outcome.cards,
                    animate: false,
                }]);
            }
            toast.success('Follow-up settings saved');
        } catch (err) {
            toast.error(err?.message || 'Could not save follow-up settings.');
        } finally {
            setBusy(false);
        }
    }, [
        applyToolOutcome,
        busy,
        followupDraft,
        persistFollowupSettings,
        pushMessages,
    ]);

    useEffect(() => {
        const hasFollowupForm = messages.some((msg) => msg.cards?.type === 'followup-settings-form');
        if (!hasFollowupForm || pendingTool === 'update_followup_settings') {
            return undefined;
        }
        let cancelled = false;
        (async () => {
            try {
                const [settings, linkedinConnected] = await Promise.all([
                    loadFollowupSettings(),
                    resolveLinkedinConnected(),
                ]);
                if (cancelled) return;
                setFollowupDraft(settings);
                setFollowupLinkedinConnected(linkedinConnected);
                setPendingTool('update_followup_settings');
            } catch {
                /* form still renders with last-known draft */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [messages, pendingTool, loadFollowupSettings, resolveLinkedinConnected]);

    const runOnboarding = useCallback(async (messageId) => {
        const statusRes = await dispatch(getAccountStatus());
        const gmail = statusRes?.data?.data?.gmail;
        const gmailConnected = Number(gmail?.status) === 2;
        const resumeName = String(user?.resume || '').trim();

        if (!gmailConnected) {
            const gmailOutcome = await connectGmail(messageId);
            try {
                const refreshed = await dispatch(getAccountStatus());
                if (Number(refreshed?.data?.data?.gmail?.status) !== 2) {
                    return gmailOutcome;
                }
            } catch {
                return gmailOutcome;
            }
            const resumeAfterGmail = String(user?.resume || '').trim();
            if (!resumeAfterGmail) {
                setPendingTool('upload_resume');
                return {
                    text: 'Thank you for connecting Gmail! Upload your resume next so Happpy can tailor applications.',
                    toolResult: 'Choose a PDF or DOCX resume (max 2 MB).',
                    cards: { type: 'resume-upload' },
                };
            }
            return {
                ...gmailOutcome,
                text: gmailOutcome.text || 'Thank you for connecting Gmail! Happpy will send outreach from that inbox.',
            };
        }

        if (!resumeName) {
            setPendingTool('upload_resume');
            return {
                toolResult: 'Choose a PDF or DOCX resume (max 2 MB). Happpy uses it to tailor applications.',
                cards: { type: 'resume-upload' },
            };
        }

        return {
            text: 'Thank you! You\'re all set — Gmail and resume are ready. Ask for recommended jobs or paste a job link anytime.',
            toolResult: 'Setup complete: Gmail connected and resume on file.',
        };
    }, [connectGmail, dispatch, user?.resume]);

    const showAccountStatus = useCallback(async () => {
        const statusRes = await dispatch(getAccountStatus());
        const gmail = statusRes?.data?.data?.gmail;
        const linkedin = statusRes?.data?.data?.linkedin;
        const resumeName = user?.resume ? String(user.resume) : '';
        const lines = [
            formatAccountLine('Gmail', gmail),
            formatAccountLine('LinkedIn', linkedin),
            resumeName ? `Resume on file: ${resumeName}` : 'Resume on file: none',
        ];
        return {
            toolResult: lines.join('\n'),
            cards: { type: 'account', gmail, linkedin, resume: resumeName || null },
        };
    }, [dispatch, user?.resume]);

    const loadTickets = useCallback(async () => {
        const response = await GET_API(`${API_OUTREACH_SUPPORT}?per_page=5&page=1`);
        const payload = unwrapApiData(response) || {};
        return Array.isArray(payload.tickets?.data) ? payload.tickets.data : [];
    }, []);

    const submitSupportTicket = useCallback(async (rawMessage) => {
        const trimmed = String(rawMessage || '').trim();
        if (!trimmed) {
            throw new Error('Please describe the issue so we can raise a ticket.');
        }
        const response = await POST_API(API_OUTREACH_SUPPORT, {
            message: trimmed,
            page: TICKET_PAGE_LABEL,
        });
        const body = response?.data;
        const ok = Number(body?.status) === 200 || body?.status === 'success';
        if (!ok) {
            throw new Error(body?.message || 'Could not submit the ticket.');
        }
        setPendingTool(null);
        setTicketDraft('');
        const tickets = await loadTickets().catch(() => []);
        return {
            toolResult: `${body?.message || 'Ticket submitted.'}${
                tickets.length ? `\nRecent tickets:\n${tickets.map(ticketStatusLine).join('\n')}` : ''
            }`,
            cards: {
                type: 'tickets',
                items: tickets,
                footerTo: TICKET_STATUS_PATH,
                footerLabel: 'Open ticket status',
            },
        };
    }, [loadTickets]);

    const raiseTicket = useCallback(async (preset) => {
        const text = String(preset || '').trim();
        if (text && text.length >= 12 && !/^raise a ticket$/i.test(text)) {
            return submitSupportTicket(text);
        }
        setPendingTool('raise_ticket');
        setTicketDraft(text && !/^raise a ticket$/i.test(text) ? text : '');
        const tickets = await loadTickets().catch(() => []);
        return {
            toolResult: tickets.length
                ? `Describe the issue below, or open ticket status.\nRecent tickets:\n${tickets.map(ticketStatusLine).join('\n')}`
                : 'Describe the issue below. After you submit, check ticket status from Need Help.',
            cards: {
                type: 'ticket-form',
                items: tickets,
                footerTo: TICKET_STATUS_PATH,
                footerLabel: 'Open ticket status',
            },
        };
    }, [loadTickets, submitSupportTicket]);

    const showFaq = useCallback(async (topic) => {
        const cleaned = String(topic || '').trim();
        const query = cleaned && !/^(agent\s+)?faq$/i.test(cleaned)
            ? `?topic=${encodeURIComponent(cleaned)}`
            : '';
        const response = await GET_API(`${CHAT_API}/faq${query}`);
        const data = unwrapApiData(response) || {};
        const items = Array.isArray(data.items) ? data.items : [];
        if (!items.length) {
            return { toolResult: 'No HAPPPY FAQ is configured right now.' };
        }
        const lines = items.map((item, index) => `${index + 1}. ${item.question}\n${item.answer}`);
        return {
            toolResult: `HAPPPY FAQ${data.topic ? ` (${data.topic})` : ''}:\n${lines.join('\n\n')}`,
            cards: {
                type: 'faq',
                items,
                topic: data.topic || cleaned || null,
            },
        };
    }, []);

    const showTicketStatus = useCallback(async () => {
        const tickets = await loadTickets();
        return {
            toolResult: tickets.length
                ? `Recent tickets:\n${tickets.map(ticketStatusLine).join('\n')}`
                : 'No tickets yet. Raise one here or open ticket status.',
            cards: {
                type: 'tickets',
                items: tickets,
                footerTo: TICKET_STATUS_PATH,
                footerLabel: 'Open ticket status',
            },
        };
    }, [loadTickets]);

    const showCurrentPlan = useCallback(async () => {
        const [planState, dailyRes] = await Promise.all([
            dispatch(fetchHapppyAgentPlan({ silent: true, force: true })),
            dispatch(fetchDailyReferralRuns({ silent: true })),
        ]);
        const daily = parseDailyReferralRunsResponse(dailyRes);
        const snapshot = {
            plan: planState?.plan ?? happpyAgent?.plan,
            plan_end_date: planState?.plan_end_date ?? happpyAgent?.plan_end_date,
            has_plan_expired: !!(planState?.has_plan_expired ?? happpyAgent?.has_plan_expired),
            credit_plan: planState?.credit_plan ?? happpyAgent?.credit_plan,
            credit_left: planState?.credit_left ?? happpyAgent?.credit_left,
        };
        const used = displayDailyUsed(daily.dailyUsed, daily.dailyLimit);
        const lines = [
            `Plan: ${describePlan(snapshot)}`,
            snapshot.plan_end_date ? `Valid till: ${formatPlanDate(snapshot.plan_end_date)}` : null,
            `Status: ${snapshot.has_plan_expired ? 'expired' : 'active'}`,
            daily.dailyLimit ? `Daily jobs used: ${used} / ${daily.dailyLimit}` : null,
        ].filter(Boolean);
        return {
            toolResult: lines.join('\n'),
            cards: {
                type: 'plan',
                lines,
                footerTo: PLAN_PATH,
                footerLabel: 'Open plans',
            },
        };
    }, [dispatch, happpyAgent]);

    const showUserInfo = useCallback(async () => {
        const [statusRes, planState] = await Promise.all([
            dispatch(getAccountStatus()),
            dispatch(fetchHapppyAgentPlan({ silent: true })),
        ]);
        const gmail = statusRes?.data?.data?.gmail;
        const linkedin = statusRes?.data?.data?.linkedin;
        const resumeName = user?.resume ? String(user.resume) : '';
        const raw = planState?.raw || happpyAgent?.raw || {};
        const mode = raw?.outreach_mode === MODE_MANUAL ? 'Manual' : 'Auto';
        const lines = [
            `Name: ${user?.name || 'unknown'}`,
            `Profile email: ${user?.email || 'unknown'}`,
            formatAccountLine('Gmail', gmail),
            formatAccountLine('LinkedIn', linkedin),
            resumeName ? `Resume on file: ${resumeName}` : 'Resume on file: none',
            `Plan: ${describePlan(planState || happpyAgent)}`,
            `Outreach mode: ${mode}`,
        ];
        return {
            toolResult: lines.join('\n'),
            cards: {
                type: 'info',
                lines,
                footerTo: '/talent/job-agent/configure?tab=connected-accounts',
                footerLabel: 'Open connected accounts',
            },
        };
    }, [dispatch, happpyAgent, user?.email, user?.name, user?.resume]);

    const startDisconnect = useCallback(async (provider) => {
        const statusRes = await dispatch(getAccountStatus());
        const account = provider === 'gmail'
            ? statusRes?.data?.data?.gmail
            : statusRes?.data?.data?.linkedin;
        const label = provider === 'gmail' ? 'Gmail' : 'LinkedIn';
        if (Number(account?.status) !== 2 && Number(account?.status) !== 1) {
            return { toolResult: `${label} is not connected.` };
        }
        setPendingTool(provider === 'gmail' ? 'disconnect_gmail' : 'disconnect_linkedin');
        setDisconnectDraft('');
        return {
            toolResult: `${formatAccountLine(label, account)}. Enter a short reason (at least ${DISCONNECT_REASON_MIN} characters) to disconnect.`,
            cards: {
                type: 'disconnect-form',
                provider,
                accountLine: formatAccountLine(label, account),
            },
        };
    }, [dispatch]);

    const submitDisconnect = useCallback(async (provider, messageId = null) => {
        const reason = disconnectDraft.trim();
        if (reason.length < DISCONNECT_REASON_MIN) {
            toast.error(`Please enter a reason (at least ${DISCONNECT_REASON_MIN} characters).`);
            return;
        }
        if (busy) return;
        setBusy(true);
        try {
            const response = provider === 'gmail'
                ? await dispatch(disconnectGmail({ disconnect_reason: reason }))
                : await dispatch(disconnectLinkedin({ disconnect_reason: reason }));
            if (response?.data?.status !== 'success') {
                throw new Error(response?.data?.message || `Could not disconnect ${provider === 'gmail' ? 'Gmail' : 'LinkedIn'}.`);
            }
            setPendingTool(null);
            setDisconnectDraft('');
            dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
            const label = provider === 'gmail' ? 'Gmail' : 'LinkedIn';
            const outcome = {
                toolResult: `${label} disconnected.`,
                cards: { type: 'account', gmail: provider === 'gmail' ? { status: 0 } : undefined, linkedin: provider === 'linkedin' ? { status: 0 } : undefined },
            };
            if (messageId) {
                applyToolOutcome(messageId, {
                    toolResult: outcome.toolResult,
                    cards: { type: 'info', lines: [`${label} disconnected.`] },
                });
            } else {
                pushMessages([{ role: 'assistant', text: outcome.toolResult }]);
            }
            toast.success(`${label} account disconnected.`);
        } catch (err) {
            toast.error(
                err?.response?.data?.errors?.disconnect_reason?.[0]
                || err?.response?.data?.message
                || err?.message
                || 'Could not disconnect.',
            );
        } finally {
            setBusy(false);
        }
    }, [applyToolOutcome, busy, disconnectDraft, dispatch, pushMessages]);

    const showOutreachMode = useCallback(async (requestedMode) => {
        const planState = await dispatch(fetchHapppyAgentPlan({ silent: true, force: true }));
        const isPaidPlan = Number(planState?.plan ?? happpyAgent?.plan) === 2
            && !(planState?.has_plan_expired ?? happpyAgent?.has_plan_expired);
        const savedMode = (planState?.raw || happpyAgent?.raw)?.outreach_mode === MODE_MANUAL
            ? MODE_MANUAL
            : MODE_AUTO;
        const currentMode = isPaidPlan ? savedMode : MODE_AUTO;
        const wanted = String(requestedMode || '').toLowerCase();
        if ((wanted === MODE_AUTO || wanted === MODE_MANUAL) && wanted !== currentMode) {
            if (wanted === MODE_MANUAL && !isPaidPlan) {
                return {
                    toolResult: `Outreach mode is Auto. Manual mode needs a paid plan.`,
                    cards: {
                        type: 'outreach-mode',
                        mode: currentMode,
                        isPaidPlan,
                        footerTo: PLAN_PATH,
                        footerLabel: 'Upgrade plan',
                    },
                };
            }
            const saved = await dispatch(storeRecommendedJobs({
                jobs: [],
                auto_run: wanted === MODE_AUTO,
                outreach_mode: wanted,
            }));
            if (saved?.data?.status === 'error') {
                throw new Error(saved?.data?.message || 'Could not save outreach mode.');
            }
            dispatch(fetchHapppyAgentPlan({ silent: true, force: true })).catch(() => {});
            toast.success(wanted === MODE_AUTO ? 'Auto Mode saved' : 'Manual Mode saved');
            return {
                toolResult: `Outreach mode: ${wanted === MODE_AUTO ? 'Auto' : 'Manual'}`,
                cards: {
                    type: 'outreach-mode',
                    mode: wanted,
                    isPaidPlan,
                    footerTo: OUTREACH_MODE_PATH,
                    footerLabel: 'Open outreach mode',
                },
            };
        }
        return {
            toolResult: `Outreach mode: ${currentMode === MODE_AUTO ? 'Auto' : 'Manual'}${isPaidPlan ? '' : ' (Manual needs a paid plan)'}`,
            cards: {
                type: 'outreach-mode',
                mode: currentMode,
                isPaidPlan,
                footerTo: OUTREACH_MODE_PATH,
                footerLabel: 'Open outreach mode',
            },
        };
    }, [dispatch, happpyAgent]);

    const loadBlockedCompanies = useCallback(async () => {
        const response = await GET_API(`${API_URL}talent/outreach/settings/disabled-companies`);
        return response?.data?.status === 200 && Array.isArray(response?.data?.data)
            ? response.data.data
            : [];
    }, []);

    const showBlockedCompanies = useCallback(async (preset) => {
        const items = await loadBlockedCompanies();
        setPendingTool('show_blocked_companies');
        const query = String(preset || '').trim();
        if (query && query.length >= 2 && !/^block(ed)? companies$/i.test(query)) {
            setBlockSearch(query);
        }
        return {
            toolResult: items.length
                ? `Blocked companies (${items.length}):\n${items.map((row, index) => `${index + 1}. ${companyLabel(row)}`).join('\n')}`
                : 'No companies blocked yet. Search below to add one.',
            cards: {
                type: 'blocked-companies',
                items,
                footerTo: BLOCKED_COMPANIES_PATH,
                footerLabel: 'Open blocked companies',
            },
        };
    }, [loadBlockedCompanies]);

    const searchBlockedCompanies = useCallback((query) => {
        const q = String(query || '').trim();
        setBlockSearch(query);
        if (blockSearchTimerRef.current) {
            window.clearTimeout(blockSearchTimerRef.current);
        }
        if (q.length < 2) {
            setBlockOptions([]);
            setBlockOptionsLoading(false);
            return;
        }
        setBlockOptionsLoading(true);
        blockSearchTimerRef.current = window.setTimeout(async () => {
            try {
                const response = await GET_API(
                    `${API_URL}talent/outreach/settings/companies?search=${encodeURIComponent(q)}`,
                );
                setBlockOptions(
                    response?.data?.status === 200 && Array.isArray(response?.data?.data)
                        ? response.data.data
                        : [],
                );
            } catch {
                setBlockOptions([]);
            } finally {
                setBlockOptionsLoading(false);
            }
        }, 300);
    }, []);

    const addBlockedCompany = useCallback(async (company, messageId = null) => {
        if (!company?.id || busy) return;
        setBusy(true);
        try {
            const response = await POST_API(`${API_URL}talent/outreach/settings/disabled-companies`, {
                company_id: company.id,
            });
            if (Number(response?.data?.status) !== 200) {
                throw new Error(response?.data?.message || 'Could not block that company.');
            }
            const items = await loadBlockedCompanies();
            setBlockSearch('');
            setBlockOptions([]);
            const outcome = {
                toolResult: `Blocked ${company.company_name || company.name}.\n${
                    items.length ? items.map((row, index) => `${index + 1}. ${companyLabel(row)}`).join('\n') : ''
                }`,
                cards: {
                    type: 'blocked-companies',
                    items,
                    footerTo: BLOCKED_COMPANIES_PATH,
                    footerLabel: 'Open blocked companies',
                },
            };
            applyToolOutcome(messageId, outcome);
            toast.success('Company added to blocked list');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Could not block that company.');
        } finally {
            setBusy(false);
        }
    }, [applyToolOutcome, busy, loadBlockedCompanies]);

    const removeBlockedCompany = useCallback(async (item, messageId = null) => {
        if (!item?.id || busy) return;
        setBusy(true);
        try {
            const response = await DELETE_API(`${API_URL}talent/outreach/settings/disabled-companies/${item.id}`);
            if (Number(response?.data?.status) !== 200) {
                throw new Error(response?.data?.message || 'Could not unblock that company.');
            }
            const items = await loadBlockedCompanies();
            applyToolOutcome(messageId, {
                toolResult: items.length
                    ? `Blocked companies (${items.length}):\n${items.map((row, index) => `${index + 1}. ${companyLabel(row)}`).join('\n')}`
                    : 'No companies blocked.',
                cards: {
                    type: 'blocked-companies',
                    items,
                    footerTo: BLOCKED_COMPANIES_PATH,
                    footerLabel: 'Open blocked companies',
                },
            });
            toast.success('Company removed from blocked list');
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || 'Could not unblock that company.');
        } finally {
            setBusy(false);
        }
    }, [applyToolOutcome, busy, loadBlockedCompanies]);

    const submitTicketForm = useCallback(async (e, messageId = null) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
            const outcome = await submitSupportTicket(ticketDraft);
            if (messageId) {
                applyToolOutcome(messageId, outcome, null, activeSessionId);
            } else {
                pushMessages([{
                    role: 'assistant',
                    text: outcome.toolResult,
                    cards: outcome.cards,
                }]);
            }
            toast.success('Ticket submitted');
        } catch (err) {
            toast.error(err?.message || 'Could not submit the ticket.');
        } finally {
            setBusy(false);
        }
    }, [activeSessionId, applyToolOutcome, busy, pushMessages, submitSupportTicket, ticketDraft]);

    const connectLinkedinTool = useCallback(async () => {
        const statusRes = await dispatch(getAccountStatus());
        const linkedin = statusRes?.data?.data?.linkedin;
        if (linkedin?.status === 2) {
            setPendingTool(null);
            setLinkedinNeedsCode(false);
            return { toolResult: 'LinkedIn is already connected.' };
        }
        setPendingTool('connect_linkedin');
        setLinkedinNeedsCode(linkedin?.status === 1 || linkedin?.auth_type === 'code_required');
        setLinkedinForm((prev) => ({
            ...prev,
            email: linkedin?.email || prev.email || user?.email || '',
        }));
        return {
            toolResult: linkedin?.status === 1
                ? 'LinkedIn needs a verification code. Enter the code from email or SMS below.'
                : 'Enter your LinkedIn email and password. We store a token, not a readable password.',
            cards: { type: 'linkedin-form' },
        };
    }, [dispatch, user?.email]);

    const submitLinkedinForm = useCallback(
        async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            try {
                if (linkedinNeedsCode) {
                    if (!linkedinForm.code.trim()) {
                        toast.error('Verification code is required');
                        return;
                    }
                    const response = await dispatch(verifyLinkedin({ code: linkedinForm.code.trim() }));
                    if (response?.data?.data?.status === 2) {
                        setPendingTool(null);
                        setLinkedinNeedsCode(false);
                        pushMessages([{ role: 'assistant', text: 'LinkedIn connected successfully.' }]);
                    } else {
                        pushMessages([
                            {
                                role: 'assistant',
                                text: response?.data?.message || 'Could not verify LinkedIn. Check the code and try again.',
                            },
                        ]);
                    }
                    return;
                }
                if (!linkedinForm.email.trim() || !linkedinForm.password.trim()) {
                    toast.error('Email and password are required');
                    return;
                }
                const response = await dispatch(
                    connectLinkedin({ email: linkedinForm.email.trim(), password: linkedinForm.password }),
                );
                const data = response?.data?.data;
                if (data?.status === 2) {
                    setPendingTool(null);
                    setLinkedinForm((prev) => ({ ...prev, password: '', code: '' }));
                    pushMessages([{ role: 'assistant', text: 'LinkedIn connected successfully.' }]);
                } else if (data?.status === 1) {
                    setLinkedinNeedsCode(true);
                    pushMessages([
                        {
                            role: 'assistant',
                            text: 'Verification code sent. Check email or SMS, then submit the code.',
                            cards: { type: 'linkedin-form' },
                        },
                    ]);
                } else {
                    pushMessages([
                        {
                            role: 'assistant',
                            text: response?.data?.message || 'LinkedIn connect failed. Please try again.',
                        },
                    ]);
                }
            } catch (err) {
                pushMessages([
                    {
                        role: 'assistant',
                        text: err?.response?.data?.message || 'LinkedIn connect failed. Please try again.',
                    },
                ]);
            } finally {
                setBusy(false);
            }
        },
        [busy, dispatch, linkedinForm, linkedinNeedsCode, pushMessages],
    );

    const uploadResume = useCallback(async (file) => {
        await checkIfFilePasswordProtected(file);
        if (!FILE_REGEX.exec(file.name)) {
            throw new Error('Resume must be a PDF or DOCX file.');
        }
        if (file.size / 1024 > MAX_FILE_SIZE_KB) {
            throw new Error('File size should be less than 2 MB.');
        }
        const extension = file.name.split('.')?.pop()?.toLowerCase();
        const res = await generateAwsUploadUrl({ file_type: extension }, true)(dispatch);
        if (res?.status !== 200 || !res?.data?.url || !res?.data?.file_id) {
            throw new Error('Could not start resume upload.');
        }
        const put = await fetch(res.data.url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
        });
        if (put.status !== 200) {
            throw new Error('Resume upload failed.');
        }
        const reqMap = { resume_file_id: res.data.file_id };
        const payload = { field: 'resume_file_id', value: reqMap };
        let payloadFormData = new FormData();
        for (const [key, data] of Object.entries(payload)) {
            payloadFormData = buildFormData(payloadFormData, data, key);
        }
        const saved = await profileUpsert(payloadFormData, true)(dispatch);
        dispatch({ type: SET_PROFILE_DATA, payload: { ...(saved?.data?.data || {}) } });
        dispatch({ type: UPDATE_CURRENT_USER, payload: { resume: file.name } });
        sessionStorage.setItem('fetchLatestResume', true);
        pushMessages([{
            role: 'assistant',
            text: `Thank you! ${file.name} is saved — Happpy will use this resume on your applications.`,
            animate: false,
        }]);
        toast.success('Resume uploaded');
    }, [dispatch, pushMessages]);

    const runTool = useCallback(
        async (toolId, {
            text = '',
            file = null,
            messageId = null,
            dbMessageId = null,
            sessionId = null,
            arguments: toolArguments = {},
        } = {}) => {
            if (messageId && executedToolsRef.current.has(messageId) && !file) {
                return;
            }
            if (messageId) {
                executedToolsRef.current.add(messageId);
            }
            setBusy(true);
            try {
                let outcome = null;
                if (toolId === 'run_job_with_link') {
                    outcome = await runJobWithLink(extractHttpUrl(text) || text);
                } else if (toolId === 'show_recommended_jobs') {
                    outcome = await showRecommendedJobs(toolArguments);
                } else if (toolId === 'run_recommended_jobs') {
                    outcome = await runRecommendedJobs(toolArguments, messages);
                } else if (toolId === 'show_agent_runs') {
                    outcome = await showAgentRuns();
                } else if (toolId === 'show_replies') {
                    outcome = await showReplies();
                } else if (toolId === 'show_queue') {
                    outcome = await showQueue();
                } else if (toolId === 'onboarding') {
                    outcome = await runOnboarding(messageId);
                } else if (toolId === 'update_real_name') {
                    outcome = await updateRealName(text);
                } else if (toolId === 'update_talent_profile') {
                    outcome = await updateTalentProfile(toolArguments);
                } else if (toolId === 'show_outreach_default_message') {
                    outcome = await showOutreachDefaultMessage();
                } else if (toolId === 'update_outreach_default_message') {
                    outcome = await updateOutreachDefaultMessage(toolArguments);
                } else if (toolId === 'show_followup_settings') {
                    outcome = await showFollowupSettings();
                } else if (toolId === 'update_followup_settings') {
                    outcome = await updateFollowupSettings(toolArguments);
                } else if (toolId === 'connect_gmail') {
                    outcome = await connectGmail(messageId);
                } else if (toolId === 'connect_linkedin') {
                    outcome = await connectLinkedinTool();
                } else if (toolId === 'show_account_status') {
                    outcome = await showAccountStatus();
                } else if (toolId === 'show_faq') {
                    outcome = await showFaq(text);
                } else if (toolId === 'raise_ticket') {
                    outcome = await raiseTicket(text);
                } else if (toolId === 'show_ticket_status') {
                    outcome = await showTicketStatus();
                } else if (toolId === 'show_current_plan') {
                    outcome = await showCurrentPlan();
                } else if (toolId === 'show_user_info') {
                    outcome = await showUserInfo();
                } else if (toolId === 'disconnect_gmail') {
                    outcome = await startDisconnect('gmail');
                } else if (toolId === 'disconnect_linkedin') {
                    outcome = await startDisconnect('linkedin');
                } else if (toolId === 'show_outreach_mode') {
                    outcome = await showOutreachMode(text);
                } else if (toolId === 'show_blocked_companies') {
                    outcome = await showBlockedCompanies(text);
                } else if (toolId === 'upload_resume') {
                    if (file) {
                        await uploadResume(file);
                        return;
                    }
                    setPendingTool('upload_resume');
                    outcome = {
                        toolResult: 'Choose a PDF or DOCX resume (max 2 MB).',
                        cards: { type: 'resume-upload' },
                    };
                }
                applyToolOutcome(messageId, outcome, dbMessageId, sessionId);
            } catch (err) {
                const message = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
                if (messageId) {
                    patchMessage(messageId, { toolResult: message });
                } else {
                    pushMessages([{ role: 'assistant', text: message }]);
                }
                persistToolResult(sessionId || activeSessionId, dbMessageId, message);
            } finally {
                setBusy(false);
            }
        },
        [
            activeSessionId,
            applyToolOutcome,
            connectGmail,
            connectLinkedinTool,
            runOnboarding,
            updateRealName,
            updateTalentProfile,
            showOutreachDefaultMessage,
            updateOutreachDefaultMessage,
            showFollowupSettings,
            updateFollowupSettings,
            patchMessage,
            persistToolResult,
            pushMessages,
            raiseTicket,
            runJobWithLink,
            runRecommendedJobs,
            messages,
            showAccountStatus,
            showAgentRuns,
            showFaq,
            showQueue,
            showBlockedCompanies,
            showCurrentPlan,
            showOutreachMode,
            showRecommendedJobs,
            showReplies,
            showTicketStatus,
            showUserInfo,
            startDisconnect,
            uploadResume,
        ],
    );

    const ensureSession = useCallback(async () => {
        if (activeSessionId) return activeSessionId;
        const response = await POST_API(`${CHAT_API}/sessions`, {});
        const session = unwrapApiData(response);
        if (!session?.id) {
            throw new Error('Could not create a HAPPPY chat.');
        }
        setActiveSessionId(session.id);
        setSessions((prev) => [session, ...prev]);
        return session.id;
    }, [activeSessionId]);

    const sendChatMessage = useCallback(async (rawText) => {
        const text = String(rawText || '').trim();
        if (!text || busy) return;
        setDraft('');
        setPendingTool(null);
        pushMessages([{ role: 'user', text }]);
        setBusy(true);

        try {
            const sessionId = await ensureSession();
            const response = await POST_API(`${CHAT_API}/sessions/${sessionId}/messages`, {
                message: text,
            });
            const data = unwrapApiData(response);
            const assistant = data?.assistant_message;
            if (!assistant) {
                throw new Error('HAPPPY did not return a response.');
            }

            const assistantId = `db-${assistant.id}`;
            pushMessages([
                {
                    id: assistantId,
                    role: 'assistant',
                    text: assistant.content,
                    toolName: assistant.tool_name || null,
                    toolArguments: assistant.tool_arguments || {},
                    toolResult: assistant.tool_result || null,
                },
            ]);
            if (data?.session) {
                setSessions((prev) => [
                    data.session,
                    ...prev.filter((item) => item.id !== data.session.id),
                ]);
            } else {
                refreshSessions().catch(() => {});
            }

            if (assistant.tool_name) {
                await runTool(assistant.tool_name, {
                    text: assistant.tool_arguments?.message
                        || assistant.tool_arguments?.url
                        || assistant.tool_arguments?.topic
                        || assistant.tool_arguments?.mode
                        || assistant.tool_arguments?.company
                        || assistant.tool_arguments?.name
                        || text,
                    arguments: assistant.tool_arguments || {},
                    messageId: assistantId,
                    dbMessageId: assistant.id,
                    sessionId,
                });
            }
        } catch (err) {
            pushMessages([
                {
                    role: 'assistant',
                    text: err?.response?.data?.message
                        || err?.message
                        || 'HAPPPY is unavailable right now. Please try again in a moment.',
                },
            ]);
        } finally {
            setBusy(false);
        }
    }, [
        busy,
        ensureSession,
        pushMessages,
        refreshSessions,
        runTool,
    ]);

    const handleSend = (e) => {
        e?.preventDefault();
        sendChatMessage(draft);
    };

    const deleteSession = async (sessionId) => {
        if (!sessionId || busy) return;
        if (!window.confirm('Delete this saved HAPPPY chat? This cannot be undone.')) return;
        try {
            await DELETE_API(`${CHAT_API}/sessions/${sessionId}`);
            const next = sessions.filter((item) => item.id !== sessionId);
            setSessions(next);
            if (activeSessionId === sessionId) {
                if (next[0]?.id) {
                    await loadSession(next[0].id);
                } else {
                    startNewChat();
                }
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not delete this chat.');
        }
    };

    const handleRunRecommended = async (job) => {
        if (!job?.id || runningJobId) return;
        setRunningJobId(job.id);
        try {
            const response = await dispatch(
                submitAutoRunRequest({
                    job_id: job.id,
                    source: 'happpy-chatbot',
                }),
            );
            const message = response?.data?.message || 'Happpy Agent started on that role.';
            pushMessages([{ role: 'assistant', text: message }]);
        } catch (err) {
            pushMessages([
                {
                    role: 'assistant',
                    text: err?.response?.data?.message || 'Failed to run Happpy Agent on that job.',
                },
            ]);
        } finally {
            setRunningJobId(null);
        }
    };

    const closeRecommendedJobDescription = useCallback(() => {
        setRecommendedJobModal((prev) => ({ ...prev, open: false }));
    }, []);

    const openRecommendedJobDescription = useCallback(async (job) => {
        setRecommendedJobModal({
            open: true,
            loading: true,
            title: job?.RequestForTalent || jobDisplay(job).title || 'Role',
            company: job?.company_name || jobDisplay(job).company || 'Company',
            descriptionHtml: formatDescriptionHtml('', RECOMMENDED_JD_FALLBACK),
            applyUrl: job?.apply_url || '',
        });

        const inlineDescription = job?.description || '';
        if (inlineDescription) {
            setRecommendedJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatDescriptionHtml(inlineDescription, RECOMMENDED_JD_FALLBACK),
            }));
            return;
        }

        try {
            const hrNumber = job?.HR_Number;
            if (!hrNumber) {
                setRecommendedJobModal((prev) => ({ ...prev, loading: false }));
                return;
            }
            const response = await GET_API(
                withHapppyAgentInfoQuery(`${API_SINGLE_OPP}?hr_number=${encodeURIComponent(hrNumber)}`),
            );
            const payload = response?.data || {};
            const descriptionRaw =
                payload?.JobDescription
                ?? payload?.job_description
                ?? payload?.Description
                ?? payload?.description
                ?? payload?.job_details?.description
                ?? payload?.hr_detail?.description
                ?? payload?.hr_detail?.job_description
                ?? '';

            setRecommendedJobModal((prev) => ({
                ...prev,
                loading: false,
                descriptionHtml: formatDescriptionHtml(descriptionRaw, RECOMMENDED_JD_FALLBACK),
            }));
        } catch {
            setRecommendedJobModal((prev) => ({ ...prev, loading: false }));
        }
    }, []);

    const openPasteDrawer = () => {
        window.dispatchEvent(new CustomEvent(HAPPPY_CHATBOT_OPEN_PASTE_JOB));
    };

    const exportChat = useCallback(async () => {
        const active = sessions.find((item) => item.id === activeSessionId);
        const text = formatChatExport({
            sessionId: activeSessionId,
            title: active?.title,
            summary: active?.summary,
            messages,
        });
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                toast.success('Chat copied. Paste it here for debug.');
            } else {
                throw new Error('clipboard unavailable');
            }
        } catch {
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `happpy-chat-${activeSessionId || 'draft'}.txt`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Chat downloaded.');
        }
    }, [activeSessionId, messages, sessions]);

    const renderCards = (cards) => {
        if (!cards) return null;
        if (cards.type === 'actions') {
            return (
                <div className="happpy-chatbot__card-actions">
                    {cards.items.map((item) => {
                        if (item.kind === 'paste-drawer') {
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                                    onClick={openPasteDrawer}
                                >
                                    {item.label}
                                </button>
                            );
                        }
                        if (item.kind === 'raise-ticket') {
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                                    disabled={busy}
                                    onClick={() => runTool('raise_ticket')}
                                >
                                    {item.label}
                                </button>
                            );
                        }
                        return (
                            <Link key={item.to} to={item.to} className="happpy-chatbot__mini-btn">
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            );
        }
        if (cards.type === 'recommended') {
            return (
                <HapppyRecommendedJobsCards
                    cards={cards}
                    brokenRecommendedLogos={brokenRecommendedLogos}
                    setBrokenRecommendedLogos={setBrokenRecommendedLogos}
                    runningJobId={runningJobId}
                    onRun={handleRunRecommended}
                    onOpenDescription={openRecommendedJobDescription}
                />
            );
        }
        if (cards.type === 'runs') {
            return (
                <div className="happpy-chatbot__cards happpy-chatbot__cards--scroll">
                    {cards.items.map((row, idx) => {
                        const display = jobDisplay(row);
                        return (
                            <article key={row.row?.outreach_hr_id || row.apply_url || idx} className="happpy-chatbot__card">
                                <div className="happpy-chatbot__card-row">
                                    <div>
                                        <p className="happpy-chatbot__card-title" title={display.title}>{display.title}</p>
                                        <p className="happpy-chatbot__card-meta">
                                            {[display.company, row.status_string].filter(Boolean).join(' · ') || 'Company'}
                                        </p>
                                    </div>
                                    <span className="happpy-chatbot__pill">{row.label || row.run_by || 'Run'}</span>
                                </div>
                            </article>
                        );
                    })}
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'replies') {
            const mapJob = (job, tone) => (
                <article key={`${tone}-${job.id}`} className="happpy-chatbot__card">
                    <div className="happpy-chatbot__card-row">
                        <div>
                            <p className="happpy-chatbot__card-title">{job.jobTitle || job.job_title || 'Role'}</p>
                            <p className="happpy-chatbot__card-meta">
                                {[job.companyName || job.company_name, job.senderName, job.source].filter(Boolean).join(' · ') || 'Company'}
                            </p>
                        </div>
                        <span className={`happpy-chatbot__pill happpy-chatbot__pill--${tone}`}>
                            {tone === 'positive' ? 'Positive' : 'Negative'}
                        </span>
                    </div>
                </article>
            );
            return (
                <div className="happpy-chatbot__cards happpy-chatbot__cards--scroll">
                    {cards.positives.map((job) => mapJob(job, 'positive'))}
                    {cards.negatives.map((job) => mapJob(job, 'negative'))}
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'faq') {
            const items = cards.items || [];
            return (
                <div className={`happpy-chatbot__cards happpy-chatbot__cards--scroll happpy-chatbot__cards--faq${items.length === 1 ? ' happpy-chatbot__cards--faq-one' : ''}`}>
                    {items.map((item) => (
                        <article key={item.id || item.question} className="happpy-chatbot__card happpy-chatbot__card--faq">
                            <p className="happpy-chatbot__card-title">{item.question}</p>
                            <p className="happpy-chatbot__card-meta">{item.answer}</p>
                            {item.cta?.kind === 'link' && item.cta.to ? (
                                <div className="happpy-chatbot__card-actions">
                                    <Link to={item.cta.to} className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary">
                                        {item.cta.label || 'Open'}
                                    </Link>
                                </div>
                            ) : null}
                            {item.cta?.kind === 'paste-drawer' ? (
                                <div className="happpy-chatbot__card-actions">
                                    <button
                                        type="button"
                                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                                        onClick={openPasteDrawer}
                                    >
                                        {item.cta.label || 'Paste a job link'}
                                    </button>
                                </div>
                            ) : null}
                            {item.cta?.kind === 'raise-ticket' ? (
                                <div className="happpy-chatbot__card-actions">
                                    <button
                                        type="button"
                                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                                        disabled={busy}
                                        onClick={() => runTool('raise_ticket')}
                                    >
                                        {item.cta.label || 'Raise a ticket'}
                                    </button>
                                </div>
                            ) : null}
                        </article>
                    ))}
                </div>
            );
        }
        if (cards.type === 'queue') {
            return (
                <div className="happpy-chatbot__cards happpy-chatbot__cards--scroll">
                    {cards.items.map((row) => {
                        const display = jobDisplay(row);
                        return (
                            <article key={`${row.external ? 'ext' : 'int'}:${row.id}`} className="happpy-chatbot__card">
                                <div className="happpy-chatbot__card-row">
                                    <div>
                                        <p className="happpy-chatbot__card-title" title={display.title}>{display.title}</p>
                                        <p className="happpy-chatbot__card-meta">
                                            {[display.company, display.source, display.date].filter(Boolean).join(' · ')}
                                        </p>
                                    </div>
                                    <span className="happpy-chatbot__pill happpy-chatbot__pill--queue">Queue</span>
                                </div>
                            </article>
                        );
                    })}
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'ticket-form') {
            return (
                <div>
                    <form className="happpy-chatbot__form" onSubmit={(e) => submitTicketForm(e)}>
                        <label htmlFor="hc-ticket-msg">Describe the issue</label>
                        <textarea
                            id="hc-ticket-msg"
                            rows={3}
                            value={ticketDraft}
                            onChange={(e) => setTicketDraft(e.target.value)}
                            placeholder="What went wrong, and what did you expect?"
                        />
                        <button type="submit" className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary" disabled={busy || !ticketDraft.trim()}>
                            Submit ticket
                        </button>
                    </form>
                    <div className="happpy-chatbot__card-actions">
                        <Link to={cards.footerTo || TICKET_STATUS_PATH} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel || 'Open ticket status'}
                        </Link>
                    </div>
                </div>
            );
        }
        if (cards.type === 'tickets') {
            return (
                <div className="happpy-chatbot__cards happpy-chatbot__cards--scroll happpy-chatbot__cards--tickets">
                    {(cards.items || []).map((row, idx) => (
                        <article key={row.id || idx} className="happpy-chatbot__card happpy-chatbot__card--status">
                            <div className="happpy-chatbot__card-row">
                                <div>
                                    <p className="happpy-chatbot__card-title">{statusLabel(row.status)}</p>
                                    {formatWhen(row.created_at || row.raised_at) ? (
                                        <p className="happpy-chatbot__card-meta">{formatWhen(row.created_at || row.raised_at)}</p>
                                    ) : null}
                                    <p className="happpy-chatbot__status-line">
                                        {String(row.message || '').replace(/\s+/g, ' ').trim() || 'No message'}
                                    </p>
                                </div>
                                <span className="happpy-chatbot__pill happpy-chatbot__pill--queue">
                                    {statusLabel(row.status)}
                                </span>
                            </div>
                        </article>
                    ))}
                    <Link to={cards.footerTo || TICKET_STATUS_PATH} className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary">
                        {cards.footerLabel || 'Open ticket status'}
                    </Link>
                </div>
            );
        }
        if (cards.type === 'linkedin-form') {
            return (
                <form className="happpy-chatbot__form" onSubmit={submitLinkedinForm}>
                    {!linkedinNeedsCode ? (
                        <>
                            <label htmlFor="hc-li-email">LinkedIn email</label>
                            <input
                                id="hc-li-email"
                                type="email"
                                autoComplete="username"
                                value={linkedinForm.email}
                                onChange={(e) => setLinkedinForm((p) => ({ ...p, email: e.target.value }))}
                            />
                            <label htmlFor="hc-li-pass">Password</label>
                            <input
                                id="hc-li-pass"
                                type="password"
                                autoComplete="current-password"
                                value={linkedinForm.password}
                                onChange={(e) => setLinkedinForm((p) => ({ ...p, password: e.target.value }))}
                            />
                        </>
                    ) : (
                        <>
                            <label htmlFor="hc-li-code">Verification code</label>
                            <input
                                id="hc-li-code"
                                value={linkedinForm.code}
                                onChange={(e) => setLinkedinForm((p) => ({ ...p, code: e.target.value }))}
                            />
                        </>
                    )}
                    <button type="submit" className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary" disabled={busy}>
                        {linkedinNeedsCode ? 'Verify LinkedIn' : 'Connect LinkedIn'}
                    </button>
                </form>
            );
        }
        if (cards.type === 'account') {
            return (
                <div className="happpy-chatbot__cards">
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">Connected accounts</p>
                        <p className="happpy-chatbot__status-line">{cards.gmailLine || formatAccountLine('Gmail', cards.gmail)}</p>
                        <p className="happpy-chatbot__status-line">{cards.linkedinLine || formatAccountLine('LinkedIn', cards.linkedin)}</p>
                        <p className="happpy-chatbot__status-line">
                            {cards.resume ? `Resume: ${cards.resume}` : 'Resume on file: none'}
                        </p>
                    </article>
                </div>
            );
        }
        if (cards.type === 'plan' || cards.type === 'info') {
            return (
                <div className="happpy-chatbot__cards">
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">
                            {cards.type === 'plan' ? 'Current plan' : 'Your HAPPPY info'}
                        </p>
                        {(cards.lines || []).map((line) => (
                            <p key={line} className="happpy-chatbot__status-line">{line}</p>
                        ))}
                    </article>
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'real-name-form') {
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'real-name-form')?.id;
            return (
                <form
                    className="happpy-chatbot__form"
                    onSubmit={(e) => submitRealNameForm(e, latestId)}
                >
                    <label htmlFor="hc-real-name">Full legal name</label>
                    <input
                        id="hc-real-name"
                        type="text"
                        autoComplete="name"
                        value={realNameDraft}
                        onChange={(e) => setRealNameDraft(e.target.value)}
                        placeholder="First Last"
                    />
                    <button
                        type="submit"
                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                        disabled={busy || !isRealNameComplete(realNameDraft)}
                    >
                        Save name
                    </button>
                </form>
            );
        }
        if (cards.type === 'profile-form') {
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'profile-form')?.id;
            return (
                <form
                    className="happpy-chatbot__form"
                    onSubmit={(e) => submitProfileForm(e, latestId)}
                >
                    <label htmlFor="hc-profile-phone">Phone number</label>
                    <input
                        id="hc-profile-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={profileDraft.contact_number}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            contact_number: normalizeProfilePhone(e.target.value),
                        }))}
                        placeholder="10-digit mobile"
                    />
                    <label htmlFor="hc-profile-notice">Notice period</label>
                    <select
                        id="hc-profile-notice"
                        value={profileDraft.joining_period}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            joining_period: e.target.value,
                        }))}
                    >
                        <option value="">Keep unchanged</option>
                        {PROFILE_NOTICE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    <label htmlFor="hc-profile-current-ctc">Current CTC (LPA)</label>
                    <input
                        id="hc-profile-current-ctc"
                        type="text"
                        inputMode="decimal"
                        value={profileDraft.current_ctc}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            current_ctc: e.target.value,
                        }))}
                        placeholder="e.g. 12"
                    />
                    <label htmlFor="hc-profile-expected-ctc">Expected CTC (LPA)</label>
                    <input
                        id="hc-profile-expected-ctc"
                        type="text"
                        inputMode="decimal"
                        value={profileDraft.expected_ctc}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            expected_ctc: e.target.value,
                        }))}
                        placeholder="e.g. 18"
                    />
                    <label htmlFor="hc-profile-exp">Total experience (years)</label>
                    <input
                        id="hc-profile-exp"
                        type="text"
                        inputMode="decimal"
                        value={profileDraft.total_experience}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            total_experience: e.target.value,
                        }))}
                        placeholder="e.g. 5.5"
                    />
                    <label htmlFor="hc-profile-linkedin">LinkedIn URL</label>
                    <input
                        id="hc-profile-linkedin"
                        type="url"
                        value={profileDraft.linkedin_id}
                        onChange={(e) => setProfileDraft((prev) => ({
                            ...prev,
                            linkedin_id: e.target.value,
                        }))}
                        placeholder="https://www.linkedin.com/in/username"
                    />
                    <button
                        type="submit"
                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                        disabled={busy}
                    >
                        Save profile
                    </button>
                </form>
            );
        }
        if (cards.type === 'outreach-message-status') {
            return (
                <div className="happpy-chatbot__cards">
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">Gmail outreach</p>
                        <p className="happpy-chatbot__status-line">
                            Subject: {cards.gmail?.subject?.trim() || 'Not set'}
                        </p>
                        <OutreachMessageHtmlPreview html={cards.gmail?.message} />
                    </article>
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">LinkedIn outreach</p>
                        <OutreachMessageHtmlPreview html={cards.linkedin?.message} />
                    </article>
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary">
                            {cards.footerLabel || 'Open message templates'}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'outreach-message-form') {
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'outreach-message-form')?.id;
            const isGmail = Number(outreachMessageDraft.provider) === OUTREACH_PROVIDER_GMAIL;
            return (
                <form
                    className="happpy-chatbot__form"
                    onSubmit={(e) => submitOutreachMessageForm(e, latestId)}
                >
                    <label htmlFor="hc-outreach-provider">Channel</label>
                    <select
                        id="hc-outreach-provider"
                        value={outreachMessageDraft.provider}
                        onChange={async (e) => {
                            const nextProvider = Number(e.target.value);
                            setOutreachShowHtmlSource(false);
                            try {
                                const templates = await loadOutreachTemplates();
                                setOutreachMessageDraft(buildOutreachEditorDraft(templates, nextProvider));
                            } catch {
                                setOutreachMessageDraft((prev) => ({
                                    ...prev,
                                    provider: nextProvider,
                                }));
                            }
                        }}
                    >
                        <option value={OUTREACH_PROVIDER_GMAIL}>Gmail</option>
                        <option value={OUTREACH_PROVIDER_LINKEDIN}>LinkedIn</option>
                    </select>
                    {isGmail ? (
                        <>
                            <label htmlFor="hc-outreach-subject">Email subject</label>
                            <input
                                id="hc-outreach-subject"
                                type="text"
                                value={outreachMessageDraft.message_subject}
                                onChange={(e) => setOutreachMessageDraft((prev) => ({
                                    ...prev,
                                    message_subject: e.target.value,
                                }))}
                                placeholder="Referral outreach subject"
                            />
                        </>
                    ) : null}
                    <div className="happpy-chatbot__outreach-editor-head">
                        <label htmlFor="hc-outreach-body">Outreach message</label>
                        <button
                            type="button"
                            className="happpy-chatbot__mini-btn"
                            onClick={() => setOutreachShowHtmlSource((prev) => !prev)}
                        >
                            <MatIcon name="code" />
                            {outreachShowHtmlSource ? 'Rich text' : 'View HTML'}
                        </button>
                    </div>
                    <div className="happpy-chatbot__template-editor-wrap">
                        {outreachShowHtmlSource ? (
                            <textarea
                                id="hc-outreach-body"
                                className="happpy-chatbot__html-source"
                                rows={8}
                                spellCheck={false}
                                value={outreachMessageDraft.message_template}
                                onChange={(e) => setOutreachMessageDraft((prev) => ({
                                    ...prev,
                                    message_template: e.target.value,
                                }))}
                                placeholder="<p>Include {{outreachEmployeeName}}, {{jobTitle}}, {{companyName}}, {{jobLink}}</p>"
                            />
                        ) : (
                            <TemplateEditor
                                key={`hc-outreach-${outreachMessageDraft.provider}`}
                                variant="compact"
                                placeholder="Type your outreach message here…"
                                value={outreachMessageDraft.message_template || ''}
                                onChange={(content) => setOutreachMessageDraft((prev) => ({
                                    ...prev,
                                    message_template: content,
                                }))}
                                dynamicFields={OUTREACH_TEMPLATE_VARS}
                                showDynamicDropdowns
                            />
                        )}
                    </div>
                    <p className="happpy-chatbot__status-line">
                        Use Variables to insert {OUTREACH_TEMPLATE_VARS.join(', ')}.
                    </p>
                    <button
                        type="submit"
                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                        disabled={busy}
                    >
                        Save outreach message
                    </button>
                </form>
            );
        }
        if (cards.type === 'followup-settings-status') {
            return (
                <FollowupStatusPanel
                    cards={cards}
                    onLoad={loadFollowupSettings}
                />
            );
        }
        if (cards.type === 'followup-settings-form') {
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'followup-settings-form')?.id;
            const linkedinConnected = cards.linkedinConnected ?? followupLinkedinConnected;
            const pickTemplate = (channel, idx) => {
                const templates = channel === FOLLOWUP_CHANNEL_GMAIL
                    ? FOLLOWUP_TEMPLATES_GMAIL
                    : FOLLOWUP_TEMPLATES_LINKEDIN;
                setFollowupDraft((prev) => ({
                    ...prev,
                    [`message_${channel}`]: templates[idx] || prev[`message_${channel}`],
                }));
            };
            const templateSelectValue = (channel, message) => {
                const templates = channel === FOLLOWUP_CHANNEL_GMAIL
                    ? FOLLOWUP_TEMPLATES_GMAIL
                    : FOLLOWUP_TEMPLATES_LINKEDIN;
                const idx = templates.findIndex((t) => t === String(message || '').trim());
                return idx >= 0 ? String(idx) : 'custom';
            };
            const renderFollowupChannel = (channel, title, locked) => {
                const disabledKey = channel === FOLLOWUP_CHANNEL_GMAIL
                    ? 'disabled_followup_gmail'
                    : 'disabled_followup_linkedin';
                const intervalKey = channel === FOLLOWUP_CHANNEL_GMAIL
                    ? 'interval_days_gmail'
                    : 'interval_days_linkedin';
                const messageKey = channel === FOLLOWUP_CHANNEL_GMAIL ? 'message_gmail' : 'message_linkedin';
                const templates = channel === FOLLOWUP_CHANNEL_GMAIL
                    ? FOLLOWUP_TEMPLATES_GMAIL
                    : FOLLOWUP_TEMPLATES_LINKEDIN;
                const enabled = !followupDraft[disabledKey];
                const fieldsDisabled = locked || !enabled;
                return (
                    <fieldset
                        key={channel}
                        className={`happpy-chatbot__followup-section${locked ? ' is-locked' : ''}`}
                        disabled={locked}
                    >
                        <legend className="happpy-chatbot__card-title">{title}</legend>
                        {locked ? (
                            <p className="happpy-chatbot__status-line">
                                Connect LinkedIn under Configure → Connected accounts to enable LinkedIn follow-ups.
                            </p>
                        ) : null}
                        <label className="happpy-chatbot__followup-toggle">
                            <input
                                type="checkbox"
                                checked={enabled}
                                disabled={locked}
                                onChange={(e) => setFollowupDraft((prev) => ({
                                    ...prev,
                                    [disabledKey]: !e.target.checked,
                                }))}
                            />
                            Enable automatic follow-ups when there is no reply
                        </label>
                        <label htmlFor={`hc-fu-interval-${channel}`}>Wait before sending</label>
                        <select
                            id={`hc-fu-interval-${channel}`}
                            value={followupDraft[intervalKey]}
                            disabled={fieldsDisabled}
                            onChange={(e) => setFollowupDraft((prev) => ({
                                ...prev,
                                [intervalKey]: Number(e.target.value),
                            }))}
                        >
                            {FOLLOWUP_INTERVAL_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <label htmlFor={`hc-fu-template-${channel}`}>Message template</label>
                        <select
                            id={`hc-fu-template-${channel}`}
                            value={templateSelectValue(channel, followupDraft[messageKey])}
                            disabled={fieldsDisabled}
                            onChange={(e) => {
                                if (e.target.value === 'custom') return;
                                pickTemplate(channel, Number(e.target.value));
                            }}
                        >
                            {templates.map((_, i) => (
                                <option key={i} value={i}>{`Template ${i + 1}`}</option>
                            ))}
                            {templateSelectValue(channel, followupDraft[messageKey]) === 'custom' ? (
                                <option value="custom">Custom message</option>
                            ) : null}
                        </select>
                        <label htmlFor={`hc-fu-message-${channel}`}>
                            Follow-up message (keep {FOLLOWUP_VAR_FIELDS.join(' and ')})
                        </label>
                        <textarea
                            id={`hc-fu-message-${channel}`}
                            rows={4}
                            disabled={fieldsDisabled}
                            value={followupDraft[messageKey] || ''}
                            onChange={(e) => setFollowupDraft((prev) => ({
                                ...prev,
                                [messageKey]: e.target.value,
                            }))}
                            placeholder="Hi {{outreachEmployee}}, just checking…"
                        />
                    </fieldset>
                );
            };
            return (
                <form
                    className="happpy-chatbot__form happpy-chatbot__form--followup"
                    onSubmit={(e) => submitFollowupSettingsForm(e, latestId)}
                >
                    {renderFollowupChannel(FOLLOWUP_CHANNEL_GMAIL, 'Gmail follow-up', false)}
                    {renderFollowupChannel(
                        FOLLOWUP_CHANNEL_LINKEDIN,
                        'LinkedIn follow-up',
                        !linkedinConnected,
                    )}
                    <button
                        type="submit"
                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                        disabled={busy}
                    >
                        Save follow-up settings
                    </button>
                </form>
            );
        }
        if (cards.type === 'disconnect-form') {
            const provider = cards.provider === 'linkedin' ? 'linkedin' : 'gmail';
            const label = provider === 'gmail' ? 'Gmail' : 'LinkedIn';
            return (
                <form
                    className="happpy-chatbot__form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'disconnect-form')?.id;
                        submitDisconnect(provider, latestId);
                    }}
                >
                    <p className="happpy-chatbot__status-line">{cards.accountLine}</p>
                    <label htmlFor={`hc-disconnect-${provider}`}>Why are you disconnecting {label}?</label>
                    <textarea
                        id={`hc-disconnect-${provider}`}
                        rows={2}
                        value={disconnectDraft}
                        onChange={(e) => setDisconnectDraft(e.target.value)}
                        placeholder="At least 3 characters"
                    />
                    <button
                        type="submit"
                        className="happpy-chatbot__mini-btn happpy-chatbot__mini-btn--primary"
                        disabled={busy || disconnectDraft.trim().length < DISCONNECT_REASON_MIN}
                    >
                        Disconnect {label}
                    </button>
                </form>
            );
        }
        if (cards.type === 'outreach-mode') {
            const current = cards.mode === MODE_MANUAL ? MODE_MANUAL : MODE_AUTO;
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'outreach-mode')?.id;
            return (
                <div className="happpy-chatbot__cards">
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">Outreach mode</p>
                        <p className="happpy-chatbot__status-line">
                            Current: {current === MODE_AUTO ? 'Auto' : 'Manual'}
                        </p>
                        {!cards.isPaidPlan ? (
                            <p className="happpy-chatbot__status-line">Manual mode needs a paid plan.</p>
                        ) : null}
                        <div className="happpy-chatbot__card-actions">
                            <button
                                type="button"
                                className={`happpy-chatbot__mini-btn${current === MODE_AUTO ? ' happpy-chatbot__mini-btn--primary' : ''}`}
                                disabled={busy || current === MODE_AUTO}
                                onClick={async () => {
                                    setBusy(true);
                                    try {
                                        applyToolOutcome(latestId, await showOutreachMode(MODE_AUTO));
                                    } catch (err) {
                                        toast.error(err?.response?.data?.message || 'Could not save outreach mode.');
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                Auto
                            </button>
                            <button
                                type="button"
                                className={`happpy-chatbot__mini-btn${current === MODE_MANUAL ? ' happpy-chatbot__mini-btn--primary' : ''}`}
                                disabled={busy || current === MODE_MANUAL || !cards.isPaidPlan}
                                onClick={async () => {
                                    if (!cards.isPaidPlan) return;
                                    setBusy(true);
                                    try {
                                        applyToolOutcome(latestId, await showOutreachMode(MODE_MANUAL));
                                    } catch (err) {
                                        toast.error(err?.response?.data?.message || 'Could not save outreach mode.');
                                    } finally {
                                        setBusy(false);
                                    }
                                }}
                            >
                                Manual
                            </button>
                        </div>
                    </article>
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'blocked-companies') {
            const latestId = [...messages].reverse().find((msg) => msg.cards?.type === 'blocked-companies')?.id;
            const blockedIds = new Set((cards.items || []).map((row) => row.company_id));
            const visibleOptions = blockOptions.filter((row) => !blockedIds.has(row.id));
            return (
                <div className="happpy-chatbot__cards">
                    <article className="happpy-chatbot__card happpy-chatbot__card--status">
                        <p className="happpy-chatbot__card-title">Blocked companies</p>
                        <p className="happpy-chatbot__status-line">
                            HAPPPY will skip jobs from companies you add here.
                        </p>
                        <label htmlFor="hc-block-search">Search companies</label>
                        <input
                            id="hc-block-search"
                            type="search"
                            value={blockSearch}
                            onChange={(e) => searchBlockedCompanies(e.target.value)}
                            placeholder="Type at least 2 characters"
                        />
                        {blockSearch.trim().length >= 2 ? (
                            <div className="happpy-chatbot__block-options">
                                {blockOptionsLoading ? (
                                    <p className="happpy-chatbot__status-line">Searching…</p>
                                ) : visibleOptions.length ? (
                                    visibleOptions.slice(0, 6).map((row) => (
                                        <button
                                            key={row.id}
                                            type="button"
                                            className="happpy-chatbot__mini-btn"
                                            disabled={busy}
                                            onClick={() => addBlockedCompany(row, latestId)}
                                        >
                                            Block {row.company_name}
                                        </button>
                                    ))
                                ) : (
                                    <p className="happpy-chatbot__status-line">No matching companies.</p>
                                )}
                            </div>
                        ) : null}
                        {(cards.items || []).length ? (
                            <div className="happpy-chatbot__block-list">
                                {(cards.items || []).map((row) => (
                                    <div key={row.id || row.company_id} className="happpy-chatbot__card-row">
                                        <p className="happpy-chatbot__status-line">{companyLabel(row)}</p>
                                        <button
                                            type="button"
                                            className="happpy-chatbot__mini-btn"
                                            disabled={busy}
                                            onClick={() => removeBlockedCompany(row, latestId)}
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="happpy-chatbot__status-line">None blocked yet.</p>
                        )}
                    </article>
                    {cards.footerTo ? (
                        <Link to={cards.footerTo} className="happpy-chatbot__mini-btn">
                            {cards.footerLabel}
                        </Link>
                    ) : null}
                </div>
            );
        }
        if (cards.type === 'resume-upload') {
            return (
                <div className="happpy-chatbot__upload-card">
                    <div className="happpy-chatbot__upload-head">
                        <div className="happpy-chatbot__upload-label">
                            <span className="happpy-chatbot__upload-icon" aria-hidden>
                                <MatIcon name="upload_file" />
                            </span>
                            <span className="happpy-chatbot__upload-title">Resume Upload Portal</span>
                        </div>
                        <span className="happpy-chatbot__upload-chip">PDF, DOCX • 2MB</span>
                    </div>
                    <button
                        type="button"
                        className="happpy-chatbot__upload-drop"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <strong>Choose a PDF or DOCX resume</strong>
                        <span>(max 2 MB)</span>
                    </button>
                    <button
                        type="button"
                        className="happpy-chatbot__upload-cta"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <MatIcon name="upload" />
                        Choose resume
                    </button>
                </div>
            );
        }
        return null;
    };

    const showFab = !isFullscreen && !open;
    const showPanel = isFullscreen || open;
    const closeChat = () => {
        if (isFullscreen) {
            navigate('/talent/job-agent');
            return;
        }
        setOpen(false);
    };

    const hiddenFileInput = (
        <input
            ref={fileInputRef}
            className="happpy-chatbot__hidden-file"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                pushMessages([{ role: 'user', text: `Upload ${file.name}` }]);
                await runTool('upload_resume', { file });
            }}
        />
    );

    if (isFullscreen && showPanel) {
        return (
            <div className="happpy-chatbot happpy-chatbot--fullscreen">
                {hiddenFileInput}
                <HapppyChatFullscreenView
                    firstName={firstName}
                    user={user}
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    messages={messages}
                    busy={busy}
                    chatLoading={chatLoading}
                    draft={draft}
                    setDraft={setDraft}
                    pendingTool={pendingTool}
                    showLongChatHint={showLongChatHint}
                    longChatHintThreshold={LONG_CHAT_HINT_THRESHOLD}
                    threadRef={threadRef}
                    inputRef={inputRef}
                    onSend={handleSend}
                    onNewChat={startNewChat}
                    onLoadSession={loadSession}
                    onDeleteSession={deleteSession}
                    onExport={exportChat}
                    onClose={closeChat}
                    onOpenPasteJob={openPasteDrawer}
                    onStartNewFromHint={startNewChat}
                    renderAssistant={(msg) => (
                        <TypedAssistantBlock
                            msg={msg}
                            renderCards={renderCards}
                            onTick={() => setTypeTick((value) => value + 1)}
                        />
                    )}
                />
            </div>
        );
    }

    return (
        <div className="happpy-chatbot">
            {hiddenFileInput}

            {showFab ? (
                <button type="button" className="happpy-chatbot__fab" onClick={() => setOpen(true)}>
                    <HapppyAgentIcon className="happpy-chatbot__fab-mark" />
                    HAPPPY Chatbot
                </button>
            ) : null}
            {showPanel ? (
                <section
                    className={`happpy-chatbot__panel${isFullscreen ? ' happpy-chatbot__panel--fullscreen' : ''}`}
                    aria-label="HAPPPY Chatbot"
                >
                    <header className="happpy-chatbot__header">
                        <div className="happpy-chatbot__header-left">
                            <div className="happpy-chatbot__logo-wrap">
                                <HapppyAgentIcon className="happpy-chatbot__header-mark" />
                                <span className="happpy-chatbot__live-dot" aria-hidden>
                                    <span className="happpy-chatbot__live-dot-ping" />
                                    <span className="happpy-chatbot__live-dot-core" />
                                </span>
                            </div>
                            <div className="happpy-chatbot__header-copy">
                                <h2 className="happpy-chatbot__title">HAPPPY Chat</h2>
                            </div>
                        </div>
                        <nav className="happpy-chatbot__nav" aria-label="Chat controls">
                            <button
                                type="button"
                                className="happpy-chatbot__icon-btn"
                                onClick={exportChat}
                                aria-label="Share session"
                                title="Export chat"
                            >
                                <MatIcon name="ios_share" />
                            </button>
                            <button
                                type="button"
                                className="happpy-chatbot__icon-btn"
                                onClick={() => setHistoryOpen((value) => !value)}
                                aria-label="Conversation history"
                            >
                                <MatIcon name="history" />
                            </button>
                            <button
                                type="button"
                                className="happpy-chatbot__icon-btn"
                                onClick={startNewChat}
                                aria-label="New chat session"
                            >
                                <MatIcon name="edit_square" />
                            </button>
                            {!isFullscreen ? (
                                <Link
                                    to={HAPPPY_CHAT_PAGE_PATH}
                                    className="happpy-chatbot__icon-btn happpy-chatbot__icon-btn--link"
                                    aria-label="Open full screen chat"
                                    title="Full screen"
                                    onClick={() => setOpen(false)}
                                >
                                    <MatIcon name="open_in_full" />
                                </Link>
                            ) : null}
                            <button
                                type="button"
                                className="happpy-chatbot__icon-btn"
                                onClick={closeChat}
                                aria-label={isFullscreen ? 'Back to dashboard' : 'Close chat'}
                            >
                                <MatIcon name={isFullscreen ? 'arrow_back' : 'close'} />
                            </button>
                        </nav>
                    </header>

                    {historyOpen ? (
                        <div className="happpy-chatbot__history">
                            <div className="happpy-chatbot__history-head">
                                <strong>Saved chats</strong>
                                <button type="button" className="happpy-chatbot__mini-btn" onClick={startNewChat}>
                                    New chat
                                </button>
                            </div>
                            {sessions.length ? (
                                sessions.map((session) => (
                                    <article
                                        key={session.id}
                                        className={`happpy-chatbot__history-item${activeSessionId === session.id ? ' is-active' : ''}`}
                                    >
                                        <button type="button" onClick={() => loadSession(session.id)}>
                                            <strong>{session.title}</strong>
                                            <span>{session.summary || 'Summary will appear after the first AI reply.'}</span>
                                            <small>{session.messages_count || 0} messages</small>
                                        </button>
                                        <button
                                            type="button"
                                            className="happpy-chatbot__history-delete"
                                            onClick={() => deleteSession(session.id)}
                                            aria-label={`Delete ${session.title}`}
                                        >
                                            <MatIcon name="delete" />
                                        </button>
                                    </article>
                                ))
                            ) : (
                                <p className="happpy-chatbot__history-empty">No saved chats yet.</p>
                            )}
                        </div>
                    ) : null}

                    {!historyOpen ? <div className="happpy-chatbot__thread" ref={threadRef}>
                        <div className="happpy-chatbot__stamp">{threadStamp}</div>
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`happpy-chatbot__msg happpy-chatbot__msg--${msg.role}`}
                            >
                                {msg.role === 'assistant' ? (
                                    <>
                                        <HapppyAgentIcon className="happpy-chatbot__avatar happpy-chatbot__avatar--happpy" />
                                        <div className="happpy-chatbot__msg-body">
                                            <TypedAssistantBlock
                                                msg={msg}
                                                renderCards={renderCards}
                                                onTick={() => setTypeTick((value) => value + 1)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="happpy-chatbot__msg-body">
                                            <div className="happpy-chatbot__bubble">{msg.text}</div>
                                        </div>
                                        <span className="happpy-chatbot__avatar happpy-chatbot__avatar--user" aria-hidden>
                                            <MatIcon name="person" />
                                        </span>
                                    </>
                                )}
                            </div>
                        ))}
                        {busy || chatLoading ? (
                            <div className="happpy-chatbot__msg happpy-chatbot__msg--assistant">
                                <HapppyAgentIcon className="happpy-chatbot__avatar happpy-chatbot__avatar--happpy" />
                                <div className="happpy-chatbot__msg-body">
                                    <div className="happpy-chatbot__bubble">
                                        <TypingDots />
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div> : null}

                    {showLongChatHint ? (
                        <div className="happpy-chatbot__long-chat-hint" role="status">
                            <MatIcon name="tips_and_updates" />
                            <p>
                                {LONG_CHAT_HINT_THRESHOLD}+ messages in this chat — start a new chat for better replies.
                            </p>
                            <button
                                type="button"
                                className="happpy-chatbot__long-chat-hint-action"
                                onClick={startNewChat}
                                disabled={busy}
                            >
                                New chat
                            </button>
                        </div>
                    ) : null}

                    {!historyOpen ? <form className="happpy-chatbot__composer" onSubmit={handleSend}>
                        <button
                            type="button"
                            className="happpy-chatbot__attach"
                            onClick={openPasteDrawer}
                            aria-label="Paste a job link"
                            title="Paste a job link"
                        >
                            <MatIcon name="attach_file" />
                        </button>
                        <div className="happpy-chatbot__input-wrap">
                            <textarea
                                ref={inputRef}
                                className="happpy-chatbot__input"
                                rows={1}
                                placeholder={
                                    pendingTool === 'run_job_with_link'
                                        ? 'Paste the job URL…'
                                        : 'Ask HAPPPY or paste a job link…'
                                }
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                        </div>
                        <button type="submit" className="happpy-chatbot__send" disabled={busy || !draft.trim()} aria-label="Send message">
                            <MatIcon name="send" />
                        </button>
                    </form> : null}
                </section>
            ) : null}
            <HapppyRecommendedJobDescriptionModal
                modal={recommendedJobModal}
                onClose={closeRecommendedJobDescription}
            />
        </div>
    );
};

export default HapppyChatbot;
