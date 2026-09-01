import _, { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";


export default function OppEngagementFilter({ master, currenAllFilters, setCurrentAllFilters }) {
    const [selectedFilters, setSelectedFilters] = useState({})
    const firstLoad = useRef(true);
    // const { readyFilters } = useSelector(state => state.work)
    // useEffect(() => {
    //     if (readyFilters?.filters?.locations?.length > 0) {
    //         let newFilters = { ...selectedFilters, "Remote": true }
    //         setSelectedFilters(newFilters)
    //         setCurrentAllFilters({ ...currenAllFilters, ["engagements"]: newFilters })
    //     }
    // }, [readyFilters])

    useEffect(() => {
        if (!firstLoad.current) {
            if (currenAllFilters["engagements"] && Object.keys(currenAllFilters["engagements"]).length) {
                setSelectedFilters(currenAllFilters["engagements"])
            } else { setSelectedFilters({}) }
        }
    }, [currenAllFilters])

    const handleApplyFilter = useCallback(
        debounce(() => {
            if (_.isEqual(selectedFilters, currenAllFilters["engagements"]) ||
                (!currenAllFilters["engagements"] && Object.keys(selectedFilters).length == 0))
                return
            setCurrentAllFilters({ ...currenAllFilters, ["engagements"]: selectedFilters })
        }, 800), [selectedFilters]
    )

    useEffect(() => {
        if (!firstLoad.current) {
            handleApplyFilter()
        }
        if (firstLoad.current) {
            firstLoad.current = false
        }
        return handleApplyFilter.cancel
    }, [selectedFilters])

    const handleCheckFilter = (val, e) => {
        let newSelected = { ...selectedFilters }
        if (e.target.checked) newSelected[val] = true
        else delete newSelected[val]
        setSelectedFilters(newSelected)
    }

    return (
        <ul className="engagementFilter">
            {master?.map((item, index) => (
                <li key={"engagement" + index}>
                    <label className="checkbox" >
                        <input type="checkbox"
                            checked={selectedFilters?.[item.value]}
                            onChange={(e) => handleCheckFilter(item.value, e)}
                        />
                        {item.label}
                        <span className="checkmark"></span>
                    </label>
                </li>
            ))}

        </ul>
    )
}