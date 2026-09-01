import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from '@/talent/navigation/routerCompat';
import Modal from 'react-modal';
import { differenceInMonths } from 'date-fns';
import ManagePreferences from './ManagePreferences';
import { getJobFunctionMaster, getTalentPreferences } from '../../../store/actions/UserActions';
import Loader from '../../../components/Loader';
import { managePreferencesCtaTrack } from '../../../helpers/Mixpanel';
import { IMAGE_URL } from '../../../components/Constant';
import { TOGGLE_MANAGE_PREFERENCES_MODAL } from '../../../store/actions/actionsTypes';
import { isHapppyAgentFaviconPath } from '../../../helpers/happpyAgentFavicon';


const customStyles = {
    content: {
        marginTop: '45px',
    }
};

export default function ManagePreferencesModal({
    successCallback = () => { },
    applyAggregator = false,
    disableSkip = false,
    hideSaveAnalyzeResumeButton = false,
}) {
    const location = useLocation();
    const { openSignupFlow } = useSelector(state => state.work)
    const { transformation_id, tailor_to_job_modal } = useSelector(state => state.resumeEditor);
    const isEditResumeModalOpen = transformation_id || tailor_to_job_modal;

    if (isHapppyAgentFaviconPath(location.pathname)) {
        return null;
    }

    return (
        <>
            {(!openSignupFlow && !isEditResumeModalOpen) &&
                <ManagePreferencesModalContent
                    successCallback={successCallback}
                    applyAggregator={applyAggregator}
                    disableSkip={disableSkip}
                    hideSaveAnalyzeResumeButton={hideSaveAnalyzeResumeButton}
                />
            }
        </>
    )
}

function ManagePreferencesModalContent({
    successCallback = () => { },
    applyAggregator = false,
    disableSkip = false,
    hideSaveAnalyzeResumeButton = false,
}) {
    const { user: userData } = useSelector(state => state.auth)
    const user = userData || {};
    const { managePreferencesModal: isOpen } = useSelector(state => state.profile);
    const setIsOpen = (value) => {
        dispatch({
            type: TOGGLE_MANAGE_PREFERENCES_MODAL,
            payload: value
        })
    }

    const [isModalLoading, setIsModalLoading] = useState(false)
    const [thankYouModal, setThankYouModal] = useState(false)
    const dispatch = useDispatch()
    const preferencesData = useSelector(state => state?.profile?.preferences)
    const jobFunctionMaster = useSelector(state => state?.profile?.jobFunctionMaster)

    useEffect(() => {
        if (new URLSearchParams(window.location.search).get('showHRDetails') === 'true') {
            setIsOpen(false);
            return;
        }
        const profileUpdateModalSkipped = localStorage.getItem('profileUpdateModalSkipped');
        if (profileUpdateModalSkipped && !applyAggregator) {
            const { timestamp } = JSON.parse(profileUpdateModalSkipped);
            if ((timestamp + 24 * 60 * 60 * 1000) > Date.now()) {
                setIsOpen(false)
                return;
            } else {
                localStorage.removeItem('profileUpdateModalSkipped');
            }
        }

        if (user && Object.keys(user).length > 0 && (user?.last_preference_at || user?.last_preference_at === null)) {
            const lastPreferenceAt = new Date(user?.last_preference_at)
            const lastPreferenceUpdate = differenceInMonths(new Date(), lastPreferenceAt)
            const isJobFunction = preferencesData?.talent?.job_function_id || user?.job_function_id
            if (user?.status >= 1 && (lastPreferenceUpdate >= 3 || !isJobFunction)) {
                if (Object.keys(preferencesData).length === 0 || jobFunctionMaster?.length === 0) {
                    const API_CALLS = []
                    if (jobFunctionMaster?.length === 0) {
                        API_CALLS.push(getJobFunctionMaster(!applyAggregator ? true : false)(dispatch))
                    }
                    if (Object.keys(preferencesData).length === 0) {
                        API_CALLS.push(getTalentPreferences(!applyAggregator ? true : false)(dispatch))
                    }
                    Promise.all(API_CALLS).then(() => {
                        setIsOpen(true)
                        managePreferencesCtaTrack('update_preferences_modal')
                    })
                } else {
                    setIsOpen(true)
                    managePreferencesCtaTrack('update_preferences_modal')
                }
            } else if (user?.status >= 1 && isOpen && (lastPreferenceUpdate < 3 && isJobFunction)) {
                setIsOpen(false)
            }
        }

    }, [user?.status, user?.last_preference_at, user?.job_function_id])

    const handleSuccessClose = () => {
        successCallback()
        setThankYouModal(true)
    }

    return (
        <>
            {isModalLoading && <Loader />}
            <Modal
                isOpen={isOpen}
                style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal commonModal manage-preferences-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document" id="update-profile-modal">
                    <div className="modal-content">
                        <ManagePreferences
                            isModalOpen={isOpen}
                            lastPreferenceUpdate={differenceInMonths(new Date(), new Date(user?.last_preference_at))}
                            setIsModalOpen={setIsOpen}
                            setIsModalLoading={setIsModalLoading}
                            successCallback={handleSuccessClose}
                            applyAggregator={applyAggregator}
                            disableSkip={disableSkip}
                            hideSaveAnalyzeResumeButton={hideSaveAnalyzeResumeButton}
                        />
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={thankYouModal}
                style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal commonModal manage-preferences-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content thank-you-content">
                        <img src={IMAGE_URL + 'thank-you.gif'} className='successGif' />
                        <p>Your preferences have been updated!</p>
                        <button className='primaryBtn CTA' onClick={() => setThankYouModal(false)}>Done</button>
                    </div>
                </div>
            </Modal>
        </>
    )
}
