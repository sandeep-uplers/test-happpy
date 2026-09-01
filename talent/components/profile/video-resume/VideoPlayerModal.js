import React, { useEffect, useRef, useState } from 'react'
import { CloseModalIcon, VideoLeft, VideoRight, VideoPause, PlayVideo, VideoPlayerClose } from '../../../assets/IconSVG'
import Modal from 'react-modal';
import ReactPlayer from 'react-player/file';
import { ArrowLeftRounded, GreenCheck, LinkIcon } from '@/talent/assets/IconSVG';
import { copyLinkToClipboard } from '@/talent/components/Helper';

const VideoPlayerModal = ({ homePage = false, openVideoPlayerModal, url, handleClose, videoData, openFrom = 'talent', data = {}, updateToggleShareApi }) => {

    const playerRef = useRef(null);
    const [isPlaying, setPlaying] = useState(false);
    const [firstTimePlayed, setFirstTimePlayed] = useState(false);
    const [videoCurrentTime, setVideoCurrentTime] = useState(0);

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
    const fetchSharableLink = async () => {
        try {
            copyLinkToClipboard(url);
        } catch (err) {
            console.error(err);
        }
    }
    // const videoTotalTime = recordedVideo?.totalDuration ?? 0;
    // const playedPercentage = videoTotalTime > 0 ? (videoCurrentTime / videoTotalTime) * 100 : 0;



    // RA VR TOGGLE START
    const [isVideoVisible, setIsVideoVisible] = useState(!!data?.share_video_resume)

    const postResumeVideoToggle = async (status) => {
        setIsVideoVisible(status);
        try {
            let payload = {
                "talent_hr_id": data?.enc_id,
                "toogle_name": "share_video_resume",
                "toogle_value": status,
            }
            let res = await updateToggleShareApi(payload)
            if (res?.status == 200) {
                console.log('res')
            }
        } catch (error) {
            console.log('error: ', error);

        }
    }

    // RA VR TOGGLE END

    return (
        <Modal
            isOpen={openVideoPlayerModal}
            portalClassName="react-modal-portal"
            onClose={handleClose}
            onRequestClose={handleClose}
            shouldCloseOnEsc={true}
            className={`commonModal recordVideoSuccessModal videoPlayerModal canVideoModal`}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">

                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose} title='Close'>
                        <VideoPlayerClose />
                    </button>

                    <div className="modal-body">
                        <div className='recordVideoSuccessBox'>
                            <div className='videoSuccessPlayer'>

                                <ReactPlayer
                                    ref={playerRef}
                                    playing={isPlaying}
                                    url={url}
                                    onProgress={({ playedSeconds }) => setVideoCurrentTime(playedSeconds)}
                                    onEnded={() => {
                                        setPlaying(false);
                                        setFirstTimePlayed(false);
                                        playerRef.current.seekTo(0, 'seconds')
                                    }}
                                    width="100%"
                                    height="100%"
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


                                    {/* <div className='videoPlayerTimer'>
                                        <div className='videoPlayerProgress'>
                                            <span style={{ width: `${playedPercentage}%` }}></span>
                                        </div>
                                        <div className='videoPlayerTime'>
                                            {formatTime(videoCurrentTime)}  /  {formatTime(recordedVideo?.totalDuration)}
                                        </div>
                                    </div> */}

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
                        {!homePage &&
                            <div className='videoCEFRScore'>
                                <div className='videoCEFRScoreHead'>
                                    {videoData?.communication_level != null &&
                                        <div className='videoCEFRScoreInfo'>Communication: <strong className={`color-code ${videoData?.communication_level?.toLowerCase()}`}>{videoData?.communication_level}</strong></div>
                                    }

                                    <div className='right'>
                                        {openFrom == 'RA' &&
                                            <div className="visibility-status">
                                                <button
                                                    className={`visibility-${isVideoVisible ? 'on' : 'off'}`}
                                                    onClick={() => postResumeVideoToggle(!isVideoVisible)}>
                                                    {isVideoVisible
                                                        ? <>Visible to the client for this job <GreenCheck /></>
                                                        : <>Not visible to the client for this job <ArrowLeftRounded /></>
                                                    }
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </div>


                                {videoData?.communication_level != null ?
                                    <div className='videoCEFRInfo'>
                                        <h3>What does <strong className={`color-code ${videoData?.communication_level?.toLowerCase()}`}>'{videoData?.communication_level}'</strong> score mean??</h3>
                                        <p>{videoData?.communication_summary}</p>
                                    </div>
                                    :
                                    <div className='videoCEFRInfo'><p>Communication level not available for this candidate</p></div>
                                }

                                <div className="score-scale-container">
                                    <button className='btn' type='button' onClick={() => fetchSharableLink()}><LinkIcon /> Share video</button>

                                    {videoData?.communication_level != null && videoData?.communication_level &&
                                        <ScoreScale score={videoData?.communication_level} />
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default VideoPlayerModal

const ScoreScale = ({ score }) => {

    // SCORE CASES 
    const scoreCases = ['Limited', 'Basic', 'Competent', 'Proficient', 'Fluent', 'Expert'];

    const getIndicatorPosition = (score) => {
        switch (score.toLowerCase()) {
            case 'limited':
                return '14.29%';
            case 'basic':
                return '28.57%';
            case 'competent':
                return '42.86%';
            case 'proficient':
                return '57.14%';
            case 'fluent':
                return '71.43%';
            case 'expert':
                return '85.71%';
            default:
                return '0%';
        }
    };

    const indicatorStyle = {
        left: getIndicatorPosition(score),
    };

    return (
        <div className="score-scale">
            <div className="indicator" style={indicatorStyle}>
                <div className={`big-label color-code ${score.toLowerCase()}`}>{score}</div>
                <div className="triangle"></div>
            </div>

            <div className="scale-bar">
                <div className="level"></div> {/* zero level for left padding */}

                {scoreCases.map(item => (
                    <div key={item} className={`level ${item}`}>
                        {score.toLowerCase() !== item.toLowerCase() && <span>{item}</span>}
                    </div>
                ))}
            </div>

            <div className="indicator bottom" style={indicatorStyle}>
                <div className="triangle"></div>
            </div>
        </div>
    )
}
