'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
    connectLinkedin,
    disconnectGmail,
    disconnectLinkedin,
    getAccountStatus,
    getOpenAiStatus,
    submitResumeHealthCheck,
    verifyLinkedin,
} from '../../../store/actions/UserActions';
import { getResumeHealthCheck } from '../../../store/actions/resumeActions';
import { SET_BG_RESUME_HEALTH_CHECK_ID, UPDATE_CURRENT_USER } from '../../../store/actions/actionsTypes';
import { CheckedRoundedIcon, GmailIcon } from '../../../assets/IconSVG';
import { trackHappyAgentMixpanel, trackOutreachJourney } from '../../../store/actions/happyAgentTracking';
import { POST_API, GET_API } from '../../../components/Helper';
import {
    API_CLAIM_REFERRAL_CODE,
    API_ME,
    API_VERIFY_REFERRAL_CODE,
    OUTREACH_JOURNEY_KEY_GMAIL_CLICKED,
    OUTREACH_JOURNEY_KEY_ONB_GMAIL_CONNECTED,
    OUTREACH_JOURNEY_KEY_LINKEDIN_CLICKED,
} from '../../../components/Constant';
import GmailPrivacyFallbackPopup from '../../../components/GmailPrivacyFallbackPopup';
import {
    getPublicReferralCode,
    isPublicSignupPending,
} from '../../../helpers/happyAgentPublicSignupSession';
import {
    isGmailConnectCallbackUrl,
    listenForGmailConnectResult,
    buildGmailOAuthUrl,
} from '../../../helpers/gmailConnectPopup';
import { JAD_PREF_FIGMA_COLORS } from '../job-agent/preference/JobAgentManagePreferences.colors';
import ReferralTrialUnlockedScreen from '../job-agent/ReferralTrialUnlockedScreen';
import '../linkedin/AccountConnection.css';
import './AgentOnboarding.css';

const REFERRAL_LINK_PATTERN = /(?:https?:\/\/)?(?:www\.)?platform\.uplers\.com\/talent\/happpy-ai-agent\?r=([A-Za-z0-9]+)/i;

const extractReferralCodeFromInput = (value) => {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';

    const linkMatch = trimmed.match(REFERRAL_LINK_PATTERN);
    if (linkMatch) return linkMatch[1].toUpperCase();

    const slashMatch = trimmed.match(/\/r\/([A-Za-z0-9]+)/i);
    if (slashMatch) return slashMatch[1].toUpperCase();

    return trimmed.replace(/\s/g, '').toUpperCase();
};

