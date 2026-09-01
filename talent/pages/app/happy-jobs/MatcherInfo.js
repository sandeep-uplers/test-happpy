import React from "react";

import { IMAGE_URL } from "../../../components/Constant"
import { useMatcherContext } from "../../../components/common/MatcherQueryModal"
import { pageVisitLoadAndCtaTrack } from "../../../helpers/Mixpanel"
import { WhatsappIcon } from "../../../assets/IconSVG";
import { getNameInitials } from "../../../components/Helper";
import toast from "react-hot-toast";

export default function MatcherInfo({ matcherData, data, isOppDisabled, opportunityType, singleOppMobile = false }) {

    const { showMatcherModal, chatWithWhatsapp } = useMatcherContext()

    const handleWhatsapp = (waNumber) => {
        chatWithWhatsapp({
            whatsapp_number: waNumber,
            role: data.RequestForTalent,
            company: data.company?.company_name,
            HR_Number: data.HR_Number,
        })
    }

    const handleCopyEmail = (email) => {
        navigator.clipboard.writeText(email);
        toast.success('Email copied to clipboard');
    }


    return (
        <>
            {(matcherData?.matcher && matcherData?.matcher?.length > 0) &&
                <div className='mathcerDiv'>
                    <h5>{matcherData?.matcher?.length > 1 ? "Hiring team - People you can reach out to" : "Job Posted By"}</h5>
                    <div className="matcherList">
                        {matcherData?.matcher.map((item => (
                            <>
                                {item && Object.keys(item).length > 0 &&
                                    <div className='matcherCard'>
                                        <div className='content'>
                                            <div className='d-flex align-items-center'>
                                                {!singleOppMobile &&
                                                    <>
                                                        {item?.profile_pic ?
                                                            <img className='profilePic' src={item?.profile_pic} />
                                                            :
                                                            <div className="nameIntials">
                                                                {getNameInitials(item?.Name)}
                                                            </div>
                                                        }
                                                    </>
                                                }
                                                <div>
                                                    <h6>{item?.Name}</h6>
                                                    {(item.email || item.whatsapp_number || item.contact_no) &&
                                                        <div className="matcherBottom">
                                                            {item.contact_no &&
                                                                <div className='sendEmail'>
                                                                    <img className='mailIcon' src={IMAGE_URL + 'work/fi_phone.svg'} />
                                                                    {item.contact_no}
                                                                </div>
                                                            }
                                                            {item?.whatsapp_number &&
                                                                <button className="icon-btn" title="Chat on Whatsapp"
                                                                    onClick={() => handleWhatsapp(item?.whatsapp_number)}
                                                                >
                                                                    <WhatsappIcon />
                                                                </button>
                                                            }
                                                            {item.email &&
                                                                <div className='sendEmail'>
                                                                    <img className='mailIcon' src={IMAGE_URL + 'work/fi_mail.svg'} />
                                                                    <a href={`mailto:${item?.email}`}>{item?.email}</a>
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </div>
                                            </div>

                                            {item.email &&
                                                <button className="iconBtn" title="Copy Email" onClick={() => handleCopyEmail(item?.email)}>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <g clip-path="url(#clip0_19183_17232)">
                                                            <path d="M16.6667 7.5H9.16667C8.24619 7.5 7.5 8.24619 7.5 9.16667V16.6667C7.5 17.5871 8.24619 18.3333 9.16667 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V9.16667C18.3333 8.24619 17.5871 7.5 16.6667 7.5Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                            <path d="M4.16699 12.4993H3.33366C2.89163 12.4993 2.46771 12.3238 2.15515 12.0112C1.84259 11.6986 1.66699 11.2747 1.66699 10.8327V3.33268C1.66699 2.89065 1.84259 2.46673 2.15515 2.15417C2.46771 1.84161 2.89163 1.66602 3.33366 1.66602H10.8337C11.2757 1.66602 11.6996 1.84161 12.0122 2.15417C12.3247 2.46673 12.5003 2.89065 12.5003 3.33268V4.16602" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                                        </g>
                                                        <defs>
                                                            <clipPath id="clip0_19183_17232">
                                                                <rect width="20" height="20" fill="white" />
                                                            </clipPath>
                                                        </defs>
                                                    </svg>
                                                </button>
                                            }
                                        </div>
                                    </div>
                                }
                            </>
                        )))}
                        <div className='matcherCard matcherCardCareer'>
                            <div className='content'>
                                <div className='d-flex align-items-center'>
                                    <div>
                                        <div className="matcherBottom">
                                            <div className='sendEmail'>
                                                <img className='mailIcon' src={IMAGE_URL + 'work/fi_mail.svg'} />
                                                <a href="mailto:career@uplers.in" >career@uplers.in</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="iconBtn" title="Copy Email" onClick={() => handleCopyEmail('career@uplers.in')}>
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_career_uplers)">
                                            <path d="M16.6667 7.5H9.16667C8.24619 7.5 7.5 8.24619 7.5 9.16667V16.6667C7.5 17.5871 8.24619 18.3333 9.16667 18.3333H16.6667C17.5871 18.3333 18.3333 17.5871 18.3333 16.6667V9.16667C18.3333 8.24619 17.5871 7.5 16.6667 7.5Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                            <path d="M4.16699 12.4993H3.33366C2.89163 12.4993 2.46771 12.3238 2.15515 12.0112C1.84259 11.6986 1.66699 11.2747 1.66699 10.8327V3.33268C1.66699 2.89065 1.84259 2.46673 2.15515 2.15417C2.46771 1.84161 2.89163 1.66602 3.33366 1.66602H10.8337C11.2757 1.66602 11.6996 1.84161 12.0122 2.15417C12.3247 2.46673 12.5003 2.89065 12.5003 3.33268V4.16602" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_career_uplers">
                                                <rect width="20" height="20" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}