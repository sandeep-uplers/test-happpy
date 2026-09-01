import React from 'react';
import { IMAGE_URL } from '../../../components/Constant';
import { formatSkillname, formattedYOE } from '../../../components/Helper';
import { talentRelevancyTracking, viewMoreDetailsAllJobPageTracking } from '../../../helpers/Mixpanel';
import AiScreeningRequired from '../happy-jobs/AiScreeningRequired';
import CompanyLogo from '../happy-jobs/CompanyLogo';
import CustomQuesNeeded from '../happy-jobs/CustomQuesNeeded';
import UplersPartnerBadge from '../happy-jobs/UplersPartnerBadge';

const HAPPPY_JOB_DETAIL_PATH = '/talent/job-agent/job';

export default function HapppyJobCardMobile({
    allData,
    data,
    isClosed,
    fadeClass,
    toDust,
    handleOppBookmark,
    currentIndex = 0,
    prefilters = {},
    filters = {},
}) {
    const handelRedirectSingleHR = () => {
        talentRelevancyTracking(data, currentIndex + 1, prefilters, filters, {}, 'card', 'happpy-all-jobs-main');
        viewMoreDetailsAllJobPageTracking(data, 'happpy-all-jobs', 'card');
        window.open(`${HAPPPY_JOB_DETAIL_PATH}/${data.HR_Number}?from=all-jobs`, '_blank');
    };

    const handleOppBookmarkClick = (e) => {
        e.stopPropagation();
        handleOppBookmark({ enc_id: data.enc_id, is_saved: data.is_saved, role: data.RequestForTalent });
    };

    return (
        <div
            className={`happpy-job-card-mobile ${(fadeClass || toDust) ? 'happpy-job-card-mobile--fade' : ''} ${isClosed ? 'happpy-job-card-mobile--closed' : ''}`}
            onClick={handelRedirectSingleHR}
            id={data.HR_Number}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handelRedirectSingleHR();
                }
            }}
        >
            {(data.is_partner_company || data.top_badge) && (
                <div className="happpy-job-card-mobile__nudges">
                    {data.top_badge && (
                        <div className="happpy-job-card-mobile__nudge">
                            <div className="earlyApplicant" dangerouslySetInnerHTML={{ __html: data.top_badge }} />
                        </div>
                    )}
                    {data.is_partner_company && data.company?.company_name != 'Uplers' && (
                        <div className="happpy-job-card-mobile__nudge">
                            <UplersPartnerBadge data={data} fullText />
                        </div>
                    )}
                </div>
            )}

            <div className="happpy-job-card-mobile__title-row">
                <div className="happpy-job-card-mobile__logo">
                    <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                </div>
                <div className="happpy-job-card-mobile__content">
                    <h6 className="happpy-job-card-mobile__role">
                        <span className="happpy-job-card-mobile__role-text">{data.RequestForTalent}</span>
                        <button
                            type="button"
                            className={`happpy-job-card-mobile__bookmark ${data.is_saved ? 'happpy-job-card-mobile__bookmark--saved' : ''}`}
                            onClick={handleOppBookmarkClick}
                            aria-label={data.is_saved ? 'Remove bookmark' : 'Bookmark job'}
                        >
                            <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M10.3333 13L5.66667 9.66667L1 13V2.33333C1 1.97971 1.14048 1.64057 1.39052 1.39052C1.64057 1.14048 1.97971 1 2.33333 1H9C9.35362 1 9.69276 1.14048 9.94281 1.39052C10.1929 1.64057 10.3333 1.97971 10.3333 2.33333V13Z"
                                    stroke="#231F20"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </h6>
                    <span className="happpy-job-card-mobile__company">{data.company?.company_name}</span>
                </div>
            </div>

            {!isClosed && (
                <>
                    {allData.custom_screening_needed ? (
                        <CustomQuesNeeded hrData={data} />
                    ) : allData.ai_needed ? (
                        <AiScreeningRequired hrData={data} aiData={allData.ai_data} />
                    ) : (
                        allData.frontend_data?.frontend_message && (
                            <div
                                className="opportunitiesJobNote"
                                style={{
                                    backgroundColor: allData.frontend_data.frontend_message_color,
                                    borderColor: allData.frontend_data.frontend_message_color,
                                }}
                                dangerouslySetInnerHTML={{ __html: allData.frontend_data.frontend_message }}
                            />
                        )
                    )}
                </>
            )}

            <div className="happpy-job-card-mobile__attribs">
                <ul className="attribs">
                    {data.YearOfExp && (
                        <span>
                            <img src={IMAGE_URL + 'work/award-icon.svg'} alt="" />
                            {formattedYOE(data.YearOfExp, data.max_yoe)}
                        </span>
                    )}
                    {data.ModeOfWork && (
                        <span>
                            <img src={IMAGE_URL + 'work/map-pin-icon.svg'} alt="" />
                            {data.ModeOfWork?.toLowerCase() == 'remote'
                                ? 'Remote' + (data.city ? ' - ' + data.city : '')
                                : <>
                                    {data.ModeOfWork?.toLowerCase() == 'office' &&
                                        'Onsite' +
                                        (data.job_location?.length > 0
                                            ? ' - ' + data.job_location?.map((location) => location?.city_name).join(', ')
                                            : '')}
                                    {data.ModeOfWork?.toLowerCase() == 'hybrid' &&
                                        'Hybrid' +
                                        (data.job_location?.length > 0
                                            ? ' - ' + data.job_location?.map((location) => location?.city_name).join(', ')
                                            : '')}
                                </>}
                        </span>
                    )}
                </ul>
            </div>

            {data.status == 1 && data.HR_Status == 'Reposted' && (
                <span className="happpy-job-card-mobile__reposted">Reposted</span>
            )}

            <div className="happpy-job-card-mobile__skills">
                {data.skill_boolean?.length > 0 ? (
                    <div className="skill_boolean" id={'skills_' + data.HR_Number}>
                        {data.skill_boolean.map((skill_varients, index) => (
                            <div className="skill_varients" key={'skill_' + index}>
                                {skill_varients.map((skill, skillIndex) => (
                                    <React.Fragment key={'skill_varients_' + skillIndex}>
                                        {skillIndex > 0 && <strong>Or</strong>}
                                        <div className="varient">{formatSkillname(skill)}</div>
                                    </React.Fragment>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    data.skills
                        ?.filter((item) => item.skill.type == 'must_have')
                        ?.map((item, index) => <span key={'skill' + index}>{formatSkillname(item.skill.name)}</span>)
                )}
            </div>
        </div>
    );
}
