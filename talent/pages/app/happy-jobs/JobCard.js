import React, { useEffect, useState } from "react";
import { IMAGE_URL } from "../../../components/Constant";
import { formatSkillname, formattedYOE } from "../../../components/Helper";
import CompanyLogo from "./CompanyLogo";
import UplersPartnerBadge from "./UplersPartnerBadge";
import { BookmarkNotification } from "../../../assets/BookmarkNotify";
import { oppBookmark } from "../../../store/actions/UserActions";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDropDownIcon, CloseIcon } from "../../../assets/IconSVG";
import { talentRelevancyTracking, viewJobClickedTracking } from "../../../helpers/Mixpanel";
import { getJobAgentSimilarJobHref } from "../../../helpers/jobPath";
import { SET_BOOKMARK_SIMILAR_JOBS, SET_LOADER } from "../../../store/actions/actionsTypes";
import { toast as toastify } from "react-toastify";
import toast from "react-hot-toast";

export default function JobCard({ data, allData, handleOppBookmark, activeJob, setActiveJob, isAppliedJobs,
    currentIndex = 0, prefilters = {}, filters = {}
}) {

    const [skillEllipsis, setSkillEllipsis] = useState(false);
    const { allOppMasterValue } = useSelector(state => state.work);

    useEffect(() => {
        const skills = document.getElementById("skills_" + data.HR_Number);
        if (skills && skills.scrollWidth > 316) {
            setSkillEllipsis(true);
        }
    }, []);

    const handleJobCardClick = () => {
        if (!isAppliedJobs) {
            talentRelevancyTracking(data, currentIndex + 1, prefilters, filters, allOppMasterValue, 'card', 'all-opportunities-main')
        }
        setActiveJob(isAppliedJobs ? allData : data);
    }

    const onBookmarkClick = (e) => {
        handleOppBookmark(data);
        e.stopPropagation();
    }

    const { similarJobs } = useSelector(state => state.opps)
    const similarJobObj = similarJobs[data.HR_Number]

    const [similarJobsFetching, setSimilarJobsFetching] = useState(false);
    useEffect(() => {
        if (activeJob?.HR_Number === data.HR_Number && !similarJobObj) {
            setSimilarJobsFetching(true);
        } else {
            setSimilarJobsFetching(false);
        }
    }, [activeJob?.HR_Number]);

    return (
        <>
            <div className={`jobCardContainer ${activeJob?.HR_Number === data.HR_Number ? 'active' : ''}`}>
                <div className={`jobCard`} onClick={handleJobCardClick}>
                    {!isAppliedJobs &&
                        <button className={`bookmarkIconBtn ${data.is_partner_company ? '' : 'aggregator'} ${data.is_saved ? 'saved' : ''}`} onClick={onBookmarkClick}>
                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    }
                    {(((allData.frontend_data && allData.frontend_data.frontend_label) || data.top_badge) || (allData.applied_at || data.is_partner_company)) &&
                        <div className={`jobCardHead`}>
                            {allData.frontend_data && allData.frontend_data.frontend_label ?
                                <label
                                    className={`oppHeadActionTag`}
                                    style={{
                                        "color": allData.frontend_data.frontend_label_color,
                                        "backgroundColor": allData.frontend_data.frontend_message_color
                                    }}
                                >
                                    {allData.frontend_data.frontend_label}
                                </label>
                                :
                                <>
                                    {data.top_badge &&
                                        <div className={`${data.is_partner_company ? 'mb-3' : ''}`}>
                                            <div
                                                className="earlyApplicant"
                                                dangerouslySetInnerHTML={{ __html: data.top_badge }}
                                            >
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                            {allData.applied_at &&
                                <div className="appliedAt">
                                    <span>Applied {allData.applied_at}</span>
                                </div>
                            }
                            {(data.is_partner_company && data.company.company_name != "Uplers") &&
                                <UplersPartnerBadge data={data} fullText isTooltip={false} />
                            }

                        </div>
                    }

                    <div className="jobTitle">
                        <div className="logo">
                            <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                        </div>
                        <div className="main">
                            <h6 className={`${data.is_partner_company ? '' : 'padding-right'}`}>
                                {data.RequestForTalent}
                            </h6>
                            <span className="companyName">{data.company?.company_name}</span>
                        </div>
                    </div>

                    <ul className="jobAttribs">
                        {data.YearOfExp &&
                            <li>
                                <ExpIcon />
                                {formattedYOE(data.YearOfExp, data.max_yoe)}
                            </li>
                        }
                        {data.ModeOfWork &&
                            <li>
                                <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
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

                    <div className="skillSection">
                        <strong>Skills:</strong>
                        {data.skill_boolean?.length > 0 ?
                            <SkillBoolean data={data} skillEllipsis={skillEllipsis} />
                            :
                            <div className="skills" id={"skills_" + data.HR_Number}>
                                {data.skills?.filter(item => item?.skill?.type == "must_have")?.map((item, index) => (
                                    <span key={"skill" + index}>{formatSkillname(item.skill.name)}</span>
                                ))}
                                {skillEllipsis && <div className="ellipsis">...</div>}
                            </div>
                        }
                    </div>

                </div>
            </div>

            {!isAppliedJobs && activeJob?.HR_Number === data.HR_Number && similarJobObj?.length > 0 &&
                <SimilarJobs similarJobObj={similarJobObj} hrDetails={data} alreadyShown={!similarJobsFetching} />
            }
        </>
    )
}

const ExpIcon = () => (
    <svg width="0.9375rem" height="0.9375rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99967 9.99935C10.577 9.99935 12.6663 7.91001 12.6663 5.33268C12.6663 2.75535 10.577 0.666016 7.99967 0.666016C5.42235 0.666016 3.33301 2.75535 3.33301 5.33268C3.33301 7.91001 5.42235 9.99935 7.99967 9.99935Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.47366 9.26057L4.66699 15.3339L8.00033 13.3339L11.3337 15.3339L10.527 9.25391" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

const SkillBoolean = ({ data, skillEllipsis }) => {
    return (
        <div className="skills skill_boolean" id={"skills_" + data.HR_Number}>
            {data.skill_boolean.map((skill_varients, index) => (
                <div className="skill_varients" key={"skill_" + index}>
                    {skill_varients.map((skill, index) => (
                        <React.Fragment key={'skill_varients_' + index}>
                            {index > 0 && <strong>Or</strong>}
                            <div className="varient">
                                {formatSkillname(skill)}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            ))}
            {skillEllipsis && <div className="ellipsis">...</div>}
        </div>
    )
}



const SimilarJobs = ({ hrDetails, similarJobObj, alreadyShown }) => {
    const dispatch = useDispatch()

    const handleCardClick = (job, position) => {
        viewJobClickedTracking(job, hrDetails, position)
        talentRelevancyTracking(hrDetails, position, {}, {}, {}, 'card', 'all-opportunities-main', job)
        window.open(getJobAgentSimilarJobHref(job), '_blank');
    }

    const [showSimilarJobs, setShowSimilarJobs] = useState(false);

    const onBookmarkClick = (e, data) => {
        e.stopPropagation();
        let oldValue = data.is_saved;
        let reqMap = {
            "hr_id": data.enc_id,
            "type": !oldValue ? 'add' : 'remove'
        }

        dispatch({ type: SET_LOADER, payload: true })
        oppBookmark(reqMap)(dispatch)
            .then((res) => {
                if (res.data.status == "success") {
                    toastify.success(
                        <BookmarkNotification
                            role={data.role}
                            newValue={!oldValue}
                            undoAllowed={true}
                            onUndo={() => onBookmarkClick(e, data)}
                        />,
                        {
                            position: 'bottom-center',
                            theme: 'dark',
                            closeOnClick: false,
                            autoClose: 3000,
                        }
                    );

                    dispatch({ type: SET_BOOKMARK_SIMILAR_JOBS, payload: { HR_Number: data.HR_Number, data: !oldValue, similarToHR: hrDetails.HR_Number } })
                } else {
                    toast.error('Something went wrong', { duration: 3000 })
                }
            })
            .catch((err) => {
                console.log('Error', err);
                toast.error('Something went wrong', { duration: 3000 })
            })
    }
    const [similarJobs, setSimilarJobs] = useState(similarJobObj);
    const [filtersAvailable, setFiltersAvailable] = useState({});

    useEffect(() => {
        let activeJobRemote = hrDetails.ModeOfWork == "Remote";
        let newFiltersAvailable = {};
        let hasNonmatchingLocation = false;
        let hasNonmatchingJobFunction = false;

        similarJobObj.forEach(job => {
            if (((activeJobRemote && job.ModeOfWork == 'Remote') ||
                (hrDetails?.city === job.city || (hrDetails?.city && !job.city && job.ModeOfWork === 'Remote')))) {
                newFiltersAvailable.location = true;
            } else {
                hasNonmatchingLocation = true;
            }

            if (job.job_function && job.job_function == hrDetails.job_function) {
                newFiltersAvailable.job_function = true;
            } else {
                hasNonmatchingJobFunction = true;
            }
        });

        if (!hasNonmatchingLocation && newFiltersAvailable.location) {
            delete newFiltersAvailable.location;
        }
        if (!hasNonmatchingJobFunction && newFiltersAvailable.job_function) {
            delete newFiltersAvailable.job_function;
        }
        setFiltersAvailable(newFiltersAvailable);

    }, [similarJobObj]);

    const [activeFilter, setActiveFilter] = useState('');
    const handleFilterClick = (filter) => {
        if (activeFilter == filter) {
            setActiveFilter('');
            setSimilarJobs(similarJobObj);
            return;
        }
        setActiveFilter(filter);
        if (filter == 'location') {
            setSimilarJobs(similarJobObj.filter(job =>
                (job.ModeOfWork === 'Remote' && hrDetails.ModeOfWork === job.ModeOfWork) ||
                (job.job_location?.some(location => hrDetails?.job_location?.some(hr_location => location?.city_id === hr_location?.city_id)) || (!job.job_location?.length > 0 && hrDetails.job_location?.length > 0 && job.ModeOfWork === 'Remote'))));
        }
        if (filter == 'job_function') {
            setSimilarJobs(similarJobObj.filter(job => job.job_function == hrDetails.job_function));
        }
    }

    return (
        <>
            <div className={`similarJobsPc ${alreadyShown ? 'alreadyShown' : ''}`}>
                {!showSimilarJobs &&
                    <button className="similarJobsToggle" onClick={() => setShowSimilarJobs(true)}>
                        Similar Jobs ({similarJobObj.length}) <ArrowDropDownIcon />
                    </button>
                }
                {showSimilarJobs &&
                    <>
                        <div className="activeHeader">
                            Similar Jobs ({similarJobObj.length})
                            {filtersAvailable && Object.keys(filtersAvailable).length > 0 &&
                                <div className="filterTabs">
                                    {filtersAvailable.location &&
                                        <div className={`filterTab ${activeFilter == 'location' ? 'active' : ''}`} onClick={() => handleFilterClick('location')}>
                                            Location
                                        </div>
                                    }
                                    {filtersAvailable.job_function &&
                                        <div className={`filterTab ${activeFilter == 'job_function' ? 'active' : ''}`} onClick={() => handleFilterClick('job_function')}>
                                            Job function
                                        </div>
                                    }
                                </div>
                            }
                            <button className="iconBtn" onClick={() => setShowSimilarJobs(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="job-list">
                            {Array.isArray(similarJobs) && similarJobs?.map((data, index) => (
                                <SimilarJobCard data={data} index={index} onBookmarkClick={onBookmarkClick} handleCardClick={handleCardClick} />
                            ))}
                        </div>
                    </>
                }
                <hr />
            </div>
        </>
    );
};

const SimilarJobCard = ({ data, index, onBookmarkClick, handleCardClick }) => {

    const [skillEllipsis, setSkillEllipsis] = useState(false);

    useEffect(() => {
        const skills = document.getElementById("skills_" + data.HR_Number);
        if (skills && skills.scrollWidth > 316) {
            setSkillEllipsis(true);
        }
    }, []);

    return (
        <div className={`jobCard`} onClick={() => handleCardClick(data, index + 1)}>

            <button className={`bookmarkIconBtn ${data.is_partner_company ? '' : 'aggregator'} ${data.is_saved ? 'saved' : ''}`} onClick={(e) => onBookmarkClick(e, data)}>
                <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </button>
            {(((data.frontend_data && data.frontend_data.frontend_label) || data.top_badge) || (data.applied_at || data.is_partner_company)) &&
                <div className={`jobCardHead`}>
                    {data.frontend_data && data.frontend_data.frontend_label ?
                        <label
                            className={`oppHeadActionTag`}
                            style={{
                                "color": data.frontend_data.frontend_label_color,
                                "backgroundColor": data.frontend_data.frontend_message_color
                            }}
                        >
                            {data.frontend_data.frontend_label}
                        </label>
                        :
                        <>
                            {data.top_badge &&
                                <div className={`${data.is_partner_company ? 'mb-3' : ''}`}>
                                    <div
                                        className="earlyApplicant"
                                        dangerouslySetInnerHTML={{ __html: data.top_badge }}
                                    >
                                    </div>
                                </div>
                            }
                        </>
                    }
                    {data.applied_at &&
                        <div className="appliedAt">
                            <span>Applied {data.applied_at}</span>
                        </div>
                    }
                    {(data.is_partner_company && data.company.company_name != "Uplers") &&
                        <UplersPartnerBadge data={data} fullText isTooltip={false} />
                    }

                </div>
            }

            <div className="jobTitle">
                <div className="logo">
                    <SimilarJobsCompanyLogo job={data} />
                </div>
                <div className="main">
                    <h6 className={`${data.is_partner_company ? '' : 'padding-right'}`}>
                        {data.title}
                    </h6>
                    <span className="companyName">{data.company}</span>
                </div>
            </div>

            <ul className="jobAttribs">
                {data.experience &&
                    <li>
                        <ExpIcon />
                        {data.experience}
                    </li>
                }
                {data.ModeOfWork &&
                    <li>
                        <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
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

            <div className="skillSection">
                <strong>Skills:</strong>
                {data.skill_boolean?.length > 0 ?
                    <SkillBoolean data={data} skillEllipsis={skillEllipsis} />
                    :
                    <div className="skills" id={"skills_" + data.HR_Number}>
                        {data.skills?.filter(item => item?.skill?.type == "must_have")?.map((item, index) => (
                            <span key={"skill" + index}>{formatSkillname(item.skill.name)}</span>
                        ))}
                        {skillEllipsis && <div className="ellipsis">...</div>}
                    </div>
                }
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