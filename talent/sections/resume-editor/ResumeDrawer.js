import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import '@/talent/styles/customRadio.css';
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "@/talent/navigation/routerCompat";
import { Link } from "@/talent/navigation/routerCompat";
import { BackIcon, CancelCircleIcon, CloseModalIcon, GreenCheckCircleIcon, GreenCheckIcon, QuestionCircleIcon, RedirectIcon, ResumeFileIcon, ToolTipSVG, WarningCircleIcon, WhiteArrowDropDownIcon, WhiteArrowRightIcon } from "../../assets/IconSVG";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { CustomTooltip } from "../../components/common/CustomTooltip";
import ProgressBar from "../../components/common/ProgressBar";
import { API_REFERRAL_AGENT_UPDATE_EXTERNAL_JOB, APP_URL } from "../../components/Constant";
import { base64ToBlob, formatDateRelativeToNow, formatTailorPlanValidity, getApplyButtonText, POST_API } from "../../components/Helper";
import TransformLoader from "../../pages/app/resume/payment/TransformLoader";
import CompanyLogo from "../../pages/app/work-components/CompanyLogo";
import { RESET_TAILOR_FOR_NEW_JOB, SEED_TAILOR, SET_DOWNLOAD_TAILOR_RESUME_LOADER, SET_LOADER, SET_OUTREACH_DATA, SET_SELECTED_RESUME, SET_TAILOR_MODAL_OPEN, SET_TAILOR_RESUME_DOWNLOADED, UPDATE_CURRENT_USER } from "../../store/actions/actionsTypes";
import { checkResumeMatchWithJDExtract, checkResumeMatchWithJob, createTailoredResume, downloadTailoredResume, updateResumeTailoredForAgent, updateTailoredResume } from "../../store/actions/resumeActions";
import { trackDownloadTailorExtensionClicked, trackGenerateTailoredResumeError, trackResumeMatchedWithJD, trackResumeSelectionGuideInteracted, trackTailorResumeGenerated } from "../../store/actions/trackingActions";
import { profileResumeDownload, touchpointDoneHrAssociate } from "../../store/actions/UserActions";
import { ArrowDownIcon, CrossIcon } from "./ResumEditorIcons";
import ResumeEditor from "./ResumeEditor";
import ResumeExternalJD from "./ResumeExternalJD";
import ResumePreviewerGhost from "./ResumePreviewerGhost";
import NewTransformLoader from "../../pages/app/resume/payment/NewTransformLoader";
import MatchLoader from "../../pages/app/resume/payment/MatchLoader";
import PromoTailorExtModal from "../../pages/app/resume/nudges/PromoTailorExtModal";
import ReferralAgentModal from "../../components/ReferralAgentModal";
import ReferralAgentPreviewModal from "../../components/ReferralAgentPreviewModal";


const getTailoredPageCount = () => {
    let pageCount = 1;
    let container = document.getElementById('resume-previewer');
    if (container) {
        let pages = container.querySelectorAll('.page-separator');
        pageCount = pages.length + 1;
    }
    return pageCount;
}

