import { debounce, set } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { IMAGE_URL } from "../../../../components/Constant";
import { useDispatch, useSelector } from "react-redux";
import { fetchOppLocationMaster, fetchOppRoleMaster, fetchOppSkillMaster, searchSkillMaster } from "../../../../store/actions/UserActions";
import { Radiobox } from "../../../../components/common/Inputs";
import { ArrowDropDownIcon } from "../../../../assets/IconSVG";
import SectionLoader from "../../../../components/SectionLoader";
import { useLocation } from "@/talent/navigation/routerCompat";


export default function OppPopoverFilter({
    title, section, allowSearch, sectionMaster, currenAllFilters, setCurrentAllFilters, masterLoader = false, isNew = false,
    onLoadRangeInput, mobileFilters, updateMobileRangeInputs
}) {


    const [subMaster, setSubMaster] = useState({})
    const [selectedFilters, setSelectedFilters] = useState({})
    const [rangeInput, setRangeInput] = useState({})
    const [master, setMaster] = useState([])
    const [isChanged, setIsChanged] = useState(false)
    const [search, setSearch] = useState("")
    const dispatch = useDispatch();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const { readyFilters } = useSelector(state => state.work);

    useEffect(() => {
        if (onLoadRangeInput && (section == "payout" || section == "experience")) {
            setRangeInput(onLoadRangeInput)
        }
    }, [onLoadRangeInput])

    const modifyFilters = (val) => {
        setCurrentAllFilters(val)
    }

    const filterMaster = useCallback(
        debounce(() => {
            if (section == "skills") {
                setLoading(true);
                fetchOppSkillMaster(search)(dispatch)
                    .then((res) => {
                        setMaster(res.data.data)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                    .finally(() => setLoading(false))
            }
            if (section == "locations") {
                setLoading(true);
                fetchOppLocationMaster(search)(dispatch)
                    .then((res) => {
                        updateLocMaster(res.data.data)
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                    .finally(() => setLoading(false))
            }
        }, 500), [search]
    )

    const updateLocMaster = (val) => {
        let newMaster = [...val];
        if (section == "locations" && search == '' && readyFilters?.filters?.locations?.length > 0) {
            let preferredArr = readyFilters.filters.locations?.filter((preferItem) => {
                return !newMaster.map(oldItem => oldItem.value).includes(preferItem.value)
            })
            newMaster = [...preferredArr, ...newMaster]
        }
        setMaster(newMaster)
    }

    useEffect(() => {
        if (sectionMaster?.length > 0 && Object.keys(subMaster).length == 0) {
            let newSubmaster = {}
            if (section == "roles" || section == "locations" || section == "skills" || section == "maang_plus") {
                sectionMaster.map(item => {
                    if (location.pathname.includes('inhouse-positions')) {
                        newSubmaster[item.value] = item.label_without_count ?? item.label;
                    } else {
                        newSubmaster[item.value] = item.label;
                    }
                })
                setSubMaster(newSubmaster)
                return
            }
        }
    }, [sectionMaster])

    useEffect(() => {
        if (currenAllFilters[section] && Object.keys(currenAllFilters[section]).length > 0) {
            setSelectedFilters(currenAllFilters[section])
        } else {
            setSelectedFilters({});
            setIsChanged(false);
        }
    }, [currenAllFilters])


    useEffect(() => {
        if (sectionMaster?.length)
            updateLocMaster(sectionMaster)
    }, [sectionMaster])


    useEffect(() => {
        if (search) {
            //  section == 'roles' ||
            if (section == 'skills' || section == 'locations') {
                filterMaster()
            }
            else {
                let masters = [...sectionMaster]
                let filtered = masters?.filter((item) => item.label?.toLowerCase()?.includes(search?.toLowerCase()))
                setMaster(filtered)
            }
        } else {
            if (sectionMaster?.length)
                updateLocMaster(sectionMaster)
        }
        return filterMaster.cancel
    }, [search, sectionMaster])

    const [allSelected, setAllSelected] = useState(false)
    const handleSelectAll = (e) => {
        let newSelected = {}
        if (e.target.checked) {
            master.map((item) => {
                newSelected[item.value] = item
            })
        }
        setSelectedFilters(newSelected)
        setAllSelected(e.target.checked)
        setIsChanged(true)
    }

    const handleCheckFilter = (val, e, masterObj) => {
        if (section != "experience" && section != "job_posted_date" && section != "payout" && section != "team_size") {
            let newSelected = { ...selectedFilters }
            let isLocalChanged = false;
            if (e.target.checked) newSelected[val] = masterObj
            else {
                delete newSelected[val];
                if (section == "roles") {
                    isLocalChanged = true;
                }
            }
            setSelectedFilters(newSelected)
            if (Object.keys(newSelected).length > 0 || isLocalChanged) setIsChanged(true)
            else setIsChanged(false);
        }
        else if (section == "experience" || section == "job_posted_date" || section == "team_size") {
            if (section == "experience" || section == "team_size") setRangeInput({})
            let newSelected = { ...selectedFilters }
            if (e.target.checked) {
                delete newSelected[Object.keys(newSelected)[0]]
                if (section == "job_posted_date")
                    newSelected[val] = masterObj
                else
                    newSelected[val] = true
            }
            else {
                delete newSelected[Object.keys(newSelected)[0]]
            }
            setSelectedFilters(newSelected)
            if (Object.keys(newSelected).length > 0) setIsChanged(true)
            else setIsChanged(false);
        }
        else if (section == "payout") {
            let newSelected = { ...selectedFilters }
            Object.keys(newSelected).map((key) => {
                if (!sectionMaster.map(item => item.value).includes(key)) {
                    delete newSelected[key]
                }
            })
            if (Object.keys(rangeInput).length && newSelected[rangeInput[0] + "," + rangeInput[1]]) {
                delete newSelected[rangeInput[0] + "," + rangeInput[1]]
            }
            setRangeInput({})
            if (e.target.checked) newSelected[val] = true

            else {
                if (Object.keys(newSelected).length > 1) {
                    delete newSelected[val]
                } else {
                    setSelectedFilters({})
                    setIsChanged(false)
                    if (currenAllFilters[section] && Object.keys(currenAllFilters[section]).length > 0) {
                        modifyFilters({ ...currenAllFilters, [section]: {} })
                    }
                    return
                }
            }
            setSelectedFilters(newSelected)
            if (Object.keys(newSelected).length > 0) setIsChanged(true)
            else setIsChanged(false);
        }
    }

    const handleApplyFilter = () => {
        setIsChanged(false)
        setSearch("")
        if (section == "payout" || section == "experience") {
            let newCurrentFilters = { ...currenAllFilters }
            if (Object.keys(rangeInput).length) {
                newCurrentFilters[section] = { [rangeInput[0] + "," + [rangeInput[1]]]: true }
            }
            else {
                newCurrentFilters[section] = selectedFilters;
            }
            if (mobileFilters) {
                updateMobileRangeInputs(rangeInput)
            }
            modifyFilters(newCurrentFilters);
        } else {
            modifyFilters({ ...currenAllFilters, [section]: selectedFilters })
        }

        setShowDropdown(false)
        // $('.addFiltersMenu').removeClass('show')
        // $('.addFilterMainDropdown').removeClass('show')
        // $('.addFilterSubDropdown').removeClass('show')
        // $('ul li.dropdown').removeClass('openedSubMenu')

    }
    const handleUncheckFilter = (val, e) => {
        e.preventDefault();
        let newSelected = { ...selectedFilters }
        delete newSelected[val]
        if (Object.keys(newSelected).length > 0) {
            setSelectedFilters(newSelected)
            setIsChanged(true)
        }
        else {
            setSelectedFilters(newSelected)
            setIsChanged(false)
            setSearch("")
            if (currenAllFilters[section] && Object.keys(currenAllFilters[section]).length > 0) {
                modifyFilters({ ...currenAllFilters, [section]: newSelected })
            }
        }

    }
    const handleRangeInput = (limit, value) => {
        if (isNaN(value)) return
        setSelectedFilters({})
        let newRange = { ...rangeInput }
        if (limit == "lower") {
            newRange[0] = value
            setRangeInput(newRange)
        }
        else {
            newRange[1] = value
            setRangeInput(newRange)
        }
        if (newRange[0] && newRange[1] && (Number(newRange[1]) > Number(newRange[0]))) {
            setIsChanged(true)
        } else { setIsChanged(false) }
    }

    const [showDropdown, setShowDropdown] = useState(false)
    const filterRef = useRef(null)

    const handleClickOutside = (event) => {
        if (filterRef.current && !filterRef.current.contains(event.target)) {
            setShowDropdown(false)
            setIsChanged(false)
            if (!currenAllFilters[section] || Object.keys(currenAllFilters[section]).length == 0) {
                setSelectedFilters({})
            } else {
                let newSelected = { ...selectedFilters }
                Object.keys(newSelected).map((key) => {
                    if (!Object.keys(currenAllFilters[section]).includes(key)) {
                        delete newSelected[key]
                    }
                })
                setSelectedFilters(newSelected)
            }
        }
    };

    useEffect(() => {
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    useEffect(() => {
        const myElement = document.getElementById('addFiltersMenu_' + section);
        const parentDiv = myElement.parentElement;

        const position = isElementAtExtreme(myElement, parentDiv);
        if (position === 'left') {
            myElement.classList.add('left-edge'); // Add a CSS class for styling
        } else if (position === 'right') {
            myElement.classList.add('right-edge'); // Add a CSS class for styling
        } else {
            myElement.classList.remove('left-edge', 'right-edge'); // Remove edge classes
        }
    }, [showDropdown])

    const handleClear = () => {
        setSelectedFilters({})
        setRangeInput({})
        setIsChanged(false)
        setShowDropdown(false);
        setAllSelected(false);
        if (currenAllFilters[section] && Object.keys(currenAllFilters[section]).length > 0) {
            modifyFilters({ ...currenAllFilters, [section]: {} })
        }
    }

    const isElementAtExtreme = (element, parent) => {
        const parentRect = parent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (elementRect.left <= parentRect.left + 50) {
            return 'left';
        }
        if (elementRect.right + 50 >= parentRect.right) {
            return 'right';
        }
        return false;
    }

    return (
        <>
            <div ref={filterRef} id={'addFiltersMenu_' + section} className={`dropdown addFiltersMenu ${showDropdown ? "show" : ""} ${masterLoader ? 'masterLoading' : ''}`}>
                <button
                    className="dropdown-toggle addFilterToggleBtn" type="button"
                    id={section + "FilterDropDownMenu"} onClick={() => !masterLoader && setShowDropdown(!showDropdown)}
                >
                    {title == "MAANG+" && <span className="fireIcon">🔥</span>}{title}
                    {isNew && <span className="newFilterLabel">New</span>}
                    {currenAllFilters[section] && Object.keys(currenAllFilters[section]).length > 0 &&
                        <span className="filterCount">{Object.keys(currenAllFilters[section]).length}</span>
                    }
                    <ArrowDropDownIcon />
                </button>
                <div className={`dropdown-menu addFilterMainDropdown addFilterSubDropdown ${allowSearch ? 'searchable' : ''} ${showDropdown ? 'show' : ''}`}>

                    {!allowSearch && (Object.keys(selectedFilters).length > 0 || isChanged) &&
                        <div className="filterTop clearTop">
                            <button type="button" className="underlinedBtn" onClick={handleClear}>
                                Clear
                            </button>
                        </div>
                    }
                    {allowSearch &&
                        <div className="subDropdownSearch">
                            <div className="form-group">
                                <div className="btn subSearchIcon">
                                    <img src={IMAGE_URL + "work/menu-search-icon.svg"}
                                        alt="search-icon" />
                                </div>
                                <input type="text" className="form-control" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Search`} data-hj-allow />
                            </div>
                        </div>
                    }
                    {allowSearch && (Object.keys(selectedFilters).length > 0 || isChanged || (section == "maang_plus" && !search)) &&
                        <div className={`filterTop clearTop bottom ${(section == "maang_plus" && !search) ? 'maangPlus' : ''}`}>
                            {(section == "maang_plus" && !search) &&
                                <label className="checkbox" >
                                    <input type="checkbox"
                                        checked={allSelected && Object.keys(selectedFilters).length == master.length}
                                        onChange={(e) => handleSelectAll(e)} />
                                    Select All
                                    <span className="checkmark"></span>
                                </label>
                            }
                            {(Object.keys(selectedFilters).length > 0 || isChanged) && (section != "maang_plus" || Object.keys(selectedFilters).length > 0) &&
                                <button type="button" className="underlinedBtn" onClick={handleClear}>
                                    Clear
                                </button>
                            }
                        </div>
                    }
                    {section == "payout" ?
                        <ul className="addFilterSubCheckList">
                            {sectionMaster?.map((item, index) => (
                                <li key={section + "Master" + index}>
                                    <label className="checkbox" >
                                        <input type="checkbox"
                                            checked={!Object.keys(rangeInput).length && selectedFilters[item.value] == true}
                                            onChange={(e) => handleCheckFilter(item.value, e)} />
                                        {item.label} {item.label != "Confidential" && <span className="light"> per annum</span>}
                                        <span className="checkmark"></span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                        :

                        <>
                            {section == "roles" ?
                                <ul className="addFilterSubCheckList jobFunction" >
                                    {master?.map((item, index) => (
                                        <>
                                            {selectedFilters &&
                                                <li key={section + "_category_" + index}>
                                                    <h6>{item.label}</h6>
                                                    <ul>
                                                        {item.options?.map((option, index) => (
                                                            <li key={section + "_category_" + item.label + "_option_" + index}>
                                                                <label className="checkbox" >
                                                                    <input type="checkbox"
                                                                        checked={selectedFilters?.[option.value]}
                                                                        onChange={(e) => {
                                                                            handleCheckFilter(option.value, e, option)
                                                                            setSubMaster({
                                                                                ...subMaster,
                                                                                [option.value]: option.label
                                                                            })
                                                                        }} />
                                                                    {option.label}
                                                                    <span className="checkmark"></span>
                                                                </label>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            }
                                        </>
                                    ))}
                                </ul>
                                :
                                <>
                                    {(section == 'skills' || section == "locations") ?
                                        <>
                                            {Object.keys(selectedFilters).length > 0 &&
                                                <ul className="addFilterSubCheckList selected" style={{ borderBottom: master.length > 0 ? '2px solid #BFBFBF' : '' }}>
                                                    {selectedFilters && Object.keys(selectedFilters)?.map((item, index) => (
                                                        <li key={section + "selectedFilters" + index}>
                                                            <label className="checkbox" >
                                                                <input type="checkbox"
                                                                    checked={true}
                                                                    onChange={(e) => { handleUncheckFilter(item, e) }} />
                                                                {subMaster[item]}
                                                                <span className="checkmark"></span>
                                                            </label>
                                                        </li>
                                                    ))}
                                                </ul>
                                            }
                                            {loading &&
                                                <ul className="addFilterSubCheckList" >
                                                    <li>
                                                        <SectionLoader />
                                                    </li>
                                                </ul>
                                            }
                                            {section == "locations" && !search && Object.keys(selectedFilters).length == 0 &&
                                                <div className="filterTop suggested">Suggested locations</div>
                                            }
                                            {!loading && search && master.length == 0 &&
                                                <div className="filterTop suggested">No Search Result</div>
                                            }
                                            <ul className="addFilterSubCheckList" >
                                                {master?.map((item, index) => (
                                                    <>
                                                        {selectedFilters && !Object.keys(selectedFilters).includes(item.value + '') &&
                                                            <li key={section + "Master" + index}>
                                                                <label className="checkbox" >
                                                                    <input type="checkbox"
                                                                        checked={selectedFilters?.[item.value] == true}
                                                                        onChange={(e) => {
                                                                            handleCheckFilter(item.value, e, item)
                                                                            setSubMaster({
                                                                                ...subMaster,
                                                                                [item.value]:
                                                                                    location.pathname.includes('inhouse-positions') ?
                                                                                        (item.label_without_count ?? item.label) : item.label
                                                                            })
                                                                        }} />
                                                                    {location.pathname.includes('inhouse-positions') ?
                                                                        (item.label_without_count ?? item.label) : item.label}
                                                                    <span className="checkmark"></span>
                                                                </label>
                                                            </li>
                                                        }
                                                    </>
                                                ))}
                                            </ul>
                                        </>
                                        :
                                        <>
                                            <ul className="addFilterSubCheckList">
                                                {master?.map((item, index) => (
                                                    <li key={section + "Master" + index}>
                                                        {(section == "experience" || section == "job_posted_date") ?
                                                            <>
                                                                {section == "job_posted_date" ?
                                                                    <Radiobox name={item.label} checked={!!selectedFilters?.[item.value]} onChange={(e) => handleCheckFilter(item.value, e, item)} />
                                                                    :
                                                                    <Radiobox name={item.label} checked={selectedFilters?.[item.value] == true} onChange={(e) => handleCheckFilter(item.value, e)} />
                                                                }
                                                            </>
                                                            :
                                                            <label className="checkbox" >
                                                                <input type="checkbox"
                                                                    checked={selectedFilters?.[item.value]}
                                                                    onChange={(e) => handleCheckFilter(item.value, e, item)} />
                                                                {item.label}
                                                                <span className="checkmark"></span>
                                                            </label>
                                                        }
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    }
                                </>
                            }
                        </>
                    }
                    {(section == "experience" || section == "payout") &&
                        <div className="customRangeBox">
                            <h4>Enter custom range</h4>
                            <div className="customRangeInner">
                                <div className="form-group">
                                    <label>From</label>
                                    <input value={rangeInput[0] ?? ""} type="text" className="form-control" onChange={(e) => handleRangeInput("lower", e.target.value)} />
                                </div>
                                <hr />
                                <div className="form-group">
                                    <label>To</label>
                                    <div className="input-suffix">
                                        <input value={rangeInput[1] ?? ""} type="text" className="form-control" onChange={(e) => handleRangeInput("upper", e.target.value)} />
                                        {section == "payout" && <span className="light"> lacs per annum</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="applyFilterBtn">
                        <button type="button" className="btn" disabled={!isChanged}
                            onClick={handleApplyFilter}
                        >
                            SHOW RESULTS
                        </button>
                    </div>
                </div>
            </div>

        </>
    )
}