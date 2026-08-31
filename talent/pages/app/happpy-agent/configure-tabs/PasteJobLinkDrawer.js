import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { POST_API, renderTextWithLinks } from '../../../../components/Helper';
import { API_URL } from '../../../../components/Constant';
import ReferralAgentPreviewModal from '../../../../components/ReferralAgentPreviewModal';
import { incrementHapppyAgentDailyUsed } from '../../../../store/actions/UserActions';
import { trackHappyAgentMixpanel } from '../../../../store/actions/happyAgentTracking';
import JobPlatformIconRow from './JobPlatformIconRow';

const CHROME_EXTENSION_URL =
    'https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en';
const ADD_JOB_SUCCESS_MESSAGE =
    "We've received your request. The agent will start in the background soon — it may take 20–30 minutes.";
const JOB_LINK_ADDED_EVENT = 'agent-activity:job-link-added';
const MAX_JOB_LINKS = 8;

function isValidHttpUrl(raw) {
    const s = (raw || '').trim();
    if (!s) return false;
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function PlusCircleIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Paste job link drawer — Figma 28806:42954.
 * Same flow as AgentActivity `AddExternalJobModal`: validate → preview → POST.
 * Mobile: bottom sheet (64px top gap). Desktop: right rail.
 */
const PasteJobLinkDrawer = ({ open, onClose }) => {
    const dispatch = useDispatch();
    /** Same source as JobAgentDashboardLayout daily-limit widget. */
    const dailyLimit = useSelector((state) => state.happpyAgent?.dailyLimit) || 0;
    const [jobUrls, setJobUrls] = useState(['']);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const firstInputRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        setJobUrls(['']);
        setErrorMessage(null);
        setSuccessMessage(null);
        setPreviewOpen(false);
        trackHappyAgentMixpanel('agent_configure_paste_job_drawer_opened').catch(() => {});
        const id = requestAnimationFrame(() => firstInputRef.current?.focus());
        return () => cancelAnimationFrame(id);
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key !== 'Escape' || submitting) return;
            if (previewOpen) {
                setPreviewOpen(false);
            } else {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose, previewOpen, submitting]);

    const getValidUrls = useCallback(
        () => jobUrls.map((s) => (s || '').trim()).filter(Boolean),
        [jobUrls],
    );

    const handleUrlChange = (index, value) => {
        setJobUrls((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });
        if (errorMessage) setErrorMessage(null);
        if (successMessage) setSuccessMessage(null);
    };

    const handleAddUrl = () => {
        if (jobUrls.length >= MAX_JOB_LINKS) return;
        setJobUrls((prev) => [...prev, '']);
    };

    const handleRemoveUrl = (index) => {
        if (jobUrls.length <= 1) return;
        setJobUrls((prev) => prev.filter((_, i) => i !== index));
        if (errorMessage) setErrorMessage(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const urls = getValidUrls();
        if (!urls.length) {
            setErrorMessage('Please enter a job link');
            return;
        }
        if (urls.length > MAX_JOB_LINKS) {
            setErrorMessage(`You can add up to ${MAX_JOB_LINKS} job links.`);
            return;
        }
        const invalid = urls.find((url) => !isValidHttpUrl(url));
        if (invalid) {
            setErrorMessage('Please enter a valid job link (e.g. https://linkedin.com/jobs/view/…)');
            return;
        }
        setPreviewOpen(true);
    };

    const submitJobLinks = async ({ linkedin_message_id, gmail_message_id } = {}) => {
        const urls = getValidUrls();
        if (!urls.length) return;

        setSubmitting(true);
        try {
            for (const url of urls) {
                const payload = { url };
                if (linkedin_message_id) payload.linkedin_message_id = linkedin_message_id;
                if (gmail_message_id) payload.gmail_message_id = gmail_message_id;
                const res = await POST_API(`${API_URL}talent/referral-agent/job-apply-by-link`, payload);
                if (res?.data?.status !== 'success') {
                    const msg = res?.data?.message || 'Failed to add job link';
                    setErrorMessage(msg);
                    toast.error(msg, { duration: 5000 });
                    return;
                }
                dispatch(incrementHapppyAgentDailyUsed());
            }
            setSuccessMessage(ADD_JOB_SUCCESS_MESSAGE);
            setJobUrls(['']);
            window.dispatchEvent(new CustomEvent(JOB_LINK_ADDED_EVENT));
            trackHappyAgentMixpanel('agent_configure_paste_job_submitted', { count: urls.length }).catch(
                () => {},
            );
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to add job link';
            setErrorMessage(msg);
            toast.error(msg, { duration: 5000 });
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreviewConfirm = (messageTemplateIds = {}) => {
        setPreviewOpen(false);
        submitJobLinks(messageTemplateIds);
    };

    if (!open || typeof document === 'undefined') return null;

    return createPortal(
        <>
            <div
                className="hc-paste-job-drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hc-paste-job-drawer-title"
            >
                <button
                    type="button"
                    className="hc-paste-job-drawer__backdrop"
                    aria-label="Close paste job link"
                    onClick={() => {
                        if (!submitting) onClose();
                    }}
                />
                <aside
                    className="hc-paste-job-drawer__panel"
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <button
                        type="button"
                        className="hc-paste-job-drawer__close"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </button>

                    <JobPlatformIconRow className="hc-paste-job-drawer__platforms" />

                    <header className="hc-paste-job-drawer__head">
                        <h2 id="hc-paste-job-drawer-title" className="hc-paste-job-drawer__title">
                            Run Agent on External Job by Link
                        </h2>
                        <p className="hc-paste-job-drawer__desc">
                            Paste any job URL from LinkedIn, Indeed, or career sites. <br /> HAPPPY will
                            process it and reach out for you
                            {dailyLimit > 0 ? (
                                <span>{` (up to ${dailyLimit} jobs per day)`}</span>
                            ) : null}
                        </p>
                    </header>

                    <div className="hc-paste-job-drawer__body">
                        {successMessage && (
                            <div className="hc-paste-job-drawer__alert hc-paste-job-drawer__alert--success" role="status">
                                {successMessage}
                            </div>
                        )}
                        {errorMessage && (
                            <div className="hc-paste-job-drawer__alert hc-paste-job-drawer__alert--error" role="alert">
                                {renderTextWithLinks(errorMessage, 'hc-paste-job-drawer__alert-link')}
                            </div>
                        )}

                        <div className="hc-paste-job-drawer__form-card">
                            <form onSubmit={handleSubmit} className="hc-paste-job-drawer__form" noValidate>
                                <div className="hc-paste-job-drawer__fields">
                                    {jobUrls.map((url, index) => (
                                        <div key={index} className="hc-paste-job-drawer__field-row">
                                            <input
                                                ref={index === 0 ? firstInputRef : null}
                                                type="text"
                                                inputMode="url"
                                                className="hc-paste-job-drawer__input"
                                                placeholder="Paste a job URL from LinkedIn, Indeed, or any site…"
                                                value={url}
                                                onChange={(e) => handleUrlChange(index, e.target.value)}
                                                disabled={submitting}
                                                autoComplete="off"
                                                aria-invalid={errorMessage ? 'true' : undefined}
                                            />
                                            {jobUrls.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="hc-paste-job-drawer__remove"
                                                    onClick={() => handleRemoveUrl(index)}
                                                    disabled={submitting}
                                                    aria-label="Remove job link"
                                                >
                                                    <CloseIcon />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="hc-paste-job-drawer__actions">
                                    {/* <button
                                        type="button"
                                        className="hc-paste-job-drawer__add-url"
                                        onClick={handleAddUrl}
                                        disabled={submitting || jobUrls.length >= MAX_JOB_LINKS}
                                    >
                                        <PlusCircleIcon />
                                        <span>Add another URL</span>
                                    </button> */}
                                    <button
                                        type="submit"
                                        className="hc-paste-job-drawer__submit"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Adding…' : 'Run Agent'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="hc-paste-job-drawer__tip" role="note">
                            <img
                                className="hc-paste-job-drawer__tip-mascot"
                                src="/images/talent/outreach/mascot-neutral.svg"
                                alt=""
                                aria-hidden="true"
                            />
                            <div className="hc-paste-job-drawer__tip-bubble">
                                <p className="hc-paste-job-drawer__tip-text">
                                    <strong>Using a desktop browser?</strong>
                                    {' '}
                                    The Chrome extension is easier! Run the agent with one click any
                                    job page instantly
                                </p>
                                <a
                                    href={CHROME_EXTENSION_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hc-paste-job-drawer__tip-cta"
                                >
                                    Get browser extension
                                </a>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <ReferralAgentPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                onConfirm={handlePreviewConfirm}
                selectedResume="profile"
                noTailorHTML={true}
            />
        </>,
        document.body,
    );
};

export default PasteJobLinkDrawer;
