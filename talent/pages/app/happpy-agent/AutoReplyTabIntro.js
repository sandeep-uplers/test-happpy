'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AUTO_REPLY_TAB_SEEN_EVENT,
    markAutoReplyTabSeen,
    readAutoReplyTabSeen,
} from './autoReplyTabSeen';

/**
 * First-run tooltip for the Auto Reply tab on Configure.
 * Portaled to document.body so it is not clipped by the mobile tab
 * scroll track (`overflow-x: auto` on `.hc-tabs__track`).
 *
 * Stays visible while the Auto Reply tab is open, then dismisses and
 * persists "seen" after a short delay so users can read the callout.
 */

const AUTO_REPLY_INTRO_HIDE_MS = 4000;

const AutoReplyTabIntro = ({ activeTabIsAutoReply, anchorRef, scrollContainerRef }) => {
    const popRef = useRef(null);
    const [seen, setSeen] = useState(readAutoReplyTabSeen);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 280, arrowLeft: 140 });

    /** Show until dismissed after Auto Reply has been open for a couple of seconds. */
    const visible = !seen;

    const placePopover = useCallback(() => {
        const btn = anchorRef?.current;
        if (!btn) return;

        const pop = popRef.current;
        const margin = 12;
        const gap = 8;
        const maxW = Math.min(280, window.innerWidth - margin * 2);
        const br = btn.getBoundingClientRect();
        const tabCenterX = br.left + br.width / 2;

        let left = tabCenterX - maxW / 2;
        left = Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));

        const arrowLeft = Math.max(18, Math.min(tabCenterX - left, maxW - 18));

        let top = br.bottom + gap;
        if (pop) {
            const ph = pop.getBoundingClientRect().height;
            if (top + ph > window.innerHeight - margin) {
                top = Math.max(margin, br.top - ph - gap);
            }
        }

        setPos({ top, left, width: maxW, arrowLeft });
    }, [anchorRef]);

    useEffect(() => {
        const syncSeen = () => setSeen(readAutoReplyTabSeen());
        window.addEventListener(AUTO_REPLY_TAB_SEEN_EVENT, syncSeen);
        return () => window.removeEventListener(AUTO_REPLY_TAB_SEEN_EVENT, syncSeen);
    }, []);

    useEffect(() => {
        if (!activeTabIsAutoReply || seen) return undefined;
        const id = window.setTimeout(() => {
            setSeen(true);
            markAutoReplyTabSeen();
        }, AUTO_REPLY_INTRO_HIDE_MS);
        return () => window.clearTimeout(id);
    }, [activeTabIsAutoReply, seen]);

    useEffect(() => {
        if (!visible) return undefined;

        const btn = anchorRef?.current;
        if (!btn) return undefined;

        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        const t1 = window.setTimeout(placePopover, 120);
        const t2 = window.setTimeout(placePopover, 400);

        return () => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, [visible, activeTabIsAutoReply, anchorRef, placePopover]);

    useLayoutEffect(() => {
        if (!visible) return undefined;
        placePopover();
        const id = requestAnimationFrame(() => placePopover());
        return () => cancelAnimationFrame(id);
    }, [visible, activeTabIsAutoReply, placePopover]);

    useEffect(() => {
        if (!visible) return undefined;
        const onMove = () => placePopover();
        const track = scrollContainerRef?.current;
        window.addEventListener('scroll', onMove, true);
        window.addEventListener('resize', onMove);
        track?.addEventListener('scroll', onMove, { passive: true });
        return () => {
            window.removeEventListener('scroll', onMove, true);
            window.removeEventListener('resize', onMove);
            track?.removeEventListener('scroll', onMove);
        };
    }, [visible, placePopover, scrollContainerRef]);

    if (!visible || typeof document === 'undefined') return null;

    return createPortal(
        <aside
            ref={popRef}
            className="hc-auto-reply-intro hc-auto-reply-intro--portal"
            role="status"
            aria-label="New: Auto-reply from your Happy Agent"
            style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
            }}
        >
            <div
                className="hc-auto-reply-intro__callout"
                style={{ '--hc-auto-reply-arrow-left': `${pos.arrowLeft}px` }}
            >
                <p className="hc-auto-reply-intro__title">
                    {/* 🚀  */}
                    New: Auto-reply from HAPPPY
                </p>
                <p className="hc-auto-reply-intro__body">
                    HAPPPY can now auto-reply to responses.
                </p>
            </div>
        </aside>,
        document.body,
    );
};

export default AutoReplyTabIntro;
