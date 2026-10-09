'use client';

import { useEffect, useMemo, useState } from "react";
import {
    HAPPY_HERO_PROGRESS_STATUS,
    HAPPY_HERO_PROGRESS_STEPS,
} from "./happyAgentPageAssets";
import {
    HappyHeroProgressStatusSparkleIcon,
    HappyHeroProgressStepCheckIcon,
} from "./happyHeroInlineIcons";

const STEP_MS = 1500;
const STEP_PCT = 20;
const STEP_COUNT = HAPPY_HERO_PROGRESS_STEPS.length;

function prefersReducedMotion() {
    if (typeof window === "undefined") return false;
    try {
        return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
        return false;
    }
}

/** Figma still at 20%: only step 1 is checked; step 2+ stay muted until the next 20% tick. */
function getStepState(index, progress) {
    const completedCount = Math.min(STEP_COUNT, Math.floor(progress / STEP_PCT));
    if (index < completedCount) {
        return "done";
    }
    return "pending";
}

export default function HappyHeroInterviewProgress({ active = false }) {
    const [progress, setProgress] = useState(() => (prefersReducedMotion() ? 100 : 0));

    useEffect(() => {
        if (!active) return undefined;
        if (prefersReducedMotion()) {
            setProgress(100);
            return undefined;
        }

        setProgress(0);
        let id;
        id = window.setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    window.clearInterval(id);
                    return 100;
                }
                const next = prev + STEP_PCT;
                if (next >= 100) {
                    window.clearInterval(id);
                    return 100;
                }
                return next;
            });
        }, STEP_MS);

        return () => window.clearInterval(id);
    }, [active]);

    const progressLabel = useMemo(() => `${progress}%`, [progress]);

    return (
        <div className="happy-hero-interview-progress" aria-labelledby="happy-hero-interview-progress-heading">
            <div className="happy-hero-interview-progress__card" role="group" aria-label="Interview journey progress">
                <p id="happy-hero-interview-progress-heading" className="happy-hero-interview-progress__title">
                    How HAPPPY helps you <strong>land interviews</strong>
                </p>

                <div className="happy-hero-interview-progress__bar-row">
                    <span className="happy-hero-interview-progress__rocket" aria-hidden="true">
                        🚀
                    </span>
                    <div
                        className="happy-hero-interview-progress__track"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                        aria-label="Journey completion"
                    >
                        <div
                            className="happy-hero-interview-progress__fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="happy-hero-interview-progress__pct">{progressLabel}</span>
                </div>

                <ol className="happy-hero-interview-progress__steps">
                    {HAPPY_HERO_PROGRESS_STEPS.map((label, index) => {
                        const state = getStepState(index, progress);
                        return (
                            <li
                                key={label}
                                className={`happy-hero-interview-progress__step happy-hero-interview-progress__step--${state}`}
                            >
                                <span className="happy-hero-interview-progress__indicator" aria-hidden="true">
                                    {state === "done" ? (
                                        <HappyHeroProgressStepCheckIcon />
                                    ) : (
                                        <span className="happy-hero-interview-progress__indicator-num">{index + 1}</span>
                                    )}
                                </span>
                                <span className="happy-hero-interview-progress__step-label">{label}</span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div className="happy-hero-interview-progress__status" aria-live="polite">
                <HappyHeroProgressStatusSparkleIcon className="happy-hero-interview-progress__status-sparkle" />
                <span className="happy-hero-interview-progress__status-copy">{HAPPY_HERO_PROGRESS_STATUS}</span>
            </div>
        </div>
    );
}
