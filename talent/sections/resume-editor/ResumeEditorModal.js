import { useEffect, useState } from "react";
import { CloseModalIcon } from "../../assets/IconSVG";

import toast from "react-hot-toast";
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "@/talent/navigation/routerCompat";
import ConfirmActionModal from "../../components/common/ConfirmActionModal";
import ApplySuccessScreen from "../../components/signupapply/ApplySuccess";
import TailorPaymentScreen from "../../pages/app/resume/nudges/TailorPaymentScreen";
import DownloadResumeLoader from "../../pages/app/resume/payment/DownloadResumeLoader";
import { RESET_TAILOR_FOR_NEW_JOB, SEED_TAILOR, SET_LOADER, SET_SELECTED_RESUME, SET_TAILOR_MODAL_OPEN } from "../../store/actions/actionsTypes";
import { checkResumeMatchWithJob, getSimilarJobs } from "../../store/actions/resumeActions";
import { trackResumeMatchedWithJD } from "../../store/actions/trackingActions";
import { touchpointDoneHrAssociate } from "../../store/actions/UserActions";
import ResumeDrawer from "./ResumeDrawer";

export default function ResumeEditorModal() {
    const dispatch = useDispatch();
    const { tailor_to_job_modal, is_external_jd, jd_tailor_resume_id, status: TAILOR_STATUS, active_job, is_already_tailored, run_referral_agent, ready_jd } = useSelector(state => state.resumeEditor);
    const isOpen = jd_tailor_resume_id ? jd_tailor_resume_id : tailor_to_job_modal;
    const isRunReferralAgent = (isOpen && run_referral_agent) ? true : false;
    const isModalOpen = Boolean(jd_tailor_resume_id || tailor_to_job_modal);
    const { downloadTailorResume } = useSelector(state => state.loader);
    const [searchParams] = useSearchParams();
    const [intialCheckDone, setIntialCheckDone] = useState(false);
    const [step, setStep] = useState(1);
    const [matchLoader, setMatchLoader] = useState(false);
    const [paymentScreen, setPaymentScreen] = useState(false);
    const [paymentScreenMsg, setPaymentScreenMsg] = useState('');
    const [stepsData, setStepsData] = useState(["See Your Difference", "Align Your Resume", "Review Your New Tailored Resume"]);
    const [confirmCloseeModal, setConfirmCloseeModal] = useState(false);
    const [confirmApplyDirectly, setConfirmApplyDirectly] = useState(false);
    const [similarJobs, setSimilarJobs] = useState([]);

    // DEBUGGING
    // const resumeEditorReduxState = useSelector(state => state.resumeEditor);
    // console.log('resumeEditorReduxState', resumeEditorReduxState);

    const handleClose = (e, confirmedClose = false) => {
        if (active_job?.partner_job_tailor && active_job?.non_paid_user_logging && paymentScreen && !confirmedClose && !applySucessScreen) {
            setConfirmApplyDirectly(true);
            return;
        }
        if (active_job?.partner_job_tailor && stepsData[step - 1] != "Review Your New Tailored Resume" && !confirmedClose && !applySucessScreen) {
            setConfirmCloseeModal(true)
            return;
        }
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: false, outreach_hr_id: null } });
        setStepsData(["See Your Difference", "Align Your Resume", "Review Your New Tailored Resume"]);
        setApplySuccessScreen(false);
    }

    const fetchSimilarJobs = () => {
        let payload;
        if (active_job?.HR_Number) payload = { HR_Number: active_job?.HR_Number };
        getSimilarJobs(payload)(dispatch)
            .then((res) => {
                const smJobs = (res?.data?.data || [])?.slice(0, 3);
                setSimilarJobs(smJobs);
            })
    }

    useEffect(() => {
        if (isOpen) {
            if (intialCheckDone != isOpen && !is_external_jd) {
                matchResumeWithJob()
                fetchSimilarJobs();
            } else if (TAILOR_STATUS === 2 && !is_external_jd) {
                setStep(3);
            }
        }
    }, [intialCheckDone, isOpen])
    const [transformLoader, setTransformLoader] = useState(false);

    useEffect(() => {
        if (is_external_jd) {
            setStep(1);
            setIntialCheckDone(isOpen);
            if (!ready_jd) {
                setStepsData(Array.from(new Set(["Add Job Description", ...stepsData])));
            }
            fetchSimilarJobs();
        }
    }, [is_external_jd])

    const matchResumeWithJob = () => {
        let payload = {
            ...(jd_tailor_resume_id ? { tailored_resume_id: jd_tailor_resume_id } : { hr_id: isOpen, run_referral_agent: isRunReferralAgent }),
            // source_type: 1,2,3 //(optional)
            // source_resume_id: 0 //(optional)
        }
        setStep(1);
        dispatch({ type: RESET_TAILOR_FOR_NEW_JOB, payload: { jd_tailor_resume_id: jd_tailor_resume_id, tailor_to_job_modal: tailor_to_job_modal, is_already_tailored: is_already_tailored } });
        setMatchLoader(true);
        checkResumeMatchWithJob(payload)(dispatch)
            .then((res) => {
                if (res?.data?.status == 200) {
                    trackResumeMatchedWithJD()
                    setIntialCheckDone(isOpen);
                    dispatch({ type: SEED_TAILOR, payload: res.data.data });

                    if (res.data.data?.resume_list?.length > 0) {
                        if (res.data.data.status === 2) {
                            let sourceResumeUsed = res.data.data.resume_list.find(item => item.is_selected);
                            if (sourceResumeUsed) {
                                dispatch({ type: SET_SELECTED_RESUME, payload: sourceResumeUsed });
                            } else {
                                toast.error("Source resume previously used not found!");
                                dispatch({ type: SET_SELECTED_RESUME, payload: res.data.data.resume_list[0] });
                            }
                        } else {
                            dispatch({ type: SET_SELECTED_RESUME, payload: res.data.data.resume_list[0] });
                        }
                    }
                    if (res?.data?.data?.tailor_json) {
                        setStep(3);
                    }
                }
            })
            .catch((err) => {
                // if (err.response?.data?.message) {
                //     toast.error(err.response?.data?.message);
                // } else {
                //     toast.error("Something went wrong");
                // }
                setIntialCheckDone(false);
                if (err?.response?.data?.status == 422) {
                    setPaymentScreen(true);
                    if (err?.response?.data?.message != "") {
                        setPaymentScreenMsg(err?.response?.data?.message);
                    }
                } else if (err?.response?.data?.status == 400) {
                    handleClose();
                    toast.error(err?.response?.data?.message || "Something went wrong");
                } else {
                    handleClose();
                    toast.error("Something went wrong");
                }
            })
            .finally(() => {
                setMatchLoader(false);
            })
    }

    const onSuccessPayment = () => {
        setPaymentScreen(false);
        matchResumeWithJob();
    }

    const [applySucessScreen, setApplySuccessScreen] = useState(false);

    const handleApplyWithCurrentResume = async () => {
        if (active_job?.partner_job_tailor) {
            dispatch({ type: SET_LOADER, payload: true })
            // need to ensure that tailored resume is added in application in backend
            touchpointDoneHrAssociate(active_job.HR_Number, true)(dispatch)
                .then(res => {
                    setApplySuccessScreen(true);
                }).catch(err => {
                    console.log('err', err);
                }).finally(() => {
                    dispatch({ type: SET_LOADER, payload: false })
                })
            return;
        }
        let applyBtn = document.getElementById(`${tailor_to_job_modal}+singleOppAppyBtn`)
        if (applyBtn) {
            applyBtn.setAttribute('data-cta-name', 'resume-editor');
            applyBtn.click();
            dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: false } });
        }
    }

    return (
        <>
            <Modal
                isOpen={isModalOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal resume-editor-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    {(active_job?.partner_job_tailor && applySucessScreen) ?
                        <ApplySuccessScreen hrDataToApply={{ ...active_job, RequestForTalent: active_job.job_title }} handleClose={handleClose} partner_job_tailor={true} />
                        :
                        <div className="modal-content ">
                            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose} disabled={transformLoader}>
                                <CloseModalIcon />
                            </button>
                            {downloadTailorResume && <DownloadResumeLoader />}
                            {(matchLoader && is_already_tailored) && <SkeletonMatchLoader />}
                            {((intialCheckDone && isOpen == intialCheckDone) || (matchLoader && !is_already_tailored)) && (
                                <div className='content'>
                                    <ResumeDrawer
                                        step={step}
                                        setStep={setStep}
                                        stepsData={stepsData}
                                        transformLoader={transformLoader}
                                        setTransformLoader={setTransformLoader}
                                        matchLoader={matchLoader}
                                        setMatchLoader={setMatchLoader}
                                        setApplySuccessScreen={setApplySuccessScreen}
                                        similarJobs={similarJobs}
                                    />
                                </div>
                            )}
                            {paymentScreen &&
                                <TailorPaymentScreen
                                    paymentScreenMsg={paymentScreenMsg}
                                    onSuccess={onSuccessPayment}
                                    setApplySuccessScreen={setApplySuccessScreen}
                                    confirmApplyDirectly={confirmApplyDirectly}
                                    setConfirmApplyDirectly={setConfirmApplyDirectly}
                                    handleClose={handleClose}
                                    tailorModalScreen={true}
                                />
                            }
                        </div>
                    }
                </div>
            </Modal>

            <ConfirmActionModal
                isOpen={confirmCloseeModal}
                setOpen={setConfirmCloseeModal}
                title="Are you sure you want to stop tailoring your resume for this job before applying"
                text="You can continue tailoring now or apply instantly using your uploaded resume.."
                primaryActionText="Continue Tailoring"
                onPrimaryActionClick={() => setConfirmCloseeModal(false)}
                onCancel={() => setConfirmCloseeModal(false)}
                modalClass="confirm-close-tailor"
                secondaryActionBtn={true}
                secondaryActionText="Apply Now with current resume"
                onSecondaryActionClick={() => {
                    setConfirmCloseeModal(false);
                    handleApplyWithCurrentResume();
                }}
                thirdActionBtn={true}
                thirdActionText="Close without applying"
                onThirdActionClick={() => {
                    setConfirmCloseeModal(false);
                    handleClose('', true);
                }}
            />
        </>
    )
}

