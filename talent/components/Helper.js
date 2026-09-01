'use client';

import axios from 'axios';
import toast from 'react-hot-toast';
import { addDays, differenceInHours, differenceInMinutes, format, subYears } from 'date-fns';
import Cookies from 'js-cookie';
import store from '../store/store'
import { SET_NETWORK_ERROR } from '../store/actions/actionsTypes';
import { trackLink } from '../store/actions/UserActions';

const readAuthToken = () => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('token') ?? localStorage.getItem('guest_token') ?? '';
};

export const GET_API = (url) => {
    // const dispatch=useDispatch()
    axios.defaults.headers.common['Authorization'] = "Bearer " + readAuthToken();
    return new Promise((resolve, reject) => {
        axios.get(url)
            .then((res) => resolve(res))
            .catch((err) => reject(err))
    })
}
export const DELETE_API = (url, retry = 1) => {
    axios.defaults.headers.common['Authorization'] = "Bearer " + readAuthToken();
    return axios.delete(url)
        .then((res) => res)
        .catch((err) => {
            if (err.message === 'Network Error' && retry === 1) {
                return DELETE_API(url, retry + 1);
            } else {
                if (err.message === 'Network Error') {
                    dispatchAction({
                        type: SET_NETWORK_ERROR,
                        payload: {
                            isNetworkError: true,
                        },
                    })
                }
                return Promise.reject(err);
            }
        })
}

export const POST_API = async (url, payload, retry = 1) => {
    const token = readAuthToken();
    const customHeaders = {
        Authorization: `Bearer ${token}`,
        utm_source: Cookies.get('utm_source'),
        utm_medium: Cookies.get('utm_medium'),
        utm_campaign: Cookies.get('utm_campaign'),
        // utm_placement: Cookies.get('utm_placement'),
        utm_content: Cookies.get('utm_content'),
        ref_url: Cookies.get('ref_url'),
        tpt: Cookies.get('tpt'),
        l: Cookies.get('l'),
    };

    try {
        const response = await axios.post(url, payload, {
            headers: customHeaders,
        });

        return response;
    } catch (err) {
        const isNetworkError = !err.response && err.request;
        const errorCode = err?.response?.status ?? null;

        if (isNetworkError && retry === 1) { // Retry once after delay
            await new Promise((resolve) => setTimeout(resolve, payload.networkDelay || 500));
            return POST_API(url, payload, retry + 1);
        }

        if (isNetworkError && retry > 1) {
            dispatchAction({
                type: SET_NETWORK_ERROR,
                payload: {
                    isNetworkError: true,
                    erroObjForTracking: {
                        endpoint: url,
                        payload: JSON.stringify(payload),
                        userAgent: navigator.userAgent,
                        error: err?.toString(),
                        errorCode,
                        errorMessage: err?.message,
                        isUserOnline: navigator.onLine,
                        requestBodySize: new Blob([JSON.stringify(payload)]).size,
                    },
                },
            });
        }

        throw err;
    }
};

/** POST with an explicit token (e.g. pending auth before OTP verify). Does not read from localStorage. */
export const POST_API_WithToken = async (url, payload, token) => {
    const customHeaders = {
        Authorization: `Bearer ${token}`,
        utm_source: Cookies.get('utm_source'),
        utm_medium: Cookies.get('utm_medium'),
        utm_campaign: Cookies.get('utm_campaign'),
        // utm_placement: Cookies.get('utm_placement'),
        utm_content: Cookies.get('utm_content'),
        ref_url: Cookies.get('ref_url'),
        tpt: Cookies.get('tpt'),
        l: Cookies.get('l'),
    };
    const response = await axios.post(url, payload, { headers: customHeaders });
    return response;
};

export const POST_API_V2 = async (url, payload, retry = 1) => {
    const token = readAuthToken();

    const isFormData =
        typeof FormData !== 'undefined' && payload instanceof FormData;

    const customHeaders = {
        Authorization: `Bearer ${token}`,
        utm_source: Cookies.get('utm_source'),
        utm_medium: Cookies.get('utm_medium'),
        utm_campaign: Cookies.get('utm_campaign'),
        // utm_placement: Cookies.get('utm_placement'),
        utm_content: Cookies.get('utm_content'),
        ref_url: Cookies.get('ref_url'),
        tpt: Cookies.get('tpt'),
    };

    if (!isFormData) {
        customHeaders['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: customHeaders,
            body: isFormData ? payload : JSON.stringify(payload),
            credentials: 'include', // axios parity
        });

        const contentType = response.headers.get('content-type');
        const data =
            contentType?.includes('application/json')
                ? await response.json()
                : null;

        if (!response.ok) {
            const error = new Error('Request failed');
            error.response = {
                status: response.status,
                data,
            };
            throw error;
        }

        return {
            data,
            status: response.status,
            ok: true,
        };
    } catch (err) {
        const isNetworkError = !err?.response;
        const errorCode = err?.response?.status ?? null;

        if (isNetworkError && retry === 1) {
            await new Promise((r) => setTimeout(r, 500));
            return POST_API_V2(url, payload, retry + 1);
        }

        if (isNetworkError && retry > 1) {
            let requestBodySize = null;

            try {
                if (!isFormData) {
                    requestBodySize = new Blob([
                        JSON.stringify(payload),
                    ]).size;
                }
            } catch { }

            dispatchAction({
                type: SET_NETWORK_ERROR,
                payload: {
                    isNetworkError: true,
                    erroObjForTracking: {
                        endpoint: url,
                        payload: isFormData
                            ? '[FormData]'
                            : JSON.stringify(payload),
                        userAgent: navigator.userAgent,
                        error: err?.toString(),
                        errorCode,
                        errorMessage: err?.message,
                        isUserOnline: navigator.onLine,
                        requestBodySize,
                    },
                },
            });
        }

        throw err;
    }
};

export const dispatchAction = (action) => {
    store.dispatch(action);
};

