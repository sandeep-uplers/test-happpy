import React from 'react';
import { IMAGE_URL } from '../components/Constant';

/** Content for bookmark save/unsave react-hot-toast (success / error). */
export function BookmarkToastMessage({ role, saved, undoAllowed, onUndo, onDismiss }) {
    const showUndo = Boolean(undoAllowed && !saved);

    return (
        <div className="bookmark-toast">
            <img
                className="bookmark-toast__icon"
                src={IMAGE_URL + (saved ? 'bookmarked.png' : 'bookmarkRemoved.png')}
                alt=""
            />
            <div className="bookmark-toast__text">
                <p>{saved ? 'Job added to Saved Jobs!' : 'Job removed from Saved Jobs'}</p>
                {role ? <strong>{role}</strong> : null}
            </div>
            {showUndo ? (
                <button
                    type="button"
                    className="bookmark-toast__undo"
                    onClick={() => {
                        onUndo?.(saved);
                        onDismiss?.();
                    }}
                >
                    Undo
                </button>
            ) : null}
        </div>
    );
}
