'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";

import axios from 'axios';
import _, { debounce } from "lodash";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "@/talent/navigation/routerCompat";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import { BookmarkNotification } from "../../../assets/BookmarkNotify";
import { ArrowUpIcon, GreenCheckMarkIcon } from "../../../assets/IconSVG";
import { API_ALL_OPP, API_VIEW_VIDEO_COUNT, IMAGE_URL } from "../../../components/Constant";
import { MASTER_FILTERS, POST_API, formattedJobCount, isTalentHired } from "../../../components/Helper";
import { jobPostedDateFilterMaster } from "../../../components/Masters";
import { JobDetailLoader } from "../../../components/SectionLoader";
import WaveLoader from "../../../components/WaveLoader";
import PageTimeLogger from "../../../components/common/PageTimeLogger";
import { allOppoPageLoaded, filterUsedTracking, pageVisitLoadAndCtaTrack, talentBookMarkTrack, timeTrackEvent, trackAllOpportunitiesSearch } from '../../../helpers/Mixpanel';
import { oppBookmark, removeUser } from "../../../store/actions/UserActions";
import { HR_UPDATE_COMPLETED, SET_ALL_JOBS, SET_BOOKMARK_COUNT, SET_LOADER, SET_TRIGGER_ALL_JOBS_RESET } from "../../../store/actions/actionsTypes";
import JobCard from "../happy-jobs/JobCard";
import JobDetails from "../happy-jobs/JobDetails";
import OpportunitiesFilter from "../happy-jobs/OpportunitiesFilter";
import PageToggleAllJobs from "../happy-jobs/PageToggleAllJobs";
import ShimmerJobCard from "../happy-jobs/ShimmerJobCard";
import HapppyJobCardMobile from "./HapppyJobCardMobile";
import HapppyJobCardMobileSkeletonList from "./HapppyJobCardMobileSkeleton";
import useHapppyCompactJobsLayout from "./useHapppyCompactJobsLayout";
import "../happy-jobs/oppAssessment.css";
import './HapppyAllJobs.css';

const HAPPPY_ALL_JOBS_PATH = '/talent/job-agent/recommended-jobs?tab=all-jobs';
const DEFAULT_JOB_POSTED_DATE = jobPostedDateFilterMaster.find((item) => String(item.value) === '2')
    || { label: 'Within 3 days', value: '2', value_name: '3days' };
const defaultAllJobsFilters = () => ({
    job_posted_date: { [DEFAULT_JOB_POSTED_DATE.value]: DEFAULT_JOB_POSTED_DATE },
});


let listCancelTokenSource = axios.CancelToken.source();
let countCancelTokenSource = axios.CancelToken.source();
let pendingCountUrl = null;
let pendingCountPromise = null;

const normalizeFilters = (filters = {}) => {
    const normalized = { ...filters }
    delete normalized.partner_companies
    delete normalized.aggregated_jobs
    Object.keys(normalized).forEach((key) => {
        const value = normalized[key]
        if (value === null || value === undefined || value === '') {
            delete normalized[key]
            return
        }
        if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
            delete normalized[key]
        }
    })
    return normalized
}

const filtersCacheKey = (filters = {}) => JSON.stringify(normalizeFilters(filters))

