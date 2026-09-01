import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SET_TAILOR_MODAL_OPEN } from "../../store/actions/actionsTypes";
import { ModalCloseIcon } from "../../assets/IconSVG";
import { trackExternalJDPopupOpen, trackTailorPricePopupOpen } from "../../store/actions/trackingActions";
import TailorResumePaymentModal from "../../pages/app/resume/nudges/TailorResumePaymentModal";

export default function AllJobsTailorResumeBanner() {
    const { user } = useSelector(state => state.auth);
    const { tailored_plan_validity, is_tailored_paid } = user?.resume_tailored || {};
    const [showBanner, setShowBanner] = useState(false);
    const [showTailorResumePaymentModal, setShowTailorResumePaymentModal] = useState(false);
    const dispatch = useDispatch();

    // useEffect(() => {
    //     if(!is_tailored_paid) return;

    //     const data = JSON.parse(localStorage.getItem("allJobsCreateTailorResumeBanner_interacted_data") || "{}");
    //     const interactedRecently = data.interacted && Date.now() - data.timestamp < 24 * 60 * 60 * 1000; // < 24 hours
    //     setShowBanner(!interactedRecently);
    // }, [user]);

    const handleCreateTailoredResume = () => {
        if (!is_tailored_paid || tailored_plan_validity === 0) {
            setShowTailorResumePaymentModal(true);
            trackTailorPricePopupOpen("all_jobs_create_tailor_resume_banner");
            return;
        }
        trackExternalJDPopupOpen("all_jobs_create_tailor_resume_banner");
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: true, is_external_jd: true } });
    }

    const handleCloseBanner = () => {
        setShowBanner(false);
        const interactionData = {
            interacted: true,
            timestamp: Date.now()
        };
        localStorage.setItem('allJobsCreateTailorResumeBanner_interacted_data', JSON.stringify(interactionData));
    }

    return (
        <>
        {showBanner && (
        <div className="all-jobs-tailor-resume-banner">
            <button className="closeBtn" onClick={() => handleCloseBanner()}><ModalCloseIcon/></button>
            <div className="tr-content">
                <h2>👋 Applying elsewhere too? </h2>
                <span>Upload any JD and get a perfectly matched resume instantly</span>
            </div>
            <button className="primaryBtn" onClick={handleCreateTailoredResume}>
                Create Tailored Resume
            </button>
        </div>
        )}
        {/* {showTailorResumePaymentModal && (
            <TailorResumePaymentModal isOpen={showTailorResumePaymentModal} setIsOpen={setShowTailorResumePaymentModal} />
        )} */}
        </>
    )
}