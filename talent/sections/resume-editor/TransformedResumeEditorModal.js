import { useEffect, useState } from "react";
import { BackArrowIcon } from "../../assets/IconSVG";

import toast from "react-hot-toast";
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch, useSelector } from "react-redux";
import { APP_URL } from "../../components/Constant";
import { base64ToBlob, buildFormData } from "../../components/Helper";
import { RESET_TRANSFORMED_RESUME_MODAL, SEED_TRANSFORMED_RESUME, SET_LOADER, SET_PROFILE_DATA } from "../../store/actions/actionsTypes";
import { downloadTransformedResume, fetchTransformedResume, updateTransformedResume } from "../../store/actions/resumeActions";
import ResumeEditor from "./ResumeEditor";
import DownloadResumeLoader from "../../pages/app/resume/payment/DownloadResumeLoader";
import { SwitchInput } from "../../components/common/Inputs";
import { generateAwsUploadUrl, getProfilePercent, profileUpsert, updateTransformedResumeInProfile } from "../../store/actions/UserActions";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import Loader from "../../components/Loader";

const getTailoredPageCount = () => {
    let pageCount = 1;
    let container = document.getElementById('resume-previewer');
    if (container) {
        let pages = container.querySelectorAll('.page-separator');
        pageCount = pages.length + 1;
    }
    return pageCount;
}

