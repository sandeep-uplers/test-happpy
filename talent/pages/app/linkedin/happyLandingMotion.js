'use client';

import { useInView } from "../../../components/common/useInView";

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
        case "manual-row":
            return "happy-landing-enter happy-landing-enter--manual-row";
        case "agent-row":
            return "happy-landing-enter happy-landing-enter--agent-row";
        default:
            return "happy-landing-enter";
    }
}
