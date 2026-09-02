'use client';

import {
    API_TAILOR_RESUME_CAPTURE_ORDER_V2, API_TAILOR_RESUME_CREATE_V2, API_TAILOR_RESUME_CREATE_ORDER, API_TAILOR_RESUME_DOWNLOAD,
    API_TAILOR_RESUME_JOB_DESCRIPTION,
    API_TAILOR_RESUME_LIST, API_TAILOR_RESUME_MATCH, API_TAILOR_RESUME_UPDATE, API_TAILOR_RESUME_UPLOAD_V2,
    API_TAILOR_RESUME_EXTENSION_UNINSTALL,
    API_TAILOR_RESUME_SIMILAR_JOBS,
    API_TRANSFORMED_RESUME,
    API_TRANSFORMED_RESUME_UPDATE,
    API_TRANSFORMED_RESUME_DOWNLOAD,
    API_TAILOR_RESUME_MATCH_FOR_BACKEND,
    API_OUTREACH_AGENT_PREVIEW_CONFIG,
    API_OUTREACH_RESUME_TRANSFORM,
    API_GET_LAST_HEALTH_CHECK,
    API_TAILOR_RESUME_MATCH_JDEXTRACT,
    API_TAILOR_RESUME_FETCH_AGENT_JD,
    API_TAILOR_RESUME_UPDATE_TAILOR_RESUME,
    API_OUTREACH_AGENT_PLANS
} from "../../components/Constant";
import { GET_API, POST_API } from "../../components/Helper";
import { SET_DOWNLOAD_TAILOR_RESUME_LOADER, SET_LOADER, SET_RESUME_HEALTH_CONTROL, UPDATE_CURRENT_USER } from "./actionsTypes";
import { removeUser } from "./UserActions";

export const checkResumeMatchWithJob = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_MATCH, payload)
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
export const checkResumeMatchWithJDExtract = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_MATCH_JDEXTRACT, payload)
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

export const fetchAgentJD = (outreach_hr_id) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_TAILOR_RESUME_FETCH_AGENT_JD + "?id=" + outreach_hr_id)
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
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const updateResumeTailoredForAgent = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_UPDATE_TAILOR_RESUME, payload)
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
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const checkResumeMatchWithJobForBackend = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_MATCH_FOR_BACKEND, payload)
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

export const createTailoredResume = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_CREATE_V2, payload)
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


export const updateTailoredResume = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_UPDATE, payload)
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

export const downloadTailoredResume = (payload) => (dispatch) => {
    dispatch({ type: SET_DOWNLOAD_TAILOR_RESUME_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_DOWNLOAD, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_DOWNLOAD_TAILOR_RESUME_LOADER, payload: false })
            })
    })
}

export const uploadTailoredResume = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_UPLOAD_V2, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const getTailoredResumeList = () => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_TAILOR_RESUME_LIST)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const tailorResumeCreateOrder = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_CREATE_ORDER, payload)
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

export const tailorResumeCaptureOrder = (payload, showLoader = true) => (dispatch) => {
    if (showLoader) {
        dispatch({ type: SET_LOADER, payload: true })
    }
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_CAPTURE_ORDER_V2, payload)
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

export const getTailoredResumeJobDescription = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_TAILOR_RESUME_JOB_DESCRIPTION + payload?.id)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const tailorResumeExtensionUninstall = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_EXTENSION_UNINSTALL, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const getSimilarJobs = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TAILOR_RESUME_SIMILAR_JOBS, payload)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err)
            })
    })
}

export const fetchTransformedResume = (transformation_id) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_TRANSFORMED_RESUME + "/" + transformation_id)
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



export const updateTransformedResume = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_TRANSFORMED_RESUME_UPDATE, payload)
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

export const downloadTransformedResume = (payload) => (dispatch) => {
    dispatch({ type: SET_DOWNLOAD_TAILOR_RESUME_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_TRANSFORMED_RESUME_DOWNLOAD, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                dispatch({ type: SET_DOWNLOAD_TAILOR_RESUME_LOADER, payload: false })
            })
    })
}

export const getOutreachAgentPreviewConfig = (HR_Number, noLoader = false) => (dispatch) => {
    if (!noLoader) dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        GET_API(API_OUTREACH_AGENT_PREVIEW_CONFIG + (HR_Number ? "?HR_Number=" + HR_Number : ""))
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                reject(err)
            }).finally(() => {
                if (!noLoader) dispatch({ type: SET_LOADER, payload: false })
            })
    })
}

export const transformResumeForOutreach = (payload) => (dispatch) => {
    return new Promise((resolve, reject) => {
        POST_API(API_OUTREACH_RESUME_TRANSFORM, payload)
            .then((res) => {
                resolve(res);
            }).catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const getResumeHealthCheck = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_GET_LAST_HEALTH_CHECK)
            .then((res) => {
                dispatch({ type: SET_RESUME_HEALTH_CONTROL, payload: res?.data?.data });
                resolve(res);
            }).catch((err) => {
                if (err.response && err.response.status && err.response.status == 401) {
                    removeUser()(dispatch);
                }
                reject(err)
            })
    })
}

export const refreshHapppyAgentPlans = () => (dispatch) => {
    return new Promise((resolve, reject) => {
        GET_API(API_OUTREACH_AGENT_PLANS)
        .then((res) => {
            dispatch({
                type: UPDATE_CURRENT_USER,
                payload: {
                    agent_tailor_plans: res.data.data?.agent_tailor_plans,
                    agent_tailor_plans_original: res.data.data?.agent_tailor_plans_original,
                    happy_referral_total_discount: res.data.data?.happy_referral_total_discount,
                },
            });
        })
        .catch((err) => {
            reject(err)
        })
       
    })
}