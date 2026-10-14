import Pusher from "pusher-js";
import { useEffect } from "react";
import { useLocation, useNavigate } from '@/talent/navigation/routerCompat';
import { resumeHealthReportGeneratedTracking } from "../../../helpers/Mixpanel";
import { useDispatch } from "react-redux";
import { SET_HEALTH_CHECK_SOCKET_LOADER } from "../../../store/actions/actionsTypes";
import toast from "react-hot-toast";
import { API_GET_LAST_HEALTH_CHECK } from "../../../components/Constant";
import { GET_API } from "../../../components/Helper";
import { getResumeHealthCheck } from "../../../store/actions/resumeActions";

const POLL_INTERVAL_MS = 5000;

export default function HealthCheckPusher({ healthCheckId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        let settled = false;
        let pollTimer;
        const pusher = new Pusher(process.env.NEXT_PUBLIC_VR_PUSHER_APP_KEY, {
            cluster: process.env.NEXT_PUBLIC_VR_PUSHER_APP_CLUSTER,
        });
        const channelName = `${process.env.NEXT_PUBLIC_RESUME_TRANSFORM_PUSHER_CHANNEL}-${healthCheckId}`;
        const channel = pusher.subscribe(channelName);

        const teardownSocket = () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };

        const finish = (data) => {
            if (settled) return;
            settled = true;
            window.clearInterval(pollTimer);
            teardownSocket();
            dispatch({ type: SET_HEALTH_CHECK_SOCKET_LOADER, payload: false });

            if (data?.status == 2) {
                toast.error(data?.message || 'Resume health check failed. Kindly upload a different file and try again.');
                return;
            }
            resumeHealthReportGeneratedTracking(
                healthCheckId,
                data?.health_check?.resume_score ?? data?.resume_score
            );
            getResumeHealthCheck()(dispatch);
        };

        channel.bind("health_check_completed", (data) => {
            console.log('health_check_completed data', data);
            finish(data);
        });

        // Pusher does not replay events sent before this tab subscribed. The Vercel
        // API proxy can open that window, so also read the saved check directly.
        const pollSavedCheck = () => {
            if (settled) return;
            GET_API(API_GET_LAST_HEALTH_CHECK)
                .then((res) => {
                    if (settled) return;
                    const healthCheck = res?.data?.data?.health_check;
                    if (!healthCheck || String(healthCheck.file_id) !== String(healthCheckId)) return;
                    if (healthCheck.status == 3 || healthCheck.status == 2) {
                        finish({
                            status: healthCheck.status,
                            resume_score: healthCheck.resume_score,
                            message: 'Resume health check failed. Kindly upload a different file and try again.',
                        });
                    }
                })
                .catch(() => {});
        };

        pollSavedCheck();
        pollTimer = window.setInterval(pollSavedCheck, POLL_INTERVAL_MS);

        return () => {
            settled = true;
            window.clearInterval(pollTimer);
            teardownSocket();
        };
    }, [dispatch, healthCheckId]);

    return (
        <>
        </>
    )
};
