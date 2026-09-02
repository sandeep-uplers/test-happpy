import { differenceInMonths, format } from "date-fns";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "@/talent/navigation/routerCompat";
import { NonMandatoryAiIcon, StepperTitleIcon } from "../../../assets/IconSVG";
import { AI_INTERVIEW, IMAGE_URL, TRACK_HR_IDS } from "../../../components/Constant";
import { browserSupportScreening, getApplicationSource, getApplyButtonText, isTalentHired } from "../../../components/Helper";
import AssessmentStatusModal from "../../../components/common/AssessmentStatusModal";
import SkillInfoModal from "../../../components/common/SkillInfoModal";
import { useInView } from "../../../components/common/useInView";
import VideoResumeContainer from "../../../components/profile/video-resume/VideoResumeContainer";
import { useSingleHrContext } from "../../../context/SingleHrContext";
import { applyCtaForOpportunityClicked, checkAiMendatoryOrNot, jobOpportunityPageLandTrack, pageVisitLoadAndCtaTrack, publicOppoApplyCtaTrack, setNewApplicationId, trackAllCtaClickV2 } from "../../../helpers/Mixpanel";
import { applyMandateVr, AssessmentRetest, associateAggreeJobTalent, startHrAssessment } from "../../../store/actions/UserActions";
import { OPEN_SIGNUP_APPLY_FLOW, SET_SINGLEHR_REDIRECT, TOGGLE_ASK_APPLIED } from "../../../store/actions/actionsTypes";
import ManagePreferencesModal from "../preferences/ManagePreferencesModal";
import SingleJobResumeBanner from "../resume/nudges/SingleJobResumeBanner";
import AI_BrowserRestrictModal from "./modals/AI_BrowserRestrictModal";


