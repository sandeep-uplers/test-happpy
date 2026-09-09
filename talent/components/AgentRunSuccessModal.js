import Modal from 'react-modal';
import { LinkedinConnectedNoticeBullets } from './LinkedinConnectedNotice';
import './AgentRunSuccessModal.css';

const AGENT_RUN_SUCCESS_MASCOT_SRC = '/images/talent/happpy-agent/agent-run-success-mascot.svg';
const AGENT_RUN_SUCCESS_LINKEDIN_SRC = '/images/talent/happpy-agent/agent-run-success-linkedin.svg';

/**
 * Post–agent-run success feedback.
 * Figma: Happpy Agent — Referral, node 2646:43223.
 */
export default function AgentRunSuccessModal({
    open = false,
    linkedinConnected = false,
    dailyLimit = 0,
    isFreeTrial = false,
    onClose = () => {},
}) {
    if (!open) return null;

    return (
        <Modal
            isOpen={open}
            className="modal commonModal agent-run-success-modal"
            overlayClassName="agent-run-success-modal-overlay"
            contentLabel="Agent run successful"
            onRequestClose={onClose}
            shouldCloseOnOverlayClick
        >
            <div className="agent-run-success-modal__card">
                <button
                    type="button"
                    className="agent-run-success-modal__close"
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div className="agent-run-success-modal__body">
                    <img
                        src={AGENT_RUN_SUCCESS_MASCOT_SRC}
                        alt=""
                        aria-hidden="true"
                        className="agent-run-success-modal__mascot"
                    />

                    <div className="agent-run-success-modal__content">
                        <div className="agent-run-success-modal__intro">
                            <h2 className="agent-run-success-modal__title">Agent Run Successful!</h2>
                            <p className="agent-run-success-modal__subtitle">
                                Happpy will be finding the relevant contacts and reaching out to them on
                                your behalf.
                            </p>
                        </div>

                        {linkedinConnected && (
                            <div className="agent-run-success-modal__callout" role="note">
                                <img
                                    src={AGENT_RUN_SUCCESS_LINKEDIN_SRC}
                                    alt=""
                                    aria-hidden="true"
                                    className="agent-run-success-modal__callout-icon"
                                />
                                <LinkedinConnectedNoticeBullets
                                    dailyLimit={dailyLimit}
                                    isFreeTrial={isFreeTrial}
                                    className="agent-run-success-modal__callout-list"
                                />
                            </div>
                        )}

                        <div className="agent-run-success-modal__actions">
                            <button
                                type="button"
                                className="agent-run-success-modal__cta"
                                onClick={onClose}
                            >
                                Got it
                            </button>
                            <p className="agent-run-success-modal__footnote">
                                Sit back and relax, we&apos;ll notify you of any updates.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
