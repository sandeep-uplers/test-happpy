import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from '@/talent/navigation/routerCompat';
import toast from 'react-hot-toast';
import { getHealthReport } from '../../../store/actions/UserActions';
import { SET_RESUME_HEALTH_CONTROL } from '../../../store/actions/actionsTypes';
import { getVerdict } from './resumeHealthVerdict';
import ResumeHealthReportDetailTabs from '../resume/ResumeHealthReportDetailTabs';

/* -------------------------------------------------------------------------
   Local helpers — kept inside this component file so the agent dashboard
   popup can render a compact summary plus the full tabbed detail sections
   without dragging in the entire `<ResumeHealthReport>` page UI.
   --------------------------------------------------------------------- */

const MatIcon = ({ name, className = '', ...rest }) => (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
        {name}
    </span>
);

/**
 * Human labels for the section keys returned by the health-check backend.
 * Kept in sync with `sectionLabels` in `ResumeHealthReport.js`.
 */
const SECTION_LABELS = {
    ats_parse_rate: 'ATS Parse Rate',
    quantify_impact: 'Quantify Impact',
    skill_experience_mapping: 'Skills to Experience Support',
    repetition: 'Repetition',
    resume_length: 'Resume Length',
    spelling_grammar: 'Spelling & Grammar',
    file_format: 'File Format & Size',
    long_bullet_points: 'Long Bullet Points',
    contact_information: 'Contact Information',
    essential_sections: 'Essential Sections',
    active_voice: 'Active Voice',
    buzzwords_cliches: 'Buzzwords & Cliches',
};

/**
 * Distill `report_details` into the two pointer lists the agent dashboard
 * popup surfaces: "Areas of improvement" (must-fix) and "Good to have"
 * (nice-to-have). Mirrors the derivation in `ResumeHealthReport.js` so
 * users see the same set of issues without the heavy full-report UI.
 */
function buildReportPointers(reportDetails) {
    if (!reportDetails) return { immediateActions: [], niceToHaveActions: [] };

    const sections = reportDetails.sections || {};

    const immediateActions = Object.keys(sections).flatMap((sectionKey) => {
        return Object.entries(sections[sectionKey] || {})
            .filter(([, val]) => typeof val === 'object' && val?.check === false)
            .map(([childKey, val]) => {
                if (childKey === 'resume_length') return null; // surfaced as nice-to-have only
                return {
                    section: SECTION_LABELS[childKey] || childKey,
                    message: val?.message || '',
                    key: childKey,
                };
            })
            .filter(Boolean);
    });

    const missingContactInfo = [];
    Object.entries(sections?.mandatory_sections?.contact_information || {}).forEach(
        ([fieldKey, fieldVal]) => {
            if (
                fieldKey !== 'github' &&
                typeof fieldVal === 'object' &&
                fieldVal?.check === false
            ) {
                missingContactInfo.push(
                    fieldKey === 'linkedin'
                        ? 'LinkedIn'
                        : fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
                );
            }
        }
    );
    if (missingContactInfo.length > 0) {
        immediateActions.push({
            section: 'Contact Information',
            key: 'contact_information_missing',
            message:
                missingContactInfo.join(', ') +
                ` ${missingContactInfo.length > 1 ? 'are' : 'is'} missing.`,
        });
    }

    const missingEssentialSections = [];
    Object.entries(sections?.mandatory_sections?.essential_sections || {}).forEach(
        ([fieldKey, fieldVal]) => {
            if (typeof fieldVal === 'object' && fieldVal?.check === false) {
                missingEssentialSections.push(
                    fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
                );
            }
        }
    );
    if (missingEssentialSections.length > 0) {
        immediateActions.push({
            section: 'Essential Sections',
            key: 'essential_sections_missing',
            message:
                missingEssentialSections.join(', ') +
                ` ${missingEssentialSections.length > 1 ? 'sections are' : 'section is'} missing.`,
        });
    }

    const recommendedContactInfo = ['github', 'certifications']
        .map(
            (field) =>
                sections?.mandatory_sections?.contact_information?.[field]?.check === false &&
                sections?.mandatory_sections?.contact_information?.[field]?.message
        )
        .filter(Boolean);

    const niceToHaveActions = [
        sections?.content?.ats_parse_rate?.status === 'MODERATE' && {
            message: sections?.content?.ats_parse_rate?.message,
            key: 'ats_parse_rate',
        },
        sections?.format?.resume_length?.check === false && {
            message: sections?.format?.resume_length?.message,
            key: 'resume_length',
        },
        recommendedContactInfo.length > 0 && {
            message: recommendedContactInfo.join(', '),
            key: 'contact_information_recommended',
        },
    ].filter(Boolean);

    return { immediateActions, niceToHaveActions };
}

