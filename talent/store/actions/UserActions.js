'use client';

import Cookies from 'js-cookie';

import {
    API_FEEDBACK, API_JOINUS, API_LOGIN, API_LOGOUT, API_ME, API_OTPSEND, API_OTPVERIFY, API_PROFILE, API_PROFILEDELETE, API_PROFILELOGIN,
    API_PROFILEPIC, API_REGISTRATION, API_STORE_PASSWORD, API_TRACKLINK, UTC_URL, API_GET_PROFILE_QUESTION, API_ALL_OPP,
    API_OPP_MASTER, API_MY_OPP, API_INTERESTED, API_ACCEPTENCE, API_INTERVIEW, API_INTERVIEW_FEEDBACK, API_OPP_CANCEL, API_SLOT_SELECT,
    API_INDIVIDUAL_MASTER, API_START_HR_ASSESSMENT, API_GET_AWS_FILE, API_ASSESSMENT_RETEST, API_CLIENT_LOGIN,
    API_CLIENT_FORGOT_PASSWORD, API_CLIENT_SET_PASSWORD, API_CLIENT_STORE_PASSWORD, API_SYSTEM_DETAILS,
    API_SINGLE_OPP, API_BOOKMARK_OPP, API_EMAIL_PREFERENCE, API_EMAIL_PREFERENCE_UPDATE, API_TALENT_VIDEO_RESUME,
    API_TALENT_TID_VIDEO_RESUME, API_ASSESSMENT_SKILLS_RECOMMEND, API_MATCH_PERCENT, API_RESUME_PARSER_FEEDBACK, API_RECOMMENDED_DATA, API_PREFERENCE,
    API_ASSESSMENT_SKILLS, API_ASSESSMENT_V2, API_ASSESSMENT_START, API_NURTURE_PREFERENCE, API_OTP_VALITDITY_CHECK, API_HRCOMPANY_VIDEO_COUNTER,
    API_PUBLIC_SINGLE_OPP, API_HRCOMPANY_VIDEO_COUNTER_PUBLIC, API_ALL_FEATURED_OPP, API_PASSWORD_OTP_VALIDATE, API_TALENT_DEACTIVATE,
    API_TALENT_REACTIVATE, API_TALENT_EMAIL_PREFERENCE, API_REGISTRATION_LOGS, API_TALENT_DELETE, API_TRACK_TALENT_PACKET, API_VERIFY_CONTACT, API_TRACK_TALENT_PAGES,
    API_UNLOCK_PROFILE, API_TALENT_PROFILE_UPSERT, API_GENERATE_AWS_UPLOAD_URL, API_TEST_REDIRECT_LINK, API_TP_FEEDBACK_SAVE,
    API_TOUCHPOINT_QUES,
    API_TOUCHPOINT_ANS_V2,
    API_COMPANY_DETAILS,
    API_COMPANY_SALARY_DATA,
    API_RESUME_YOE,
    API_FETCH_VIDEO_RESUME,
    API_STORE_VIDEO_RESUME,
    API_VISIBILITY_TOGGLE,
    API_EB_NOTIFY,
    API_TALENT_LOCATION_MASTER,
    API_APPLY_VIDEO_RESUME,
    API_GET_APPLY_STATUS,
    API_DUPLICATE_TALENT_CHECK,
    API_TALENT_PREFERENCES,
    API_SSO_LOGIN_ACCESS,
    API_SEND_EMAIL_AUTOFILL_EXT,
    API_SEND_EMAIL_JOB_LINK,
    API_GET_TALENT_PROFILE,
    API_STORE_EXT_INSTALLED,
    API_UPDATE_TALENT_PROFILE,
    API_ASSOCIATE_TALENT_AGR_JOB,
    API_STORE_APPLY_AGR_JOB,
    API_TOUCHPOINT_SAVE_CUSTOM_QUES,
    API_TOUCHPOINT_DONE_HR,
    API_SIMILAR_JOB,
    API_OPP_ROLE_MASTER,
    API_OPP_SKILL_MASTER,
    API_OPP_LOCATION_MASTER,
    API_TALENT_DOWNLOAD_RESUME_PROFILE,
    API_OPP_READY_FILTERS,
    API_JOB_NOT_INTERESTED,
    API_OPP_COMPANY_MASTER,
    API_UPLOAD_RESUME_REVIEW,
    API_RESUME_HEALTH_CHECK,
    API_RESUME_HEALTH_CHECK_DOWNLOAD,
    API_CREATE_ORDER_RAZORPAY,
    API_CAPTURE_ORDER_RAZORPAY,
    API_JOB_FUNCTION_MASTER,
    API_TALENT_UPDATE_PASSWORD,
    API_RESUME_TRANSFORM_DOWNLOAD,
    API_UPDATE_TRANSFORMED_RESUME_IN_PROFILE,
    API_SNOOZE_EMAIL,
    API_SNOOZE_EMAIL_UPDATE,
    API_ACCOUNT_STATUS, API_LINKEDIN_CONNECT, API_LINKEDIN_VERIFY, API_LINKEDIN_DISCONNECT, API_GMAIL_VERIFY, API_GMAIL_DISCONNECT, API_OUTREACH_AGENT, API_AUTO_RUN_REQUEST, API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH, API_ACCOUNT_ANALYTICS,
    API_RESUME_DASHBOARD,
    API_RESUME_PREVIEW,
    API_VIEW_HEALTH_REPORT,
    API_RESUME_HEALTH_CHECK_CREATE_ORDER,
    API_RESUME_HEALTH_CHECK_CAPTURE_ORDER,
    API_RESUME_HEALTH_CHECK_REFUND_REQUEST,
    API_SURVEY_POLL,
    API_CAREER_COACH_PROFILE,
    API_CAREER_COACH_GUEST_USER,
    API_CAREER_COACH_RECENT_CHATS,
    API_CAREER_COACH_CHAT_MESSAGES,
    API_CAREER_COACH_UPLOAD_RESUME,
    API_CAREER_COACH_GET_RESUME,
    API_RESUME_HEALTH_CHECK_SUPPORT,
    API_CAREER_COACH_FEEDBACK,
    API_JOBS_SPOT_CHECK_USER,
    API_JOBS_SPOT_CREATE_JOB_ALERT,
    API_SIGNUP_RESUME_HEALTH,
    API_SIGNUP_REFERRAL_AGENT,
    API_PREFERRED_COMPANIES,
    API_SAVE_PREFERRED_COMPANIES,
    API_PREFERRED_COMPANIES_LIST,
    API_STORE_OUTREACH_TEMPLATE,
    API_EDIT_OUTREACH_TEMPLATE,
    API_DELETE_OUTREACH_TEMPLATE,
    API_GET_OUTREACH_TEMPLATES,
    API_GET_OUTREACH_STEP,
    API_GET_OUTREACH_DASHBOARD_DATA,
    API_GET_RECOMMENDED_JOBS,
    API_STORE_RECOMMENDED_JOBS,
    API_COMPANY_SALARY_FEEDBACK,
    API_OUTREACH_SUPPORT,
    API_RESUME_HEALTH_CHECK_NEW,
    API_TAILOR_RESUME_REFUND_REQUEST,
    API_TAILOR_RESUME_SUPPORT,
    API_TAILOR_RESUME_FEEDBACK,
    API_TAILOR_RESUME_PREVIEW,
    API_SIGNUP_TALENT,
    API_UPDATE_JOB_SEARCH_PREFERENCE,
    API_OUTREACH_MARK_REPLY_SEEN,
} from '../../components/Constant';

import { formatErrors, GET_API, POST_API, getDomain, checkEvenUser } from '../../components/Helper';
import {
    REMOVE_BULK_ERRORS, REMOVE_ERRORS, REMOVE_NESTED_LOCK, REMOVE_PROFILE_STATE, REMOVE_SINGLE_LOCK, SET_BULK_ERRORS, SET_CURRENT_USER,
    SET_ERRORS, SET_FORM_ERRORS, SET_LOADER, SET_OPP_MASTER, SET_PROFILE_DATA, SET_PROFILE_PERCENT, SET_PROFILE_REM_PERCENT, SET_SUCCESS, SET_TNC_MODAL, UPDATE_CURRENT_USER,
    SET_VIDEO_RESUME,
    UPDATE_PROFILE_DATA,
    SET_ME_LOADER,
    ALL_OPP_MASTER_VALUE,
    SET_OPP_READY_FILTERS,
    SET_LOGGED_OUT,
    HR_UPDATE_NEEDED,
    SET_TALENT_PREFERENCES,
    SET_JOB_FUNCTION_MASTER,
    SET_RESUME_HEALTH_CONTROL,
    SET_RESUME_DASHBOARD,
    SET_ACTIVE_TRANSFORMATION,
    SET_OPENAI_DOWN_MODAL,
    SET_OUTREACH_DATA,
    SET_RESUME_HEALTH_REPORTS,
    UPDATE_TRANSFORM_DONE_VIEWED,
    UPDATE_HEALTH_REPORT_TRANSFORM_VIEWED,
    UPDATE_RESUME_DASHBOARD_TRANSFORM_VIEWED,
    HAPPPY_AGENT_SET_LOADING,
    HAPPPY_AGENT_SET,
    HAPPPY_AGENT_FAILED,
    HAPPPY_AGENT_RESET,
    HAPPPY_AGENT_DAILY_LIMIT_SET,
} from './actionsTypes';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import {
    countFromAutoRunResponse,
    countFromReferralLinksBatchResponse,
    HAPPPY_AGENT_DASHBOARD_CACHE_KEY,
    HAPPPY_AGENT_DAILY_RUN_RECORDED_EVENT,
} from '../../helpers/happpyAgentDailyLimit';
import { resumeHealthReportViewedTracking, resumeTemplateSelectedTracking, setRegisterId, trackAllCtaClickV2, updateMixpanelUserDetails } from '../../helpers/Mixpanel';
import toast from 'react-hot-toast';
import axios from 'axios';