/** Inline check icon used for the per-card benefit bullets. */
function CheckIcon({ className }) {
    return (
        <svg
            className={className}
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
}


function CheckIconSecure({ className }) {
    return (
        <svg
            className={className}
            width="10"
            height="11"
            viewBox="0 0 10 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M9.74854 0.300293C7.36084 3.7085 4.90723 6.86279 2.3877 9.76318C2.19727 9.98291 2.03125 10.0928 1.88965 10.0928C1.72852 10.0928 1.43799 9.66797 1.01807 8.81836C0.339355 7.44629 0 6.62598 0 6.35742C0 6.25977 0.065918 6.14502 0.197754 6.01318C0.480957 5.71533 0.681152 5.56641 0.79834 5.56641C0.905762 5.56641 1.02051 5.7373 1.14258 6.0791C1.46484 6.94824 1.8042 7.72217 2.16064 8.40088C4.63135 5.90088 7.0752 3.10059 9.49219 0L9.74854 0.300293Z" fill="#2C7A4B" />
        </svg>
    );
}

/** Small badge that replaces the "Required" / "Optional" tag once the related account is connected. */
function ConnectedBadge() {
    return (
        <span className="agent-onb-card__badge agent-onb-card__badge--connected">
            <span className="agent-onb-card__badge-check" aria-hidden="true">
                ✓
            </span>
            Connected
        </span>
    );
}

const GMAIL_BENEFITS = [
    'You choose the jobs/roles',
    '78% of users land an interview within 14 days',
    'Agent sends personalised outreach directly to recruiters inbox',
    'This is what fast-tracks your job search',
];

const LINKEDIN_BENEFITS = [
    'You choose the jobs/roles',
    'Agent finds relevant Linkedin/email contacts',
    'Sends personalised outreach via LinkedIn msgs- even unconnected contacts',
    'Unlocks a LinkedIn premium capability for free!',
];

const STEP1_META_PILLS = [
    'One-time setup',
    'Takes 30 secs',
    'Agent only accesses emails it sends',
    'Access referrals for over 40k jobs',
];

const PRIVACY_POINTS = [
    'Read-only access — only sees emails/messages the agent sends',
    'Never touches your personal inbox, attachments, or profile',
    'Bank-grade encryption · Disconnect anytime, instantly revoked',
];

const TRUST_BADGES = ['SSL SECURED', 'PRIVACY FIRST', 'OAUTH 2.0'];

const Step1AccountConnection = ({
    outreachStepConfig,
    stepConfigLoading,
    onRefresh,
    onAdvance,
}) => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const user = useSelector((state) => state.auth)?.user;
    const resumeHealthControl = useSelector((state) => state.resume?.resumeHealthControl);
    const bgResumeHealthCheckId = useSelector(
        (state) => state.resume?.bgResumeHealthCheckId
    );

    const [isLoading, setIsLoading] = useState(false);
    const [linkedinStatus, setLinkedinStatus] = useState(null);
    const [gmailStatus, setGmailStatus] = useState(null);

    const [gmailConnecting, setGmailConnecting] = useState(false);
    const [gmailConnectingError, setGmailConnectingError] = useState(false);
    const [linkedinConnecting, setLinkedinConnecting] = useState(false);
    const [gmailErrorPopup, setGmailErrorPopup] = useState({ open: false, message: '' });

    /** 'gmail' | 'linkedin' — OTP "Cancel & Disconnect" skips modal (see handleLinkedinVerificationCancel). */
    const [disconnectModal, setDisconnectModal] = useState(null);
    const [disconnectReason, setDisconnectReason] = useState('');

    /**
     * Tracks whether we've already triggered the silent auto-health-check this mount,
     * so re-renders or status refreshes don't fire duplicate POSTs. The Pusher
     * subscription itself lives globally in `BackgroundHealthCheckPusher`.
     */
    const autoHealthCheckTriggeredRef = useRef(false);

    /** Inline LinkedIn email/password form visibility (mirrors the legacy AccountConnection flow). */
    const [showLinkedinForm, setShowLinkedinForm] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', code: '' });
    const [errors, setErrors] = useState({});
    const [formMessage, setFormMessage] = useState({ type: null, text: '' });

    /**
     * Referral code (public signup only). Verified via API_VERIFY_REFERRAL_CODE then
     * applied immediately via API_APPLY_REFERRAL_CODE. The trial-unlock celebration is
     * shown once when Gmail/LinkedIn connects, gated by a backend flag on the outreach step.
     */
    const showReferral = isPublicSignupPending() || !!getPublicReferralCode();
    const [referralLinkInput, setReferralLinkInput] = useState('');
    const [referralVerifyState, setReferralVerifyState] = useState('idle');
    const [verifiedReferralCode, setVerifiedReferralCode] = useState('');
    const [isReferralCodeAlreadyClaimed, setIsReferralCodeAlreadyClaimed] = useState(false);
    const [referrerName, setReferrerName] = useState('');
    const [celebrationOpen, setCelebrationOpen] = useState(false);
    const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
    const [showReferralExpanded, setShowReferralExpanded] = useState(false);
    const referralPrefilledRef = useRef(false);
    const celebrationShownRef = useRef(false);
    const referralConnectedRef = useRef(false);
    const referralClaimedRef = useRef(false);
    const lastProcessedReferralRef = useRef(null);
    const referralInputRef = useRef(null);
    const isReferralInputLocked = referralVerifyState === 'verified';

    /**
     * Show the trial-unlock celebration exactly once, when BOTH a referral code was
     * freshly claimed this session AND at least one account (Gmail/LinkedIn) connected.
     * Order-independent: whichever completes second triggers it.
     */
    const maybeShowReferralCelebration = () => {
        if (!showReferral) return;
        if (celebrationShownRef.current) return;
        if (!referralConnectedRef.current) return;
        if (!referralClaimedRef.current) return;
        if (isReferralCodeAlreadyClaimed) return;
        celebrationShownRef.current = true;
        setCelebrationOpen(true);
    };

    const gmailParam = searchParams.get('gmail');

    const track = (eventName, properties = {}) => {
        trackHappyAgentMixpanel(eventName, properties).catch(() => { });
    };

    const trackJourneyClick = (journeyKey) => {
        trackOutreachJourney(journeyKey).catch(() => { });
    };

    const fetchAccountStatus = () => {
        setIsLoading(true);
        return dispatch(getAccountStatus())
            .then((res) => {
                setLinkedinStatus(res?.data?.data?.linkedin);
                setGmailStatus(res?.data?.data?.gmail);
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchAccountStatus();
    }, [dispatch]);

    /**
     * Pull the latest resume health control payload once on mount so we can decide
     * whether the background auto-health-check needs to run after Gmail is connected.
     * Failures are silent — the worst case is that we skip the auto-run.
     */

    /** OAuth popup callback writes ?gmail=success — refresh status when we see it. */
    useEffect(() => {
        if (gmailParam === 'success') {
            fetchAccountStatus();
        }
    }, [gmailParam]);

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

    /** Verify then immediately apply a referral code. Returns true when applied. */
    const verifyAndApplyReferral = async (rawValue) => {
        const code = extractReferralCodeFromInput(rawValue);
        if (!code) {
            lastProcessedReferralRef.current = null;
            setReferralVerifyState('idle');
            setVerifiedReferralCode('');
            return false;
        }
        if (referralVerifyState === 'verified' && code === verifiedReferralCode) {
            return true;
        }
        // Skip redundant calls when the code hasn't changed since the last attempt.
        if (code === lastProcessedReferralRef.current) {
            return referralVerifyState === 'verified';
        }
        lastProcessedReferralRef.current = code;

        setReferralVerifyState('verifying');
        try {
            const verifyRes = await POST_API(API_VERIFY_REFERRAL_CODE, { referral_code: code });
            if (verifyRes?.status !== 200) {
                setReferralVerifyState('invalid');
                setVerifiedReferralCode('');
                return false;
            }
            if (verifyRes?.data?.data?.already_claimed) {
                setReferralVerifyState('verified');
                setVerifiedReferralCode(code);
                setIsReferralCodeAlreadyClaimed(true);
                toast.success("Referral code already claimed !");
                return true;
            }

            const applyRes = await POST_API(API_CLAIM_REFERRAL_CODE, { happy_referral_code: code });
            if (applyRes?.status === 200) {
                setReferralVerifyState('verified');
                setVerifiedReferralCode(code);
                setReferrerName(applyRes?.data?.data?.referral_from || applyRes?.data?.referral_from || '');
                referralClaimedRef.current = true;
                track('agent_onb_referral_applied');
                maybeShowReferralCelebration();
                return true;
            }
            setReferralVerifyState('invalid');
            setVerifiedReferralCode('');
            return false;
        } catch (err) {
            setReferralVerifyState('invalid');
            setVerifiedReferralCode('');
            return false;
        }
    };

    const handleReferralLinkChange = (e) => {
        if (isReferralInputLocked) return;
        setReferralLinkInput(e.target.value);
        lastProcessedReferralRef.current = null;
        if (referralVerifyState !== 'idle') {
            setReferralVerifyState('idle');
            setVerifiedReferralCode('');
        }
    };

    const handleReferralLinkBlur = () => {
        verifyAndApplyReferral(referralLinkInput);
    };

    /** Prefill + auto verify/apply the referral code carried from the public `?r=` landing. */
    useEffect(() => {
        if (!showReferral || referralPrefilledRef.current) return;
        const stored = getPublicReferralCode();
        if (!stored) return;
        referralPrefilledRef.current = true;
        setReferralLinkInput(stored);
        setShowReferralExpanded(true);
        verifyAndApplyReferral(stored);
    }, [showReferral]);

    useEffect(() => {
        if (!showReferralExpanded || isReferralInputLocked) return;
        referralInputRef.current?.focus();
    }, [showReferralExpanded, isReferralInputLocked]);

    const handleToggleLinkedinForm = () => {
        if (linkedinStatus?.email && !formData.email) {
            setFormData((prev) => ({ ...prev, email: linkedinStatus.email }));
        }
        setFormMessage({ type: null, text: '' });
        const isOpening = !showLinkedinForm;
        setShowLinkedinForm((prev) => !prev);
        track('agent_onb_linkedin_form_toggled', { action: isOpening ? 'open' : 'close' });
        if (isOpening) {
            trackJourneyClick(OUTREACH_JOURNEY_KEY_LINKEDIN_CLICKED);
        }
    };

    /** First-time connect: POST credentials, branch on `status` (1 = needs verification, 2 = done). */
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
            track('agent_onb_linkedin_connect_attempted');
            const response = await dispatch(
                connectLinkedin({ email: formData.email, password: formData.password })
            );
            setLinkedinStatus(response?.data?.data);
            if (response?.data?.data?.status === 2) {
                setFormMessage({ type: 'success', text: 'LinkedIn account connected successfully!' });
                onConnectedAccount();
                track('agent_onb_linkedin_connected');
                setTimeout(() => {
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                    if (onRefresh) onRefresh();
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
            setLinkedinConnecting(false);
        }
    };

    /** Submit OTP / app-approval response and finalise LinkedIn connection. */
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
            track('agent_onb_linkedin_verify_attempted', { auth_type: linkedinStatus?.auth_type || '' });
            const response = await dispatch(verifyLinkedin({ email: formData.email, code: formData.code }));
            if (response?.data?.data?.status === 2) {
                setFormMessage({
                    type: 'success',
                    text: 'LinkedIn account verified and connected successfully!',
                });
                setLinkedinStatus(response?.data?.data);
                track('agent_onb_linkedin_verified');
                setTimeout(() => {
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                    if (onRefresh) onRefresh();
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
            setLinkedinConnecting(false);
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
                if (onRefresh) onRefresh();
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
                if (onRefresh) onRefresh();
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
                setGmailConnecting(false);
            }
            return;
        }

        if (mode === 'linkedin') {
            setLinkedinConnecting(true);
            try {
                await runLinkedinDisconnect(reason, 'LinkedIn account disconnected.');
                closeDisconnectModal();
            } finally {
                setLinkedinConnecting(false);
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
            setLinkedinConnecting(false);
        }
    };

    /** OAuth popup flow — mirrors the legacy AccountConnection handler. */
    const handleGmailConnect = async (e) => {
        if (e?.preventDefault) e.preventDefault();

        trackJourneyClick(OUTREACH_JOURNEY_KEY_GMAIL_CLICKED);

        let encId = user?.enc_id;
        if (!encId) {
            try {
                const { data } = await GET_API(API_ME);
                encId = data?.data?.enc_id;
                if (encId) {
                    dispatch({ type: UPDATE_CURRENT_USER, payload: { enc_id: encId } });
                }
            } catch {
                /* fall through to error below */
            }
        }

        if (!encId) {
            toast.error('Could not start Gmail connect. Please refresh and try again.');
            return;
        }

        const gmailUrl = buildGmailOAuthUrl(encId);
        const popup = window.open(
            gmailUrl,
            'Gmail OAuth',
            `width=600,height=700,scrollbars=yes,resizable=yes,left=${window.screen.width / 2 - 300},top=${window.screen.height / 2 - 350
            }`
        );

        track('agent_onb_gmail_connect_attempted');

        if (!popup) {
            toast.error('Please allow popups for this site to connect Gmail');
            return;
        }

        setGmailErrorPopup({ open: false, message: '' });
        setGmailConnecting(true);

        let resolved = false;
        let timeoutId = null;
        let urlCheckInterval = null;

        const teardown = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (urlCheckInterval) clearInterval(urlCheckInterval);
            removeGmailConnectListener();
        };

        const finishSuccess = () => {
            if (resolved) return;
            resolved = true;
            teardown();
            dispatch(getAccountStatus())
                .then((res) => {
                    setGmailStatus(res?.data?.data?.gmail);
                    toast.success('Gmail account connected successfully!');
                    track('agent_onb_gmail_connected');
                    trackJourneyClick(OUTREACH_JOURNEY_KEY_ONB_GMAIL_CONNECTED);
                    onConnectedAccount();
                    if (onRefresh) onRefresh();
                })
                .catch(() => toast.error('Failed to refresh account status'))
                .finally(() => setGmailConnecting(false));
        };

        const finishError = (message) => {
            if (resolved) return;
            resolved = true;
            teardown();
            setGmailConnecting(false);
            setGmailConnectingError(true);
            setGmailErrorPopup({
                open: true,
                message: message || 'Failed to connect Gmail account. Please try again.',
            });
            track('agent_onb_gmail_connect_failed', {
                message: message || '',
            });
        };

        const tryFinishFromAccountStatus = () =>
            dispatch(getAccountStatus())
                .then((res) => {
                    const gmail = res?.data?.data?.gmail;
                    if (gmail?.status === 2) {
                        if (!popup.closed) popup.close();
                        finishSuccess();
                        return true;
                    }
                    return false;
                })
                .catch(() => false);

        const removeGmailConnectListener = listenForGmailConnectResult(
            () => {
                if (!popup.closed) popup.close();
                finishSuccess();
            },
            (message) => {
                if (!popup.closed) popup.close();
                finishError(message);
            }
        );

        urlCheckInterval = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(urlCheckInterval);
                    urlCheckInterval = null;
                    if (!resolved) {
                        tryFinishFromAccountStatus().then((connected) => {
                            if (!connected && !resolved) {
                                finishError('Gmail connection was cancelled.');
                            }
                        });
                    } else {
                        removeGmailConnectListener();
                    }
                    return;
                }

                const popupUrl = popup.location.href;

                if (isGmailConnectCallbackUrl(popupUrl) || popupUrl.includes('gmail=success')) {
                    tryFinishFromAccountStatus();
                    return;
                }

                if (popupUrl.includes('error=')) {
                    if (!popup.closed) popup.close();
                    finishError('Gmail connection failed');
                }
            } catch (_) {
                // Cross-origin during OAuth handshake is expected.
            }
        }, 500);

        timeoutId = setTimeout(() => {
            if (!popup.closed) popup.close();
            if (!resolved) {
                tryFinishFromAccountStatus().then((connected) => {
                    if (!connected && !resolved) {
                        finishError('Connection timeout. Please try again.');
                    }
                });
            }
        }, 600000);
    };

    const gmailConnected = gmailStatus?.status === 2;
    const linkedinConnected = linkedinStatus?.status === 2;
    const linkedinNeedsVerification = linkedinStatus?.status === 1;

    /** Gmail completion drives whether the user can advance to the next step. */
    const gmailDone = !!outreachStepConfig?.status?.step1 || gmailConnected;
    const nextDisabled = !gmailDone || stepConfigLoading;

    /**
     * Fire-and-forget resume health check. No loader, no toast, no modal — the
     * goal is simply to have a fresh score waiting for the user by the time they
     * land on the dashboard. The returned id is handed off to the global
     * `BackgroundHealthCheckPusher` via Redux so the subscription survives the
     * user navigating away from this step.
     */
    const runBackgroundResumeHealthCheck = async () => {
        try {
            const openAiStatus = await getOpenAiStatus()(dispatch);
            if (!openAiStatus?.requiredFunctionOnline) {
                autoHealthCheckTriggeredRef.current = false;
                return;
            }

            let payload = {
                resume: true,
                is_auto: true,
                networkDelay: 2000,
            }

            const res = await submitResumeHealthCheck(payload)(dispatch);
            const newId = res?.data?.health_check_id || null;
            if (!newId) {
                autoHealthCheckTriggeredRef.current = false;
                return;
            }

            try {
                sessionStorage.setItem('r_c_date', new Date().toISOString().split('T')[0]);
            } catch {
                /* private mode / quota — ignore */
            }

            if (res?.data?.health_check_done) {
                // Already complete server-side — just refresh control so Redux reflects it.
                getResumeHealthCheck()(dispatch).catch(() => { });
            } else {
                dispatch({ type: SET_BG_RESUME_HEALTH_CHECK_ID, payload: newId });
            }
        } catch {
            // Silent failure — allow a retry on the next gmail-connected transition.
            autoHealthCheckTriggeredRef.current = false;
        }
    };

    /**
     * Whenever Gmail is connected and we don't already have a completed health check
     * for the current profile resume, kick off a background check exactly once per
     * mount. The Pusher subscription is owned by `BackgroundHealthCheckPusher` at
     * the global GlobalPopups level, so nothing in this component needs to render
     * for the score to eventually land in Redux.
     */
    const onConnectedAccount = () => {
        // Record that at least one account connected this session so the referral
        // trial-unlock celebration can fire once a referral has been claimed.
        referralConnectedRef.current = true;
        maybeShowReferralCelebration();

        if (autoHealthCheckTriggeredRef.current) return;
        if (bgResumeHealthCheckId) return;
        if (outreachStepConfig.plan && outreachStepConfig.has_plan_expired) return;
        autoHealthCheckTriggeredRef.current = true;
        runBackgroundResumeHealthCheck();
    }

    // Re-evaluate the trial-unlock celebration when connect/claim state settles.
    useEffect(() => {
        maybeShowReferralCelebration();
    }, [showReferral, outreachStepConfig]);

    return (
        <>
            <div className="agent-onb-scroll step1">
                <header className="agent-onb-step-header agent-onb-step-header--join">
                    <h2 className="agent-onb-step-header__title agent-onb-step-header__title--join">
                        Join HAPPPY Agent <span className='subtitle'>Configure in less than 60 seconds</span>
                    </h2>
                </header>

                {showReferral && (
                    <div className="agent-onb-referral">
                        <div
                            className={`agent-onb-referral-field${showReferralExpanded ? ' agent-onb-referral-field--open' : ''}`}
                        >
                            <button
                                type="button"
                                className="agent-onb-referral-field__toggle"
                                onClick={() => setShowReferralExpanded((prev) => !prev)}
                                aria-expanded={showReferralExpanded}
                                aria-controls="agent-onb-referral-input"
                            >
                                <span className="agent-onb-referral-field__label">
                                    Have a referral link? paste it here to get 3 days of extra free trial
                                </span>
                                <svg
                                    className={`agent-onb-referral-field__chevron${showReferralExpanded ? ' agent-onb-referral-field__chevron--open' : ''}`}
                                    width="14"
                                    height="14"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M4 6L8 10L12 6"
                                        stroke="#231F20"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </button>

                            <div
                                className={`agent-onb-accordion-panel${showReferralExpanded ? ' agent-onb-accordion-panel--open' : ''}`}
                                aria-hidden={!showReferralExpanded}
                            >
                                <div className="agent-onb-accordion-panel__inner">
                                    <div className="agent-onb-referral-field__body">
                                        <input
                                            ref={referralInputRef}
                                            type="text"
                                            name="referral_link"
                                            id="agent-onb-referral-input"
                                            className={`agent-onb-referral-field__input${referralVerifyState === 'invalid' ? ' agent-onb-referral-field__input--error' : ''}${isReferralInputLocked ? ' agent-onb-referral-field__input--locked' : ''}`}
                                            placeholder="Paste link here..."
                                            value={referralLinkInput}
                                            onChange={handleReferralLinkChange}
                                            onBlur={handleReferralLinkBlur}
                                            readOnly={isReferralInputLocked}
                                            disabled={referralVerifyState === 'verifying'}
                                            tabIndex={showReferralExpanded ? 0 : -1}
                                            data-hj-allow
                                        />
                                        {referralVerifyState === 'verifying' && (
                                            <p className="agent-onb-referral-field__status agent-onb-referral-field__status--verifying">
                                                Verifying referral code...
                                            </p>
                                        )}
                                        {referralVerifyState === 'verified' && (
                                            <div className="agent-onb-referral-field__status agent-onb-referral-field__status--success">
                                                {isReferralInputLocked && (
                                                    <CheckedRoundedIcon color={JAD_PREF_FIGMA_COLORS.successGreen} />
                                                )}
                                                <p>Your referral code will be applied.</p>
                                            </div>
                                        )}
                                        {referralVerifyState === 'invalid' && (
                                            <p className="agent-onb-referral-field__status agent-onb-referral-field__status--error">
                                                Referral code is invalid.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="agent-onb-callback-banner" role="note">
                    Job seekers sent 12,400+ referrals through HAPPPY this month — and it starts the moment you link Gmail.
                </div>

                <div className="agent-onb-cards">
                    {/* ---------------- Gmail card (required / connected) ---------------- */}
                    <div
                        className={`agent-onb-card agent-onb-card--gmail${gmailConnected ? ' agent-onb-card--connected' : ''
                            }`}
                    >
                        {gmailConnected ? (
                            <ConnectedBadge />
                        ) : (
                            <span className="agent-onb-card__badge agent-onb-card__badge--needed">
                                <span className="agent-onb-card__badge-dot" aria-hidden="true">
                                    !
                                </span>
                                Needed to send outreach
                            </span>
                        )}
                        <div className="agent-onb-card__head">
                            <span className="agent-onb-card__avatar agent-onb-card__avatar--gmail">
                                <GmailIcon />
                            </span>
                            <div className="agent-onb-card__head-text">
                                <h3 className="agent-onb-card__title">Gmail</h3>
                                <p className="agent-onb-card__subtitle">Any Gmail works · 20-sec setup</p>
                            </div>
                        </div>
                        <ul className="agent-onb-card__benefits">
                            {GMAIL_BENEFITS.map((b) => (
                                <li key={b} className="agent-onb-card__benefit">
                                    <CheckIcon className="agent-onb-card__benefit-icon" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="agent-onb-card__actions">
                            {gmailConnected ? (
                                <button
                                    type="button"
                                    className="agent-onb-card__cta agent-onb-card__cta--disconnect"
                                    onClick={() => openDisconnectModal('gmail')}
                                    disabled={gmailConnecting}
                                >
                                    {gmailConnecting ? 'Disabling…' : 'Disable email outreach'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="agent-onb-card__cta"
                                    onClick={handleGmailConnect}
                                    disabled={gmailConnecting || isLoading}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path d="M3.10671 8.74683L8.66671 1.3335L8.00005 6.66683H13.2172C13.528 6.66683 13.6979 7.02943 13.4988 7.26823L7.33338 14.6668L8.00005 9.3335H3.40005C3.0979 9.3335 2.92543 8.98856 3.10671 8.74683Z" stroke="#231F20" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {gmailConnecting ? 'Connecting…' : isLoading ? 'Loading…' : 'Enable email Outreach'}
                                </button>
                            )}
                        </div>
                        <p className="agent-onb-card__footnote">
                            HAPPPY never reads the rest of your inbox · Revoke anytime
                        </p>
                    </div>

                    {/* ---------------- LinkedIn card (optional / connected) ------------- */}
                    <div
                        className={`agent-onb-card agent-onb-card--linkedin${linkedinConnected ? ' agent-onb-card--connected' : ''
                            }`}
                    >
                        {linkedinConnected ? (
                            <ConnectedBadge />
                        ) : (
                            <span className="agent-onb-card__badge agent-onb-card__badge--optional">Optional</span>
                        )}
                        <div className="agent-onb-card__head">
                            <span className="agent-onb-card__avatar agent-onb-card__avatar--linkedin">in</span>
                            <div className="agent-onb-card__head-text">
                                <h3 className="agent-onb-card__title">LinkedIn</h3>
                                <p className="agent-onb-card__subtitle">No premium subscription needed</p>
                            </div>
                        </div>
                        <ul className="agent-onb-card__benefits">
                            {LINKEDIN_BENEFITS.map((b) => (
                                <li key={b} className="agent-onb-card__benefit">
                                    <CheckIcon className="agent-onb-card__benefit-icon" />
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="agent-onb-card__actions">
                            {linkedinConnected ? (
                                <button
                                    type="button"
                                    className="agent-onb-card__cta agent-onb-card__cta--disconnect"
                                    onClick={() => openDisconnectModal('linkedin')}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Disabling…' : 'Disable linkedin outreach'}
                                </button>
                            ) : linkedinNeedsVerification ? (
                                <button
                                    type="button"
                                    className="agent-onb-card__cta"
                                    onClick={handleToggleLinkedinForm}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Verifying…' : 'Verify LinkedIn'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="agent-onb-card__cta"
                                    onClick={handleToggleLinkedinForm}
                                    disabled={linkedinConnecting || isLoading}
                                >
                                    {linkedinConnecting ? 'Connecting…' : 'Enable linkedin Outreach'}
                                </button>
                            )}
                        </div>
                        <p className="agent-onb-card__footnote">
                            We never see your password · Your account stays safe · Revoke anytime
                        </p>
                    </div>
                </div>

                <div className="agent-onb-trust-strip" aria-label="Security and privacy assurances">
                    <svg
                        className="agent-onb-trust-strip__google"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <ul className="agent-onb-trust-strip__badges">
                        {TRUST_BADGES.map((badge) => (
                            <li key={badge} className="agent-onb-trust-strip__badge">
                                {badge}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ---------------- LinkedIn inline form ------------------- */}
                {showLinkedinForm && (linkedinStatus == null || linkedinStatus?.status === 0) && (
                    <div className="agent-onb-li-form" role="region" aria-label="Connect LinkedIn">
                        <h3 className="agent-onb-li-form__title">Connect LinkedIn</h3>
                        <p className="agent-onb-li-form__hint">
                            Use your normal LinkedIn login. We never post on your behalf.
                        </p>

                        {formMessage.type && (
                            <div
                                className={`agent-onb-li-form__alert agent-onb-li-form__alert--${formMessage.type}`}
                                role="alert"
                            >
                                <span>{formMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleLinkedinConnect}>
                            <div className="agent-onb-li-form__group">
                                <label className="agent-onb-li-form__label" htmlFor="agent-onb-li-email">
                                    Email
                                </label>
                                <input
                                    id="agent-onb-li-email"
                                    type="email"
                                    name="email"
                                    autoFocus
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`agent-onb-li-form__input${errors.email ? ' agent-onb-li-form__input--error' : ''
                                        }`}
                                    placeholder="Enter your LinkedIn email"
                                    disabled={linkedinConnecting}
                                />
                                {errors.email && <span className="agent-onb-li-form__error">{errors.email}</span>}
                            </div>
                            <div className="agent-onb-li-form__group">
                                <label className="agent-onb-li-form__label" htmlFor="agent-onb-li-password">
                                    Password
                                </label>
                                <input
                                    id="agent-onb-li-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`agent-onb-li-form__input${errors.password ? ' agent-onb-li-form__input--error' : ''
                                        }`}
                                    placeholder="Enter your LinkedIn password"
                                    disabled={linkedinConnecting}
                                />
                                {errors.password && (
                                    <span className="agent-onb-li-form__error">{errors.password}</span>
                                )}
                            </div>
                            <div className="agent-onb-li-form__actions">
                                <button
                                    type="button"
                                    className="agent-onb-li-form__btn agent-onb-li-form__btn--secondary"
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
                                    className="agent-onb-li-form__btn agent-onb-li-form__btn--primary"
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Connecting…' : 'Connect'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ---------------- LinkedIn verification form ------------- */}
                {showLinkedinForm && linkedinNeedsVerification && (
                    <div className="agent-onb-li-form" role="region" aria-label="Verify LinkedIn">
                        <h3 className="agent-onb-li-form__title">Verify LinkedIn</h3>
                        <p className="agent-onb-li-form__hint">
                            {linkedinStatus?.email}
                            {linkedinStatus?.auth_type === 'linkedin_app_approval'
                                ? ' — kindly approve the request in your LinkedIn app.'
                                : ' — enter the verification code sent to your email, phone, or authentication app.'}
                        </p>

                        {formMessage.type && !formMessage.text.includes('Verification code sent!') && (
                            <div
                                className={`agent-onb-li-form__alert agent-onb-li-form__alert--${formMessage.type}`}
                                role="alert"
                            >
                                <span>{formMessage.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleLinkedinVerify}>
                            {linkedinStatus?.auth_type === 'code_required' && (
                                <div className="agent-onb-li-form__group">
                                    <label className="agent-onb-li-form__label" htmlFor="agent-onb-li-code">
                                        Verification code
                                    </label>
                                    <input
                                        id="agent-onb-li-code"
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        className={`agent-onb-li-form__input${errors.code ? ' agent-onb-li-form__input--error' : ''
                                            }`}
                                        placeholder="Enter verification code"
                                        disabled={linkedinConnecting}
                                    />
                                    {errors.code && <span className="agent-onb-li-form__error">{errors.code}</span>}
                                </div>
                            )}
                            <div className="agent-onb-li-form__actions">
                                <button
                                    type="button"
                                    className="agent-onb-li-form__btn agent-onb-li-form__btn--secondary"
                                    onClick={handleLinkedinVerificationCancel}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Disconnecting…' : 'Cancel & Disconnect'}
                                </button>
                                <button
                                    type="submit"
                                    className="agent-onb-li-form__btn agent-onb-li-form__btn--primary"
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

                <div className="agent-onb-privacy-toggle-wrap">
                    <button
                        type="button"
                        className="agent-onb-privacy-toggle"
                        onClick={() => setShowPrivacyDetails((prev) => !prev)}
                        aria-expanded={showPrivacyDetails}
                        aria-controls="agent-onb-privacy-details"
                    >
                        <img
                            src="/images/talent/outreach/mascot-gmail-concern.svg"
                            alt=""
                            className="agent-onb-privacy-toggle__mascot"
                            aria-hidden="true"
                            width={39}
                            height={40}
                        />
                        <span className="agent-onb-privacy-toggle__label">
                            See exactly what HAPPPY can &amp; can&apos;t do
                            <svg
                                className={`agent-onb-privacy-toggle__chevron${showPrivacyDetails ? ' agent-onb-privacy-toggle__chevron--open' : ''}`}
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path
                                    d="M4 6L8 10L12 6"
                                    stroke="#6B6B6B"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    </button>

                    <div
                        className={`agent-onb-accordion-panel${showPrivacyDetails ? ' agent-onb-accordion-panel--open' : ''}`}
                        aria-hidden={!showPrivacyDetails}
                    >
                        <div className="agent-onb-accordion-panel__inner">
                            <div className="data-secure-container" id="agent-onb-privacy-details">
                                <div className="data-secured-badges">
                                    <strong>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                            <path d="M7.00016 12.8334C7.00016 12.8334 11.6668 10.5001 11.6668 7.00008V2.91675L7.00016 1.16675L2.3335 2.91675V7.00008C2.3335 10.5001 7.00016 12.8334 7.00016 12.8334Z" stroke="#086D7E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Your data stays secured
                                    </strong>
                                    <ul className="agent-onb-trust-badges" aria-label="Security and privacy assurances">
                                        (
                                        {TRUST_BADGES.map((badge) => (
                                            <li key={badge} className="agent-onb-trust-badges__item">
                                                {badge}
                                            </li>
                                        ))}
                                        )
                                    </ul>
                                </div>

                                <section className="agent-onb-privacy" aria-labelledby="agent-onb-privacy-title">
                                    <ul className="agent-onb-privacy__list">
                                        {PRIVACY_POINTS.map((point) => (
                                            <li key={point} className="agent-onb-privacy__item">
                                                <CheckIconSecure className="agent-onb-privacy__check" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="agent-onb-footer step1">
                {gmailDone ? (
                    <span
                        className="agent-onb-footer__warning agent-onb-footer__warning--hidden"
                        aria-hidden="true"
                    />
                ) : (
                    <span className="agent-onb-footer__warning" role="status">
                        <span className="agent-onb-footer__warning-icon" aria-hidden="true">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 2.5L3.75 7.25L1.5 5" stroke="#2C7A4B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                        Please link with Gmail to proceed. Reversible anytime
                    </span>
                )}
                <button
                    type="button"
                    className="agent-onb-footer__cta"
                    onClick={onAdvance}
                    disabled={nextDisabled}
                >
                    <span>Next step</span>
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

            {celebrationOpen && typeof document !== 'undefined' && createPortal(
                <div className="agent-onb-referral-celebration-overlay" role="dialog" aria-modal="true">
                    <div className="agent-onb-referral-celebration">
                        <ReferralTrialUnlockedScreen
                            referrerName={referrerName}
                            onProceed={() => setCelebrationOpen(false)}
                            onClose={() => setCelebrationOpen(false)}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Step1AccountConnection;
