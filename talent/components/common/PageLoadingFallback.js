'use client';

import React from 'react';
import { LogoSVG } from '../../assets/Logo';
import { useLocation } from '@/talent/navigation/routerCompat';
import { isHapppyAgentFaviconPath } from '../../helpers/happpyAgentFavicon';
import HapppyBatLoader from './HapppyBatLoader';

const PageLoadingFallback = () => {
    const location = useLocation();
    const isHapppyPage = isHapppyAgentFaviconPath(location.pathname);

    if (isHapppyPage) {
        return <HapppyBatLoader />;
    }

    return (
        <>
            <style>{`
                .page-loading-fallback {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }

                .page-loading-fallback .loader-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                }

                .page-loading-fallback .loading-dots {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 8px;
                }

                .page-loading-fallback .dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background-color: #FFDA30;
                    animation: pulse 1.4s ease-in-out infinite;
                }

                .page-loading-fallback .dot:nth-child(1) {
                    animation-delay: 0s;
                }

                .page-loading-fallback .dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .page-loading-fallback .dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes pulse {
                    0%, 80%, 100% {
                        opacity: 0.3;
                        transform: scale(0.8);
                    }
                    40% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
            `}</style>
            <div className="page-loading-fallback">
                <div className="loader-content">
                    <div className="uplers-logo">
                        <LogoSVG />
                    </div>
                    <div className="loading-dots">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PageLoadingFallback;
