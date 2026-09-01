import React, { Component, useEffect } from 'react';
import VideoModal from 'react-modal';
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import ReactPlayer from "react-player";
import { useState } from 'react';
import { useRef } from 'react';
import { IMAGE_URL } from '../../Constant';
import SectionLoader from '../../SectionLoader';
import ReactSlider from 'react-slider';
function VideoplayModal({ isPlayVideo, onClose, url, handleTrackVideo }) {
    const [volume, setVolume] = useState(50);
    const [seeking, setSeeking] = useState(false);
    const volumRef = useRef(0);
    const playerRef = useRef(null);
    const durationRef = useRef(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [played, setPlayed] = useState(0);
    let maxPlayed = 0;
    const handle = useFullScreenHandle();
    const [isPlaying, setPlaying] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isReadyToPlay, setIsReadytoPlay] = useState(false);
    const [isBuffering, setBuffering] = useState(false);
    const [wacthedFullVideo, setWatchedFull] = useState(false);
    const handleProgress = (event) => {
        const progress = document.querySelector('.progressVideo');
        const value = event.target.value;
        progress.style.background = `linear-gradient(to right, rgb(245, 245, 245, 0.72) 0%, rgb(245, 245, 245, 0.72) ${value}%, rgb(245, 245, 245, 0.32) ${value}%, rgb(245, 245, 245, 0.32) 100%)`
    }
    const onFullScreenChange = (e) => {
        if (!e) setIsFullScreen(false);
    }
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

    const progressHandler = (state) => {
        setPlayed(state.playedSeconds);
        if (state.playedSeconds > maxPlayed) {
            maxPlayed = state.playedSeconds;
        }
    };
    const onSeek = (newValue) => {
        setPlayed(newValue);
        playerRef.current.seekTo(newValue);
    }

    useEffect(() => {
        if (isPlayVideo) {
            setVolume(0);
            setPlaying(false);
            volumRef.current = 0;
        }
    }, [isPlayVideo]);

    const handleCloseModal = () => {
        if (!wacthedFullVideo & !videoError) {
            let videoTotalTime = playerRef.current.getDuration() ?? 0;
            let currentTime = playerRef.current.getCurrentTime() ?? 0;
            let maxTime = currentTime;
            if (currentTime < maxPlayed) maxTime = maxPlayed;
            handleTrackVideo({ videoResumeWatched: Math.ceil(maxTime / videoTotalTime * 100) });
        }
        onClose();
        volumRef.current = 0; setVolume(0); setPlaying(false); setPlayed(0);
        maxPlayed = 0; setIsReadytoPlay(false); setWatchedFull(false); setBuffering(false);
    }
    return (
        <VideoModal
            isOpen={isPlayVideo}
            onCancel={handleCloseModal}
            onRequestClose={handleCloseModal}
            portalClassName="react-modal-portal"
            className={`modal  commonModal profile-modal preview fade ${isPlayVideo && "show"}`}
        >
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    {videoError ?
                        <>
                            <div className="mt-4 previewVideoError modal-body">
                                <button type="button" className="modalCloseBtn" aria-label="Close" onClick={onClose}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className='videoErrorPlayer'>
                                    <div className="imgDiv">
                                        <img src={IMAGE_URL + 'unforseenError.svg'} alt='error-emoji' />
                                    </div>
                                    <h5>Unable to play your video</h5>
                                    <h6>Seems like your browser doesn’t support this video format</h6>
                                    <p>We recommend using and logging in another supported browser as listed below in order to have an uninterrupted experience</p>
                                    <div className='browser-list'>
                                        <div className='list-item'>
                                            <img src={IMAGE_URL + 'Chrome-logo.svg'} />
                                            <span className='name'>Chrome</span>
                                        </div>
                                        <div className='list-item'>
                                            <img src={IMAGE_URL + 'Firefox-logo.svg'} />
                                            <span className='name'>Firefox</span>
                                        </div>
                                        <div className='list-item'>
                                            <img src={IMAGE_URL + 'Edge-logo.svg'} />
                                            <span className='name'>Microsoft Edge</span>
                                        </div>
                                        <div className='list-item'>
                                            <img src={IMAGE_URL + 'Safari-logo.svg'} />
                                            <span className='name'>Safari</span>
                                        </div>
                                    </div>
                                    <div className='action'>
                                        <button className='btn' onClick={onClose}>Got it</button>
                                    </div>
                                </div>
                            </div>
                        </>
                        :
                        <>
                            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleCloseModal}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <FullScreen handle={handle} onChange={onFullScreenChange}>
                                <div className='position-relative' style={{ borderRadius: "0.5rem" }}>
                                    <ReactPlayer
                                        ref={playerRef}
                                        playing={isPlaying}
                                        url={url}
                                        onError={() => setVideoError(true)}
                                        //    url="https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4"

                                        onEnded={() => {
                                            setPlaying(false);
                                            setWatchedFull(true); handleTrackVideo({ videoResumeWatched: 100 });
                                            playerRef.current.seekTo(0, 'seconds'); setBuffering(false)
                                        }}
                                        width="100%"
                                        className={"video-box"}
                                        onBuffer={() => setBuffering(true)}
                                        onBufferEnd={() => setBuffering(false)}
                                        volume={volumRef.current}
                                        controls={false}
                                        onProgress={progressHandler}
                                        onReady={() => setIsReadytoPlay(true)}
                                    />
                                    {(isBuffering || !isReadyToPlay) &&
                                        <div className="buffering">
                                            <div className="loaderDiv">
                                                <SectionLoader />
                                            </div>
                                        </div>
                                    }
                                    {/* <div className='position-absolute' style={{ width: "100%", height: "100%", top: "0", borderRadius: "0.5rem" }}></div> */}
                                    {/* <div className='position-absolute row align-items-center' style={{ bottom: "0px", width: "100%", left: "14px", right: "0", padding: "22px 0", background: "rgba(186, 186, 186, 0.2)", }}>

                                        <div className='col d-flex align-items-center ' style={{ gap: "25px", }}>
                                            <div onClick={() => moveSeeker(-10)} className='d-flex align-items-center cursor-pointer'>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                                                </svg>
                                                <span className='ml-1 text-white' style={{ fontSize: "14px" }}>10</span>
                                            </div>
                                            <button className='playerPlayPauseBtn' onClick={() => {
                                                setPlaying(!isPlaying);
                                                durationRef.current = playerRef.current.getDuration();
                                            }}>
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
                                            <div className="volume-button">
                                                <span><img src="../../../../../images/video-resume/video-volume.svg"></img></span>
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={volume}
                                                    className="progressVideo"
                                                    onClick={handleProgress}
                                                    id="videoId"
                                                    onChange={event => {
                                                        setVolume(event.target.valueAsNumber)
                                                        volumRef.current = event.target.valueAsNumber / 100
                                                    }}
                                                />
                                            </div>
                                            <div className="video-play-range">

                                                <Box width={300}>
                                                    <Slider
                                                        size="small"
                                                        aria-label="Small"
                                                        min={0}
                                                        max={durationRef.current}
                                                        value={played}
                                                        onChange={onSeek}
                                                    // onMouseDown={onSeekMouseDown}
                                                    // onChangeCommitted={onSeekMouseUp}
                                                    />
                                                </Box>
                                            </div>
                                            <div className="full-small-screen" style={{ color: "white" }} >
                                                {!isFullScreen ? <img src="../../../../../images/video-resume/full-screen.svg"
                                                    onClick={() => {
                                                        setIsFullScreen((isFullScreen) => !isFullScreen);
                                                        handle.enter();
                                                    }} /> :
                                                    <img src="../../../../../images/video-resume/small-screen.svg" onClick={() => {
                                                        setIsFullScreen((isFullScreen) => !isFullScreen)
                                                        handle.exit();
                                                    }} />}
                                            </div>
                                        </div>
                                    </div> */}
                                    {isReadyToPlay &&
                                        <div className='video-box-controls'>
                                            <div className="primary-controls">
                                                <div className="actions">
                                                    <div onClick={() => moveSeeker(-10)} className='d-flex align-items-center cursor-pointer'>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20px" height="20px" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-white'>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                                                        </svg>
                                                        <span className='ml-1 text-white' style={{ fontSize: "14px" }}>10</span>
                                                    </div>
                                                    <button className='playerPlayPauseBtn' onClick={() => {
                                                        setPlaying(!isPlaying);
                                                        durationRef.current = playerRef.current.getDuration();
                                                    }}>
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
                                                <div className="volume-button">
                                                    <span className='volume-btn-icon'><img src="../../../../../images/video-resume/video-volume.svg"></img></span>
                                                    {/* <input
                                                                type="range"
                                                                min={0}
                                                                max={1}
                                                                step={0.1}
                                                                value={volume}
                                                                className="progressVideo"
                                                                // onClick={handleProgress}
                                                                id="videoId"
                                                                onChange={event => {
                                                                    setVolume(event.target.value)
                                                                    volumRef.current = event.target.value
                                                                }}
                                                            /> */}
                                                    <ReactSlider className="video-slider"
                                                        min={0}
                                                        max={1}
                                                        value={volume}
                                                        step={0.1}
                                                        onChange={value => {
                                                            setVolume(value)
                                                            volumRef.current = value
                                                        }}
                                                        marks
                                                        markClassName="rating-mark"
                                                        thumbClassName="rating-thumb"
                                                        trackClassName="rating-track"
                                                        renderThumb={(props, state) => <div {...props}>{""}</div>}
                                                    />
                                                </div>



                                            </div>
                                            <div className="secondary-controls">
                                                <div className="video-play-range video-slider-wrap">
                                                    {/* <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                // step={10}
                                                value={played * 100}
                                                className="progressVideoSeek"                                                    
                                                id="videoId"
                                                onChange={onSeek}
                                                onMouseDown={onSeekMouseDown}
                                                onMouseUp={onSeekMouseUp}
                                                // onClick={handleSeekClick}
                                            /> */}
                                                    {/* <Box width={300}>
                                                        <Slider
                                                            size="small"
                                                            aria-label="Small"
                                                            min={0}
                                                            max={durationRef.current}
                                                            value={played}
                                                            onChange={onSeek}
                                                        />
                                                    </Box> */}
                                                    <ReactSlider className="video-slider"
                                                        min={0}
                                                        max={durationRef.current || 0}
                                                        onChange={onSeek}
                                                        value={played}
                                                        marks
                                                        markClassName="rating-mark"
                                                        thumbClassName="rating-thumb"
                                                        trackClassName="rating-track"
                                                        renderThumb={(props, state) => <div {...props}>{""}</div>}
                                                    />
                                                </div>
                                                <div className="full-small-screen" >
                                                    {!isFullScreen ? <img src="../../../../../images/video-resume/full-screen.svg"
                                                        onClick={() => {
                                                            setIsFullScreen((isFullScreen) => !isFullScreen);
                                                            handle.enter();
                                                        }} /> :
                                                        <img src="../../../../../images/video-resume/small-screen.svg" onClick={() => {
                                                            setIsFullScreen((isFullScreen) => !isFullScreen)
                                                            handle.exit();
                                                        }} />}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </FullScreen>

                        </>
                    }
                </div>
            </div>
        </VideoModal>
    )
}
export default VideoplayModal;