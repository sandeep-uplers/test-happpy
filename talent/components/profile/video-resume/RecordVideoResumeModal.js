'use client';

import dynamic from 'next/dynamic';
import React, { useCallback, useRef, useState } from 'react';
import Modal from 'react-modal';
import { BackArrowIcon, CloseModalIcon, ManualBook, Restart, ShareIcon, VideoCircle } from '../../../assets/IconSVG';
import { videoCompleteRestartRecordingTrack, videoResumeStartUploadRecordingTrack } from '../../../helpers/Mixpanel';
import { formatTime } from '../../Helper';

const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

const RecordVideoResumeModal = ({ hrData, videoResumeStates, setVideoResumeStates, openSelectSourceModal, setRecordedVideo, setSource, handleClose, videoResumeData }) => {
    const webcamRef = useRef(null);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const countdownTimerRef = useRef(null);
    const answerIntervalRef = useRef(null);
    const answerTimeoutRef = useRef(null);
    const [countdown, setCountdown] = useState(5);
    const [showCountdown, setShowCountdown] = useState(false);
    const [answerTimer, setAnswerTimer] = useState(300);
    const [recordingStartTime, setRecordingStartTime] = useState(null);
    const startCountdown = useCallback(() => {
        setShowCountdown(true);
        setCountdown(5);
        countdownTimerRef.current = setInterval(() => {
            setCountdown((prevCount) => {
                if (prevCount <= 1) {
                    clearInterval(countdownTimerRef.current);
                    setShowCountdown(false);
                    handleStartRecording();
                    return 0;
                }
                return prevCount - 1;
            });
        }, 1000);
    }, []);

    const cancelRecording = () => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }
        setShowCountdown(false);
        setCountdown(5);
        setVideoResumeStates(prev => ({
            ...prev,
            openPreRecordingModal: true,
            openRecordVideoResumeModal: true
        }));
    }

    const skipCountdown = () => {
        if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
        }
        setShowCountdown(false);
        handleStartRecording();
    };

    //######### VIDEO RECORDING CODE START #########
    const handleStartRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then(async (stream) => {
                const { default: RecordRTC } = await import('recordrtc');
                streamRef.current = stream;
                recorderRef.current = RecordRTC(stream, {
                    type: 'video'
                });
                recorderRef.current.startRecording();
                setRecordingStartTime(Date.now());

                // answer timeout logic 
                const answerTimeoutTime = 5 * 60 * 1000;
                const answerInterval = setInterval(() => {
                    setAnswerTimer(prevSeconds => prevSeconds - 1);
                }, 1000);
                const answerTimeout = setTimeout(() => {
                    handleStopRecording();
                }, answerTimeoutTime);

                answerIntervalRef.current = answerInterval;
                answerTimeoutRef.current = answerTimeout;
            })
            .catch((err) => {
                console.error('Error accessing media devices.', err);
            });
    }

    const handleStopRecording = () => {
        videoCompleteRestartRecordingTrack({ hrData, ctaVal: 'complete_recording', count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
        recorderRef.current.stopRecording(() => {

            const recordedBlob = recorderRef.current.getBlob();
            const blobUrl = URL.createObjectURL(recordedBlob);

            const endTime = Date.now();
            const duration = Math.min((endTime - recordingStartTime) / 1000, 300);

            setRecordedVideo({
                blob: recordedBlob,
                url: blobUrl,
                totalDuration: duration
            });

            setSource('recorded');
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        });
        clearInterval(answerIntervalRef.current);
        clearTimeout(answerTimeoutRef.current);
        setRecordingStartTime(null);
    }

    const handleRestartRecording = () => {
        videoCompleteRestartRecordingTrack({ hrData, ctaVal: 'restart', count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
        if (recorderRef.current) {
            recorderRef.current.stopRecording(() => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            });
        }

        clearInterval(answerIntervalRef.current);
        clearTimeout(answerTimeoutRef.current);

        setAnswerTimer(300);
        setRecordingStartTime(null);
        // handleStartRecording();
        startCountdown();
    }

    //######### VIDEO RECORDING CODE END #########

    const confirmHandleClose = () => {
        if (confirm(`Closing this will discard your progress. Are you sure you want to continue?`)) {
            handleClose();

            recorderRef.current.stopRecording(() => {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
            });

            clearInterval(answerIntervalRef.current);
            clearTimeout(answerTimeoutRef.current);
            setRecordingStartTime(null);
        }
    }

    // console.log('status :', status);
    // console.log('mediaBlobUrl :', mediaBlobUrl);


    return (
        <>

            {/* Pre Recording Modal  */}
            {videoResumeStates.openPreRecordingModal &&
                <Modal
                    isOpen={videoResumeStates.openPreRecordingModal}
                    portalClassName="react-modal-portal"
                    onClose={handleClose}
                    className={`commonModal canRecordVideoResumeModal`}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose} title='Close'>
                                <CloseModalIcon />
                            </button>

                            <button
                                type="button"
                                className="popupBackBtn"
                                aria-label="Close"
                                onClick={() => {
                                    openSelectSourceModal(); handleClose();
                                }}
                                title='Back'
                            >
                                <BackArrowIcon />
                            </button>

                            <div className="modal-body">
                                <div className='candidateVideoResume'>
                                    <div className='canPointsVideoResume'>
                                        <div className='canPointsVideoResumeList'>
                                            <h3><ManualBook /> Points to keep in mind</h3>
                                            <ul>
                                                <li>Keep it concise. Mention your name, current job title, & years of experience</li>
                                                <li>Focus on your recent work experiences & professional accomplishments</li>
                                                <li>Mention the tools & technologies you're proficient in & how you've used them</li>
                                                <li>Briefly discuss any team collaboration or leadership experiences</li>
                                                <li>Describe your role/contributions, challenges, technology and outcomes of your most impactful projects</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className='canVideoResumeBox'>
                                        <div className='canRecordingVideoBox preRecording'>
                                            <div className='videoResumeWrap'>
                                                {/* <div className='videoResumeBox'>
                                                    <Webcam ref={webcamRef} width={860} />
                                                </div> */}
                                                <div className='videoResumeBoxInfo'>
                                                    {/* <h2>Press ‘record now’ below to get started</h2> 
                                                    <div className='videoResumeAction'>
                                                        <button
                                                            type='button'
                                                            className='videoPlayBtn'
                                                            title="Record Now"
                                                            onClick={() => {
                                                                setVideoResumeStates(prev => ({
                                                                    ...prev,
                                                                    openPreRecordingModal: false,
                                                                    openRecordVideoResumeModal: true
                                                                }))
                                                                startCountdown();
                                                            }}
                                                        >
                                                            RECORD NOW <VideoPlay />
                                                        </button>
                                                        5 minute time limit
                                                    </div> */}
                                                    <div className='videoResumeActionBtn'>
                                                        <button
                                                            type='button'
                                                            className='primaryBtn'
                                                            title='Start Recording'
                                                            onClick={() => {
                                                                setVideoResumeStates(prev => ({
                                                                    ...prev,
                                                                    openPreRecordingModal: false,
                                                                    openRecordVideoResumeModal: true,
                                                                    openUploadVideoResumeModal: false,
                                                                    openPreviewVideoPlayerModal: false,
                                                                    openDiscardVideoModal: false,
                                                                }))
                                                                startCountdown();
                                                                videoResumeStartUploadRecordingTrack({ ctaVal: 'start_recording', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 });
                                                            }}
                                                        >
                                                            Start Recording
                                                            <VideoCircle />
                                                        </button>
                                                        <span className='orText'>Or</span>
                                                        <button
                                                            type='button'
                                                            className='secondaryBtn'
                                                            title='Upload Video'
                                                            onClick={() => {
                                                                setVideoResumeStates(prev => ({
                                                                    ...prev,
                                                                    openPreRecordingModal: false,
                                                                    openRecordVideoResumeModal: false,
                                                                    openUploadVideoResumeModal: true,
                                                                    openPreviewVideoPlayerModal: false,
                                                                    openDiscardVideoModal: false,
                                                                }))
                                                                videoResumeStartUploadRecordingTrack({ ctaVal: 'upload_video', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 });
                                                            }}
                                                        >
                                                            <ShareIcon /> Upload Video
                                                        </button>
                                                    </div>
                                                    <p>Make sure your web cam is on and that your microphone is all ready to record We recommend to keep the video only 2-3 min long</p>
                                                    <div className='videoResumeGoBack'>
                                                        <button
                                                            type='button'
                                                            className='btn'
                                                            title='Go Back'
                                                            onClick={() => {
                                                                openSelectSourceModal(); handleClose();
                                                                videoResumeStartUploadRecordingTrack({ ctaVal: 'go_back', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 });
                                                            }}
                                                        >
                                                            Go Back
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </Modal>
            }

            {/* Recording Modal */}
            {!videoResumeStates.openPreRecordingModal &&
                <Modal
                    isOpen={!videoResumeStates.openPreRecordingModal && videoResumeStates.openRecordVideoResumeModal}
                    portalClassName="react-modal-portal"
                    onClose={handleClose}
                    className={`commonModal canRecordVideoResumeModal`}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={confirmHandleClose} title='Close'>
                                <CloseModalIcon />
                            </button>

                            <div className="modal-body">
                                <div className={`candidateVideoResume ${!showCountdown && 'canRecordingStarted'}`}>
                                    {showCountdown && <div className='canPointsVideoResume'>
                                        <div className='canPointsVideoResumeList'>
                                            <h3><ManualBook /> Points to keep in mind</h3>
                                            <ul>
                                                <li>Keep it concise. Mention your name, current job title, & years of experience</li>
                                                <li>Focus on your recent work experiences & professional accomplishments</li>
                                                <li>Mention the tools & technologies you're proficient in & how you've used them</li>
                                                <li>Briefly discuss any team collaboration or leadership experiences</li>
                                                <li>Describe your role/contributions, challenges, technology and outcomes of your most impactful projects</li>
                                            </ul>
                                        </div>
                                    </div>}

                                    <div className='canVideoResumeBox'>
                                        <div className='canRecordingVideoBox'>

                                            {showCountdown && (
                                                <div className='canVideoCountDown'>
                                                    <div className='canVideoCountDownBox'>{countdown}</div>
                                                    <p>Recording will start in <strong>{countdown} seconds</strong></p>
                                                    <button
                                                        type='button'
                                                        className='primaryBtn'
                                                        title='Skip Countdown'
                                                        onClick={skipCountdown}
                                                    >
                                                        SKIP COUNTDOWN
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className='cancelBtn'
                                                        title='Cancel Recording'
                                                        onClick={cancelRecording}
                                                    >
                                                        CANCEL RECORDING
                                                    </button>
                                                </div>
                                            )}

                                            {!showCountdown &&
                                                <div className='canRecordingVideoItem'>
                                                    <label className='canVideoLive'>Recording</label>

                                                    <div className='canRecordingIframe'>
                                                        <Webcam ref={webcamRef} width={860} />
                                                    </div>

                                                    <div className='canRecordingFooter'>
                                                        <div className='canRecordingProgress'>
                                                            <div className='canRecordingWave'>
                                                                <span></span>
                                                                <span></span>
                                                                <span></span>
                                                            </div>
                                                            <div className='canRecordingTimer'> {formatTime(answerTimer)} / 5:00</div>
                                                        </div>

                                                        <div className='canRecordingAction'>
                                                            {!(answerTimer > 295) &&
                                                                <button
                                                                    type='button'
                                                                    className={`restartRecording `}
                                                                    onClick={handleRestartRecording}
                                                                    disabled={(answerTimer > 295)}
                                                                >
                                                                    <Restart /> Restart
                                                                </button>
                                                            }
                                                            <button
                                                                type='button'
                                                                className={`primaryBtn ${(answerTimer > 295) ? 'disabled' : ''}`}
                                                                title='Complete Recording'
                                                                onClick={handleStopRecording}
                                                                disabled={(answerTimer > 295)}
                                                            >
                                                                Complete recording
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </Modal>
            }

        </>
    )
}

export default RecordVideoResumeModal