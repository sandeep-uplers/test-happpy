import React, { useEffect, useState } from 'react';
import { IMAGE_URL } from '../../../components/Constant';

/**
 * First-run hint that floats below the Replies tab button to point a new
 * user at their replies inbox. The element is positioned with pure CSS
 * (`position: absolute` against a `position: relative` ancestor — see
 * `.aa-tab-anchor` in AgentActivity.css), so this component just owns:
 *
 *   - the localStorage "seen" flag,
 *   - the auto-dismiss when the user opens the Replies tab,
 *   - the conditional render.
 *
 * Styles live in AgentActivity.css alongside the rest of the tab-bar
 * styling, and are loaded when the parent page is mounted. The parent is
 * responsible for placing this component as a child of the positioned
 * wrapper around the Replies tab button.
 */

const STORAGE_KEY = 'aa_replies_intro_seen';

function readSeen() {
    if (typeof window === 'undefined') return true;
    try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
        return true;
    }
}

function persistSeen() {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, '1');
    } catch {
        /* localStorage may be unavailable (private mode, etc.) — ignore. */
    }
}

const MascotRepliesIntro = ({ enabled, activeTabIsReplies }) => {
    const [seen, setSeen] = useState(readSeen);

    const visible = enabled && !seen && !activeTabIsReplies;

    useEffect(() => {
        if (!activeTabIsReplies || seen) return;
        setTimeout(() => {
            setSeen(true);
            persistSeen();
        }, 3000);
    }, [activeTabIsReplies, seen]);

    if (!visible) return null;

    return (
        <aside
            className="mascot-replies-intro"
            role="status"
            aria-label="Tip: check your replies"
        >
            <div className="mascot-replies-intro__mascot" aria-hidden>
                <img src={IMAGE_URL + 'outreach/mascot-neutral.svg'} alt="" />
            </div>
            <div className="mascot-replies-intro__callout">
                <p className="mascot-replies-intro__body">
                    Recruiter responses to your outreach show up under the{' '}
                    <strong>Replies</strong> tab.
                </p>
            </div>
        </aside>
    );
};

export default MascotRepliesIntro;
