import React from 'react'
import Modal from 'react-modal';

import { IMAGE_URL } from '../../../Constant';
import './permission-modal.css';


const DeviceInUseModal = ({ openDeviceInUseModal, handleClose }) => {
    return (
        <>
            <Modal
                isOpen={openDeviceInUseModal}
                onClose={handleClose}
                portalClassName="react-modal-portal permission-modal"
            >
                <div className='modal-container device-error-modal device-in-use'>
                    <div className="img-container">
                        <img src={IMAGE_URL + 'permissions/' + "crashcone.svg"} alt="crashcone" />
                    </div>

                    <div className="col-right">
                        <div className="heading">
                            <h2>Camera or microphone already in use</h2>
                            <p>Please make sure camera or microphone is not in use by any other application</p>
                        </div>
                        <div className="instruction-container">
                            <h5 className='instructions'>
                                Please ensure that no other application is currently using your camera or microphone.
                            </h5>
                            <h5 className='instructions'>
                                Close other applications that might be using these devices and then try again by refreshing your screening page.
                            </h5>
                        </div>
                        <div className="modal-cta-row">
                            <button className="button" onClick={handleClose}>Understood</button>
                        </div>
                    </div>
                </div>
            </Modal >
        </>
    )
}

export default DeviceInUseModal