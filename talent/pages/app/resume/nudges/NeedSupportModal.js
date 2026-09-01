import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useParams } from '@/talent/navigation/routerCompat';
import { SET_NOTIFY_SUCCESS } from '../../../../store/actions/actionsTypes';
import { raiseResumeSupportRequest } from '../../../../store/actions/UserActions';
import { useDispatch } from 'react-redux';

export default function NeedSupportModal({ isOpen, setIsOpen, setIsSupportRequestOpen, fromTailorDashboard = false, canRaiseRefundRequest = false }) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const location = useLocation();
    const params = useParams();
    const dispatch = useDispatch();

    const handleClose = () => {
        setIsOpen(false);
    }
    const handleSubmitRequest = () => {
        // send message to support api
        if (message.trim() === '') {
            toast.error('Please enter your message');
            return;
        }
        const pathname = location.pathname;
        let page = '';
        if (pathname.includes('resume-health-check') && params.health_check_id && pathname.includes('payment')) {
            page = 'Resume Payment Success';
        } else if (pathname.includes('resume-health-check') && params.health_check_id) {
            page = 'Resume Health Report';
        } else {
            page = 'Resume Dashboard';
        }
        let payload = {
            message,
            page: page,
            health_id: params.health_check_id || '',
        }
        if (fromTailorDashboard) {
            payload = {
                message,
                page: 'Tailor Dashboard'
            }
        }
        setIsSubmitting(true);
        raiseResumeSupportRequest(payload, fromTailorDashboard)(dispatch)
            .then((res) => {
                setIsOpen(false);
                setIsSupportRequestOpen(true);
                let supportRequestKey = fromTailorDashboard ? 'tailor-support-request-raised' : 'support-request-raised';
                localStorage.setItem(supportRequestKey, new Date());
                dispatch({
                    type: SET_NOTIFY_SUCCESS,
                    payload: { open: true, msg: 'Support request raised successfully', subText: 'We will reach out to you on your registered email address' }
                })

            }).catch((err) => {
                toast.error('Something went wrong');
            }).finally(() => {
                setIsSubmitting(false);
            })
    }
    return (
        <>
            <Modal
                isOpen={isOpen}
                portalClassName="react-modal-portal"
                className={`modal commonModal post-apply-resume-modal support-query-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                            <CloseModalIcon />
                        </button>
                        <div className='header'>
                            <h5>Contact Support</h5>
                            <text>Let us know if there’s anything specific you’d like us to cover before we reach out, we’ll be ready to help.</text>
                        </div>
                        <div className='content'>
                            <textarea
                                placeholder='Enter your message here...'
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className={`primaryBtn ${isSubmitting ? 'disabled' : ''}`} onClick={handleSubmitRequest} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                            </button>

                            {canRaiseRefundRequest && (
                                <span className='note refundClarification'>
                                    If you wish for Refund, please raise a refund request instead.
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}