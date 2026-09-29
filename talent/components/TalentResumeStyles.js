'use client';

import { useEffect } from 'react';

/** UTS index.blade.php order — ensures portaled react-modal overlays inherit full styling. */
const TALENT_STYLESHEETS = [
    '/css/talent/global.css',
    '/css/talent/style.css',
    '/css/talent/custom.css',
    '/css/talent/beforeAfter.css',
    '/css/talent/profile.css',
    '/css/talent/work.css',
    '/css/editor-styles.css',
    '/css/talent/resume-template.css',
    '/css/talent/resume-editor.css',
];

/** Must stay after style.css (resets html { font-size: 100% }). */
const REM_ROOT_STYLESHEET = '/css/talent/rem-root.css';

function appendStylesheet(href) {
    return new Promise((resolve) => {
        const existing = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
        if (existing) {
            resolve();
            return;
        }
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => resolve();
        document.head.appendChild(link);
    });
}

function ensureRemRootStylesheetLast() {
    const existing = document.querySelector(`link[rel="stylesheet"][href="${REM_ROOT_STYLESHEET}"]`);
    if (existing) {
        existing.remove();
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = REM_ROOT_STYLESHEET;
    document.head.appendChild(link);
}

export default function TalentResumeStyles() {
    useEffect(() => {
        let cancelled = false;
        (async () => {
            for (const href of TALENT_STYLESHEETS) {
                await appendStylesheet(href);
            }
            if (!cancelled) {
                ensureRemRootStylesheetLast();
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}
