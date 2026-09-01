import React, { useEffect, useState } from "react";
import { IMAGE_URL } from "../../../components/Constant";

export default function CompanyLogo({ company, HR_Number, isInterviewCard = false }) {
    const [showInitials, setShowInitials] = useState(false);

    useEffect(() => {
        if (company?.company_logo) {
            // console.log('company?', company?.company_name);
            const img = new Image();
            img.src = company?.company_logo;

            img.onload = function () {
                // console.log("Image loaded successfully!");
            };

            img.onerror = function () {
                // let logObj = {
                //     HR_Number: HR_Number,
                //     company_logo: company?.company_logo,
                //     url: window.location.href
                // }
                setShowInitials(true)
                // Handle invalid URL or loading errors (optional)
            };
        }
    }, [])

    return (
        <>{isInterviewCard ?
            <>
                {company?.company_logo && !showInitials ?
                    <img src={company?.company_logo} alt={company?.company_logo} />
                    :
                    <div className="company_intialBg">
                        <img src={IMAGE_URL + "work/company_intialBg.svg"} alt={"company_intialBg"} />
                        <div className="company_intial"><h6>{company?.company_name_initials}</h6></div>
                    </div>
                }
            </>
            :
            <>
                {company?.company_logo && !showInitials ?
                    <img src={company?.company_logo} alt={'companyLogo'} />
                    :
                    <div className="company_intialBg">
                        <div className="company_intial"><h6>{company?.company_name_initials}</h6></div>
                    </div>
                }
            </>
        }
        </>
    )
}