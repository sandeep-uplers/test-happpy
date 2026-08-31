'use client';

import { createContext, useContext } from 'react';

const JobAgentDashboardContext = createContext(null);

export function JobAgentDashboardProvider({ value, children }) {
    return (
        <JobAgentDashboardContext.Provider value={value}>
            {children}
        </JobAgentDashboardContext.Provider>
    );
}

export function useJobAgentDashboardContext() {
    return useContext(JobAgentDashboardContext);
}

/** @deprecated Use useJobAgentDashboardContext — mirrors React Router outlet context name. */
export function useOutletContext() {
    return useJobAgentDashboardContext() ?? {};
}
