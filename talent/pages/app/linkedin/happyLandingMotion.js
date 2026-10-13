'use client';

import { useEffect, useState } from "react";
import { useInView } from "../../../components/common/useInView";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function getHappyReducedMotionPreference() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Reactive reduced-motion preference shared by landing media and JS-driven motion. */
export function useHappyReducedMotion() {
    const [reducedMotion, setReducedMotion] = useState(getHappyReducedMotionPreference);

    useEffect(() => {
        if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
        const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
        const syncPreference = () => setReducedMotion(mediaQuery.matches);
        syncPreference();
        mediaQuery.addEventListener("change", syncPreference);
        return () => mediaQuery.removeEventListener("change", syncPreference);
    }, []);

    return reducedMotion;
}

export function happyScrollBehavior() {
    return getHappyReducedMotionPreference() ? "auto" : "smooth";
}

/** Scroll-triggered reveal for landing sections — pairs with `.happy-landing-section--revealed` in CSS. */
export function useHappySectionReveal(options = {}) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.08,
        rootMargin: "0px 0px -10% 0px",
        ...options,
    });

    return { ref, revealed: inView };
}

/** Stagger index for CSS `transition-delay: calc(var(--happy-stagger-i) * …)`. */
export function happyStaggerStyle(index, base = 0) {
    return { "--happy-stagger-i": index + base };
}

/** Entry animation class — pair with `happyStaggerStyle` for staggered reveals. */
export function happyEnterClass(variant) {
    switch (variant) {
        case "unfold":
            return "happy-landing-enter happy-landing-enter--unfold";
        case "left":
            return "happy-landing-enter happy-landing-enter--left";
        case "right":
            return "happy-landing-enter happy-landing-enter--right";
        case "scale":
            return "happy-landing-enter happy-landing-enter--scale";
        case "soft":
            return "happy-landing-enter happy-landing-enter--soft";
        case "manual-row":
            return "happy-landing-enter happy-landing-enter--manual-row";
        case "agent-row":
            return "happy-landing-enter happy-landing-enter--agent-row";
        default:
            return "happy-landing-enter";
    }
}
