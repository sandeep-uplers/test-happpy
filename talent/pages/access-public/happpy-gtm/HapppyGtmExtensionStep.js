'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { API_URL } from "../../../components/Constant";
import { POST_API } from "../../../components/Helper";
import { trackHappyAgentMixpanel } from "../../../store/actions/happyAgentTracking";
import {
    HAPPPY_GTM_EXTENSION_STORAGE_KEY,
    markHapppyGtmExtensionSeen,
    trackHapppyGtm,
} from "../../../helpers/happpyGtmOnboarding";

const CHROME_STORE_URL =
    "https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en";

const syncExtensionEngagementToServer = () => {
    POST_API(`${API_URL}talent/outreach/extension-engagement`, {
        chrome_extension_download: true,
    }).catch(() => {});
};

function DownloadIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function HapppyGtmExtensionStep({ extensionDownloaded, onAdvance, onBack }) {
    const [downloaded, setDownloaded] = useState(!!extensionDownloaded);
    const didSyncFromStorage = useRef(false);

    useEffect(() => {
        trackHapppyGtm("happpy_gtm_extension_step_viewed");
    }, []);

    useEffect(() => {
        let saved = false;
        try {
            saved = localStorage.getItem(HAPPPY_GTM_EXTENSION_STORAGE_KEY) === "true";
        } catch {
            /* ignore */
        }
        if (saved || extensionDownloaded) {
            setDownloaded(true);
            if (saved && !didSyncFromStorage.current) {
                didSyncFromStorage.current = true;
                syncExtensionEngagementToServer();
            }
        }
    }, [extensionDownloaded]);

    const handleDownloadClick = useCallback(() => {
        try {
            localStorage.setItem(HAPPPY_GTM_EXTENSION_STORAGE_KEY, "true");
        } catch {
            /* ignore */
        }
        syncExtensionEngagementToServer();
        setDownloaded(true);
        trackHappyAgentMixpanel("agent_onb_extension_downloaded").catch(() => {});
        trackHapppyGtm("happpy_gtm_extension_downloaded");
    }, []);

    const handleNext = () => {
        markHapppyGtmExtensionSeen();
        trackHappyAgentMixpanel("agent_onb_extension_step_completed", { downloaded }).catch(() => {});
        trackHapppyGtm("happpy_gtm_extension_continued", { downloaded });
        if (typeof onAdvance === "function") onAdvance();
    };

    return (
        <>
            <div className="agent-onb-scroll">
                <header className="agent-onb-step-header">
                    <h2 className="agent-onb-step-header__title">Download Browser Extension</h2>
                    <p className="agent-onb-step-header__lede ext-overflow">
                        Install the Happpy Agent extension to use it{" "}
                        <span className="agent-onb-step-header__lede-strong in-block">
                            across any job platform on Chrome and Brave browsers
                        </span>
                    </p>
                </header>

                <div className="agent-onb-ext-wrap">
                    <div className="agent-onb-ext-card">
                        <div className="agent-onb-ext-card__hero">
                            <img
                                src="/images/talent/Chrome-logo.svg"
                                alt="Google Chrome"
                                className="agent-onb-ext-card__browser"
                                width="71"
                                height="71"
                            />
                            <img
                                src="/images/talent/Brave-logo.svg"
                                alt="Brave"
                                className="agent-onb-ext-card__browser"
                                width="71"
                                height="71"
                            />
                        </div>
                        <div className="agent-onb-ext-card__body">
                            <h3 className="agent-onb-ext-card__title">
                                Run Happy <span className="agent-onb-ext-card__title-strong">Agent</span> on any job
                                platform
                            </h3>
                            <a
                                href={CHROME_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`agent-onb-ext-card__cta${downloaded ? " agent-onb-ext-card__cta--done" : ""}`}
                                onClick={handleDownloadClick}
                            >
                                {downloaded ? (
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path
                                            d="M5 12.5l4.5 4.5L19 7.5"
                                            stroke="currentColor"
                                            strokeWidth="2.4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                ) : (
                                    <DownloadIcon />
                                )}
                                <span>{downloaded ? "Extension downloaded" : "Download extension"}</span>
                            </a>
                        </div>
                    </div>
                    <p className="agent-onb-ext-manual-note">
                        <span>Prefer to paste job links manually? </span>
                        <span className="agent-onb-ext-manual-note__strong">
                            You can do this manually from your Happpy Agent dashboard
                        </span>
                    </p>
                </div>
            </div>

            <div className="agent-onb-footer">
                <button type="button" className="agent-onb-footer__back" onClick={onBack} aria-label="Back to previous step">
                    <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <button type="button" className="agent-onb-footer__cta agent-onb-footer__cta--dark" onClick={handleNext}>
                    <span>Continue to jobs</span>
                </button>
            </div>
        </>
    );
}
