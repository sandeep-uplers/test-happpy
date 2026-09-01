import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from '@/talent/navigation/routerCompat'
import { BookmarkIcon } from '../../../assets/IconSVG'
import { AboutVideoCompanies, IMAGE_URL } from '../../../components/Constant'
import { sanitizedDescription, formattedINRJobBudget } from '../../../components/Helper'
import WorkConfirmModal from '../../../components/common/WorkConfirmModal'
import { oppDislike } from '../../../store/actions/UserActions'
import MatcherInfo from './MatcherInfo'
import HR_AboutComapnyModal from './modals/HR_AboutComapnyModal'
import HSContent from './HSContent'

const validApplicableStatus = ['Added', 'In Contacted', 'In Review', 'Selected', 'Not Responding', 'Rejected', 'Not Interested'];

export default function OpportunityRight({ opportunityType, data, matcherData, allData, handleOppInterested, isIndividualHR, handleOppBookmark, isOppDisabled,
    isCandidateDeployed = false, MatchMakePercent }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector(state => state.auth);
    const talentStatus = user?.status;
    const handleDislikeOpp = () => {
        let reqMap = {
            "hr_id": data.id
        }
        oppDislike(reqMap)(dispatch)
            .then((res) => {
                window.location.reload()
            })
            .catch((err) => console.log(err))
    }
    return (
        <div className="opportunitiesItemRightDes">
            {/* {(opportunityType == "closed" && allData.statusName == "rejected") &&
                <div className="oppJobFeedback">
                    <h4>Feedback</h4>
                    <p>As much as we want our talents to be working on the
                        projects of their choice, we also take care of placing
                        you at a place where you will be of the most value.</p>
                    {(allData?.rejection_stage == "By Talent self" || allData?.rejection_stage == "SME") ?
                        <p>We weren't able to match your profile for this position this time.</p>
                        :
                        <p>You were not offered this position this time.</p>
                    }
                    <p>You can explore more positions&nbsp;<Link to="/talent/all-opportunities"
                        title="here"><i>here</i></Link>.</p>
                </div>
            } */}
            {isIndividualHR &&
                <>
                    {/* {opportunityType != 'individualHrPublic' && <MatchMakePercent />} */}
                    {(allData.company?.company_name && AboutVideoCompanies[allData?.company?.company_name]) &&
                        <HR_AboutComapnyModal hrNumber={allData.HR_Number} companyName={allData?.company?.company_name}>
                            <div className='aboutCompanyVideo'>
                                <div className='head'>
                                    <img src={IMAGE_URL + 'hand-hello.png'} />
                                    <span>Learn more about {allData?.company?.company_name}</span>
                                </div>

                                <div className='main'>
                                    <img src={IMAGE_URL + AboutVideoCompanies[allData?.company?.company_name]?.thumb_160x100} className='bigThumb' />
                                    <div className='details'>
                                        <div className='head'>
                                            <img src={IMAGE_URL + 'hand-hello.png'} />
                                            <span>Learn more about {allData?.company?.company_name}</span>
                                        </div>
                                        <div className='content'>
                                            {AboutVideoCompanies[allData?.company?.company_name]?.video_about_txt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </HR_AboutComapnyModal>
                    }
                </>
            }

            {(opportunityType == "all" || isIndividualHR) ?
                <></>
                // <AllOppJobOverview data={data} /> 
                :
                <div className="oppJobOverview">
                    <MyOppJobOverview data={data} opportunityType={opportunityType} />
                </div>
            }

            {/* {(opportunityType == "matched" && !data.assessmentPending) &&
                <div className="oppItemRightDesAction">
                    <Link to={'/talent/acceptence/' + data.enc_id} className="btn interestedBtn">Review & confirm</Link>
                </div>
            } */}
            {opportunityType != "all" && opportunityType != "closed" && opportunityType != 'individualHrPublic' &&
                ((opportunityType == "applied" && allData.statusName) || opportunityType == "matched") &&
                <div className="oppItemRightDesAction withMathcerInfo">
                    <div className='jobDesHRId'>
                        {opportunityType == 'individualHr' &&
                            <div className="jobDesHRIdBox">
                                <h4>HR ID</h4>
                                <p>{data.HR_Number}</p>
                            </div>
                        }
                        {opportunityType == "applied" && allData.statusName &&
                            <div className="jobDesHRIdBox">
                                <h4>Status</h4>
                                <p>{allData.statusName}</p>
                            </div>
                        }
                        {/* {opportunityType == "interested" &&
                        <button type="button" className="btn itemShareBtn">
                            <img src={IMAGE_URL + "work/share-icon.svg"} alt="share-icon" />
                            <span className="hoverText">
                                Refer & Earn
                            </span>
                        </button>} */}

                        {opportunityType == "matched" &&
                            <WorkConfirmModal type={"oppDislikeModal"}
                                onConfirm={handleDislikeOpp}
                                head={`${data.RequestForTalent} | ${data.company?.company_name} | ${formattedINRJobBudget(data.cost_string)}`}

                            />
                        }

                        {/* {data?.positionAlreadyFilled && <div className="justFilledNote">Sorry this position just got
                        filled</div>} */}
                    </div>
                    {matcherData && <MatcherInfo data={data} matcherData={matcherData} isOppDisabled={isOppDisabled} opportunityType={opportunityType} />}
                </div>
            }

            {isIndividualHR && opportunityType == 'individualHrPublic' &&
                <div className="oppItemRightDesAction jobDesHRId individualHR">
                    <div className="jobDesHRIdBox">
                        <h4>HR ID</h4>
                        <p className='mb-0'>{data.HR_Number}</p>
                    </div>
                </div>
            }

            {/* {(opportunityType == "closed" && allData.statusName == "hired") &&
                <div className="oppItemRightDesAction">
                    <button type="button" className="btn interestedBtn">
                        View Client feedback
                    </button>
                </div>
            } */}
            {opportunityType == "applied" &&
                <div className="oppItemRightDesAction">
                    {allData.statusName?.toLowerCase() == 'interviewed' &&
                        <Link to={'/talent/interview-feedbacks'} className="btn interestedBtn">Review My interview</Link>
                    }
                    {allData.badgeName == "Slots Given" &&
                        <Link to={'/talent/my-interviews'} className="btn interestedBtn">Schedule interview</Link>
                    }
                    {allData.badgeName?.toLowerCase().includes('scheduled') &&
                        <Link to={'/talent/my-interviews'} className="btn interestedBtn">View interview slot</Link>
                    }
                </div>
            }
            {/* <div className="oppItemDesLessBtn">
                <button type="button" className="btn viewMoreDetails" onClick={() => setJDopen(false)}>
                    View Less
                    <span>
                        <img src={IMAGE_URL + "work/btn-minus-icon.svg"} alt="btn-minus-icon" />
                    </span>
                </button>
            </div> */}
        </div >
    )
}

const isNotEmpty = (val) => {
    return (val !== null && val !== undefined && val !== "" && val != "0")
}

const AllOppJobOverview = ({ data }) => {
    return (
        <ul>
            {/* {isNotEmpty(data.joining_period) &&
                <li>
                    <h4>Notice Period</h4>
                    <p>{data.joining_period}</p>
                </li>
            } */}
            {/* {isNotEmpty(data.talents_count) &&
                <li>
                    <h4>Total Applicants</h4>
                    <p>{data.talents_count}</p>
                </li>
            } */}
            {isNotEmpty(data.company?.team_size) &&
                <li>
                    <h4>Team Size</h4>
                    <p>{data.company?.team_size}</p>
                </li>
            }
            {isNotEmpty(data.company?.company_location) &&
                <li>
                    <h4>Company Location</h4>
                    <p>{data.company?.company_location}</p>
                </li>
            }
            {isNotEmpty(data.company?.industry) &&
                <li>
                    <h4>Industry</h4>
                    <p className='industry'>{data.company?.industry ? data.company.industry.replace(/(?<! )\,/g, ", ") : 'Not Specified'}</p>
                </li>
            }
            {isNotEmpty(data?.Quantity) &&
                <li>
                    <h4>Open Positions</h4>
                    <p>{data.Quantity}</p>
                </li>
            }
            {/* {isNotEmpty(data.company?.about) &&
                <li className="w-100 about">
                    <h4 >About The Company{data.company?.company_name ? <span> - {data.company?.company_name}</span> : ''}</h4>
                    <p dangerouslySetInnerHTML={{ __html: sanitizedDescription(data.company?.about) }} />
                </li>
            } */}
        </ul >
    )
}

const MyOppJobOverview = ({ opportunityType, data }) => {
    return (
        <ul>
            {(opportunityType != "closed" && data.matchStatus != "uneligible") && (data.company?.website_url || data.company?.linkedin_url) && data?.company?.is_confidential === 0 &&
                <li>
                    <h4>Website & LinkedIn</h4>
                    <div className="oppJobOverviewWeblink">
                        {data.company?.website_url && <a href={data.company?.website_url} title="Click Here"
                            target="_blank">Click Here</a>}
                        {data.company?.linkedin_url && <a href={data.company?.linkedin_url} title="LinkedIn" className="jobInLink"
                            target="_blank">
                            <svg width="16" height="16"
                                viewBox="0 0 16 16" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14.8165 0H1.18016C0.529039 0 0 0.516431 0 1.15372V14.8455C0 15.4826 0.529039 16 1.18016 16H14.8165C15.4688 16 16 15.4826 16 14.8455V1.15372C16 0.516431 15.4688 0 14.8165 0Z"
                                    fill="#007BB6" />
                                <path
                                    d="M3.55837 2.20312C4.31761 2.20312 4.93387 2.81968 4.93387 3.5792C4.93387 4.33903 4.31761 4.95558 3.55837 4.95558C2.79622 4.95558 2.18164 4.33903 2.18164 3.5792C2.18164 2.81968 2.79622 2.20312 3.55837 2.20312ZM2.37007 5.99873H4.7456V13.6342H2.37007V5.99873Z"
                                    fill="white" />
                                <path
                                    d="M6.23438 5.99809H8.50916V7.04186H8.54172C8.85822 6.44158 9.63251 5.80859 10.787 5.80859C13.1899 5.80859 13.6339 7.38952 13.6339 9.44588V13.6335H11.2611V9.92039C11.2611 9.03495 11.2457 7.89582 10.0279 7.89582C8.79311 7.89582 8.60468 8.86096 8.60468 9.85697V13.6335H6.23438V5.99809Z"
                                    fill="white" />
                            </svg>
                        </a>}
                    </div>
                </li>
            }
            {isNotEmpty(data.company?.team_size) &&
                <li>
                    <h4>Team Size</h4>
                    <p>{data.company?.team_size}</p>
                </li>
            }
            {/* {data.HRTypeText != "Pay Per Credit" && isNotEmpty(data.joining_period) &&
                <li>
                    <h4>Notice Period</h4>
                    <p>{data.joining_period}</p>
                </li>
            } */}
            {/* {isNotEmpty(data.talents_count) &&
                <li>
                    <h4>Total Applicants</h4>
                    <p>{data.talents_count}</p>
                </li>
            } */}
            {isNotEmpty(data.company?.geo) &&
                <li>
                    <h4>Company Location</h4>
                    <p>{data.company?.geo}</p>
                </li>
            }
            {/* {(opportunityType == "closed" && data.closeStatus == "accepted") &&
                <>
                    <li>
                        <h4>Duration</h4>
                        <p className="staticRed">02/03/2022<span
                            className="toDate">to</span >02/09/2022</p>
                    </li>
                </>
            } */}
            {(opportunityType != "closed") &&
                <>
                    {isNotEmpty(data.Quantity) &&
                        <li>
                            <h4>Open Positions</h4>
                            <p>{data.Quantity}</p>
                        </li>
                    }
                </>
            }
            {/* {(opportunityType == "intrested" || opportunityType == "closed") && */}
            <li>
                <h4>HR ID</h4>
                <p>{data.HR_Number}</p>
            </li>
            {/* } */}
            {isNotEmpty(data.company?.about) &&
                <li className="w-100 about">
                    <h4 >About The Company{data.company?.company_name ? <span> - {data.company?.company_name}</span> : ''}</h4>
                    <HSContent aboutCompany content={data.company?.about} />
                </li>
            }
        </ul>
    )
}