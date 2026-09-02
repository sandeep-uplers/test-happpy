import { differenceInMonths } from 'date-fns';
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@/talent/navigation/routerCompat";
import { ArrowRightIcon } from "../../../assets/IconSVG";
import SkillInfoModal from "../../../components/common/SkillInfoModal";
import { useInView } from "../../../components/common/useInView";
import { browserSupportScreening, getApplyButtonText, isTalentHired } from "../../../components/Helper";
import { applyCtaForOpportunityClicked, jobOpportunityPageLandTrack } from "../../../helpers/Mixpanel";
import { OPEN_SIGNUP_APPLY_FLOW, SET_TOUCHPOINT_DATA, TOGGLE_ASK_APPLIED, UPDATE_HRDATA_TO_APPLY } from "../../../store/actions/actionsTypes";
import { applyMandateVr, associateAggreeJobTalent, fetchTouchpointsQuestion, getIndividualHR, startHrAssessment } from "../../../store/actions/UserActions";
import ManagePreferencesModal from "../preferences/ManagePreferencesModal";
import AI_BrowserRestrictModal from "./modals/AI_BrowserRestrictModal";

export default function JobDetailsApply({ data, setIsHeaderVisible, handleCustomizeResume }) {
    const dispatch = useDispatch()
    const { applyingHrNo, applyFlowData } = useSelector(state => state.work)
    const { control: { afterTouchPointSteps } } = applyFlowData[applyingHrNo];

    const [openSkillInfo, setOpenSkillInfo] = useState(false);
    const [showBrowserValidation, setShowBrowserValidation] = useState(false);

    const [inProcess, setInProcess] = useState(false)
    const [inProcessData, setInProcessData] = useState({})

    const [isNextStep, setNextStep] = useState(false);

    const [showExpLessModal, setShowExpModal] = useState(false);
    const auth = useSelector(state => state.auth);
    const user = auth.user;

    const handleAskTouchpoint = () => {
        if (applyFlowData[data.HR_Number]?.touchPointQues?.length > 0 && !applyFlowData[data.HR_Number]?.applyStepStarted) {
            dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: data })
            return
        }

        let reqMap = {
            "HR_Number": data.HR_Number
        }
        fetchTouchpointsQuestion(reqMap)(dispatch)
            .then(res => {
                dispatch({
                    type: SET_TOUCHPOINT_DATA,
                    payload: {
                        HR_Number: data.HR_Number,
                        touchPointQues: res.data.data.data,
                        touchPointMaster: res.data.data.masters,
                        talent: res.data.data.talent,
                        customTocuhpointQues: res.data.data.custom_questions ?? []
                    }
                })
                dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: data })
            })
            .catch(err => {
                console.log('err', err);
            })
    }

    const handleApplyClick = () => {
        applyCtaForOpportunityClicked({ hrData: data, ctaName: 'apply', page: 'all-opportunities' })
        if (data.aggregator_application_link) {
            handleAggregatorApply()
        } else {
            if (data.screening_status && data.is_applied) {
                dispatch({ type: UPDATE_HRDATA_TO_APPLY, payload: data })
                setOpenSkillInfo(true);
            } else {
                handleAskTouchpoint();
            }
        }
    }

    const handleMoveToPrev = () => {
        setOpenSkillInfo(false);
        handleAskTouchpoint()
        // write logic to open back applyflow 
    }

    const handleTakeTest = (assessment) => {

        if (!browserSupportScreening()) {
            setShowBrowserValidation(true); setOpenSkillInfo(false);
            return
        }

        startHrAssessment(assessment.enc_id, data.enc_id)(dispatch)
            .then((res) => {
                setInProcess(true);
                setInProcessData(res.data.data)
                window.open(res.data.data.assessment_url, '_newtab' + Date.now())
            })
            .catch((err) => {
                toast.error(err.response?.data?.message ?? 'Something went wrong!')
            })
    }

    const handleInProcessTest = () => {
        if (!browserSupportScreening()) {
            setShowBrowserValidation(true); setOpenSkillInfo(false);
            return
        }
        if (inProcess)
            window.open(inProcessData.assessment_url, '_newtab' + Date.now())
        else
            window.open(assessment_url, '_newtab' + Date.now())
    }

    useEffect(() => {
        if (Object.keys(data).length > 0 && (user?.total_experience || user?.total_experience == 0)) {
            setShowExpModal(Number(data.YearOfExp) > Number(user.total_experience))
        }
    }, [user, data])

    // useEffect(() => {
    //     if (afterTouchPointSteps && applyingHrNo == data.HR_Number) {
    //         if (data.ai_mandatory == 1 || data.ai_mandatory == 2) {
    //             setNextStep(true)
    //             setOpenSkillInfo(true);
    //         }
    //     }
    // }, [afterTouchPointSteps])



    const vrSubmitApply = () => {
        let payload = {
            "hr_id": data.enc_id
        }
        applyMandateVr(payload)(dispatch)
            .then((res) => {
                getIndividualHR(data.HR_Number)(dispatch)
            }).catch(err => {
                toast.error("Something went wrong", { duration: 7000 })
            })
    }


    const handleAggApply = () => {
        let payload = {
            hr_id: data.enc_id,
            talent_id: user?.talent_enc_id
        }
        window.open(data.aggregator_application_link, '_blank');
        associateAggreeJobTalent(payload)(dispatch)
            .then(res => {
                setTimeout(() => {
                    dispatch({
                        type: TOGGLE_ASK_APPLIED,
                        payload: { type: "insert", hrId: data.enc_id }
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

    const handleAggregatorApply = () => {
        if (user.email?.includes("sandeepdev")) {
            console.log("______________debug handleAggregatorApply user", user);
        }

        if (user.status >= 1 && differenceInMonths(new Date(), new Date(user?.last_preference_at)) < 3 && user?.job_function_id) {
            handleAggApply()
        } else {
            dispatch({ type: UPDATE_HRDATA_TO_APPLY, payload: data })
            setAgregtrModalOpen(true);
        }
    }

    const handlePreferencesSuccess = () => {
        setAgregtrModalOpen(false);
        handleAggApply();
    }



    const { ref, inView } = useInView();
    useEffect(() => {
        setIsHeaderVisible(!inView);
    }, [inView]);

    useEffect(() => {
        jobOpportunityPageLandTrack({
            hrData: data, talentData: {
                is_talent_hired: isTalentHired(user?.status)
            }
        }, 'all-jobs')
    }, [data.HR_Number])

    return (
        <>
            <button className="primaryBtn applyBtn" onClick={handleApplyClick} id={`${data.enc_id}+singleOppAppyBtn`} ref={ref}>
                {data.aggregator_application_link ? getApplyButtonText(data.aggregator_application_link, data.aggregator) : 'Apply Now'}
                {data.aggregator_application_link ?
                    <span className="aggregator-apply-link" style={{ display: 'inline-flex' }}>
                        <svg style={{ width: '1rem', height: '1rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </span>
                    :
                    <ArrowRightIcon />
                }
            </button>

            {agrgtrModalOpen &&
                <ManagePreferencesModal successCallback={handlePreferencesSuccess} applyAggregator={true} />
            }
            {applyingHrNo == data.HR_Number && data.ai_mandatory != 0 && !agrgtrModalOpen &&
                <>
                    <SkillInfoModal
                        isOpen={openSkillInfo}
                        setOpen={setOpenSkillInfo}
                        data={data.ai_data}
                        handleTakeTest={handleTakeTest}
                        handleInProcessTest={handleInProcessTest}
                        inProcess={inProcess}
                        showExpLessModal={showExpLessModal}
                        reqExp={data.YearOfExp}
                        hrData={data}
                        hrRole={data.RequestForTalent}
                        isNextStep={isNextStep}
                        moveToPrev={handleMoveToPrev}
                        vrSubmitApply={vrSubmitApply}
                    />
                    <AI_BrowserRestrictModal
                        isOpen={showBrowserValidation}
                        closeModal={() => setShowBrowserValidation(false)}
                    />
                </>
            }
        </>
    )
}
