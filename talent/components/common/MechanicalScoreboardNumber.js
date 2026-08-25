'use client';

import { useEffect, useRef, useState } from "react";

/**
 * Animated integer counter — counts up one number at a time from `from` to `to`
 * when `active` becomes true. Keeps the legacy class names used on Happy Job Agent.
 */
export default function MechanicalScoreboardNumber({
    from,
    to,
    suffix = "",
    active = false,
    duration = 3200,
    className = "",
}) {
    const [displayValue, setDisplayValue] = useState(from);
    const [isAnimating, setIsAnimating] = useState(false);
    const hasRunRef = useRef(false);
    const motionOkRef = useRef(true);

    useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => {
            motionOkRef.current = !mq.matches;
        };
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (!active || hasRunRef.current) return undefined;

        hasRunRef.current = true;
        const startValue = Math.round(from);
        const endValue = Math.round(to);
        const totalSteps = endValue - startValue;

        if (!motionOkRef.current || totalSteps <= 0) {
            setDisplayValue(endValue);
            setIsAnimating(false);
            return undefined;
        }

        setIsAnimating(true);
        setDisplayValue(startValue);

        const startTime = performance.now();
        let frameId = 0;

        const tick = (now) => {
            const elapsed = now - startTime;

            if (elapsed >= duration) {
                setDisplayValue(endValue);
                setIsAnimating(false);
                return;
            }

            const progress = elapsed / duration;
            const nextStep = Math.min(totalSteps, Math.floor(progress * (totalSteps + 1)));
            setDisplayValue(startValue + nextStep);
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [active, duration, from, to]);

    return (
        <span
            className={["mechanical-scoreboard", className].filter(Boolean).join(" ")}
            aria-live="polite"
            aria-atomic="true"
        >
            <span
                className={[
                    "mechanical-scoreboard__value",
                    isAnimating ? "mechanical-scoreboard__value--animating" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                {displayValue}
            </span>
            {suffix ? <span className="mechanical-scoreboard__suffix">{suffix}</span> : null}
            <span className="sr-only">{`${displayValue}${suffix}`}</span>
        </span>
    );
}

export function randomScoreboardStart(min = 50, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