/**
 * Cookie domain for Cookies.set(..., { domain }).
 *
 * The ATS derived this purely from the API origin, which was always the same
 * host that served the page. Here the two can differ — a dev server on
 * localhost:3000 talking to a remote API — and a cookie written for a domain
 * the browser is not on is dropped silently. So prefer the host we are actually
 * running on and fall back to the API origin during server rendering. Auth does
 * not depend on this: the token lives in localStorage and the cookie is only a
 * presence flag.
 */
export const getDomain = () => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
        return window.location.hostname;
    }
    try {
        return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
    } catch (e) {
        return '';
    }
}

export const DATE_FORMAT = (date, format = "") => {
    if (date == "" || date == null) {
        return "";
    }
    if (Object.prototype.toString.call(date) !== '[object Date]') {
        date = new Date(date)
    }
    var options = {}; var region = undefined
    switch (format) {
        case "M Y":
            options = { month: 'short', year: 'numeric' };
            break;
        case "d M Y":
            options = { day: 'numeric', month: 'short', year: 'numeric' };
            break;
        case "Y":
            options = { year: 'numeric' };
            break;
        case "Y-m-d":
            options = { year: 'numeric', month: '2-digit', day: '2-digit' };
            region = "en-CA";
            break;
        default:
            options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            break;
    }
    return date.toLocaleDateString(region, options)
}
export const arrayHas = (p, o) => {
    return p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o)
}
const MONEY_FIELDS = ["expected_ctc", "current_ctc"];
const EDITOR_FIELDS = ["objective", "job_description", "description", "testimonial_title", "achievement", "product_mindset"];
const DATE_FIELDS = ["start_date", "end_date", "issue_date", "expiry_date", "dob"];
const CHECKBOXS = ["is_current"];
export const sanitizePayload = (key, value) => {
    if (DATE_FIELDS.includes(key)) {
        return (value == "" || value == null) ? "" : format(value, 'yyyy-MM-dd')
    }
    else if (EDITOR_FIELDS.includes(key)) {
        if (value.trim() == "<p><br></p>") {
            return "";
        }
        return value.replaceAll(/●/g, '&#8226;');
    }
    else if (CHECKBOXS.includes(key)) {
        return (value == 1 || value == true) ? 1 : 0;
    }
    else {
        return value
    }
}
export const formatErrors = (errors) => {
    let newErrors = Object.keys(errors).map((item) => {
        return { [item.split(".")[1]]: errors[item][0] }
    })
    let finalObj = {};
    newErrors.map((item) => Object.assign(finalObj, item));
    let formatted = {
        [Object.keys(errors)[0].split(".")[0]]: finalObj
    }
    return formatted
}
export const buildFormData = (formData, data, parentKey) => {
    if (data && typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
        Object.keys(data).forEach(key => {
            buildFormData(formData, data[key], parentKey ? `${parentKey}[${key}]` : key);
        });
    } else {
        const value = data == null ? '' : data;
        formData.append(parentKey, value);
    }
    return formData
}
export const removeDuplicates = (arr, key) => {
    return arr.filter((obj, index, self) => {
        return index === self.findIndex((t) => (
            t[key] === obj[key]
        ))
    })
}

export const styleRemoveRegex = /(style=".+?")/gm;

const PAYRATE_STRING = ["better than market pay", "open to any budget", "confidential"];
export const isPayrateString = (cost) => {
    return PAYRATE_STRING.includes(cost.toLowerCase());
}

export const browserSupportScreening = async () => {
    let browserName = navigator.userAgent.toLowerCase();
    if (/chrome|crios|chromium|brave|edg/i.test(browserName)) {
        return true;
    }
    if (navigator.brave && await navigator.brave.isBrave() || false) {
        return true;
    }
    return false;
    // !((browserName.includes('chrome') || browserName.includes('crios')) || browserName.includes('brave') || browserName.includes('edge'))
}

export function hasBrowserStore() {
    const userAgent = navigator.userAgent;

    // Detect Chrome or Chrome-based browsers with Web Store support
    const isChrome = /Chrome/.test(userAgent) && !/OPR|Edg|Edge/.test(userAgent);

    // Detect Firefox
    const isFirefox = /Firefox/.test(userAgent);

    // Detect other Chromium-based browsers with Chrome Web Store support
    const hasWebStore = !!window.chrome && !!window.chrome.webstore;

    if (isChrome || hasWebStore) {
        return "Chrome or Chromium-based";
    }
    else if (isFirefox) {
        return "Firefox";
    }
    else {
        return false;
    }
}

export const isTalentHired = (talentStatus) => {
    return talentStatus ? (talentStatus == 5 || talentStatus == 6) : false
}

export const formatSkillname = (name) => {
    return name.replace(/(^\w|\s\w)/g, m => m.toUpperCase())
}

export const sanitizedDescription = (JobDescription) => {
    return JobDescription;
    // return DOMPurify.sanitize(JobDescription, {
    //     // ALLOWED_TAGS: ['h1', 'h2', 'h3', 'p', 'b', 'strong', 'i', 'em', 'ul', 'ol', 'li', 'a'],
    //     ALLOWED_ATTR: {
    //         // '*': ['class'], // Allow class attribute for custom styling
    //         'a': ['href', 'target'] // Allow href and target for links
    //     }
    // })
};

export const queryParams = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(param)
}

export const convertNpToDays = (talent_np) => {
    if (talent_np == "Immediately") {
        return 0
    }
    if (talent_np == "Within 2 Weeks" || talent_np == "15 Days") {
        return 15
    }
    if (talent_np == "2 to 4 Weeks" || talent_np == "30 Days") {
        return 30
    }
    if (talent_np == "45 Days") {
        return 45
    }
    if (talent_np == "4 to 8 Weeks" || talent_np == "60 Days") {
        return 60
    }
    if (talent_np == "More than 60 Days" || talent_np == "More than 8 Weeks") {
        return 90
    }
    return 90
}

const startOfDay = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const LWD_MAX_PAST_YEARS = 5;