export default function HapppyAllJobs({ embedded = false, toolbarHost = null }) {
    const dispatch = useDispatch();
    if (localStorage.getItem('mixpanel_session_id') == null) {
        localStorage.setItem('mixpanel_session_id', uuidv4())
    }
    const { recruitment_data, status: talentStatus } = useSelector(state => state.auth)?.user;

    const [oppDetailsOpen, setOppDetailsOpen] = useState({})
    const [isOpen, setOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    // Preference data  

    const [isCall, setIsCall] = useState(false);
    const videoRef = useRef(null);
    const fetchGenerationRef = useRef(0);
    const lastFetchFiltersKeyRef = useRef(null);
    const countFetchKeyRef = useRef(null);
    const { triggerAllJobsReset } = useSelector(state => state.opps)

    const toggleDetails = (HR_Number) => {
        let newToggle = Object.assign({}, oppDetailsOpen)
        if (newToggle[HR_Number]) delete newToggle[HR_Number];
        else newToggle[HR_Number] = 1;
        setOppDetailsOpen(newToggle)
    }

    const listInnerRef = useRef()
    const { allJobs: allOpportunity, bookmarkCount } = useSelector(state => state.opps)
    const setAllOpportunity = (val) => {
        dispatch({ type: SET_ALL_JOBS, payload: val })
    }
    const [allData, setAllData] = useState({})
    const [jobsCount, setJobsCount] = useState(null)

    const [filters, setFilters] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const postedDate = params.get('job_posted_date');
            if (postedDate) {
                const item = jobPostedDateFilterMaster.find((entry) => entry.value_name === postedDate);
                if (item) {
                    return { job_posted_date: { [item.value]: item } };
                }
            }
        }
        return defaultAllJobsFilters();
    });

    const [prefilters, setPreFilters] = useState({});
    const [lastPage, setLastPage] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showFiltered, setShowFiltered] = useState(false)
    const isCompact = useHapppyCompactJobsLayout();
    const [activeJob, markJobActive] = useState({});

    const [searchParams, setSearchParams] = useSearchParams();

    const setActiveJob = useCallback((data) => {
        markJobActive(data);
        if (!isCompact) {
            const oldSearchParams = new URLSearchParams(window.location.search);
            if (data.HR_Number) {
                const newSearchParams = new URLSearchParams();
                newSearchParams.set('activeJob', data.HR_Number);
                oldSearchParams.forEach((value, key) => {
                    if (key !== 'activeJob') {
                        newSearchParams.append(key, value);
                    }
                });
                setSearchParams(newSearchParams, { replace: true });
            } else {
                oldSearchParams.delete('activeJob');
                setSearchParams(oldSearchParams, { replace: true });
            }
        }
    }, [isCompact, setSearchParams]);

    useEffect(() => {
        if (triggerAllJobsReset) {
            lastFetchFiltersKeyRef.current = null
            fetchGenerationRef.current += 1
            setFilters(defaultAllJobsFilters())
            dispatch({ type: SET_TRIGGER_ALL_JOBS_RESET, payload: false })
        }
    }, [triggerAllJobsReset, dispatch])

    const setBookmarkCount = (val) => {
        dispatch({ type: SET_BOOKMARK_COUNT, payload: val })
    }

    const [nonMatchingJobs, setNonMatchingJobs] = useState(null);

    const [loosenLabel, setLoosenLabel] = useState(null);
    const [loosenLoader, setLoosenLoader] = useState(false);
    const [loosenJobs, setLoosenJobs] = useState([]);

    const { hrTobeUpdated } = useSelector(state => state.opps);
    useEffect(() => {
        if (Object.keys(hrTobeUpdated).length > 0 && Object.keys(allOpportunity).length > 0) {

            let newOpps = [...allOpportunity];
            newOpps = newOpps.map((item, index) => {
                if (hrTobeUpdated[item.HR_Number]) {
                    item = { ...item, ...hrTobeUpdated[item.HR_Number] }
                    dispatch({ type: HR_UPDATE_COMPLETED, payload: { HR_Number: item.HR_Number } })
                    return item
                }
                return item
            })
            setAllOpportunity(newOpps)
        }
    }, [hrTobeUpdated])

    const firstUpdate = useRef(true);

    useEffect(() => {
        if (currentTime > 30) {
            setIsCall(false);
            viewCountVideo()
        }
    }, [currentTime])

    const viewCountVideo = async () => {
        const obj = {
            page: 'opportunities',
            video_name: 'opportunities_video',
        }
        if (isCall) {
            const { data } = await POST_API(API_VIEW_VIDEO_COUNT, obj);
        }
    }
    // const loadLoosenFilters = (loaded_hrs) => {
    //     setLoosenLabel(null);
    //     setLoosenLoader(true);
    //     getAllOpportnities(currentPage, filters, loaded_hrs)(dispatch)
    //         .then((res) => {
    //             if (res.data?.hrs?.total > 0) {
    //                 setLoosenJobs(res.data.hrs.data)
    //                 setLoosenLabel(res.data.loosen_label)
    //             }
    //         })
    //         .catch((err) => console.log(err))
    //         .finally(() => setLoosenLoader(false))
    // }

    const handleFilter = useCallback((filterData) => {
        let didChange = false;
        setFilters((prev) => {
            const nextFilters = { ...prev, ...filterData }
            if (_.isEqual(normalizeFilters(prev), normalizeFilters(nextFilters))) {
                return prev
            }
            didChange = true;
            setPreFilters(prev)
            return nextFilters
        })
        if (didChange && 'is_saved_filter' in filterData) {
            const newSearchParams = new URLSearchParams(window.location.search);
            if (filterData.is_saved_filter) {
                newSearchParams.set('is_saved_filter', '1');
            } else {
                newSearchParams.delete('is_saved_filter');
            }
            setSearchParams(newSearchParams, { replace: true });
        }
    }, [setSearchParams])

    const filtersRef = useRef(filters)
    filtersRef.current = filters

    const filterData = useCallback( // load 1st page
        debounce(() => {
            const activeFilters = filtersRef.current;
            lastFetchFiltersKeyRef.current = filtersCacheKey(activeFilters);
            const generation = ++fetchGenerationRef.current
            countFetchKeyRef.current = null
            timeTrackEvent('All Opportunity Page Loaded');
            setLoading(true);
            setCurrentPage(1);
            setLastPage(1);
            setLoosenJobs([]);
            setAllOpportunity([]);
            setJobsCount(null)
            listRef.current?.children[0]?.scrollIntoView({ behavior: 'instant', block: 'center' });
            let perPage = 10;

            getAllOpportnities(1, activeFilters, 0)(dispatch)
                .then((res) => {
                    if (generation !== fetchGenerationRef.current) return;
                    setAllData({ ...res.data.hrs })
                    setAllOpportunity(res.data.hrs.data)
                    setCurrentPage(res.data.hrs.current_page)
                    setBookmarkCount(res.data.bookmarkedCount)
                    setShowFiltered(true)
                    setOppDetailsOpen({})
                    setActiveJob(res.data.hrs.data[0] || {})
                    perPage = parseInt(res.data.hrs.per_page) || 10;
                    if (Object.keys(activeFilters).length > 0) {
                        allOppoPageLoaded('true', activeFilters)
                    } else {
                        allOppoPageLoaded()
                    }

                    setNonMatchingJobs(res.data.non_matching_jobs)
                    if (res.data.non_matching_jobs) {
                        setJobsCount(10);
                        setLastPage(1);
                        setLoading(false);
                        return
                    }

                    if (generation !== fetchGenerationRef.current) return;

                    const countKey = `${generation}:${filtersCacheKey(activeFilters)}`
                    if (countFetchKeyRef.current === countKey) return;
                    countFetchKeyRef.current = countKey;

                    getAllOpportnities(1, activeFilters, 1)(dispatch)
                        .then((res) => {
                            if (generation !== fetchGenerationRef.current) return;
                            setJobsCount(res.data.jobs_count);
                            const calculatedLastPage = Math.ceil(res.data.jobs_count / perPage);
                            setLastPage(calculatedLastPage);
                        })
                        .catch((err) => console.log(err))
                })
                .catch((err) => {
                    console.log(err)
                    if (generation === fetchGenerationRef.current) {
                        setLoading(false);
                    }
                })
        }, 500), []
    )
    const { allOppMasterValue } = useSelector(state => state.work);

    const filterMasterData = useSelector(state => state.work)?.oppFilterMaster;
    const masterDataKeyCount = Object.keys(filterMasterData).length;

    useEffect(() => {
        if (searchParams.has("is_saved_filter")) {
            if (!filters.is_saved_filter) {
                handleFilter({ is_saved_filter: 1 })
            }
        } else if (filters.is_saved_filter) {
            handleFilter({ is_saved_filter: 0 })
        }
    }, [searchParams])

    useEffect(() => {
        let filterLength = Object.keys(filters).length;
        if (filterLength > 0) {
            filterUsedTracking(prefilters, filters, allOppMasterValue)
        }
        const filtersKey = filtersCacheKey(filters)
        const mastersReady =
            masterDataKeyCount > 1 ||
            !MASTER_FILTERS.some((item) => searchParams.has(item))

        if (!mastersReady) {
            return () => filterData.cancel()
        }

        if (lastFetchFiltersKeyRef.current === filtersKey) {
            return () => filterData.cancel()
        }

        filterData();
        if (firstUpdate.current) { firstUpdate.current = false; }
        setShowFiltered(false)
        return () => filterData.cancel()
    }, [filters, masterDataKeyCount])

    useEffect(() => { // load 2nd page onwards
        if (lastPage >= currentPage && !loading && currentPage > 1) {
            getAllOpportnities(currentPage, filters, 0)(dispatch)
                .then((res) => {
                    setAllData({ ...res.data.hrs })
                    setAllOpportunity([...allOpportunity, ...res.data.hrs.data])
                    setCurrentPage(res.data.hrs.current_page)
                    // setLastPage(res.data.hrs.last_page)
                    setBookmarkCount(res.data.bookmarkedCount)
                    allOppoPageLoaded()

                    // if (res.data.search && res.data.search != "") {
                    //     firstSearch.current = true
                    //     handleFilter({ search: res.data.search })
                    // }
                })
                .catch((err) => console.log(err))
        }

    }, [currentPage])

    const [isShowArrow, setIsShowArrow] = useState(false);
    const handleScroll = (e) => {
        const show = e.target.scrollTop > 200;
        setIsShowArrow(show);
    };

    useEffect(() => {
        document.title = process.env.NEXT_PUBLIC_APP_NAME + " | All Jobs";
        pageVisitLoadAndCtaTrack('All Opportunity Page Visit')
        localStorage.removeItem('new_loggedin')
        timeTrackEvent('All Opportunity Page Loaded')

        const scrollTarget = !isCompact
            ? listRef.current
            : (listInnerRef.current?.closest('.job-agent-dashboard__main') || window);

        if (scrollTarget?.addEventListener) {
            scrollTarget.addEventListener('scroll', handleScroll, true);
        } else {
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            listCancelTokenSource.cancel('Request was canceled');
            countCancelTokenSource.cancel('Request was canceled');
            if (scrollTarget?.removeEventListener) {
                scrollTarget.removeEventListener('scroll', handleScroll, true);
            } else {
                window.removeEventListener('scroll', handleScroll, true);
            }
        };
    }, [isCompact])


    const handleScrollTop = (e, isPc = false) => {
        if (isPc) {
            listRef.current.children[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        } else {
            const scrollTarget = listInnerRef.current?.closest('.job-agent-dashboard__main');
            if (scrollTarget) {
                scrollTarget.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                listInnerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }


    const handleOppBookmark = (data, index, item = null) => {
        let oldValue = data.is_saved;
        talentBookMarkTrack(item, !oldValue ? 'add' : 'remove')
        let reqMap = {
            "hr_id": data.enc_id,
            "type": !oldValue ? 'add' : 'remove'
        }
        dispatch({ type: SET_LOADER, payload: true })
        oppBookmark(reqMap)(dispatch)
            .then((res) => {
                if (res.data.status == "success") {
                    let newData = allOpportunity.map(item => item.enc_id == data.enc_id ? { ...item, is_saved: !oldValue } : item);
                    setAllOpportunity(newData);

                    toast.success(
                        <BookmarkNotification
                            role={data.role}
                            newValue={!oldValue}
                        />,
                        {
                            position: 'bottom-center',
                            theme: 'dark',
                            closeOnClick: false,
                            autoClose: 3000,
                        });
                    if (filters.is_saved_filter) {
                        setTimeout(() => {
                            let newOpp = [...allOpportunity];
                            newOpp.splice(index, 1);
                            setAllOpportunity(newOpp);
                            setActiveJob(newOpp[0] || {});
                            setBookmarkCount(bookmarkCount - 1)
                        }, 1000)
                    } else {
                        setBookmarkCount(!oldValue ? bookmarkCount + 1 : bookmarkCount - 1)
                    }
                }
            })
            .catch((err) => {
                console.log('Error', err);
                let newData = allOpportunity.map(item => item.enc_id == data.enc_id ? { ...item, is_saved: !oldValue } : item);
                setAllOpportunity(newData)
            })
    }
    const handleImportant = () => {
        setOpen(true);
        setIsCall(true);
    }

    const noFilters = () => {
        let noFilters = Boolean(
            !filters.is_saved_filter && !filters.search &&
            Object.keys(filters).every(key =>
                ['is_saved_filter', 'search', 'sort_field'].includes(key) || Object.keys(filters[key]).length == 0
            )
        )
        return noFilters;
    }


    // const getAllOpportnities = (page, filters, is_count = 0, loosen = false) => (dispatch) => {
    const getAllOpportnities = (page, filters, is_count = 0) => (dispatch) => {
        let qryUrl = `?pagination=10&page=${page}&is_count=${is_count}`

        if (!activeJob.HR_Number && searchParams.has('activeJob')) {
            qryUrl = qryUrl + '&activeJob=' + searchParams.get('activeJob')
        }

        if (filters.is_saved_filter === 1) {
            qryUrl = qryUrl + '&is_saved_filter=1'
            if (filters.search && filters.search?.length > 0) {
                qryUrl = qryUrl + `&search=${filters.search}`
            }
        } else {
            Object.keys(filters).map((key, index) => {
                if (key === 'aggregated_jobs' || key === 'partner_companies') return
                if (filters[key]) {
                    if (key == 'sort_field') {
                        qryUrl = qryUrl + `&${key}=${encodeURIComponent(filters[key])}`
                    }
                    else if (key === 'payout') {
                        if (Object.keys(filters[key]).length) {
                            let payoutRange = Object.keys(filters[key]).map((key) => {
                                return {
                                    start: key.split(',')[0],
                                    end: key.split(',')[1],
                                }
                            })
                            qryUrl = qryUrl + "&" + key + "=" + encodeURIComponent(JSON.stringify(payoutRange))
                        }
                    }
                    else if (typeof filters[key] === 'object') {
                        if (Object.keys(filters[key]).length > 0) {
                            if (key == "engagements") {
                                let subArray = []
                                Object.keys(filters[key]).map((subKey) => {
                                    // if (typeof filters[key][subKey] === 'object') {
                                    //     subArray.push({ type: subKey, cities: Object.keys(filters[key][subKey]).toString() })
                                    // } else {
                                    subArray.push({ type: subKey })
                                    // }
                                })
                                qryUrl = qryUrl + "&" + key + "=" + encodeURIComponent(JSON.stringify(subArray));
                            }
                            else if (key == 'shifts') {
                                qryUrl = qryUrl + "&" + key + "=" + encodeURIComponent(JSON.stringify(Object.keys(filters[key])));
                            } else
                                qryUrl = qryUrl + "&" + key + "=" + encodeURIComponent(Object.keys(filters[key]).toString());
                        }
                    }
                    else {
                        qryUrl = qryUrl + `&${key}=${encodeURIComponent(filters[key])}`
                    }
                }

            })
        }

        qryUrl = qryUrl + '&aggregated_jobs=1'

        let api_url = API_ALL_OPP;
        // if (loosen) {
        //     qryUrl = qryUrl + `&loosen_needed=1&loaded_hrs=${loosen}`
        // }
        // else {
        //     setLoosenLabel(null)
        // }

        if (is_count === 1 && pendingCountUrl === qryUrl && pendingCountPromise) {
            return pendingCountPromise;
        }

        return new Promise((resolve, reject) => {
            axios.defaults.headers.common['Authorization'] = "Bearer " + localStorage.getItem('token');
            const isCountRequest = is_count === 1;
            if (isCountRequest) {
                if (pendingCountUrl && pendingCountUrl !== qryUrl) {
                    countCancelTokenSource.cancel('Request was canceled');
                }
                countCancelTokenSource = axios.CancelToken.source();
            } else {
                listCancelTokenSource.cancel('Request was canceled');
                listCancelTokenSource = axios.CancelToken.source();
                setLoading(true);
            }
            const requestPromise = axios.get(api_url + qryUrl, {
                cancelToken: isCountRequest ? countCancelTokenSource.token : listCancelTokenSource.token
            })
                .then((res) => {
                    if (!isCountRequest) {
                        mixpanelSearchTrack();
                        setLoading(false);
                    }
                    resolve(res);
                })
                .catch((err) => {
                    if (err.response && err.response.status && err.response.status == 401) {
                        removeUser()(dispatch);
                    }
                    if (err.response && err.response.status && err.response.status == 422) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: err.response.data.errors
                        });
                    }
                    if (axios.isCancel(err)) {
                        console.log('Request canceled');
                    } else if (!isCountRequest) {
                        setLoading(false);
                    }
                    reject(err)
                })
                .finally(() => dispatch({ type: SET_LOADER, payload: false }))

            if (isCountRequest) {
                pendingCountUrl = qryUrl;
                pendingCountPromise = requestPromise.finally(() => {
                    if (pendingCountUrl === qryUrl) {
                        pendingCountUrl = null;
                        pendingCountPromise = null;
                    }
                });
            }
        })
    }

    const mixpanelSearchTrack = () => {
        const activeFilters = filtersRef.current;
        const previousSearch = localStorage.getItem("previousSearch");
        if (previousSearch != activeFilters.search && activeFilters.search?.length > 0) {
            trackAllOpportunitiesSearch(activeFilters.search)
            localStorage.setItem("previousSearch", activeFilters.search);
        }
    }

    const loadMoreOpportunities = useCallback(() => {
        if (!loading && currentPage < lastPage) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    }, [currentPage, lastPage, loading]);

    const observerRef = useRef(null)
    const listRef = useRef(null);

    useEffect(() => {
        if (allOpportunity.length == 0 && !searchParams.has('is_saved_filter') && !loading) {
            markJobActive({});
        };
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver((entries) => {
            const target = entries[0];
            if (target.isIntersecting) {
                loadMoreOpportunities();
                observerRef.current.unobserve(target.target);
            }
        });

        // Get the list of children directly
        const items = listRef.current?.children;
        if (items && items.length >= 2) {
            const targetElement = items[items.length - 2];
            observerRef.current.observe(targetElement);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [allOpportunity, lastPage, loading]);

    const handleNotInterested = (HR_Number) => {
        let newData = allOpportunity.filter(item => item.HR_Number != HR_Number)
        if (newData.length == 0 && (Object.keys(filters).length > 0 || filters.search !== '')) {
            lastFetchFiltersKeyRef.current = null
            fetchGenerationRef.current += 1
            setFilters({});
            return
        }
        setAllOpportunity(newData);
    }

    // LOGS 
    // console.log('lastPage :', lastPage);
    // console.log('currentPage :', currentPage);
    // console.log('allOpportunity :', allOpportunity);
    // console.log('allData :', allData);
    // console.log('jobsCount :', jobsCount);


    return (
        <>
            {isCompact ?
                <section className={`containSection jad-all-jobs-wrap${embedded ? ' jad-all-jobs-wrap--embedded' : ''}`} ref={listInnerRef} >
                    <>

                        <button type="button" className={`pageUp allOpp ${isShowArrow ? 'open' : ''}`} onClick={handleScrollTop} >
                            <ArrowUpIcon />
                        </button>
                        {!embedded ? (
                            <AllOppHeader handleImportant={handleImportant} isCandidateDeployed={isTalentHired(talentStatus)} recruitment_data={recruitment_data} />
                        ) : null}
                        <div className="allOpportunities" >
                            <OpportunitiesFilter
                                totalOpp={filters.is_saved_filter ? allOpportunity.length : jobsCount}
                                searchVal={filters.search}
                                onSearch={val => handleFilter({ search: val })}
                                currentFilters={filters}
                                setCurrentFilters={obj => handleFilter(obj)}
                                sort={filters.sort_field}
                                setSort={val => handleFilter({ sort_field: val })}
                                showFiltered={showFiltered}
                                loading={loading}
                                bookmarkCount={bookmarkCount}
                                nonMatchingJobs={nonMatchingJobs}
                                isBookmarkedActive={filters.is_saved_filter}
                                defaultJobPostedDate={DEFAULT_JOB_POSTED_DATE}
                                filterLayout="drawer"
                                toolbarHost={embedded && isCompact ? toolbarHost : null}
                                toolbarMountInHost={embedded && isCompact}
                                toolbarMeta={
                                    jobsCount !== null
                                        ? `Showing ${formattedJobCount(jobsCount)} ${Object.keys(filters).length > 0 ? 'results' : 'jobs'}`
                                        : null
                                }
                                toolbarMetaLoading={jobsCount === null}
                            />
                            {/* {(currentPage == 1 && loading) && <SectionLoader />} */}
                            {/* <AllJobsResumeBanner /> */}
                            {/* <AllJobsTailorResumeBanner /> */}
                            <div className="opportunityList" ref={listRef} key={"opportunityList" + currentPage}>
                                {allOpportunity.map((item, index) => (
                                    <React.Fragment key={"opportunity" + item.HR_Number}>
                                        <HapppyJobCardMobile
                                            data={item}
                                            allData={item}
                                            key={"opportunity" + item.HR_Number}
                                            handleOppBookmark={(data) => handleOppBookmark(data, index, item)}
                                            fadeClass={filters.is_saved_filter && showFiltered && !item.is_saved && !loading}
                                            isClosed={[0, 2, 3].includes(item.status) || ["Completed", "On Hold", "Cancelled", "Lost"].includes(item.HR_Status) || item.closed_for_talent}
                                            currentIndex={index}
                                            prefilters={prefilters}
                                            filters={filters}
                                        />
                                    </React.Fragment>
                                ))}


                                {loosenJobs.length > 0 &&
                                    <div className="allViewedSearch">
                                        <GreenCheckMarkIcon />
                                        You've viewed all jobs for this search
                                    </div>
                                }
                                {loosenLoader ?
                                    <HapppyJobCardMobileSkeletonList bookMarkedTab={false} count={3} />
                                    :
                                    (loosenJobs.length > 0) &&
                                    <div className="loosenJobsSection">
                                        {loosenLabel &&
                                            <div className="loosenLabel" dangerouslySetInnerHTML={{ __html: loosenLabel }}>
                                                {/* We found {loosenJobs.length} more jobs that might interest you
                                                <strong>{loosenLabel}</strong> */}
                                            </div>
                                        }
                                        {loosenJobs.map((item, index) => (
                                            <React.Fragment key={"otherOpportunity" + item.HR_Number}>
                                                {/* {index > 0 && index % 6 == 0 &&
                                                    <DormammuBanner />
                                                } */}
                                                <HapppyJobCardMobile
                                                    data={item}
                                                    allData={item}
                                                    key={"otherOpportunity" + item.HR_Number}
                                                    handleOppBookmark={(data) => handleOppBookmark(data, index, item)}
                                                    fadeClass={filters.is_saved_filter && showFiltered && !item.is_saved && !loading}
                                                    isClosed={[0, 2, 3].includes(item.status) || ["Completed", "On Hold", "Cancelled", "Lost"].includes(item.HR_Status) || item.closed_for_talent}
                                                    currentIndex={index}
                                                    prefilters={prefilters}
                                                    filters={filters}
                                                />
                                            </React.Fragment>
                                        ))}
                                    </div>
                                }
                                {loading && (
                                    <HapppyJobCardMobileSkeletonList
                                        bookMarkedTab={filters.is_saved_filter}
                                        totalOpp={jobsCount}
                                        currentPage={currentPage}
                                    />
                                )}
                            </div>
                            {/* {loading && <SectionLoader />} */}
                            {/* {currentPage < lastPage &&
                            <div className="d-flex justify-content-center ">
                                {!loading && (currentPage != 1 || (currentPage == 1 && showFiltered)) ?
                                    <button type="button" className="loadMoreBtn" onClick={() => setCurrentPage(currentPage + 1)}>Load More</button>
                                    :
                                    currentPage != 1 && <SectionLoader />
                                }
                            </div>
                        } */}
                        </div>
                        {currentPage === lastPage && allOpportunity.length > 0 && !loading && jobsCount > 0 && <div className="endMessageInfo">You have reached at end of the page</div>}
                        {allOpportunity.length == 0 && !loading &&
                            <>
                                {Object.keys(filterMasterData).length < 2 && MASTER_FILTERS.some(item => searchParams.has(item)) ?
                                    <div className="opportunitiesNotFound hasMasterLoader">
                                        <WaveLoader />
                                        <p>We’re tailoring your job list with the perfect matches—hang tight!</p>
                                    </div>
                                    :
                                    <>
                                        {filters.search ?
                                            <div className="opportunitiesNotFound">
                                                <img src={IMAGE_URL + "work/opportunities-not-found.svg"} alt="opportunities-not-found" />
                                                <p>Sorry! We couldn’t find what you were searching for.</p>
                                                <p>Meanwhile you can try searching for something else</p>
                                            </div>
                                            :
                                            <>
                                                {filters.is_saved_filter ?
                                                    <>
                                                        {conatinsExtraFilters(filters) ?
                                                            <div className="opportunitiesNotFound">
                                                                <img src={IMAGE_URL + "work/opportunities-not-found.svg"} alt="opportunities-not-found" />
                                                                <p>Sorry! We couldn’t find what you were searching for.</p>
                                                                <p>Meanwhile you can try changing the filters and we hope you find what you’re looking for.</p>
                                                            </div>
                                                            :
                                                            <div className="opportunitiesNotFound">
                                                                <img src={IMAGE_URL + "work/opportunities-not-found.svg"} alt="opportunities-not-found" />
                                                                <p>Looks like you haven’t bookmarked any opportunities yet</p>
                                                                <p>Meanwhile you can go back and bookmark any opportunities you desire and always come back to them</p>
                                                                <button className="underlinedBackBtn mt-3" onClick={() => handleFilter({ is_saved_filter: 0 })}>

                                                                    <img src={IMAGE_URL + 'arrow-back.svg'} />&nbsp;
                                                                    <span className="text-decoration-underline">Go back</span>
                                                                </button>
                                                            </div>
                                                        }
                                                    </>
                                                    :
                                                    <div className="opportunitiesNotFound">
                                                        <img src={IMAGE_URL + "work/opportunities-not-found.svg"} alt="opportunities-not-found" />
                                                        <p>Sorry! We couldn’t find what you were searching for.</p>
                                                        <p>Meanwhile you can try changing the filters and we hope you find what you’re looking for.</p>
                                                    </div>
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </>
                        }
                    </>

                    <Modal
                        isOpen={isOpen}
                        onRequestClose={() => setOpen(false)}
                        portalClassName="react-modal-portal"
                        className={`modal commonModal fade ${isOpen && "show"}`}
                    >
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setOpen(false)}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <div className="modal-body profileImp">
                                    <div className="head">
                                        <img src={IMAGE_URL + 'flagInHole.svg'} />
                                        <div>
                                            <h3 className="text-left mt-3">Why take assessments for opportunities ?</h3>
                                            <h6>Watch this short 2 min video understand about assessments for opportunities</h6>
                                        </div>
                                    </div>
                                    <div className="profileImpDiv">
                                        <div className="modalFullVideoBox">
                                            <video ref={videoRef} src="https://cdnemail.uplers.com/ats/Assesment-Video-Updated.mp4" autoPlay disablePictureInPicture controlsList="nodownload"
                                                controls style={{ height: "100%", width: "100%" }}
                                                onTimeUpdate={() => setCurrentTime(videoRef.current.currentTime)}
                                            />
                                        </div>
                                    </div>
                                    <div className="modalAction justify-content-start">
                                        <button type="button" className="btn" onClick={() => { setOpen(false); }}>complete Assessment</button>
                                        <button type="button" data-dismiss="modal" onClick={() => setOpen(false)} className="btn modalBackBtn">
                                            GOT IT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>

                    <PageTimeLogger pageName={'all opportunities'} />
                </section>
                :
                <section className={`containSection workPc jad-all-jobs-wrap${embedded ? ' jad-all-jobs-wrap--embedded' : ''}`} ref={listInnerRef} >
                    <div className="allOpportunities" >
                        <OpportunitiesFilter
                            totalOpp={filters.is_saved_filter ? allOpportunity.length : jobsCount}
                            searchVal={filters.search}
                            onSearch={val => handleFilter({ search: val })}
                            currentFilters={filters}
                            setCurrentFilters={obj => handleFilter(obj)}
                            sort={filters.sort_field}
                            showFiltered={showFiltered}
                            loading={loading}
                            bookmarkCount={bookmarkCount}
                            nonMatchingJobs={nonMatchingJobs}
                            isBookmarkedActive={filters.is_saved_filter}
                            defaultJobPostedDate={DEFAULT_JOB_POSTED_DATE}
                            isPc={true}
                            filterLayout="drawer"
                            toolbarHost={embedded && isCompact ? toolbarHost : null}
                            toolbarMountInHost={embedded && isCompact}
                            toolbarMeta={
                                jobsCount !== null
                                    ? `Showing ${formattedJobCount(jobsCount)} ${Object.keys(filters).length > 0 ? 'results' : 'jobs'}`
                                    : null
                            }
                            toolbarMetaLoading={jobsCount === null}
                        />
                        <div className={`contentDiv ${filters.is_saved_filter ? 'bookmarkedFilter' : ''}`}>
                            <div className="jobListSection">
                                {!embedded ? (
                                    <div className="jobListHead">
                                        <PageToggleAllJobs bookmarkCount={bookmarkCount} allJobsPath={HAPPPY_ALL_JOBS_PATH} />
                                        {(!(loading && currentPage == 1) && jobsCount !== null) &&
                                            <span className="jobCount">
                                                Showing {formattedJobCount(jobsCount)} {Object.keys(filters).length > 0 ? 'Result' : 'Jobs'}
                                            </span>
                                        }
                                    </div>
                                ) : null}
                                {/* <AllJobsTailorResumeBanner /> */}
                                <button type="button" className={`pageUp allOpp ${isShowArrow ? 'open' : ''}`} onClick={(e) => handleScrollTop(e, true)} >
                                    <ArrowUpIcon />
                                </button>
                                <div className="list" ref={listRef}>
                                    {(nonMatchingJobs === true && (filters.is_saved_filter ? allOpportunity.length : jobsCount) > 0 && !loading) &&
                                        <>
                                            {filters.is_saved_filter == 1 ?
                                                <div className="noMatchingJobs">
                                                    <span>No matching jobs found</span>
                                                    <strong>Showing all jobs that are bookmarked ({filters.is_saved_filter ? allOpportunity.length : jobsCount})</strong>
                                                </div>
                                                :
                                                <div className="noMatchingJobs">
                                                    <span>No matching jobs found</span>
                                                    <strong>Showing jobs that best match your profile ({filters.is_saved_filter ? allOpportunity.length : jobsCount})</strong>
                                                </div>
                                            }
                                        </>
                                    }
                                    {allOpportunity.map((item, index) => (
                                        <React.Fragment key={"opportunity" + item.HR_Number}>
                                            {/* {index > 0 && index % 8 == 0 &&
                                                <DormammuBanner />
                                            } */}
                                            <JobCard
                                                data={item}
                                                allData={item}
                                                opportunityType={"all"}
                                                key={"opportunity" + item.HR_Number}
                                                totalOpp={jobsCount}
                                                isJDopen={oppDetailsOpen[item.HR_Number]}
                                                toggleDetails={() => toggleDetails(item.HR_Number)}
                                                handleOppBookmark={(data) => handleOppBookmark(data, index, item)}
                                                fadeClass={filters.is_saved_filter && showFiltered && !item.is_saved && !loading}
                                                isPaused={(item.HR_Status == 'Paused' && !item.is_applied)}
                                                isClosed={[0, 2, 3].includes(item.status) || ["Completed", "On Hold", "Cancelled", "Lost"].includes(item.HR_Status) || item.closed_for_talent}
                                                currentIndex={index}
                                                prefilters={prefilters}
                                                filters={filters}
                                                handleNotInterested={handleNotInterested}
                                                activeJob={activeJob}
                                                setActiveJob={setActiveJob}
                                            />
                                        </React.Fragment>
                                    ))}

                                    {loosenJobs.length > 0 &&
                                        <div className="allViewedSearch">
                                            <GreenCheckMarkIcon />
                                            You've viewed all jobs for this search
                                        </div>
                                    }
                                    {loosenLoader ?
                                        <ShimmerJobCard bookMarkedTab={false} />
                                        :
                                        (loosenJobs.length > 0) &&
                                        <div className="loosenJobsSection">
                                            {loosenLabel &&
                                                <div className="loosenLabel" dangerouslySetInnerHTML={{ __html: loosenLabel }}>
                                                </div>
                                            }
                                            {loosenJobs.map((item, index) => (
                                                <React.Fragment key={"otherOpportunity" + item.HR_Number}>
                                                    {/* {index > 0 && index % 12 == 0 &&
                                                        <DormammuBanner />
                                                    } */}
                                                    <JobCard
                                                        data={item}
                                                        allData={item}
                                                        opportunityType={"all"}
                                                        key={"otherOpportunity" + item.HR_Number}
                                                        totalOpp={jobsCount}
                                                        isJDopen={oppDetailsOpen[item.HR_Number]}
                                                        toggleDetails={() => toggleDetails(item.HR_Number)}
                                                        handleOppBookmark={(data) => handleOppBookmark(data, index, item)}
                                                        fadeClass={filters.is_saved_filter && showFiltered && !item.is_saved && !loading}
                                                        isPaused={(item.HR_Status == 'Paused' && !item.is_applied)}
                                                        isClosed={[0, 2, 3].includes(item.status) || ["Completed", "On Hold", "Cancelled", "Lost"].includes(item.HR_Status) || item.closed_for_talent}
                                                        currentIndex={index}
                                                        prefilters={prefilters}
                                                        filters={filters}
                                                        handleNotInterested={handleNotInterested}
                                                        activeJob={activeJob}
                                                        setActiveJob={setActiveJob}
                                                    />
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    }

                                    {loading && <ShimmerJobCard bookMarkedTab={filters.is_saved_filter} totalOpp={jobsCount} currentPage={currentPage} />}

                                    {currentPage === lastPage && allOpportunity.length > 0 && !loading && jobsCount > 0 && <div className="endMessageInfo">You have reached at end of the page</div>}
                                </div>
                            </div>
                            {(!(loading && currentPage == 1) && activeJob?.HR_Number) ?
                                <JobDetails
                                    data={allOpportunity.find(item => item.HR_Number == activeJob?.HR_Number) || {}}
                                    bookmarkCount={bookmarkCount}
                                    allOpportunity={allOpportunity}
                                    setAllOpportunity={setAllOpportunity}
                                    setBookmarkCount={setBookmarkCount}
                                    setActiveJob={setActiveJob}
                                    isBookmarkedActive={filters.is_saved_filter}
                                    hideApplyCta
                                />
                                :
                                loading ?
                                    <JobDetailLoader />
                                    :
                                    <>
                                        {allOpportunity.length == 0 && filters.is_saved_filter &&
                                            <div className="noData">
                                                <img src={IMAGE_URL + 'work/nojobs.png'} />
                                                <text>You have not saved any jobs yet</text>
                                                <Link to={HAPPPY_ALL_JOBS_PATH} className="primaryBtn">Explore Jobs</Link>
                                            </div>
                                        }
                                    </>
                            }
                        </div>
                    </div>
                </section>
            }
        </>
    )

}


function conatinsExtraFilters(filters) {
    let returnValue = false
    Object.keys(filters).map((key) => {
        if (typeof filters[key] == 'object') {
            if (Object.keys(filters[key]).length > 0) {
                returnValue = true
            }
        }
        else if (key != 'is_saved_filter' && filters[key]) {
            returnValue = true
        }
    })
    return returnValue
}

const AllOppHeader = ({ handleImportant, isCandidateDeployed = false, recruitment_data }) => {

    return (
        <>
            {isCandidateDeployed &&
                <>
                    <div className="talentDeployedBanner">
                        <img src={IMAGE_URL + 'work/partyPopperDeployed.svg'} />
                        <div className="content">
                            <h5>Congratulations! Your engagement with&nbsp;
                                {recruitment_data.length == 0 ? 'client' : recruitment_data[recruitment_data.length - 1].company?.company_name}&nbsp;has successfully started</h5>
                            <span>
                                <p className="excited">We're excited for you!</p>
                                <p>Please note that while your engagement is active, you won't be able to apply for other opportunities.
                                    But don't worry; this engagement will be a great learning experience for you.
                                    It is advised to you to focus on engagement and deliver your best.
                                    We are waiting to see your outstanding contribution to your engagement!
                                </p>
                            </span>
                        </div>
                    </div>
                </>
            }
        </>
    )
}
