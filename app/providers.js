'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import Modal from 'react-modal';
import store from '@/talent/store/store';
import { HYDRATE_AUTH } from '@/talent/store/actions/actionsTypes';
import { readStoredAuth } from '@/talent/store/reducers/authReducer';
import HappyAiAgentLayout from '@/talent/components/HappyAiAgentLayout';

const GlobalPopups = dynamic(() => import('@/talent/routes/GlobalPopups'), { ssr: false });

function AuthHydrator({ children }) {
    const dispatch = useDispatch();

    useEffect(() => {
        if (document.getElementById('happpy-root')) {
            Modal.setAppElement('#happpy-root');
        }
        dispatch({ type: HYDRATE_AUTH, payload: readStoredAuth() });
    }, [dispatch]);

    return children;
}

export default function Providers({ children }) {
    return (
        <Provider store={store}>
            <AuthHydrator>
                <HappyAiAgentLayout>
                    {children}
                    <GlobalPopups />
                </HappyAiAgentLayout>
                <Toaster position="top-center" />
            </AuthHydrator>
        </Provider>
    );
}
