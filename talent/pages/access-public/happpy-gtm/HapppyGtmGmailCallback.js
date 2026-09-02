'use client';

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "@/talent/navigation/routerCompat";
import { persistHapppyGtmAuth } from "../../../helpers/happpyGtmOnboarding";
import { setCurrentUser } from "../../../store/actions/UserActions";
import "./HapppyGtmOnboarding.css";

function parseUserParam(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        try {
            return JSON.parse(decodeURIComponent(raw));
        } catch {
            try {
                return JSON.parse(atob(raw));
            } catch {
                return null;
            }
        }
    }
}

function readBoolean(value) {
    if (value === true || value === "1" || value === "true") return true;
    if (value === false || value === "0" || value === "false") return false;
    return undefined;
}

/**
 * Public OAuth return for Gmail-as-auth. Backend should redirect the popup here
 * with authtoken + user (JSON / URI-encoded JSON / base64 JSON) + optional new_account,
 * or error=….
 */
export default function HapppyGtmGmailCallback() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const [state, setState] = useState({ kind: "working", message: "Connecting Gmail…" });

    useEffect(() => {
        const error = searchParams.get("error");
        const errorMessage =
            searchParams.get("message") ||
            (error === "gmail_scope_not_granted"
                ? "Gmail scope not granted. Please grant all required permissions."
                : error
                    ? "Gmail connection failed. Please try again."
                    : "");

        const postToOpener = (payload) => {
            if (window.opener) {
                window.opener.postMessage(payload, window.location.origin);
            }
        };

        if (error) {
            postToOpener({
                type: "GMAIL_CONNECT_ERROR",
                message: errorMessage,
            });
            postToOpener({
                type: "HAPPPY_GTM_GMAIL_AUTH_ERROR",
                message: errorMessage,
            });
            setState({ kind: "error", message: errorMessage });
            setTimeout(() => {
                if (window.opener) window.close();
            }, 1600);
            return;
        }

        const authtoken = searchParams.get("authtoken") || searchParams.get("token");
        const user =
            parseUserParam(searchParams.get("user")) ||
            parseUserParam(searchParams.get("data"));
        const newAccount = readBoolean(searchParams.get("new_account"));

        if (authtoken && user) {
            persistHapppyGtmAuth(authtoken, user);
            dispatch(setCurrentUser(user));
        }

        if (authtoken || searchParams.get("gmail") === "success") {
            const successPayload = {
                type: "GMAIL_CONNECT_SUCCESS",
                authtoken,
                data: user,
                new_account: newAccount,
            };
            postToOpener(successPayload);
            postToOpener({ ...successPayload, type: "HAPPPY_GTM_GMAIL_AUTH_SUCCESS" });
            setState({ kind: "success", message: "Gmail connected. You can close this window." });
            setTimeout(() => {
                if (window.opener) window.close();
            }, 1200);
            return;
        }

        setState({ kind: "error", message: "Missing Gmail auth details. Please try again." });
        postToOpener({
            type: "GMAIL_CONNECT_ERROR",
            message: "Missing Gmail auth details. Please try again.",
        });
    }, [dispatch, searchParams]);

    return (
        <div className="happpy-gtm-callback">
            <div className="happpy-gtm-callback__card">
                <h1 className="happpy-gtm-callback__title">
                    {state.kind === "success" ? "Gmail connected" : state.kind === "error" ? "Couldn’t connect" : "Connecting"}
                </h1>
                <p className="happpy-gtm-callback__lead">{state.message}</p>
            </div>
        </div>
    );
}
