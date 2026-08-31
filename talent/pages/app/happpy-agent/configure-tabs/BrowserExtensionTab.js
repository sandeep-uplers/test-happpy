'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL } from '../../../../components/Constant';
import { POST_API } from '../../../../components/Helper';
import { trackHappyAgentMixpanel } from '../../../../store/actions/happyAgentTracking';
import JobPlatformIconRow from './JobPlatformIconRow';
import PasteJobLinkDrawer from './PasteJobLinkDrawer';

/**
 * Browser Extension tab — Figma node 28447:12005
 *
 * Mirrors {@link Step3ExtensionInstall} from `pages/app/agent-onboarding/`
 * but lives inside the Configure shell, so it ditches the onboarding scroll
 * shell / footer and replaces the "Already downloaded?" coach-mark with the
 * Figma's "Paste job link" tooltip opens an in-page drawer (see PasteJobLinkDrawer).
 *
 * Shares the legacy localStorage key + `extension-engagement` endpoint with
 * Step3ExtensionInstall and the legacy outreach flow so the install state
 * stays in sync across every surface.
 */

const CHROME_STORE_URL =
    'https://chromewebstore.google.com/detail/job-referral-agent-uplers/mbajhdldnhgbgncakknckdpnjmhemgcn?hl=en';
const EXTENSION_STORAGE_KEY = 'outreach_chrome_extension_downloaded';

const syncExtensionEngagementToServer = () => {
    POST_API(`${API_URL}talent/outreach/extension-engagement`, {
        chrome_extension_download: true,
    }).catch(() => { });
};

/* -------------------------------------------------------------------------- */
/* Inline icons                                                                */
/* -------------------------------------------------------------------------- */

function DownloadIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
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

function CheckmarkIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function InfoCircleIcon() {
    return (
        <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" stroke="#565b6c" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="#565b6c" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="#565b6c" />
        </svg>
    );
}

/* -------------------------------------------------------------------------- */
/* BrowserExtensionTab                                                         */
/* -------------------------------------------------------------------------- */

const BrowserExtensionTab = () => {
    const [downloaded, setDownloaded] = useState(false);
    const [pasteDrawerOpen, setPasteDrawerOpen] = useState(false);
    const didSyncFromStorage = useRef(false);

    /** Hydrate from the same localStorage key the legacy Step 3 / Outreach.js
     *  use, so swapping browsers / clearing cache still respects the install
     *  state recorded server-side. */
    useEffect(() => {
        let saved = false;
        try {
            saved = localStorage.getItem(EXTENSION_STORAGE_KEY) === 'true';
        } catch (e) {
            // ignore — localStorage may be unavailable (private mode, SSR)
        }

        if (saved) {
            setDownloaded(true);
            if (!didSyncFromStorage.current) {
                didSyncFromStorage.current = true;
                syncExtensionEngagementToServer();
            }
        }
    }, []);

    const handleDownloadClick = useCallback(() => {
        try {
            localStorage.setItem(EXTENSION_STORAGE_KEY, 'true');
        } catch (e) {
            // ignore
        }
        syncExtensionEngagementToServer();
        trackHappyAgentMixpanel('agent_configure_extension_downloaded').catch(() => { });
    }, []);

    const handlePasteJobLinkClick = useCallback(() => {
        trackHappyAgentMixpanel('agent_configure_paste_job_link_clicked').catch(() => { });
        setPasteDrawerOpen(true);
    }, []);

    return (
        <>
        <div className="hc-tab-content">
            <div className="hc-be">
                <div className="hc-be__row">
                    {/* ---------------- Extension card (left) ---------------- */}
                    <div className="hc-be-card">
                        <div className="hc-be-card__hero">
                            <img
                                src="/images/talent/Chrome-logo.svg"
                                alt="Google Chrome"
                                className="hc-be-card__browser"
                                width="71"
                                height="71"
                            />
                            <img
                                src="/images/talent/Brave-logo.svg"
                                alt="Brave"
                                className="hc-be-card__browser"
                                width="71"
                                height="71"
                            />
                        </div>

                        <div className="hc-be-card__body">
                            <h3 className="hc-be-card__title">
                                Run Happpy{' '}
                                <span className="hc-be-card__title-strong">Agent</span>{' '}
                                on any job platform
                            </h3>

                            <JobPlatformIconRow />

                            <a
                                href={CHROME_STORE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`hc-be-card__cta${downloaded ? ' hc-be-card__cta--done' : ''
                                    }`}
                                onClick={handleDownloadClick}
                            >
                                {downloaded ? <CheckmarkIcon /> : <DownloadIcon />}
                                <span>
                                    {downloaded ? 'Extension downloaded' : 'Download extension'}
                                </span>
                            </a>
                        </div>
                    </div>

                    {/* ---------------- Paste-job tooltip (right) ---------------- */}
                    <div className="hc-be-tooltip" role="note">
                        <img
                            className="hc-be-tooltip__mascot"
                            src="/images/talent/outreach/mascot-neutral.svg"
                            alt=""
                            aria-hidden="true"
                        />
                        <div className="hc-be-tooltip__bubble">
                            <p className="hc-be-tooltip__text">
                                <span>
                                    Prefer to paste job links manually for your job referrals?{' '}
                                </span>
                                <span>
                                    Paste any job URL from LinkedIn, Indeed, or career sites
                                </span>
                            </p>
                            <button
                                type="button"
                                className="hc-be-tooltip__cta"
                                onClick={handlePasteJobLinkClick}
                            >
                                Paste job link
                            </button>
                        </div>
                    </div>
                </div>

                <p className="hc-be-note">
                    <InfoCircleIcon />
                    <span>
                        You can ignore this if you&rsquo;ve already installed the Happpy Agent
                        extension
                    </span>
                </p>
            </div>
        </div>

        <PasteJobLinkDrawer
            open={pasteDrawerOpen}
            onClose={() => setPasteDrawerOpen(false)}
        />
        </>
    );
};

export default BrowserExtensionTab;