const isServingNoticePeriod = (serving_notice_period) =>
    serving_notice_period === "Yes" || serving_notice_period === 1;

export const getLastWorkingDayBounds = (joining_period, serving_notice_period) => {
    const today = startOfDay(new Date());
    const isImmediate = convertNpToDays(joining_period) === 0;
    const isServingNotice = isServingNoticePeriod(serving_notice_period);

    // Immediately available: past LWD allowed (laid off / career break), but not future
    if (isImmediate) {
        return {
            minDate: subYears(today, LWD_MAX_PAST_YEARS),
            maxDate: today,
        };
    }

    // Serving notice: LWD must be today through end of notice period (max 90 days ahead)
    if (isServingNotice) {
        const noticeDays = Math.min(convertNpToDays(joining_period), 90);
        return {
            minDate: today,
            maxDate: addDays(today, noticeDays),
        };
    }

    return { minDate: null, maxDate: null };
};

export const isLastWorkingDayInBounds = (lastWorkingDay, joining_period, serving_notice_period) => {
    if (!lastWorkingDay || !isValidDate(lastWorkingDay)) {
        return false;
    }

    const { minDate, maxDate } = getLastWorkingDayBounds(joining_period, serving_notice_period);
    if (!minDate && !maxDate) {
        return true;
    }

    const selectedDate = startOfDay(new Date(lastWorkingDay));
    if (minDate && selectedDate < minDate) return false;
    if (maxDate && selectedDate > maxDate) return false;
    return true;
};

export const getLastWorkingDayBoundsError = (joining_period, serving_notice_period) => {
    const isImmediate = convertNpToDays(joining_period) === 0;
    const noticeDays = Math.min(convertNpToDays(joining_period), 90);

    if (isImmediate) {
        return `Last working day must be within the last ${LWD_MAX_PAST_YEARS} years and cannot be in the future`;
    }

    return `Last working day must be between today and ${noticeDays} days from today`;
};
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // Ensure whole seconds
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return formattedTime;
};
// Utility function to format date
export const formatDate = (date) => {
    const options = { day: 'numeric', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, ' ').replace(/(\d+)([a-zA-Z]+)/, '$1$2').replace(/ (\d+)$/, '’$1');
};

// Utility function to format date
export const formatDateRelativeToNow = (date) => {
    let isSameYear = new Date(date).getFullYear() == new Date().getFullYear();
    if (isSameYear) {
        let isToday = new Date(date).toDateString() == new Date().toDateString();
        if (isToday) {
            return format(new Date(date), 'hh:mm a');
        }
        let isYesterday = new Date(date).toDateString() == new Date().toDateString() - 1;
        if (isYesterday) {
            return 'Yesterday';
        }
        return format(new Date(date), 'MMM dd');
    }
    return format(new Date(date), 'MMM dd, yyyy');
};

// Utility function to format file size in MB
// export const formatFileSize = (size) => {
//     if (!size) return '0 MB';
//     const fileSizeInMB = (size / (1024 * 1024)).toFixed(2);
//     return `${fileSizeInMB} MB`;
// };
export const formatFileSize = (size) => {
    if (!size) return '0 KB';

    const fileSizeInKB = size / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;

    if (fileSizeInMB < 0.1) {  // Check if the file size is less than 100 KB
        return `${fileSizeInKB.toFixed(2)} KB`;
    }

    return `${fileSizeInMB.toFixed(2)} MB`;
};

export const VREmails = [
    "ishika03278412@gmail.com",
    "mehtamohit800@gmail.com",
    "ashwin.parihar@uplers.in",
    "Bhuvan.desai@gmail.com",
    "talent1@gmail.com"
];


export const checkPermissionsHelper = async () => {
    try {
        const cameraStatus = await navigator.permissions.query({ name: 'camera' });
        const micStatus = await navigator.permissions.query({ name: 'microphone' });
        // const windowManagement = await navigator.permissions.query({ name: "window-management" });

        return cameraStatus.state === 'granted' && micStatus.state === 'granted';

    } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
    }
}


export const getAllFilterData = (filters) => {
    if (!Array.isArray(filters)) {
        return '';
    }

    return filters.reduce((acc, item, index) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
            const keys = Object.keys(item).filter(key => key !== 'id');
            if (keys.length > 0) {
                acc.push(`group${index + 1}: ${keys.join(', ')}`);
            }
        }
        return acc;
    }, []).join(', ');
};

export const makeUrlsClickable = (htmlString) => {
    // Regular expression to match URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*)?/g;
    // Replace matched URLs with clickable anchor tags
    const newHtmlString = ('' + htmlString)?.replace(urlRegex, (match) => {
        return `<a href="${match}" target="_blank" onclick="event.stopPropagation()">${match}</a>`;
    });
    return newHtmlString;
}

export { renderTextWithLinks } from './renderTextWithLinks';

export const getNameInitials = (name) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export const getApplicationSource = () => {
    const getsource = Cookies.get('source')
    const sourceId = Cookies.get('s')
    let source = 'self'
    if (sourceId) {
        if (getsource != undefined) {
            source = getsource
        } else {
            trackLink({ 'l': Cookies.get('s'), 'get_source': true }).then((res) => {
                if (res?.status == 200) {
                    source = res?.data?.source
                }
            })
        }
    }
    return source
}

export const scrollToFirstError = () => {
    // Get all elements with class name 'error'
    const errorElements = document.getElementsByClassName('error-msg');

    if (errorElements.length > 0) {
        // Scroll to the first error element
        errorElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

export function isValidDateString(dateString) {
    // Regular expression to match YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Check format
    if (!dateRegex.test(dateString)) {
        return false;
    }

    // Split the string to extract year, month, and day
    const [year, month, day] = dateString.split("-").map(Number);

    // Validate year, month, and day
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return false;
    }

    // Check if the constructed date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return false;
    }

    // Ensure the date components match exactly
    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() + 1 === month &&
        date.getUTCDate() === day
    );
}

export const fileRegex = /(\.pdf|\.docx)$/i;

