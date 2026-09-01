import { differenceInHours } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import { SET_NOTIFY_SUCCESS } from "../../../../store/actions/actionsTypes";
import { raiseRefundRequest } from "../../../../store/actions/UserActions";
import NeedSupportModal from "./NeedSupportModal";
import toast from "react-hot-toast";

export default function NeedHelpCard({ seeRefundPolicy = false, atleastOnePaidResume = false, fromTailorDashboard = false, transformationId = null }) {
    const [isRefundRequestOpen, setIsRefundRequestOpen] = useState(false);
    const [isSupportRequestOpen, setIsSupportRequestOpen] = useState(false);
    const refundRequestKey = fromTailorDashboard ? 'tailor-refund-request-raised' : 'refund-request-raised';
    const supportRequestKey = fromTailorDashboard ? 'tailor-support-request-raised' : 'support-request-raised';

    useEffect(() => {

        let alreadyRaised = localStorage.getItem(refundRequestKey);
        if (alreadyRaised && differenceInHours(new Date(), new Date(alreadyRaised)) < 1) {
            setIsRefundRequestOpen(true);
        } else {
            localStorage.removeItem(refundRequestKey);
            if (isRefundRequestOpen) {
                setIsRefundRequestOpen(false);
            }
        }
        let alreadySupportRaised = localStorage.getItem(supportRequestKey);
        if (alreadySupportRaised && differenceInHours(new Date(), new Date(alreadySupportRaised)) < 1) {
            setIsSupportRequestOpen(true);
        } else {
            localStorage.removeItem(supportRequestKey);
            if (isSupportOpen) {
                setIsSupportRequestOpen(false);
            }
        }
    }, [])
    const dispatch = useDispatch();
    const handleRefundRequest = () => {
        setConfirmRefundRequest(false);
        let payload = {};
        if (transformationId) {
            payload.transformation_id = transformationId;
        }
        raiseRefundRequest(payload, fromTailorDashboard)(dispatch)
            .then((res) => {
                setIsRefundRequestOpen(true);
                localStorage.setItem(refundRequestKey, new Date());
                toast.success(res?.data?.message);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const [confirmRefundRequest, setConfirmRefundRequest] = useState(false);

    const onClickRaiseRefund = () => {
        setConfirmRefundRequest(true)
    }

    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const handleSupportClick = () => {
        setIsSupportOpen(true);
    }

    return (
        <>
            <ConfirmDialog
                isOpen={confirmRefundRequest}
                setOpen={setConfirmRefundRequest}
                title="Are you sure you want to raise a refund request?"
                onPrimaryClick={handleRefundRequest}
                primaryBtnText="Yes, Submit Request"
                secondaryBtnText="Cancel"
                onSecondaryClick={() => setConfirmRefundRequest(false)}
                onCancel={() => setConfirmRefundRequest(false)}
            />
            <div className={`need-help-card ${seeRefundPolicy ? 'refund-policy' : ''}`}>
                <div className="need-help-card-content">
                    <h6>Need help?</h6>
                    {seeRefundPolicy ?
                        <text>Have Questions Or Need Revisions? We're Here To Help!</text>
                        :
                        <text>Have questions, need revisions or refund for any {fromTailorDashboard ? 'tailored' : ''} resume transformation? We're here to help!</text>
                    }
                </div>
                <div className="ctas">
                    {/* {(!atleastOnePaidResume || seeRefundPolicy) ?
                        <a href="/files/refund-policy-resume-ransformation.pdf" className="underlinedBtn" target="_blank">
                            See Refund Policy
                        </a>
                        :
                        atleastOnePaidResume &&
                        <button className="underlinedBtn" onClick={onClickRaiseRefund} disabled={isRefundRequestOpen} title={isRefundRequestOpen ? "You have 1 active refund request" : "Raise a refund request"}>
                            {isRefundRequestOpen ?
                                "1 Active refund request" :
                                "Raise a refund request"
                            }
                        </button>
                    } */}
                    <button className="outlinedBtn" disabled={isSupportRequestOpen} onClick={handleSupportClick} title={isSupportRequestOpen ? "You have 1 active support request" : "Contact support"}>
                        <svg width="1.0625rem" height="1.0625rem" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.75 9.20833V13.4583C12.75 13.8341 12.6007 14.1944 12.3351 14.4601C12.0694 14.7257 11.7091 14.875 11.3333 14.875H3.54167C3.16594 14.875 2.80561 14.7257 2.53993 14.4601C2.27426 14.1944 2.125 13.8341 2.125 13.4583V5.66667C2.125 5.29094 2.27426 4.93061 2.53993 4.66493C2.80561 4.39926 3.16594 4.25 3.54167 4.25H7.79167" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10.625 2.125H14.875V6.375" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M7.08398 9.91667L14.8757 2.125" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        {isSupportRequestOpen ? "1 Active support request" : "Contact support"}
                    </button>
                </div>
            </div>
            <NeedSupportModal
                isOpen={isSupportOpen}
                setIsOpen={setIsSupportOpen}
                setIsSupportRequestOpen={setIsSupportRequestOpen}
                fromTailorDashboard={fromTailorDashboard}
                canRaiseRefundRequest={atleastOnePaidResume && !isRefundRequestOpen}
            />
        </>
    )
}