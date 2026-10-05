'use client';


const wordsOnly = /^[A-Za-z ]*$/;
const wordsLimitedCharacter = /^[0-9A-Za-z@&\-_:;,'"()[\].\\\/ ]*$/;
const contactOnly = /^[0-9]{10}$/;
const floatNo = /^\d*\.?\d{1}$/;
const numberOnly = /^\d*$/;
const alphaNumeric = /^[A-Za-z0-9 ]*$/;
const url = /^((http|https):\/\/)?([w|W]{3}\.)?[a-zA-Z0-9]{3,}.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?\/.*$/
const linkedin_url = /^(http(s)?:\/\/)?((www|WWW|in)\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/*/
const email = /^\w+([\.-]?\w+)*@\w+([\.+-]?\w+)*(\.\w{2,})+$/

export const validateWordsOnly = (val) => {
    return val.match(wordsOnly)
}

/** First and last name: at least two words, letters only, each word min 2 characters. */
export const validateFullName = (val) => {
    const trimmed = String(val || '').trim().replace(/\s+/g, ' ');
    if (!trimmed || trimmed.length < 2) return false;
    if (/^(user|talent|guest|unknown|test|there)$/i.test(trimmed)) return false;
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length < 2) return false;
    return parts.every((part) => part.length >= 2 && validateWordsOnly(part));
}
export const validateWordsSymbols = (val) => {
    return val.match(wordsLimitedCharacter)
}
export const validateAlphaNumeric = (val) => {
    return val.match(alphaNumeric)
}
export const validateContactNo = (val) => {
    return val.match(contactOnly)
}
export const validateFloat = (val) => {
    return val.match(floatNo)
}
export const validateNumber = (val) => {
    return val.match(numberOnly)
}
export const validateURL = (val) => {
    try {
        new URL(val);
        return true;
    } catch (err) {
        return false;
    }
}
export const validateLinkedinURL = (val) => {
    return val.match(linkedin_url)
}
export const validateEmail = (val) => {
    return val.match(email)
}

export const validateEmailV2 = (val) => {
    const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!val || val.length > 254) return false;
    
    if (val.indexOf('@') === -1 || val.indexOf('@') !== val.lastIndexOf('@')) return false;
    if (val.startsWith('.') || val.endsWith('.')) return false;
    if (val.includes('..')) return false;
    
    return email.test(val);
}