export default function ResumeDrawer({ step, setStep, stepsData, transformLoader, setTransformLoader, matchLoader, setMatchLoader, setApplySuccessScreen, similarJobs }) {
    const { user } = useSelector(state => state.auth);
    const location = useLocation();
    const {
        tailor_to_job_modal, matching_json, resume_list, active_job, pdf_download_at,
        tailored_resume_id, selected_resume, jd_tailor_resume_id, status: TAILOR_STATUS, last_updated_at, inputs: previousInputs,
        tailor_json, config_json, sorting_json, generic_sections, run_referral_agent,
        is_external_jd, external_temp_hr_id, ready_jd, outreach_hr_id
    } = useSelector((state) => state.resumeEditor);

    const [skills, setSkills] = useState([]);
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedSection, setSelectedSection] = useState(['summary']);
    const [workExperienceEdit, setWorkExperienceEdit] = useState('quick-edit');
    const [projectsEdit, setProjectsEdit] = useState('quick-edit');
    const [showResumeDropdown, setShowResumeDropdown] = useState(false);
    const [showSelectedResumeEducationTooltip, setShowSelectedResumeEducationTooltip] = useState(false);
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.loader);
    // const [selectedResume, setSelectedResume] = useState(selected_resume);
    const [jobDescription, setJobDescription] = useState({ value: '', error: '' });
    const [showDownloadExtensionBanner, setShowDownloadExtensionBanner] = useState(false);
    const [showPlaceHolderDialog, setShowPlaceHolderDialog] = useState(false);
    // Tracks that this tailor session was kicked off with a pre-supplied JD
    // (e.g. opened from a Job Agent row). Persists after `ready_jd` is cleared
    // by RESET_TAILOR_FOR_NEW_JOB so we can keep hiding the "back to JD entry"
    // CTA on later steps. Resets naturally when the modal unmounts.
    const [openedWithReadyJd, setOpenedWithReadyJd] = useState(false);
    const activeOutreachHrId = outreach_hr_id || null;


    // const resumeReduxData = useSelector((state) => state.resumeEditor);
    // console.log('resumeReduxData :', resumeReduxData);
    // console.log('skills :', skills);

    const [backToStep, setBackToStep] = useState(false);
    const getScoreClass = (section, score) => {
        switch (section) {
            case 'job_role':
                return score > 0 ? 'success' : 'cancel';
            case 'years_of_experience':
                return score == 2.5 ? 'success' : 'cancel';
            case 'job_keywords':
                return score == 0 ? 'cancel' : (score > 0 && score < 2.5) ? 'warning' : 'success';
            case 'summary':
                return 'warning';
            default:
                return '';
        }
    }

    const handleSectionChange = (e, section) => {
        if (e.target.checked) {
            setSelectedSection([...selectedSection, section]);
        } else {
            setSelectedSection(selectedSection.filter((s) => s !== section));
        }
    }

    const handleSkillChange = (skillName, isManualAdded = false) => {
        if (isManualAdded) {
            let skillGroup = [];
            skillGroup.push(skillName);
            setSkills([...skills, skillGroup]);
        }
        if (selectedSkills.includes(skillName)) {
            setSelectedSkills(selectedSkills.filter((skill) => skill !== skillName));
        } else {
            setSelectedSkills([...selectedSkills, skillName]);
        }
    }

    const setResumeDownloaded = () => {
        dispatch({ type: SET_TAILOR_RESUME_DOWNLOADED, payload: new Date().toISOString() });
    }

    useEffect(() => {
        try {
            if (localStorage.getItem('tailor_selected_resume_education_dismissed')) {
                setShowSelectedResumeEducationTooltip(false);
            }
        } catch (e) { /* ignore */ }
    }, []);

    const dismissSelectedResumeEducationTooltip = () => {
        trackResumeSelectionGuideInteracted();
        setShowSelectedResumeEducationTooltip(false);
        try {
            localStorage.setItem('tailor_selected_resume_education_dismissed', '1');
        } catch (e) { /* ignore */ }
    };

    const handleDownloadTailoredResume = async () => {
        const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
        const htmlContent = document.getElementById("resume-previewer").outerHTML;

        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }

        const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`;
        const payload = {
            tailored_resume_id: tailored_resume_id,
            type: "pdf",
            page_count: getTailoredPageCount(),
            html: fullHtml,
        }

        downloadTailoredResume(payload)(dispatch)
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
                setResumeDownloaded();

                if (type == 'pdf' || type == 'docx') {
                    URL.revokeObjectURL(url);
                }
                if (activeOutreachHrId != null) {
                    updateResumeTailoredForAgent({ id: activeOutreachHrId, resume: fullHtml })(dispatch)
                        .then((res) => {
                            toast.success('Tailored resume updated successfully !');
                            try {
                                window.dispatchEvent(new CustomEvent('job-agent:tailor-updated', {
                                    detail: { activeOutreachHrId }
                                }));
                            } catch (e) { /* ignore */ }
                        })
                        .catch((err) => {
                            console.log('err', err);
                        })
                }

                if (is_external_jd && external_temp_hr_id != null) {
                    /** TempHr::ACTION_TAILOR_DONE_AND_AGENT_RUN */
                    POST_API(API_REFERRAL_AGENT_UPDATE_EXTERNAL_JOB, {
                        id: external_temp_hr_id,
                        action: 4,
                        resume: fullHtml,
                    }).catch(() => { });
                }
            }).catch((err) => {
                toast.error("Something went wrong");
                console.log(err);
            })
    }

    const handleResumeSelection = (resume) => {
        setShowResumeDropdown(false);
        if ((resume.source_resume_id + 'xid' + resume.source_type) == (selected_resume.source_resume_id + 'xid' + selected_resume.source_type)) return;
        dispatch({ type: SET_SELECTED_RESUME, payload: resume });
        // setSelectedResume(resume);
        let payload = {
            ...(tailored_resume_id ? { tailored_resume_id: tailored_resume_id } : { hr_id: tailor_to_job_modal }),
            ...(tailor_to_job_modal && tailor_to_job_modal !== true ? { hr_id: tailor_to_job_modal } : {}),
            source_type: resume.source_type, //(optional)
            source_resume_id: resume.source_resume_id //(optional)
        }
        if (backToStep) {
            payload.back_to_step = true;
        }
        setMatchLoader(true);
        checkResumeMatchWithJob(payload)(dispatch)
            .then((res) => {
                trackResumeMatchedWithJD({
                    resume_changed: true
                })
                dispatch({ type: SEED_TAILOR, payload: res.data.data });
            })
            .catch((err) => {
                if (err.response?.data?.message) {
                    toast.error(err.response?.data?.message);
                } else {
                    toast.error("Something went wrong");
                }
            })
            .finally(() => {
                setMatchLoader(false);
            })
    }

    const [defaultTabReport, setDefaultTabReport] = useState(false);
    const [confirmRegenerateResume, setConfirmRegenerateResume] = useState(false);
    const [justTailored, setJustTailored] = useState(false);

    const handleRegenerateResume = () => {
        if (backToStep && last_updated_at) {
            setConfirmRegenerateResume(true);
        } else {
            handleGenerateTailoredResume();
        }
    }

    const handleGenerateTailoredResume = () => {
        const userAgent = navigator.userAgent;
        const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isTabletAgent = /Tablet|iPad|iPod/i.test(userAgent);
        setConfirmRegenerateResume(false);
        let payload = {
            tailored_resume_id: tailored_resume_id,
            source_type: selected_resume.source_type,
            source_resume_id: selected_resume.source_resume_id,
            job_keywords: selectedSkills,
            summary: selectedSection.includes('summary'),
            device: (isMobile && isMobileAgent && isTabletAgent) ? 'Mobile' : 'Desktop',
            experience: selectedSection.includes('work-experience') ? (workExperienceEdit === 'quick-edit' ? 'quick' : 'all') : false
        }
        setTransformLoader(true);
        createTailoredResume(payload)(dispatch)
            .then((res) => {
                trackTailorResumeGenerated()
                dispatch({ type: SEED_TAILOR, payload: res.data.data });
                setStep(step + 1);
                setDefaultTabReport(true);
                sessionStorage.setItem('tailored_resume_generated_' + active_job.HR_Number, true);
                setJustTailored(true);
            })
            .catch((err) => {
                let errorMessage = err.response?.data?.message || "Something went wrong";
                toast.error(errorMessage);
                trackGenerateTailoredResumeError({ error_message: errorMessage });
            })
            .finally(() => {
                setTransformLoader(false);
            })
    }

    // const handleRemoveSkill = (index) => {
    //     const newSkills = [...skills];
    //     newSkills.splice(index, 1);
    //     setSkills(newSkills);
    // }

    useEffect(() => {
        formatAndSetSkills(matching_json.job_keywords?.non_matching_keywords);
    }, [matching_json]);

    useEffect(() => {
        const isVisible = stepsData[step - 1] == "Add Job Description" && !user?.outreach?.chrome_extension;
        setShowDownloadExtensionBanner(isVisible);
    }, [step, user]);

    const formatAndSetSkills = (non_matching_keywords) => {
        let skills = [];
        if (non_matching_keywords && non_matching_keywords.length > 0) {
            non_matching_keywords.forEach((keyword) => {
                let skillGroup = [];
                if (keyword.type == "or_group") {
                    skillGroup = keyword?.options.map((option) => option);
                } else {
                    skillGroup.push(keyword.keyword);
                }
                skills.push(skillGroup);
            });
        }
        setSkills(skills);
        return skills;
    }
    const handleCustomAddedSkill = (skills, prevSkills) => {
        if (prevSkills && prevSkills.length > 0) {
            prevSkills.forEach((skill) => {
                if (skills.some((skillGroup) => skillGroup.includes(skill))) {
                    return;
                }
                let skillGroup = [];
                skillGroup.push(skill);
                skills.push(skillGroup);
            });
            setSkills(skills);
        }
    }


    useEffect(() => {
        if (previousInputs && Object.keys(previousInputs).length > 0) {
            setTimeout(() => {
                let prevSelectedSection = [];
                if (previousInputs.job_keywords) {
                    let skills = formatAndSetSkills(matching_json.job_keywords?.non_matching_keywords);

                    const previousSkills = previousInputs?.job_keywords || [];
                    handleCustomAddedSkill(skills, previousSkills);
                    setSelectedSkills(previousSkills);
                }

                if (previousInputs.summary && previousInputs.summary == true) {
                    prevSelectedSection.push('summary');
                }
                if (previousInputs.experience) {
                    prevSelectedSection.push('work-experience');
                    setWorkExperienceEdit(previousInputs.experience === 'quick' ? 'quick-edit' : 'full-edit');
                }
                if (prevSelectedSection) {
                    setSelectedSection(prevSelectedSection);
                }
            }, 1000);
        }
    }, [previousInputs]);

    const handleApplyNow = async () => {
        const htmlContent = document.getElementById("resume-previewer").outerHTML;
        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }
        if (active_job?.partner_job_tailor) {
            dispatch({ type: SET_LOADER, payload: true })
            // need to ensure that tailored resume is added in application in backend
            touchpointDoneHrAssociate(active_job.HR_Number, true)(dispatch)
                .then(res => {
                    setApplySuccessScreen(true);
                }).catch(err => {
                    console.log('err', err);
                })
                .finally(() => {
                    dispatch({ type: SET_LOADER, payload: false })
                })
            return;
        }

        if (!pdf_download_at) {
            await handleDownloadTailoredResume();
        }
        let applyBtn = document.getElementById(`${tailor_to_job_modal}+singleOppAppyBtn`)
        if (applyBtn) {
            applyBtn.setAttribute('data-cta-name', 'resume-editor');
            applyBtn.click();
            dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: false } });
        }
    }

    useEffect(() => {
        if (ready_jd) {
            // Pre-fill the textarea for visual continuity, then pass `ready_jd` straight
            // into the submit handler — relying on the freshly-set state would read a
            // stale closure (state updates haven't committed yet) and the empty-spread
            // in the validation branch would wipe the textarea back to blank.
            setOpenedWithReadyJd(true);
            setJobDescription({ value: ready_jd, error: '' });
            handleAddJDSubmit(ready_jd);
        }
    }, [ready_jd]);

    const handleAddJDSubmit = (overrideJd) => {
        const jdValue =
            typeof overrideJd === 'string' && overrideJd ? overrideJd : jobDescription.value;

        if (!jdValue) {
            setJobDescription((prev) => ({ ...prev, error: 'Job description is required' }));
            return;
        } else if (jdValue.length < 200) {
            setJobDescription((prev) => ({ ...prev, error: 'Job description must be at least 200 characters' }));
            return;
        }

        let payload = {};
        if (overrideJd) {
            payload.html = jdValue;
            payload.url = tailor_to_job_modal;
        } else {
            payload.job_description = jdValue;
        }
        dispatch({ type: RESET_TAILOR_FOR_NEW_JOB, payload: { jd_tailor_resume_id: jd_tailor_resume_id, tailor_to_job_modal: tailor_to_job_modal } });
        setMatchLoader(true);
        if (overrideJd) {
            checkResumeMatchWithJDExtract(payload)(dispatch)
                .then((res) => {
                    trackResumeMatchedWithJD({
                        is_external_jd: true
                    })
                    dispatch({ type: SEED_TAILOR, payload: res.data.data });
                    let sourceResumeUsed = res.data.data.resume_list.find(item => item.is_selected);
                    if (sourceResumeUsed) {
                        dispatch({ type: SET_SELECTED_RESUME, payload: sourceResumeUsed });
                    } else {
                        toast.error("Source resume previously used not found!");
                        dispatch({ type: SET_SELECTED_RESUME, payload: res.data.data.resume_list[0] });
                    }
                    setStep(step + 1);
                    setJobDescription({ value: '', error: '' });
                })
                .catch((err) => {
                    console.log('handleAddJDSubmit err', err);
                    if (err.response?.data?.message) {
                        toast.error(err.response?.data?.message);
                    } else {
                        toast.error("Something went wrong");
                    }
                })
                .finally(() => {
                    setMatchLoader(false);
                });
        } else {
            checkResumeMatchWithJob(payload)(dispatch)
                .then((res) => {
                    trackResumeMatchedWithJD({
                        is_external_jd: true
                    })
                    dispatch({ type: SEED_TAILOR, payload: res.data.data });
                    let sourceResumeUsed = res.data.data.resume_list.find(item => item.is_selected);
                    if (sourceResumeUsed) {
                        dispatch({ type: SET_SELECTED_RESUME, payload: sourceResumeUsed });
                    } else {
                        toast.error("Source resume previously used not found!");
                        dispatch({ type: SET_SELECTED_RESUME, payload: res.data.data.resume_list[0] });
                    }
                    setStep(step + 1);
                    setJobDescription({ value: '', error: '' });
                })
                .catch((err) => {
                    console.log('handleAddJDSubmit err', err);
                    if (err.response?.data?.message) {
                        toast.error(err.response?.data?.message);
                    } else {
                        toast.error("Something went wrong");
                    }
                })
                .finally(() => {
                    setMatchLoader(false);
                })
        }
    }
    const isMobile = window.innerWidth < 768;

    const goBack = (fromTailoredReview = false) => {
        if (fromTailoredReview) {
            setBackToStep(true);
        } else if (TAILOR_STATUS === 0) {
            setBackToStep(false);
        }
        setStep(step - 1);
    }

    const handleDownloadTailorExtension = () => {
        window.open('https://chromewebstore.google.com/detail/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en', '_blank');
        trackDownloadTailorExtensionClicked('tailor_custom_jd_step');
    }

    const [isReferralModalVisible, setIsReferralModalVisible] = useState(false);
    const openReferralModal = () => setIsReferralModalVisible(true);
    const closeReferralModal = () => {
        setIsReferralModalVisible(false);
        setMessageTemplateIds({});
    };
    const [payloadHtml, setPayloadHtml] = useState('');
    const [messageTemplateIds, setMessageTemplateIds] = useState({});
    const [selectedResumeForAgent, setSelectedResumeForAgent] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [isDownloadingProfileResume, setIsDownloadingProfileResume] = useState(false);

    // const handleRunReferralAgentWithProfileResume = () => {
    //     setPayloadHtml('');
    //     openReferralModal();
    // }
    const handleRunAgent = async (selectResume = 'profile') => {
        setSelectedResumeForAgent(selectResume);
        if (selectResume === 'tailored') {
            const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
            const htmlContent = document.getElementById("resume-previewer").outerHTML;

            if (htmlContent.includes('{{')) {
                setShowPlaceHolderDialog(true);
                return;
            }
            const payloadHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`;
            setPayloadHtml(payloadHtml);
        } else {
            setPayloadHtml('');
        }
        setShowPreviewModal(true);
    }

    const handleAfterPreviewModal = ({ linkedin_message_id, gmail_message_id } = {}) => {
        setMessageTemplateIds({ linkedin_message_id, gmail_message_id });
        openReferralModal();
        setShowPreviewModal(false);
    }


    const [isListeningForAccountConnected, setIsListeningForAccountConnected] = useState(false);

    useEffect(() => {
        if (!isListeningForAccountConnected) return;
        const handleStorageChange = (event) => {
            if (event.key === "outreach_account_connected") {
                dispatch({ type: SET_OUTREACH_DATA, payload: { account_connected: true } });
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [isListeningForAccountConnected]);

    const handleConnectAccount = () => {
        window.open("/talent/job-agent/configure?tab=connected-accounts", "_blank");
        setIsListeningForAccountConnected(true);
    }

    const handleRunReferralAgentWithTailoredResume = async () => {
        const css = await fetch(`${APP_URL}css/talent/resume-template.css`).then(res => res.text());
        const htmlContent = document.getElementById("resume-previewer").outerHTML;

        if (htmlContent.includes('{{')) {
            setShowPlaceHolderDialog(true);
            return;
        }
        const payloadHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title><style>${css}</style></head><body>${htmlContent}</body></html>`;
        setPayloadHtml(payloadHtml);
        openReferralModal();
    }

    const handleSubmitAgent = (text) => {
        console.log("Submitted reason:", text);
        // dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: false } });
    };

    const handleDownloadPreviewResume = (e) => {
        e.preventDefault();
        if (selectedResumeForAgent === 'tailored') {
            handleDownloadTailoredResume();
        } else {
            handleDownloadProfileResume();
        }
    }

    const handleDownloadProfileResume = () => {
        setIsDownloadingProfileResume(true);
        profileResumeDownload(user.talent_enc_id, true)(dispatch)
            .then((response) => {
                let url = response?.data?.data;

                let blob = response?.data?.blob;
                const type = response?.data?.ext;
                const filename = response?.data?.filename;
                if (type === 'pdf') {
                    blob = base64ToBlob(blob, 'application/pdf');
                    blob.name = filename;
                    url = URL.createObjectURL(blob);
                }
                else if (type === 'docx') {
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

                if (type === 'pdf' || type === 'docx') {
                    URL.revokeObjectURL(url);
                }
            })
            .catch(err => {
                toast.error("Something went wrong!", { duration: 3000 })
            })
            .finally(() => {
                setIsDownloadingProfileResume(false);
            })
    }

    return (
        <>
            {/* {justTailored && <PromoTailorExtModal justTailored={justTailored} setJustTailored={setJustTailored} />} */}
            {showPreviewModal &&
                <ReferralAgentPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => setShowPreviewModal(false)}
                    onConfirm={handleAfterPreviewModal}
                    selectedResume={selectedResumeForAgent}
                    onDownload={handleDownloadPreviewResume}
                    isDownloadingProfileResume={isDownloadingProfileResume}
                    HR_Number={active_job?.HR_Number}
                />
            }
            {run_referral_agent && isReferralModalVisible &&
                <ReferralAgentModal
                    isOpen={isReferralModalVisible}
                    closeReferralAgentModal={closeReferralModal}
                    onSubmit={handleSubmitAgent}
                    source="agent-with-tailored-editor-cta"
                    hrID={tailor_to_job_modal}
                    payloadHtml={payloadHtml}
                    linkedin_message_id={messageTemplateIds.linkedin_message_id}
                    gmail_message_id={messageTemplateIds.gmail_message_id}
                />
            }
            <div className={`tailored-resume-drawer-container ${step == 3 ? 'resume-editor' : ''}`}>
                <div className="tr-drawer-header">
                    <div className="head-title">
                        {active_job?.partner_job_tailor ?
                            <h4>
                                Tailor resume & Apply to {active_job?.job_title}
                                {active_job?.mode_of_work ? ` - ${active_job?.mode_of_work == "Office" ? 'Onsite' : active_job?.mode_of_work}` : ''}
                            </h4>
                            :
                            <h3>Generate tailored resume</h3>
                        }

                        {user?.resume_tailored?.active_plan && (new Date(user?.resume_tailored?.plan_end_date) > new Date()) &&
                            <span>{user?.resume_tailored?.active_plan}: {formatTailorPlanValidity(user?.resume_tailored?.plan_end_date)} remaining</span>
                        }
                        {user?.resume_tailored?.is_tailored_paid && !(new Date(user?.resume_tailored?.plan_end_date) > new Date()) &&
                            <span className="expired-plan">Plan expired</span>
                        }
                    </div>
                    {active_job?.partner_job_tailor ?
                        <ProgressBar
                            value={stepsData[step - 1] == "Review Your New Tailored Resume" ? 90 : stepsData[step - 1] == "Align Your Resume" ? 75 : 50}
                            height={14}
                        />
                        :
                        <div className={`
                    tr-drawer-steps-container
                    ${stepsData[step - 1] == "Review Your New Tailored Resume" ? ' last-step' : ''}
                    ${stepsData[0] == "Add Job Description" ? ' has-add-jd' : ''}
                    `}>
                            {stepsData.map((item, index) => (
                                <>
                                    <div key={index} className={`step ${step >= index + 1 ? 'active' : ''}`}>
                                        <div className="step-number">{index + 1}</div>
                                        <span>{item}</span>
                                    </div>
                                    {index < stepsData.length - 1 && <div className="step-line"></div>}
                                </>
                            ))}
                        </div>
                    }
                </div>
                {showDownloadExtensionBanner && (
                    <div className="download-extension-banner">
                        <div className="de-banner-content">
                            <span className="de-banner-title">👋  Applying elsewhere too? Download our extension to tailor your resume directly at any job portal</span>
                            <button className="primaryBtn de-download-ext-btn" onClick={handleDownloadTailorExtension}>
                                Download Extension
                                <RedirectIcon height="14px" width="14px" />
                            </button>
                        </div>
                        {/* <button className="de-banner-close-btn" onClick={() => setShowDownloadExtensionBanner(false)}>
                    <CloseModalIcon height="14px" width="14px" />
                    Close
                </button> */}
                    </div>
                )}
                <div className={`tr-drawer-content ${transformLoader ? 'transform-loader-active' : ''} ${showDownloadExtensionBanner ? 'de-banner-active' : ''}`}>
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
                    {stepsData[step - 1] == "Add Job Description" && (
                        <ResumeExternalJD jobDescription={jobDescription} setJobDescription={setJobDescription} matchLoader={matchLoader} />
                    )}

                    {stepsData[step - 1] == "See Your Difference" && (
                        <div className="trd-drawer-step1">
                            {!matchLoader && (
                                <>
                                    <div className="trd-resume-match-result">
                                        <div className="mr-left">
                                            <h2>
                                                Your Resume Isn’t Fully Aligned With This Job
                                                {/* {matching_json?.total_score < 7 ? 'Your Resume is a Low Match for This Job' : 'Your Resume Is A Partial Match'} - Let's Fix That! */}
                                            </h2>
                                            <span>
                                                <ToolTipSVG height="16px" width="16px" />
                                                We’ll tailor it to match this role’s skills, keywords, and expectations.
                                                {/* {matching_json?.total_score > 7 ?
                                            'Poor match? Recruiters may never see it. We’ll help you fix that instantly' :
                                            'You\'re on the right track, but some keywords are still missing'
                                        } */}
                                            </span>
                                        </div>
                                        {/* <div className="mr-right">
                                    <ScoreGauge score={matching_json?.total_score} matching_json={matching_json} />
                                </div> */}
                                    </div>
                                    <div className="trd-resume-overview-container">
                                        <div className="job-overview-row trd-row normal">
                                            <div className="ro-title">
                                                <span>Job Overview</span>
                                            </div>
                                            {active_job?.company?.company_name && (
                                                <div className="ro-job-content">
                                                    <>
                                                        <div className="logo">
                                                            <CompanyLogo company={active_job.company} />
                                                        </div>
                                                        <div className="job-info">
                                                            <h3 className="job-title">{active_job.job_title}</h3>
                                                            <span className="company">{active_job.company.company_name}</span>
                                                        </div>
                                                    </>
                                                </div>
                                            )}
                                            <div className="ro-resume-content" >
                                                {showSelectedResumeEducationTooltip && !showResumeDropdown && (
                                                    <div className="selected-resume-education-tooltip" onClick={(e) => e.stopPropagation()}>
                                                        <p className="selected-resume-education-tooltip-text">
                                                            Do you want to change the base resume?
                                                            <br />
                                                            The selected resume will be used by default for your next tailored resume
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="selected-resume-education-tooltip-cta"
                                                            onClick={(e) => { e.stopPropagation(); dismissSelectedResumeEducationTooltip(); }}
                                                        >
                                                            Got It
                                                        </button>
                                                        <span className="selected-resume-education-tooltip-arrow" aria-hidden="true" />
                                                    </div>
                                                )}
                                                <div className="ro-resume-left">
                                                    <label className="resume-info-label resume-info-label-with-tooltip">
                                                        Selected Base Resume
                                                    </label>
                                                    <div className="resume-info">
                                                        <h4 className={`${active_job?.company?.company_name ? '' : 'w-648'}`}>
                                                            {selected_resume?.list_type == "profile" && <>Profile Resume • </>}
                                                            <>{selected_resume?.label}</>
                                                            {/* {active_job?.company?.company_name && <> • {active_job?.company?.company_name}</>} */}
                                                        </h4>
                                                        {/* {selected_resume?.list_type == "profile" && <p className="r-source">Your profile resume</p>} */}
                                                    </div>
                                                </div>
                                                <ArrowDownIcon />
                                                {resume_list.length > 1 && !active_job?.resume_just_updated && showResumeDropdown && (
                                                    <ResumeSelector
                                                        resume_list={resume_list}
                                                        selected_resume={selected_resume}
                                                        handleResumeSelection={handleResumeSelection}
                                                        setShowResumeDropdown={setShowResumeDropdown}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        {matching_json?.job_role?.hr_job_role && (
                                            <>
                                                <div className={`job-title-row trd-row ${getScoreClass('job_role', matching_json.job_role?.score)}`}>
                                                    <div className="ro-title">
                                                        <span>Job Title</span>
                                                        {matching_json.job_role?.score > 0 ? <GreenCheckCircleIcon /> : <CancelCircleIcon />}
                                                    </div>
                                                    <div className="ro-job-content">
                                                        <span>{matching_json.job_role?.hr_job_role}</span>
                                                    </div>
                                                    <div className="ro-resume-content">
                                                        <span>{matching_json.job_role?.talent_job_role}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {matching_json?.years_of_experience?.hr_years_of_experience && (
                                            <>
                                                <div className={`yoe-row trd-row ${getScoreClass('years_of_experience', matching_json.years_of_experience?.score)}`}>
                                                    <div className="ro-title">
                                                        <span>Years of Experience</span>
                                                        {matching_json.years_of_experience?.score == 2.5 ? <GreenCheckCircleIcon /> : <CancelCircleIcon />}
                                                    </div>
                                                    <div className="ro-job-content">
                                                        <span>{matching_json.years_of_experience?.hr_years_of_experience} Years experience</span>
                                                    </div>
                                                    <div className="ro-resume-content">
                                                        <span>{matching_json.years_of_experience?.talent_years_of_experience} years experience</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        {/* <div className="industry-exp-row trd-row warning">
                                <div className="ro-title">
                                    <span>Industry Experience</span>
                                    <WarningCircleIcon />
                                </div>
                                <div className="ro-job-content">
                                    <span>Insurance  |  Healthtech</span>
                                </div>
                                <div className="ro-resume-content">
                                    <span className="not-matched-text">No matching industry experience found</span>
                                </div>
                                </div> */}
                                        {matching_json?.job_keywords?.total_keywords_count > 0 && (
                                            <div className={`job-keywords-row trd-row ${getScoreClass('job_keywords', matching_json.job_keywords?.score)}`}>
                                                <div className="ro-title">
                                                    {matching_json.job_keywords?.total_keywords_count &&
                                                        <span>Job Keywords ({matching_json.job_keywords?.matching_keywords?.length}/{matching_json.job_keywords?.total_keywords_count})</span>
                                                    }
                                                    {getScoreClass('job_keywords', matching_json.job_keywords?.score) == 'warning' ?
                                                        <WarningCircleIcon /> : getScoreClass('job_keywords', matching_json.job_keywords?.score) == 'success' ?
                                                            <GreenCheckCircleIcon /> : <CancelCircleIcon />}
                                                </div>
                                                <div className="ro-skills">
                                                    {matching_json.job_keywords?.matching_keywords &&
                                                        matching_json?.job_keywords.matching_keywords.map((keyword, index) => (
                                                            <span className={`skill-item checked`} key={index}>
                                                                {keyword.type == "or_group" ?
                                                                    (
                                                                        keyword?.options?.map((option, index2) => (
                                                                            <>
                                                                                <span className={`skill-item`} key={index2}>
                                                                                    {keyword.matched_skill == option &&
                                                                                        <GreenCheckIcon height="13px" width="13px" />
                                                                                    }
                                                                                    {option}
                                                                                </span>
                                                                                {index2 < keyword?.options?.length - 1 &&
                                                                                    <span className="or-separator">OR</span>
                                                                                }
                                                                            </>
                                                                        ))
                                                                    )
                                                                    :
                                                                    (
                                                                        <>
                                                                            <GreenCheckIcon height="13px" width="13px" />
                                                                            {keyword.keyword}
                                                                        </>
                                                                    )
                                                                }
                                                            </span>
                                                        ))
                                                    }
                                                    {matching_json.job_keywords?.non_matching_keywords &&
                                                        matching_json?.job_keywords.non_matching_keywords.map((keyword, index) => (
                                                            <span className={`skill-item`} key={index}>
                                                                {keyword.type == "or_group" ?
                                                                    (
                                                                        keyword?.options?.map((option, index2) => (
                                                                            <>
                                                                                <span className={`skill-item`} key={index2}>
                                                                                    {option}
                                                                                </span>
                                                                                {index2 < keyword?.options?.length - 1 &&
                                                                                    <span className="or-separator">OR</span>
                                                                                }
                                                                            </>
                                                                        ))
                                                                    )
                                                                    :
                                                                    (
                                                                        <>
                                                                            {keyword.keyword}
                                                                        </>
                                                                    )
                                                                }
                                                            </span>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        <div className={`summary-row trd-row ${getScoreClass('summary', matching_json.summary?.score)}`}>
                                            <div className="ro-title">
                                                <span>Professional Summary</span>
                                                {matching_json.summary?.score == 0 ? <WarningCircleIcon /> : <CancelCircleIcon />}
                                            </div>
                                            <div className="ro-summary">
                                                <span>{matching_json.summary?.message}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {matchLoader &&
                                <div className="match-loader-container">
                                    <div className="match-loader">
                                        <MatchLoader />
                                    </div>
                                </div>
                            }
                        </div>
                    )}

                    {stepsData[step - 1] == "Align Your Resume" && (
                        <div className="trd-drawer-step2">
                            {!transformLoader && (
                                <>
                                    <div className="trd-section-selection trd-section">
                                        <h2>1. Select the sections you want to improve</h2>
                                        <div className="section-wrapper">
                                            <div className="section-item">
                                                <div className="section-header">
                                                    <label className="sh-left checkbox">
                                                        <input type="checkbox" checked={selectedSection?.includes('summary')} onChange={(e) => handleSectionChange(e, 'summary')} /> Summary
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <CustomTooltip text="We will refine your summary to better align with the target job, making it more relevant to catch recruiter’s attention quickly.">
                                                        <ToolTipSVG height="24px" width="24px" color="#231F20" />
                                                    </CustomTooltip>
                                                </div>
                                            </div>
                                            <div className="section-item">
                                                <div className="section-header">
                                                    <label className="sh-left checkbox">
                                                        <input type="checkbox"
                                                            checked={true}
                                                            // checked={selectedSection?.includes('skills')}
                                                            //  onChange={(e) => handleSectionChange(e, 'skills')} 
                                                            disabled
                                                        />
                                                        Skills
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <CustomTooltip text="We will update your skills section with selections from Section 2. It is pre-selected as it is essential for passing ATS keyword screening.">
                                                        <ToolTipSVG height="24px" width="24px" color="#231F20" />
                                                    </CustomTooltip>
                                                </div>
                                            </div>
                                            <div className="section-item">
                                                <div className="section-header">
                                                    <label className="sh-left checkbox">
                                                        <input type="checkbox" checked={selectedSection?.includes('work-experience')} onChange={(e) => handleSectionChange(e, 'work-experience')} /> Work Experience
                                                        <span className="checkmark"></span>
                                                    </label>
                                                    <CustomTooltip text="We will integrate your selected skills into your work experiences and polish key words, maximising relevance to skill requirements.">
                                                        <ToolTipSVG height="24px" width="24px" color="#231F20" />
                                                    </CustomTooltip>
                                                </div>
                                                <div className="section-content">
                                                    {selectedSection?.includes('work-experience') && (
                                                        <span className="info-text">We’ll strengthen your work experience with clearer, more impactful bullet points.</span>
                                                    )}
                                                    <label className="customRadio">
                                                        <input type="radio" name="work-experience-edit" value="quick-edit" checked={selectedSection?.includes('work-experience') && workExperienceEdit === 'quick-edit'} onChange={(e) => setWorkExperienceEdit(e.target.value)} />
                                                        <span className="checkmarkIcon"></span>
                                                        <span>Quick edit (Improve the first 2 key experiences)</span>
                                                    </label>
                                                    <label className="customRadio">
                                                        <input type="radio" name="work-experience-edit" value="full-edit" checked={selectedSection?.includes('work-experience') && workExperienceEdit === 'full-edit'} onChange={(e) => setWorkExperienceEdit(e.target.value)} />
                                                        <span className="checkmarkIcon"></span>
                                                        <span>Full edit (Improve all experiences with longer processing time)</span>
                                                    </label>
                                                </div>
                                            </div>
                                            {/* <div className="section-item">
                                    <div className="section-header">
                                        <label className="sh-left checkbox">
                                            <input type="checkbox" checked={selectedSection?.includes('projects')} onChange={(e) => handleSectionChange(e, 'projects')} /> Projects
                                            <span className="checkmark"></span>
                                        </label>
                                        <CustomTooltip text="We’ll update your project section to showcase relevant skills, clarify your impact, and optimise keywords for stronger alignment with the role.">
                                            <ToolTipSVG height="24px" width="24px" color="#231F20" />
                                        </CustomTooltip>
                                    </div>
                                    <div className="section-content">
                                        <label className="customRadio">
                                            <input type="radio" name="projects-edit" value="quick-edit" checked={projectsEdit === 'quick-edit'} onChange={(e) => setProjectsEdit(e.target.value)} />
                                            <span className="checkmarkIcon"></span>
                                            <span>Quick edit (Improve the first 2 key projects)</span>
                                        </label>
                                        <label className="customRadio">
                                            <input type="radio" name="projects-edit" value="full-edit" checked={projectsEdit === 'full-edit'} onChange={(e) => setProjectsEdit(e.target.value)} />
                                            <span className="checkmarkIcon"></span>
                                            <span>Full edit (Improve all projects with longer processing time)</span>
                                        </label>
                                    </div>
                                </div> */}
                                        </div>
                                    </div>
                                    <div className="trd-skills-selection trd-section">
                                        <h2>2. Add the missing skill keywords</h2>
                                        <div className="skills-wrapper">
                                            {skills.map((skillGroup, index) => (
                                                <>
                                                    <div className="skill-checkbox-group">
                                                        {skillGroup.map((skill, index2) => (
                                                            <>
                                                                <label className={`skill-item checkbox ${selectedSkills.includes(skill) ? 'checked' : ''}`} key={index2}>
                                                                    <input type="checkbox" checked={selectedSkills.includes(skill)} onChange={(e) => handleSkillChange(skill)} />{skill}
                                                                    <span className="checkmark"></span>
                                                                    {/* {skill.manual_added && (
                                                            <button className="remove-skill-btn" onClick={() => handleRemoveSkill(index)}><CrossIcon /></button>
                                                        )} */}
                                                                </label>
                                                                {skillGroup.length > 1 && index2 < skillGroup.length - 1 &&
                                                                    <span className="or-separator">OR</span>
                                                                }
                                                            </>
                                                        ))}
                                                    </div>
                                                </>
                                            ))}
                                            <label className="skill-item new-skill">
                                                <input className="new-skill-input" type="text" placeholder="Add keyword..." onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSkillChange(e.target.value, true);
                                                        e.target.value = '';
                                                    }
                                                }} />
                                                <CustomTooltip customStyles={{ tooltip: { width: '180px' } }} text="Add a keyword by typing and pressing Enter.">
                                                    <QuestionCircleIcon />
                                                </CustomTooltip>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            )}
                            {transformLoader &&
                                // <div className="tailor-loader-container">
                                //     <div className="tailor-loader">
                                //         <TransformLoader stepDuration={6000} />
                                //     </div>
                                // </div>
                                <NewTransformLoader isExternalJD={stepsData[0] == "Add Job Description"} similarJobs={similarJobs} />
                            }
                        </div>
                    )}

                    {stepsData[step - 1] == "Review Your New Tailored Resume" && (
                        <ResumeEditor
                            defaultTabReport={defaultTabReport}
                            tailor_json={tailor_json}
                            config_json={config_json}
                            sorting_json={sorting_json}
                            tailored_resume_id={tailored_resume_id}
                            generic_sections={generic_sections}
                            tailorInputs={previousInputs}
                            updateTailoredResume={updateTailoredResume}
                        />
                    )}
                    {/* {stepsData[0] != "Add Job Description" && isMobile &&
                        <div className="mobile-external-jedi" style={{ visibility: run_referral_agent ? 'hidden' : 'visible' }}>
                            <text>👋 Your plan also lets you create tailored resumes for any JD- make the most of it if you’re exploring roles on other platforms as well!</text>
                            <Link className="underlinedBtn" to={"/talent/tailor-dashboard#tailor-external-jd"} target="_blank" rel="noopener noreferrer">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.30012 4.9357C6.97303 3.72857 7.30948 3.125 7.8125 3.125C8.31552 3.125 8.65197 3.72857 9.32488 4.9357L9.49897 5.248C9.69019 5.59103 9.7858 5.76254 9.93487 5.87571C10.0839 5.98888 10.2696 6.03088 10.6409 6.1149L10.979 6.19139C12.2857 6.48705 12.9391 6.63487 13.0945 7.13473C13.2499 7.63459 12.8045 8.15544 11.9137 9.19715L11.6832 9.46665C11.4301 9.76267 11.3035 9.91068 11.2466 10.0938C11.1896 10.2769 11.2088 10.4744 11.247 10.8693L11.2819 11.2289C11.4166 12.6188 11.4839 13.3137 11.077 13.6226C10.67 13.9315 10.0583 13.6499 8.8348 13.0866L8.51827 12.9408C8.1706 12.7807 7.99677 12.7007 7.8125 12.7007C7.62823 12.7007 7.4544 12.7807 7.10673 12.9408L6.7902 13.0866C5.56673 13.6499 4.955 13.9315 4.54805 13.6226C4.1411 13.3137 4.20844 12.6188 4.34312 11.2289L4.37796 10.8693C4.41623 10.4744 4.43537 10.2769 4.37843 10.0938C4.32149 9.91068 4.19491 9.76267 3.94177 9.46665L3.7113 9.19715C2.82048 8.15544 2.37506 7.63459 2.5305 7.13473C2.68595 6.63487 3.3393 6.48705 4.646 6.19139L4.98406 6.1149C5.35539 6.03089 5.54105 5.98888 5.69013 5.87571C5.8392 5.76254 5.93481 5.59103 6.12603 5.248L6.30012 4.9357Z" fill="url(#paint0_linear_27354_123210)" />
                                    <path d="M3.04281 1.56152C3.06155 1.49541 3.17891 1.49501 3.1981 1.56099C3.28573 1.86231 3.44821 2.3077 3.69391 2.55175C3.93962 2.7958 4.38609 2.95527 4.68799 3.04086C4.75411 3.0596 4.7545 3.17696 4.68852 3.19614C4.3872 3.28377 3.94181 3.44625 3.69776 3.69196C3.45371 3.93766 3.29424 4.38414 3.20865 4.68604C3.18991 4.75215 3.07256 4.75255 3.05337 4.68656C2.96574 4.38524 2.80326 3.93986 2.55755 3.69581C2.31185 3.45176 1.86538 3.29229 1.56347 3.2067C1.49736 3.18796 1.49696 3.0706 1.56295 3.05141C1.86427 2.96379 2.30965 2.8013 2.5537 2.5556C2.79775 2.3099 2.95722 1.86342 3.04281 1.56152Z" fill="url(#paint1_linear_27354_123210)" />
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M11.875 2.03125C12.1339 2.03125 12.3438 2.24112 12.3438 2.5V2.65625H12.5C12.7589 2.65625 12.9688 2.86612 12.9688 3.125C12.9688 3.38388 12.7589 3.59375 12.5 3.59375H12.3438V3.75C12.3438 4.00888 12.1339 4.21875 11.875 4.21875C11.6161 4.21875 11.4062 4.00888 11.4062 3.75V3.59375H11.25C10.9911 3.59375 10.7812 3.38388 10.7812 3.125C10.7812 2.86612 10.9911 2.65625 11.25 2.65625H11.4062V2.5C11.4062 2.24112 11.6161 2.03125 11.875 2.03125Z" fill="url(#paint2_linear_27354_123210)" />
                                    <defs>
                                        <linearGradient id="paint0_linear_27354_123210" x1="2.5" y1="3.125" x2="13.125" y2="13.75" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="#9810FA" />
                                            <stop offset="0.5" stop-color="#155DFC" />
                                            <stop offset="1" stop-color="#4F39F6" />
                                        </linearGradient>
                                        <linearGradient id="paint1_linear_27354_123210" x1="1.51367" y1="1.51172" x2="4.73779" y2="4.73584" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="#9810FA" />
                                            <stop offset="0.5" stop-color="#155DFC" />
                                            <stop offset="1" stop-color="#4F39F6" />
                                        </linearGradient>
                                        <linearGradient id="paint2_linear_27354_123210" x1="10.7812" y1="2.03125" x2="12.9688" y2="4.21875" gradientUnits="userSpaceOnUse">
                                            <stop stop-color="#9810FA" />
                                            <stop offset="0.5" stop-color="#155DFC" />
                                            <stop offset="1" stop-color="#4F39F6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                Create resume tailored to any JD
                            </Link>
                        </div>
                    } */}
                </div>
                {(!transformLoader && !matchLoader) && (
                    <div className="tr-drawer-actions">
                        {stepsData[step - 1] == "Add Job Description" && (
                            <button className="tr-drawer-submit-btn" onClick={() => handleAddJDSubmit()}>
                                <span>Submit & Continue</span> <WhiteArrowRightIcon />
                            </button>
                        )}
                        {stepsData[step - 1] == "See Your Difference" && (
                            <>
                                <div className="drawer-actions-left">
                                    {!active_job?.partner_job_tailor && stepsData[0] == "Add Job Description" && !openedWithReadyJd &&
                                        <button className="tr-drawer-back-btn" onClick={() => goBack()} disabled={transformLoader}>
                                            <BackIcon height="35px" width="35px" />
                                        </button>
                                    }
                                    <button className="tr-drawer-submit-btn" onClick={() => setStep(step + 1)}>
                                        <span>Tailor My Resume for this Job</span> <WhiteArrowRightIcon />
                                    </button>
                                    {active_job?.partner_job_tailor && active_job?.logging_user &&
                                        <button className="underlinedBtn" onClick={handleApplyNow}>
                                            <span>Apply without Tailored Resume </span>
                                        </button>
                                    }
                                </div>

                                <div className="drawer-actions-right">
                                    {run_referral_agent &&
                                        <button className="primaryBtn apply-now-btn referral-skip-btn" onClick={() => handleRunAgent('profile')} disabled={isLoading}>
                                            <span>Skip Tailor & Run Happpy Agent</span>
                                        </button>
                                    }
                                    {stepsData[0] != "Add Job Description" && !run_referral_agent &&
                                        <TailorForAnyJDButton />
                                    }
                                </div>
                            </>
                        )}
                        {stepsData[step - 1] == "Align Your Resume" && (
                            <>
                                <div className="drawer-actions-left">
                                    <button className="tr-drawer-back-btn" onClick={() => goBack()} disabled={transformLoader}>
                                        <BackIcon height="35px" width="35px" />
                                    </button>
                                    {backToStep ?
                                        <button
                                            className="tr-drawer-submit-btn"
                                            disabled={(skills.length != 0 && selectedSkills.length == 0) || transformLoader}
                                            onClick={handleRegenerateResume}
                                        >
                                            <span>Regenerate Tailored Resume</span>
                                        </button>
                                        :
                                        <button
                                            className="tr-drawer-submit-btn"
                                            disabled={(skills.length != 0 && selectedSkills.length == 0) || transformLoader}
                                            onClick={handleGenerateTailoredResume}
                                        >
                                            <span>Generate My Tailored Resume</span>
                                        </button>
                                    }
                                </div>
                                <div className="drawer-actions-right">
                                    {run_referral_agent &&
                                        <button className="primaryBtn apply-now-btn referral-skip-btn" onClick={() => handleRunAgent('profile')} disabled={isLoading}>
                                            <span>Skip Tailor & Run Happpy Agent</span>
                                        </button>
                                    }
                                    {stepsData[0] != "Add Job Description" && !run_referral_agent &&
                                        <TailorForAnyJDButton />
                                    }
                                </div>
                            </>
                        )}
                        {stepsData[step - 1] == "Review Your New Tailored Resume" && (
                            <>
                                <div className="drawer-actions-left">
                                    {!(active_job?.partner_job_tailor && active_job?.is_applied) &&
                                        <button className="tr-drawer-back-btn" onClick={() => goBack(true)} disabled={isLoading}>
                                            <BackIcon height="35px" width="35px" />
                                        </button>
                                    }
                                    {isMobile &&
                                        <>
                                            <button className="outlinedBtn" onClick={() => handleDownloadTailoredResume()} disabled={isLoading}>
                                                Download Resume
                                            </button>
                                            {run_referral_agent &&
                                                <div className="absolute-btns">
                                                    {!user?.outreach?.account_connected ?
                                                        <button className="primaryBtn gradientBtn" onClick={handleConnectAccount} disabled={isLoading}>
                                                            <span>Connect Account to Run Agent</span>
                                                        </button>
                                                        :
                                                        <>
                                                            <button className="primaryBtn apply-now-btn" onClick={() => handleRunAgent('profile')} disabled={isLoading}>
                                                                <span>Run Agent with Profile Resume</span>
                                                            </button>
                                                            <button className="primaryBtn gradientBtn" onClick={() => handleRunAgent('tailored')} disabled={isLoading}>
                                                                <span>Run Agent Tailored Resume</span>
                                                            </button>
                                                        </>
                                                    }
                                                </div>
                                            }
                                        </>
                                    }
                                    {!active_job?.is_applied && location.pathname.includes('all-opportunities') && stepsData[0] != "Add Job Description" && (
                                        <>
                                            <button className="primaryBtn apply-now-btn" onClick={handleApplyNow}>
                                                <span>{active_job?.partner_job_tailor ? 'APPLY WITH tailored RESUME' : getApplyButtonText(active_job?.aggregator_application_link, active_job?.aggregator)}</span>
                                                {active_job?.aggregator_application_link &&
                                                    <span className="aggregator-apply-link" style={{ display: 'inline-flex' }}>
                                                        <svg style={{ width: '1rem', height: '1rem', minWidth: '1rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                                        </svg>
                                                    </span>
                                                }
                                            </button>
                                        </>
                                    )}

                                </div>
                                {!isMobile &&
                                    <div className="drawer-actions-right">
                                        {run_referral_agent &&
                                            <>
                                                {!user?.outreach?.account_connected ?
                                                    <button className="primaryBtn gradientBtn" onClick={handleConnectAccount} disabled={isLoading}>
                                                        <span>Connect Account to Run Agent</span>
                                                    </button>
                                                    :
                                                    <>
                                                        <button className="primaryBtn apply-now-btn" onClick={() => handleRunAgent('profile')} disabled={isLoading}>
                                                            <AgentIcon />
                                                            <span>Run Agent with Profile Resume</span>
                                                        </button>
                                                        <button className="primaryBtn gradientBtn" onClick={() => handleRunAgent('tailored')} disabled={isLoading}>
                                                            <AgentIcon />
                                                            <span>Run Agent with Tailored Resume</span>
                                                        </button>
                                                    </>
                                                }
                                            </>
                                        }
                                        {(active_job?.partner_job_tailor || run_referral_agent) ?
                                            <button className="underlinedBtn" onClick={() => handleDownloadTailoredResume()} disabled={isLoading}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7 10L12 15L17 10" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M12 15V3" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                <span>
                                                    Download
                                                </span>
                                            </button>
                                            :
                                            <button className="underlinedBtn" onClick={() => handleDownloadTailoredResume()} disabled={isLoading}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M7 10L12 15L17 10" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M12 15V3" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                <span>Download Tailored Resume</span>
                                            </button>
                                        }
                                        {/* {stepsData[0] != "Add Job Description" && !run_referral_agent &&
                                            <TailorForAnyJDButton />
                                        } */}
                                    </div>
                                }
                            </>
                        )}
                    </div>
                )}

                {backToStep && last_updated_at &&
                    <ResumePreviewerGhost />
                }
                <ConfirmationModal
                    isOpen={confirmRegenerateResume}
                    setOpen={setConfirmRegenerateResume}
                    title="Are you sure you want to regenerate your tailored resume?"
                    description={
                        <>
                            You may lose your current tailored resume and any changes you've made.
                            <br />
                            <br />
                            You can download your current tailored resume now!
                        </>
                    }
                    onSecondaryClick={handleGenerateTailoredResume}
                    secondaryBtnText="Regenerate Tailored Resume"
                    secondaryBtnClass="gradientBtn"
                    primaryBtnText="Download Current Tailored Resume"
                    onPrimaryClick={() => handleDownloadTailoredResume()}
                    onCancel={() => setConfirmRegenerateResume(false)}
                    modalClass="confirmRegenerateResumeModal"
                />
            </div>
        </>
    )
}

const ResumeSelector = ({ resume_list, selected_resume, handleResumeSelection, setShowResumeDropdown }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowResumeDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setShowResumeDropdown]);

    return (
        <div ref={dropdownRef} className="resume-dropdown-centered">
            <div className="resume-dropdown-header">Select Resume</div>
            <div className="select-container">
                <div className="resume-type">
                    <label><span className="bullet-dot green" />Your Profile Resume </label>
                    {resume_list?.filter((resume) => resume.list_type == "profile")?.map((resume, index) => (
                        <div
                            key={"profile-resume-" + index}
                            className={`resume-item ${(selected_resume.source_resume_id + 'xid' + selected_resume.source_type) == (resume.source_resume_id + 'xid' + resume.source_type) ? 'selected' : ''}`}
                            onClick={() => handleResumeSelection(resume)}
                        >
                            <span>Profile Resume • {resume.label}</span>
                            <span className="meta-info">Last updated {formatDateRelativeToNow(resume.created_at)}</span>
                        </div>
                    ))}
                </div>

                {resume_list?.filter((resume) => resume.list_type == "tailored")?.length > 0 &&
                    <div className="resume-type">
                        <label><span className="bullet-dot blue" />Tailored from past jobs</label>
                        {resume_list?.filter((resume) => resume.list_type == "tailored")?.map((resume, index) => (
                            <div
                                key={"tailored-resume-" + index}
                                className={`resume-item ${(selected_resume.source_resume_id + 'xid' + selected_resume.source_type) == (resume.source_resume_id + 'xid' + resume.source_type) ? 'selected' : ''}`}
                                onClick={() => handleResumeSelection(resume)}
                            >
                                <span>{resume.label}</span>
                                <span className="meta-info">Created {formatDateRelativeToNow(resume.created_at)} • {resume.tailored_source}</span>
                            </div>
                        ))}
                    </div>
                }
                {resume_list?.filter((resume) => resume.list_type == "custom")?.length > 0 &&
                    <div className="resume-type">
                        <label><span className="bullet-dot gray" />Use a different resume (one-time)</label>
                        {resume_list?.filter((resume) => resume.list_type == "custom")?.map((resume, index) => (
                            <div
                                key={"temp-resume-" + index}
                                className={`resume-item ${(selected_resume.source_resume_id + 'xid' + selected_resume.source_type) == (resume.source_resume_id + 'xid' + resume.source_type) ? 'selected' : ''}`}
                                onClick={() => handleResumeSelection(resume)}
                            >
                                <span>Temp Resume • {resume.label}</span>
                                <span className="meta-info">Uploaded {formatDateRelativeToNow(resume.created_at)} • One-time use</span>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

const MatchScoreTooltip = ({ score, matching_json }) => {

    const textStyle = {
        color: "white",
        margin: "0 0 4px 0",
        padding: "0",
        fontSize: '0.75rem',
        fontWeight: '400',
        fontFamily: 'Montserrat',
    }

    const fontStyle = {
        color: '#231F20',
        fontSize: '12px',
        lineHeight: '140%',
        letterSpacing: '0%',
    }

    const rowStyle = {
        ...textStyle,
        ...fontStyle,
        color: '#fff',
        fontWeight: '400',
        textAlign: 'start',
    }

    const scorePercentageStyle = {
        fontSize: '10px',
        fontWeight: '700',
        lineHeight: '120%',
    }

    const tooltipContent = (
        <div>
            <div style={{
                ...textStyle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                fontSize: '10px',
                fontWeight: '500',
                marginBottom: '6px',
                paddingBottom: '4px',
                lineHeight: '120%',
                letterSpacing: '0.15px',
                color: '#fff',
            }}>
                Primary resume match score:&nbsp;
                <span style={{ color: '#51CD9E', fontSize: '12px', fontWeight: '700', lineHeight: '120%' }}
                    className="score-value">
                    {score}
                </span>
            </div>
            <div style={rowStyle}><b>{matching_json.job_role?.score}</b> Job Role</div>
            <div style={rowStyle}><b>{matching_json.years_of_experience?.score}</b> Exp. level</div>
            <div style={rowStyle}><b>{matching_json.job_keywords?.score}</b> Skills</div>
        </div>
    )

    return (
        <CustomTooltip text={tooltipContent} customStyles={{ tooltip: { right: '-4px' } }} placement="bottom-right">
            <ToolTipSVG height="12px" width="12px" color="#231F20" />
        </CustomTooltip>
    )
}

const AgentIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect x="5" y="6" width="14" height="12" rx="2" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="10" cy="12" r="1" fill="#fff" />
        <circle cx="14" cy="12" r="1" fill="#fff" />
        <path d="M12 3V6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
        <circle cx="12" cy="3" r="1" fill="#fff" />
        <path d="M9 18V21" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
        <path d="M15 18V21" stroke="#fff" stroke-width="1.5" stroke-linecap="round" />
    </svg>
);

const ScoreGauge = ({ score, matching_json }) => {
    const progressRef = useRef(null)

    // Determine level and color
    let level = '';
    if (score < 5) {
        level = 'Poor Match';
    } else if (score < 7.5) {
        level = 'Fair Match';
    } else {
        level = 'Strong Match';
    }

    useEffect(() => {
        const path = progressRef.current;
        if (!path) return;

        const total = path.getTotalLength();
        const visible = total * (score / 10);

        path.style.strokeDasharray = total;
        path.style.strokeDashoffset = total;

        setTimeout(() => {
            path.style.strokeDashoffset = total - visible;
        }, 150);
    }, [score]);

    // Select gradient based on level
    let gaugeGradient;
    if (score > 7.5) {
        gaugeGradient = "gaugeGreen";
    } else if (score >= 5 && score < 7.5) {
        gaugeGradient = "gaugeYellowGreen";
    } else {
        gaugeGradient = "gaugeRedOrange";
    }

    return (
        <div className="score-gauge-container">
            <svg style={{ width: '100px', height: '50px', overflow: 'visible' }} viewBox="0 0 300 150">
                <defs>
                    <linearGradient id="gaugeGreen" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#32936F" />
                        <stop offset="100%" stop-color="#FFFFFF" />
                    </linearGradient>

                    <linearGradient id="gaugeYellowGreen" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FBBF24" />
                        <stop offset="100%" stop-color="#34D399" />
                    </linearGradient>

                    <linearGradient id="gaugeRedOrange" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#AE1D1B" />
                        <stop offset="100%" stop-color="#F38831" />
                    </linearGradient>
                </defs>

                <path d="M 30 130 A 120 120 0 0 1 270 130" stroke="#ececec" strokeWidth={20} strokeLinecap="round" fill="none" />
                <path
                    ref={progressRef}
                    d="M 30 130 A 120 120 0 0 1 270 130"
                    stroke={`url(#${gaugeGradient})`}
                    strokeWidth={20}
                    strokeLinecap="round"
                    fill="none"
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
            </svg>

            <div className={`score-gauge-value ${(score < 7.5 && score >= 5) ? 'average' : ''}`}>{score >= 7.5 ? 'Good' : score >= 5 ? 'Average' : 'Bad'}</div>
            <span className="score-text">{level} <MatchScoreTooltip score={score} matching_json={matching_json} /></span>
        </div>
    );
};


const TailorForAnyJDButton = () => (
    <Link className="outlinedBtn external-jd-btn" to={"/talent/tailor-dashboard#tailor-external-jd"} target="_blank" rel="noopener noreferrer">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.30012 4.9357C6.97303 3.72857 7.30948 3.125 7.8125 3.125C8.31552 3.125 8.65197 3.72857 9.32488 4.9357L9.49897 5.248C9.69019 5.59103 9.7858 5.76254 9.93487 5.87571C10.0839 5.98888 10.2696 6.03088 10.6409 6.1149L10.979 6.19139C12.2857 6.48705 12.9391 6.63487 13.0945 7.13473C13.2499 7.63459 12.8045 8.15544 11.9137 9.19715L11.6832 9.46665C11.4301 9.76267 11.3035 9.91068 11.2466 10.0938C11.1896 10.2769 11.2088 10.4744 11.247 10.8693L11.2819 11.2289C11.4166 12.6188 11.4839 13.3137 11.077 13.6226C10.67 13.9315 10.0583 13.6499 8.8348 13.0866L8.51827 12.9408C8.1706 12.7807 7.99677 12.7007 7.8125 12.7007C7.62823 12.7007 7.4544 12.7807 7.10673 12.9408L6.7902 13.0866C5.56673 13.6499 4.955 13.9315 4.54805 13.6226C4.1411 13.3137 4.20844 12.6188 4.34312 11.2289L4.37796 10.8693C4.41623 10.4744 4.43537 10.2769 4.37843 10.0938C4.32149 9.91068 4.19491 9.76267 3.94177 9.46665L3.7113 9.19715C2.82048 8.15544 2.37506 7.63459 2.5305 7.13473C2.68595 6.63487 3.3393 6.48705 4.646 6.19139L4.98406 6.1149C5.35539 6.03089 5.54105 5.98888 5.69013 5.87571C5.8392 5.76254 5.93481 5.59103 6.12603 5.248L6.30012 4.9357Z" fill="url(#paint0_linear_27354_123210)" />
            <path d="M3.04281 1.56152C3.06155 1.49541 3.17891 1.49501 3.1981 1.56099C3.28573 1.86231 3.44821 2.3077 3.69391 2.55175C3.93962 2.7958 4.38609 2.95527 4.68799 3.04086C4.75411 3.0596 4.7545 3.17696 4.68852 3.19614C4.3872 3.28377 3.94181 3.44625 3.69776 3.69196C3.45371 3.93766 3.29424 4.38414 3.20865 4.68604C3.18991 4.75215 3.07256 4.75255 3.05337 4.68656C2.96574 4.38524 2.80326 3.93986 2.55755 3.69581C2.31185 3.45176 1.86538 3.29229 1.56347 3.2067C1.49736 3.18796 1.49696 3.0706 1.56295 3.05141C1.86427 2.96379 2.30965 2.8013 2.5537 2.5556C2.79775 2.3099 2.95722 1.86342 3.04281 1.56152Z" fill="url(#paint1_linear_27354_123210)" />
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.875 2.03125C12.1339 2.03125 12.3438 2.24112 12.3438 2.5V2.65625H12.5C12.7589 2.65625 12.9688 2.86612 12.9688 3.125C12.9688 3.38388 12.7589 3.59375 12.5 3.59375H12.3438V3.75C12.3438 4.00888 12.1339 4.21875 11.875 4.21875C11.6161 4.21875 11.4062 4.00888 11.4062 3.75V3.59375H11.25C10.9911 3.59375 10.7812 3.38388 10.7812 3.125C10.7812 2.86612 10.9911 2.65625 11.25 2.65625H11.4062V2.5C11.4062 2.24112 11.6161 2.03125 11.875 2.03125Z" fill="url(#paint2_linear_27354_123210)" />
            <defs>
                <linearGradient id="paint0_linear_27354_123210" x1="2.5" y1="3.125" x2="13.125" y2="13.75" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9810FA" />
                    <stop offset="0.5" stop-color="#155DFC" />
                    <stop offset="1" stop-color="#4F39F6" />
                </linearGradient>
                <linearGradient id="paint1_linear_27354_123210" x1="1.51367" y1="1.51172" x2="4.73779" y2="4.73584" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9810FA" />
                    <stop offset="0.5" stop-color="#155DFC" />
                    <stop offset="1" stop-color="#4F39F6" />
                </linearGradient>
                <linearGradient id="paint2_linear_27354_123210" x1="10.7812" y1="2.03125" x2="12.9688" y2="4.21875" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#9810FA" />
                    <stop offset="0.5" stop-color="#155DFC" />
                    <stop offset="1" stop-color="#4F39F6" />
                </linearGradient>
            </defs>
        </svg>
        Tailor for any JD

        <div className="hover-state">
            Exploring opportunities on other platforms as well? Build a resume tailored to any JD
        </div>
    </Link>
)