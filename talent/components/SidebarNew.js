'use client';

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { EditIcon } from '../assets/IconSVG'
import { identityReset } from '../helpers/Mixpanel'
import { SET_PROFILE_DATA, UPDATE_CURRENT_USER } from '../store/actions/actionsTypes'
import { logoutUser, profilePictureSave, profileUpsert, SetProfileAction } from '../store/actions/UserActions'
import { buildFormData } from './Helper'
import Loader from './Loader'
import { validateWordsOnly } from './profile/formValidations'
import { getTalentLogoutDestination } from '../helpers/happyAgentUrlParams'
import './SidebarNew.css'

function SidebarNew({ isSidebarOpen, handleSidebar }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useSelector(state => state.auth);
    const profile = useSelector(state => state.profile);
    const [loading, setLoading] = useState(false);

    const handleProfilePic = async (e) => {
        if (!e.target.files[0]) return
        let name = e.target.name
        let preview = URL.createObjectURL(e.target.files[0])
        let formData = new FormData();
        formData = buildFormData(formData, e.target.files[0], name)
        formData = buildFormData(formData, user.enc_id, 'tid')

        profilePictureSave(formData)(dispatch)
            .then((res) => {
                var talent = { ...profile.profileData }
                talent.profile_pic = name;
                talent.profile_pic_url = preview
                SetProfileAction(talent)(dispatch)
            }).catch((err) => {
                console.log("error encoutered", err)
            });
    }

    const handleLogout = (e) => {
        e.preventDefault();
        identityReset()
        sessionStorage.setItem('manual-logout', true)
        setLoading(false)
        logoutUser()(dispatch)
            .then(res => {
                router.replace(getTalentLogoutDestination({ pathname, search: searchParams.toString() }))
                removeAllKeys()
            })
            .catch(err => {
                sessionStorage.removeItem('manual-logout')
            });
    }

    const [updateLoading, setUpdateLoading] = useState(false)
    const [toggleNameEdit, setToggleNameEdit] = useState(false)
    const [formValue, setFormValue] = useState(user.name)
    const [error, setError] = useState(null)


    useEffect(() => {
        if (!isSidebarOpen && toggleNameEdit && !updateLoading) {
            setToggleNameEdit(false)
            setError(null)
        }
    }, [isSidebarOpen])

    const onChangeName = (e) => {
        setFormValue(e.target.value)
        setError(null)
    }

    const handleNameEdit = () => {
        setToggleNameEdit(true)
        setFormValue(user.name)
    }

    const handleCloseEdit = () => {
        setToggleNameEdit(false)
        setError(null)
    }

    const handleSubmitName = () => {
        let newError = null;
        if (!formValue) {
            newError = "Please enter your name";
        } else {
            if (!validateWordsOnly(formValue)) {
                newError = "Please enter a valid name";
            }
        }
        if (newError) {
            setError(newError)
            return
        }

        let payload = new FormData();
        payload.append('field', 'name');
        payload.append('value', formValue);

        setUpdateLoading(true)

        profileUpsert(payload)(dispatch)
            .then(() => {
                dispatch({
                    type: SET_PROFILE_DATA,
                    payload: {
                        name: formValue,
                    },
                });
                dispatch({
                    type: UPDATE_CURRENT_USER,
                    payload: {
                        name: formValue,
                    },
                })
                handleCloseEdit();
                setUpdateLoading(false)
            })
            .catch(err => {
                if (err.response && err.response.status && err.response.status == 422) {
                    setError(err.response.data.errors.value)
                } else {
                    toast.error('Something went wrong. Please try again')
                }
                setUpdateLoading(false)
            })
    }

    return (
        <>
            {loading && <Loader />}
            {isSidebarOpen && <div className='sidebar-new-backdrop' onClick={handleSidebar}></div>}
            {isSidebarOpen &&
                <div className='sidebar-new'>
                    <div className='sidebar-content'>
                        <div className='close-menu' onClick={handleSidebar}>
                            <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="32" height="32" rx="16" fill="#EEEEEE" />
                                <rect x="5.33301" y="5.33203" width="21.3333" height="21.3333" rx="10.6667" fill="#EEEEEE" />
                                <path d="M21.3327 10.6641L10.666 21.3307" stroke="#676767" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M10.666 10.6641L21.3327 21.3307" stroke="#676767" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className='user-box'>
                            <figure>
                                <img src={user.profile_pic} alt="Profile" className="profile-pic" />
                                <div className='editBox'>
                                    <div className='position-relative'>
                                        <div className="filewrap">
                                            <input id="profilePicSmall" name="profile_pic" type="file" onChange={handleProfilePic} />
                                            <label htmlFor='profilePicSmall' >
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </figure>
                            <div className='right-side'>
                                {updateLoading ?
                                    <span className='loader-line'></span>
                                    :
                                    <>
                                        {toggleNameEdit ?
                                            <div className='edit-form'>
                                                <div className='name-edit-container'>
                                                    <input type="text" value={formValue} onChange={onChangeName} autoFocus />
                                                    <button onClick={handleSubmitName}>Save</button>
                                                </div>
                                                {error && <p className='error-text'>{error}</p>}
                                            </div>
                                            :
                                            <h6>
                                                {user.name}
                                                <button className='edit-btn' onClick={handleNameEdit}><EditIcon /></button>
                                            </h6>
                                        }
                                    </>
                                }
                                <p>{user.email}</p>
                            </div>
                        </div>
                        <hr className='menu-divider' />
                        <div className='menu-box'>
                            <ul className='menu-list'>
                                <li>
                                    <div className='menu-link-btn' onClick={handleLogout}>
                                        <svg width="1rem" height="1.0625rem" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M11.8828 3.125C12.0514 3.1278 12.2135 3.19083 12.3408 3.30176C13.7933 4.54066 14.7168 6.39514 14.7168 8.45703C14.7167 12.1798 11.7059 15.2158 8.00293 15.2158C4.30003 15.2158 1.28329 12.1799 1.2832 8.45703C1.28321 6.40722 2.19605 4.56096 3.63379 3.32227C3.70534 3.26091 3.78844 3.21378 3.87793 3.18457C3.96749 3.15536 4.06236 3.14392 4.15625 3.15137C4.24987 3.15882 4.34115 3.18479 4.4248 3.22754C4.50869 3.2705 4.58342 3.33044 4.64453 3.40234C4.70562 3.47424 4.7522 3.55759 4.78125 3.64746C4.81021 3.73723 4.82184 3.83171 4.81445 3.92578C4.80705 4.01999 4.78103 4.11208 4.73828 4.19629C4.69555 4.28041 4.63698 4.35565 4.56543 4.41699C3.4327 5.39281 2.71778 6.83518 2.71777 8.45703C2.71786 11.4026 5.07768 13.7764 8.00293 13.7764C10.9281 13.7764 13.2831 11.4026 13.2832 8.45703C13.2832 6.92766 12.6464 5.55564 11.624 4.58594L11.415 4.39746C11.3057 4.30617 11.2257 4.18377 11.1855 4.04688C11.1455 3.91009 11.1469 3.76395 11.1895 3.62793C11.2321 3.49191 11.314 3.37146 11.4248 3.28223C11.5357 3.19299 11.6709 3.1391 11.8125 3.12695H11.8135C11.8362 3.12538 11.8591 3.1244 11.8818 3.125H11.8828ZM7.99219 1.78223C8.08753 1.78114 8.18219 1.79888 8.27051 1.83496C8.35897 1.87116 8.43929 1.92534 8.50684 1.99316C8.57439 2.06101 8.62804 2.14165 8.66406 2.23047C8.70001 2.31913 8.71786 2.41405 8.7168 2.50977V7.86816C8.71674 8.0591 8.64134 8.24287 8.50684 8.37793C8.37242 8.51275 8.19005 8.58878 8 8.58887C7.80976 8.58887 7.62669 8.51293 7.49219 8.37793C7.35768 8.24287 7.28228 8.0591 7.28223 7.86816V2.50977L7.29492 2.36914C7.30352 2.32314 7.31657 2.27804 7.33398 2.23438C7.36905 2.14657 7.42041 2.06569 7.48633 1.99805C7.5522 1.93045 7.63112 1.87697 7.71777 1.83984C7.80449 1.80271 7.89792 1.78315 7.99219 1.78223Z" fill="#6B6B6B" stroke="#6B6B6B" strokeWidth="0.1" />
                                        </svg>
                                        <span>Log out</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default SidebarNew;



function removeAllKeys() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key != "uplers_auto_fill" && !key.toLocaleLowerCase().includes('resume')) {
            localStorage.removeItem(key);
        }
    }
}
