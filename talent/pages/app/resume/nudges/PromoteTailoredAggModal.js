import { useEffect } from 'react';
import Modal from 'react-modal';
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../../components/Constant';
import { trackTailorPromoteAggModalClicked, trackTailorPromoteAggModalOpen } from '../../../../store/actions/trackingActions';
import { useSelector } from 'react-redux';


export default function PromoteTailoredAggModal({ isOpen, setIsOpen, onSkip, hrData, handleCustomizeResume }) {

    const { user } = useSelector(state => state.auth);
    useEffect(() => {
        if (isOpen) {
            trackTailorPromoteAggModalOpen({ HR_Number: hrData.HR_Number });
        }
    }, [isOpen]);
    const handleClose = () => {
        localStorage.setItem('promoTailorAggModalInteracted_' + hrData.HR_Number, new Date().getTime());
        setIsOpen(false);
        onSkip();
    }
    const onClickReview = () => {
        localStorage.setItem('promoTailorAggModalInteracted_' + hrData.HR_Number, new Date().getTime());
        handleCustomizeResume('promote-tailored-agg-modal');
        setIsOpen(false);
        trackTailorPromoteAggModalClicked({ HR_Number: hrData.HR_Number });
    }


    return (
        <>
            <Modal
                isOpen={isOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal promote-healthcheck-modal agg-apply`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                            <CloseModalIcon />
                        </button>
                        <div className='transform-modal'>
                            <div className='header'>
                                <h6>🔥 Customize Your Resume in 10 seconds</h6>
                                <strong>Your resume is on the right track, but essential keywords are missing</strong>
                            </div>
                            <button className='primaryBtn gradientBtn' onClick={onClickReview}>
                                <img src={IMAGE_URL + "flash-icon.svg"} />
                                Tailor Resume & Apply
                            </button>
                        </div>
                        <button className='ghostBtn' onClick={handleClose}>
                            Apply Without Tailoring
                        </button>

                    </div>
                </div>
            </Modal>
        </>
    )
}