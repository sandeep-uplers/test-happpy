import { useEffect, useMemo, useState } from 'react';
import { ArrowDropDownIcon } from '../../../assets/IconSVG';
import {
    ContentAnalysisSection,
    EssentialSectionsSection,
    FormatStructureSection,
    WritingStyleSection,
} from './ResumeHealthReportSections';

function getRecommendedContactInfo(reportDetails) {
    return ['github', 'certifications']
        .map(
            (field) =>
                reportDetails?.sections?.mandatory_sections?.contact_information?.[field]?.check ===
                    false &&
                reportDetails?.sections?.mandatory_sections?.contact_information?.[field]?.message
        )
        .filter(Boolean);
}

/**
 * Tabbed detail sections shared by the full resume health report page and the
 * compact job-agent modal report view.
 */
export default function ResumeHealthReportDetailTabs({
    report_details,
    transform_eligible,
    handleTransformSubmit,
    transformResumeLoader,
    activeTab: controlledActiveTab,
    onActiveTabChange,
}) {
    const [internalActiveTab, setInternalActiveTab] = useState('');
    const isPC = window.innerWidth > 767;
    const isControlled = controlledActiveTab !== undefined;
    const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

    const setActiveTab = (tab) => {
        if (onActiveTabChange) {
            onActiveTabChange(tab);
        }
        if (!isControlled) {
            setInternalActiveTab(tab);
        }
    };

    useEffect(() => {
        if (isPC && !isControlled) {
            setInternalActiveTab('content');
        }
    }, [isPC, isControlled]);

    const recommendedContactInfo = useMemo(
        () => getRecommendedContactInfo(report_details),
        [report_details]
    );

    const sectionProps = {
        report_details,
        transform_eligible,
        handleTransformSubmit,
        transformResumeLoader,
    };

    return (
        <>
            {isPC && (
                <div className="health-tabs">
                    <div
                        className={`health-tab ${activeTab == 'content' ? 'active' : ''}`}
                        onClick={() => setActiveTab('content')}
                    >
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.83333 13.1667C10.7789 13.1667 13.1667 10.7789 13.1667 7.83333C13.1667 4.88781 10.7789 2.5 7.83333 2.5C4.88781 2.5 2.5 4.88781 2.5 7.83333C2.5 10.7789 4.88781 13.1667 7.83333 13.1667Z" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M14.4996 14.4996L11.5996 11.5996" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Content Analysis
                    </div>
                    <div
                        className={`health-tab ${activeTab == 'format' ? 'active' : ''}`}
                        onClick={() => setActiveTab('format')}
                    >
                        <svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.4173 1.41602H4.75065C4.37493 1.41602 4.01459 1.56527 3.74892 1.83095C3.48324 2.09662 3.33398 2.45696 3.33398 2.83268V14.166C3.33398 14.5417 3.48324 14.9021 3.74892 15.1677C4.01459 15.4334 4.37493 15.5827 4.75065 15.5827H13.2507C13.6264 15.5827 13.9867 15.4334 14.2524 15.1677C14.5181 14.9021 14.6673 14.5417 14.6673 14.166V5.66602L10.4173 1.41602Z" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11.8327 12.041H6.16602" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M11.8327 9.20898H6.16602" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.58268 6.375H6.87435H6.16602" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10.416 1.41602V5.66602H14.666" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Format & Structure
                    </div>
                    <div
                        className={`health-tab ${activeTab == 'essential' ? 'active' : ''}`}
                        onClick={() => setActiveTab('essential')}
                    >
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.375 14.875V2.125M10.625 14.875V2.125M3.01042 14.875H13.9896C14.4786 14.875 14.875 14.4786 14.875 13.9896V3.01042C14.875 2.52141 14.4786 2.125 13.9896 2.125H3.01042C2.52141 2.125 2.125 2.52141 2.125 3.01042V13.9896C2.125 14.4786 2.52141 14.875 3.01042 14.875Z" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Mandatory Sections
                    </div>
                    <div
                        className={`health-tab ${activeTab == 'writing' ? 'active' : ''}`}
                        onClick={() => setActiveTab('writing')}
                    >
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_21716_1331)">
                                <path d="M8.5 13.4583L13.4583 8.5L15.5833 10.625L10.625 15.5833L8.5 13.4583Z" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12.7493 9.20768L11.6868 3.89518L1.41602 1.41602L3.89518 11.6868L9.20768 12.7493L12.7493 9.20768Z" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M1.41602 1.41602L6.78943 6.78943" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M7.79167 9.20833C8.57407 9.20833 9.20833 8.57407 9.20833 7.79167C9.20833 7.00926 8.57407 6.375 7.79167 6.375C7.00926 6.375 6.375 7.00926 6.375 7.79167C6.375 8.57407 7.00926 9.20833 7.79167 9.20833Z" stroke="#737381" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs>
                                <clipPath id="clip0_21716_1331">
                                    <rect width="17" height="17" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        Writing & Style
                    </div>
                </div>
            )}

            <div className={`report-sections ${isPC ? '' : 'mobile-report'}`}>
                {isPC ? (
                    <>
                        {activeTab == 'content' && (
                            <div id="content-analysis" className="section">
                                <div className="section-header">
                                    <span>📝 Content Analysis</span>
                                </div>
                                <ContentAnalysisSection {...sectionProps} />
                            </div>
                        )}
                        {activeTab == 'format' && (
                            <div id="format-structure" className="section">
                                <div className="section-header">
                                    <span>📋 Format & Structure</span>
                                </div>
                                <FormatStructureSection {...sectionProps} />
                            </div>
                        )}
                        {activeTab == 'essential' && (
                            <div id="essential-sections" className="section">
                                <div className="section-header">
                                    <span>📑 Mandatory Sections</span>
                                </div>
                                <EssentialSectionsSection
                                    {...sectionProps}
                                    recommendedContactInfo={recommendedContactInfo}
                                />
                            </div>
                        )}
                        {activeTab == 'writing' && (
                            <div id="writing-style" className="section">
                                <div className="section-header">
                                    <span>🖌️ Writing & Style</span>
                                </div>
                                <WritingStyleSection {...sectionProps} />
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className={`section ${activeTab == 'content' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab == 'content' ? '' : 'content')}
                        >
                            <div className="section-header">
                                <span>📝 Content Analysis</span>
                                <ArrowDropDownIcon />
                            </div>
                            <ContentAnalysisSection {...sectionProps} />
                        </div>
                        <div
                            className={`section ${activeTab == 'format' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab == 'format' ? '' : 'format')}
                        >
                            <div className="section-header">
                                <span>📋 Format & Structure</span>
                                <ArrowDropDownIcon />
                            </div>
                            <FormatStructureSection {...sectionProps} />
                        </div>
                        <div
                            className={`section ${activeTab == 'essential' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab == 'essential' ? '' : 'essential')}
                        >
                            <div className="section-header">
                                <span>📑 Mandatory Sections</span>
                                <ArrowDropDownIcon />
                            </div>
                            <EssentialSectionsSection
                                {...sectionProps}
                                recommendedContactInfo={recommendedContactInfo}
                            />
                        </div>
                        <div
                            className={`section ${activeTab == 'writing' ? 'active' : ''}`}
                            onClick={() => setActiveTab(activeTab == 'writing' ? '' : 'writing')}
                        >
                            <div className="section-header">
                                <span>🖌️ Writing & Style</span>
                                <ArrowDropDownIcon />
                            </div>
                            <WritingStyleSection {...sectionProps} />
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
