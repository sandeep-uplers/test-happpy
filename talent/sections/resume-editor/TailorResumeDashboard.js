import { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import ReactPaginate from 'react-paginate';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from '@/talent/navigation/routerCompat';
import { ArrowDropDownIcon, EyeIcon, PlusChatIcon, WarningTriangleIcon, WhiteStarsIcon } from '../../assets/IconSVG';
import { CustomTooltip } from '../../components/common/CustomTooltip';
import { APP_URL } from '../../components/Constant';
import { formatTailorPlanValidity } from '../../components/Helper';
import Loader from '../../components/Loader';
import ResumeModal from '../../pages/app/preferences/ResumeModal';
import NeedHelpCard from '../../pages/app/resume/nudges/NeedHelpCard';
import TailorResumePaymentModal from '../../pages/app/resume/nudges/TailorResumePaymentModal';
import { SET_TAILOR_DASHBOARD_RESUME, SET_TAILOR_MODAL_OPEN } from '../../store/actions/actionsTypes';
import { getTailoredResumeJobDescription, getTailoredResumeList, tailorResumeExtensionUninstall } from '../../store/actions/resumeActions';
import { trackExternalJDPopupOpen, trackTailorPricePopupOpen } from '../../store/actions/trackingActions';
import { getPreviewUploadedResume } from '../../store/actions/UserActions';
import JobDescriptionViewModal from './JobDescriptionViewModal';
import UploadResumeModal from './UploadResumeModal';

const TailorResumeDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useSelector(state => state.auth);
    const location = useLocation();
    const openTailExternalJD = location.hash === '#tailor-external-jd';

    useEffect(() => {
        if (openTailExternalJD) {
            handleCreateTailoredResume();
            navigate('#', { replace: true });
        }
    }, [openTailExternalJD]);
    const { tailored_plan_validity, is_tailored_paid, active_plan, plan_end_date } = user?.resume_tailored || {};
    const { tailor_dashboard_resume } = useSelector(state => state.resumeEditor);
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [resumeData, setResumeData] = useState({});
    const [resumesList, setResumesList] = useState([]);
    const [showUploadResumeModal, setShowUploadResumeModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showResumeViewModal, setShowResumeViewModal] = useState(false);
    const [showJDViewModal, setShowJDViewModal] = useState(false);
    const [jobDescriptionData, setJobDescriptionData] = useState(null);
    const [showPlanExpiredBanner, setShowPlanExpiredBanner] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const isTailoredScreen = window.innerWidth >= 1152;

    const fetchTailoredResumeList = () => {
        setIsLoading(true);
        getTailoredResumeList()(dispatch)
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
            }).finally(() => {
                setIsLoading(false);
            });
    }

    useEffect(() => {
        if (searchParams.get('event') == 'extension_uninstalled') {
            tailorResumeExtensionUninstall()(dispatch)
        }
        if (!is_tailored_paid || !isTailoredScreen) {
            navigate('/talent/all-opportunities');
            return;
        }

        const isPlanExpiredClose = localStorage.getItem('tailorPlanExpiredDashBannerTime');
        if (tailored_plan_validity == 0 && !isPlanExpiredClose) {
            setShowPlanExpiredBanner(true);
        }

        fetchTailoredResumeList();
    }, []);

    const handleViewResume = (rItem) => {
        if (rItem?.list_type == "tailored") {
            const externalJD = (rItem?.hr_enc_id) ? false : rItem?.tailored_resume_id;
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

        getPreviewUploadedResume({ file_name: rItem?.base_resume }, true)(dispatch)
            .then(res => {
                dispatch({ type: SET_TAILOR_DASHBOARD_RESUME, payload: { ...tailor_dashboard_resume, [rItem?.id]: res.data?.data } });
                setSelectedResume(res.data?.data);
                setShowResumeViewModal(true)
            }).finally(() => {
                setIsLoading(false);
            });
    }

    const handleOpenResumeEditor = (hr_enc_id, externalJD = false) => {
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: hr_enc_id, jd_tailor_resume_id: externalJD, is_already_tailored: true } });
    }

    const handlePageChange = (selectedPage) => {
        setPage(selectedPage.selected);
        const resumesArr = resumeData?.resumes_list?.slice(selectedPage.selected * 10, (selectedPage.selected + 1) * 10);
        setResumesList(resumesArr);
    };

    const handleRenewPlanClick = () => {
        setShowPaymentModal(true);
        trackTailorPricePopupOpen('dashboard-plan-expired-banner')
    }

    const handleViewJobDescription = (rItem) => {
        setIsLoading(true);
        if (tailor_dashboard_resume?.[rItem?.id]) {
            setJobDescriptionData(tailor_dashboard_resume?.[rItem?.id]);
            setShowJDViewModal(true);
            setIsLoading(false);
            return;
        }

        getTailoredResumeJobDescription({ id: rItem?.tailored_resume_id })(dispatch)
            .then(res => {
                dispatch({ type: SET_TAILOR_DASHBOARD_RESUME, payload: { ...tailor_dashboard_resume, [rItem?.id]: res.data?.data } });
                setJobDescriptionData(res.data?.data);
                setShowJDViewModal(true)
            }).finally(() => {
                setIsLoading(false);
            });
    }

    const handleCreateTailoredResume = () => {
        if (!is_tailored_paid || tailored_plan_validity === 0) {
            setShowPaymentModal(true);
            trackTailorPricePopupOpen("tailor_dashboard_create_tailor_resume");
            return;
        }
        trackExternalJDPopupOpen("tailor_dashboard_create_tailor_resume");
        dispatch({ type: SET_TAILOR_MODAL_OPEN, payload: { hr_enc_id: true, is_external_jd: true } })
    }

    return (
        <>
            {(isLoading) && <Loader />}
            <div className="tailor-dashboard-container">
                <div className="td-header">
                    <div className="td-left">
                        {tailored_plan_validity > 0 && <span>{active_plan} active: {formatTailorPlanValidity(plan_end_date)} remaining</span>}
                        <h2>Hey {user?.name}!</h2>
                        <p>Here are all the tailored resumes you have generated so far</p>
                    </div>
                    <div className="td-right">
                        <div className="total-resumes">
                            <span><b>{resumeData?.total_tailored_resumes || 0}</b> Total Tailored Resumes</span>
                            {/* <div className="td-file-icon"><BlueFileIcon /></div> */}
                        </div>
                        <div className='resume-actions'>
                            <button className="outlinedBtn add-resume-btn" onClick={() => setShowUploadResumeModal(true)}><PlusChatIcon /> Add Resume</button>
                            {is_tailored_paid &&
                                <button className="create-tr-btn" onClick={handleCreateTailoredResume}>
                                    <WhiteStarsIcon />
                                    Create with custom JD
                                </button>
                            }
                        </div>
                    </div>
                </div>
                {showPlanExpiredBanner && <PlanExpiredBanner setShow={setShowPlanExpiredBanner} handleRenewPlanClick={() => handleRenewPlanClick()} />}
                <div className="td-resume-list-container">
                    <div className="td-resume-table-header">
                        <div className="tdr-col resume-col">Base Resume</div>
                        <div className="tdr-col tailored-resume-col">Tailored Resume</div>
                        <div className="tdr-col last-modified-at-col">Last Modified</div>
                        <div className="tdr-col action-col"></div>
                    </div>
                    {resumesList?.length > 0 && resumesList?.map((rItem, index) => (
                        <div className="td-resume-list-row" key={index}>
                            <div className="tdr-col resume-col">
                                {(rItem?.list_type == "tailored" && (rItem?.base_resume_text == "(Fetched From Your Profile)" || rItem?.base_resume_text == "(Custom Uploaded)")) ?
                                    <span className='resume-name base-resume-view' title='View Base Resume' onClick={() => handleViewResume({ ...rItem, list_type: "source" })}>{rItem?.base_resume}</span>
                                    :
                                    <span className='resume-name'>{rItem?.base_resume}</span>
                                }
                                <span className='resume-type'>{rItem?.base_resume_text}</span>
                            </div>
                            <div className="tdr-col tailored-resume-col">
                                <span className='tr-name'>{rItem?.tailored_resume}</span>
                                {rItem?.list_type == "tailored" ?
                                    rItem?.hr_number ?
                                        <a className='tr-info link' href={`${APP_URL}talent/all-opportunities?activeJob=${rItem?.hr_number}`} target='_blank'>{rItem?.hr_number}</a>
                                        :
                                        <span className='tr-info link' onClick={() => handleViewJobDescription(rItem)}>(External Job)</span>
                                    : ''
                                }
                            </div>
                            <div className={`tdr-col last-modified-at-col`}>{rItem?.last_updated_at}</div>
                            <div className="tdr-col action-col">
                                {(rItem?.list_type == "source" && rItem?.status == 2) ? (
                                    <CustomTooltip text="In Process">
                                        <Spinner size="sm" style={{ color: '#666', borderWidth: '2px' }} />
                                    </CustomTooltip>
                                ) : (
                                    <div className='action-icon' onClick={() => handleViewResume(rItem)}><EyeIcon height="1rem" width="1.0675rem" /></div>
                                )}
                            </div>
                        </div>
                    ))}

                    {resumeData?.total_records > 10 && (
                        <div className="pagination-container">
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

                                previousLabel={<div className="previous-label"><ArrowDropDownIcon /></div>}
                                nextLabel={<div className="next-label"><ArrowDropDownIcon /></div>}
                            />
                        </div>
                    )}
                </div>
                <NeedHelpCard
                    seeRefundPolicy={!user?.resume_tailored?.is_tailored_paid}
                    atleastOnePaidResume={user?.resume_tailored?.is_tailored_paid}
                    fromTailorDashboard={true}
                />
            </div>
            {showUploadResumeModal && <UploadResumeModal isOpen={showUploadResumeModal} setIsOpen={setShowUploadResumeModal} fetchTailoredResumeList={fetchTailoredResumeList} />}
            {showResumeViewModal && <ResumeModal isOpen={showResumeViewModal} setOpen={setShowResumeViewModal} data={selectedResume} onDownloadClick={() => { }} showDownloadOption={false} />}
            {showPaymentModal && <TailorResumePaymentModal isOpen={showPaymentModal} setIsOpen={setShowPaymentModal} />}
            {showJDViewModal && <JobDescriptionViewModal isOpen={showJDViewModal} setIsOpen={setShowJDViewModal} data={jobDescriptionData} />}
        </>
    )
}

const PlanExpiredBanner = ({ setShow, handleRenewPlanClick }) => {
    return (
        <div className="plan-expired-banner">
            <div className="b-message">
                <WarningTriangleIcon expired={true} />
                <span>Your plan has expired - Renew now to continue creating tailored resumes for job applications</span>
            </div>
            <button className='primaryBtn renew-plan-btn' onClick={handleRenewPlanClick}>Select & Renew Plan</button>
            {/* <button className='close-btn' onClick={handleCloseBanner}><CloseModalIcon height="1rem" width="1rem" /></button> */}
        </div>
    )
}

export default TailorResumeDashboard;