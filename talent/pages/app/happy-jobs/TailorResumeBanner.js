import React from "react";
import { useSelector } from "react-redux";
import { TailorPromoSparklesIcon, WhiteEyeViewIcon, WhiteFlashIcon } from "../../../assets/IconSVG";

export default function TailorResumeBanner({ hrData, handleCustomizeResume }) {

    const { user } = useSelector(state => state.auth);
    const isEvenUser = user?.t_id % 2 == 0;

    const handleGenTailoredResume = () => {
        handleCustomizeResume(`skill_section_${isEvenUser ? 'purple' : 'grey'}`);
    }


    return (
        <>
        {hrData.skills?.length > 0 &&
        <div className={`tailor-resume-banner-wrapper ${isEvenUser ? 'trb-even' : ''}`}>
            <div className="skills tailor-resume">
                {(hrData?.skill_boolean?.length > 0) ?
                    <div>
                        <label>Must Have Skills :</label>
                        <div className="skill_boolean">
                            {hrData?.skill_boolean?.map((skill_varients, index) => (
                                <div className="skill_varients" key={"skill_" + index}>
                                    {skill_varients.map((skill, index) => (
                                        <React.Fragment key={'skill_varients_' + index}>
                                            {index > 0 && <strong>Or</strong>}
                                            <div className="varient">
                                                {skill}
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                :
                <>
                    <div className="must_have_skills">
                        <label>Must have skills required :</label>
                        <div className="must_have">
                            {hrData.skills?.filter(item => item.skill.type == "must_have")?.map(item => (
                                <span className="skill-tag" key={item.skill.id}>
                                    {item.skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                    {hrData?.skills?.filter(item => item.skill.type == "good_to_have").length > 0 &&
                        <div className="good_to_have">
                            <label>Good to have skills :</label>
                            <div className="gh_skills">
                                {hrData.skills?.filter(item => item.skill.type == "good_to_have")?.map(item => item.skill.name).join(', ')}
                            </div>
                        </div>
                    }
                </>}
                <hr className="tailor-skill-devider" />
                <div className="tailor-promo-banner">
                    <div className="tpb-left">
                        {/* <TailorPromoSparklesIcon /> */}
                        <div className="tpb-content">
                            {/* <h2>Missing any skills?</h2>
                            <span>Tailor your resume to highlight the most relevant skills & experience for this job</span> */}

                            <span className="pro-tip">
                                <strong>Pro Tip:</strong>
                                <span>Missing any of these skills? The recruiter <strong>might never see your resume</strong> due to automated ATS filters.</span>
                            </span>
                        </div>
                    </div>
                    {hrData.tailored_status == 2 || sessionStorage.getItem('tailored_resume_generated_' + hrData.HR_Number) ?
                        <button className="primaryBtn gradientBtn" onClick={handleGenTailoredResume}>
                            <WhiteEyeViewIcon />
                            View Tailored Resume
                        </button>
                        :
                        <button className="primaryBtn gradientBtn" onClick={handleGenTailoredResume}>
                            <WhiteFlashIcon />
                            Tailor Resume For This Job
                        </button>
                    }
                </div>
            </div>
        </div>
        }
        </>
    )
}