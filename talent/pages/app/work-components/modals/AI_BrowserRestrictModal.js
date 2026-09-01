import React from 'react';
import Modal from 'react-modal';
import { IMAGE_URL } from '../../../../components/Constant';




export default function AI_BrowserRestrictModal({ isOpen, closeModal }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => closeModal()}
            portalClassName="react-modal-portal"
            className={`modal commonModalWrap aiScreeningBrowser commonModal fade ${isOpen && "show"}`}
        >

            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => closeModal()}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="modal-body">
                        <div className="content">
                            <img src={IMAGE_URL + 'crashcone_browser_aiscreening.png'} />
                            <div className="rightDiv">
                                <h6>Browser not supported</h6>
                                <p className="subHeader">Currently our Ai Interview is only available on selected browsers</p>
                                <p>We recommend using and logging in another supported browser as listed below and start the screening in order to have an uninterrupted experience</p>
                                <div className="browserList">
                                    <div className="item">
                                        <img src={IMAGE_URL + 'Chrome-logo.svg'} />
                                        Chrome
                                    </div>
                                    <div className="item">
                                        <img src={IMAGE_URL + 'Edge-logo.svg'} />
                                        Microsoft Edge
                                    </div>
                                    <div className="item">
                                        <img src={IMAGE_URL + 'Brave-logo.svg'} />
                                        Brave Browser
                                    </div>
                                </div>
                                <div className="action">
                                    <button className="primaryBtn" onClick={() => closeModal()}>
                                        got it
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