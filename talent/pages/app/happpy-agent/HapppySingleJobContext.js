'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from '@/talent/navigation/routerCompat';
import { useSearchParams } from '@/talent/navigation/routerCompat';
import { toast } from 'react-toastify';
import { BookmarkNotification } from '../../../assets/BookmarkNotify';
import { AnimatedCheckMark } from '../../../assets/IconSVG';
import { IMAGE_URL } from '../../../components/Constant';
import Loader from '../../../components/Loader';
import { talentBookMarkTrack } from '../../../helpers/Mixpanel';
import { getHrNumberFromPath } from '../../../helpers/jobPath';
import {
    fetchTouchpointsQuestion,
    getMatchMakePercent,
    getSingleOpportunity,
    getSimilarJob,
    getTalentHrApplyStatus,
    oppBookmark,
} from '../../../store/actions/UserActions';
import {
    HR_UPDATE_COMPLETED,
    OPEN_SIGNUP_APPLY_FLOW,
    SET_SINGLEHR_REDIRECT,
    SET_TOUCHPOINT_DATA,
    UPDATE_HRDATA_TO_APPLY,
    UPDATE_WORK_CONTROL,
} from '../../../store/actions/actionsTypes';
import { SingleHrContext } from '../../../context/SingleHrContext';
import HapppySingleJob from './HapppySingleJob';
import useHapppyCompactJobsLayout from './useHapppyCompactJobsLayout';



const TLT = 5184000000;

function hasRecentActivity(HR_Number) {
    let validRedirects = localStorage.getItem('validRedirects');
    if (!validRedirects) {
        return null;
    }
    let redirectArray = JSON.parse(validRedirects);
    let recentActivityHRs = [];
    redirectArray.map((item) => {
        if (Object.values(item)[0] > new Date().getTime()) {
            recentActivityHRs.push(item);
        }
    });
    let hrIndex = recentActivityHRs.findIndex((item) => item[HR_Number]);
    localStorage.setItem('validRedirects', JSON.stringify(recentActivityHRs));

    if (hrIndex == -1) {
        return null;
    }
    return true;
}

const HapppySingleJobContext = createContext();
export const useHapppySingleJobContext = () => useContext(HapppySingleJobContext);

