import React from "react";

import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
export default function ConfirmActionModal({
    isOpen, setOpen, head, title, description, text, subtitle, onPrimaryActionClick,
    primaryActionText, secondaryActionBtn, secondaryActionText, onSecondaryActionClick,
    onCancel, noCancel, modalClass,
    thirdActionBtn, thirdActionText, onThirdActionClick
}) {

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
                    {!noCancel &&
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={onCancel}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    }
                    <div className="modal-body">
                        {head && <h5 className="">{head}</h5>}
                        {title && <><h3>{title}</h3></>}
                        {subtitle && <h3 style={{ fontWeight: "normal" }}>{subtitle}</h3>}
                        {description && <h6 style={{ fontWeight: "normal" }}>{description}</h6>}
                        {text && <text>{text}</text>}

                        <div className="modalAction">
                            {thirdActionBtn &&
                                <button type="button" className={`underlinedBtn`}
                                    onClick={onThirdActionClick}
                                    style={{ paddingBlock: 0 }}
                                >
                                    {thirdActionText}
                                </button>
                            }
                            {secondaryActionBtn &&
                                <button type="button" className={`primaryBtn outlinedBtn`} data-dismiss="modal"
                                    onClick={onSecondaryActionClick}>
                                    {secondaryActionText}
                                </button>
                            }
                            <button type="button"
                                className={`primaryBtn btn primary-btn`}
                                onClick={onPrimaryActionClick}
                            >
                                {primaryActionText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}