import React, { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Modal from 'react-modal';
import { BackIcon, CloseIcon, DropZone1 } from '../../../assets/IconSVG.js';
import { videoSelectUploadTrack } from '../../../helpers/Mixpanel.js';
import ErrorModal from '../../ErrorModal.js';
import "./video-recoder.css";

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

const UploadVR = ({ videoResumeStates, hrData, openSelectSourceModal, setRecordedVideo, setSource, handleClose, videoResumeData }) => {
    const [commonErrorModal, setCommonErrorModal] = useState({
        commonError: false,
        messageText: "",
    })
    function StyledDropzone(props) {
        const fileDropError = (files) => {
            console.log('files :', files);
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
            videoSelectUploadTrack({ ctaVal: 'upload', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
            setRecordedVideo({
                blob: files[0],
                url: URL.createObjectURL(files[0]),
                totalDuration: 0,
            })
            setSource('uploaded');
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
                    <DropZone1 />
                    <p className='mt-2 text-dark cursor-pointer'>Drop your video resume here, or click to browse files</p>
                    {/* <p className='text-dark'>or,</p>
                    <p className='text-primary cursor-pointer' style={{ textDecoration: "underline" }} onClick={(e) => { e.stopPropagation(); handleGooglePicker(false); }}>
                        <DropZone2 />
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

    const closeCommonErrorModal = () => {
        setCommonErrorModal({ ...commonErrorModal, commonError: false, messageText: false })
    }

    return (
        <>
            {commonErrorModal?.commonError && <ErrorModal isOpen={commonErrorModal?.commonError} closeCommonErrorModal={closeCommonErrorModal} content={commonErrorModal.messageText} />}

            <Modal
                isOpen={videoResumeStates.openUploadVideoResumeModal}
                onCancel={handleClose}
                onRequestClose={handleClose}
                portalClassName="react-modal-portal"
                className={`modal video-modal-main commonModal fade ${videoResumeStates.openUploadVideoResumeModal && "show"}`}
            >
                <div className="modal-dialog uploadVideoResume" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => {
                            handleClose(); videoSelectUploadTrack({ ctaVal: 'close', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 })
                        }}><CloseIcon /></button>

                        <div className='uploadVideoResumeHeader d-flex align-items-start border-bottom'>
                            <div
                                onClick={() => { openSelectSourceModal(); handleClose(); videoSelectUploadTrack({ ctaVal: 'back', hrData, count: videoResumeData && videoResumeData?.video_url ? 2 : 1 }) }}
                                className='uploadVideoResumeBackBtn'
                            >
                                <BackIcon />
                            </div>

                            <div>
                                <p className='uploadVideoResumeTitle'>Upload video resume</p>
                                <p className='uploadVideoResumeSubTitle'>Tip: Try using free online resources like 'Tinywow.com' to compress your video without loss in quality</p>
                            </div>
                        </div>
                        <div className="uploadVideoResumeBody modal-body">
                            <StyledDropzone />
                        </div>
                    </div>
                </div>
            </Modal>

        </>
    )
}

export default UploadVR