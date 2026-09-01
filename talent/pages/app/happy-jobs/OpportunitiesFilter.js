'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "@/talent/navigation/routerCompat";
import { FilterIcon } from "@/talent/assets/IconSVG";
import { IMAGE_URL } from "../../../components/Constant";
import { ALL_FILTERS, groupOptionsByCategoryFilters, MASTER_FILTERS, urlCustomDecode, urlCustomEncode } from "../../../components/Helper";
import { countAppliedFilters, engagementFilterMaster, experienceFilterMaster, jobPostedDateFilterMaster, payoutFilterMaster, teamSizeFilterMaster } from "../../../components/Masters";
import { SET_OPP_MASTER } from "../../../store/actions/actionsTypes";
import { fetchOppCompanyMaster, fetchOppLocationMaster, fetchOppRoleMaster, fetchOppSkillMaster } from "../../../store/actions/UserActions";
import OppEngagementFilter from "./filters/OppEngagementFilter";
import OppPopoverFilter from "./filters/OppPopoverFilter";
import OppEstimatedSalaryFilter from "./filters/OppEstimatedSalaryFilter";
import OpportunitiesFilterMobile from "./OpportunitiesFilterMobile";
import AllJobsFilterDrawer from "../happpy-agent/AllJobsFilterDrawer";

const filterKeys = ["engagements", "payout", "roles", "experience", "locations", "skills", "job_posted_date", "maang_plus", "salary_available", "team_size"];
const EXCLUDED_FILTERS = ["partner_companies", "aggregated_jobs"];
const rangeFilters = ["payout", "experience", "team_size"];

