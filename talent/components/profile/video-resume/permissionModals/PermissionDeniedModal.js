import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';


import { SettingSvg } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../Constant';
import './permission-modal.css'

const PermissionDeniedModal = ({ openPermissionDeniedModal, handleClose, permissionsGranted }) => {
    const [isWindows, setIsWindows] = useState(true);

    useEffect(() => {
        const windows = navigator.platform.toLowerCase().includes('win');
        setIsWindows(windows);
    }, [])


    let headingText = 'Your camera or microphone access for this browser is blocked by the system';
    let subHeadingText = 'Kindly change your permission settings for this site to allow access to your camera, microphone and window management during this screening process, you may change these post your screening is successfully completed';

    if (permissionsGranted.system === 'denied') {
        headingText = 'Your camera or microphone access for this browser is blocked by the system';
        subHeadingText = 'To proceed with the screening process, please update your system settings to allow access to the camera and microphone, you may change these post your screening is successfully completed';
    }
    else if (permissionsGranted.camera === 'denied') {
        headingText = 'Your camera access for our site is denied in this browser, which is necessary to continue your screening';
    }
    else if (permissionsGranted.microphone === 'denied') {
        headingText = 'Your microphone access for our site is denied in this browser, which is necessary to continue your screening';
    }
    else if (permissionsGranted.camera === 'denied' && permissionsGranted.microphone === 'denied') {
        headingText = 'Your camera and microphone access for our site is denied in this browser, which is necessary to continue your screening';
    }
    else if (permissionsGranted.window === 'denied') {
        headingText = 'Your window management access for our site is blocked in this browser, which is necessary to continue your screening';
        subHeadingText = 'Kindly change your permission settings for this site to allow access to your window management microphone and camera during this screening process, you may change these post your screening is successfully completed';
    }

    // console.log(permissionsGranted.camera != 'denied');
    // console.log(permissionsGranted.microphone != 'denied');
    // console.log(permissionsGranted.window === 'denied');

    return (
        <>
            <Modal
                isOpen={openPermissionDeniedModal}
                onClose={handleClose}
                portalClassName="react-modal-portal permission-modal"
            >
                <div className='modal-container permission-denied-modal'>
                    <div className="modal-head">
                        <div className="img-container">
                            <img src={IMAGE_URL + 'permissions/' + 'crashcone.svg'} alt="crashcone" />
                        </div>

                        <div className="heading">
                            <h2>{headingText}</h2>
                            <p>{subHeadingText}</p>
                        </div>
                    </div>
                    <hr />
                    <div className="permission-denied-modal-body">

                        {(permissionsGranted.system === 'denied') ? (

                            (isWindows &&
                                <>
                                    <h5>Follow the steps below to turn on the access for the above mentioned features to continue with your Ai Interview process -</h5>
                                    <ul className="steps">
                                        <li className="step">
                                            <div className="text-container">
                                                <i className="number-ellipse">1</i>
                                                <p className="instruction">In Windows Settings, open Privacy & security</p>
                                            </div>

                                        </li>
                                        <li className="step">
                                            <div className="text-container">
                                                <i className="number-ellipse">2</i>
                                                <p className="instruction">Make sure that below permissions are granted for camera and microphone -</p>
                                            </div>
                                            <div className="instruction-img">
                                                <img src={IMAGE_URL + 'permissions/' + "system-permission-1.jpg"} alt="site-settings" />
                                            </div>
                                            <hr />
                                            <div className="instruction-img">
                                                <img src={IMAGE_URL + 'permissions/' + "system-permission-2.jpg"} alt="site-settings" />
                                            </div>
                                        </li>
                                        <li className="step">
                                            <div className="text-container">
                                                <i className="number-ellipse">3</i>
                                                <p className="instruction">Refresh your screening page after successfully updating these settings to proceed</p>
                                            </div>
                                        </li>
                                    </ul>
                                </>
                            )
                        ) : (permissionsGranted.window === 'denied' && permissionsGranted.camera !== 'denied' && permissionsGranted.microphone !== 'denied') ? (
                            <>
                                <h5>Follow the steps below to turn on the access for the above mentioned features to continue with your Ai Interview process -</h5>
                                <ul className="steps">
                                    <li className="step">
                                        <div className="text-container">
                                            <i className="number-ellipse">1</i>
                                            <p className="instruction">On the top left corner, beside your URL field click on the menu option <b>‘ <SettingSvg /> ‘</b> and turn on the access to window management as shown below</p>
                                        </div>
                                        <div className="instruction-img">
                                            <img src={IMAGE_URL + 'permissions/' + "window-instruction.svg"} alt="site-settings" />
                                        </div>
                                    </li>
                                    <li className="step">
                                        <div className="text-container">
                                            <i className="number-ellipse">2</i>
                                            <p className="instruction">Refresh your screening page after successfully updating this permission setting to proceed</p>
                                        </div>
                                    </li>
                                </ul>
                            </>

                        ) : (
                            <>
                                <h5>Follow the steps below to turn on the access for the above mentioned features to continue with your Ai Interview process -</h5>
                                <ul className="steps">
                                    <li className="step">
                                        <div className="text-container">
                                            <i className="number-ellipse">1</i>
                                            <p className="instruction">On the top left corner, beside your URL field click on the menu option <b>‘Site settings‘</b> as shown below</p>
                                        </div>
                                        <div className="instruction-img">
                                            <img src={IMAGE_URL + 'permissions/' + "instruction1.svg"} alt="site-settings" />
                                        </div>
                                    </li>
                                    <li className="step">
                                        <div className="text-container">
                                            <i className="number-ellipse">2</i>
                                            <p className="instruction">Make sure to change the option to <b>‘Allow’</b>, for both ‘Camera’ and ‘Microphone’</p>
                                        </div>
                                        <div className="instruction-img image2">
                                            <img src={IMAGE_URL + 'permissions/' + "instruction2.svg"} alt="site-settings" />
                                            <div className="rectangle1"></div>
                                            <div className="rectangle2"></div>
                                        </div>
                                    </li>
                                    <li className="step">
                                        <div className="text-container">
                                            <i className="number-ellipse">3</i>
                                            <p className="instruction">Refresh your screening page after successfully updating these permission settings</p>
                                        </div>
                                        <div className="instruction-img">
                                            <img src={IMAGE_URL + 'permissions/' + "instruction3.svg"} alt="site-settings" />
                                        </div>
                                    </li>
                                </ul>
                            </>
                        )}
                    </div>

                    <div className="modal-cta-row">
                        <button className="button" onClick={handleClose}>GOT IT</button>
                        {
                            permissionsGranted.system === 'denied' && isWindows &&
                            <a href="ms-settings:privacy" target="_blank">
                                Open Windows Settings
                            </a>
                        }
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default PermissionDeniedModal