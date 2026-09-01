'use client';

import Modal from 'react-modal';
import { CloseModalIcon } from '@/talent/assets/IconSVG';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
import HSContent from '@/talent/pages/app/work/HSContent';

ensureModalAppElement();

export default function JobDescriptionViewModal({ isOpen, setIsOpen, data }) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            portalClassName="react-modal-portal"
            className="modal commonModal tailor-jd-view-modal"
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setIsOpen(false)}>
                        <CloseModalIcon />
                    </button>
                    <div className="tr-jd-view">
                        <h2>Job Description</h2>
                        <div className="tr-jd-content">
                            <HSContent content={data} isAggregatorContent={true} />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