/* -------------------------------------------------------------------------
   <JobAgentResumeHealthReport>
   Self-contained report section rendered inside the agent dashboard popup
   when REPORT is the active step. Owns its own fetch — pulls the report
   from `getHealthReport` on mount if it isn't already hydrated in Redux —
   and reads `control` + `transformResumeLoader` straight from the store.
   Below the summary it renders the same tabbed detail sections as the full
   resume health report page.

   Parent only needs to pass:
     - healthCheckId             which report to render
     - onTransformSubmit         CTA handler from the parent
     - onViewTransformedResume   CTA handler from the parent
     - referralPlanActive        whether the outreach plan covers transform
   --------------------------------------------------------------------- */

export default function JobAgentResumeHealthReport({
    healthCheckId,
    onTransformSubmit,
    onViewTransformedResume,
    onClose,
    referralPlanActive,
}) {
    const dispatch = useDispatch();
    const {
        resumeHealthReports,
        activeTransformation,
        healthCheckSocketLoader,
    } = useSelector((state) => state.resume);

    const { user } = useSelector((state) => state.auth);

    const control = healthCheckId ? resumeHealthReports[healthCheckId] : null;
    const transformResumeLoader = healthCheckId ? activeTransformation[healthCheckId] : null;

    /**
     * On mount (and whenever `healthCheckId` changes) make sure the report
     * is in Redux. Skip when:
     *   - no id is set yet
     *   - the report is already hydrated
     *   - the health-check pusher is still in flight for this id (it will
     *     hydrate via socket; firing the GET here would race the socket).
     */
    useEffect(() => {
        if (!healthCheckId) return;
        if (resumeHealthReports[healthCheckId]) return;
        if (healthCheckSocketLoader === healthCheckId) return;
        getHealthReport({ health_check_id: healthCheckId })(dispatch)
        .then(res => {
            console.log('getHealthReport response', res.data.data);
            dispatch({ type: SET_RESUME_HEALTH_CONTROL, payload: res.data.data })
        })
        .catch((err) => {
            toast.error(
                err?.response?.data?.message || 'Could not load resume health report.',
                { duration: 5000 }
            );
        });
        // We intentionally only depend on the id; `resumeHealthReports` /
        // `healthCheckSocketLoader` are read at render time and re-running
        // the effect on every store update is unnecessary.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [healthCheckId]);

    const { immediateActions, niceToHaveActions } = useMemo(
        () => buildReportPointers(control?.health_check?.report_details),
        [control?.health_check?.report_details]
    );

    if (!control) {
        return (
            <p className="jad-resume-health-modal__loading jad-font-body">
                Loading your resume health report…
            </p>
        );
    }

    const transformStatus = control?.transform?.status;
    const transformEligible = transformStatus === 0;
    const isTransformed = transformStatus === 3;
    const reportDetails = control?.health_check?.report_details;

    const reportScore = Number(control?.health_check?.resume_score) || 0;
    const reportVerdict = getVerdict(reportScore);
    const reportFileName = control?.health_check?.file_name || 'Your resume';

    return (
        <div className="jad-resume-health-modal__report">
            {/* Transformation CTA leads the view: it's the action we want users to
                take, with the score and pointer lists below as supporting context. */}
            {isTransformed && (
                <div className="jad-resume-health-modal__report-banner jad-resume-health-modal__report-banner--success">
                    <div className="jad-resume-health-modal__report-banner-text">
                        <h3 className="jad-font-headline">Your transformed resume is ready</h3>
                        <p className="jad-font-body">
                            View the rewritten version — optimised for ATS, recruiter signal, and
                            hiring-manager appeal.
                        </p>
                    </div>
                    <div className="jad-resume-health-modal__report-banner-actions">
                        <button
                            type="button"
                            className="jad-resume-health-modal__primary jad-font-headline"
                            onClick={onViewTransformedResume}
                        >
                            <MatIcon name="visibility" aria-hidden />
                            <span>View transformed resume</span>
                        </button>
                    </div>
                </div>
            )}
            {transformEligible && (
                <div className="jad-resume-health-modal__report-banner jad-resume-health-modal__report-banner--cta">
                    <div className="jad-resume-health-modal__report-banner-text">
                        <h3 className="jad-font-headline">Transform this resume into an interview magnet</h3>
                        <p className="jad-font-body">
                            Rewrite it for ATS parsing, recruiter screening, and a sharper
                            hiring-manager hook.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="jad-resume-health-modal__primary jad-font-headline"
                        onClick={() => onTransformSubmit && onTransformSubmit('report-banner')}
                        disabled={!!transformResumeLoader}
                    >
                        <MatIcon name="auto_awesome" aria-hidden />
                        <span>{transformResumeLoader ? 'Transforming…' : 'Transform my resume'}</span>
                    </button>
                </div>
            )}

            {/* {referralPlanActive && transformEligible && (
                <p className="jad-resume-health-modal__plan-perk jad-font-body">
                    <MatIcon name="verified" aria-hidden />
                    <span>Your active outreach plan covers this transformation — no payment needed.</span>
                </p>
            )} */}

            {reportVerdict && (
                <div
                    className={`jad-resume-health-modal__report-score jad-resume-health-modal__report-score--${reportVerdict.tone}`}
                    role="group"
                    aria-label="Resume health score"
                >
                    <div
                        className={`jad-resume-health-modal__report-score-ring jad-resume-health-modal__report-score-ring--${reportVerdict.tone}`}
                        aria-hidden
                    >
                        <span className="jad-resume-health-modal__report-score-num">{reportScore}</span>
                        <span className="jad-resume-health-modal__report-score-suffix">/100</span>
                    </div>
                    <div className="jad-resume-health-modal__report-score-meta">
                        <span className="jad-resume-health-modal__report-score-label jad-font-label">
                            Resume health score
                        </span>
                        <h3
                            className={`jad-resume-health-modal__report-score-verdict jad-resume-health-modal__report-score-verdict--${reportVerdict.tone} jad-font-headline`}
                        >
                            {reportVerdict.label}
                        </h3>
                        <p
                            className="jad-resume-health-modal__report-score-filename jad-font-body"
                            title={reportFileName}
                        >
                            {reportFileName}
                        </p>
                    </div>
                </div>
            )}

            {(immediateActions.length > 0 || niceToHaveActions.length > 0) && (
                <div className="jad-resume-health-modal__report-lists">
                    <section
                        className="jad-resume-health-modal__report-list jad-resume-health-modal__report-list--improve"
                        aria-label="Areas of improvement"
                    >
                        <header className="jad-resume-health-modal__report-list-header">
                            <span className="jad-resume-health-modal__report-list-icon" aria-hidden>
                                <MatIcon name="priority_high" />
                            </span>
                            <div>
                                <h3 className="jad-font-headline">Areas of improvement</h3>
                                <p className="jad-font-body">
                                    What&apos;s holding your resume back today.
                                </p>
                            </div>
                        </header>
                        {immediateActions.length > 0 && (
                            <ul className="jad-resume-health-modal__report-list-items">
                                {immediateActions.map((action, i) => (
                                    <li
                                        key={action.key || `improve_${i}`}
                                        className="jad-resume-health-modal__report-list-item"
                                    >
                                        <span className="jad-resume-health-modal__report-list-bullet" aria-hidden />
                                        <span className="jad-resume-health-modal__report-list-body">
                                            <span className="jad-resume-health-modal__report-list-section jad-font-headline">
                                                {action.section}
                                            </span>
                                            {action.message && (
                                                <span className="jad-resume-health-modal__report-list-message jad-font-body">
                                                    {action.message}
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Nice-to-have pointers live inside the same card so users see all
                            recommendations in one place. They get a softer sub-header + bullet
                            tone to read as suggestions rather than must-fix issues. */}
                        {niceToHaveActions.length > 0 && (
                            <div className="jad-resume-health-modal__report-list-subgroup">
                                <div className="jad-resume-health-modal__report-list-subheader">
                                    <MatIcon
                                        name="lightbulb"
                                        className="jad-resume-health-modal__report-list-subheader-icon"
                                        aria-hidden
                                    />
                                    <span className="jad-font-headline">Good to have</span>
                                </div>
                                <ul className="jad-resume-health-modal__report-list-items">
                                    {niceToHaveActions.map((action, i) => (
                                        <li
                                            key={action.key || `nice_${i}`}
                                            className="jad-resume-health-modal__report-list-item jad-resume-health-modal__report-list-item--nice"
                                        >
                                            <span
                                                className="jad-resume-health-modal__report-list-bullet jad-resume-health-modal__report-list-bullet--nice"
                                                aria-hidden
                                            />
                                            <span className="jad-resume-health-modal__report-list-body">
                                                <span className="jad-resume-health-modal__report-list-message jad-font-body">
                                                    {action.message}
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                </div>
            )}

            {reportDetails && (
                <div className="jad-resume-health-modal__report-details resume-health-report">
                    <ResumeHealthReportDetailTabs
                        report_details={reportDetails}
                        transform_eligible={transformEligible}
                        handleTransformSubmit={onTransformSubmit}
                        transformResumeLoader={transformResumeLoader}
                    />
                </div>
            )}
        </div>
    );
}
