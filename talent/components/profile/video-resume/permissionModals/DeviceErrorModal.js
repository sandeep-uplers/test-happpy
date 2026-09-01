import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';


import { IMAGE_URL } from '../../../Constant';
import './permission-modal.css';


const DeviceErrorModal = ({ openDeviceErrorModal, deviceInfo, handleClose }) => {

    let text = { heading: "", subHeading: "", instructions: "" };

    if (!deviceInfo.cameraAvailable && !deviceInfo.microphoneAvailable) {
        text = {
            heading: 'Camera and microphone not detected',
            subHeading: 'Please make sure your device has a front camera and microphone in order to proceed',
            instructions: 'In order to proceed and have an uninterrupted screening, please log in with another device that has both a front camera and microphone'
        }
    } else if (!deviceInfo.cameraAvailable) {
        text = {
            heading: 'Camera not detected',
            subHeading: 'Please make sure your device has a front camera in order to proceed',
            instructions: 'It is recommended that you connect an external webcam or log in with another device that has a front camera and microphone in order to proceed and have an uninterrupted screening'
        }
    } else if (!deviceInfo.microphoneAvailable) {
        text = {
            heading: 'Microphone not detected',
            subHeading: 'Please make sure your device has a microphone in order to proceed',
            instructions: 'Please log in with another device that has a microphone and front camera in order to proceed and have an uninterrupted screening'
        }
    } else {
        text = {
            heading: 'Camera or microphone not detected',
            subHeading: 'Please make sure your device has a camera and microphone in order to proceed',
            instructions: 'Please log in with another device that has a microphone and front camera in order to proceed and have an uninterrupted screening'
        }
    }

    return (
        <>
            <Modal
                isOpen={openDeviceErrorModal}
                onClose={handleClose}
                portalClassName="react-modal-portal permission-modal"
            >
                <div className='modal-container device-error-modal'>
                    <div className="img-container">
                        <img src={IMAGE_URL + 'permissions/' + "crashcone.svg"} alt="crashcone" />
                    </div>

                    <div className="col-right">
                        <div className="heading">
                            <h2>{text.heading}</h2>
                            <p>{text.subHeading}</p>
                        </div>
                        <h5 className='instructions'>{text.instructions}</h5>
                        <div className="modal-cta-row">
                            <button className="button-white" onClick={handleClose}>CANCEL</button>
                            {/* <button className="button" onClick={handleGrantPermissions}>RETRY</button> */}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default DeviceErrorModal