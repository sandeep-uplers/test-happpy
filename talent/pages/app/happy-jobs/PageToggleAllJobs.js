import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useSearchParams } from "@/talent/navigation/routerCompat";
import { SET_TRIGGER_ALL_JOBS_RESET } from "../../../store/actions/actionsTypes";

export default function PageToggleAllJobs({ bookmarkCount, allJobsPath = "/talent/all-opportunities" }) {
    const allJobsPathname = allJobsPath.split('?')[0];
    const allJobsDefaultParams = useMemo(() => {
        const params = new URLSearchParams();
        if (allJobsPath.includes('?')) {
            new URLSearchParams(allJobsPath.split('?')[1]).forEach((value, key) => {
                params.set(key, value);
            });
        }
        return params;
    }, [allJobsPath]);

    const buildAllJobsUrl = (saved = false) => {
        const params = new URLSearchParams(allJobsDefaultParams);
        if (saved) {
            params.set('is_saved_filter', '1');
        } else {
            params.delete('is_saved_filter');
        }
        const query = params.toString();
        return query ? `${allJobsPathname}?${query}` : allJobsPathname;
    };

    const pageTitles = {
        [allJobsPathname]: "All Jobs",
        "/talent/inhouse-positions": "Inhouse Jobs",
    }
    const browseJobPages = [allJobsPathname, "/talent/inhouse-positions"]
    const location = useLocation();
    const path = location.pathname;
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const clickHandler = (e) => {
        if (!e.target.closest('.pageToggle')) {
            setIsPopoverOpen(false);
        }
    }

    useEffect(() => {
        if (isPopoverOpen) {
            document.addEventListener('click', clickHandler);
        }
        return () => {
            document.removeEventListener('click', clickHandler);
        };
    }, [isPopoverOpen]);

    const onClickJobs = () => {
        let count = 0;
        searchParams.forEach((value, key) => {
            count++;
        })
        if (path === allJobsPathname && count > 1) {
            dispatch({
                type: SET_TRIGGER_ALL_JOBS_RESET,
                payload: true
            })
        }
    }

    return (
        <div className="pageToggle">
            {browseJobPages.includes(path) ?
                <>
                    <button onClick={() => setIsPopoverOpen(!isPopoverOpen)} className={`${isPopoverOpen ? "active" : ""}`}>
                        {path === "/talent/inhouse-positions" ?
                            "Inhouse Jobs" :
                            path === allJobsPathname && searchParams.has("is_saved_filter") ?
                                "Saved Jobs" :
                                "All Jobs"
                        }
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect width="20" height="20" rx="10" fill="#FFF8D6" />
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="#231F20" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </button>

                    <div className={`jobs-popover ${isPopoverOpen ? "open" : ""}`}>
                        <Link
                            to={buildAllJobsUrl(false)} className={`${path === allJobsPathname && !searchParams.has("is_saved_filter") ? "active" : ""}`}
                            onClick={() => {onClickJobs();setIsPopoverOpen(false);}}
                        >
                            All Jobs
                        </Link>
                        <Link
                            to={buildAllJobsUrl(true)} className={`${path === allJobsPathname && searchParams.has("is_saved_filter") ? "active" : ""}`}
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            Saved Jobs {bookmarkCount ? `(${bookmarkCount})` : ''}
                        </Link>
                        <Link
                            to="/talent/inhouse-positions"
                            target='_blank'
                            className={`${path === "/talent/inhouse-positions" ? "active" : ""}`}
                            onClick={() => setIsPopoverOpen(false)}
                        >
                            Inhouse Jobs
                        </Link>
                    </div>
                </>
                :
                <>
                    {pageTitles[path]}
                </>
            }
        </div>
    )
}
