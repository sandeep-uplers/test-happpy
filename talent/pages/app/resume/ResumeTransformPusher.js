import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { getResumeDashboard } from "../../../store/actions/UserActions";
import { useDispatch, useSelector } from "react-redux";
import { SET_RESUME_HEALTH_CONTROL, SET_RESUME_TRANSFORM, SET_TRANSFORM_DONE_MODAL } from "../../../store/actions/actionsTypes";
import { useLocation } from "@/talent/navigation/routerCompat";

export default function ResumeTransformPusher() {
    const pusherRef = useRef(null);
    const channelsRef = useRef({});
    const { activeTransformation } = useSelector(state => state.resume);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        if (!activeTransformation || typeof activeTransformation !== "object" || Object.keys(activeTransformation).length === 0) return;

        // Initialize Pusher instance if not already created
        if (!pusherRef.current) {
            pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_VR_PUSHER_APP_KEY, {
                cluster: process.env.NEXT_PUBLIC_VR_PUSHER_APP_CLUSTER,
            });
        }

        // Loop through all transformations and subscribe
        Object.entries(activeTransformation).forEach(([key, transform]) => {
            const { resumeTransformationId } = transform;

            if (!resumeTransformationId || channelsRef.current[resumeTransformationId]) {
                return; // Skip if no ID or already subscribed
            }

            const channelName = `${process.env.NEXT_PUBLIC_RESUME_TRANSFORM_PUSHER_CHANNEL}-${resumeTransformationId}`;
            const channel = pusherRef.current.subscribe(channelName);

            channel.bind(process.env.NEXT_PUBLIC_RESUME_TRANSFORM_PUSHER_EVENT, (data) => {
                dispatch({ type: SET_RESUME_TRANSFORM, payload: { ...data, health_check_id: key } });
                if ((location.pathname.includes('resume-health-check') && location.pathname.includes('payment'))) {
                    dispatch({ type: SET_RESUME_HEALTH_CONTROL, payload: { is_paid: true } });
                    dispatch({ type: SET_TRANSFORM_DONE_MODAL, payload: { open: false, data: {} } });
                }
                getResumeDashboard()(dispatch);
            });

            // Store the channel reference
            channelsRef.current[resumeTransformationId] = channel;
        });

        return () => {
            // Unbind and unsubscribe all channels
            Object.entries(channelsRef.current).forEach(([id, channel]) => {
                channel.unbind_all();
                pusherRef.current.unsubscribe(channel.name);
            });

            // Disconnect pusher
            if (pusherRef.current) {
                pusherRef.current.disconnect();
                pusherRef.current = null;
            }

            channelsRef.current = {};
        };
    }, [JSON.stringify(activeTransformation)]);

    return (
        <>
        </>
    )
};
