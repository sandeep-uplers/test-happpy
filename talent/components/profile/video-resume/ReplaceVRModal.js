import React from 'react'
import { BigWarning, CloseModalIcon, EyeIcon, PlayBtn, TopApplicantScoreboardIcon } from '../../../assets/IconSVG'
import Modal from 'react-modal';
import { ClientVisibilityToggle, formatDate } from '../../../pages/app/work-components/SingleOppAssessmentNew';
import HRVideoResume from '../../common/HRVideoResume';
import { useParams } from '@/talent/navigation/routerCompat';
import { useSelector } from 'react-redux';
import { HomeVideoResume } from '../../../pages/app/home/HomeVideoResume';

const ReplaceVRModal = ({ openReplaceVRModal, setOpenReplaceVRModal, videoResumeData, setVideoResumeData,
    setVideoResumeStates, setOpenVideoPlayerModal, replaceHeadonApply, vrMandatoryOnApply, homePage, hrData }) => {

    const handleClose = () => {
        setOpenReplaceVRModal(false);
    }

    return (
        <Modal
            isOpen={openReplaceVRModal}
            portalClassName="react-modal-portal"
            onClose={handleClose}
            className={`commonModal`}
        >
            <div className="modal-dialog modal-dialog-centered replaceVRModal">
                <div className="modal-content">

                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose} title='Close'><CloseModalIcon /></button>
                    {replaceHeadonApply ?
                        <div className="replaceVideoHead">
                            <TopApplicantScoreboardIcon />
                            <div className="content">
                                <h4>Record a new short video to highlight your expertise and communication skills and
                                    {vrMandatoryOnApply ?
                                        " APPLY"
                                        :
                                        " become a top applicant for this position"
                                    }
                                </h4>
                            </div>
                        </div>
                        :
                        <div className="modal-head">
                            <h2>Replace this video and share a new one with the clients</h2>
                            <p>The current version of your video will be deleted upon replacing it with a new video</p>
                        </div>
                    }

                    <div className="modal-body">
                        <div className="warning-container">
                            <div className="col-left"><BigWarning /></div>
                            <div className="col-right">
                                <div className="warning-info">
                                    <h3>Please note</h3>
                                    <p>If you have enabled the sharing option with clients on any job opportunity already, then replacing the existing video will delete & replace this video resume everywhere it has already been shared</p>
                                </div>
                                <div className="video-row">
                                    <div className="video-thumbnail">
                                        <video src={videoResumeData?.video_url} />
                                        <span
                                            className="playBtn"
                                            onClick={() => {
                                                if (videoResumeData?.video_url) {
                                                    setOpenVideoPlayerModal(true)
                                                    handleClose();
                                                }
                                            }}
                                        >
                                            <PlayBtn />
                                        </span>
                                    </div>
                                    <div className="content">
                                        <h3>View your video resume</h3>
                                        <div className="info">
                                            <span className="date">Uploaded on: {formatDate(videoResumeData?.uploaded_at)}</span>
                                            {/* |
                                            <span className="view-count"><EyeIcon /> Viewed by {videoResumeData?.watch_count ?? 0}</span> */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {homePage ?
                            <HomeVideoResume handleClose={handleClose} setVideoResumeStates={setVideoResumeStates} videoResumeData={videoResumeData} replaceMode={true} />
                            :
                            <>
                                <HRVideoResume
                                    handleClose={handleClose}
                                    setVideoResumeStates={setVideoResumeStates}
                                    videoResumeData={videoResumeData}
                                    replaceMode={true}
                                    hrData={hrData}

                                />
                                {!vrMandatoryOnApply && hrData.ai_mandatory != 2 &&
                                    <>
                                        <hr />
                                        <p className="visibility-toggle-info">
                                            You can always decide whether you want this video to be visible to the client for this job opportunity or not
                                        </p>

                                        <ClientVisibilityToggle initialState={videoResumeData?.is_visible_to_client} setVideoResumeData={setVideoResumeData} />
                                    </>
                                }
                            </>
                        }
                    </div>

                    <div className="cta-row">
                        <button type='button' className='cancelBtn' title='Cancel' onClick={handleClose}>Cancel</button>
                        {/* <button
                            type='button'
                            className='primaryBtn'
                            title='Submit Video'
                        // onClick={handleSubmit}
                        >
                            SAVE CHANGES
                        </button> */}
                    </div>

                </div>
            </div>
        </Modal >
    )
}

export default ReplaceVRModal