export default function SingleOppAssessmentNew({ isPublicHrPage, assessments, allData, onApply, isOppDisabled, hr_id, is_applied, isTalentHrCancelled = false, setIsHeaderVisible, handleCustomizeResume, hideApplyCta = false }) {

    const [unqualified, setUnqualified] = useState(false)
    const [aiScreeningTest, setAiScreeningTest] = useState({})
    const [statusOverview, setStatusOverview] = useState({ onlyAiInterview: false, aiCleared: false })
    const { hrId } = useParams();
    const { user } = useSelector(state => state.auth);
    const recruitment_data = user?.recruitment_data;
    const talentStatus = user?.status;
    const singleHRData = useSingleHrContext();
    const [showBrowserValidation, setShowBrowserValidation] = useState(false);


    const dispatch = useDispatch();

    useEffect(() => {
        let newStatus = { ...statusOverview }
        if (assessments?.length == 1 && assessments[0].assessment_tool == AI_INTERVIEW) {
            newStatus.onlyAiInterview = true;
        }
        assessments?.map((item) => {

            if (item.assessment_tool == AI_INTERVIEW) {
                setAiScreeningTest(item)
            }
            if (item.assessment_tool == AI_INTERVIEW && item.status == 4 && (item.result == "Passed" || item.result == 'UnderReview')) {
                newStatus.aiCleared = true;
            }

            if (item.status == 4 && (item.result == "Failed" || item.result == "Disqualified") &&
                !(item.attempt < 2 && item.retest == true && item.retest_days <= 0)) {
                setUnqualified(true);
            }
        })

        setStatusOverview(newStatus)

    }, [])

    useEffect(() => {
        if (!isPublicHrPage && singleHRData) {
            const { data: hrData } = singleHRData;
            jobOpportunityPageLandTrack({
                hrData, talentData: {
                    is_talent_hired: isTalentHired(talentStatus)
                }
            })
        }
    }, [])

    return (
        <div className={`SingleOppAssessment`}>
            {isPublicHrPage ?
                <div className="stepsHead">
                    {!isTalentHrCancelled &&
                        <p className="pendingSteps">
                            <StepperTitleIcon /> How to apply for this job
                        </p>
                    }
                </div>
                :
                <>
                    {!isTalentHrCancelled && !is_applied &&
                        <div className="stepsHead">
                            <>
                                {isTalentHired(talentStatus) ?
                                    <div className="opportunitiesJobNote talentDeployedNote">
                                        We understand that you might be interested in this opportunity, but unfortunately, you cannot apply at this time due to your ongoing engagement with&nbsp;
                                        {recruitment_data.length == 0 ? 'client' : recruitment_data[recruitment_data.length - 1].company?.company_name}
                                    </div>
                                    :
                                    <>
                                        {unqualified ?
                                            <div className="failedStep">
                                                <img src={IMAGE_URL + 'work/single_opp_step_failed.svg'} />
                                                <span>uh oh! Looks like you were unable to clear the Ai Interview round</span>
                                                <span className="unqualifiedTag">
                                                    Unqualified
                                                </span>
                                            </div>
                                            :
                                            <p className="pendingSteps">
                                                <StepperTitleIcon /> How to apply for this job
                                            </p>
                                        }
                                    </>
                                }
                            </>
                        </div>
                    }
                </>
            }

            {is_applied && !allData.aggregator_application_link && !statusOverview.aiCleared && !isTalentHired(talentStatus) && !isPublicHrPage &&
                (!allData.current_talent_hr || allData.current_talent_hr.badgeName != "Rejected") &&
                <>
                    <SingleJobResumeBanner noCloseBtn />
                </>
            }

            {(!is_applied || allData.ai_needed) &&
                <>
                    <div className="assessmentSteps noSteps">

                        <ul>
                            {aiScreeningTest && !isTalentHired(talentStatus) &&
                                <li className={`tech ${statusOverview.aiCleared ? 'completed' : unqualified ? 'unqualified' : ''} `}>
                                    {allData.ai_mandatory == 0 || allData.ai_mandatory == 2 ?
                                        <div className="stepItem">
                                            <div className="applyWithoutScreening">
                                                <NonMandatoryAiIcon />
                                                <div className="para-cta">
                                                    <span>
                                                        {isPublicHrPage ?
                                                            'Hit the "APPLY" button to log in or sign up and complete or verify the required details on the form to apply for this job immediately.'
                                                            :
                                                            allData.ai_mandatory == 2 ?
                                                                "Complete or verify the required details and submit a video resume requested by the client."
                                                                :
                                                                'Complete or verify the required details on the form to apply for this job immediately.'
                                                        }
                                                    </span>
                                                    {isPublicHrPage ?
                                                        <PublicAssessmentCard item={aiScreeningTest} hr_id={hr_id} setIsHeaderVisible={setIsHeaderVisible} hrData={allData} ctaOnly />
                                                        :
                                                        <AssessmentCard
                                                            handleCustomizeResume={handleCustomizeResume}
                                                            item={aiScreeningTest}
                                                            retest={aiScreeningTest.status == 4 && aiScreeningTest.attempt < 2 && aiScreeningTest.retest == true && aiScreeningTest.retest_days <= 0}
                                                            hr_id={hr_id}
                                                            isCandidateDeployed={isTalentHired(talentStatus)}
                                                            unregisteredTalent={talentStatus == 0}
                                                            unqualified={unqualified}
                                                            hrRole={allData.RequestForTalent}
                                                            testsOverview={statusOverview}
                                                            setShowBrowserValidation={setShowBrowserValidation}
                                                            applyWithoutScreening
                                                            setIsHeaderVisible={setIsHeaderVisible}
                                                            aggregatorApplyLink={allData.aggregator_application_link}
                                                            hideApplyCta={hideApplyCta}
                                                        />
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className="stepItem">
                                            <div className={`head`}>
                                                <h6>
                                                    {isPublicHrPage ?
                                                        `Hit the "APPLY" button to log in or sign up and advance to the next steps to apply for this exciting job opportunity!`
                                                        :
                                                        "Fill out the form details and clear the mandatory Ai Interview round requested by the client."
                                                    }
                                                </h6>
                                            </div>
                                            <ul className="assessments">
                                                <li >
                                                    {isPublicHrPage ?
                                                        <PublicAssessmentCard item={aiScreeningTest} hr_id={hr_id} hrData={allData} setIsHeaderVisible={setIsHeaderVisible} />
                                                        :
                                                        <AssessmentCard
                                                            handleCustomizeResume={handleCustomizeResume}
                                                            item={aiScreeningTest}
                                                            locked={false}
                                                            retest={aiScreeningTest.status == 4 && aiScreeningTest.attempt < 2 && aiScreeningTest.retest == true && aiScreeningTest.retest_days <= 0}
                                                            hr_id={hr_id}
                                                            isCandidateDeployed={isTalentHired(talentStatus)}
                                                            unregisteredTalent={talentStatus == 0}
                                                            unqualified={unqualified}
                                                            hrRole={allData.RequestForTalent}
                                                            testsOverview={statusOverview}
                                                            setShowBrowserValidation={setShowBrowserValidation}
                                                            setIsHeaderVisible={setIsHeaderVisible}
                                                            aggregatorApplyLink={allData.aggregator_application_link}
                                                            hideApplyCta={hideApplyCta}
                                                        />
                                                    }
                                                </li>
                                            </ul>
                                        </div>
                                    }
                                </li>
                            }
                        </ul>
                    </div>
                    {!isPublicHrPage && <AI_BrowserRestrictModal isOpen={showBrowserValidation} closeModal={() => setShowBrowserValidation(false)} />}
                </>
            }
        </div>
    )
}


const AssessmentCard = ({ handleCustomizeResume, item, locked, retest, hr_id, isCandidateDeployed, unqualified,
    hrRole, testsOverview, setShowBrowserValidation, unregisteredTalent, appliedWithoutScreening, applyWithoutScreening, setIsHeaderVisible, aggregatorApplyLink, hideApplyCta = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { singleHrRedirect, applyingHrNo, applyFlowData } = useSelector(state => state.work)
    const { control: { afterTouchPointSteps } } = applyFlowData[applyingHrNo];
    const { confirmRedirect } = singleHrRedirect;
    const [inProcess, setInProcess] = useState(false)
    const [inProcessData, setInProcessData] = useState({})
    const { getSingleHrData, getApplyStatus, showExpLessModal, data: hrData, makeFutureRedirectValid, isOppDisabled, getTouchPointers } = useSingleHrContext()
    const { assessment_url, assessment, assessment_tool, attempt } = item
    const [resultItem, setResultItem] = useState({})
    const { user } = useSelector(state => state.auth);


    const { ref, inView } = useInView();
    useEffect(() => {
        setIsHeaderVisible(!inView);
    }, [inView]);


    // useEffect(() => {
    //     const observer = new IntersectionObserver(onScroll, {
    //         rootMargin: '0px',
    //         threshold: 0.5
    //     });

    //     if (targetRef.current) {
    //         observer.observe(targetRef.current);
    //     }

    //     return () => {
    //         if (targetRef.current) {
    //             observer.unobserve(targetRef.current);
    //         }
    //     };
    // }, []);
    useEffect(() => {
        setResultItem(item)
    }, [item])

    const [isOpen, setOpen] = useState(false);
    const [screeningStep, setScreeningStep] = useState(1);
    const [isNextStep, setNextStep] = useState(false);
    const { status: talentStatus } = useSelector(state => state.auth)?.user

    const [videoResumeStates, setVideoResumeStates] = useState({
        openUploadVideoResumeModal: false,
        openPreRecordingModal: false,
        openRecordVideoResumeModal: false,
        openPreviewVideoPlayerModal: false,
        openDiscardVideoModal: false,

        // permission modals
        openPermissionDeniedModal: false,
        openDeviceErrorModal: false,
        openDeviceInUseModal: false,
    })

    // const handleMoveToNext = () => {
    //     setScreeningStep(2)
    //     setNextStep(true)
    // }
    const handleMoveToPrev = () => {
        setOpen(false);
        getTouchPointers(hrData.HR_Number)
        dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
        // write logic to open back applyflow 
    }

    useEffect(() => {
        if (hrData.screening_status) {
            setScreeningStep(2)
        }
        // let directAppliedHrs = localStorage.getItem('direct_applied_hrs') ? JSON.parse(localStorage.getItem('direct_applied_hrs')) : [];
        // if (directAppliedHrs.includes(hrData.HR_Number)) {
        //     setOpen(true);
        //     directAppliedHrs = directAppliedHrs.filter(item => item != hrData.HR_Number);
        //     localStorage.setItem('direct_applied_hrs', JSON.stringify(directAppliedHrs));
        // }
        if (hrData.is_applied) {
            if (isOpen) {
                setOpen(false)
            }
        }

    }, [hrData])


    // useEffect(() => {
    //     if (afterTouchPointSteps) {
    //         if (hrData.ai_mandatory == 1 || hrData.ai_mandatory == 2) {
    //             // dispatch({ type: SET_LOADER, payload: false })
    //             setScreeningStep(2)
    //             setNextStep(true)
    //             setOpen(true);
    //         }
    //     }
    // }, [afterTouchPointSteps])

    const handleDirectApply = () => {
        if (isOppDisabled) return
        getSingleHrData(hrData.HR_Number)
        // if (talentStatus == 0) {
        //     dispatch({ type: SET_FORCE_REGISTRATION })
        //     return
        // }
        // let directAppliedHrs = localStorage.getItem('direct_applied_hrs') ? JSON.parse(localStorage.getItem('direct_applied_hrs')) : [];
        // directAppliedHrs.push(hrData.HR_Number)
        // localStorage.setItem('direct_applied_hrs', JSON.stringify(directAppliedHrs))

        // var formData = new FormData();
        // formData.append('hr_id', hrData.id);
        // formData.append('intrested', 1);

        // oppInterested(formData)(dispatch)
        //     .then((res) => {
        //         navigate("/talent/my-opportunities")
        //     })
        //     .catch((err) => console.log(err))
    }

    const startVideoTrackingData = (screening) => {
        let trackingData = {
            extraParams: {
                job_id: hrData?.HR_Number,
                source: getApplicationSource(),
                application_id: setNewApplicationId(),
                flow: 'NA',
                AI_optional_or_mandatory: checkAiMendatoryOrNot(hrData.ai_mandatory),
                page: 'single-opportunities',
                screening: screening,
                publish_date: hrData?.publish_datetime_ats
            },
        }
        if (hrData?.if_recommended) {
            trackingData.extraParams.if_recommended = hrData?.if_recommended;
        }
        return trackingData
    }

    // const trackingVideoScreeningSuccessful = () => {
    //     let AiOptionalOrMandatory = !hrData.ai_mandatory ? 'optional' : 'mandatory'
    //     let trackingData = {
    //         extraParams: {
    //             job_id: hrData?.HR_Number,
    //             application_id: setNewApplicationId(),
    //             AI_optional_or_mandatory: AiOptionalOrMandatory,
    //             page: 'single-opportunities',
    //         },
    //     }

    //     let isAppliedVideo = localStorage.getItem('applied_video_job_id') ? JSON.parse(localStorage.getItem('applied_video_job_id')) : []
    //     let isApplied = localStorage.getItem('applied_job_id') ? JSON.parse(localStorage.getItem('applied_job_id')) : []
    //     let numberOfJobsApplied = checkPropertyExists('number_of_jobs_applied')
    //     if (!isApplied.includes(hrData?.HR_Number)) {
    //         trackingData.superProperty = {
    //             number_of_jobs_applied: numberOfJobsApplied == undefined ? 1 : Number(numberOfJobsApplied) + 1
    //         }
    //     }

    //     let numberOfVideoScreening = checkPropertyExists('number_of_video_screening')
    //     if (!isAppliedVideo.includes(hrData?.HR_Number)) {
    //         trackingData.superProperty = {
    //             ...trackingData.superProperty, number_of_video_screening: numberOfVideoScreening == undefined ? 1 : Number(numberOfVideoScreening) + 1
    //         }
    //     }

    //     let numberOfMandatJobs = checkPropertyExists('number_of_mandate_jobs')
    //     if (AiOptionalOrMandatory == 'mandatory' && !isAppliedVideo.includes(hrData?.HR_Number)) {
    //         trackingData.superProperty = {
    //             ...trackingData.superProperty, number_of_mandate_jobs: numberOfMandatJobs == undefined ? 1 : Number(numberOfMandatJobs) + 1
    //         }
    //     }

    //     if (!isAppliedVideo.includes(hrData?.HR_Number)) {
    //         isAppliedVideo.push(hrData?.HR_Number)
    //         localStorage.setItem('applied_video_job_id', JSON.stringify(isAppliedVideo));
    //     }

    //     trackAllCtaClickV2('video_screening_successful', trackingData)
    // }

    const handleTakeTest = () => {
        // if (unregisteredTalent) {
        //     dispatch({ type: SET_FORCE_REGISTRATION })
        //     return
        // }
        if (assessment_tool == AI_INTERVIEW && !browserSupportScreening()) {
            setShowBrowserValidation(true); setOpen(false);
            return
        }
        if (assessment_tool == AI_INTERVIEW) {
            trackAllCtaClickV2('start_video_screening_cta_clicked', startVideoTrackingData('pending'))
        }
        // trackAllOpportunitiesStartTest({ detail: assessment })
        if (retest) {
            AssessmentRetest(item.enc_id)(dispatch)
                .then((res) => {
                    setInProcess(true);
                    setInProcessData(res.data.data)
                    window.open(res.data.data.assessment_url, '_newtab' + Date.now())
                })
        }
        else {
            startHrAssessment(assessment.enc_id, hr_id)(dispatch)
                .then((res) => {
                    setInProcess(true);
                    setInProcessData(res.data.data)
                    window.open(res.data.data.assessment_url, '_newtab' + Date.now())
                    // Mixpanel Tracking Start
                    // trackingVideoScreeningSuccessful()
                    // Mixpanel Tracking End
                })
                .catch((err) => {
                    toast.error(err.response?.data?.message ?? 'Something went wrong!')
                })
        }
        if (confirmRedirect) {
            dispatch({
                type: SET_SINGLEHR_REDIRECT,
                payload: { confirmRedirect: false }
            })
            makeFutureRedirectValid()
        }

    }

    const handleInProcessTest = () => {
        // if (unregisteredTalent) {
        //     dispatch({ type: SET_FORCE_REGISTRATION })
        //     return
        // }
        if (assessment_tool == AI_INTERVIEW && !browserSupportScreening()) {
            setShowBrowserValidation(true); setOpen(false);
            return
        }
        if (assessment_tool == AI_INTERVIEW) {
            trackAllCtaClickV2('start_video_screening_cta_clicked', startVideoTrackingData('in-process'))
        }
        if (confirmRedirect) {
            dispatch({
                type: SET_SINGLEHR_REDIRECT,
                payload: { confirmRedirect: false }
            })
            makeFutureRedirectValid()
        }
        if (inProcess)
            window.open(inProcessData.assessment_url, '_newtab' + Date.now())
        else
            window.open(assessment_url, '_newtab' + Date.now())
    }


    const checkSticky = () => {
        var applyDataValue = null;
        var applyBtn = document.getElementById(`${hr_id ?? 'hr_id'}+singleOppAppyBtn`);
        var videoBtn = document.getElementById(`${hr_id ?? 'hr_id'}+singleOppVideoBtn`);
        if (applyBtn != null) {
            applyDataValue = applyBtn.getAttribute('data-cta-name');
            applyBtn.removeAttribute('data-cta-name');
        }
        if (videoBtn != null) {
            applyDataValue = videoBtn.getAttribute('data-video-cta-name');
            videoBtn.removeAttribute('data-cta-name');
        }
        return applyDataValue
    }

    const handleOpen = (name = null, ctaName = null) => {
        if (isOppDisabled) return;
        // if (unregisteredTalent) {
        //     dispatch({ type: SET_FORCE_REGISTRATION })
        //     return
        // }
        if (ctaName != null) {
            applyCtaForOpportunityClicked({ hrData, ctaName, isSticky: checkSticky() })
        }
        if (!(locked || isCandidateDeployed)) {
            if (hrData.screening_status && hrData.is_applied) {
                if (hrData.custom_screening_needed) {
                    dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
                } else {
                    setScreeningStep(2)
                    setOpen(true)
                }
            } else {
                if (applyFlowData[hrData.HR_Number]?.applyStepStarted) {
                    getTouchPointers(hrData.HR_Number)
                }
                dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
            }
        }
        // !(locked || isCandidateDeployed) && setOpen(true)
        if (name == 'takeTest') {
            if (assessment_tool == AI_INTERVIEW) {
                pageVisitLoadAndCtaTrack('Single Opportunity - Start The Screening POP up');
            }
        } else if (name == 'Ibtn') {
            if (assessment_tool == AI_INTERVIEW) {
                pageVisitLoadAndCtaTrack('Single Opportunity - "i" button to take the screening pop up');
            }
        }
    }

    const vrSubmitApply = () => {
        let payload = {
            "hr_id": hrData.enc_id
        }
        applyMandateVr(payload)(dispatch)
            .then((res) => {
                handleDirectApply()
            }).catch(err => {
                toast.error("Something went wrong", { duration: 7000 })
            })
    }

    const handleAggregatorApply = () => {
        let applyBtn = document.getElementById(`${hrData.enc_id}+singleOppAppyBtn`)
        let isSticky = false;

        if (applyBtn.getAttribute('data-cta-name') == 'sticky') {
            isSticky = true
        }
        applyCtaForOpportunityClicked({ hrData, ctaName: 'apply', isSticky })
        if (isOppDisabled) return;
        if (user.status >= 1 && differenceInMonths(new Date(), new Date(user?.last_preference_at)) < 3 && user?.job_function_id) {
            handleAggApply()
        } else {
            setAgregtrModalOpen(true)
        }
    }

    const handleAggApply = () => {
        let payload = {
            hr_id: hrData.enc_id,
            talent_id: user?.talent_enc_id
        }
        window.open(hrData.aggregator_application_link, '_blank');
        associateAggreeJobTalent(payload)(dispatch)
            .then(res => {
                setTimeout(() => {
                    dispatch({
                        type: TOGGLE_ASK_APPLIED,
                        payload: { type: "insert", hrId: hrData.enc_id }
                    })
                }, 3000);
            })
            .catch(err => {
                toast.error("Something went wrong", { duration: 3000 })
                console.log(err)
            })
    }

    const [agrgtrModalOpen, setAgregtrModalOpen] = useState(false);

    const onAgrgtrModalApply = () => {
        handleAggApply();
    }

    const handlePreferencesSuccess = () => {
        setAgregtrModalOpen(false);
        handleAggApply();
    }

    return (
        <div
            className={`testBox ${(appliedWithoutScreening || applyWithoutScreening) ? 'width-auto' : ''} ${resultItem.status == 4 && !retest ? 'testTaken' : ''} ${resultItem.status == 4 && resultItem.result == 'Passed' ? 'testPassed' : ''}
            ${unqualified && (item.status < 4 || retest || resultItem.result == 'Passed') ? 'testBlocked' : ''}
            ${(locked || isCandidateDeployed) ? 'langAssesBoxHover' : ''
                }`}
            ref={ref}
        >
            {(Object.keys(item).length == 0 || item.status < 4 || retest) ?
                <>
                    {agrgtrModalOpen &&
                        <ManagePreferencesModal successCallback={handlePreferencesSuccess} />
                    }

                    <SkillInfoModal
                        isOpen={isOpen && screeningStep == 2}
                        setOpen={setOpen}
                        data={item}
                        retest={retest}
                        handleTakeTest={handleTakeTest}
                        handleInProcessTest={handleInProcessTest}
                        inProcess={inProcess}
                        showExpLessModal={showExpLessModal}
                        reqExp={hrData.YearOfExp}
                        hrData={hrData}
                        hrRole={hrRole}
                        isNextStep={isNextStep}
                        moveToPrev={handleMoveToPrev}
                        setVideoResumeStates={setVideoResumeStates}
                        vrSubmitApply={vrSubmitApply}
                    />

                    <VideoResumeContainer
                        videoResumeStates={videoResumeStates}
                        setVideoResumeStates={setVideoResumeStates}
                        openSelectSourceModal={handleMoveToPrev}
                        vrMandatoryOnApply={!hrData.is_applied && hrData.ai_mandatory == 2}
                        hrData={hrData}
                    />

                    {(appliedWithoutScreening || applyWithoutScreening) ?
                        <>
                            {/* {appliedWithoutScreening &&
                                <button id={`${hr_id ?? 'hr_id'}+singleOppVideoBtn`} className="primaryBtn shareVR"
                                    onClick={() => !unqualified && handleOpen('takeTest', 'share video resume')}
                                ><ShareVRSvg />&nbsp;&nbsp;SHARE A VIDEO RESUME</button>
                            } */}
                            {applyWithoutScreening && !hideApplyCta &&
                                (
                                    aggregatorApplyLink ? (
                                        <button id={`${hr_id ?? 'hr_id'}+singleOppAppyBtn`} className="primaryBtn" onClick={handleAggregatorApply}>
                                            {getApplyButtonText(hrData.aggregator_application_link, hrData.aggregator)}
                                            <span className="aggregator-apply-link" style={{ marginLeft: '10px', display: 'inline-flex' }}>
                                                <svg style={{ width: '18px', height: '18px' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                </svg>
                                            </span>
                                        </button>
                                    ) : (
                                        <button id={`${hr_id ?? 'hr_id'}+singleOppAppyBtn`} className="primaryBtn" onClick={() => {
                                            !unqualified && handleOpen('takeTest', 'apply')
                                        }}>
                                            Apply
                                        </button>
                                    )
                                )
                            }
                        </>
                        :
                        <>
                            <div className="mandatory">
                                <img src={IMAGE_URL + "MandatoryAiIcon.svg"} className="skillImage"
                                    alt={"MandatoryAiIcon"} />
                                <div className="para-cta">
                                    <div className="testDetails">
                                        {hrData.screening_status ?
                                            <>
                                                <strong>Almost there! Complete the mandatory AI Interview to submit your application.</strong>
                                                Quick Tip: Higher scores are reviewed first by recruiters and hiring managers.
                                            </>
                                            :
                                            <>Your application will automatically be submitted once the Ai Interview is completed and your score is 50 and above</>
                                        }

                                    </div>
                                    <div className="actionFlex">
                                        {retest &&
                                            <span className="retestText">
                                                {item.attempt < 2 ? '1st' : 'Last'} Attempt Score: {item.score}/{item.assessment_tool == "Versant" ? 80 : 100}
                                            </span>
                                        }
                                        {((item.status == 3 && (item.expiry_day > 0 || item.expiry_day == null)) || inProcess) &&
                                            <span className="text-orange">In-progress</span>
                                        }
                                        <div className="assessmentBottomAction ">
                                            {!hideApplyCta &&
                                                <button id={`${hr_id ?? 'hr_id'}+singleOppAppyBtn`} className="primaryBtn" onClick={() => !unqualified && handleOpen('takeTest', 'apply')}>
                                                    Apply
                                                </button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                </>
                :
                <>
                    <div className="test-left">
                        <div className="d-flex align-items-center">
                            <>
                                <img src={item.image_url} className="skillImage"
                                    alt={"skill-" + item.assessment?.name} />
                                &nbsp;&nbsp;
                            </>
                            <div className="testDetails">
                                <div className="testName">{item.assessment?.name} </div>
                                <span className="assessmentDate">({format(resultItem.assessment_date ? new Date(resultItem.assessment_date) : new Date(), "do MMM''yy")})</span>
                            </div>
                        </div>
                        {(resultItem.assessment_tool == AI_INTERVIEW && resultItem.result == 'Passed' && (resultItem.score * 100 / resultItem.total_marks) < 66) &&
                            <div className="successBrownTest">Below average score</div>
                        }
                    </div>
                    <div className="testResult">
                        {resultItem.assessment_tool == AI_INTERVIEW ?
                            <>
                                {resultItem.result == 'Passed' &&
                                    <div className={`successScore ${(resultItem.score * 100 / resultItem.total_marks) < 66 ? 'successBrown' : ''}`}>
                                        Assessment Score: <span>{resultItem.score}/{resultItem.total_marks}</span>
                                    </div>
                                }
                                {resultItem.result == 'UnderReview' && <div className="failedScore text-orange badge">Result creation in progress</div>}
                                {resultItem.result == 'Disqualified' &&
                                    <div className="failedScore text-red">
                                        <span className="bold">Ai Interview Cancelled </span>
                                        <span>(Misconduct detected)</span>
                                    </div>
                                }
                                {resultItem.result == 'Failed' &&
                                    <div className="failedScore">
                                        <span>Score: <span className="bold">{resultItem.score}/{resultItem.total_marks}</span>
                                            &nbsp;&nbsp;
                                        </span>
                                        <span className="bold">(Scored below benchmark)</span>
                                    </div>
                                }
                            </>
                            :
                            <>
                                {resultItem.result == 'Passed' ?
                                    <div className="successScore">Assessment Score: <span>{resultItem.score}/{resultItem.assessment_tool == "Versant" ? 80 : 100}</span></div> :
                                    <div className="failedScore"><span>{item.attempt < 2 ? '1st' : 'Last'} attempt score: <span className="bold">{item.score}/{item.assessment_tool == "Versant" ? 80 : 100} </span></span>
                                        <span className="bold">(Not cleared{item.attempt < 2 ? ` - Retest in ${item.retest_days} days` : ''})</span></div>
                                }
                            </>
                        }
                        <AssessmentStatusModal
                            type={resultItem.assessment_tool == AI_INTERVIEW ? 'completed' : resultItem.result == 'Passed' ? "completed" : "retest"}
                            score={resultItem.score}
                            data={item}
                            testInfo={true}
                            resultItem={resultItem}
                            testsOverview={testsOverview}
                        >
                            <img src={IMAGE_URL + "work/box-info-icon.svg"} alt="box-info-icon" />
                        </AssessmentStatusModal>
                    </div>
                </>
            }
        </div>
    )
}

const PublicAssessmentCard = ({ item, ctaOnly, hr_id, setIsHeaderVisible, hrData }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams()
    const dispatch = useDispatch()
    const startSignupFlow = () => {
        dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
        publicOppoApplyCtaTrack(hrData)
        // track event for linkedin by Keerthi v START
        if (TRACK_HR_IDS.includes(hrData.HR_Number)) {
            window.lintrk('track', { conversion_id: 23201113 })
        }
        // track event for linkedin by Keerthi v END
    }


    // const publicCardRef = useRef(null);


    const { ref, inView } = useInView();
    // const onScroll = ([entry]) => {
    //     setIsHeaderVisible(!entry.isIntersecting);
    // }

    useEffect(() => {
        setIsHeaderVisible(!inView);
    }, [inView]);

    // useEffect(() => {
    //     const observer = new IntersectionObserver(onScroll, {
    //         rootMargin: '0px',
    //         threshold: 0.5
    //     });

    //     if (publicCardRef.current) {
    //         observer.observe(publicCardRef.current);
    //     }

    //     return () => {
    //         if (publicCardRef.current) {
    //             observer.unobserve(publicCardRef.current);
    //         }
    //     };
    // }, []);

    return (
        <div ref={ref} className={`testBox ${ctaOnly ? 'width-auto' : 'publicCard'}`}>
            {!ctaOnly &&
                <div className="card-div">
                    <>
                        <img src={IMAGE_URL + "MandatoryAiIcon.svg"} className="skillImage"
                            alt={"MandatoryAiIcon"} />
                    </>
                    <div className="testDetails">
                        Your application will automatically be submitted once you finish all the steps.
                    </div>
                </div>
            }
            <button id={`${hr_id ?? 'hr_id'}+singleOppAppyBtn`} className="primaryBtn" onClick={() => startSignupFlow()}>
                Apply
            </button>

        </div>
    )
}
