'use client';

import { legacy_createStore as createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';

const inititalState = {};

/*
 * Two import shapes changed relative to the ATS copy, because this project is
 * on Redux 5 / redux-thunk 3 (the versions that support React 19):
 *   - `createStore` is deprecated in Redux 5 and logs a warning; the behaviour
 *     we want is the same store factory, exported as `legacy_createStore`.
 *   - redux-thunk 3 dropped its default export in favour of a named `thunk`.
 * The resulting store is identical to the one the ATS builds.
 */
const store = createStore(
        rootReducer,
        inititalState,
        compose(
                applyMiddleware(thunk),
                // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
        )
);

export default store;
