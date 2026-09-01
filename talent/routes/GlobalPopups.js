'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from '@/talent/navigation/routerCompat';
import TalentProfileDetailsModal from '@/talent/components/common/TalenProfileDetailsModal';
import { isHapppyAgentFaviconPath } from '@/talent/helpers/happpyAgentFavicon';
import OpenAiDownModal from '@/talent/pages/app/resume/nudges/OpenAiDownModal';
import TransformResumeDoneModal from '@/talent/pages/app/resume/nudges/TransformResumeDoneModal';
import ResumeEditorModal from '@/talent/sections/resume-editor/ResumeEditorModal';
import TransformedResumeEditorModal from '@/talent/sections/resume-editor/TransformedResumeEditorModal';
import ResumeTransformPusher from '@/talent/pages/app/resume/ResumeTransformPusher';
import BackgroundHealthCheckPusher from '@/talent/pages/app/resume/BackgroundHealthCheckPusher';
import TalentResumeStyles from '@/talent/components/TalentResumeStyles';

export default function GlobalPopups() {
    const location = useLocation();
    const { openSignupFlow } = useSelector((state) => state.work);
    const { managePreferencesModal } = useSelector((state) => state.profile);
    const [justVisitedResumePages, setVisitedResumePages] = useState(false);

    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath.includes('/resume-health-check')) {
            localStorage.setItem('visitedResumePages', new Date().getTime());
            return;
        }
        const lastVisitedTimeResumePages = localStorage.getItem('visitedResumePages');
        const lastVisitedTimeMs = parseInt(lastVisitedTimeResumePages, 10) || 0;
        if (lastVisitedTimeMs + 3 * 60 * 60 * 1000 > new Date().getTime()) {
            setVisitedResumePages(true);
        } else if (justVisitedResumePages) {
            setVisitedResumePages(false);
            localStorage.removeItem('visitedResumePages');
        }
    }, [location.pathname, justVisitedResumePages]);

    const isHappyAgentRoute = isHapppyAgentFaviconPath(location.pathname);

    return (
        <>
            <TalentResumeStyles />
            <ResumeEditorModal />
            <TransformedResumeEditorModal />
            <ResumeTransformPusher />
            <BackgroundHealthCheckPusher />
            {!isHappyAgentRoute && <TalentProfileDetailsModal />}
            {!managePreferencesModal && (
                <>
                    {!(
                        location.pathname.includes('resume-health-check') &&
                        location.pathname.includes('payment')
                    ) &&
                        !openSignupFlow && <TransformResumeDoneModal />}
                </>
            )}
            {location.pathname.includes('resume-health-check') && <OpenAiDownModal />}
        </>
    );
}
