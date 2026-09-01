import { useEffect, useState } from "react";
import { LocationIcon } from "../../../../sections/resume-editor/ResumEditorIcons";
import { CorrectIcon, ExpIcon, RedirectIcon } from "../../../../assets/IconSVG";
import { useSelector } from "react-redux";
import { trackDownloadTailorExtensionClicked } from "../../../../store/actions/trackingActions";

export default function NewTransformLoader({ isExternalJD = false, similarJobs = [], isTransforming = false }) {
    const { user } = useSelector(state => state.auth);
    const [progress, setProgress] = useState(5);
    const isExtensionInstalled = user?.resume_tailored?.tailor_extension_installed;

    useEffect(() => {
        let interval;
        const TOTAL_TIME_MS = 3 * 60 * 1000; // 3 minutes in milliseconds
        const UPDATE_INTERVAL_MS = 100;      // Progress update every 100ms
        const TOTAL_STEPS = TOTAL_TIME_MS / UPDATE_INTERVAL_MS;

        let step = 0;
        interval = setInterval(() => {
            step += 1;
            setProgress((prev) => {
                // Progress should go from 0 to 100 over 3 minutes
                const computed = Math.min((step / TOTAL_STEPS) * 100, 99.5);
                return computed;
            });
        }, UPDATE_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    const handleDownloadTailorExtension = () => {
        window.open('https://chromewebstore.google.com/detail/kcmclelpnfmaegbegdolmgbpicelkncf?hl=en', '_blank');
        trackDownloadTailorExtensionClicked('tailor_loader_third_step');
    }

    return (
        <div className="new-transform-loader-container">
            <div className="tailored-new-transform-loader">
                <div className="tt-loader-content">
                    <SparkleLoader />
                    <div className="tt-loader-text">Generating your {isTransforming ? 'transformed' : 'tailored'} resume</div>
                    <div className="tt-progress-wrapper">
                        <div className="tt-progress-bar">
                            <div className="tt-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        {isTransforming ?
                            <>
                                <div className="tt-progress-text">This may take up to 2-3 mins</div>
                                {/* <div className="tt-progress-text">Once done, you will receive an email with your transformed resume</div> */}
                            </>
                            :
                            <div className="tt-progress-text">This may take up to 3 mins</div>
                        }
                    </div>
                </div>
                {(isExtensionInstalled && similarJobs.length > 0 && !isTransforming) && (
                    <>
                        <hr className="tt-loader-divider" />
                        <div className="tt-similar-jobs-content">
                            <h3 className="tt-sj-title">{isExternalJD ? "Explore jobs that match to your profile while you wait" : "Hey While you wait! You can explore similar job opportunities"}</h3>
                            <div className="tt-sj-cards-list">
                                {similarJobs.map((data, index) => (
                                    <div key={'similarJobCard ' + data.id} className="jobCardContainer">
                                        <div className="tt-job-card">
                                            <div className="jobTitle">
                                                <div className="logo">
                                                    <SimilarJobsCompanyLogo job={data} />
                                                </div>
                                                <div className="main">
                                                    <h5 >
                                                        {data.title}
                                                    </h5>
                                                    <span className="companyName">{data.company}</span>
                                                </div>
                                                {/* <button className={`bookmarkIconBtn ${data.is_saved ? 'saved' : ''}`} onClick={(e) => onBookmarkClick(e, data)}>
                                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                            </svg>
                                        </button> */}
                                            </div>
                                            <ul className="attribs">
                                                {data.experience &&
                                                    <li className="attrib">
                                                        <ExpIcon />
                                                        {data.experience}
                                                    </li>
                                                }

                                                {data.ModeOfWork &&
                                                    <li className="attrib">
                                                        <LocationIcon />
                                                        {data.ModeOfWork?.toLowerCase() == "remote" ?
                                                            "Remote" + (data.city ? (" - " + data.city) : '')
                                                            :
                                                            <>
                                                                {data.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (data.job_location?.length > 0 ?
                                                                    (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : ''))}
                                                                {data.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (data.job_location?.length > 0 ?
                                                                    (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : ''))}
                                                            </>
                                                        }
                                                    </li>
                                                }
                                            </ul>
                                            <button className="primaryBtn tt-open-job-btn" onClick={() => window.open(`${process.env.NEXT_PUBLIC_APP_URL}${data?.link}`, '_blank')}>Open Job In New Tab</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                {(!isExtensionInstalled) && !isTransforming && (
                    <div className="tt-extension-content">
                        <div className="tt-et-top">
                            <h3 className="tt-et-title">👋 Applying elsewhere?</h3>
                            <span className="tt-et-subtitle">Download our extension to tailor your resume at any job portal</span>
                        </div>
                        <div className="tt-et-bottom">
                            <div className="et-top-points">
                                <span className="et-point"><CorrectIcon /> Directly tailor your resume for any job across all application platforms</span>
                                <span className="et-point"><CorrectIcon /> Tailor resumes for unlimited jobs</span>
                            </div>
                            <div className="et-bottom-points">
                                <button className="primaryBtn tt-et-download-btn" onClick={handleDownloadTailorExtension}>
                                    Download Extension
                                    <RedirectIcon />
                                </button>
                                <p className="tt-et-download-note">This will open in a new tab</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="tt-similar-jobs-footer">
                    <p className="tt-sj-footer-note">Note: Do not refresh, close or click back button in this page. This might interrupt the resume generation.</p>
                </div>
            </div>
        </div>
    )
}

const SimilarJobsCompanyLogo = ({ job }) => {
    const [showInitials, setShowInitials] = useState(false);

    useEffect(() => {
        if (job?.company_logo) {
            const img = new Image();
            img.src = job.company_logo;

            img.onload = () => setShowInitials(false);

            img.onerror = () => setShowInitials(true);
        } else {
            setShowInitials(true);
        }
    }, [job?.company_logo]);

    return showInitials ? (
        <div className="custom_company_initialBg">
            <div className="custom_company_initial">
                <h6>{job?.company_name_initials}</h6>
            </div>
        </div>
    ) : (
        <img className="job-img" src={job?.company_logo} alt="companyLogo" />
    );
};

const FRAME_COUNT = 7;
const FRAME_DURATION = 450;

const SparkleLoader = () => {
    const [frame, setFrame] = useState(1);

    useEffect(() => {
        // Start animation immediately
        const interval = setInterval(() => {
            setFrame((prev) => (prev % FRAME_COUNT) + 1);
        }, FRAME_DURATION);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Preload in background (no blocking)
        for (let i = 1; i <= FRAME_COUNT; i++) {
            new Image().src = `/images/transform-loader/bg/sp-bg-${i}.png`;
            new Image().src = `/images/transform-loader/stars/star-${i}.png`;
        }
    }, []);

    return (
        <div className="tt-sparkle-loader">
            <img
                src={`/images/transform-loader/bg/sp-bg-${frame}.png`}
                className="layer bg-layer"
                alt=""
                draggable={false}
            />
            <img
                src={`/images/transform-loader/stars/star-${frame}.png`}
                className="layer"
                alt=""
                draggable={false}
            />
        </div>
    );
};