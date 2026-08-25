'use client';

import React from 'react';
// import FireWorksCelebrration from './Fireworks';
// import { useSelector } from 'react-redux';
export default function Loader({ pageLoader = false }) {
    // const { isAuthenticated } = useSelector(state => state.auth)
    return (
        <>
            <div className={`appLoader ${pageLoader ? "pageLoader" : ''}`}>
                <div className='loaderSvg'>
                    <svg width="70" height="70" viewBox="0 0 25 20" fill="none" className='loader-logo' xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.685 1.46212C21.3722 0.187085 19.4536 -0.303313 17.6696 0.187086L11.1059 1.85444C7.53794 2.76985 -1.4493 4.50259 0.200044 8.39309C1.91671 12.5124 7.43696 17.0895 11.6108 18.6588C17.7706 21.0127 21.0356 16.8279 22.4157 12.5124C22.4494 12.4144 22.483 12.3163 22.5167 12.2509V12.2182L22.5503 12.1528C22.6513 11.8586 22.7186 11.5643 22.786 11.2701L24.065 6.3988C24.5026 4.60067 23.9977 2.73716 22.685 1.46212Z" fill="#DDDDDD" />
                        <path d="M19.9601 5.28693L18.3444 11.466C18.2097 11.891 17.8395 12.1852 17.4019 12.1852C16.9643 12.1852 16.5604 11.8583 16.4931 11.4006L15.9545 8.78511C15.9209 8.62164 15.8199 8.45817 15.6852 8.29471C15.5506 8.16394 15.3823 8.06586 15.1803 8.03316L12.4875 7.51007C12.2856 7.47738 12.1173 7.3793 11.9826 7.24852C11.8143 7.08506 11.7133 6.85621 11.6797 6.62735C11.6797 6.20234 11.9826 5.81002 12.4202 5.71194L18.782 4.10997C19.1186 4.04459 19.4552 4.10997 19.6908 4.33883C19.9601 4.63307 20.0611 4.96 19.9601 5.28693Z" fill="#303030" />
                    </svg>
                </div>
            </div>
            {/* {isAuthenticated && process.env.NEXT_PUBLIC_APP_ENV != 'production' && <FireWorksCelebrration />} */}
        </>
    )
}
