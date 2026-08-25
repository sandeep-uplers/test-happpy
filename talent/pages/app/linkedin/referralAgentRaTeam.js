'use client';

import React from "react";

/** Outreach flow illustration — shared by Happpy Agent landing & Job Agent “How to use”. */

export function getReferralRaTeamInitials(fullName) {
    const parts = String(fullName || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Indian names — example contacts reached after Gmail / LinkedIn sends. */
export const REFERRAL_AGENT_RA_TEAM = [
    { name: "Arjun Mehta", role: "Staff Software Engineer", tone: 0 },
    { name: "Priya Sharma", role: "Engineering Lead", tone: 1 },
    // { name: "Rohan Kapoor", role: "Senior Software Engineer", tone: 2 },
    // { name: "Ananya Iyer", role: "Software Engineer", tone: 3 },
];

/**
 * After sends: your profile + fit, then sample HM / TA reply offering an interview this week.
 * MatIcon = HappyMatIcon or Job Agent MatIcon.
 */
export function ReferralAgentYourPitchCard({
    MatIcon: Icon,
    displayFirstName = "",
    profileNameForInitials = "",
    jobTitle = "Software Engineer",
    headingId = "referral-ra-you-h",
}) {
    const nameSeed = (profileNameForInitials || displayFirstName || "Candidate").trim();
    const initials = getReferralRaTeamInitials(nameSeed);
    const profileHeadline = displayFirstName
        ? `${displayFirstName}, your profile`
        : "Your profile";
    const hmTaReplyBody = displayFirstName
        ? `Hi ${displayFirstName}, thanks for reaching out — your background looks like a strong fit for our ${jobTitle} opening. We'd like to schedule an interview this week. Would Tuesday or Wednesday afternoon work for you?`
        : `Hi — thanks for your note. Your profile is a strong match for this role. We'd like to schedule an interview this week. Please share a couple of times that work on your side.`;

    return (
        <div className="jad-howto__ra-you" aria-labelledby={headingId}>
            <p className="jad-howto__ra-you-step">
                <Icon name="outgoing_mail" className="jad-howto__ra-you-step-ic" aria-hidden />
                After Gmail and LinkedIn are sent
            </p>
            <div className="jad-howto__ra-you-top">
                <div className="jad-howto__ra-you-avatar" aria-hidden="true">
                    {initials}
                </div>
                <div className="jad-howto__ra-you-id">
                    <p id={headingId} className="jad-howto__ra-you-h">
                        {profileHeadline}
                    </p>
                    <p className="jad-howto__ra-you-job">{jobTitle}</p>
                </div>
                <div className="jad-howto__ra-you-fit">
                    <Icon name="trending_up" className="jad-howto__ra-you-fit-ic" aria-hidden />
                    <span className="jad-howto__ra-you-fit-t">Strong job fit</span>
                </div>
            </div>
            <div className="jad-howto__ra-you-reply jad-howto__ra-you-reply--inbound">
                <div className="jad-howto__ra-you-reply-cap">
                    <Icon name="chat_bubble" className="jad-howto__ra-you-reply-cap-ic" aria-hidden />
                    <span>Reply from Hiring Manager</span>
                </div>
                <p className="jad-howto__ra-you-reply-note">
                    Like your profile — they may offer to schedule an interview this week:
                </p>
                <p className="jad-howto__ra-you-reply-body">{hmTaReplyBody}</p>
            </div>
        </div>
    );
}

/** MatIcon = HappyMatIcon or Job Agent MatIcon — Gmail + LinkedIn status inside each person card */
export function ReferralAgentRaPersonCard({ member: m, MatIcon: Icon }) {
    return (
        <li className="jad-howto__ra-card">
            <div className="jad-howto__ra-card-row">
                <div
                    className={`jad-howto__ra-avatar jad-howto__ra-avatar--initial jad-howto__ra-avatar--tone-${m.tone}`}
                    aria-hidden
                >
                    {getReferralRaTeamInitials(m.name)}
                </div>
                <div className="jad-howto__ra-card-main">
                    <p className="jad-howto__ra-name">{m.name}</p>
                    <p className="jad-howto__ra-meta">{m.role}</p>
                </div>
            </div>
            <div className="jad-howto__ra-channel-row" aria-label={`Gmail and LinkedIn outreach for ${m.name}`}>
                <div className="jad-howto__ra-chip jad-howto__ra-chip--mail">
                    <Icon name="mail" className="jad-howto__ra-chip-ic jad-howto__ra-chip-ic--mail" />
                    <span className="jad-howto__ra-chip-copy">
                        <span className="jad-howto__ra-chip-channel">Gmail</span>
                        <span className="jad-howto__ra-chip-sep" aria-hidden>
                            {" · "}
                        </span>
                        <span className="jad-howto__ra-chip-status">Sent</span>
                    </span>
                    <span className="jad-howto__ra-chip-ok" aria-hidden="true">
                        <Icon name="check" className="jad-howto__ra-chip-check" />
                    </span>
                </div>
                <div className="jad-howto__ra-chip jad-howto__ra-chip--li">
                    <Icon name="chat_bubble" className="jad-howto__ra-chip-ic jad-howto__ra-chip-ic--li" />
                    <span className="jad-howto__ra-chip-copy">
                        <span className="jad-howto__ra-chip-channel">LinkedIn</span>
                        <span className="jad-howto__ra-chip-sep" aria-hidden>
                            {" · "}
                        </span>
                        <span className="jad-howto__ra-chip-status">Delivered</span>
                    </span>
                    <span className="jad-howto__ra-chip-ok" aria-hidden="true">
                        <Icon name="check" className="jad-howto__ra-chip-check" />
                    </span>
                </div>
            </div>
        </li>
    );
}
