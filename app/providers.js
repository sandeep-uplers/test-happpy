'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
import store from '@/talent/store/store';
import { HYDRATE_AUTH } from '@/talent/store/actions/actionsTypes';
import { getProfilePercent } from '@/talent/store/actions/UserActions';
import { readStoredAuth } from '@/talent/store/reducers/authReducer';
import HappyAiAgentLayout from '@/talent/components/HappyAiAgentLayout';

const GlobalPopups = dynamic(() => import('@/talent/routes/GlobalPopups'), { ssr: false });

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

function AuthHydrator({ children }) {
    const dispatch = useDispatch();
    const { isAuthenticated, isAuthReady } = useSelector((state) => state.auth);
    const profilePercent = useSelector((state) => state.profile.profilePercent);

    useEffect(() => {
        ensureModalAppElement();
        dispatch({ type: HYDRATE_AUTH, payload: readStoredAuth() });
    }, [dispatch]);

    useEffect(() => {
        if (!isAuthReady || !isAuthenticated || profilePercent.overall != null) {
            return;
        }
        getProfilePercent(false)(dispatch).catch(() => {});
    }, [dispatch, isAuthReady, isAuthenticated, profilePercent.overall]);

    return children;
}

function ReactHotToast() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <Toaster
            position="top-right"
            containerStyle={{ zIndex: 101000 }}
            toastOptions={{
                position: 'top-right',
                duration: 6000,
                style: { fontSize: '14px' },
                success: { style: { background: 'green', color: '#fff' } },
                error: { style: { background: 'red', color: '#fff' } },
            }}
        />,
        document.body
    );
}

function AppShell({ children }) {
    const inner = (
        <AuthHydrator>
            <HappyAiAgentLayout>
                {children}
                <GlobalPopups />
            </HappyAiAgentLayout>
            <ReactHotToast />
        </AuthHydrator>
    );

    if (!googleClientId) {
        return inner;
    }

    return <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>;
}

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <AppShell>{children}</AppShell>
        </Provider>
    );
}
