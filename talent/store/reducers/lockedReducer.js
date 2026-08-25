'use client';

import { REMOVE_SINGLE_LOCK, REMOVE_NESTED_LOCK } from '../actions/actionsTypes';

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {
        case REMOVE_SINGLE_LOCK:
            return action.payload;
        case REMOVE_NESTED_LOCK:
            var s = action.payload.section
            var i = action.payload.uuid
            let k = s+"-"+i
            let output = {};
            output[k] = true
            return output
        default:
            return state;
    }
}