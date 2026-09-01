import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CloseModalIcon } from "../../assets/IconSVG";
import { SET_TAILOR_MODAL_OPEN, UPDATE_WORK_CONTROL } from "../../store/actions/actionsTypes";
import { trackExternalJDPopupOpen, trackTailorPricePopupOpen } from "../../store/actions/trackingActions";
import ProgressBar from "../common/ProgressBar";

export default function ApplySuccessScreen({ hrDataToApply, handleClose, partner_job_tailor }) {

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch({ type: UPDATE_WORK_CONTROL, payload: { afterTouchPointSteps: true, HR_Number: hrDataToApply.HR_Number } })
        const timer = setTimeout(() => handleClose('', true), 10000);
        return () => clearTimeout(timer);
    }, []);

    const { user } = useSelector(state => state.auth);
    const { tailored_plan_validity, is_tailored_paid } = user?.resume_tailored || {};

    const handleCreateTailoredResume = () => {
        if (!is_tailored_paid || tailored_plan_validity === 0) {
            document.getElementById('openPricingPopupBtn').click();
            trackTailorPricePopupOpen("apply_success_create_tailor_resume");
            return;
        }
        trackExternalJDPopupOpen("apply_success_create_tailor_resume");
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: true, is_external_jd: true } });
        setTimeout(() => {
            handleClose('', true);
        }, 100);
    }


    return (
        <div className="modal-content apply-success-modal">
            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                <CloseModalIcon />
                <svg
                    className="closeProgress"
                    width="32"
                    height="32"
                    viewBox="0 0 36 36"
                >
                    <circle
                        className="progressCircle"
                        cx="18"
                        cy="18"
                        r="16"
                    />
                </svg>
            </button>
            <div className={`modal-body`}>
                <div className='head'>
                    <h4>
                        Applied to&nbsp;
                        {hrDataToApply.RequestForTalent}{hrDataToApply.company?.company_name ? ` at ${hrDataToApply.company?.company_name}` : ''}
                        {hrDataToApply.ModeOfWork ? ` - ${hrDataToApply.ModeOfWork == "Office" ? 'Onsite' : hrDataToApply.ModeOfWork}` : ''}
                        &nbsp;
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.3337 5.5L8.25033 15.5833L3.66699 11" stroke="#32936F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </h4>
                    {(hrDataToApply.is_custome_screening || hrDataToApply.custom_screening_needed || partner_job_tailor) &&
                        <ProgressBar value={100} height={14} />
                    }
                </div>
                <div className="apply-success-screen">
                    <div className="asc-top-section">
                        <svg width="142" height="142" viewBox="0 0 142 142" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_26532_33522)">
                                <path d="M71 142C110.212 142 142 110.212 142 71C142 31.7878 110.212 0 71 0C31.7878 0 0 31.7878 0 71C0 110.212 31.7878 142 71 142Z" fill="#32BA7C" />
                                <path d="M52.8574 103.028L89.3653 139.536C119.602 131.473 141.999 103.924 141.999 70.9995C141.999 70.3276 141.999 69.6556 141.999 68.9837L113.331 42.5547L52.8574 103.028Z" fill="#0AA06E" />
                                <path d="M72.7901 86.8994C75.9257 90.0351 75.9257 95.4104 72.7901 98.5461L66.2948 105.041C63.1591 108.177 57.7837 108.177 54.6481 105.041L26.2033 76.3726C23.0677 73.2369 23.0677 67.8616 26.2033 64.7259L32.6986 58.2306C35.8342 55.095 41.2096 55.095 44.3453 58.2306L72.7901 86.8994Z" fill="white" />
                                <path d="M97.6535 37.4006C100.789 34.2649 106.165 34.2649 109.3 37.4006L115.795 43.8958C118.931 47.0315 118.931 52.4069 115.795 55.5425L66.521 104.593C63.3854 107.729 58.01 107.729 54.8743 104.593L48.3791 98.0977C45.2434 94.9621 45.2434 89.5867 48.3791 86.451L97.6535 37.4006Z" fill="white" />
                            </g>
                            <defs>
                                <clipPath id="clip0_26532_33522">
                                    <rect width="142" height="142" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        <div className="asc-messages">
                            <h6>Application Submitted Successfully</h6>
                            <text>Your application for&nbsp;
                                <strong>
                                    {hrDataToApply.RequestForTalent}{hrDataToApply.company?.company_name ? ` at ${hrDataToApply.company?.company_name}` : ''}
                                    {hrDataToApply.ModeOfWork ? ` - ${hrDataToApply.ModeOfWork == "Office" ? 'Onsite' : hrDataToApply.ModeOfWork}` : ''}
                                </strong>
                                &nbsp;has been successfully submitted.
                            </text>
                        </div>
                    </div>
                    {is_tailored_paid && tailored_plan_validity > 0 && (
                        <div className="tailor-for-any-jd">
                            <h6>👋 Applying elsewhere or have another job in mind? Create a tailored resume for any JD</h6>
                            <button className="primaryBtn" onClick={handleCreateTailoredResume}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.88351 10.9346L10.8335 1.66797L10.0002 8.33463H16.5216C16.9102 8.33463 17.1225 8.78788 16.8737 9.08638L9.16685 18.3346L10.0002 11.668H4.25018C3.8725 11.668 3.6569 11.2368 3.88351 10.9346Z" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                Create tailored resume to custom JD
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}