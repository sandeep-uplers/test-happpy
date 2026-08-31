'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from '@/talent/navigation/routerCompat';
import { toast } from 'react-hot-toast';
import {
    connectLinkedin,
    disconnectGmail,
    disconnectLinkedin,
    getAccountStatus,
    verifyLinkedin,
} from '../../../../store/actions/UserActions';
import { GmailIcon } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../../components/Constant';
import GmailPrivacyFallbackPopup from '../../../../components/GmailPrivacyFallbackPopup';
import '../../linkedin/AccountConnection.css';

/* -------------------------------------------------------------------------- */
/* Local helpers                                                               */
/* -------------------------------------------------------------------------- */

const GMAIL_BENEFITS = [
    'You choose the jobs/roles',
    'Agent finds relevant Linkedin/email contacts',
    "Send resumes directly to recruiter's inbox",
];

const LINKEDIN_BENEFITS = [
    'You choose the jobs/roles',
    'Agent finds relevant Linkedin/email contacts',
    'Send resumes directly to LinkedIn Messages',
];

/** Inline check icon used for the per-card benefit bullets. */
const CheckIcon = () => (
    <svg
        className="hc-ca-card__benefit-icon"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/** Small badge shown above the card head when the account is connected. */
const ConnectedBadge = () => (
    <span className="hc-ca-card__badge hc-ca-card__badge--connected">
        <span className="hc-ca-card__badge-check" aria-hidden="true">✓</span>
        Connected
    </span>
);

const OptionalBadge = () => (
    <span className="hc-ca-card__badge hc-ca-card__badge--optional">Optional</span>
);

const RequiredBadge = () => (
    <span className="hc-ca-card__badge hc-ca-card__badge--required">
        <span className="hc-ca-card__badge-dot" aria-hidden="true">!</span>
        Required
    </span>
);

/* -------------------------------------------------------------------------- */
/* ConnectedAccountsTab                                                        */
/* -------------------------------------------------------------------------- */

const ConnectedAccountsTab = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector((state) => state.auth)?.user;

    const [isLoading, setIsLoading] = useState(false);
    const [linkedinStatus, setLinkedinStatus] = useState(null);
    const [gmailStatus, setGmailStatus] = useState(null);

    const [gmailConnecting, setGmailConnecting] = useState(false);
    const [linkedinConnecting, setLinkedinConnecting] = useState(false);
    const [gmailErrorPopup, setGmailErrorPopup] = useState({ open: false, message: '' });

    /** 'gmail' | 'linkedin' — OTP "Cancel & Disconnect" skips modal (see handleLinkedinVerificationCancel). */
    const [disconnectModal, setDisconnectModal] = useState(null);
    const [disconnectReason, setDisconnectReason] = useState('');

    /** Inline LinkedIn email/password form visibility */
    const [showLinkedinForm, setShowLinkedinForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', code: '' });
    const [errors, setErrors] = useState({});
    const [formMessage, setFormMessage] = useState({ type: null, text: '' });

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const gmailParam = new URLSearchParams(location.search).get('gmail');

    /* ── Fetch account status ───────────────────────────────────────────── */
    const fetchAccountStatus = () => {
        setIsLoading(true);
        return dispatch(getAccountStatus())
            .then((res) => {
                if (!mountedRef.current) return;
                setLinkedinStatus(res?.data?.data?.linkedin);
                setGmailStatus(res?.data?.data?.gmail);
            })
            .catch(() => {})
            .finally(() => {
                if (mountedRef.current) setIsLoading(false);
            });
    };

    useEffect(() => {
        fetchAccountStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** OAuth popup callback writes ?gmail=success — refresh status when we see it. */
    useEffect(() => {
        if (gmailParam === 'success') fetchAccountStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gmailParam]);

    /* ── LinkedIn form helpers ──────────────────────────────────────────── */
    const validateConnectForm = () => {
        const next = {};
        if (!formData.email.trim()) next.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Please enter a valid email address';
        if (!formData.password.trim()) next.password = 'Password is required';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const validateVerifyForm = () => {
        const next = {};
        if (linkedinStatus?.auth_type === 'code_required' && !formData.code.trim()) {
            next.code = 'Verification code is required';
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleToggleLinkedinForm = () => {
        if (linkedinStatus?.email && !formData.email) {
            setFormData((prev) => ({ ...prev, email: linkedinStatus.email }));
        }
        setFormMessage({ type: null, text: '' });
        setShowLinkedinForm((prev) => !prev);
    };

    const handleLinkedinConnect = async (e) => {
        e.preventDefault();
        if (!validateConnectForm()) {
            setFormMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
            return;
        }
        if (linkedinConnecting) return;
        setLinkedinConnecting(true);
        setFormMessage({ type: null, text: '' });
        try {
            const response = await dispatch(
                connectLinkedin({ email: formData.email, password: formData.password })
            );
            setLinkedinStatus(response?.data?.data);
            if (response?.data?.data?.status === 2) {
                setFormMessage({ type: 'success', text: 'LinkedIn account connected successfully!' });
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                }, 1200);
            } else if (response?.data?.data?.status === 1) {
                setFormMessage({
                    type: 'success',
                    text: 'Verification code sent! Please check your email or SMS.',
                });
            } else {
                setFormMessage({
                    type: 'error',
                    text: response?.data?.message || 'Something went wrong. Please try again.',
                });
            }
        } catch (error) {
            setFormMessage({
                type: 'error',
                text: error?.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            if (mountedRef.current) setLinkedinConnecting(false);
        }
    };

    const handleLinkedinVerify = async (e) => {
        e.preventDefault();
        if (!validateVerifyForm()) {
            setFormMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
            return;
        }
        if (linkedinConnecting) return;
        setLinkedinConnecting(true);
        setFormMessage({ type: null, text: '' });
        try {
            const response = await dispatch(verifyLinkedin({ email: formData.email, code: formData.code }));
            if (response?.data?.data?.status === 2) {
                setFormMessage({
                    type: 'success',
                    text: 'LinkedIn account verified and connected successfully!',
                });
                setLinkedinStatus(response?.data?.data);
                setTimeout(() => {
                    if (!mountedRef.current) return;
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                }, 1200);
            } else {
                const fallback =
                    linkedinStatus?.auth_type === 'code_required'
                        ? 'Invalid verification code. Please try again.'
                        : response?.data?.message || 'Something went wrong. Please try again.';
                setFormMessage({ type: 'error', text: fallback });
            }
        } catch (error) {
            setFormMessage({
                type: 'error',
                text: error?.response?.data?.message || 'Something went wrong. Please try again.',
            });
        } finally {
            if (mountedRef.current) setLinkedinConnecting(false);
        }
    };

    const runLinkedinDisconnect = async (reason, successToast) => {
        try {
            const response = await dispatch(disconnectLinkedin({ disconnect_reason: reason }));
            if (response?.data?.status === 'success') {
                setLinkedinStatus(null);
                setShowLinkedinForm(false);
                setFormData({ email: '', password: '', code: '' });
                setFormMessage({ type: null, text: '' });
                toast.success(successToast);
            } else {
                toast.error(response?.data?.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.disconnect_reason?.[0] ||
                'Something went wrong. Please try again.';
            toast.error(msg);
        }
    };

    const closeDisconnectModal = () => {
        setDisconnectModal(null);
        setDisconnectReason('');
    };

    const runGmailDisconnect = async (reason) => {
        try {
            const response = await dispatch(disconnectGmail({ disconnect_reason: reason }));
            if (response?.data?.status === 'success') {
                setGmailStatus(null);
                toast.success('Gmail account disconnected.');
            } else {
                toast.error(response?.data?.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.disconnect_reason?.[0] ||
                'Something went wrong. Please try again.';
            toast.error(msg);
        }
    };

    const confirmDisconnectReason = async () => {
        const reason = disconnectReason.trim();
        if (reason.length < 3) {
            toast.error('Please enter a reason (at least 3 characters).');
            return;
        }

        const mode = disconnectModal;
        if (!mode) {
            return;
        }

        if (mode === 'gmail') {
            setGmailConnecting(true);
            try {
                await runGmailDisconnect(reason);
                closeDisconnectModal();
            } finally {
                if (mountedRef.current) setGmailConnecting(false);
            }
            return;
        }

        if (mode === 'linkedin') {
            setLinkedinConnecting(true);
            try {
                await runLinkedinDisconnect(reason, 'LinkedIn account disconnected.');
                closeDisconnectModal();
            } finally {
                if (mountedRef.current) setLinkedinConnecting(false);
            }
        }
    };

    const openDisconnectModal = (kind) => {
        setDisconnectReason('');
        setDisconnectModal(kind);
    };

    const handleLinkedinVerificationCancel = async () => {
        setLinkedinConnecting(true);
        try {
            await runLinkedinDisconnect(
                'Cancelled during LinkedIn verification',
                'LinkedIn account disconnected. You can connect again.'
            );
        } finally {
            if (mountedRef.current) setLinkedinConnecting(false);
        }
    };

    /** OAuth popup flow — mirrors Step1AccountConnection handler. */
    const handleGmailConnect = (e) => {
        if (e?.preventDefault) e.preventDefault();

        const gmailUrl = `${process.env.MIX_APP_URL}/auth/login/gmail/${user?.enc_id}`;
        const popup = window.open(
            gmailUrl,
            'Gmail OAuth',
            `width=600,height=700,scrollbars=yes,resizable=yes,left=${window.screen.width / 2 - 300},top=${
                window.screen.height / 2 - 350
            }`
        );

        if (!popup) {
            toast.error('Please allow popups for this site to connect Gmail');
            return;
        }

        setGmailErrorPopup({ open: false, message: '' });
        setGmailConnecting(true);

        let resolved = false;
        let timeoutId = null;

        const finishSuccess = () => {
            if (resolved) return;
            resolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            dispatch(getAccountStatus())
                .then((res) => {
                    if (!mountedRef.current) return;
                    setGmailStatus(res?.data?.data?.gmail);
                    toast.success('Gmail account connected successfully!');
                })
                .catch(() => toast.error('Failed to refresh account status'))
                .finally(() => {
                    if (mountedRef.current) setGmailConnecting(false);
                });
        };

        const finishError = (message) => {
            if (resolved) return;
            resolved = true;
            if (timeoutId) clearTimeout(timeoutId);
            if (mountedRef.current) {
                setGmailConnecting(false);
                setGmailErrorPopup({
                    open: true,
                    message: message || 'Failed to connect Gmail account. Please try again.',
                });
            }
        };

        const messageListener = (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'GMAIL_CONNECT_SUCCESS') {
                window.removeEventListener('message', messageListener);
                if (!popup.closed) popup.close();
                finishSuccess();
            } else if (event.data?.type === 'GMAIL_CONNECT_ERROR') {
                window.removeEventListener('message', messageListener);
                if (!popup.closed) popup.close();
                finishError(event.data.message);
            }
        };
        window.addEventListener('message', messageListener);

        const urlCheckInterval = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(urlCheckInterval);
                    window.removeEventListener('message', messageListener);
                    if (!resolved) finishError();
                    return;
                }
                const popupUrl = popup.location.href;
                if (popupUrl.includes('gmail=success')) {
                    clearInterval(urlCheckInterval);
                    window.removeEventListener('message', messageListener);
                    if (!popup.closed) popup.close();
                    finishSuccess();
                } else if (popupUrl.includes('error=')) {
                    clearInterval(urlCheckInterval);
                    window.removeEventListener('message', messageListener);
                    if (!popup.closed) popup.close();
                    finishError('Gmail connection failed');
                }
            } catch {
                /* Cross-origin during OAuth handshake — postMessage will resolve. */
            }
        }, 500);

        timeoutId = setTimeout(() => {
            if (!popup.closed) popup.close();
            clearInterval(urlCheckInterval);
            window.removeEventListener('message', messageListener);
            if (!resolved) finishError('Connection timeout. Please try again.');
        }, 600000);
    };

    /* ── Derived state ──────────────────────────────────────────────────── */
    const gmailConnected = gmailStatus?.status === 2;
    const linkedinConnected = linkedinStatus?.status === 2;
    const linkedinNeedsVerification = linkedinStatus?.status === 1;

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <>
        <div className="hc-tab-content">
            <p className="hc-tab-content__title">Your connected accounts</p>

            <div className="hc-ca">
                <div className="hc-ca__cards">
                    {/* ────────── Gmail card ────────── */}
                    <div
                        className={`hc-ca-card hc-ca-card--gmail${
                            gmailConnected ? ' hc-ca-card--connected' : ''
                        }`}
                    >
                        {gmailConnected ? <ConnectedBadge /> : <RequiredBadge />}

                        <div className="hc-ca-card__head">
                            <span className="hc-ca-card__avatar hc-ca-card__avatar--gmail">
                                <GmailIcon />
                            </span>
                            <div className="hc-ca-card__head-text">
                                <h3 className="hc-ca-card__title">Gmail</h3>
                                <p className="hc-ca-card__subtitle">Any Gmail acc works</p>
                            </div>
                        </div>

                        <ul className="hc-ca-card__benefits">
                            {GMAIL_BENEFITS.map((b) => (
                                <li key={b} className="hc-ca-card__benefit">
                                    <CheckIcon />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="hc-ca-card__divider" />

                        <div className="hc-ca-card__actions">
                            {gmailConnected ? (
                                <button
                                    type="button"
                                    className="hc-ca-card__cta hc-ca-card__cta--disconnect"
                                    onClick={() => openDisconnectModal('gmail')}
                                    disabled={gmailConnecting}
                                >
                                    {gmailConnecting ? 'Disabling…' : 'Disable email outreach'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="hc-ca-card__cta"
                                    onClick={handleGmailConnect}
                                    disabled={gmailConnecting || isLoading}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3.10671 8.74683L8.66671 1.3335L8.00005 6.66683H13.2172C13.528 6.66683 13.6979 7.02943 13.4988 7.26823L7.33338 14.6668L8.00005 9.3335H3.40005C3.0979 9.3335 2.92543 8.98856 3.10671 8.74683Z" stroke="#231F20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>&nbsp;&nbsp;
                                    {gmailConnecting ? 'Connecting…' : isLoading ? 'Loading…' : 'Enable email Outreach'}
                                </button>
                            )}
                        </div>

                        {/* Tooltip + mascot — positioned absolutely BELOW the Gmail card */}
                        <aside className="hc-ca-tooltip-wrap">
                            <span className="hc-ca-mascot" aria-hidden="true">
                                <img src={`${IMAGE_URL}outreach/mascot-neutral.svg`} alt="" />
                            </span>
                            <div className="hc-ca-tooltip" role="note">
                                <p>
                                    Gmail access is needed to send outreach emails.{' '}
                                    <strong>Don&apos;t worry the agent only accesses emails it sends</strong>
                                </p>
                                <span className="hc-ca-tooltip__pointer" aria-hidden="true" />
                            </div>
                        </aside>
                    </div>

                    {/* ────────── LinkedIn card ────────── */}
                    <div
                        className={`hc-ca-card hc-ca-card--linkedin${
                            linkedinConnected ? ' hc-ca-card--connected' : ''
                        }`}
                    >
                        {linkedinConnected ? <ConnectedBadge /> : <OptionalBadge />}

                        <div className="hc-ca-card__head">
                            <span className="hc-ca-card__avatar hc-ca-card__avatar--linkedin">in</span>
                            <div className="hc-ca-card__head-text">
                                <h3 className="hc-ca-card__title">LinkedIn</h3>
                                <p className="hc-ca-card__subtitle">No Premium subscription needed</p>
                            </div>
                        </div>

                        <ul className="hc-ca-card__benefits">
                            {LINKEDIN_BENEFITS.map((b) => (
                                <li key={b} className="hc-ca-card__benefit">
                                    <CheckIcon />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="hc-ca-card__divider" />

                        <div className="hc-ca-card__actions">
                            {linkedinConnected ? (
                                <button
                                    type="button"
                                    className="hc-ca-card__cta hc-ca-card__cta--disconnect"
                                    onClick={() => openDisconnectModal('linkedin')}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Disabling…' : 'Disable linkedin outreach'}
                                </button>
                            ) : linkedinNeedsVerification ? (
                                <button
                                    type="button"
                                    className="hc-ca-card__cta"
                                    onClick={handleToggleLinkedinForm}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Verifying…' : 'Verify LinkedIn'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="hc-ca-card__cta"
                                    onClick={handleToggleLinkedinForm}
                                    disabled={linkedinConnecting || isLoading}
                                >
                                    {linkedinConnecting ? 'Connecting…' : 'Enable linkedin Outreach'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ────────── LinkedIn inline connect form ────────── */}
                {showLinkedinForm && (linkedinStatus == null || linkedinStatus?.status === 0) && (
                    <div className="hc-ca-form" role="region" aria-label="Connect LinkedIn">
                        <h3 className="hc-ca-form__title">Connect LinkedIn</h3>
                        <p className="hc-ca-form__hint">
                            Use your normal LinkedIn login. We never post on your behalf.
                        </p>

                        {formMessage.type && (
                            <div
                                className={`hc-ca-form__alert hc-ca-form__alert--${formMessage.type}`}
                                role="alert"
                            >
                                <span>{formMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleLinkedinConnect}>
                            <div className="hc-ca-form__group">
                                <label className="hc-ca-form__label" htmlFor="hc-ca-li-email">Email</label>
                                <input
                                    id="hc-ca-li-email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`hc-ca-form__input${errors.email ? ' hc-ca-form__input--error' : ''}`}
                                    placeholder="Enter your LinkedIn email"
                                    disabled={linkedinConnecting}
                                />
                                {errors.email && <span className="hc-ca-form__error">{errors.email}</span>}
                            </div>
                            <div className="hc-ca-form__group">
                                <label className="hc-ca-form__label" htmlFor="hc-ca-li-password">Password</label>
                                <input
                                    id="hc-ca-li-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`hc-ca-form__input${errors.password ? ' hc-ca-form__input--error' : ''}`}
                                    placeholder="Enter your LinkedIn password"
                                    disabled={linkedinConnecting}
                                />
                                {errors.password && <span className="hc-ca-form__error">{errors.password}</span>}
                            </div>
                            <div className="hc-ca-form__actions">
                                <button
                                    type="button"
                                    className="hc-ca-form__btn hc-ca-form__btn--secondary"
                                    onClick={() => {
                                        setShowLinkedinForm(false);
                                        setFormMessage({ type: null, text: '' });
                                    }}
                                    disabled={linkedinConnecting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="hc-ca-form__btn hc-ca-form__btn--primary"
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Connecting…' : 'Connect'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ────────── LinkedIn verification form ────────── */}
                {showLinkedinForm && linkedinNeedsVerification && (
                    <div className="hc-ca-form" role="region" aria-label="Verify LinkedIn">
                        <h3 className="hc-ca-form__title">Verify LinkedIn</h3>
                        <p className="hc-ca-form__hint">
                            {linkedinStatus?.email}
                            {linkedinStatus?.auth_type === 'linkedin_app_approval'
                                ? ' — kindly approve the request in your LinkedIn app.'
                                : ' — enter the verification code sent to your email, phone, or authentication app.'}
                        </p>

                        {formMessage.type && !formMessage.text.includes('Verification code sent!') && (
                            <div
                                className={`hc-ca-form__alert hc-ca-form__alert--${formMessage.type}`}
                                role="alert"
                            >
                                <span>{formMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleLinkedinVerify}>
                            {linkedinStatus?.auth_type === 'code_required' && (
                                <div className="hc-ca-form__group">
                                    <label className="hc-ca-form__label" htmlFor="hc-ca-li-code">
                                        Verification code
                                    </label>
                                    <input
                                        id="hc-ca-li-code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className={`hc-ca-form__input${errors.code ? ' hc-ca-form__input--error' : ''}`}
                                        placeholder="Enter verification code"
                                        disabled={linkedinConnecting}
                                    />
                                    {errors.code && <span className="hc-ca-form__error">{errors.code}</span>}
                                </div>
                            )}
                            <div className="hc-ca-form__actions">
                                <button
                                    type="button"
                                    className="hc-ca-form__btn hc-ca-form__btn--secondary"
                                    onClick={handleLinkedinVerificationCancel}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Disconnecting…' : 'Cancel & Disconnect'}
                                </button>
                                <button
                                    type="submit"
                                    className="hc-ca-form__btn hc-ca-form__btn--primary"
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinStatus?.auth_type === 'linkedin_app_approval'
                                        ? linkedinConnecting
                                            ? 'Approving…'
                                            : 'Approved in LinkedIn'
                                        : linkedinConnecting
                                        ? 'Verifying…'
                                        : 'Verify Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>

        <GmailPrivacyFallbackPopup
            open={gmailErrorPopup.open}
            onClose={() => setGmailErrorPopup({ open: false, message: '' })}
        />

        {disconnectModal && (
            <div
                className="jad-disconnect-reason-modal-overlay"
                role="presentation"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeDisconnectModal();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        closeDisconnectModal();
                    }
                }}
            >
                <div
                    className="jad-disconnect-reason-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="jad-disconnect-reason-title"
                >
                    <h3 id="jad-disconnect-reason-title" className="jad-disconnect-reason-modal__title">
                        {disconnectModal === 'gmail' ? 'Disconnect Gmail' : 'Disconnect LinkedIn'}
                    </h3>
                    <p className="jad-disconnect-reason-modal__lede">
                        Briefly tell us why you&apos;re disconnecting. This helps us improve the Happpy Agent.
                    </p>
                    <label htmlFor="jad-disconnect-reason-input" className="jad-disconnect-reason-modal__label">
                        Reason <span aria-hidden>(required, min 3 characters)</span>
                    </label>
                    <textarea
                        id="jad-disconnect-reason-input"
                        className="jad-disconnect-reason-modal__textarea"
                        rows={4}
                        value={disconnectReason}
                        onChange={(e) => setDisconnectReason(e.target.value)}
                        placeholder="e.g. Pausing job search, switching accounts, privacy concerns..."
                        disabled={gmailConnecting || linkedinConnecting}
                        maxLength={2000}
                    />
                    <div className="jad-disconnect-reason-modal__actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={closeDisconnectModal}
                            disabled={gmailConnecting || linkedinConnecting}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={confirmDisconnectReason}
                            disabled={gmailConnecting || linkedinConnecting}
                        >
                            {gmailConnecting || linkedinConnecting ? 'Disconnecting…' : 'Disconnect'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default ConnectedAccountsTab;
