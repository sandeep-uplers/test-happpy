import React from "react"

import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
export default function ConfirmationModal({
    isOpen, setOpen, head, title, description, text, subtitle, onPrimaryClick,
    primaryBtnText, secondaryBtnText, secondaryBtnClass, onSecondaryClick,
    onCancel, noSecondaryAction, noCancel, modalClass }) {

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setOpen(false)}
            // style={customStyles}
            portalClassName="react-modal-portal"
            className={`modal commonModal fade ${isOpen && "show"} ${modalClass}`}
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
                        {head && <h5 className="">{head}</h5>}
                        {title && <><h3>{title}</h3></>}
                        {subtitle && <h3 style={{ fontWeight: "normal" }}>{subtitle}</h3>}
                        {description && <h6 style={{ fontWeight: "normal" }}>{description}</h6>}
                        {text && <text>{text}</text>}

                        <div className="modalAction">
                            <button type="button"
                                className={`btn primary-btn ${noSecondaryAction ? '' : 'modalBackBtn'}`}
                                onClick={onPrimaryClick}
                            >
                                {primaryBtnText}
                            </button>
                            {!noSecondaryAction &&
                                <button type="button" className={`btn secondary-btn ${secondaryBtnClass}`} data-dismiss="modal"
                                    onClick={onSecondaryClick}>
                                    {secondaryBtnText}
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}