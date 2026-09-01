import React from 'react';
import { useSelector } from 'react-redux';
import CompanyLogo from './CompanyLogo';
import UplersPartnerBadge from './UplersPartnerBadge';

const JobHeaderSticky = ({ data, isHeaderVisible, handleCustomizeResume, handleAgentWithTailorCV, hideApplyCta = false }) => {

    const user = useSelector(state => state.auth)?.user;

    let applyBtn = document.getElementById(`${data.enc_id}+singleOppAppyBtn`)
    const handleApply = () => {
        if (applyBtn) {
            applyBtn.setAttribute('data-cta-name', 'sticky');
            applyBtn.click()
        }
    }
    const handleApplyWithTailorCV = () => {
        handleCustomizeResume('customize_resume_and_apply_sticky');
    }

    const showAgentCta = data.is_outreach_eligible && user?.outreach?.is_eligible;

    if (data?.is_applied || (!hideApplyCta && !applyBtn && !showAgentCta)) {
        return <></>
    }

    return (
        <div className={`jobHeaderSticky ${isHeaderVisible && 'show'}`}>
            {/* 
            <ReferralAgentModal
                isOpen={isReferralModalVisible}
                closeReferralAgentModal={closeReferralModal}
                onSubmit={handleSubmit}
                source="job-header-sticky"
                hrID={data.enc_id}
            /> */}

            <div className="oppHead">
                <div className="oppHeadContent">
                    {(data.company?.company_logo || data.company?.company_name_initials) &&
                        <div className="logo">
                            <CompanyLogo company={data.company} HR_Number={data.HR_Number} />
                        </div>
                    }
                    <div className="opportunitiesHeadTitle">
                        <h3>
                            {data.RequestForTalent}
                        </h3>
                        {data.company?.company_name &&
                            <div className="companyName">
                                <p>{data.company?.company_name}</p>
                                {(data.is_partner_company && data.company.company_name != "Uplers") && <UplersPartnerBadge data={data} isTooltip={false} />}
                            </div>
                        }
                    </div>
                </div>
                <div className="oppHeadAction">
                    <div className="button-group" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {data.is_outreach_eligible && user?.outreach?.is_eligible &&
                            <button className={`primaryBtn applyWithTailorCVBtn`} onClick={handleAgentWithTailorCV}>
                                {user?.outreach?.onboarding_phase == 1 ?
                                    "Tailored Resume +  Happpy Agent"
                                    :
                                    "Run Happpy Agent"
                                }
                            </button>
                        }
                        {!hideApplyCta && applyBtn &&
                            <button className="primaryBtn" onClick={handleApply} style={{ minHeight: '2.75rem', padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>
                                Apply
                                {data.aggregator_application_link &&
                                    <span className="aggregator-apply-link" style={{ display: 'inline-flex', marginLeft: '0.375rem' }}>
                                        <svg style={{ width: '1.125rem', height: '1.125rem' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                        </svg>
                                    </span>
                                }
                            </button>
                        }
                    </div>
                </div>
            </div>

        </div>

    )
}

export default JobHeaderSticky;