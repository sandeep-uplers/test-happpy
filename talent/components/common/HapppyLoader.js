'use client';

import React from 'react';

const HAPPPY_TEAL = '#46ECCD';

/**
 * Happpy-branded loading indicator — teal pulsing dots (matches UTS PageLoadingFallback job-agent style).
 */
export default function HapppyLoader({ size = 'md', className = '', label }) {
    const dotSize = size === 'sm' ? 8 : size === 'lg' ? 12 : 10;
    const gap = size === 'sm' ? 5 : 8;

    return (
        <div
            className={['happpy-loader', className].filter(Boolean).join(' ')}
            role="status"
            aria-label={label || 'Loading'}
            aria-live="polite"
        >
            <style>{`
                .happpy-loader {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .happpy-loader__dots {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: ${gap}px;
                }
                .happpy-loader__dot {
                    width: ${dotSize}px;
                    height: ${dotSize}px;
                    border-radius: 50%;
                    background-color: ${HAPPPY_TEAL};
                    animation: happpy-loader-pulse 1.4s ease-in-out infinite;
                }
                .happpy-loader__dot:nth-child(1) { animation-delay: 0s; }
                .happpy-loader__dot:nth-child(2) { animation-delay: 0.2s; }
                .happpy-loader__dot:nth-child(3) { animation-delay: 0.4s; }
                @keyframes happpy-loader-pulse {
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
            <span className="happpy-loader__dots" aria-hidden="true">
                <span className="happpy-loader__dot" />
                <span className="happpy-loader__dot" />
                <span className="happpy-loader__dot" />
            </span>
        </div>
    );
}
