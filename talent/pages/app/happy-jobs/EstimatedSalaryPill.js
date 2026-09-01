import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getCompanySalaryData, submitCompanySalaryFeedback } from "../../../store/actions/UserActions";
import { CustomTooltip } from "../../../components/common/CustomTooltip";
import { ToolTipSVG } from "../../../assets/IconSVG";
import toast from "react-hot-toast";
import { Spinner } from 'react-bootstrap';
import { estimatedSalaryDataFetchedTracking, estimatedSalaryOptionAvailableTracking, salaryEstimationClickedTracking, salaryEstimationFeedbackGivenTracking } from "../../../helpers/Mixpanel";

const EstimatedSalaryPill = ({ className = "", hrData }) => {
    let hrId = hrData?.id;

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [salaryData, setSalaryData] = useState(null);
    const [salaryRevealed, setSalaryRevealed] = useState(false);
    const [feedbackLoading, setFeedbackLoading] = useState(false);

    useEffect(() => {
        setSalaryData(null);
        setSalaryRevealed(false);
    }, [hrId]);

    useEffect(() => {
        if (hrData) {
            estimatedSalaryOptionAvailableTracking(hrData);
        }
    }, [hrData]);

    useEffect(() => {
        if (hrId && !salaryData) {
            setLoading(true);
            const params = `?hr_id=${hrId}`;
            getCompanySalaryData(params)(dispatch)
                .then((res) => {
                    if (res?.data?.status === 200) {
                        setSalaryData(res.data?.salary_data);

                        if (res.data?.salary_data && hrData) {
                            estimatedSalaryDataFetchedTracking(
                                hrData,
                                res.data?.salary_data,
                                'success'
                            );
                        }
                    }
                })
                .catch((err) => {
                    console.error('error in fetching estimated salary data :', err);

                    if (hrData) { // Track error in data fetch
                        estimatedSalaryDataFetchedTracking(
                            hrData,
                            null,
                            'error',
                            (err?.response?.data?.message && typeof err?.response?.data?.message === 'string') ? err?.response?.data?.message : 'Failed to fetch estimated salary data'
                        );
                    }
                })
                .finally(() => {
                    setLoading(false);
                    // setSalaryData({
                    //     "has_salary_data": true,
                    //     "company_salary_range": "₹23L - ₹37L",
                    //     "company_salary_p25": 2300000,
                    //     "company_salary_p75": 3700000,
                    //     "company_matches": 2,
                    //     "feedback_given": true, // true or false
                    //     "feedback_type": 1 // null, 0 (dislike), or 1 (like)
                    // });
                });
        }
    }, [hrId, salaryData, dispatch]);

    const handleRevealClick = () => {
        setSalaryRevealed(true);

        if (hrData && salaryData) {
            salaryEstimationClickedTracking(hrData, salaryData);
        }
    };

    const thumbClickHandler = (feedbackValue) => {
        setFeedbackLoading(true);
        submitCompanySalaryFeedback({
            hr_id: hrId,
            feedback: feedbackValue
        })(dispatch)
            .then((res) => {
                setSalaryData(prev => ({
                    ...prev,
                    feedback_given: true,
                    feedback_type: feedbackValue
                }));

                toast.success('Thanks for your feedback!');

                if (hrData && salaryData) {
                    salaryEstimationFeedbackGivenTracking(hrData, salaryData, feedbackValue);
                }
            })
            .catch((err) => {
                console.error('Error submitting salary feedback:', err);
                toast.error('Failed to submit feedback');
            })
            .finally(() => {
                setFeedbackLoading(false);
            });
    };

    // LOGS 
    // console.log('hrData :', hrData);

    // JSX --------------------------------------------------------

    if (loading) {
        return (
            <div className={`estimated-salary-pill-container ${className}`} >
                <div
                    className="salary-pill-shimmer"
                    style={{
                        position: 'relative',
                        display: 'inline-flex',
                        width: '11.25rem',
                        height: '1.5rem',
                        backgroundColor: '#dbeafe',
                        borderRadius: '14px',
                        overflow: 'hidden'
                    }}
                >
                    <style>
                        {`
                            .salary-pill-shimmer::after {
                                content: "";
                                position: absolute;
                                width: 100%;
                                height: 100%;
                                top: 0;
                                left: 0;
                                background: linear-gradient(110deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 0) 100%);
                                animation: salary-shimmer-animation 1.3s linear infinite;
                            }
                            
                            @keyframes salary-shimmer-animation {
                                0% {
                                    transform: translateX(-100%);
                                }
                                100% {
                                    transform: translateX(100%);
                                }
                            }
                        `}
                    </style>
                </div>
            </div>
        );
    }

    if (!salaryData || !salaryData.has_salary_data) {
        return null
        // <div className={`estimated-salary-pill-container ${className}`}>
        //     <span style={{
        //         fontSize: '0.65rem',
        //         color: '#9ca3af',
        //         fontWeight: '400'
        //     }}>
        //         Could not estimate the salary
        //     </span>
        // </div>
    }

    return (
        <div className={`estimated-salary-pill-container ${className}`} >
            {!salaryRevealed ? (
                <button
                    onClick={handleRevealClick}
                    className="view-salary-btn"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0.65rem',
                        background: 'linear-gradient(90deg, #2563eb 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '1.25rem',
                        fontSize: '0.65rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                    }}
                >
                    <svg
                        width="0.75rem"
                        height="0.75rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    <span>Estimate the salary</span>
                    <svg
                        width="0.75rem"
                        height="0.75rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            ) : (
                <div
                    className="salary-revealed"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.375rem 0.65rem',
                        backgroundColor: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '1.25rem',
                        fontSize: '0.65rem',
                        fontWeight: '500',
                        color: '#1e3a8a',
                    }}
                >
                    <svg
                        width="0.75rem"
                        height="0.75rem"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2"
                    >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>

                    <span style={{ fontWeight: '600' }}>{salaryData.company_salary_range}</span>

                    <CustomTooltip
                        text="Estimated salary range is calculated using multiple verified sources and data from candidates active on our platform"
                        placement="bottom"
                    >
                        <ToolTipSVG width="12px" height="12px" />
                    </CustomTooltip>

                    {feedbackLoading ? (
                        <Spinner
                            animation="border"
                            variant="secondary"
                            size="sm"
                            style={{ width: '0.75rem', height: '0.75rem', marginLeft: '0.25rem' }}
                        />
                    ) : (
                        <>
                            <span
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginLeft: '0.25rem',
                                }}
                                onClick={() => thumbClickHandler(1)}
                                title="Is this salary range accurate?"
                            >
                                <svg width="0.75rem" height="0.75rem" viewBox="0 0 14 14" fill={salaryData.feedback_type === 1 ? "#22c55e" : "none"} xmlns="http://www.w3.org/2000/svg" style={{ transform: 'rotate(180deg)' }}>
                                    <g clipPath="url(#clip0_thumbsup)">
                                        <path d="M9.91644 1.16623H11.4739C11.8041 1.16039 12.1249 1.27597 12.3754 1.49104C12.626 1.7061 12.7888 2.00568 12.8331 2.33289V6.41623C12.7888 6.74344 12.626 7.04302 12.3754 7.25808C12.1249 7.47315 11.8041 7.58873 11.4739 7.58289H9.91644M5.83311 8.74956V11.0829C5.83311 11.547 6.01748 11.9921 6.34567 12.3203C6.67386 12.6485 7.11898 12.8329 7.58311 12.8329L9.91644 7.58289V1.16623H3.33644C3.05508 1.16305 2.78205 1.26166 2.56766 1.44389C2.35327 1.62612 2.21196 1.8797 2.16977 2.15789L1.36477 7.40789C1.33939 7.5751 1.35067 7.74583 1.39783 7.90825C1.44498 8.07066 1.52688 8.22089 1.63786 8.34851C1.74883 8.47613 1.88623 8.5781 2.04052 8.64735C2.19482 8.7166 2.36233 8.75147 2.53144 8.74956H5.83311Z"
                                            stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_thumbsup">
                                            <rect width="14" height="14" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>

                            <div style={{
                                width: '1px',
                                height: '0.75rem',
                                backgroundColor: '#cbd5e1',
                                margin: '0 0.125rem'
                            }} />

                            <span
                                style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onClick={() => thumbClickHandler(0)}
                                title="Is this salary range inaccurate?"
                            >
                                <svg width="0.75rem" height="0.75rem" viewBox="0 0 14 14" fill={salaryData.feedback_type === 0 ? "#ff7070" : "none"} xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_thumbsdown)">
                                        <path d="M9.91644 1.16623H11.4739C11.8041 1.16039 12.1249 1.27597 12.3754 1.49104C12.626 1.7061 12.7888 2.00568 12.8331 2.33289V6.41623C12.7888 6.74344 12.626 7.04302 12.3754 7.25808C12.1249 7.47315 11.8041 7.58873 11.4739 7.58289H9.91644M5.83311 8.74956V11.0829C5.83311 11.547 6.01748 11.9921 6.34567 12.3203C6.67386 12.6485 7.11898 12.8329 7.58311 12.8329L9.91644 7.58289V1.16623H3.33644C3.05508 1.16305 2.78205 1.26166 2.56766 1.44389C2.35327 1.62612 2.21196 1.8797 2.16977 2.15789L1.36477 7.40789C1.33939 7.5751 1.35067 7.74583 1.39783 7.90825C1.44498 8.07066 1.52688 8.22089 1.63786 8.34851C1.74883 8.47613 1.88623 8.5781 2.04052 8.64735C2.19482 8.7166 2.36233 8.75147 2.53144 8.74956H5.83311Z"
                                            stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_thumbsdown">
                                            <rect width="14" height="14" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default EstimatedSalaryPill;