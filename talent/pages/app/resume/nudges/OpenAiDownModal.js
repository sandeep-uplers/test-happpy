
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch, useSelector } from 'react-redux';
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../../components/Constant';
import { SET_OPENAI_DOWN_MODAL } from '../../../../store/actions/actionsTypes';

export default function OpenAiDownModal() {
    const dispatch = useDispatch();
    const { openAiDownModal } = useSelector(state => state.resume);
    const handleClose = () => {
        dispatch({ type: SET_OPENAI_DOWN_MODAL, payload: false });
    }

    return (
        <>

            <Modal
                isOpen={openAiDownModal}
                portalClassName="react-modal-portal"
                className={`modal commonModal open-ai-down-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                            <CloseModalIcon />
                        </button>
                        <div className="modal-body">
                            <img src={IMAGE_URL + 'ai_down_illustration.png'} alt="ai-down" />
                            <h5>Oops! We’re facing a hiccup!</h5>
                            <text>We’re working on fixing the problem</text>
                            <text>Please try again later.</text>
                            <button className='primaryBtn' onClick={handleClose}>got it! i’ll try again later</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
