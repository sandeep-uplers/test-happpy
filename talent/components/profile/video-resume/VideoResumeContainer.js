import React, { useEffect, useState } from 'react'
import UploadVR from './UploadVR'
import RecordVideoResumeModal from './RecordVideoResumeModal'
import PreviewVideoPlayerModal from './PreviewVideoPlayerModal'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVideoResume } from '../../../store/actions/UserActions'
import DiscardVideoModal from './DiscardVideoModal'
import PermissionDeniedModal from './permissionModals/PermissionDeniedModal'
import DeviceErrorModal from './permissionModals/DeviceErrorModal'
import DeviceInUseModal from './permissionModals/DeviceInUseModal'
import { RESET_PERMISSION_DATA } from '../../../store/actions/actionsTypes'


const VideoResumeContainer = ({
    videoResumeStates, setVideoResumeStates, openSelectSourceModal,
    replaceResume = false, handleFetchVideoResume, vrMandatoryOnApply,
    videoResumeData, hrData }) => {

    const dispatch = useDispatch();
    const { permissionsGranted, deviceInfo } = useSelector(state => state?.permissionsReducer);

    const [recordedVideo, setRecordedVideo] = useState({
        blob: null,
        url: '',
        totalDuration: 0,
    });
    const [source, setSource] = useState('recorded');

    useEffect(() => {
        if (recordedVideo.blob) {
            setVideoResumeStates(prev => ({
                ...prev,
                openPreviewVideoPlayerModal: true,
                openPreRecordingModal: false,
                openRecordVideoResumeModal: false,
                openUploadVideoResumeModal: false,
                openDiscardVideoModal: false,
            }));
        }
    }, [recordedVideo]);

    const handleClose = () => {
        setVideoResumeStates(prev => ({
            ...prev,
            openPreRecordingModal: false,
            openRecordVideoResumeModal: false,
            openUploadVideoResumeModal: false,
            openPreviewVideoPlayerModal: false,
            openDiscardVideoModal: false,

            openPermissionDeniedModal: false,
            openDeviceErrorModal: false,
            openDeviceInUseModal: false,
        }));
    }

    const resetPermissionDataAndClose = () => {
        dispatch({ type: RESET_PERMISSION_DATA });
        handleClose();
    }

    // console.log('videoResumeStates :', videoResumeStates);

    return (

        <>
            {videoResumeStates.openPermissionDeniedModal ?
                <PermissionDeniedModal openPermissionDeniedModal={videoResumeStates.openPermissionDeniedModal} permissionsGranted={permissionsGranted} handleClose={resetPermissionDataAndClose} />

                : videoResumeStates.openDeviceErrorModal ?
                    <DeviceErrorModal openDeviceErrorModal={videoResumeStates.openDeviceErrorModal} deviceInfo={deviceInfo} handleClose={resetPermissionDataAndClose} />

                    : videoResumeStates.openDeviceInUseModal ?
                        <DeviceInUseModal openDeviceInUseModal={videoResumeStates.openDeviceInUseModal} handleClose={resetPermissionDataAndClose} />

                        :

                        <>
                            {videoResumeStates.openUploadVideoResumeModal &&
                                <UploadVR videoResumeStates={videoResumeStates}
                                    setVideoResumeStates={setVideoResumeStates}
                                    openSelectSourceModal={openSelectSourceModal}
                                    setRecordedVideo={setRecordedVideo}
                                    setSource={setSource}
                                    videoResumeData={videoResumeData}
                                    handleClose={handleClose}
                                    hrData={hrData}
                                />
                            }

                            {videoResumeStates.openRecordVideoResumeModal &&
                                <RecordVideoResumeModal
                                    videoResumeStates={videoResumeStates}
                                    setVideoResumeStates={setVideoResumeStates}
                                    openSelectSourceModal={openSelectSourceModal}
                                    setRecordedVideo={setRecordedVideo}
                                    setSource={setSource}
                                    handleClose={handleClose}
                                    videoResumeData={videoResumeData}
                                    hrData={hrData}
                                />
                            }

                            {videoResumeStates.openPreviewVideoPlayerModal &&
                                <PreviewVideoPlayerModal
                                    videoResumeStates={videoResumeStates}
                                    setVideoResumeStates={setVideoResumeStates}
                                    openSelectSourceModal={openSelectSourceModal}
                                    recordedVideo={recordedVideo}
                                    source={source}
                                    handleClose={handleClose}
                                    replaceResume={replaceResume}
                                    handleFetchVideoResume={handleFetchVideoResume}
                                    vrMandatoryOnApply={vrMandatoryOnApply}
                                    videoResumeData={videoResumeData}
                                    hrData={hrData}
                                />
                            }

                            {videoResumeStates.openDiscardVideoModal &&
                                <DiscardVideoModal
                                    videoResumeStates={videoResumeStates}
                                    setVideoResumeStates={setVideoResumeStates}
                                    openSelectSourceModal={openSelectSourceModal}
                                    recordedVideo={recordedVideo}
                                    source={source}
                                    handleClose={handleClose}
                                />
                            }
                        </>
            }

        </>
    )
}

export default VideoResumeContainer