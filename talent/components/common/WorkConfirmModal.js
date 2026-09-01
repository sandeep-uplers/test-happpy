import React from "react"
import { useState } from "react";
import { IMAGE_URL } from "../Constant";
import ConfirmationModal from "./ConfirmationModal";
import { pageVisitLoadAndCtaTrack } from "../../helpers/Mixpanel";

export default function WorkConfirmModal({ type, head, btnText, btnDisabled, onConfirm, onSecondaryClick, oppPreferenceMismatch, ...props }) {
    const [isOpen, setOpen] = useState(false)
    return (
        <>
            {type == "goBackModal" &&
                <>
                    <ConfirmationModal isOpen={isOpen} onCancel={() => setOpen(false)}
                        wrapClassName={"dislikeModalWrap"}
                        title={"Are you sure you want to go back?"}
                        subtitle="Your application won't go through for this position unless you accept and agree to these requisites"
                        primaryBtnText={"CONTINUE APPLICATION"}
                        secondaryBtnText={"I'LL APPLY LATER"}
                        onPrimaryClick={() => setOpen(false)}
                        onSecondaryClick={() => {
                            pageVisitLoadAndCtaTrack("I'll Apply Later-(My opportunity)")
                            setOpen(false)
                            onSecondaryClick()
                        }}
                    />
                    <button type="button" className="btn goBackBtn" onClick={() => setOpen(true)}>Go Back</button>
                </>
            }
            {type == "oppDislikeModal" &&
                <>
                    <ConfirmationModal isOpen={isOpen} onCancel={() => setOpen(false)}
                        wrapClassName={"dislikeModalWrap"}
                        head={head}
                        title={"Are you sure you are not interested?"}
                        subtitle="Once removed from here you can find in under 'All Work Opportunities"
                        primaryBtnText={"Yes continue"}
                        secondaryBtnText={"Go Back"}
                        onPrimaryClick={() => {
                            setOpen(false)
                            onConfirm();
                        }}
                        onSecondaryClick={() => setOpen(false)}
                    />
                    <button type="button" className="btn itemShareBtn" onClick={() => setOpen(true)}>
                        <img src={IMAGE_URL + "work/thumbs-down-icon.svg"}
                            alt="thumbs-down-icon" />
                        <span className="hoverText">
                            Not interested in<br /> this position
                        </span>
                    </button>
                </>
            }
            {type == "oppPreferenceMismatchModal" &&
                <>
                    <ConfirmationModal isOpen={isOpen} onCancel={() => setOpen(false)}
                        wrapClassName={"dislikeModalWrap"}
                        head={head}
                        title={"Are you sure you want to apply for this opportunity?"}
                        description={oppPreferenceMismatch.length > 0 ? `Your chosen ${oppPreferenceMismatch.includes('shift') ? "time preferences " : ""}
                        ${oppPreferenceMismatch.length == 2 ? "and " : ""}${oppPreferenceMismatch.includes('joining_period') ? "notice period" : ""} do not match
                        with the requirements for this opportunity.`: " "}
                        primaryBtnText={"Yes Apply"}
                        secondaryBtnText={"Go Back"}
                        onPrimaryClick={() => {
                            setOpen(false)
                            onConfirm();
                        }}
                        onSecondaryClick={() => setOpen(false)}
                    />
                    <button
                        type="button"
                        disabled={btnDisabled}
                        className={`interestedBtn ${btnDisabled ? 'actionBtn' : ''} ${props.btnClassName ?? ''}`}
                        onClick={() => {
                            if (props.isOppDisabled || btnDisabled) return;
                            setOpen(true);
                        }}
                    >
                        {btnDisabled ? 'Applied' : 'Apply'}
                        {btnDisabled && <span className="actionBtnHover">
                            You have already applied for this Opportunity.
                        </span>}
                    </button>
                </>
            }
            {type == "scheduleInterview" &&
                <>
                    <ConfirmationModal isOpen={isOpen} onCancel={() => setOpen(false)}
                        wrapClassName={"dislikeModalWrap"}
                        head={head}
                        title={"Are you sure you want to select this time slot?"}
                        subtitle="Once selected, it cannot be undone."
                        primaryBtnText={"Yes continue"}
                        secondaryBtnText={"Go Back"}
                        onPrimaryClick={() => {
                            setOpen(false)
                            onConfirm();
                        }}
                        onSecondaryClick={() => setOpen(false)}
                    />
                    <button type="button" className="btn"
                        disabled={btnDisabled}
                        onClick={() => setOpen(true)}
                    >
                        {btnText}
                    </button>
                </>
            }
        </>
    )
}