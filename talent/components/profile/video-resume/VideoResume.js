import axios from 'axios';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import ReactPlayer from 'react-player/file';
import { useDispatch, useSelector } from 'react-redux';
import { profileUpdate, videoResumeActive } from '../../../store/actions/UserActions.js';
import { SET_ERRORS, SET_LOADER, SET_NETWORK_ERROR, UPDATE_PROFILE_DATA } from '../../../store/actions/actionsTypes.js';
import { API_TALENT_VIDEO_RESUME, API_TALENT_VIDEO_RESUME_DELETE, IMAGE_URL } from '../../Constant.js';
import ErrorModal from '../../ErrorModal.js';
import Loader from "../../Loader.js";
import SectionLoader from "../../SectionLoader.js";
import useDrivePicker from '../google-file-picker/index.js';
import VideoResumeModal from './VideoResumeModal.js';
import "./video-recoder.css";

let cancelTokenSource = axios.CancelToken.source();

let googleAccessToken = "";
let googleDriveFileId = "";

function VideoPlayer({ url, onDelete, videoResumeDetails = null, canDelete = false, isPreview = false, onResetPreview, isPreviewStop = false, setVideoError }) {
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

export default function VideoResume({ toggleValue, setToggleValue, fileName, watchedCount, exploreVideoResumeModal, setExploreVideoResumeModal, viewVideoResumeModal, setViewVideoResumeModal, setOpen, isOpen, videoStep, setVideoStep }) {
    const [isLoading, setIsLoading] = useState(false);
    const [exploreStep, setExploreStep] = useState(1);
    const [uploadVideoResumeModal, setUploadVideoResumeModal] = useState(false);
    const [previewVideoResumeModal, setPreviewResumeModal] = useState(false);
    const [previewVideo, setPreviewVideo] = useState({
        file: null,
        preview_url: ""
    });
    const [recordVideoResumeModal, setRecordVideoResumeModal] = useState(false);
    const [isUploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({
        "progress_percent": 0,
        "time_remaining": 0
    });
    const [googleDriveLink, setGoogleDriveLink] = useState("");
    // const [googleAccessToken, setGoogleAccessToken] = useState(null);
    // const [googleDriveFileId, setGoogleDriveFileId] = useState("");
    const [errors, setErrors] = useState({});
    const [openPicker, authResponse] = useDrivePicker();
    const dispatch = useDispatch();
    const playerRef = useRef(null);
    const [hasPlayStarted, setPlayStarted] = useState(false);
    const [isPlaying, setPlaying] = useState(false);
    const [isNewVideoResume, setIsNewVideoResume] = useState(false);
    const [videoResumeDetails, setVideoResumeDetails] = useState(null);
    const profileData = useSelector(state => state.profile).profileData;
    const [videoRecordStep, setVideoRecordStep] = useState(1);
    const [commonErrorModal, setCommonErrorModal] = useState({
        commonError: false,
        messageText: "",
    })

    const [videoError, setVideoError] = useState(false);
    const allowedMimeTypes = ["video/mp4", 'video/quicktime', 'video/x-matroska'];
    const baseStyle = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        borderWidth: 2,
        borderRadius: 10,
        borderColor: '#eeeeee',
        borderStyle: 'dashed',
        backgroundColor: '#fafafa',
        color: '#bdbdbd',
        outline: 'none',
        transition: 'border .24s ease-in-out',
        fontSize: "14px"
    };
    const focusedStyle = {
        borderColor: '#2196f3'
    };
    const acceptStyle = {
        borderColor: '#cdcd00',
        backgroundColor: "#ffff92"
    };
    const rejectStyle = {
        borderColor: '#ff1744',
        cursor: "not-allowed"
    };
    useEffect(() => {
        if (viewVideoResumeModal) {

            if (!videoResumeDetails) {
                // if (profileData.video_resume_url) {
                //     setVideoResumeDetails({
                //         video_resume_url:profileData.video_resume_url,
                //         video_resume_active:profileData.video_resume_url,
                //     })
                // }else{
                getVideoResume();
                // }
            }

        }
    }, [viewVideoResumeModal])

    const current_url = new URLSearchParams(window.location.search)

    var url = API_TALENT_VIDEO_RESUME;
    let deleteUrl = API_TALENT_VIDEO_RESUME_DELETE;
    if (current_url.get("tid") !== null) {
        url += "?tid=" + current_url.get("tid");
        deleteUrl += "?tid=" + current_url.get("tid");
    }

    const getVideoResume = () => {
        setIsLoading(true);
        axios.get(url, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then((res) => {
                if (res?.data?.video_resume?.video_resume_active == "1") setToggleValue(true)
                else setToggleValue(false);
                dispatch({
                    type: UPDATE_PROFILE_DATA, payload: {
                        video_resume_url: res.data.video_resume.watch_url,
                        video_resume_active: res?.data?.video_resume?.video_resume_active
                    }
                });
                setVideoResumeDetails(res.data.video_resume);
                // setIsLoading(false)
                setTimeout(() => setIsLoading(false), 3000)
                setTimeout(() => {
                    setVideoResumeDetails(null)
                }, 1800000)
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    const data = err.response.data
                    if (data.hasOwnProperty("errors")) {

                        dispatch({
                            type: SET_ERRORS,
                            payload: formatErrors(data.errors)
                        });
                    }
                }
                console.log(err);
                setIsLoading(false);
            });
    }
    const handleGooglePicker = (only_access_token, file_id = "") => {
        openPicker({
            clientId: process.env.MIX_GOOGLE_DRIVE_CLIENT_ID,
            developerKey: process.env.MIX_GOOGLE_DEVELOPER_KEY,
            viewId: "DOCS_VIDEOS",
            // token: googleAccessToken, // pass oauth token in case you already have one
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: false,
            onlyAccessToken: only_access_token,
            // customViews: customViewsArray, // custom view
            callbackFunction: (data) => {
                if (data.action === 'cancel') {
                    setUploadVideoResumeModal(true);
                } else if (data.action === 'loaded') {
                    setUploadVideoResumeModal(false);
                } else if (data.action === 'picked') {
                    setUploadVideoResumeModal(true);
                    if (data.docs.length > 0) {
                        googleDriveFileId = data.docs[0].id;
                        // setGoogleDriveFileId(data.docs[0].id);
                        uploadGoogleDriveFile();
                    }
                } else if (data.action === 'save-token') {
                    // setGoogleAccessToken(data.content);
                    googleAccessToken = data.content;
                    if (only_access_token) {
                        validateGoogleDriveFileType(file_id, data.content);
                    }
                }
            },
        })
    }
    function StyledDropzone(props) {
        const fileDropError = (files) => {
            let errorMessage = "";
            files.map((file) => {
                if (file.errors.length > 0) {
                    if (file.errors[0].code == "too-many-files") { setCommonErrorModal({ ...commonErrorModal, commonError: true, messageText: "You can only upload 1 file" }) }
                    if (file.errors[0].code == "file-invalid-type") { setCommonErrorModal({ ...commonErrorModal, commonError: true, messageText: "You can only upload video in .mp4, .mov or .mkv formats" }) }
                    if (file.errors[0].code == "file-too-large") { setCommonErrorModal({ ...commonErrorModal, commonError: true, messageText: "Your video should be smaller than 50 MB" }) }
                }
            });
        }

        const fileDropAccepted = (files) => {
            setUploadVideoResumeModal(false);
            setPreviewResumeModal(true);
            setPreviewVideo({
                file: files[0],
                preview_url: URL.createObjectURL(files[0])
            });
        }

        const {
            getRootProps,
            getInputProps,
            isFocused,
            isDragAccept,
            isDragReject
        } = useDropzone({
            accept: { 'video/mp4': [], 'video/quicktime': [], 'video/x-matroska': [] },
            maxFiles: 1,
            maxSize: 52428800, // 50 MB
            onDropRejected: fileDropError,
            onDropAccepted: fileDropAccepted,
            controls: ["play-large", "play"]
        });

        const style = useMemo(() => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {})
        }), [
            isFocused,
            isDragAccept,
            isDragReject
        ]);

        return (
            <div className="container">
                <div {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-dark'>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                    <p className='mt-2 text-dark cursor-pointer'>Drop your video resume here, or click to browse files</p>
                    {/* <p className='text-dark'>or,</p>
                    <p className='text-primary cursor-pointer' style={{ textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); handleGooglePicker(false); }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='mr-2'>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                        </svg>
                        Upload from Google Drive
                    </p> */}
                    <div className='d-flex' style={{ gap: "15px", fontSize: "13px" }}>
                        <p className='text-dark'>
                            in .mp4, .mov, .mkv
                        </p>

                        <p className='text-dark'>
                            Max. file size: 50 MB
                        </p>
                    </div>
                </div>
            </div>
        );
    }
    const getFileIdFromGoogleDriveLink = (googleDriveLink) => {
        const filter1 = googleDriveLink.match(/drive\.google\.com\/file\/d\/(.*?)\//);
        const filter2 = googleDriveLink.match(/drive\.google\.com\/file\/d\/(.*?)\//);
        const filter3 = googleDriveLink.match(/drive\.google\.com\/uc\?id\=(.*?)\&/);
        let fileId = null;
        if (filter1) {
            fileId = filter1[1];
        } else if (filter2) {
            fileId = filter2[1];
        } else if (filter3) {
            fileId = filter3[1];
        }
        return fileId;
    }
    const validateGoogleDriveFileType = (file_id, access_token = null) => {
        access_token = access_token ?? googleAccessToken;
        if (access_token == null) return;
        const googleDriveAPI = `https://www.googleapis.com/drive/v3/files/${file_id}`;
        axios.get(googleDriveAPI, {
            headers: { Authorization: `Bearer ${access_token}` }
        })
            .then((res) => {
                const mimeType = res.data.mimeType;
                if (!allowedMimeTypes.includes(mimeType)) {
                    setErrors({ google_drive_link: "Unsupported format uploaded. You can only upload .mp4, .mov or .mkv format" });
                    return;
                }
                // File is validated
                uploadGoogleDriveFile();
            })
            .catch((err) => {
                // setGoogleAccessToken(null);
                googleAccessToken = null;
                setErrors({ google_drive_link: "Authentication Error. Please try again" });
            });
    }
    const uploadGoogleDriveFile = (retry = 1) => {
        setUploadVideoResumeModal(false);
        dispatch({ type: SET_LOADER, payload: true });

        axios.defaults.headers.common['Authorization'] = "Bearer " + localStorage.getItem('token');

        const formData = new FormData();
        formData.append("google_file_id", googleDriveFileId);
        formData.append("google_access_token", googleAccessToken);
        formData.append("source", "google_drive");

        axios.post(url, formData)
            .then((res) => {
                const videoResume = res.data.video_resume;

                dispatch({ type: SET_LOADER, payload: false });
                dispatch({ type: UPDATE_PROFILE_DATA, payload: videoResume });
                setPreviewResumeModal(false);

                setIsNewVideoResume(true);
                setVideoError(false);
                setViewVideoResumeModal(true);
                getVideoResume();
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    const data = err.response.data
                    if (data.hasOwnProperty("errors")) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: formatErrors(data.errors)
                        });
                    }
                }
                if (err.message === 'Network Error' && retry === 1) {
                    return uploadGoogleDriveFile(retry + 1);
                } else {
                    if (err.message === 'Network Error') {
                        dispatch({
                            type: SET_NETWORK_ERROR,
                            payload: {
                                isNetworkError: true,
                            },
                        })
                    } 
                }
                console.log(err);
            });
    }
    const submitVideo = (file, retry = 1) => {
        console.log('submitVideo called');
        setUploading(true);
        axios.defaults.headers.common['Authorization'] = "Bearer " + localStorage.getItem('token');
        const formData = new FormData();
        formData.append("video", file);
        formData.append("source", "local");


        axios.post(url, formData, {
            cancelToken: cancelTokenSource.token,
            onUploadProgress: function (axiosProgressEvent) {
                const progress = Math.round((axiosProgressEvent.loaded / axiosProgressEvent.total) * 100);
                setUploadProgress({
                    progress_percent: progress,
                    time_remaining: 0
                });
            }
        })
            .then((res) => {
                const videoResume = res.data.video_resume;
                setUploading(false);
                dispatch({ type: UPDATE_PROFILE_DATA, payload: videoResume });
                setPreviewResumeModal(false);
                setOpen(false);
                setIsNewVideoResume(true);
                setVideoError(false);
                setViewVideoResumeModal(true);
                getVideoResume();
                setVideoStep(1);
                setVideoRecordStep(1);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    const data = err.response.data
                    if (data.hasOwnProperty("errors")) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: formatErrors(data.errors)
                        });
                    }
                }
                if (err.message === 'Network Error' && retry === 1) {
                    return submitVideo(file, retry + 1);
                } else {
                    if (err.message === 'Network Error') {
                        dispatch({
                            type: SET_NETWORK_ERROR,
                            payload: {
                                isNetworkError: true,
                            },
                        })
                    } 
                }
                console.log(err);
            });
    }

    const [isSubmit, setIsSubmit] = useState(false);
    const cancelVideoUpload = () => {
        if (confirm("Are you sure you want to stop uploading video?")) {
            setUploading(false);
            setIsSubmit(false);
            cancelTokenSource.cancel('Request was canceled');
            cancelTokenSource = axios.CancelToken.source();
        }
        return;
    }
    const deleteVideoResume = () => {
        if (confirm("Are you sure you want to delete this video resume?")) {
            // dispatch({ type: SET_LOADER, payload: true })     
            setIsLoading(true);
            setViewVideoResumeModal(false);
            profileUpdate(deleteUrl, {})(dispatch)
                .then((res) => {
                    if (res.data.status == "success") {
                        // let newData = [...testimonials]
                        // newData = newData.filter((item) => item.id != id);
                        dispatch({ type: UPDATE_PROFILE_DATA, payload: { video_resume: null, video_resume_uploaded_at: null, video_resume_watched_count: null, video_resume_url: "" } });
                        // dispatch({ type: SET_LOADER, payload: false })
                        setIsLoading(false);
                        // onDelete()
                    }
                })
                .catch((err) => { console.log(err); setIsLoading(false); })
        }
        return;
    }
    const onToggleSwitch = (e) => {
        let isActiveData = {
            "video_resume_active": e.target.checked ? 1 : 0,
            // "tid": "WjVDNFlUdi9SRTRiREwwN0VnNkY2QT09"            
        };
        videoResumeActive(isActiveData)(dispatch)
            .then((res) => {
            }).catch((err) => {
                console.log("error encoutered", err)
            });
        setToggleValue((prev) => !prev);
        let _toggleValue = !toggleValue;
        let val;
        if (_toggleValue) val = "1"
        else val = "0"

        dispatch({
            type: UPDATE_PROFILE_DATA, payload: {
                video_resume_active: val
            }
        });
    }
    useEffect(() => {
        if (uploadVideoResumeModal) setGoogleDriveLink("");
    }, [uploadVideoResumeModal]);

    const closeCommonErrorModal = () => {
        // this.setState({ commonErrorModal: false, messageText: false });
        setCommonErrorModal({ ...commonErrorModal, commonError: false, messageText: false })
    }
    return (
        <>
            {isLoading && <Loader />}
            <VideoResumeModal
                uploadProgress={uploadProgress} isUploading={isUploading} VideoPlayer={VideoPlayer}
                videoRecordStep={videoRecordStep} setVideoRecordStep={setVideoRecordStep}
                setViewVideoResumeModal={setViewVideoResumeModal} setPreviewResumeModal={setPreviewResumeModal}
                setUploadVideoResumeModal={setUploadVideoResumeModal} step={videoStep} setVideoStep={setVideoStep}
                isOpen={isOpen} setOpen={setOpen} previewVideo={previewVideo} setPreviewVideo={setPreviewVideo}
                submitVideo={submitVideo} cancelVideoUpload={cancelVideoUpload}
                isSubmit={isSubmit} setIsSubmit={setIsSubmit}
            />
            {/* 1st and 2nd screen */}
            {/* <Modal
                isOpen={exploreVideoResumeModal}
                onCancel={() => { setExploreVideoResumeModal(false); setExploreStep(1); }}
                onRequestClose={() => { setExploreVideoResumeModal(false); setExploreStep(1); }}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal commonModal fade ${exploreVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => { setExploreVideoResumeModal(false); setExploreStep(1); }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="modal-body" style={{ padding: "2.25rem" }}>
                            {
                                exploreStep == 1 ? (
                                    <>
                                        <div className='row'>
                                            <div className="col">
                                                <h6 className='text-left'>A video resume is a short video of you introducing yourself to the world</h6>
                                            </div>
                                            <div className="col"></div>
                                        </div>
                                        <div className='row mt-3'>
                                            <div className="col">
                                                <img style={{ borderRadius: "0.5rem" }} src="/images/video-resume/popup1.jpeg" />
                                            </div>

                                            <div className="col text-left">
                                                <p style={{ fontWeight: "500" }}>Add a personal touch and set a lasting impression through a short video about yourself</p>
                                                <p style={{ fontSize: "14px" }}>A video resume allows you to speak directly to your potential employer about what makes you uniquely qualified for the role</p>
                                                <p style={{ fontSize: "14px" }}>Demonstrate your personality & soft skills that employers may not otherwise get from other element of your profile</p>
                                                <p className='exploreVideoResumeBtnHelp'>We have prepared a small list of 5-6 points to keep in mind while creating your video resume</p>
                                                <button className='primaryBtn' onClick={() => setExploreStep(2)}>NEXT</button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className='row'>
                                        <div className='col-6 text-left'>
                                            <div className='position-relative'>
                                                <img style={{ borderRadius: "0.5rem" }} src="/images/video-resume/popup2.jpeg" />
                                                <div onClick={() => setExploreStep(1)} className='exploreVideoResumeBackArrow'>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
                                                        <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className='mt-3' style={{ fontSize: "16px", fontWeight: "500" }}>Connect with employers beyond just your professional CV</p>
                                        </div>
                                        <div className="vr"></div>
                                        <div className='col-6 text-left'>
                                            <p className='exploreVideoResumeInstructionTitle'>Important points to cover in your video resume</p>
                                            <div className='mt-4 exploreVideoResumeInstructions'>
                                                <div>
                                                    <p className='title bolder'>1. Skillset</p>
                                                    <p>Tell us about your top skills, how you've used them in the past and your work expectations</p>
                                                </div>
                                                <div>
                                                    <p className='title bolder'>2. Past Experiences</p>
                                                    <p>Tell us about a project or work experience that best exemplifies your skills and experience. What was the result of your work?</p>
                                                </div>
                                                <div>
                                                    <p className='title bolder'>3. Success Story</p>
                                                    <p>What was the challenge you had to overcome recently</p>
                                                </div>
                                                <div>
                                                    <p className='title bolder'>4. Your Journey</p>
                                                    <p>A brief about your professional journey and how you got to where you are now</p>
                                                </div>
                                            </div>

                                            <p className='mt-5 exploreVideoResumeBtnHelp' style={{ marginBottom: "5px" }}>You can either upload or record it here</p>
                                            <div className='d-flex mt-2'>
                                                <button className='primaryBtn' onClick={() => { setExploreVideoResumeModal(false); setUploadVideoResumeModal(true); setExploreStep(1) }}>UPLOAD</button>
                                                <button className='underlinedBtn ml-4' onClick={() => { setExploreVideoResumeModal(false); setRecordVideoResumeModal(true); setExploreStep(1) }}>RECORD NOW</button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </Modal> */}

            {/* no need of this  */}
            <Modal
                isOpen={uploadVideoResumeModal}
                onCancel={() => { setUploadVideoResumeModal(false); setExploreStep(1); }}
                onRequestClose={() => { setUploadVideoResumeModal(false); setExploreStep(1); }}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal video-modal-main commonModal fade ${uploadVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog uploadVideoResume" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => { setUploadVideoResumeModal(false); setExploreStep(1); }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className='uploadVideoResumeHeader d-flex align-items-start border-bottom'>
                            <div onClick={() => { setUploadVideoResumeModal(false); setOpen(true); setExploreStep(2) }} className='uploadVideoResumeBackBtn'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
                                </svg>
                            </div>
                            <div>
                                <p className='uploadVideoResumeTitle'>Upload video resume</p>
                                <p className='uploadVideoResumeSubTitle'>Tip: Try using free online resources like 'Tinywow.com' to compress your video without loss in quality</p>
                            </div>
                        </div>
                        <div className="uploadVideoResumeBody modal-body">
                            <StyledDropzone />
                            {/* <p className='mt-3 text-center text-dark' style={{ fontSize: "14px" }}>Or,</p>
                            <div className='form-group text-left'>
                                <label>You can also upload the file using Google Drive Link</label>
                                <div className='input-group uploadVideoResumeInputGroup'>
                                    <input
                                        type={"text"}
                                        value={googleDriveLink}
                                        placeholder="Paste URL here"
                                        name="google_drive_link"
                                        onChange={(e) => setGoogleDriveLink(e.target.value)}
                                    />
                                    <div className="input-group-append">
                                        <button onClick={() => validateGoogleDriveLink()} className='primaryBtn inputGroupBtn' type="button">Add</button>
                                    </div>
                                </div>
                                {errors.google_drive_link && <div className='error'>{errors.google_drive_link}</div>}
                            </div> */}
                        </div>
                    </div>
                </div>
            </Modal>

            {/* {3rd sceen} */}
            {/* <Modal
                isOpen={recordVideoResumeModal}
                onCancel={() => { setRecordVideoResumeModal(false); setExploreStep(1); }}
                onRequestClose={() => { setRecordVideoResumeModal(false); setExploreStep(1); }}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal commonModal fade ${recordVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog uploadVideoResume" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => { setRecordVideoResumeModal(false); setExploreStep(1); }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className='mt-3 uploadVideoResumeHeader d-flex align-items-start border-bottom'>
                            <div className='position-relative'>
                                <img style={{ borderRadius: "0.5rem" }} src="/images/video-resume/popup3.jpeg" />
                                <div className='position-absolute' style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 0%, rgba(22,22,22,0.9220063025210083) 100%)", width: "100%", height: "100%", top: "0", borderRadius: "0.5rem" }}></div>
                                <div onClick={() => { setRecordVideoResumeModal(false); setOpen(true); setExploreStep(2) }} className='exploreVideoResumeBackArrow'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#FFFFFF" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
                                    </svg>
                                </div>
                                <div className='position-absolute' style={{ top: "50px" }}>
                                    <h6 className='text-white'>Press 'record now' below to get started</h6>
                                </div>
                            </div>
                        </div>
                        <div className="uploadVideoResumeBody modal-body">

                        </div>
                    </div>
                </div>
            </Modal> */}


            {/* no need */}
            <Modal
                isOpen={previewVideoResumeModal}
                onCancel={() => { setPreviewResumeModal(false); setExploreStep(1); }}
                onRequestClose={() => { setPreviewResumeModal(false); setExploreStep(1); }}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal video-modal-main commonModal fade ${previewVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog uploadVideoResume" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => { setPreviewResumeModal(false); setExploreStep(1); }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className='uploadVideoResumeHeader d-flex align-items-start border-bottom'>
                            <div onClick={() => { setPreviewResumeModal(false); setUploadVideoResumeModal(true); setExploreStep(2) }} className='uploadVideoResumeBackBtn'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
                                </svg>
                            </div>
                            <div>
                                <p className='uploadVideoResumeTitle'>Upload video resume</p>
                                <p className='uploadVideoResumeSubTitle'>Tip: Try using free online resources like 'Tinywow.com' to compress your video without loss in quality</p>
                            </div>
                        </div>
                        <div className="uploadVideoResumeBody modal-body">
                            <VideoPlayer url={previewVideo?.preview_url} isPreview
                                onResetPreview={() => {
                                    setPreviewResumeModal(false);
                                    setUploadVideoResumeModal(true);
                                    setPreviewVideo({
                                        file: null,
                                        preview_url: ""
                                    })
                                }}
                            />
                            {isUploading && (
                                <div className='mt-4 videoResumeUploadProgress d-flex justify-content-between align-items-start'>
                                    <div style={{ width: '100%' }}>
                                        <p className='videoResumeUploadProgressTitle'>Uploading - {previewVideo.file?.name}</p>
                                        <p className='videoResumeUploadProgressPercent'>{uploadProgress.progress_percent}%</p>
                                        <div className="progress" role="progressbar" aria-valuenow={uploadProgress.progress_percent} aria-valuemin="0" aria-valuemax="100" style={{ height: "5px", width: "calc(100% - 40px)" }}>
                                            <div className="progress-bar" style={{ width: `${uploadProgress.progress_percent}%`, backgroundColor: "rgb(129, 197, 87)" }}></div>
                                        </div>
                                    </div>
                                    <div onClick={() => cancelVideoUpload()} className='videoResumeUploadProgressCancel' title='cancel'>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                            <div className='mt-4 d-flex justify-content-end'>
                                <button disabled={isUploading} className='primaryBtn uploadVideoResumeBtn' onClick={() => { submitVideo(previewVideo.file) }}>SUBMIT VIDEO</button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* {last screen } */}
            <Modal
                isOpen={viewVideoResumeModal}
                onCancel={() => { setViewVideoResumeModal(false); setExploreStep(1); }}
                onRequestClose={() => { setViewVideoResumeModal(false); setExploreStep(1); }}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal video-modal-main commonModal fade ${viewVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog uploadVideoResume" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => { setViewVideoResumeModal(false); setExploreStep(1); setVideoError(false) }}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        {/* {videoError ?
                            <div className="mt-4 uploadVideoResumeBody modal-body">
                                <div className='videoErrorPlayer'>
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
                                        <button className='btn backBtn' onClick={()=>{setVideoError(false);setViewVideoResumeModal(false); setOpen(true);setVideoStep(1);}}>GO BACK</button>
                                        <button className='btn' onClick={()=>{setViewVideoResumeModal(false); setExploreStep(1);setVideoError(false)}}>Got it</button>
                                    </div>
                                </div>
                            </div>
                            : */}
                        <div className="mt-4 uploadVideoResumeBody modal-body">
                            <div className='initialScreenHead'>
                                <div className='left'>
                                    <h6>
                                        {
                                            isNewVideoResume ? "You have successfully uploaded your video resume" : "A video resume is a short video for you to introduce yourself to the world"
                                        }
                                    </h6>
                                    <p style={{ fontSize: "13px", marginTop: "1px", color: "#a6a6a6" }}>Uploaded on: {videoResumeDetails?.uploaded_at}</p>
                                </div>
                                <div className='right'>
                                    <button className='primaryBtn uploadVideoResumeBtn' onClick={() => { setViewVideoResumeModal(false); setOpen(true); setExploreStep(2) }}>UPLOAD A NEW VIDEO</button>
                                </div>
                            </div>
                            {videoError ?
                                <div className='videoErrorPlayer profile'>
                                    <h6>Seems like your browser doesn’t support this video format</h6>
                                    <p>We recommend using and logging in through another supported browser as listed below in order to have an uninterrupted experience</p>
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
                                </div>
                                :
                                <VideoPlayer url={videoResumeDetails?.watch_url} canDelete onDelete={deleteVideoResume} videoResumeDetails={videoResumeDetails}
                                    setVideoError={setVideoError} />
                            }

                            <div className='toggel-switch-wrapper'>
                                <div className='toggel-switch-inner'>
                                    <div className='switch-content'>
                                        <h5>Control the visibility of your video resume on your profile now.</h5>
                                        {!toggleValue ? <p>Currently your video resume is not visible to clients</p>
                                            : <p style={{ color: "#32936F" }} >Currently your video resume is visible to clients</p>}
                                    </div>
                                    <div className='switch-main'>
                                        <div className="switch">
                                            <input className="form-check-input" type="checkbox" onChange={onToggleSwitch} checked={toggleValue} />
                                            <span className="slider round"></span>
                                            <span className='switch-text switch-show'>Showing</span>
                                            <span className='switch-text switch-not-show'>Not showing</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        {/* } */}
                    </div>
                </div>
            </Modal>
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