import { useState, useEffect } from "react";
import Modal from "react-modal";
import { startOutreachAgent } from "../store/actions/UserActions";
import { useDispatch } from "react-redux";
import { ensureModalAppElement } from "@/talent/helpers/setModalAppElement";
import "./ReferralAgentModal.css";

ensureModalAppElement();

const MASCOT = {
  loading: "/images/talent/outreach/mascot-neutral.svg",
  success: "/images/talent/happpy-agent/agent-run-success-mascot.svg",
  error: "/images/talent/outreach/mascot-exclaim.svg",
  redirect: "/images/talent/outreach/mascot-gmail-concern.svg",
  plan_expired: "/images/talent/outreach/mascot-exclaim.svg",
};

const STATUS = {
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
  REDIRECT: "redirect",
  PLAN_EXPIRED: "plan_expired",
};

const OUTREACH_AGENT_URL = "/talent/job-agent/subscription";

const isPlanExpiredMessage = (msg) =>
  msg && String(msg).toLowerCase().includes("please purchase a plan to continue");

const ReferralAgentModal = ({
  isOpen,
  closeReferralAgentModal,
  onSubmit,
  hrID,
  source,
  payloadHtml = "",
  linkedin_message_id = null,
  gmail_message_id = null,
  custom_resume_id = null,
}) => {
  const [reason, setReason] = useState("");
  const [modalStatus, setModalStatus] = useState(STATUS.LOADING);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const handleClose = () => {
    setReason("");
    setModalStatus(STATUS.LOADING);
    setMessage("");
    closeReferralAgentModal();
  };

  const handleRedirect = () => {
    window.open("/talent/job-agent/configure?tab=connected-accounts", "_blank");
  };

  const handleGoToOutreachAgent = () => {
    window.location.href = OUTREACH_AGENT_URL;
  };

  const handleOutreachAgent = async () => {
    try {
      let payload = {
        hr_id: hrID,
        source: source,
        why_good_fit: reason,
        is_tailored: payloadHtml ? true : false,
        ...(payloadHtml ? { html: payloadHtml } : {}),
        ...(linkedin_message_id ? { linkedin_message_id } : {}),
        ...(gmail_message_id ? { gmail_message_id } : {}),
        ...(custom_resume_id ? { custom_resume_id } : {}),
      };
      const res = await startOutreachAgent(payload)(dispatch);

      if (res.data.status === "redirect") {
        setModalStatus(STATUS.REDIRECT);
        setMessage("Please connect your Gmail and LinkedIn accounts to use the Happpy Agent.");
      } else if (res.data.status === "success") {
        setModalStatus(STATUS.SUCCESS);

        setMessage(
          (res.data.message || "Your referral request has been submitted successfully") +
            ` with ${payloadHtml ? "tailored" : "profile"} resume`
        );
      } else {
        const msg = res.data.message || "Something went wrong. Please try again.";
        if (isPlanExpiredMessage(msg)) {
          setModalStatus(STATUS.PLAN_EXPIRED);
          setMessage(msg);
        } else {
          setModalStatus(STATUS.ERROR);
          setMessage(msg);
        }
      }
    } catch (err) {
      console.log({ err });
      const msg =
        err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.";
      if (isPlanExpiredMessage(msg)) {
        setModalStatus(STATUS.PLAN_EXPIRED);
        setMessage(msg);
      } else {
        setModalStatus(STATUS.ERROR);
        setMessage(msg);
      }
    }
  };

  const handleSubmit = async () => {
    setModalStatus(STATUS.LOADING);
    setMessage("");

    try {
      onSubmit(reason);
      await handleOutreachAgent();
      setReason("");
    } catch (error) {
      console.error("Error submitting:", error);
      setModalStatus(STATUS.ERROR);
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSubmit();
    }
  }, [isOpen]);

  const getTitle = () => {
    switch (modalStatus) {
      case STATUS.LOADING:
        return "Processing Your Request";
      case STATUS.SUCCESS:
        return "Happpy Agent Started!";
      case STATUS.ERROR:
        return "Agent failed to run";
      case STATUS.REDIRECT:
        return "Account Connection Required";
      case STATUS.PLAN_EXPIRED:
        return "Plan Expired";
      default:
        return "";
    }
  };

  const getMascotSrc = () => {
    switch (modalStatus) {
      case STATUS.LOADING:
        return MASCOT.loading;
      case STATUS.SUCCESS:
        return MASCOT.success;
      case STATUS.ERROR:
        return MASCOT.error;
      case STATUS.REDIRECT:
        return MASCOT.redirect;
      case STATUS.PLAN_EXPIRED:
        return MASCOT.plan_expired;
      default:
        return MASCOT.loading;
    }
  };

  const loadingMessage = "Please wait while we process your referral request...";

  return (
    <Modal
      isOpen={isOpen}
      className="modal commonModal referral-agent-modal"
      overlayClassName="referral-agent-modal-overlay"
      contentLabel={getTitle()}
      onRequestClose={modalStatus !== STATUS.LOADING ? handleClose : undefined}
      shouldCloseOnOverlayClick={modalStatus !== STATUS.LOADING}
    >
      <div className="referral-agent-modal__card">
        {modalStatus !== STATUS.LOADING && (
          <button
            type="button"
            className="referral-agent-modal__close"
            aria-label="Close"
            onClick={handleClose}
          >
            ✕
          </button>
        )}

        <div className="referral-agent-modal__body">
          <div className="referral-agent-modal__mascot-wrap">
            <img
              src={getMascotSrc()}
              alt=""
              aria-hidden="true"
              className="referral-agent-modal__mascot"
            />
          </div>

          <div className="referral-agent-modal__content">
            <div className="referral-agent-modal__intro">
              <h2 className="referral-agent-modal__title">{getTitle()}</h2>
              {modalStatus === STATUS.LOADING ? (
                <>
                  <p
                    className="referral-agent-modal__message referral-agent-modal__message--loading"
                  >
                    {loadingMessage}
                  </p>
                  <div className="referral-agent-modal__spinner" aria-hidden="true" />
                </>
              ) : (
                <p
                  className="referral-agent-modal__message"
                  dangerouslySetInnerHTML={{ __html: message }}
                />
              )}
            </div>

            {modalStatus !== STATUS.LOADING && (
              <div className="referral-agent-modal__actions">
                {modalStatus === STATUS.SUCCESS && (
                  <button type="button" className="referral-agent-modal__cta" onClick={handleClose}>
                    Done
                  </button>
                )}

                {modalStatus === STATUS.ERROR && (
                  <div className="referral-agent-modal__button-row">
                    <button
                      type="button"
                      className="referral-agent-modal__cta referral-agent-modal__cta--secondary"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                    <button type="button" className="referral-agent-modal__cta" onClick={handleSubmit}>
                      Try Again
                    </button>
                  </div>
                )}

                {modalStatus === STATUS.REDIRECT && (
                  <div className="referral-agent-modal__button-row">
                    <button
                      type="button"
                      className="referral-agent-modal__cta referral-agent-modal__cta--secondary"
                      onClick={handleClose}
                    >
                      Cancel
                    </button>
                    <button type="button" className="referral-agent-modal__cta" onClick={handleRedirect}>
                      Connect Accounts
                    </button>
                  </div>
                )}

                {modalStatus === STATUS.PLAN_EXPIRED && (
                  <div className="referral-agent-modal__button-row">
                    <button
                      type="button"
                      className="referral-agent-modal__cta referral-agent-modal__cta--secondary"
                      onClick={handleClose}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="referral-agent-modal__cta"
                      onClick={handleGoToOutreachAgent}
                    >
                      Subscribe & Continue
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralAgentModal;
