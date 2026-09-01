import React, { useRef, useState } from "react";
import ReactPlayer from 'react-player/file';
import ErrorModal from '../../ErrorModal.js';
import SectionLoader from "../../SectionLoader.js";
import "./video-recoder.css";

export default function VRPlayer({ url, onDelete, videoResumeDetails = null, canDelete = false, isPreview = false, onResetPreview, isPreviewStop = false, setVideoError }) {
    const playerRef = useRef(null);
    const [hasPlayStarted, setPlayStarted] = useState(false);
    const [isPlaying, setPlaying] = useState(false);
    const [commonErrorModal, setCommonErrorModal] = useState({
        commonError: false,
        messageText: "",
    })

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
    // useEffect(() => {
    //     if (url) {
    //         setPlaying(true);
    //         setPlayStarted(true);
    //     }
    // },[url]);
    const errorHandler = () => {
        if (isPreview) {
            onResetPreview();
            setCommonErrorModal({ ...commonErrorModal, commonError: true, messageText: "Video format not supported. Please select a different file" })
            // alert('Video format not supported. Please select a different file');
        }
        else {
            setVideoError(true);
        }
    }

    const closeCommonErrorModal = () => {
        // this.setState({ commonErrorModal: false, messageText: false });
        setCommonErrorModal({ ...commonErrorModal, commonError: false, messageText: false })
    }

    

    return (
        <>
            <div className='position-relative' style={{ background: "black", borderRadius: "0.5rem" }}>
                <ReactPlayer
                    onError={errorHandler}
                    ref={playerRef}
                    playing={isPlaying} url={url}
                    onEnded={() => { setPlaying(false); playerRef.current.seekTo(0, 'seconds') }}
                    width="100%"
                    fallback={<SectionLoader />}
                />
                {
                    !hasPlayStarted && (
                        <div className='position-absolute' style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 0%, rgba(22,22,22,0.9220063025210083) 100%)", width: "100%", height: "100%", top: "0", borderRadius: "0.5rem" }}></div>
                    )
                }
                {
                    canDelete && (
                        <button className='position-absolute playerPlayPauseBtn' onClick={onDelete} style={{ top: "17px", right: "17px" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="#FFFFFF" width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" style={{ marginTop: "-3px" }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    )
                }
                {
                    !hasPlayStarted ? (
                        <>
                            <div className='initialScreenCount'>
                                {/* {(videoResumeDetails && videoResumeDetails?.watch_count) && (
                                    <p className='text-white' style={{ fontSize: "14px" }}>Your video resume has been viewed: {videoResumeDetails?.watch_count} time{videoResumeDetails?.watch_count > 1 ? 's' : ''}</p>
                                )
                                } */}
                                {!isPreviewStop && <button className='playUnderlinedBtn  now-btn-text' onClick={() => { setPlaying(true); setPlayStarted(true) }}>
                                    Play<span className="record-icon-btn"><img src="../../../../../images/video-resume/record-icon.png" /></span>
                                </button>}
                            </div>
                        </>
                    ) : (
                        (
                            <div className='video-controls' >
                                {/* <div className='count'>
                                    {(videoResumeDetails && videoResumeDetails?.watch_count) && (
                                        <p className='text-white' style={{ fontSize: "14px", paddingLeft: "30px" }}>Viewed: {videoResumeDetails?.watch_count} time{videoResumeDetails?.watch_count > 1 ? 's' : ''}</p>
                                    )
                                    }
                                </div> */}
                                <div className='media'>
                                    <div onClick={() => moveSeeker(-10)} className='d-flex align-items-center cursor-pointer'>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                                        </svg>
                                        <span className='ml-1 text-white' style={{ fontSize: "14px" }}>10</span>
                                    </div>
                                    <button className='playerPlayPauseBtn' onClick={() => { setPlaying(!isPlaying); }}>
                                        {
                                            !isPlaying ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="25px" height="25px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="25px" height="25px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                                    <path fillRule='evenodd' clipRule='evenodd' d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" />
                                                </svg>
                                            )
                                        }
                                    </button>
                                    <div onClick={() => moveSeeker(10)} className='d-flex align-items-center cursor-pointer'>
                                        <span className='mr-1 text-white' style={{ fontSize: "14px" }}>10</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className='col'>
                                </div>
                            </div>
                        )
                    )
                }
            </div>
            {commonErrorModal.commonError === true && (
                <ErrorModal
                    isOpen={commonErrorModal}
                    closeCommonErrorModal={closeCommonErrorModal}
                    content={commonErrorModal.messageText}
                />
            )}
        </>
    );
}