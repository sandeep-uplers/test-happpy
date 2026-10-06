export const LINKEDIN_HTTPS_PREFIX = 'https://';

/** Value shown in the input (scheme stripped so the fixed prefix is not duplicated). */
export const stripLinkedinUrlScheme = (raw) =>
    String(raw || '')
        .trim()
        .replace(/^https?:\/\//i, '');

/** Full profile URL for validation and API (always https://). */
export const buildLinkedinProfileUrl = (raw) => {
    const path = stripLinkedinUrlScheme(raw);
    if (!path) return '';
    return `${LINKEDIN_HTTPS_PREFIX}${path}`;
};
