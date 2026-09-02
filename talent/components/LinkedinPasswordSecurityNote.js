import './LinkedinPasswordSecurityNote.css';

const LINKEDIN_PASSWORD_SHIELD_SRC = '/images/talent/happpy-agent/linkedin-password-shield.svg';

export const LINKEDIN_PASSWORD_SECURITY_NOTE =
    'We never store your password. We use a secure, unreadable token - just like you save cards on Swiggy or Flipkart.';

export default function LinkedinPasswordSecurityNote() {
    return (
        <div className="linkedin-password-security-note" role="note">
            <div className="linkedin-password-security-note__content">
                <img
                    src={LINKEDIN_PASSWORD_SHIELD_SRC}
                    alt=""
                    aria-hidden="true"
                    className="linkedin-password-security-note__icon"
                />
                <span className="linkedin-password-security-note__text">{LINKEDIN_PASSWORD_SECURITY_NOTE}</span>
            </div>
        </div>
    );
}
