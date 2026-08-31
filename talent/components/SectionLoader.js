import React, { Component } from 'react';
import { IMAGE_URL } from './Constant'
export default function SectionLoader() {
    return (
        <div className="sectionLoader" >
            <div className="dot-spinner">
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
                <div className="dot-spinner__dot"></div>
            </div>
        </div>
    )
}

export const BarLoader = ({ styleClass }) => {
    return (
        <div className={`sectionLoader ${styleClass}`}>
            <div class="bar-loader">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    )
}

export const IosLoader = ({ loaderStyle, whiteLoader = false }) => {
    return (
        <div className={`iosLoader ${whiteLoader ? 'white' : ''}`} style={loaderStyle}>
            <div className="spinner center">
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
                <div className="spinner-blade"></div>
            </div>
        </div>
    )
}

export const JobDetailLoader = () => {
    return (
        <div className="jobDetailLoader">
            <div class="loader">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
                <div class="bar4"></div>
                <div class="bar5"></div>
                <div class="bar6"></div>
                <div class="bar7"></div>
                <div class="bar8"></div>
                <div class="bar9"></div>
                <div class="bar10"></div>
                <div class="bar11"></div>
                <div class="bar12"></div>
            </div>
        </div>
    )
}