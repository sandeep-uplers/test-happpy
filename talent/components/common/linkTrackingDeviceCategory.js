/**
 * Coarse mobile vs desktop for link-tracking payloads.
 * Uses Client Hints (Chromium), touch-capable iPadOS, touch-first media queries, then userAgent.
 * @returns {'mobile'|'desktop'}
 */
export function getLinkTrackingDeviceCategory() {
    if (typeof navigator === "undefined") {
        return "desktop";
    }

    if (navigator.userAgentData && navigator.userAgentData.mobile === true) {
        return "mobile";
    }

    if (navigator.platform === "iPad") {
        return "mobile";
    }

    const isIPadOSDesktopUA =
        navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    if (isIPadOSDesktopUA) {
        return "mobile";
    }

    if (typeof window !== "undefined" && window.matchMedia) {
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
        const noHover = window.matchMedia("(hover: none)").matches;
        if (coarsePointer && noHover) {
            return "mobile";
        }
    }

    const ua = navigator.userAgent || "";
    if (/iPad/i.test(ua)) {
        return "mobile";
    }
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return "mobile";
    }

    return "desktop";
}
