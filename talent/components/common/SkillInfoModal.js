import React, { useState } from "react";

import { useEffect } from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "@/talent/navigation/routerCompat";
import { AlertTriangleOutilne, CloseModalIcon, TopApplicantScoreboardIcon } from "../../assets/IconSVG";
import { editCtaTrack, pageVisitLoadAndCtaTrack } from "../../helpers/Mixpanel";
import { AI_INTERVIEW, IMAGE_URL } from "../Constant";
import Progresser from "./Progresser";
import { getIndividualHR } from "../../store/actions/UserActions";


// const startImochaDate = new Date("2023-06-24T00:00:00");
// const endImochaDate = new Date("2023-06-26T00:00:00");
const checkToolDisabled = (assessment_tool) => {
    // let date = new Date();
    // return assessment_tool == 'iMocha' && (date >= startImochaDate && date <= endImochaDate);
    // return assessment_tool == AI_INTERVIEW;
    return false;
}

export default function SkillInfoModal({ data, retest, inProcess, handleTakeTest, handleInProcessTest, showExpLessModal,
    reqExp, hrRole, isOpen, setOpen, isNextStep, moveToPrev, hrData }) {

    // const [blockedUser, blockUser] = useState(false);
    const dispatch = useDispatch()
    const [testDisabled, setTestDisabled] = useState(true);
    const isLoading = useSelector(state => state.loader).isLoading
    const { assessment_url,
        image_url, duration_formatted,
        assessment, assessment_tool, status, attempt } = data
    const { hrId } = useParams();
    const { user } = useSelector(state => state.auth);

    const { applyingHrNo, applyFlowData } = useSelector(state => state.work)
    const { control: { applySteps } } = applyFlowData[applyingHrNo];

    useEffect(() => {
        setTestDisabled(checkToolDisabled(assessment_tool))
    }, []);

    useEffect(() => {
        if (isOpen && (!data || Object.keys(data).length == 0)) {
            getIndividualHR(hrData.HR_Number)(dispatch)
        }
    }, [isOpen])

    const userAgent = navigator.userAgent;
    const isPc = window.innerWidth >= 768 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Mobile|Opera Mini/i.test(userAgent));

    const screeningStart = () => {
        if (assessment_url) {
            handleInProcessTest()
        } else {
            handleTakeTest(assessment)
        }
    }


    const editSkills = () => {
        moveToPrev()
        editCtaTrack({ hrData, hrId })
    }

    return (
        <>
            {/* <Modal
                isOpen={isOpen && (showExpLessModal && blockedUser && !(status == 3 || inProcess))}
                portalClassName="react-modal-portal"
                className={`modal commonModal exp-less-modal fade ${(isOpen) && "show"}`}
            >
                <div className="modal-dialog modal-dialog-centered " role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" data-dismiss="modal" aria-label="Close" onClick={() => setOpen(false)}>
                            <CloseModalIcon />
                        </button>
                        <div className="modal-body">
                            <div className="container-div">
                                <div className="red-alert-div">
                                    <AlertTriangle />
                                    <h6>Looks like your years of professional experience is less than {Number(reqExp)} years which is critical to the client</h6>
                                </div>
                                <div className="content">
                                    <img src={IMAGE_URL + 'big-red-questionMark.png'} />
                                    <div>
                                        <h5>
                                            Are you sure you want to start taking assessments for this opportunity?
                                        </h5>
                                        <p>You have higher chances of not getting shortlisted for this opportunity. To ensure that our talent's efforts are not wasted, we recommend you continue to build your profile, which will enable us to inform you when a matching opportunity comes along!</p>
                                        <p className="strong">Your years of experience may not be up-to-date with us, so please ensure you update your years of work experience and provide supporting professional experience information to move forward with any opportunity smoothly</p>
                                        <div className="action">
                                            <button className="underlinedBtn"
                                                onClick={() => {
                                                    blockUser(false);
                                                }}
                                            >
                                                proceed anyway
                                            </button>
                                            <Link to={'/talent/profile'} className="primaryBtn">Update my profile&nbsp;<ArrowRightIcon /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal> */}

            <Modal
                isOpen={isOpen}
                // isOpen={isOpen && (!showExpLessModal || !blockedUser || (status == 3 || inProcess))}
                onRequestClose={() => { setOpen(false); }}
                portalClassName="react-modal-portal"
                className={`modal commonModalWrap commonModal skillInfoModal fade take-test-modal ${isOpen && "show"}`}
            >

                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => {
                            setOpen(false);
                            pageVisitLoadAndCtaTrack('Close_Touchpoint')
                        }}>
                            <CloseModalIcon />
                        </button>
                        <div className="modal-body">
                            {hrData.company?.company_name &&
                                <>
                                    {(hrData.ai_mandatory == 0 || hrData.ai_mandatory == 2) ?
                                        <div className="head skillInfo applied">
                                            <svg width="62" height="62" viewBox="0 0 62 62" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <g clip-path="url(#clip0_8568_228961)">
                                                    <path d="M31 62C48.1208 62 62 48.1208 62 31C62 13.8792 48.1208 0 31 0C13.8792 0 0 13.8792 0 31C0 48.1208 13.8792 62 31 62Z" fill="#32BA7C" />
                                                    <path d="M23.0791 44.9839L39.0192 60.9239C52.2211 57.4034 62.0002 45.375 62.0002 30.9996C62.0002 30.7063 62.0002 30.4129 62.0002 30.1195L49.4829 18.5801L23.0791 44.9839Z" fill="#0AA06E" />
                                                    <path d="M31.7825 37.9426C33.1516 39.3117 33.1516 41.6587 31.7825 43.0278L28.9466 45.8637C27.5775 47.2328 25.2305 47.2328 23.8614 45.8637L11.4419 33.3464C10.0728 31.9773 10.0728 29.6303 11.4419 28.2612L14.2778 25.4253C15.6469 24.0562 17.9939 24.0562 19.363 25.4253L31.7825 37.9426Z" fill="white" />
                                                    <path d="M42.6377 16.3315C44.0068 14.9624 46.3538 14.9624 47.7229 16.3315L50.5588 19.1675C51.9279 20.5365 51.9279 22.8836 50.5588 24.2526L29.0446 45.669C27.6755 47.0381 25.3285 47.0381 23.9595 45.669L21.1235 42.8331C19.7544 41.464 19.7544 39.117 21.1235 37.7479L42.6377 16.3315Z" fill="white" />
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_8568_228961">
                                                        <rect width="62" height="62" fill="white" />
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                            <h5>Thank you for applying to <strong>‘{hrRole}’</strong> at <strong>{hrData.company.company_name}</strong></h5>
                                        </div>
                                        :
                                        <div className="head skillInfo topHead">
                                            <h5>Apply to <strong>{hrRole} at {hrData.company.company_name}</strong></h5>
                                            <span>Complete this Ai Interview to finish applying for this position</span>
                                            {isNextStep && <Progresser totalStep={applySteps.total} activeStep={applySteps.total} />}
                                        </div>
                                    }
                                </>
                            }
                            <div className="subhead">

                                {/* <div className={`stepper halfway`}>
                                    <div className="bar"></div>
                                    <span>Step 2 of 2</span>
                                </div> */}
                                {isNextStep && hrData.ai_mandatory == 2 &&
                                    <button className="editPrevStep" onClick={editSkills}>
                                        <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clip-path="url(#clip0_5763_21689)">
                                                <path d="M11.3334 1.99955C11.5085 1.82445 11.7163 1.68556 11.9451 1.5908C12.1739 1.49604 12.4191 1.44727 12.6667 1.44727C12.9143 1.44727 13.1595 1.49604 13.3883 1.5908C13.6171 1.68556 13.8249 1.82445 14 1.99955C14.1751 2.17465 14.314 2.38252 14.4088 2.61129C14.5036 2.84006 14.5523 3.08526 14.5523 3.33288C14.5523 3.58051 14.5036 3.8257 14.4088 4.05448C14.314 4.28325 14.1751 4.49112 14 4.66622L5.00004 13.6662L1.33337 14.6662L2.33337 10.9995L11.3334 1.99955Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5763_21689">
                                                    <rect width="16" height="16" fill="white" />
                                                </clipPath>
                                            </defs>
                                        </svg>
                                        Edit your skills and other info
                                    </button>
                                }
                            </div>
                            <div className="takeTest">
                                {(hrData.ai_mandatory == 1 || hrData.ai_needed) &&
                                    <>
                                        <div className="head">
                                            <img src={image_url} alt={"skillImage" + assessment?.name} />
                                            <div className="content">
                                                <h4>{assessment?.name}</h4>
                                            </div>
                                        </div>

                                        {assessment_tool == AI_INTERVIEW &&
                                            <p className="description aiScreening">
                                                This Ai Interview will cover your communication skills as well as your technical skills for the role of ‘<span className="hrRole">{hrRole}</span>’
                                            </p>
                                        }
                                    </>
                                }

                                {(hrData.ai_mandatory == 1 || hrData?.ai_needed) &&
                                    <>

                                        {!isPc ?
                                            <>
                                                <div className="warning-note">
                                                    <div className="wn-inner-box">
                                                        <div className="wn-inner-top">
                                                            <img src={IMAGE_URL + "work/WarningMobileTestIcon.svg"} />
                                                            <span>This Ai Interview can’t to be taken from a mobile device</span>
                                                        </div>
                                                        <p>Due to proctoring and technical limitations of a mobile phone to show questions while recording your answers via a front-camera we currently don’t allow Ai Interview to be taken from a mobile device</p>
                                                        <strong>Give this Ai Interview from a laptop/desktop</strong>
                                                    </div>
                                                </div>
                                                <div className="whatdo-next">
                                                    <h6>What to do next?</h6>
                                                    <strong>Open this opportunity in your laptop/desktop device to complete your Ai Interview</strong>
                                                    <p>Don’t worry your previous responses for this opportunity has already been saved with us, you can directly start with the Ai Interview upon visiting this opportunity again from your laptop/desktop device</p>
                                                </div>
                                                <button className="btn" onClick={() => { setOpen(false); }}>Understood</button>
                                            </>
                                            :
                                            <>
                                                {assessment_tool == AI_INTERVIEW && hrData.ai_mandatory == 1 &&
                                                    <>
                                                        <div className="screeningTipsHead">
                                                            <img src={IMAGE_URL + 'impPointBulb.svg'} />
                                                            Important points to consider :
                                                        </div>
                                                        <ul className="screeningTips">
                                                            <li>We do not allow this Ai Interview to be taken from a mobile device</li>
                                                            <li>Talent profiles with scores below <span className="red">50%</span> are not considered for that particular opportunity</li>
                                                            <li>This Ai Interview will be used to select candidates for this position according to the following criteria:
                                                                <ul>
                                                                    <li>1st preference: <span className="green">Talents with score over 65%</span></li>
                                                                    <li>2nd preference: <span className="blue">Talents with score over 50%</span></li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </>
                                                }
                                            </>
                                        }

                                        {/* {(assessment_tool != AI_INTERVIEW && assessment.description) &&
                                            <p>{assessment.description}</p>
                                        } */}


                                        {/* {((retest || attempt == 2) && (attempt <= 2) && assessment_tool != AI_INTERVIEW) && <div className="attmpLeft">Number of Attempts Left: 1</div>} */}

                                        {isPc &&
                                            <div className="bottomAction">
                                                {isNextStep && (hrData.ai_mandatory == 1 || hrData.ai_mandatory == 2) &&
                                                    <button className="underlinedBtn" onClick={() => {
                                                        moveToPrev()
                                                        pageVisitLoadAndCtaTrack('Goback_Touchpoint')
                                                    }}> GO Back</button>
                                                }
                                                {!isNextStep && <button className="underlinedBtn" onClick={() => {
                                                    setOpen(false);
                                                    pageVisitLoadAndCtaTrack('Close_Touchpoint')
                                                }}> Cancel</button>}
                                                <div>
                                                    {assessment_tool == AI_INTERVIEW &&
                                                        <>
                                                            {((status == 2 || status == 1) && !inProcess) &&
                                                                <button type="button" disabled={isLoading || testDisabled}
                                                                    className="btn" onClick={() => { screeningStart() }}
                                                                >
                                                                    {(attempt >= 2 || retest) ? "Restart" : "Start"} Ai Interview
                                                                </button>
                                                            }
                                                            {(status == 3 || inProcess) &&
                                                                <button type="button" disabled={isLoading || testDisabled}
                                                                    className="btn" onClick={handleInProcessTest}
                                                                >
                                                                    {(attempt >= 2 || retest) ? "Restart" : "Start"} Ai Interview
                                                                </button>
                                                            }
                                                        </>
                                                    }
                                                    {testDisabled ?
                                                        <div className="testNote testDisabled">
                                                            {/* Please note that this assessment will be temporarily unavailable until midnight on June 26, 2023, due to scheduled maintenance. */}
                                                            Please wait as this assessment is temporarily unavailable right now, due to scheduled maintenance.
                                                        </div>
                                                        :
                                                        <>
                                                            <div className="testNote">Your Ai Interview will open in another tab in a separate environment</div>
                                                        </>
                                                    }
                                                </div>
                                            </div>
                                        }

                                    </>
                                }


                            </div>

                            {hrData.ai_mandatory == 1 &&
                                <div className="warning">
                                    <AlertTriangleOutilne />
                                    <p>The test will be regarded as a ‘failed attempt’ if you pause or leave in-between. If you have a genuine reason or a system/network issue, please take a screenshot or a short video as proof and contact your Uplers point of contact to request a re-test</p>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </Modal >
        </>
    )
}