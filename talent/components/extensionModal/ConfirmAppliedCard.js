import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getIndividualHR, storeAppliedResponseAgrJob } from "../../store/actions/UserActions";
import { TOGGLE_ASK_APPLIED } from "../../store/actions/actionsTypes";
import toast from "react-hot-toast";
import { Link } from "@/talent/navigation/routerCompat";
import { confirmAppliedTracking } from "../../helpers/Mixpanel";
import ReferralAgentModal from "../ReferralAgentModal";

export default function ConfirmAppliedCard({ hrData, spaceBottom }) {
    const { confirmAggApplied } = useSelector(state => state.work);
    const user = useSelector(state => state.auth)?.user;
    const dispatch = useDispatch();

    const [appliedRes, setAppliedRes] = useState('')

    const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);

    const openReferralModal = () => setIsReferralModalVisible(true);
    const closeReferralModal = () => setIsReferralModalVisible(false);

    const handleSubmit = (text) => {
        console.log("Submitted reason:", text);
    };

    
    useEffect(() => {
        setAppliedRes('')
    }, [hrData.HR_Number])

    const handleResponse = (e) => {
        confirmAppliedTracking(hrData, e.target.name)
        if (e.target.name == "No") {
            dispatch({
                type: TOGGLE_ASK_APPLIED,
                payload: { type: "remove", hrId: hrData.enc_id }
            })
            setAppliedRes(e.target.name)
            return
        }

        let payload = {
            hr_id: hrData.enc_id,
            talent_id: user?.talent_enc_id,
            has_applied: e.target.name == "Yes" ? 1 : 0
        }
        storeAppliedResponseAgrJob(payload)(dispatch)
            .then(res => {
                dispatch({
                    type: TOGGLE_ASK_APPLIED,
                    payload: { type: "remove", hrId: hrData.enc_id }
                })
                setAppliedRes(e.target.name)
                getIndividualHR(hrData.HR_Number)(dispatch)
            })
            .catch(err => {
                toast.error("Something went wrong", { duration: 3000 })
                console.log(err)
            })
    }

    return (
        <>
            {(confirmAggApplied[hrData.enc_id.trim()]) ?
                <div className="confirmApplied">
                    <div className="left">
                        <h6>Did you apply?</h6>
                    </div>
                    <div className="right">
                        <button className="ghostBtn" name="Yes" onClick={handleResponse}>Yes</button>
                        <button className="ghostBtn" name="No" onClick={handleResponse}>No</button>
                    </div>

                    {/* <ReferralAgentModal
                        isOpen={isReferralModalVisible}
                        closeReferralAgentModal={closeReferralModal}
                        onSubmit={handleSubmit}
                        hrID={hrData.enc_id}
                        source="aggregator-post-apply"
                    />

                    <div className="right">
                        {hrData.is_outreach_eligible && user?.outreach?.is_eligible &&
                            <button className={`outlinedBtn outreachBtn`} onClick={openReferralModal}>
                                Run Happpy Agent
                            </button>
                        }
                    </div> */}
                </div>
                :
                <>
                    {appliedRes &&
                        <div className="confirmApplied">
                            {appliedRes == "Yes" ?
                                <div className="left">
                                    <p>
                                        Thank you for your response - You can find this job application under <Link to={'/talent/my-opportunities?activeJob=' + hrData.HR_Number}>Applied Jobs</Link> page
                                    </p>
                                </div>
                                :
                                <div className="left">
                                    <p>Thank you for your response</p>
                                </div>
                            }
                        </div>
                    }
                </>
            }
            {spaceBottom && <br />}
        </>
    )
}