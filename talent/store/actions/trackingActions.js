'use client';

import { API_URL } from "../../components/Constant";
import { getDeviceType, POST_API } from "../../components/Helper";
import { SET_LOADER } from "./actionsTypes";

// mixpanel track backend
const API_MIXPANEL_TRACKING = API_URL + "talent/mixpanel-tracking";

export const mixpanelBackendTracking = (eventName, reqObj) => {
    let payload = {
        event: eventName,
        data: {
            screen_width: window.innerWidth,
            ...reqObj
        }
    }
    return new Promise((resolve, reject) => {
        resolve({ status: 200, data: { message: 'Tracking successful' } });
    })
    // return new Promise((resolve, reject) => {
    //     POST_API(API_MIXPANEL_TRACKING, payload)
    //         .then((res) => {
    //             resolve(res);
    //         }).catch((err) => {
    //             reject(err)
    //         })
    // })
}

// Event Tracking Actions ###########################################

export const trackReminderClicked = (reqObj) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        mixpanelBackendTracking('promo_reminder_clicked', reqObj)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const trackResumeLandingPageVisit = (fromPage = 'navbar') => {
    return mixpanelBackendTracking('resume_pilot_visited', { from_where: fromPage })
}

export const trackResumeHealthReportVisit = (fromWhere = 'landing_page') => {
    return mixpanelBackendTracking('resume_report_visited', { from_where: fromWhere })
}

export const trackTransformResumeClick = (reqObj) => {
    return mixpanelBackendTracking('transform_resume_click', reqObj)
}

export const trackTailorPricePopupOpen = (fromWhere) => {
    return mixpanelBackendTracking('tailor_price_popup_open', {
        from_where: fromWhere,
        device_type: getDeviceType()
    })
}

export const trackExternalJDPopupOpen = (fromWhere) => {
    return mixpanelBackendTracking('external_jd_tailor_popup_open', {
        from_where: fromWhere,
        device_type: getDeviceType()
    })
}

export const trackTailorPaymentSuccess = (reqObj) => {
    return mixpanelBackendTracking('tailor_payment_success', {
        ...reqObj,
        device_type: getDeviceType()
    })
}

export const trackTailorResumeGenerated = () => {
    return mixpanelBackendTracking('tailor_resume_generated', {
        device_type: getDeviceType()
    })
}

export const trackResumeMatchedWithJD = (reqObj = {}) => {
    return mixpanelBackendTracking('resume_matched_with_jd', {
        ...reqObj,
        device_type: getDeviceType(),
    })
}

export const trackTailorPromoteAggModalOpen = (reqObj) => {
    return mixpanelBackendTracking('tailor_promote_agg_modal_open', reqObj)
}
export const trackTailorPromoteAggModalClicked = (reqObj) => {
    return mixpanelBackendTracking('tailor_promote_agg_modal_clicked', reqObj)
}

export const trackGenerateTailoredResumeError = (reqObj) => {
    return mixpanelBackendTracking('generate_tailored_resume_error', reqObj)
}

export const trackDownloadTailorExtensionClicked = (fromWhere) => {
    return mixpanelBackendTracking('download_tailor_extension_clicked', {
        from_where: fromWhere,
    })
}

export const trackResumeSelectionGuideInteracted = () => {
    return mixpanelBackendTracking('resume_selection_guide_interacted')
}