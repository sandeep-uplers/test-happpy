'use client';

import { ADD_SEARCH_FILTER, ALL_OPP_MASTER_VALUE, CLOSE_SIGNUP_APPLY_FLOW, MODIFY_APPLY_DATA, ON_APPLY_STEP_STARTED, OPEN_SIGNUP_APPLY_FLOW, PUSH_TAILOR_TO_LOGGING_USER, SET_FORCE_REGISTRATION, SET_OPP_MASTER, SET_OPP_READY_FILTERS, SET_SINGLEHR_REDIRECT, SET_TOUCHPOINT_DATA, TOGGLE_ASK_APPLIED, UPDATE_ALL_OPP_FILTERS, UPDATE_HRDATA_TO_APPLY, UPDATE_WORK_CONTROL } from '../actions/actionsTypes';

const initialState = {
    singleHrRedirect: { confirmRedirect: false, showRedirectModal: false },
    forceRegistration: false,
    openSignupFlow: false,
    applyingHrNo: "HR123",
    applyFlowData: {
        HR123: {
            touchPointQues: [],
            touchPointMaster: [],
            customTocuhpointQues: {},
            applyStepStarted: false,
            control: { afterTouchPointSteps: false, applySteps: {}, applyStatus: {} },
            hrDataToApply: {},
        }
    },
    talentApplyData: {},

    // aggregatorApplyFlow: false,
    confirmAggApplied: {},
    allOppMasterValue: {
        jobPostedDateMaster: [
            { "label": "Within 24 Hours", value: "1" },
            { "label": "Within 3 days", value: "2" },
            { "label": "Within 1 week", value: "3" },
            { "label": "Within 1 month", value: "4" }
        ]
    },
    filters: { search: '', job_count_status: "" },
    oppFilterMaster: {
        locationMaster: []
    },
    readyFilters: {},
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_SINGLEHR_REDIRECT:
            return {
                ...state,
                singleHrRedirect: { ...state.singleHrRedirect, ...action.payload }
            }
        case OPEN_SIGNUP_APPLY_FLOW:
            return {
                ...state,
                openSignupFlow: true,
                applyingHrNo: action.payload.HR_Number,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: {
                        ...state.applyFlowData[action.payload.HR_Number],
                        hrDataToApply: action.payload,
                        partner_job_tailor: action.payload.partner_job_tailor || false,
                        non_paid_user_logging: false,
                        logging_user: false,
                        control: { afterTouchPointSteps: false, applySteps: {}, applyStatus: {}, },
                    }
                }
            }
        case UPDATE_HRDATA_TO_APPLY:
            let newData = {
                ...state.applyFlowData[action.payload.HR_Number],
                hrDataToApply: action.payload
            }
            if (!newData.control) {
                newData.control = { afterTouchPointSteps: false, applySteps: {}, applyStatus: {} }
            }

            return {
                ...state,
                applyingHrNo: action.payload.HR_Number,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: newData
                }
            }

        case PUSH_TAILOR_TO_LOGGING_USER:
            return {
                ...state,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: {
                        ...state.applyFlowData[action.payload.HR_Number],
                        partner_job_tailor: true,
                        logging_user: true,
                        non_paid_user_logging: action.payload.non_paid_user_logging || false
                    }
                }
            }

        case CLOSE_SIGNUP_APPLY_FLOW:
            return {
                ...state,
                openSignupFlow: false,
            }
        case SET_TOUCHPOINT_DATA:
            let touchPointQues = action.payload.touchPointQues.map(item => {
                if (item.question_key === 'current_ctc' || item.question_key === 'expected_ctc') {
                    item.answer = item.answer ? Math.round(item.answer / 100000 * 100) / 100 : ''
                }
                return item
            })
            return {
                ...state,
                talentApplyData: action.payload.talent,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: {
                        ...state.applyFlowData[action.payload.HR_Number],
                        touchPointQues: [...touchPointQues],
                        applyStepStarted: false,
                        touchPointMaster: action.payload.touchPointMaster,
                        customTocuhpointQues: action.payload.customTocuhpointQues
                    }
                }
            }
        case ON_APPLY_STEP_STARTED:
            return {
                ...state,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: {
                        ...state.applyFlowData[action.payload.HR_Number],
                        applyStepStarted: true,
                    }
                }
            }

        case MODIFY_APPLY_DATA:
            return {
                ...state,
                talentApplyData: { ...state.talentApplyData, ...action.payload },
            }
        case UPDATE_WORK_CONTROL:
            let currentControl = {}
            if (state.applyFlowData[action.payload.HR_Number]) {
                currentControl = { ...state.applyFlowData[action.payload.HR_Number].control }
            }
            return {
                ...state,
                applyFlowData: {
                    ...state.applyFlowData,
                    [action.payload.HR_Number]: {
                        ...state.applyFlowData[action.payload.HR_Number],
                        control: { ...currentControl, ...action.payload }
                    }
                }
            }


        // case TOGGLE_AGGREGATOR_FLOW:
        //     return {
        //         ...state,
        //         aggregatorApplyFlow: action.payload
        //     }
        case TOGGLE_ASK_APPLIED:
            let newConfirm = { ...state.confirmAggApplied }
            if (action.payload.type === "insert") {
                newConfirm[action.payload.hrId.trim()] = true
            } else {
                delete newConfirm[action.payload.hrId.trim()]
            }
            return {
                ...state,
                confirmAggApplied: newConfirm
            }
        case SET_FORCE_REGISTRATION:
            return {
                ...state,
                forceRegistration: true
            }


        case ALL_OPP_MASTER_VALUE:
            return {
                ...state,
                allOppMasterValue: { ...state?.allOppMasterValue, ...action.payload }
            }

        case SET_OPP_MASTER:
            return {
                ...state,
                oppFilterMaster: { ...state.oppFilterMaster, ...action.payload }
            }
        case SET_OPP_READY_FILTERS:
            return {
                ...state,
                readyFilters: { ...state.readyFilters, ...action.payload },
            }
        case UPDATE_ALL_OPP_FILTERS:
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
            }
        case ADD_SEARCH_FILTER:
            return {
                ...state,
                filters: { ...state.filters, search: action.payload },
            }
        default:
            return state;
    }
}