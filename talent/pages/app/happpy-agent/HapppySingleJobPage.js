'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams, useSearchParams } from '@/talent/navigation/routerCompat';
import HapppySingleJobContextProvider from './HapppySingleJobContext';
import useHapppyCompactJobsLayout from './useHapppyCompactJobsLayout';

export default function HapppySingleJobPage() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const isCompact = useHapppyCompactJobsLayout();

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (isCompact) {
        return <HapppySingleJobContextProvider />;
    }

    return <RedirectHapppyAllJobsPage />;
}

function RedirectHapppyAllJobsPage() {
    const { hrId } = useParams();
    const [searchParams] = useSearchParams();
    const newQueryParams = new URLSearchParams();

    newQueryParams.set('tab', 'all-jobs');
    if (hrId) {
        newQueryParams.set('activeJob', hrId);
    }
    searchParams.forEach((value, key) => {
        if (key !== 'activeJob' && key !== 'tab') {
            newQueryParams.append(key, value);
        }
    });

    return (
        <Navigate
            to={`/talent/job-agent/recommended-jobs?${newQueryParams.toString()}`}
            replace
        />
    );
}
