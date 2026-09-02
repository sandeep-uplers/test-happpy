import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "@/talent/navigation/routerCompat";
import { Radiobox } from "../../../../components/common/Inputs";
import { IMAGE_URL } from "../../../../components/Constant";
import { engagementFilterMaster, experienceFilterMaster, jobPostedDateFilterMaster, payoutFilterMaster, teamSizeFilterMaster } from "../../../../components/Masters";
import SectionLoader from "../../../../components/SectionLoader";
import { fetchOppLocationMaster, fetchOppRoleMaster, fetchOppSkillMaster } from "../../../../store/actions/UserActions";


function ChevronDownIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function OppTabFilters({
    selectedFilters,
    setSelectedFilters,
    rangeInput,
    setRangeInput,
    subMaster,
    setSubMaster,
    layout = 'tabs',
}) {
    const [activeTab, setActiveTab] = useState(tabList[0]);
    const [sectionMaster, setSectionMaster] = useState([])
    const [section, setSection] = useState('engagement')
    const filterMasterData = useSelector(state => state.work)?.oppFilterMaster;

    useEffect(() => {
        setSection(activeTab.section)
        setSectionMaster(activeTab.master ?? filterMasterData[activeTab.masterKey])
    }, [activeTab])

    useEffect(() => {
        let newRange = { ...rangeInput[section] || {} }
        if (newRange[0] && newRange[1] && (Number(newRange[1]) > Number(newRange[0]))) {
            updateSelectedFilter({ [newRange[0] + "," + newRange[1]]: true })
        }
    }, [rangeInput[section]])

    const [master, setMaster] = useState([])
    const [search, setSearch] = useState("")
    const dispatch = useDispatch();
    const location = useLocation();
    const pathname = location.pathname;
    const [loading, setLoading] = useState(false);
    const { readyFilters } = useSelector(state => state.work);


    // useEffect(() => {
    //     console.log('onLoadRangeInput', onLoadRangeInput);
    //     if (onLoadRangeInput[section] && (section == "payout" || section == "experience")) {
    //         setRangeInput(prev => ({ ...prev, [section]: onLoadRangeInput[section] }))
    //     }
    // }, [onLoadRangeInput, section])

    const modifyFilters = (val) => {
        setSelectedFilters(val)
    }

    const updateSelectedFilter = (val) => {
        setSelectedFilters({ ...selectedFilters, [section]: val })
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
        if (sectionMaster?.length > 0 && (!subMaster[section] || Object.keys(subMaster[section]).length == 0)) {
            let newSubmaster = {}
            if (section == "roles" || section == "locations" || section == "skills" || section == "maang_plus") {
                sectionMaster.map(item => {
                    if (location.pathname.includes('inhouse-positions')) {
                        newSubmaster[item.value] = item.label_without_count ?? item.label;
                    } else {
                        newSubmaster[item.value] = item.label;
                    }
                })
                setSubMaster(prev => ({ ...prev, [section]: newSubmaster }))
                return
            }
        }
    }, [sectionMaster])




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
        updateSelectedFilter(newSelected)
        setAllSelected(e.target.checked)
    }

    const handleCheckFilter = (val, e, masterObj) => {
        if (section != "experience" && section != "job_posted_date" && section != "payout" && section != "team_size") {
            let newSelected = { ...selectedFilters[section] }
            if (e.target.checked) newSelected[val] = masterObj
            else delete newSelected[val]
            updateSelectedFilter(newSelected)
        }
        else if (section == "experience" || section == "job_posted_date" || section == "team_size") {
            if (section == "experience" || section == "team_size") setRangeInput(prev => ({ ...prev, [section]: {} }))
            let newSelected = { ...selectedFilters[section] }
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
            updateSelectedFilter(newSelected)
        }
        else if (section == "payout") {
            let newSelected = { ...selectedFilters[section] }
            Object.keys(newSelected).map((key) => {
                if (!sectionMaster.map(item => item.value).includes(key)) {
                    delete newSelected[key]
                }
            })
            if (Object.keys(rangeInput).length && newSelected[rangeInput[0] + "," + rangeInput[1]]) {
                delete newSelected[rangeInput[0] + "," + rangeInput[1]]
            }
            setRangeInput(prev => ({ ...prev, [section]: {} }))
            if (e.target.checked) newSelected[val] = true

            else {
                if (Object.keys(newSelected).length > 1) {
                    delete newSelected[val]
                } else {
                    updateSelectedFilter({})
                    if (selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0) {
                        modifyFilters({ ...selectedFilters, [section]: {} })
                    }
                    return
                }
            }
            updateSelectedFilter(newSelected)
        }
    }

    const handleUncheckFilter = (val, e) => {
        e.preventDefault();
        let newSelected = { ...selectedFilters[section] }
        delete newSelected[val]
        if (Object.keys(newSelected).length > 0) {
            updateSelectedFilter(newSelected)
        }
        else {
            updateSelectedFilter(newSelected)
            setSearch("")
            if (selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0) {
                modifyFilters({ ...selectedFilters, [section]: newSelected })
            }
        }

    }
    const handleRangeInput = (limit, value) => {
        if (isNaN(value)) return
        let newRange = { ...rangeInput[section] || {} }
        if (limit == "lower") {
            newRange[0] = value
            setRangeInput(prev => ({ ...prev, [section]: newRange }))
            updateSelectedFilter({})
        }
        else {
            newRange[1] = value
            setRangeInput(prev => ({ ...prev, [section]: newRange }))
        }
    }

    const handleClear = () => {
        if (section == "payout" || section == "experience") {
            setRangeInput(prev => ({ ...prev, [section]: {} }))
        }
        setAllSelected(false);
        if (selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0) {
            modifyFilters({ ...selectedFilters, [section]: {} })
        }
    }


    const [accordionOpenSection, setAccordionOpenSection] = useState(tabList[0].section);

    const visibleTabs = tabList.filter(tab => !(pathname.includes('inhouse-positions') && tab.section === "salary_available"));

    const getSectionCount = (tabSection) => {
        const value = selectedFilters[tabSection];
        if (!value || typeof value !== 'object') return 0;
        return Object.keys(value).length;
    };

    const isCustomRangeActive = () => {
        const range = rangeInput[section];
        if (range && (range[0] || range[1])) return true;
        const selected = selectedFilters[section];
        if (!selected || typeof selected !== 'object') return false;
        const masterKeys = (sectionMaster ?? []).map((item) => String(item.value));
        return Object.keys(selected).some((key) => key.includes(',') && !masterKeys.includes(key));
    };

    const filterPanelContent = (
        <>

                {activeTab.allowSearch &&
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
                {activeTab.allowSearch && ((selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0) || (section == "maang_plus" && !search)) &&
                    <div className={`filterTop clearTop bottom ${(section == "maang_plus" && !search) ? 'maangPlus' : ''}`}>
                        {((section == "maang_plus" && !search)) &&
                            <label className="checkbox" >
                                <input type="checkbox"
                                    checked={allSelected && Object.keys(selectedFilters[section]).length == master.length}
                                    onChange={(e) => handleSelectAll(e)} />
                                Select All
                                <span className="checkmark"></span>
                            </label>
                        }
                        {selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0 &&
                            <button type="button" className="underlinedBtn" onClick={handleClear}>
                                Clear
                            </button>
                        }
                    </div>
                }
                <div className={`content ${section == "maang_plus" ? 'maangPlus' : ''}`}>
                    {section == "salary_available" ?
                        <>
                            <ul className="addFilterSubCheckList">
                                {sectionMaster?.map((item, index) => (
                                    <li key={section + "Master" + index}>
                                        <label className="checkbox" >
                                            <input type="checkbox"
                                                checked={selectedFilters[section]?.[item.value]}
                                                onChange={(e) => handleCheckFilter(item.value, e, item)} />
                                            {item.label}&nbsp;
                                            <span className="checkmark"></span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </>
                        :
                        <>
                            {section == "payout" ?
                                <ul className="addFilterSubCheckList">
                                    {sectionMaster?.map((item, index) => (
                                        <li key={section + "Master" + index}>
                                            <label className="checkbox" >
                                                <input type="checkbox"
                                                    checked={!(rangeInput[section] && Object.keys(rangeInput[section]).length) && selectedFilters[section]?.[item.value] == true}
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
                                                                                checked={Boolean(selectedFilters[section]?.[option.value])}
                                                                                onChange={(e) => {
                                                                                    handleCheckFilter(option.value, e, option)
                                                                                    setSubMaster({
                                                                                        ...subMaster,
                                                                                        [section]: {
                                                                                            ...subMaster[section],
                                                                                            [item.value]: item.label
                                                                                        }
                                                                                    })
                                                                                }}

                                                                            />
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
                                                    {selectedFilters[section] && Object.keys(selectedFilters[section]).length > 0 &&
                                                        <ul className="addFilterSubCheckList selected" style={{ borderBottom: master.length > 0 ? '2px solid #BFBFBF' : '' }}>
                                                            {Object.keys(selectedFilters[section])?.map((item, index) => (
                                                                <li key={section + "selectedFilters" + index}>
                                                                    <label className="checkbox" >
                                                                        <input type="checkbox"
                                                                            checked={true}
                                                                            onChange={(e) => { handleUncheckFilter(item, e) }} />
                                                                        {subMaster[section]?.[item]}
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
                                                    {section == "locations" && !search && (!selectedFilters[section] || Object.keys(selectedFilters[section]).length == 0) &&
                                                        <div className="filterTop suggested">Suggested locations</div>
                                                    }
                                                    {!loading && search && master.length == 0 &&
                                                        <div className="filterTop suggested">No Search Result</div>
                                                    }
                                                    <ul className="addFilterSubCheckList" >
                                                        {master?.map((item, index) => (
                                                            <>
                                                                {(!selectedFilters[section] || !Object.keys(selectedFilters[section]).includes(item.value + '')) &&
                                                                    <li key={section + "Master" + index}>
                                                                        <label className="checkbox" >
                                                                            <input type="checkbox"
                                                                                checked={selectedFilters[section]?.[item.value] == true}
                                                                                onChange={(e) => {
                                                                                    handleCheckFilter(item.value, e, item)
                                                                                    setSubMaster({
                                                                                        ...subMaster,
                                                                                        [section]: {
                                                                                            ...subMaster[section],
                                                                                            [item.value]:
                                                                                                location.pathname.includes('inhouse-positions') ?
                                                                                                    (item.label_without_count ?? item.label) : item.label
                                                                                        }
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
                                                                            <Radiobox name={item.label} checked={!!selectedFilters[section]?.[item.value]} onChange={(e) => handleCheckFilter(item.value, e, item)} />
                                                                            :
                                                                            <Radiobox name={item.label} checked={selectedFilters[section]?.[item.value] == true} onChange={(e) => handleCheckFilter(item.value, e)} />
                                                                        }
                                                                    </>
                                                                    :
                                                                    <label className="checkbox" >
                                                                        <input type="checkbox"
                                                                            checked={selectedFilters[section] && Object(selectedFilters[section]).hasOwnProperty(item.value) && selectedFilters[section]?.[item.value]}
                                                                            onChange={(e) => handleCheckFilter(item.value, e, item)}
                                                                        />
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
                        </>
                    }
                    {(section == "experience" || section == "payout") &&
                        <div className={`customRangeBox${isCustomRangeActive() ? ' is-active' : ''}`}>
                            <h4>Enter custom range</h4>
                            <div className={`customRangeInner ${section == "payout" ? "payout" : ""}`}>
                                <div className="form-group">
                                    <label>From</label>
                                    <input value={rangeInput[section]?.[0] ?? ""} type="text" className="form-control" onChange={(e) => handleRangeInput("lower", e.target.value)} data-hj-allow />
                                </div>
                                <hr />
                                <div className="form-group">
                                    <label>To</label>
                                    <div className="input-suffix">
                                        <input value={rangeInput[section]?.[1] ?? ""} type="text" className="form-control" onChange={(e) => handleRangeInput("upper", e.target.value)} data-hj-allow />
                                        {section == "payout" && <span className="light">lacs/annum</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
        </>
    );

    if (layout === 'accordion') {
        return (
            <div className="hjf-accordion">
                {visibleTabs.map((tab) => {
                    const count = getSectionCount(tab.section);
                    const isOpen = layout === 'accordion'
                        ? accordionOpenSection === tab.section
                        : section === tab.section;
                    return (
                        <div
                            key={tab.section}
                            className={`hjf-accordion__item${isOpen ? ' is-open' : ''}${count > 0 ? ' has-selection' : ''}`}
                        >
                            <button
                                type="button"
                                className="hjf-accordion__trigger"
                                aria-expanded={isOpen}
                                onClick={() => {
                                    setSearch('');
                                    if (accordionOpenSection === tab.section) {
                                        setAccordionOpenSection(null);
                                        return;
                                    }
                                    setAccordionOpenSection(tab.section);
                                    setActiveTab(tab);
                                }}
                            >
                                <span className="hjf-accordion__trigger-label">{tab.title}</span>
                                {count > 0 ? (
                                    <span className="hjf-accordion__badge">{count}</span>
                                ) : null}
                                <span className={`hjf-accordion__chevron${isOpen ? ' is-open' : ''}`}>
                                    <ChevronDownIcon />
                                </span>
                            </button>
                            {isOpen ? (
                                <div className="hjf-accordion__body oppTabFiltersContent">
                                    {filterPanelContent}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="oppTabFilters">
            <div className="tabs">
                {visibleTabs.map((tab, index) => (
                    <div
                        key={index}
                        className={`tab ${section === tab.section ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.title}
                        {getSectionCount(tab.section) > 0 ? (
                            <span className="count">{getSectionCount(tab.section)}</span>
                        ) : null}
                    </div>
                ))}
            </div>
            <div className="oppTabFiltersContent">
                {filterPanelContent}
            </div>
        </div>
    );
}

const tabList = [
    {
        title: "Mode of work",
        section: "engagements",
        master: engagementFilterMaster
    },
    {
        title: "Posted Date",
        section: "job_posted_date",
        master: jobPostedDateFilterMaster
    },
    {
        title: "Experience",
        section: "experience",
        master: experienceFilterMaster
    },
    {
        title: "Location",
        section: "locations",
        allowSearch: true,
        masterKey: "locationMaster"
    },
    {
        title: "Salary Range",
        section: "payout",
        master: payoutFilterMaster
    },
    {
        title: "Role",
        section: "roles",
        masterKey: "roleMaster"
    },
    {
        title: "Skills",
        section: "skills",
        allowSearch: true,
        masterKey: "skillMaster"
    },
    {
        title: "MAANG+",
        section: "maang_plus",
        allowSearch: true,
        masterKey: "maangMaster"
    },
    {
        title: "Team Size",
        section: "team_size",
        master: teamSizeFilterMaster
    },
    {
        title: "Salary Available",
        section: "salary_available",
        master: [
            { label: "Salary Available", value: 1 }
        ]
    },

]
