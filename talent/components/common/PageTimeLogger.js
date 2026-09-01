import React, { useState, useEffect } from 'react';
import { useLocation } from "@/talent/navigation/routerCompat";
import { pageTimeTracking } from '../../helpers/Mixpanel';
import { useSelector } from 'react-redux';


const PageTimeLogger = ({ pageName, hrData }) => {

    const location = useLocation();
    const { user } = useSelector(state => state?.auth);
    const [isTabActive, setIsTabActive] = useState(true);

    // useEffect(() => {
    //     let interval;
    //     const logMessage = () => {
    //         const url = location?.pathname;
    //         pageTimeTracking(url, pageName, user, hrData);
    //     };

    //     const startLogging = () => {
    //         interval = setInterval(logMessage, 10000); // Log every 10 seconds
    //     };

    //     const stopLogging = () => {
    //         if (interval) {
    //             clearInterval(interval);
    //         }
    //     };

    //     const handleVisibilityChange = () => {
    //         if (document.hidden) {
    //             stopLogging(); // Pause when the tab is not active
    //             setIsTabActive(false);
    //         } else {
    //             startLogging(); // Resume when the tab becomes active again
    //             setIsTabActive(true);
    //         }
    //     };

    //     document.addEventListener('visibilitychange', handleVisibilityChange);

    //     // Start logging immediately when component mounts
    //     if (isTabActive) {
    //         startLogging();
    //     }

    //     return () => {
    //         document.removeEventListener('visibilitychange', handleVisibilityChange);
    //         stopLogging(); // Clean up on component unmount
    //     };
    // }, [isTabActive, hrData]);

    return (
        <></>
    );
};

export default PageTimeLogger;
