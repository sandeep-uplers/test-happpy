import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "@/talent/navigation/routerCompat";
import { AnnouncementHorn } from "../../../assets/IconSVG";
import { OPEN_SIGNUP_APPLY_FLOW, SET_TOUCHPOINT_DATA } from "../../../store/actions/actionsTypes";
import { fetchTouchpointsQuestion } from "../../../store/actions/UserActions";


export default function CustomQuesNeeded({ hrData, jobDetailsPC = false }) {
    const dispatch = useDispatch();
    const params = useParams()
    const navigate = useNavigate()
    const { applyingHrNo, applyFlowData } = useSelector(state => state.work)

    const handleContinue = () => {
        if (params.hrId) {
            dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
        } else {
            if (jobDetailsPC) {
                handleAskTouchpoint();
            } else
                navigate("/talent/all-opportunities/" + hrData.HR_Number + "?is_additional_screening=true")
        }
    }

    const handleAskTouchpoint = () => {
        if (applyFlowData[hrData.HR_Number]?.touchPointQues?.length > 0 && !applyFlowData[hrData.HR_Number]?.applyStepStarted) {
            dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
            return
        }

        let reqMap = {
            "HR_Number": hrData.HR_Number
        }
        fetchTouchpointsQuestion(reqMap)(dispatch)
            .then(res => {
                dispatch({
                    type: SET_TOUCHPOINT_DATA,
                    payload: {
                        HR_Number: hrData.HR_Number,
                        touchPointQues: res.data.data.data,
                        touchPointMaster: res.data.data.masters,
                        talent: res.data.data.talent,
                        customTocuhpointQues: res.data.data.custom_questions ?? []
                    }
                })
                dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: hrData })
            })
            .catch(err => {
                console.log('err', err);
            })
    }

    return (
        <>
            <div className="applied-ai-needed">
                <div className="left">
                    <AnnouncementHorn />
                    <span>
                        <strong>Great News!</strong> Your profile seems a great match for this role! Your profile is currently with the hiring team, but their process requires you to answer additional question(s) to proceed further.
                        <br />
                    </span>
                </div>
                <div className="right">
                    <button className="primaryBtn cta" onClick={handleContinue}>Submit Required Info</button>
                </div>
            </div>
        </>
    )
}