export function base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
}
export function formattedYOE(min, max) {
    const floorMin = Math.floor(min ?? 0);
    const floorMax = Math.floor(max ?? 0);

    const plural = (n) => (n === 1 ? "Year" : "Years");

    // Case: both provided, max > 0
    if (floorMin >= 0 && floorMax > 0) {
        if (floorMin === floorMax) {
            return `${floorMin} ${plural(floorMin)} Exp`;
        }
        return `${floorMin} - ${floorMax} ${plural(floorMax)} Exp`;
    }

    // Case: only min > 0
    if (floorMin > 0 && !floorMax) {
        return `${floorMin} ${plural(floorMin)} Exp`;
    }

    return "Freshers";
}
export const transformAndMergeObjects = (oldObj, newObj, allOppMasterValue) => {
    const transformedObj = {};

    for (const [key, value] of Object.entries(newObj)) {
        if (typeof value === "object" && value !== null) {
            // Convert object keys where values are true into a comma-separated string
            if (key == 'locations') {
                // Find matching labels
                if (!allOppMasterValue?.location_master) return
                const matchingLabels = allOppMasterValue?.location_master?.filter(loc => Object.keys(value)?.includes(loc.value.toString())).map(loc => loc.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            } else if (key == 'skills') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.skill_master?.filter(skill => Object.keys(value)?.includes(skill.value.toString())).map(skill => skill.skill_name); // Extract only skill_name
                transformedObj[key] = matchingLabels?.join(", ");
            } else if (key == 'roles') {
                const matchingLabels = allOppMasterValue?.role_master?.filter(role => Object.keys(value)?.includes(role.value.toString())).map(role => role.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else if (key == 'maang_plus') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.maang_master?.filter(item => Object.keys(value)?.includes(item.value.toString())).map(item => item.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else if (key == 'job_posted_date') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.jobPostedDateMaster?.filter(item => Object.keys(value)?.includes(item.value.toString())).map(item => item.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else {
                transformedObj[key] = Object.keys(value).join(", ");
            }
        } else if (value != null && value != '') {
            // Copy other key-value pairs as-is
            transformedObj[key] = value;
        }
    }

    // Merge old and new data
    const mergedObj = { ...oldObj, ...newObj };

    // Find modified keys and return as a string
    const modifiedKeysString = Object.keys(mergedObj)
        .filter(key => oldObj[key] !== mergedObj[key])
        .join(", ");
    transformedObj.filter_used = modifiedKeysString


    return transformedObj;
};

// Transforms an object by adding a specified prefix to its keys
export const transformObjectKeysWithPrefix = (newObj, allOppMasterValue, prefix = null) => {
    const transformedObj = {};
    const updatedObj = { filterData: {}, filterUsed: '' };

    for (const [key, value] of Object.entries(newObj)) {
        if (typeof value === "object" && value !== null && Object.keys(value).length > 0) {
            // Convert object keys where values are true into a comma-separated string
            if (key == 'locations') {
                // Find matching labels
                if (!allOppMasterValue?.location_master) return
                const matchingLabels = allOppMasterValue?.location_master?.filter(loc => Object.keys(value)?.includes(loc.value.toString())).map(loc => loc.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            } else if (key == 'skills') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.skill_master?.filter(skill => Object.keys(value)?.includes(skill.value.toString())).map(skill => skill.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else if (key == 'maang_plus') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.maang_master?.filter(item => Object.keys(value)?.includes(item.value.toString())).map(item => item.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else if (key == 'job_posted_date') {
                // Find matching labels
                const matchingLabels = allOppMasterValue?.jobPostedDateMaster?.filter(item => Object.keys(value)?.includes(item.value.toString())).map(item => item.label); // Extract only labels
                transformedObj[key] = matchingLabels?.join(", ");
            }
            else {
                transformedObj[key] = Object.keys(value).join(", ");
            }
        } else if (value != null && value != '' && typeof value !== "object") {
            // Copy other key-value pairs as-is
            transformedObj[key] = value;
        }
    }

    updatedObj['filterData'] = transformedObj;
    if (prefix) {
        updatedObj['filterData'] = Object.fromEntries(
            Object.entries(transformedObj).map(([key, value]) => [`${prefix}_${key}`, value])
        );
    }
    updatedObj['filterUsed'] = Object.keys(updatedObj?.filterData).join(', ');

    return updatedObj;
};

export const getCandidatePostion = (perPage, pageNo = 1, index = 0) => {
    const totalNo = (perPage * pageNo)
    const currentIndex = (totalNo - perPage) + index
    return currentIndex;
}

export const isNewUserStep = (applySteps, hrData) => {
    if (hrData.is_custome_screening) {
        return ((applySteps.total == 6 && [1, 2].includes(hrData.ai_mandatory)) || (applySteps.total == 5 && hrData.ai_mandatory == 0))
    }
    return (applySteps.total == 5 && [1, 2].includes(hrData.ai_mandatory)) || (applySteps.total == 4 && hrData.ai_mandatory == 0)
}

export const MASTER_FILTERS = ['locations', 'skills', 'maang_plus', 'roles'];
export const ALL_FILTERS = [
    'locations',
    'skills',
    'maang_plus',
    'roles',
    'search',
    'experience',
    'engagements',
    'payout',
    'partner_companies',
    'salary_available',
    'job_posted_date',
    'team_size',
    'is_saved_filter',
    'job_posted_date'
];

export const urlCustomEncode = (str) => {
    if (typeof str !== 'string') return "";

    return str.split("").map(char => {
        const code = char.charCodeAt(0);
        return /[a-zA-Z0-9]/.test(char) ? char : `_u${code.toString(36)}_`;
    }).join("");
};

export const urlCustomDecode = (str) => {
    if (typeof str !== 'string') return "";

    return str.replace(/_u([0-9a-z]+)_/g, (_, encoded) => {
        const code = parseInt(encoded, 36);
        return isNaN(code) ? "" : String.fromCharCode(code);
    });
};

export const getFundingAmount = (amount) => {
    if (amount == null || amount === '' || isNaN(parseFloat(amount))) {
        return amount;
    }

    let num = parseFloat(String(amount).replace(/[^\d.-]/g, ''));

    if (num >= 1000000000) {
        return '$ ' + (num / 1000000000).toFixed(2).replace(/\.?0*$/, '') + 'B';
    } else if (num >= 1000000) {
        return '$ ' + (num / 1000000).toFixed(2).replace(/\.?0*$/, '') + 'M';
    } else if (num >= 1000) {
        return '$ ' + Math.round(num / 1000) + 'K';
    } else {
        return '$ ' + Math.round(num).toString();
    }
};

export const getUrlOrigin = (currentUrl) => {
    try {
        const url = new URL(currentUrl);
        return url.origin;
    } catch (err) {
        return "javascript:void(0)";
    }
};


export const checkIfFilePasswordProtected = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const byteArray = new Uint8Array(arrayBuffer);

            if (file.type === 'application/pdf') {
                // Check if it's a PDF file and for /Encrypt keyword
                const header = new TextDecoder().decode(byteArray.slice(0, 4));
                if (header !== "%PDF") {
                    reject(new Error("Not a valid PDF file."));
                } else {
                    const fileContent = new TextDecoder().decode(byteArray);
                    if (fileContent.includes("/Encrypt")) {
                        reject(new Error("It seems the uploaded file is password-protected, kindly upload it without a password."));
                    } else {
                        resolve("This PDF file is not password-protected.");
                    }
                }
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                // DOCX files are ZIP files with specific parts. Let's detect password protection in a basic way.
                if (byteArray[0] === 0x50 && byteArray[1] === 0x4B) {  // "PK" header for ZIP (DOCX is a ZIP format)
                    const fileContent = new TextDecoder().decode(byteArray);
                    if (fileContent.includes("encryptedPackage")) {
                        reject(new Error("It seems the uploaded file is password-protected, kindly upload it without a password."));
                    } else {
                        resolve("It seems the uploaded file is password-protected, kindly upload it without a password.");
                    }
                } else {
                    reject(new Error("Not a valid DOCX file."));
                }
            }
        };

        reader.onerror = () => reject(new Error("Failed to read the file."));

        reader.readAsArrayBuffer(file);
    });
};

export const isValidDate = (val) => {
    if (!val) return false;
    try {
        let date = new Date(val);
        return !isNaN(date.getTime());
    } catch (err) {
        return false;
    }
}

export const filterUsedKeys = (data) => {
    const filteredKeys = Object.keys(data).filter(key =>
        key && key !== "source" && data[key] && Object.keys(data[key])?.length > 0
    );

    // Convert to comma-separated string
    const result = filteredKeys.join(',');

    return result
}

export const getPlaceholderLWD = () => {
    const today = new Date();
    const monthOffset = today.getDate() > 20 ? 1 : 0;
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 20);

    return targetDate.toLocaleDateString('en-GB'); // dd/MM/yyyy format
}
export const formattedCTC = (ctc) => {
    return ctc ? Math.round(ctc / 100000 * 100) / 100 : ""
}

export function formattedINRJobBudget(budget) {
    if (!/INR/i.test(budget) || !/year/i.test(budget)) return budget;

    const formatNum = (n) => {
        const value = parseInt(n.replace(/,/g, ''), 10) / 100000;
        return parseFloat(value.toFixed(2)).toString(); // Trim trailing zeros
    };

    // Handle "Upto INR X / year"
    const uptoMatch = budget.match(/Upto\s+INR\s+([\d,]+)\s*\/\s*year/i);
    if (uptoMatch) {
        const max = formatNum(uptoMatch[1]);
        return `Upto INR ${max} Lacs per annum`;
    }

    // Handle "X-Y INR/Year" or "INR X-Y/Year"
    const rangeMatch = budget.match(/INR\s*(\d{1,3}(?:,\d{2,3})+)\s*-\s*(\d{1,3}(?:,\d{2,3})+)\s*\/?\s*Year/i);
    if (rangeMatch) {
        const min = formatNum(rangeMatch[1]);
        const max = formatNum(rangeMatch[2]);
        return `INR ${min}-${max} Lacs per annum`;
    }

    // Handle single value "INR X/Year" or "X INR/Year"
    const singleMatch = budget.match(/INR\s*([\d,]+)\s*\/?\s*Year/i);
    if (singleMatch) {
        const value = formatNum(singleMatch[1]);
        return `INR ${value} Lacs per annum`;
    }

    return budget;
}

export const groupOptionsByCategory = (items) => {
    const categoryMap = new Map();

    items.forEach(({ category, label, value }) => {
        if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
        }
        categoryMap.get(category).push({ label, value });
    });

    return Array.from(categoryMap.entries()).map(([label, options]) => ({
        label,
        options,
    }));
};
export const getApplyButtonText = (aggregator_application_link, aggregator) => {
    if (aggregator == 44 && aggregator_application_link.includes("linkedin.com")) {
        return "Apply On LinkedIn";
    }
    return "Apply";
}

export const groupOptionsByCategoryFilters = (items) => {
    if (!Array.isArray(items)) {
        return [];
    }
    const categoryMap = new Map();
    items.forEach(({ category, label, value, ...rest }) => {
        if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
        }
        categoryMap.get(category).push({ label, value, ...rest });
    });
    return Array.from(categoryMap.entries()).map(([label, options]) => ({
        label,
        options,
    }));
};

