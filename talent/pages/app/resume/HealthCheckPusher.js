import Pusher from "pusher-js";
import { useEffect } from "react";
import { useLocation, useNavigate } from '@/talent/navigation/routerCompat';
import { resumeHealthReportGeneratedTracking } from "../../../helpers/Mixpanel";
import { useDispatch } from "react-redux";
import { SET_HEALTH_CHECK_SOCKET_LOADER } from "../../../store/actions/actionsTypes";
import toast from "react-hot-toast";
import { getResumeHealthCheck } from "../../../store/actions/resumeActions";

export default function HealthCheckPusher({ healthCheckId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_VR_PUSHER_APP_KEY, {
            cluster: process.env.NEXT_PUBLIC_VR_PUSHER_APP_CLUSTER,
        });
        const channelName = `${process.env.NEXT_PUBLIC_RESUME_TRANSFORM_PUSHER_CHANNEL}-${healthCheckId}`;
        const channel = pusher.subscribe(channelName);

        channel.bind("health_check_completed", (data) => {
            console.log('health_check_completed data', data);
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            pusher.disconnect();
            dispatch({ type: SET_HEALTH_CHECK_SOCKET_LOADER, payload: false });

            if (data?.status == 2) {
                toast.error(data?.message);
                return;
            }
            resumeHealthReportGeneratedTracking(healthCheckId, data?.health_check?.resume_score);
            getResumeHealthCheck()(dispatch);
        });


        return () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
            pusher.disconnect();
        };
    }, []);

    return (
        <>
        </>
    )
};
