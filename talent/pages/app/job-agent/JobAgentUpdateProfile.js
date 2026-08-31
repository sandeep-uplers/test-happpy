'use client';

import React, { useEffect, useMemo } from 'react';
import { differenceInMonths } from 'date-fns';
import { useSelector } from 'react-redux';
import JobAgentManagePreferences from './JobAgentManagePreferences';
import './JobAgentUpdateProfile.css';

/**
 * AgentJ — career preferences / profile update (`JobAgentManagePreferences`),
 * embedded in the job-agent shell.
 */
const JobAgentUpdateProfile = () => {
    const { user } = useSelector((state) => state.auth);

    const lastPreferenceUpdate = useMemo(() => {
        if (!user?.last_preference_at) return 0;
        try {
            return differenceInMonths(new Date(), new Date(user.last_preference_at));
        } catch {
            return 0;
        }
    }, [user?.last_preference_at]);

    useEffect(() => {
        document.title = 'Update profile | AgentJ | Uplers';
    }, []);

    return (
        <div className="jad-update-profile-wrap">
                <JobAgentManagePreferences
                    isModalOpen={false}
                    lastPreferenceUpdate={lastPreferenceUpdate}
                    setIsModalOpen={() => {}}
                    setIsModalLoading={() => {}}
                    saveRedirectPath="/talent/job-agent"
                    twoColumnLocationPreferences
                />
        </div>
    );
};

export default JobAgentUpdateProfile;
