'use client';

import { updateMixpanelUserDetails } from '../../helpers/Mixpanel';
import isEmpty from '../../validation/is-empty';
import { HYDRATE_AUTH, LOGOUT_USER, SET_CURRENT_USER, SET_LOGGED_OUT, SET_OUTREACH_DATA, UPDATE_CURRENT_USER } from '../actions/actionsTypes';

/*
 * The ATS version read localStorage here, at module scope. That cannot work
 * under server rendering: the module is evaluated on the server, where
 * localStorage does not exist, so importing it threw before any component
 * rendered. It would also have desynced the server and client markup.
 *
 * The store therefore starts logged out and is hydrated from localStorage
 * immediately after mount, dispatched from app/providers.js. Read `isAuthReady`
 * if you need to tell "logged out" apart from "not hydrated yet".
 */
const initialState = {
    isAuthenticated: false,
    user: {},
    loggedOut: false,
    isAuthReady: false
}

/** Read the persisted session. Safe on the server, where it returns empties. */
export const readStoredAuth = () => {
    if (typeof window === 'undefined') return { token: null, user: {} };
    let user = {};
    try {
        const raw = localStorage.getItem('user');
        if (raw && raw !== 'undefined') user = JSON.parse(raw) || {};
    } catch (e) {
        user = {};
    }
    return { token: localStorage.getItem('token'), user };
}

const writeUser = (user) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
        /* private mode / quota — in-memory state stays correct for this session */
    }
}

const clearUser = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem('user');
    } catch (e) {
        /* see writeUser */
    }
}

export default function (state = initialState, action) {
    switch (action.type) {
        case HYDRATE_AUTH: {
            const { token, user } = action.payload;
            return {
                ...state,
                isAuthenticated: !!token,
                user: user || {},
                isAuthReady: true
            };
        }
        case SET_CURRENT_USER: {
            const clearing = isEmpty(action.payload);
            const nextUser = clearing ? {} : { ...state.user, ...action.payload };
            if (clearing || isEmpty(nextUser)) {
                clearUser();
            } else {
                writeUser(nextUser);
            }
            return {
                ...state,
                isAuthenticated: !clearing,
                user: nextUser,
            };
        }
        case UPDATE_CURRENT_USER:
            writeUser({ ...state.user, ...action.payload })
            updateMixpanelUserDetails()
            return {
                ...state,
                user: { ...state.user, ...action.payload }
            }
        case SET_OUTREACH_DATA:
            let newUser = {
                ...state.user,
                outreach: { ...state.user.outreach, ...action.payload }
            }
            writeUser(newUser)
            return {
                ...state,
                user: newUser
            }
        case SET_LOGGED_OUT:
            return {
                ...state,
                loggedOut: action.payload
            }
        case LOGOUT_USER:
            return {
                ...state,
                isAuthenticated: false,
                user: {}
            }
        default:
            return state;
    }
}