// export const talentLogin = (userInfo) => async (dispatch) => {
//     dispatch({ type: SET_LOADER, payload: true })
//     return new Promise((resolve, reject) => {
//         POST_API(API_CLIENT_LOGIN, userInfo)
//             .then((res) => {
//                 if (res.data.status === 200) {
//                     Cookies.set('talent', res.data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
//                     localStorage.setItem('token', res.data.authtoken)
//                     localStorage.setItem('user', JSON.stringify(res.data.data))
//                     localStorage.setItem('warning', true)
//                     dispatch(setCurrentUser({
//                         ...res.data.data,
//                         snooze_modal_vis: res.data.snooze_modal_vis,
//                         snooze: res.data.snooze,
//                     }));
//                     resolve(res.data.data)
//                 }
//                 else {
//                     if (res?.data?.message) {
//                         dispatch({
//                             type: SET_FORM_ERRORS,
//                             payload: res.data?.message
//                         });
//                     }
//                     reject(res.data?.message)
//                 }
//             })
//             .finally(() => dispatch({ type: SET_LOADER, payload: false }))
//     })
// }

export const talentOtpValidityCheck = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_OTP_VALITDITY_CHECK, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    resolve(res.data)
                }
                else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message)
                }
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const forgotPassword = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CLIENT_FORGOT_PASSWORD, payload)
            .then((res) => {
                if (res.data?.status === 200) {
                    resolve(res.data);
                }
                else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message)
                }
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const setAtsPassword = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CLIENT_SET_PASSWORD, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    resolve(res.data);
                }
                else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message)
                }
            })
            .catch(err => reject(err))
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const storePassword = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CLIENT_STORE_PASSWORD, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    Cookies.set('talent', res.data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
                    localStorage.setItem('token', res.data.authtoken)
                    localStorage.setItem('user', JSON.stringify(res.data.data))
                    localStorage.setItem('warning', true)
                    dispatch(setCurrentUser(res.data.data));
                    resolve(res.data.data)
                }
                else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message)
                }
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const updatePassword = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TALENT_UPDATE_PASSWORD, payload)
            .then((res) => {
                if (res.status === 200) {
                    Cookies.set('talent', res.data.data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
                    localStorage.setItem('token', res.data.data.authtoken)
                    localStorage.setItem('user', JSON.stringify(res.data.data.data))
                    localStorage.setItem('warning', true)
                    dispatch(setCurrentUser(res.data.data.data));
                    resolve(res.data)
                } else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message)
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.message
                    });
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: err.response.data.data
                    });
                    reject(err.response.data)
                } else {
                    reject(err)
                }
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const login = (token, wt) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_LOGIN, { token, wt })
        Cookies.set('talent', data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
        localStorage.setItem('token', data.authtoken)
        localStorage.setItem('user', JSON.stringify(data.data))
        localStorage.setItem('warning', true)
        dispatch(setCurrentUser(data.data));
    } catch (err) {
        removeUser()(dispatch)
        window.location.href = UTC_URL
    }
}

export const talogin = (payload) => async (dispatch) => {
    localStorage.removeItem('token')
    try {
        const { data } = await POST_API(API_PROFILELOGIN, payload)
        localStorage.setItem('token', data.authtoken)
        localStorage.setItem('user', JSON.stringify(data.data))
        dispatch(setCurrentUser(data.data));
    } catch (err) {
        removeUser()(dispatch)
    }
}

export const checkTalentDuplicacy = (reqEmail) => {
    return new Promise((resolve, reject) => {
        GET_API(API_DUPLICATE_TALENT_CHECK + '?email=' + reqEmail)
            .then((res) => resolve(res))
            .catch(err => reject(err))
    })
}
export const joinusTalent = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_JOINUS, payload).then((res) => {
            const { data } = res
            if (data.status == 200) {
                localStorage.setItem('token', data.authtoken)
                localStorage.setItem('user', JSON.stringify(data.data))
                localStorage.setItem('warning', true)
                if (localStorage.getItem('mixpanel_session_id') == null) {
                    localStorage.setItem('mixpanel_session_id', uuidv4())
                }

                // window.dataLayer = window.dataLayer || [];
                // if (typeof gtag === 'undefined') {
                //     window.gtag = function () {
                //         window.dataLayer.push(arguments);
                //     };
                // }
                // const emailRes = data.data.email || "No email";
                // gtag('event', 'user_registered_via_joinus_page', { from_where: "joinus_page", email: emailRes });
                // gtag('event', 'conversion', {
                //     'send_to': 'AW-686823420/-urSCKqRru0YEPyvwMcC',
                //     from_where: "user_registered_via_joinus_page",
                //     email: emailRes
                // });

                dispatch(setCurrentUser(data.data));
                resolve(res);
            } else {
                dispatch({
                    type: SET_FORM_ERRORS,
                    payload: data.errors
                });
                reject(data.errors)
            }
            dispatch({ type: SET_LOADER, payload: false })
        }).catch(err => {
            dispatch({
                type: SET_FORM_ERRORS,
                payload: { 'server-err': "Something went wrong !" }
            });
            dispatch({ type: SET_LOADER, payload: false })
            let reqMap = {
                payload: {},
                response: err
            }
            payload.forEach(function (value, key) {
                reqMap.payload[key] = value;
            });
            regCallback(reqMap)(dispatch);
            reject(err)
        })
    })
}

export const signupResumeHealth = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SIGNUP_RESUME_HEALTH, payload).then((res) => {
            const { data } = res
            if (data.status == 200) {
                Cookies.set('talent', true, { domain: getDomain(), secure: true, sameSite: 'Strict' });
                localStorage.setItem('token', data.authtoken)
                localStorage.setItem('user', JSON.stringify(data.data))
                localStorage.setItem('warning', true)
                if (localStorage.getItem('mixpanel_session_id') == null) {
                    localStorage.setItem('mixpanel_session_id', uuidv4())
                }
                dispatch(setCurrentUser(data.data));
                resolve(res);
            } else {
                dispatch({
                    type: SET_FORM_ERRORS,
                    payload: data.errors
                });
                reject(data.errors)
            }
            dispatch({ type: SET_LOADER, payload: false })
        }).catch(err => {
            dispatch({
                type: SET_FORM_ERRORS,
                payload: { 'server-err': "Something went wrong !" }
            });
            dispatch({ type: SET_LOADER, payload: false })
            let reqMap = {
                payload: {},
                response: err
            }
            payload.forEach(function (value, key) {
                reqMap.payload[key] = value;
            });
            regCallback(reqMap)(dispatch);
            reject(err)
        })
    })
}

export const signupReferralAgent = (payload) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true });
    return new Promise((resolve, reject) => {
        POST_API(API_SIGNUP_REFERRAL_AGENT, payload).then((res) => {
            const { data } = res;
            if (data.status == 200) {
                // Backend returns requires_otp + email when OTP must be verified first; no token until then
                if (!data.requires_otp && data.authtoken) {
                    Cookies.set('talent', true, { domain: getDomain(), secure: true, sameSite: 'Strict' });
                    localStorage.setItem('token', data.authtoken);
                    localStorage.setItem('user', JSON.stringify(data.data));
                    localStorage.setItem('warning', true);
                    if (localStorage.getItem('mixpanel_session_id') == null) {
                        localStorage.setItem('mixpanel_session_id', uuidv4());
                    }
                    dispatch(setCurrentUser(data.data));
                }
                resolve(res);
            } else {
                dispatch({
                    type: SET_FORM_ERRORS,
                    payload: data.errors
                });
                reject(data.errors);
            }
            dispatch({ type: SET_LOADER, payload: false });
        }).catch(err => {
            dispatch({
                type: SET_FORM_ERRORS,
                payload: { 'server-err': "Something went wrong !" }
            });
            dispatch({ type: SET_LOADER, payload: false });
            let reqMap = { payload: {}, response: err };
            payload.forEach(function (value, key) {
                reqMap.payload[key] = value;
            });
            regCallback(reqMap)(dispatch);
            reject(err);
        });
    });
};

