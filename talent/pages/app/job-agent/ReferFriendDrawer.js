import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { API_OUTREACH_INVITE_TO_MULTIPLE_FRIENDS, API_OUTREACH_REFERRAL_LIST, IMAGE_URL } from '../../../components/Constant';
import { GET_API, POST_API } from '../../../components/Helper';

const REFERRAL_LINK_BASE = 'https://platform.uplers.com/talent/happpy-ai-agent?r=';
const COPIED_RESET_MS = 4000;
/** Figma 673:48879 — replace with permanent CDN asset when available. */
const REFERRALS_EMPTY_MASCOT_SRC = IMAGE_URL + 'outreach/' + 'mascot-empty-list.svg';

const EMPTY_REFERRAL_REWARDS = {
    discount_percent: 0,
    maxed_out: false,
    eligible_paid_count: 0,
    eligible_count: 0,
    reward_mode: 'paid_conversion',
    trials_per_reward: null,
    referrals: [],
};

const DEFAULT_SHARE_MESSAGE =
    'Join me on Happpy Agent — get an extended 10-day trial and let AI handle your job referral outreach.';

function getHowItWorksSteps(isFreeReferrer) {
    return [
        {
            id: 1,
            content: 'Share your link with a friend who is job hunting.',
        },
        {
            id: 2,
            content: (
                <>
                    They start a 10-day trial{' '}
                    <strong className="jad-refer-friend-drawer__step-strong">(3 days more than usual)</strong>
                </>
            ),
        },
        {
            id: 3,
            content: isFreeReferrer ? (
                <>
                    Every 3 friends who start a free trial{' '}
                    <strong className="jad-refer-friend-drawer__step-strong">→ you earn 20% off your next payment.</strong>
                </>
            ) : (
                <>
                    They subscribe to a paid plan{' '}
                    <strong className="jad-refer-friend-drawer__step-strong">→ you earn 20% off your next payment.</strong>
                </>
            ),
        },
    ];
}

function getReferralTermsSections(isFreeReferrer) {
    const earnItems = isFreeReferrer
        ? [
            "Share your link with a friend who's job hunting.",
            'They get a 10-day free trial (instead of 7).',
            'For every 3 friends who start a free trial via your link, you get 20% off your next payment.',
            'You do not need those friends to pay — starting free trial is enough while you are on a free plan.',
            'Use your 20% on a Monthly or Quarterly plan payment.',
            'Refer more friends, earn more - every additional 3 trial joins add another 20%, up to 100% off one payment.',
            'Your reward never expires.',
        ]
        : [
            "Share your link with a friend who's job hunting.",
            'They get a 10-day free trial (instead of 7).',
            'When they subscribe to a paid plan, you get 20% off your next payment.',
            'Anyone can refer - even on a Free Trial or Weekly plan (if available).',
            'Use your 20% on a Monthly or Quarterly plan payment.',
            'Refer more friends, earn more - discounts stack up to 100% off one payment.',
            'Your reward never expires.',
        ];

    return [
        {
            title: isFreeReferrer
                ? 'Refer friends. Get 20% off every 3 free trials.'
                : 'Refer a friend. Get 20% off.',
            items: earnItems,
        },
        {
            title: 'The fair-use bit:',
            items: [
                'Real friends only - no fake or repeat accounts, and no spamming your link. If we detect this, your account will be suspended immediately.',
                'One free trial per person.',
                "If your friend's payment is refunded, that 20% goes away.",
                "We may update or end the program anytime (rewards you've already earned stay yours).",
            ],
        },
    ];
}