const SkeletonMatchLoader = () => {
    return (
        <div className="content tailor-loader-skeleton">
            <div className="tailored-resume-drawer-container">

                {/* HEADER */}
                <div className="tr-drawer-header">
                    <div className="head-title">
                        <div className="shimmer block title-block"></div>
                        <div className="shimmer block small-block"></div>
                    </div>

                    <div className="tr-drawer-steps-container">
                        <div className="step">
                            <div className="shimmer block circle"></div>
                            <div className="shimmer block step-text"></div>
                        </div>

                        <div className="step-line shimmer"></div>

                        <div className="step">
                            <div className="shimmer block circle"></div>
                            <div className="shimmer block step-text"></div>
                        </div>

                        <div className="step-line shimmer"></div>

                        <div className="step">
                            <div className="shimmer block circle"></div>
                            <div className="shimmer block step-text"></div>
                        </div>
                    </div>
                </div>

                <div className="tr-drawer-content">
                    <div className="trd-drawer-step1">

                        {/* MATCH RESULT */}
                        <div className="trd-resume-match-result">
                            <div className="mr-left">
                                <div className="shimmer block title-large"></div>
                                <div className="shimmer block small-block"></div>
                            </div>
                            <div className="mr-right">
                            </div>
                        </div>

                        {/* OVERVIEW */}
                        <div className="trd-resume-overview-container">

                            {/* Job Overview Row */}
                            <div className="job-overview-row trd-row">
                                <div className="ro-title">
                                    <div className="shimmer block label"></div>
                                </div>
                                <div className="ro-job-content">
                                    <div className="shimmer block square"></div>
                                    <div className="shimmer block medium-block"></div>
                                </div>
                                <div className="ro-resume-content">
                                    <div className="shimmer block medium-block"></div>
                                </div>
                            </div>

                            {/* Job Title Row */}
                            <div className="trd-row">
                                <div className="ro-title">
                                    <div className="shimmer block label"></div>
                                </div>
                                <div className="ro-job-content">
                                    <div className="shimmer block medium-block"></div>
                                </div>
                                <div className="ro-resume-content">
                                    <div className="shimmer block medium-block"></div>
                                </div>
                            </div>

                            {/* YOE Row */}
                            <div className="trd-row">
                                <div className="ro-title">
                                    <div className="shimmer block label"></div>
                                </div>
                                <div className="ro-job-content">
                                    <div className="shimmer block small-block"></div>
                                </div>
                                <div className="ro-resume-content">
                                    <div className="shimmer block small-block"></div>
                                </div>
                            </div>

                            {/* Keywords */}
                            <div className="trd-row">
                                <div className="ro-title">
                                    <div className="shimmer block label"></div>
                                </div>
                                <div className="ro-skills">
                                    <div className="shimmer tag"></div>
                                    <div className="shimmer tag"></div>
                                    <div className="shimmer tag"></div>
                                    <div className="shimmer tag"></div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="trd-row">
                                <div className="ro-title">
                                    <div className="shimmer block label"></div>
                                </div>
                                <div className="ro-summary">
                                    <div className="shimmer block summary"></div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer Button */}
                <div className="tr-drawer-actions">
                    <div className="shimmer button"></div>
                </div>
            </div>
        </div>
    );
};