export const registration = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_REGISTRATION, payload)
            .then((res) => {
                if (res.data.status == 200) {
                    localStorage.setItem('user', JSON.stringify(res.data.data))
                    // if (localStorage.getItem('mixpanel_session_id') == null) {
                    //     localStorage.setItem('mixpanel_session_id', uuidv4())
                    // }
                    dispatch(setCurrentUser(res.data.data));
                    dispatch({
                        type: REMOVE_ERRORS,
                        payload: payload
                    });
                    getProfilePercent()(dispatch)
                    resolve(res);
                } else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data.errors
                    });
                    reject(res.data.errors)
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                } else {
                    let reqMap = {
                        payload: {},
                        response: err
                    }
                    payload.forEach(function (value, key) {
                        reqMap.payload[key] = value;
                    });
                    regCallback(reqMap)(dispatch);
                }
                reject(err)
            })
    })
}
export const regCallback = (payload) => async (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_REGISTRATION_LOGS, payload)
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                }
            })
    })
}


export const otpVerify = (payload) => async (dispatch) => {

    try {
        const { data } = await POST_API(API_OTPVERIFY, payload)
        if (data.status == 200) {
            localStorage.setItem('user', JSON.stringify(data.data))
            const trackingData = {
                extraParams: {
                    backend_register_id: data.data.talent_enc_id,
                    register_id: setRegisterId(),
                    from_where: "joinus_page"
                }
            }
            trackAllCtaClickV2('otp_verified', trackingData)

            // GTM Event for form submit
            window.dataLayer = window.dataLayer || [];
            // Create gtag function if it doesn't exist (as defined in App.js)
            if (typeof gtag === 'undefined') {
                window.gtag = function () {
                    window.dataLayer.push(arguments);
                };
            }
            const emailRes = data.data.email || "No email";
            gtag('event', 'otp_verified_event', { from_where: "otp_verify_page", email: emailRes });

            //conversion event added for GA4
            gtag('event', 'conversion', {
                'send_to': 'AW-686823420/-urSCKqRru0YEPyvwMcC',
                from_where: "otp_verified_page",
                email: emailRes
            });

            dispatch(setCurrentUser(data.data));
            dispatch({
                type: REMOVE_ERRORS,
                payload: payload
            });
        } else {
            const commaSeparatedValues = Object.values(data.errors).flat().join(', ');
            const trackingData = {
                extraParams: {
                    register_id: setRegisterId(),
                    error_reason: commaSeparatedValues
                }
            }
            trackAllCtaClickV2('otp_verification_failed', trackingData)
            dispatch({
                type: SET_FORM_ERRORS,
                payload: data.errors,
                from_where: "joinus_page"
            });
        }
    } catch (err) {
        removeUser()(dispatch)
    }
}

export const otpReSend = (payload) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_OTPSEND, payload)
        if (data.status == 200) {

        } else {
            dispatch({
                type: SET_FORM_ERRORS,
                payload: data.errors
            });
        }
    } catch (err) {
        removeUser()(dispatch)
    }
}

export const addOverallFeedback = (payload, currentUser, isChallengeSurvey = false) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    try {
        const { data } = await POST_API(API_FEEDBACK, payload)
        if (data.status == "true") {
            if (isChallengeSurvey) {
                localStorage.setItem('user', JSON.stringify({ ...currentUser }))
                dispatch(setCurrentUser({ ...currentUser }));
                toast.success("Thank you for submitting the feedback. We respect your valuable time & support.", { duration: 10000 })
            } else {
                localStorage.setItem('user', JSON.stringify({ ...currentUser, feedback_eligibility: false }))
                dispatch(setCurrentUser({ ...currentUser, feedback_eligibility: false }));
            }
        } else {
            dispatch({
                type: SET_ERRORS,
                payload: data.errors
            });
        }
        dispatch({ type: SET_LOADER, payload: false })
    } catch (e) {
        // if (e.response && e.response.status && e.response.status == 401) {
        //     removeUser();
        // }
        // else{
        dispatch({
            type: SET_ERRORS,
            payload: { commonError: true }
        });
        toast.error("Something went wrong. Please try again later.", { duration: 3000 })
        dispatch({ type: SET_LOADER, payload: false })
        // }
    }
}
export const profileSave = (payload) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_PROFILE, payload)
        if (data.status == 200) {
            localStorage.setItem('user', JSON.stringify(data.userdata))
            dispatch(setCurrentUser(data.userdata));
            dispatch({
                type: REMOVE_SINGLE_LOCK,
                payload: payload
            });
            dispatch({
                type: REMOVE_ERRORS,
                payload: payload
            });
        } else {
            dispatch({
                type: SET_ERRORS,
                payload: data.errors
            });
        }
    } catch (e) {
        if (e.response && e.response.status && e.response.status == 401) {
            removeUser()(dispatch)
        }
        else {
            dispatch({
                type: SET_ERRORS,
                payload: { commonError: true }
            });
        }
    }
}

export const profilePictureSave = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_PROFILEPIC, payload)
            .then((res) => {
                if (res.data.status == 200) {
                    localStorage.setItem('user', JSON.stringify(res.data.userdata))
                    dispatch(setCurrentUser(res.data.userdata));
                    dispatch({
                        type: REMOVE_ERRORS,
                        payload: { "profile_pic": payload }
                    });
                    resolve(res);
                } else {
                    dispatch({
                        type: SET_ERRORS,
                        payload: res.data.errors
                    });
                    reject(res.data.errors)
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                } else {
                    console.log("error in file upload", err);
                    dispatch({
                        type: SET_ERRORS,
                        payload: { commonError: true }
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const profileBulkSave = (payload, section, uuid) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_PROFILE, payload)
        if (data.status == 200) {
            dispatch({
                type: SET_SUCCESS,
                payload: data.data
            });
            dispatch({
                type: REMOVE_NESTED_LOCK,
                payload: { section, uuid }
            });
            dispatch({
                type: REMOVE_BULK_ERRORS,
                payload: { section, uuid }
            });
        } else {
            dispatch({
                type: SET_BULK_ERRORS,
                payload: { errors: data.errors, section, uuid }
            });
        }
    } catch (e) {
        if (e.response && e.response.status && e.response.status == 401) {
            removeUser()(dispatch)
        }
        else {
            dispatch({
                type: SET_ERRORS,
                payload: { commonError: true }
            });
        }
    }
}
export const profileBulkDelete = (payload, section, uuid) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_PROFILEDELETE, payload)
        if (data.status == 200) {
            dispatch({
                type: REMOVE_NESTED_LOCK,
                payload: { section, uuid }
            });
            dispatch({
                type: REMOVE_BULK_ERRORS,
                payload: { section, uuid }
            });
        }
        else {
            dispatch({
                type: SET_BULK_ERRORS,
                payload: { errors: data.errors, section, uuid }
            });
        }
    } catch (e) {
        if (e.response && e.response.status && e.response.status == 401) {
            removeUser()(dispatch)
        } else {
            dispatch({
                type: SET_ERRORS,
                payload: { commonError: true }
            });
        }
    }
}
export const setPassword = (payload) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_STORE_PASSWORD, payload)
        if (data.status == 200) {
            Cookies.set('talent', data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
            localStorage.setItem('token', data.authtoken)
            // localStorage.setItem('mixpanel_session_id', payload.mixpanel_session_id)
            localStorage.setItem('user', JSON.stringify(data.data))
            localStorage.setItem('warning', true)
            dispatch(setCurrentUser(data.data));
        } else {
            dispatch({
                type: SET_FORM_ERRORS,
                payload: data.errors
            });
        }
    } catch (err) {
        window.location.href = UTC_URL
    }
}
export const setProfilePercent = (data) => async (dispatch) => {

    dispatch({ type: SET_PROFILE_PERCENT, payload: data })
}
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
}
export const logoutUser = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_LOGOUT, {})
            .then(res => {
                window.history.replaceState({}, document.title)
                removeUser()(dispatch)
                resolve(res)
            })
            .catch(err => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}
export const removeUser = () => async (dispatch) => {
    Cookies.remove('token')
    localStorage.removeItem('token')
    localStorage.removeItem('mixpanel_session_id')
    localStorage.removeItem('user')
    localStorage.removeItem("warning")
    localStorage.removeItem("joinusVideoCount")
    clearHapppyAgentDashboardCache();
    dispatch({ type: REMOVE_PROFILE_STATE });
    dispatch({ type: SET_LOGGED_OUT, payload: true });
    dispatch({ type: HAPPPY_AGENT_RESET });
    dispatch(setCurrentUser({}));
}
export const trackLink = (payload) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TRACKLINK, payload)
            .then((res) => {
                if (res?.status == 200) {
                    Cookies.set('source', res?.data?.source)
                }
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const profileUpdate = (url, payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(url, payload)
            .then((res) => {
                resolve(res);
                dispatch({ type: SET_PROFILE_PERCENT, payload: res.data.profile_completion_percentage })
                dispatch({ type: SET_PROFILE_REM_PERCENT, payload: res.data.profile_remaining_percentage })
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch)
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    const data = err.response.data
                    if (data.hasOwnProperty("resume")) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: { personaldetails: { resume: data.resume[0] } }
                        });
                    }
                    if (data.hasOwnProperty("errors")) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: formatErrors(data.errors)
                        });
                    }
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getProfilePercent = (loader = true) => async (dispatch) => {
    if (loader) {
        dispatch({ type: SET_ME_LOADER, payload: true })
    }
    // const source = Cookies.get('s')
    try {
        const { data } = await GET_API(API_ME)
        dispatch({ type: SET_PROFILE_PERCENT, payload: data.profile_completion_percentage })
        dispatch({
            type: UPDATE_CURRENT_USER, payload: {
                ...data.userdata,
                login_provider_type: data.data.login_provider_type,
                tech_attempted: data.tech_attempted,
                enc_id: data.data.enc_id,
                // total_experience: data.userdata.total_experience,
                // role: data.data?.talent?.role,
                snooze_modal_vis: data.snooze_modal_vis,
                snooze: data.snooze,
                linkedin_id: data?.data?.linkedin_id,
                has_auto_fill_extension_installed: data?.has_auto_fill_extension_installed,
                is_talent_video_resume_available: data?.is_talent_video_resume_available,
                profile_last_updated: data?.profile_last_updated,
                resume_transform_price: data?.resume_transform_price,
                resume_tailored_plans: data?.resume_tailored_plans,
                // total_paid_transformations: data?.total_paid_transformations,
                t_id: data?.data?.talent_id,
                is_even_user: data?.data?.talent_id % 2 === 0,
                agent_tailor_plans: data?.agent_tailor_plans,
                agent_tailor_plans_original: data?.agent_tailor_plans_original,
                happy_referral_total_discount: data?.happy_referral_total_discount,
            }
        });
        dispatch({
            type: SET_RESUME_HEALTH_CONTROL, payload: data.userdata.resume_health
        });
        dispatch({ type: SET_ME_LOADER, payload: false })
        updateMixpanelUserDetails(true);
    } catch (e) {
        if (e.response && e.response.status && e.response.status == 401) {
            removeUser()(dispatch)
        } else {
            dispatch({
                type: SET_ERRORS,
                payload: { commonError: true }
            });
        }
        dispatch({ type: SET_ME_LOADER, payload: false })
    }
}


