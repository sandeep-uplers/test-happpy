'use client';

import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Modal from "react-modal";
import { useNavigate } from '@/talent/navigation/routerCompat';
import toast from "react-hot-toast";
import DownloadResumeLoader from "../pages/app/resume/payment/DownloadResumeLoader";
import HapppyLoader from "./common/HapppyLoader";
import { API_OUTREACH_DEFAULT_AUTO_TEMPLATES, API_OUTREACH_REWRITE_MESSAGE, API_OUTREACH_STORE_MESSAGE_TEMPLATE, API_OUTREACH_SUBSCRIBE_MODAL_ACTION, API_URL } from "./Constant";
import { GET_API, POST_API, getClientDeviceMobileOrDesktop } from "./Helper";
import { useDispatch, useSelector } from "react-redux";
import { getOutreachAgentPreviewConfig } from "../store/actions/resumeActions";
import TemplateEditor from "../pages/app/linkedin/TemplateEditor";
import { GmailIcon } from "../assets/IconSVG";
import TrialFeedbackModal from "./TrialFeedbackModal";
import "../pages/app/agent-onboarding/AgentOnboarding.css";

ensureModalAppElement();

const SKIP_PREVIEW_KEY = "referral_agent_skip_preview";

const VAR_FIELDS = [
    "{{outreachEmployeeName}}",
    "{{jobTitle}}",
    "{{companyName}}",
    "{{jobLink}}",
];

const PREVIEW_MODAL_STYLES = `
.rap-preview-drawer {
    position: fixed;
    inset: 0;
    z-index: 10070;
    display: flex;
    justify-content: flex-end;
}
.rap-preview-drawer__backdrop {
    position: absolute;
    inset: 0;
    background: rgba(20, 20, 20, 0.5);
    backdrop-filter: blur(2px);
    border: 0;
    cursor: pointer;
    padding: 0;
    margin: 0;
    animation: rap-preview-drawer-fade 0.18s ease-out;
}
@keyframes rap-preview-drawer-fade {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes rap-preview-drawer-slide {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
}
@keyframes rap-preview-drawer-slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
}
.rap-preview-drawer__panel {
    position: relative;
    width: min(814px, 100vw);
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    box-shadow: -20px 0 48px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    animation: rap-preview-drawer-slide 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
    border-radius: 8px 0 0 8px;
    font-family: "Rubik", "Montserrat", system-ui, sans-serif;
}
.rap-preview-drawer__close {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    color: #231f20;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s ease;
}
.rap-preview-drawer__close:hover {
    background: rgba(35, 31, 32, 0.06);
}
.rap-preview-drawer__close .material-symbols-outlined {
    font-size: 1.5rem;
}
.rap-preview-drawer__body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}
.rap-preview-drawer__scroll {
    flex: 1;
    overflow-y: auto;
    padding: 56px 48px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}
.rap-preview-drawer__step-header {
    max-width: 640px;
}
.rap-preview-drawer__step-title {
    margin: 0 0 4px;
    font-family: "Rubik", sans-serif;
    font-weight: 800;
    font-size: 24px;
    line-height: 1.17;
    letter-spacing: -0.36px;
    color: #231f20;
}
.rap-preview-drawer__step-lede {
    margin: 0;
    font-family: "Rubik", sans-serif;
    font-weight: 300;
    font-size: 12px;
    line-height: 1.4;
    color: #6b6b6b;
}
.rap-preview-drawer__step-lede strong {
    font-weight: 600;
    color: #231f20;
}
.rap-preview-drawer__content {
    width: 100%;
    max-width: 718px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.rap-preview-drawer__preview-tabs {
    background: #e4e1dc;
    padding: 4px;
    display: flex;
    gap: 8px;
    align-items: center;
    border-radius: 8px;
    margin-bottom: 1rem;
}
.rap-preview-drawer__preview-tab {
    flex: 1 1 0;
    min-width: 0;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    padding: 4px 8px;
    color: #141414;
    font-family: "Montserrat", "Rubik", sans-serif;
    font-weight: 500;
    font-size: 12px;
    transition: background 120ms ease, border-color 120ms ease;
}
.rap-preview-drawer__preview-tab:hover {
    background: rgba(255, 255, 255, 0.4);
}
.rap-preview-drawer__preview-tab--active {
    background: #ffffff;
    border-color: #a09b93;
    font-weight: 600;
}
.rap-preview-drawer__preview-tab-icon {
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}
.rap-preview-drawer__preview-tab-icon svg {
    width: 24px;
    height: 24px;
}
.rap-preview-drawer__message-card {
    border: 1.5px solid #dee1e7;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
}
.rap-preview-drawer__message-card--with-warning {
    overflow: visible;
}
.rap-preview-drawer__message-card--with-warning .rap-preview-drawer__message-body,
.rap-preview-drawer__message-card--with-warning .rap-preview-drawer__message-body-loading {
    padding-top: 28px;
}
.rap-preview-drawer__message-card--with-tabs {
    border-radius: 8px;
}
.rap-preview-drawer__message-head {
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 13px;
    background: #f2f2f3;
    border-bottom: 1px solid #e4e1dc;
    min-height: 55px;
    box-sizing: border-box;
}
.rap-preview-drawer__message-head--with-warning {
    z-index: 1;
}
.rap-preview-drawer__message-head-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.rap-preview-drawer__message-subject {
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
    font-size: 12px;
    line-height: 1.4;
}
.rap-preview-drawer__message-subject-label {
    font-weight: 700;
    color: #086d7e;
}
.rap-preview-drawer__message-subject-value {
    font-weight: 400;
    color: #086d7e;
    word-break: break-word;
}
.rap-preview-drawer__message-from {
    margin: 0;
    font-size: 11px;
    font-weight: 300;
    font-style: italic;
    line-height: 1.4;
    color: #6b6b6b;
}
.rap-preview-drawer__rewrite-btn {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border: none;
    border-radius: 20px;
    background: #adffd9;
    color: #231f20;
    font-family: "Montserrat", "Rubik", sans-serif;
    font-weight: 700;
    font-size: 12px;
    letter-spacing: -0.08px;
    cursor: pointer;
    transition: background 120ms ease, opacity 120ms ease;
}
.rap-preview-drawer__rewrite-btn:hover:not(:disabled) {
    background: #46eccd;
}
.rap-preview-drawer__rewrite-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.rap-preview-drawer__rewrite-btn .material-symbols-outlined {
    font-size: 16px;
}
.rap-preview-drawer__message-body {
    padding: 12px;
    font-size: 12px;
    font-weight: 300;
    line-height: 16px;
    color: #231f20;
}
.rap-preview-drawer__message-body p {
    margin: 0 0 12px;
}
.rap-preview-drawer__message-body p:last-child {
    margin-bottom: 0;
}
.rap-preview-drawer__message-body--empty {
    color: #6b6b6b;
    font-style: italic;
}
.rap-preview-drawer__message-body-loading {
    padding: 12px;
    min-height: 12rem;
    display: flex;
    flex-direction: column;
    gap: 10px;
}
@keyframes rap-preview-skel-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -20% 0; }
}
.rap-preview-drawer__message-skel-line {
    display: block;
    flex-shrink: 0;
    align-self: flex-start;
    height: 10px;
    border-radius: 4px;
    background-color: #e4e1dc;
    background-image: linear-gradient(
        90deg,
        #e4e1dc 25%,
        #f8f7f5 50%,
        #e4e1dc 75%
    );
    background-size: 220% 100%;
    animation: rap-preview-skel-shimmer 1.3s linear infinite;
}
.rap-preview-drawer__message-skel-line--full { width: 100%; }
.rap-preview-drawer__message-skel-line--lg { width: 92%; }
.rap-preview-drawer__message-skel-line--md { width: 78%; }
.rap-preview-drawer__message-skel-line--sm { width: 64%; }
.rap-preview-drawer__message-skel-line--xs { width: 48%; }
.rap-preview-drawer__message-skel-gap {
    height: 6px;
}
.rap-preview-drawer__resume-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
    background: rgba(157, 250, 213, 0.3);
    border-radius: 0 0 8px 8px;
    min-height: 60px;
    box-sizing: border-box;
}
.rap-preview-drawer__resume-bar-left {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
}
.rap-preview-drawer__resume-bar-icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}
.rap-preview-drawer__resume-bar-icon .material-symbols-outlined {
    font-size: 14px;
}
.rap-preview-drawer__resume-bar-text {
    margin: 0;
    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
    color: #231f20;
    letter-spacing: -0.08px;
}
.rap-preview-drawer__resume-bar-link {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 50%;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    color: #059599;
    cursor: pointer;
}
.rap-preview-drawer__resume-bar-link .material-symbols-outlined {
    font-size: 16px;
    text-decoration: none;
}
.rap-preview-drawer__resume-filename {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: underline;
    text-underline-offset: 2px;
}
.rap-preview-drawer__agent-bubble {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    max-width: 547px;
}
.rap-preview-drawer__agent-mascot {
    flex-shrink: 0;
    width: 46px;
    height: 48px;
}
.rap-preview-drawer__agent-mascot img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
}
.rap-preview-drawer__agent-bubble-content {
    position: relative;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid #6a7e82;
    border-radius: 8px;
    box-shadow: 2px 4px 2px rgba(129, 127, 127, 0.24);
}
.rap-preview-drawer__agent-bubble-content::before {
    content: "";
    position: absolute;
    left: -11px;
    top: 12px;
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    border-right: 11px solid #6a7e82;
}
.rap-preview-drawer__agent-bubble-content::after {
    content: "";
    position: absolute;
    left: -9px;
    top: 13px;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
    border-right: 10px solid #ffffff;
}
.rap-preview-drawer__agent-bubble-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.rap-preview-drawer__agent-bubble-title {
    margin: 0;
    font-family: "Rubik", sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: normal;
    color: #086d7e;
}
.rap-preview-drawer__agent-bubble-sub {
    margin: 0;
    font-family: "Rubik", sans-serif;
    font-size: 10px;
    font-weight: 300;
    line-height: normal;
    letter-spacing: -0.0762px;
    color: #231f20;
}
.rap-preview-drawer__agent-bubble-hint {
    margin: 0;
    font-family: "Rubik", sans-serif;
    font-size: 10px;
    font-weight: 300;
    line-height: normal;
    letter-spacing: -0.0762px;
    color: #6b6b6b;
}
.rap-preview-drawer__agent-bubble-link {
    padding: 0;
    border: none;
    background: none;
    font-family: "Rubik", sans-serif;
    font-size: 10px;
    font-weight: 500;
    font-style: italic;
    line-height: normal;
    letter-spacing: -0.0762px;
    color: #4c4c4c;
    cursor: pointer;
    text-decoration: none;
}
.rap-preview-drawer__agent-bubble-link:hover {
    text-decoration: underline;
    text-underline-offset: 2px;
}
.rap-preview-drawer__messages-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 16rem;
    padding: 2rem;
    border: 1px solid #c9c4b5;
    border-radius: 8px;
    background: #f4f4f4;
}
.rap-preview-drawer__account-warning {
    background: #fff2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    font-size: 12px;
    line-height: 1.5;
    color: #7f1d1d;
    font-weight: 500;
}
.rap-preview-drawer__footer-notes {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    max-width: 718px;
    margin: 0 auto 8px;
}
.rap-preview-drawer__default-message-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #d6f4ef;
    background: #d6f4ef;
    font-size: 11px;
    line-height: 1.45;
    color: #231f20;
}
.rap-preview-drawer__default-message-note .material-symbols-outlined {
    flex-shrink: 0;
    font-size: 16px;
    color: #231f20;
}
.rap-preview-drawer__default-message-note p {
    margin: 0;
    font-size: inherit;
}
.rap-preview-drawer__default-message-note button {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-weight: 600;
    color: #059599;
    text-decoration: underline;
    cursor: pointer;
}
.rap-preview-drawer__resume-warning {
    position: absolute;
    right: 12px;
    top: calc(100% - 9px);
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 4px 6px;
    padding: 6px 10px;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(120, 53, 15, 0.1);
    font-size: 11px;
    line-height: 1.4;
    color: #78350f;
    text-align: left;
}

@media (max-width: 767px) {
    .rap-preview-drawer__resume-warning {
        right: -12px;
        width: calc(100% + 24px);
    }
    
    .rap-preview-drawer__resume-warning span strong{
        display: none;
        }
}

.rap-preview-drawer__resume-warning-cta {
    padding: 0;
    border: none;
    background: none;
    font: inherit;
    font-weight: 700;
    color: #b45309;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
}
.rap-preview-drawer__resume-warning-cta:hover:not(:disabled) {
    color: #92400e;
}
.rap-preview-drawer__resume-warning-cta:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.rap-preview-drawer__footer-cta-spinner {
    display: inline-flex;
}
.rap-preview-drawer__loading-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.92);
}
.rap-preview-drawer__loading-text {
    margin: 0;
    font-family: "Rubik", sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #4c4c4c;
}
.rap-preview-drawer__auto-reply-footer {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
}
.rap-preview-drawer__auto-reply-banner {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 48px;
    background: #d6f4ef;
    border-top: 1px solid #b8e8df;
}
.rap-preview-drawer__auto-reply-check {
    display: inline-flex;
    align-items: flex-start;
    gap: 10px;
    cursor: pointer;
    user-select: none;
}
.rap-preview-drawer__auto-reply-check--disabled {
    cursor: wait;
    opacity: 0.7;
}
.rap-preview-drawer__auto-reply-check-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
}
.rap-preview-drawer__auto-reply-check-box {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    margin-top: 1px;
    border: 1.5px solid #231f20;
    border-radius: 3px;
    background: #ffffff;
    position: relative;
}
.rap-preview-drawer__auto-reply-check-input:checked + .rap-preview-drawer__auto-reply-check-box {
    background: #231f20;
}
.rap-preview-drawer__auto-reply-check-input:checked + .rap-preview-drawer__auto-reply-check-box::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}
.rap-preview-drawer__auto-reply-check-input:focus-visible + .rap-preview-drawer__auto-reply-check-box {
    outline: 2px solid #231f20;
    outline-offset: 2px;
}
.rap-preview-drawer__auto-reply-check-label {
    font-size: 12px;
    line-height: 1.45;
    font-weight: 600;
    color: #231f20;
}
.rap-preview-drawer__auto-reply-link {
    align-self: flex-start;
    padding: 0;
    border: none;
    background: none;
    font-size: 11px;
    line-height: 1.45;
    font-weight: 600;
    color: #059599;
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
}
.rap-preview-drawer__auto-reply-link:hover {
    color: #047a7d;
}
.rap-preview-drawer__auto-reply-loading {
    font-size: 11px;
    line-height: 1.45;
    color: #6b6b6b;
}
.rap-preview-drawer .agent-onb-footer {
    border-radius: 0;
}
.rap-preview-drawer .agent-onb-tpl-wrap {
    margin-top: 8px;
}
@media (max-width: 767px) {
    .rap-preview-drawer {
        flex-direction: column;
        justify-content: flex-end;
        align-items: stretch;
    }
    .rap-preview-drawer__panel {
        flex: 0 0 auto;
        width: 100vw;
        max-width: 100vw;
        height: calc(100vh - 64px);
        height: calc(100dvh - 64px);
        max-height: calc(100dvh - 64px);
        border-radius: 12px 12px 0 0;
        animation: rap-preview-drawer-slide-up 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .rap-preview-drawer__scroll {
        padding: 48px 16px 16px;
    }
    .rap-preview-drawer__step-title {
        font-size: 20px;
    }
    .rap-preview-drawer__message-head {
        flex-direction: column;
        align-items: stretch;
    }
    .rap-preview-drawer__rewrite-btn {
        align-self: flex-start;
    }
    .rap-preview-drawer__resume-bar {
        flex-direction: column;
        align-items: flex-start;
    }
    .rap-preview-drawer__resume-bar-link {
        max-width: 100%;
    }
    .rap-preview-drawer .agent-onb-footer {
        padding: 16px;
    }
    .rap-preview-drawer__footer-notes {
        padding: 0 16px;
    }
    .rap-preview-drawer__auto-reply-banner {
        padding: 12px 16px;
    }
}
`;

