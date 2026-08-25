'use client';

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectLinkedin, disconnectGmail, disconnectLinkedin, getAccountStatus, getOpenAiStatus, submitResumeHealthCheck, verifyLinkedin } from "../../../store/actions/UserActions";
import { ActivateAgentIcon, BrowseJobsIcon, DeleteIcon2, EditIcon2, GmailIcon, LinkAccountIcon, OutreachAgentIcon } from '../../../assets/IconSVG';
import { useSearchParams } from "next/navigation";
import { toast } from 'react-hot-toast';
import Loader from "../../../components/Loader";
import GmailPrivacyFallbackPopup from "../../../components/GmailPrivacyFallbackPopup";
import { trackHappyAgentMixpanel } from "../../../store/actions/happyAgentTracking";
import "./AccountConnection.css";
import {
    HAPPY_HANDWRITING_CLASS,
    HAPPY_SETUP_CHECKMARK_SRC,
    HAPPY_SETUP_HANDWRITING,
} from "./happyAgentPageAssets";
import { getResumeHealthCheck } from "../../../store/actions/resumeActions";
import { SET_BG_RESUME_HEALTH_CHECK_ID, UPDATE_CURRENT_USER } from "../../../store/actions/actionsTypes";
import { GET_API } from "../../../components/Helper";
import { API_ME } from "../../../components/Constant";
import {
    isGmailConnectCallbackUrl,
    listenForGmailConnectResult,
    buildGmailOAuthUrl,
} from "../../../helpers/gmailConnectPopup";