export const SetProfileAction = (payload) => (dispatch) => {
    dispatch({ type: SET_PROFILE_DATA, payload: payload })
}

export const recommendAssessmentSkills = (payload) => async (dispatch) => {
    return new Promise((resolve, reject) => {
        // dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_ASSESSMENT_SKILLS_RECOMMEND, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser();
                }
                reject(err)
            })
    })
}

// Start Talent work apis ####################################################################################

export const getOppFilterMaster = () => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    try {
        let { data } = await GET_API(API_OPP_MASTER)
        dispatch({ type: SET_OPP_MASTER, payload: data })
        dispatch({ type: SET_LOADER, payload: false })
    } catch (e) {
        if (e.response && e.response.status && e.response.status == 401) {
            //removeUser();
        }
        dispatch({ type: SET_LOADER, payload: false })
    }
}

export const fetchOppRoleMaster = (search = '', urlSearchVal) => (dispatch) => {
    return new Promise((resolve, reject) => {
        let qryUrl = ""
        if (urlSearchVal) {
            qryUrl = qryUrl + "?search_value=" + encodeURIComponent(urlSearchVal);
        } else {
            if (search)
                qryUrl = qryUrl + "?search=" + encodeURIComponent(search)
        }
        GET_API(API_OPP_ROLE_MASTER + qryUrl)
            .then((res) => {
                dispatch({
                    type: ALL_OPP_MASTER_VALUE,
                    payload: { role_master: res?.data?.data }
                });
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const fetchOppSkillMaster = (search = '', urlSearchVal) => (dispatch) => {
    return new Promise((resolve, reject) => {
        let qryUrl = ""
        if (urlSearchVal) {
            qryUrl = qryUrl + "?search_value=" + encodeURIComponent(urlSearchVal);
        } else {
            if (search)
                qryUrl = qryUrl + "?search=" + encodeURIComponent(search)
        }
        GET_API(API_OPP_SKILL_MASTER + qryUrl)
            .then((res) => {
                dispatch({
                    type: ALL_OPP_MASTER_VALUE,
                    payload: { skill_master: res?.data?.data }
                });
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}
export const fetchOppLocationMaster = (search = '', urlSearchVal) => (dispatch) => {
    return new Promise((resolve, reject) => {
        let qryUrl = ""
        if (urlSearchVal) {
            qryUrl = qryUrl + "?search_value=" + encodeURIComponent(urlSearchVal);
        } else {
            if (search)
                qryUrl = qryUrl + "?search=" + encodeURIComponent(search);
        }
        GET_API(API_OPP_LOCATION_MASTER + qryUrl)
            .then((res) => {
                dispatch({
                    type: ALL_OPP_MASTER_VALUE,
                    payload: { location_master: res?.data?.data }
                });
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}
export const fetchOppCompanyMaster = (search = '', type = "maang", urlSearchVal) => (dispatch) => {
    let qryUrl = "?company_type=" + type;
    if (urlSearchVal) {
        qryUrl = qryUrl + "&search_value=" + encodeURIComponent(urlSearchVal);
    } else {
        if (search)
            qryUrl = qryUrl + "&search=" + encodeURIComponent(search);
    }
    return new Promise((resolve, reject) => {
        GET_API(API_OPP_COMPANY_MASTER + qryUrl)
            .then((res) => {
                dispatch({
                    type: ALL_OPP_MASTER_VALUE,
                    payload: { [type + "_master"]: res?.data?.data }
                });
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const fetchOppReadyFilters = (search = '') => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_OPP_READY_FILTERS)
            .then((res) => {
                resolve(res);
                dispatch({
                    type: SET_OPP_READY_FILTERS,
                    payload: res.data
                });
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}



export const searchSkillMaster = (search) => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_INDIVIDUAL_MASTER + "?type=hr_skill&skill_name=" + search)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const getAwsFile = (type, filename) => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_GET_AWS_FILE + "/" + type + "/" + filename)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}


// export const getAllOpportnities = (page, filters) => (dispatch) => {
//     let qryUrl = `?pagination=10&page=${page}`

//     // Object.keys(sort).map((key, index) => {
//     //     if (sort[key])
//     //         qryUrl = qryUrl + `&${key}=${sort[key]}`
//     // })

//     // console.log('filters :', filters);

//     if (filters.is_saved_filter === 1) {
//         qryUrl = qryUrl + '&is_saved_filter=1'
//     } else {
//         Object.keys(filters).map((key, index) => {
//             if (filters[key]) {
//                 if (key == 'sort_field') {
//                     qryUrl = qryUrl + `&${key}=${filters[key]}`
//                 }
//                 else if (key === 'payout') {
//                     if (Object.keys(filters[key]).length) {
//                         let payoutRange = Object.keys(filters[key]).map((key) => {
//                             return {
//                                 start: key.split(',')[0],
//                                 end: key.split(',')[1],
//                             }
//                         })
//                         qryUrl = qryUrl + "&" + key + "=" + JSON.stringify(payoutRange)
//                     }
//                 }
//                 else if (typeof filters[key] === 'object') {
//                     if (Object.keys(filters[key]).length) {
//                         if (key == "engagements") {
//                             let subArray = []
//                             Object.keys(filters[key]).map((subKey) => {
//                                 if (typeof filters[key][subKey] === 'object') {
//                                     subArray.push({ type: subKey, cities: Object.keys(filters[key][subKey]).toString() })
//                                 } else {
//                                     subArray.push({ type: subKey })
//                                 }
//                             })
//                             qryUrl = qryUrl + "&" + key + "=" + JSON.stringify(subArray);
//                         }
//                         else if (key == 'shifts') {
//                             qryUrl = qryUrl + "&" + key + "=" + JSON.stringify(Object.keys(filters[key]));
//                         } else
//                             qryUrl = qryUrl + "&" + key + "=" + Object.keys(filters[key]).toString();
//                     }
//                 }
//                 else {
//                     qryUrl = qryUrl + `&${key}=${filters[key]}`
//                 }
//             }

//         })
//     }

//     // console.log("qryUrl", qryUrl)

//     return new Promise((resolve, reject) => {
//         axios.defaults.headers.common['Authorization'] = "Bearer " + localStorage.getItem('token');
//         // page == 1 && dispatch({ type: SET_LOADER, payload: true })
//         GET_API(API_ALL_OPP + qryUrl)
//             .then((res) => {
//                 resolve(res);
//             })
//             .catch((err) => {
//                 if (err.response && err.response.status && err.response.status == 401) {
//                     removeUser()(dispatch);
//                 }
//                 if (err.response && err.response.status && err.response.status == 422) {
//                     dispatch({
//                         type: SET_ERRORS,
//                         payload: err.response.data.errors
//                     });
//                 }
//                 reject(err)
//             })
//             .finally(() => dispatch({ type: SET_LOADER, payload: false }))
//     })
// }


export const getInhouseOpportnities = (page, filters) => (dispatch) => {
    let qryUrl = `?pagination=10&page=${page}&type=inhouse`

    if (filters.is_saved_filter === 1) {
        qryUrl = qryUrl + '&is_saved_filter=1'
    } else {
        Object.keys(filters).map((key, index) => {
            if (filters[key]) {
                if (key == 'sort_field') {
                    qryUrl = qryUrl + `&${key}=${filters[key]}`
                }
                else if (key === 'payout') {
                    if (Object.keys(filters[key]).length) {
                        let payoutRange = Object.keys(filters[key]).map((key) => {
                            return {
                                start: key.split(',')[0],
                                end: key.split(',')[1],
                            }
                        })
                        qryUrl = qryUrl + "&" + key + "=" + JSON.stringify(payoutRange)
                    }
                }
                else if (typeof filters[key] === 'object') {
                    if (Object.keys(filters[key]).length) {
                        if (key == 'shifts') {
                            qryUrl = qryUrl + "&" + key + "=" + JSON.stringify(Object.keys(filters[key]));
                        } else if (key == 'partner_companies' || key == 'salary_available') {
                            // For partner_companies and salary_available, send the first key as value (1)
                            qryUrl = qryUrl + "&" + key + "=" + Object.keys(filters[key])[0];
                        } else
                            qryUrl = qryUrl + "&" + key + "=" + Object.keys(filters[key]).toString();
                    }
                }
                else {
                    qryUrl = qryUrl + `&${key}=${filters[key]}`
                }
            }

        })
    }

    return new Promise((resolve, reject) => {
        GET_API(API_ALL_OPP + qryUrl)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const getFeaturedOpportnities = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_ALL_FEATURED_OPP)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getMyOpportnities = ({ page, activeJob }, cancelToken) => (dispatch) => {
    let params = {
        pagination: 10,
        page: page
    }
    if (activeJob) {
        params.activeJob = activeJob
    }
    const token = localStorage.getItem('token');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return new Promise((resolve, reject) => {
        if (page == 1) dispatch({ type: SET_LOADER, payload: true })
        axios.get(API_MY_OPP, { params, cancelToken: cancelToken })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getHomeAllOpportnities = (noLoader = false) => (dispatch) => {
    let qryUrl = `?pagination=10&page=1`
    return new Promise((resolve, reject) => {
        if (!noLoader) dispatch({ type: SET_LOADER, payload: true })
        GET_API(API_ALL_OPP + qryUrl)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => noLoader && dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const oppInterested = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_INTERESTED, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getEncOppData = (hrId) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_ACCEPTENCE + '?hrid=' + hrId)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const oppDislike = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_OPP_CANCEL, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const oppApply = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_ACCEPTENCE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getMyInterviews = (type) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_INTERVIEW + "?type=" + type)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const selectInterviewSlot = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SLOT_SELECT, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const getInterviewFeedbacks = (type) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_INTERVIEW_FEEDBACK + '?type=' + type)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const submitInterviewFeedback = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_INTERVIEW_FEEDBACK, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const startHrAssessment = (assessmentId, hr_id) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_START_HR_ASSESSMENT, { assessment_id: assessmentId, hr_id: hr_id })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const AssessmentRetest = (assessmentId) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_ASSESSMENT_RETEST, { assessment_id: assessmentId })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

// End Talent work apis ####################################################################################



export const updateTalentSystemDetails = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SYSTEM_DETAILS, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const getTalentHrApplyStatus = (reqHrNumber) => (dispatch) => {
    // dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_GET_APPLY_STATUS + '?HR_Number=' + reqHrNumber)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
        // .finally(() => !noLoader && dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getIndividualHR = (reqHrNumber) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_SINGLE_OPP + '?hr_number=' + reqHrNumber)
            .then((res) => {
                if (res.data.is_test_hr == 1) {
                    window.location.href = '/talent/all-opportunities';
                    return;
                }
                resolve(res);
                dispatch({ type: HR_UPDATE_NEEDED, payload: res.data })
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getSingleOpportunity = (reqHrNumber) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_SINGLE_OPP + '?hr_number=' + reqHrNumber)
            .then((res) => {
                if (res.data.is_test_hr == 1) {
                    window.location.href = '/talent/all-opportunities';
                    return;
                }
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getPublicSingleOpportunity = (reqHrNumber) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_PUBLIC_SINGLE_OPP + '?hr_number=' + reqHrNumber)
            .then((res) => {
                if (res.data.is_test_hr == 1) {
                    window.location.href = '/talent/joinus';
                    return;
                }
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getMatchMakePercent = (reqHrNumber) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_MATCH_PERCENT, { hr_id: reqHrNumber })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}


export const getSimilarJob = (reqHrNumber, email, { aggregatedJobs = false } = {}) => (dispatch) => {
    const payload = { hr_id: reqHrNumber, user_email: email };
    if (aggregatedJobs) {
        payload.aggregated_jobs = 1;
    }
    return new Promise((resolve, reject) => {
        POST_API(API_SIMILAR_JOB, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const oppBookmark = (reqMap) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_BOOKMARK_OPP, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const fetchEmailPreference = (search) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_EMAIL_PREFERENCE + search)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const setEmailPreference = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_EMAIL_PREFERENCE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const fetchSnoozeEmail = (search) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_SNOOZE_EMAIL + search)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const setSnoozeEmail = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SNOOZE_EMAIL_UPDATE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const fetchTalentEmailPreference = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_TALENT_EMAIL_PREFERENCE)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const updateEmailPreference = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_EMAIL_PREFERENCE_UPDATE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const submitResumeParserFeedback = (payload) => async (dispatch) => {
    try {
        const { data } = await POST_API(API_RESUME_PARSER_FEEDBACK, payload)
        if (data) {
            dispatch({
                type: UPDATE_PROFILE_DATA, payload: {
                    resume_parser_feedback: [data]
                }
            });
        }
    } catch (err) {
        console.log(err)
    }
}
export const getAllRecommendations = (keyValue) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: false })
    return new Promise((resolve, reject) => {
        POST_API(API_RECOMMENDED_DATA, keyValue)
            .then((res) => {
                if (res.data.status === 1) {
                    resolve(res.data)
                }
                else {
                    reject(res.data?.message)
                }
            })
    }).finally(() => dispatch({ type: SET_LOADER, payload: false }))
}

export const updateUserPreference = (formData) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return POST_API(API_PREFERENCE, formData)
}
export const getAllAssessments = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_ASSESSMENT_V2)
            .then((res) => {
                resolve(res.data.data);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const UpdateAssessmentSkill = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_ASSESSMENT_SKILLS, payload)
            .then((res) => {
                resolve(res.data);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const startAssessment = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_ASSESSMENT_START, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getNurturePreference = (qryParam) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_NURTURE_PREFERENCE + qryParam)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const upsertVideoCountHR = (reqMap) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(localStorage.getItem('token') ? API_HRCOMPANY_VIDEO_COUNTER : API_HRCOMPANY_VIDEO_COUNTER_PUBLIC, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const otpSendTalent = (reqMap) => async (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_OTPSEND, reqMap)
            .then((res) => {
                if (res.data.status == 200) {
                    resolve(res);
                } else {
                    reject(data.errors)
                }
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))

    })
}

export const validatePasswordOTP = (reqMap) => (dispatch) => {
    // dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_PASSWORD_OTP_VALIDATE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
        // .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const deactivateTalentAccount = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TALENT_DEACTIVATE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const reactivateTalentAccount = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TALENT_REACTIVATE, reqMap)
            .then((res) => {
                resolve(res);
                if (res.data.status == 200) {
                    dispatch({
                        type: UPDATE_CURRENT_USER,
                        payload: { is_deactivated: 0 }
                    });
                }
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const deleteTalentAccount = (reqMap) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TALENT_DELETE, reqMap)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const trackerTalentPacket = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (Cookies.get('ta') || Cookies.get('uplers_user')) {
            resolve({})
        } else {
            POST_API(API_TRACK_TALENT_PACKET, payload)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    console.error(err.response)
                    if (err.response && err.response.status && err.response.status == 401) {
                        removeUser()(dispatch);
                    }
                    if (err.response && err.response.status && err.response.status == 422) {
                        dispatch({
                            type: SET_ERRORS,
                            payload: err.response.data.errors
                        });
                    }
                    reject(err)
                })
                .finally(() => dispatch({ type: SET_LOADER, payload: false }))
        }
    })
}
export const verifyContactNumber = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_VERIFY_CONTACT, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const profileUpsert = (payload, noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        POST_API(API_TALENT_PROFILE_UPSERT, payload)
            .then((res) => {
                resolve(res);
                if (res.data.profile_completion_percentage) {
                    dispatch({ type: SET_PROFILE_PERCENT, payload: res.data.profile_completion_percentage })
                    dispatch({ type: SET_PROFILE_REM_PERCENT, payload: res.data.profile_remaining_percentage })
                }
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => {
                if (!noLoader) {
                    dispatch({ type: SET_LOADER, payload: false })
                }
            }
            )
    })
}

export const generateAwsUploadUrl = (payload, noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        POST_API(API_GENERATE_AWS_UPLOAD_URL, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => {
                if (!noLoader) {
                    dispatch({ type: SET_LOADER, payload: false })
                }
            }
            )
    })
}

export const profileResumeDownload = (talent_id, noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        GET_API(API_TALENT_DOWNLOAD_RESUME_PROFILE + "?talent_id=" + talent_id)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => {
                if (!noLoader) {
                    dispatch({ type: SET_LOADER, payload: false })
                }
            }
            )
    })
}


export const pageActivityTracker = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TRACK_TALENT_PAGES, payload)
            .then((res) => {
                dispatch({
                    type: SET_RESUME_HEALTH_CONTROL, payload: res.data.session_data.resume_health
                });
                dispatch({
                    type: SET_OUTREACH_DATA, payload: res.data.session_data.outreach
                });
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const unlockTalentPacket = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_UNLOCK_PROFILE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getAssessmentRedirectLink = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TEST_REDIRECT_LINK, payload)
            .then((res) => {
                if (res.data?.status === 200) {
                    resolve(res);
                } else {
                    reject(res.data);
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const saveTpFeedback = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_TP_FEEDBACK_SAVE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const fetchTouchpointsQuestion = (payload, noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        POST_API(API_TOUCHPOINT_QUES, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => {
                if (!noLoader) {
                    dispatch({ type: SET_LOADER, payload: false })
                }
            })
    })
}

export const saveTouchpointsAnswers = (payload, noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        POST_API(API_TOUCHPOINT_ANS_V2, payload)
            .then((res) => {
                if (res.data?.status === 200) {
                    resolve(res);
                } else {
                    reject(res.data);
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const saveTouchpointCustomQues = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_TOUCHPOINT_SAVE_CUSTOM_QUES, payload)
            .then((res) => {
                if (res.data?.status === 200) {
                    resolve(res);
                } else {
                    reject(res.data);
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const touchpointDoneHrAssociate = (hr_no, is_tailored_resume = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        let payload = {
            HR_Number: hr_no,
        }
        if (is_tailored_resume) {
            payload.is_tailored_resume = true;
        }
        POST_API(API_TOUCHPOINT_DONE_HR, payload)
            .then((res) => {
                if (res.data?.status === 200) {
                    resolve(res);
                } else {
                    reject(res.data);
                }
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const getCompanyDetails = (qryParam) => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_COMPANY_DETAILS + qryParam)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
    })
}

export const getCompanySalaryData = (qryParam) => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_COMPANY_SALARY_DATA + qryParam)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response)
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 403) {
                    // BETA users only - silently fail
                    resolve({ data: { salary_data: null } });
                }
                reject(err)
            })
    })
}

export const submitCompanySalaryFeedback = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_COMPANY_SALARY_FEEDBACK, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err.response);
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err);
            })
    })
}

