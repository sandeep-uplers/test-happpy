import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDropDownIcon, ToolTipSVG } from "../../assets/IconSVG";
import { CustomTooltip } from "../../components/common/CustomTooltip";
import { raiseTailorResumeFeedback } from "../../store/actions/UserActions";

export default function ResumeEditorReport() {

    const dispatch = useDispatch();
    const { report_json, tailored_resume_id, tailored_streak_count } = useSelector(state => state.resumeEditor);
    const [activePoint, setActivePoint] = useState(null);
    const [selectedFeedback, setSelectedFeedback] = useState(null); // 1=Positive, 2=Negative
    const [feedbackText, setFeedbackText] = useState("");
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const handleActivePoint = (point) => {
        if (activePoint === point) {
            setActivePoint(null);
        } else {
            setActivePoint(point);
        }
    }

    const handleSelectFeedback = (value) => {
        setSelectedFeedback(value);
        if (value === 1) {
            setFeedbackText("");
        }
    }

    const handleSubmitFeedback = () => {
        if (!tailored_resume_id) {
            toast.error("Unable to submit feedback. Please refresh and try again.", { duration: 6000 });
            return;
        }
        if (!selectedFeedback) {
            toast.error("Please select Positive or Negative feedback.", { duration: 6000 });
            return;
        }

        const payload = {
            tailored_resume_id,
            feedback: selectedFeedback, // 1=Positive, 2=Negative
            ...(selectedFeedback === 2 ? { feedback_text: feedbackText?.trim() || null } : {}),
        };

        setIsSubmittingFeedback(true);
        raiseTailorResumeFeedback(payload)(dispatch)
            .then((res) => {
                toast.success(res?.data?.message || "Thanks for your feedback!", { duration: 6000 });
                setFeedbackSubmitted(true);
            })
            .catch((err) => {
                const errMsg = err?.response?.data?.message || "Something went wrong. Please try again.";
                toast.error(errMsg, { duration: 6000 });
            })
            .finally(() => setIsSubmittingFeedback(false));
    }

    const [showWhatChanged, setShowWhatChanged] = useState(false);

    useEffect(() => {
        if (!(tailored_streak_count > 0 && tailored_streak_count < 40)) {
            setShowWhatChanged(true);
        }
    }, [tailored_streak_count]);

    return (
        <div className="re-report">
            <div className="re-report-summary">
                {/* <div className="summary-overview">
                    <div className="rs-left">
                        <span>Great! your scrore jumped from 4.5 to 8, closer to landing that interview!</span>
                    </div>
                    <div className="rs-right">
                        <ScoreGauge />
                    </div>
                </div> */}
                {(report_json.summary || report_json.addtional_skills || report_json.professional_experiences) && (
                    <div className="rs-points">
                        <div className="rs-points-head collapsible" onClick={() => setShowWhatChanged(!showWhatChanged)}>
                            <h6>See What's Changed</h6>
                            {showWhatChanged ? <MinusIcon /> : <PlusIcon />}
                        </div>
                        {showWhatChanged &&
                            <div className="rs-points-body">
                                {report_json.summary && (
                                    <div className="rs-point-item">
                                        <div className={`rs-point-header ${activePoint === "summary" ? 'active' : ''}`} onClick={() => handleActivePoint("summary")}>
                                            <div className="head-name">
                                                <span>1</span>Summary Enhanced
                                            </div>
                                            <ArrowDropDownIcon />
                                        </div>
                                        {activePoint === "summary" && (
                                            <div className="rs-point-content">
                                                <p>{report_json.summary}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {report_json.addtional_skills && report_json.addtional_skills.length > 0 && (
                                    <div className="rs-point-item skills">
                                        <div className={`rs-point-header ${activePoint === "addtional_skills" ? 'active' : ''}`} onClick={() => handleActivePoint("addtional_skills")}>
                                            <div className="head-name">
                                                <span>2</span>Relevant Skills Highlighted
                                            </div>
                                            <ArrowDropDownIcon />
                                        </div>
                                        {activePoint === "addtional_skills" &&
                                            <div className="rs-point-content">
                                                <div className="rs-skills-wrapper">
                                                    {report_json.addtional_skills.map((skill, index) => (
                                                        <span className="skill-item" key={index}>{skill}</span>
                                                    ))}
                                                </div>
                                                <p>The skills listed above, required by the target job and identified in your profile, have been added to the Skills section and highlighted in your bullet points to further showcase your qualifications.</p>
                                            </div>
                                        }
                                    </div>
                                )}
                                {report_json.professional_experiences && (
                                    <div className="rs-point-item">
                                        <div className={`rs-point-header ${activePoint === "professional_experiences" ? 'active' : ''}`} onClick={() => handleActivePoint("professional_experiences")}>
                                            <div className="head-name">
                                                <span>3</span>Work Experience Enhanced
                                            </div>
                                            <ArrowDropDownIcon />
                                        </div>
                                        {activePoint === "professional_experiences" && (
                                            <div className="rs-point-content">
                                                <p>{report_json.professional_experiences}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                )}
                {(tailored_streak_count > 0 && tailored_streak_count < 40) && (
                    <div className="rs-points">
                        <div className="rs-points-body">
                            <div className="re-whats-next">
                                <h6 className="re-whats-next-title">Here&apos;s what comes next:</h6>
                                <div className="re-whats-next-progress-card">
                                    <div className="re-whats-next-progress-header">
                                        <span className="re-whats-next-progress-label">Your Progress</span>
                                        <span className="re-whats-next-progress-count">{tailored_streak_count}/40 resumes</span>
                                    </div>
                                    <div className="re-whats-next-progress-bar-wrap">
                                        <div className="re-whats-next-progress-bar" style={{ width: `${(tailored_streak_count / 40) * 100}%` }} />
                                    </div>
                                    <p className="re-whats-next-progress-hint">{40 - tailored_streak_count} more to reach the success threshold</p>
                                </div>
                                <div className="re-whats-next-formula-card">
                                    <div className="re-whats-next-formula-head">
                                        <div className="re-whats-next-formula-icon re-whats-next-formula-icon-target">
                                            <TargetIcon />
                                        </div>
                                        <div>
                                            <h6 className="re-whats-next-formula-title">The Success Formula</h6>
                                            <p className="re-whats-next-formula-subtitle">Based on users who got interviews</p>
                                        </div>
                                    </div>
                                    <div className="re-whats-next-formula-inner">
                                        <div className="re-whats-next-formula-item">
                                            <div className="re-whats-next-formula-item-icon re-whats-next-formula-icon-minimum">
                                                <span>40</span>
                                            </div>
                                            <div>
                                                <p className="re-whats-next-formula-item-label">Minimum: <strong>35-40 resumes</strong></p>
                                                <p className="re-whats-next-formula-item-desc">Tailored and applied</p>
                                            </div>
                                        </div>
                                        <div className="re-whats-next-formula-item">
                                            <div className="re-whats-next-formula-item-icon re-whats-next-formula-icon-timeline">
                                                <ClockIcon />
                                            </div>
                                            <div>
                                                <p className="re-whats-next-formula-item-label">Timeline: <strong>2 Weeks</strong></p>
                                                <p className="re-whats-next-formula-item-desc">Start seeing responses</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className="re-whats-next-footer">
                                    Most successful users apply to 2-3 jobs daily for a month.<br />
                                    Consistency matters more than speed.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="rs-points tailor-feedback-section">
                    <div className="rs-points-head">
                        <h6>How satisfied are you with your tailored resume?</h6>
                    </div>
                    <div className="rs-points-body tailor-feedback-body">
                        <div className="tailor-feedback-options">
                            <button
                                type="button"
                                className={`tailor-feedback-option ${selectedFeedback === 1 ? "active" : ""}`}
                                onClick={() => handleSelectFeedback(1)}
                                disabled={feedbackSubmitted}
                            >
                                <ThumbsUpOutlineIcon />
                                <span>Satisfied</span>
                            </button>
                            <button
                                type="button"
                                className={`tailor-feedback-option ${selectedFeedback === 2 ? "active" : ""}`}
                                onClick={() => handleSelectFeedback(2)}
                                disabled={feedbackSubmitted}
                            >
                                <ThumbsDownOutlineIcon />
                                <span>Not Satisfied</span>
                            </button>
                        </div>

                        {selectedFeedback === 2 && !feedbackSubmitted && (
                            <div className="tailor-feedback-textarea">
                                <textarea
                                    placeholder="Tell us what went wrong (optional)"
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                    maxLength={1000}
                                    rows={3}
                                />
                                <div className="tailor-feedback-counter">{feedbackText.length}/1000</div>
                            </div>
                        )}

                        <div className="tailor-feedback-actions">
                            {feedbackSubmitted ? (
                                <div className="tailor-feedback-thanks">
                                    <span>Thanks for your feedback!</span>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="primaryBtn"
                                    onClick={handleSubmitFeedback}
                                    disabled={!selectedFeedback || isSubmittingFeedback || !tailored_resume_id}
                                >
                                    {isSubmittingFeedback ? "Submitting..." : "Submit"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

const TargetIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const ClockIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ThumbsUpOutlineIcon = ({ size = 18 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#231F20"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7 10v12" />
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11l3.1-6.21a2 2 0 0 1 1.8-1.11h.09a2 2 0 0 1 2 2v2.41Z" />
        </svg>
    );
};

const ThumbsDownOutlineIcon = ({ size = 18 }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#231F20"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11l-3.1 6.21A2 2 0 0 1 10.55 22h-.09a2 2 0 0 1-2-2v-2.41Z" />
        </svg>
    );
};

const ScoreGauge = ({ score = 8.0 }) => {
    return (
        <div className="score-gauge-container">
            <svg style={{ width: '100px', height: '50px', overflow: 'visible' }} viewBox="0 0 300 150">
                <defs>
                    <linearGradient id="gaugeGradient" cx="0" cy="0" r="50%">
                        <stop offset="0" stop-color="#FF6739"></stop><stop offset="0.372908" stop-color="#FFDE6B"></stop>
                        <stop offset="0.62537" stop-color="#43DDFF"></stop><stop offset="0.895" stop-color="#4BF786"></stop>
                    </linearGradient>
                </defs>

                <path d="M 30 130 A 120 120 0 0 1 270 130" stroke="#ececec" strokeWidth={20} strokeLinecap="round" fill="none" />
                <path
                    d="M 30 130 A 120 120 0 0 1 270 130"
                    stroke={`url(#gaugeGradient)`}
                    strokeWidth={20}
                    strokeLinecap="round"
                    fill="none"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
            </svg>

            <div className={`score-gauge-value ${(score < 7.5 && score >= 5) ? 'average' : ''}`}>{score}</div>
            <div className="score-text">
                <span>{score >= 7.5 ? 'Good' : score >= 5 ? 'Average' : 'Bad'}</span>
                <CustomTooltip text="This score measures how effectively your resume represents your qualifications in relation to this specific job description." customStyles={{ tooltip: { right: '-4px', maxWidth: '250px' } }} placement="bottom-right">
                    <ToolTipSVG height="16px" width="16px" color="#231F20" />
                </CustomTooltip>
            </div>
        </div>
    );
};

const PlusIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const MinusIcon = ({ size = 20 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);