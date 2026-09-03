'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { verifyGmail } from '@/talent/store/actions/UserActions';
import { notifyGmailConnectResult, buildGmailOAuthUrl } from '@/talent/helpers/gmailConnectPopup';
import './OutreachGmailConnect.css';

export default function OutreachGmailConnect() {
    const params = useParams();
    const token = params?.token;
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;
    const [isError, setIsError] = useState({ isError: false, type: null });
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleGmailVerification = async () => {
            const url = new URL(window.location.href);
            const isPopup = window.opener !== null;

            if (url.search.includes('error=gmail_scope_not_granted') || url.search.includes('error=gmail_connect_failed')) {
                const isScopeError = url.search.includes('error=gmail_scope_not_granted');
                setIsError({ isError: true, type: isScopeError ? 'gmail_scope_not_granted' : 'verification_failed' });
                if (isPopup) {
                    notifyGmailConnectResult({
                        type: 'GMAIL_CONNECT_ERROR',
                        message: isScopeError
                            ? 'Gmail scope not granted. Please grant all required permissions.'
                            : 'Gmail connection failed. Please try again.',
                    });
                }
                return;
            }

            if (!token || token === 'not-connected') {
                setIsError({ isError: true, type: 'verification_failed' });
                if (isPopup) {
                    notifyGmailConnectResult({
                        type: 'GMAIL_CONNECT_ERROR',
                        message: 'Gmail connection failed. Please try again.',
                    });
                }
                return;
            }

            try {
                await dispatch(verifyGmail({ token }));
                setIsError({ isError: false, type: null });
                setIsSuccess(true);

                if (isPopup) {
                    notifyGmailConnectResult({ type: 'GMAIL_CONNECT_SUCCESS' });
                    setTimeout(() => {
                        window.close();
                    }, 2000);
                } else {
                    setTimeout(() => {
                        router.replace('/talent/referral-ai-agent?gmail=success');
                    }, 2000);
                }
            } catch (error) {
                console.error('Gmail verification failed:', error);
                setIsError({ isError: true, type: 'verification_failed' });

                if (isPopup) {
                    notifyGmailConnectResult({
                        type: 'GMAIL_CONNECT_ERROR',
                        message: 'Gmail verification failed. Please try again.',
                    });
                } else {
                    router.replace('/talent/referral-ai-agent?error=verification_failed');
                }
            }
        };

        handleGmailVerification();
    }, [dispatch, router, token]);

    const gmailAuthUrl = buildGmailOAuthUrl(user?.enc_id ?? '');

    return (
        <div className="ogc-page">
            <div className="ogc-card">
                {isSuccess && (
                    <div className="ogc-content">
                        <div className="ogc-icon ogc-icon--success">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="ogc-title ogc-title--success">Gmail connected</h1>
                        <p className="ogc-lead">
                            Your Gmail account has been connected. You can now use the HAPPPY Agent feature.
                        </p>
                        <div className="ogc-progress" aria-hidden="true">
                            <div className="ogc-progress__bar" />
                        </div>
                    </div>
                )}

                {isError.isError && isError.type === 'gmail_scope_not_granted' && (
                    <div className="ogc-content">
                        <div className="ogc-icon ogc-icon--error">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="ogc-title ogc-title--error">Permission required</h1>
                        <p className="ogc-lead">
                            To run HAPPPY Agent, we need permission to send and read your Gmail messages.
                            This lets us manage your outreach campaigns effectively.
                        </p>

                        <div className="ogc-image-wrap">
                            <img
                                src="/images/talent/outreach/permission.png"
                                alt="Gmail permission guide"
                                className="ogc-image"
                            />
                        </div>

                        <a href={gmailAuthUrl} className="ogc-cta">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" fill="none" />
                                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" fill="none" />
                            </svg>
                            Connect Gmail
                        </a>
                    </div>
                )}

                {isError.isError && isError.type === 'verification_failed' && (
                    <div className="ogc-content">
                        <div className="ogc-icon ogc-icon--error">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h1 className="ogc-title ogc-title--error">Verification failed</h1>
                        <p className="ogc-lead">
                            We couldn&apos;t verify your Gmail connection. This might be a temporary issue — please try again.
                        </p>

                        <a href={gmailAuthUrl} className="ogc-cta">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M3 12h18M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Try again
                        </a>
                    </div>
                )}

                {!isError.isError && !isSuccess && (
                    <div className="ogc-content">
                        <div className="ogc-dots" aria-hidden="true">
                            <span className="ogc-dots__dot" />
                            <span className="ogc-dots__dot" />
                            <span className="ogc-dots__dot" />
                        </div>
                        <h1 className="ogc-title">Connecting Gmail</h1>
                        <p className="ogc-lead">
                            Please wait while we verify your Gmail connection. This may take a few moments.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
