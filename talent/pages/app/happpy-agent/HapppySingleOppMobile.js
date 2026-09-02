'use client';

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "@/talent/navigation/routerCompat";
import { ArrowRightIcon } from "../../../assets/IconSVG";
import { IMAGE_URL } from "../../../components/Constant";
import ConfirmAppliedCard from "../../../components/extensionModal/ConfirmAppliedCard";
import FloatingInfoTooltip from "../../../components/FloatingInfoTooltip";
import { formattedINRJobBudget, formattedYOE, getApplyButtonText, isTalentHired } from "../../../components/Helper";
import { talentRelevancyTracking, viewAllJobsClickedTracking, viewJobClickedTracking } from "../../../helpers/Mixpanel";
import { OPEN_SIGNUP_APPLY_FLOW, SET_TAILOR_MODAL_OPEN, SET_TOUCHPOINT_DATA } from "../../../store/actions/actionsTypes";
import { trackTailorPricePopupOpen } from "../../../store/actions/trackingActions";
import AiScreeningRequired from "../happy-jobs/AiScreeningRequired";
import AboutCompany from "../happy-jobs/AboutCompany";
import CompanyLogo from "../happy-jobs/CompanyLogo";
import CustomQuesNeeded from "../happy-jobs/CustomQuesNeeded";
import EstimatedSalaryPill from "../happy-jobs/EstimatedSalaryPill";
import MatcherInfo from "../happy-jobs/MatcherInfo";
import NotInterested from "../happy-jobs/modals/NotInterested";
import HSContent from "../happy-jobs/HSContent";
import UplersPartnerBadge from "../happy-jobs/UplersPartnerBadge";
import SingleOppAssessmentNew from "../work-components/SingleOppAssessmentNew";
import "../work/similarJobs.css";
import { getJobAgentSimilarJobHref } from "../../../helpers/jobPath";
import { fetchTouchpointsQuestion } from "../../../store/actions/UserActions";
import ReferralAgentModal from "../../../components/ReferralAgentModal";
import SkipTailorOptionModal, { useSkipTailorOptionPromise } from "../../../components/SkipTailorOptionModal";
import JobDetailsResumePromo from "../resume/nudges/JobDetailsResumePromo";
import ReferralAgentResumeModal from "../../../components/ReferralAgentResumeModal";
import ReferralAgentPreviewModal from "../../../components/ReferralAgentPreviewModal";

const HAPPPY_ALL_JOBS_PATH = '/talent/job-agent/recommended-jobs?tab=all-jobs';

