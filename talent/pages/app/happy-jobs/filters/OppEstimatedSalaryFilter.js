import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";


export default function OppEstimatedSalaryFilter({ currenAllFilters, setCurrentAllFilters }) {

    const [selectedFilter, setselectedFilter] = useState(null)
    const firstLoad = useRef(true);

    useEffect(() => {
        if (!firstLoad.current) {
            // Handle both object format {1: {...}} and simple value format (1)
            const filterValue = currenAllFilters["salary_available"];
            if (filterValue) {
                if (typeof filterValue === 'object' && Object.keys(filterValue).length > 0) {
                    // If it's an object, check if it has key "1"
                    setselectedFilter(filterValue[1] ? 1 : null);
                } else if (filterValue === 1) {
                    setselectedFilter(1);
                } else {
                    setselectedFilter(false);
                }
            } else { 
                setselectedFilter(false) 
            }
        }
    }, [currenAllFilters])

    const handleApplyFilter = useCallback(
        debounce(() => {
            if (selectedFilter == currenAllFilters["salary_available"] || (!currenAllFilters["salary_available"] && selectedFilter == false)) return
            setCurrentAllFilters({ ...currenAllFilters, ["salary_available"]: selectedFilter })
        }, 800), [selectedFilter]
    )

    useEffect(() => {
        if (!firstLoad.current) {
            handleApplyFilter()
        }
        if (firstLoad.current) {
            firstLoad.current = false
        }
        return handleApplyFilter.cancel
    }, [selectedFilter])

    const handleCheckFilter = (e) => {
        setselectedFilter(e.target.checked ? 1 : null)
    }

    return (
        <div className="engagement">
            <ul className="engagementFilter partner">
                <li key={"estimatedSalaryAvailable"}>
                    <label className="checkbox" >
                        <input type="checkbox"
                            checked={selectedFilter}
                            onChange={handleCheckFilter}
                        />
                        <span className="checkmark"></span>
                        <span style={{ paddingLeft: '20px' }}>Salary Available</span>
                    </label>
                </li>
            </ul>
        </div>
    )
}

