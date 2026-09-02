
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "@/talent/navigation/routerCompat";
import Slider from "react-slick";
import { toast as toastify } from "react-toastify";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { BookmarkNotification } from "../../../assets/BookmarkNotify";
import { ArrowRightIcon } from "../../../assets/IconSVG";
import { IMAGE_URL } from "../../../components/Constant";
import { formattedINRJobBudget, formattedYOE, isTalentHired } from "../../../components/Helper";
import { getJobAgentSimilarJobHref } from "../../../helpers/jobPath";
import Loader from "../../../components/Loader";
import { jobNotInterestedTrack, talentBookMarkTrack, talentRelevancyTracking, viewJobClickedTracking } from "../../../helpers/Mixpanel";
import { ADD_SIMILAR_JOBS, CLOSE_SIGNUP_APPLY_FLOW, HR_UPDATE_NEEDED, OPEN_SIGNUP_APPLY_FLOW, SET_BOOKMARK_SIMILAR_JOBS, SET_LOADER, SET_TAILOR_MODAL_OPEN, SET_TOUCHPOINT_DATA, UPDATE_WORK_CONTROL } from "../../../store/actions/actionsTypes";
import { fetchTouchpointsQuestion, getSimilarJob, getSingleOpportunity, getTalentHrApplyStatus, oppBookmark, storeJobNotInterested } from "../../../store/actions/UserActions";
import ManagePreferencesModal from "../preferences/ManagePreferencesModal";
import HSContent from "./HSContent";
import AboutCompany from "./AboutCompany";
import CompanyLogo from "./CompanyLogo";
import { differenceInMonths } from "date-fns";
import ConfirmAppliedCard from "../../../components/extensionModal/ConfirmAppliedCard";
import ReferralAgentModal from "../../../components/ReferralAgentModal";
import { trackTailorPricePopupOpen } from "../../../store/actions/trackingActions";
import AiScreeningRequired from "./AiScreeningRequired";
import CustomQuesNeeded from "./CustomQuesNeeded";
import EstimatedSalaryPill from "./EstimatedSalaryPill";
import JobDetailsApply from "./JobDetailsApply";
import JobHeaderSticky from "./JobHeaderSticky";
import MatcherInfo from "./MatcherInfo";
import NotInterested from "./modals/NotInterested";
import UplersPartnerBadge from "./UplersPartnerBadge";
import JobDetailsResumePromo from "../resume/nudges/JobDetailsResumePromo";
import ReferralAgentResumeModal from "../../../components/ReferralAgentResumeModal";
import SkipTailorOptionModal, { useSkipTailorOptionPromise } from "../../../components/SkipTailorOptionModal";
import ReferralAgentPreviewModal from "../../../components/ReferralAgentPreviewModal";

