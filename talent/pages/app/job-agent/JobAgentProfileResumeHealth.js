'use client';

import { ensureModalAppElement } from '../../../helpers/setModalAppElement';
ensureModalAppElement();

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Modal from 'react-modal';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from '@/talent/navigation/routerCompat';
import { useJobAgentDashboardContext } from './JobAgentDashboardContext';
import { EyeIconPreview } from '../../../assets/IconSVG';
import { OptionIcon, UploadIconCloud } from '../../../assets/IconSVG';
import { IMAGE_URL } from '../../../components/Constant';
import { checkIfFilePasswordProtected } from '../../../components/Helper';
import { resumeHealthCheckInitiatedTracking } from '../../../helpers/Mixpanel';
import {
    getOpenAiStatus,
    getTalentPreferences,
    submitResumeHealthCheck,
} from '../../../store/actions/UserActions';
import {
    SEED_TRANSFORMED_RESUME,
    SET_HEALTH_CHECK_SOCKET_LOADER,
    SET_RESUME_HEALTH_CONTROL,
    SET_RESUME_HEALTH_REPORTS,
    SET_RESUME_TRANSFORM,
    SET_TRANSFORMED_RESUME_MODAL_OPEN,
} from '../../../store/actions/actionsTypes';
import HealthCheckLoaderModal from '../resume/HealthCheckLoaderModal';
import HealthCheckPusher from '../resume/HealthCheckPusher';
import ResumeModal from '../preferences/ResumeModal';
import TransformLoader from '../resume/payment/TransformLoader';
import { getResumeHealthCheck, transformResumeForOutreach } from '../../../store/actions/resumeActions';
import JobAgentResumeHealthReport from './JobAgentResumeHealthReport';
import { getVerdict } from './resumeHealthVerdict';

if (typeof document !== 'undefined' && document.getElementById('happpy-root') || document.getElementById('app')) {
    ensureModalAppElement();
}

const POPUP_STORAGE_KEY = 'jad_resume_health_popup';
const LOG_PREFIX = '[AgentJ resume-health]';
const FILE_REGEX = /(\.pdf|\.docx)$/i;
const MAX_FILE_SIZE_KB = 2048;

const STEP = {
    LANDING: 'landing',
    LOADER: 'loader',
    REPORT: 'report',
};

/**
 * Active outreach plan check matches `JobAgentDashboardLayout.ReferralAgentPlanTopnav`:
 * any non-expired plan (free trial or paid) qualifies the user for the no-payment transform.
 */
function isOutreachPlanActive(referralPlan) {
    if (!referralPlan) return false;
    // if (referralPlan.has_plan_expired) return false;
    return referralPlan.plan != null;
}

