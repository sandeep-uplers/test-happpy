'use client';

import { ensureModalAppElement } from '../../../helpers/setModalAppElement';
ensureModalAppElement();

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from '@/talent/navigation/routerCompat';
import { useJobAgentDashboardContext } from '../job-agent/JobAgentDashboardContext';
import { EyeIconPreview } from '../../../assets/IconSVG';
import { OptionIcon } from '../../../assets/IconSVG';
import { IMAGE_URL } from '../../../components/Constant';
import { checkIfFilePasswordProtected, getResumeVerdict } from '../../../components/Helper';
import { resumeHealthCheckInitiatedTracking } from '../../../helpers/Mixpanel';
import {
    getOpenAiStatus,
    getTalentPreferences,
    submitResumeHealthCheck,
} from '../../../store/actions/UserActions';
import {
    SEED_TRANSFORMED_RESUME,
    SET_HEALTH_CHECK_SOCKET_LOADER,
    SET_RESUME_HEALTH_REPORTS,
    SET_RESUME_TRANSFORM,
    SET_TRANSFORMED_RESUME_MODAL_OPEN
} from '../../../store/actions/actionsTypes';
import { getResumeHealthCheck, transformResumeForOutreach } from '../../../store/actions/resumeActions';
import JobAgentResumeHealthReport from '../job-agent/JobAgentResumeHealthReport';
import ResumeModal from '../preferences/ResumeModal';
import HealthCheckLoaderModal from '../resume/HealthCheckLoaderModal';
import HealthCheckPusher from '../resume/HealthCheckPusher';
import TransformLoader from '../resume/payment/TransformLoader';

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

