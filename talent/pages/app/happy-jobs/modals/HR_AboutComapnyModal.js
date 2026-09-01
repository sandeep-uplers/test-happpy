import React, { useState } from "react";
import Modal from 'react-modal';
import { useDispatch } from "react-redux";
import { upsertVideoCountHR } from "../../../../store/actions/UserActions";
import { AboutVideoCompanies } from "../../../../components/Constant";

export default function HR_AboutComapnyModal({ hrNumber, companyName, ...props }) {
    const [isOpen, setOpen] = useState(false);
    const dispatch = useDispatch()
    const handleOpenVideo = () => {
        setOpen(true);
        let reqMap = {
            hr_number: hrNumber
        }
        upsertVideoCountHR(reqMap)(dispatch)
            .then((res) => { })
    }
    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={() => setOpen(false)}
                // style={customStyles}
                portalClassName="react-modal-portal"
                className={`modal commonModal assessment-modal-wrap contentHeightModal fade ${isOpen && "show"}`}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setOpen(false)}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="modal-body profileImp hrVideoCompanyAbout">
                            <div className="profileImpDiv">
                                <div className="modalFullVideoBox">
                                    <iframe src={AboutVideoCompanies[companyName].video_url} frameborder="0" allowFullScreen
                                        style={{ borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <div onClick={() => handleOpenVideo()}>
                {props.children}
            </div>
        </>
    )
}