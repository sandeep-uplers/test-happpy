'use client';

import { RESET_TRANSFORM_LOADER, SET_ACTIVE_TRANSFORMATION, SET_BG_RESUME_HEALTH_CHECK_ID, SET_HEALTH_CHECK_SOCKET_LOADER, SET_OPENAI_DOWN_MODAL, SET_RESUME_DASHBOARD, SET_RESUME_HEALTH_CONTROL, SET_RESUME_HEALTH_REPORTS, SET_RESUME_TRANSFORM, SET_TRANSFORM_DONE_MODAL, UPDATE_HEALTH_REPORT_TRANSFORM_VIEWED, UPDATE_RESUME_DASHBOARD_TRANSFORM_VIEWED, UPDATE_TRANSFORM_DONE_VIEWED } from '../actions/actionsTypes';

const initialState = {
    transformResumeLoader: (typeof window !== 'undefined' && localStorage.getItem('transformResumeLoader')) || false,
    resumeHealthControl: {
        health_check: {
            status: 0,
        },
        transform: {
            status: 0,
        }
    },
    resumeDashboard: {},
    resumeHealthReports: {},
    activeTransformation: {},
    transformDoneModal: {
        open: false,
        data: {}
    },
    openAiDownModal: false,
    healthCheckSocketLoader: false,
    /**
     * Active id for a silent, "background" resume health check (e.g. one kicked off
     * automatically right after Gmail is connected during onboarding). When set, the
     * global background pusher subscribes to it and refreshes `resumeHealthControl`
     * on completion. UI is intentionally not driven off this field.
     */
    bgResumeHealthCheckId: null,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case RESET_TRANSFORM_LOADER:
            let health_check_id = action.payload.health_check_id;
            localStorage.removeItem('activeTransformation-' + health_check_id);
            let allActiveTransform = { ...state.activeTransformation };
            delete allActiveTransform[health_check_id];
            return {
                ...state,
                activeTransformation: { ...allActiveTransform }
            }

        case SET_RESUME_HEALTH_CONTROL:
            return {
                ...state,
                resumeHealthControl: { ...state.resumeHealthControl, ...action.payload }
            }
        case SET_RESUME_TRANSFORM:
            let healthCheckId = action.payload.health_check_id;
            let newHealthCheck = state.resumeDashboard.health_check?.map(
                (item) => {
                    if (item.enc_id == healthCheckId) {
                        return {
                            ...item, ...action.payload
                        }
                    }
                }
            )
            let newResumeHealthReport = state.resumeHealthReports[healthCheckId]
            if (newResumeHealthReport) {
                newResumeHealthReport.transform = { ...newResumeHealthReport.transform, ...action.payload };
            }
            localStorage.removeItem('activeTransformation-' + healthCheckId);
            let allActiveTransformations = { ...state.activeTransformation };
            delete allActiveTransformations[healthCheckId];
            return {
                ...state,
                resumeDashboard: { ...state.resumeDashboard, health_check: newHealthCheck },
                activeTransformation: { ...allActiveTransformations },
                resumeHealthReports: { ...state.resumeHealthReports, [healthCheckId]: newResumeHealthReport },
                resumeHealthControl: { ...state.resumeHealthControl, is_paid: true },
                // transformDoneModal: { open: true, data: newResumeHealthReport }
            }
        case SET_RESUME_DASHBOARD:
            return {
                ...state,
                resumeDashboard: { ...state.resumeDashboard, ...action.payload, dataLoaded: true }
            }
        case SET_RESUME_HEALTH_REPORTS:
            return {
                ...state,
                resumeHealthReports: { ...state.resumeHealthReports, ...action.payload }
            }
        case SET_ACTIVE_TRANSFORMATION:
            return {
                ...state,
                activeTransformation: { ...state.activeTransformation, [action.payload.health_check_id]: action.payload }
            }

        case SET_TRANSFORM_DONE_MODAL:
            return {
                ...state,
                transformDoneModal: { ...state.transformDoneModal, ...action.payload }
            }
        case UPDATE_TRANSFORM_DONE_VIEWED:
            let transformDoneModal = state.transformDoneModal;
            transformDoneModal.data.transform.google_doc_urls.forEach(doc => {
                if (doc.file_id == action.payload.file_id) {
                    doc.viewed_at = action.payload.viewed_at
                }
            })
            return {
                ...state,
                transformDoneModal: { ...transformDoneModal }
            }
        case UPDATE_HEALTH_REPORT_TRANSFORM_VIEWED:
            let newHealthReports = state.resumeHealthReports[action.payload.health_check_id];
            newHealthReports.transform.google_doc_urls.forEach(doc => {
                if (doc.file_id == action.payload.file_id) {
                    doc.viewed_at = action.payload.viewed_at
                }
            })
            return {
                ...state,
                resumeHealthReports: {
                    ...state.resumeHealthReports,
                    [action.payload.health_check_id]: { ...newHealthReports }
                }
            }

        case UPDATE_RESUME_DASHBOARD_TRANSFORM_VIEWED:
            let newDashboardTransformed = state.resumeDashboard.transformed;
            newDashboardTransformed.forEach(item => {
                item.google_doc_urls.forEach(doc => {
                    if (doc.file_id == action.payload.file_id) {
                        doc.viewed_at = action.payload.viewed_at
                    }
                })
            })
            return {
                ...state,
                resumeDashboard: { ...state.resumeDashboard, transformed: newDashboardTransformed }
            }
        case SET_OPENAI_DOWN_MODAL:
            return {
                ...state,
                openAiDownModal: action.payload
            }
        case SET_HEALTH_CHECK_SOCKET_LOADER:
            return {
                ...state,
                healthCheckSocketLoader: action.payload
            }
        case SET_BG_RESUME_HEALTH_CHECK_ID:
            return {
                ...state,
                bgResumeHealthCheckId: action.payload
            }
        default:
            return state;
    }
}