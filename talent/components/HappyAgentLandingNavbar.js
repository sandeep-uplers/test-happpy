'use client';

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/talent/navigation/routerCompat";
import { useSelector } from "react-redux";
import HapppyAgentLogo from "./common/HapppyAgentLogo";
import SidebarNew from "./SidebarNew";
import {
    clearPublicOnbSection,
    setPublicOnbSection,
} from "../helpers/happyAgentPublicSignupSession";

const AUTH_NAV_HIDE_DELTA = 8;
const AUTH_NAV_SHOW_DELTA = 2;
const AUTH_NAV_TOP_LOCK = 16;

/**
 * Floating pill navbar for Happpy Agent marketing landings
 * (`/talent/happpy-ai-agent` public + `/talent/referral-ai-agent` authenticated).
 * Public variant is in-page (`position: absolute`) so it scrolls away.
 * Authenticated stays fixed and auto-hides on scroll down / shows on a slight scroll up.
 */
export default function HappyAgentLandingNavbar({
    variant = "public",
    onLoginClick = null,
    onGetStartedClick = null,
    onOpenDashboardClick = null,
    showGetStarted = true,
}) {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNavHidden, setIsNavHidden] = useState(false);
    const lastScrollYRef = useRef(0);
    const hiddenRef = useRef(false);
    const tickingRef = useRef(false);

    useEffect(() => {
        if (variant !== "authenticated") {
            hiddenRef.current = false;
            setIsNavHidden(false);
            return undefined;
        }

        const setHidden = (next) => {
            if (hiddenRef.current === next) return;
            hiddenRef.current = next;
            setIsNavHidden(next);
        };

        if (isSidebarOpen) {
            setHidden(false);
            return undefined;
        }

        lastScrollYRef.current = Math.max(0, window.scrollY);

        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            window.requestAnimationFrame(() => {
                const y = Math.max(0, window.scrollY);
                const delta = y - lastScrollYRef.current;
                lastScrollYRef.current = y;

                if (y <= AUTH_NAV_TOP_LOCK) {
                    setHidden(false);
                } else if (delta > AUTH_NAV_HIDE_DELTA) {
                    setHidden(true);
                } else if (delta < -AUTH_NAV_SHOW_DELTA) {
                    setHidden(false);
                }

                tickingRef.current = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [variant, isSidebarOpen]);

    const handleBrandClick = (event) => {
        event.preventDefault();
        if (variant === "authenticated") {
            navigate("/talent/job-agent");
            return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleLogin = () => {
        if (typeof onLoginClick === "function") {
            onLoginClick();
            return;
        }
        clearPublicOnbSection();
    };

    const handleGetStarted = () => {
        if (typeof onGetStartedClick === "function") {
            onGetStartedClick();
        }
    };

    const handleOpenDashboard = () => {
        if (typeof onOpenDashboardClick === "function") {
            onOpenDashboardClick();
            return;
        }
        navigate("/talent/job-agent");
    };

    return (
        <>
            <header
                className={[
                    "happy-agent-landing-navbar",
                    variant === "public" ? "happy-agent-landing-navbar--scroll-away" : "happy-agent-landing-navbar--auto-hide",
                    isNavHidden ? "happy-agent-landing-navbar--hidden" : "",
                ].filter(Boolean).join(" ")}
                role="banner"
                aria-hidden={isNavHidden || undefined}
                inert={isNavHidden ? "" : undefined}
            >
                <div className="happy-agent-landing-navbar__pill">
                    <a
                        href="#happyJobAgentPublic"
                        className="happy-agent-landing-navbar__brand"
                        onClick={handleBrandClick}
                        aria-label="Happpy Agent — top of page"
                    >
                        <HapppyAgentLogo className="happy-agent-landing-navbar__logo" />
                    </a>

                    <div className="happy-agent-landing-navbar__actions">
                        {variant === "public" ? (
                            <>
                                <button
                                    type="button"
                                    className="happy-agent-landing-navbar__btn happy-agent-landing-navbar__btn--login"
                                    onClick={handleLogin}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className="happy-agent-landing-navbar__btn happy-agent-landing-navbar__btn--primary"
                                    onClick={handleGetStarted}
                                >
                                    Get Started
                                </button>
                            </>
                        ) : (
                            <>
                                {showGetStarted ? (
                                    <button
                                        type="button"
                                        className="happy-agent-landing-navbar__btn happy-agent-landing-navbar__btn--primary"
                                        onClick={handleGetStarted}
                                    >
                                        Get Started
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="happy-agent-landing-navbar__btn happy-agent-landing-navbar__btn--primary"
                                        onClick={handleOpenDashboard}
                                    >
                                        Open Job Agent dashboard
                                    </button>
                                )}
                                {user?.profile_pic ? (
                                    <button
                                        type="button"
                                        className="happy-agent-landing-navbar__profile"
                                        onClick={() => setIsSidebarOpen(true)}
                                        aria-label="Open account menu"
                                    >
                                        <img src={user.profile_pic} alt="" />
                                    </button>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </header>

            {variant === "authenticated" ? (
                <SidebarNew
                    isSidebarOpen={isSidebarOpen}
                    handleSidebar={() => setIsSidebarOpen((open) => !open)}
                />
            ) : null}
        </>
    );
}

/** Public landing wrapper — preserves onboarding section attribution for Get Started. */
export function HappyJobAgentPublicNavbar({ onOpenAuthDrawer }) {
    return (
        <HappyAgentLandingNavbar
            variant="public"
            onLoginClick={() => {
                clearPublicOnbSection();
                onOpenAuthDrawer();
            }}
            onGetStartedClick={() => {
                setPublicOnbSection("navbar");
                onOpenAuthDrawer();
            }}
        />
    );
}
