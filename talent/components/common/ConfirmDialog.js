import React from "react"

import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
export default function ConfirmDialog({
    isOpen, setOpen, title, onPrimaryClick,
    primaryBtnText, secondaryBtnText, onSecondaryClick,
    onCancel, noSecondaryAction, noCancel }) {

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setOpen(false)}
            // style={customStyles}
            portalClassName="react-modal-portal"
            className={`modal commonModal confirmDialog fade ${isOpen && "show"}`}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    {!noCancel && <button type="button" className="modalCloseBtn" aria-label="Close" onClick={onCancel}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>}
                    <div className="modal-body">
                        {title && <><h3>{title}</h3></>}

                        <div className="modalAction">
                            {!noSecondaryAction &&
                                <button type="button" className="outlinedBtn" data-dismiss="modal"
                                    onClick={onSecondaryClick}>
                                    {secondaryBtnText}
                                </button>
                            }
                            <button type="button"
                                className={`btn primaryBtn black`}
                                onClick={onPrimaryClick}
                            >
                                {primaryBtnText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}