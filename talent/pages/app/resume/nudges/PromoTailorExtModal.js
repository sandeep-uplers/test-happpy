import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { CloseModalIcon, ResumeExternalLink } from '../../../../assets/IconSVG';
import { useEffect, useState } from 'react';
import { differenceInHours } from 'date-fns';
import { trackDownloadTailorExtensionClicked } from '../../../../store/actions/trackingActions';
import { useSelector } from 'react-redux';
import { IMAGE_URL } from '../../../../components/Constant';

export default function PromoTailorExtModal({ justTailored = false, setJustTailored = () => { } }) {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = window.innerWidth < 768;
    const { user } = useSelector(state => state.auth);
    const is_tailored_paid = user?.resume_tailored?.is_tailored_paid;

    useEffect(() => {
        if (user?.outreach?.chrome_extension || !is_tailored_paid) {
            return;
        }
        if (justTailored) {
            const interactedData = localStorage.getItem('justTailoredExtModalInteracted');
            let lastInteractedDate = interactedData ? new Date(parseInt(interactedData, 10)) : '';
            // not open in /talent/job-agent page
            if ((!lastInteractedDate || differenceInHours(new Date(), lastInteractedDate) > 72) && !isMobile && !window.location.pathname.includes('/talent/job-agent')) {
                setIsOpen(true);
            }
        } else {
            const interactedData = localStorage.getItem('promoTailorExtModalInteracted');
            let lastInteractedDate = interactedData ? new Date(parseInt(interactedData, 10)) : '';
            if ((!lastInteractedDate || differenceInHours(new Date(), lastInteractedDate) > 12) && !isMobile && !window.location.pathname.includes('/talent/job-agent')) {
                setIsOpen(true);
                // healthcheckPromoteModalVisibleTracking(isProductTalent ? 'Product based' : 'Service Based');
            }
        }
    }, [justTailored])

    const handleClose = () => {
        setIsOpen(false);
        if (justTailored) {
            setJustTailored(false);
            localStorage.setItem('justTailoredExtModalInteracted', new Date().getTime());
        } else {
            localStorage.setItem('promoTailorExtModalInteracted', new Date().getTime());
        }
    }
    const onClickDownload = () => {
        window.open('https://chromewebstore.google.com/detail/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en', '_blank');
        if (justTailored) {
            trackDownloadTailorExtensionClicked('just_tailored_ext_modal');
        } else {
            trackDownloadTailorExtensionClicked('promo_tailor_ext_modal');
        }
        handleClose();
    }


    return (
        <>
            {!isMobile &&
                <Modal
                    isOpen={isOpen}
                    portalClassName="react-modal-portal"
                    className={`modal commonModal promote-healthcheck-modal tailor-ext`}
                    shouldCloseOnOverlayClick={false}
                >
                    <div className="modal-dialog modal-dialog-centered" role="document">
                        <div className="modal-content ">
                            <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                                <CloseModalIcon />
                            </button>
                            <div className='header'>
                                <div className="badge">
                                    <span className="badge-icon" aria-hidden="true">🎁</span>
                                    <span className="badge-text">You’ve Unlocked Happpy Agent- FOR FREE!</span>
                                </div>
                            </div>
                            <div className='content'>
                                <div className="headline">
                                    <h3>Tailor - Apply - Get Referred</h3>
                                    <h4>In One Seamless Flow</h4>
                                </div>
                                <div className='subtitle'>Install the new extension to run the entire workflow in just a click, from any job board!</div>

                                <div className="unlock-strip">
                                    <div className="unlock-icon">
                                        <img src={IMAGE_URL + 'unlock-icon.png'} />
                                    </div>
                                    <div className="unlock-text">
                                        <strong>Happpy Agent is now active on your account for FREE!</strong>
                                        <span>It will automatically reach out to referrals on LinkedIn + email with your tailored resume</span>
                                    </div>
                                </div>

                                <div className="steps-section">
                                    <div className="steps-label">How the full flow works</div>
                                    <div className="steps-list">
                                        <div className="step">
                                            <div className="step-num">1</div>
                                            <div className="step-text">Open any job on LinkedIn, Naukri, Indeed, or any ATS page</div>
                                        </div>
                                        <div className="step">
                                            <div className="step-num">2</div>
                                            <div className="step-text">One click - resume tailors to that JD and agent reaches out to referrals with it</div>
                                        </div>
                                        <div className="step step-accent">
                                            <div className="step-num">3</div>
                                            <div className="step-text">Apply on the job link - when the referral responds, you've already applied!</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="uninstall-strip">
                                    <div className="warn-icon">⚠️</div>
                                    <div className="uninstall-text">Already using our extension? Uninstall it - the new one comes bundled with all capabilities, nothing else</div>
                                </div>

                            </div>
                            {justTailored && (
                                <button className='underlinedBtn' onClick={handleClose} >
                                    I'll do it later
                                </button>
                            )}
                            <button className='primaryBtn' onClick={onClickDownload} >
                                Install The New Extension <ResumeExternalLink />
                            </button>
                            <div className='ext-modal-footer'>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.78468 6.12602C8.94561 5.94578 8.92995 5.66921 8.74971 5.50829C8.56948 5.34736 8.29291 5.36302 8.13199 5.54325L6.375 7.51108L5.86801 6.94325C5.70709 6.76302 5.43052 6.74736 5.25028 6.90829C5.07005 7.06921 5.05439 7.34578 5.21532 7.52602L6.04865 8.45935C6.13166 8.55232 6.25037 8.60547 6.375 8.60547C6.49963 8.60547 6.61834 8.55232 6.70135 8.45935L8.78468 6.12602Z" fill="#186347" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M7 0.730469C6.45311 0.730469 5.93094 0.909309 5.08864 1.19779L4.6643 1.34305C3.80019 1.63883 3.13332 1.86711 2.65593 2.06104C2.41546 2.15874 2.20871 2.25336 2.04224 2.35004C1.88203 2.44308 1.72131 2.55913 1.61212 2.7147C1.50419 2.86848 1.44838 3.05753 1.41331 3.23951C1.37685 3.42871 1.35486 3.65567 1.34067 3.91626C1.3125 4.43368 1.3125 5.14252 1.3125 6.06192V6.99626C1.3125 10.5552 4.00052 12.2615 5.59903 12.9598L5.61484 12.9667C5.81305 13.0533 5.99936 13.1347 6.21344 13.1895C6.43946 13.2474 6.6796 13.2721 7 13.2721C7.3204 13.2721 7.56054 13.2474 7.78656 13.1895C8.00063 13.1347 8.18694 13.0533 8.38515 12.9667L8.40097 12.9598C9.99948 12.2615 12.6875 10.5552 12.6875 6.99626V6.06203C12.6875 5.14257 12.6875 4.4337 12.6593 3.91626C12.6451 3.65567 12.6232 3.42871 12.5867 3.23951C12.5516 3.05753 12.4958 2.86848 12.3879 2.7147C12.2787 2.55913 12.118 2.44308 11.9578 2.35004C11.7913 2.25336 11.5845 2.15874 11.3441 2.06104C10.8667 1.86711 10.1998 1.63883 9.33569 1.34305L8.91136 1.19779C8.06906 0.909309 7.54689 0.730469 7 0.730469ZM5.29703 2.05131C6.23884 1.72892 6.61632 1.60547 7 1.60547C7.38368 1.60547 7.76116 1.72892 8.70298 2.05131L9.03712 2.16569C9.91946 2.46772 10.5629 2.68816 11.0147 2.8717C11.2402 2.96332 11.4036 3.04009 11.5183 3.1067C11.575 3.13958 11.614 3.16671 11.64 3.18789C11.6621 3.20584 11.6705 3.216 11.6717 3.2175C11.6729 3.21932 11.6801 3.23143 11.6903 3.26011C11.702 3.29285 11.7149 3.33977 11.7275 3.40509C11.753 3.53729 11.7723 3.71889 11.7856 3.96384C11.8123 4.45453 11.8125 5.1395 11.8125 6.07768V6.99626C11.8125 10.0151 9.55506 11.5008 8.05071 12.158C7.83401 12.2526 7.70887 12.3062 7.56957 12.3419C7.43652 12.3759 7.27417 12.3971 7 12.3971C6.72583 12.3971 6.56348 12.3759 6.43043 12.3419C6.29113 12.3062 6.16599 12.2526 5.94929 12.158C4.44494 11.5008 2.1875 10.0151 2.1875 6.99626V6.07768C2.1875 5.1395 2.18766 4.45453 2.21438 3.96384C2.22772 3.71889 2.24702 3.53729 2.2725 3.40509C2.28509 3.33977 2.29801 3.29285 2.30967 3.26011C2.31988 3.23145 2.32713 3.21933 2.32825 3.2175C2.32946 3.21602 2.33788 3.20585 2.35997 3.18789C2.38603 3.16671 2.42505 3.13958 2.48167 3.1067C2.59636 3.04009 2.75975 2.96332 2.98526 2.8717C3.43706 2.68816 4.08054 2.46772 4.96288 2.16569L5.29703 2.05131Z" fill="#186347" />
                                </svg>
                                100% safe - only reads the job description, nothing else
                            </div>
                        </div>
                    </div>
                </Modal>
            }
        </>
    )
}