const MatIcon = ({ name, className = "", filled = false }) => (
    <span
        className={`material-symbols-outlined${className ? ` ${className}` : ""}`}
        style={filled ? { fontVariationSettings: '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24' } : undefined}
        aria-hidden
    >
        {name}
    </span>
);

const MASCOT_NEUTRAL_SRC = "/images/talent/outreach/mascot-insight.svg";
const EMPTY_SETUP_DRAFT = { subject: "", body: "" };
const OUTREACH_PROVIDER_LINKEDIN = 1;
const OUTREACH_PROVIDER_GMAIL = 2;

function LinkedinTabIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.063 2.063 0 11-.001-4.126 2.063 2.063 0 010 4.126zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="#0077B5"
            />
        </svg>
    );
}

function SetupInfoIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
        </svg>
    );
}

function FooterBackIcon() {
    return (
        <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M25.9668 16.4004H6.83346" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.4001 6.83301L6.83348 16.3997L16.4001 25.9663" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function FooterArrowIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ResumeUpdatedWarning({ onReview, disabled }) {
    return (
        <div className="rap-preview-drawer__resume-warning" role="alert">
            <span>
                <strong>Resume updated.</strong> Review messages to reflect your latest resume.
            </span>
            <button
                type="button"
                className="rap-preview-drawer__resume-warning-cta"
                onClick={onReview}
                disabled={disabled}
            >
                Review messages
            </button>
        </div>
    );
}

function MessageRewriteSkeleton() {
    return (
        <div className="rap-preview-drawer__message-body-loading" aria-busy="true" aria-label="Rewriting message">
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--lg" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--full" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--md" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--full" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--sm" />
            <span className="rap-preview-drawer__message-skel-gap" aria-hidden="true" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--full" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--lg" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--md" />
            <span className="rap-preview-drawer__message-skel-line rap-preview-drawer__message-skel-line--xs" />
        </div>
    );
}

const setupTabBodyKey = (tab) =>
    tab === OUTREACH_PROVIDER_LINKEDIN ? "linkedin_template" : "gmail_template";

const AGENT_NAME = "HAPPPY Agent";
const AUTO_REPLY_CONFIGURE_URL = "/talent/job-agent/configure?tab=auto-reply";

export default function ReferralAgentPreviewModal({
    isOpen = false,
    onClose = () => { },
    onDownload = () => { },
    HR_Number,
    onConfirm,
    selectedResume,
    noTailorHTML = false
}) {
    const [activeTab, setActiveTab] = useState("gmail");
    const [drawerStep, setDrawerStep] = useState("preview");
    const [skipPreview, setSkipPreview] = useState(false);
    const [outreachAgentPreviewConfig, setOutreachAgentPreviewConfig] = useState(null);
    const [showSubscribeModal, setShowSubscribeModal] = useState(null);
    const [allProcessed, setAllProcessed] = useState(false);
    const [rewritingProvider, setRewritingProvider] = useState(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [setupTab, setSetupTab] = useState(OUTREACH_PROVIDER_GMAIL);
    const [setupModes, setSetupModes] = useState({ 1: "template1", 2: "template1" });
    const [setupDrafts, setSetupDrafts] = useState({ 1: EMPTY_SETUP_DRAFT, 2: EMPTY_SETUP_DRAFT });
    const [setupErrors, setSetupErrors] = useState({ 1: {}, 2: {} });
    const [setupTemplateAppliedAt, setSetupTemplateAppliedAt] = useState({ 1: null, 2: null });
    const [defaultTemplates, setDefaultTemplates] = useState({ gmail_template: [], linkedin_template: [] });
    const [setupSaving, setSetupSaving] = useState(false);
    const [originalTemplates, setOriginalTemplates] = useState({
        gmail: null,
        linkedin: null,
    });
    const [autoReplySettings, setAutoReplySettings] = useState(null);
    const [autoReplyLoading, setAutoReplyLoading] = useState(false);
    const [autoReplySaving, setAutoReplySaving] = useState(false);
    const [previewConfigLoading, setPreviewConfigLoading] = useState(false);

    const autoReplyMountedRef = useRef(true);
    useEffect(() => {
        autoReplyMountedRef.current = true;
        return () => {
            autoReplyMountedRef.current = false;
        };
    }, []);

    const { downloadTailorResume } = useSelector(state => state.loader);
    const downloadLoading = downloadTailorResume;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const gmailResumeOutdated =
        !!outreachAgentPreviewConfig?.gmail_connected &&
        !!outreachAgentPreviewConfig?.gmail_template?.resume_updated;
    const linkedinResumeOutdated =
        !!outreachAgentPreviewConfig?.linkedin_connected &&
        !!outreachAgentPreviewConfig?.linkedin_template?.resume_updated;
    const showResumeWarning = gmailResumeOutdated || linkedinResumeOutdated;

    const gmailMessageChanged =
        !!originalTemplates.gmail &&
        !!outreachAgentPreviewConfig?.gmail_template &&
        (outreachAgentPreviewConfig.gmail_template.message !== originalTemplates.gmail.message ||
            outreachAgentPreviewConfig.gmail_template.subject !== originalTemplates.gmail.subject);

    const linkedinMessageChanged =
        !!originalTemplates.linkedin &&
        !!outreachAgentPreviewConfig?.linkedin_template &&
        outreachAgentPreviewConfig.linkedin_template.message !== originalTemplates.linkedin.message;

    const hasCustomizedMessage = gmailMessageChanged || linkedinMessageChanged;

    const handleConfirm = async () => {
        if (skipPreview) {
            localStorage.setItem(SKIP_PREVIEW_KEY, "true");
        }

        setConfirmLoading(true);

        try {
            const saveRequests = [];

            if (gmailMessageChanged && outreachAgentPreviewConfig?.gmail_connected) {
                saveRequests.push({
                    provider: OUTREACH_PROVIDER_GMAIL,
                    promise: POST_API(API_OUTREACH_STORE_MESSAGE_TEMPLATE, {
                        provider: OUTREACH_PROVIDER_GMAIL,
                        message_template: outreachAgentPreviewConfig.gmail_template.message,
                        message_subject: outreachAgentPreviewConfig.gmail_template.subject ?? "",
                        tag: "rewrite-message-from-preview",
                    }),
                });
            }

            if (linkedinMessageChanged && outreachAgentPreviewConfig?.linkedin_connected) {
                saveRequests.push({
                    provider: OUTREACH_PROVIDER_LINKEDIN,
                    promise: POST_API(API_OUTREACH_STORE_MESSAGE_TEMPLATE, {
                        provider: OUTREACH_PROVIDER_LINKEDIN,
                        message_template: outreachAgentPreviewConfig.linkedin_template.message,
                        tag: "rewrite-message-from-preview",
                    }),
                });
            }

            const messageTemplateIds = {};
            if (saveRequests.length) {
                const responses = await Promise.all(
                    saveRequests.map(({ provider, promise }) =>
                        promise.then((res) => ({ provider, res }))
                    )
                );
                for (const { provider, res } of responses) {
                    const templateId = res?.data?.template_id;
                    if (!templateId) continue;
                    if (provider === OUTREACH_PROVIDER_GMAIL) {
                        messageTemplateIds.gmail_message_id = templateId;
                    } else if (provider === OUTREACH_PROVIDER_LINKEDIN) {
                        messageTemplateIds.linkedin_message_id = templateId;
                    }
                }
            }

            const result = (onConfirm || onClose)(messageTemplateIds);
            if (result && typeof result.then === "function") {
                await result;
            }
        } catch (err) {
            console.log(err);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleReviewTemplate = () => {
        if (typeof onClose === "function") onClose();
        navigate("/talent/job-agent/configure");
    };

    const fetchAutoReplySettings = useCallback(async () => {
        setAutoReplyLoading(true);
        try {
            const res = await GET_API(`${API_URL}talent/outreach/get-auto-reply`);
            if (res?.data?.status === 200 && res?.data?.data) {
                const d = res.data.data;
                if (!autoReplyMountedRef.current) return;
                setAutoReplySettings({
                    handle_auto_reply: Boolean(d.handle_auto_reply),
                    hours: d.hours,
                    auto_reply_categories: Array.isArray(d.auto_reply_categories)
                        ? d.auto_reply_categories
                        : [],
                });
            }
        } catch (e) {
            if (autoReplyMountedRef.current) {
                toast.error(e?.response?.data?.message || "Failed to load auto-reply settings");
            }
        } finally {
            if (autoReplyMountedRef.current) setAutoReplyLoading(false);
        }
    }, []);

    const handleAutoReplyToggle = async (checked) => {
        if (!autoReplySettings || autoReplySaving) return;

        if (checked && autoReplySettings.auto_reply_categories.length === 0) {
            toast.error("Select at least one category to enable auto-reply");
            return;
        }

        const previousSettings = autoReplySettings;
        const nextSettings = {
            ...autoReplySettings,
            handle_auto_reply: checked,
        };

        setAutoReplySettings(nextSettings);
        setAutoReplySaving(true);

        try {
            const res = await POST_API(`${API_URL}talent/outreach/update-auto-reply`, {
                hours: previousSettings.hours,
                handle_auto_reply: checked,
                auto_reply_categories: previousSettings.auto_reply_categories,
            });
            if (res?.data?.status !== 200) {
                setAutoReplySettings(previousSettings);
                toast.error(res?.data?.message || "Failed to update auto-reply setting");
            }
        } catch (e) {
            setAutoReplySettings(previousSettings);
            toast.error(e?.response?.data?.message || "Failed to update auto-reply setting");
        } finally {
            if (autoReplyMountedRef.current) setAutoReplySaving(false);
        }
    };

    const handleGoToAutoReplySettings = () => {
        if (typeof onClose === "function") onClose();
        window.open(AUTO_REPLY_CONFIGURE_URL, '_blank');
    };

    const infoMembers = 4;

    useEffect(() => {
        let cancelled = false;
        setPreviewConfigLoading(true);

        getOutreachAgentPreviewConfig(HR_Number, true)(dispatch)
            .then((res) => {
                if (cancelled) return;
                const newConfigData = res.data.data;
                checkEligibility(newConfigData);
                setOutreachAgentPreviewConfig(newConfigData);
                setOriginalTemplates({
                    gmail: newConfigData?.gmail_template
                        ? {
                            message: newConfigData.gmail_template.message ?? "",
                            subject: newConfigData.gmail_template.subject ?? "",
                        }
                        : null,
                    linkedin: newConfigData?.linkedin_template
                        ? {
                            message: newConfigData.linkedin_template.message ?? "",
                        }
                        : null,
                });
                hydrateSetupDrafts(newConfigData);
            })
            .catch((err) => {
                if (cancelled) return;
                console.log(err);
            })
            .finally(() => {
                if (!cancelled) setPreviewConfigLoading(false);
            });

        GET_API(API_OUTREACH_DEFAULT_AUTO_TEMPLATES)
            .then((res) => {
                if (cancelled) return;
                const defaults = res?.data?.data || {};
                setDefaultTemplates({
                    gmail_template: defaults.gmail_template || [],
                    linkedin_template: defaults.linkedin_template || [],
                });
            })
            .catch(() => { });

        return () => {
            cancelled = true;
        };
    }, [HR_Number]);

    useEffect(() => {
        if (isOpen) {
            if (outreachAgentPreviewConfig) {
                checkEligibility(outreachAgentPreviewConfig, true);
            }
        } else {
            setAllProcessed(false);
            setDrawerStep("preview");
            setSetupSaving(false);
            setConfirmLoading(false);
        }
    }, [isOpen, outreachAgentPreviewConfig]);

    const previewVisible = isOpen && showSubscribeModal !== true;
    const showPreviewLoading = previewConfigLoading || !outreachAgentPreviewConfig || confirmLoading;

    useEffect(() => {
        if (!previewVisible) return undefined;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [previewVisible]);

    useEffect(() => {
        if (!previewVisible) return undefined;
        const onKeyDown = (e) => {
            if (e.key === "Escape" && !downloadLoading && !confirmLoading && !previewConfigLoading) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [previewVisible, onClose, downloadLoading, confirmLoading, previewConfigLoading]);

    useEffect(() => {
        if (!previewVisible) {
            setAutoReplySettings(null);
            setAutoReplyLoading(false);
            setAutoReplySaving(false);
            return;
        }
        fetchAutoReplySettings();
    }, [previewVisible, fetchAutoReplySettings]);

    const checkEligibility = (outreachAgentPreviewConfig, onLoadCheck = false) => {
        const plan = outreachAgentPreviewConfig?.plan;
        if (plan && (plan.expired || (!plan.paid && plan.daily_limit_exceeded))) {
            setShowSubscribeModal(true);
        } else {
            if (!onLoadCheck) setShowSubscribeModal(false);
        }
        setAllProcessed(true);
    }

    const handleDownload = (e) => {
        if (selectedResume === "tailored") {
            onDownload(e);
        } else
            window.open(outreachAgentPreviewConfig?.resumePath?.url, '_blank');
    }

    const handleSubscribeModalClose = () => {
        setShowSubscribeModal(false);
        onClose();
    };

    const hydrateSetupDrafts = (configData) => {
        const stamp = Date.now();
        const nextDrafts = {};
        const nextModes = {};

        [OUTREACH_PROVIDER_LINKEDIN, OUTREACH_PROVIDER_GMAIL].forEach((tab) => {
            const template = tab === OUTREACH_PROVIDER_GMAIL
                ? configData?.gmail_template
                : configData?.linkedin_template;

            if (template?.message) {
                nextDrafts[tab] = {
                    subject: template.subject ?? "",
                    body: template.message ?? "",
                };
                nextModes[tab] = "template1";
            } else {
                nextDrafts[tab] = { ...EMPTY_SETUP_DRAFT };
                nextModes[tab] = "template1";
            }
        });

        setSetupDrafts(nextDrafts);
        setSetupModes(nextModes);
        setSetupTemplateAppliedAt({ 1: stamp, 2: stamp });
        setSetupErrors({ 1: {}, 2: {} });
    };

    const validateSetupDraft = (tab, draft) => {
        const errors = {};
        const body = draft?.body || "";

        if (tab === OUTREACH_PROVIDER_GMAIL && !(draft?.subject || "").trim()) {
            errors.subject = "Email subject is required";
        }
        if (!sanitiseHtml(body)) {
            errors.body = "Template message is required";
        } else {
            const missing = VAR_FIELDS.filter((field) => !body.includes(field));
            if (missing.length) {
                errors.body = `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required`;
            }
        }
        return errors;
    };

    const applySetupDraftsToConfig = () => {
        const gmailDraft = setupDrafts[OUTREACH_PROVIDER_GMAIL];
        const linkedinDraft = setupDrafts[OUTREACH_PROVIDER_LINKEDIN];

        setOutreachAgentPreviewConfig((prev) => {
            if (!prev) return prev;
            const next = { ...prev };

            if (prev.gmail_connected && gmailDraft?.body) {
                next.gmail_template = {
                    ...(prev.gmail_template || {}),
                    message: gmailDraft.body.trim(),
                    subject: gmailDraft.subject?.trim() ?? "",
                };
            }

            if (prev.linkedin_connected && linkedinDraft?.body) {
                next.linkedin_template = {
                    ...(prev.linkedin_template || {}),
                    message: linkedinDraft.body.trim(),
                };
            }

            return next;
        });
    };

    const handleSetupChipSelect = (tab, mode) => {
        const tabDefaults = defaultTemplates[setupTabBodyKey(tab)] || [];
        let nextDraft = setupDrafts[tab] || EMPTY_SETUP_DRAFT;

        if (mode === "template1") {
            const template = tabDefaults[0];
            if (!template) return;
            nextDraft = {
                subject: template.message_subject || template.title || "",
                body: template.message_template || "",
            };
        } else if (mode === "template2") {
            const template = tabDefaults[1];
            if (!template) return;
            nextDraft = {
                subject: template.message_subject || template.title || "",
                body: template.message_template || "",
            };
        } else if (mode === "scratch") {
            nextDraft = { ...EMPTY_SETUP_DRAFT };
        }

        setSetupDrafts((prev) => ({ ...prev, [tab]: nextDraft }));
        setSetupModes((prev) => ({ ...prev, [tab]: mode }));
        setSetupErrors((prev) => ({ ...prev, [tab]: {} }));
        setSetupTemplateAppliedAt((prev) => ({ ...prev, [tab]: Date.now() }));
    };

    const handleSetupDraftChange = (tab, key, value) => {
        setSetupDrafts((prev) => ({
            ...prev,
            [tab]: { ...prev[tab], [key]: value },
        }));
        if (setupErrors[tab]?.[key]) {
            setSetupErrors((prev) => ({
                ...prev,
                [tab]: { ...prev[tab], [key]: undefined },
            }));
        }
    };

    const handleSetupTabChange = (nextTab) => {
        if (nextTab === setupTab) return;
        setSetupTab(nextTab);
    };

    const handleSetupNext = () => {
        const linkedinConnected = !!outreachAgentPreviewConfig?.linkedin_connected;
        if (setupTab === OUTREACH_PROVIDER_LINKEDIN && !linkedinConnected) {
            setDrawerStep("preview");
            return;
        }

        const draft = setupDrafts[setupTab] || EMPTY_SETUP_DRAFT;
        const validation = validateSetupDraft(setupTab, draft);
        if (Object.keys(validation).length) {
            setSetupErrors((prev) => ({ ...prev, [setupTab]: validation }));
            return;
        }

        setSetupSaving(true);
        applySetupDraftsToConfig();
        setSetupSaving(false);
        setDrawerStep("preview");
    };

    const handleRewriteMessage = (provider) => {
        setRewritingProvider(provider);
        POST_API(API_OUTREACH_REWRITE_MESSAGE, { provider })
            .then((res) => {
                if (res.data?.status !== "success" || !res.data?.data) return;
                const { message, subject } = res.data.data;
                setOutreachAgentPreviewConfig((prev) => {
                    if (!prev) return prev;
                    if (provider === OUTREACH_PROVIDER_GMAIL) {
                        return {
                            ...prev,
                            gmail_template: {
                                ...prev.gmail_template,
                                message,
                                ...(subject ? { subject } : {}),
                            },
                        };
                    }
                    return {
                        ...prev,
                        linkedin_template: {
                            ...prev.linkedin_template,
                            message,
                        },
                    };
                });
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setRewritingProvider(null);
            });
    };

    const handleGoToConfigure = () => {
        if (typeof onClose === "function") onClose();
        navigate("/talent/job-agent/configure");
    };

    const handleGoToMyActivity = () => {
        if (typeof onClose === "function") onClose();
        navigate("/talent/job-agent/my-activity");
    };

    const sanitiseHtml = (html = "") => (html || "").replace(/<[^>]*>/g, "").trim();

    const companyName = outreachAgentPreviewConfig?.hr?.company_name?.trim() || "";
    const jobLabel = (outreachAgentPreviewConfig?.hr?.job_title || "").trim();
    const gmailConnected = !!outreachAgentPreviewConfig?.gmail_connected;
    const linkedinConnected = !!outreachAgentPreviewConfig?.linkedin_connected;
    const showAccountsRequiredLede = !gmailConnected && !linkedinConnected;
    const resumeFilename = selectedResume === "tailored"
        ? "Tailored Resume"
        : outreachAgentPreviewConfig?.resume_name ?? "Your Profile Resume";
    const resumeDescription = selectedResume === "tailored"
        ? "The tailored resume will be automatically attached as a PDF to all outgoing emails."
        : "Your latest profile resume will be automatically attached as a PDF to all outgoing emails.";
    const agentBubbleTitle = companyName
        ? `${AGENT_NAME} will reach out to ${infoMembers} employees at ${companyName}.`
        : `${AGENT_NAME} will reach out to ${infoMembers} employees for this role.`;
    const setupTabDefaults = defaultTemplates[setupTabBodyKey(setupTab)] || [];
    const setupDraft = setupDrafts[setupTab] || EMPTY_SETUP_DRAFT;
    const setupDraftErrors = setupErrors[setupTab] || {};
    const setupMode = setupModes[setupTab] || "template1";
    const setupLinkedinLocked = setupTab === OUTREACH_PROVIDER_LINKEDIN && !outreachAgentPreviewConfig?.linkedin_connected;
    const setupBannerText = setupMode === "scratch"
        ? "Create your own referral outreach message. If left blank, Template 1 will be used by default."
        : "Your outreach referrals will be sent using this template";

    return (
        <>
            {isOpen && allProcessed && showSubscribeModal && (
                <SubscribeModal
                    plan={outreachAgentPreviewConfig?.plan}
                    onClose={handleSubscribeModalClose}
                />
            )}
            {previewVisible && typeof document !== "undefined" && createPortal(
                <div
                    className="rap-preview-drawer"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="rap-preview-drawer-title"
                >
                    <style>{PREVIEW_MODAL_STYLES}</style>
                    <button
                        type="button"
                        className="rap-preview-drawer__backdrop"
                        aria-label="Close preview"
                        onClick={() => {
                            if (!downloadLoading && !confirmLoading && !previewConfigLoading) onClose();
                        }}
                    />
                    <aside
                        className="rap-preview-drawer__panel"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {downloadLoading && <DownloadResumeLoader />}
                        {showPreviewLoading && !downloadLoading ? (
                            <div
                                className="rap-preview-drawer__loading-overlay"
                                aria-busy="true"
                                aria-label={confirmLoading ? "Sending" : "Loading preview"}
                            >
                                <HapppyLoader size="lg" />
                                <p className="rap-preview-drawer__loading-text">
                                    {confirmLoading ? "Sending..." : "Loading..."}
                                </p>
                            </div>
                        ) : null}
                        <button
                            type="button"
                            className="rap-preview-drawer__close"
                            aria-label="Close"
                            onClick={() => {
                                if (!downloadLoading && !confirmLoading && !setupSaving && !previewConfigLoading) onClose();
                            }}
                        >
                            <MatIcon name="close" />
                        </button>

                        <div className="rap-preview-drawer__body">
                            <div className="rap-preview-drawer__scroll" id="rapPreviewDrawerScroll">
                                {drawerStep === "setup" ? (
                                    <>
                                        <header className="rap-preview-drawer__step-header">
                                            <h2 id="rap-preview-drawer-title" className="rap-preview-drawer__step-title">
                                                Set up your outreach message
                                            </h2>
                                            <p className="rap-preview-drawer__step-lede">
                                                Create your own message or personalise the default messages your agent will send
                                            </p>
                                        </header>

                                        <div className="agent-onb-tpl-wrap">
                                            <div className="agent-onb-tpl-card">
                                                <div className="agent-onb-tpl-card__tabs-wrap">
                                                    <div className="agent-onb-tpl-card__tabs" role="tablist">
                                                        <button
                                                            type="button"
                                                            role="tab"
                                                            aria-selected={setupTab === OUTREACH_PROVIDER_GMAIL}
                                                            className={`agent-onb-tpl-card__tab${setupTab === OUTREACH_PROVIDER_GMAIL ? " agent-onb-tpl-card__tab--active" : ""}`}
                                                            onClick={() => handleSetupTabChange(OUTREACH_PROVIDER_GMAIL)}
                                                            disabled={setupSaving}
                                                        >
                                                            <span className="agent-onb-tpl-card__tab-icon"><GmailIcon /></span>
                                                            <span>Gmail Template</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            role="tab"
                                                            aria-selected={setupTab === OUTREACH_PROVIDER_LINKEDIN}
                                                            className={`agent-onb-tpl-card__tab${setupTab === OUTREACH_PROVIDER_LINKEDIN ? " agent-onb-tpl-card__tab--active" : ""}`}
                                                            onClick={() => handleSetupTabChange(OUTREACH_PROVIDER_LINKEDIN)}
                                                            disabled={setupSaving}
                                                        >
                                                            <span className="agent-onb-tpl-card__tab-icon"><LinkedinTabIcon /></span>
                                                            <span>LinkedIn Template</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                {setupLinkedinLocked ? (
                                                    <div className="agent-onb-tpl-card__locked">
                                                        <p className="agent-onb-tpl-card__locked-lede">
                                                            LinkedIn outreach is unavailable because your account isn&apos;t connected. Connect LinkedIn in Happpy Agent settings to enable messaging.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="agent-onb-tpl-card__chips" role="radiogroup">
                                                            {setupTabDefaults[0] && (
                                                                <button
                                                                    type="button"
                                                                    role="radio"
                                                                    aria-checked={setupMode === "template1"}
                                                                    className={`agent-onb-tpl-card__chip${setupMode === "template1" ? " agent-onb-tpl-card__chip--active" : ""}`}
                                                                    onClick={() => handleSetupChipSelect(setupTab, "template1")}
                                                                >
                                                                    <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                                                    <span>Use Template 1</span>
                                                                </button>
                                                            )}
                                                            {setupTabDefaults[1] && (
                                                                <button
                                                                    type="button"
                                                                    role="radio"
                                                                    aria-checked={setupMode === "template2"}
                                                                    className={`agent-onb-tpl-card__chip${setupMode === "template2" ? " agent-onb-tpl-card__chip--active" : ""}`}
                                                                    onClick={() => handleSetupChipSelect(setupTab, "template2")}
                                                                >
                                                                    <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                                                    <span>Use Template 2</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                role="radio"
                                                                aria-checked={setupMode === "scratch"}
                                                                className={`agent-onb-tpl-card__chip${setupMode === "scratch" ? " agent-onb-tpl-card__chip--active" : ""}`}
                                                                onClick={() => handleSetupChipSelect(setupTab, "scratch")}
                                                            >
                                                                <span className="agent-onb-tpl-card__chip-radio" aria-hidden="true" />
                                                                <span>Write your own message</span>
                                                            </button>
                                                        </div>

                                                        <div className="agent-onb-tpl-card__form">
                                                            {setupTab === OUTREACH_PROVIDER_GMAIL && (
                                                                <div className="agent-onb-tpl-card__field">
                                                                    <label className="agent-onb-tpl-card__label" htmlFor="rap-setup-subject">
                                                                        Email Subject
                                                                    </label>
                                                                    <input
                                                                        id="rap-setup-subject"
                                                                        type="text"
                                                                        className={`agent-onb-tpl-card__input${setupDraftErrors.subject ? " agent-onb-tpl-card__input--error" : ""}`}
                                                                        value={setupDraft.subject}
                                                                        onChange={(e) => handleSetupDraftChange(setupTab, "subject", e.target.value)}
                                                                        disabled={setupSaving}
                                                                    />
                                                                    {setupDraftErrors.subject ? (
                                                                        <p className="agent-onb-tpl-card__error">{setupDraftErrors.subject}</p>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                            <div className="agent-onb-tpl-card__field">
                                                                <label className="agent-onb-tpl-card__label">Template Message</label>
                                                                <div className={`agent-onb-tpl-card__editor${setupDraftErrors.body ? " agent-onb-tpl-card__editor--error" : ""}`}>
                                                                    <TemplateEditor
                                                                        key={`rap-setup-editor-${setupTab}-${setupMode}`}
                                                                        value={setupDraft.body || ""}
                                                                        onChange={(content) => handleSetupDraftChange(setupTab, "body", content)}
                                                                        hasError={!!setupDraftErrors.body}
                                                                        dynamicFields={VAR_FIELDS}
                                                                        showDynamicDropdowns
                                                                        templateAppliedAt={setupTemplateAppliedAt[setupTab]}
                                                                        scrollingContainer="#rapPreviewDrawerScroll"
                                                                    />
                                                                </div>
                                                                {setupDraftErrors.body ? (
                                                                    <p className="agent-onb-tpl-card__error">{setupDraftErrors.body}</p>
                                                                ) : null}
                                                            </div>
                                                        </div>

                                                        <div className="agent-onb-tpl-card__banner" role="note">
                                                            <SetupInfoIcon />
                                                            <span>{setupBannerText}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <header className="rap-preview-drawer__step-header">
                                            <h2 id="rap-preview-drawer-title" className="rap-preview-drawer__step-title">
                                                Your Referral Outreach Preview
                                            </h2>
                                            <p className="rap-preview-drawer__step-lede">
                                                {!outreachAgentPreviewConfig ? null : showAccountsRequiredLede ? (
                                                    "Happpy Agent needs Gmail and LinkedIn to send outreach on your behalf"
                                                ) : (
                                                    <>
                                                        Review your outreach msg for{" "}
                                                        <strong>{jobLabel || "this role"}</strong>
                                                    </>
                                                )}
                                            </p>
                                        </header>

                                        <div className="rap-preview-drawer__content">
                                            {!outreachAgentPreviewConfig ? (
                                                <div className="rap-preview-drawer__messages-loading" aria-busy="true" aria-label="Loading message previews">
                                                    <HapppyLoader size="lg" />
                                                </div>
                                            ) : (
                                                <>
                                                    <div>
                                                        <div className="rap-preview-drawer__preview-tabs" role="tablist">
                                                            <button
                                                                type="button"
                                                                role="tab"
                                                                aria-selected={activeTab === "gmail"}
                                                                className={`rap-preview-drawer__preview-tab${activeTab === "gmail" ? " rap-preview-drawer__preview-tab--active" : ""}`}
                                                                onClick={() => setActiveTab("gmail")}
                                                            >
                                                                <span className="rap-preview-drawer__preview-tab-icon"><GmailIcon /></span>
                                                                <span>Gmail Draft</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                role="tab"
                                                                aria-selected={activeTab === "linkedin"}
                                                                className={`rap-preview-drawer__preview-tab${activeTab === "linkedin" ? " rap-preview-drawer__preview-tab--active" : ""}`}
                                                                onClick={() => setActiveTab("linkedin")}
                                                            >
                                                                <span className="rap-preview-drawer__preview-tab-icon"><LinkedinTabIcon /></span>
                                                                <span>LinkedIn Message</span>
                                                            </button>
                                                        </div>

                                                        {activeTab === "gmail" ? (
                                                            outreachAgentPreviewConfig?.gmail_connected ? (
                                                                <div className={`rap-preview-drawer__message-card rap-preview-drawer__message-card--with-tabs${showResumeWarning ? " rap-preview-drawer__message-card--with-warning" : ""}`} role="tabpanel">
                                                                    <div className={`rap-preview-drawer__message-head${showResumeWarning ? " rap-preview-drawer__message-head--with-warning" : ""}`}>
                                                                        <div className="rap-preview-drawer__message-head-main">
                                                                            <div className="rap-preview-drawer__message-subject">
                                                                                <span className="rap-preview-drawer__message-subject-label">Subject:</span>
                                                                                <span className="rap-preview-drawer__message-subject-value">
                                                                                    {outreachAgentPreviewConfig?.gmail_template?.subject ?? "New Message: Referral outreach"}
                                                                                </span>
                                                                            </div>
                                                                            {outreachAgentPreviewConfig?.email ? (
                                                                                <p className="rap-preview-drawer__message-from">
                                                                                    From: {outreachAgentPreviewConfig.email}
                                                                                </p>
                                                                            ) : null}
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="rap-preview-drawer__rewrite-btn"
                                                                            onClick={() => handleRewriteMessage(OUTREACH_PROVIDER_GMAIL)}
                                                                            disabled={rewritingProvider === OUTREACH_PROVIDER_GMAIL || downloadLoading}
                                                                        >
                                                                            <MatIcon name="auto_awesome" />
                                                                            <span>Rewrite Message</span>
                                                                        </button>
                                                                        {showResumeWarning && (
                                                                            <ResumeUpdatedWarning
                                                                                onReview={() => setDrawerStep("setup")}
                                                                                disabled={downloadLoading}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                    {rewritingProvider === OUTREACH_PROVIDER_GMAIL ? (
                                                                        <MessageRewriteSkeleton />
                                                                    ) : (
                                                                        <div
                                                                            className={`rap-preview-drawer__message-body${outreachAgentPreviewConfig?.gmail_template?.message ? "" : " rap-preview-drawer__message-body--empty"}`}
                                                                            dangerouslySetInnerHTML={{ __html: outreachAgentPreviewConfig?.gmail_template?.message ?? "No message configured yet." }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <p className="rap-preview-drawer__account-warning">
                                                                    Gmail outreach is unavailable because your account isn&apos;t connected. Connect Gmail in Happpy Agent settings to enable.
                                                                </p>
                                                            )
                                                        ) : outreachAgentPreviewConfig?.linkedin_connected ? (
                                                            <div className={`rap-preview-drawer__message-card rap-preview-drawer__message-card--with-tabs${showResumeWarning ? " rap-preview-drawer__message-card--with-warning" : ""}`} role="tabpanel">
                                                                <div className={`rap-preview-drawer__message-head${showResumeWarning ? " rap-preview-drawer__message-head--with-warning" : ""}`}>
                                                                    <div className="rap-preview-drawer__message-head-main">
                                                                        <div className="rap-preview-drawer__message-subject">
                                                                            <span className="rap-preview-drawer__message-subject-label">LinkedIn Message</span>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="rap-preview-drawer__rewrite-btn"
                                                                        onClick={() => handleRewriteMessage(OUTREACH_PROVIDER_LINKEDIN)}
                                                                        disabled={rewritingProvider === OUTREACH_PROVIDER_LINKEDIN || downloadLoading}
                                                                    >
                                                                        <MatIcon name="auto_awesome" />
                                                                        <span>Rewrite Message</span>
                                                                    </button>
                                                                    {showResumeWarning && (
                                                                        <ResumeUpdatedWarning
                                                                            onReview={() => setDrawerStep("setup")}
                                                                            disabled={downloadLoading}
                                                                        />
                                                                    )}
                                                                </div>
                                                                {rewritingProvider === OUTREACH_PROVIDER_LINKEDIN ? (
                                                                    <MessageRewriteSkeleton />
                                                                ) : (
                                                                    <div
                                                                        className={`rap-preview-drawer__message-body${outreachAgentPreviewConfig?.linkedin_template?.message ? "" : " rap-preview-drawer__message-body--empty"}`}
                                                                        dangerouslySetInnerHTML={{ __html: outreachAgentPreviewConfig?.linkedin_template?.message ?? "No LinkedIn message configured yet." }}
                                                                    />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="rap-preview-drawer__account-warning">
                                                                LinkedIn outreach is unavailable because your account isn&apos;t connected. Connect LinkedIn in Happpy Agent settings to enable messaging.
                                                            </p>
                                                        )}
                                                    </div>

                                                    {activeTab === "gmail" && outreachAgentPreviewConfig?.gmail_connected && (
                                                        <div className="rap-preview-drawer__resume-bar" aria-label="Resume attachment">
                                                            <div className="rap-preview-drawer__resume-bar-left">
                                                                <span className="rap-preview-drawer__resume-bar-icon">
                                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" fill="#9DFAD5" fill-opacity="0.3" stroke="#086D7E" />
                                                                        <path d="M5 11.087V6.02344C5 5.752 5.12328 5.49169 5.34271 5.29976C5.56215 5.10783 5.85977 5 6.1701 5H10.2654L14.3608 8.58202V11.087" stroke="#086D7E" stroke-linecap="round" stroke-linejoin="round" />
                                                                        <path d="M10.1445 5V8.65217H14.3569" stroke="#086D7E" stroke-linecap="round" stroke-linejoin="round" />
                                                                        <path d="M5.01953 15.0005V11.957H6.29728C6.58434 11.957 6.82928 11.9991 7.0321 12.0831C7.23491 12.1672 7.39092 12.2889 7.50013 12.4483C7.60934 12.6078 7.66395 12.7976 7.66395 13.0179C7.66395 13.2382 7.60934 13.428 7.50013 13.5875C7.39092 13.744 7.23491 13.8657 7.0321 13.9527C6.82928 14.0367 6.58434 14.0788 6.29728 14.0788H5.27695L5.48757 13.8744V15.0005H5.01953ZM5.48757 13.9179L5.27695 13.7005H6.28323C6.58278 13.7005 6.809 13.6411 6.96189 13.5222C7.1179 13.4034 7.19591 13.2353 7.19591 13.0179C7.19591 12.8005 7.1179 12.6324 6.96189 12.5136C6.809 12.3947 6.58278 12.3353 6.28323 12.3353H5.27695L5.48757 12.1179V13.9179Z" fill="#086D7E" />
                                                                        <path d="M8.58558 15.0005V11.957H9.96629C10.3158 11.957 10.6231 12.0208 10.8883 12.1483C11.1567 12.2759 11.3642 12.4541 11.5108 12.6831C11.6606 12.9121 11.7355 13.1773 11.7355 13.4788C11.7355 13.7802 11.6606 14.0454 11.5108 14.2744C11.3642 14.5034 11.1567 14.6817 10.8883 14.8092C10.6231 14.9367 10.3158 15.0005 9.96629 15.0005H8.58558ZM9.05362 14.6222H9.93821C10.2097 14.6222 10.4437 14.5744 10.6403 14.4788C10.84 14.3831 10.9944 14.2498 11.1036 14.0788C11.2128 13.9049 11.2674 13.7049 11.2674 13.4788C11.2674 13.2498 11.2128 13.0498 11.1036 12.8788C10.9944 12.7078 10.84 12.5744 10.6403 12.4788C10.4437 12.3831 10.2097 12.3353 9.93821 12.3353H9.05362V14.6222Z" fill="#086D7E" />
                                                                        <path d="M13.1076 13.3962H14.7972V13.7701H13.1076V13.3962ZM13.1544 15.0005H12.6864V11.957H14.9985V12.3353H13.1544V15.0005Z" fill="#086D7E" />
                                                                    </svg>

                                                                </span>
                                                                <p className="rap-preview-drawer__resume-bar-text">{resumeDescription}</p>
                                                            </div>
                                                            {(selectedResume === "tailored" && noTailorHTML) ? null : (
                                                                <span
                                                                    className="rap-preview-drawer__resume-bar-link"
                                                                    title="Preview attached resume"
                                                                    onClick={(e) => !downloadLoading && handleDownload(e)}
                                                                    onKeyDown={(e) => {
                                                                        if (!downloadLoading && (e.key === "Enter" || e.key === " ")) {
                                                                            e.preventDefault();
                                                                            handleDownload(e);
                                                                        }
                                                                    }}
                                                                    role="button"
                                                                    tabIndex={0}
                                                                    aria-label={`Preview attached resume: ${resumeFilename}`}
                                                                >
                                                                    <MatIcon name="visibility" />
                                                                    <span className="rap-preview-drawer__resume-filename">{resumeFilename}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="rap-preview-drawer__agent-bubble" aria-label="Outreach summary">
                                                        <div className="rap-preview-drawer__agent-mascot">
                                                            <img src={MASCOT_NEUTRAL_SRC} alt="" aria-hidden="true" />
                                                        </div>
                                                        <div className="rap-preview-drawer__agent-bubble-content">
                                                            <div className="rap-preview-drawer__agent-bubble-copy">
                                                                <p className="rap-preview-drawer__agent-bubble-title">{agentBubbleTitle}</p>
                                                                <p className="rap-preview-drawer__agent-bubble-sub">
                                                                    We select them based on hiring relevance and response likelihood.
                                                                </p>
                                                            </div>
                                                            <p className="rap-preview-drawer__agent-bubble-hint">
                                                                Customize your outreach messages in{" "}
                                                                <button
                                                                    type="button"
                                                                    className="rap-preview-drawer__agent-bubble-link"
                                                                    onClick={handleGoToConfigure}
                                                                >
                                                                    Configure Agent
                                                                </button>{" "}
                                                                and track your referral progress in{" "}
                                                                <button
                                                                    type="button"
                                                                    className="rap-preview-drawer__agent-bubble-link"
                                                                    onClick={handleGoToMyActivity}
                                                                >
                                                                    My Activity.
                                                                </button>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {drawerStep === "preview" && hasCustomizedMessage && (
                                <div className="rap-preview-drawer__footer-notes">
                                    <div className="rap-preview-drawer__default-message-note" role="note">
                                        <MatIcon name="info" />
                                        <p>
                                            If you confirm and send, your updated message will be saved as your default outreach template.
                                            You can edit it anytime from{" "}
                                            <button type="button" onClick={handleReviewTemplate}>
                                                Happpy Agent configuration
                                            </button>{" "}
                                            in your dashboard.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="rap-preview-drawer__auto-reply-footer">
                                <div className="rap-preview-drawer__auto-reply-banner" role="region" aria-label="Auto-reply settings">
                                    {autoReplyLoading ? (
                                        <p className="rap-preview-drawer__auto-reply-loading">Loading auto-reply settings…</p>
                                    ) : (
                                        <>
                                            <label
                                                className={`rap-preview-drawer__auto-reply-check${autoReplySaving ? " rap-preview-drawer__auto-reply-check--disabled" : ""}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="rap-preview-drawer__auto-reply-check-input"
                                                    checked={!!autoReplySettings?.handle_auto_reply}
                                                    disabled={!autoReplySettings || autoReplySaving}
                                                    onChange={(e) => handleAutoReplyToggle(e.target.checked)}
                                                />
                                                <span className="rap-preview-drawer__auto-reply-check-box" aria-hidden="true" />
                                                <span className="rap-preview-drawer__auto-reply-check-label">
                                                    Let HAPPPY automatically reply to referrer emails
                                                </span>
                                            </label>
                                            <button
                                                type="button"
                                                className="rap-preview-drawer__auto-reply-link"
                                                onClick={handleGoToAutoReplySettings}
                                            >
                                                Review auto-reply categories →
                                            </button>
                                        </>
                                    )}
                                </div>

                                <footer className="agent-onb-footer">
                                    <button
                                        type="button"
                                        className="agent-onb-footer__back"
                                        onClick={() => {
                                            if (drawerStep === "preview") {
                                                hydrateSetupDrafts(outreachAgentPreviewConfig);
                                                setDrawerStep("setup");
                                                return;
                                            }
                                            if (!downloadLoading && !setupSaving) onClose();
                                        }}
                                        aria-label={drawerStep === "preview" ? "Back to message setup" : "Close"}
                                        disabled={downloadLoading || confirmLoading || setupSaving}
                                    >
                                        <FooterBackIcon />
                                    </button>
                                    {drawerStep === "setup" ? (
                                        <button
                                            type="button"
                                            className="agent-onb-footer__cta agent-onb-footer__cta--dark"
                                            onClick={handleSetupNext}
                                            disabled={setupSaving || downloadLoading}
                                        >
                                            <span>{setupSaving ? "Saving…" : "Next step"}</span>
                                            <FooterArrowIcon />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="agent-onb-footer__cta agent-onb-footer__cta--dark"
                                            onClick={handleConfirm}
                                            disabled={downloadLoading || confirmLoading || !!rewritingProvider}
                                            aria-busy={confirmLoading}
                                        >
                                            {confirmLoading ? (
                                                <>
                                                    <span className="rap-preview-drawer__footer-cta-spinner" aria-hidden>
                                                        <HapppyLoader size="sm" />
                                                    </span>
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Confirm &amp; Send</span>
                                                    <FooterArrowIcon />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </footer>
                            </div>
                        </div>
                    </aside>
                </div>,
                document.body,
            )}
        </>
    );
}

export { SKIP_PREVIEW_KEY };


const SUBSCRIPTION_URL = "/talent/job-agent/subscription";
const MAX_VISIBLE_LOGOS = 4;
const SUBSCRIBE_MODAL_MASCOT_SRC = "/images/talent/outreach/mascot-exclaim.svg";

const SUBSCRIBE_MODAL_STYLES = `
.rap-subscribe-modal-overlay.ReactModal__Overlay {
    background: rgba(25, 28, 30, 0.55) !important;
    backdrop-filter: blur(4px);
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 1rem;
    z-index: 100000;
    position: fixed !important;
    inset: 0;
    overflow: auto;
}
.rap-subscribe-modal.commonModal.ReactModal__Content,
.rap-subscribe-modal.modal {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    inset: auto !important;
    max-width: 560px !important;
    width: 100% !important;
    height: auto !important;
    margin: auto !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    overflow: visible !important;
    outline: none !important;
}
.rap-subscribe-modal__card {
    position: relative;
    background: #231f20;
    border-radius: 16px;
    padding: 2rem 2.5rem 2.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
    animation: rapSubscribeFadeIn 0.25s ease-out;
    font-family: "Rubik", "Montserrat", system-ui, sans-serif;
}
@keyframes rapSubscribeFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
.rap-subscribe-modal__topbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-height: 1.3125rem;
    margin-bottom: 1.3125rem;
}
.rap-subscribe-modal__close {
    border: none;
    background: transparent;
    color: #6b6b6b;
    font-size: 1.125rem;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    transition: color 0.2s ease;
}
.rap-subscribe-modal__close:hover {
    color: #ffffff;
}
.rap-subscribe-modal__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
}
.rap-subscribe-modal__mascot {
    width: 6rem;
    height: 4.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.rap-subscribe-modal__mascot img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
.rap-subscribe-modal__title {
    margin: 0 !important;
    font-size: 1.2rem !important;
    font-weight: 700 !important;
    line-height: 1.17 !important;
    color: #ffffff !important;
    letter-spacing: -0.01em;
}
.rap-subscribe-modal__subtitle {
    margin: 0 !important;
    font-size: 0.75rem !important;
    line-height: 1.4 !important;
    color: #bababa !important;
}
.rap-subscribe-modal__callout {
    margin-top: 1.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    background: #4c4c4c;
    text-align: center;
}
.rap-subscribe-modal__callout-text {
    margin: 0 !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    line-height: 1.43 !important;
    color: #ffffff !important;
}
.rap-subscribe-modal__callout-highlight {
    color: #46eccd;
}
.rap-subscribe-modal__replies {
    margin-top: 1.5rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: #4c4c4c;
    text-align: center;
}
.rap-subscribe-modal__replies-text {
    margin: 0.75rem 0 0 !important;
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    line-height: 1.43 !important;
    color: #ffffff !important;
}
.rap-subscribe-modal__logos {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 0.875rem;
}
.rap-subscribe-modal__logo {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: #ffffff;
    border: 2px solid #231f20;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.24);
    margin-left: -0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    color: #231f20;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
}
.rap-subscribe-modal__logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #ffffff;
}
.rap-subscribe-modal__logo--more {
    background: #46eccd;
    color: #231f20;
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: none;
}
.rap-subscribe-modal__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
}
.rap-subscribe-modal__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 2.5rem;
    padding: 0.75rem 1.5rem;
    font-family: "Montserrat", "Rubik", system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    border-radius: 28px;
    cursor: pointer;
    border: none;
    transition: opacity 0.2s ease, transform 0.15s ease;
    text-decoration: none;
}
.rap-subscribe-modal__btn--primary {
    color: #231f20;
    background: #46eccd;
}
.rap-subscribe-modal__btn--primary:hover {
    opacity: 0.92;
    color: #231f20;
}
.rap-subscribe-modal__btn--primary:active {
    transform: scale(0.98);
}
.rap-subscribe-modal__btn--secondary {
    color: #ffffff;
    background: transparent;
    border: 1.5px solid #6b6b6b;
}
.rap-subscribe-modal__btn--secondary:hover {
    border-color: #bababa;
    color: #ffffff;
}
.rap-subscribe-modal__btn--secondary:active {
    transform: scale(0.98);
}
.rap-subscribe-modal__link {
    border: none;
    background: transparent;
    padding: 0;
    font-family: "Montserrat", "Rubik", system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    color: #6b6b6b;
    cursor: pointer;
    transition: color 0.2s ease;
}
.rap-subscribe-modal__link:hover {
    color: #bababa;
}

@media (max-width: 575px) {
    .rap-subscribe-modal__card {
        padding: 1.5rem 1.25rem 1.75rem;
    }
    .rap-subscribe-modal__title {
        font-size: 1.25rem !important;
    }
}
`;

const SubscribeModal = ({ plan, onClose }) => {
    const navigate = useNavigate();
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    if (!plan) return null;

    const { expired, paid, positive_replies, message, daily_limit_exceeded, conversion_offer } = plan;
    const replies = Array.isArray(positive_replies) ? positive_replies.filter(Boolean) : [];
    const hasReplies = replies.length > 0;

    const isExpired = !!expired;
    const isLimitOnly = !expired && !paid && !!daily_limit_exceeded;
    const hasConversionOffer = !!conversion_offer;
    const showSomethingElse = isExpired && !paid ;

    let title = "";
    let subtitle = "";
    let calloutContent = null;
    let primaryLabel = "Subscribe & Continue";
    let secondaryLabel = "Maybe Later";

    if (isExpired && paid) {
        title = "Renew Your Subscription";
        subtitle = `Your ${AGENT_NAME} subscription has expired.`;
        calloutContent = (
            <>
                <span className="rap-subscribe-modal__callout-highlight">Your paid plan has expired!</span>
                {" Renew your plan to continue using HAPPPY without interruption and unlock unlimited referral outreach."}
            </>
        );
        primaryLabel = "Renew Subscription";
        secondaryLabel = "Cancel";
    } else if (isExpired && !paid) {
        title = "Do you still want to run HAPPPY for this job?";
        // subtitle = `Upgrade to continue using ${AGENT_NAME} and stay connected with employers.`;
        subtitle = ``;
        calloutContent = message || `Upgrade to keep your referral outreach going with ${AGENT_NAME}.`;
        primaryLabel = "Upgrade Now";
        secondaryLabel = "Maybe Later";
    } else if (isLimitOnly) {
        title = "Daily Outreach Limit Reached";
        subtitle = `Daily jobs outreach limit reached (4/day) on your free trial.`;
        calloutContent = "Upgrade your plan for 2x more daily jobs (8/day) or wait until tomorrow's limit reset";
        primaryLabel = "Upgrade Plan";
        secondaryLabel = "I'll Continue Tomorrow";
    }

    const visibleLogos = replies.slice(0, MAX_VISIBLE_LOGOS);
    const overflow = Math.max(0, replies.length - MAX_VISIBLE_LOGOS);
    const isSingleReply = replies.length === 1;
    const repliesSummary = `${replies.length} ${isSingleReply ? "company" : "companies"} responded to your outreach and ${isSingleReply ? "is" : "are"} waiting for your reply.`;

    const modalContext = isExpired && paid
        ? "paid_expired"
        : isExpired && !paid
            ? "trial_expired"
            : isLimitOnly
                ? "daily_limit"
                : "";

    const notifySubscribeModalAction = (action, buttonLabel) => {
        POST_API(API_OUTREACH_SUBSCRIBE_MODAL_ACTION, {
            action,
            context: modalContext || undefined,
            button_label: buttonLabel || undefined,
            screen_size: getClientDeviceMobileOrDesktop(),
        }).catch(() => {});
    };

    const goToSubscription = () => {
        notifySubscribeModalAction("upgrade_plan", primaryLabel);
        if (onClose) onClose();
        navigate(SUBSCRIPTION_URL);
    };

    const openSomethingElse = () => {
        notifySubscribeModalAction("something_else", "I Have Something Else in Mind");
        setShowFeedbackModal(true);
    };

    if (showFeedbackModal) {
        return (
            <TrialFeedbackModal
                onClose={onClose}
                onBack={() => setShowFeedbackModal(false)}
                conversionOffer={conversion_offer || null}
            />
        );
    }

    const renderExpiredBody = () => {
        if (hasReplies) {
            return (
                <div className="rap-subscribe-modal__replies">
                    <div className="rap-subscribe-modal__logos">
                        {visibleLogos.map((reply, idx) => {
                            const name = reply?.company_name || "?";
                            const initial = name.charAt(0);
                            return (
                                <div
                                    className="rap-subscribe-modal__logo"
                                    key={`${name}-${idx}`}
                                    title={name}
                                >
                                    {reply?.logo_url ? (
                                        <img src={reply.logo_url} alt={name} />
                                    ) : (
                                        <span>{initial}</span>
                                    )}
                                </div>
                            );
                        })}
                        {overflow > 0 && (
                            <div className="rap-subscribe-modal__logo rap-subscribe-modal__logo--more">
                                +{overflow}
                            </div>
                        )}
                    </div>
                    <p className="rap-subscribe-modal__replies-text">{repliesSummary}</p>
                </div>
            );
        }

        if (!calloutContent) return null;

        return (
            <div className="rap-subscribe-modal__callout">
                <p className="rap-subscribe-modal__callout-text">{calloutContent}</p>
            </div>
        );
    };

    const renderLimitBody = () => (
        <div className="rap-subscribe-modal__callout">
            <p className="rap-subscribe-modal__callout-text">{calloutContent}</p>
        </div>
    );

    const bodyContent = isExpired ? renderExpiredBody() : isLimitOnly ? renderLimitBody() : null;

    return (
        <Modal
            isOpen={true}
            className="commonModal rap-subscribe-modal"
            overlayClassName="rap-subscribe-modal-overlay"
            contentLabel={title}
        >
            <style>{SUBSCRIBE_MODAL_STYLES}</style>
            <div className="rap-subscribe-modal__card">
                <div className="rap-subscribe-modal__topbar">
                    <button
                        type="button"
                        className="rap-subscribe-modal__close"
                        aria-label="Close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <header className="rap-subscribe-modal__hero">
                    <div className="rap-subscribe-modal__mascot" aria-hidden>
                        <img src={SUBSCRIBE_MODAL_MASCOT_SRC} alt="" />
                    </div>
                    <h2 className="rap-subscribe-modal__title">{title}</h2>
                    <p className="rap-subscribe-modal__subtitle">{subtitle}</p>
                </header>
                {bodyContent}
                <footer className="rap-subscribe-modal__footer">
                    <button
                        type="button"
                        className="rap-subscribe-modal__btn rap-subscribe-modal__btn--primary"
                        onClick={goToSubscription}
                    >
                        {primaryLabel}
                    </button>
                    {showSomethingElse && (
                        <button
                            type="button"
                            className="rap-subscribe-modal__btn rap-subscribe-modal__btn--secondary"
                            onClick={openSomethingElse}
                        >
                            I Have Something Else in Mind
                        </button>
                    )}
                    {!showSomethingElse && (
                        <button
                            type="button"
                            className="rap-subscribe-modal__link"
                            onClick={onClose}
                        >
                            {secondaryLabel}
                        </button>
                    )}
                </footer>
            </div>
        </Modal>
    );
};
