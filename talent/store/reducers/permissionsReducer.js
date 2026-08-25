'use client';

import { SET_PERMISSION_DATA, SET_DEVICE_INFO, RESET_PERMISSION_DATA } from '../actions/actionsTypes';

const initialState = {
    permissionsGranted: { camera: "", microphone: "", system: "granted" },
    deviceInfo: { cameraAvailable: true, microphoneAvailable: true }
};
const defaultState = {
    permissionsGranted: { camera: "", microphone: "", system: "granted" },
    deviceInfo: { cameraAvailable: true, microphoneAvailable: true }
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_PERMISSION_DATA:
            return {
                ...state,
                permissionsGranted: {
                    ...state.permissionsGranted,
                    ...action.payload
                }
            }
        case SET_DEVICE_INFO:
            return {
                ...state,
                deviceInfo: {
                    ...state.deviceInfo,
                    ...action.payload
                }
            }
        case RESET_PERMISSION_DATA:
            return defaultState;
        default:
            return state;
    }
}