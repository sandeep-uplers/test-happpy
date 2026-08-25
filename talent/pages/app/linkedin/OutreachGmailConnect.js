'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { verifyGmail } from '@/talent/store/actions/UserActions';
import { notifyGmailConnectResult, buildGmailOAuthUrl } from '@/talent/helpers/gmailConnectPopup';

export default function OutreachGmailConnect() {
    const params = useParams();
    const token = params?.token;
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth)?.user;
    const [isError, setIsError] = useState({ isError: false, type: null });
    const [isSuccess, setIsSuccess] = useState(false);
    const [buttonHover, setButtonHover] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const styleId = 'outreach-gmail-connect-styles';
        if (!document.getElementById(styleId)) {
            const styleSheet = document.createElement('style');
            styleSheet.id = styleId;
            styleSheet.textContent = `
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes loading {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }, []);

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

    const gmailLoginUrl = buildGmailOAuthUrl(user?.enc_id ?? '');

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {isSuccess && (
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <div style={styles.successIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                    <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                        <h2 style={styles.successTitle}>Gmail Connected Successfully!</h2>
                        <p style={styles.description}>
                            Your Gmail account has been successfully connected. You can now use the Happpy Agent feature.
                        </p>
                        <div style={styles.loadingBar}>
                            <div style={styles.loadingProgress} />
                        </div>
                    </div>
                )}

                {isError.isError && isError.type === 'gmail_scope_not_granted' && (
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <div style={styles.errorIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <h2 style={styles.errorTitle}>Permission Required</h2>
                        <p style={styles.description}>
                            To run Happpy Agent, we require permission to send and read your Gmail messages.
                            This allows us to help you manage your outreach campaigns effectively.
                        </p>

                        <div style={styles.imageContainer}>
                            <img
                                src="/images/talent/outreach/permission.png"
                                alt="Gmail permission guide"
                                style={styles.image}
                            />
                        </div>

                        <a
                            href={gmailLoginUrl}
                            style={{
                                ...styles.button,
                                ...(buttonHover ? styles.buttonHover : {}),
                            }}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                        >
                            Connect Gmail Account
                        </a>
                    </div>
                )}

                {isError.isError && isError.type === 'verification_failed' && (
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <div style={styles.errorIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </div>
                        <h2 style={styles.errorTitle}>Verification Failed</h2>
                        <p style={styles.description}>
                            We couldn&apos;t verify your Gmail connection. This might be due to a temporary issue.
                            Please try connecting again.
                        </p>

                        <a
                            href={gmailLoginUrl}
                            style={{
                                ...styles.button,
                                ...(buttonHover ? styles.buttonHover : {}),
                            }}
                            onMouseEnter={() => setButtonHover(true)}
                            onMouseLeave={() => setButtonHover(false)}
                        >
                            Try Again
                        </a>
                    </div>
                )}

                {!isError.isError && !isSuccess && (
                    <div style={styles.content}>
                        <div style={styles.iconContainer}>
                            <div style={styles.loadingSpinner}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                                    <path
                                        d="M12 2a10 10 0 0 1 10 10"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        style={{
                                            strokeDasharray: '62.83',
                                            strokeDashoffset: '31.42',
                                            animation: 'spin 1s linear infinite',
                                        }}
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 style={styles.loadingTitle}>Connecting Gmail</h2>
                        <p style={styles.description}>
                            Please wait while we verify your Gmail connection. This may take a few moments.
                        </p>
                        <div style={styles.loadingBar}>
                            <div style={styles.loadingProgress} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '48px 40px',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.5s ease-out',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: '24px',
    },
    loadingSpinner: {
        color: '#667eea',
        animation: 'spin 1s linear infinite',
    },
    successIcon: {
        color: '#10b981',
        animation: 'scaleIn 0.5s ease-out',
    },
    errorIcon: {
        color: '#ef4444',
        animation: 'scaleIn 0.5s ease-out',
    },
    loadingTitle: {
        marginBottom: '12px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
        letterSpacing: '-0.5px',
    },
    successTitle: {
        marginBottom: '12px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#10b981',
        letterSpacing: '-0.5px',
    },
    errorTitle: {
        marginBottom: '12px',
        fontSize: '28px',
        fontWeight: '700',
        color: '#ef4444',
        letterSpacing: '-0.5px',
    },
    description: {
        marginBottom: '32px',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#6b7280',
        maxWidth: '480px',
    },
    imageContainer: {
        marginBottom: '32px',
        width: '100%',
    },
    image: {
        margin: '0 auto',
        maxWidth: '100%',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
    button: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px 28px',
        backgroundColor: '#667eea',
        color: '#ffffff',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
        transition: 'all 0.3s ease',
        border: 'none',
        cursor: 'pointer',
        minWidth: '200px',
    },
    buttonHover: {
        backgroundColor: '#5568d3',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
    },
    loadingBar: {
        width: '100%',
        height: '4px',
        backgroundColor: '#e5e7eb',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '8px',
    },
    loadingProgress: {
        height: '100%',
        backgroundColor: '#667eea',
        borderRadius: '2px',
        animation: 'loading 1.5s ease-in-out infinite',
        width: '60%',
    },
};
