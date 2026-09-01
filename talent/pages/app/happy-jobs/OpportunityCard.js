import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@/talent/navigation/routerCompat";
import { Link } from "@/talent/navigation/routerCompat";
import { MapPin } from "@/talent/assets/IconSVG";
import { ArrowRightIcon, BookmarkIcon } from "../../../assets/IconSVG";
import { AboutVideoCompanies, IMAGE_URL } from "../../../components/Constant";
import { formatSkillname, formattedYOE, isTalentHired, formattedINRJobBudget } from "../../../components/Helper";
import ConfirmAppliedCard from "../../../components/extensionModal/ConfirmAppliedCard";
import { pageVisitLoadAndCtaTrack, talentRelevancyTracking, trackAllOpportunitiesClickApply, trackAllOpportunitiesJDOpen, viewMoreDetailsAllJobPageTracking } from '../../../helpers/Mixpanel';
import { oppInterested } from "../../../store/actions/UserActions";
import { SET_FORCE_REGISTRATION } from "../../../store/actions/actionsTypes";
import HSContent from "./HSContent";
import AiScreeningRequired from "./AiScreeningRequired";
import CompanyLogo from "./CompanyLogo";
import CustomQuesNeeded from "./CustomQuesNeeded";
import OpportunityCardApply from "./OpportunityCardApply";
import OpportunityRight from "./OpportunityRight";
import UplersPartnerBadge from "./UplersPartnerBadge";
import NotInterested from "./modals/NotInterested";
import JobCardMobile from "./JobCardMobile";

