'use client';

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
    HAPPY_CANDIDATE_PROOF_HEADLINE,
    HAPPY_CANDIDATE_PROOF_ITEMS,
    HAPPY_CANDIDATE_PROOF_UNDERLINE_SRC,
} from "./happyAgentPageAssets";

/** ~8s for one 290px card to pass, slow enough to read a quote. */
const CANDIDATE_PROOF_PX_PER_SECOND = 36;

function CandidateProofPersonIcon() {
    return (
        <svg
            className="happy-agent-candidate-proof__person-icon"
            width={22}
            height={22}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle cx="12" cy="8.2" r="3.15" fill="currentColor" />
            <path
                fill="currentColor"
                d="M6.2 18.6c.55-2.85 2.85-4.35 5.8-4.35s5.25 1.5 5.8 4.35c.08.4-.22.8-.64.8H6.84c-.42 0-.72-.4-.64-.8z"
            />
        </svg>
    );
}

function CandidateProofQuote({ quote }) {
    if (typeof quote === "string") {
        return quote;
    }
    return quote.map((part, index) => (
        part.bold ? <strong key={index}>{part.text}</strong> : <span key={index}>{part.text}</span>
    ));
}

export default function CandidateProofSection() {
    const trackRef = useRef(null);
    const [held, setHeld] = useState(false);
    const halfLen = HAPPY_CANDIDATE_PROOF_ITEMS.length;
    const loopItems = [...HAPPY_CANDIDATE_PROOF_ITEMS, ...HAPPY_CANDIDATE_PROOF_ITEMS];

    const measure = useCallback(() => {
        const track = trackRef.current;
        if (!track || halfLen <= 0) return;
        const first = track.children[0];
        const firstDuplicate = track.children[halfLen];
        if (!first || !firstDuplicate) return;
        const shift = firstDuplicate.getBoundingClientRect().left - first.getBoundingClientRect().left;
        if (shift <= 0) return;
        track.style.setProperty("--candidate-proof-shift", `${shift}px`);
        track.style.setProperty(
            "--candidate-proof-duration",
            `${shift / CANDIDATE_PROOF_PX_PER_SECOND}s`
        );
    }, [halfLen]);

    useLayoutEffect(() => {
        measure();
        const track = trackRef.current;
        const ro = typeof ResizeObserver !== "undefined" && track ? new ResizeObserver(measure) : null;
        if (ro && track) ro.observe(track);
        window.addEventListener("resize", measure);
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener("resize", measure);
        };
    }, [measure]);

    return (
        <section
            className="happy-agent-candidate-proof"
            aria-labelledby="happy-agent-candidate-proof-heading"
            data-happy-landing-section="candidate_proof"
        >
            <header className="happy-agent-candidate-proof__header">
                <h2 id="happy-agent-candidate-proof-heading" className="happy-agent-candidate-proof__title">
                    <span className="happy-agent-candidate-proof__count">
                        {HAPPY_CANDIDATE_PROOF_HEADLINE.count}
                        <img
                            className="happy-agent-candidate-proof__underline"
                            src={HAPPY_CANDIDATE_PROOF_UNDERLINE_SRC}
                            alt=""
                            width={317}
                            height={3}
                            aria-hidden="true"
                        />
                    </span>
                    <span className="happy-agent-candidate-proof__label">
                        {HAPPY_CANDIDATE_PROOF_HEADLINE.label}
                    </span>
                </h2>
            </header>

            <div
                className={`happy-agent-candidate-proof__scroller${held ? " is-held" : ""}`}
                onPointerDown={() => setHeld(true)}
                onPointerUp={() => setHeld(false)}
                onPointerCancel={() => setHeld(false)}
                onPointerLeave={() => setHeld(false)}
            >
                <ul className="happy-agent-candidate-proof__track" ref={trackRef}>
                    {loopItems.map((item, index) => {
                        const isDuplicate = index >= halfLen;
                        return (
                        <li
                            key={`${item.id}-${isDuplicate ? "dup" : "orig"}`}
                            className="happy-agent-candidate-proof__card"
                            aria-hidden={isDuplicate || undefined}
                        >
                            <div className="happy-agent-candidate-proof__quote">
                                <span className="happy-agent-candidate-proof__mark" aria-hidden="true">
                                    “
                                </span>
                                <div className="happy-agent-candidate-proof__body">
                                    {item.title ? (
                                        <p className="happy-agent-candidate-proof__headline">{item.title}</p>
                                    ) : null}
                                    <p className="happy-agent-candidate-proof__text">
                                        <CandidateProofQuote quote={item.quote} />
                                    </p>
                                </div>
                            </div>
                            <div className="happy-agent-candidate-proof__person">
                                <span className="happy-agent-candidate-proof__avatar">
                                    {item.avatar ? (
                                        <img
                                            className="happy-agent-candidate-proof__avatar-img"
                                            src={item.avatar}
                                            alt=""
                                            width={44}
                                            height={44}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <span className="happy-agent-candidate-proof__initials" aria-hidden={item.anonymous || undefined}>
                                            {item.anonymous ? <CandidateProofPersonIcon /> : item.initials}
                                        </span>
                                    )}
                                    {item.companyLogo ? (
                                        <img
                                            className="happy-agent-candidate-proof__company-logo"
                                            src={item.companyLogo}
                                            alt={item.anonymous ? "" : item.company}
                                            title={item.company}
                                            width={16}
                                            height={16}
                                            loading="lazy"
                                        />
                                    ) : null}
                                </span>
                                <span className="happy-agent-candidate-proof__identity">
                                    <span className="happy-agent-candidate-proof__name">{item.name}</span>
                                    <span className="happy-agent-candidate-proof__role">{item.role}</span>
                                </span>
                            </div>
                        </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
