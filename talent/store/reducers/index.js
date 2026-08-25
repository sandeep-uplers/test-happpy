'use client';

import { combineReducers } from 'redux';
import errorReducer from './errorReducer';
import authReducer from './authReducer';
import successReducer from './successReducer';
import lockedReducer from './lockedReducer';
import profileReducer from './profileReducer';
import loadingReducer from './loadingReducer';
import workReducer from './workReducer';
import miscReducer from './miscReducer';
import permissionsReducer from './permissionsReducer';
import oppsReducer from './oppsReducer';
import resumeReducer from './resumeReducer';
import resumeEditorReducer from './resumeEditorReducer';
import happpyAgentReducer from './happpyAgentReducer';

export default combineReducers({
    errors: errorReducer,
    success: successReducer,
    locked: lockedReducer,
    auth: authReducer,
    profile: profileReducer,
    loader: loadingReducer,
    work: workReducer,
    misc: miscReducer,
    opps: oppsReducer,
    resume: resumeReducer,
    resumeEditor: resumeEditorReducer,
    happpyAgent: happpyAgentReducer,
    permissionsReducer
});