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

export default function TalentResumeStyles() {
    useEffect(() => {
        TALENT_STYLESHEETS.forEach((href) => {
            if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        });
    }, []);

    return null;
}
