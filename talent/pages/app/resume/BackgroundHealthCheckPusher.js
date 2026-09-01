import Pusher from 'pusher-js';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { resumeHealthReportGeneratedTracking } from '../../../helpers/Mixpanel';
import { getResumeHealthCheck } from '../../../store/actions/resumeActions';
import { SET_BG_RESUME_HEALTH_CHECK_ID } from '../../../store/actions/actionsTypes';

/**
 * App-shell-level Pusher subscription for silent "background" resume health checks.
 *
 * Anything that wants to kick off a health check without showing a loader (e.g. the
 * auto-run that fires the moment Gmail is connected during agent onboarding) only
 * needs to dispatch `SET_BG_RESUME_HEALTH_CHECK_ID` with the returned health-check
 * id. This component owns the rest:
 *   - subscribes to the Pusher channel for that id
 *   - on `health_check_completed`, refreshes `resumeHealthControl` so any page that
 *     surfaces the score reflects it immediately
 *   - clears the Redux flag so the subscription tears down cleanly
 *
 * Lives in `GlobalPopups` so the subscription survives the user navigating away
 * from the screen that started the check.
 */
export default function BackgroundHealthCheckPusher() {
    const dispatch = useDispatch();
    const bgResumeHealthCheckId = useSelector(
        (state) => state.resume?.bgResumeHealthCheckId
    );

    useEffect(() => {
        if (!bgResumeHealthCheckId) return undefined;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_VR_PUSHER_APP_KEY, {
            cluster: process.env.NEXT_PUBLIC_VR_PUSHER_APP_CLUSTER,
        });
        const channelName = `${process.env.NEXT_PUBLIC_RESUME_TRANSFORM_PUSHER_CHANNEL}-${bgResumeHealthCheckId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind('health_check_completed', (data) => {
            if (data?.status == 2) {
                // Surface the backend failure even on the silent path — better than
                // leaving the user staring at a stale empty score forever.
                if (data?.message) toast.error(data.message);
            } else {
                resumeHealthReportGeneratedTracking(
                    bgResumeHealthCheckId,
                    data?.health_check?.resume_score
                );
                getResumeHealthCheck()(dispatch).catch(() => {});
            }
            dispatch({ type: SET_BG_RESUME_HEALTH_CHECK_ID, payload: null });
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, [bgResumeHealthCheckId, dispatch]);

    return null;
}
