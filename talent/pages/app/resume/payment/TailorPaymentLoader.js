'use client';

import { useSelector } from "react-redux";
import { CorrectIcon, RedirectIcon } from "../../../../assets/IconSVG";
import { trackDownloadTailorExtensionClicked } from "../../../../store/actions/trackingActions";

export default function TailorPaymentLoader() {
    const { user } = useSelector(state => state.auth);

    const handleDownloadTailorExtension = () => {
        window.open('https://chromewebstore.google.com/detail/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en', '_blank');
        trackDownloadTailorExtensionClicked('tailor_payment_loader');
    }

    return (
        <div className="modal-content tailor-payment-loader-modal">
            {/* <button type="button" className="modalCloseBtn" aria-label="Close">
                <CloseModalIcon />
            </button> */}
            <div className={`modal-body`}>
                {/* <div className='head'>
                    <h4>
                        Tailor Resume & Apply to&nbsp;
                        Director of Engineering - Onsite - Bengaluru
                        {/* {user?.resume_tailored?.active_plan && (new Date(user?.resume_tailored?.plan_end_date) > new Date()) &&
                        <span className="head-plan-validity">{user?.resume_tailored?.active_plan}: {formatTailorPlanValidity(user?.resume_tailored?.plan_end_date)} remaining</span>} */}
                {/* </h4>
                    <span className="head-company-name">Microsoft</span>
                </div> */}
                <div className="tp-loader-screen">
                    <div className="tpl-content">
                        <div className="tpl-arc-loader"></div>
                        <span className="tpl-loader-text">Payment confirmed! We’re now analysing your resume..</span>
                    </div>
                    {!user?.outreach?.chrome_extension && (
                        <div className="tp-download-extension-content">
                            <img className="tpde-tc-icon" src={"/images/talent/resume/tailor-cv-icon.svg"} alt="tailor-extension" />
                            <div className="tpde-top-text">
                                <h3 className="tpde-tt-title">Make the full use of your paid tailor plan along with Happpy Agent!</h3>
                                <p className="tpde-tt-subtitle">Download our extension to tailor your resume and run the Happpy Agent at any job portal</p>
                            </div>
                            <div className="tpde-points">
                                <span className="tpde-point"><CorrectIcon /> Directly tailor your resume for any job across all application platforms</span>
                                <span className="tpde-point"><CorrectIcon /> Run the Happpy Agent at any job portal</span>
                                {/* <span className="tpde-point"><CorrectIcon /> Tailor resumes for unlimited jobs</span> */}
                            </div>
                            <div className="tpde-download-action">
                                <button className="primaryBtn tpde-download-btn" onClick={handleDownloadTailorExtension}>
                                    Download Extension
                                    <RedirectIcon />
                                </button>
                                <p className="tpde-download-note">This will open in a new tab</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}