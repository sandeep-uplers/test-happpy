'use client';

import React from 'react';

const URL_IN_TEXT_REGEX =
    /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_+.~#?&/=]*)/gi;

function toClickableHref(url) {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/**
 * Renders plain text with http(s) URLs (optional scheme/www) as external links.
 * @param {string} text
 * @param {string} [linkClassName] - optional class for matched URL anchors
 */
export function renderTextWithLinks(text, linkClassName = '') {
    if (text == null || text === '') return text;
    const s = String(text);
    const re = new RegExp(URL_IN_TEXT_REGEX.source, URL_IN_TEXT_REGEX.flags);
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = re.exec(s)) !== null) {
        if (match.index > lastIndex) {
            parts.push(s.slice(lastIndex, match.index));
        }
        const rawUrl = match[0];
        const url = rawUrl.replace(/[.,;:!?)\]]+$/, '');
        parts.push(
            <a
                key={key++}
                href={toClickableHref(url)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClassName || undefined}
            >
                {url}
            </a>
        );
        lastIndex = match.index + rawUrl.length;
    }
    if (parts.length === 0) return s;
    if (lastIndex < s.length) parts.push(s.slice(lastIndex));
    return parts;
}
