import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import { useNavigate } from '@/talent/navigation/routerCompat';
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../../components/Constant';
import { checkDirectPayUser, getJobFunctionBasedModalContent, getJobFunctionBasedRole } from '../../../../components/Helper';
import { healthcheckPromoteAggModalClickedTracking, healthcheckPromoteAggModalVisibleTracking } from '../../../../helpers/Mixpanel';


export default function PromoteHealthCheckAggModal({ isOpen, setIsOpen, onSkip, isTransformModal = false }) {
    useEffect(() => {
        if (isOpen) {
            healthcheckPromoteAggModalVisibleTracking(isTransformModal, modalContent.flag);
        }
    }, [isOpen]);

    const { resumeHealthControl } = useSelector(state => state.resume)
    const { user } = useSelector(state => state.auth)
    const healthCheckData = resumeHealthControl.health_check || {};

    const jobFunctionBasedModalContent = getJobFunctionBasedModalContent(user.job_function);

    const isDirectPayUser = checkDirectPayUser(user);
    const [modalContent, setModalContent] = useState({
        title: 'You’re 1 click away from applying — make sure your resume is ready!',
        text: 'Top candidates optimize first. Don’t send it unreviewed.',
        buttonText: isDirectPayUser ? "Make Me Recruiter-Ready" : 'Run Quick Check',
        flag: 'Default',
    });

    const navigate = useNavigate();
    const handleClose = () => {
        setIsOpen(false);
        if (isTransformModal) {
            localStorage.setItem('promoteTransformAggModalInteracted', new Date().getTime());
        } else {
            localStorage.setItem('promoteHealthcheckAggModalInteracted', new Date().getTime());
        }
        onSkip();
    }
    const onClickReview = (e, mobileDrawer = false) => {
        navigate('/talent/resume-health-check/new');
        localStorage.setItem('promoteHealthcheckAggModalInteracted', new Date().getTime());
        healthcheckPromoteAggModalClickedTracking(isTransformModal, modalContent.flag);
    }

    const onClickFixResume = () => {
        localStorage.setItem('promoteTransformAggModalInteracted', new Date().getTime());
        healthcheckPromoteAggModalClickedTracking(isTransformModal);

        if (isDirectPayUser) {
            navigate('/talent/resume-health-check/new');
        } else {
            navigate('/talent/resume-health-check/' + healthCheckData.file_id);
        }
    }

    const isMobile = window.innerWidth < 768;

    // resuume tables and images
    // useEffect(() => {
    //     if (user?.resume_data?.image_count > 0 && user?.resume_data?.table_count > 0) {
    //         setModalContent({
    //             title: 'Your resume has tables and icons that ATS filters can’t read, so key details may never reach recruiters.',
    //             text: '',
    //             buttonText: 'Fix it now',
    //             flag: 'Image and Table',
    //         });
    //     } else if (user?.resume_data?.image_count > 0) {
    //         setModalContent({
    //             title: 'Your resume has images and icons that block ATS from reading your content and reduce visibility',
    //             text: '',
    //             buttonText: 'Make it readable',
    //             flag: 'Image',
    //         });
    //     } else if (user?.resume_data?.table_count > 0) {
    //         setModalContent({
    //             title: 'Your resume has tables and columns that confuse ATS and may never reach recruiters',
    //             text: '',
    //             buttonText: 'Fix my layout',
    //             flag: 'Table',
    //         });
    //     }
    // }, [user]);

    const report_details = healthCheckData.report_details || {};
    const [immediateActions, setImmediateActions] = useState([]);

    useEffect(() => {
        if (isTransformModal) {
            let newImmediateActions = Object.keys(report_details?.sections || {})?.flatMap((key) => {
                return Object.entries(report_details?.sections[key])
                    .filter(([_, val]) => typeof val === 'object' && val?.check == false)
                    .map(([key, val]) => {
                        if (key == 'resume_length') return;
                        return { section: sectionLabels[key], message: val.message };
                    });
            }).filter(Boolean);
            let missingContactInfo = [];
            Object.entries(report_details?.sections?.mandatory_sections?.contact_information || {}).forEach(item => {
                if (item && item[0] != 'github' && !item[1].check && typeof item[1] === 'object') {
                    missingContactInfo.push(item[0].charAt(0).toUpperCase() + item[0].slice(1));
                }
            });
            if (missingContactInfo.length > 0) {
                newImmediateActions.push({ section: 'Contact Information', message: missingContactInfo.join(', ') + ` ${missingContactInfo.length > 1 ? 'are' : 'is'} missing.` });
            }

            let missingEssentialSections = [];
            Object.entries(report_details?.sections?.mandatory_sections?.essential_sections || {}).forEach(item => {
                if (item && !item[1].check && typeof item[1] === 'object') {
                    missingEssentialSections.push(item[0].charAt(0).toUpperCase() + item[0].slice(1));
                }
            });
            if (missingEssentialSections.length > 0) {
                newImmediateActions.push({ section: 'Essential Sections', message: missingEssentialSections.join(', ') + ` ${missingEssentialSections.length > 1 ? 'are' : 'is'} missing.` });
            }

            setImmediateActions(newImmediateActions);
        }
    }, [report_details, isTransformModal]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal promote-healthcheck-modal agg-apply`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                            <CloseModalIcon />
                        </button>
                        {isTransformModal ?
                            <div className='transform-modal'>
                                <div className='header'>
                                    <h6>🔥 You’re 1 Click Away From Applying, But Your Resume Isn’t Ready</h6>
                                    {isDirectPayUser ?
                                        <strong>It’s missing key details recruiters search for — fix it fast to boost your shortlist chances.</strong>
                                        :
                                        <strong>
                                            <span className="score" >
                                                {healthCheckData.resume_score}/100
                                            </span>
                                            — missing key details recruiters search for. Fix it fast.
                                        </strong>
                                    }
                                </div>
                                {/* <div className='content'>
                                        {healthCheckData.resume_score < 85 && healthCheckData.resume_score >= 70 ?
                                            <div className="scoreMessage redFlag">
                                                <h6>Average Resume - Will Get Overlooked</h6>
                                                <text>
                                                    Your resume may pass ATS, but in recruiter comparisons, stronger resume will be shortlisted ahead of you.
                                                </text>
                                            </div>
                                            :
                                            <>
                                                {healthCheckData.resume_score < 70 && healthCheckData.resume_score >= 50 ?
                                                    <div className="scoreMessage redFlag">
                                                        <h6>Screen-Out</h6>
                                                        <text>
                                                            Your resume may parse in ATS, but you wont possibly get calls from recruiters.
                                                        </text>
                                                    </div>
                                                    :
                                                    <>
                                                        <div className="scoreMessage redFlag">
                                                            <h6>Auto-Reject</h6>
                                                            <text>
                                                                Your resume will likely fail ATS parsing and has zero shortlist chance with recruiters.
                                                            </text>
                                                        </div>
                                                    </>
                                                }
                                            </>
                                        }
                                    </div> */}
                                <button className='primaryBtn gradientBtn' onClick={onClickFixResume}>
                                    <img src={IMAGE_URL + "flash-icon.svg"} />
                                    Fix Resume Now!
                                </button>
                            </div>
                            :
                            <>
                                <div className='header'>
                                    <img src={IMAGE_URL + 'bullseye.png'} alt='bullseye' />
                                </div>
                                <div className='content'>
                                    <>
                                        <h5>{modalContent.title}</h5>
                                        {modalContent.text && <text>{modalContent.text}</text>}
                                    </>
                                </div>
                                <button className={`primaryBtn`} onClick={onClickReview} >
                                    {modalContent.buttonText}
                                </button>
                            </>
                        }
                        <button className='ghostBtn' onClick={handleClose}>
                            Skip & continue applying
                        </button>
                        {/* {immediateActions?.length > 0 &&
                            <div className='weakness'>
                                <>
                                    <div className="immediate-actions">
                                        <h6>
                                            <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                            Weaknesses <span>(where product-company recruiters may see issues)</span>
                                        </h6>
                                        <ul>
                                            {immediateActions?.map((action, i) => (
                                                <li key={'immediate_action_' + i}>
                                                    {i + 1}. <span>{action.section} : {action.message}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <button className='underlinedBtn' onClick={(e) => onClickFixResume('bottom')}>
                                        Fix My Resume Now!
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M3.33203 8H12.6654" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M8 3.33398L12.6667 8.00065L8 12.6673" stroke="#231F20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                        </svg>
                                    </button>
                                </>
                            </div>
                        } */}
                    </div>
                </div>
            </Modal>
        </>
    )
}



const sectionLabels = {
    "ats_parse_rate": "ATS Parse Rate",
    "quantify_impact": "Quantify Impact",
    "skill_experience_mapping": "Skills to Experience Support",
    "repetition": "Repetition",
    "resume_length": "Resume Length",
    "spelling_grammar": "Spelling & Grammar",
    "file_format": "File Format & Size",
    "long_bullet_points": "Long Bullet Points",
    "contact_information": "Contact Information",
    "essential_sections": "Essential Sections",
    "active_voice": "Active Voice",
    "buzzwords_cliches": "Buzzwords & Cliches"
}