export const getParserYoe = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        // dispatch({ type: SET_LOADER, payload: true })
        GET_API(API_RESUME_YOE)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
        // .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const fetchVideoResume = (HR_Number) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        GET_API(API_FETCH_VIDEO_RESUME + HR_Number)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                if (err.response && err.response.status && err.response.status == 422) {
                    dispatch({
                        type: SET_ERRORS,
                        payload: err.response.data.errors
                    });
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const storeVideoResume = (payload) => {
    return new Promise((resolve, reject) => {
        POST_API(API_STORE_VIDEO_RESUME, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}
export const toggleVisibility = (payload) => {
    return new Promise((resolve, reject) => {
        POST_API(API_VISIBILITY_TOGGLE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const errorBoundryTrigger = (payload) => {
    return new Promise((resolve, reject) => {
        POST_API(API_EB_NOTIFY, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                // if (err.response && err.response.status && err.response.status == 401) {
                //     removeUser()(dispatch);
                // }
                reject(err)
            })
    })
}


export const getTalentLocationMaster = ({ search, noState }, cancelToken) => {
    return new Promise((resolve, reject) => {
        let params = {
            search: search,
            version: 2
        }
        if (noState) {
            params.search_state = 'no'
        }
        axios.get(API_TALENT_LOCATION_MASTER, {
            params: params,
            cancelToken: cancelToken
        })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (axios.isCancel(err)) {
                    console.log('Request canceled');
                } else {
                    console.error("search location request failed:", err);
                }
                reject(err)
            })
    })
}


export const applyMandateVr = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_APPLY_VIDEO_RESUME, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const getTalentPreferences = (noLoader = false) => (dispatch) => {
    return new Promise((resolve, reject) => {
        if (!noLoader) {
            dispatch({ type: SET_LOADER, payload: true })
        }
        GET_API(API_TALENT_PREFERENCES)
            .then((res) => {
                resolve(res);
                dispatch({
                    type: SET_TALENT_PREFERENCES,
                    payload: res.data
                })
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getUserSSOaccess = (payload) => async (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_SSO_LOGIN_ACCESS, payload)
            .then((res) => {
                console.log("res", res);
                if (res?.status === 200) {
                    Cookies.set('talent', res.data.authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' })
                    localStorage.setItem('token', res.data.authtoken)
                    localStorage.setItem('user', JSON.stringify(res.data.data))
                    localStorage.setItem('warning', true)
                    dispatch(setCurrentUser(res.data.data));
                }
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const saveExtensionInstalled = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_STORE_EXT_INSTALLED, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const sendEmailAutoFillExtension = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_SEND_EMAIL_AUTOFILL_EXT)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const sendEmailJobLink = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_SEND_EMAIL_JOB_LINK, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getTalentProfile = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        GET_API(API_GET_TALENT_PROFILE)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const updateTalentProfile = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_UPDATE_TALENT_PROFILE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const associateAggreeJobTalent = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_ASSOCIATE_TALENT_AGR_JOB, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const storeAppliedResponseAgrJob = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_STORE_APPLY_AGR_JOB, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const storeJobNotInterested = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        dispatch({ type: SET_LOADER, payload: true })
        POST_API(API_JOB_NOT_INTERESTED, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const uploadResumeReview = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_UPLOAD_RESUME_REVIEW, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
// export const getResumeHealthCheck = () => (dispatch) => {
//     return new Promise((resolve, reject) => {
//         GET_API(API_RESUME_HEALTH_CHECK)
//             .then((res) => {
//                 resolve(res);
//             })
//             .catch((err) => {
//                 if (err.response && err.response.status && err.response.status == 401) {
//                     removeUser()(dispatch);
//                 }
//                 reject(err)
//             })
//             .finally(() => dispatch({ type: SET_LOADER, payload: false }))
//     })
// }
export const submitResumeHealthCheck = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_RESUME_HEALTH_CHECK, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const submitResumeHealthCheckEven = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_RESUME_HEALTH_CHECK_NEW, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}


export const viewTransformedResume = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_RESUME_TRANSFORM_DOWNLOAD, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const updateTransformedResumeInProfile = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_UPDATE_TRANSFORMED_RESUME_IN_PROFILE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const createOrderRazorPay = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CREATE_ORDER_RAZORPAY, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const captureOrderRazorPay = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CAPTURE_ORDER_RAZORPAY, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getAccountStatus = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_ACCOUNT_STATUS)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const getAccountAnalytics = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_ACCOUNT_ANALYTICS)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const connectLinkedin = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_LINKEDIN_CONNECT, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const verifyLinkedin = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_LINKEDIN_VERIFY, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const disconnectLinkedin = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_LINKEDIN_DISCONNECT, payload ?? {})
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const verifyGmail = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_GMAIL_VERIFY, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const disconnectGmail = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_GMAIL_DISCONNECT, payload ?? {})
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const startOutreachAgent = (payload) => (dispatch) => {
    // dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_OUTREACH_AGENT, payload)
            .then((res) => {
                if (res?.data?.status === 'success') {
                    dispatch(incrementHapppyAgentDailyUsed());
                }
                resolve(res);
            })
            .finally(() =>
                dispatch({ type: SET_LOADER, payload: false })
            )
    })
}

export const perferredCompanies = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_PREFERRED_COMPANIES, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const perferredCompaniesList = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_PREFERRED_COMPANIES_LIST, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const savePreferredCompanies = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SAVE_PREFERRED_COMPANIES, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getOutreachTemplates = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_GET_OUTREACH_TEMPLATES)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getOutreachStep = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    const URL = API_GET_OUTREACH_STEP;
    return new Promise((resolve, reject) => {
        GET_API(URL)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

/** Mirror of the localStorage cache the AgentJ layout uses for first-paint hydration. */
const HAPPPY_AGENT_CACHE_KEY = 'job_agent_outreach_step_cache';

function persistHapppyAgentDashboardData(payload) {
    if (typeof window === 'undefined' || !payload || typeof payload !== 'object') return;
    try {
        window.localStorage.setItem(HAPPPY_AGENT_DASHBOARD_CACHE_KEY, JSON.stringify(payload));
    } catch {
        /* ignore quota / private mode */
    }
}

function clearHapppyAgentDashboardCache() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(HAPPPY_AGENT_DASHBOARD_CACHE_KEY);
    } catch {
        /* ignore */
    }
}

function persistHapppyAgentConnections(d) {
    if (typeof window === 'undefined') return;
    const s1 = d && typeof d.step1 === 'object' && d.step1 ? d.step1 : {};
    const gmail = !!s1.gmail_connected;
    const linkedin = !!s1.linkedin_connected;
    try {
        if (gmail || linkedin) {
            window.localStorage.setItem(
                HAPPPY_AGENT_CACHE_KEY,
                JSON.stringify({ gmail_connected: gmail, linkedin_connected: linkedin })
            );
        } else {
            window.localStorage.removeItem(HAPPPY_AGENT_CACHE_KEY);
        }
    } catch {
        /* ignore quota / private mode */
    }
}

/**
 * Populate the `happpyAgent` slice from API_GET_OUTREACH_STEP.
 *
 * - Bypasses the global SET_LOADER overlay (the AgentJ layout / subscription page
 *   render their own inline spinners and must not be covered by the app-wide loader).
 * - Short-circuits when the slice is already `loaded` and no force flag is set,
 *   so navigating between sidebar pages doesn't re-hit the API on every layout mount.
 * - Pass `{ silent: true }` to avoid toggling `planLoading`/`loading` to true while
 *   the user is on the success toast (prevents a "Loading plan…" flicker).
 * - Pass `{ force: true }` to bypass the short-circuit (used after a successful
 *   Razorpay payment so every subscriber re-renders with the new plan).
 */
export const fetchHapppyAgentPlan = ({ silent = false, force = false } = {}) => (dispatch, getState) => {
    const current = getState().happpyAgent;
    if (!force && current?.loaded && !current?.error) {
        return Promise.resolve(current);
    }
    /** De-dupe concurrent mounts (layout + subscription page both dispatch on first paint).
     *  Use `inFlight` (only set when a request is actually issued) — NOT `loading`, which
     *  the reducer seeds to true on first paint for users with no localStorage cache and
     *  would otherwise cause the very first dispatch for fresh logins to short-circuit. */
    if (!force && current?.inFlight) {
        return Promise.resolve(current);
    }

    const loadingPayload = { inFlight: true };
    if (!silent) {
        loadingPayload.loading = !current?.loaded;
        loadingPayload.planLoading = true;
    }
    dispatch({ type: HAPPPY_AGENT_SET_LOADING, payload: loadingPayload });

    return GET_API(API_GET_OUTREACH_STEP)
        .then((res) => {
            const d = res?.data?.data;
            if (!d || typeof d !== 'object') {
                dispatch({ type: HAPPPY_AGENT_FAILED, payload: 'empty payload' });
                return null;
            }
            const s1 = d.step1 && typeof d.step1 === 'object' ? d.step1 : {};
            const normalized = {
                plan: d.plan ?? null,
                plan_end_date: d.plan_end_date ?? null,
                has_plan_expired: !!d.has_plan_expired,
                conversion_offer: d.conversion_offer ?? null,
                credit_plan: Number(d.credit_plan) || 0,
                credit_left: Number(d.credit_left) || 0,
                credit_added: Number(d.credit_added) || 0,
                gmail_connected: !!s1.gmail_connected,
                linkedin_connected: !!s1.linkedin_connected,
                raw: d,
            };
            persistHapppyAgentConnections(d);
            dispatch({ type: HAPPPY_AGENT_SET, payload: normalized });
            return normalized;
        })
        .catch((err) => {
            dispatch({
                type: HAPPPY_AGENT_FAILED,
                payload: err?.response?.data?.message || err?.message || 'failed',
            });
            return null;
        });
};

export const resetHapppyAgentPlan = () => ({ type: HAPPPY_AGENT_RESET });

/**
 * Fetch get-outreach-dashboard-data into the happpyAgent slice.
 *
 * Always stores the full API payload on `dashboardData`. Also hydrates the daily
 * run quota (`dailyUsed` / `dailyLimit`) for the topnav / mobile drawer widget
 * unless `{ skip: true }` (used when the outreach sidenav is locked).
 */
export const fetchHapppyAgentDailyLimit = ({ skip = false } = {}) => (dispatch, getState) => {
    const { happpyAgent } = getState();
    const hasCachedDashboard = !!happpyAgent?.dashboardData;

    if (!skip) {
        dispatch({
            type: HAPPPY_AGENT_DAILY_LIMIT_SET,
            payload: {
                dailyLimitLoading: !hasCachedDashboard,
                dailyUsed: happpyAgent?.dailyUsed ?? 0,
                dailyLimit: happpyAgent?.dailyLimit ?? 0,
            },
        });
    }

    return GET_API(API_GET_OUTREACH_DASHBOARD_DATA)
        .then((res) => {
            const payload = res?.data?.data || {};
            const serverUsed = Number(payload.today_agent_runs) || 0;
            const serverLimit = Number(payload.max_limit) || 0;
            const currentUsed = Number(getState().happpyAgent?.dailyUsed) || 0;
            /** Keep optimistic bumps until the server catches up (tab refetch / slow writes). */
            const mergedUsed = skip ? currentUsed : Math.max(serverUsed, currentUsed);
            const mergedDashboard = {
                ...payload,
                today_agent_runs: mergedUsed,
            };
            persistHapppyAgentDashboardData(mergedDashboard);
            dispatch({
                type: HAPPPY_AGENT_DAILY_LIMIT_SET,
                payload: {
                    dailyLimitLoading: false,
                    dashboardData: mergedDashboard,
                    ...(skip
                        ? {}
                        : {
                              dailyUsed: mergedUsed,
                              dailyLimit: serverLimit,
                          }),
                    agentPrefFieldsSubmitted: !!payload.agent_pref_fields_submitted,
                    dashboardPreferencesLoaded: true,
                },
            });
        })
        .catch(() => {
            const current = getState().happpyAgent;
            dispatch({
                type: HAPPPY_AGENT_DAILY_LIMIT_SET,
                payload: {
                    dailyLimitLoading: false,
                    ...(skip
                        ? {}
                        : {
                              dailyUsed: current?.dailyUsed ?? 0,
                              dailyLimit: current?.dailyLimit ?? 0,
                          }),
                    dashboardPreferencesLoaded: true,
                },
            });
        });
};

/**
 * Optimistically bump today's run count after a successful agent submission.
 * Updates `dailyUsed`, `dashboardData.today_agent_runs`, and the localStorage cache
 * so every Job Agent page and tab reads the same Redux value in real time.
 */
export const incrementHapppyAgentDailyUsed = (count = 1) => (dispatch, getState) => {
    const incrementBy = Math.max(0, Number(count) || 0);
    if (incrementBy <= 0) return;

    const { happpyAgent } = getState();
    const nextUsed = (Number(happpyAgent?.dailyUsed) || 0) + incrementBy;
    const currentDashboard =
        happpyAgent?.dashboardData && typeof happpyAgent.dashboardData === 'object'
            ? happpyAgent.dashboardData
            : {};
    const nextDashboard = {
        ...currentDashboard,
        today_agent_runs: nextUsed,
    };

    persistHapppyAgentDashboardData(nextDashboard);
    dispatch({
        type: HAPPPY_AGENT_DAILY_LIMIT_SET,
        payload: {
            dailyUsed: nextUsed,
            dashboardData: nextDashboard,
        },
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent(HAPPPY_AGENT_DAILY_RUN_RECORDED_EVENT, {
                detail: { count: incrementBy, dailyUsed: nextUsed },
            })
        );
    }
};

/** Apply dashboard cache written by another browser tab (storage event). */
export const syncHapppyAgentDailyLimitFromStorage = () => (dispatch) => {
    if (typeof window === 'undefined') return;
    try {
        const raw = window.localStorage.getItem(HAPPPY_AGENT_DASHBOARD_CACHE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return;
        dispatch({
            type: HAPPPY_AGENT_DAILY_LIMIT_SET,
            payload: {
                dailyUsed: Number(data.today_agent_runs) || 0,
                dailyLimit: Number(data.max_limit) || 0,
                dashboardData: data,
                dailyLimitLoading: false,
            },
        });
    } catch {
        /* ignore parse / quota errors */
    }
};

/** POST talent/outreach/auto-run-request and record today's run count on success. */
export const submitAutoRunRequest = (payload) => (dispatch) =>
    POST_API(API_AUTO_RUN_REQUEST, payload).then((res) => {
        const count = countFromAutoRunResponse(res);
        if (count > 0) {
            dispatch(incrementHapppyAgentDailyUsed(count));
        }
        return res;
    });

/** POST referral-agent/job-apply-by-links-batch and record queued runs on success. */
export const submitReferralJobApplyByLinksBatch = (payload) => (dispatch) =>
    POST_API(API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH, payload).then((res) => {
        const count = countFromReferralLinksBatchResponse(res);
        if (count > 0) {
            dispatch(incrementHapppyAgentDailyUsed(count));
        }
        return res;
    });

/** Persist Auto Run toggle into dashboard cache (`dashboardData.auto_run_consent`). */
export const setHapppyAgentAutoRunHapppy = (autoRunHapppy) => (dispatch, getState) => {
    const current = getState().happpyAgent?.dashboardData || {};
    const nextDashboard = { ...current, auto_run_consent: !!autoRunHapppy };
    persistHapppyAgentDashboardData(nextDashboard);
    dispatch({
        type: HAPPPY_AGENT_DAILY_LIMIT_SET,
        payload: { dashboardData: nextDashboard },
    });
};

/**
 * Called immediately after Razorpay capture succeeds.
 *
 * Optimistically marks the Happpy Agent plan as paid + not expired so the sidebar pill,
 * topnav badge, and current-plan section flip from "Renew Plan" / "Upgrade Plan" → "My Plan"
 * on the next render — even if API_GET_OUTREACH_STEP momentarily still returns
 * has_plan_expired: true while the backend recomputes plan status.
 *
 * Then triggers a silent, forced refresh to reconcile plan_end_date with the
 * authoritative server value.
 */
export const markHapppyAgentPlanRenewed = () => (dispatch) => {
    dispatch({
        type: HAPPPY_AGENT_SET,
        payload: { plan: 2, has_plan_expired: false },
    });
    return dispatch(fetchHapppyAgentPlan({ silent: true, force: true }));
};

export const getRecommendedJobs = (auto_run = null) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    let URL = API_GET_RECOMMENDED_JOBS;
    // Append auto_run as query parameter if provided
    if (auto_run !== null && auto_run !== undefined) {
        const separator = URL.includes('?') ? '&' : '?';
        URL += `${separator}auto_run=${auto_run ? 1 : 0}`;
    }
    return new Promise((resolve, reject) => {
        GET_API(URL)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const storeRecommendedJobs = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_STORE_RECOMMENDED_JOBS, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}



export const saveOutreachTemplate = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_STORE_OUTREACH_TEMPLATE, payload)
            .then((res) => {
                resolve(res);
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const getJobFunctionMaster = (noLoader = false) => (dispatch) => {
    if (!noLoader) {
        dispatch({ type: SET_LOADER, payload: true })
    }
    return new Promise((resolve, reject) => {
        GET_API(API_JOB_FUNCTION_MASTER)
            .then((res) => {
                resolve(res);
                dispatch({ type: SET_JOB_FUNCTION_MASTER, payload: res.data })
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const getResumeDashboard = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_RESUME_DASHBOARD)
            .then((res) => {
                resolve(res);
                dispatch({
                    type: SET_RESUME_DASHBOARD,
                    payload: res.data.data
                })
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}



export const getPreviewUploadedResume = (payload, fromTailorDashboard = false) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    const url = fromTailorDashboard ? API_TAILOR_RESUME_PREVIEW : API_RESUME_PREVIEW
    return new Promise((resolve, reject) => {
        POST_API(url, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const getHealthReport = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_VIEW_HEALTH_REPORT, payload)
            .then((res) => {
                resolve(res);
                dispatch({ type: SET_RESUME_HEALTH_REPORTS, payload: { [payload.health_check_id]: res.data.data } })
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const resumeCreateRazorpayOrder = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_RESUME_HEALTH_CHECK_CREATE_ORDER, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}


export const resumeCaptureRazorpayOrder = (payload, noLoader = false) => (dispatch) => {
    if (!noLoader) {
        dispatch({ type: SET_LOADER, payload: true })
    }
    return new Promise((resolve, reject) => {
        POST_API(API_RESUME_HEALTH_CHECK_CAPTURE_ORDER, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => {
                if (!noLoader) {
                    dispatch({ type: SET_LOADER, payload: false })
                }
            })
    })
}


export const setActiveTransformation = (payload) => (dispatch) => {
    dispatch({ type: SET_ACTIVE_TRANSFORMATION, payload: payload });
    localStorage.setItem('activeTransformation-' + payload.health_check_id, JSON.stringify(payload));
}

export const onViewTransformedResume = (data, fromWhere = 'payment_success_page', healthCheckId = '') => async (dispatch) => {
    window.open(data.google_doc_url, "_blank");
    resumeTemplateSelectedTracking(data.template_name);
    const lastViewed = {
        lastViewedTimestamp: Date.now() // Store current time in milliseconds
    };
    localStorage.setItem('lastViewedTransformedResume', JSON.stringify(lastViewed));
    dispatch({ type: SET_LOADER, payload: true });
    viewTransformedResume({ file_id: data.file_id })(dispatch)
        .then(() => {
            if (fromWhere === 'payment_success_page' || fromWhere === 'health-report-page') {
                dispatch({
                    type: UPDATE_HEALTH_REPORT_TRANSFORM_VIEWED,
                    payload: {
                        file_id: data.file_id,
                        viewed_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                        health_check_id: healthCheckId
                    }
                })
            }
            if (fromWhere === "transform_done_popup") {
                dispatch({
                    type: UPDATE_TRANSFORM_DONE_VIEWED,
                    payload: {
                        file_id: data.file_id,
                        viewed_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    }
                })
            }
            if (fromWhere === "dashboard_page") {
                dispatch({
                    type: UPDATE_RESUME_DASHBOARD_TRANSFORM_VIEWED,
                    payload: {
                        file_id: data.file_id,
                        viewed_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    }
                })
            }
        })
        .finally(() => {
            dispatch({ type: SET_LOADER, payload: false });
        })

}
export const raiseResumeSupportRequest = (payload, fromTailorDashboard = false) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    const url = fromTailorDashboard ? API_TAILOR_RESUME_SUPPORT : API_RESUME_HEALTH_CHECK_SUPPORT;
    return new Promise((resolve, reject) => {
        POST_API(url, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const raiseTailorResumeFeedback = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_FEEDBACK, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const raiseOutreachSupportRequest = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_OUTREACH_SUPPORT, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const raiseRefundRequest = (payload, fromTailorDashboard = false) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    const url = fromTailorDashboard ? API_TAILOR_RESUME_REFUND_REQUEST : API_RESUME_HEALTH_CHECK_REFUND_REQUEST;
    return new Promise((resolve, reject) => {
        POST_API(url, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}
export const getOpenAiStatus = () => (dispatch) => {
    return { requiredFunctionOnline: true };
    dispatch({ type: SET_LOADER, payload: true });
    const requiredFunctions = ['Agent', 'Chat', 'Files', 'File uploads'];
    return new Promise((resolve, reject) => {
        fetch('https://status.openai.com/api/v2/summary.json')
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                let requiredFunctionOnline = true;
                data.components?.forEach(element => {
                    if (requiredFunctions.includes(element.name) && element.status !== "operational") {
                        requiredFunctionOnline = false;
                        return;
                    }
                });
                if (!requiredFunctionOnline) {
                    dispatch({ type: SET_OPENAI_DOWN_MODAL, payload: true })
                }
                dispatch({ type: SET_LOADER, payload: false });
                resolve({ requiredFunctionOnline }); // mimic axios-style resolve
            })
            .catch((err) => {
                dispatch({ type: SET_LOADER, payload: false });
                reject(err);
            });
    })
}

/* Survey Poll */
export const submitSurveyPoll = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_SURVEY_POLL, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

/* Career Coach */

export const createCareerCoachGuestUser = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_CAREER_COACH_GUEST_USER, payload)
            .then((res) => {
                resolve(res);
                localStorage.setItem('cc_token', res.data.token);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const createCareerCoachProfile = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })

    return new Promise((resolve, reject) => {
        axios.post(API_CAREER_COACH_PROFILE, payload, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
            }
        }).then((res) => {
            resolve(res);
            let users = JSON.parse(localStorage.getItem('cc_profiles')) || [];

            if (res?.data?.profile) {
                users = [...users, res?.data?.profile];

                localStorage.setItem('cc_profiles', JSON.stringify(users));
                localStorage.setItem('cc_user', JSON.stringify(res.data.profile));
            }
        })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const getCCRecentChats = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })

    return new Promise((resolve, reject) => {
        axios.get(API_CAREER_COACH_RECENT_CHATS, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
            }
        }).then((res) => {
            resolve(res);
        })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const getCCChatMessages = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })

    return new Promise((resolve, reject) => {
        axios.get(API_CAREER_COACH_CHAT_MESSAGES + payload?.chat_id, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
            }
        }).then((res) => {
            resolve(res);
        })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const uploadCCResume = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        axios.post(API_CAREER_COACH_UPLOAD_RESUME, payload, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
                'Content-Type': 'multipart/form-data',
            }
        }).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err)
        }).finally(() => {
            dispatch({ type: SET_LOADER, payload: false })
        })
    })
}

export const getCCUploadedResume = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        axios.get(API_CAREER_COACH_GET_RESUME, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
            }
        }).then((res) => {
            resolve(res);
        })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const storeCCFeedback = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        axios.post(API_CAREER_COACH_FEEDBACK, payload, {
            headers: {
                'Authorization': "Bearer " + localStorage.getItem('cc_token'),
            }
        }).then((res) => {
            resolve(res);
        })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

// fetch user details for jobs spot page
export const checkJobsSpotUser = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        axios.post(API_JOBS_SPOT_CHECK_USER, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const creatJobAlert = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        axios.post(API_JOBS_SPOT_CREATE_JOB_ALERT, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const signupTalent = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_SIGNUP_TALENT, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    const { authtoken, data, is_otp_required } = res.data.data;

                    if (is_otp_required) {
                        // OTP required - don't set auth, just return response
                        resolve({ is_otp_required: true, data });
                    } else {
                        // No OTP required - set auth token and login user
                        Cookies.set('talent', authtoken, { domain: getDomain(), secure: true, sameSite: 'Strict' });
                        localStorage.setItem('token', authtoken);
                        localStorage.setItem('user', JSON.stringify(data));
                        localStorage.setItem('warning', true);
                        dispatch(setCurrentUser(data));
                        resolve({ is_otp_required: false, data });
                    }
                } else {
                    dispatch({
                        type: SET_FORM_ERRORS,
                        payload: res.data?.message
                    });
                    reject(res.data?.message);
                }
            })
            .catch((err) => {
                reject(err);
            });
    });
};

export const updateJobSearchPreference = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_UPDATE_JOB_SEARCH_PREFERENCE, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
            .finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}


export const markReplySeen = (payload) => {
    return new Promise((resolve, reject) => {
        POST_API(API_OUTREACH_MARK_REPLY_SEEN, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}