export default function OpportunitiesFilter({ showFiltered, noSearch, searchVal, onSearch, currentFilters, setCurrentFilters, totalOpp,
    loading, bookmarkCount, nonMatchingJobs, isBookmarkedActive, isPc, syncFiltersToUrl = true, applyMasterBufferFilters = true,
    filterLayout = 'inline', toolbarMeta = null, toolbarMetaLoading = false, toolbarHost = null, toolbarMountInHost = false,
    defaultJobPostedDate = null }) {
    const [errors, setErrors] = useState({ otherExperience: true, otherPayRange: true })
    const dispatch = useDispatch()
    const location = useLocation();
    const firstPageLoad = useRef(true);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const [rangeInputs, setRangeInputs] = useState({});

    const [searchParams, updateSearchParams] = useSearchParams();
    const filterMasterData = useSelector(state => state.work)?.oppFilterMaster;
    const [bufferFilters, setBufferFilters] = useState({});
    const useDrawerFilters = filterLayout === 'drawer';
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [drawerFilters, setDrawerFilters] = useState({});
    const [drawerRangeInputs, setDrawerRangeInputs] = useState({});
    const [drawerSubMaster, setDrawerSubMaster] = useState({});
    const [drawerSearchVal, setDrawerSearchVal] = useState('');

    useEffect(() => {
        if (!applyMasterBufferFilters) return;
        if (Object.keys(filterMasterData).length > 1 && Object.keys(bufferFilters).length > 0) {
            let newBufferFilters = { ...bufferFilters }
            Object.keys(filterMasterData).map((key) => {
                if (key == "locationMaster" || key == "skillMaster" || key == "maangMaster" || key == "roleMaster") {
                    let newFilter = {}
                    filterMasterData[key].map(item => {
                        if (key == "roleMaster") {
                            item.options.map(option => {
                                if (option.selected) {
                                    newFilter[option.value] = option
                                }
                            })
                        }
                        if (item.selected) {
                            newFilter[item.value] = item
                        }
                    })
                    if (Object.keys(newFilter).length > 0) {
                        if (key == "locationMaster") {
                            newBufferFilters["locations"] = newFilter
                        }
                        if (key == "skillMaster") {
                            newBufferFilters["skills"] = newFilter
                        }
                        if (key == "maangMaster") {
                            newBufferFilters["maang_plus"] = newFilter
                        }
                        if (key == "roleMaster") {
                            newBufferFilters["roles"] = newFilter
                        }
                    }
                }
            })
            setCurrentFilters(newBufferFilters)
        }
    }, [filterMasterData, applyMasterBufferFilters])

    useLayoutEffect(() => {
        if (!syncFiltersToUrl) return;
        const initialFilters = {};
        searchParams.forEach((value, key) => {
            if (!ALL_FILTERS.includes(key) || EXCLUDED_FILTERS.includes(key)) return;
            if (key !== 'search') {
                if (rangeFilters.includes(key)) {
                    if (key == "experience") {
                        initialFilters[key] = { [value]: true };

                        let masterKeys = experienceFilterMaster.map(item => item.value);

                        if (!masterKeys.includes(value)) {
                            setRangeInputs((prev) => ({ ...prev, experience: { 0: value.split(',')[0], 1: value.split(',')[1] } }))
                        }
                    }
                    if (key == "payout") {
                        let rangeValues = value.split(',')
                        let subKeys = {}
                        let prevOddValue = ''
                        let masterKeys = payoutFilterMaster.map(item => item.value);
                        rangeValues.map((val, index) => {
                            if ((index + 1) % 2 == 0) {
                                let rangeKey = prevOddValue + ',' + val;
                                if (!masterKeys.includes(rangeKey)) {
                                    setRangeInputs((prev) => ({ ...prev, payout: { 0: prevOddValue, 1: val } }))
                                }
                                subKeys[rangeKey] = true;

                            } else {
                                prevOddValue = val;
                            }
                        })
                        initialFilters[key] = subKeys;
                    }
                    if (key == "team_size") {
                        initialFilters[key] = { [value]: true };

                        let masterKeys = teamSizeFilterMaster.map(item => item.value);

                        if (!masterKeys.includes(value)) {
                            setRangeInputs((prev) => ({ ...prev, team_size: { 0: value.split(',')[0], 1: value.split(',')[1] } }))
                        }
                    }

                }
                else {
                    if (key == "job_posted_date") {
                        jobPostedDateFilterMaster.map(item => {
                            if (item.value_name == value) {
                                initialFilters[key] = { [item.value]: item }
                            }
                        })
                    }
                    else if (key == "skills" || key == "locations" || key == "maang_plus" || key == "roles") {
                        const subKeys = value.split(',').reduce((obj, subKey) => {
                            // if (key == "roles") {
                            //     let filterItem = urlCustomDecode(subKey)
                            //     obj[filterItem] = { value: filterItem, label: filterItem };
                            // } else {
                            obj[urlCustomDecode(subKey)] = true;  // Set the subkey as a property with a value of `true`
                            // }
                            return obj;
                        }, {});
                        initialFilters[key] = subKeys;
                    }
                    else if (key == "salary_available") {
                        initialFilters[key] = value == "1" ? { 1: { label: "Salary Available", value: 1 } } : null;
                    }
                    else {
                        // If the value is a comma-separated string (like 'Onsite,Hybrid'), create an object
                        const subKeys = value.split(',').reduce((obj, subKey) => {
                            obj[subKey] = true;  // Set the subkey as a property with a value of `true`
                            return obj;
                        }, {});
                        // Assign the created object to the `initialFilters` object
                        initialFilters[key] = subKeys;
                    }
                }
            } else {
                // For the 'search' filter, keep the value as is
                initialFilters[key] = decodeURIComponent((value + '').replace(/\+/g, '%20'));
            }
        });
        if (!searchParams.has('job_posted_date') && defaultJobPostedDate) {
            initialFilters.job_posted_date = { [defaultJobPostedDate.value]: defaultJobPostedDate };
        }
        if (!MASTER_FILTERS.some(item => searchParams.has(item))) {
            setCurrentFilters({ ...initialFilters })
        } else {
            setBufferFilters({ ...initialFilters })
        }
    }, [])

    useEffect(() => {
        if (!syncFiltersToUrl) {
            if (firstPageLoad.current) {
                firstPageLoad.current = false;
            }
            return;
        }
        if (!firstPageLoad.current && !isBookmarkedActive) {
            const newSearchParams = new URLSearchParams();
            if (searchParams.get('activeJob')) {
                newSearchParams.append('activeJob', searchParams.get('activeJob'))
            }
            if (searchParams.get('tab')) {
                newSearchParams.set('tab', searchParams.get('tab'))
            }

            Object.keys(currentFilters).forEach(key => {
                const value = currentFilters[key];
                if (!ALL_FILTERS.includes(key) || EXCLUDED_FILTERS.includes(key)) return;
                if (value) {
                    if (typeof value === 'object') {
                        let subKeys;
                        if (key == "job_posted_date") {
                            subKeys = Object.keys(value).map(key => value[key].value_name ?? value[key].label)
                        } else if (key == "locations") {
                            subKeys = Object.keys(value).map(key => value[key].city ? urlCustomEncode(value[key].city) : urlCustomEncode(value[key].label))
                        } else if (key == "skills") {
                            subKeys = Object.keys(value).map(key => value[key].skill_name ? urlCustomEncode(value[key].skill_name) : urlCustomEncode(value[key].label))
                        } else if (key == "maang_plus") {
                            subKeys = Object.keys(value).map(key => value[key].company_name ? urlCustomEncode(value[key].company_name) : urlCustomEncode(value[key].label))
                        } else if (key == "roles") {
                            subKeys = Object.keys(value).map(key => urlCustomEncode(value[key].label))
                        }
                        else {
                            subKeys = Object.keys(value).filter(subKey => value[subKey]);
                        }
                        if (subKeys.length > 0) {
                            newSearchParams.append(key, subKeys.join(','));
                        }
                    } else {
                        newSearchParams.append(key, value);
                    }
                }
            });
            updateSearchParams(newSearchParams);
        }
        if (firstPageLoad.current) {
            firstPageLoad.current = false;
        }
    }, [currentFilters, syncFiltersToUrl, isBookmarkedActive])

    // const profileData = useSelector(state => state.auth);
    const [filterCount, setFilterCount] = useState(0);

    const checkAnyFilter = (obj) => {
        if (!obj) return false;
        let newCount = countAppliedFilters(obj)

        setFilterCount(newCount);
        return newCount > 0; // All checks passed
    }


    useEffect(() => {
        const toggles = document.querySelectorAll('.addFilterMainDropdown .dropdown-toggle');
        if (!toggles.length) return undefined;

        const handlers = [];

        toggles.forEach((toggle) => {
            const handler = (e) => {
                document.querySelectorAll('.addFilterMainDropdown .dropdown-toggle').forEach((other) => {
                    if (other !== toggle) {
                        other.parentElement?.classList.remove('openedSubMenu');
                        const otherSub = other.nextElementSibling;
                        if (otherSub?.classList.contains('addFilterSubDropdown')) {
                            otherSub.classList.remove('show');
                        }
                    }
                });

                const dropdown = toggle.parentElement;
                const subMenu = toggle.nextElementSibling;

                if (dropdown?.classList.contains('openedSubMenu')) {
                    dropdown.classList.remove('openedSubMenu');
                    subMenu?.classList.remove('show');
                } else {
                    dropdown?.classList.add('openedSubMenu');
                    subMenu?.classList.add('show');
                }

                e.preventDefault();
            };

            toggle.addEventListener('click', handler);
            handlers.push({ toggle, handler });
        });

        return () => {
            handlers.forEach(({ toggle, handler }) => {
                toggle.removeEventListener('click', handler);
            });
        };
    }, [])

    const [masterLoader, setMasterLoader] = useState(false)

    const fetchMasters = async () => {
        try {
            // Define an array of promises for each request
            setMasterLoader(true)
            let rolesParam = searchParams.get("roles")
            let locationsParam = searchParams.get("locations")
            let skillsParam = searchParams.get("skills")
            let maangPlusParam = searchParams.get("maang_plus")

            const promises = [
                fetchOppRoleMaster('', urlCustomDecode(rolesParam))(dispatch),
                fetchOppSkillMaster('', urlCustomDecode(skillsParam))(dispatch),
                fetchOppLocationMaster('', urlCustomDecode(locationsParam))(dispatch),
                fetchOppCompanyMaster('', "maang", urlCustomDecode(maangPlusParam))(dispatch),
            ];

            // Use Promise.all to wait for all promises to resolve
            const responses = await Promise.all(promises);
            setMasterLoader(false)

            dispatch({
                type: SET_OPP_MASTER, payload: {
                    roleMaster: groupOptionsByCategoryFilters(responses[0]?.data?.data ?? []),
                    skillMaster: responses[1]?.data?.data ?? [],
                    locationMaster: responses[2]?.data?.data ?? [],
                    maangMaster: responses[3]?.data?.data ?? [],
                }
            })

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Something went wrong', { duration: 7000 })
            setMasterLoader(false)
        }
    };

    useEffect(() => {
        fetchMasters();
    }, [])


    useEffect(() => {
        checkAnyFilter(currentFilters)
    }, [currentFilters])

    useEffect(() => {
        let elm = document.getElementById("clearFilters")
        if (elm) {
            if (checkAnyFilter(currentFilters)) elm.style = "display:block"
            else elm.style = "display:none"
        }
    }, [currentFilters])

    const handleRemoveFilter = (section, val, subVal) => {
        let newFilters = { ...currentFilters[section] }
        if (subVal) {
            delete newFilters[val][subVal];
            if (Object.keys(newFilters[val]).length == 0) {
                delete newFilters[val];
            }
        } else
            delete newFilters[val]

        setCurrentFilters({ ...currentFilters, [section]: newFilters })
    }
    const removeAllFilter = () => {
        setCurrentFilters({
            roles: {},
            experience: {},
            skills: {},
            engagements: {},
            payout: {},
            locations: {},
            salary_available: null,
            job_posted_date: {},
            maang_plus: {},
            team_size: {}
        })
    }

    useEffect(() => {
        if (!useDrawerFilters || !filterDrawerOpen) return;
        setDrawerFilters(currentFilters && Object.keys(currentFilters).length > 0 ? currentFilters : {});
        setDrawerRangeInputs(rangeInputs || {});
        setDrawerSearchVal(searchVal || '');
    }, [filterDrawerOpen, useDrawerFilters]);

    const handleOpenFilterDrawer = () => {
        setDrawerFilters(currentFilters && Object.keys(currentFilters).length > 0 ? currentFilters : {});
        setDrawerRangeInputs(rangeInputs || {});
        setDrawerSearchVal(searchVal || '');
        setFilterDrawerOpen(true);
    };

    const handleCloseFilterDrawer = () => {
        setFilterDrawerOpen(false);
        setDrawerFilters(currentFilters && Object.keys(currentFilters).length > 0 ? currentFilters : {});
        setDrawerRangeInputs(rangeInputs || {});
        setDrawerSearchVal(searchVal || '');
    };

    const handleDrawerApply = () => {
        setCurrentFilters({ ...drawerFilters, search: drawerSearchVal });
        setRangeInputs(drawerRangeInputs);
        onSearch(drawerSearchVal);
        setFilterDrawerOpen(false);
    };

    const handleDrawerClearAll = () => {
        removeAllFilter();
        setDrawerFilters({});
        setDrawerRangeInputs({});
        setDrawerSearchVal('');
        onSearch('');
        setFilterDrawerOpen(false);
    };

    const handleSearch = (searchText) => {
        // trackAllOpportunitiesSearch(searchText)
        onSearch(searchText)
    }

    const handleBookmarkedFilter = () => {
        setCurrentFilters({ is_saved_filter: currentFilters.is_saved_filter == 1 ? 0 : 1 })
    }

    const setSavedJobsView = (saved) => {
        const next = saved ? 1 : 0;
        if (currentFilters.is_saved_filter == next) return;
        setCurrentFilters({ is_saved_filter: next });
    }

    useEffect(() => {
        if (!syncFiltersToUrl || useDrawerFilters) return;
        if (isMobile && searchParams.get('is_saved_filter') != currentFilters.is_saved_filter) {
            setCurrentFilters({
                search: '',
                roles: {},
                experience: {},
                skills: {},
                engagements: {},
                payout: {},
                locations: {},
                salary_available: null,
                job_posted_date: {},
                maang_plus: {},
                is_saved_filter: searchParams.get('is_saved_filter')
            })
        }
    }, [searchParams.get('is_saved_filter'), syncFiltersToUrl, useDrawerFilters])

    const [mobileToggle, setMobileToggle] = useState(false)

    const handleMobileToggle = () => {
        setMobileToggle(!mobileToggle)
    }

    const drawerToolbar = (
        <div className={`jad-all-jobs-toolbar ${(masterLoader && MASTER_FILTERS.some(item => searchParams.has(item))) ? 'masterLoading' : ''}`}>
            <div className="jad-all-jobs-toolbar__actions">
                {toolbarMetaLoading ? (
                    <span
                        className="jad-all-jobs-toolbar__meta jad-all-jobs-toolbar__meta--skeleton"
                        aria-hidden="true"
                    />
                ) : toolbarMeta ? (
                    <span className="jad-all-jobs-toolbar__meta">{toolbarMeta}</span>
                ) : null}
                {!isBookmarkedActive ? (
                    <button
                        type="button"
                        className="jad-all-jobs-toolbar__filters"
                        onClick={handleOpenFilterDrawer}
                        aria-label={filterCount > 0 ? `Filters, ${filterCount} applied` : 'Filters'}
                    >
                        <FilterIcon />
                        <span>Filters</span>
                        {filterCount > 0 ? (
                            <span className="jad-all-jobs-toolbar__filters-count">{filterCount}</span>
                        ) : null}
                    </button>
                ) : null}
                <div
                    className="jad-all-jobs-toolbar__view-toggle"
                    role="group"
                    aria-label="Job list view"
                >
                    <button
                        type="button"
                        className={`jad-all-jobs-toolbar__view-option${!isBookmarkedActive ? ' is-active' : ''}`}
                        onClick={() => setSavedJobsView(false)}
                        disabled={loading}
                        aria-pressed={!isBookmarkedActive}
                    >
                        All Jobs
                    </button>
                    <button
                        type="button"
                        className={`jad-all-jobs-toolbar__view-option${isBookmarkedActive ? ' is-active' : ''}`}
                        onClick={() => setSavedJobsView(true)}
                        disabled={loading}
                        aria-pressed={!!isBookmarkedActive}
                    >
                        Saved Jobs
                        {bookmarkCount ? (
                            <span className="jad-all-jobs-toolbar__view-count">{bookmarkCount}</span>
                        ) : null}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {useDrawerFilters ? (
                <>
                    {toolbarMountInHost
                        ? (toolbarHost ? createPortal(drawerToolbar, toolbarHost) : null)
                        : drawerToolbar}
                    <AllJobsFilterDrawer
                        open={filterDrawerOpen}
                        onClose={handleCloseFilterDrawer}
                        onApply={handleDrawerApply}
                        onClearAll={handleDrawerClearAll}
                        selectedFilters={drawerFilters}
                        setSelectedFilters={setDrawerFilters}
                        masterLoader={masterLoader}
                        rangeInput={drawerRangeInputs}
                        setRangeInput={setDrawerRangeInputs}
                        subMaster={drawerSubMaster}
                        setSubMaster={setDrawerSubMaster}
                        searchValue={drawerSearchVal}
                        onSearchChange={setDrawerSearchVal}
                    />
                </>
            ) : isMobile ?
                <OpportunitiesFilterMobile
                    rangeInputs={rangeInputs}
                    noSearch={noSearch}
                    searchVal={searchVal}
                    handleSearch={handleSearch}
                    currentFilters={currentFilters}
                    setCurrentFilters={setCurrentFilters}
                    removeAllFilter={removeAllFilter}
                    bookmarkCount={bookmarkCount}
                    totalOpp={totalOpp}
                    loading={loading}
                    nonMatchingJobs={nonMatchingJobs}
                    masterLoader={masterLoader}
                    errors={errors}
                    filterCount={filterCount}
                    isBookmarkedActive={isBookmarkedActive}
                />
                :
                <div className={`opportunitiesFilter ${(masterLoader && MASTER_FILTERS.some(item => searchParams.has(item))) ? 'masterLoading' : ''}`}>
                    <div className="opportunitiesFilterInner">
                        {!noSearch &&
                            <div className={`oppFilterTop ${isBookmarkedActive ? 'bookmarkedFilter' : ''}`}>
                                <div className="searchWithEngagement">
                                    <div className="oppSearchBox">
                                        <div className="form-group">
                                            <button type="button" className="btn oppSearchIcon">
                                                <img src={IMAGE_URL + "work/filter-search-icon.svg"}
                                                    alt="filter-search-icon" />
                                            </button>
                                            <input type="text" className="form-control "
                                                placeholder="Search Opportunities"
                                                value={searchVal}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                data-hj-allow
                                            />
                                            {errors.searchOpportunity && <label className="fieldError">Please search opportunities</label>}
                                        </div>
                                    </div>
                                    {!isBookmarkedActive &&
                                        <OppEngagementFilter
                                            master={engagementFilterMaster}
                                            currenAllFilters={currentFilters}
                                            setCurrentAllFilters={setCurrentFilters}
                                        />
                                    }

                                </div>
                            </div>
                        }

                        <div className="oppFilterBottom" style={{ display: currentFilters.is_saved_filter == 1 ? 'none' : '' }}>
                            <div className="mobileFlex">
                                <button className={`outlinedBtn ${mobileToggle ? 'mobileToggleOn' : ''}`} onClick={handleMobileToggle}>
                                    <FilterIcon />
                                    Filters
                                    {filterCount > 0 ?
                                        <span className="filterCount">
                                            {filterCount}
                                        </span>
                                        :
                                        <></>
                                    }
                                </button>
                            </div>
                            <div className={`oppAdvanceFilter ${mobileToggle ? 'mobileToggleOn' : ''}`}>
                                <OppEngagementFilter
                                    master={engagementFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Posted Date"
                                    section="job_posted_date"
                                    sectionMaster={jobPostedDateFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Location"
                                    section="locations"
                                    masterLoader={masterLoader}
                                    allowSearch
                                    sectionMaster={filterMasterData.locationMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Experience"
                                    section="experience"
                                    sectionMaster={experienceFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                    onLoadRangeInput={rangeInputs.experience}
                                />
                                <OppPopoverFilter
                                    title="Salary Range"
                                    section="payout"
                                    sectionMaster={payoutFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                    onLoadRangeInput={rangeInputs.payout}
                                />
                                <OppPopoverFilter
                                    title="Team Size"
                                    section="team_size"
                                    sectionMaster={teamSizeFilterMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                    onLoadRangeInput={rangeInputs.team_size}
                                />
                                <OppPopoverFilter
                                    title="Role"
                                    section="roles"
                                    masterLoader={masterLoader}
                                    sectionMaster={filterMasterData.roleMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title="Skills"
                                    section="skills"
                                    masterLoader={masterLoader}
                                    allowSearch
                                    sectionMaster={filterMasterData.skillMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />
                                <OppPopoverFilter
                                    title={"MAANG+"}
                                    section="maang_plus"
                                    masterLoader={masterLoader}
                                    allowSearch
                                    sectionMaster={filterMasterData.maangMaster}
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />

                                <OppEstimatedSalaryFilter
                                    currenAllFilters={currentFilters}
                                    setCurrentAllFilters={setCurrentFilters}
                                />

                                <button type="button" id="clearFilters" className="tagClearBtn" onClick={removeAllFilter} style={{ display: "none" }}>
                                    Clear Filter
                                </button>
                            </div>
                        </div>
                    </div>
                    {!isPc &&
                        <div className="filtersBottom">


                            {(nonMatchingJobs === true && totalOpp > 0 && !loading) ?
                                <>
                                    {currentFilters.is_saved_filter == 1 ?
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
                                        {currentFilters.is_saved_filter === 1 ? (
                                            <>
                                                All Bookmarked{" "}
                                                {loading ? (
                                                    <i className="spinner-border-bubble"></i>
                                                ) : (
                                                    `(${bookmarkCount})`
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                All{" "}
                                                {loading ? (
                                                    <i className="spinner-border-bubble"></i>
                                                ) : (
                                                    <>
                                                        {totalOpp}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            }




                            {location.pathname != "/talent/inhouse-positions" &&
                                <div className="filtersBottmRight">
                                    <Link
                                        className={`inhouseBtn`}
                                        to={'/talent/inhouse-positions'}
                                        target="_blank"
                                    >
                                        In-house Positions
                                    </Link>
                                    <button
                                        className={`bookmarkedBtn ${currentFilters.is_saved_filter ? 'isBookmarkActive' : ''}`}
                                        onClick={handleBookmarkedFilter}
                                        disabled={loading}
                                    >
                                        <svg width="8" height="11" viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.5 10L4 7.5L0.5 10V2C0.5 1.73478 0.605357 1.48043 0.792893 1.29289C0.98043 1.10536 1.23478 1 1.5 1H6.5C6.76522 1 7.01957 1.10536 7.20711 1.29289C7.39464 1.48043 7.5 1.73478 7.5 2V10Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {currentFilters.is_saved_filter ? 'Bookmarked' : 'My Bookmarks'}
                                        <span className='bookmarkedCount'>{bookmarkCount}</span>
                                    </button>
                                </div>
                            }
                        </div>
                    }
                </div >
            }
        </>
    )
}

const Label = ({ name, onDelete, blackLabel }) => {
    return (
        <label>
            {name}
            <span type="button" className="tagCloseBtn" onClick={onDelete}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <line y1="-0.5" x2="10.9767" y2="-0.5"
                        transform="matrix(-0.68471 0.728816 0.671938 0.740608 9 1.5)"
                        stroke={blackLabel ? "#fff" : "#232323"} />
                    <line y1="-0.5" x2="10.9767" y2="-0.5"
                        transform="matrix(0.68471 0.728816 -0.671938 0.740608 1 1.5)"
                        stroke={blackLabel ? "#fff" : "#232323"} />
                </svg>
            </span>
        </label>
    )
}