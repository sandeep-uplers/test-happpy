import { addSeconds, differenceInSeconds } from "date-fns";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDropDownIcon } from "../../../../assets/IconSVG";
import { CheckboxInput } from "../../../../components/common/Inputs";
import { storeJobNotInterested } from "../../../../store/actions/UserActions";
import { HR_UPDATE_NEEDED } from "../../../../store/actions/actionsTypes";
import { jobNotInterestedTrack } from "../../../../helpers/Mixpanel";
import { useLocation } from "@/talent/navigation/routerCompat";

const reasonMaster = [
    {
        label: "Low salary",
        value: 1
    },
    {
        label: "Mismatch in years of experience",
        value: 2
    },
    {
        label: "Location doesn’t work",
        value: 3
    },
    {
        label: "Doesn’t match with my skillsets",
        value: 4
    },
    {
        label: "Role doesn’t fit my career goals",
        value: 5
    }
]
export default function NotInterested({
    hrData, afterSubmit, markedNotInterested, onUndoNotInterested, isOppCard = false, filters, currentIndex, fromSingleOppMobile, thumbDownIcon = false
}) {

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const location = useLocation();
    const { allOppMasterValue } = useSelector(state => state.work);

    const toggleOpen = () => {
        setOpen(!open)
    }

    useEffect(() => {
        setOpen(false);
        setSelected([]);
    }, [hrData.HR_Number])

    const onCheck = (value) => {
        let newSelected = [...selected];
        if (newSelected.includes(value)) {
            newSelected = newSelected.filter((item) => item !== value)
        } else {
            newSelected.push(value)
        }
        setSelected(newSelected)
    }

    const getTrackingObj = (cta_name) => {
        let trackObj = {
            cta_name: cta_name,
        }
        if (cta_name == "mark_not_interested") {
            trackObj.reasons = selected.map(item =>
                reasonMaster.filter(masterItem => masterItem.value == item).map(masterItem => masterItem.label)
            ).flat().join(', ')
        } else {
            trackObj.reasons = null;
        }

        if (isOppCard) {
            trackObj.sort_by = filters.sort_field == "created_at" ? "newest" : "relevance";
            trackObj.position = currentIndex + 1;
            if (
                location.pathname == "/talent/all-opportunities"
                || location.pathname == "/talent/job-agent/all-jobs"
                || (
                    location.pathname == "/talent/job-agent/recommended-jobs"
                    && new URLSearchParams(location.search).get('tab') === 'all-jobs'
                )
            ) {
                trackObj.from_where = "all-opportunities";
            }
            if (location.pathname == "/talent/inhouse-positions") {
                trackObj.from_where = "inhouse-positions";
            }
        } else {
            trackObj.from_where = "singleHr";
            if (cta_name == "reset_not_interested")
                trackObj.badge_or_msg = "badge";
        }

        return trackObj;
    }
    const onSubmit = () => {
        if (selected.length == 0) return

        jobNotInterestedTrack(getTrackingObj("mark_not_interested"), hrData, filters, allOppMasterValue)

        let payload = {
            hr_number: hrData.HR_Number,
            reason_ids: selected
        }

        storeJobNotInterested(payload)(dispatch)
            .then((res) => {
                setOpen(false);
                afterSubmit()
            })
            .catch((err) => {
                console.log('err', err);
                toast.error('Something went wrong!')
            })
    }

    const undoHandler = () => {

        jobNotInterestedTrack(getTrackingObj("reset_not_interested"), hrData, filters, allOppMasterValue);
        if (isOppCard) onUndoNotInterested()
        //api call
        let payload = {
            hr_number: hrData.HR_Number,
            reset_not_interested: true
        }
        storeJobNotInterested(payload)(dispatch)
            .then((res) => {
                if (isOppCard) {
                    dispatch({ type: HR_UPDATE_NEEDED, payload: { HR_Number: hrData.HR_Number, job_not_interested: false } })
                } else {
                    onUndoNotInterested()
                }
            })
            .catch((err) => {
                console.log('err', err);
                toast.error('Something went wrong!')
            })
    }

    const [timeLeft, setTimeLeft] = useState(5);  // Time left in seconds
    const startTimer = () => {
        const targetTime = addSeconds(new Date(), 6);  // Set target time 5 seconds from now
        const intervalId = setInterval(() => {
            const remainingTime = Math.max(0, differenceInSeconds(targetTime, new Date()));
            setTimeLeft(remainingTime);
            if (remainingTime === 0) clearInterval(intervalId);  // Clear interval when time is up
        }, 1000);
    };

    useEffect(() => {
        if (markedNotInterested && isOppCard) startTimer()
    }, [markedNotInterested])

    const isMobile = window.innerWidth < 768;

    return (
        <div className="notInterested">
            {(markedNotInterested || hrData.job_not_interested) ?
                <>
                    {!isMobile &&
                        <div className="undo">
                            {(isOppCard && !hrData.job_not_interested && timeLeft != 0 && !(filters && filters.is_saved_filter)) &&
                                <span className="timer">{timeLeft} seconds to undo</span>
                            }
                            Marked as not interested
                            <button className="ghostBtn blue" onClick={undoHandler}>Undo</button>
                        </div>
                    }
                </>
                :
                <>
                    <button className={`ghostBtn ${thumbDownIcon ? 'outlined' : ''} ${fromSingleOppMobile ? 'outline' : ''} ${open ? 'blue' : ''}`} onClick={toggleOpen}>
                        {thumbDownIcon ?
                            <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.3334 1.33423H13.1134C13.4907 1.32755 13.8573 1.45965 14.1436 1.70544C14.43 1.95123 14.6161 2.2936 14.6667 2.66756V7.33422C14.6161 7.70819 14.43 8.05056 14.1436 8.29635C13.8573 8.54213 13.4907 8.67423 13.1134 8.66756H11.3334M6.66669 10.0009V12.6676C6.66669 13.198 6.8774 13.7067 7.25247 14.0818C7.62755 14.4568 8.13625 14.6676 8.66669 14.6676L11.3334 8.66756V1.33423H3.81335C3.4918 1.33059 3.17977 1.44329 2.93475 1.65155C2.68973 1.85982 2.52824 2.14962 2.48002 2.46756L1.56002 8.46756C1.53102 8.65865 1.5439 8.85377 1.59779 9.03939C1.65168 9.22501 1.74529 9.3967 1.87211 9.54255C1.99894 9.6884 2.15597 9.80494 2.33231 9.88408C2.50864 9.96322 2.70008 10.0031 2.89335 10.0009H6.66669Z" stroke="#B60707" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            :
                            <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_23304_2225)">
                                    <path d="M11.7948 7.33125C12.0948 7.93125 12.2498 8.57625 12.2498 9.25125C12.2498 11.5963 10.3448 13.5013 7.99979 13.5013C7.04979 13.5013 6.16979 13.1912 5.46479 12.6562L11.0048 7.11625C11.0748 7.11125 11.1448 7.09625 11.2148 7.07625C11.4448 7.01125 11.6848 7.12125 11.7948 7.33125ZM12.5548 5.56625C13.5848 6.59625 14.3048 7.86625 14.5048 9.08125C14.5448 9.32625 14.7598 9.50125 14.9998 9.50125C15.0248 9.50125 15.0548 9.49625 15.0798 9.49125C15.3548 9.44625 15.5398 9.19125 15.4948 8.91625C15.2448 7.40625 14.4148 5.97625 13.2748 4.84625L12.5548 5.56625ZM15.3548 0.64625C15.1598 0.45125 14.8398 0.45125 14.6448 0.64625L11.6848 3.60625C11.3848 3.42125 11.0748 3.26125 10.7598 3.12125C9.87479 2.72625 8.93479 2.50125 7.99979 2.50125C4.57979 2.50125 1.07479 5.50125 0.504787 8.91625C0.459787 9.19125 0.644787 9.44625 0.919787 9.49125C1.18979 9.54125 1.44979 9.35625 1.49479 9.08125C1.93479 6.44625 4.80979 3.50125 7.99979 3.50125C8.68979 3.50125 9.36479 3.63625 9.99979 3.88125C10.3298 4.00625 10.6498 4.15625 10.9598 4.33125L8.97479 6.31625C8.76479 6.05625 8.61479 5.75125 8.54479 5.40625C8.53979 5.39125 8.53479 5.37125 8.52479 5.35625C8.47979 5.20125 8.36479 5.08125 8.20979 5.03125C8.11979 5.00125 8.03479 5.00125 7.99979 5.00125C5.65479 5.00125 3.74979 6.90625 3.74979 9.25125C3.74979 9.52625 3.77479 9.79625 3.82479 10.0563C3.89979 10.4263 4.01479 10.7812 4.17979 11.1112L0.644787 14.6463C0.449787 14.8413 0.449787 15.1613 0.644787 15.3562C0.744787 15.4513 0.869787 15.5013 0.999787 15.5013C1.12979 15.5013 1.25479 15.4513 1.35479 15.3562L4.73479 11.9763L9.76479 6.94625H9.76979L11.8098 4.90125L12.5248 4.18625L15.3548 1.35625C15.5498 1.16125 15.5498 0.84125 15.3548 0.64625Z" fill="#231F20" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_23304_2225">
                                        <rect width="16" height="16" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                        }
                    </button>
                    {open &&
                        <div className="reasonsPopover">
                            <div className="colorfullbg">
                                <div className="reasons">
                                    <div className="head">
                                        <button className="iconBtn" onClick={toggleOpen}>
                                            <ArrowDropDownIcon />
                                        </button>
                                        <h6>Don’t find this job relevant?</h6>
                                        <span>Tell us why you're not interested so we can show you relevant jobs</span>
                                    </div>
                                    <ul className="reasonList">
                                        {reasonMaster.map((item, index) =>
                                            <li key={'reasonItem' + index}>
                                                <CheckboxInput name={item.label} onChange={() => onCheck(item.value)} checked={selected.includes(item.value)} />
                                            </li>
                                        )}
                                    </ul>
                                    <div className="bottom">
                                        <button className="primaryBtn" disabled={selected.length === 0} onClick={onSubmit}>MARK NOT INTERESTED</button>
                                        <span>We’ll stop showing you this job</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </>
            }
        </div >
    )
}