import React, { useEffect, useState } from "react";
import { useSearchParams } from "@/talent/navigation/routerCompat";
import { MASTER_FILTERS } from "../../../components/Helper";
import OppEngagementFilter from "./filters/OppEngagementFilter";
import OppPopoverFilter from "./filters/OppPopoverFilter";
import OppTabFilters from "./filters/OppTabFilters";
import { experienceFilterMaster, isObjectVoid, jobPostedDateFilterMaster } from "../../../components/Masters";

const engagementMaster = [
    {
        "label": "Onsite",
        "value": "Onsite"
    },
    {
        "label": "Hybrid",
        "value": "Hybrid"
    },
    {
        "label": "Remote",
        "value": "Remote"
    }
]

export default function OpportunitiesFilterMobile({
    rangeInputs, noSearch, searchVal, handleSearch, currentFilters, setCurrentFilters, removeAllFilter,
    bookmarkCount, totalOpp, loading, nonMatchingJobs, masterLoader, isBookmarkedActive, filterCount }
) {

    const [searchParams, updateSearchParams] = useSearchParams();
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [mobileRangeInputs, setMobileRangeInputs] = useState({});
    const [subMaster, setSubMaster] = useState({})
    useEffect(() => {
        if (rangeInputs) {
            setMobileRangeInputs(rangeInputs)
        }
    }, [rangeInputs])

    useEffect(() => {
        if (currentFilters && Object.keys(currentFilters).length > 0) {
            setSelectedFilters(currentFilters)
        } else {
            setSelectedFilters({});
        }
    }, [currentFilters])

    useEffect(() => {
        console.log('selectedFilters', selectedFilters);

    }, [selectedFilters])

    const removeFilter = (sectionKey, filterKey) => {
        const newSectionFilters = { ...selectedFilters[sectionKey] };
        delete newSectionFilters[filterKey];
        if (sectionKey == 'payout' || sectionKey == 'experience') {
            setMobileRangeInputs({ ...mobileRangeInputs, [sectionKey]: {} })
        }
        setSelectedFilters({ ...selectedFilters, [sectionKey]: newSectionFilters });
    }

    const handleApplyFilter = () => {
        setCurrentFilters(selectedFilters);
        setIsFilterDrawerOpen(false);
    }

    const handleCloseDrawer = () => {
        setIsFilterDrawerOpen(false);
        if (currentFilters && Object.keys(currentFilters).length > 0) {
            setSelectedFilters(currentFilters)
        } else {
            setSelectedFilters({});
        }
    }

    const handleRemoveAllFilter = () => {
        removeAllFilter();
        setMobileRangeInputs({ experience: {}, payout: {} });
        setIsFilterDrawerOpen(false);
    }

    return (
        <>
            <div className={`opportunitiesFilterMobile ${(masterLoader && MASTER_FILTERS.some(item => searchParams.has(item))) ? 'masterLoading' : ''}`}>
                <div className="opportunitiesFilterInner">

                    <div className="oppFilterTop">
                        {!isBookmarkedActive &&
                            <button className={`filterIconBtn`} onClick={() => setIsFilterDrawerOpen(true)} >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M18.3346 2.5H1.66797L8.33464 10.3833V15.8333L11.668 17.5V10.3833L18.3346 2.5Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                {filterCount > 0 ?
                                    <span className="filterCount">
                                        {filterCount}
                                    </span>
                                    :
                                    <></>
                                }
                            </button>
                        }
                        <div className="oppSearchBox">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M17.5 17.5L13.875 13.875" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search Opportunities"
                                value={searchVal}
                                onChange={(e) => handleSearch(e.target.value)}
                                data-hj-allow
                            />
                        </div>
                    </div>

                    {!isBookmarkedActive &&
                        <div className="oppFilterBottom" style={{ display: currentFilters.is_saved_filter == 1 ? 'none' : '' }}>
                            <div className={`oppAdvanceFilter`}>
                                <OppEngagementFilter
                                    master={engagementMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Posted On"
                                    section="job_posted_date"
                                    sectionMaster={jobPostedDateFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Experience"
                                    section="experience"
                                    sectionMaster={experienceFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                    onLoadRangeInput={mobileRangeInputs.experience}
                                    mobileFilters
                                    updateMobileRangeInputs={(rangeInput) =>
                                        setMobileRangeInputs({ ...mobileRangeInputs, experience: rangeInput })
                                    }
                                />

                            </div>
                        </div>
                    }
                </div>
                <div className="filtersBottom">


                    {(nonMatchingJobs === true && totalOpp > 0 && !loading) ?
                        <>
                            {isBookmarkedActive ?
                                <div className="noMatchingJobs">
                                    <span>No matching jobs found</span>
                                    <strong>Showing all jobs that are bookmarked ({totalOpp})</strong>
                                </div>
                                :
                                <div className="noMatchingJobs">
                                    <span>No matching jobs found</span>
                                    <strong>Showing jobs that best match your profile ({totalOpp})</strong>
                                </div>
                            }
                        </>
                        :
                        <div className="totalOpportunitiesCount">
                            <div
                                className={`jobCountBubble active`}
                            >
                                {isBookmarkedActive ? (
                                    <>
                                        {loading ? (
                                            <i className="spinner-border-bubble"></i>
                                        ) : (
                                            `${bookmarkCount} Jobs`
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {loading ? (
                                            <i className="spinner-border-bubble"></i>
                                        ) : (
                                            <>
                                                {totalOpp} Jobs
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    }

                    {!isBookmarkedActive &&
                        <button type="button" id="clearFilters" className="tagClearBtn" onClick={handleRemoveAllFilter} style={{ display: "none" }}>
                            Clear Filters
                        </button>
                    }
                </div>
            </div >
            {isFilterDrawerOpen &&
                <div className="mobileFilterDrawer">
                    <div className="filterDrawerInner">
                        <div className="filterDrawerHeader">
                            <div className="filterDrawerTitle">
                                <h6>Filters</h6>
                                <button type="button" className="filterClearBtn" onClick={handleRemoveAllFilter} disabled={isObjectVoid(selectedFilters)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                        <path d="M7.43726 0.363281C8.61907 0.36332 9.799 0.676542 10.865 1.26953L11.0769 1.39258L11.3064 1.53613C11.7268 1.80965 12.119 2.1239 12.4792 2.47266L12.449 1.54492L12.448 1.52441C12.4435 1.24895 12.6627 1.021 12.9382 1.01465L13.0398 1.02246C13.269 1.06405 13.4449 1.26207 13.4509 1.50391L13.5251 3.7666C13.5784 3.9228 13.5526 4.09415 13.4558 4.22559L13.407 4.28223C13.2721 4.41727 13.0735 4.46187 12.8943 4.40234L10.6277 4.32715C10.3506 4.31821 10.1332 4.08628 10.1423 3.80957L10.156 3.70898C10.2103 3.48223 10.4178 3.31727 10.6599 3.3252L11.9558 3.36719C11.604 3.00073 11.2125 2.67451 10.7878 2.39551L10.5603 2.25293C9.59374 1.67284 8.51378 1.36723 7.43726 1.36719C5.82077 1.36719 4.32286 1.99155 3.18335 3.13477L2.96069 3.37012C1.92116 4.52502 1.30347 6.07195 1.30347 7.50098C1.30335 7.77782 1.07855 8.00195 0.801514 8.00195C0.524475 8.00195 0.299679 7.77782 0.299561 7.50098C0.299561 5.82293 1.01765 4.03032 2.21558 2.69922L2.47534 2.4248C3.80279 1.09341 5.55145 0.363281 7.43726 0.363281Z" fill="#384AD7" stroke="#384AD7" stroke-width="0.3" />
                                        <path d="M14.1606 6.99805C14.4377 6.99805 14.6626 7.22292 14.6626 7.5C14.6626 9.07319 14.0321 10.7469 12.9663 12.0469L12.7476 12.3018C11.3928 13.807 9.53651 14.6367 7.5249 14.6367C6.34312 14.6366 5.16314 14.3245 4.09717 13.7314L3.88525 13.6084C3.37794 13.3026 2.908 12.9398 2.48291 12.5283L2.51416 13.4639H2.51318C2.51337 13.4679 2.51415 13.4713 2.51416 13.4736L2.50635 13.5742C2.47074 13.7712 2.31962 13.9292 2.12451 13.9736L2.02393 13.9863C1.7474 13.9926 1.5183 13.7733 1.51123 13.4971L1.43701 11.2334C1.37601 11.0538 1.4201 10.8544 1.55518 10.7188H1.55615L1.61279 10.6689C1.74278 10.5731 1.91192 10.5466 2.06689 10.5977L4.33545 10.6729L4.43604 10.6865C4.63052 10.7332 4.77946 10.8927 4.81299 11.0898L4.81982 11.1914C4.81166 11.4333 4.63344 11.6295 4.40381 11.6689L4.30225 11.6758L3.00537 11.6328C3.41929 12.0641 3.88875 12.4392 4.40186 12.748L4.76904 12.9531C5.63801 13.4002 6.58292 13.6337 7.5249 13.6338C9.24896 13.6338 10.8381 12.9232 12.0015 11.6309L12.1919 11.4102C13.1164 10.2833 13.6597 8.83965 13.6597 7.5C13.6597 7.22299 13.8837 6.99816 14.1606 6.99805Z" fill="#384AD7" stroke="#384AD7" stroke-width="0.3" />
                                    </svg>
                                    Clear Filters
                                </button>
                            </div>
                            {!isObjectVoid(selectedFilters) &&
                                <div className="activeFilters">
                                    {Object.keys(selectedFilters).map((sectionKey) => (
                                        <>
                                            {selectedFilters[sectionKey] &&
                                                <>
                                                    {sectionKey === "search" ?
                                                        <></>
                                                        :
                                                        Object.keys(selectedFilters[sectionKey]).map((filterKey, index) => (
                                                            <div className="activeFilterItem" key={'activeFilterItem' + sectionKey + index}>
                                                                {typeof selectedFilters[sectionKey][filterKey] == 'object' ?
                                                                    selectedFilters[sectionKey][filterKey].label_without_count ?? selectedFilters[sectionKey][filterKey].label :

                                                                    filterKey.split(',').join(' - ') + (sectionKey == "experience" ? " yrs experience" : sectionKey == "payout" ? " Lacs/annum" : sectionKey == "team_size" ? " employees" : "")
                                                                }
                                                                <div className="removeCloseIcon" onClick={() => removeFilter(sectionKey, filterKey)}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                                        <path d="M10.5 3.5L3.5 10.5" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                                                        <path d="M3.5 3.5L10.5 10.5" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </>
                                            }
                                        </>
                                    ))}
                                </div>
                            }
                        </div>
                        <OppTabFilters
                            selectedFilters={selectedFilters}
                            setSelectedFilters={setSelectedFilters}
                            masterLoader={masterLoader}
                            rangeInput={mobileRangeInputs}
                            setRangeInput={setMobileRangeInputs}
                            subMaster={subMaster}
                            setSubMaster={setSubMaster}
                        />
                    </div>
                    <div className="filterDrawerBottom">
                        <button type="button" className="outlinedBtn" onClick={handleCloseDrawer}>
                            Close
                        </button>
                        <button type="button" className="primaryBtn" onClick={handleApplyFilter} >
                            Show Results
                        </button>
                    </div>
                </div>
            }
        </>
    )
}