function readPopupState() {
    if (typeof sessionStorage === 'undefined') return null;
    try {
        const raw = sessionStorage.getItem(POPUP_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch {
        return null;
    }
}

function writePopupState(value) {
    if (typeof sessionStorage === 'undefined') return;
    try {
        if (!value) {
            sessionStorage.removeItem(POPUP_STORAGE_KEY);
            return;
        }
        sessionStorage.setItem(POPUP_STORAGE_KEY, JSON.stringify(value));
    } catch {
        /* quota / private mode — silent */
    }
}

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
        {name}
    </span>
);

export default function JobAgentProfileResumeHealth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const outletContext = useJobAgentDashboardContext() || {};
    const referralPlan = outletContext.referralPlan || null;

    const { user } = useSelector((state) => state.auth);
    const {
        resumeHealthControl,
        resumeHealthReports,
        activeTransformation,
        healthCheckSocketLoader,
        bgResumeHealthCheckId,
    } = useSelector((state) => state.resume);

    /** Restore on mount so a refresh/tab-reopen lands the user at the right step. */
    const initialPopup = readPopupState();
    const [popupOpen, setPopupOpen] = useState(!!initialPopup?.open);
    const [currentHealthCheckId, setCurrentHealthCheckId] = useState(
        initialPopup?.healthCheckId || null
    );
    /**
     * Explicit user intent for the current popup session:
     *   - 'auto'   → step is derived purely from data (default; allows TRANSFORMED celebration)
     *   - 'report' → user clicked "View last resume health report" — force REPORT step,
     *                even when the underlying transformation is already complete.
     */
    const [viewIntent, setViewIntent] = useState(initialPopup?.viewIntent || 'auto');

    /** Local LANDING state — mirrors ResumePilotOdd's form. */
    const initialResumeName = user?.resume;
    const [formData, setFormData] = useState({ resume: initialResumeName || '' });
    const [resumeFile, setResumeFile] = useState(null);
    const [resumeError, setResumeError] = useState('');
    const [isKebabOpen, setIsKebabOpen] = useState(false);
    const [healthCheckSubmitting, setHealthCheckSubmitting] = useState(false);
    const kebabRef = useRef(null);

    /** Resume preview reuses the global ResumeModal. */
    const [isResumePreviewOpen, setIsResumePreviewOpen] = useState(false);
    const [uploadedResumePreview, setUploadedResumePreview] = useState(null);
    const [resumeHealthFetched, setResumeHealthFetched] = useState(false);

    /** Transform-side state — only used while the stubbed call is pending. */
    const [transformPending, setTransformPending] = useState(false);

    useEffect(() => {
        if (initialResumeName) {
            setFormData((prev) => (prev.resume === initialResumeName ? prev : { resume: initialResumeName }));
        }
    }, [initialResumeName]);

    /**
     * On mount, fetch the latest resume health-check control payload and
     * seed it into Redux so the card (score / verdict / attempts / eligibility)
     * reflects the user's current state without waiting for any user action.
     */
    useEffect(() => {
        getResumeHealthCheck()(dispatch)
            .then((res) => {
                const payload = res?.data?.data;
                if (payload) {
                    setResumeHealthFetched(true)
                }
            })
            .catch(() => {
                /* silent — card falls back to the empty/landing state */
            })
    }, [dispatch]);

    /**
     * The Pusher socket is bound to a session-stored health-check id so it survives
     * close+reopen of the popup. Whenever the socket fires `health_check_completed`,
     * `HealthCheckPusher` already dispatches `SET_RESUME_HEALTH_REPORTS` + clears the
     * `healthCheckSocketLoader` flag, so the derived step transitions automatically.
     *
     * We track the active socket id locally so we can surface it as `currentHealthCheckId`
     * even before the user opens the popup again.
     */
    useEffect(() => {
        if (healthCheckSocketLoader && healthCheckSocketLoader !== currentHealthCheckId) {
            setCurrentHealthCheckId(healthCheckSocketLoader);
        }
    }, [healthCheckSocketLoader]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Single source of truth for which step is rendered inside the popup.
     *
     * `<JobAgentResumeHealthReport>` handles every flavour of the REPORT
     * step internally — including the "transformed" success state (which
     * just adds a banner + "View transformed resume" CTA above the score
     * and pointer lists) and the still-loading state (renders a loading
     * sub-state until its own fetch hydrates Redux).
     */
    const step = useMemo(() => {
        if (healthCheckSocketLoader) return STEP.LOADER;
        if (currentHealthCheckId) return STEP.REPORT;
        return STEP.LANDING;
    }, [healthCheckSocketLoader, currentHealthCheckId]);

    /**
     * Mid-transformation flag — drives the loader overlay rendered on top of the
     * REPORT step so users keep the score and full report visible behind the
     * loader instead of swapping to a blank loading screen.
     */
    const isTransforming = !!currentHealthCheckId && (
        !!activeTransformation[currentHealthCheckId] || transformPending
    );

    /** Persist open + id + intent only; never persist the derived step (Redux drives it). */
    useEffect(() => {
        if (popupOpen) {
            writePopupState({ open: true, healthCheckId: currentHealthCheckId, viewIntent });
        } else if (initialPopup) {
            writePopupState({
                ...initialPopup,
                open: false,
                healthCheckId: currentHealthCheckId,
                viewIntent,
            });
        }
    }, [popupOpen, currentHealthCheckId, viewIntent]); // eslint-disable-line react-hooks/exhaustive-deps

    const closeKebab = useCallback(() => setIsKebabOpen(false), []);
    useEffect(() => {
        if (!isKebabOpen) return;
        const onClickOutside = (e) => {
            if (kebabRef.current && !kebabRef.current.contains(e.target)) {
                closeKebab();
            }
        };
        document.addEventListener('click', onClickOutside);
        return () => document.removeEventListener('click', onClickOutside);
    }, [isKebabOpen, closeKebab]);

    /* -----------------------------------------------------------
       Card-level data
    ----------------------------------------------------------- */

    const score = resumeHealthControl?.health_check?.resume_score || 0;
    const hasScore = typeof score === 'number' && resumeHealthControl?.health_check?.status == 3;

    // TODO: is eligible check is disabled for now
    // const isEligible = !!resumeHealthControl?.is_eligible;
    const isEligible = true;
    const isPaid = !!resumeHealthControl?.is_paid;
    const userAttempts = resumeHealthControl?.user_attempts ?? 0;
    const totalAttempts = resumeHealthControl?.total_attempts ?? 0;
    const hasReachedLimit = totalAttempts > 0 && userAttempts >= totalAttempts;
    const verdict = useMemo(() => (hasScore ? getVerdict(score) : null), [hasScore, score]);
    const reportFileId = resumeHealthControl?.health_check?.file_id || null;

    /* -----------------------------------------------------------
       CTAs
    ----------------------------------------------------------- */

    const openPopupAt = useCallback((targetStep) => {
        if (targetStep === STEP.REPORT) {
            if (!reportFileId) return;
            setCurrentHealthCheckId(reportFileId);
            // Force the popup onto the REPORT step regardless of whether the
            // underlying resume has already been transformed.
            setViewIntent('report');
        } else if (targetStep === STEP.LANDING) {
            // Run-new-check: only clear when no in-flight check; keep the socket id if one exists.
            if (!healthCheckSocketLoader) {
                setCurrentHealthCheckId(null);
            }
            setViewIntent('auto');
        }
        setPopupOpen(true);
    }, [reportFileId, healthCheckSocketLoader]);

    const closePopup = useCallback(() => {
        setPopupOpen(false);
        setIsKebabOpen(false);
    }, []);

    /* -----------------------------------------------------------
       LANDING — submit health check
    ----------------------------------------------------------- */

    const onPickReplacement = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            await checkIfFilePasswordProtected(file);
        } catch (err) {
            toast.error(err?.message || 'File is password-protected. Please upload an unprotected file.', { duration: 4000 });
            e.target.value = '';
            return;
        }
        let errorMsg = null;
        if (!FILE_REGEX.test(file.name)) {
            errorMsg = 'The resume must be a file of type: pdf, docx.';
        } else if (file.size / 1024 > MAX_FILE_SIZE_KB) {
            errorMsg = 'File size should be less than 2 MB';
        }
        if (errorMsg) {
            toast.error(errorMsg, { duration: 4000 });
            setResumeError(errorMsg);
            return;
        }
        setResumeError('');
        setResumeFile(file);
        setFormData({ resume: file.name });
        setIsKebabOpen(false);
    };

    const onPreviewResume = () => {
        if (resumeFile) return; // can't preview a freshly picked local file
        if (uploadedResumePreview) {
            setIsResumePreviewOpen(true);
            return;
        }
        getTalentPreferences()(dispatch).then((res) => {
            setUploadedResumePreview(res?.data?.resume || null);
            setIsResumePreviewOpen(true);
        });
    };

    const onPreviewDownloadStub = (e) => {
        // Preview-only context; download isn't exposed here. Keep ResumeModal happy.
        e?.preventDefault?.();
        e?.stopPropagation?.();
    };

    const onSubmitHealthCheck = async () => {
        resumeHealthCheckInitiatedTracking(formData.resume);
        const openAiStatus = await getOpenAiStatus()(dispatch);
        if (!openAiStatus?.requiredFunctionOnline) {
            toast.error('Our AI server is down. Please try again later.', { duration: 5000 });
            return;
        }
        let payload;
        if (resumeFile) {
            payload = new FormData();
            payload.append('file', resumeFile);
        } else {
            payload = {
                resume: true,
            }
        }
        setHealthCheckSubmitting(true);
        submitResumeHealthCheck(payload)(dispatch)
            .then((res) => {
                const today = new Date().toISOString().split('T')[0];
                try {
                    sessionStorage.setItem('r_c_date', today);
                } catch {
                    /* ignore */
                }
                const newId = res?.data?.health_check_id || null;
                if (!newId) {
                    toast.error('Could not start a resume health check. Please try again.', { duration: 5000 });
                    return;
                }
                if (res.data.health_check_done) {
                    if (res.data.data) {
                        dispatch({
                            type: SET_RESUME_HEALTH_REPORTS,
                            payload: { [newId]: res.data.data },
                        });
                    }
                    setCurrentHealthCheckId(newId);
                } else {
                    dispatch({ type: SET_HEALTH_CHECK_SOCKET_LOADER, payload: newId });
                    setCurrentHealthCheckId(newId);
                }
            })
            .catch((err) => {
                toast.error(err?.response?.data?.message || 'Something went wrong', { duration: 5000 });
            })
            .finally(() => {
                setHealthCheckSubmitting(false);
            });
    };

    /* -----------------------------------------------------------
       REPORT — handle Transform CTA
    ----------------------------------------------------------- */

    const handleTransformSubmit = async (/* cta_of_section = '' */) => {
        const openAiStatus = await getOpenAiStatus()(dispatch);
        if (!openAiStatus?.requiredFunctionOnline) {
            toast.error('Our AI server is down. Please try again later.', { duration: 5000 });
            return;
        }
        if (!isOutreachPlanActive(referralPlan) || referralPlan.has_plan_expired) {
            toast.error('Your do not have an active plan. Redirecting to subscription page.', { duration: 5000 });
            setTimeout(() => {
                navigate('/talent/job-agent/subscription');
            }, 2000);
            return;
        }

        // If user already has an active outreach plan (free trial or paid), skip Razorpay.
        if (isOutreachPlanActive(referralPlan)) {
            if (!currentHealthCheckId) {
                toast.error('No health check selected. Please re-run the health check.', { duration: 5000 });
                return;
            }
            setTransformPending(true);
            try {
                const res = await transformResumeForOutreach({ id: currentHealthCheckId })(dispatch);
                if (res?.status === 200) {
                    const transformation_id = res?.data?.data?.transformation_id;
                    dispatch({
                        type: SEED_TRANSFORMED_RESUME,
                        payload: {
                            transformation_id,
                            tailor_json: res?.data?.data?.transform_json,
                            config_json: res?.data?.data?.config_json,
                            sorting_json: res?.data?.data?.sorting_json,
                        },
                    });
                    dispatch({
                        type: SET_RESUME_TRANSFORM,
                        payload: {
                            status: 3,
                            version: 2,
                            id: transformation_id,
                            file_id: transformation_id,
                            health_check_id: currentHealthCheckId,
                        },
                    });
                    dispatch({
                        type: SET_TRANSFORMED_RESUME_MODAL_OPEN,
                        payload: { transformation_id },
                    });
                } else {
                    toast.error(
                        res?.data?.message || res?.message || 'Could not start resume transformation.',
                        { duration: 5000 }
                    );
                }
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || 'Could not start resume transformation.',
                    { duration: 5000 }
                );
            } finally {
                setTransformPending(false);
            }
            return;
        }

        // No active plan — fall back to the existing paid flow (leaves the dashboard).
        closePopup();
        navigate(`/talent/resume-health-check/${currentHealthCheckId}/payment`, {
            state: { from: 'job-agent-dashboard' },
        });
    };

    /* -----------------------------------------------------------
       TRANSFORMED — open existing global modal
    ----------------------------------------------------------- */

    const onViewTransformedResume = useCallback(() => {
        const report = currentHealthCheckId ? resumeHealthReports[currentHealthCheckId] : null;
        const transformationId = report?.transform?.id || report?.transform?.file_id || null;
        if (!transformationId) {
            toast.error('Transformed resume is still being prepared.', { duration: 4000 });
            return;
        }
        dispatch({
            type: SET_TRANSFORMED_RESUME_MODAL_OPEN,
            payload: { transformation_id: transformationId },
        });
    }, [currentHealthCheckId, resumeHealthReports, dispatch]);

    /* -----------------------------------------------------------
       Render
    ----------------------------------------------------------- */

    const ext = (formData.resume || '').split('.').pop()?.toLowerCase();

    // Hide the entire section if the user doesn't have an active (non-expired)
    // outreach plan — resume health is only surfaced for active plan holders.
    const outreachPlanActive = isOutreachPlanActive(referralPlan);

    return (
        <>
            {outreachPlanActive && resumeHealthFetched &&
                <section className="jad-resume-health" aria-label="Resume health">
                    {/* HealthCheckPusher lives at section level so the socket keeps running
                regardless of whether the popup is open. */}
                    {healthCheckSocketLoader && (
                        <HealthCheckPusher healthCheckId={healthCheckSocketLoader} />
                    )}

                    {hasScore ? (
                        <div className={`jad-resume-health__card jad-resume-health__card--score jad-resume-health__card--${verdict.tone}`}>
                            {resumeHealthControl?.current_profile_cv_healthchecked || user.is_uplers_cv ?
                                <div className="jad-resume-health__score-wrap">
                                    <div className={`jad-resume-health__score-ring jad-resume-health__score-ring--${verdict.tone}`} aria-hidden>
                                        <span className="jad-resume-health__score-num">{score}</span>
                                        <span className="jad-resume-health__score-suffix">/100</span>
                                    </div>
                                    <div className="jad-resume-health__score-meta">
                                        <span className="jad-resume-health__label jad-font-label">{resumeHealthControl?.current_profile_cv_healthchecked ? 'Profile resume' : 'Your resume'}</span>
                                        <h2 className={`jad-resume-health__verdict jad-resume-health__verdict--${verdict.tone} jad-font-headline`}>
                                            {verdict.label}
                                        </h2>
                                        {!resumeHealthControl?.current_profile_cv_healthchecked &&
                                            <p className="jad-resume-health__filename jad-font-body" title={resumeHealthControl?.health_check?.file_name}>
                                                {resumeHealthControl?.health_check?.file_name || 'Your resume'}
                                            </p>
                                        }
                                    </div>
                                </div> :
                                <div className="jad-resume-health__score-wrap">
                                    <RESUME_HEALTH_REPORT />
                                    <div className="jad-resume-health__score-meta">
                                        <span className="jad-resume-health__label jad-font-label">Profile resume</span>
                                        <h2 className="jad-resume-health__verdict jad-font-headline">
                                            It seems you have updated your profile resume
                                        </h2>
                                        <p className="jad-resume-health__message jad-font-body">
                                            Run health check again to see how your latest resume scores.
                                        </p>
                                    </div>
                                </div>
                            }
                            <div className="jad-resume-health__actions">
                                {(resumeHealthControl?.current_profile_cv_healthchecked || user.is_uplers_cv) &&
                                    <button
                                        type="button"
                                        className="jad-resume-health__cta jad-resume-health__cta--primary jad-font-headline"
                                        onClick={() => openPopupAt(STEP.REPORT)}
                                        disabled={!isEligible}
                                    >
                                        <MatIcon name="task_alt" aria-hidden />
                                        <span>View resume health report</span>
                                    </button>
                                }
                                {resumeHealthControl?.transform?.id && resumeHealthControl?.transform?.status === 3 &&
                                    <button
                                        type="button"
                                        className="jad-resume-health__cta jad-resume-health__cta--ghost jad-font-headline"
                                        onClick={onViewTransformedResume}
                                    >
                                        <MatIcon name="visibility" aria-hidden />
                                        <span>View transformed resume</span>
                                    </button>
                                }
                                {!resumeHealthControl?.current_profile_cv_healthchecked && !user.is_uplers_cv &&
                                    <>
                                        <button
                                            type="button"
                                            className="jad-resume-health__cta jad-resume-health__cta--ghost jad-font-headline"
                                            onClick={() => openPopupAt(STEP.LANDING)}
                                            disabled={!isEligible}
                                        >
                                            <MatIcon name="refresh" aria-hidden />
                                            <span>Run health check again</span>
                                        </button>
                                        {hasReachedLimit && (
                                            <p className="jad-resume-health__limit jad-font-body">
                                                You&apos;ve used all {totalAttempts} health checks this month.
                                            </p>
                                        )}
                                    </>
                                }
                            </div>
                        </div>
                    ) : (
                        <>
                            {bgResumeHealthCheckId ?
                                <div
                                    className="jad-resume-health__card jad-resume-health__card--score jad-resume-health__card--skeleton"
                                    aria-busy="true"
                                    aria-live="polite"
                                >
                                    <div className="jad-resume-health__score-wrap">
                                        <span className="jad-skel jad-skel--health-illustration" aria-hidden="true" />
                                        <div className="jad-resume-health__score-meta">
                                            <span className="jad-skel jad-skel--health-label" aria-hidden="true" />
                                            <span className="jad-skel jad-skel--health-verdict" aria-hidden="true" />
                                            <span className="jad-skel jad-skel--health-message" aria-hidden="true" />
                                            <span className="jad-skel jad-skel--health-message jad-skel--health-message--short" aria-hidden="true" />
                                        </div>
                                    </div>
                                    <div className="jad-resume-health__actions">
                                        <span className="jad-skel jad-skel--health-cta" aria-hidden="true" />
                                    </div>
                                    <span className="sr-only">Running health check on your profile resume…</span>
                                </div>
                                :
                                <div className="jad-resume-health__card jad-resume-health__card--score">
                                    <div className="jad-resume-health__score-wrap">
                                        <RESUME_HEALTH_REPORT />
                                        <div className="jad-resume-health__score-meta">
                                            <span className="jad-resume-health__label jad-font-label">Profile resume</span>
                                            <h2 className="jad-resume-health__verdict jad-font-headline">
                                                Run health check on your profile resume
                                            </h2>
                                            <p className="jad-resume-health__message jad-font-body">
                                                Get a free AI review — ATS readiness, structure, and recruiter signal — in under a minute.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="jad-resume-health__actions">
                                        <button
                                            type="button"
                                            className="jad-resume-health__cta jad-resume-health__cta--primary jad-font-headline"
                                            onClick={() => openPopupAt(STEP.LANDING)}
                                            disabled={!isEligible}
                                        >
                                            <MatIcon name="bolt" aria-hidden />
                                            <span>Run health check</span>
                                        </button>
                                    </div>
                                </div>
                            }
                        </>
                    )}

                    <Modal
                        isOpen={popupOpen}
                        onRequestClose={closePopup}
                        portalClassName="jad-resume-health-modal-portal"
                        overlayClassName="jad-resume-health-modal-overlay"
                        className="jad-resume-health-modal"
                        bodyOpenClassName="jad-resume-health-modal-open"
                        shouldCloseOnEsc
                        shouldCloseOnOverlayClick
                        closeTimeoutMS={260}
                        contentLabel="Resume health check"
                        aria-modal="true"
                        role="dialog"
                    >
                        <div className="jad-resume-health-modal__shell">
                            <button
                                type="button"
                                className="jad-resume-health-modal__close"
                                aria-label="Close resume health"
                                onClick={closePopup}
                                disabled={isTransforming && step === STEP.REPORT}
                                style={isTransforming && step === STEP.REPORT ? { cursor: 'not-allowed' } : {}}
                            >
                                <MatIcon name="close" aria-hidden />
                            </button>

                            <div className="jad-resume-health-modal__body">
                                {step === STEP.LANDING && (
                                    <LandingStep
                                        formData={formData}
                                        resumeError={resumeError}
                                        resumeFile={resumeFile}
                                        ext={ext}
                                        isKebabOpen={isKebabOpen}
                                        kebabRef={kebabRef}
                                        onToggleKebab={(e) => {
                                            e.stopPropagation();
                                            setIsKebabOpen((v) => !v);
                                        }}
                                        onPickReplacement={onPickReplacement}
                                        onPreviewResume={onPreviewResume}
                                        onSubmit={onSubmitHealthCheck}
                                        submitting={healthCheckSubmitting}
                                        isEligible={isEligible}
                                        isPaid={isPaid}
                                        hasScore={hasScore}
                                        hasReachedLimit={hasReachedLimit}
                                        userAttempts={userAttempts}
                                        totalAttempts={totalAttempts}
                                    />
                                )}

                                {step === STEP.LOADER && (
                                    <LoaderStep />
                                )}

                                {step === STEP.REPORT && (
                                    <JobAgentResumeHealthReport
                                        healthCheckId={currentHealthCheckId}
                                        onTransformSubmit={handleTransformSubmit}
                                        onViewTransformedResume={onViewTransformedResume}
                                        onClose={closePopup}
                                        referralPlanActive={outreachPlanActive}
                                    />
                                )}
                            </div>

                            {isTransforming && step === STEP.REPORT && (
                                <div
                                    className="jad-resume-health-modal__transforming"
                                    role="status"
                                    aria-live="polite"
                                    aria-busy="true"
                                >
                                    <div className="jad-resume-health-modal__transforming-inner">
                                        <TransformLoader />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Modal>

                    {/* The LoaderStep above is a static section. The actual animated loader is the modal
                that drives the LOADER step; we render it overlaying the popup so closing the popup
                still leaves the Pusher subscription intact (it lives at section level). */}
                    <HealthCheckLoaderModal isOpen={popupOpen && step === STEP.LOADER} />

                    {isResumePreviewOpen && (
                        <ResumeModal
                            isOpen={isResumePreviewOpen}
                            setOpen={setIsResumePreviewOpen}
                            data={uploadedResumePreview}
                            onDownloadClick={onPreviewDownloadStub}
                            showDownloadOption={false}
                        />
                    )}
                </section>
            }
        </>
    );
}

/* =================================================================================
 * Steps
 * =============================================================================== */

/**
 * Landing step — mirrors `ResumePilotOdd`'s DOM (and therefore its existing
 * `.containSection.resumeHealthCheck .main.pilot` styles) verbatim. Page-context
 * layout assumptions (`width: 100vw`, full-page background, negative margins)
 * are neutralised by scoped overrides in JobAgentDashboard.css.
 */
function LandingStep({
    hasScore,
    formData,
    resumeError,
    resumeFile,
    ext,
    isKebabOpen,
    kebabRef,
    onToggleKebab,
    onPickReplacement,
    onPreviewResume,
    onSubmit,
    submitting,
    isEligible,
    isPaid,
    hasReachedLimit,
    userAttempts,
    totalAttempts,
}) {
    return (
        <div className="containSection resume resumeHealthCheck" id="jadResumeHealthCheckPilot">
            <div className="main pilot">
                {/* {isPaid && (
                    <div className="improved-resumes-banner">
                        <text>✅&nbsp;&nbsp;You have already improved your resume before.</text>&nbsp;
                        <Link to="/talent/resume-health-check">Check it here</Link>
                    </div>
                )} */}
                <div className="header">
                    <h2>
                        {hasScore
                            ? 'Run a fresh health check on your profile resume'
                            : 'Run a health check on your profile resume'
                        }
                    </h2>
                    <strong>Your resume dies in 3 places:</strong>
                    <text>
                        ATS parsing &amp; filters (6 seconds), recruiter screening (10 seconds),
                        and hiring manager review (2 minutes)
                    </text>
                </div>

                <div className="resume-actions">
                    <h6>Get Ready to turn your resume into an interview magnet</h6>
                    <div className="resume-options">
                        <div className={`resume-flex ${resumeError ? 'err' : ''}`}>
                            {ext === 'pdf' ? (
                                <img src={IMAGE_URL + 'file-pdf.svg'} alt="" />
                            ) : ext === 'docx' ? (
                                <img src={IMAGE_URL + 'file-docx.svg'} alt="" />
                            ) : (
                                <img src={IMAGE_URL + 'fi_file.svg'} alt="" />
                            )}
                            <div>
                                <span
                                    className={`title ${resumeFile ? 'disabled' : ''}`}
                                    onClick={onPreviewResume}
                                >
                                    {formData.resume}
                                </span>
                            </div>
                        </div>
                        <div className="kebab-menu" ref={kebabRef}>
                            <button className="iconBtn" onClick={onToggleKebab}>
                                <OptionIcon />
                            </button>
                            {isKebabOpen && (
                                <div className="secondary-actions">
                                    {/* <div className="resume-btn">
                                        <div className="outlinedBtn filewrap">
                                            <input
                                                id="jadResumeReplace"
                                                name="resume"
                                                type="file"
                                                accept=".docx,.pdf"
                                                onChange={onPickReplacement}
                                            />
                                            <label htmlFor="jadResumeReplace">
                                                <UploadIconCloud />
                                                Upload New Resume
                                            </label>
                                        </div>
                                    </div> */}
                                    {!resumeFile && (
                                        <button className="ghost-btn" onClick={onPreviewResume}>
                                            <EyeIconPreview width={18} height={18} />
                                            Preview this resume
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {resumeError && <div className="error-msg">{resumeError}</div>}
                    </div>
                    <div className="mainAction">
                        {isEligible && (
                            <button
                                className="primaryBtn"
                                onClick={onSubmit}
                                disabled={submitting || hasReachedLimit || !formData.resume}
                            >
                                {submitting ? 'Starting…' : 'Review My Resume FOR FREE!'}
                            </button>
                        )}
                    </div>
                </div>

                {hasReachedLimit && (
                    <>
                        <div className="limit-health-check">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#jadClipLimit)">
                                    <path d="M7.9987 14.6663C11.6806 14.6663 14.6654 11.6816 14.6654 7.99967C14.6654 4.31778 11.6806 1.33301 7.9987 1.33301C4.3168 1.33301 1.33203 4.31778 1.33203 7.99967C1.33203 11.6816 4.3168 14.6663 7.9987 14.6663Z" stroke="#AE4427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 10.6667V8" stroke="#AE4427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 5.33301H8.00667" stroke="#AE4427" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs>
                                    <clipPath id="jadClipLimit">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            You have already submitted allowed resume health checks ({userAttempts}/{totalAttempts}) for this month.
                        </div>
                        <Link to="/talent/resume-health-check" className="outlinedBtn for-limit">
                            View My Resume Health Reports &amp; Transformations
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Placeholder content rendered under the animated `HealthCheckLoaderModal`. Keeps the
 * popup body non-empty in the brief moment before the loader modal animates in.
 */
function LoaderStep() {
    return (
        <div className="jad-resume-health-modal__landing">
            <header className="jad-resume-health-modal__heading">
                <h2 className="jad-font-headline">Analyzing your resume…</h2>
                <p className="jad-font-body">
                    This usually takes about a minute. You can close this window — we&apos;ll keep your
                    spot and surface the report the moment it&apos;s ready.
                </p>
            </header>
        </div>
    );
}

const RESUME_HEALTH_REPORT = () => (
    <svg width="179" height="171" viewBox="0 0 179 171" fill="none" xmlns="http://www.w3.org/2000/svg" className='illustration'>
        <ellipse cx="103.805" cy="75.1795" rx="75.195" ry="75.1795" fill="#D9F7FF" />
        <path d="M120.57 79.8728C120.239 79.8728 120.239 80.4887 120.57 80.4887C121.36 80.4887 132.36 80.3071 133.284 80.1255C133.368 80.1128 133.445 80.0704 133.501 80.0059C133.556 79.9415 133.587 79.8592 133.587 79.7741C133.587 79.6891 133.556 79.6068 133.501 79.5423C133.445 79.4779 133.368 79.4355 133.284 79.4228C130.386 79.0438 123.761 79.8097 120.57 79.8728ZM124.977 95.995C124.613 95.995 124.677 96.603 125.024 96.6188C127.599 96.7056 131.61 96.5714 134.24 96.453C134.722 96.453 134.777 95.6634 134.24 95.6634C131.294 95.6792 127.93 95.7187 124.977 95.995ZM125.316 68.7642C125.24 68.7675 125.167 68.7984 125.112 68.8514C125.056 68.9043 125.022 68.9755 125.015 69.0518C125.009 69.1281 125.03 69.2042 125.075 69.2661C125.12 69.3279 125.186 69.3712 125.261 69.3879C126.675 69.5616 131.263 69.7432 132.645 69.1589C132.715 69.1239 132.773 69.0667 132.808 68.9962C132.843 68.9256 132.855 68.8454 132.841 68.7678C132.826 68.6902 132.787 68.6194 132.729 68.566C132.671 68.5126 132.597 68.4796 132.518 68.472C130.686 68.3615 127.749 68.9457 125.316 68.7642ZM116.298 84.0179C122.963 83.9231 130.512 83.4573 137.241 82.8415C137.659 82.8415 137.62 82.0519 137.185 82.0519C130.568 82.2177 122.837 82.652 116.259 83.331C116.167 83.3362 116.082 83.3774 116.021 83.4455C115.961 83.5136 115.93 83.6031 115.935 83.6942C115.94 83.7852 115.981 83.8705 116.049 83.9312C116.117 83.9919 116.207 84.0231 116.298 84.0179ZM125.853 48.8522C127.709 48.7101 129.565 48.5996 131.381 48.3785C131.902 48.3232 131.768 47.589 131.255 47.589C129.407 47.7311 127.559 47.9679 125.727 48.1811C125.301 48.2285 125.419 48.8838 125.853 48.8522ZM115.019 65.3218C114.624 65.3218 114.608 65.9929 115.019 66.0245C119.483 66.2324 123.957 65.9197 128.349 65.0928C128.846 65.006 128.767 64.2165 128.262 64.3033C123.888 65.049 119.455 65.39 115.019 65.3218ZM129.715 52.6341C130.402 52.7999 130.505 51.6787 129.873 51.7893C126.791 52.2888 123.667 52.4819 120.547 52.3656C120.128 52.3656 120.033 52.9736 120.46 53.0209C123.548 53.3308 126.664 53.2006 129.715 52.6341ZM112.61 83.6468C111.994 83.4099 109.151 83.8047 108.354 83.8915C107.967 83.8915 107.951 84.5153 108.354 84.5074L111.584 84.4047C113.076 84.3495 113.068 83.8284 112.61 83.6468ZM115.872 117.81C115.208 117.652 110.494 118.007 109.72 118.055C109.309 118.055 109.388 118.686 109.799 118.678C110.636 118.678 115.224 118.678 115.951 118.449C116.274 118.339 116.164 117.873 115.872 117.81ZM109.712 114.47C111.931 114.573 117.427 114.667 119.646 114.138C119.698 114.138 119.749 114.127 119.797 114.105C119.844 114.084 119.886 114.053 119.921 114.014C119.955 113.976 119.981 113.93 119.997 113.881C120.013 113.831 120.018 113.779 120.012 113.728C120.007 113.676 119.991 113.626 119.965 113.581C119.939 113.537 119.904 113.498 119.862 113.467C119.82 113.437 119.772 113.415 119.721 113.405C119.671 113.394 119.618 113.394 119.567 113.404C116.322 113.404 113.313 113.949 109.807 113.807C109.388 113.791 109.278 114.446 109.712 114.47ZM117.372 100.432C117.846 100.345 117.806 99.6427 117.309 99.6427C113.803 99.998 113.068 100.085 109.475 100.227C109.128 100.227 109.088 100.827 109.475 100.851C112.115 101.026 114.766 100.885 117.372 100.432ZM122.237 95.4661C117.941 95.624 113.479 96.3503 108.993 96.5082C108.913 96.5206 108.84 96.5612 108.787 96.6227C108.734 96.6843 108.705 96.7627 108.705 96.8438C108.705 96.9249 108.734 97.0033 108.787 97.0648C108.84 97.1264 108.913 97.167 108.993 97.1793C112.713 97.1793 118.699 97.0056 122.323 96.2003C122.399 96.1668 122.462 96.11 122.503 96.0382C122.544 95.9663 122.561 95.8832 122.551 95.8011C122.541 95.719 122.505 95.6422 122.449 95.5819C122.392 95.5216 122.318 95.481 122.237 95.4661ZM136.87 115.875C136.806 115.875 132.471 116.231 131.729 116.207C131.658 116.22 131.594 116.255 131.545 116.307C131.496 116.359 131.466 116.425 131.458 116.496C131.45 116.567 131.465 116.639 131.501 116.701C131.537 116.762 131.592 116.811 131.658 116.839C132.542 117.004 136.269 117.068 137.035 116.42C137.074 116.378 137.101 116.326 137.113 116.27C137.126 116.214 137.124 116.156 137.107 116.101C137.09 116.046 137.06 115.996 137.018 115.957C136.976 115.917 136.925 115.889 136.87 115.875ZM138.267 98.6558C132.795 99.011 126.682 99.2163 121.234 99.6821C120.807 99.6821 120.886 100.322 121.297 100.345C124.242 100.432 134.722 99.8953 138.338 99.4374C138.39 99.4334 138.44 99.4192 138.486 99.3955C138.532 99.3718 138.573 99.3391 138.606 99.2993C138.639 99.2596 138.664 99.2136 138.679 99.164C138.694 99.1145 138.699 99.0625 138.694 99.011C138.684 98.9076 138.633 98.8123 138.553 98.7458C138.474 98.6793 138.371 98.647 138.267 98.6558ZM117.712 80.7018C117.816 80.7018 117.917 80.6602 117.991 80.5862C118.065 80.5122 118.106 80.4118 118.106 80.3071C118.106 80.2024 118.065 80.102 117.991 80.0279C117.917 79.9539 117.816 79.9123 117.712 79.9123C114.308 79.9992 110.873 80.0228 107.446 80.2834C107.372 80.2998 107.306 80.3408 107.259 80.3996C107.212 80.4585 107.186 80.5317 107.186 80.6071C107.186 80.6825 107.212 80.7557 107.259 80.8146C107.306 80.8734 107.372 80.9144 107.446 80.9308C110.889 80.994 114.308 80.8124 117.712 80.7018ZM131.176 112.575C129.976 112.575 125.648 112.883 124.621 113.065C124.29 113.12 124.242 113.665 124.621 113.681C125.735 113.736 130.039 113.459 131.286 113.349C131.768 113.365 131.665 112.575 131.176 112.575ZM128.87 117.004L118.943 117.636C118.493 117.636 118.604 118.323 119.046 118.299C120.973 118.212 127.172 117.968 128.909 117.731C129.296 117.683 129.304 117.004 128.87 117.004ZM121.763 48.3785C118.849 48.0469 109.704 48.5996 106.601 48.9154C106.174 48.9548 106.143 49.618 106.601 49.5786C111.702 49.247 116.669 49.1364 121.771 49.1522C121.86 49.1332 121.939 49.084 121.996 49.0129C122.053 48.9418 122.084 48.8532 122.083 48.7621C122.082 48.6711 122.05 48.5831 121.991 48.5132C121.933 48.4433 121.852 48.3957 121.763 48.3785ZM122.608 69.6879C123.105 69.6168 122.924 68.8984 122.426 68.8984C117.343 69.4773 112.229 69.741 107.114 69.6879C107.04 69.6997 106.972 69.7376 106.923 69.7948C106.875 69.852 106.848 69.9246 106.848 69.9998C106.848 70.0749 106.875 70.1476 106.923 70.2047C106.972 70.2619 107.04 70.2998 107.114 70.3116C112.287 70.5607 117.472 70.352 122.608 69.6879ZM117.246 53.1551C117.298 53.1502 117.348 53.135 117.394 53.1105C117.44 53.0859 117.481 53.0525 117.514 53.0121C117.547 52.9717 117.572 52.9252 117.587 52.8752C117.602 52.8252 117.606 52.7728 117.601 52.7209C117.596 52.669 117.581 52.6185 117.556 52.5725C117.532 52.5264 117.498 52.4857 117.458 52.4527C117.418 52.4196 117.371 52.3949 117.321 52.38C117.271 52.365 117.219 52.3602 117.167 52.3656C113.684 52.7999 110.383 52.8156 106.948 53.1157C106.585 53.1551 106.545 53.7473 106.948 53.7631C110.391 53.8187 113.833 53.6155 117.246 53.1551ZM107.461 65.6534C107.067 65.6534 107.059 66.2771 107.509 66.2929C108.926 66.4264 110.351 66.4633 111.773 66.4035C111.837 66.3748 111.892 66.3283 111.93 66.2695C111.968 66.2106 111.988 66.142 111.988 66.0719C111.988 66.0017 111.968 65.9331 111.93 65.8742C111.892 65.8154 111.837 65.7689 111.773 65.7402C111.631 65.6613 108.188 65.6534 107.461 65.6534ZM97.606 70.2011C98.064 70.2011 99.7618 67.3904 100.717 66.4271C101.065 66.0797 100.496 65.4955 100.141 65.8271C99.1335 66.7351 98.2612 67.7827 97.5507 68.9378L95.5528 67.0982C95.1421 66.7193 94.6131 67.3667 94.9921 67.7536C95.3712 68.1404 97.0216 70.2011 97.606 70.2011ZM92.2045 57.3081C95.4422 57.4976 98.8063 57.4344 102.36 57.4581C102.613 57.4581 102.763 56.7554 102.36 48.3706C102.36 47.7627 102.305 47.3126 102.297 47.1468C102.299 47.1224 102.296 47.0978 102.287 47.0746C102.279 47.0515 102.266 47.0304 102.249 47.0126C102.02 46.7678 100.528 46.7836 97.1717 46.8705C91.5254 47.0047 90.9015 46.9652 90.9015 47.2889C90.8778 47.3521 91.2332 57.2133 92.2045 57.3081ZM92.4256 56.7238C92.0308 54.6158 91.7465 50.1628 91.5017 47.6679C93.7997 47.8021 99.0353 47.5416 101.673 47.4784C101.673 47.4784 101.815 54.4973 101.878 56.7633C98.7826 56.6922 95.5528 56.5738 92.394 56.6843L92.4256 56.7238Z" fill="black" />
        <path d="M103.451 72.2621C104.114 72.0016 103.34 64.6432 103.23 62.7088C103.224 62.669 103.205 62.6326 103.175 62.6062C102.701 62.1956 92.6796 62.7404 92.1742 62.7799C91.6688 62.8193 92.1742 65.5669 92.261 67.4381C92.4427 72.0963 92.6559 72.499 92.8928 72.5306C94.6143 72.7753 101.872 72.878 103.451 72.2621ZM92.6559 63.4273C96.0753 63.2062 99.542 63.1904 102.622 63.1746C102.701 65.0221 102.827 70.2251 102.985 71.6305C99.7666 71.9633 96.5278 72.0557 93.2955 71.9068C93.4298 70.7304 92.7743 64.7616 92.6559 63.4273ZM99.084 83.3629L100.916 81.7049C100.969 81.6146 100.993 81.5098 100.983 81.4054C100.973 81.301 100.931 81.2023 100.862 81.1235C100.793 81.0447 100.7 80.9898 100.598 80.9666C100.496 80.9434 100.389 80.9531 100.292 80.9943C99.542 81.4563 98.8613 82.0225 98.2706 82.676L96.628 81.1601C96.539 81.0774 96.4208 81.0334 96.2994 81.0379C96.1779 81.0423 96.0632 81.0948 95.9805 81.1838C95.8978 81.2728 95.8538 81.391 95.8582 81.5124C95.8627 81.6338 95.9152 81.7485 96.0042 81.8312L97.5836 83.4103C96.1621 84.9104 95.5383 85.8499 95.6804 86.2763C95.8226 86.7026 96.3359 86.5131 96.4701 86.3237C97.0229 85.6447 97.6467 84.8709 98.318 84.1524C98.9834 84.8788 99.7217 85.5349 100.521 86.1105C100.604 86.1319 100.69 86.1306 100.772 86.1069C100.854 86.0831 100.928 86.0377 100.986 85.9755C101.044 85.9132 101.085 85.8365 101.103 85.7532C101.121 85.67 101.117 85.5834 101.09 85.5025C100.495 84.7233 99.8233 84.0064 99.084 83.3629ZM99.5025 49.5158C98.2411 50.6187 97.2105 51.9604 96.4701 53.4634C95.8753 52.7515 95.1904 52.1198 94.4327 51.5843C93.9668 51.2606 93.3666 51.8765 93.8246 52.2239C94.7254 53.0198 95.5673 53.8801 96.3438 54.7977C96.5491 55.0109 96.7465 54.9004 96.9202 54.6714C97.7802 52.9963 98.8409 51.432 100.079 50.0132C100.458 49.5947 99.9132 49.1289 99.5025 49.5158ZM99.2498 101.064C99.6605 100.78 101.224 97.7639 102.132 96.7376C102.488 96.3428 101.872 95.798 101.469 96.2165C100.388 97.33 99.4609 98.5833 98.7128 99.943L96.8728 98.364C96.4701 98.0245 95.9331 98.6324 96.3517 99.0351C96.7702 99.4377 98.5707 101.648 99.2498 101.064ZM105.275 111.186C104.975 110.594 94.1721 111.186 94.0694 111.186C94.0459 111.189 94.0234 111.198 94.0041 111.211C93.9848 111.225 93.9693 111.244 93.9589 111.265C93.5956 111.849 93.9589 121.347 94.2195 122.231C94.5275 123.305 104.999 122.413 105.52 122.46C105.536 122.464 105.552 122.464 105.568 122.46C105.583 122.457 105.598 122.45 105.611 122.44C105.624 122.431 105.634 122.418 105.642 122.404C105.649 122.39 105.653 122.374 105.654 122.358C105.82 121.15 105.315 111.265 105.275 111.186ZM94.5748 111.762C97.7336 111.897 101.469 111.699 104.675 111.691C104.722 113.01 105.007 120.747 105.046 121.789C101.54 121.947 98.5944 121.892 94.8591 121.789C94.8986 120.471 94.6222 112.962 94.5748 111.786V111.762Z" fill="black" />
        <path d="M98.388 116.879C98.9487 116.879 101.815 117.077 102.044 116.95C102.105 116.916 102.156 116.868 102.195 116.811C102.234 116.753 102.259 116.688 102.268 116.619C102.277 116.55 102.27 116.48 102.248 116.414C102.226 116.348 102.188 116.289 102.139 116.24C101.72 115.798 99.075 115.893 98.6328 115.979C98.0326 116.09 97.9221 116.319 97.9379 116.493C97.9589 116.598 98.0147 116.693 98.0962 116.764C98.1778 116.834 98.2805 116.874 98.388 116.879ZM99.4541 93.7067C96.8639 93.7541 94.1394 93.8488 93.6893 93.8804C93.5156 93.8804 93.334 94.0304 93.3103 95.6727C93.3103 97.6386 93.6498 103.868 94.4395 103.923C96.0189 104.042 104.184 104.073 105.235 103.994C105.4 103.994 105.535 103.994 105.235 99.8888C105.069 97.7728 104.698 93.9278 104.698 93.9278C104.666 93.7699 104.65 93.6278 99.4541 93.7067ZM104.105 94.4015C104.295 97.3465 104.398 100.362 104.713 103.323H94.6685C94.3605 100.473 94.1552 97.536 93.9341 94.5199L104.105 94.4015ZM95.553 89.2617C98.7591 89.2617 104.121 88.8274 104.169 88.8037C104.674 88.5432 104.169 81.4137 104.003 78.3662C104.003 77.8214 101.215 77.8135 98.9013 77.9003C97.8905 77.9003 92.868 78.1688 92.8838 78.8873C93.1523 89.4591 93.0891 88.9459 93.2866 89.0564C94.0256 89.2492 94.7914 89.3185 95.553 89.2617ZM93.8867 88.4721C93.7051 85.3614 93.6419 82.0612 93.5156 78.9978C96.7948 78.7066 100.087 78.5959 103.379 78.6662C103.379 79.7478 103.592 86.9405 103.726 88.1405C102.558 88.2195 95.1108 88.2748 93.9104 88.48L93.8867 88.4721Z" fill="black" />
        <path d="M153.201 100.945C151.132 44.6748 152.001 45.1485 151.622 44.8169C151.085 44.3116 146.939 44.6432 145.92 44.6985L145.494 36.0689C145.514 36.0169 145.521 35.9607 145.515 35.9052C145.509 35.8496 145.49 35.7963 145.459 35.7498C145.428 35.7033 145.386 35.665 145.337 35.6381C145.288 35.6112 145.234 35.5965 145.178 35.5952C128.594 35.3899 111.529 36.4874 94.4162 37.648C89.8044 37.9717 85.011 38.2559 80.3202 38.7533C80.2763 38.7463 80.2315 38.7491 80.1888 38.7615C80.1461 38.7739 80.1068 38.7956 80.0735 38.825C80.0403 38.8545 80.014 38.891 79.9966 38.9318C79.9791 38.9727 79.971 39.0169 79.9727 39.0613C80.8414 60.1417 83.3684 94.2178 87.7354 131.949C87.7828 132.384 91.3838 132.005 94.6215 131.792C94.6639 132.72 94.8312 133.639 95.119 134.523C95.5929 135.123 154.172 131.492 154.101 128.997C153.849 119.625 153.509 110.135 153.201 100.945ZM148.763 125.562C127.994 128.72 109.318 129.605 88.4619 131.405C84.3318 95.6311 82.634 71.0925 80.565 39.306C86.9773 38.927 110.692 36.7479 144.949 36.2979C145.802 59.2495 148.976 123.036 148.739 125.562H148.763ZM49.6327 71.282C49.0957 71.282 49.1036 72.3241 49.3563 72.7189C49.3855 72.7767 49.431 72.8247 49.4871 72.857C49.5432 72.8892 49.6076 72.9044 49.6722 72.9005C50.1539 72.8452 50.1302 71.3372 49.6327 71.282ZM46.8135 75.8455C47.1531 75.9323 48.0691 75.9876 48.2823 75.6718C48.5824 75.2296 47.769 71.2188 47.6664 70.9346C47.6453 70.8766 47.6042 70.828 47.5506 70.7974C47.4969 70.7668 47.4342 70.7563 47.3735 70.7677C47.3128 70.779 47.2581 70.8116 47.2192 70.8595C47.1803 70.9074 47.1597 70.9676 47.161 71.0293C47.161 71.7478 47.4848 74.1874 47.6111 75.2059L46.8214 75.2533C46.7637 75.2779 46.7143 75.3187 46.6794 75.3708C46.6444 75.4229 46.6254 75.4841 46.6245 75.5468C46.6237 75.6095 46.6411 75.6712 46.6747 75.7242C46.7082 75.7772 46.7565 75.8193 46.8135 75.8455ZM48.9615 69.8055C49.1952 69.7415 49.4411 69.7354 49.6777 69.7877C49.9144 69.84 50.1347 69.9491 50.3197 70.1056C50.6277 70.3819 51.22 69.8529 50.375 69.316C49.767 68.9055 48.3455 68.7634 48.4956 69.4897C48.52 69.5909 48.5813 69.6793 48.6675 69.7376C48.7536 69.796 48.8584 69.8202 48.9615 69.8055Z" fill="black" />
        <path d="M72.1154 98.5067C67.0376 93.5011 57.9009 87.6191 49.6881 86.4506C49.8241 85.9813 49.8241 85.483 49.6881 85.0137C50.3133 84.4912 50.8943 83.9182 51.4254 83.3004C52.5547 81.974 52.531 80.6792 50.92 81.3345C52.4994 77.8447 52.4994 70.281 51.9308 66.0334C54.5763 67.6835 59.038 66.0965 58.4932 62.8753C62.0863 63.9569 64.4238 56.8196 59.8593 55.5326C60.499 50.1322 53.5813 49.3506 51.4649 52.5008C50.2725 49.019 44.792 50.8507 45.1868 53.5825C42.7151 50.9297 37.3768 51.8534 36.6345 55.1615C34.3996 53.1325 30.7118 53.993 31.0355 56.9854C27.4977 55.3431 25.6261 59.575 28.3743 60.933C26.6133 61.8804 26.6685 65.7807 29.3693 65.7807C29.3693 68.3862 30.9487 74.355 34.8576 77.6237C35.2762 81.2792 34.526 83.1504 33.223 86.5375C20.3352 88.4955 10.5509 98.5462 6.1602 111.013C1.15355 125.224 3.53052 138.646 18.3689 141.473C18.338 143.37 18.1157 145.258 17.7055 147.11C17.6981 147.18 17.7162 147.25 17.7563 147.308C17.7965 147.366 17.8561 147.407 17.9243 147.424C17.9924 147.441 18.0645 147.434 18.1273 147.402C18.1901 147.37 18.2394 147.317 18.2662 147.252C18.7948 145.413 19.0815 143.513 19.1191 141.599C22.6938 142.13 26.3457 141.573 29.5994 140C32.853 138.427 35.5575 135.911 37.361 132.78C39.647 133.648 41.9803 134.387 44.3498 134.991C51.8045 137.099 61.5256 139.191 70.7334 136.696C70.5518 141.11 70.2991 144.647 69.9042 148.16C69.9042 148.508 70.3859 148.61 70.4412 148.263C70.7492 146.415 71.5152 138.307 71.4678 136.483C77.3273 134.683 81.2442 130.617 82.2076 125.335C83.8897 116.382 80.0992 106.331 72.1154 98.5067ZM38.5771 64.5017C38.7824 66.8071 38.5771 68.4493 37.8743 69.5152C37.6137 69.9021 37.2188 70.3047 36.8793 70.3047C36.6187 70.0205 34.9129 68.252 33.302 69.2862C32.2517 69.9731 32.2043 71.3074 33.1993 73.0444C33.9105 74.0994 34.4192 75.2774 34.6997 76.5183C31.6752 73.2339 30.7512 70.1547 30.0563 65.7413C30.8591 65.5965 31.5917 65.1914 32.1411 64.5885C33.5231 66.6413 36.903 66.2308 38.5771 64.5017ZM33.681 69.8073C34.7471 69.152 35.7342 69.9415 36.6345 70.7311C37.1636 71.1969 38.0322 70.5416 38.4429 69.9415C39.5168 68.4572 39.4221 65.9939 39.2799 64.7622C40.0464 65.4921 41.0643 65.8992 42.1228 65.8992C43.1813 65.8992 44.1992 65.4921 44.9657 64.7622C45.1237 67.0361 49.8934 67.5572 51.149 65.6702C51.7255 69.6178 52.0019 78.1527 50.0908 81.7292C48.5114 82.424 44.9183 84.011 43.1336 83.3083C41.6016 82.7004 40.8277 80.3633 39.043 79.3606C37.8427 78.6974 36.8161 79.4475 37.6532 80.7897C39.7695 84.1531 39.58 85.4321 37.9059 88.8903C36.4386 88.4905 35.0664 87.8005 33.8705 86.8612C35.6079 84.3742 36.0817 79.937 35.6473 76.9842C35.2604 74.355 34.8576 74.5129 33.8153 72.5707C33.3335 71.7733 32.9071 70.2968 33.681 69.8073ZM47.0031 85.7321C46.9401 85.7614 46.89 85.8126 46.8622 85.8762C46.8344 85.9398 46.8309 86.0114 46.8523 86.0775C46.8736 86.1435 46.9184 86.1995 46.9782 86.2348C47.038 86.2701 47.1087 86.2822 47.1769 86.269C47.854 86.148 48.4959 85.8784 49.0563 85.4795C49.1018 86.2157 48.9079 86.9469 48.5035 87.5639C48.3614 87.7612 48.6141 88.3534 49.1274 87.6191C49.0879 89.7982 47.9745 92.4905 45.8344 93.5485C44.384 93.2863 43.0036 92.7266 41.7803 91.9044C40.5571 91.0823 39.5175 90.0157 38.7271 88.7718C41.0962 84.7137 39.0114 81.6661 38.3165 80.4028C37.9296 79.6765 38.127 79.5659 38.7587 79.9765C40.2513 80.9239 41.5621 83.5688 43.0073 83.9241C45.7317 84.5794 49.0879 82.9372 50.7305 82.2029C51.5833 81.8161 52.0809 81.5555 51.0543 82.8425C49.6802 84.54 48.8984 84.8952 47.0031 85.7321ZM13.5833 119.429C13.5547 119.493 13.5503 119.566 13.5707 119.633C13.5912 119.7 13.6352 119.758 13.6947 119.795C13.7542 119.833 13.8252 119.847 13.8947 119.837C13.9641 119.826 14.0274 119.791 14.0729 119.737C20.9985 108.826 32.457 101.254 38.356 89.5772C39.272 91.6141 43.1889 94.2354 45.6054 94.2354C45.6054 96.2013 45.4079 98.5383 45.2026 100.781C42.8335 100.236 36.4291 98.2304 35.2762 95.6092C35.1419 95.2855 34.6207 95.5065 34.7471 95.8302C35.829 98.7594 42.5098 101.112 45.1316 101.61C44.5778 107.509 43.4807 113.345 41.8543 119.042C40.6619 123.306 39.1299 128.462 36.9187 132.275C35.1559 135.41 32.4587 137.918 29.2029 139.447C25.9472 140.977 22.2951 141.454 18.7558 140.81C4.17807 138.252 1.98273 125.106 6.9341 111.218C11.5617 98.2067 21.6935 89.0482 33.3809 87.3112C34.6514 88.2478 36.0401 89.0124 37.511 89.5851C31.5883 101.01 20.2957 108.51 13.5833 119.429ZM42.5335 119.374C50.2071 116.141 58.3601 114.191 66.6665 113.603C69.0356 113.445 71.4046 113.453 73.7737 113.453C74.1212 113.453 74.1291 112.884 73.7737 112.884C72.1627 112.772 70.5469 112.743 68.9329 112.797C68.546 109.639 62.8523 100.425 60.9175 97.8751C60.868 97.8283 60.8033 97.8008 60.7352 97.7977C60.6671 97.7946 60.6002 97.8161 60.5466 97.8582C60.493 97.9003 60.4563 97.9602 60.4432 98.0271C60.4301 98.094 60.4415 98.1633 60.4753 98.2225C64.3527 103.654 67.4878 110.571 68.1116 112.829C61.1702 113.089 50.462 114.732 42.7546 118.506C43.4811 115.845 46.2924 104.87 46.3556 94.0301C48.5272 93.059 50.075 89.5456 49.8934 87.1849C58.0813 89.0492 65.591 93.149 71.5863 99.0278C78.6224 105.92 82.9342 114.818 81.6075 124.49C80.9046 130.017 76.9799 134.296 71.1204 135.852C61.0202 138.615 50.6278 136.215 40.654 133.12C39.6885 132.795 38.705 132.526 37.7084 132.314C39.7267 128.165 41.3425 123.832 42.5335 119.374Z" fill="black" />
        <path d="M42.1461 68.5397C42.3502 68.2381 42.6224 67.9888 42.9406 67.8119C43.2589 67.635 43.6143 67.5354 43.9782 67.5212C44.5547 67.5212 44.5231 66.6527 43.9782 66.7316C43.5091 66.7809 43.0576 66.9367 42.6579 67.1871C42.2583 67.4375 41.9212 67.7759 41.6723 68.1765C41.467 68.5002 41.925 68.8555 42.1461 68.5397ZM44.0098 70.7267C43.686 70.9872 43.7097 72.3057 44.1993 72.3057C44.3113 72.294 44.416 72.2447 44.4963 72.1659C44.5766 72.087 44.6278 71.9832 44.6415 71.8715C44.8232 71.1846 44.3572 70.4819 44.0098 70.7267ZM43.3148 77.2482C43.3001 77.1864 43.2666 77.1308 43.219 77.0888C43.1714 77.0468 43.112 77.0206 43.0488 77.0137C42.9857 77.0067 42.922 77.0195 42.8665 77.0502C42.8109 77.0808 42.7661 77.1279 42.7384 77.185C42.6594 77.2955 42.5094 77.635 42.841 78.3219C43.0662 78.7895 43.4547 79.1586 43.9334 79.3593C44.4121 79.56 44.9477 79.5786 45.4391 79.4115C45.5057 79.3851 45.5602 79.3351 45.5924 79.2712C45.6245 79.2072 45.632 79.1336 45.6135 79.0645C45.595 78.9953 45.5518 78.9353 45.4919 78.896C45.4321 78.8566 45.3599 78.8406 45.2891 78.8509C44.1677 79.072 43.5202 78.3614 43.3148 77.2482Z" fill="black" />
    </svg>
)