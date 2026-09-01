import React from 'react'
import { CloseModalIcon } from '../../../assets/IconSVG'
import Modal from 'react-modal';
import ReactPlayer from 'react-player/file';

const DiscardVideoModal = ({ videoResumeStates, setVideoResumeStates, recordedVideo, source, handleClose }) => {

    const handleDiscardAndReRecord = () => {
        setVideoResumeStates(prev => ({
            ...prev,
            openPreRecordingModal: true,
            openRecordVideoResumeModal: true,
            openUploadVideoResumeModal: false,
            openPreviewVideoPlayerModal: false,
            openDiscardVideoModal: false,
        }));
    }

    const handleDontDiscard = () => {
        setVideoResumeStates(prev => ({
            ...prev,
            openPreRecordingModal: false,
            openRecordVideoResumeModal: false,
            openUploadVideoResumeModal: false,
            openPreviewVideoPlayerModal: true,
            openDiscardVideoModal: false,
        }));
    }

    const confirmHandleClose = () => {
        if (confirm(`Closing this will discard your ${source == 'uploaded' ? 'uploaded' : 'recorded'} video. Are you sure you want to continue?`)) {
            handleClose();
        }
    };

    return (
        <Modal
            isOpen={videoResumeStates.openDiscardVideoModal}
            portalClassName="react-modal-portal"
            onClose={handleClose}
            className={`commonModal recordVideoDiscardModal`}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={confirmHandleClose} title='Close'>
                        <CloseModalIcon />
                    </button>

                    <div className="modal-body">
                        <div className='recordVideoDiscardBox'>
                            <div className='recordVideoDiscardPlayer'>
                                <ReactPlayer
                                    playing={false}
                                    url={recordedVideo?.url}
                                    height="100%"
                                    width="100%"
                                />
                            </div>

                            <div className='recordVideoDiscardInfo'>
                                <h3>Are you sure you want to discard this video and re-record?</h3>
                                <p>This recording cannot be retrieved once it has been discarded</p>
                                <div className='recordVideoDiscardAction'>
                                    <button
                                        onClick={handleDiscardAndReRecord}
                                        type="button"
                                        className="primaryBtn"
                                        title="Yes, Discard & Re-record Video"
                                    >
                                        Yes, Discard & Re-record Video
                                    </button>
                                    <button
                                        type="button"
                                        className="cancelBtn"
                                        title="No, Don't Discard Video"
                                        onClick={handleDontDiscard}
                                    >
                                        No, Don't Discard Video
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default DiscardVideoModal