import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "@/talent/navigation/routerCompat";
import { resumeBannerClickTracking } from "../../../../helpers/Mixpanel";

export default function SingleJobResumeBanner({ noCloseBtn = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const { resumeHealthControl } = useSelector((state) => state.resume);

    const popupId = 'singleJobResumeBanner';
    const interactedLocalStorageKey = popupId + '_interacted_data';
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    useEffect(() => {
        const checkAndShowPopup = () => {
            const interactedData = localStorage.getItem(interactedLocalStorageKey);
            let showPopup = true;
            if (interactedData) {
                const { timestamp } = JSON.parse(interactedData);
                const currentTime = Date.now();

                if (currentTime - timestamp < TWENTY_FOUR_HOURS_MS) {
                    showPopup = false;
                } else {
                    localStorage.removeItem(interactedLocalStorageKey);
                }
            }
            setIsOpen(showPopup);
        };
        const handleStorageChange = (event) => {
            if (event.key === interactedLocalStorageKey) {
                checkAndShowPopup();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        checkAndShowPopup();
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const onClickHandler = (e, reviewClicked = false) => {
        setIsOpen(false);
        const interactionData = {
            interacted: true,
            timestamp: Date.now()
        };
        localStorage.setItem(interactedLocalStorageKey, JSON.stringify(interactionData));
        if(reviewClicked){
            resumeBannerClickTracking('single_job_resume_banner_clicked')
        }
    };

    return (
        <>
            {(isOpen && resumeHealthControl.is_eligible) &&
                <>
                    {/* {resumeHealthControl.transform.status == 3 && resumeHealthControl.health_check.status == 3 ?
                        <div className="single-job-resume-banner tranformed">
                            {!noCloseBtn &&
                                <button className="closeBtn" onClick={onClickHandler}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M12 4L4 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M4 4L12 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                            }
                            <GreenCheckSpark />
                            <div className="right">
                                <h6>Your Transformed Resume is Ready!</h6>
                                <text>View your optimized resume and update your profile with it to increase your chances of landing your dream job.</text>
                                <Link to="/talent/resume-health-check" className="primaryBtn" onClick={onClickHandler}>
                                    view your transformed resume <ExternalLinkIcon />
                                </Link>
                            </div>
                        </div>
                        :
                        resumeHealthControl.health_check.status == 3 ?
                            <div className="single-job-resume-banner">
                                <button className="closeBtn" onClick={onClickHandler}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M12 4L4 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                                        <path d="M4 4L12 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </button>
                                <h6>Your Resume Health Report Is In - Apply All Fixes in One Go!</h6>
                                <text>
                                    See exactly what might be keeping your current resume from getting noticed and
                                    fix it all with an instant resume transformation
                                </text>
                                <Link to="/talent/resume-health-check" state={{ from: 'single job banner' }} className="primaryBtn" onClick={onClickHandler}>
                                    Check report & fix resume
                                </Link>
                            </div>
                            : */}
                    <div className="single-job-resume-banner">
                        <button className="closeBtn" onClick={onClickHandler}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M4 4L12 12" stroke="#676767" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                        <h6>Want to Get 3x More Interviews?</h6>
                        <text>Check your resume's health now. See exactly what's wrong, what's working, and fix it all within 5 minutes.</text>
                        <div className="checkpoints">
                            <CheckPoint title="ATS Compatibility" />
                            <CheckPoint title="Industry Keywords" />
                            <CheckPoint title="Impact Statements" />
                        </div>
                        <Link to="/talent/resume-health-check/new" className="primaryBtn" onClick={e => onClickHandler(e, true)}>
                            Review & Fix my resume
                        </Link>
                    </div>
                    {/* } */}
                </>
            }
        </>
    )
}

const CheckPoint = ({ title }) => (
    <div className="checkpoint">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clip-path="url(#clip0_17321_126223)">
                <path d="M8 -3C1.939 -3 -3 1.939 -3 8C-3 14.061 1.939 19 8 19C14.061 19 19 14.061 19 8C19 1.939 14.061 -3 8 -3ZM13.258 5.47L7.021 11.707C6.867 11.861 6.658 11.949 6.438 11.949C6.218 11.949 6.009 11.861 5.855 11.707L2.742 8.594C2.423 8.275 2.423 7.747 2.742 7.428C3.061 7.109 3.589 7.109 3.908 7.428L6.438 9.958L12.092 4.304C12.411 3.985 12.939 3.985 13.258 4.304C13.577 4.623 13.577 5.14 13.258 5.47Z" fill="url(#paint0_linear_17321_126223)" />
            </g>
            <defs>
                <linearGradient id="paint0_linear_17321_126223" x1="8" y1="-3" x2="8" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#67B26F" />
                    <stop offset="1" stop-color="#4CA2CD" />
                </linearGradient>
                <clipPath id="clip0_17321_126223">
                    <rect width="16" height="16" rx="8" fill="white" />
                </clipPath>
            </defs>
        </svg>
        <span>{title}</span>
    </div>
)

const GreenCheckSpark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <g clip-path="url(#clip0_17930_219713)">
            <path d="M19.1999 36.7987C18.5655 36.7987 17.9543 36.5475 17.5031 36.0955L11.1031 29.6955C10.1655 28.7587 10.1655 27.2387 11.1031 26.3019C12.0399 25.3643 13.5599 25.3643 14.4967 26.3019L18.9399 30.7451L31.6791 13.7587C32.4759 12.6979 33.9815 12.4843 35.0391 13.2787C36.0999 14.0739 36.3151 15.5787 35.5199 16.6387L21.1199 35.8387C20.7031 36.3955 20.0639 36.7435 19.3703 36.7923C19.3135 36.7963 19.2559 36.7987 19.1999 36.7987Z" fill="#32936F" />
            <path d="M4.8 24.8012H0.8C0.3576 24.8012 0 24.4436 0 24.0012C0 23.5588 0.3576 23.2012 0.8 23.2012H4.8C5.2424 23.2012 5.6 23.5588 5.6 24.0012C5.6 24.4436 5.2424 24.8012 4.8 24.8012Z" fill="#84DE67" />
            <path d="M3.9097 36.3987C3.6329 36.3987 3.3641 36.2555 3.2161 35.9987C2.9953 35.6155 3.1265 35.1267 3.5089 34.9059L6.9729 32.9059C7.3545 32.6859 7.8441 32.8155 8.0657 33.1987C8.2865 33.5819 8.1553 34.0707 7.7729 34.2915L4.3089 36.2915C4.1833 36.3643 4.0457 36.3987 3.9097 36.3987Z" fill="#84DE67" />
            <path d="M12.3994 44.8907C12.2634 44.8907 12.1258 44.8563 12.0002 44.7835C11.617 44.5627 11.4858 44.0731 11.7074 43.6907L13.7074 40.2267C13.929 39.8435 14.4178 39.7123 14.8002 39.9339C15.1826 40.1555 15.3146 40.6443 15.093 41.0267L13.093 44.4907C12.9442 44.7467 12.6762 44.8907 12.3994 44.8907Z" fill="#84DE67" />
            <path d="M23.9997 48.0004C23.5573 48.0004 23.1997 47.6428 23.1997 47.2004V43.2004C23.1997 42.758 23.5573 42.4004 23.9997 42.4004C24.4421 42.4004 24.7997 42.758 24.7997 43.2004V47.2004C24.7997 47.6428 24.4421 48.0004 23.9997 48.0004Z" fill="#84DE67" />
            <path d="M35.6011 44.8904C35.3243 44.8904 35.0555 44.7472 34.9075 44.4904L32.9075 41.0264C32.6867 40.6432 32.8179 40.1544 33.2003 39.9336C33.5811 39.7128 34.0715 39.8432 34.2931 40.2264L36.2931 43.6904C36.5139 44.0736 36.3827 44.5624 36.0003 44.7832C35.8747 44.856 35.7371 44.8904 35.6011 44.8904Z" fill="#84DE67" />
            <path d="M44.0904 36.401C43.9544 36.401 43.8168 36.3666 43.6912 36.2938L40.2272 34.2938C39.844 34.073 39.7128 33.5834 39.9344 33.201C40.1552 32.8178 40.6456 32.6874 41.0272 32.9082L44.4912 34.9082C44.8744 35.129 45.0056 35.6186 44.784 36.001C44.6352 36.2578 44.3672 36.401 44.0904 36.401Z" fill="#84DE67" />
            <path d="M47.1999 24.8012H43.1999C42.7575 24.8012 42.3999 24.4436 42.3999 24.0012C42.3999 23.5588 42.7575 23.2012 43.1999 23.2012H47.1999C47.6423 23.2012 47.9999 23.5588 47.9999 24.0012C47.9999 24.4436 47.6423 24.8012 47.1999 24.8012Z" fill="#84DE67" />
            <path d="M40.628 15.2002C40.3512 15.2002 40.0824 15.057 39.9344 14.8002C39.7136 14.417 39.8448 13.9282 40.2272 13.7074L43.6912 11.7074C44.0728 11.4858 44.5632 11.617 44.784 12.0002C45.0048 12.3834 44.8736 12.8722 44.4912 13.093L41.0272 15.093C40.9016 15.1658 40.764 15.2002 40.628 15.2002Z" fill="#84DE67" />
            <path d="M33.5991 8.17197C33.4631 8.17197 33.3255 8.13757 33.1999 8.06477C32.8167 7.84397 32.6855 7.35437 32.9071 6.97197L34.9071 3.50797C35.1279 3.12477 35.6175 2.99357 35.9999 3.21517C36.3823 3.43677 36.5143 3.92557 36.2927 4.30797L34.2927 7.77197C34.1439 8.02797 33.8759 8.17197 33.5991 8.17197Z" fill="#84DE67" />
            <path d="M24.0002 5.6C23.5578 5.6 23.2002 5.2424 23.2002 4.8V0.8C23.2002 0.3576 23.5578 0 24.0002 0C24.4426 0 24.8002 0.3576 24.8002 0.8V4.8C24.8002 5.2424 24.4426 5.6 24.0002 5.6Z" fill="#84DE67" />
            <path d="M14.4009 8.17161C14.1241 8.17161 13.8553 8.02841 13.7073 7.77161L11.7073 4.30761C11.4865 3.92441 11.6177 3.43561 12.0001 3.21481C12.3817 2.99401 12.8721 3.12441 13.0929 3.50761L15.0929 6.97161C15.3137 7.35481 15.1825 7.84361 14.8001 8.06441C14.6745 8.13721 14.5369 8.17161 14.4009 8.17161Z" fill="#84DE67" />
            <path d="M7.37215 15.2005C7.23615 15.2005 7.09855 15.1661 6.97294 15.0933L3.50895 13.0933C3.12575 12.8725 2.99455 12.3829 3.21615 12.0005C3.43695 11.6173 3.92655 11.4853 4.30895 11.7077L7.77294 13.7077C8.15615 13.9285 8.28735 14.4181 8.06575 14.8005C7.91695 15.0573 7.64895 15.2005 7.37215 15.2005Z" fill="#84DE67" />
        </g>
        <defs>
            <clipPath id="clip0_17930_219713">
                <rect width="48" height="48" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
        <path d="M12 9.16667V13.1667C12 13.5203 11.8595 13.8594 11.6095 14.1095C11.3594 14.3595 11.0203 14.5 10.6667 14.5H3.33333C2.97971 14.5 2.64057 14.3595 2.39052 14.1095C2.14048 13.8594 2 13.5203 2 13.1667V5.83333C2 5.47971 2.14048 5.14057 2.39052 4.89052C2.64057 4.64048 2.97971 4.5 3.33333 4.5H7.33333" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M10 2.5H14V6.5" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6.6665 9.83333L13.9998 2.5" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)