export default function HapppySingleJobContextProvider() {
    const isLoading = useSelector((state) => state.loader).isLoading;
    const isCompact = useHapppyCompactJobsLayout();
    const [showExpLessModal, setShowExpModal] = useState(false);
    const [showOtherMatchingOpp, setOtherMatchingOpp] = useState(false);
    const [loader, setLoader] = useState(false);
    const [matchingOpps, setMatchingOpps] = useState([]);
    const [matchPercentObj, setMatchPercentObj] = useState({ status: 0 });
    const [similarJobObj, setSimilarJobObj] = useState(null);

    const { singleHrRedirect } = useSelector((state) => state.work);
    const { confirmRedirect, showRedirectModal, redirectPath } = singleHrRedirect;

    const dispatch = useDispatch();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [pageLoaded, setPageLoaded] = useState(false);
    const [fetchingUpdate, setFetchingUpdate] = useState(false);
    const [isOppDisabled, setOppDisabled] = useState(false);

    const auth = useSelector((state) => state.auth);
    const user = auth.user;

    const [data, setData] = useState({});
    const [worngTestStatus, setWrongTestStatus] = useState({});

    useEffect(() => {
        if (Object.keys(data).length > 0 && (user?.total_experience || user?.total_experience == 0)) {
            setShowExpModal(Number(data.YearOfExp) > Number(user.total_experience));
            setOtherMatchingOpp(Number(data.YearOfExp) > Number(user.total_experience) && Number(user.total_experience) >= 3);

            if (
                !isOppDisabled &&
                worngTestStatus.name != 'unqualified' &&
                !data.is_applied &&
                user?.status != 5 &&
                user?.status != 6 &&
                data.publish_ats != 1 &&
                !(Number(data.YearOfExp) > Number(user.total_experience)) &&
                !data.is_saved &&
                !confirmRedirect &&
                !hasRecentActivity(data.HR_Number)
            ) {
                dispatch({
                    type: SET_SINGLEHR_REDIRECT,
                    payload: { confirmRedirect: true },
                });
            }
        }
    }, [user, data, worngTestStatus, isOppDisabled, confirmRedirect, dispatch]);

    const getHighestCleared = (item) => {
        let highestCleared = { level: -1 };
        item.attemptedLevels?.map((i) => {
            if (i.level > item.level && i.result == 'Passed' && i.level > highestCleared.level) {
                highestCleared = i;
            }
        });
        return Object.keys(highestCleared).length > 1 ? highestCleared : null;
    };

    const dataSetter = (resData) => {
        let newStatus = { name: '', completedQuantity: 0, pendingQuantity: 0, data: [] };
        if (
            resData.status == 0 ||
            resData.status == 2 ||
            resData.status == 3 ||
            resData.HR_Status == 'Lost' ||
            resData.HR_Status == 'Cancelled' ||
            resData.HR_Status == 'Completed' ||
            (resData.HR_Status == 'Paused' && !resData.is_applied) ||
            resData.HR_Status == 'Won' ||
            resData.HR_Status == 'Expired'
        ) {
            setOppDisabled(true);
        }
        resData.assessments?.map((item) => {
            let higherCleared = getHighestCleared(item);
            if (higherCleared) {
                newStatus.completedQuantity += 1;
            } else {
                if (item.status == 4 && item.result == 'Passed') {
                    newStatus.completedQuantity += 1;
                }
                if (item.status == 4 && (item.result == 'Failed' || item.result == 'Disqualified') && !(item.attempt < 2 && item.retest == true && item.retest_days <= 0)) {
                    newStatus.name = 'unqualified';
                    newStatus.data.push(item.assessment.name);
                }
                if ((item.status == 2 || item.status == 3) && newStatus.name != 'unqualified') {
                    newStatus.name = 'pending';
                    newStatus.pendingQuantity += 1;
                }
            }
        });
        setData(resData);
        dispatch({ type: UPDATE_HRDATA_TO_APPLY, payload: resData });
        setWrongTestStatus(newStatus);
        setTimeout(() => {
            let newInternalHrTag = document.getElementById('newInternalHr');
            if (newInternalHrTag) {
                newInternalHrTag.classList.add('hide');
            }
        }, 4000);
    };

    const getTouchPointers = (hrNo) => {
        let reqMap = {
            HR_Number: hrNo,
        };

        fetchTouchpointsQuestion(reqMap)(dispatch)
            .then((res) => {
                dispatch({
                    type: SET_TOUCHPOINT_DATA,
                    payload: {
                        HR_Number: hrNo,
                        touchPointQues: res.data.data.data,
                        touchPointMaster: res.data.data.masters,
                        talent: res.data.data.talent,
                        customTocuhpointQues: res.data.data.custom_questions ?? [],
                    },
                });
            })
            .catch((err) => {
                console.log('err', err);
            });
    };

    const getSingleHrData = (hrNo) => {
        setFetchingUpdate(true);
        getSingleOpportunity(hrNo)(dispatch)
            .then((res) => {
                dataSetter(res.data);
                if (searchParams.get('is_additional_screening') == 'true') {
                    if (res.data.custom_screening_needed) {
                        dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: res.data });
                    } else {
                        searchParams.delete('is_additional_screening');
                        setSearchParams(searchParams);
                    }
                }
            })
            .finally(() => {
                setFetchingUpdate(false);
                setPageLoaded(true);
            });
    };

    useEffect(() => {
        if (searchParams.get('directApply') == 'true' && data.HR_Number) {
            if (!data.is_applied) {
                dispatch({ type: OPEN_SIGNUP_APPLY_FLOW, payload: data });
                getTouchPointers(data.HR_Number);
            }
            searchParams.delete('directApply');
            setSearchParams(searchParams);
        }
    }, [searchParams, data.HR_Number, data.is_applied, dispatch, setSearchParams]);

    const { hrTobeUpdated } = useSelector((state) => state.opps);

    useEffect(() => {
        if (Object.keys(hrTobeUpdated).length > 0 && Object.keys(data).length > 0 && hrTobeUpdated[data.HR_Number]) {
            dataSetter({ ...data, ...hrTobeUpdated[data.HR_Number] });
            dispatch({ type: HR_UPDATE_COMPLETED, payload: { HR_Number: data.HR_Number } });
        }
    }, [hrTobeUpdated, data, dispatch]);

    const getSimilarJobObj = (hrNo, email) => {
        getSimilarJob(hrNo, email, { aggregatedJobs: true })(dispatch).then((res) => {
            if (res.data.data) {
                let result = [...res.data.data];
                setSimilarJobObj(result);
            }
        });
    };

    const getApplyStatus = (hrNo) => {
        getTalentHrApplyStatus(hrNo)(dispatch).then((res) => {
            dispatch({ type: UPDATE_WORK_CONTROL, payload: { applyStatus: res.data.data, HR_Number: hrNo } });
        });
    };

    useEffect(() => {
        let hrNo = getHrNumberFromPath(location.pathname);

        if (localStorage.getItem('targetPath')) {
            localStorage.removeItem('targetPath');
        }

        if (auth.isAuthenticated && hrNo) {
            getApplyStatus(hrNo);
            getTouchPointers(hrNo);
            getSingleHrData(hrNo);
            getMatchMakePercent(hrNo)(dispatch).then((res) => {
                setMatchPercentObj({ ...matchPercentObj, ...res.data.data });
            });
            getSimilarJobObj(hrNo, user.email);
        }
    }, []);

    const handleOppBookmark = (oldArgValue, otherMatched = false, redirectConfirm = false) => {
        if (isOppDisabled && !data.is_saved) return;
        setLoader(true);
        if (otherMatched) {
            let oldValue = oldArgValue.is_saved;
            talentBookMarkTrack(data, !oldValue ? 'add' : 'remove', 'single-opportunities');
            let reqMap = {
                hr_id: oldArgValue.enc_id,
                type: !oldValue ? 'add' : 'remove',
            };
            let oppIndex = matchingOpps.findIndex((item) => item.HR_Number == oldArgValue.HR_Number);
            oppBookmark(reqMap)(dispatch)
                .then(async (res) => {
                    if (res.data.status == 'success') {
                        let newMatchingOpp = [...matchingOpps];
                        newMatchingOpp[oppIndex].is_saved = !oldValue;
                        setMatchingOpps(newMatchingOpp);
                        toast.success(
                            <BookmarkNotification role={oldArgValue.RequestForTalent} newValue={!oldValue} />,
                            {
                                position: 'bottom-center',
                                theme: 'dark',
                                closeOnClick: false,
                                autoClose: 3000,
                                ...(isCompact && { style: { marginBottom: '90px' } }),
                            }
                        );
                    }
                })
                .catch((err) => {
                    console.log('Error', err);
                    setData({ ...data, is_saved: oldValue });
                })
                .finally(() => setLoader(false));
        } else {
            let oldValue = oldArgValue == 0 ? 0 : data.is_saved;
            talentBookMarkTrack(data, !oldValue ? 'add' : 'remove', 'single-opportunities');
            if (!redirectConfirm) setData({ ...data, is_saved: !oldValue });
            let reqMap = {
                hr_id: data.enc_id,
                type: !oldValue ? 'add' : 'remove',
            };

            oppBookmark(reqMap)(dispatch)
                .then((res) => {
                    if (res.data.status == 'success') {
                        setData({ ...data, is_saved: !oldValue });
                        if (!redirectConfirm) {
                            toast.success(
                                <BookmarkNotification
                                    role={data.RequestForTalent}
                                    newValue={!oldValue}
                                    undoAllowed={true}
                                    onUndo={handleOppBookmark}
                                />,
                                {
                                    position: 'bottom-center',
                                    theme: 'dark',
                                    closeOnClick: false,
                                    autoClose: 3000,
                                    ...(isCompact && { style: { marginBottom: '90px' } }),
                                }
                            );
                        }
                        if (redirectConfirm) {
                            makeFutureRedirectValid();
                            setTimeout(() => {
                                dispatch({
                                    type: SET_SINGLEHR_REDIRECT,
                                    payload: { confirmRedirect: false, showRedirectModal: false },
                                });
                                navigate(redirectPath);
                            }, 1600);
                        } else if (confirmRedirect) {
                            dispatch({
                                type: SET_SINGLEHR_REDIRECT,
                                payload: { confirmRedirect: false, showRedirectModal: false },
                            });
                        }
                    }
                })
                .catch((err) => {
                    console.log('Error', err);
                    setData({ ...data, is_saved: oldValue });
                })
                .finally(() => setLoader(false));
        }
    };

    const handleOppAutoBookmark = () => {
        talentBookMarkTrack(data, 'add', 'single-opportunities');
        let reqMap = {
            hr_id: data.enc_id,
            type: 'add',
        };
        oppBookmark(reqMap)(dispatch)
            .then((res) => {
                if (res.data.status == 'success') {
                    setData({ ...data, is_saved: 1 });
                }
            })
            .catch((err) => {
                console.log('Error', err);
            });
    };

    const closeRedirectModal = (redirect = false) => {
        if (redirect) {
            dispatch({
                type: SET_SINGLEHR_REDIRECT,
                payload: { confirmRedirect: false, showRedirectModal: false },
            });
            makeFutureRedirectValid();
            navigate(redirectPath);
        }
        dispatch({
            type: SET_SINGLEHR_REDIRECT,
            payload: { showRedirectModal: false },
        });
    };

    const makeFutureRedirectValid = () => {
        let HR_Number = data.HR_Number;
        let validRedirects = localStorage.getItem('validRedirects');
        if (validRedirects) {
            let redirectArray = JSON.parse(validRedirects);
            let hrIndex = redirectArray.findIndex((item) => item[HR_Number]);
            if (hrIndex == -1) {
                redirectArray.push({ [HR_Number]: new Date().getTime() + TLT });
                localStorage.setItem('validRedirects', JSON.stringify(redirectArray));
            }
        } else {
            let newRedirects = [{ [HR_Number]: new Date().getTime() + TLT }];
            localStorage.setItem('validRedirects', JSON.stringify(newRedirects));
        }
    };

    const singleHrContextValue = {
        showExpLessModal,
        setShowExpModal,
        showOtherMatchingOpp,
        pageLoaded,
        isOppDisabled,
        data,
        worngTestStatus,
        matchingOpps,
        handleOppBookmark,
        handleOppAutoBookmark,
        loader,
        matchPercentObj,
        getTouchPointers,
        makeFutureRedirectValid,
        getSingleHrData,
        getApplyStatus,
        similarJobObj,
    };

    return (
        <HapppySingleJobContext.Provider value={singleHrContextValue}>
            <SingleHrContext.Provider value={singleHrContextValue}>
            {fetchingUpdate && !isLoading && <Loader pageLoader={true} />}

            <Modal
                isOpen={confirmRedirect && showRedirectModal}
                portalClassName="react-modal-portal"
                className={`modal commonModal confirmRedirect fade ${confirmRedirect && showRedirectModal && 'show'}`}
            >
                <div className="modal-dialog modal-dialog-centered " role="document">
                    <div className="modal-content">
                        <button
                            type="button"
                            className="modalCloseBtn"
                            data-dismiss="modal"
                            aria-label="Close"
                            onClick={() => closeRedirectModal()}
                        >
                            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="modal-body">
                            <div className="container-div">
                                <div className="content">
                                    <img src={IMAGE_URL + 'work/redirect-confirm-icon.png'} alt="" />
                                    <div>
                                        <h5>
                                            Don&apos;t let this opportunity slip up!
                                            <br />
                                            Make sure you don&apos;t miss this opportunity by bookmarking it
                                        </h5>
                                        <p>
                                            Would you like to bookmark this opportunity for later? You can then access it
                                            later from your account&apos;s &apos;All Jobs&apos; section
                                        </p>
                                        <div className="action">
                                            <button
                                                className="fadedTextBtn"
                                                disabled={data.is_saved}
                                                onClick={() => !data.is_saved && closeRedirectModal(true)}
                                            >
                                                Maybe later
                                            </button>
                                            {data.is_saved ? (
                                                <button className="successLabelBtn">
                                                    <AnimatedCheckMark />
                                                    opportunity Bookmarked
                                                </button>
                                            ) : (
                                                <button className="primaryBtn" onClick={() => handleOppBookmark(data.is_saved, false, true)}>
                                                    Bookmark and continue
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            <HapppySingleJob />
            </SingleHrContext.Provider>
        </HapppySingleJobContext.Provider>
    );
}
