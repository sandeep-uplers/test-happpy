import React, { useEffect, useState } from "react";
import { AboutVideoCompanies, IMAGE_URL } from "../../../components/Constant";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "@/talent/navigation/routerCompat";
import { getCompanyDetails } from "../../../store/actions/UserActions";
import { getFundingAmount, getUrlOrigin, sanitizedDescription } from "../../../components/Helper";
import CompanyLogo from "./CompanyLogo";
import HSContent from "./HSContent";
import { BarLoader } from "../../../components/SectionLoader";
import { SET_HR_COMPANY_DETAILS } from "../../../store/actions/actionsTypes";

const AboutCompany = ({ hr_id, isOppDisabled, companyData }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [companyDetails, setCompanyDetail] = useState()
    const { hrCompanyDetails } = useSelector(state => state.opps)


    useEffect(() => {
        if (hr_id && hr_id != '') {
            const params = `?hr_id=${hr_id}`
            setLoading(true);
            if (hrCompanyDetails[hr_id]) {
                setCompanyDetail(hrCompanyDetails[hr_id])
                setLoading(false)
                return
            }
            getCompanyDetails(params)(dispatch)
                .then((res) => {
                    if (res?.data?.status == 200) {
                        setCompanyDetail(res?.data?.company_data)
                        dispatch({ type: SET_HR_COMPANY_DETAILS, payload: { HR_Number: hr_id, data: res?.data?.company_data } })
                    }
                })
                .catch((err) => console.log(err))
                .finally(() => setLoading(false))
        }
    }, [hr_id])

    const toggleShowAll = () => {
        setShowAll(!showAll);
    };


    const FundingRoundsList = (fundingArray) => {
        const sortedFundingArray = [...fundingArray].sort((a, b) => b.funding_round - a.funding_round);

        return (
            <div>
                <h4>Rounds</h4>
                <div className="rounds-list">
                    {sortedFundingArray.map((round, index) => (
                        <div key={index} className={`round-list-content ${index === 0 ? 'active' : ''}`}>
                            <span>{`Round ${round.funding_round} | ${round.series} | ${round.funding_month}, ${round.funding_year}`}</span>
                            <h4>{round.funding_amount}</h4>
                            <p>Investors: {round.investors}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            {loading && <BarLoader />}
            {companyDetails && (
                <div className={`aboutTheCompanySec ${isOppDisabled ? 'isOppDisabled' : ''}`}>
                    <h3>About the company</h3>

                    <div className="aboutcompanyList">
                        <div className="aboutComLogo">
                            <CompanyLogo company={companyDetails} />
                        </div>

                        <div className="aboutComInfo">
                            <h2>{companyDetails?.company_name}</h2>
                            {companyData?.is_confidential === 0 &&
                                <ul>
                                    {companyDetails?.company_website &&
                                        <li>
                                            <a className="company_link" href={getUrlOrigin(companyDetails?.company_website)} target="_blank">
                                                Company website
                                                <svg className="view-job-link-svg" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2.69299 10.0039L9.90831 2.78859" stroke="#384AD7" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M4.61725 2.69385L10.0047 2.69385L10.0047 8.08129" stroke="#384AD7" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </a>
                                        </li>
                                    }

                                    {companyDetails?.linkedin_profile && companyDetails?.linkedin_profile != '' && companyDetails?.linkedin_profile != 'NA' &&
                                        <li>
                                            <a className="company_link" href={companyDetails?.linkedin_profile} target="_blank">
                                                Company LinkedIn
                                                <svg className="view-job-link-svg" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2.69299 10.0039L9.90831 2.78859" stroke="#384AD7" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M4.61725 2.69385L10.0047 2.69385L10.0047 8.08129" stroke="#384AD7" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </a>
                                        </li>
                                    }
                                </ul>
                            }
                        </div>
                    </div>


                    <div className="aboutCompanytwoSecWrap">
                        {
                            (companyDetails?.founded_in || (companyDetails?.team_size && Number(companyDetails?.team_size) > 0) || companyDetails?.company_type || companyDetails?.company_industry ||
                                companyDetails?.headquarter || companyDetails?.about_us || companyDetails?.culture ||
                                (companyDetails?.funding_array && Object.keys(companyDetails?.funding_array).length > 0) ||
                                (companyDetails?.culture_images && companyDetails?.culture_images.length > 0) ||
                                (companyDetails?.videos && companyDetails?.videos.length > 0) ||
                                (companyDetails?.company_benefits && companyDetails?.company_benefits?.length > 0 && companyDetails?.company_benefits.join(""))
                            ) &&
                            <div className="aboutTheCompanyLeft">
                                <div className="company-details-inner dtlQuillEdit">
                                    <div className="company-details-top">
                                        <ul>

                                            {companyDetails?.founded_in && <li>
                                                <span>Founded in</span>
                                                <p>{companyDetails?.founded_in}</p>
                                            </li>}

                                            {companyDetails?.team_size && Number(companyDetails?.team_size) > 0 && (<li>
                                                <span>Team Size</span>
                                                <p>{companyDetails?.team_size}</p>
                                            </li>)}

                                            {/* {companyDetails?.company_type && <li>
                                                <span>Company Type</span>
                                                <p>{companyDetails?.company_type}</p>
                                            </li>} */}

                                            {companyDetails?.company_industry && <li>
                                                <span>Company Industry</span>
                                                <p>{companyDetails?.company_industry}</p>
                                            </li>}

                                            {companyDetails?.headquarter && <li>
                                                <span>Headquarters</span>
                                                <p>{companyDetails?.headquarter}</p>
                                            </li>}

                                        </ul>
                                    </div>
                                    {companyDetails?.about_us && (<>
                                        <h4>About us</h4>
                                        <HSContent aboutCompany content={companyDetails?.about_us} />
                                        {/* <div className="aboutus-company"
                                            dangerouslySetInnerHTML={{ __html: sanitizedDescription(companyDetails?.about_us) }}
                                        /> */}
                                    </>)}


                                    {companyDetails?.is_self_funded == 1 ?
                                        <div className="mt-2">
                                            <h4>Funding</h4>
                                            <p><strong>Self-funded (bootstrapped) company without external investments.</strong></p>
                                        </div>
                                        : ''}

                                    {companyDetails?.is_self_funded == 0 && companyDetails?.funding_array && Object.keys(companyDetails?.funding_array).length > 0 ? (
                                        <>
                                            <div className="funding-rounds">
                                                <ul>
                                                    {companyDetails?.funding_array?.series &&
                                                        <li>
                                                            <span>Funding Round/Series</span>
                                                            <p>{companyDetails?.funding_array?.series}</p>
                                                        </li>
                                                    }
                                                    {companyDetails?.funding_array?.funding_amount != 0 &&
                                                        <li>
                                                            <span>Funding Amount</span>
                                                            <p>{getFundingAmount(companyDetails?.funding_array?.funding_amount)}</p>
                                                        </li>
                                                    }
                                                    {companyDetails?.funding_array?.funding_date &&
                                                        <li>
                                                            <span>Latest Funding Date</span>
                                                            <p>{companyDetails?.funding_array?.funding_date}</p>
                                                        </li>
                                                    }
                                                    {companyDetails?.funding_array?.investors &&
                                                        <li>
                                                            <span>Investors</span>
                                                            <p>{companyDetails?.funding_array?.investors}</p>
                                                        </li>
                                                    }
                                                </ul>
                                            </div>
                                            {companyDetails.funding_array.AdditionalInformation && companyDetails.funding_array.AdditionalInformation != "" &&
                                                <div className="aboutus-company"
                                                    dangerouslySetInnerHTML={{ __html: sanitizedDescription(companyDetails.funding_array.AdditionalInformation) }}
                                                />
                                            }
                                        </>
                                    ) : ''}

                                    {companyDetails?.culture && (
                                        <>
                                            <h4>Culture</h4>
                                            <HSContent aboutCompany content={companyDetails?.culture} />
                                            {/* <div className="aboutus-company"
                                                dangerouslySetInnerHTML={{ __html: sanitizedDescription(companyDetails?.culture) }}
                                            /> */}
                                        </>
                                    )}

                                    {companyDetails?.culture_images && companyDetails?.culture_images.length > 0 && (
                                        <div className="img-section mt-24">
                                            {companyDetails?.culture_images?.map((img) => {
                                                return (
                                                    <div class="img-thumb">
                                                        <img src={img.picture_url} />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {companyDetails?.videos && companyDetails?.videos.length > 0 && (
                                        <div className="img-section">
                                            {
                                                companyDetails.videos?.map((link, index) => {
                                                    return (
                                                        <YouTubeVideo videoId={link?.video_id} style={{ margin: '2px' }} />
                                                    )
                                                })
                                            }
                                        </div>
                                    )}


                                    {companyDetails?.
                                        company_benefits && companyDetails?.company_benefits?.length > 0 && companyDetails?.company_benefits.join("") && (<>
                                            <h4>Company Benefits</h4>
                                            <div className="company-benefits">
                                                <ul>
                                                    {companyDetails?.company_benefits?.map((benefit) => (
                                                        <>
                                                            {!!benefit && <li><span>{benefit}</span> </li>}
                                                        </>
                                                    ))}
                                                </ul>
                                            </div>
                                        </>
                                        )}
                                </div>
                            </div>
                        }

                    </div>

                </div>)}

        </>
    )
}


export default AboutCompany

const YouTubeVideo = ({ videoId }) => {
    return (
        <div className="video-wrapper">
            <iframe
                title="YouTube Video"
                width="330"
                height="200"
                src={`https://www.youtube.com/embed/${videoId}`}
                allowFullScreen
                style={{ margin: "5px", borderRadius: "18px" }}
            ></iframe>
        </div>
    )
}
