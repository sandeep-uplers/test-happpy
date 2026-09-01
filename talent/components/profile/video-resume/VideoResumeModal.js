import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import "react-circular-progressbar/dist/styles.css";
import { CircularProgressbar } from "react-circular-progressbar";
import { useReactMediaRecorder } from "../ReactMediaRecorder";
import { IMAGE_URL } from "../../Constant";
import { WEBRTC_EMBL } from "./webrtc-embl";
export default function VideoResumeModal({
    isOpen,
    setOpen,
    step,
    setVideoStep,
    setPreviewVideo,
    submitVideo,
    setUploadVideoResumeModal,
    videoRecordStep,
    setVideoRecordStep,
    VideoPlayer,
    isUploading,
    uploadProgress,
    previewVideo,
    cancelVideoUpload,
    isSubmit, setIsSubmit
}) {
    const { isStopped, status, blob, startRecording, stopRecording, mediaBlobUrl,
        previewStream, pauseRecording, resumeRecording, clearBlobUrl } = useReactMediaRecorder({ video: true });

    const [videoResumeAt, setVideoResumeAt] = useState("05");
    const [isStop, setIsStop] = useState(false);
    const [time, setTime] = useState("15");
    const [currentBrowser, setCurrentBrowser] = useState('chrome');
    let intervalRef = useRef(null);
    let videoResumeRef = useRef(null);


    useEffect(() => {
        const scriptForVideo = document.createElement("script");
        scriptForVideo.async = true;
        scriptForVideo.type = 'text/javascript';
        scriptForVideo.innerHTML = WEBRTC_EMBL;
        document.body.appendChild(scriptForVideo);
    }, [])
    useEffect(() => {
        if (isStopped) {
            setVideoRecordStep(5);
        }
    }, [isStopped])

    const _tRef = useRef(null);
    _tRef.current = Number(time);
    const countResumeRef = useRef(null);
    countResumeRef.current = Number(videoResumeAt);
    useEffect(() => {
        if (isSubmit && blob) {
            console.log('isSubmit hitted');
            let _file = new File([blob], "videoResume.mp4", { type: "video/mp4", lastModified: Date.now() });
            setPreviewVideo({
                file: _file,
                preview_url: mediaBlobUrl
            });
            submitVideo(_file);
        }
    }, [isSubmit, blob])

    const VideoPreview = ({ stream }) => {
        const videoRef = useRef(null);
        useEffect(() => {
            if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
            }
        }, [stream]);
        if (!stream) {
            return null;
        }

        return <video ref={videoRef} width={500} height={500} autoPlay />;
    };

    const startTimer = useCallback(() => {
        intervalRef.current = setInterval(() => {
            if (_tRef.current > 0) {
                _tRef.current = _tRef.current - 1;
                setTime(_tRef.current.toString().padStart(2, 0));
            } else if (_tRef.current == 0) {
                setVideoRecordStep(3);
                startRecording();
                // resumeRecording();
                stopTimer();
            }
        }, 1000)
    }, []);
    const stopTimer = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }, []);
    // const stopResumeTimer = useCallback(() => {
    //     clearInterval(videoResumeRef.current);
    //     videoResumeRef.current = null;
    // },[]);
    const stopResumeTimer = () => {
        clearInterval(videoResumeRef.current);
        videoResumeRef.current = null;
    }

    useEffect(() => {
        if (navigator.userAgent.match(/firefox|fxios/i)) {
            setCurrentBrowser('firefox');
        }
        else if (navigator.userAgent.match(/Edg/i)) {
            setCurrentBrowser('edge');
        }
        else if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            setCurrentBrowser('safari');
        }

        return () => {
            clearInterval(intervalRef.current);
            clearInterval(videoResumeRef.current);
        };
    }, []);

    const startVideoResumeTimer = () => {
        videoResumeRef.current = setInterval(() => {
            if (countResumeRef.current > 0) {
                countResumeRef.current = countResumeRef.current - 1;
                setVideoResumeAt(countResumeRef.current.toString().padStart(2, 0));
            } else if (countResumeRef.current == 0) {
                resumeRecording();
                setVideoRecordStep(3);
                stopResumeTimer();
            }
        }, 1000)
    }

    // const startVideoResumeTimer = useCallback(() => {
    //     videoResumeRef.current = setInterval(() => {       
    //         if (countResumeRef.current > 0) {
    //             countResumeRef.current =  countResumeRef.current - 1;
    //             setVideoResumeAt(countResumeRef.current.toString().padStart(2,0));
    //         }else if(countResumeRef.current == 0){                
    //             resumeRecording();
    //             setVideoRecordStep(3);
    //             stopResumeTimer();
    //         }                    
    //     },1000)
    // },[]);

    useEffect(() => {
        if (videoRecordStep === 2) {

            navigator.mediaDevices.enumerateDevices()
                .then(async devices => {
                    const hasCamera = devices.some(device => device.kind === 'videoinput');

                    if (hasCamera) {
                        console.log('Camera is available on this device.');

                        // after start recording not  stop because media recorder is not set at stop time 
                        await startRecording(true);
                        if (navigator.userAgent.match(/firefox|fxios/i)) {
                            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                .then(function (stream) {
                                    if (stream.active) {
                                        startTimer();
                                    }
                                    else setVideoRecordStep(12);

                                })
                                .catch((err) => {
                                    console.log(err);
                                    setVideoRecordStep(12);
                                });
                        } else {
                            navigator.permissions.query({ name: 'camera' }).then(function (result) {
                                if (result.state === 'granted') {
                                    //permission has already been granted, no prompt is shown
                                    navigator.permissions.query({ name: 'microphone' }).then(function (result) {
                                        if (result.state === 'granted') {
                                            startTimer();
                                            //permission has already been granted, no prompt is shown
                                        } else if (result.state === 'prompt') {
                                            //there's no peristent permission registered, will be showing the prompt
                                        } else if (result.state === 'denied') {
                                            //permission has been denied
                                            setVideoRecordStep(12);
                                        }
                                    })
                                } else if (result.state === 'prompt') {
                                    //there's no peristent permission registered, will be showing the prompt
                                } else if (result.state === 'denied') {
                                    //permission has been denied
                                    setVideoRecordStep(12);
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                        }
                    } else {
                        console.log('Camera is not available on this device.');
                        setVideoRecordStep('NO_CAMERA_FOUND');
                    }
                })
                .catch(error => {
                    console.error('Error checking for camera:', error);
                    setVideoRecordStep('NO_CAMERA_FOUND');
                });



        }
        if (videoRecordStep === 7) {
            startVideoResumeTimer();
            // setVideoRecordStep(3);        
            // resumeRecording();
        }
    }, [videoRecordStep])

    const resetAll = () => {
        setOpen(false);
        setVideoStep(1)
        setVideoRecordStep(1);
        stopTimer();
        setTime("15");
        setIsStop(false);
        setVideoResumeAt("05");
        stopRecording();
        clearBlobUrl();
        _tRef.current = null;
        stopResumeTimer();
        setIsSubmit(false);
        setPreviewVideo({
            file: "",
            preview_url: ""
        });
    }

    const handleCanRecord = () => {
        if (!window.MSStream && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent === 'MacIntel' && navigator.maxTouchPoints > 1))) {
            setVideoStep(91);
            return
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setVideoStep(3);
            setTime("15");
            setPreviewVideo({
                file: "",
                preview_url: ""
            });
            setIsSubmit(false);
        } else {
            setVideoStep(9);
        }
    }

    const current_url = new URLSearchParams(window.location.search)
    let _tId = current_url.get("tid")
    return (
        <>
            {/* 1st and 2nd screen */}
            <Modal
                isOpen={isOpen}
                onCancel={() => setOpen(false)}
                onRequestClose={() => setOpen(false)}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal video-modal-main commonModal access-video fade ${isOpen && "show"}`}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <button
                            type="button"
                            className="modalCloseBtn"
                            aria-label="Close"
                            onClick={resetAll}
                        >
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 32 32"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M24 8L8 24"
                                    stroke="#6B6B6B"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M8 8L24 24"
                                    stroke="#6B6B6B"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                        <div
                            className="uploadVideoResumeBody modal-body access-video-inner"

                        >
                            {step === 1 && (
                                <>
                                    <div className="row">
                                        <div className="col-12 col-md-6">
                                            <h6 className="text-left">
                                                A video resume is a short video
                                                of you introducing yourself to
                                                the world
                                            </h6>
                                        </div>
                                        <div className="col-0 col-md-6"></div>
                                    </div>

                                    <div className="row ">
                                        <div className="col-12 col-sm-6 mt-3">
                                            <img
                                                style={{
                                                    borderRadius: "0.5rem",
                                                }}
                                                src="/images/video-resume/popup1.jpeg"
                                            />
                                        </div>

                                        <div className="col-12 col-md-6 text-left mt-3">
                                            <p style={{ fontWeight: "500" }}>
                                                Add a personal touch and set a
                                                lasting impression through a
                                                short video about yourself
                                            </p>
                                            <p style={{ fontSize: "14px" }}>
                                                A video resume allows you to
                                                speak directly to your potential
                                                employer about what makes you
                                                uniquely qualified for the role
                                            </p>
                                            <p style={{ fontSize: "14px" }}>
                                                Demonstrate your personality &
                                                soft skills that employers may
                                                not otherwise get from other
                                                element of your profile
                                            </p>
                                            <p className="exploreVideoResumeBtnHelp">
                                                We have prepared a small list of
                                                4 points to keep in mind while
                                                creating your video resume
                                            </p>
                                            <button
                                                className="primaryBtn"
                                                onClick={() => {
                                                    setVideoStep(2);
                                                }}
                                            >
                                                NEXT
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                            {step === 2 && (
                                <div className="row">
                                    <div className="col-12 col-sm-5 col-lg-6 text-left step2HeadImage">
                                        <div className="position-relative">
                                            <img
                                                style={{
                                                    borderRadius: "0.5rem",
                                                }}
                                                src="/images/video-resume/popup2.jpeg"
                                            />
                                            <div
                                                onClick={() =>
                                                    setVideoStep(1)
                                                }
                                                className="exploreVideoResumeBackArrow"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="32"
                                                    height="32"
                                                    fill="#FFFFFF"
                                                    className="bi bi-arrow-left-short"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <p
                                            style={{
                                                fontSize: "16px",
                                                fontWeight: "500",
                                            }}
                                        >
                                            Connect with employers beyond just
                                            your professional CV
                                        </p>
                                    </div>
                                    <div className="vr"></div>
                                    <div className="col-12 col-sm-7 col-lg-6 text-left">
                                        <p className="exploreVideoResumeInstructionTitle">
                                            Important points to cover in your
                                            video resume
                                        </p>
                                        <div className="mt-4 exploreVideoResumeInstructions">
                                            <div>
                                                <p className="title bolder">
                                                    1. Skillset
                                                </p>
                                                <p>
                                                    Tell us about your top
                                                    skills, how you've used them
                                                    in the past and your work
                                                    expectations
                                                </p>
                                            </div>
                                            <div>
                                                <p className="title bolder">
                                                    2. Past Experiences
                                                </p>
                                                <p>
                                                    Tell us about a project or
                                                    work experience that best
                                                    exemplifies your skills and
                                                    experience. What was the
                                                    result of your work?
                                                </p>
                                            </div>
                                            <div>
                                                <p className="title bolder">
                                                    3. Success Story
                                                </p>
                                                <p>
                                                    What was the challenge you
                                                    had to overcome recently
                                                </p>
                                            </div>
                                            <div>
                                                <p className="title bolder">
                                                    4. Your Journey
                                                </p>
                                                <p>
                                                    A brief about your
                                                    professional journey and how
                                                    you got to where you are now
                                                </p>
                                            </div>
                                        </div>

                                        {(!window?.MSStream && (/iPad|iPhone|iPod/.test(navigator?.userAgent) || (navigator?.userAgent === 'MacIntel' && navigator?.maxTouchPoints > 1))) ?
                                            <>
                                                <p
                                                    className="mt-5 exploreVideoResumeBtnHelp"
                                                    style={{ marginBottom: "5px" }}
                                                >
                                                    {!_tId ? "You can either upload or record it here" : "You can  upload  it here"}
                                                    <span className="ios-unavailable-text">&nbsp;(Recording is currently unavailable for IOS)</span>
                                                </p>
                                                <div className="exploreVideoResumeAction">
                                                    {!_tId && <button
                                                        className="underlinedBtn"
                                                        onClick={handleCanRecord}
                                                    >
                                                        RECORD NOW
                                                    </button>}
                                                    <button
                                                        className={"primaryBtn"}
                                                        onClick={() => {
                                                            setUploadVideoResumeModal(true);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        Upload VIDEO
                                                    </button>
                                                </div>
                                            </> :
                                            <>
                                                <p
                                                    className="mt-5 exploreVideoResumeBtnHelp"
                                                    style={{ marginBottom: "5px" }}
                                                >
                                                    {!_tId ? "You can either upload or record it here" : "You can  upload  it here"}
                                                </p>
                                                <div className="exploreVideoResumeAction">
                                                    {!_tId && <button
                                                        className="primaryBtn"
                                                        onClick={handleCanRecord}
                                                    >
                                                        RECORD NOW
                                                    </button>}
                                                    <button
                                                        className={"underlinedBtn"}
                                                        onClick={() => {
                                                            setUploadVideoResumeModal(true);
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        Upload VIDEO
                                                    </button>
                                                </div>
                                            </>
                                        }
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                <div>
                                    {
                                        videoRecordStep === 1 &&
                                        <>
                                            <div className="press-record-now-img-box" style={{ backgroundImage: "url('../../../../../images/video-resume/popup1.jpeg')" }}>
                                                <div className="record-back-btn-wrap">
                                                    <a onClick={() => {
                                                        setVideoStep(2);
                                                        setVideoRecordStep(1);
                                                    }
                                                    } className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                </div>

                                                <div className="press-record-now-text first">
                                                    <h3>Press ‘RECORD NOW’ below to get started</h3>
                                                    <div className="record-now-btn">
                                                        <button onClick={() => {
                                                            // setTime("15");
                                                            // setVideoRecordStep(2);                                                    
                                                            // setIsStop(false);
                                                            setVideoRecordStep(11)
                                                        }}><span className="now-btn-text">RECORD NOW</span> <span className="record-icon-btn"><img src="../../../../../images/video-resume/record-icon.png" /></span></button>
                                                        <span className="limit-text">5 minute limit</span>
                                                    </div>
                                                    <p>Make sure your web cam is on and that your microphone is all ready to record
                                                        You can pause in-between while recording yourself
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    }

                                    {videoRecordStep === 11 &&
                                        <div className=" access-video-inner-content">
                                            <div className="record-back-btn-wrap">
                                                <a onClick={() => {
                                                    // setVideoStep(2);              
                                                    // setVideoRecordStep(1);
                                                    setVideoRecordStep(1)
                                                }
                                                } className="record-back-btn" style={{ backgroundColor: "#F5F5F5" }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                            </div>
                                            <div className="access-content-title" >
                                                <div className="video-icon"><img src="../../../../../images/video-resume/permission.svg" /></div>
                                                <h4>
                                                    To record your video resume we would need permission to access your microphone and camera
                                                </h4>
                                            </div>
                                            <div className="access-content-list">
                                                <div className="access-point">
                                                    <div className="access-img">
                                                        <img src="../../../../../images/video-resume/camera.svg" />
                                                    </div>
                                                    <div className="access-point-title">
                                                        <div className="access-title">Enable access to camera</div>
                                                        <div className="access-pera">Please provide us access to your device’s camera in order to record your video resume here</div>
                                                    </div>
                                                </div>
                                                <div className="access-point">
                                                    <div className="access-img">
                                                        <img src="../../../../../images/video-resume/microphone.svg" />
                                                    </div>
                                                    <div className="access-point-title">
                                                        <div className="access-title">Enable access to microphone</div>
                                                        <div className="access-pera">Please provide us access to your device’s microphone in order to record audio for your video resume here</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="video-btn-group">
                                                <button className="primaryBtn" onClick={() => {
                                                    setTime("15");
                                                    setVideoRecordStep(2);
                                                    setIsStop(false);
                                                    // startTimer();
                                                }}>Give access and start recording</button>
                                                {/* <button className="deny-btn" onClick={() => setVideoRecordStep(12)} >DENY ACCESS</button> */}
                                                <button className="deny-btn" onClick={() => { setUploadVideoResumeModal(true); setOpen(false); }}>TRY UPLOADING INSTEAD</button>
                                            </div>
                                        </div>
                                    }

                                    {videoRecordStep === 12 &&
                                        <div className=" access-video-inner-content recording-steps">
                                            <div className="record-back-btn-wrap">
                                                <a onClick={() => {
                                                    setVideoRecordStep(11);
                                                }
                                                } className="record-back-btn" style={{ backgroundColor: "#F5F5F5" }}><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                            </div>
                                            <div className="access-content-title" >
                                                <div className="video-icon"><img src="../../../../../images/video-resume/permission.svg" /></div>
                                                <div className="steps-title">
                                                    <h4>Looks like you had denied the access to the settings below which are required for you to record your video resume with us</h4>
                                                    <div className="access-content-list">
                                                        <div className="access-point">
                                                            <div className="access-img">
                                                                <img src="../../../../../images/video-resume/camera.svg" />
                                                            </div>
                                                            <div className="access-point-title">
                                                                <div className="access-title">Enable access to camera</div>
                                                            </div>
                                                        </div>
                                                        <div className="access-point">
                                                            <div className="access-img">
                                                                <img src="../../../../../images/video-resume/microphone.svg" />
                                                            </div>
                                                            <div className="access-point-title">
                                                                <div className="access-title">Enable access to microphone</div>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="recording-steps-list">
                                                <div className="steps-list-title">Follow the steps below to turn on the access for the above mentioned features to continue recording</div>
                                                <ul>
                                                    {currentBrowser == 'firefox' && <FirefoxPermission />}
                                                    {currentBrowser == 'chrome' && <ChromePermissions />}
                                                    {currentBrowser == 'edge' && <EdgePermission />}
                                                    {currentBrowser == 'safari' && <SafariPermission />}
                                                    <li>
                                                        <h6>Once these changes have been made, go back and try again.</h6>
                                                    </li>
                                                    <li>
                                                        <div className="video-btn-group">
                                                            <button className="primaryBtn" onClick={() => setVideoRecordStep(1)}>try recording again</button>
                                                            <button className="deny-btn" onClick={() => {
                                                                setUploadVideoResumeModal(true); setOpen(false);
                                                            }} >TRY UPLOADING INSTEAD</button>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>

                                        </div>
                                    }
                                    {videoRecordStep == "NO_CAMERA_FOUND" &&
                                        <div className=" access-video-inner-content recording-steps">
                                            <div className="d-flex flex-column" >
                                                <div className="steps-title d-flex align-items-center">
                                                    <div className="video-icon"><img src="../../../../../images/video-resume/permission.svg" /></div>
                                                    &nbsp;&nbsp;&nbsp;
                                                    <h6>Camera not detected</h6>
                                                </div>
                                                <div className="steps-title mt-3 ">
                                                    <span >Please plug in your camera and &nbsp;</span>
                                                    <button className="underlinedBtn" onClick={() => setVideoRecordStep(1)}>try recording again</button>
                                                </div>


                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 2 &&
                                        <div>
                                            <div className="press-record-now-img-box second" style={{ backgroundImage: "url('../../../../../images/video-resume/popup1.jpeg')" }}>
                                                <div className="record-back-btn-wrap">
                                                    <a onClick={() => {
                                                        stopTimer();
                                                        setTime("15");
                                                        setVideoRecordStep(1);
                                                        setIsStop(false);
                                                    }} className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                    {!isStop && <a className="record-back-btn" onClick={() => { stopTimer(); setIsStop(prev => !prev) }}>
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12.668 15.6668V4.3335H14.0013V15.6668H12.668Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M6 15.6668V4.3335H7.33333V15.6668H6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                        </svg>
                                                    </a>}
                                                </div>
                                                <div className={isStop ? "press-record-now-text second isstop-blur" : "press-record-now-text second"}>
                                                    <div style={{ width: 152, height: 152 }}>
                                                        <CircularProgressbar
                                                            value={time}
                                                            text={`0:${time}`}
                                                            maxValue={15}
                                                        />
                                                    </div>
                                                    {/* <span className="recording-second-text">Recording {isStop ? "stop at" : "starts in"} <b>{time} seconds</b></span> */}
                                                    {isStop ?
                                                        <>
                                                            <span className="recording-second-text">Countdown paused</span>
                                                            <span style={{ cursor: "pointer" }} className="recording-second-text" onClick={() => { startTimer(); setIsStop(prev => !prev) }}><b className="vid-resume-btn">Resume</b></span>
                                                        </>
                                                        : <span className="recording-second-text"> Recording starts in <b>{time} seconds</b></span>}
                                                </div>
                                            </div>
                                        </div>


                                    }

                                    {videoRecordStep === 3 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec">
                                                <div className="press-record-now-text third">
                                                    <VideoPreview stream={previewStream} />
                                                    <div className="video-btn-wrap">
                                                        <a onClick={() => {
                                                            pauseRecording();
                                                            setVideoRecordStep(4);
                                                        }} className="record-back-btn" title="Stop Recording">
                                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M1.39844 10.5999V1.3999H10.5984V10.5999H1.39844Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </a>
                                                        <a onClick={() => {
                                                            pauseRecording();
                                                            setVideoRecordStep(9);
                                                        }} className="record-back-btn" title="Pause">
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M12.668 15.6668V4.3335H14.0013V15.6668H12.668Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                                <path d="M6 15.6668V4.3335H7.33333V15.6668H6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                            </svg>
                                                        </a>
                                                        <button onClick={() => {
                                                            stopRecording();
                                                            setVideoRecordStep(5);
                                                        }} className="primaryBtn">Complete recording</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 4 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec forth"
                                            // style={{backgroundImage:"url('../../../../../images/video-resume/popup1.jpeg')"}}
                                            >
                                                <div className="press-record-now-text forth">
                                                    <VideoPreview stream={previewStream} />
                                                    <div className="video-btn-wrap forth">
                                                        <h3>Are you sure you want to stop recording?</h3>
                                                        <div className="record-now-btn">
                                                            <button onClick={() => {
                                                                setVideoRecordStep(7);
                                                                setVideoResumeAt("05");
                                                            }}>resume recording </button>
                                                            <span className="discard-text" style={{ cursor: "pointer" }} onClick={() => {
                                                                pauseRecording();
                                                                setVideoRecordStep(6);
                                                            }}>DISCARD VIDEO</span>
                                                        </div>
                                                        {!isUploading &&
                                                            <button className="primaryBtn" onClick={() => {
                                                                stopRecording();
                                                                // setVideoRecordStep(8);
                                                                setIsSubmit(true);
                                                            }}>Submit video</button>
                                                        }
                                                    </div>
                                                </div>

                                                <div className="record-back-btn-wrap">
                                                    <a onClick={() => {
                                                        setVideoRecordStep(3);
                                                        resumeRecording();
                                                    }
                                                    } className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                </div>


                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 5 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec"
                                            // style={{backgroundImage:"url('../../../../../images/video-resume/popup1.jpeg')"}}
                                            >
                                                {/* <div className="record-back-btn-wrap">
                                                <a onClick={() => setVideoRecordStep(9)} className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                            </div> */}

                                                <div className="press-record-now-text five">

                                                    {mediaBlobUrl ?
                                                        <VideoPlayer isPreviewStop url={mediaBlobUrl} />
                                                        :
                                                        <VideoPreview stream={previewStream} />
                                                    }
                                                    {!isUploading &&
                                                        <div className="record-now-btn">

                                                            <button className="primaryBtn" onClick={() => {
                                                                stopRecording();
                                                                setIsSubmit(true);
                                                                //  setVideoRecordStep(8);
                                                            }}>Submit video resume</button>
                                                            <a style={{ cursor: "pointer" }} onClick={() => {
                                                                stopRecording();
                                                                let _file = new File([blob], "videoResume.mp4", { type: "video/mp4", lastModified: Date.now() });
                                                                setPreviewVideo({
                                                                    file: _file,
                                                                    preview_url: mediaBlobUrl
                                                                });
                                                                setVideoRecordStep(100);
                                                            }}>preview recording</a>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 51 &&
                                        <div>
                                            {/* Add text if your timer 5 mins are consumed and show this one*/}
                                            <div className="press-record-now-img-box recorded-video-sec">
                                                <div className="press-record-now-text five">
                                                    {mediaBlobUrl ?
                                                        <VideoPlayer isPreviewStop url={mediaBlobUrl} />
                                                        :
                                                        <VideoPreview stream={previewStream} />
                                                    }
                                                    {!isUploading &&
                                                        <div className="record-now-btn">

                                                            <button className="primaryBtn" onClick={() => {
                                                                stopRecording();
                                                                setIsSubmit(true);
                                                                //  setVideoRecordStep(8);
                                                            }}>Submit video resume</button>
                                                            <a style={{ cursor: "pointer" }} onClick={() => {
                                                                stopRecording();
                                                                let _file = new File([blob], "videoResume.mp4", { type: "video/mp4", lastModified: Date.now() });
                                                                setPreviewVideo({
                                                                    file: _file,
                                                                    preview_url: mediaBlobUrl
                                                                });
                                                                setVideoRecordStep(100);
                                                            }}>preview recording</a>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 6 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec"
                                            // style={{backgroundImage:"url('../../../../../images/video-resume/popup1.jpeg')"}}
                                            >
                                                <div className="press-record-now-text forth">
                                                    <VideoPreview stream={previewStream} />
                                                    <div className="video-btn-wrap forth">
                                                        <h3>Are you sure you want to discard your recording?</h3>
                                                        <div className="record-now-btn">
                                                            <button onClick={() => {
                                                                // setViewVideoResumeModal(true);
                                                                // setOpen(false);
                                                                stopRecording();
                                                                // pauseRecording();                                                                  
                                                                let _file = new File([blob], "videoResume.mp4", { type: "video/mp4", lastModified: Date.now() });
                                                                setPreviewVideo({
                                                                    file: _file,
                                                                    preview_url: mediaBlobUrl
                                                                });
                                                                setVideoRecordStep(10);
                                                            }}>Preview </button>
                                                            <button onClick={() => {
                                                                setVideoRecordStep(7);
                                                                setVideoResumeAt("05");
                                                            }}>resume recording </button>
                                                            <span style={{ cursor: "pointer" }} className="discard-text" onClick={() => {
                                                                stopRecording();
                                                                clearBlobUrl();
                                                                setVideoRecordStep(1);
                                                            }}>DISCARD VIDEO</span>
                                                        </div>
                                                        <button className="primaryBtn" onClick={() => setVideoRecordStep(5)}>Submit video</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 7 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec">
                                                {/* <div className="record-back-btn-wrap">
                                                <a className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                <a  className="record-back-btn">
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12.668 15.6668V4.3335H14.0013V15.6668H12.668Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                        <path d="M6 15.6668V4.3335H7.33333V15.6668H6Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                    </svg>
                                                </a>
                                            </div> */}
                                                <div className="press-record-now-text second">
                                                    <VideoPreview stream={previewStream} />
                                                    {/* <video ref={{current:previewStream}} width={500} height={500} autoPlay /> */}

                                                    <div className="record-resume-group">
                                                        <div style={{ width: 152, height: 152 }}>
                                                            <CircularProgressbar
                                                                value={videoResumeAt}
                                                                text={`0:${videoResumeAt}`}
                                                                maxValue={5}
                                                            />
                                                        </div>
                                                        <span className="recording-second-text">Recording resumes in <b>{videoResumeAt} seconds</b></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 9 &&
                                        <div>
                                            <div className="press-record-now-img-box recorded-video-sec"
                                            // style={{backgroundImage:"url('../../../../../images/video-resume/popup1.jpeg')"}}
                                            >

                                                <div className="press-record-now-text five">
                                                    <VideoPreview stream={previewStream} />
                                                    <div className="video-btn-group">
                                                        <button className="primaryBtn" onClick={() => {
                                                            setVideoRecordStep(7);
                                                            setVideoResumeAt("05");
                                                        }}>Resume recording</button>
                                                        {/* <a onClick={() => {
                                                    // stopRecording();
                                                    pauseRecording();                                                                  
                                                    let _file = new File([blob], "videoResume.mp4", {type: "video/mp4", lastModified: Date.now()});                                            
                                                    setPreviewVideo({
                                                        file: _file,
                                                        preview_url: mediaBlobUrl
                                                    });                                                        
                                                    setVideoRecordStep(10);
                                                }} style={{cursor:"pointer"}} >REVIEW RECORDING</a> */}
                                                        <a onClick={() => {
                                                            pauseRecording();
                                                            setVideoRecordStep(6)
                                                        }} style={{ cursor: "pointer" }}>DISCARD VIDEO</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {/* {videoRecordStep === 10 && 
                                       <div className="mt-2 uploadVideoResumeBody modal-body upload-video-custom-mod">
                                       <VideoPlayer url={mediaBlobUrl}   />
                                       <div className='mt-4 row text-left'>
                                           <div className='col'>
                                               <h6>A video resume is a short video for you to introduce yourself to the world</h6>
                                           </div>
                                           <div className='col text-right'>
                                               <button className='primaryBtn uploadVideoResumeBtn'   onClick={ () => {
                                                stopRecording();
                                                setIsSubmit(true)}
                                            }                                           
                                                >submit video</button>
                                                <button style={{background:"none",fontWeight:"bold",border:"none"}} onClick={() =>setVideoRecordStep(6)}                                              
                                                >Back</button>
                                           </div>
                                       </div>
                                   </div>
                                    } */}
                                    {videoRecordStep === 100 &&
                                        <div>
                                            <div className="press-record-now-img-box video-cus-record-box"
                                            // style={{ backgroundImage: "url('../../../../../images/video-resume/popup1.jpeg')" }}
                                            >
                                                <div className="record-back-btn-wrap">
                                                    <a onClick={() => {
                                                        // setVideoStep(2);
                                                        // setVideoRecordStep(1);
                                                        setVideoRecordStep(5);
                                                    }
                                                    } className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                </div>

                                                <VideoPlayer url={mediaBlobUrl} />

                                                {/* <div className="press-record-now-text first">                                            
                                            {<p>Your video resume has been viewed: 10 times </p> }
                                            
                                            { <div className="record-now-btn">
                                                <button onClick={() => {
                                              
                                                }}><span className="now-btn-text">Play</span> <span className="record-icon-btn"><img src="../../../../../images/video-resume/record-icon.png"/></span></button>
                                            </div> }
                                            
                                        </div>*/}
                                            </div>

                                            <div className="video-up-bottom-text">
                                                <h4>A video resume is a short video for you to introduce yourself to the world</h4>
                                                <div className="vd-btn-wrape">
                                                    <button className='primaryBtn uploadVideoResumeBtn' onClick={() => {
                                                        stopRecording();
                                                        setIsSubmit(true)
                                                    }}>
                                                        submit video
                                                    </button>
                                                    <button style={{ background: "none", fontWeight: "bold", border: "none" }} onClick={() => setVideoRecordStep(5)}>
                                                        Back
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {videoRecordStep === 10 &&
                                        <div>
                                            <div className="press-record-now-img-box video-cus-record-box" style={{ backgroundImage: "url('../../../../../images/video-resume/popup1.jpeg')" }}>
                                                <div className="record-back-btn-wrap">
                                                    <a onClick={() => {
                                                        // setVideoStep(2);
                                                        // setVideoRecordStep(1);
                                                        setVideoRecordStep(6);
                                                    }
                                                    } className="record-back-btn"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16"><path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"></path></svg></a>
                                                </div>

                                                <VideoPlayer url={mediaBlobUrl} />

                                                {/* <div className="press-record-now-text first">                                            
                                            {<p>Your video resume has been viewed: 10 times </p> }
                                            
                                            { <div className="record-now-btn">
                                                <button onClick={() => {
                                              
                                                }}><span className="now-btn-text">Play</span> <span className="record-icon-btn"><img src="../../../../../images/video-resume/record-icon.png"/></span></button>
                                            </div> }
                                            
                                        </div>*/}
                                            </div>

                                            <div className="video-up-bottom-text">
                                                <h4>A video resume is a short video for you to introduce yourself to the world</h4>
                                                <div className="vd-btn-wrape">
                                                    <button className='primaryBtn uploadVideoResumeBtn' onClick={() => {
                                                        stopRecording();
                                                        setIsSubmit(true)
                                                    }}>
                                                        submit video
                                                    </button>
                                                    <button style={{ background: "none", fontWeight: "bold", border: "none" }} onClick={() => setVideoRecordStep(6)}>
                                                        Back
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {/* {videoRecordStep !== 8 &&<div className="col-12 text-left"> */}
                                    {isUploading && (
                                        <div >
                                            <div className='mt-4 videoResumeUploadProgress'>
                                                <div style={{ width: '100%' }}>
                                                    <p className='videoResumeUploadProgressTitle'>Uploading - {previewVideo.file?.name}</p>
                                                    <p className='videoResumeUploadProgressPercent'>{uploadProgress.progress_percent}%</p>
                                                    <div className="progress" role="progressbar" aria-valuenow={uploadProgress.progress_percent} aria-valuemin="0" aria-valuemax="100" style={{ height: "5px", width: "calc(100% - 40px)" }}>
                                                        <div className="progress-bar" style={{ width: `${uploadProgress.progress_percent}%`, backgroundColor: "rgb(129, 197, 87)" }}></div>
                                                    </div>
                                                </div>
                                                <div onClick={() => cancelVideoUpload()} className='videoResumeUploadProgressCancel'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {videoRecordStep !== 10 && videoRecordStep !== 11 && videoRecordStep !== 12 && !isUploading && <div className="text-left">
                                        <p className="exploreVideoResumeInstructionTitle">
                                            Important points to cover in your
                                            video resume
                                        </p>
                                        <div className="mt-4 exploreVideoResumeInstructions">
                                            <div>
                                                <p>
                                                    Tell us about your top
                                                    skills, how you've used them
                                                    in the past and your work
                                                    expectations
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    Tell us about a project or
                                                    work experience that best
                                                    exemplifies your skills and
                                                    experience. What was the
                                                    result of your work?
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    What was the challenge you
                                                    had to overcome recently
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    A brief about your
                                                    professional journey and how
                                                    you got to where you are now
                                                </p>
                                            </div>
                                        </div>
                                    </div>}

                                </div>
                            )}
                            {step == 9 &&
                                <div className="mt-4 previewVideoError p-0 modal-body">
                                    <div className='videoErrorPlayer'>
                                        <div className="imgDiv">
                                            <img src={IMAGE_URL + 'unforseenError.svg'} alt='error-emoji' />
                                        </div>
                                        <h5>Unable to record your video</h5>
                                        <h6>Looks like your browser doesn't support video recording</h6>
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
                                            <button className='btn backBtn' onClick={() => { setUploadVideoResumeModal(true); setOpen(false); }}>TRY UPLOADING INSTEAD</button>
                                            <button className='btn' onClick={() => resetAll()}>Got it</button>
                                        </div>
                                    </div>
                                </div>
                            }
                            {step == 91 &&
                                <div className="mt-4 previewVideoError p-0 modal-body">
                                    <div className='videoErrorPlayer ios'>
                                        <div className="imgDiv">
                                            <img src={IMAGE_URL + 'videoBroke.svg'} alt='error-emoji' />
                                        </div>
                                        <h5>Recording feature currently not supported for IOS</h5>
                                        <p>Due to technical issues, we are not able to support live recording for IOS users currently.
                                            Our experts are already working on bringing you this feature soon.</p>
                                        <h6>Till then you can upload video from your device or use any other operating system to record instead</h6>
                                        <div className='action'>
                                            <button className='btn backBtn' onClick={() => resetAll()}>GO BACK tO PROFILE</button>
                                            <button className='btn' onClick={() => { setUploadVideoResumeModal(true); setOpen(false); }}>Upload video</button>
                                        </div>
                                    </div>
                                </div>
                            }

                            {/* {step === 3 && 
                                videoRecordStep === 8 && 
                                        <div className="col-12"> 
                                        {
                                        play ? 
                                        // <div>
                                        //  <video src={mediaBlobUrl} controls autoPlay loop />
                                         <div className="uploadVideoResumeBody modal-body">
                                            <VideoPlayer url={mediaBlobUrl} />
                                         </div>
                                        :
                                        <div className="press-record-now-img-box" style={{backgroundImage:"url('../../../../../images/video-resume/popup1.jpeg')"}}>
                                                                                     
                                            <div className="press-record-now-text first">
                                            <p>Your video resume has been viewed: n times
                                                </p>
                                                <div className="record-now-btn">
                                                    <button><span className="now-btn-text" onClick={() => setPlay(true)}>Play</span> <span className="record-icon-btn"><img src="../../../../../images/video-resume/record-icon.png"/></span></button>
                                                </div>                                               
                                            </div>
                                        </div>  
                                        }
                                    </div>
                            } */}
                            {/* {step === 3 && (
                                <div className="row">
                                    <div className="modal-content">
                                        <div className="uploadVideoResumeHeader d-flex align-items-start border-bottom">
                                            <div className="position-relative">
                                                <img
                                                    style={{
                                                        borderRadius: "0.5rem",
                                                    }}
                                                    src="/images/video-resume/popup3.jpeg"
                                                />
                                                <div
                                                    className="position-absolute"
                                                    style={{
                                                        background:
                                                            "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 0%, rgba(22,22,22,0.9220063025210083) 100%)",
                                                        width: "100%",
                                                        height: "100%",
                                                        top: "0",
                                                        borderRadius: "0.5rem",
                                                    }}
                                                ></div>
                                                <div
                                                    onClick={() => {
                                                        setRecordVideoResumeModal(
                                                            false
                                                        );
                                                        setExploreVideoResumeModal(
                                                            true
                                                        );
                                                        setExploreStep(2);
                                                    }}
                                                    className="exploreVideoResumeBackArrow"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="32"
                                                        height="32"
                                                        fill="#FFFFFF"
                                                        className="bi bi-arrow-left-short"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div
                                                    className="position-absolute"
                                                    style={{ top: "50px" }}
                                                >
                                                    <h6 className="text-white">
                                                        Press 'record now' below
                                                        to get started
                                                    </h6>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="uploadVideoResumeBody modal-body"></div>
                                    </div>

                                    <div className="col-12 text-left">
                                        <p className="exploreVideoResumeInstructionTitle">
                                            Important points to cover in your
                                            video resume
                                        </p>
                                        <div className="mt-4 exploreVideoResumeInstructions">
                                            <div>
                                                <p>
                                                    Tell us about your top
                                                    skills, how you've used them
                                                    in the past and your work
                                                    expectations
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    Tell us about a project or
                                                    work experience that best
                                                    exemplifies your skills and
                                                    experience. What was the
                                                    result of your work?
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    What was the challenge you
                                                    had to overcome recently
                                                </p>
                                            </div>
                                            <div>
                                                <p>
                                                    A brief about your
                                                    professional journey and how
                                                    you got to where you are now
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}


const ChromePermissions = () => (
    <>
        <li>
            <div className="list-number">1</div>
            <h5>On the top right corner, beside your URL field click on the menu option   ‘
                <div className="dots"><span className="first-dots"> </span><span className="second-dots"></span><span className="third-dots"></span></div>
                ‘  or  ‘
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-menu-2" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                </svg>
                ‘   as shown below</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/access-one.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">2</div>
            <h5>Select the <strong>‘settings’</strong> option </h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/access-two.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">3</div>
            <h5>Select <strong>‘Privacy and security’</strong> in your browser’s <strong>‘Settings’</strong> page </h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/access-three.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">4</div>
            <h5>Then select the option <strong>‘Site settings’</strong></h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/access-four.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">5</div>
            <h5>Select <strong>‘Camera’</strong> or <strong>‘Microphone’</strong> under the permissions section.</h5>
            <div className="steps-list-img">
                <img className="two-img" src="../../../../../images/video-resume/access-five.svg" />
                <img className="two-img" src="../../../../../images/video-resume/access-five-01.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">6</div>
            <h5>Select the option with Uplers.com URL</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/access-six.svg" />
            </div>
        </li>
        <li>
            <div className="list-number">7</div>
            <h5>For both <strong>‘Camera’</strong> and <strong>‘Microphone’</strong>, change the option to <strong>‘Allow’</strong>. </h5>
            <div className="steps-list-img ">
                <img className="two-img" src="../../../../../images/video-resume/access-seven.svg" />
                <img className="two-img" src="../../../../../images/video-resume/access-seven-01.svg" />
            </div>
        </li>
    </>
)

const FirefoxPermission = () => (
    <>
        <li>
            <div className="list-number">1</div>
            <h5>Click the menu button ‘
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-menu-2" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="black" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 6l16 0" />
                    <path d="M4 12l16 0" />
                    <path d="M4 18l16 0" />
                </svg>‘</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/firefox-step1.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">2</div>
            <h5>Select the <strong>‘Settings’</strong> option</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/firefox-step2.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">3</div>
            <h5>Select <strong>‘Privacy and security’</strong> from the left menu</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/firefox-step3.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">4</div>
            <h5>Scroll down to the <strong>‘Permissions’</strong> section</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/firefox-step4.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">5</div>
            <h5>Click the <strong>‘Setting’</strong> button for the <strong>‘Camera’</strong> and <strong>‘Microphone’</strong> option</h5>
            <div className="steps-list-img">
                <img className="two-img" src="../../../../../images/video-resume/firefox-step51.svg" />
                <img className="two-img" src="../../../../../images/video-resume/firefox-step52.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">6</div>
            <h5>Firefox displays the websites with saved Allow or Block permission.</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/firefox-step6.svg" />
            </div>
        </li>
        <li>
            <div className="list-number">7</div>
            <h5>Click the <strong>‘Save Changes’</strong> button.</h5>
            <div className="steps-list-img ">
                <img className="two-img" src="../../../../../images/video-resume/firefox-step71.svg" />
                <img className="two-img" src="../../../../../images/video-resume/firefox-step72.svg" />
            </div>
        </li>
    </>
)


const EdgePermission = () => (
    <>
        <li>
            <div className="list-number">1</div>
            <h5>Click the Lock icon next to the website link in the address bar ‘
                <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-lock" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="#000" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z"></path>
                    <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
                    <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
                </svg>
                ‘</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/edge-step1.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">2</div>
            <h5>Click the <strong>‘Permissions for this site’</strong> option</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/edge-step2.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">3</div>
            <h5>Use the drop-down menus to <strong>‘Allow’</strong> permissions for <strong>‘Camera’</strong> and <strong>‘Microphone’</strong></h5>
            <div className="steps-list-img mb-3">
                <img src="../../../../../images/video-resume/edge-step31.svg" />
            </div>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/edge-step32.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">4</div>
            <h5>(Optional) Click the <strong>‘Reset permissions’</strong> option.</h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/edge-step4.svg" />
            </div>
        </li>
    </>
)

const SafariPermission = () => (
    <>
        <li>
            <div className="list-number">1</div>
            <h5>Click on the left corner <strong>‘AA’</strong> icon beside the website URL , click <strong>‘Websites Settings’</strong></h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/safari-step1.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">2</div>
            <h5>Ensure to set Camera & Microphone to <strong>‘Allow’</strong></h5>
            <div className="steps-list-img">
                <img src="../../../../../images/video-resume/safari-step2.svg" />
            </div>
        </li>

        <li>
            <div className="list-number">3</div>
            <h5>Select <strong>‘Done’</strong>, and refresh the tab before checking in again.</h5>
            <div className="steps-list-img mb-2">
                <img src="../../../../../images/video-resume/safari-step3.svg" />
            </div>
        </li>
        <li>
            <h6>Once these changes have been made, go back and try again.</h6>
        </li>
    </>
)