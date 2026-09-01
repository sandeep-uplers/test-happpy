import React, { useEffect, useState } from "react";
import { AnnouncementHorn } from "../../../assets/IconSVG";
import SkillInfoModal from "../../../components/common/SkillInfoModal";
import { browserSupportScreening, getApplicationSource, isTalentHired } from "../../../components/Helper";
import { checkAiMendatoryOrNot, pageVisitLoadAndCtaTrack, setNewApplicationId, trackAllCtaClickV2 } from "../../../helpers/Mixpanel";
import { AssessmentRetest, startHrAssessment } from "../../../store/actions/UserActions";
import { useDispatch, useSelector } from "react-redux";
import AI_BrowserRestrictModal from "./modals/AI_BrowserRestrictModal";
import { AI_INTERVIEW } from "../../../components/Constant";
import toast from "react-hot-toast";



export default function AiScreeningRequired({ hrData, aiData }) {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const talentStatus = user?.status;
    const [showBrowserValidation, setShowBrowserValidation] = useState(false);
    const [showCard, setShowCard] = useState(true);
    const [isOpen, setOpen] = useState(false);
    const [retest, setRetest] = useState(false);
    const [inProcess, setInProcess] = useState(false)
    const [inProcessData, setInProcessData] = useState({});
    // useEffect(() => {
    //     if (hrData.ai_mandatory != 2 && hrData.screening_status && hrData.ai_needed) {
    //         setShowCard(true)
    //     }
    // }, [])

    // useEffect(() => {
    //     setRetest(aiData.status == 4 && aiData.attempt < 2);

    // }, [aiData])

    const handleTakeTest = () => {
        if (aiData.assessment_tool == AI_INTERVIEW && !browserSupportScreening()) {
            setShowBrowserValidation(true); setOpen(false);
            return
        }
        if (aiData.assessment_tool == AI_INTERVIEW) {
            trackAllCtaClickV2('start_video_screening_cta_clicked', startVideoTrackingData('pending'))
        }
        // if (retest) {
        //     console.log('retest', aiData);

        //     AssessmentRetest(aiData.enc_id)(dispatch)
        //         .then((res) => {
        //             setInProcess(true);
        //             setInProcessData(res.data.data)
        //             window.open(res.data.data.assessment_url, '_newtab' + Date.now())
        //         })
        // }
        // else {
        
        startHrAssessment(aiData.master_enc_id, hrData.enc_id)(dispatch)
            .then((res) => {
                setInProcess(true);
                setInProcessData(res.data.data)
                window.open(res.data.data.assessment_url, '_newtab' + Date.now())
            })
            .catch((err) => {
                toast.error(err.response?.data?.message ?? 'Something went wrong!')
            })
        // }
    }

    const handleInProcessTest = () => {
        if (aiData.assessment_tool == AI_INTERVIEW && !browserSupportScreening()) {
            setShowBrowserValidation(true); setOpen(false);
            return
        }
        if (aiData.assessment_tool == AI_INTERVIEW) {
            trackAllCtaClickV2('start_video_screening_cta_clicked', startVideoTrackingData('in-process'))
        }
        if (inProcess)
            window.open(inProcessData.assessment_url, '_newtab' + Date.now())
        else
            window.open(aiData.assessment_url, '_newtab' + Date.now())
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

    const handleOpen = (name = null) => {

        if (!isTalentHired(talentStatus)) {
            setOpen(true)
        }
        if (name == 'takeTest') {
            if (aiData.assessment_tool == AI_INTERVIEW) {
                pageVisitLoadAndCtaTrack('Ai needed - Start The Screening POP up');
            }
        }
    }


    return (
        <>
            {showCard &&
                <div className="applied-ai-needed">
                    <div className="left">
                        <AnnouncementHorn />
                        <span>
                            <strong>Great News!</strong> Your profile seems a great match for this role! Your profile is currently with the hiring team, but their process requires you to complete this Ai Interview round to proceed further.
                            <br />
                            Go through this round and score great to arrange a video interview with the hiring manager
                        </span>
                    </div>
                    <div className="right">
                        <button className="primaryBtn cta" onClick={() => handleOpen('takeTest', 'apply')}>Start Ai Interview</button>
                    </div>
                </div>
            }
            <SkillInfoModal
                isOpen={isOpen}
                setOpen={setOpen}
                data={aiData}
                retest={retest}
                handleTakeTest={handleTakeTest}
                handleInProcessTest={handleInProcessTest}
                inProcess={inProcess}
                reqExp={hrData.YearOfExp}
                hrData={{ ...hrData, ai_needed: true }}
                hrRole={hrData.RequestForTalent}
                isNextStep={false}
            />
            <AI_BrowserRestrictModal isOpen={showBrowserValidation} closeModal={() => setShowBrowserValidation(false)} />
        </>
    )
}
