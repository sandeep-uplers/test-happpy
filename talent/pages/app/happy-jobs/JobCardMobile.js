import React from "react";
import { IMAGE_URL } from "../../../components/Constant";
import { formatSkillname, formattedYOE } from "../../../components/Helper";
import AiScreeningRequired from "./AiScreeningRequired";
import CompanyLogo from "./CompanyLogo";
import CustomQuesNeeded from "./CustomQuesNeeded";
import UplersPartnerBadge from "./UplersPartnerBadge";

export default function JobCardMobile({ allData, data, isClosed, fadeClass, toDust, handleOppBookmark }) {

    const handelRedirectSingeleHR = () => {
        window.open((`/talent/all-opportunities/${data.HR_Number}`), '_blank');
    }

    const handleOppBookmarkClick = (e) => {
        e.stopPropagation();
        handleOppBookmark({ enc_id: data.enc_id, is_saved: data.is_saved, role: data.RequestForTalent })
    }

    return (
        <div className={`jobCardMobile allJobs  ${(fadeClass || toDust) ? 'fadeOpp' : ''} ${isClosed ? 'isClosed' : ''}`} onClick={handelRedirectSingeleHR} id={data.HR_Number}>

            {(data.is_partner_company || data.top_badge) &&
                <div className="top-nudges">
                    {data.top_badge &&
                        <div className="nudge">
                            <div
                                className="earlyApplicant"
                                dangerouslySetInnerHTML={{ __html: data.top_badge }}
                            >
                            </div>
                        </div>
                    }
                    {(data.is_partner_company && data.company.company_name != "Uplers") &&
                        <div className="nudge">
                            <UplersPartnerBadge data={data} fullText />
                        </div>
                    }
                </div>
            }

            <div className="jobTitle">
                <div className="logo">
                    <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                </div>
                <div className="content">
                    <h6>
                        {data.RequestForTalent}
                        <button className={`bookmarkIconBtn ${data.is_saved ? 'saved' : ''}`} onClick={handleOppBookmarkClick}>
                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </button>
                    </h6>
                    <span className="companyName">{data.company?.company_name}</span>
                </div>
            </div>

            {!isClosed && (
                <>
                    {allData.custom_screening_needed ?
                        <CustomQuesNeeded hrData={data} />
                        :
                        allData.ai_needed ? <AiScreeningRequired hrData={data} aiData={allData.ai_data} />
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
                </>
            )}

            <div className="jobAttribs">
                <ul className="attribs">
                    {data.YearOfExp &&
                        <span>
                            <img src={IMAGE_URL + "work/award-icon.svg"} alt="award-icon" />
                            {formattedYOE(data.YearOfExp, data.max_yoe)}
                        </span>
                    }
                    {data.ModeOfWork &&
                        <span>
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
                        </span>
                    }

                </ul>
            </div>
            {(data.status == 1 && data.HR_Status == "Reposted") &&
                <span className="repostedTag">
                    Reposted
                </span>
            }
            <div className={`mustHaveSkills`}>
                {data.skill_boolean?.length > 0 ?
                    <div className="skill_boolean" id={"skills_" + data.HR_Number}>
                        {data.skill_boolean.map((skill_varients, index) => (
                            <React.Fragment key={"skill_" + index}>
                                <div className="skill_varients">
                                    {skill_varients.map((skill, index) => (
                                        <React.Fragment key={'skill_varients_' + index}>
                                            {index > 0 && <strong>Or</strong>}
                                            <div className="varient">
                                                {formatSkillname(skill)}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    :
                    <>
                        {data.skills?.filter(item => item.skill.type == "must_have")?.map((item, index) => (
                            <span key={"skill" + index}>{formatSkillname(item.skill.name)}</span>
                        ))}
                    </>
                }
            </div>
        </div>
    )
}