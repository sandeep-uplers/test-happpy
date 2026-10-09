'use client';

import { useId } from "react";

/** Figma hero — completed step check (was progress-step-check.svg) */
export function HappyHeroProgressStepCheckIcon({ className, width = 16, height = 16 }) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16.0002 16.0002"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <circle cx="8.00022" cy="8.00022" r="7.6" fill="#231F20" stroke="#231F20" strokeWidth="0.8" />
            <path
                d="M11.9998 4.99959L6.4998 10.4996L3.9998 7.99959"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Figma hero — status row sparkle (was progress-status-sparkle.svg) */
export function HappyHeroProgressStatusSparkleIcon({ className, width = 24, height = 24 }) {
    const uid = useId().replace(/:/g, "");
    const gradA = `happy-hero-status-sparkle-a-${uid}`;
    const gradB = `happy-hero-status-sparkle-b-${uid}`;

    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 24.4028 24.4028"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path
                d="M7.11719 14.2347C11.0481 14.2347 14.2347 11.0481 14.2347 7.11719C14.2347 11.0481 17.4213 14.2347 21.3521 14.2347C17.4213 14.2347 14.2347 17.4213 14.2347 21.3521C14.2347 17.4213 11.0481 14.2347 7.11719 14.2347Z"
                fill={`url(#${gradA})`}
            />
            <path
                d="M3.05078 6.60756C5.0162 6.60756 6.60952 5.01425 6.60952 3.04883C6.60952 5.01425 8.20284 6.60756 10.1683 6.60756C8.20284 6.60756 6.60952 8.20088 6.60952 10.1663C6.60952 8.20088 5.0162 6.60756 3.05078 6.60756Z"
                fill={`url(#${gradB})`}
            />
            <defs>
                <linearGradient
                    id={gradA}
                    x1="14.2347"
                    y1="7.11719"
                    x2="14.6947"
                    y2="28.5293"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#2DC9A7" />
                    <stop offset="1" stopColor="#31DCB1" stopOpacity="0" />
                </linearGradient>
                <linearGradient
                    id={gradB}
                    x1="6.60952"
                    y1="3.04883"
                    x2="6.83956"
                    y2="13.7549"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor="#2DC9A7" />
                    <stop offset="1" stopColor="#31DCB1" stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/** Figma 3523:5751 — live results eyebrow separator */
export function HappyLiveResultsEyebrowSparkleIcon({ className, width = 8, height = 8 }) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 8 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path
                d="M4 0L4.928 3.072L8 4L4.928 4.928L4 8L3.072 4.928L0 4L3.072 3.072L4 0Z"
                fill="currentColor"
            />
        </svg>
    );
}

/** Figma hero — trust chip sparkle (was trust-chip-sparkle.svg) */
export function HappyHeroTrustChipSparkleIcon({ className, width = 16, height = 16 }) {
    return (
        <svg
            className={className}
            width={width}
            height={height}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
        >
            <path
                d="M8.47408 12.4429C8.7982 11.5421 9.32104 10.6946 10.042 9.96961L10.0552 9.95644C10.7773 9.23432 11.6208 8.71035 12.5182 8.38336C13.0771 8.18007 13.6566 8.05294 14.2402 8.00312C13.6583 7.97105 13.0805 7.86167 12.5233 7.67613C11.5882 7.36575 10.712 6.83948 9.96986 6.09732C9.22827 5.35573 8.70143 4.47842 8.39105 3.54385C8.19176 2.94485 8.08124 2.3218 8.05891 1.69531L8.03485 1.71936C7.99191 2.34127 7.86191 2.95859 7.64545 3.55244C7.31961 4.44578 6.79677 5.28644 6.07866 6.00684L6.07351 6.01199C5.35597 6.72953 4.5176 7.25236 3.62598 7.57935C3.02813 7.79868 2.40679 7.92982 1.78088 7.97334L1.77344 7.98078C2.39878 8.00312 3.02011 8.11364 3.61796 8.31178C4.55368 8.62273 5.43213 9.149 6.17487 9.89231C6.91818 10.6356 7.44387 11.5129 7.75483 12.4492C7.95354 13.0471 8.06406 13.6684 8.08639 14.2937L8.0904 14.2897C8.12992 13.6638 8.25762 13.0413 8.47294 12.4423L8.47408 12.4429Z"
                fill="#086D7E"
            />
        </svg>
    );
}
