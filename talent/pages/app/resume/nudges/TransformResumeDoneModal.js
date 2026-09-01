
import { formatDistanceToNow } from "date-fns";
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch, useSelector } from 'react-redux';
import { CloseModalIcon } from '../../../../assets/IconSVG';
import { IMAGE_URL } from '../../../../components/Constant';
import { SET_TRANSFORM_DONE_MODAL } from '../../../../store/actions/actionsTypes';
import { onViewTransformedResume } from '../../../../store/actions/UserActions';
import { shorthandTimeText } from "../../../../components/Helper";
import TransformedResumeSlider from "../TransformedResumeSlider";

export default function TransformResumeDoneModal() {
    const dispatch = useDispatch();
    const { transformDoneModal: data } = useSelector(state => state.resume);

    const onClickViewTransformedResume = () => {
        onViewTransformedResume(data.data.transform.google_doc_urls[0], 'transform_done_popup')(dispatch)
    }
    const onClickUseTemplate = (template_index) => {
        onViewTransformedResume(sortedGoogleDocUrls[template_index], "transform_done_popup")(dispatch)
    }

    const handleClose = () => {
        dispatch({ type: SET_TRANSFORM_DONE_MODAL, payload: { open: false, data: {} } });
    }

    const sortedGoogleDocUrls = data.data.transform?.google_doc_urls?.slice().sort((a, b) => {
        if (a.viewed_at && !b.viewed_at) return -1;
        if (!a.viewed_at && b.viewed_at) return 1;

        if (a.viewed_at && b.viewed_at) {
            return new Date(b.viewed_at) - new Date(a.viewed_at);
        }
        return 0;
    })

    const isMobile = window.innerWidth < 768;
    return (
        <>

            <Modal
                isOpen={data.open}
                portalClassName="react-modal-portal"
                className={`modal commonModal post-apply-resume-modal transform-done-modal`}
                shouldCloseOnOverlayClick={false}
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content ">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={handleClose}>
                            <CloseModalIcon />
                        </button>
                        <div className='header'>
                            <svg width="66" height="66" viewBox="0 0 66 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_19275_30064)">
                                    <path d="M26.3998 50.6014C25.5275 50.6014 24.6871 50.256 24.0667 49.6345L15.2667 40.8345C13.9775 39.5464 13.9775 37.4564 15.2667 36.1683C16.5548 34.8791 18.6448 34.8791 19.9329 36.1683L26.0423 42.2777L43.5587 18.9214C44.6543 17.4628 46.7245 17.1691 48.1787 18.2614C49.6373 19.3548 49.9332 21.4239 48.8398 22.8814L29.0398 49.2814C28.4667 50.047 27.5878 50.5255 26.6341 50.5926C26.556 50.5981 26.4768 50.6014 26.3998 50.6014Z" fill="#32936F" />
                                    <path d="M6.6 34.0984H1.1C0.4917 34.0984 0 33.6067 0 32.9984C0 32.3901 0.4917 31.8984 1.1 31.8984H6.6C7.2083 31.8984 7.7 32.3901 7.7 32.9984C7.7 33.6067 7.2083 34.0984 6.6 34.0984Z" fill="#84DE67" />
                                    <path d="M5.37554 50.0513C4.99494 50.0513 4.62534 49.8544 4.42184 49.5013C4.11824 48.9744 4.29864 48.3023 4.82444 47.9987L9.58744 45.2487C10.1121 44.9462 10.7853 45.1244 11.09 45.6513C11.3936 46.1782 11.2132 46.8503 10.6874 47.1539L5.92444 49.9039C5.75174 50.004 5.56254 50.0513 5.37554 50.0513Z" fill="#84DE67" />
                                    <path d="M17.0489 61.7255C16.8619 61.7255 16.6727 61.6782 16.5 61.5781C15.9731 61.2745 15.7927 60.6013 16.0974 60.0755L18.8474 55.3125C19.1521 54.7856 19.8242 54.6052 20.35 54.9099C20.8758 55.2146 21.0573 55.8867 20.7526 56.4125L18.0026 61.1755C17.798 61.5275 17.4295 61.7255 17.0489 61.7255Z" fill="#84DE67" />
                                    <path d="M33.0004 66.0008C32.3921 66.0008 31.9004 65.5091 31.9004 64.9008V59.4008C31.9004 58.7925 32.3921 58.3008 33.0004 58.3008C33.6087 58.3008 34.1004 58.7925 34.1004 59.4008V64.9008C34.1004 65.5091 33.6087 66.0008 33.0004 66.0008Z" fill="#84DE67" />
                                    <path d="M48.9507 61.725C48.5701 61.725 48.2005 61.5281 47.997 61.175L45.247 56.412C44.9434 55.8851 45.1238 55.213 45.6496 54.9094C46.1732 54.6058 46.8475 54.7851 47.1522 55.312L49.9022 60.075C50.2058 60.6019 50.0254 61.274 49.4996 61.5776C49.3269 61.6777 49.1377 61.725 48.9507 61.725Z" fill="#84DE67" />
                                    <path d="M60.6244 50.0518C60.4374 50.0518 60.2482 50.0045 60.0755 49.9044L55.3125 47.1544C54.7856 46.8508 54.6052 46.1776 54.9099 45.6518C55.2135 45.1249 55.8878 44.9456 56.4125 45.2492L61.1755 47.9992C61.7024 48.3028 61.8828 48.976 61.5781 49.5018C61.3735 49.8549 61.005 50.0518 60.6244 50.0518Z" fill="#84DE67" />
                                    <path d="M64.8998 34.0984H59.3998C58.7915 34.0984 58.2998 33.6067 58.2998 32.9984C58.2998 32.3901 58.7915 31.8984 59.3998 31.8984H64.8998C65.5081 31.8984 65.9998 32.3901 65.9998 32.9984C65.9998 33.6067 65.5081 34.0984 64.8998 34.0984Z" fill="#84DE67" />
                                    <path d="M55.8638 20.9C55.4832 20.9 55.1136 20.7031 54.9101 20.35C54.6065 19.8231 54.7869 19.151 55.3127 18.8474L60.0757 16.0974C60.6004 15.7927 61.2747 15.9731 61.5783 16.5C61.8819 17.0269 61.7015 17.699 61.1757 18.0026L56.4127 20.7526C56.24 20.8527 56.0508 20.9 55.8638 20.9Z" fill="#84DE67" />
                                    <path d="M46.1993 11.2372C46.0123 11.2372 45.8231 11.1899 45.6504 11.0898C45.1235 10.7862 44.9431 10.113 45.2478 9.58719L47.9978 4.82419C48.3014 4.29729 48.9746 4.11689 49.5004 4.42159C50.0262 4.72629 50.2077 5.39839 49.903 5.92419L47.153 10.6872C46.9484 11.0392 46.5799 11.2372 46.1993 11.2372Z" fill="#84DE67" />
                                    <path d="M33.0004 7.7C32.3921 7.7 31.9004 7.2083 31.9004 6.6V1.1C31.9004 0.4917 32.3921 0 33.0004 0C33.6087 0 34.1004 0.4917 34.1004 1.1V6.6C34.1004 7.2083 33.6087 7.7 33.0004 7.7Z" fill="#84DE67" />
                                    <path d="M19.8013 11.2367C19.4207 11.2367 19.0511 11.0398 18.8476 10.6867L16.0976 5.9237C15.794 5.3968 15.9744 4.7247 16.5002 4.4211C17.0249 4.1175 17.6992 4.2968 18.0028 4.8237L20.7528 9.5867C21.0564 10.1136 20.876 10.7857 20.3502 11.0893C20.1775 11.1894 19.9883 11.2367 19.8013 11.2367Z" fill="#84DE67" />
                                    <path d="M10.1361 20.9005C9.94909 20.9005 9.75989 20.8532 9.58719 20.7531L4.82419 18.0031C4.29729 17.6995 4.11689 17.0263 4.42159 16.5005C4.72519 15.9736 5.39839 15.7921 5.92419 16.0979L10.6872 18.8479C11.2141 19.1515 11.3945 19.8247 11.0898 20.3505C10.8852 20.7036 10.5167 20.9005 10.1361 20.9005Z" fill="#84DE67" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_19275_30064">
                                        <rect width="66" height="66" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            <h6>Your Transformed Resume Is READY!</h6>
                        </div>
                        <span className="detesSection">
                            <div className="steps">
                                <div className="step">
                                    <StepIcon />
                                    <h6>Step 1: Review & Edit with inbuilt editor</h6>
                                    <text>
                                        You resume will open in the inbuilt editor.
                                        <br />
                                        We've highlighted areas for you to add your real-world metrics in <b>{`{{ }}`}</b> and <span className="orangeText">ORANGE</span> text.
                                    </text>
                                </div>
                                <div className="step">
                                    <StepIcon />
                                    <h6>Step 2: Download the Final PDF</h6>
                                    <text>
                                        Once you've added the your metrics - inside the Google Doc, go to File {`>`} Download {`>`} PDF Document.
                                    </text>
                                </div>
                                <div className="step">
                                    <StepIcon />
                                    <h6>Step 3: Upload to Your Profile.</h6>
                                    <text>
                                        Come back to this tab and upload the new PDF to activate it for recruiters.
                                    </text>
                                </div>
                            </div>
                        </span>
                        <div className='bottom'>
                            {data.data.transform?.google_doc_urls?.length > 1 ?
                                <div className="resume-templates">
                                    <h6>View my transformed resume in Google Docs</h6>
                                    {isMobile ?
                                        <TransformedResumeSlider
                                            sortedGoogleDocUrls={sortedGoogleDocUrls}
                                            onClickUseTemplate={onClickUseTemplate}
                                        />
                                        :
                                        <div className="templates">
                                            {sortedGoogleDocUrls.map((item, index) => (
                                                <div className="template" onClick={e => onClickUseTemplate(index)}>
                                                    {item.viewed_at &&
                                                        <div className="template-header">
                                                            <span className="template-name">{(item.template_name || "classic") + ' Template'}</span>
                                                            <span className="viewed-at">
                                                                Opened {shorthandTimeText(formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true }))}
                                                            </span>
                                                            {item.latest_viewed_at &&
                                                                <div className="last-viewed">
                                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M0.5 6C0.5 6 2.5 2 6 2C9.5 2 11.5 6 11.5 6C11.5 6 9.5 10 6 10C2.5 10 0.5 6 0.5 6Z" stroke="#03661A" stroke-linecap="round" stroke-linejoin="round" />
                                                                        <path d="M6 7.5C6.82843 7.5 7.5 6.82843 7.5 6C7.5 5.17157 6.82843 4.5 6 4.5C5.17157 4.5 4.5 5.17157 4.5 6C4.5 6.82843 5.17157 7.5 6 7.5Z" stroke="#03661A" stroke-linecap="round" stroke-linejoin="round" />
                                                                    </svg>
                                                                    Last viewed
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                    <img src={IMAGE_URL + "resume/" + "transformed_resume_template" + item.template_name + ".png"} />
                                                    <button className={`primaryBtn ${item.viewed_at ? 'viewed' : ''}`}>
                                                        {item.viewed_at ? 'View Resume' : ('See ' + (item.template_name || "classic") + ' Template')}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    }
                                </div>
                                :
                                <button className='primaryBtn' onClick={onClickViewTransformedResume}>
                                    VIEW MY TRANSFORMED RESUME IN GOOGLE DOCS
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M10 2H14V6" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M6.66602 9.33333L13.9993 2" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            }
                            <text>We’ve also mailed your transformed resume to your registered email address</text>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}


const StepIcon = () => {
    return (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19" cy="19" r="19" fill="#E3E6FE" />
            <circle cx="19" cy="19" r="14.5" fill="white" stroke="#384AD7" />
            <circle cx="19" cy="19" r="4" fill="#384AD7" />
        </svg>
    )
}