/** Two-person + plus icon — Figma 673:33348 (User/Two-Person). */
function ReferFriendIcon() {
    return (
        <svg width="23" height="17" viewBox="0 0 23 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M14.0564 9.19312C14.7647 9.21571 15.3635 9.72588 15.4978 10.4216H15.4968L15.5955 10.9041L15.6287 11.073C15.6843 11.4685 15.5815 11.8731 15.3386 12.196C15.0612 12.5648 14.631 12.7875 14.1697 12.8005H11.5632C11.5126 13.9551 10.5829 14.8866 9.41675 14.9255H3.53979C2.86092 14.9142 2.22442 14.5933 1.81128 14.0544C1.39811 13.5156 1.25338 12.8175 1.4187 12.1589L1.56714 11.4568C1.74882 10.4343 2.62925 9.68379 3.66772 9.66772H9.25073C9.51964 9.36812 9.90227 9.19402 10.3064 9.19312H14.0564ZM10.3132 10.4812C10.2778 10.4899 10.2461 10.5115 10.2244 10.5417L10.2195 10.5496L10.2185 10.5486C9.9964 10.8044 9.67446 10.9519 9.33569 10.9519H3.7146L3.55444 10.9695C3.19113 11.0442 2.90419 11.3388 2.84741 11.7166L2.84644 11.7224L2.69702 12.4294C2.63041 12.7493 2.70942 13.0831 2.91187 13.3396L2.97339 13.4089C3.12446 13.562 3.32854 13.6535 3.54565 13.6628H9.3855C9.90192 13.6286 10.2989 13.1919 10.2839 12.6746V12.6697C10.2968 12.0369 10.8141 11.5309 11.447 11.531H14.1492C14.2056 11.5288 14.2583 11.5016 14.2927 11.4568L14.3005 11.446L14.3015 11.447C14.3732 11.3746 14.4092 11.2741 14.4001 11.1726H14.3992L14.3025 10.6941L14.3005 10.6863V10.6853C14.2866 10.5753 14.1996 10.4896 14.0896 10.4773H10.3494L10.3132 10.4812ZM6.92163 2.07495C8.28247 2.08726 9.37963 3.19353 9.37964 4.55444V5.66675C9.37958 7.28668 8.06596 8.60025 6.44604 8.60034C4.82604 8.60034 3.51251 7.28674 3.51245 5.66675V4.55444C3.51251 3.18483 4.62329 2.07495 5.99292 2.07495H6.92163ZM12.863 3.14429C13.9041 3.14429 14.7487 3.98804 14.7488 5.02905V5.84351C14.7488 7.07234 13.752 8.06909 12.5232 8.06909C11.2944 8.069 10.2986 7.07228 10.2986 5.84351V5.02905C10.2985 3.99974 11.1239 3.16083 12.1531 3.14429H12.863ZM5.99292 3.33667C5.32055 3.33667 4.77521 3.88209 4.77515 4.55444L4.79565 5.65894C4.90448 6.49848 5.62046 7.12769 6.46753 7.12769C7.31602 7.12748 8.03172 6.49585 8.13843 5.65405V4.55444C8.13836 3.88216 7.59293 3.33678 6.92065 3.33667H5.99292ZM12.1697 4.42065C11.8337 4.42065 11.5613 4.69312 11.5613 5.02905V5.84351C11.5613 6.37502 11.9917 6.8063 12.5232 6.8064C13.0548 6.8064 13.4861 6.37508 13.4861 5.84351V5.02905C13.486 4.69317 13.2136 4.42074 12.8777 4.42065H12.1697Z"
                fill="#231F20"
                stroke="#231F20"
                strokeWidth="0.2"
            />
            <path
                d="M19 0.849609C19.2248 0.849609 19.4071 1.03212 19.4072 1.25684V3.59277H21.7432C21.9679 3.59294 22.1504 3.77524 22.1504 4C22.1504 4.22476 21.9679 4.40706 21.7432 4.40723H19.4072V6.74316C19.4071 6.96788 19.2248 7.15039 19 7.15039C18.7752 7.15039 18.5929 6.96788 18.5928 6.74316V4.40723H16.2568C16.0321 4.40706 15.8496 4.22476 15.8496 4C15.8496 3.77524 16.0321 3.59294 16.2568 3.59277H18.5928V1.25684C18.5929 1.03212 18.7752 0.849609 19 0.849609Z"
                fill="#231F20"
                stroke="#231F20"
                strokeWidth="0.3"
            />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function ArrowRightIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Circular back control — Figma 673:45220 (rewards footer). */
function FooterBackIcon() {
    return (
        <svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="20.5" cy="20.5" r="20" fill="#FFFFFF" stroke="#DEE1E7" />
            <path
                d="M23 13L16 20.5L23 28"
                stroke="#231F20"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/** Checkmark for Copied CTA — Figma 673:37843. */
function CopyCheckIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M3.5 8.25L6.25 11 12.5 4.75"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function WhatsAppIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_877_92173)">
                <path d="M8.00001 15.995C6.43583 15.9952 4.90602 15.5361 3.60051 14.6745L0.526509 15.6565L1.52301 12.6865C0.53085 11.3256 -0.00254587 9.68421 9.13628e-06 8.00001C9.13628e-06 3.59101 3.58651 0.00500488 7.99501 0.00500488C12.4035 0.00500488 15.99 3.59101 15.99 8.00001C15.99 12.409 12.405 15.995 7.99501 15.995H8.00001Z" fill="#FEFEFE" />
                <path d="M8 0.00457764C3.59101 0.00457764 0.00476074 3.59096 0.00476074 7.99981C0.00476074 9.74823 0.568818 11.37 1.52766 12.6862L0.531011 15.657L3.60375 14.6747C4.86797 15.5114 6.37694 15.9954 8.00331 15.9954C12.4123 15.9954 15.9986 12.4089 15.9986 8.00021C15.9986 3.59149 12.4122 0.00497539 8.00331 0.00497539H7.99867L8 0.00457764Z" fill="#231F20" />
                <path d="M5.76752 4.06601C5.61752 3.69451 5.49502 3.68101 5.26002 3.66601L4.99202 3.65601C4.68702 3.65601 4.36702 3.74601 4.17402 3.94251C3.93902 4.18251 3.35602 4.74151 3.35602 5.88851C3.35602 7.03551 4.19252 8.14451 4.30602 8.30001C4.42352 8.45001 5.93702 10.843 8.28752 11.816C10.1255 12.5775 10.6705 12.507 11.089 12.4175C11.7 12.286 12.466 11.8345 12.659 11.2895C12.852 10.7445 12.852 10.2795 12.795 10.1795C12.738 10.0795 12.5835 10.0295 12.3485 9.90701C12.1135 9.78451 10.9715 9.22551 10.755 9.15001C10.5435 9.07001 10.3415 9.09851 10.1815 9.32401C9.95652 9.63901 9.73502 9.95901 9.55652 10.151C9.41552 10.301 9.18502 10.321 8.99252 10.241C8.73402 10.133 8.01002 9.87901 7.11752 9.08451C6.42652 8.46951 5.95652 7.70251 5.82002 7.47251C5.68352 7.23751 5.80602 7.10101 5.91402 6.97401C6.03152 6.82801 6.14402 6.72501 6.26202 6.58901C6.38002 6.45301 6.44552 6.38201 6.52052 6.22251C6.60052 6.07251 6.54402 5.90751 6.48752 5.79001C6.43102 5.67251 5.96102 4.52501 5.76852 4.06001L5.76752 4.06601Z" fill="#FEFEFE" />
            </g>
            <defs>
                <clipPath id="clip0_877_92173">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_877_92178)">
                <path d="M8 15.9999C12.4183 15.9999 16 12.4182 16 7.99988C16 3.5816 12.4183 -0.00012207 8 -0.00012207C3.58172 -0.00012207 0 3.5816 0 7.99988C0 12.4182 3.58172 15.9999 8 15.9999Z" fill="#231F20" />
                <path d="M12.7799 8.64358V11.9418H10.8677V8.86462C10.8677 8.09197 10.5916 7.56432 9.89925 7.56432C9.37089 7.56432 9.05701 7.91956 8.9184 8.26353C8.86806 8.38646 8.85508 8.55716 8.85508 8.72957V11.9417H6.94271C6.94271 11.9417 6.96838 6.72993 6.94271 6.19044H8.85522V7.00545C8.85137 7.01186 8.84595 7.01814 8.84253 7.02427H8.85522V7.00545C9.10935 6.61442 9.56256 6.05539 10.5786 6.05539C11.8367 6.05539 12.7799 6.87738 12.7799 8.64358ZM4.94221 3.41815C4.28807 3.41815 3.86011 3.84754 3.86011 4.4117C3.86011 4.96388 4.27567 5.40567 4.91711 5.40567H4.92952C5.5965 5.40567 6.0112 4.96388 6.0112 4.4117C5.99851 3.84754 5.5965 3.41815 4.94221 3.41815ZM3.97377 11.9418H5.88542V6.19044H3.97377V11.9418Z" fill="#F1F2F2" />
            </g>
            <defs>
                <clipPath id="clip0_877_92178">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

function GmailIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_877_92184)">
                <path d="M14.993 13.8575H1.004C0.4575 13.8575 0 13.425 0 12.8665V3.188C0.000529268 2.92197 0.106509 2.66701 0.29471 2.479C0.48291 2.29099 0.737977 2.18526 1.004 2.185H14.993C15.5395 2.185 15.997 2.635 15.997 3.189V12.854C15.9845 13.426 15.5395 13.8575 14.993 13.8575Z" fill="#F2F2F2" />
                <path opacity="0.1" d="M2.00002 13.8575L7.98502 9.4775L8.02302 9.2235L1.85002 4.789L1.83752 13.6415L2.00002 13.8575Z" fill="#221F1F" />
                <path d="M1.004 13.8575C0.45 13.8575 0 13.425 0 12.8665V3.17501C0 2.61601 0.45 2.51501 1.004 2.51501C1.558 2.51501 2.008 2.63001 2.008 3.17501V13.857L1.004 13.8575Z" fill="#231F20" />
                <path d="M1.00398 2.66704C1.71548 2.66704 1.85548 2.88304 1.85548 3.17504V13.717H1.00398C0.533978 13.717 0.152478 13.336 0.152478 12.8655V3.17504C0.139978 2.87504 0.292478 2.66704 1.00398 2.66704ZM1.00398 2.52704C0.449978 2.52754 -2.16422e-05 2.64154 -2.16422e-05 3.17504V12.853C-0.00190714 12.9854 0.0227742 13.1168 0.0725623 13.2395C0.12235 13.3621 0.196234 13.4736 0.289842 13.5672C0.38345 13.6608 0.494882 13.7347 0.617545 13.7845C0.740207 13.8342 0.87161 13.8589 1.00398 13.857H2.00798V3.17504C1.99998 2.62904 1.56298 2.52704 1.00398 2.52704ZM14.993 2.66704C15.641 2.66704 15.8445 2.79404 15.8445 3.15004V12.879C15.8445 13.349 15.4635 13.7305 14.993 13.7305H14.1415V3.15004C14.129 2.78154 14.345 2.66704 14.993 2.66704ZM14.993 2.52704C14.434 2.52704 13.989 2.60304 13.989 3.14954V13.8695H14.993C15.552 13.8695 15.997 13.4195 15.997 12.8655V3.13704C15.9845 2.59054 15.5395 2.52704 14.993 2.52704Z" fill="#231F20" />
                <path d="M14.993 13.8575H13.989V3.15003C13.989 2.59103 14.439 2.52753 14.993 2.52753C15.547 2.52753 15.997 2.60353 15.997 3.15003V12.879C15.9913 13.1412 15.8829 13.3907 15.6951 13.5737C15.5073 13.7567 15.2552 13.8586 14.993 13.8575Z" fill="#231F20" />
                <path opacity="0.08" d="M10.711 13.8575L0.0889893 3.6L0.647989 3.8285L8.04799 9.152L15.9965 3.315V12.879C15.996 13.0101 15.9695 13.1398 15.9187 13.2606C15.8679 13.3815 15.7938 13.4911 15.7005 13.5832C15.6072 13.6753 15.4966 13.748 15.3751 13.7972C15.2536 13.8465 15.1236 13.8712 14.9925 13.87L10.711 13.8575Z" fill="#221F1F" />
                <path d="M7.97999 9.48999L0.431986 4.01399C-0.018014 3.68399 -0.140014 3.04899 0.190486 2.60399C0.520986 2.15899 1.15549 2.05749 1.61349 2.38799L7.99199 7.02549L14.4085 2.32499C14.8585 1.99499 15.476 2.09649 15.806 2.55349C16.136 3.00349 16.0345 3.62099 15.5775 3.95099L7.97999 9.48999Z" fill="#231F20" />
                <path d="M14.993 2.28601C15.26 2.28601 15.5265 2.41301 15.692 2.64201C15.959 3.02301 15.882 3.55701 15.502 3.84201L7.98001 9.31251L0.521006 3.90001C0.140006 3.62001 0.0380058 3.07351 0.300006 2.70001C0.452506 2.47151 0.720006 2.33151 1.01151 2.33151C1.20151 2.33151 1.38001 2.38251 1.51951 2.49651L7.88451 7.12151L7.97351 7.17251L8.06251 7.12151L14.4725 2.42501C14.6375 2.33601 14.8025 2.28501 14.9935 2.28501L14.993 2.28601ZM14.993 2.13351C14.7895 2.13351 14.573 2.18451 14.408 2.32351L7.99201 7.02501L1.60101 2.37501C1.43601 2.24801 1.22001 2.18501 1.00401 2.18501C0.686506 2.19751 0.369006 2.33751 0.178006 2.60501C-0.139494 3.05501 -0.0119942 3.67251 0.432006 4.00251L7.98001 9.49001L15.5775 3.95001C15.7912 3.79355 15.9349 3.55941 15.9777 3.29801C16.0204 3.03661 15.9588 2.76888 15.806 2.55251C15.6025 2.28551 15.298 2.13251 14.993 2.13251V2.13351Z" fill="#231F20" />
            </g>
            <defs>
                <clipPath id="clip0_877_92184">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

/** Decorative teal arcs — Figma 673:42626 hero artwork. */
function HeroArcArt() {
    return (
        <svg
            width="136"
            height="126"
            viewBox="0 0 136 126"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="jad-refer-friend-drawer__hero-art"
        >
            <path d="M20.0328 77.6798C20.0328 42.9946 47.167 14.8771 80.6369 14.8771C110.707 14.8771 135.664 37.5791 140.419 67.3473C138.902 29.8947 108.066 0 70.2412 0C32.4163 0 0 31.447 0 70.2412C0 109.035 31.447 140.482 70.2412 140.482C72.0745 140.482 73.8938 140.412 75.6919 140.272C44.5329 137.666 20.0328 110.637 20.0328 77.6798Z" fill="url(#paint0_linear_673_42626)" />
            <path d="M57.4924 97.9718C57.4924 74.4972 76.5278 55.4618 100.002 55.4618C119.867 55.4618 136.549 69.0886 141.213 87.5059C140.307 59.9924 117.731 37.9577 89.993 37.9577C62.2547 37.9577 38.731 60.9055 38.731 89.2197C38.731 117.534 61.6788 140.482 89.993 140.482C91.7771 140.482 93.5331 140.39 95.2681 140.215C74.0201 137.862 57.4924 119.852 57.4924 97.9718Z" fill="url(#paint1_linear_673_42626)" />
            <path d="M93.2452 114.276C93.2452 99.7993 104.975 88.069 119.452 88.069C128.591 88.069 136.626 92.7471 141.318 99.8344C138.516 83.4542 124.257 70.9793 107.076 70.9793C87.8858 70.9793 72.3203 86.5377 72.3203 105.735C72.3203 124.932 87.8787 140.49 107.076 140.49C109.344 140.49 111.557 140.265 113.706 139.851C101.997 137.231 93.2452 126.779 93.2452 114.283V114.276Z" fill="url(#paint2_linear_673_42626)" />
            <path d="M126.041 140.482C137.209 140.482 146.263 131.429 146.263 120.26C146.263 109.091 137.209 100.038 126.041 100.038C114.872 100.038 105.818 109.091 105.818 120.26C105.818 131.429 114.872 140.482 126.041 140.482Z" fill="url(#paint3_linear_673_42626)" />
            <defs>
                <linearGradient id="paint0_linear_673_42626" x1="14.393" y1="11.2386" x2="70.252" y2="140.464" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#189B98" />
                    <stop offset="1" stop-color="#C0E8FF" />
                </linearGradient>
                <linearGradient id="paint1_linear_673_42626" x1="49.2354" y1="46.1596" x2="90.0002" y2="140.47" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#189B98" />
                    <stop offset="1" stop-color="#C0E8FF" />
                </linearGradient>
                <linearGradient id="paint2_linear_673_42626" x1="79.3926" y1="76.5402" x2="107.163" y2="140.34" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#189B98" />
                    <stop offset="1" stop-color="#C0E8FF" />
                </linearGradient>
                <linearGradient id="paint3_linear_673_42626" x1="109.964" y1="103.273" x2="126.041" y2="140.482" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#189B98" />
                    <stop offset="1" stop-color="#C0E8FF" />
                </linearGradient>
            </defs>
        </svg>
    );
}

function buildReferralSlug(user) {
    if (!user || typeof user !== 'object') return '';
    const raw = user.happy_referral_code;
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    return '';
}

function buildReferralLink(user) {
    const slug = buildReferralSlug(user);
    if (!slug) return '';
    return `${REFERRAL_LINK_BASE}${slug.replace(/^\//, '')}`;
}

/** Absolute URL for clipboard / share (placeholder is host-only display form). */
function referralLinkForClipboard(displayLink) {
    if (!displayLink) return '';
    if (/^https?:\/\//i.test(displayLink)) return displayLink;
    return `https://${displayLink}`;
}

function buildShareText(link) {
    return `${DEFAULT_SHARE_MESSAGE}\n\n${referralLinkForClipboard(link)}`;
}

function getReferralInitial(name) {
    const trimmed = String(name || '').trim();
    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

/** Map GET /talent/outreach/referral-list item → rewards list row. */
function mapApiReferralToUiItem(referral, rewardMode = 'paid_conversion') {
    const recipient = referral?.recipient || {};
    const isClaimed = Number(referral?.is_claimed) === 1;
    const isPaidPlan = Number(recipient?.current_plan) === 2;
    const referralStatus = Number(referral?.status);

    let status = 'trial';
    if (isClaimed) {
        status = 'redeemed';
    } else if (isPaidPlan || referralStatus === 2) {
        status = 'paid';
    }

    // Free referrers earn in groups of 3 trials — individual rows don't show 20% each.
    const rewardPercent =
        status === 'redeemed' || status === 'paid'
            ? 20
            : rewardMode === 'free_trial_groups' && status === 'trial'
                ? 0
                : 0;

    return {
        id: referral?.id,
        name: recipient?.name || '',
        email: recipient?.email || '',
        status,
        reward_percent: rewardPercent,
    };
}

/** True when the user is on free trial or their plan has expired (not active paid). */
function isTrialOrExpiredOutreachPlan(referralPlan) {
    if (!referralPlan?.loaded) return false;
    const planNumber = Number(referralPlan.plan);
    return !(planNumber === 2 && !referralPlan.has_plan_expired);
}

/** True when trial/paid outreach access has ended (not merely on an active free trial). */
function isExpiredOutreachPlan(referralPlan) {
    return Boolean(referralPlan?.loaded && referralPlan.has_plan_expired);
}

/** Invite-footer redeem nudge — Figma 723:66309. */
function getInviteRedeemBannerText(referralPlan) {
    const planNumber = Number(referralPlan?.plan);
    const planLabel = planNumber === 2 ? 'Paid plan' : 'free trial';
    return `Your ${planLabel} has ended. You can redeem your referral rewards for a discount on your next plan!`;
}

const EMAIL_INVITE_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

function normalizeIndianMobile(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return null;

    let mobile = digits;
    if (mobile.length === 12 && mobile.startsWith('91')) {
        mobile = mobile.slice(2);
    } else if (mobile.length === 11 && mobile.startsWith('0')) {
        mobile = mobile.slice(1);
    }

    return INDIAN_MOBILE_RE.test(mobile) ? mobile : null;
}

function parseInviteToken(raw) {
    const value = String(raw || '').trim();
    if (!value) return { ok: false, empty: true };

    if (EMAIL_INVITE_RE.test(value)) {
        return { ok: true, value: value.toLowerCase() };
    }

    const mobile = normalizeIndianMobile(value);
    if (mobile) {
        return { ok: true, value: mobile };
    }

    return { ok: false, empty: false };
}

function splitInviteDraft(raw) {
    return String(raw || '')
        .split(/[,;\n]+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function ReferralInviteField() {
    const [invites, setInvites] = useState([]);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    const canInvite = invites.length > 0 || parseInviteToken(draft).ok;

    const addTokens = useCallback((rawParts) => {
        const parts = Array.isArray(rawParts) ? rawParts : splitInviteDraft(rawParts);
        if (!parts.length) return true;

        let nextInvites = invites;
        let added = false;
        let hadInvalid = false;

        parts.forEach((part) => {
            const parsed = parseInviteToken(part);
            if (parsed.empty) return;
            if (!parsed.ok) {
                hadInvalid = true;
                return;
            }
            if (nextInvites.includes(parsed.value)) return;
            nextInvites = [...nextInvites, parsed.value];
            added = true;
        });

        if (added) {
            setInvites(nextInvites);
        }

        if (hadInvalid) {
            setError('Enter a valid email or 10-digit Mobile number.');
            return false;
        }

        setError('');
        return true;
    }, [invites]);

    const commitDraft = useCallback(() => {
        const trimmed = draft.trim();
        if (!trimmed) {
            setError('');
            return true;
        }
        const ok = addTokens(trimmed);
        if (ok) {
            setDraft('');
        }
        return ok;
    }, [addTokens, draft]);

    const handleDraftChange = (event) => {
        const nextValue = event.target.value;
        if (/[,;\n]/.test(nextValue)) {
            const parts = splitInviteDraft(nextValue);
            const trailingDelimiter = /[,;\n]\s*$/.test(nextValue);
            const completeParts = trailingDelimiter ? parts : parts.slice(0, -1);
            const remainder = trailingDelimiter ? '' : (parts[parts.length - 1] || '');
            if (completeParts.length) {
                addTokens(completeParts);
            }
            setDraft(remainder);
            return;
        }
        setDraft(nextValue);
        if (error) setError('');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            if (!draft.trim()) return;
            event.preventDefault();
            commitDraft();
            return;
        }
        if (event.key === 'Backspace' && !draft && invites.length) {
            setInvites((prev) => prev.slice(0, -1));
            setError('');
        }
    };

    const handlePaste = (event) => {
        const pasted = event.clipboardData?.getData('text') || '';
        if (!/[,;\n]/.test(pasted) && splitInviteDraft(pasted).length < 2) return;
        event.preventDefault();
        addTokens(pasted);
        setDraft('');
    };

    const handleRemove = (value) => {
        setInvites((prev) => prev.filter((item) => item !== value));
        setError('');
    };

    const handleInvite = async () => {
        const trimmed = draft.trim();
        let payload = invites;
        if (trimmed) {
            const parsed = parseInviteToken(trimmed);
            if (!parsed.ok) {
                setError('Enter a valid email or 10-digit Mobile number.');
                return;
            }
            if (!payload.includes(parsed.value)) {
                payload = [...payload, parsed.value];
                setInvites(payload);
            }
            setDraft('');
        }

        if (!payload.length) return;

        setSubmitting(true);
        try {
            const response = await POST_API(API_OUTREACH_INVITE_TO_MULTIPLE_FRIENDS, { invites: payload });
            if (response?.data?.status === 200) {
                toast.success(response?.data?.message || 'Invites sent successfully.');
                setInvites([]);
                setDraft('');
                setError('');
            } else {
                toast.error(response?.data?.message || 'Could not send invites.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not send invites.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="jad-refer-friend-drawer__invite-field-section" aria-labelledby="jad-refer-friend-invite-label">
            <h3 id="jad-refer-friend-invite-label" className="jad-refer-friend-drawer__section-label">
                Invite via email or mobile
            </h3>
            <div
                className="jad-refer-friend-drawer__invite-field"
                onClick={() => inputRef.current?.focus()}
            >
                <div className="jad-refer-friend-drawer__invite-chips">
                    {invites.map((value) => (
                        <span key={value} className="jad-refer-friend-drawer__invite-chip">
                            <span className="jad-refer-friend-drawer__invite-chip-text">{value}</span>
                            <button
                                type="button"
                                className="jad-refer-friend-drawer__invite-chip-remove"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemove(value);
                                }}
                                aria-label={`Remove ${value}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        className="jad-refer-friend-drawer__invite-input"
                        value={draft}
                        onChange={handleDraftChange}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={invites.length ? '' : 'Email or 10-digit mobile'}
                        aria-label="Friend email or 10-digit Mobile number"
                        autoComplete="off"
                        disabled={submitting}
                    />
                </div>
                <button
                    type="button"
                    className="jad-refer-friend-drawer__invite-btn"
                    onClick={handleInvite}
                    disabled={!canInvite || submitting}
                >
                    {submitting ? 'Sending' : 'Invite'}
                </button>
            </div>
            {error ? (
                <p className="jad-refer-friend-drawer__invite-error" role="alert">
                    {error}
                </p>
            ) : (
                <p className="jad-refer-friend-drawer__invite-hint">
                    Add a valid email or 10-digit Mobile, then press Invite.
                </p>
            )}
        </section>
    );
}

function InviteRedeemFooterBanner({ text }) {
    return (
        <div className="jad-refer-friend-drawer__invite-redeem-banner" role="status">
            <p className="jad-refer-friend-drawer__invite-redeem-banner-text">{text}</p>
        </div>
    );
}

/** Map referral-list API payload → rewards drawer state. */
function mapReferralListToRewardsData(referrals, rewardSummary) {
    const list = Array.isArray(referrals) ? referrals : [];
    const rewardMode = rewardSummary?.reward_mode || 'paid_conversion';
    const uiReferrals = list.map((item) => mapApiReferralToUiItem(item, rewardMode));

    if (rewardSummary && rewardSummary.discount_percent != null) {
        const discountPercent = Number(rewardSummary.discount_percent) || 0;
        const eligibleCount = Number(rewardSummary.eligible_count) || 0;
        return {
            discount_percent: discountPercent,
            maxed_out: Boolean(rewardSummary.maxed_out) || discountPercent >= 100,
            eligible_paid_count: eligibleCount,
            eligible_count: eligibleCount,
            reward_mode: rewardMode,
            trials_per_reward: rewardSummary.trials_per_reward ?? (rewardMode === 'free_trial_groups' ? 3 : null),
            referrals: uiReferrals,
        };
    }

    // Fallback when reward_summary is missing (older API): paid-conversion math only.
    const eligiblePaidCount = list.filter(
        (item) => Number(item?.is_claimed) === 0 && Number(item?.recipient?.current_plan) === 2,
    ).length;
    const discountPercent = Math.min(eligiblePaidCount * 20, 100);

    return {
        discount_percent: discountPercent,
        maxed_out: discountPercent >= 100,
        eligible_paid_count: eligiblePaidCount,
        eligible_count: eligiblePaidCount,
        reward_mode: 'paid_conversion',
        trials_per_reward: null,
        referrals: uiReferrals,
    };
}

/** Map API payload → rewards screen variant. */
function resolveRewardsViewState(rewardsData) {
    const referrals = Array.isArray(rewardsData?.referrals) ? rewardsData.referrals : [];
    const discountPercent = Number(rewardsData?.discount_percent) || 0;
    const maxedOut = Boolean(rewardsData?.maxed_out) || discountPercent >= 100;
    const rewardMode = rewardsData?.reward_mode || 'paid_conversion';

    if (!referrals.length) {
        return { variant: 'empty', referrals, discountPercent, maxedOut, rewardMode };
    }
    if (maxedOut) {
        return { variant: 'maxed', referrals, discountPercent, maxedOut, rewardMode };
    }
    if (discountPercent > 0) {
        return { variant: 'paid', referrals, discountPercent, maxedOut, rewardMode };
    }
    return { variant: 'pending', referrals, discountPercent, maxedOut, rewardMode };
}

function getRewardsBannerContent(variant, discountPercent, rewardMode = 'paid_conversion') {
    const isFreeMode = rewardMode === 'free_trial_groups';
    switch (variant) {
        case 'maxed':
            return {
                compact: true,
                showBadge: false,
                showMascot: false,
                title: "You've unlocked the maximum reward - 100% off",
                lines: [
                    'Your discount credits never expire, use them whenever you like!',
                    "You've earned 100% off from your referrals. Your 100% discount will be applied automatically on a Monthly or Quarterly plan.",
                ],
                footnote: isFreeMode
                    ? "Once you use this 100% discount, your reward meter resets and you'll earn 20% off again for every 3 new friends who start a free trial!"
                    : "Once you use this 100% discount, your reward meter resets and you'll start earning 20% off for every new paid referral again!",
            };
        case 'pending':
            return {
                compact: false,
                showBadge: true,
                showMascot: false,
                title: 'Your rewards journey starts here',
                lines: [
                    'Did you know? That your discount credits never expire, use them whenever you like!',
                    isFreeMode
                        ? 'Share your referral link — every 3 friends who start a free trial unlocks 20% off.'
                        : 'Share your referral code to start earning rewards from paid referrals.',
                ],
            };
        case 'paid':
        default:
            return {
                compact: false,
                showBadge: true,
                showMascot: false,
                title: `${discountPercent}% off on your next purchase`,
                lines: [
                    'Did you know? That your discount credits never expire, use them whenever you like!',
                    'The accumulated discount applies automatically the moment you purchase a Monthly or Quarterly plan.',
                ],
            };
    }
}

function ReferralTermsDialog({ open, onClose, isFreeReferrer = false }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open || typeof document === 'undefined') return null;

    const termsSections = getReferralTermsSections(isFreeReferrer);

    return createPortal(
        <div
            className="jad-refer-friend-terms-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="jad-refer-friend-terms-title"
        >
            <button
                type="button"
                className="jad-refer-friend-terms-dialog__backdrop"
                aria-label="Close terms and conditions"
                onClick={onClose}
            />
            <div className="jad-refer-friend-terms-dialog__panel">
                <button
                    type="button"
                    className="jad-refer-friend-terms-dialog__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>
                <header className="jad-refer-friend-terms-dialog__head">
                    <h2 id="jad-refer-friend-terms-title" className="jad-refer-friend-terms-dialog__title">
                        Terms and Conditions
                    </h2>
                </header>
                <div className="jad-refer-friend-terms-dialog__body">
                    {termsSections.map((section, sectionIndex) => (
                        <section
                            key={section.title}
                            className="jad-refer-friend-terms-dialog__section"
                            aria-labelledby={`jad-refer-friend-terms-section-${sectionIndex}`}
                        >
                            <h3
                                id={`jad-refer-friend-terms-section-${sectionIndex}`}
                                className="jad-refer-friend-terms-dialog__section-title"
                            >
                                {section.title}
                            </h3>
                            <ul className="jad-refer-friend-terms-dialog__list">
                                {section.items.map((item) => (
                                    <li key={item} className="jad-refer-friend-terms-dialog__list-item">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </div>,
        document.body,
    );
}

function ReferralTermsLink({ className = '', isFreeReferrer = false }) {
    const [termsOpen, setTermsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                className={`jad-refer-friend-drawer__terms-link${className ? ` ${className}` : ''}`}
                onClick={() => setTermsOpen(true)}
            >
                View Terms and Conditions
            </button>
            <ReferralTermsDialog
                open={termsOpen}
                onClose={() => setTermsOpen(false)}
                isFreeReferrer={isFreeReferrer}
            />
        </>
    );
}

function ReferralShareButtons({ onWhatsApp, onLinkedIn, onGmail, centered = false }) {
    return (
        <div
            className={`jad-refer-friend-drawer__share-section${centered ? ' jad-refer-friend-drawer__share-section--centered' : ''
                }`}
            aria-labelledby="jad-refer-friend-share-label"
        >
            <h3 id="jad-refer-friend-share-label" className="jad-refer-friend-drawer__section-label">
                Or, share via
            </h3>
            <div className="jad-refer-friend-drawer__share-row">
                <button
                    type="button"
                    className="jad-refer-friend-drawer__share-btn"
                    aria-label="Share on WhatsApp"
                    onClick={onWhatsApp}
                >
                    <WhatsAppIcon />
                </button>
                <button
                    type="button"
                    className="jad-refer-friend-drawer__share-btn"
                    aria-label="Share on LinkedIn"
                    onClick={onLinkedIn}
                >
                    <LinkedInIcon />
                </button>
                <button
                    type="button"
                    className="jad-refer-friend-drawer__share-btn"
                    aria-label="Share via Gmail"
                    onClick={onGmail}
                >
                    <GmailIcon />
                </button>
            </div>
        </div>
    );
}

function ReferralLinkField({
    referralLink,
    linkCopied,
    onCopy,
    compact = false,
    showLabel = true,
}) {
    return (
        <section
            className={`jad-refer-friend-drawer__link-section${compact ? ' jad-refer-friend-drawer__link-section--compact' : ''
                }`}
            aria-labelledby={showLabel ? 'jad-refer-friend-link-label' : undefined}
        >
            {showLabel ? (
                <h3 id="jad-refer-friend-link-label" className="jad-refer-friend-drawer__section-label">
                    Your referral link
                </h3>
            ) : null}
            <div className="jad-refer-friend-drawer__link-field">
                <span className="jad-refer-friend-drawer__link-text">{referralLink}</span>
                <button
                    type="button"
                    className={`jad-refer-friend-drawer__copy-btn${linkCopied ? ' jad-refer-friend-drawer__copy-btn--copied' : ''
                        }`}
                    onClick={onCopy}
                    aria-live="polite"
                >
                    {linkCopied ? (
                        <>
                            <CopyCheckIcon />
                            <span>Copied</span>
                        </>
                    ) : (
                        <span>Copy</span>
                    )}
                </button>
            </div>
            {linkCopied ? (
                <p className="jad-refer-friend-drawer__copy-hint" role="status">
                    <span className="jad-refer-friend-drawer__copy-hint-icon" aria-hidden="true">
                        ✓
                    </span>
                    <span>Link copied - now send it to a friend</span>
                </p>
            ) : null}
        </section>
    );
}

/** Rewards summary banner — Figma 673:50885 / 747:50512 / 829:91149. */
function ReferralsRewardsBanner({
    variant,
    discountPercent,
    rewardMode = 'paid_conversion',
    showUpgradePlansCta = false,
    onUpgradePlansClick,
}) {
    const content = getRewardsBannerContent(variant, discountPercent, rewardMode);

    return (
        <>
            <div
                className={`jad-refer-friend-drawer__rewards-banner${content.compact ? ' jad-refer-friend-drawer__rewards-banner--compact' : ''
                    }`}
            >
                {/* <HeroArcArt /> */}
                {content.showBadge ? (
                    <span className="jad-refer-friend-drawer__rewards-banner-badge">
                        Stack up to 100% off one payment!
                    </span>
                ) : null}
                <div
                    className={`jad-refer-friend-drawer__rewards-banner-main${content.showMascot ? ' jad-refer-friend-drawer__rewards-banner-main--with-mascot' : ''
                        }`}
                >
                    {content.showMascot ? (
                        <img
                            className="jad-refer-friend-drawer__rewards-banner-mascot"
                            src={REFERRALS_EMPTY_MASCOT_SRC}
                            alt=""
                            width={47}
                            height={40}
                            decoding="async"
                        />
                    ) : null}
                    <div className="jad-refer-friend-drawer__rewards-banner-copy">
                        <h2 className="jad-refer-friend-drawer__rewards-banner-title">{content.title}</h2>
                        <div className="jad-refer-friend-drawer__rewards-banner-lines">
                            {content.lines.map((line, index) => (
                                <p key={line} className={`jad-refer-friend-drawer__rewards-banner-line${index === 0 ? ' strong' : ''}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
                {showUpgradePlansCta ? (
                    <button
                        type="button"
                        className="jad-refer-friend-drawer__rewards-banner-cta"
                        onClick={onUpgradePlansClick}
                    >
                        See monthly &amp; quarterly plans
                    </button>
                ) : null}
            </div>
            {content.footnote ? (
                <p className="jad-refer-friend-drawer__rewards-banner-footnote">{content.footnote}</p>
            ) : null}
        </>
    );
}

function ReferralListItem({ referral, rewardMode = 'paid_conversion' }) {
    const isRedeemed = referral.status === 'redeemed' || referral.status === 'muted';
    const isPaid = referral.status === 'paid';
    const isTrial = referral.status === 'trial';
    const rewardLabel = isTrial
        ? rewardMode === 'free_trial_groups'
            ? 'Counts toward reward'
            : 'No reward yet'
        : `${referral.reward_percent || 20}% off`;

    let statusClass = 'jad-refer-friend-drawer__referral-status--trial';
    let statusLabel = 'On free trial';
    if (isRedeemed) {
        statusClass = 'jad-refer-friend-drawer__referral-status--redeemed';
        statusLabel = 'Reward redeemed';
    } else if (isPaid) {
        statusClass = 'jad-refer-friend-drawer__referral-status--paid';
        statusLabel = 'On a paid plan';
    }

    return (
        <article
            className={`jad-refer-friend-drawer__referral-item${isRedeemed ? ' jad-refer-friend-drawer__referral-item--muted' : ''
                }`}
        >
            <div className="jad-refer-friend-drawer__referral-item-left">
                <span
                    className={`jad-refer-friend-drawer__referral-avatar${isRedeemed ? ' jad-refer-friend-drawer__referral-avatar--muted' : ''
                        }`}
                    aria-hidden="true"
                >
                    {getReferralInitial(referral.name)}
                </span>
                <div className="jad-refer-friend-drawer__referral-copy">
                    <p className="jad-refer-friend-drawer__referral-reward">{rewardLabel}</p>
                    <p className="jad-refer-friend-drawer__referral-from">
                        from {referral.name} ({referral.email})
                    </p>
                </div>
            </div>
            <span className={`jad-refer-friend-drawer__referral-status ${statusClass}`}>{statusLabel}</span>
        </article>
    );
}

/** Rewards footer — list screen: Figma 1103:30464. Empty screen: back + terms only. */
function ReferralRewardsFooter({ onBack, onCopyCode, codeCopied, showCopyCode = false, isFreeReferrer = false }) {
    return (
        <footer className="jad-refer-friend-drawer__footer jad-refer-friend-drawer__footer--rewards">
            <button
                type="button"
                className="jad-refer-friend-drawer__footer-back"
                onClick={onBack}
                aria-label="Back to refer a friend"
            >
                <FooterBackIcon />
            </button>
            <div
                className={`jad-refer-friend-drawer__footer-actions${showCopyCode ? '' : ' jad-refer-friend-drawer__footer-actions--terms-only'
                    }`}
            >
                <ReferralTermsLink isFreeReferrer={isFreeReferrer} />
                {showCopyCode ? (
                    <button
                        type="button"
                        className={`jad-refer-friend-drawer__copy-code-btn${codeCopied ? ' jad-refer-friend-drawer__copy-code-btn--copied' : ''
                            }`}
                        onClick={onCopyCode}
                        aria-live="polite"
                    >
                        {codeCopied ? 'Copied' : 'Copy referral code'}
                    </button>
                ) : null}
            </div>
        </footer>
    );
}

/**
 * My referrals list — Figma 673:50885 (paid) / 747:50512 (pending) / 829:91149 (maxed).
 */
function ReferralsRewardsListView({
    variant,
    referrals,
    discountPercent,
    rewardMode = 'paid_conversion',
    showUpgradePlansCta,
    onUpgradePlansClick,
}) {
    return (
        <div className="jad-refer-friend-drawer__rewards-list-view">
            <ReferralsRewardsBanner
                variant={variant}
                discountPercent={discountPercent}
                rewardMode={rewardMode}
                showUpgradePlansCta={showUpgradePlansCta}
                onUpgradePlansClick={onUpgradePlansClick}
            />
            <section className="jad-refer-friend-drawer__referrals-section" aria-labelledby="jad-refer-friend-referrals-title">
                <h3 id="jad-refer-friend-referrals-title" className="jad-refer-friend-drawer__referrals-heading">
                    Your Referrals
                </h3>
                <div className="jad-refer-friend-drawer__referrals-list">
                    {referrals.map((referral) => (
                        <ReferralListItem key={referral.id} referral={referral} rewardMode={rewardMode} />
                    ))}
                </div>
            </section>
        </div>
    );
}

/**
 * My referrals empty state — Figma 673:44221 (variant 1: no referral entries).
 */
function ReferralsRewardsEmptyView({
    referralLink,
    linkCopied,
    onCopy,
    onWhatsApp,
    onLinkedIn,
    onGmail,
    isFreeReferrer = false,
}) {
    return (
        <div className="jad-refer-friend-drawer__rewards-empty">
            <img
                className="jad-refer-friend-drawer__rewards-empty-art"
                src={REFERRALS_EMPTY_MASCOT_SRC}
                alt=""
                width={73}
                height={64}
                decoding="async"
            />
            <div className="jad-refer-friend-drawer__rewards-empty-copy">
                <h2 id="jad-refer-friend-rewards-title" className="jad-refer-friend-drawer__rewards-empty-title">
                    No referrals yet
                </h2>
                <p className="jad-refer-friend-drawer__rewards-empty-desc">
                    {isFreeReferrer
                        ? 'Share your link. Every 3 friends who start a free trial unlocks 20% off your next payment.'
                        : 'Share your link. When a friend subscribes to a paid plan, you earn 20% off your next payment.'}
                </p>
            </div>
            <ReferralLinkField
                referralLink={referralLink}
                linkCopied={linkCopied}
                onCopy={onCopy}
                compact
                showLabel={false}
            />
            <div className="jad-refer-friend-drawer__rewards-empty-share-wrap">
                <ReferralShareButtons
                    onWhatsApp={onWhatsApp}
                    onLinkedIn={onLinkedIn}
                    onGmail={onGmail}
                    centered
                />
                <p className="jad-refer-friend-drawer__rewards-empty-note">
                    Anyone can refer - even on Free trial
                    {/* or ₹499. */}
                </p>
            </div>

            <ReferralInviteField />
        </div>
    );
}

/**
 * Sidebar / mobile-drawer trigger — Figma 673:33345.
 * Opens ReferFriendDrawer on click.
 */
export function ReferFriendTrigger({ onClick, className = '' }) {
    const { user } = useSelector((state) => state.auth);
    return (
        <>
            <button
                type="button"
                className={`job-agent-dashboard__refer-friend-trigger jad-font-headline${className ? ` ${className}` : ''}`}
                onClick={onClick}
                aria-label="Refer a friend — earn up to 100% off on your next payment"
            >
                <span className="job-agent-dashboard__refer-friend-trigger-row">
                    <span className="job-agent-dashboard__refer-friend-trigger-icon-badge">
                        <ReferFriendIcon />
                    </span>
                    <span className="job-agent-dashboard__refer-friend-trigger-title">Get 100% discount</span>
                </span>
                <span className="job-agent-dashboard__refer-friend-trigger-sub jad-font-body">
                    Refer your friends
                </span>
            </button>
        </>
    );
}

/**
 * Refer-a-friend drawer — Figma 673:41741.
 * Copy success state — Figma 673:37846.
 * Desktop: right rail (814px). Mobile: bottom sheet with 64px top gap.
 * `view`: invite (default) | rewards (in-drawer screen).
 * Rewards empty state — Figma 673:44221.
 */
const ReferFriendDrawer = ({ open, onClose, onOpenUpgradePlan }) => {
    const { user } = useSelector((state) => state.auth);
    const referralPlan = useSelector((state) => state.happpyAgent);
    const [linkCopied, setLinkCopied] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);
    const [view, setView] = useState('invite');
    const [rewardsData, setRewardsData] = useState(EMPTY_REFERRAL_REWARDS);
    const [rewardsLoading, setRewardsLoading] = useState(false);
    const copiedResetTimerRef = useRef(null);
    const codeCopiedResetTimerRef = useRef(null);

    const isFreeReferrer = useMemo(() => {
        if (rewardsData?.reward_mode === 'free_trial_groups') return true;
        if (rewardsData?.reward_mode === 'paid_conversion') return false;
        return Number(referralPlan?.plan) === 1;
    }, [rewardsData?.reward_mode, referralPlan?.plan]);

    const howItWorksSteps = useMemo(() => getHowItWorksSteps(isFreeReferrer), [isFreeReferrer]);

    const rewardsState = useMemo(() => resolveRewardsViewState(rewardsData), [rewardsData]);

    const redeemableDiscount = useMemo(
        () => Number(rewardsData?.discount_percent) || 0,
        [rewardsData?.discount_percent],
    );

    const showUpgradePlansCta = useMemo(() => {
        return isTrialOrExpiredOutreachPlan(referralPlan) && redeemableDiscount > 0;
    }, [referralPlan, redeemableDiscount]);

    /** Invite view only — expired/trial-ended + redeemable referral discount. */
    const showInviteRedeemBanner = useMemo(() => {
        return isExpiredOutreachPlan(referralPlan) && redeemableDiscount > 0;
    }, [referralPlan, redeemableDiscount]);

    const inviteRedeemBannerText = useMemo(
        () => getInviteRedeemBannerText(referralPlan),
        [referralPlan],
    );

    const handleUpgradePlansClick = useCallback(() => {
        onOpenUpgradePlan?.();
        onClose?.();
    }, [onOpenUpgradePlan, onClose]);

    const referralLink = useMemo(() => buildReferralLink(user), [user]);
    const referralCode = useMemo(() => buildReferralSlug(user) || referralLink, [user, referralLink]);
    const clipboardLink = useMemo(() => referralLinkForClipboard(referralLink), [referralLink]);
    const shareText = useMemo(() => buildShareText(referralLink), [referralLink]);

    const clearCopiedReset = useCallback(() => {
        if (copiedResetTimerRef.current) {
            window.clearTimeout(copiedResetTimerRef.current);
            copiedResetTimerRef.current = null;
        }
    }, []);

    const clearCodeCopiedReset = useCallback(() => {
        if (codeCopiedResetTimerRef.current) {
            window.clearTimeout(codeCopiedResetTimerRef.current);
            codeCopiedResetTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!open) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            clearCopiedReset();
            clearCodeCopiedReset();
            setLinkCopied(false);
            setCodeCopied(false);
            setView('invite');
            setRewardsData(EMPTY_REFERRAL_REWARDS);
            setRewardsLoading(false);
        }
    }, [open, clearCopiedReset, clearCodeCopiedReset]);

    useEffect(() => {
        if (!open) return undefined;

        let cancelled = false;

        const fetchReferralList = async () => {
            setRewardsLoading(true);
            try {
                const response = await GET_API(API_OUTREACH_REFERRAL_LIST);
                if (cancelled) return;

                if (response?.data?.status === 200) {
                    const referrals = response?.data?.data?.referrals;
                    const rewardSummary = response?.data?.data?.reward_summary;
                    setRewardsData(mapReferralListToRewardsData(referrals, rewardSummary));
                } else {
                    setRewardsData(EMPTY_REFERRAL_REWARDS);
                }
            } catch (err) {
                if (cancelled) return;
                setRewardsData(EMPTY_REFERRAL_REWARDS);
                toast.error(err?.response?.data?.message || 'Could not load referrals.');
            } finally {
                if (!cancelled) {
                    setRewardsLoading(false);
                }
            }
        };

        fetchReferralList();

        return () => {
            cancelled = true;
        };
    }, [open]);

    useEffect(() => () => {
        clearCopiedReset();
        clearCodeCopiedReset();
    }, [clearCopiedReset, clearCodeCopiedReset]);

    const handleCopy = useCallback(async () => {
        if (!clipboardLink) return;
        try {
            await navigator.clipboard.writeText(clipboardLink);
            setLinkCopied(true);
            clearCopiedReset();
            copiedResetTimerRef.current = window.setTimeout(() => {
                setLinkCopied(false);
                copiedResetTimerRef.current = null;
            }, COPIED_RESET_MS);
        } catch {
            toast.error('Could not copy link');
        }
    }, [clipboardLink, clearCopiedReset]);

    const handleCopyCode = useCallback(async () => {
        if (!referralCode) return;
        try {
            await navigator.clipboard.writeText(referralCode);
            setCodeCopied(true);
            clearCodeCopiedReset();
            codeCopiedResetTimerRef.current = window.setTimeout(() => {
                setCodeCopied(false);
                codeCopiedResetTimerRef.current = null;
            }, COPIED_RESET_MS);
        } catch {
            toast.error('Could not copy referral code');
        }
    }, [referralCode, clearCodeCopiedReset]);

    const openShareWindow = useCallback((url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    }, []);

    const handleWhatsAppShare = useCallback(() => {
        openShareWindow(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }, [openShareWindow, shareText]);

    const handleLinkedInShare = useCallback(() => {
        openShareWindow(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(clipboardLink)}`,
        );
    }, [openShareWindow, clipboardLink]);

    const handleGmailShare = useCallback(() => {
        const subject = encodeURIComponent('Try Happpy Agent with my referral link');
        const body = encodeURIComponent(shareText);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, [shareText]);

    const handleMyReferrals = useCallback(() => {
        clearCopiedReset();
        clearCodeCopiedReset();
        setLinkCopied(false);
        setCodeCopied(false);
        setView('rewards');
    }, [clearCopiedReset, clearCodeCopiedReset]);

    const handleBackToInvite = useCallback(() => {
        clearCopiedReset();
        clearCodeCopiedReset();
        setLinkCopied(false);
        setCodeCopied(false);
        setView('invite');
    }, [clearCopiedReset, clearCodeCopiedReset]);

    if (!open || typeof document === 'undefined') return null;

    const titleId =
        view === 'rewards' && rewardsState.variant !== 'empty'
            ? 'jad-refer-friend-referrals-title'
            : view === 'rewards'
                ? 'jad-refer-friend-rewards-title'
                : 'jad-refer-friend-drawer-title';

         
    return createPortal(
        <div
            className="jad-refer-friend-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
        >
            <button
                type="button"
                className="jad-refer-friend-drawer__backdrop"
                aria-label="Close refer a friend"
                onClick={onClose}
            />
            <aside
                className="jad-refer-friend-drawer__panel"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="jad-refer-friend-drawer__close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>

                {view === 'rewards' ? (
                    <>
                        <div className="jad-refer-friend-drawer__body jad-refer-friend-drawer__body--rewards">
                            {rewardsLoading ? (
                                <p className="jad-refer-friend-drawer__rewards-loading" role="status">
                                    Loading referrals…
                                </p>
                            ) : rewardsState.variant === 'empty' ? (
                                <ReferralsRewardsEmptyView
                                    referralLink={referralLink}
                                    linkCopied={linkCopied}
                                    onCopy={handleCopy}
                                    onWhatsApp={handleWhatsAppShare}
                                    onLinkedIn={handleLinkedInShare}
                                    onGmail={handleGmailShare}
                                    isFreeReferrer={isFreeReferrer}
                                />
                            ) : (
                                <ReferralsRewardsListView
                                    variant={rewardsState.variant}
                                    referrals={rewardsState.referrals}
                                    discountPercent={rewardsState.discountPercent}
                                    rewardMode={rewardsState.rewardMode}
                                    showUpgradePlansCta={showUpgradePlansCta}
                                    onUpgradePlansClick={handleUpgradePlansClick}
                                />
                            )}
                        </div>
                        <ReferralRewardsFooter
                            onBack={handleBackToInvite}
                            onCopyCode={handleCopyCode}
                            codeCopied={codeCopied}
                            showCopyCode={rewardsState.variant !== 'empty'}
                            isFreeReferrer={isFreeReferrer}
                        />
                    </>
                ) : (
                    <>
                        <div className="jad-refer-friend-drawer__body">
                            <div className="jad-refer-friend-drawer__hero">
                                <HeroArcArt />
                                <span className="jad-refer-friend-drawer__hero-badge">
                                    {isFreeReferrer
                                        ? '20% off every 3 free trials'
                                        : '20% off each paid referral'}
                                </span>
                                <div className="jad-refer-friend-drawer__hero-copy">
                                    <p className="jad-refer-friend-drawer__hero-eyebrow">Refer &amp; Earn</p>
                                    <h2 id="jad-refer-friend-drawer-title" className="jad-refer-friend-drawer__hero-title">
                                        Invite a friend, get 20% off!
                                    </h2>
                                </div>
                            </div>

                            <section className="jad-refer-friend-drawer__steps" aria-labelledby="jad-refer-friend-steps-title">
                                <h3 id="jad-refer-friend-steps-title" className="jad-refer-friend-drawer__section-label">
                                    How it works:
                                </h3>
                                <ol className="jad-refer-friend-drawer__steps-list">
                                    {howItWorksSteps.map((step) => (
                                        <li key={step.id} className="jad-refer-friend-drawer__step">
                                            <span className="jad-refer-friend-drawer__step-num" aria-hidden="true">
                                                {step.id}
                                            </span>
                                            <p className="jad-refer-friend-drawer__step-text">{step.content}</p>
                                        </li>
                                    ))}
                                </ol>
                            </section>

                            <hr className="jad-refer-friend-drawer__divider" />

                            <ReferralLinkField
                                referralLink={referralLink}
                                linkCopied={linkCopied}
                                onCopy={handleCopy}
                            />

                            <ReferralShareButtons
                                onWhatsApp={handleWhatsAppShare}
                                onLinkedIn={handleLinkedInShare}
                                onGmail={handleGmailShare}
                            />

                            <ReferralInviteField />
                        </div>

                        {showInviteRedeemBanner ? (
                            <InviteRedeemFooterBanner text={inviteRedeemBannerText} />
                        ) : null}
                        <footer
                            className={`jad-refer-friend-drawer__footer${showInviteRedeemBanner ? ' jad-refer-friend-drawer__footer--with-redeem-banner' : ''
                                }`}
                        >
                            <ReferralTermsLink isFreeReferrer={isFreeReferrer} />
                            <button
                                type="button"
                                className="jad-refer-friend-drawer__rewards-btn"
                                onClick={handleMyReferrals}
                            >
                                <span>my referrals &amp; rewards</span>
                                <ArrowRightIcon />
                            </button>
                        </footer>
                    </>
                )}
            </aside>
        </div>,
        document.body,
    );
};

export default ReferFriendDrawer;