export default function TransformedResumeEditorModal() {
    const dispatch = useDispatch();
    const isMobile = window.innerWidth < 768;
    const { transformation_id, tailor_json, config_json, sorting_json, generic_sections, inputs: tailorInputs
    } = useSelector(state => state.resumeEditor);

    const { isLoading, downloadTailorResume } = useSelector(state => state.loader);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lastOpen, setLastOpen] = useState("");
    const [showPlaceHolderDialog, setShowPlaceHolderDialog] = useState(false);


    const handleClose = () => {
        dispatch({ type: RESET_TRANSFORMED_RESUME_MODAL });
        setIsModalOpen(false);
    }

    useEffect(() => {
        if (transformation_id) {
            if (transformation_id != lastOpen) {
                getTransformedResume()
            } else {
                setIsModalOpen(true);
            }
        }
    }, [transformation_id])
    const [transformLoader, setTransformLoader] = useState(false);

    const getTransformedResume = () => {
        setTransformLoader(true);
        fetchTransformedResume(transformation_id)(dispatch)
            .then((res) => {
                setIsModalOpen(true);
                setLastOpen(transformation_id);
                if (res?.data?.status == 200) {
                    dispatch({
                        type: SEED_TRANSFORMED_RESUME,
                        payload: {
                            ...res.data.data,
                            transformation_id: transformation_id,
                            tailor_json: res.data.data.transform_json,
                        }
                    });
                }
            })
            .catch((err) => {
                handleClose();
                toast.error("Something went wrong");
            })
            .finally(() => {
                setTransformLoader(false);
            })
    }


    const handleDownloadTailoredResume = async () => {
        const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
        const htmlContent = document.getElementById("resume-previewer").outerHTML;

        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }

        const payload = {
            transformation_id: transformation_id,
            page_count: getTailoredPageCount(),
            type: "pdf",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`,
        }

        downloadTransformedResume(payload)(dispatch)
            .then((response) => {
                let blob = response?.data?.data?.blob;
                const type = response?.data?.data?.type;
                const filename = response?.data?.data?.filename;
                let url = null;
                if (type == 'pdf') {
                    blob = base64ToBlob(blob, 'application/pdf');
                    blob.name = filename;
                    url = URL.createObjectURL(blob);
                }
                else if (type == 'docx') {
                    blob = base64ToBlob(blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    blob.name = filename;
                    url = URL.createObjectURL(blob);
                }

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("target", "_blank")
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);

                if (type == 'pdf' || type == 'docx') {
                    URL.revokeObjectURL(url);
                }
            }).catch((err) => {
                toast.error("Something went wrong");
                console.log(err);
            });
    }

    const [uploadResumeFileId, setUploadResumeFileId] = useState(null);

    const handleUploadResumeToProfile = async () => {
        const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
        const htmlContent = document.getElementById("resume-previewer").outerHTML;

        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }

        const payload = {
            transformation_id: transformation_id,
            page_count: getTailoredPageCount(),
            type: "pdf",
            html: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`,
        }

        dispatch({ type: SET_LOADER, payload: true })
        updateTransformedResumeInProfile(payload)(dispatch)
            .then(async (response) => {
                if (response?.status === 200) {
                    let blob = response?.data?.data?.blob;
                    let url = response?.data?.data?.url;
                    blob = base64ToBlob(blob, 'application/pdf');
                    await fetch(url,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/pdf"
                            },
                            body: blob
                        })
                        .then(res => {
                            if (res?.status === 200) {
                                let payload = {};
                                let reqMap = {
                                    resume_file_id: response?.data?.data?.file_id
                                }
                                payload["field"] = "resume_file_id";
                                payload["value"] = reqMap;
                                let payloadFormData = new FormData();
                                for (let [key, data] of Object.entries(payload)) {
                                    payloadFormData = buildFormData(payloadFormData, data, key);
                                }
                                profileUpsert(payloadFormData, true)(dispatch)
                                    .then((res) => {
                                        dispatch({
                                            type: SET_PROFILE_DATA,
                                            payload: {
                                                ...res.data.data,
                                            }
                                        })
                                        sessionStorage.setItem("fetchLatestResume", true)
                                        toast.success("Resume uploaded to profile successfully", { duration: 6000 });
                                        dispatch({ type: SET_LOADER, payload: false })
                                        getProfilePercent(false)(dispatch);
                                    })
                                    .catch((err) => {
                                        toast.error("Error while updating resume in profile", { duration: 6000 });
                                        console.log("Error while updating resume in profile", err);
                                    });
                            }
                        })
                        .catch(err => {
                            console.error("Error while uploading resume", err);
                            toast.error("Error while uploading resume", { duration: 6000 });
                        })
                }
            }).catch((err) => {
                toast.error("Error while trying to upload resume", { duration: 6000 });
                console.log("Error while trying to upload resume", err);
            });
    }

    const updateResume = (reqObj) => (dispatchDummy) => {
        let payload = {
            transformation_id: transformation_id,
            ...reqObj,
        }
        if (reqObj.tailor_json) {
            payload.transform_json = reqObj.tailor_json;
            delete payload.tailor_json;
        }
        updateTransformedResume(payload)(dispatch)
            .then((res) => {
            })
            .catch((err) => {
                toast.error("Something went wrong");
                console.log(err);
            });
    }

    const [showChanges, setShowChanges] = useState(false);
    const handleShowChanges = (e) => {
        if (e.target.checked) {
            setShowChanges(true);
        } else {
            setShowChanges(false);
        }
    }

    return (
        <>
            <Modal
                isOpen={isModalOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal resume-editor-modal transformed-editor`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        {downloadTailorResume && <DownloadResumeLoader />}
                        {isLoading && <Loader />}
                        <div className='content'>
                            <div className={`tailored-resume-drawer-container resume-editor `}>
                                <div className="tr-drawer-header">
                                    <div className="head-title">
                                        <div className="head-title-left">
                                            <button type="button" className="header-back-btn" aria-label="Back" onClick={handleClose} disabled={transformLoader}>
                                                <BackArrowIcon />
                                            </button>
                                            <h3>Transformed Resume</h3>
                                        </div>
                                        {/* <div className="switch-container">
                                            Show Changes
                                            <SwitchInput checked={showChanges} onChange={handleShowChanges} />
                                        </div> */}
                                    </div>
                                </div>
                                <div className={`tr-drawer-content ${transformLoader ? 'transform-loader-active' : ''} ${showChanges ? 'show-changes-active' : ''}`}>
                                    <ConfirmationModal
                                        isOpen={showPlaceHolderDialog}
                                        setOpen={setShowPlaceHolderDialog}
                                        subtitle={<>The resume contains placeholder tags like <span style={{ fontWeight: "500", color: "#ff7b24" }}>{`{{ X%}}`}</span></>}
                                        description="Please make appropriate changes and try again."
                                        primaryBtnText="Got It"
                                        onPrimaryClick={() => setShowPlaceHolderDialog(false)}
                                        noSecondaryAction
                                        onCancel={() => setShowPlaceHolderDialog(false)}
                                    />
                                    <ResumeEditor
                                        defaultTabReport={false}
                                        tailor_json={tailor_json}
                                        config_json={config_json}
                                        sorting_json={sorting_json}
                                        tailored_resume_id={transformation_id}
                                        generic_sections={generic_sections}
                                        tailorInputs={tailorInputs}
                                        updateTailoredResume={updateResume}
                                        transformedModal
                                    />
                                </div>
                                <div className="tr-drawer-actions">
                                    <div className="drawer-actions-left">
                                        {isMobile &&
                                            <>
                                                <button className="primaryBtn blackBtn" onClick={handleUploadResumeToProfile} disabled={isLoading}>
                                                    Upload to Profile
                                                </button>
                                                <button className="outlinedBtn" onClick={() => handleDownloadTailoredResume()} disabled={isLoading}>
                                                    Download Resume
                                                </button>
                                            </>
                                        }
                                    </div>
                                    {!isMobile &&
                                        <div className="drawer-actions-right">
                                            <button className="primaryBtn blackBtn" onClick={handleUploadResumeToProfile} disabled={isLoading}>
                                                Upload Resume to Profile
                                            </button>
                                            <button className="underlinedBtn" onClick={() => handleDownloadTailoredResume()} disabled={isLoading}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7 10L12 15L17 10" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M12 15V3" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                <span>
                                                    Download Resume
                                                </span>
                                            </button>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal >
        </>
    )
}