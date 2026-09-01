import React, { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import Modal from 'react-modal';
import { useDispatch } from "react-redux";
import { getAwsFile } from "../../store/actions/UserActions";
import { IMAGE_URL } from "../Constant";
import SectionLoader from "../SectionLoader";
import { AI_INTERVIEW } from "../Constant";


export default function AssessmentStatusModal({ type, score, data, testInfo, completedInfo, retestInfo, resultItem, testsOverview, ...props }) {

    const { assessment_tool, assessment, assesment_report, attempt, retest_days } = data;
    const [isOpen, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const [assementData, setAssementData] = useState([]);

    useEffect(() => {
        if (data) {
            setAssementData(data?.history);
        }
    }, [data])
    // const handleReportView = () => {
    //     window.open(assesment_report_url, '_newtab' + Date.now())
    // }
    useEffect(() => {
        if (!isOpen) {
            setError("");
            setAssementData([]);
        } else {
            setAssementData(data?.history);
        }
    }, [isOpen]);
    const handleReportView = (event, filename, type, index) => {
        event.preventDefault();
        setLoading(event.target.name)
        let _type = type.toLowerCase();
        getAwsFile(_type, filename)(dispatch)
            .then((response) => {
                if (response.data.status == true) {
                    var url = response.data.file_name;
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', filename);
                    document.body.appendChild(link);
                    link.click();
                    link.parentNode.removeChild(link);
                }
                else {
                    setError("Report not available");
                    let assement = assementData?.map((item, itemindex) => {
                        return itemindex === index ? { ...item, error: true } : item
                    })
                    setAssementData(assement);
                }
            }).catch()
            .finally(() => setLoading(false))

    }
    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={() => setOpen(false)}
                portalClassName="react-modal-portal"
                className={`modal commonModalWrap commonModal assesTestModal fade ${isOpen && "show"}`}
            >

                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setOpen(false)}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="modal-body">
                            {type == "completed" && (
                                <>

                                    {resultItem.assessment_tool == AI_INTERVIEW ?
                                        <>
                                            {resultItem.result == 'Failed' &&
                                                <>
                                                    <h3 className="assesFailedTitle">
                                                        Scored below benchmark
                                                    </h3>
                                                    {testsOverview?.onlyAiInterview ?
                                                        <p>
                                                            As your score fell below the required benchmark of 66%, you were unable to successfully complete the Ai Interview for this opportunity.
                                                            You may still explore opportunities and participate in other Ai Interviews
                                                        </p>
                                                        :
                                                        <p>
                                                            You were unable to successfully clear the screening process for this opportunity since you scored below our set benchmark to ensure a success. You may still explore opportunities.
                                                        </p>
                                                    }
                                                    <div className={"testScored failTest"}>
                                                        Score:&nbsp;<span>{score}/{resultItem.total_marks}</span>
                                                    </div>
                                                </>
                                            }

                                            {resultItem.result == 'Passed' &&
                                                <>
                                                    {(score * 100 / resultItem.total_marks) < 66 ?
                                                        <>
                                                            <h3 className="assesComTitle text-brown">
                                                                Average score
                                                            </h3>
                                                            <p>
                                                                Your score was a little below the benchmark, you can still apply for this opportunity.
                                                                Your application will, however, be in the pipeline and reviewed by our opportunity matchers
                                                            </p>
                                                            <div className={"testScored passTest text-brown"}>
                                                                Score:&nbsp;<span>{score}/{resultItem.total_marks}</span>
                                                            </div>
                                                        </>
                                                        :
                                                        <>
                                                            <h3 className="assesComTitle text-green">
                                                                <img src={IMAGE_URL + "work/green-check-icon.svg"} title="green-check-icon" />
                                                                Ai Interview Cleared
                                                            </h3>

                                                            <p>Congratulations, you have successfully completed the Ai Interview<br />for this opportunity</p>
                                                            <div className={"testScored passTest"}>
                                                                Score:&nbsp;<span>{score}/{resultItem.total_marks}</span>
                                                            </div>
                                                        </>
                                                    }
                                                </>
                                            }

                                            {resultItem.result == 'UnderReview' &&
                                                <>
                                                    <div className="underReviewHead">
                                                        <h3 className="assesComTitle text-orange">
                                                        Ai Interview Under Review
                                                        </h3>
                                                        <h6>Qualifying benchmark: <strong className="text-green">66%</strong></h6>
                                                    </div>
                                                    <p>
                                                        Your Ai Interview is being reviewed and scored.
                                                        The scores will be available within a few minutes of the interview's completion
                                                    </p>
                                                    <div className={"testScored waitingTest"}>
                                                        Attempted on: <span>{format(new Date(resultItem.assessment_date), "do MMM’yy")}</span>
                                                    </div>
                                                </>
                                            }
                                            {resultItem.result == 'Disqualified' &&
                                                <>
                                                    <h3 className="assesFailedTitle">
                                                        Disqualified - Ai Interview cancelled
                                                    </h3>
                                                    <p>
                                                        Sorry, your Ai Interview was cancelled due to multiple misconducts detected by our proctoring system during this interview.
                                                        You may still explore opportunities and participate in other
                                                        Ai Interviews
                                                    </p>
                                                </>
                                            }

                                        </>


                                        :
                                        <>
                                            <h3 className="assesComTitle">
                                                <img src={IMAGE_URL + "work/green-check-icon.svg"} title="green-check-icon" />
                                                Assessment Completed
                                            </h3>
                                            {resultItem.level > data.level ?
                                                <p>You are qualified for level {data.level} as you have complete the highe{resultItem.is_highest ? "st" : "r"} level i.e. Level {resultItem.level} of the assessment for {assessment.name}.</p>
                                                :
                                                data.is_highest ?
                                                    <p>You have already completed the assessment for {assessment.name}.</p> :
                                                    <p>You have qualified Level {data.level} of the assessment for {assessment.name}</p>
                                            }

                                            <div className={"testScored passTest"}>{resultItem.level > data.level ? 'Level ' + resultItem.level + ' Score:' : 'You Scored:'}&nbsp;
                                                <span>{score}/{resultItem.assessment_tool == 'Versant' ? 80 : 100}</span>
                                            </div>
                                            {loading ?
                                                <SectionLoader />
                                                :
                                                <>
                                                    {error ? <span style={{ color: "#E03A3A" }}>{error}</span> :
                                                        resultItem.assesment_report ? <button className="btn linkBtn" name='retest'
                                                            onClick={(event) => handleReportView(event, resultItem.assesment_report, resultItem.assessment_tool)}
                                                        >
                                                            VIEW RESULT REPORT
                                                        </button> : <span style={{ color: "#E03A3A" }}>Report not available</span>}
                                                </>
                                            }
                                        </>

                                    }



                                </>
                            )}
                            {type == "retest" && (
                                <>
                                    {attempt < 2 ?
                                        <>
                                            <div className="heading">
                                                {typeof retest_days == Number &&
                                                    <h3>
                                                        Retest Available on: {format(addDays(new Date(), retest_days), 'dd-MM-yyyy')}
                                                    </h3>
                                                }
                                                <h6 className="benchmarkNscore">
                                                    Passing score benchmark:&nbsp;<strong className="text-green">{data.benchmark}%</strong>
                                                </h6>
                                            </div>

                                            {retest_days > 0 ?
                                                <p>
                                                    <span>
                                                        {/* As you were not able to pass this assessment in your previous attempt, you will be able to give this test again in {retest_days} day{retest_days > 1 ? 's' : ''} */}
                                                        {data.missedByMargin < 5 ?
                                                            <>
                                                                As you were not able to pass this assessment in your previous attempt and missed the mark by very little margin, you may retake this assessment now
                                                            </> :
                                                            data.missedByMargin < 10 ?
                                                                <>
                                                                    You will be able to retake this assessment within 24 hours since you missed the mark by very little margin in your previous attempt.
                                                                </>
                                                                :
                                                                data.missedByMargin < 20 ?
                                                                    <>
                                                                        As you were not able to pass this assessment in your previous attempt and missed the mark by very little margin, you will be able to retake this assessment in {retest_days} day{retest_days > 1 ? 's' : ''}
                                                                    </>
                                                                    :
                                                                    <>
                                                                        As you were not able to pass this assessment in your previous attempt, you will be able to give this test again within {retest_days} day{retest_days > 1 ? 's' : ''} of the assessment's completion
                                                                    </>

                                                        }
                                                    </span>
                                                </p>
                                                :
                                                <p>
                                                    <span>
                                                        {data.missedByMargin < 5 &&
                                                            <>
                                                                As you were not able to pass this assessment in your previous attempt and missed the mark by very little margin, you may retake this assessment now
                                                            </>
                                                        }
                                                    </span>
                                                </p>
                                            }
                                        </>
                                        :
                                        <>
                                            <h3 className="assesFailedTitle">
                                                Assessment Not Cleared
                                            </h3>
                                            <p>We understand that you were unable to successfully clear the assessment. We appreciate your effort but unfortunately, you have exhausted your attempts for this assessment</p>
                                        </>
                                    }
                                    {assementData?.map((item, index) => (
                                        <>
                                            <div className="historyItem">
                                                <div className={`testScored retestTest`}>
                                                    Attempt {item.attempt} score : <span>{item.score}/{assessment_tool == 'Versant' ? 80 : 100}</span>
                                                </div>
                                                <span className="resultReport">
                                                    {loading == item?.attempt ?
                                                        <div className="loaderDiv">
                                                            <SectionLoader />
                                                        </div>
                                                        :
                                                        <>
                                                            {item?.error ? <span style={{ color: "#E03A3A" }}>{error}</span> :
                                                                item.assesment_report ?
                                                                    <button className="btn linkBtn" name={item.attempt}
                                                                        onClick={(event) => handleReportView(event, item.assesment_report, assessment_tool, index)}
                                                                    >
                                                                        VIEW REPORT
                                                                    </button> :
                                                                    <span style={{ color: "#E03A3A" }}>Report not available</span>
                                                            }
                                                        </>
                                                    }
                                                </span>
                                            </div>
                                        </>
                                    ))}
                                </>
                            )
                            }
                            {/* {type == "retest" && <p>As you were not able to pass this assessment in your previous attempt, you will be able
                                to give this test again in 3 days</p>} */}

                            {(type == "retest" && attempt < 2) && assessment_tool != AI_INTERVIEW && <div className="attmpLeft">Number of Attempts Left: 1</div>}
                        </div>
                    </div>
                </div>
            </Modal>
            {/* {<button type="button" className="boxInfoBtn" onClick={() => setOpen(true)}>
                {props.children}
            </button>} */}
            {testInfo &&
                <button type="button" className="boxInfoBtn" onClick={() => setOpen(true)}>
                    {props.children}
                </button>
            }
            {(completedInfo && assessment_tool != AI_INTERVIEW) &&
                <div className={"assessmentBottomAction"}>
                    <h4 onClick={() => setOpen(true)}>
                        <img src={IMAGE_URL + "work/check-icon.svg"} alt="check-icon"
                            style={{ width: '16px', height: '16px', marginBottom: 0 }} />
                        Completed
                    </h4>
                </div>
            }
            {(completedInfo && assessment_tool == AI_INTERVIEW) &&
                <div className="assessmentBottomAction">
                    {type == "completed" &&
                        <h4 onClick={() => setOpen(true)}>
                            <img src={IMAGE_URL + "work/check-icon.svg"} alt="check-icon"
                                style={{ width: '16px', height: '16px', marginBottom: 0 }} />
                            {(score * 100 / resultItem.total_marks) < 66 ? 'Completed' : 'Qualified'}
                        </h4>
                    }
                    {type == 'underReview' &&
                        <h4 className="underReviewText">
                            Under review
                        </h4>
                    }
                    {type == 'disqualified' &&
                        <h4 className="failedText">
                            Ai Interview Cancelled
                        </h4>
                    }
                    {type == 'AiFailed' &&
                        <h4 className="failedText">
                            Scored below benchmark
                        </h4>
                    }
                </div>
            }
            {(retestInfo && attempt == 1 && assessment_tool != AI_INTERVIEW) &&
                <div className="assessmentBottomAction">
                    <h4 onClick={() => setOpen(true)}>
                        Retake in {retest_days} Days
                    </h4>
                </div>
            }
        </>
    )
}