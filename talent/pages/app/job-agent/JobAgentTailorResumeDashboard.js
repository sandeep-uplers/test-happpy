'use client';

import { useCallback, useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowDropDownIcon, WhiteStarsIcon } from '@/talent/assets/IconSVG';
import {
    API_TAILOR_RESUME_JOB_DESCRIPTION,
    API_TAILOR_RESUME_LIST,
    API_TAILOR_RESUME_PREVIEW,
    APP_URL,
} from '@/talent/components/Constant';
import { GET_API, POST_API } from '@/talent/components/Helper';
import { useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import ResumeModal from '@/talent/pages/app/preferences/ResumeModal';
import JobDescriptionViewModal from '@/talent/sections/resume-editor/JobDescriptionViewModal';
import { SET_TAILOR_DASHBOARD_RESUME, SET_TAILOR_MODAL_OPEN } from '@/talent/store/actions/actionsTypes';
import { tailorResumeExtensionUninstall } from '@/talent/store/actions/resumeActions';
import { trackExternalJDPopupOpen, trackTailorPricePopupOpen } from '@/talent/store/actions/trackingActions';
import './JobAgentSubscription.css';
import './JobAgentTailorResumeDashboard.css';

/**
 * AgentJ job-agent shell: tailor resume list under /talent/job-agent/tailor-resume.
 */

function CalendarIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" stroke="#6B6B6B" strokeWidth="1.6" />
            <path d="M8 3v4M16 3v4M3 10h18" stroke="#6B6B6B" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
    );
}

function BriefcaseIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
                stroke="#6B6B6B"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function getResumeCardTitle(rItem) {
    if (rItem?.list_type === 'tailored') {
        return rItem?.tailored_resume || 'Tailored resume';
    }
    return 'Resume uploaded by you';
}

const JobAgentTailorResumeDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state) => state.auth);
    const { is_tailored_paid } = user?.resume_tailored || {};
    const { tailor_dashboard_resume } = useSelector((state) => state.resumeEditor);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState({});
    const [resumesList, setResumesList] = useState([]);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showResumeViewModal, setShowResumeViewModal] = useState(false);
    const [showJDViewModal, setShowJDViewModal] = useState(false);
    const [jobDescriptionData, setJobDescriptionData] = useState(null);
    const [showPlanExpiredBanner, setShowPlanExpiredBanner] = useState(false);

    const fetchTailoredResumeList = useCallback(() => {
        setIsLoading(true);
        GET_API(API_TAILOR_RESUME_LIST)
            .then((res) => {
                const data = res?.data?.data;
                if (data) {
                    setResumeData(data);
                    setResumesList(data?.resumes_list?.slice(0, 10));
                    setPage(0);
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const handleCreateTailoredResume = useCallback(() => {
        if (!user?.outreach?.is_outreach_paid || user?.outreach?.outreach_plan_validity === 0) {
            navigate('/talent/job-agent/subscription');
            trackTailorPricePopupOpen('tailor_dashboard_create_tailor_resume');
            return;
        }
        trackExternalJDPopupOpen('tailor_dashboard_create_tailor_resume');
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: true, is_external_jd: true } });
    }, [dispatch, navigate, user?.outreach?.is_outreach_paid, user?.outreach?.outreach_plan_validity]);

    useEffect(() => {
        document.title = 'My Resumes | AgentJ | Uplers';
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#tailor-external-jd') {
            handleCreateTailoredResume();
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
        }
    }, [handleCreateTailoredResume]);

    useEffect(() => {
        if (searchParams.get('event') == 'extension_uninstalled') {
            tailorResumeExtensionUninstall()(dispatch);
        }
        if (!user?.outreach?.is_outreach_paid || user?.outreach?.outreach_plan_validity === 0) {
            setShowPlanExpiredBanner(true);
        }

        if (is_tailored_paid) {
            fetchTailoredResumeList();
        }
    }, [dispatch, fetchTailoredResumeList, is_tailored_paid, searchParams, user?.outreach?.is_outreach_paid, user?.outreach?.outreach_plan_validity]);

    const handleOpenResumeEditor = (hr_enc_id, externalJD = false) => {
        dispatch({
            type: SET_TAILOR_MODAL_OPEN,
            payload: { hr_enc_id: hr_enc_id, jd_tailor_resume_id: externalJD, is_already_tailored: true },
        });
    };

    const handleViewResume = (rItem) => {
        if (rItem?.list_type == 'tailored') {
            const externalJD = rItem?.hr_enc_id ? false : rItem?.tailored_resume_id;
            handleOpenResumeEditor(rItem?.hr_enc_id, externalJD);
            return;
        }

        setIsLoading(true);
        if (tailor_dashboard_resume?.[rItem?.id]) {
            setSelectedResume(tailor_dashboard_resume?.[rItem?.id]);
            setShowResumeViewModal(true);
            setIsLoading(false);
            return;
        }

        POST_API(API_TAILOR_RESUME_PREVIEW, { file_name: rItem?.base_resume })
            .then((res) => {
                dispatch({
                    type: SET_TAILOR_DASHBOARD_RESUME,
                    payload: { ...tailor_dashboard_resume, [rItem?.id]: res.data?.data },
                });
                setSelectedResume(res.data?.data);
                setShowResumeViewModal(true);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handlePageChange = (selectedPage) => {
        setPage(selectedPage.selected);
        const resumesArr = resumeData?.resumes_list?.slice(
            selectedPage.selected * 10,
            (selectedPage.selected + 1) * 10
        );
        setResumesList(resumesArr);
    };

    const handleViewJobDescription = (rItem) => {
        setIsLoading(true);
        if (tailor_dashboard_resume?.[rItem?.id]) {
            setJobDescriptionData(tailor_dashboard_resume?.[rItem?.id]);
            setShowJDViewModal(true);
            setIsLoading(false);
            return;
        }

        GET_API(API_TAILOR_RESUME_JOB_DESCRIPTION + rItem?.tailored_resume_id)
            .then((res) => {
                dispatch({
                    type: SET_TAILOR_DASHBOARD_RESUME,
                    payload: { ...tailor_dashboard_resume, [rItem?.id]: res.data?.data },
                });
                setJobDescriptionData(res.data?.data);
                setShowJDViewModal(true);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <>
            <div className="job-agent-tailor-dashboard">
                <header className="jad-tailor-page__header">
                    <div className="jad-trd-heading">
                        <h1 className="jad-tailor-page__title jad-font-headline">
                            <span className="jad-tailor-page__title-full">
                                All the resumes you’ve tailored and added so far
                            </span>
                            <span className="jad-tailor-page__title-short">
                                All resumes tailored &amp; added yet
                            </span>
                        </h1>
                        <p className="jad-tailor-page__lead jad-font-body">
                            Create and manage tailored resumes for your applications
                        </p>
                        <p className="jad-trd-total jad-trd-total--inline">
                            <b>{resumeData?.total_tailored_resumes || 0}</b> Total Tailored Resumes
                        </p>
                    </div>
                    <span className="jad-trd-total jad-trd-total--desktop">
                        <b>{resumeData?.total_tailored_resumes || 0}</b> Total Tailored Resumes
                    </span>
                </header>

                <div className="td-header jad-tailor-page__td-header">
                    <div className="td-left">
                        {!showPlanExpiredBanner && (
                            <div className="jad-trd-nudge">
                                <img
                                    src="/images/talent/outreach/mascot-neutral.svg"
                                    alt=""
                                    className="jad-trd-nudge__mascot"
                                    aria-hidden="true"
                                />
                                <div className="jad-trd-nudge__bubble">
                                    <span className="jad-trd-nudge__bubble-full">
                                        Hey! Did you know your current plan includes unlimited tailored resumes
                                    </span>
                                    <span className="jad-trd-nudge__bubble-short">
                                        Did you know your plan includes unlimited tailoring
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="td-right">
                        <div className="resume-actions">
                            <button type="button" className="create-tr-btn" onClick={handleCreateTailoredResume}>
                                <WhiteStarsIcon />
                                Create with custom JD
                            </button>
                        </div>
                    </div>
                </div>

                <div className="td-resume-list-container jad-tailor-list">
                    <div className="td-resume-table-header jad-trd-table-head">
                        <div className="tdr-col resume-col">Base Resume</div>
                        <div className="tdr-col tailored-resume-col">Tailored Resume</div>
                        <div className="tdr-col last-modified-at-col">Last Modified</div>
                        <div className="tdr-col action-col">Action</div>
                    </div>
                    {resumesList?.length > 0 &&
                        resumesList?.map((rItem, index) => {
                            const isTailored = rItem?.list_type == 'tailored';
                            const isBaseViewable =
                                isTailored &&
                                (rItem?.base_resume_text == '(Fetched From Your Profile)' ||
                                    rItem?.base_resume_text == '(Custom Uploaded)');
                            const rowKey = rItem?.id ?? rItem?.tailored_resume_id ?? index;
                            return (
                                <div className="td-resume-list-row jad-trd-table-row" key={rowKey}>
                                    <div className="tdr-col resume-col">
                                        <div className="jad-trd-base">
                                            <span className="jad-trd-base__icon" aria-hidden>
                                                📄
                                            </span>
                                            <div className="jad-trd-base__text">
                                                {isBaseViewable ? (
                                                    <span
                                                        className="resume-name base-resume-view"
                                                        title="View Base Resume"
                                                        onClick={() => handleViewResume({ ...rItem, list_type: 'source' })}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' &&
                                                            handleViewResume({ ...rItem, list_type: 'source' })
                                                        }
                                                    >
                                                        {rItem?.base_resume}
                                                    </span>
                                                ) : (
                                                    <span className="resume-name">{rItem?.base_resume}</span>
                                                )}
                                                <span className="resume-type">{rItem?.base_resume_text}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tdr-col tailored-resume-col">
                                        {isTailored ? (
                                            <>
                                                <span className="tr-name">{rItem?.tailored_resume}</span>
                                                {rItem?.hr_number ? (
                                                    <a
                                                        className="tr-info link"
                                                        href={`${APP_URL}talent/all-opportunities?activeJob=${rItem?.hr_number}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        View Job
                                                    </a>
                                                ) : (
                                                    <span
                                                        className="tr-info link"
                                                        onClick={() => handleViewJobDescription(rItem)}
                                                        role="button"
                                                        tabIndex={0}
                                                    >
                                                        View Job
                                                    </span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="jad-trd-placeholder">
                                                Base resume — no tailored version yet
                                            </span>
                                        )}
                                    </div>
                                    <div className={`tdr-col last-modified-at-col`}>{rItem?.last_updated_at}</div>
                                    <div className="tdr-col action-col">
                                        {rItem?.list_type == 'source' && rItem?.status == 2 ? (
                                            <button
                                                type="button"
                                                className="jad-trd-view-btn jad-trd-view-btn--loading"
                                                disabled
                                            >
                                                <Spinner size="sm" />
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="jad-trd-view-btn"
                                                onClick={() => handleViewResume(rItem)}
                                            >
                                                View Resume
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    <div className="jad-trd-card-list">
                        {resumesList?.length > 0 &&
                            resumesList.map((rItem, index) => {
                                const isTailored = rItem?.list_type == 'tailored';
                                const isBaseViewable =
                                    isTailored &&
                                    (rItem?.base_resume_text == '(Fetched From Your Profile)' ||
                                        rItem?.base_resume_text == '(Custom Uploaded)');
                                const cardKey = rItem?.id ?? rItem?.tailored_resume_id ?? index;
                                return (
                                    <article className="jad-trd-card" key={cardKey}>
                                        <header className="jad-trd-card__head">
                                            <h3 className="jad-trd-card__title">{getResumeCardTitle(rItem)}</h3>
                                        </header>
                                        <div className="jad-trd-card__body">
                                            <div className="jad-trd-card__base">
                                                <div className="jad-trd-card__base-line">
                                                    <span className="jad-trd-card__base-label">
                                                        <span aria-hidden="true">📄 </span>
                                                        Base Resume:
                                                    </span>
                                                    {isBaseViewable ? (
                                                        <button
                                                            type="button"
                                                            className="jad-trd-card__base-name jad-trd-card__base-name--link"
                                                            onClick={() =>
                                                                handleViewResume({ ...rItem, list_type: 'source' })
                                                            }
                                                        >
                                                            {rItem?.base_resume}
                                                        </button>
                                                    ) : (
                                                        <span className="jad-trd-card__base-name">{rItem?.base_resume}</span>
                                                    )}
                                                </div>
                                                <span className="jad-trd-card__base-sub">{rItem?.base_resume_text}</span>
                                            </div>

                                            <div className="jad-trd-card__meta-row">
                                                <div className="jad-trd-card__meta">
                                                    <CalendarIcon />
                                                    <span className="jad-trd-card__meta-label">Last Modified:</span>
                                                    <span className="jad-trd-card__meta-value">
                                                        {rItem?.last_updated_at}
                                                    </span>
                                                </div>
                                                {isTailored && (
                                                    <div className="jad-trd-card__meta jad-trd-card__meta--job">
                                                        <BriefcaseIcon />
                                                        <span className="jad-trd-card__meta-label">Job Details:</span>
                                                        {rItem?.hr_number ? (
                                                            <a
                                                                className="jad-trd-card__job-link"
                                                                href={`${APP_URL}talent/all-opportunities?activeJob=${rItem?.hr_number}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View Job
                                                            </a>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                className="jad-trd-card__job-link"
                                                                onClick={() => handleViewJobDescription(rItem)}
                                                            >
                                                                View Job
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="jad-trd-card__divider" aria-hidden="true" />

                                            {rItem?.list_type == 'source' && rItem?.status == 2 ? (
                                                <button
                                                    type="button"
                                                    className="jad-trd-view-btn jad-trd-view-btn--loading jad-trd-card__cta"
                                                    disabled
                                                >
                                                    <Spinner size="sm" />
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="jad-trd-view-btn jad-trd-card__cta"
                                                    onClick={() => handleViewResume(rItem)}
                                                >
                                                    View Resume
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })}
                    </div>

                    {resumeData?.total_records > 10 && (
                        <div className="pagination-container jad-tailor-pagination">
                            <ReactPaginate
                                breakLabel="..."
                                pageCount={Math.ceil(resumeData?.total_records / 10) || 0}
                                pageRangeDisplayed={4}
                                marginPagesDisplayed={1}
                                onPageChange={handlePageChange}
                                containerClassName={'pagination'}
                                activeClassName={'active'}
                                renderOnZeroPageCount={null}
                                forcePage={page}
                                previousLabel={
                                    <div className="previous-label">
                                        <ArrowDropDownIcon />
                                    </div>
                                }
                                nextLabel={
                                    <div className="next-label">
                                        <ArrowDropDownIcon />
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div
                        className="jad-subscription-fetch-state"
                        role="status"
                        aria-live="polite"
                        aria-busy="true"
                    >
                        <div className="jad-subscription-fetch-state__spinner" aria-hidden />
                        <p className="jad-subscription-fetch-state__text">Loading…</p>
                    </div>
                )}
            </div>
            {showResumeViewModal && (
                <ResumeModal
                    isOpen={showResumeViewModal}
                    setOpen={setShowResumeViewModal}
                    data={selectedResume}
                    onDownloadClick={() => {}}
                    showDownloadOption={false}
                />
            )}
            {showJDViewModal && (
                <JobDescriptionViewModal
                    isOpen={showJDViewModal}
                    setIsOpen={setShowJDViewModal}
                    data={jobDescriptionData}
                />
            )}
        </>
    );
};

export default JobAgentTailorResumeDashboard;
