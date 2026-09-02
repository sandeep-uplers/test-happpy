import Cookies from 'js-cookie';
import { API_URL } from "../../components/Constant";
import { GET_API, POST_API } from "../../components/Helper";
import { setCurrentUser } from './UserActions';
import { SET_LOADER } from './actionsTypes';

const API_CHECK_TALENT_EXIST = API_URL + "new-signup/check-talent-exist";
// const API_NEW_GUEST_TALENT = API_URL + "new-signup/create-new-talent-account";
// const API_CREATE_GUEST_PASSWORD = API_URL + "new-signup/generate-password";
const API_SOCIAL_GOOGLE_CALLABCK = API_URL + "new-signup/google-callback";
const API_SOCIAL_LINKEDIN_CALLABCK = API_URL + "new-signup/linkedin-callback";

export const checkTalentExist = (payload) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        POST_API(API_CHECK_TALENT_EXIST, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    resolve(res)
                }
                else {
                    reject(res)
                }
            })
            .catch(err => reject(err))
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

// export const createGuestPassword = (payload) => (dispatch) => {
//     let guest_token = localStorage.getItem('guest_token');

//     dispatch({ type: SET_LOADER, payload: true })
//     return new Promise((resolve, reject) => {
//         POST_API(API_CREATE_GUEST_PASSWORD, payload)
//             .then((res) => {
//                 if (res.data.status === 200) {
//                     dispatch(setCurrentUser({
//                         token: guest_token
//                     }));
//                     Cookies.remove('guest_token')
//                     localStorage.removeItem('guest_token')
//                     Cookies.set('token', guest_token)
//                     localStorage.setItem('token', guest_token)
//                     resolve(res)
//                 }
//                 else {
//                     reject(res)
//                 }
//             })
//             .catch(err => reject(err))
//             .finally(() => dispatch({ type: SET_LOADER, payload: false }))
//     })
// }

export const socialGoogleCallback = (accessToken, type) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        const payload = {"provider": "google", "code": accessToken, "type": type}
        POST_API(API_SOCIAL_GOOGLE_CALLABCK, payload)
            .then((res) => {
                if (res.data.status === 200 && res.data?.data?.authtoken) {
                    let authToken=res.data.data.authtoken
                    dispatch(setCurrentUser({
                        token: authToken
                    }));
                    Cookies.set('token', authToken)
                    localStorage.setItem('token', authToken)
                    resolve(res)
                }
                else {
                    reject(res)
                }
            })
            .catch(err => reject(err))
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}

export const socialLinkedinCallback = (accessToken) => (dispatch) => {
    dispatch({ type: SET_LOADER, payload: true })
    return new Promise((resolve, reject) => {
        const payload = {"provider": "linkedin", "code": accessToken}
        POST_API(API_SOCIAL_LINKEDIN_CALLABCK, payload)
            .then((res) => {
                if (res.data.status === 200) {
                    let authToken=res.data.data.authtoken
                    dispatch(setCurrentUser({
                        token: authToken
                    }));
                    Cookies.set('token', authToken)
                    localStorage.setItem('token', authToken)
                    resolve(res)
                }
                else {
                    reject(res)
                }
            })
            .catch(err => reject(err))
            .finally(() => dispatch({ type: SET_LOADER, payload: false }))
    })
}