export default function OpportunityCard({ opportunityType, data, allData, totalOpp, handleOppBookmark,
    fadeClass, isJDopen, toggleDetails, handleNotInterested,
    isClosed = false, isPaused = false, currentIndex = 0, prefilters = {}, filters = {} }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { allOppMasterValue } = useSelector(state => state.work);
    const { status: talentStatus } = useSelector(state => state.auth)?.user

    const isMobile = window.innerWidth < 768;
    useEffect(() => {
        if (totalOpp == 1 && !isMobile) {
            toggleDetails()
        }
    }, [totalOpp])

    const handleJDopen = (isOpen) => {
        trackAllOpportunitiesJDOpen({ data, isOpen })
        toggleDetails(isOpen)
    }

    const handleOppInterested = () => {
        if (talentStatus == 0) {
            dispatch({ type: SET_FORCE_REGISTRATION, payload: true })
            return
        }
        var formData = new FormData();
        formData.append('hr_id', data.id);
        formData.append('intrested', 1);
        trackAllOpportunitiesClickApply({
            data: formData
        })
        pageVisitLoadAndCtaTrack('All opportunity - Apply');

        oppInterested(formData)(dispatch)
            .then((res) => {
                navigate("/talent/my-opportunities")
            })
            .catch((err) => console.log(err))
    }

    const handleAcceptance = () => {
        navigate("/talent/acceptence", { state: data })
    }

    const handelRedirectSingeleHR = () => {
        talentRelevancyTracking(data, currentIndex + 1, prefilters, filters, allOppMasterValue, 'card', 'all-opportunities-main')
        viewMoreDetailsAllJobPageTracking(data, 'all-opportunities', 'card')
        window.open((`/talent/all-opportunities/${data.HR_Number}${opportunityType == "myOpp" ? "?from=applied-jobs" : '?from=all-jobs'}`), '_blank');
    }
    const timeoutRef = useRef(null);

    const [markedNotInterested, setMarkedNotInterested] = useState(false)
    const [toDust, setToDust] = useState(false)

    const startTimeout = () => {
        timeoutRef.current = setTimeout(() => {
            setToDust(true)
            setTimeout(() => {
                handleNotInterested(data.HR_Number)
            }, 1000);
        }, 5000);
    };

    const onSubmitNotInterested = () => {
        setMarkedNotInterested(true)
        if (!filters.is_saved_filter) {
            startTimeout();
        }
    }

    const onUndoNotInterested = () => {
        setMarkedNotInterested(false)
        clearTimeout(timeoutRef.current);
    }

    return (
        <>
            {isMobile && opportunityType == 'all' ?
                <JobCardMobile
                    allData={allData} 
                    data={data} 
                    isClosed={isClosed}
                    fadeClass={fadeClass}
                    toDust={toDust}
                    handleOppBookmark={handleOppBookmark}

                />
                :
                <div className={`opportunitiesItem ${(fadeClass || toDust) ? 'fadeOpp' : ''} ${isClosed ? 'isClosed' : ''}`} id={data.HR_Number}>
                    <div className={`opportunitiesItemHead ${(data.company?.company_name && AboutVideoCompanies[data.company?.company_name]) && !isClosed ? 'showVideoAbout' : ''}`}>

                        <div className="d-flex w-100">
                            {(data.company?.company_logo || data.company?.company_name_initials) &&
                                <div className="opportunitiesHeadLogo cursor-pointer" onClick={handelRedirectSingeleHR}>
                                    {opportunityType == 'all' && data.top_badge &&
                                        <span
                                            className="earlyApplicant"
                                            dangerouslySetInnerHTML={{ __html: data.top_badge }}
                                        >
                                        </span>
                                    }
                                    <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                                </div>
                            }
                            <div className="opportunitiesHeadInfo">
                                <div className={`opportunitiesHeadInfoInner`}>
                                    <div className="opportunitiesHeadTitle cursor-pointer" onClick={handelRedirectSingeleHR}>
                                        <h3>
                                            {data.RequestForTalent}
                                            {(data.is_partner_company || (opportunityType == "myOpp" && data?.company?.is_partner_company && data.company.company_name != "Uplers")) && <UplersPartnerBadge data={data} />}
                                        </h3>
                                        {data.company?.company_name && <p>{data.company?.company_name}</p>}
                                    </div>

                                    <div className={`opportunitiesHeadAction ${opportunityType == "all" ? 'allOppAction' : ''}`}>
                                        {opportunityType == "all" && !isPaused &&
                                            (!allData.frontend_data || !allData.frontend_data.frontend_label) &&
                                            <>
                                                <NotInterested
                                                    hrData={allData}
                                                    afterSubmit={onSubmitNotInterested}
                                                    markedNotInterested={markedNotInterested}
                                                    onUndoNotInterested={onUndoNotInterested}
                                                    savedFilter={filters.is_saved_filter}
                                                    currentIndex={currentIndex}
                                                    filters={filters}
                                                    isOppCard={true}
                                                />
                                            </>
                                        }
                                        {(opportunityType == "all" && ((!isClosed && !isPaused) || data.is_saved)) ?
                                            <button className={`bookmarkBtn allOppBookmark ${data.is_saved ? 'saved' : ''}`}
                                                onClick={() => handleOppBookmark({ enc_id: data.enc_id, is_saved: data.is_saved, role: data.RequestForTalent })}>
                                                <BookmarkIcon />
                                                <span className="bookmarkBtnHover">{data.is_saved ? 'Remove bookmark' : 'Bookmark to save'}</span>
                                            </button>
                                            :
                                            <></>
                                        }
                                        {(opportunityType == "all" && isPaused) ?
                                            <>
                                                <label className="oppHeadActionTag applicationClosed">
                                                    No longer accepting applications
                                                </label>
                                            </>
                                            :
                                            <>
                                                {(data.status == 1 && data.HR_Status == "Reposted") &&
                                                    <span className="oppHeadActionTag oppPipelineTag">
                                                        Reposted
                                                    </span>
                                                }

                                            </>
                                        }

                                        {allData.frontend_data && allData.frontend_data.frontend_label &&
                                            <label
                                                className={`oppHeadActionTag`}
                                                style={{
                                                    "color": allData.frontend_data.frontend_label_color,
                                                    "backgroundColor": allData.frontend_data.frontend_message_color
                                                }}
                                            >
                                                {allData.frontend_data.frontend_label}
                                            </label>
                                        }
                                    </div>
                                </div >

                                <div className="oppAttributes innerOppData">
                                    <ul>
                                        {data.cost_string &&
                                            <li>
                                                <img src={IMAGE_URL + "work/money.svg"} alt="money-icon" />
                                                {formattedINRJobBudget(data.cost_string)}
                                            </li>
                                        }

                                        {data.YearOfExp && <li>
                                            <img src={IMAGE_URL + "work/award-icon.svg"} alt="award-icon" />
                                            {formattedYOE(data.YearOfExp, data.max_yoe)}
                                        </li>}

                                        {data.ModeOfWork &&
                                            <li >
                                                <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
                                                {data.ModeOfWork?.toLowerCase() == "remote" ?
                                                    "Remote" + (data.city ? (" - " + data.city) : '')
                                                    :
                                                    <>
                                                        {data.ModeOfWork?.toLowerCase() == "office" && "Onsite" + (data.job_location?.length > 0 ? 
                                                            (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : '')}
                                                        {data.ModeOfWork?.toLowerCase() == "hybrid" && "Hybrid" + (data.job_location?.length > 0 ? 
                                                            (" - " + (data.job_location?.length == 1 ? data.job_location[0]?.city_name : `${data.job_location[0]?.city_name}...+${data.job_location?.length - 1}more`)) : '')}
                                                    </>
                                                }
                                                {data.aggregator_application_link &&
                                                    data.ModeOfWork?.toLowerCase() !== "remote" &&
                                                    data.location_type === 2 &&
                                                    <span className="dpInfoTag location">
                                                        <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                                        <span className="dpInfoTagHover">
                                                            The job location is not specified, but since the company has an office in Bengaluru, it is likely that the position is based there.
                                                        </span>
                                                    </span>
                                                }
                                            </li>
                                        }

                                        {data.pricingModel &&
                                            <li>
                                                <img src={IMAGE_URL + "work/briefcase-icon.svg"} alt="briefcase-icon" />
                                                {data.pricingModel}
                                                {data.pricingModelIText &&
                                                    <span className="dpInfoTag">
                                                        <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                                        <span className="dpInfoTagHover">
                                                            {data.pricingModelIText}
                                                        </span>
                                                    </span>
                                                }
                                            </li>
                                        }
                                        {(data.shifts?.length > 0 && data.HRTypeText !== "Pay Per Credit") &&
                                            <li>
                                                <img src={IMAGE_URL + "work/clock-icon.svg"} alt="clock-icon" />

                                                <span className="shiftInfo" >{data.shifts[0].ist_shift_time} IST
                                                    <span className="shiftInfoHover">
                                                        {data.shifts[0].shift}
                                                    </span>
                                                </span>
                                            </li>
                                        }
                                    </ul>
                                </div>
                                {data?.ModeOfWork == "Hybrid" && data.frequency_office_visit &&
                                    <div className='hybridFrequency innerOppData'>
                                        <MapPin /><span>Frequency of office visits:<strong>{data.frequency_office_visit}</strong></span>
                                    </div>
                                }
                            </div >
                        </div>

                        <div className="oppAttributes outerOppData">
                            <ul>
                                {data.cost_string &&
                                    <li>
                                        <img src={IMAGE_URL + "work/money.svg"} alt="money-icon" />
                                        {formattedINRJobBudget(data.cost_string)}
                                    </li>
                                }
                                {data.YearOfExp &&
                                    <li>
                                        <img src={IMAGE_URL + "work/award-icon.svg"} alt="award-icon" />
                                        {formattedYOE(data.YearOfExp, data.max_yoe)}
                                    </li>
                                }

                                {data.ModeOfWork &&
                                    <li >
                                        <img src={IMAGE_URL + "work/map-pin-icon.svg"} alt="map-pin-icon" />
                                        {data.ModeOfWork?.toLowerCase() == "remote" ?
                                            "Remote" + (data.city ? (" - " + data.city) : '')
                                            :
                                            <>
                                                {data.ModeOfWork?.toLowerCase() == "office" && ("Onsite" + (data.job_location?.length > 0 ? (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
                                                {data.ModeOfWork?.toLowerCase() == "hybrid" && ("Hybrid" + (data.job_location?.length > 0 ? (" - " + data.job_location?.map(location => location?.city_name).join(', ')) : ''))}
                                            </>
                                        }
                                        {data.aggregator_application_link &&
                                            data.ModeOfWork?.toLowerCase() !== "remote" &&
                                            data.location_type === 2 &&
                                            <span className="dpInfoTag location">
                                                <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                                <span className="dpInfoTagHover">
                                                    The job location is not specified, but since the company has an office in Bengaluru, it is likely that the position is based there.
                                                </span>
                                            </span>
                                        }
                                    </li>
                                }

                                {data.pricingModel &&
                                    <li>
                                        <img src={IMAGE_URL + "work/briefcase-icon.svg"} alt="briefcase-icon" />
                                        {data.pricingModel}
                                        {data.pricingModelIText &&
                                            <span className="dpInfoTag">
                                                <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
                                                <span className="dpInfoTagHover">
                                                    {data.pricingModelIText}
                                                </span>
                                            </span>
                                        }
                                    </li>
                                }
                                {(data.shifts?.length > 0 && data.HRTypeText !== "Pay Per Credit") &&
                                    <li>
                                        <img src={IMAGE_URL + "work/clock-icon.svg"} alt="clock-icon" />
                                        <span className="shiftInfo" >{data.shifts[0].ist_shift_time} IST
                                            <span className="shiftInfoHover">
                                                {data.shifts[0].shift}
                                            </span>
                                        </span>
                                    </li>
                                }
                            </ul>
                        </div>
                        {data?.ModeOfWork == "Hybrid" && data.frequency_office_visit &&
                            <div className='hybridFrequency outerOppData'>
                                <MapPin /><span>Frequency of office visits:<strong>{data.frequency_office_visit}</strong></span>
                            </div>
                        }
                    </div >

                    <div className="opportunitiesItemBody">
                        {(allData.screening_status && opportunityType != "all" && !isClosed) ?
                            <>
                                {allData.custom_screening_needed ? <CustomQuesNeeded hrData={data} />
                                    :
                                    allData.ai_needed && <AiScreeningRequired hrData={data} aiData={allData.ai_data} />
                                }
                            </>
                            :
                            <>

                                {allData.frontend_data && allData.frontend_data.frontend_message &&
                                    <div
                                        className={`opportunitiesJobNote`}
                                        style={{
                                            "backgroundColor": allData.frontend_data.frontend_message_color,
                                            "borderColor": allData.frontend_data.frontend_message_color,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: allData.frontend_data.frontend_message }}
                                    >
                                    </div>
                                }
                            </>
                        }

                        <div className="skill_apply">
                            {!isClosed && <ConfirmAppliedCard hrData={data} />}
                            <div className="opportunitiesTopSkills">
                                {opportunityType == 'all' ? (
                                    <div className="oppTopSkillsList">
                                        {data.skills?.length > 0 && <label>Must Have Skills</label>}
                                        <div className="oppTopSkillsTags">
                                            {isJDopen ? (
                                                data.skills?.filter(item => item.skill.type == "must_have")?.map((item, index) => (
                                                    <span key={"skill" + index}>{formatSkillname(item.skill.name)}</span>
                                                ))
                                            ) : (
                                                data.skills?.filter(item => item.skill.type == "must_have")?.slice(0, 10).map((item, index) => (
                                                    <span key={"skill" + index}>{formatSkillname(item.skill.name)}</span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )
                                    :
                                    <div className="oppTopSkillsList">
                                        {data.hr_skills?.length > 0 && <label>Top Skills</label>}
                                        <div className={`oppTopSkillsTags ${isClosed ? 'topSkillsGrayTags' : ''}`}>
                                            {isJDopen && opportunityType != "all" ? (
                                                data.hr_skills?.map((item, index) => (
                                                    <span key={"skill" + index}>{formatSkillname(item.name)}</span>
                                                ))
                                            ) : (
                                                data.hr_skills?.slice(0, 10).map((item, index) => (
                                                    <span key={"skill" + index}>{formatSkillname(item.name)}</span>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                }
                                {opportunityType !== "all" &&
                                    <div className="d-flex justify-content-center">
                                        <button type="button" className="btn viewMoreDetails" onClick={() => handleJDopen(!isJDopen)}>
                                            {isJDopen ? "View Less" : "View More Details"}
                                            <span>
                                                {!isJDopen ? <img src={IMAGE_URL + "work/btn-plus-icon.svg"} alt="btn-plus-icon" /> :
                                                    <img src={IMAGE_URL + "work/btn-minus-icon.svg"} alt="btn-minus-icon" />}
                                            </span>
                                        </button>
                                    </div>
                                }
                            </div>

                            {opportunityType == "all" &&
                                <div className="bottomAction">
                                    {markedNotInterested && !filters.is_saved_filter &&
                                        <div className="notIterestedMsg">
                                            As you have marked this job as <strong>‘Not interested’</strong>, it will no longer be visible to you and will be placed at the bottom of the list. You can search this job if you want to view it again
                                        </div>
                                    }
                                    {data.is_score_breakdown ?
                                        <div>
                                            <div className="d-flex gap-2" style={{ fontSize: '12px' }}>
                                                <div style={{ minWidth: 'fit-content' }}>
                                                    <span><b>Relevancy: </b>{Math.round(data.relevancy_score * 100) / 100}%</span>
                                                </div>
                                                <div style={{ minWidth: 'fit-content', marginLeft: '10px' }}>
                                                    <span><b>Qdrant: </b>{Math.round(data.qdrant_score * 100) / 100}%</span>
                                                </div>
                                            </div>
                                            <div className="d-flex" style={{ marginTop: '10px', fontSize: '12px' }}>
                                                <div style={{ minWidth: 'fit-content' }}>
                                                    <span><b>Experience: </b>{Math.round(data.experience_score * 100) / 100}%</span>
                                                </div>
                                                <div style={{ minWidth: 'fit-content', marginLeft: '10px' }}>
                                                    <span><b>Location: </b>{Math.round(data.location_score * 100) / 100}%</span>
                                                </div>
                                                {data.posted_date_score &&
                                                <div style={{ minWidth: 'fit-content', marginLeft: '10px' }}>
                                                    <span><b>Posted Date: </b>{Math.round(data.posted_date_score * 100) / 100}%</span>
                                                </div>
                                                }
                                            </div>
                                        </div>
                                        :
                                        <></>
                                    }


                                    <div className="detes_apply">

                                        <Link to={`/talent/all-opportunities/${data.HR_Number}`} onClick={() => {
                                            talentRelevancyTracking(data, currentIndex + 1, prefilters, filters, allOppMasterValue, 'card', 'all-opportunities-main')
                                            viewMoreDetailsAllJobPageTracking(data, 'all-opportunities')
                                        }} target="_blank">
                                            <button className="outlinedBtn">View more details<ArrowRightIcon /></button>
                                        </Link>
                                        {!data.is_applied && !isClosed && !data.job_not_interested &&
                                            <OpportunityCardApply data={data} />
                                        }
                                    </div>

                                </div>
                            }
                        </div>
                        {isJDopen && opportunityType != "all" &&
                            <div className="opportunitiesItemFullDetails" >

                                <div className="opportunitiesItemLeftDes jobDescription">
                                    {data.JobDescription &&
                                        <HSContent content={data.JobDescription} />
                                    }
                                </div>


                                <OpportunityRight
                                    opportunityType={opportunityType}
                                    data={data}
                                    matcherData={opportunityType == "all" ? data.matcherArray : allData.matcherArray}
                                    allData={allData}
                                    handleOppInterested={handleOppInterested}
                                    handleAcceptance={handleAcceptance}
                                    isCandidateDeployed={isTalentHired(talentStatus)}
                                />
                            </div>
                        }
                    </div>
                </div >

            }
        </>
    )
}
