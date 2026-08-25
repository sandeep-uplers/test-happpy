'use client';

import { SET_SUCCESS, REMOVE_SUCCESS, SET_NOTIFY_SUCCESS } from '../actions/actionsTypes';

const initialState = {
    notifySuccess: { open: false, msg: '' },
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_SUCCESS:
            return action.payload;
        case SET_NOTIFY_SUCCESS:
            return {
                ...state,
                notifySuccess: action.payload
            }
        default:
            return state;
    }
}