export const formattedJobCount = (count) => {
    if (count > 1000) return `${Math.floor(count / 1000)}K+`;
    if (count > 100) return `${Math.floor(count / 100) * 100}+`;
    return `${count}`;
}

// Check if all values in an object are empty or zero
export const isAllEmpty = (obj, skipKeys = []) => {
    return Object.keys(obj).every(key => !obj[key] || obj[key] === "0" || skipKeys.includes(key));
}

export const formatCTCBreakdownLPA = ({ ctc_type, fixed, variable, stock, vested_across } = {}) => {
    const convert = (val) => {
        if (!val || val === "" || val === null || val === undefined) return "";
        if (val === "0" || parseFloat(val) === 0) return "0";
        return (parseFloat(val) / 100000).toFixed(2);
    };
    const convertYears = (val) => {
        if (!val || val === "" || val === null || val === undefined) return "";
        if (val === "0" || parseFloat(val) === 0) return "0";
        return val.toString();
    };
    return {
        ctc_type: ctc_type,
        fixed: convert(fixed),
        variable: convert(variable),
        stock: convert(stock),
        vested_across: convertYears(vested_across)
    };
}

export const formatCTCBreakdown = ({ ctc_type, fixed, variable, stock, vested_across } = {}) => {
    const convert = val => {
        if (!val || val === "0") return 0;
        return Math.round(val * 100000);
    };
    const convertYears = val => {
        if (!val || val === "0") return 0;
        return val;
    };

    return {
        ctc_breakdown: true,
        ctc_type: ctc_type || 1,
        fixed: convert(fixed) || "0",
        variable: convert(variable) || "0",
        stock: convert(stock) || "0",
        vested_across: convertYears(vested_across) || "0"
    };
}


