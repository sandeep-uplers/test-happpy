'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from '@/talent/navigation/routerCompat';
import MessageTemplatesTab from './configure-tabs/MessageTemplatesTab';
import ConnectedAccountsTab from './configure-tabs/ConnectedAccountsTab';
import FollowUpSettingsTab from './configure-tabs/FollowUpSettingsTab';
import AutoRunSettingsTab from './configure-tabs/AutoRunSettingsTab';
import AutoReplySettingsTab from './configure-tabs/AutoReplySettingsTab';
import OutreachModeTab from './configure-tabs/OutreachModeTab';
import BrowserExtensionTab from './configure-tabs/BrowserExtensionTab';
import BlockedCompaniesTab from './configure-tabs/BlockedCompaniesTab';
import AutoReplyTabIntro from './AutoReplyTabIntro';
import './HapppyConfigure.css';

/**
 * "Configure your Happpy Agent" — Happpy Agent configure page.
 *
 * Layout:
 *   - Page title
 *   - Top-level tabs (URL-controlled via `?tab=...`)
 *   - Tab-specific content rendered from `configure-tabs/`
 *
 * Each tab lives in its own file under `configure-tabs/` so this shell
 * stays small and tabs can be developed / iterated independently.
 *
 * When `happpyAgent.dashboardData.total_jobs_run > 0`, Auto Reply is
 * pinned first and becomes the default tab (no `?tab=`).
 */

const TABS = [
    { id: 'message-templates', label: 'Message Templates' },
    { id: 'connected-accounts', label: 'Connected Accounts' },
    { id: 'follow-up-settings', label: 'Follow-up Settings' },
    { id: 'auto-run', label: 'Auto Run' },
    { id: 'auto-reply', label: 'Auto Reply' },
    { id: 'outreach-mode', label: 'Outreach Mode' },
    { id: 'browser-extension', label: 'Browser Extension' },
    { id: 'blocked-companies', label: 'Blocked Companies' },
];

const FALLBACK_DEFAULT_TAB = 'message-templates';
const AUTO_REPLY_TAB_ID = 'auto-reply';
const VALID_TAB_IDS = TABS.map((t) => t.id);

const HapppyConfigure = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabsTrackRef = useRef(null);
    const autoReplyTabRef = useRef(null);
    const dashboardData = useSelector((state) => state.happpyAgent.dashboardData);
    const prioritizeAutoReply = Number(dashboardData?.total_jobs_run) > 0;

    const tabs = useMemo(() => {
        if (!prioritizeAutoReply) return TABS;
        const autoReply = TABS.find((t) => t.id === AUTO_REPLY_TAB_ID);
        return [autoReply, ...TABS.filter((t) => t.id !== AUTO_REPLY_TAB_ID)];
    }, [prioritizeAutoReply]);

    const defaultTab = prioritizeAutoReply ? AUTO_REPLY_TAB_ID : FALLBACK_DEFAULT_TAB;

    /** Resolve active tab from `?tab=...`, falling back to default when missing/invalid. */
    const activeTab = useMemo(() => {
        const t = searchParams.get('tab');
        return VALID_TAB_IDS.includes(t) ? t : defaultTab;
    }, [searchParams, defaultTab]);

    const handleTabChange = useCallback(
        (tabId) => {
            if (tabId === activeTab) return;
            const next = new URLSearchParams(searchParams);
            if (tabId === defaultTab) {
                next.delete('tab');
            } else {
                next.set('tab', tabId);
            }
            setSearchParams(next, { replace: false });
        },
        [activeTab, defaultTab, searchParams, setSearchParams],
    );

    /** Keep the active tab in view when the bar scrolls horizontally on narrow screens. */
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const track = tabsTrackRef.current;
        if (!track || window.matchMedia('(min-width: 768px)').matches) return undefined;

        const activeEl = track.querySelector('.hc-tab--active');
        activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        return undefined;
    }, [activeTab]);

    useEffect(() => {
        document.title = 'Configure | Happpy Agent | Uplers';
    }, []);

    /** Render the active tab. New tabs slot in here as their files arrive. */
    const renderTab = () => {
        switch (activeTab) {
            case 'message-templates':
                return <MessageTemplatesTab />;
            case 'connected-accounts':
                return <ConnectedAccountsTab />;
            case 'follow-up-settings':
                return <FollowUpSettingsTab />;
            case 'auto-run':
                return <AutoRunSettingsTab />;
            case 'auto-reply':
                return <AutoReplySettingsTab />;
            case 'outreach-mode':
                return <OutreachModeTab />;
            case 'browser-extension':
                return <BrowserExtensionTab />;
            case 'blocked-companies':
                return <BlockedCompaniesTab />;
            default:
                return (
                    <div className="hc-placeholder">
                        {tabs.find((t) => t.id === activeTab)?.label} — coming soon
                    </div>
                );
        }
    };

    return (
        <div className="hc-page">
                <h1 className="hc-page__title">Configure your Happpy Agent</h1>

                <nav className="hc-tabs" aria-label="Configure tabs">
                    <div
                        className="hc-tabs__track"
                        ref={tabsTrackRef}
                        role="tablist"
                    >
                        {tabs.map((tab, idx) => {
                            const isActive = activeTab === tab.id;
                            const showDivider = !isActive && idx < tabs.length - 1;
                            return (
                                <span key={tab.id} className="hc-tab-anchor">
                                    <button
                                        type="button"
                                        role="tab"
                                        id={`hc-tab-${tab.id}`}
                                        ref={tab.id === AUTO_REPLY_TAB_ID ? autoReplyTabRef : undefined}
                                        aria-selected={isActive}
                                        className={`hc-tab${isActive ? ' hc-tab--active' : ''}${showDivider ? ' hc-tab--with-divider' : ''}`}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        {tab.label}
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </nav>

                <AutoReplyTabIntro
                    activeTabIsAutoReply={activeTab === AUTO_REPLY_TAB_ID}
                    anchorRef={autoReplyTabRef}
                    scrollContainerRef={tabsTrackRef}
                />

            {renderTab()}
        </div>
    );
};

export default HapppyConfigure;
