'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from '@/talent/navigation/routerCompat';
import HapppyChatbot from './HapppyChatbot';
import './HapppyChatPage.css';

const HapppyChatPage = () => {
    const chatbotEnabled = useSelector((state) => state.auth?.user?.outreach?.chatbot === true);

    if (!chatbotEnabled) {
        return <Navigate to="/talent/job-agent" replace />;
    }

    return (
        <>
            <div className="happpy-chat-page">
                <HapppyChatbot variant="fullscreen" />
            </div>
        </>
    );
};

export default HapppyChatPage;
