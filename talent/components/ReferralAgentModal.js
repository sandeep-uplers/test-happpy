import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { startOutreachAgent, incrementHapppyAgentDailyUsed } from "../store/actions/UserActions";
import { useDispatch } from "react-redux";
import { CloseModalIcon } from "../assets/IconSVG";


const modalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    position: "relative",
    inset: "auto",
    maxWidth: "440px",
    width: "90%",
    padding: "0",
    border: "none",
    borderRadius: "16px",
    background: "#fff",
    overflow: "hidden",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
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
      }
      const res = await startOutreachAgent(payload)(dispatch);

      if (res.data.status === "redirect") {
        setModalStatus(STATUS.REDIRECT);
        setMessage("Please connect your Gmail and LinkedIn accounts to use the Happpy Agent.");
      } else if (res.data.status === "success") {
        dispatch(incrementHapppyAgentDailyUsed());
        setModalStatus(STATUS.SUCCESS);

        setMessage((res.data.message || "Your referral request has been submitted successfully") + ` with ${payloadHtml ? "tailored" : "profile"} resume`);
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
      const msg = err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.";
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

  const renderIcon = () => {
    if (modalStatus === STATUS.LOADING) {
      return (
        <div style={styles.iconWrapper}>
          <div style={styles.spinner}></div>
        </div>
      );
    }
    if (modalStatus === STATUS.SUCCESS) {
      return (
        <div style={{ ...styles.iconWrapper, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      );
    }
    if (modalStatus === STATUS.ERROR) {
      return (
        <div style={{ ...styles.iconWrapper, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      );
    }
    if (modalStatus === STATUS.REDIRECT) {
      return (
        <div style={{ ...styles.iconWrapper, background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
      );
    }
    if (modalStatus === STATUS.PLAN_EXPIRED) {
      return (
        <div style={{ ...styles.iconWrapper, background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
          </svg>
        </div>
      );
    }
    return null;
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={modalStatus !== STATUS.LOADING ? handleClose : undefined}
      style={modalStyles}
      shouldCloseOnOverlayClick={modalStatus !== STATUS.LOADING}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}
      </style>

      <div style={styles.container}>
        {modalStatus !== STATUS.LOADING && (
          <button onClick={handleClose} style={styles.closeButton} aria-label="Close modal">
            <CloseModalIcon />
          </button>
        )}

        <div style={styles.content}>
          {renderIcon()}

          <h2 style={styles.title}>{getTitle()}</h2>

          {modalStatus === STATUS.LOADING ? (
            <p style={styles.loadingText}>Please wait while we process your referral request...</p>
          ) : (
            <p style={styles.message} dangerouslySetInnerHTML={{ __html: message }}></p>
          )}

          <div style={styles.buttonContainer}>
            {modalStatus === STATUS.SUCCESS && (
              <button onClick={handleClose} style={styles.primaryButton}>
                Done
              </button>
            )}

            {modalStatus === STATUS.ERROR && (
              <>
                <button onClick={handleClose} style={styles.secondaryButton}>
                  Close
                </button>
                <button onClick={handleSubmit} style={styles.primaryButton}>
                  Try Again
                </button>
              </>
            )}

            {modalStatus === STATUS.REDIRECT && (
              <>
                <button onClick={handleClose} style={styles.secondaryButton}>
                  Cancel
                </button>
                <button onClick={handleRedirect} style={styles.primaryButton}>
                  Connect Accounts
                </button>
              </>
            )}

            {modalStatus === STATUS.PLAN_EXPIRED && (
              <>
                <button onClick={handleClose} style={styles.secondaryButton}>
                  Close
                </button>
                <button onClick={handleGoToOutreachAgent} style={styles.primaryButton}>
                  Subscribe & Continue
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    position: "relative",
    padding: "32px 24px",
  },
  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    animation: "fadeInUp 0.3s ease-out",
  },
  iconWrapper: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px",
    margin: "0 0 12px 0",
  },
  message: {
    fontSize: "15px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "24px",
    maxWidth: "320px",
    margin: "0 0 24px 0",
  },
  loadingText: {
    fontSize: "15px",
    color: "#6b7280",
    lineHeight: "1.6",
    marginBottom: "8px",
    animation: "pulse 2s ease-in-out infinite",
    margin: "0 0 8px 0",
  },
  buttonContainer: {
    display: "flex",
    gap: "12px",
    width: "100%",
    justifyContent: "center",
    marginTop: "8px",
  },
  primaryButton: {
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#fff",
    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px 0 rgba(99, 102, 241, 0.39)",
  },
  secondaryButton: {
    padding: "12px 28px",
    fontSize: "15px",
    fontWeight: "500",
    color: "#4b5563",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default ReferralAgentModal;
