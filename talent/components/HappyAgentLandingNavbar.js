'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import HapppyAgentLogo from "./common/HapppyAgentLogo";
import SidebarNew from "./SidebarNew";
import {
    clearPublicOnbSection,
    setPublicOnbSection,
} from "../helpers/happyAgentPublicSignupSession";

/**
 * Floating pill navbar for Happpy Agent marketing landings
 * (`/talent/happpy-ai-agent` public + `/talent/referral-ai-agent` authenticated).
 */
export default function HappyAgentLandingNavbar({
    variant = "public",
    onLoginClick = null,
    onGetStartedClick = null,
    onOpenDashboardClick = null,
    showGetStarted = true,
}) {
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleBrandClick = (event) => {
        event.preventDefault();
        if (variant === "authenticated") {
            router.push("/talent/job-agent");
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
        router.push("/talent/job-agent");
    };

    return (
        <>
            <header className="happy-agent-landing-navbar" role="banner">
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
