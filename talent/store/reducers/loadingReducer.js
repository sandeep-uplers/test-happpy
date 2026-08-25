'use client';

import { SET_DOWNLOAD_TAILOR_RESUME_LOADER, SET_LOADER, SET_ME_LOADER } from '../actions/actionsTypes';

const initialState = {
    isLoading: false,
    meLoading: false,
    profileOpenForm: false,
    downloadTailorResume: false,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_LOADER:
            return {
                ...state,
                isLoading: action.payload
            }
        case SET_ME_LOADER:
            return {
                ...state,
                meLoading: action.payload
            }
        case SET_DOWNLOAD_TAILOR_RESUME_LOADER:
            return {
                ...state,
                downloadTailorResume: action.payload
            }
        default:
            return state;
    }
}