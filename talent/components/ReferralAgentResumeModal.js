
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { CloseModalIcon } from "../assets/IconSVG";
import { APP_URL, IMAGE_URL } from "./Constant";
import ResumePreviewer from "../sections/resume-editor/ResumePreviewer";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { checkResumeMatchWithJob } from "../store/actions/resumeActions";
import ConfirmationModal from "./common/ConfirmationModal";
import ReferralAgentPreviewModal from "./ReferralAgentPreviewModal";
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();

export default function ReferralAgentResumeModal({ isOpen, onClose, onWithProfileResume = () => { }, onWithTailoredResume = () => { }, hrID, HR_Number }) {
    const { last_tailored_for_hr, tailor_json, config_json, sorting_json, generic_sections } = useSelector(state => state.resumeEditor);
    const dispatch = useDispatch();
    const [showPlaceHolderDialog, setShowPlaceHolderDialog] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [selectedResume, setSelectedResume] = useState(null);

    const handleShowPreviewModal = (selectResume = 'tailored') => {
        setSelectedResume(selectResume);
        setShowPreviewModal(true);
    }

    const handleAfterPreviewModal = () => {
        if (selectedResume === 'profile') {
            onWithProfileResume();
        } else {
            handleWithTailoredResume();
        }
        setShowPreviewModal(false);
    }

    const handleWithTailoredResume = async () => {
        const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
        const htmlContent = document.getElementById("resume-previewer").outerHTML;
        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }
        const payloadHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`;
        onWithTailoredResume(payloadHtml);
    }

    const [tailoredResumeData, setTailoredResumeData] = useState(null)

    useEffect(() => {
        if (isOpen) {
            if (last_tailored_for_hr === hrID) {
                setTailoredResumeData({
                    tailor_json,
                    config_json,
                    sorting_json
                })
            } else {
                getTailoredResumeData()
            }
        }
    }, [isOpen])

    const getTailoredResumeData = () => {
        let payload = {
            hr_id: hrID
        }
        checkResumeMatchWithJob(payload)(dispatch)
            .then((res) => {
                if (res?.data?.status == 200) {
                    setTailoredResumeData(res.data.data);
                } else {
                    toast.error("Error fetching tailored resume data");
                }
            })
            .catch((err) => {
                toast.error("Something went wrong");
            })
    }


    return (
        <>
            <Modal
                isOpen={isOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal authTailorAlt referralAgentResumeModal ${(isOpen) ? "show" : ''}`}
            >
                <div className="modal-content">
                    <button type="button"
                        className="modalCloseBtn" aria-label="Close"
                        onClick={onClose}
                    >
                        <CloseModalIcon />
                    </button>
                    <div className="modal-body">
                        <div className='head'>
                            <h3>How would you like to run Happpy Agent?</h3>
                        </div>
                        <div className='tailorAlt'>
                            <div className='tailorAltItem existing'>
                                <div className='icon'>
                                    <img src={IMAGE_URL + 'tailor-alt-existing.png'} />
                                </div>
                                <h6>Your profile resume will be used</h6>
                                <button className='primaryBtn black' onClick={() => handleShowPreviewModal('profile')}>With profile resume</button>
                            </div>
                            <div className='tailorAltItem tailored'>
                                <div className='icon'>
                                    <img src={IMAGE_URL + 'tailor-alt-tailored.png'} />
                                </div>
                                <h6>Tailored resume for this job will be used</h6>
                                <button className='primaryBtn black' onClick={() => handleShowPreviewModal('tailored')}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.40081 6.58224C9.29802 4.97272 9.74662 4.16797 10.4173 4.16797C11.088 4.16797 11.5366 4.97272 12.4338 6.58223L12.6659 6.99863C12.9209 7.45601 13.0484 7.68469 13.2472 7.83558C13.4459 7.98647 13.6935 8.04248 14.1886 8.1545L14.6393 8.25649C16.3816 8.6507 17.2527 8.8478 17.46 9.51428C17.6672 10.1808 17.0734 10.8752 15.8856 12.2642L15.5783 12.6235C15.2408 13.0182 15.072 13.2155 14.9961 13.4597C14.9202 13.7038 14.9457 13.9671 14.9967 14.4937L15.0432 14.9732C15.2227 16.8263 15.3125 17.7529 14.7699 18.1648C14.2273 18.5767 13.4117 18.2011 11.7804 17.45L11.3583 17.2557C10.8948 17.0423 10.663 16.9356 10.4173 16.9356C10.1716 16.9356 9.93985 17.0423 9.47629 17.2557L9.05425 17.45C7.42296 18.2011 6.60732 18.5767 6.06471 18.1648C5.52211 17.7529 5.6119 16.8263 5.79147 14.9732L5.83793 14.4937C5.88896 13.9671 5.91448 13.7038 5.83855 13.4597C5.76263 13.2155 5.59387 13.0182 5.25634 12.6235L4.94905 12.2642C3.76129 10.8752 3.1674 10.1808 3.37466 9.51428C3.58191 8.8478 4.45305 8.6507 6.19532 8.25649L6.64607 8.1545C7.14117 8.04248 7.38872 7.98647 7.58749 7.83558C7.78625 7.68469 7.91373 7.45601 8.16869 6.99863L8.40081 6.58224Z" fill="white" />
                                        <path d="M4.05643 2.08203C4.08142 1.99387 4.23789 1.99335 4.26348 2.08133C4.38032 2.48309 4.59696 3.07693 4.92456 3.40233C5.25217 3.72773 5.84747 3.94036 6.25001 4.05448C6.33816 4.07947 6.33869 4.23594 6.25071 4.26153C5.84895 4.37836 5.2551 4.59501 4.9297 4.92261C4.6043 5.25022 4.39167 5.84551 4.27755 6.24805C4.25256 6.33621 4.09609 6.33673 4.07051 6.24875C3.95367 5.84699 3.73703 5.25315 3.40942 4.92775C3.08182 4.60235 2.48652 4.38972 2.08398 4.2756C1.99583 4.25061 1.9953 4.09414 2.08328 4.06855C2.48504 3.95172 3.07889 3.73507 3.40429 3.40747C3.72968 3.07986 3.94231 2.48457 4.05643 2.08203Z" fill="white" />
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.8333 2.70703C16.1785 2.70703 16.4583 2.98685 16.4583 3.33203V3.54036H16.6667C17.0118 3.54036 17.2917 3.82019 17.2917 4.16536C17.2917 4.51054 17.0118 4.79036 16.6667 4.79036H16.4583V4.9987C16.4583 5.34388 16.1785 5.6237 15.8333 5.6237C15.4882 5.6237 15.2083 5.34388 15.2083 4.9987V4.79036H15C14.6548 4.79036 14.375 4.51054 14.375 4.16536C14.375 3.82019 14.6548 3.54036 15 3.54036H15.2083V3.33203C15.2083 2.98685 15.4882 2.70703 15.8333 2.70703Z" fill="white" />
                                    </svg>
                                    With tailored resume
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            {tailoredResumeData &&
                <div className="resume-tailored-previewer-hidden" >
                    <ResumePreviewer
                        templateConfig={tailoredResumeData.config_json}
                        resumeJson={tailoredResumeData.tailor_json}
                        sortingOrder={tailoredResumeData.sorting_json}
                        genericSections={generic_sections}
                        raPreview={true}
                    />
                </div>
            }
            <ConfirmationModal
                isOpen={showPlaceHolderDialog}
                setOpen={setShowPlaceHolderDialog}
                subtitle={<>The tailored resume contains placeholder tags like <span style={{ fontWeight: "500", color: "#ff7b24" }}>{`{{ X%}}`}</span></>}
                description="Please make appropriate changes and try again."
                primaryBtnText="Got It"
                onPrimaryClick={() => setShowPlaceHolderDialog(false)}
                noSecondaryAction
                onCancel={() => setShowPlaceHolderDialog(false)}
            />
            {showPreviewModal &&
                <ReferralAgentPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    onConfirm={handleAfterPreviewModal}
                    selectedResume={selectedResume}
                    noTailorHTML={true}
                    HR_Number={HR_Number}
                />
            }
        </>
    )
}