export default function JobDetails({
    data, allOpportunity, setAllOpportunity, setActiveJob, bookmarkCount, setBookmarkCount,
    isBookmarkedActive, hideApplyCta = false,
}) {
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate();

    const hasTailoredCV = data.tailored_status == 2 || sessionStorage.getItem('tailored_resume_generated_' + data.HR_Number);

    const { applyingHrNo, applyFlowData, openSignupFlow } = useSelector(state => state.work)
    const { control: { afterTouchPointSteps } } = applyFlowData[applyingHrNo];

    const [fetchingUpdate, setFetchingUpdate] = useState(false)

    const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);
    const [isReferralAgentResumeModalVisible, setIsReferralAgentResumeModalVisible] = useState(false);
    const [payloadHtml, setPayloadHtml] = useState('');
    const [messageTemplateIds, setMessageTemplateIds] = useState({});

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
        setPayloadHtml(payloadHtml);
        openReferralModal();
    }

    const openReferralModal = () => setIsReferralModalVisible(true);
    const closeReferralModal = () => {
        setIsReferralModalVisible(false);
        setMessageTemplateIds({});
    };

    const handleSubmit = (text) => {
        console.log("Submitted reason:", text);
    };

    useEffect(() => {
        if (searchParams.get('directApply') == 'true' && data.HR_Number) {
            if (!data.is_applied) {
                dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: data })
                getTouchPointers(data.HR_Number)
            }
            searchParams.delete('directApply');
            setSearchParams(searchParams);
        }
    }, [searchParams])


    const getSingleHrData = (hrNo) => {
        setFetchingUpdate(true)
        getSingleOpportunity(hrNo)(dispatch)
            .then((res) => {
                updateJobData(res.data)
                if (searchParams.get('is_additional_screening') == 'true') {
                    if (res.data.custom_screening_needed) {
                        dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: res.data })
                    } else {
                        searchParams.delete('is_additional_screening');
                        setSearchParams(searchParams);
                    }
                }
            })
            .finally(() => {
                setFetchingUpdate(false)
            })
    }

    const getApplyStatus = (hrNo) => {
        getTalentHrApplyStatus(hrNo)(dispatch)
            .then((res) => {
                dispatch({ type: UPDATE_WORK_CONTROL, payload: { applyStatus: res.data.data, HR_Number: hrNo } })
            })
    }
    useEffect(() => {
        if (afterTouchPointSteps && applyingHrNo == data.HR_Number) {
            if (!data.screening_status || (data.is_applied && data.custom_screening_needed)) {
                getApplyStatus(data.HR_Number)
                getSingleHrData(data.HR_Number)
            }
            dispatch({ type: UPDATE_WORK_CONTROL, payload: { afterTouchPointSteps: false, HR_Number: data.HR_Number } })
        }
    }, [afterTouchPointSteps])

    const updateJobData = (resData) => {
        let newData = allOpportunity.map(item => item.enc_id == data.enc_id ? resData : item);
        setAllOpportunity(newData)
    }


    const bookmarkHandled = useRef(false);
    useEffect(() => {

        const handleBookmark = () => {
            if (window.location.search.includes('is_bookmark=1') && !bookmarkHandled.current && Object.keys(data).length > 0) {
                bookmarkHandled.current = true;
                handleOppBookmark(null, true);
            }
        };

        handleBookmark();
    }, [data]);



    const [isOppDisabled, setOppDisabled] = useState(false);
    const [markedNotInterested, setMarkedNotInterested] = useState(false)
    const { user } = useSelector(state => state.auth)
    const { status: talentStatus, recruitment_data } = user;
    // const { is_tailored_eligible, is_tailored_paid } = user.resume_tailored;
    const { is_tailored_paid: is_tailored_eligible } = user.resume_tailored; // need to remove after allowing new user to tailor
    const { isLoading } = useSelector(state => state.loader)
    const { similarJobs } = useSelector(state => state.opps)
    const similarJobObj = similarJobs[data.HR_Number]
    const dispatch = useDispatch()

    useEffect(() => {
        if (data.status == 0 || data.status == 2 || data.status == 3 || data.HR_Status == 'Lost' || data.HR_Status == 'Cancelled' ||
            data.HR_Status == 'Completed' ||
            (data.HR_Status == 'Paused' && !data.is_applied) || data.HR_Status == 'Won' || data.HR_Status == 'Expired'
        ) {
            setOppDisabled(true)
        } else {
            setOppDisabled(false)
        }
    }, [data]);

    useEffect(() => {
        const jobDetailSection = document.getElementById('jobDetailSectionHead');
        if (jobDetailSection) {
            jobDetailSection.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
        if (openSignupFlow && applyingHrNo == data.HR_Number) {
            if (data.is_applied) {
                dispatch({ type: CLOSE_SIGNUP_APPLY_FLOW })
            } else {
                getTouchPointers(data.HR_Number)
            }
        }
        if (!data.job_not_interested) {
            setMarkedNotInterested(false)
        }
        setShowSimilarJobs(false)

        detailsRef.current.addEventListener('scroll', handleScroll, true);
        return () => {
            detailsRef.current?.removeEventListener('scroll', handleScroll, true);
        };
    }, [data.HR_Number]);


    const detailsRef = useRef(null);
    const [showSimilarJobs, setShowSimilarJobs] = useState(false);
    const handleScroll = (e) => {
        const show = e.target.scrollTop > 500;
        setShowSimilarJobs(show);
    };

    useEffect(() => {
        if (showSimilarJobs && !similarJobObj && !similarJobLoading) {
            getSimilarJobObj(data.HR_Number, user.email)
        }
    }, [showSimilarJobs]);



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

    const [similarJobLoading, setSimilarJobLoading] = useState(false);

    const getSimilarJobObj = (hrNo, email) => {
        setSimilarJobLoading(true)
        getSimilarJob(hrNo, email, { aggregatedJobs: true })(dispatch)
            .then((res) => {
                if (res.data.data) {
                    let result = [...res.data.data];
                    dispatch({ type: ADD_SIMILAR_JOBS, payload: { HR_Number: hrNo, data: result } })
                }
            })
            .finally(() => {
                setSimilarJobLoading(false)
            });
    };

    const onSubmitNotInterested = () => {
        setMarkedNotInterested(true);
        dispatch({ type: HR_UPDATE_NEEDED, payload: { HR_Number: data.HR_Number, job_not_interested: true } });
    }

    const onUndoNotInterested = () => {
        setMarkedNotInterested(false);
        dispatch({ type: HR_UPDATE_NEEDED, payload: { HR_Number: data.HR_Number, job_not_interested: false } });
    }

    const undoHandler = () => {
        jobNotInterestedTrack(
            {
                hr_data: data,
                cta_name: 'reset_not_interested',
                reasons: null,
                from_where: "singleHr",
                badge_or_msg: "message"
            },
            data
        )
        let payload = {
            hr_number: data.HR_Number,
            reset_not_interested: true
        }
        storeJobNotInterested(payload)(dispatch)
            .then((res) => {
                onUndoNotInterested()
            })
            .catch((err) => {
                console.log('err', err);
                toast.error('Something went wrong!')
            })
    }

    const handleOppBookmark = (e, forceTrue = false) => {
        let oldValue = data.is_saved;
        talentBookMarkTrack(data, !oldValue ? 'add' : 'remove', 'opportunity-details')
        let reqMap = {
            "hr_id": data.enc_id,
            "type": forceTrue ? 'add' : (!oldValue ? 'add' : 'remove')
        }
        dispatch({ type: SET_LOADER, payload: true })
        oppBookmark(reqMap)(dispatch)
            .then((res) => {
                if (res.data.status == "success") {
                    let newData = allOpportunity.map(item => item.enc_id == data.enc_id ? { ...item, is_saved: !oldValue } : item);
                    setAllOpportunity(newData)

                    toastify.success(
                        <BookmarkNotification
                            role={data.role}
                            newValue={!oldValue}
                        />,
                        {
                            position: 'bottom-center',
                            theme: 'dark',
                            closeOnClick: false,
                            autoClose: 3000,
                        });
                    if (isBookmarkedActive) {
                        setTimeout(() => {
                            let newOpp = [...allOpportunity];
                            newOpp = newOpp.filter(item => item.HR_Number != data.HR_Number);
                            setAllOpportunity(newOpp)
                            setActiveJob(newOpp[0] || {});
                            setBookmarkCount(bookmarkCount - 1)
                        }, 1000)
                    } else {
                        setBookmarkCount(!oldValue ? bookmarkCount + 1 : bookmarkCount - 1)
                        setActiveJob({ ...data, is_saved: !oldValue });
                    }
                }
            })
            .catch((err) => {
                console.log('Error', err);
                let newData = allOpportunity.map(item => item.enc_id == data.enc_id ? { ...item, is_saved: !oldValue } : item);
                setAllOpportunity(newData)
            })
    }

    const handleApplyWithTailorCV = () => {
        handleCustomizeResume('customize_resume_and_apply', 'tailor_directly');
    }

    const handleAgentWithTailorCV = (e) => {
        if (!user?.outreach?.onboard_with_agent) {
            const reference = window.location.href;
            window.open('/talent/referral-ai-agent?reference=' + reference, '_blank');
            return;
        }
        handleCustomizeResume('referral_agent_with_tailored_resume');

    }
    const { open: openSkipTailorOptionModal, isOpen: skipTailorOptionModalOpen, onResolve: resolveSkipTailorOption, onClose: closeSkipTailorOption } =
        useSkipTailorOptionPromise();

    const handleSkipTailorOption = () => openSkipTailorOptionModal();

    const isMobile = window.innerWidth <= 768;

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
                    setPayloadHtml('');
                    setShowPreviewModal(true);
                    // openReferraxlModal();
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
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const handleAfterPreviewModal = ({ linkedin_message_id, gmail_message_id } = {}) => {
        setMessageTemplateIds({ linkedin_message_id, gmail_message_id });
        openReferralModal();
        setShowPreviewModal(false);
    }


    return (
        <div className={`jobDetailSection ${isOppDisabled ? 'isOppDisabled' : ''}`} ref={detailsRef}>
            {isLoading && <Loader />}

            <ReferralAgentModal
                isOpen={isReferralModalVisible}
                closeReferralAgentModal={closeReferralModal}
                onSubmit={handleSubmit}
                source="all-job-main-cta"
                hrID={data.enc_id}
                payloadHtml={payloadHtml}
                linkedin_message_id={messageTemplateIds.linkedin_message_id}
                gmail_message_id={messageTemplateIds.gmail_message_id}
            />
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
            <SkipTailorOptionModal isOpen={skipTailorOptionModalOpen} onResolve={resolveSkipTailorOption} onClose={closeSkipTailorOption} />
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

            {fetchingUpdate && !isLoading && !openSignupFlow &&
                <Loader pageLoader={true} />
            }
            {(!data?.is_partner_company ||
                (data?.is_partner_company &&
                    (isOppDisabled || data?.status == 1 || data?.current_talent_hr?.badgeName == 'Rejected')
                )
            ) && !openSignupFlow &&
                <ManagePreferencesModal />
            }
            {!isMobile && data.enc_id && !isOppDisabled && (!markedNotInterested && !data.job_not_interested) &&
                <JobHeaderSticky
                    data={data}
                    isHeaderVisible={isHeaderVisible}
                    handleCustomizeResume={handleCustomizeResume}
                    handleAgentWithTailorCV={handleAgentWithTailorCV}
                    hideApplyCta={hideApplyCta}
                />
            }
            <div className="jobDetailsHead" id="jobDetailSectionHead">
                {(data.top_badge || data.is_partner_company || data.applied_at || (data.frontend_data && data.frontend_data.frontend_label)) &&
                    <div className="jobDetailsHeadTop">
                        {(data.top_badge || data.is_partner_company || data.applied_at) &&
                            <div className="top-nudges">
                                {data.top_badge &&
                                    <div className={`${data.is_partner_company ? 'has-right-dot' : ''}`}>
                                        <div
                                            className="earlyApplicant"
                                            dangerouslySetInnerHTML={{ __html: data.top_badge }}
                                        >
                                        </div>
                                    </div>
                                }
                                {data.applied_at &&
                                    <div className="appliedAt">
                                        <span>Applied {data.applied_at}</span>
                                    </div>
                                }
                                {(data.is_partner_company && data.company.company_name != "Uplers") &&
                                    <UplersPartnerBadge data={data} fullText isTooltip={true} />
                                }

                            </div>
                        }


                        {data.frontend_data && data.frontend_data.frontend_label &&
                            <label
                                className={`oppHeadActionTag`}
                                style={{
                                    "color": data.frontend_data.frontend_label_color,
                                    "backgroundColor": data.frontend_data.frontend_message_color
                                }}
                            >
                                {data.frontend_data.frontend_label}
                            </label>
                        }
                    </div>
                }

                <div className="jobTitle">
                    <div className="logo">
                        <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                    </div>
                    <div className="main">
                        <h5 >
                            {data.RequestForTalent}
                        </h5>
                        <span className="companyName">{data.company?.company_name}</span>
                    </div>
                </div>

                {(markedNotInterested || data.job_not_interested) ?
                    <div className="notInterested notInterstedMsgAction">
                        This job has been marked as <strong>'Not interested'</strong>, undo this action to apply
                        <button className="ghostBtn blue" onClick={undoHandler}>undo</button>
                    </div>
                    :
                    <>
                        <div className="actionBtns">
                            <div className="primary">
                                {!hideApplyCta && !data.is_applied && !isTalentHired(talentStatus) && !isOppDisabled &&
                                    (!markedNotInterested && !data.job_not_interested) &&
                                    <JobDetailsApply
                                        data={data}
                                        setIsHeaderVisible={setIsHeaderVisible}
                                        handleCustomizeResume={handleCustomizeResume}
                                    />
                                }

                                {data.is_outreach_eligible && user?.outreach?.is_eligible &&
                                    <>
                                        {/* {user?.outreach?.onboarding_phase == 1 &&
                                            <>
                                                <button className={`outlinedBtn outreachBtn`} onClick={handleApplyWithTailorCV}>
                                                    {hasTailoredCV ? `View Tailored Resume` : `Tailor Resume ${data.aggregator_application_link ? '' : '& Apply'}`}
                                                </button>
                                                <button className={`outlinedBtn outreachBtn`}
                                                    onClick={selectResumeForAgent}>
                                                    Run Happpy Agent
                                                </button>
                                                <button className={`primaryBtn applyWithTailorCVBtn`}
                                                    onClick={handleAgentWithTailorCV}>
                                                    Tailored Resume +  Happpy Agent
                                                </button>
                                            </>
                                        } */}
                                        {/* {user?.outreach?.onboarding_phase == 2 && */}
                                        <button className={`primaryBtn applyWithTailorCVBtn`}
                                            onClick={handleAgentWithTailorCV}>
                                            Run Happpy Agent
                                        </button>
                                        {/* } */}
                                    </>
                                }

                            </div>

                            <div className="right-btns">
                                <button
                                    className={`outlinedBtn saveBtn ${data.is_saved ? 'saved' : ''}`}
                                    onClick={handleOppBookmark}
                                    title={data.is_saved ? 'Remove from Saved Jobs' : 'Add to Saved Jobs'}
                                >
                                    <svg width="0.6875rem" height="0.875rem" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                {!data.is_applied &&
                                    <div className="notInterestedSection">
                                        <NotInterested
                                            thumbDownIcon
                                            hrData={data}
                                            afterSubmit={onSubmitNotInterested}
                                            markedNotInterested={markedNotInterested}
                                            onUndoNotInterested={onUndoNotInterested}
                                        />
                                    </div>
                                }
                            </div>
                        </div>

                        {!data.is_applied && !isTalentHired(talentStatus) && !isOppDisabled &&
                            (!markedNotInterested && !data.job_not_interested) &&
                            user?.last_preference_at &&
                            differenceInMonths(new Date(), new Date(user?.last_preference_at)) >= 3 &&
                            <div className="old-details-warning">
                                ⚠️ Your details are outdated (3+ months) and will not help you get noticed among recruiters.
                                &nbsp;
                                <Link to="/talent/manage-preferences" >Update your profile now</Link>
                            </div>
                        }



                    </>
                }

                {!data?.is_valid_outreach_job &&
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

                {/* {!data.is_applied && !isTalentHired(talentStatus) && !isOppDisabled &&
                    (!markedNotInterested && !data.job_not_interested) &&
                    data.aggregator_application_link &&
                    <SingleJobResumeBanner />
                } */}
                <div className="attribs">
                    {data.YearOfExp &&
                        <div className="attrib">
                            <ExpIcon />
                            {formattedYOE(data.YearOfExp, data.max_yoe)}
                        </div>
                    }

                    {data.cost_string &&
                        <div className="attrib">
                            <MoneyIcon />
                            {formattedINRJobBudget(data.cost_string)}
                        </div>
                    }
                    {data.cost_string?.toLowerCase() === 'confidential' && !data.is_partner_company && (
                        <EstimatedSalaryPill hrData={data} />
                    )}

                    {data.ModeOfWork &&
                        <div className="attrib">
                            <LocationIcon />
                            {data.ModeOfWork?.toLowerCase() == "remote" ?
                                "Remote" + (data.city ? (" - " + data.city) : '')
                                :
                                <>
                                    {data.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (data.job_location?.length > 0 ?
                                        (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
                                    {data.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (data.job_location?.length > 0 ?
                                        (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
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
                        </div>
                    }
                    {data.pricingModel &&
                        <div className="attrib">
                            <BriefcaseIcon />
                            {data.pricingModel}
                            {data.pricingModelIText &&
                                <span className="dpInfoTag">
                                    <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                    <span className="dpInfoTagHover">
                                        {data.pricingModelIText}
                                    </span>
                                </span>
                            }
                        </div>
                    }

                    {(data.shifts?.length > 0 && data.HRTypeText !== "Pay Per Credit") &&
                        <div className="attrib">
                            <ClockIcon />
                            <span className="shiftInfo" >{data.shifts[0].ist_shift_time} IST
                                <span className="shiftInfoHover">
                                    {data.shifts[0].shift}
                                </span>
                            </span>
                        </div>
                    }

                    {data?.ModeOfWork == "Hybrid" && data.frequency_office_visit &&
                        <div className='hybridFrequency'>
                            Frequency of office visits:<strong>{data.frequency_office_visit}</strong>
                        </div>
                    }
                </div>

                {Object.keys(data).length > 0 && isTalentHired(talentStatus) &&
                    <div className="talentDeployedBanner">
                        <img src={IMAGE_URL + 'work/partyPopperDeployed.svg'} />
                        <div className="content">
                            <h5>Congratulations! Your engagement with&nbsp;
                                {recruitment_data.length == 0 ? 'client' : recruitment_data[recruitment_data.length - 1].company?.company_name}&nbsp;has successfully started</h5>
                            <span>
                                <p className="excited">We're excited for you!</p>
                                <p>Please note that while your engagement is active, you won't be able to apply for other opportunities.
                                    But don't worry; this engagement will be a great learning experience for you.
                                    It is advised to you to focus on engagement and deliver your best.
                                    We are waiting to see your outstanding contribution to your engagement!
                                </p>
                            </span>
                        </div>
                    </div>
                }
            </div>


            {!isOppDisabled &&
                <>
                    <ConfirmAppliedCard hrData={data} />
                </>
            }


            {data.is_applied && !isOppDisabled &&
                <>
                    {data.custom_screening_needed ? <CustomQuesNeeded hrData={data} jobDetailsPC />
                        :
                        data.ai_needed && <AiScreeningRequired hrData={data} aiData={data.ai_data} />
                    }
                </>
            }

            {(!isOppDisabled && !(data.is_applied && data.screening_status && data.ai_needed) && data.current_talent_hr) &&
                <div className={`oppStatMsg`}>
                    {data.frontend_data && data.frontend_data.frontend_message &&
                        <div
                            className={`opportunitiesJobNote`}
                            style={{
                                "backgroundColor": data.frontend_data.frontend_message_color,
                                "borderColor": data.frontend_data.frontend_message_color,
                            }}
                            dangerouslySetInnerHTML={{ __html: data.frontend_data.frontend_message }}
                        >
                        </div>
                    }
                </div>
            }

            {data.skill_boolean?.length > 0 ?
                <div className="skills">
                    {!is_tailored_eligible && !isTalentHired(talentStatus) && !isOppDisabled &&
                        (!markedNotInterested && !data.job_not_interested) &&
                        <JobDetailsResumePromo hrData={data} />
                    }
                    <div>
                        <label>Must Have Skills :</label>
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
                        <div className="skills">
                            {!is_tailored_eligible && !isTalentHired(talentStatus) && !isOppDisabled &&
                                (!markedNotInterested && !data.job_not_interested) &&
                                <JobDetailsResumePromo hrData={data} />
                            }
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
            {/* </>
            } */}
            <div className="detailSectionDiv">
                <div className="jobDescription">
                    {data.JobDescription &&
                        <HSContent content={data.JobDescription} isAggregatorContent={data.aggregator == 'himalayas'} />
                    }
                </div>
                {data.matcherArray && <MatcherInfo data={data} matcherData={data.matcherArray} isOppDisabled={isOppDisabled} opportunityType={"individualHr"} />}
            </div>

            {!isOppDisabled && <SimilarJobs similarJobObj={similarJobObj} hrDetails={data} />}

            {(Object.keys(data).length > 0) &&
                <div className="aboutCompanyWrapper">
                    <AboutCompany hr_id={data?.id} isOppDisabled={isOppDisabled} companyData={data?.company} />
                </div>
            }
        </div>
    )
}

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



const SimilarJobs = ({ hrDetails, similarJobObj }) => {
    const dispatch = useDispatch()

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



    const onBookmarkClick = (e, data) => {
        e.stopPropagation();
        let oldValue = data.is_saved;
        let reqMap = {
            "hr_id": data.enc_id,
            "type": !oldValue ? 'add' : 'remove'
        }

        dispatch({ type: SET_LOADER, payload: true })
        oppBookmark(reqMap)(dispatch)
            .then((res) => {
                if (res.data.status == "success") {
                    toastify.success(
                        <BookmarkNotification
                            role={data.role}
                            newValue={!oldValue}
                            undoAllowed={true}
                            onUndo={() => onBookmarkClick(e, data)}
                        />,
                        {
                            position: 'bottom-center',
                            theme: 'dark',
                            closeOnClick: false,
                            autoClose: 3000,
                        }
                    );

                    dispatch({ type: SET_BOOKMARK_SIMILAR_JOBS, payload: { HR_Number: data.HR_Number, data: !oldValue, similarToHR: hrDetails.HR_Number } })
                } else {
                    toast.error('Something went wrong', { duration: 3000 })
                }
            })
            .catch((err) => {
                console.log('Error', err);
                toast.error('Something went wrong', { duration: 3000 })
            })
    }



    var sliderNewOpp = {
        dots: false,
        infinite: false,
        arrows: true,
        speed: 2000,
        autoplaySpeed: 6000,
        autoplay: true,
        slide: '.slick-slideshow__slide',
        slidesToScroll: similarJobObj?.length > 1 ? 3 : 1,
        slidesToShow: 3,
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToScroll: similarJobObj?.length > 1 ? 2 : 1,
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 1100,
                settings: {
                    slidesToScroll: similarJobObj?.length > 1 ? 1 : 1,
                    slidesToShow: 1,
                    autoplay: true,
                }
            }
        ]
    };


    return (
        <>
            {!hideSection &&
                <div className={`similarJobsPc ${(Array.isArray(similarJobObj) && similarJobObj.length == 0) ? 'fade' : ''}`}>
                    <div className="header">
                        Similar Jobs :
                    </div>
                    <div className="job-list">
                        {(!similarJobObj) &&
                            <div className="similarJobLoadingCardContainer">
                                {[...Array(3)].map((item, index) => (
                                    <div key={"similarJobLoadingCard" + index} className="job-card similarJobLoadingCard" >
                                        <div className="job-info">
                                            <div className="job-card-rect">
                                                <div className="job-logo">
                                                </div>
                                                <div className="job-title">
                                                    <h4></h4>
                                                    <p className="company-name"></p>
                                                </div>

                                            </div>
                                        </div>
                                        <div className="job-meta">
                                            <div className="job-meta-badge">
                                                <div className="remote-tag">
                                                    <span>
                                                    </span>
                                                </div>
                                                <span className="experience">
                                                </span>
                                            </div>
                                            <span className="view-job-link ml-auto" >
                                            </span>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        }
                        {Array.isArray(similarJobObj) &&
                            <>
                                {similarJobObj.length == 0 ?
                                    <div className="noSimilarJobs">
                                        No Similar Jobs found
                                    </div>
                                    :
                                    <Slider {...sliderNewOpp}>
                                        {similarJobObj?.map((data, index) => (
                                            <div key={'similarJobCard' + data.id} className="jobCardContainer">
                                                <div className="job-card" onClick={() => handleCardClick(data, index + 1)}>
                                                    <div className="jobTitle">
                                                        <div className="logo">
                                                            <SimilarJobsCompanyLogo job={data} />
                                                        </div>
                                                        <div className="main">
                                                            <h5 >
                                                                {data.title}
                                                            </h5>
                                                            <span className="companyName">{data.company}</span>
                                                        </div>
                                                        <button className={`bookmarkIconBtn ${data.is_saved ? 'saved' : ''}`} onClick={(e) => onBookmarkClick(e, data)}>
                                                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <ul className="attribs">
                                                        {data.experience &&
                                                            <li className="attrib">
                                                                <ExpIcon />
                                                                {data.experience}
                                                            </li>
                                                        }

                                                        {data.ModeOfWork &&
                                                            <li className="attrib">
                                                                <LocationIcon />
                                                                {data.ModeOfWork?.toLowerCase() == "remote" ?
                                                                    "Remote" + (data.city ? (" - " + data.city) : '')
                                                                    :
                                                                    <>
                                                                        {data.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (data.job_location?.length > 0 ?
                                                                            (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : ''))}
                                                                        {data.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (data.job_location?.length > 0 ?
                                                                            (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : ''))}
                                                                    </>
                                                                }
                                                            </li>
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </Slider>
                                }
                            </>
                        }
                    </div>
                </div>
            }
        </>
    );
};

const ExpIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99967 9.99935C10.577 9.99935 12.6663 7.91001 12.6663 5.33268C12.6663 2.75535 10.577 0.666016 7.99967 0.666016C5.42235 0.666016 3.33301 2.75535 3.33301 5.33268C3.33301 7.91001 5.42235 9.99935 7.99967 9.99935Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.47366 9.26057L4.66699 15.3339L8.00033 13.3339L11.3337 15.3339L10.527 9.25391" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)


const MoneyIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_18608_33381)">
            <path d="M15.5312 3.99219H0.46875V12.013H15.5312V3.99219Z" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M8.64206 3.99006L2.10225 1.83203L1.39453 3.97672" stroke="#6B6B6B" stroke-miterlimit="10" />
            <path d="M7.35547 12.0117L13.8953 14.1698L14.6074 12.0117" stroke="#6B6B6B" stroke-miterlimit="10" />
            <path d="M2.40625 3.99219C2.40625 5.06225 1.53881 5.92969 0.46875 5.92969" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M15.5312 5.92969C14.4612 5.92969 13.5938 5.06225 13.5938 3.99219" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M0.46875 10.0742C1.53881 10.0742 2.40625 10.9417 2.40625 12.0117" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M13.5938 12.0117C13.5938 10.9417 14.4612 10.0742 15.5312 10.0742" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M7.99869 9.9505C9.07449 9.9505 9.94659 9.07839 9.94659 8.00259C9.94659 6.92679 9.07449 6.05469 7.99869 6.05469C6.92289 6.05469 6.05078 6.92679 6.05078 8.00259C6.05078 9.07839 6.92289 9.9505 7.99869 9.9505Z" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M3.68619 8H2.95703" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
            <path d="M13.0847 8H12.3555" stroke="#6B6B6B" stroke-miterlimit="10" stroke-linecap="square" />
        </g>
        <defs>
            <clipPath id="clip0_18608_33381">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

const LocationIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 6.66602C14 11.3327 8 15.3327 8 15.3327C8 15.3327 2 11.3327 2 6.66602C2 5.07472 2.63214 3.54859 3.75736 2.42337C4.88258 1.29816 6.4087 0.666016 8 0.666016C9.5913 0.666016 11.1174 1.29816 12.2426 2.42337C13.3679 3.54859 14 5.07472 14 6.66602Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 8.66602C9.10457 8.66602 10 7.77059 10 6.66602C10 5.56145 9.10457 4.66602 8 4.66602C6.89543 4.66602 6 5.56145 6 6.66602C6 7.77059 6.89543 8.66602 8 8.66602Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

const BriefcaseIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.333 4.66602H2.66634C1.92996 4.66602 1.33301 5.26297 1.33301 5.99935V12.666C1.33301 13.4024 1.92996 13.9993 2.66634 13.9993H13.333C14.0694 13.9993 14.6663 13.4024 14.6663 12.666V5.99935C14.6663 5.26297 14.0694 4.66602 13.333 4.66602Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10.6663 14V3.33333C10.6663 2.97971 10.5259 2.64057 10.2758 2.39052C10.0258 2.14048 9.68663 2 9.33301 2H6.66634C6.31272 2 5.97358 2.14048 5.72353 2.39052C5.47348 2.64057 5.33301 2.97971 5.33301 3.33333V14" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

const ClockIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1934_32624)">
            <path d="M7.99967 14.6666C11.6816 14.6666 14.6663 11.6819 14.6663 7.99998C14.6663 4.31808 11.6816 1.33331 7.99967 1.33331C4.31778 1.33331 1.33301 4.31808 1.33301 7.99998C1.33301 11.6819 4.31778 14.6666 7.99967 14.6666Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 4V8L10.6667 9.33333" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_1934_32624">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

function SampleNextArrow(props) {
    const { className, onClick } = props;
    return (
        <div
            className={className}
            onClick={onClick}
        >
            <ArrowRightIcon />
        </div>
    );
}
function SamplePrevArrow(props) {
    const { className, onClick } = props;
    return (
        <div
            className={className}
            onClick={onClick}
        >
            <ArrowRightIcon className="rotate-180" />
        </div>
    );
}

// function SampleNextArrow(props) {
//     const { className, onClick } = props;
//     return (
//         <img src={IMAGE_URL + "work/chevron-right.svg"}
//             className={className}
//             onClick={onClick}
//         />
//     );
// }
// function SamplePrevArrow(props) {
//     const { className, onClick } = props;
//     return (
//         <img
//             src={IMAGE_URL + "work/chevron-left.svg"}
//             className={className}
//             onClick={onClick}
//         />
//     );
// }