export const AccountConnection = ({ outreachStepConfig, onRefresh, accountsOnlyMode = false, onOpenAgentOnboarding, publicSignupMode = false }) => {
    
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth)?.user;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        code: ''
    });
    const [errors, setErrors] = useState({});

    const [existingOutreach, setExistingOutreach] = useState([]);
    const [linkedinConnecting, setLinkedinConnecting] = useState(false);
    const [gmailConnecting, setGmailConnecting] = useState(false);
    const [gmailSending, setGmailSending] = useState(false);
    
    const [linkedinStatus, setLinkedinStatus] = useState(null);
    const [gmailStatus, setGmailStatus] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [showJobsPopup, setShowJobsPopup] = useState(false);
    const [templateType, setTemplateType] = useState(1);
    const [showLinkedinForm, setShowLinkedinForm] = useState(false);
    const [formMessage, setFormMessage] = useState({ type: null, text: '' });
    const [gmailErrorPopup, setGmailErrorPopup] = useState({ open: false, message: '' });

    /** 'gmail' | 'linkedin' — OTP “Cancel & Disconnect” skips modal (see handleVerificationCancel). */
    const [disconnectModal, setDisconnectModal] = useState(null);
    const [disconnectReason, setDisconnectReason] = useState('');

    const searchParams = useSearchParams();
    const gmail = searchParams.get('gmail');

    const trackAccountsOnlyEvent = (eventName, properties = {}) => {
        if (!accountsOnlyMode) return;
        trackHappyAgentMixpanel(eventName, properties).catch(() => {});
    };

    /**
     * On marketing landings (`accountsOnlyMode`) every primary CTA in this card
     * should hand the user off to the right-side AgentOnboarding drawer instead
     * of running its inline action, so the full setup flow stays in one place.
     */
    const shouldRedirectToAgentOnboarding =
        accountsOnlyMode && typeof onOpenAgentOnboarding === 'function';

    const redirectToAgentOnboarding = (e, ctaSource) => {
        if (e?.preventDefault) e.preventDefault();
        trackAccountsOnlyEvent('happy_agent_account_cta_opened_onboarding', {
            cta_source: ctaSource,
        });
        onOpenAgentOnboarding();
    };

    const withOnboardingRedirect = (originalHandler, ctaSource) => (
        shouldRedirectToAgentOnboarding
            ? (e) => redirectToAgentOnboarding(e, ctaSource)
            : originalHandler
    );

    useEffect(() => {
        if (publicSignupMode) {
            return;
        }
        setIsLoading(true);
        dispatch(getAccountStatus())
            .then((res) => {
                setLinkedinStatus(res?.data?.data?.linkedin);
                setGmailStatus(res?.data?.data?.gmail);
                setJobs(res?.data?.jobs);

                const provider = res?.data?.data?.linkedin?.provider ?? res?.data?.data?.gmail?.provider;
                if(provider) setTemplateType(provider);

                if(res?.data?.data?.gmail?.status == 2 && res?.data?.jobs?.length > 0 && gmail == "success"){
                    setShowJobsPopup(true);
                }
                if(res?.data?.data?.gmail?.status == 2 && res?.data?.data?.linkedin?.status == 2 && res?.data?.jobs?.length > 0){
                    setShowJobsPopup(true);
                }

            })
            .catch(() => {
                // Handle any errors silently
            })
            .finally(() => {
                setIsLoading(false);
            });
        
    }, [dispatch, gmail]);

    const validateForm = () => {
        const newErrors = {};
        
        if (linkedinStatus == null || linkedinStatus?.status == 0) {
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Please enter a valid email address';
            }
            
            if (!formData.password.trim()) {
                newErrors.password = 'Password is required';
            }
        } else if (linkedinStatus && linkedinStatus?.auth_type == "code_required") {
            if (!formData.code.trim()) {
                newErrors.code = 'Verification code is required';
            } 
            // else if (formData.code.length !== 6) {
            //     newErrors.code = 'Please enter a 6-digit verification code';
            // }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        
        const plan = outreachStepConfig?.plan;
        // if (plan === 1 || plan === null) {
        //     scrollToPricing();
        //     return;
        // }
        
        if (!validateForm()) {
            setFormMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
            trackAccountsOnlyEvent('happy_agent_linkedin_connect_validation_failed');
            return;
        }
        
        // Prevent multiple clicks
        if (linkedinConnecting) return;
        
        setLinkedinConnecting(true);
        setFormMessage({ type: null, text: '' });
        
        try {
            trackAccountsOnlyEvent('happy_agent_linkedin_connect_attempted');
            const response = await dispatch(connectLinkedin({
                email: formData.email,
                password: formData.password
            }));
            setLinkedinStatus(response?.data?.data);
            if (response?.data?.data?.status == 2) {
                setFormMessage({ type: 'success', text: 'LinkedIn account connected successfully!' });
                onConnectedAccount();
                trackAccountsOnlyEvent('happy_agent_linkedin_connected');
                localStorage.setItem('outreach_account_connected', 'true');
                setTimeout(() => {
                    setShowJobsPopup(true);
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                }, 1500);
            } else if (response?.data?.data?.status == 1) {
                setFormMessage({ type: 'success', text: 'Verification code sent! Please check your email or SMS.' });
                trackAccountsOnlyEvent('happy_agent_linkedin_verification_required');
            } else {
                setFormMessage({ type: 'error', text: response?.data?.message || 'Something went wrong. Please try again.' });
                trackAccountsOnlyEvent('happy_agent_linkedin_connect_failed', {
                    message: response?.data?.message || '',
                });
            }
        } catch (error) {
            setFormMessage({ type: 'error', text: error?.response?.data?.message || 'Something went wrong. Please try again.' });
            trackAccountsOnlyEvent('happy_agent_linkedin_connect_failed', {
                message: error?.response?.data?.message || '',
            });
        } finally {
            setLinkedinConnecting(false);
        }
    };


    const closeDisconnectModal = () => {
        setDisconnectModal(null);
        setDisconnectReason('');
    };

    const runLinkedinDisconnect = async (reason, successToast) => {
        try {
            trackAccountsOnlyEvent('happy_agent_linkedin_disconnect_attempted');
            const response = await dispatch(disconnectLinkedin({ disconnect_reason: reason }));
            if (response?.data?.status === 'success') {
                setLinkedinStatus(null);
                setShowLinkedinForm(false);
                setFormData({ email: '', password: '', code: '' });
                setFormMessage({ type: null, text: '' });
                toast.success(successToast);
                trackAccountsOnlyEvent('happy_agent_linkedin_disconnected');
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                toast.error(response?.data?.message || 'Something went wrong. Please try again.');
                trackAccountsOnlyEvent('happy_agent_linkedin_disconnect_failed', {
                    message: response?.data?.message || '',
                });
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.disconnect_reason?.[0] ||
                'Something went wrong. Please try again.';
            toast.error(msg);
            trackAccountsOnlyEvent('happy_agent_linkedin_disconnect_failed', {
                message: msg,
            });
        }
    };

    const runGmailDisconnect = async (reason) => {
        try {
            trackAccountsOnlyEvent('happy_agent_gmail_disconnect_attempted');
            const response = await dispatch(disconnectGmail({ disconnect_reason: reason }));
            if (response?.data?.status === 'success') {
                setGmailStatus(null);
                toast.success('Gmail account disconnected successfully!');
                trackAccountsOnlyEvent('happy_agent_gmail_disconnected');
                if (onRefresh) {
                    onRefresh();
                }
            } else {
                toast.error(response?.data?.message || 'Something went wrong. Please try again.');
                trackAccountsOnlyEvent('happy_agent_gmail_disconnect_failed', {
                    message: response?.data?.message || '',
                });
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.disconnect_reason?.[0] ||
                'Something went wrong. Please try again.';
            toast.error(msg);
            trackAccountsOnlyEvent('happy_agent_gmail_disconnect_failed', {
                message: msg,
            });
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
                await runLinkedinDisconnect(reason, 'LinkedIn account disconnected successfully!');
                closeDisconnectModal();
            } finally {
                setLinkedinConnecting(false);
            }
        }
    };

    const openDisconnectModal = (kind) => {
        setDisconnectReason('');
        setDisconnectModal(kind);
        trackAccountsOnlyEvent('happy_agent_disconnect_modal_opened', {
            account_type: kind,
        });
    };

    /** OTP / verification screen: disconnect without reason modal (API still requires a reason). */
    const handleVerificationCancel = async () => {
        try {
            setLinkedinConnecting(true);
            await runLinkedinDisconnect(
                'Cancelled during LinkedIn verification',
                'LinkedIn account disconnected. You can connect again.'
            );
        } finally {
            setLinkedinConnecting(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setFormMessage({ type: 'error', text: 'Please fill in all required fields correctly.' });
            trackAccountsOnlyEvent('happy_agent_linkedin_verify_validation_failed');
            return;
        }
        
        // Prevent multiple clicks
        if (linkedinConnecting) return;
        setLinkedinConnecting(true);
        setFormMessage({ type: null, text: '' });
        
        try {
            trackAccountsOnlyEvent('happy_agent_linkedin_verify_attempted', {
                auth_type: linkedinStatus?.auth_type || '',
            });
            const response = await dispatch(verifyLinkedin({
                email: formData.email,
                code: formData?.code
            }));
            
            if (response?.data?.data?.status == 2) {
                setFormMessage({ type: 'success', text: 'LinkedIn account verified and connected successfully!' });
                trackAccountsOnlyEvent('happy_agent_linkedin_verified');
                setLinkedinStatus(response?.data?.data);
                setTimeout(() => {
                    setShowJobsPopup(true);
                    setShowLinkedinForm(false);
                    setFormMessage({ type: null, text: '' });
                }, 1500);
            } else {
                if(linkedinStatus?.auth_type == "code_required"){
                    setFormMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
                }
                else if(linkedinStatus?.auth_type == "linkedin_app_approval"){
                    setFormMessage({ type: 'error', text: 'Session expired. Please connect again.' });
                } else {
                    setFormMessage({ type: 'error', text: response?.data?.message || 'Something went wrong. Please try again.' });
                }
                trackAccountsOnlyEvent('happy_agent_linkedin_verify_failed', {
                    message: response?.data?.message || '',
                    auth_type: linkedinStatus?.auth_type || '',
                });
            }
        } catch (error) {
            setFormMessage({ type: 'error', text: error?.response?.data?.message || 'Something went wrong. Please try again.' });
            trackAccountsOnlyEvent('happy_agent_linkedin_verify_failed', {
                message: error?.response?.data?.message || '',
                auth_type: linkedinStatus?.auth_type || '',
            });
        } finally {
            setLinkedinConnecting(false);
        }
    };

    const handleToggleLinkedinForm = () => {
        const plan = outreachStepConfig?.plan;
        // if (plan === 1 || plan === null) {
        //     scrollToPricing();
        //     return;
        // }
        // Pre-fill email if available from linkedinStatus
        if (linkedinStatus?.email && !formData.email) {
            setFormData(prev => ({
                ...prev,
                email: linkedinStatus.email
            }));
        }
        // Clear form message when toggling, especially when opening verification form
        setFormMessage({ type: null, text: '' });
        setShowLinkedinForm(!showLinkedinForm);
        trackAccountsOnlyEvent('happy_agent_linkedin_form_toggled', {
            action: showLinkedinForm ? 'close' : 'open',
        });
    };

    const sendDummyEmail = () => {
        setGmailSending(true);
        // Add your API call here
        setTimeout(() => {
            toast.success('Email sent to mohitkumar.m@uplers.in');
            setGmailSending(false);
        }, 1000);
    };

    const openInbox = () => {
        setShowJobsPopup(true);
    };

    const scrollToPricing = () => {
        const pricingSection = document.querySelector('.pricing-section');
        if (pricingSection) {
            pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleGmailConnect = async (e) => {
        if (e?.preventDefault) {
            e.preventDefault();
        }
        
        const plan = outreachStepConfig?.plan;
        // if (plan === 1 || plan === null) {
        //     scrollToPricing();
        //     return;
        // }

        let encId = user?.enc_id;
        if (!encId) {
            try {
                const { data } = await GET_API(API_ME);
                encId = data?.data?.enc_id;
                if (encId) {
                    dispatch({ type: UPDATE_CURRENT_USER, payload: { enc_id: encId } });
                }
            } catch {
                /* fall through */
            }
        }

        if (!encId) {
            toast.error('Could not start Gmail connect. Please refresh and try again.');
            return;
        }

        // Open Gmail OAuth in a popup window
        const gmailUrl = buildGmailOAuthUrl(encId);
        const popup = window.open(
            gmailUrl,
            'Gmail OAuth',
            'width=600,height=700,scrollbars=yes,resizable=yes,left=' + 
            (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350)
        );

        trackAccountsOnlyEvent('happy_agent_gmail_connect_attempted');

        if (!popup) {
            toast.error('Please allow popups for this site to connect Gmail');
            trackAccountsOnlyEvent('happy_agent_gmail_popup_blocked');
            return;
        }

        setGmailErrorPopup({ open: false, message: '' });
        setGmailConnecting(true);

        let isResolved = false;
        let timeout = null;
        let urlCheckInterval = null;

        const teardown = () => {
            if (timeout) clearTimeout(timeout);
            if (urlCheckInterval) clearInterval(urlCheckInterval);
            removeGmailConnectListener();
        };

        const handleSuccess = () => {
            if (isResolved) return;
            isResolved = true;
            teardown();

            dispatch(getAccountStatus())
                .then((res) => {
                    setGmailStatus(res?.data?.data?.gmail);
                    toast.success('Gmail account connected successfully!');
                    localStorage.setItem('outreach_account_connected', 'true');
                    trackAccountsOnlyEvent('happy_agent_gmail_connected');
                    onConnectedAccount();
                    if (res?.data?.data?.gmail?.status == 2 && res?.data?.jobs?.length > 0) {
                        setShowJobsPopup(true);
                    }
                    if (onRefresh) {
                        onRefresh();
                    }
                })
                .catch(() => {
                    toast.error('Failed to refresh account status');
                })
                .finally(() => {
                    setGmailConnecting(false);
                });
        };

        const handleError = (message) => {
            if (isResolved) return;
            isResolved = true;
            teardown();
            setGmailConnecting(false);
            setGmailErrorPopup({
                open: true,
                message: message || 'Failed to connect Gmail account. Please try again.',
            });
            trackAccountsOnlyEvent('happy_agent_gmail_connect_failed', {
                message: message || '',
            });
        };

        const tryFinishFromAccountStatus = () =>
            dispatch(getAccountStatus())
                .then((res) => {
                    const gmail = res?.data?.data?.gmail;
                    if (gmail?.status === 2) {
                        if (!popup.closed) popup.close();
                        handleSuccess();
                        return true;
                    }
                    return false;
                })
                .catch(() => false);

        const removeGmailConnectListener = listenForGmailConnectResult(
            () => {
                if (!popup.closed) popup.close();
                handleSuccess();
            },
            (message) => {
                if (!popup.closed) popup.close();
                handleError(message);
            }
        );

        urlCheckInterval = setInterval(() => {
            try {
                if (popup.closed) {
                    clearInterval(urlCheckInterval);
                    urlCheckInterval = null;
                    if (!isResolved) {
                        tryFinishFromAccountStatus().then((connected) => {
                            if (!connected && !isResolved) {
                                handleError('Gmail connection was cancelled.');
                            }
                        });
                    } else {
                        removeGmailConnectListener();
                    }
                    return;
                }

                const popupUrl = popup.location.href;

                if (
                    isGmailConnectCallbackUrl(popupUrl) ||
                    (popupUrl.includes('/talent/referral-ai-agent') && popupUrl.includes('gmail=success')) ||
                    (popupUrl.includes('/talent/outreach-agent') && popupUrl.includes('gmail=success'))
                ) {
                    tryFinishFromAccountStatus();
                    return;
                }

                if (popupUrl.includes('error=')) {
                    if (!popup.closed) popup.close();
                    handleError('Gmail connection failed');
                }
            } catch (_) {
                /* Cross-origin during OAuth — expected */
            }
        }, 500);

        timeout = setTimeout(() => {
            if (!popup.closed) popup.close();
            if (!isResolved) {
                tryFinishFromAccountStatus().then((connected) => {
                    if (!connected && !isResolved) {
                        handleError('Connection timeout. Please try again.');
                    }
                });
            }
        }, 600000);
    };

    const bgResumeHealthCheckId = useSelector((state) => state.resume?.bgResumeHealthCheckId);
    const gmailConnected = gmailStatus?.status === 2;
    const linkedinConnected = linkedinStatus?.status === 2;
    const autoHealthCheckTriggeredRef = useRef(false);

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

            let payload={
                resume: true,
                is_auto: true,
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
                getResumeHealthCheck()(dispatch).catch(() => {});
            } else {
                dispatch({ type: SET_BG_RESUME_HEALTH_CHECK_ID, payload: newId });
            }
        } catch {
            // Silent failure — allow a retry on the next gmail-connected transition.
            autoHealthCheckTriggeredRef.current = false;
        }
    };

    const onConnectedAccount= () => {
        if (autoHealthCheckTriggeredRef.current) return;
        if (bgResumeHealthCheckId) return;
        if(outreachStepConfig.plan && outreachStepConfig.has_plan_expired) return;
        autoHealthCheckTriggeredRef.current = true;
        runBackgroundResumeHealthCheck();
    }

    return (
        <>
        <div className={`account-connection account-connection--jad${accountsOnlyMode ? ' account-connection--happy-setup-figma' : ''}`}>
        <div className="accounts-section">

        {/* Message when Gmail is connected but LinkedIn is pending */}
        {/* {gmailStatus && gmailStatus.status == 2 && 
         (linkedinStatus == null || linkedinStatus?.status == 0 || linkedinStatus?.status == 1) && (
            <div className="connection-recommendation-message">
                <div className="recommendation-content">
                    <div className="recommendation-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L2 7V12C2 17.55 6.84 21.74 12 23C17.16 21.74 22 17.55 22 12V7L12 2Z" stroke="#0077b5" strokeWidth="2" fill="none"/>
                            <path d="M9 12L11 14L16 9" stroke="#0077b5" strokeWidth="2"/>
                        </svg>
                    </div>
                </div>
            </div>
        )} */}

        <div className="accounts-grid">

           {/* {isLoading && (
            <div className="loading-section">
                <Loader />
            </div>
           )} */}
            
            {/* Gmail Account Card */}
            <div className="account-card gmail">
                <div className="card-header">
                    {!accountsOnlyMode && (
                    <div className="service-icon gmail">
                        <GmailIcon />
                    </div>
                    )}
                    <div className="header-content">
                        <div className="jad-card-heading">
                            <h2 className="jad-card-heading__title">Gmail</h2>
                            {accountsOnlyMode ? (
                                <span
                                    className={`jad-card-heading__pill-text jad-card-heading__pill-text--gmail ${HAPPY_HANDWRITING_CLASS}`}
                                >
                                    {HAPPY_SETUP_HANDWRITING.anyGmailWorks}
                                </span>
                            ) : (
                            <span
                                className="jad-card-heading__pill"
                                title="Use whichever @gmail.com or Google Workspace address you want—we only send what you approve for outreach."
                            >
                                Any Gmail works
                            </span>
                            )}
                        </div>
                        <p>Send resumes directly to recruiter's official inbox</p>
                    </div>
                </div>

                <div className="benefits-list" role="group" aria-label="Gmail connection and benefits">
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>
                            <span className="benefit-item-label">Any Gmail:</span>{' '}
                            Connect any Gmail account you want for job outreach.
                        </span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>
                            <span className="benefit-item-label">Your control:</span>{' '}
                            {accountsOnlyMode
                                ? 'Disconnect your Gmail account anytime you want'
                                : 'Disconnect Gmail anytime from this screen.'}
                        </span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>Send resumes directly to recruiter's official inbox</span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>Get referred to team leads and hiring managers</span>
                    </div>
                    {/* <div className="benefit-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        <span>Auto track email replies and engagement</span>
                    </div> */}
                </div>

                <div className="card-body">
                    {gmailStatus == null && (
                        <div className="connect-section">
                            <button 
                                className="btn btn-primary"
                                onClick={withOnboardingRedirect(handleGmailConnect, 'connect_gmail')}
                                disabled={gmailConnecting || isLoading}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.10671 8.74683L8.66671 1.3335L8.00005 6.66683H13.2172C13.528 6.66683 13.6979 7.02943 13.4988 7.26823L7.33338 14.6668L8.00005 9.3335H3.40005C3.0979 9.3335 2.92543 8.98856 3.10671 8.74683Z" stroke="#231F20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>&nbsp;&nbsp;
                                {gmailConnecting ? 'Connecting...' : (isLoading ? 'Loading...' : 'Enable email Outreach')}
                            </button>
                        </div>
                    )}

                    {gmailStatus && gmailStatus.status == 2 && (
                        <div className="connected-section">
                            <div className="status-badge connected">
                                {accountsOnlyMode ? (
                                    <span className={`status-badge__handwriting`}>
                                        {HAPPY_SETUP_HANDWRITING.connected}
                                    </span>
                                ) : (
                                <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                                    <path d="M9 12L11 14L16 9" stroke="white" strokeWidth="2"/>
                                </svg>
                                Connected
                                </>
                                )}
                            </div>
                            
                            <div className="account-info">
                                <div className="info-row">
                                    <span className="info-label">Account:</span>
                                    <span className="info-value">{gmailStatus?.email}</span>
                                </div>
                            </div>
                            
                            <div className="action-buttons">
                                {user?.email == "john.george28746237@gmail.com" && (
                                    <>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={sendDummyEmail}
                                            disabled={gmailSending}
                                        >
                                            {gmailSending ? 'Sending...' : 'Send Email To Recruiter'}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={openInbox}
                                        >
                                            View Inbox
                                        </button>
                                    </>
                                )}
                                
                                <button 
                                    type="button" 
                                    className="btn btn-danger" 
                                    onClick={withOnboardingRedirect(() => openDisconnectModal('gmail'), 'disconnect_gmail')}
                                    disabled={gmailConnecting}
                                >
                                    {accountsOnlyMode ? (
                                        <span className={`btn-danger__handwriting`}>
                                            {gmailConnecting ? 'Disabling...' : 'Disable email outreach'}
                                        </span>
                                    ) : (
                                        gmailConnecting ? 'Disabling...' : 'Disable email outreach'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* LinkedIn Account Card */}
            <div className={`account-card linkedin`}>
                <div className="card-header">
                    {!accountsOnlyMode && (
                    <div className="service-icon linkedin">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077B5"/>
                        </svg>
                    </div>
                    )}
                    <div className="header-content">
                        <div className="jad-card-heading">
                            <h2 className="jad-card-heading__title">LinkedIn</h2>
                            {accountsOnlyMode ? (
                                <span
                                    className={`jad-card-heading__pill-text jad-card-heading__pill-text--linkedin ${HAPPY_HANDWRITING_CLASS}`}
                                >
                                    {HAPPY_SETUP_HANDWRITING.noPremiumNeeded}
                                </span>
                            ) : (
                            <span
                                className="jad-card-heading__pill"
                                title="Your normal LinkedIn login is enough—Sales Navigator or Premium is optional."
                            >
                                No Premium needed
                            </span>
                            )}
                        </div>
                        <p>Send resumes directly to LinkedIn Messages</p>
                    </div>
                </div>

                <div className="benefits-list" role="group" aria-label="LinkedIn connection and benefits">
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>
                            <span className="benefit-item-label">Optional:</span>{' '}
                            {accountsOnlyMode
                                ? 'LinkedIn is optional - Gmail alone can run your outreach.'
                                : 'LinkedIn is optional—Gmail alone can run your outreach.'}
                        </span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>
                            <span className="benefit-item-label">Recommended:</span>{' '}
                            {accountsOnlyMode
                                ? 'Connect LinkedIn alongside Gmail- many users see up to 2× the replies.'
                                : 'Connect LinkedIn alongside Gmail—many users see up to 2× the replies.'}
                        </span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>
                            <span className="benefit-item-label">Your control:</span>{' '}
                            Connect or disconnect LinkedIn anytime from this screen.
                        </span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>Auto-send connection requests to target companies</span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>Send resumes directly to LinkedIn InMail</span>
                    </div>
                    <div className="benefit-item">
                        {accountsOnlyMode ? (
                            <img className="benefit-item__check" src={HAPPY_SETUP_CHECKMARK_SRC} alt="" aria-hidden />
                        ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L16 9" stroke="#10b981" strokeWidth="2"/>
                        </svg>
                        )}
                        <span>Smart follow-up sequences</span>
                    </div>
                </div>

                <div className="card-body">
                    {(linkedinStatus == null || linkedinStatus?.status == 0) && (
                        <div className="connect-section">
                            <div className={`linkedin-button-container ${showLinkedinForm ? 'hidden' : ''}`}>
                                <button 
                                    type="button"
                                    className="btn btn-primary" 
                                    onClick={withOnboardingRedirect(handleToggleLinkedinForm, 'connect_linkedin')}
                                    disabled={linkedinConnecting || isLoading}
                                >
                                    {isLoading ? 'Loading...' : (linkedinConnecting ? 'Connecting...' : 'Enable linkedin Outreach')}
                                </button>
                            </div>
                            
                            {showLinkedinForm && (
                                <div className="linkedin-form-container">
                                    <form onSubmit={handleConnect} className="linkedin-connect-form">
                                    {/* Success/Error Message */}
                                    {formMessage.type && (
                                        <div
                                            className={`jad-ac-alert ${formMessage.type === 'success' ? 'jad-ac-alert--success' : 'jad-ac-alert--error'}`}
                                            role="alert"
                                        >
                                            {formMessage.type === 'success' ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                                                    <path d="M9 12L11 14L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                                                    <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            )}
                                            <span>{formMessage.text}</span>
                                        </div>
                                    )}
                                    
                                    <div className="form-group">
                                        <label htmlFor="linkedin-email">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="linkedin-email"
                                            name="email"
                                            value={formData.email || linkedinStatus?.email || ''}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.email ? 'error' : ''}`}
                                            placeholder="Enter your LinkedIn email"
                                            disabled={linkedinConnecting}
                                        />
                                        {errors.email && (
                                            <span className="error-text">
                                                {errors.email}
                                            </span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="linkedin-password">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            id="linkedin-password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className={`form-input ${errors.password ? 'error' : ''}`}
                                            placeholder="Enter your LinkedIn password"
                                            disabled={linkedinConnecting}
                                        />
                                        {errors.password && (
                                            <span className="error-text">
                                                {errors.password}
                                            </span>
                                        )}
                                    </div>

                                    <div className="jad-ac-form-actions">
                                        <button 
                                            type="button"
                                            className="btn btn-secondary" 
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
                                            className="btn btn-primary" 
                                            disabled={linkedinConnecting}
                                        >
                                            {linkedinConnecting ? 'Connecting...' : 'Connect'}
                                        </button>
                                    </div>
                                </form>
                                </div>
                            )}
                        </div>
                    )}

                    {linkedinStatus && linkedinStatus.status == 1 && (
                        <div className="connect-section">
                            {!showLinkedinForm && (
                                <p className="connect-text">Verification required for {linkedinStatus?.email}</p>
                            )}
                            <div className={`linkedin-button-container ${showLinkedinForm ? 'hidden' : ''}`}>
                                <button 
                                    type="button"
                                    className="btn btn-primary" 
                                    onClick={withOnboardingRedirect(handleToggleLinkedinForm, 'verify_linkedin')}
                                    disabled={linkedinConnecting}
                                >
                                    {linkedinConnecting ? 'Verifying...' : 'Verify Account'}
                                </button>
                            </div>
                            
                            {showLinkedinForm && (
                                <div className="linkedin-form-container">
                                    <form onSubmit={handleVerify} className="linkedin-connect-form">
                                    {/* Success/Error Message - Hide the "code sent" message as it's redundant, but show other messages */}
                                    {formMessage.type && !formMessage.text.includes('Verification code sent!') && (
                                        <div
                                            className={`jad-ac-alert ${formMessage.type === 'success' ? 'jad-ac-alert--success' : 'jad-ac-alert--error'}`}
                                            role="alert"
                                        >
                                            {formMessage.type === 'success' ? (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                                                    <path d="M9 12L11 14L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            ) : (
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                                                    <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            )}
                                            <span>{formMessage.text}</span>
                                        </div>
                                    )}
                                    
                                    <div className="verification-section">
                                        <div className="verification-intro">
                                            <p>{linkedinStatus?.email}</p>
                                            {linkedinStatus?.auth_type == "linkedin_app_approval" && (
                                                <p>Kindly approve the request in your LinkedIn app.</p>
                                            )}
                                            {linkedinStatus?.auth_type == "code_required" && (
                                                <p>Enter the verification code sent to your email, phone, or authentication app.</p>
                                            )}
                                        </div>

                                        {linkedinStatus?.auth_type == "code_required" && (
                                            <div className="form-group">
                                                <label htmlFor="verification-code">
                                                    Verification Code
                                                </label>
                                                <input
                                                    type="text"
                                                    id="verification-code"
                                                    name="code"
                                                    value={formData.code}
                                                    onChange={handleInputChange}
                                                    className={`form-input verification-input ${errors.code ? 'error' : ''}`}
                                                    placeholder="Enter verification code"
                                                    disabled={linkedinConnecting}
                                                />
                                                {errors.code && (
                                                    <span className="error-text">
                                                        {errors.code}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="jad-ac-form-actions">
                                        <button 
                                            type="button"
                                            className="btn btn-secondary" 
                                            onClick={handleVerificationCancel}
                                            disabled={linkedinConnecting}
                                        >
                                            {linkedinConnecting ? 'Disconnecting...' : 'Cancel & Disconnect'}
                                        </button>
                                        {linkedinStatus?.auth_type == "linkedin_app_approval" ? (
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary" 
                                                disabled={linkedinConnecting}
                                            >
                                                {linkedinConnecting ? 'Approving...' : 'Approved in LinkedIn'}
                                            </button>
                                        ) : (
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary" 
                                                disabled={linkedinConnecting}
                                            >
                                                {linkedinConnecting ? 'Verifying...' : 'Verify Code'}
                                            </button>
                                        )}
                                    </div>
                                </form>
                                </div>
                            )}
                        </div>
                    )}

                    {linkedinStatus && linkedinStatus.status == 2 && (
                        <div className="connected-section">
                            <div className="status-badge connected">
                                {accountsOnlyMode ? (
                                    <span className={`status-badge__handwriting`}>
                                        {HAPPY_SETUP_HANDWRITING.connected}
                                    </span>
                                ) : (
                                <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" fill="#10b981"/>
                                    <path d="M9 12L11 14L16 9" stroke="white" strokeWidth="2"/>
                                </svg>
                                Connected
                                </>
                                )}
                            </div>
                            
                            <div className="account-info">
                                <div className="info-row">
                                    <span className="info-label">Account:</span>
                                    <span className="info-value">{linkedinStatus?.email}</span>
                                </div>
                            </div>
                            
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={withOnboardingRedirect(() => openDisconnectModal('linkedin'), 'disconnect_linkedin')}
                                disabled={linkedinConnecting}
                            >
                                {accountsOnlyMode ? (
                                    <span className={`btn-danger__handwriting`}>
                                        {linkedinConnecting ? 'Disabling...' : 'Disable linkedin outreach'}
                                    </span>
                                ) : (
                                    linkedinConnecting ? 'Disabling...' : 'Disable linkedin outreach'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
        </div>
        <GmailPrivacyFallbackPopup
            open={gmailErrorPopup.open}
            onClose={() => setGmailErrorPopup({ open: false, message: '' })}
        />
    </div>

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
    )
}

export default AccountConnection;