'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from '@/talent/navigation/routerCompat';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { IMAGE_URL } from '../../../components/Constant';
import { isTalentHired } from '../../../components/Helper';
import Loader from '../../../components/Loader';
import PageTimeLogger from '../../../components/common/PageTimeLogger';
import {
    jobNotInterestedTrack,
    pageVisitLoadAndCtaTrack,
    timeTrackEvent,
} from '../../../helpers/Mixpanel';
import { storeJobNotInterested } from '../../../store/actions/UserActions';
import { HR_UPDATE_NEEDED } from '../../../store/actions/actionsTypes';
import Error from '../../access-public/Error';
import { useHapppySingleJobContext } from './HapppySingleJobContext';
import HapppySingleOppMobile from './HapppySingleOppMobile';
import './HapppySingleOppMobile.css';

const HAPPPY_ALL_JOBS_PATH = '/talent/job-agent/recommended-jobs?tab=all-jobs';
const validApplicableStatus = ['Added', 'In Contacted', 'In Review', 'Not Responding', 'Rejected', 'Not Interested'];

export default function HapppySingleJob() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { recruitment_data, status: talentStatus } = useSelector((state) => state.auth)?.user;
    const isLoading = useSelector((state) => state.loader).isLoading;

    const {
        pageLoaded,
        isOppDisabled,
        data,
        handleOppBookmark,
        handleOppAutoBookmark,
        loader,
        similarJobObj,
    } = useHapppySingleJobContext();

    const [markedNotInterested, setMarkedNotInterested] = useState(false);
    const bookmarkHandled = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('mixpanel_session_id') == null) {
            localStorage.setItem('mixpanel_session_id', uuidv4());
        }
        document.title = `${process.env.NEXT_PUBLIC_APP_NAME} | Opportunity | Happpy Agent`;
        timeTrackEvent('Single Opportunity Page Loaded');
    }, []);

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            pageVisitLoadAndCtaTrack('Single Opportunity Page Loaded');
        }

        if (window.location.search.includes('is_bookmark=1') && !bookmarkHandled.current && Object.keys(data).length > 0) {
            bookmarkHandled.current = true;
            handleOppAutoBookmark();
        }
    }, [data, handleOppAutoBookmark]);

    useEffect(() => {
        if (!isLoading && pageLoaded && Object.keys(data).length == 0) {
            toast.error('HR not found!');
            navigate(HAPPPY_ALL_JOBS_PATH);
        }
    }, [data, isLoading, pageLoaded, navigate]);

    const onSubmitNotInterested = () => {
        setMarkedNotInterested(true);
    };

    const onUndoNotInterested = () => {
        setMarkedNotInterested(false);
        dispatch({ type: HR_UPDATE_NEEDED, payload: { HR_Number: data.HR_Number, job_not_interested: false } });
    };

    const undoHandler = () => {
        jobNotInterestedTrack(
            {
                hr_data: data,
                cta_name: 'reset_not_interested',
                reasons: null,
                from_where: 'happpySingleHr',
                badge_or_msg: 'message',
            },
            data
        );
        let payload = {
            hr_number: data.HR_Number,
            reset_not_interested: true,
        };
        storeJobNotInterested(payload)(dispatch)
            .then(() => {
                onUndoNotInterested();
            })
            .catch((err) => {
                console.log('err', err);
                toast.error('Something went wrong!');
            });
    };

    return (
        <>
            <section className="containSection happpy-single-hr jad-all-jobs-wrap">
                {(isLoading || loader) && <Loader />}
                {!isLoading && pageLoaded && Object.keys(data).length == 0 && <Error />}

                {Object.keys(data).length > 0 && isTalentHired(talentStatus) && (
                    <div className="talentDeployedBanner">
                        <img src={IMAGE_URL + 'work/partyPopperDeployed.svg'} alt="" />
                        <div className="content">
                            <h5>
                                Congratulations! Your engagement with&nbsp;
                                {recruitment_data.length == 0
                                    ? 'client'
                                    : recruitment_data[recruitment_data.length - 1].company?.company_name}
                                &nbsp;has successfully started
                            </h5>
                            <span>
                                <p className="excited">We&apos;re excited for you!</p>
                                <p>
                                    Please note that while your engagement is active, you won&apos;t be able to apply for
                                    other opportunities. But don&apos;t worry; this engagement will be a great learning
                                    experience for you.
                                </p>
                            </span>
                        </div>
                    </div>
                )}

                <HapppySingleOppMobile
                    isOppDisabled={isOppDisabled}
                    data={data}
                    similarJobObj={similarJobObj}
                    markedNotInterested={markedNotInterested}
                    onUndoNotInterested={onUndoNotInterested}
                    onSubmitNotInterested={onSubmitNotInterested}
                    talentStatus={talentStatus}
                    handleOppBookmark={handleOppBookmark}
                    validApplicableStatus={validApplicableStatus}
                    undoHandler={undoHandler}
                    hideApplyCta
                />
            </section>

            <PageTimeLogger pageName={'happpy single opportunity'} />
        </>
    );
}
