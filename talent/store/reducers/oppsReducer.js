'use client';

import { ADD_SIMILAR_JOBS, HR_UPDATE_COMPLETED, HR_UPDATE_NEEDED, SET_ALL_JOBS, SET_BOOKMARK_COUNT, SET_BOOKMARK_SIMILAR_JOBS, SET_HR_COMPANY_DETAILS, SET_TRIGGER_ALL_JOBS_RESET } from '../actions/actionsTypes';

const initialState = {
    hrTobeUpdated: {},
    similarJobs: {},
    bookmarkCount: '',
    allJobs: [],
    hrCompanyDetails: {},
    triggerAllJobsReset: false
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_ALL_JOBS:
            return {
                ...state,
                allJobs: action.payload
            }
        case HR_UPDATE_NEEDED:
            return {
                ...state,
                hrTobeUpdated: { ...state.hrTobeUpdated, [action.payload.HR_Number]: action.payload }
            }
        case HR_UPDATE_COMPLETED:
            let newHrTobeUpdated = { ...state.hrTobeUpdated }
            delete newHrTobeUpdated[action.payload.HR_Number]
            return {
                ...state,
                hrTobeUpdated: { ...newHrTobeUpdated }
            }

        case ADD_SIMILAR_JOBS:
            return {
                ...state,
                similarJobs: { ...state.similarJobs, [action.payload.HR_Number]: action.payload.data }
            }

        case SET_BOOKMARK_COUNT:
            return {
                ...state,
                bookmarkCount: action.payload
            }
        case SET_BOOKMARK_SIMILAR_JOBS:
            let allJobs = [...state.allJobs]
            allJobs.forEach(item => {
                if (item.HR_Number == action.payload.HR_Number) {
                    item.is_saved = action.payload.data
                }
            })
            let hrSimilarJobs = [...state.similarJobs[action.payload.similarToHR]];
            hrSimilarJobs.forEach(item => {
                if (item.HR_Number == action.payload.HR_Number) {
                    item.is_saved = action.payload.data
                }
            })
            return {
                ...state,
                similarJobs: {
                    ...state.similarJobs,
                    [action.payload.HR_Number]: hrSimilarJobs
                },
                allJobs: allJobs,
                bookmarkCount: action.payload.data ? state.bookmarkCount + 1 : state.bookmarkCount - 1
            }


        case SET_HR_COMPANY_DETAILS:
            return {
                ...state,
                hrCompanyDetails: { ...state.hrCompanyDetails, [action.payload.HR_Number]: action.payload.data }
            }
            
        case SET_TRIGGER_ALL_JOBS_RESET:
            return {
                ...state,
                triggerAllJobsReset: action.payload
            }

        default:
            return state;
    }
}