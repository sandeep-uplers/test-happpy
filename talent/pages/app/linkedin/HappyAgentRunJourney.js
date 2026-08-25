'use client';

import React, { useEffect, useMemo, useState } from "react";

const ROTATE_MS = 5200;

/** Animated 3-step Agent run journey — `step` / `onStepChange` sync highlight on the right column. */
export default function HappyAgentRunJourney({ MatIcon: Icon, displayFirstName = "", step, onStepChange }) {
    const [motionOk, setMotionOk] = useState(true);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setMotionOk(!mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!motionOk || typeof onStepChange !== "function") return undefined;
        const id = window.setInterval(() => onStepChange((s) => (s + 1) % 3), ROTATE_MS);
        return () => window.clearInterval(id);
    }, [motionOk, onStepChange]);

    const steps = useMemo(
        () => [
            {
                num: 1,
                title: "Agent run",
                icon: "ads_click",
                text: displayFirstName
                    ? `One click on a job — the agent finds who to message for ${displayFirstName}.`
                    : "One click on a job — the agent finds who to message.",
            },
            {
                num: 2,
                title: "Finding contacts & outreach",
                icon: "sync",
                text: "The agent finds contacts and runs outreach in the background using Gmail and LinkedIn — automated.",
            },
            {
                num: 3,
                title: "Reply from Hiring Manager",
                icon: "chat_bubble",
                text: "Hiring manager replies — sees your fit and often suggests an interview or next steps.",
            },
        ],
        [displayFirstName]
    );

    const active = typeof step === "number" ? step : 0;
    const pickStep = typeof onStepChange === "function" ? onStepChange : () => {};

    return (
        <div className="happy-agent-run" aria-label="Agent run journey">
            <p className="happy-agent-run__eyebrow">Agent run</p>
            <ol className="happy-agent-run__track">
                {steps.map((s, i) => {
                    const isActive = i === active;
                    const isPast = motionOk && i < active;
                    return (
                        <li
                            key={s.num}
                            className={`happy-agent-run__step happy-agent-run__step--clickable${
                                isActive ? " happy-agent-run__step--active" : ""
                            }${isPast ? " happy-agent-run__step--past" : ""}${
                                !motionOk ? " happy-agent-run__step--no-motion" : ""
                            }`}
                        >
                            <button
                                type="button"
                                className="happy-agent-run__step-hit"
                                aria-pressed={i === active}
                                aria-label={`${s.title}, step ${s.num}`}
                                onClick={() => pickStep(i)}
                            >
                                <span className="happy-agent-run__step-top">
                                    <span className="happy-agent-run__badge" aria-hidden>
                                        #{s.num}
                                    </span>
                                    <span className="happy-agent-run__ic-wrap">
                                        <Icon name={s.icon} className="happy-agent-run__ic" aria-hidden />
                                    </span>
                                </span>
                                <span className="happy-agent-run__title">{s.title}</span>
                                <span className="happy-agent-run__text">{s.text}</span>
                            </button>
                        </li>
                    );
                })}
            </ol>
            <div className="happy-agent-run__dots" role="group" aria-label="Step indicator">
                {steps.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`happy-agent-run__dot${i === active ? " happy-agent-run__dot--on" : ""}`}
                        aria-current={i === active ? "step" : undefined}
                        aria-label={`Step ${i + 1}`}
                        onClick={() => pickStep(i)}
                    />
                ))}
            </div>
        </div>
    );
}