export const getResumeScoreClass = (score) => {
    if (score >= 85) return 'green';
    if (score >= 70) return 'red';
    if (score >= 50) return 'red';
    return 'red';
}

export const hasKeyWithSubstring = (substring) => {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(substring)) {
            return true;
        }
    }
    return false;
}


export const shorthandTimeText = (text) => {
    return text.replace('less than a minute ago', '1m ago')
        .replace('about ', '')             // Remove 'about ' prefix (e.g., "about 1 hour ago")
        .replace('almost', '')
        .replace(' minutes ago', 'm ago')  // Replace full words with shorthand: // Converts "13 minutes ago" -> "13m ago"
        .replace(' minute ago', 'm ago')   // Converts "1 minute ago" -> "1m ago"
        .replace(' hours ago', 'h ago')    // Converts "9 hours ago" -> "9h ago"
        .replace(' hour ago', 'h ago')     // Converts "1 hour ago" -> "1h ago"
        .replace(' days ago', 'd ago')     // Converts "3 days ago" -> "3d ago")
        .replace(' day ago', 'd ago');
    ;
}

export const checkDirectPayUser = (user) => {
    return false
    return user?.t_id % 2 === 0;
}


export const getPromoTextJobFunction = (jobFunction, isEvenUser = false) => {
    if (isEvenUser) {
        switch (jobFunction) {
            case 'Backend Development':
                return {
                    title: 'Backend roles close fast, refine your resume before recruiters move on.',
                }
            case 'Frontend Development':
                return {
                    title: 'Frontend roles fill quickly, polish your resume before others get noticed.',
                }
            case 'Full Stack Development':
                return {
                    title: 'Full Stack roles go fast, strengthen your resume before recruiters move on.',
                }
            case 'Mobile Development':
                return {
                    title: 'Mobile roles fill fast, upgrade your resume before others take the lead.',
                }
            case 'QA / SDET / Test Engineering':
                return {
                    title: 'QA roles close quickly, refine your resume before recruiters move ahead.',
                }
            case 'Devops / MLOps':
                return {
                    title: 'DevOps roles move fast, make sure your resume stands out before others do.',
                }
            case 'DevSecOps':
                return {
                    title: 'DevSecOps roles close fast, strengthen your resume before recruiters move on.',
                }
            case 'Big Data / ETL / Data Engineer':
                return {
                    title: 'Data roles close fast, strengthen your resume before recruiters move on.',
                }
            case 'Data Analytics':
                return {
                    title: 'Analytics roles fill quickly, refine your resume before others get the call.',
                }
            case 'Data Science':
                return {
                    title: 'Data Science roles move fast, refine your resume before others get the call.',
                }
            case 'ML Engineer':
                return {
                    title: 'ML roles close quickly, make your resume stand out before recruiters move on.',
                }
            case 'AI Engineer':
                return {
                    title: 'AI roles fill fast, enhance your resume before opportunities slip away.',
                }
            case 'Cloud Engineering':
                return {
                    title: 'Cloud roles close quickly, strengthen your resume before recruiters move on.',
                }
            default:
                return {
                    title: 'Make sure your resume is ready to impress.',
                }
        }

    }
    switch (jobFunction) {
        case 'Backend Development':
            return {
                title: 'Backend roles close fast, refine your resume before recruiters move on.',
                text: 'Show how your code scales systems and boosts performance to land more interviews.'
            }
        case 'Frontend Development':
            return {
                title: 'Frontend roles fill quickly, polish your resume before others get noticed.',
                text: 'Make yours stand out to get more interview calls.'
            }
        case 'Full Stack Development':
            return {
                title: 'Full Stack roles go fast, strengthen your resume before recruiters move on.',
                text: 'Ensure your resume reflects delivery impact to increase your interview chances.'
            }
        case 'Mobile Development':
            return {
                title: 'Mobile roles fill fast, upgrade your resume before others take the lead.',
                text: 'Show how your work drives downloads and retention to get noticed faster.'
            }
        case 'QA / SDET / Test Engineering':
            return {
                title: 'QA roles close quickly, refine your resume before recruiters move ahead.',
                text: 'Highlight your role in defect reduction to secure more interview opportunities.'
            }
        case 'Devops / MLOps':
            return {
                title: 'DevOps roles move fast, make sure your resume stands out before others do.',
                text: 'Show your impact on uptime and automation to boost your interview chances.'
            }
        case 'DevSecOps':
            return {
                title: 'DevSecOps roles close fast, strengthen your resume before recruiters move on.',
                text: 'Prove how you strengthened systems to attract more interview calls.'
            }
        case 'Big Data / ETL / Data Engineer':
            return {
                title: 'Data roles close fast, strengthen your resume before recruiters move on.',
                text: 'Show how your pipelines enable better decisions and get more interviews.'
            }
        case 'Data Analytics':
            return {
                title: 'Analytics roles fill quickly, refine your resume before others get the call.',
                text: 'Turn insights into outcomes that help you land more interviews.'
            }
        case 'Data Science':
            return {
                title: 'Data Science roles move fast, refine your resume before others get the call.',
                text: 'Show real-world impact to stand out and get more interviews.'
            }
        case 'ML Engineer':
            return {
                title: 'ML roles close quickly, make your resume stand out before recruiters move on.',
                text: 'Highlight deployed models and results to earn more interview calls.'
            }
        case 'AI Engineer':
            return {
                title: 'AI roles fill fast, enhance your resume before opportunities slip away.',
                text: 'Show measurable innovation in your projects to get interview invites sooner.'
            }
        case 'Cloud Engineering':
            return {
                title: 'Cloud roles close quickly, strengthen your resume before recruiters move on.',
                text: 'Show those wins to improve your interview success rate.'
            }
        default:
            return {
                title: 'Make sure your resume is ready to impress.',
                text: 'Quick, free, 2-min check.'
            }
    }
}

