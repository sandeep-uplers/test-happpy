'use client';

import { SET_PROFILE_DATA, UPDATE_PROFILE_DATA, SET_PROFILE_PERCENT, SET_PROFILE_STATE, REMOVE_PROFILE_STATE, SET_MASTERS, UPDATE_MASTER_DATA, SET_PROFILE_REM_PERCENT, SET_TALENT_PREFERENCES, SET_JOB_FUNCTION_MASTER, TOGGLE_MANAGE_PREFERENCES_MODAL } from '../actions/actionsTypes';

const initialState = {
    profileData: { experiences: [], educations: [], projects: [], certifications: [], testimonials: [], tools: [], skills: [], primaryskills: [] },
    profilePercent: { overall: null },
    remainingPercent: {},
    masters: {},
    recommend: {},
    preferences: {},
    jobFunctionMaster: [],
    managePreferencesModal: false
}

export default function (state = initialState, action) {
    switch (action.type) {        
        case TOGGLE_MANAGE_PREFERENCES_MODAL:
        return {
            ...state,
            managePreferencesModal: action.payload
        }

        case SET_PROFILE_PERCENT:
            return {
                ...state,
                profilePercent: { ...state.profilePercent, ...action.payload }
            }
        case SET_PROFILE_REM_PERCENT:
            return {
                ...state,
                remainingPercent: { ...action.payload }
            }
        case SET_PROFILE_DATA:
            return {
                ...state,
                profileData: { ...state.profileData, ...action.payload }
            }
        case UPDATE_PROFILE_DATA:
            return {
                ...state,
                profileData: { ...state.profileData, ...action.payload }
            }
        case SET_MASTERS:
            return {
                ...state,
                masters: { ...action.payload }
            }
        case UPDATE_MASTER_DATA:
            return {
                ...state,
                masters: { ...state.masters, ...action.payload }
            }
        case SET_PROFILE_STATE: return { ...action.payload }
        case REMOVE_PROFILE_STATE:
            return initialState

        case SET_TALENT_PREFERENCES:
            return {
                ...state,
                preferences: action.payload
            }
        case SET_JOB_FUNCTION_MASTER:
            return {
                ...state,
                jobFunctionMaster: action.payload
            }
        default:
            return state;
    }
}