export default function HapppyAgentResumeHealth({ compact = false } = {}) {
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
    const verdict = useMemo(() => (hasScore ? getResumeVerdict(score) : null), [hasScore, score]);
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
        if (resumeHealthControl?.health_check?.status === 3 && resumeHealthControl?.health_check?.report_details) {
            localStorage.setItem('resumeHealthReportSeen', true);
        }
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
        const transformationId = report?.transform?.id || report?.transform?.file_id || resumeHealthControl?.transform?.id || null;
        if (!transformationId) {
            toast.error('Transformed resume is still being prepared.', { duration: 4000 });
            return;
        }
        dispatch({
            type: SET_TRANSFORMED_RESUME_MODAL_OPEN,
            payload: { transformation_id: transformationId },
        });
    }, [currentHealthCheckId, resumeHealthReports, resumeHealthControl, dispatch]);

    /* -----------------------------------------------------------
       Render
    ----------------------------------------------------------- */

    const ext = (formData.resume || '').split('.').pop()?.toLowerCase();

    // Hide the entire section if the user doesn't have an active (non-expired)
    // outreach plan — resume health is only surfaced for active plan holders.
    const outreachPlanActive = isOutreachPlanActive(referralPlan);

    /* -----------------------------------------------------------
       Variant resolution

       Three mutually-exclusive visual variants drive the card:

         - 'score'   : a previous health check exists AND the active profile
                       resume is the one that was checked (or the user has an
                       Uplers-managed CV).
         - 'updated' : a previous score exists but the profile resume has been
                       replaced since — surfaces "your resume changed" CTA.
         - 'default' : no score yet OR a background health check is running
                       (skeleton sub-state when `bgResumeHealthCheckId`).
    ----------------------------------------------------------- */

    const isUplersCv = !!user?.is_uplers_cv;
    const profileChecked = !!resumeHealthControl?.current_profile_cv_healthchecked;

    let variant = 'default';
    if (hasScore && (profileChecked || isUplersCv)) variant = 'score';
    else if (hasScore && !profileChecked && !isUplersCv) variant = 'updated';

    const isSkeleton = variant === 'default' && !!bgResumeHealthCheckId;

    const cardClasses = [
        'happpy-dash__health-card',
        compact ? 'happpy-dash__health-card--compact' : 'happpy-dash__health-card--wide',
        `happpy-dash__health-card--${variant}`,
        variant === 'score' && verdict ? `happpy-dash__health-card--${verdict.tone}` : '',
        isSkeleton ? 'happpy-dash__health-card--skeleton' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const ctaLabel = variant === 'score' ? 'VIEW RESUME HEALTH REPORT' : "CHECK RESUME'S HEALTH";
    const onCtaClick = () =>
        openPopupAt(variant === 'score' ? STEP.REPORT : STEP.LANDING);

    return (
        <>
            {outreachPlanActive && resumeHealthFetched &&
                <section className="happpy-dash__health" aria-label="Resume health">
                    {/* HealthCheckPusher lives at section level so the socket keeps running
                regardless of whether the popup is open. */}
                    {healthCheckSocketLoader && (
                        <HealthCheckPusher healthCheckId={healthCheckSocketLoader} />
                    )}

                    <div className={cardClasses} aria-busy={isSkeleton || undefined}>
                        <div className="happpy-dash__health-card-bg" aria-hidden="true" />
                        <div className="happpy-dash__health-main">
                            {variant === 'score' && verdict && (
                                <div
                                    className={`happpy-dash__health-ring happpy-dash__health-ring--${verdict.tone}`}
                                    aria-hidden
                                >
                                    <span className="happpy-dash__health-ring-num">{score}</span>
                                    <span className="happpy-dash__health-ring-suffix">/100</span>
                                </div>
                            )}

                            {variant === 'updated' && (
                                <span className="happpy-dash__health-illust" aria-hidden>
                                    <img
                                        src={`${IMAGE_URL}outreach/mascot-pointer.svg`}
                                        alt=""
                                    />
                                </span>
                            )}

                            {variant === 'default' && !isSkeleton && (
                                <HapppyResumeHealthIcon />
                            )}

                            {isSkeleton && (
                                <span
                                    className="happpy-dash__health-skel happpy-dash__health-skel--icon"
                                    aria-hidden="true"
                                />
                            )}

                            <div className="happpy-dash__health-text">
                                {variant === 'score' && verdict && (
                                    <>
                                        <p className="happpy-dash__health-eyebrow jad-font-body">
                                            Your profile Resume (health score)
                                        </p>
                                        <h3
                                            className={`happpy-dash__health-verdict happpy-dash__health-verdict--${verdict.tone} jad-font-headline`}
                                        >
                                            {verdict.label}
                                        </h3>
                                    </>
                                )}

                                {variant === 'updated' && (
                                    <>
                                        <h3 className="happpy-dash__health-title jad-font-headline">
                                            Seems like you have updated your resume in you profile
                                        </h3>
                                        <p className="happpy-dash__health-desc jad-font-body">
                                            Run health check again to check your resume&apos;s latest health
                                            score and improve weak sections to increase your chances of
                                            hearing back from recruiters
                                        </p>
                                    </>
                                )}

                                {variant === 'default' && !isSkeleton && (
                                    <>
                                        <h3 className="happpy-dash__health-title jad-font-headline">
                                            Check Your Resume Health
                                        </h3>
                                        <p className="happpy-dash__health-desc jad-font-body">
                                            Check the health of the resume added currently in your profile
                                            and improve weak sections to increase your chances of hearing
                                            back from recruiters.
                                        </p>
                                    </>
                                )}

                                {isSkeleton && (
                                    <>
                                        <span
                                            className="happpy-dash__health-skel happpy-dash__health-skel--title"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className="happpy-dash__health-skel happpy-dash__health-skel--line"
                                            aria-hidden="true"
                                        />
                                        <span
                                            className="happpy-dash__health-skel happpy-dash__health-skel--line happpy-dash__health-skel--line-short"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                            Running health check on your profile resume…
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="happpy-dash__health-actions">

                            {!isSkeleton && (
                                <button
                                    type="button"
                                    className="happpy-dash__health-btn jad-font-headline"
                                    onClick={onCtaClick}
                                    disabled={!isEligible}
                                >
                                    {ctaLabel}
                                </button>
                            )}

                            {isSkeleton && (
                                <span
                                    className="happpy-dash__health-skel happpy-dash__health-skel--btn"
                                    aria-hidden="true"
                                />
                            )}

                            {/* Transform-complete affordance — preserved from the legacy card.
                            Surfaces only on the score variant when a transformed resume
                            has already been generated for the active health check. */}
                            {variant === 'score' &&
                                resumeHealthControl?.transform?.id &&
                                resumeHealthControl?.transform?.status === 3 && (
                                    <button
                                        type="button"
                                        className="happpy-dash__health-btn happpy-dash__health-btn--transformed jad-font-headline"
                                        onClick={onViewTransformedResume}
                                    >
                                        <span>VIEW TRANSFORMED RESUME</span>
                                    </button>
                                )}

                            {/* Limit notice — preserved from the legacy `updated` variant. */}
                            {variant === 'updated' && hasReachedLimit && (
                                <p className="happpy-dash__health-limit jad-font-body">
                                    You&apos;ve used all {totalAttempts} health checks this month.
                                </p>
                            )}
                        </div>
                    </div>

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

/**
 * "Statistics" illustration used by the Happpy dashboard "Check Your Resume
 * Health" card (default / no-score state). Exported from Figma
 * (RA x Client, node 28501:44325) and inlined so the dashboard doesn't
 * depend on any external asset.
 */
function HapppyResumeHealthIcon() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_i_28501_44325)">
                <rect width="64.0004" height="63.8784" rx="12" fill="white" fill-opacity="0.24" />
            </g>
            <rect x="1" y="1" width="62.0004" height="61.8784" rx="11" stroke="url(#paint0_linear_28501_44325)" stroke-opacity="0.2" stroke-width="2" />
            <g filter="url(#filter1_d_28501_44325)">
                <path d="M19.9639 15.0944C21.0661 14.3594 22.2302 13.7342 23.4395 13.2239C26.3743 11.9855 27.8416 11.3663 29.7137 12.6049C31.5858 13.8436 31.5858 15.8715 31.5858 19.9272V24.103C31.5858 28.04 31.5858 30.0085 32.8112 31.2315C34.0366 32.4546 36.0088 32.4546 39.9533 32.4546H44.1371C48.2006 32.4546 50.2324 32.4546 51.4734 34.3231C52.7144 36.1917 52.094 37.6562 50.8533 40.5853C50.342 41.7924 49.7156 42.9543 48.9792 44.0543C46.6806 47.4878 43.4135 50.1639 39.5911 51.7442C35.7687 53.3245 31.5626 53.738 27.5048 52.9324C23.4469 52.1267 19.7195 50.1382 16.794 47.2182C13.8684 44.2983 11.8761 40.578 11.069 36.5279C10.2618 32.4778 10.6761 28.2797 12.2594 24.4646C13.8426 20.6495 16.5239 17.3886 19.9639 15.0944Z" fill="url(#paint1_linear_28501_44325)" />
                <path fill-rule="evenodd" clip-rule="evenodd" d="M35.296 11.843C35.512 11.0054 36.3673 10.5012 37.2064 10.7168C45.1109 12.7474 51.3304 18.955 53.3649 26.8444C53.5808 27.6819 53.0757 28.5356 52.2365 28.7512C51.3974 28.9668 50.542 28.4626 50.3261 27.625C48.5766 20.8407 43.2217 15.496 36.4243 13.7498C35.5852 13.5342 35.08 12.6805 35.296 11.843Z" fill="url(#paint2_linear_28501_44325)" />
            </g>
            <defs>
                <filter id="filter0_i_28501_44325" x="0" y="0" width="64" height="65.3969" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="1.51899" />
                    <feGaussianBlur stdDeviation="2.27848" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.15 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_28501_44325" />
                </filter>
                <filter id="filter1_d_28501_44325" x="9.4518" y="10.667" width="45.1784" height="45.0974" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="1.21519" />
                    <feGaussianBlur stdDeviation="0.607595" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_28501_44325" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_28501_44325" result="shape" />
                </filter>
                <linearGradient id="paint0_linear_28501_44325" x1="32.0002" y1="-56" x2="32.0002" y2="63.8784" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F4DC34" />
                    <stop offset="1" stop-color="#60B5C0" />
                </linearGradient>
                <linearGradient id="paint1_linear_28501_44325" x1="18.3149" y1="13.771" x2="39.356" y2="50.7451" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#20A4FC" />
                    <stop offset="0.699604" stop-color="#FFDF2B" />
                    <stop offset="1" stop-color="white" />
                </linearGradient>
                <linearGradient id="paint2_linear_28501_44325" x1="38.5957" y1="11.4735" x2="52.5743" y2="33.1435" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#20A4FC" />
                    <stop offset="0.699604" stop-color="#FFDF2B" />
                    <stop offset="1" stop-color="white" />
                </linearGradient>
            </defs>
        </svg>
    );
}
