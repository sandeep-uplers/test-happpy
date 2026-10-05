'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SET_TAILOR_MODAL_OPEN } from '@/talent/store/actions/actionsTypes';
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
import { shouldHideHapppyAgentResumeFeatures } from '@/talent/helpers/happpyAgentPlan';

export default function GlobalPopups() {
    const dispatch = useDispatch();
    const location = useLocation();
    const happpyAgent = useSelector((state) => state.happpyAgent);
    const resumeFeaturesLocked = shouldHideHapppyAgentResumeFeatures(happpyAgent, 'global');
    const { tailor_to_job_modal, jd_tailor_resume_id } = useSelector((state) => state.resumeEditor);
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

    useEffect(() => {
        if (!resumeFeaturesLocked) return;
        if (!tailor_to_job_modal && !jd_tailor_resume_id) return;
        dispatch({
            type: SET_TAILOR_MODAL_OPEN,
            payload: { hr_enc_id: false, outreach_hr_id: null },
        });
    }, [resumeFeaturesLocked, tailor_to_job_modal, jd_tailor_resume_id, dispatch]);

    const isHappyAgentRoute = isHapppyAgentFaviconPath(location.pathname);

    return (
        <>
            <TalentResumeStyles />
            {!resumeFeaturesLocked && <ResumeEditorModal />}
            {!resumeFeaturesLocked && <TransformedResumeEditorModal />}
            {!resumeFeaturesLocked && <ResumeTransformPusher />}
            {!resumeFeaturesLocked && <BackgroundHealthCheckPusher />}
            {!isHappyAgentRoute && <TalentProfileDetailsModal />}
            {!managePreferencesModal && (
                <>
                    {!resumeFeaturesLocked && !(
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
