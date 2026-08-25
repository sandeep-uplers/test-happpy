'use client';

import { SET_ERRORS, REMOVE_ERRORS, REMOVE_BULK_ERRORS, SET_BULK_ERRORS, SET_FORM_ERRORS,CLEAN_SLATE, SET_NETWORK_ERROR, REMOVE_NETWORK_ERROR } from '../actions/actionsTypes';

const initialState = {
    networkError: null
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_FORM_ERRORS:
            return action.payload
        case SET_ERRORS:
            return { ...state, ...action.payload }
        case CLEAN_SLATE:
            return {}
        case REMOVE_ERRORS:
            var newState = JSON.parse(JSON.stringify(state));
            Object.keys(action.payload).forEach(key => {
                if (key in newState) {
                    delete newState[key]
                }
            })
            return newState
        case SET_BULK_ERRORS:
            var s = action.payload.section
            var i = action.payload.uuid
            var newState = JSON.parse(JSON.stringify(state));
            if (!(s in newState)) {
                newState[s] = {}
            }
            if (!(i in newState[s])) {
                newState[s][i] = {}
            }
            newState[s][i] = action.payload.errors
            return newState
        case REMOVE_BULK_ERRORS:
            var s = action.payload.section
            var i = action.payload.uuid
            var newState = JSON.parse(JSON.stringify(state));
            if ((s in newState) && (i in newState[s])) {
                delete newState[s][i]
            }
            return newState
        case SET_NETWORK_ERROR:
            return { ...state, networkError: action.payload };
        case REMOVE_NETWORK_ERROR:
            return { ...state, networkError: null };
        default:
            return state;
    }
}