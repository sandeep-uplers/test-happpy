import React, { useEffect, useRef, useState } from 'react'
import { CloseIcon, CloseModalIcon, BackArrowIcon, VideoPlay, ManualBook, VideoLeft, VideoRight, VideoPause, VideoVolume, PlayVideo, CancelIcon } from '../../../assets/IconSVG'
import Modal from 'react-modal';
import ReactPlayer from 'react-player/file';
import { formatDate, formatFileSize, formatTime, POST_API, createRequestCancelSource, isRequestCanceled } from '../../Helper';
import { useDispatch, useSelector } from 'react-redux';
import { applyMandateVr, getProfilePercent, removeUser, getIndividualHR } from '../../../store/actions/UserActions';
import { API_STORE_VIDEO_RESUME } from '../../Constant';
import { SET_NETWORK_ERROR, UPDATE_CURRENT_USER, VR_PUSHER_SUBSCRIBE, VR_PUSHER_TOGGLE } from '../../../store/actions/actionsTypes';
import { isVideoUploadedTrack } from '../../../helpers/Mixpanel';
import { useSingleHrContext } from '../../../context/SingleHrContext';
import { toast } from 'react-hot-toast';

let cancelTokenSource;

const PreviewVideoPlayerModal = ({
    videoResumeStates, setVideoResumeStates, recordedVideo, handleClose, source, replaceResume,
    handleFetchVideoResume, vrMandatoryOnApply, videoResumeData, hrData }) => {

    const dispatch = useDispatch();
    const playerRef = useRef(null);

    const [isPlaying, setPlaying] = useState(false);
    const [firstTimePlayed, setFirstTimePlayed] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);
    const [uploadData, setUploadData] = useState({
        uploading: false,
        progress: 0,
    })
    // VIDEO UPLOAD CODE START
    const handleSubmit = async (e, retry = 1) => {
        e.preventDefault();
        isVideoUploadedTrack({ ctaVal: 'submit', hrData, retry, video_type: source, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
        setUploadData(prev => ({ ...prev, uploading: true }));
        cancelTokenSource = createRequestCancelSource();
        dispatch({
            type: VR_PUSHER_SUBSCRIBE,
            payload: true
        })
        try {
            const videoBlob = recordedVideo.blob;

            let fileName = `rc-${Date.now()}${Math.floor(Math.random() * 100000)}`;
            let fileType = 'video/webm';

            if (source == 'uploaded' && recordedVideo?.blob?.type) {
                fileType = recordedVideo?.blob?.type;
            }

            let completeFileName = `${fileName}.${fileType.split('/')[1]}`

            const videoRecordingFile = new File([videoBlob], completeFileName, {
                type: fileType,
                lastModified: Date.now(),
            });

            const file = videoRecordingFile;
            const chunkSize = 2 * 1024 * 1024;
            const totalChunks = Math.ceil(file.size / chunkSize);
            const lastChunk = totalChunks > 0 ? (totalChunks - 1) : 0;

            // console.log('totalChunks :', totalChunks);
            // console.log('lastChunk :', lastChunk);

            for (let index = 0; index < totalChunks; index++) {
                console.log('Uploading chunk: #' + index);

                const start = index * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                const formData = new FormData();

                formData.append('file', chunk);
                formData.append('index', index);
                formData.append('fileName', file.name);
                formData.append('is_last', (index === lastChunk).toString());

                try {
                    const res = await POST_API(API_STORE_VIDEO_RESUME, formData, 1, {
                        signal: cancelTokenSource.token,
                    });
                    if (res?.data?.alluploaded) {
                        dispatch({
                            type: VR_PUSHER_TOGGLE,
                            payload: true
                        })
                        if (vrMandatoryOnApply) {
                            vrSubmitApply()
                        }
                        if (replaceResume) {
                            // handleFetchVideoResume();
                        } else {
                            dispatch({
                                type: UPDATE_CURRENT_USER, payload: {
                                    is_talent_video_resume_available: true,
                                }
                            })
                            getProfilePercent()(dispatch);
                        }

                        isVideoUploadedTrack({
                            ctaVal: 'video_submitted', hrData, retry, video_type: source,
                            count: videoResumeData && videoResumeData?.video_url ? 2 : 1,
                            error_or_success: 'success'
                        })
                        setTimeout(() => { handleClose(); }, 500);
                    }
                    setUploadData(prev => ({ ...prev, progress: Math.round(((index + 1) / totalChunks) * 100) })); //update progress
                    console.log('Chunk #' + index + ' uploaded successfully:', res);
                } catch (err) {
                    let errReason = 'Something went wrong!';
                    dispatch({
                        type: VR_PUSHER_SUBSCRIBE,
                        payload: false
                    })
                    if (isRequestCanceled(err)) {
                        errReason = "Upload canceled by user"
                        console.log('Upload canceled by user');
                    } else if (err.response && err.response.status && err.response.status === 401) {
                        errReason = "Unauthenticated"
                        removeUser()(dispatch);
                    } else {
                        console.error('Error uploading chunk #' + index + ':', err);
                    }
                    if ((err.message === 'Failed to fetch' || err?.name === 'TypeError') && retry === 1) {
                        return handleSubmit(e, retry + 1);
                    } else {
                        if (err.message === 'Failed to fetch' || err?.name === 'TypeError') {
                            errReason = "Network error"
                            dispatch({
                                type: SET_NETWORK_ERROR,
                                payload: {
                                    isNetworkError: true,
                                },
                            })
                        }
                    }
                    isVideoUploadedTrack({
                        ctaVal: 'video_submitted', hrData, retry, video_type: source,
                        count: videoResumeData && videoResumeData?.video_url ? 2 : 1,
                        error_or_success: 'error', error_reason: errReason
                    })
                }
            }
        } catch (error) {
            dispatch({
                type: VR_PUSHER_SUBSCRIBE,
                payload: false
            })
            console.error('Error during video upload:', error);
            setUploadData({ uploading: false, progress: 0 });
        }
    };

    const vrSubmitApply = () => {
        let payload = {
            "hr_id": hrData.enc_id
        }
        applyMandateVr(payload)(dispatch)
            .then((res) => {
                let directAppliedHrs = localStorage.getItem('direct_applied_hrs') ? JSON.parse(localStorage.getItem('direct_applied_hrs')) : [];
                directAppliedHrs.push(hrData.HR_Number)
                localStorage.setItem('direct_applied_hrs', JSON.stringify(directAppliedHrs));
                getIndividualHR(hrData.HR_Number)(dispatch)

            }).catch(err => {
                toast.error("Something went wrong", { duration: 7000 })
            })
    }

    const handleCancelUpload = () => {
        cancelTokenSource?.cancel('Upload canceled by user.');
        setUploadData(prev => ({ ...prev, uploading: false, progress: 0 }));
    };

    // VIDEO UPLOAD CODE END

    const moveSeeker = (seconds) => {
        const videoTotalTime = playerRef.current.getDuration() ?? 0;
        const currentTime = playerRef.current.getCurrentTime() ?? 0;

        let newTime = currentTime + seconds;
        newTime = newTime < 0 ? 0 : newTime;
        if (newTime > videoTotalTime) {
            newTime = videoTotalTime;
            setPlaying(false);
        }
        playerRef.current.seekTo(newTime.toString(), 'seconds');
    }

    const handleDiscardAndReRecord = () => {
        isVideoUploadedTrack({ ctaVal: 'discard', hrData, video_type: source, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
        setVideoResumeStates(prev => ({
            ...prev,
            openPreRecordingModal: false,
            openRecordVideoResumeModal: false,
            openUploadVideoResumeModal: false,
            openPreviewVideoPlayerModal: false,
            openDiscardVideoModal: true,
        }));
    }

    const confirmHandleClose = () => {
        if (confirm(`Closing this will discard your ${source == 'uploaded' ? 'uploaded' : 'recorded'} video. Continue?`)) {
            isVideoUploadedTrack({ ctaVal: 'cancel', hrData, video_type: source, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
            handleClose();
            handleCancelUpload();
        }
    };

    const videoTotalTime = recordedVideo?.totalDuration ?? 0;
    const playedPercentage = videoTotalTime > 0 ? (videoCurrentTime / videoTotalTime) * 100 : 0;

    // console.log('recordedVideo :', recordedVideo);

    return (
        <Modal
            isOpen={videoResumeStates.openPreviewVideoPlayerModal}
            portalClassName="react-modal-portal"
            onClose={handleClose}
            className={`commonModal recordVideoSuccessModal`}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={confirmHandleClose} title='Close'>
                        <CloseModalIcon />
                    </button>

                    <div className="modal-body">
                        {source == 'uploaded' ?
                            <div className='recordVideoSuccessHead'>
                                <h2>You have successfully uploaded your video resume</h2>
                                <p>
                                    Uploaded on: <strong>{formatDate(new Date())}</strong>
                                    &nbsp;&nbsp;|&nbsp;&nbsp;
                                    File size: <strong>{formatFileSize(recordedVideo?.blob?.size)}</strong>
                                </p>
                            </div>
                            :
                            <div className='recordVideoSuccessHead'>
                                <h2>Video recorded successfully</h2>
                                <p>Video length: <strong>{formatTime(recordedVideo?.totalDuration)}</strong></p>
                            </div>
                        }

                        <div className='recordVideoSuccessBox'>
                            <div className='videoSuccessPlayer'>

                                <ReactPlayer
                                    ref={playerRef}
                                    playing={isPlaying}
                                    url={recordedVideo?.url}
                                    onProgress={({ playedSeconds }) => setVideoCurrentTime(playedSeconds)}
                                    onEnded={() => {
                                        setPlaying(false);
                                        setFirstTimePlayed(false);
                                        playerRef.current.seekTo(0, 'seconds')
                                    }}
                                    width="100%"
                                />

                            </div>

                            {isPlaying ?
                                <div className='videoPlayerStrip'>
                                    <div className='videoPlayerAction'>
                                        <button
                                            type='button'
                                            className='videoPlayerBtn videoPlayerPre'
                                            title='Rewind'
                                            onClick={() => moveSeeker(-10)}
                                        >
                                            <VideoLeft />10
                                        </button>
                                        <button
                                            type='button'
                                            className='videoPlayerBtn videoPlayerPause'
                                            title='Pause'
                                            onClick={() => setPlaying(false)}
                                        >
                                            <VideoPause />
                                        </button>
                                        <button
                                            type='button'
                                            className='videoPlayerBtn videoPlayerNext'
                                            title='Forward'
                                            onClick={() => moveSeeker(10)}
                                        >
                                            10<VideoRight />
                                        </button>
                                        {/* <button type='button' className='videoPlayerBtn' title='Volume'><VideoVolume /></button> */}
                                    </div>


                                    {source != 'uploaded' &&
                                        <div className='videoPlayerTimer'>
                                            <div className='videoPlayerProgress'>
                                                <span style={{ width: `${playedPercentage}%` }}></span>
                                            </div>
                                            <div className='videoPlayerTime'>
                                                {formatTime(videoCurrentTime)}  /  {formatTime(recordedVideo?.totalDuration)}
                                            </div>
                                        </div>
                                    }
                                </div>
                                :
                                <>
                                    {firstTimePlayed ?
                                        <div className='videoSuccessPaused' >
                                            <h3>Video paused</h3>
                                            <button
                                                type="button"
                                                className="secondaryBtn"
                                                title="Resume playing"
                                                onClick={() => setPlaying(true)}
                                            >
                                                Resume Playing
                                            </button>
                                        </div>
                                        :
                                        <div className='videoSuccessPaused' >
                                            <div
                                                className="firstTimePlayBtn"
                                                title="Play video"
                                                onClick={() => {
                                                    setPlaying(true)
                                                    setFirstTimePlayed(true)
                                                }}
                                            >
                                                <span>PLAY</span><PlayVideo />
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                        </div>


                        {uploadData?.uploading ?
                            <div className='mt-4 videoResumeUploadProgress d-flex justify-content-between align-items-start'>
                                <div style={{ width: '100%' }}>
                                    <p className='videoResumeUploadProgressTitle'>Uploading - {recordedVideo?.blob?.name || 'Video resume'}</p>
                                    <p className='videoResumeUploadProgressPercent'>{uploadData?.progress}%</p>

                                    <div
                                        className="progress"
                                        role="progressbar"
                                        aria-valuenow={uploadData?.progress}
                                        aria-valuemin="0"
                                        aria-valuemax="100"
                                        style={{ height: "5px", width: "calc(100% - 40px)" }}
                                    >

                                        <div
                                            className="progress-bar"
                                            style={{ width: `${uploadData?.progress}%`, backgroundColor: "rgb(129, 197, 87)" }}
                                        ></div>

                                    </div>
                                </div>

                                <div
                                    onClick={handleCancelUpload}
                                    className='videoResumeUploadProgressCancel'
                                    title='cancel'>
                                    <CancelIcon />
                                </div>
                            </div>
                            :
                            <div className='recordVideoSuccessAction'>
                                <button type='button' className='cancelBtn' title='Cancel' onClick={confirmHandleClose}>Cancel</button>
                                <button type='button' className='secondaryBtn' title='Discard & Re-record Video' onClick={handleDiscardAndReRecord}>Discard & RE-RECORD video</button>
                                <button
                                    type='button'
                                    className='primaryBtn'
                                    title='Submit Video'
                                    onClick={handleSubmit}
                                >
                                    SUBMIT VIDEO{vrMandatoryOnApply ? " to Apply" : ""}
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default PreviewVideoPlayerModal