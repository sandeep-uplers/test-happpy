'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Provider, useDispatch } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
import store from '@/talent/store/store';
import { HYDRATE_AUTH } from '@/talent/store/actions/actionsTypes';
import { readStoredAuth } from '@/talent/store/reducers/authReducer';
import HappyAiAgentLayout from '@/talent/components/HappyAiAgentLayout';

const GlobalPopups = dynamic(() => import('@/talent/routes/GlobalPopups'), { ssr: false });

const googleClientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '')
    .replace(/^['"]|['"]$/g, '')
    .trim();

function AuthHydrator({ children }) {
    const dispatch = useDispatch();

    useEffect(() => {
        ensureModalAppElement();
        dispatch({ type: HYDRATE_AUTH, payload: readStoredAuth() });
    }, [dispatch]);

    return children;
}

function AppShell({ children }) {
    const inner = (
        <AuthHydrator>
            <HappyAiAgentLayout>
                {children}
                <GlobalPopups />
            </HappyAiAgentLayout>
            <Toaster position="top-center" />
            <ToastContainer position="bottom-center" theme="dark" />
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