export default function HapppySingleOppMobile({
    isOppDisabled, data, similarJobObj, markedNotInterested, onUndoNotInterested, onSubmitNotInterested, talentStatus, validApplicableStatus,
    handleOppBookmark, undoHandler, hideApplyCta = false,
}) {

    const [searchParams] = useSearchParams();

    const hasFrom = searchParams.get('from');
    const { user } = useSelector(state => state.auth);
    // const { tailored_plan_validity, is_tailored_paid } = user.resume_tailored;

    // const { is_tailored_eligible } = user?.resume_tailored || {};
    const { is_tailored_paid: is_tailored_eligible } = user?.resume_tailored ?? {}; // need to remove after allowing new user to tailor

    const dispatch = useDispatch()
    const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);
    const [referralPayloadHtml, setReferralPayloadHtml] = useState('');
    const [messageTemplateIds, setMessageTemplateIds] = useState({});

    const hasTailoredCV = data.tailored_status == 2 || sessionStorage.getItem('tailored_resume_generated_' + data.HR_Number);

    const { open: openSkipTailorOptionModal, isOpen: skipTailorOptionModalOpen, onResolve: resolveSkipTailorOption, onClose: closeSkipTailorOption } =
        useSkipTailorOptionPromise();

    const handleSkipTailorOption = () => openSkipTailorOptionModal();

    const openReferralModal = () => setIsReferralModalVisible(true);
    const closeReferralModal = () => {
        setIsReferralModalVisible(false);
        setMessageTemplateIds({});
    };

    const handleReferralSubmit = (text) => {
        console.log("Submitted reason:", text);
    };

    const handleCustomizeResume = (from_where = '', tailor_directly = false) => {
        if (user?.outreach?.disabled_tailor) {
            setShowPreviewModal(true);
            return;
        }
        if (data.tailored_status > 0) {
            dispatchTailorModalOpen(from_where);
            return;
        }

        if (tailor_directly) {
            dispatchTailorModalOpen(from_where)
        } else if (data.aggregator_application_link || from_where.includes('skill_section')) {
            handleSkipTailorOption().then((choice) => {
                if (choice === 'yes') {
                    dispatchTailorModalOpen(from_where)
                } else {
                    setReferralPayloadHtml('');
                    setShowPreviewModal(true);
                    // openReferralModal();
                }
            });
        } else {
            getTouchPointers(data.HR_Number);
            dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: { ...data, partner_job_tailor: true } })
        }
        // }
    }

    const dispatchTailorModalOpen = (from_where = '') => {
        dispatch({
            type: SET_TAILOR_MODAL_OPEN,
            payload: {
                hr_enc_id: data.enc_id,
                active_job: {
                    job_title: data.RequestForTalent,
                    company: { ...data.company },
                    is_applied: data.is_applied,
                    aggregator_application_link: data.aggregator_application_link,
                    aggregator: data.aggregator,
                    HR_Number: data.HR_Number
                },
                is_already_tailored: hasTailoredCV ? true : false,
                run_referral_agent: from_where.includes('referral_agent_with_tailored_resume') ? true : false,
            }
        });
    }

    const getTouchPointers = (hrNo) => {
        let reqMap = {
            "HR_Number": hrNo
        }
        fetchTouchpointsQuestion(reqMap, true)(dispatch)
            .then(res => {
                dispatch({
                    type: SET_TOUCHPOINT_DATA,
                    payload: {
                        HR_Number: hrNo,
                        touchPointQues: res.data.data.data,
                        touchPointMaster: res.data.data.masters,
                        talent: res.data.data.talent,
                        customTocuhpointQues: res.data.data.custom_questions ?? []
                    }
                })
            })
            .catch(err => {
                console.log('err', err);
            })
    }

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const handleAfterPreviewModal = ({ linkedin_message_id, gmail_message_id } = {}) => {
        setMessageTemplateIds({ linkedin_message_id, gmail_message_id });
        openReferralModal();
        setShowPreviewModal(false);
    }
    return (
        <>
            {(Object.keys(data).length > 0) &&
                <>

                    {showPreviewModal &&
                        <ReferralAgentPreviewModal
                            isOpen={showPreviewModal}
                            onClose={() => setShowPreviewModal(false)}
                            onConfirm={handleAfterPreviewModal}
                            selectedResume={'profile'}
                            noTailorHTML={true}
                            HR_Number={data.HR_Number}
                        />
                    }
                    <ReferralAgentModal
                        isOpen={isReferralModalVisible}
                        closeReferralAgentModal={closeReferralModal}
                        onSubmit={handleReferralSubmit}
                        source="single-opp-mobile"
                        hrID={data.enc_id}
                        payloadHtml={referralPayloadHtml}
                        linkedin_message_id={messageTemplateIds.linkedin_message_id}
                        gmail_message_id={messageTemplateIds.gmail_message_id}
                    />
                    <SkipTailorOptionModal
                        isOpen={skipTailorOptionModalOpen}
                        onResolve={resolveSkipTailorOption}
                        onClose={closeSkipTailorOption}
                    />
                    <div className="happpy-single-opp-mobile single-opp-mobile">

                        <div className="breadcrumb">
                            {hasFrom === 'applied-jobs' ?
                                <Link to={'/talent/my-opportunities'}>
                                    <ArrowRightIcon /> Back to Applied Jobs
                                </Link>
                                :
                                <Link to={HAPPPY_ALL_JOBS_PATH}>
                                    <ArrowRightIcon /> Back to All Jobs
                                </Link>
                            }
                            <button className={`bookmarkIconBtn ${data.is_saved ? 'saved' : ''}`} onClick={handleOppBookmark}>
                                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                        <div className="oppHead">
                            {(data.is_partner_company || (data.top_badge && !(data.frontend_data && data.frontend_data.frontend_label))) &&
                                <div className="top-nudges">
                                    {data.top_badge && !(data.frontend_data && data.frontend_data.frontend_label) &&
                                        <div className="nudge">
                                            <div
                                                className="earlyApplicant"
                                                dangerouslySetInnerHTML={{ __html: data.top_badge }}
                                            >
                                            </div>
                                        </div>
                                    }
                                    {(data.is_partner_company && data.company?.company_name != "Uplers") &&
                                        <div className="nudge">
                                            <UplersPartnerBadge data={data} fullText />
                                        </div>
                                    }
                                </div>
                            }

                            {(data.frontend_data && data.frontend_data.frontend_label) &&
                                <div className="top-nudges appliedStatus">
                                    <label
                                        className={`oppHeadActionTag`}
                                        style={{
                                            "color": data.frontend_data.frontend_label_color,
                                        }}
                                    >
                                        <span
                                            className="dot"
                                            style={{
                                                "background": data.frontend_data.frontend_label_color,
                                            }}
                                        >
                                        </span>
                                        {data.frontend_data.frontend_label}
                                    </label>
                                    <span className="appliedDate">Applied on: {data.applied_at}</span>
                                </div>
                            }
                            {Number.isInteger(data.ai_score) && data.ai_score >= 0 && data.ai_score <= 100 && (
                                <div className="top-nudges">
                                    <div className="nudge aiScoreTag">
                                        Your Ai Interview score: &nbsp;<span className="aiScore">{data.ai_score}</span>
                                    </div>
                                </div>
                            )}

                            <div className="jobTitle">
                                <div className="logo">
                                    <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                                </div>
                                <div className="content">
                                    <h6>{data.RequestForTalent}</h6>
                                    <span className="companyName">{data.company?.company_name}</span>
                                </div>
                            </div>
                            {(!isOppDisabled && !(data.is_applied && data.screening_status && data.ai_needed) && data.current_talent_hr) &&
                                <OppStatusMessgae data={data} />
                            }
                            {data.is_applied && !isOppDisabled &&
                                <>
                                    {data.custom_screening_needed ? <CustomQuesNeeded hrData={data} />
                                        :
                                        data.ai_needed && <AiScreeningRequired hrData={data} aiData={data.ai_data} />
                                    }
                                </>
                            }

                            {!isOppDisabled && data.aggregator_application_link &&
                                <>
                                    <ConfirmAppliedCard hrData={data} spaceBottom />
                                </>
                            }
                            <div className="jobAttribs">
                                <ul className="attribs">
                                    {data.YearOfExp &&
                                        <span>
                                            <img src={IMAGE_URL + "work/award-icon.svg"} alt="award-icon" />
                                            {formattedYOE(data.YearOfExp, data.max_yoe)}
                                        </span>
                                    }
                                    {data.ModeOfWork &&
                                        <span>
                                            <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
                                            {data.ModeOfWork?.toLowerCase() == "remote" ?
                                                "Remote" + (data.city ? (" - " + data.city) : '')
                                                :
                                                <>
                                                    {data.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (data.job_location?.length > 0 ? (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
                                                    {data.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (data.job_location?.length > 0 ? (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
                                                </>
                                            }
                                            {data.aggregator_application_link &&
                                                data.ModeOfWork?.toLowerCase() !== "remote" &&
                                                data.location_type === 2 &&
                                                <span className="dpInfoTag location">
                                                    <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                                    <span className="dpInfoTagHover">
                                                        The job location is not specified, but since the company has an office in Bengaluru, it is likely that the position is based there.
                                                    </span>
                                                </span>
                                            }
                                        </span>
                                    }
                                    {data.pricingModel &&
                                        <span>
                                            <img src={IMAGE_URL + "work/briefcase-icon.svg"} alt="briefcase-icon" />
                                            {data.pricingModel}
                                            {data.pricingModelIText &&
                                                <FloatingInfoTooltip
                                                    message={data.pricingModelIText}
                                                />
                                            }
                                        </span>
                                    }
                                    {data.cost_string &&
                                        <span>
                                            <img src={IMAGE_URL + "work/money.svg"} alt="money-icon" />
                                            {formattedINRJobBudget(data.cost_string)}
                                        </span>
                                    }
                                    {data.cost_string?.toLowerCase() === 'confidential' && !data.is_partner_company && (
                                        <EstimatedSalaryPill hrData={data} />
                                    )}

                                </ul>
                                {(!data.current_talent_hr ||
                                    (validApplicableStatus.includes(data.current_talent_hr?.badgeName)
                                        && !data.current_talent_hr?.is_self_applied)) &&
                                    <>
                                        <NotInterested
                                            hrData={data}
                                            afterSubmit={onSubmitNotInterested}
                                            markedNotInterested={markedNotInterested}
                                            onUndoNotInterested={onUndoNotInterested}
                                            fromSingleOppMobile
                                        />
                                    </>
                                }
                            </div>
                            {(data.status == 1 && data.HR_Status == "Reposted") &&
                                <span className="repostedTag">
                                    Reposted
                                </span>
                            }
                        </div>
                        {(markedNotInterested || data.job_not_interested) &&
                            <div className="notInterested notInterstedMsgAction">
                                This job has been marked as <strong>'Not interested'</strong>, undo this action to apply
                                <button className="ghostBtn blue" onClick={undoHandler}>undo</button>
                            </div>
                        }
                        {((data.ai_mandatory != 1 || (data.assessments?.length ?? 0) > 0) && !data.is_applied)
                            && (!markedNotInterested && !data.job_not_interested) &&
                            <>
                                <SingleOppAssessmentNew
                                    assessments={data.assessments ?? []}
                                    allData={data}
                                    hr_id={data.enc_id}
                                    isTalentHrCancelled={data.current_talent_hr?.badgeName == 'Cancelled'}
                                    is_applied={data.is_applied}
                                    singleOppMobile
                                    setIsHeaderVisible={() => { }}
                                    handleCustomizeResume={handleCustomizeResume}
                                    hideApplyCta={hideApplyCta}
                                />
                                <BottomActionDrawer
                                    data={data}
                                    isTalentHired={isTalentHired(talentStatus)}
                                    user={user}
                                    handleCustomizeResume={handleCustomizeResume}
                                    hasTailoredCV={hasTailoredCV}
                                    openReferralModal={openReferralModal}
                                    setReferralPayloadHtml={setReferralPayloadHtml}
                                    hideApplyCta={hideApplyCta}
                                />
                            </>
                        }
                        <>
                            {!is_tailored_eligible && !isTalentHired(talentStatus) && !isOppDisabled &&
                                (!markedNotInterested && !data.job_not_interested) &&
                                <JobDetailsResumePromo hrData={data} />
                            }
                            {!data.is_valid_outreach_job &&
                                <div
                                    className="old-job-alert"
                                    role="status"
                                    aria-live="polite"
                                >
                                    <span className="old-job-alert__mark" aria-hidden="true">!</span>
                                    <div className="old-job-alert__body">
                                        <p className="old-job-alert__title">This job may be outdated or closed</p>
                                        <p className="old-job-alert__text">
                                            This job has been open for a long time. The role might already be{' '}
                                            <strong>closed, filled, or on hold</strong>, or the details may no longer match what is shown.
                                            You can still continue — replies are often less likely than on newer postings.
                                        </p>
                                    </div>
                                </div>
                            }
                            {data.skill_boolean?.length > 0 ?
                                <div className="opportunitiesSKillsDiv">
                                    <div>
                                        <label>Skills :</label>
                                        <div className="skill_boolean">
                                            {data.skill_boolean.map((skill_varients, index) => (
                                                <div className="skill_varients" key={"skill_" + index}>
                                                    {skill_varients.map((skill, index) => (
                                                        <React.Fragment key={'skill_varients_' + index}>
                                                            {index > 0 && <strong>Or</strong>}
                                                            <div className="varient">
                                                                {skill}
                                                            </div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                :
                                <>
                                    {data.skills?.length > 0 &&
                                        <div className="opportunitiesSKillsDiv">
                                            <div>
                                                <label>Must have skills required :</label>
                                                <div className="must_have">
                                                    {data.skills?.filter(item => item.skill.type == "must_have")?.map(item => item.skill.name).join(', ')}
                                                </div>
                                            </div>
                                            {data.skills?.filter(item => item.skill.type == "good_to_have").length > 0 &&
                                                <div className="good_to_have">
                                                    <label>Good to have skills :</label>
                                                    <div>
                                                        {data.skills?.filter(item => item.skill.type == "good_to_have")?.map(item => item.skill.name).join(', ')}
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    }
                                </>
                            }
                        </>
                        {/* } */}
                        <div className="jobDescription">
                            {data.JobDescription &&
                                <HSContent
                                    content={data.JobDescription}
                                    isAggregatorContent={data.aggregator == 'himalayas'}
                                // alreadyEnagaged={data.is_applied || data.screening_status}

                                />
                            }
                        </div>
                        {data.matcherArray && <MatcherInfo data={data} matcherData={data.matcherArray} isOppDisabled={isOppDisabled} opportunityType={"individualHr"} singleOppMobile />}

                        <SimilarJobs similarJobObj={similarJobObj} hrDetails={data} />
                        {(Object.keys(data).length > 0) &&
                            <AboutCompany hr_id={data?.id} isOppDisabled={isOppDisabled} companyData={data?.company} />
                        }
                    </div>
                </>
            }
        </>
    )
}

const OppStatusMessgae = ({ data }) => {
    return (
        <>
            {data.frontend_data && data.frontend_data.frontend_message &&
                <div className={`oppStatMsg`}>

                    <div
                        className={`opportunitiesJobNote`}
                        style={{
                            "backgroundColor": data.frontend_data.frontend_message_color,
                            "borderColor": data.frontend_data.frontend_message_color,
                        }}
                        dangerouslySetInnerHTML={{ __html: data.frontend_data.frontend_message }}
                    >
                    </div>
                </div >
            }
        </>
    )
}

const SimilarJobs = ({ similarJobObj, hrDetails }) => {

    const handleCardClick = (job, position) => {
        viewJobClickedTracking(job, hrDetails, position)
        talentRelevancyTracking(hrDetails, position, {}, {}, {}, 'card', 'single-opportunities-similar', job)
        window.open(getJobAgentSimilarJobHref(job), '_blank');
    }

    const [hideSection, setHideSection] = useState(false);

    useEffect(() => {
        if (Array.isArray(similarJobObj) && similarJobObj.length == 0) {
            setTimeout(() => {
                setHideSection(true)
            }, 2000)
        }

    }, [similarJobObj])

    return (
        <>
            {!hideSection &&
                <div className={`similar-jobs ${(Array.isArray(similarJobObj) && similarJobObj.length == 0) ? 'fade' : ''}`}>
                    <div className="header">
                        <span>Similar Jobs</span>
                        {Array.isArray(similarJobObj) &&
                            <a className="view-all-job-link" onClick={viewAllJobsClickedTracking} href={HAPPPY_ALL_JOBS_PATH} target="_blank">View all jobs</a>
                        }
                    </div>
                    <div className="job-list">
                        {similarJobObj === null &&
                            [...Array(4)].map((item, index) => (
                                <div key={"similarJobLoadingCard" + index} className="oppHead job-card similarJobLoadingCard" >
                                    <div className="jobTitle">
                                        <div className="logo">
                                        </div>
                                        <div className="content">
                                            <h6></h6>
                                            <span className="companyName"></span>
                                        </div>
                                    </div>
                                    <div className="jobAttribs">
                                        <ul className="attribs">
                                            <span className="remote-tag">
                                            </span>
                                            <span className="experience">
                                            </span>
                                        </ul>
                                    </div>
                                </div>
                            ))
                        }
                        {Array.isArray(similarJobObj) &&
                            <>
                                {similarJobObj.length == 0 &&
                                    <div className="noSimilarJobs">
                                        No Similar Jobs found
                                    </div>
                                }
                                {similarJobObj?.map((job, index) => (
                                    <div key={job.id} className="oppHead job-card" onClick={() => handleCardClick(job, index + 1)}>
                                        <div className="jobTitle">
                                            <div className="logo">
                                                <SimilarJobsCompanyLogo job={job} />
                                            </div>
                                            <div className="content">
                                                <h6>{job.title}</h6>
                                                <span className="companyName">{job.company}</span>
                                            </div>
                                        </div>
                                        <div className="jobAttribs">
                                            <ul className="attribs">
                                                {job.experience &&
                                                    <span>
                                                        <img src={IMAGE_URL + "work/award-icon.svg"} alt="award-icon" />
                                                        {job.experience}
                                                    </span>
                                                }
                                                {job.ModeOfWork &&
                                                    <span>
                                                        <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
                                                        {job.ModeOfWork?.toLowerCase() == "remote" ?
                                                            "Remote" + (job.city ? (" - " + job.city) : '')
                                                            :
                                                            <>
                                                                {job.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (job.job_location?.length > 0 ?
                                                                    (" - " + (job.job_location?.length == 1 ? job.job_location[0]?.city_name : `${job.job_location[0]?.city_name}...+${job.job_location?.length - 1}more`)) : ''))}
                                                                {job.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (job.job_location?.length > 0 ?
                                                                    (" - " + (job.job_location?.length == 1 ? job.job_location[0]?.city_name : `${job.job_location[0]?.city_name}...+${job.job_location?.length - 1}more`)) : ''))}
                                                            </>
                                                        }
                                                    </span>
                                                }
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </>
                        }
                    </div>
                </div>
            }
        </>
    );
};

const SimilarJobsCompanyLogo = ({ job }) => {
    const [showInitials, setShowInitials] = useState(false);

    useEffect(() => {
        if (job?.company_logo) {
            const img = new Image();
            img.src = job.company_logo;

            img.onload = () => setShowInitials(false);

            img.onerror = () => setShowInitials(true);
        } else {
            setShowInitials(true);
        }
    }, [job?.company_logo]);

    return showInitials ? (
        <div className="custom_company_initialBg">
            <div className="custom_company_initial">
                <h6>{job?.company_name_initials}</h6>
            </div>
        </div>
    ) : (
        <img className="job-img" src={job?.company_logo} alt="companyLogo" />
    );
};


function BottomActionDrawer({ data, isTalentHired, hasTailoredCV, handleCustomizeResume, openReferralModal, setReferralPayloadHtml, hideApplyCta = false }) {
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const handleApply = () => {
        let applyBtn = document.getElementById(`${data.enc_id}+singleOppAppyBtn`)
        if (applyBtn) {
            applyBtn.setAttribute('data-cta-name', 'sticky');
            applyBtn.click()
        }
    }

    const [isReferralAgentResumeModalVisible, setIsReferralAgentResumeModalVisible] = useState(false);

    const selectResumeForAgent = () => {
        if (hasTailoredCV) {
            setIsReferralAgentResumeModalVisible(true)
        } else {
            openReferralModal()
        }
    };
    const closeReferralAgentResumeModal = () => setIsReferralAgentResumeModalVisible(false);

    const handleAgentWithProfileResume = () => {
        setIsReferralAgentResumeModalVisible(false);
        // run Happpy Agent with profile resume - no change in flow
        openReferralModal()
    }

    const handleAgentWithTailoredResume = (payloadHtml) => {
        setIsReferralAgentResumeModalVisible(false);
        // run Happpy Agent with tailored resume
        setReferralPayloadHtml(payloadHtml);
        openReferralModal();
    };


    const handleApplyWithTailorCV = () => {
        handleCustomizeResume('customize_resume_and_apply', 'tailor_directly');
    }

    const handleAgentWithTailorCV = () => {
        if (!user?.outreach?.onboard_with_agent) {
            const reference = window.location.href;
            window.open('/talent/referral-ai-agent?reference=' + reference, '_blank');
            return;
        }
        handleCustomizeResume('referral_agent_with_tailored_resume');
    }

    const showAgentCta = data.is_outreach_eligible && user?.outreach?.is_eligible;

    if (hideApplyCta && !showAgentCta) {
        return null;
    }

    return (
        <div className="bottomActionDrawer">
            {/* {hasTailoredCV &&
                <ReferralAgentResumeModal
                    isOpen={isReferralAgentResumeModalVisible}
                    onClose={closeReferralAgentResumeModal}
                    hrID={data.enc_id}
                    HR_Number={data.HR_Number}
                    onWithProfileResume={handleAgentWithProfileResume}
                    onWithTailoredResume={handleAgentWithTailoredResume}
                />
            } */}
            {showAgentCta ?
                hideApplyCta ?
                    <button className={`primaryBtn applyWithTailorCVBtn`}
                        onClick={handleAgentWithTailorCV}
                        style={{ width: '100%' }}
                    >
                        Run Happpy Agent
                    </button>
                    :
                <div className="two-btns">
                    <button className="primaryBtn" onClick={handleApply} disabled={isTalentHired} style={{ "flex": "unset" }}>
                        {getApplyButtonText(data.aggregator_application_link, data.aggregator)}
                        {data.aggregator_application_link &&
                            <span className="aggregator-apply-link" style={{ display: 'inline-flex' }}>
                                <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </span>
                        }
                    </button>
                    <button className={`primaryBtn applyWithTailorCVBtn`}
                        onClick={handleAgentWithTailorCV}
                        style={{ "flex": 1, fontSize: "10px" }}
                    >
                        Run Happpy Agent
                    </button>
                </div>
                :
                !hideApplyCta &&
                <button className="primaryBtn" onClick={handleApply} disabled={isTalentHired}>
                    {getApplyButtonText(data.aggregator_application_link, data.aggregator)}
                    {data.aggregator_application_link &&
                        <span className="aggregator-apply-link" style={{ display: 'inline-flex' }}>
                            <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </span>
                    }
                </button>
            }

            {/* {user?.outreach?.onboarding_phase == 1 &&
                <div className="two-btns">
                    {!(data.is_applied && !hasTailoredCV) &&
                        <button className={`primaryBtn applyWithTailorCVBtn`} onClick={handleApplyWithTailorCV}>
                            {hasTailoredCV ? `View Tailored Resume` : `Tailor Resume & Apply`}
                        </button>
                    }
                    {data.is_outreach_eligible && user?.outreach?.is_eligible &&
                        <button className="outlinedBtn outreachBtn" onClick={handleAgentWithTailorCV}>
                            Run Happpy Agent
                        </button>
                    }
                </div>
            } */}
        </div>
    )
}