export const getJobFunctionBasedRole = (jobFunction) => {
    switch (jobFunction) {
        case 'Backend Development':
            return 'Backend';
        case 'Frontend Development':
            return 'Frontend';
        case 'Full Stack Development':
            return 'Full Stack';
        case 'Mobile Development':
            return 'Mobile';
        case 'QA / SDET / Test Engineering':
            return 'QA';
        case 'Devops / MLOps':
            return 'DevOps';
        case 'DevSecOps':
            return 'DevSecOps';
        case 'Big Data / ETL / Data Engineer':
            return 'Data Engineering';
        case 'Data Analytics':
            return 'Analytics';
        case 'Data Science':
            return 'Data Science';
        case 'ML Engineer':
            return 'ML';
        case 'AI Engineer':
            return 'AI';
        case 'Cloud Engineering':
            return 'Cloud';
        default:
            return jobFunction;
    }
}

export const getJobFunctionBasedModalContent = (jobFunction) => {
    switch (jobFunction) {
        case 'Backend Development':
            return {
                title: 'Backend roles are getting shortlisted fast — make sure your resume proves your impact.',
                text: 'Backend recruiters notice performance, scalability, and delivery results.',
            };
        case 'Frontend Development':
            return {
                title: 'Frontend shortlists are filling fast — ensure your resume highlights creativity and results.',
                text: 'Recruiters love portfolios that show real user impact.',
            };
        case 'Full Stack Development':
            return {
                title: 'Full Stack roles move quickly — make sure your resume shows full project ownership.',
                text: 'Prove your end-to-end impact before shortlists close.',
            };
        case 'Mobile Development':
            return {
                title: 'Mobile openings get filled fast — ensure your resume stands out this week.',
                text: 'Show your role in performance, ratings, and app growth.',
            };
        case 'QA / SDET / Test Engineering':
            return {
                title: 'QA shortlists are closing soon — don’t let a weak resume cost you interviews.',
                text: 'Highlight your testing precision and release impact.',
            };
        case 'Devops / MLOps':
            return {
                title: 'DevOps roles are hot this week — make sure your resume showcases automation wins.',
                text: 'Show how you improved uptime, CI/CD, and delivery efficiency.',
            };
        case 'DevSecOps':
            return {
                title: 'DevSecOps shortlists move fast — prove your security impact before applying.',
                text: 'Show measurable improvements in compliance and infrastructure safety.',
            };
        case 'Big Data / ETL / Data Engineer':
            return {
                title: 'Data Engineering roles fill quickly — make sure your resume scales like your pipelines.',
                text: 'Recruiters value efficiency, reliability, and data impact.',
            };
        case 'Data Analytics':
            return {
                title: 'Analytics shortlists are updating now — make sure your insights stand out.',
                text: 'Recruiters love measurable business outcomes.',
            };
        case 'Data Science':
            return {
                title: 'Data Science openings close fast — ensure your resume highlights model impact.',
                text: 'Show how your work drives real business value.',
            };
        case 'ML Engineer':
            return {
                title: 'ML Engineering roles are moving fast — make sure your resume reflects production success.',
                text: 'Highlight deployed models and measurable performance gains.',
            };
        case 'AI Engineer':
            return {
                title: 'AI shortlists are filling up — don’t miss out on top recruiter picks.',
                text: 'Show innovation and measurable model results.',
            };
        case 'Cloud Engineering':
            return {
                title: 'Cloud roles are closing soon — make sure your resume shows real scalability wins.',
                text: 'Recruiters notice cost efficiency and reliability impact.',
            };
        default:
            return {
                title: 'Make sure your resume is ready to impress. Quick, free, 2-min check.',
                text: 'A stronger resume = better chances of a callback.',
            };
    }
}
export const getHealthcheckMajorWeekness = (report_details) => {
    const sectionLabels = {
        "ats_parse_rate": "ATS Parse Rate",
        "quantify_impact": "Quantify Impact",
        "skill_experience_mapping": "Skills to Experience Support",
        "repetition": "Repetition",
        "resume_length": "Resume Length",
        "spelling_grammar": "Spelling & Grammar",
        "file_format": "File Format & Size",
        "long_bullet_points": "Long Bullet Points",
        "contact_information": "Contact Information",
        "essential_sections": "Essential Sections",
        "active_voice": "Active Voice",
        "buzzwords_cliches": "Buzzwords & Cliches"
    }
    let newImmediateActions = [];
    newImmediateActions = Object.keys(report_details?.sections || {})?.flatMap((key) => {
        return Object.entries(report_details?.sections[key])
            .filter(([_, val]) => typeof val === 'object' && val?.check == false)
            .map(([key, val]) => {
                if (key == 'resume_length') return;
                return { section: sectionLabels[key], message: val.message, key: key };
            });
    }).filter(Boolean);
    let missingContactInfo = [];
    Object.entries(report_details?.sections?.mandatory_sections?.contact_information || {}).forEach(item => {
        if (item && item[0] != 'github' && !item[1].check && typeof item[1] === 'object') {
            const fieldName = item[0] === 'linkedin' ? 'LinkedIn' : item[0].charAt(0).toUpperCase() + item[0].slice(1);
            missingContactInfo.push(fieldName);
        }
    });
    if (missingContactInfo.length > 0) {
        newImmediateActions.push({ section: 'Contact Information', key: 'contact_information', message: missingContactInfo.join(', ') + ` ${missingContactInfo.length > 1 ? 'are' : 'is'} missing.` });
    }

    let missingEssentialSections = [];
    Object.entries(report_details?.sections?.mandatory_sections?.essential_sections || {}).forEach(item => {
        if (item && !item[1].check && typeof item[1] === 'object') {
            missingEssentialSections.push(item[0].charAt(0).toUpperCase() + item[0].slice(1));
        }
    });
    if (missingEssentialSections.length > 0) {
        newImmediateActions.push({ section: 'Essential Sections', key: 'essential_sections', message: missingEssentialSections.join(', ') + ` ${missingEssentialSections.length > 1 ? 'sections are' : 'section is'} missing.` });
    }
    return newImmediateActions;
}
export const formatTailorPlanValidity = (plan_end_date) => {
    const hours = differenceInHours(new Date(plan_end_date), new Date());
    let days = Math.floor(hours / 24);
    let remainingHours = hours % 24;
    if (days == 0) {
        if (remainingHours == 0) {
            let minutes = differenceInMinutes(new Date(plan_end_date), new Date());
            return `${minutes}m`;
        }
        return `${remainingHours}h`;
    }
    return `${days}d ${remainingHours}h`;
}
export const getHealthcheckHeading = (resume_score) => {
    if (resume_score < 50) {
        return 'Resume at Risk - Lots of room to grow 🚀';
    }
    else if (resume_score >= 50 && resume_score < 70) {
        return "Below Average – Fix Recommended 🎯";
    }
    else if (resume_score >= 70 && resume_score < 85) {
        return "You’re halfway there — let’s hit the shortlist zone 🎯";
    }
    else { // 85+
        return "Top Performer — Let’s push it to the top 🔥";
    }
}
export const getHealthcheckSubHeading = (resume_score) => {
    if (resume_score < 50) {
        return "Your resume will likely fail ATS parsing and has zero shortlist chance with recruiters.";
    }
    else if (resume_score >= 50 && resume_score < 70) {
        return "Your resume may parse in ATS, but you wont possibly get calls from recruiters.";
    }
    else if (resume_score >= 70 && resume_score < 85) {
        return "Your resume may pass ATS, but in recruiter comparisons, stronger resume will be shortlisted ahead of you.";
    }
    else { // 85+
        return "Your resume is ATS-optimized and recruiter-friendly. It will parse correctly, surface in searches, and stand strong against competition.";

    }
}

