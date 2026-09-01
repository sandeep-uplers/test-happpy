import React, { useCallback, useEffect, useRef, useState } from "react";
import { IMAGE_URL } from "./Constant";
import { trackHappyAgentMixpanel } from "../store/actions/happyAgentTracking";

/**
 * @typedef {'yes' | 'no'} SkipTailorChoice
 */

const CloseIcon = () => (
    <svg className="skipTailorOptionModal__iconSvg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const InfoIcon = () => (
    <svg className="skipTailorOptionModal__infoIcon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="8" cy="8" r="6.667" stroke="#6B6B6B" strokeWidth="1.2" />
        <path d="M8 7.333V11" stroke="#6B6B6B" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="5.333" r="0.667" fill="#6B6B6B" />
    </svg>
);

/**
 * Modal: tailor resume & run agent vs profile resume.
 * Styles: `public/css/talent/work.css` (`.skipTailorOptionModal`).
 *
 * @param {{ isOpen: boolean; onResolve: (choice: SkipTailorChoice) => void; onClose?: () => void }} props
 */
export default function SkipTailorOptionModal({ isOpen, onResolve, onClose = () => { } }) {
    if (!isOpen) {
        return null;
    }

    useEffect(() => {
        if (isOpen) {
            trackHappyAgentMixpanel("run_happy_agent_resume_selection_popup_shown")
        }
    }, [isOpen]);

    const handleTailorSelection = (choice) => {
        trackHappyAgentMixpanel("run_happy_agent_resume_selection", {
            tailor_opted: choice,
        })
        onResolve(choice);
    }

    const handleClose = () => {
        trackHappyAgentMixpanel("run_happy_agent_resume_selection_popup_closed");
        onClose();
    }

    return (
        <div
            className="skipTailorOptionModal"
            role="presentation"
        >
            <div
                className="skipTailorOptionModal__dialog"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="skipTailorOptionModal-title"
            >
                <button
                    type="button"
                    className="skipTailorOptionModal__close"
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <CloseIcon />
                </button>

                <div className="skipTailorOptionModal__header">
                    <img
                        className="skipTailorOptionModal__rocket"
                        src={`${IMAGE_URL}skip-tailor-rocket.png`}
                        alt=""
                        width={48}
                        height={48}
                    />
                    <h2 id="skipTailorOptionModal-title" className="skipTailorOptionModal__title">
                        Start Happpy Agent with a Resume
                    </h2>
                    {/* <p className="skipTailorOptionModal__sub">
                        Tailoring takes less than 3 minutes &amp; can improve your chances of getting a response!
                    </p> */}
                </div>

                <div className="skipTailorOptionModal__actions">
                    <button
                        type="button"
                        className="skipTailorOptionModal__btn skipTailorOptionModal__btn--primary"
                        onClick={() => handleTailorSelection("yes")}
                    >
                        Tailor Resume &amp; Run Agent
                    </button>
                    <p className="skipTailorOptionModal__or" aria-hidden>
                        OR
                    </p>
                    <button
                        type="button"
                        className="skipTailorOptionModal__btn skipTailorOptionModal__btn--secondary"
                        onClick={() => handleTailorSelection("no")}
                    >
                        Run agent with Profile Resume
                    </button>
                </div>

                <p className="skipTailorOptionModal__hint">
                    <InfoIcon />
                    <span>You can also tailor your resume later</span>
                </p>
            </div>
        </div>
    );
}

/**
 * Promise-based flow: `open()` shows the modal; resolves with `'yes'` or `'no'`.
 * Render `<SkipTailorOptionModal isOpen={isOpen} onResolve={onResolve} />` in your tree.
 *
 * @returns {{ open: () => Promise<SkipTailorChoice>; isOpen: boolean; onResolve: (choice: SkipTailorChoice) => void; onClose: () => void }}
 */
export function useSkipTailorOptionPromise() {
    const [isOpen, setIsOpen] = useState(false);
    const resolverRef = useRef(null);

    const onResolve = useCallback((choice) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setIsOpen(false);
        if (typeof resolve === "function") {
            resolve(choice);
        }
    }, []);
    const onClose = useCallback(() => {
        resolverRef.current = null;
        setIsOpen(false);
    }, []);

    const open = useCallback(
        () =>
            new Promise((resolve) => {
                resolverRef.current = resolve;
                setIsOpen(true);
            }),
        []
    );

    return { open, isOpen, onResolve, onClose };
}