export const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    const isMobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTabletAgent = /Tablet|iPad|iPod/i.test(userAgent);
    return isMobileAgent ? 'mobile' : isTabletAgent ? 'tablet' : 'desktop';
}

/** Referral-agent batch API / analytics — literal strings expected server-side: Mobile | Desktop */
export const getClientDeviceMobileOrDesktop = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return 'Desktop';
    }
    try {
        if (window.matchMedia('(max-width: 768px)').matches) return 'Mobile';
        if (window.matchMedia('(pointer: coarse)').matches) return 'Mobile';
    } catch {
        /* ignore */
    }
    const t = getDeviceType();
    if (t === 'mobile' || t === 'tablet') return 'Mobile';
    return 'Desktop';
};

export const isIOS = () => {
    let ua = navigator.userAgent;
    return /iPhone|iPad|iPod/i.test(ua);
}



export const getUserDetailsLS = () => {
    return JSON.parse(localStorage.getItem('user') || '{}');
}

export function getResumeVerdict(score) {
    if (score >= 85) return { tone: 'green', label: 'Interview Ready' };
    if (score >= 70) return { tone: 'yellow', label: 'Average — may get overlooked' };
    if (score >= 50) return { tone: 'orange', label: 'Needs improvement' };
    return { tone: 'red', label: 'Needs serious improvement' };
}

export const TALENT_BETA_USERS = [
    "bhuvan.desai@gmail.com",
    "mohitkumar.m@uplers.in",
    "john.george28746237@gmail.com",
    "sandeepuplers@gmail.com",
    "uplersuplers@yopmail.com",
    "ishika03278412@gmail.com",
    "soumya.s@uplers.in",
    "nivedithaqatesting@gmail.com",
    "gurinderpal@uplers.com",
    "djsathwara@gmail.com",
    "admin@uplers.com"
]
export const REFERRAL_TEST_USERS = [
    "referfriendtest1@yopmail.com",
    "referfriendtest2@yopmail.com",
    "referfriendtest3@yopmail.com",
    "referfriendtest4@yopmail.com",
    "referfriendtest5@yopmail.com",
    "referfriendtest6@yopmail.com",
    "referfriendtest7@yopmail.com",
    "referfriendtest8@yopmail.com",
    "referfriendtest9@yopmail.com",
    "referfriendtest10@yopmail.com"
];


export const isReferralTestUser = (userEmail) => {
    return TALENT_BETA_USERS.includes(userEmail) || REFERRAL_TEST_USERS.includes(userEmail) || process.env.NEXT_PUBLIC_APP_ENV === 'local';
}

const copyTextFallback = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
        return document.execCommand('copy');
    } finally {
        document.body.removeChild(ta);
    }
};

export const copyLinkToClipboard = (link, { silent = false } = {}) => {
    if (!link) return;
    const onOk = () => {
        if (!silent) toast.success('Link copied to clipboard.');
    };
    const onFail = () => toast.error('Could not copy link.');
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        navigator.clipboard.writeText(link).then(onOk).catch(() => (copyTextFallback(link) ? onOk() : onFail()));
    } else if (copyTextFallback(link)) {
        onOk();
    } else {
        onFail();
    }
};