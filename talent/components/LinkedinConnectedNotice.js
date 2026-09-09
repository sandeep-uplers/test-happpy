import './LinkedinConnectedNotice.css';

const LINKEDIN_CONNECTED_NOTICE_LIGHTBULB_SRC =
    '/images/talent/happpy-agent/linkedin-connected-notice-lightbulb.svg';

export function buildDailyLimitCopy(dailyLimit) {
    const safeLimit = Number(dailyLimit) || 0;
    if (safeLimit <= 0) {
        return 'Daily referrals are capped to help protect your LinkedIn account. This limit cannot be increased.';
    }

    const jobWord = safeLimit === 1 ? 'job' : 'jobs';
    return `Daily referrals are capped at ${safeLimit} ${jobWord} to help protect your LinkedIn account. This limit cannot be increased.`;
}

/** Shared bullet list — light card + dark success-modal callout. */
export function LinkedinConnectedNoticeBullets({ dailyLimit = 0, isFreeTrial = false, className = '' }) {
    const listClassName = ['linkedin-connected-notice__list', className].filter(Boolean).join(' ');

    return (
        <ul className={listClassName}>
            <li>LinkedIn outreach starts 4 hours after your connection request is accepted.</li>
            <li>{buildDailyLimitCopy(dailyLimit)}</li>
            {isFreeTrial && (
                <li>
                    Want more control? Subscribing to a paid plan allows you to review and approve each
                    message before it&apos;s sent.
                </li>
            )}
        </ul>
    );
}

/**
 * Shown below Gmail/LinkedIn cards once LinkedIn is connected.
 * Figma: Happpy Agent — Referral, node 2691:13452.
 */
export default function LinkedinConnectedNotice({ dailyLimit = 0, isFreeTrial = false, className = '' }) {
    const rootClassName = ['linkedin-connected-notice', className].filter(Boolean).join(' ');

    return (
        <div className={rootClassName} role="note" aria-label="LinkedIn outreach notes">
            <div className="linkedin-connected-notice__header">
                <img
                    src={LINKEDIN_CONNECTED_NOTICE_LIGHTBULB_SRC}
                    alt=""
                    aria-hidden="true"
                    className="linkedin-connected-notice__icon"
                />
                <p className="linkedin-connected-notice__title">
                    <strong>Please note:</strong>
                </p>
            </div>
            <LinkedinConnectedNoticeBullets dailyLimit={dailyLimit} isFreeTrial={isFreeTrial} />
        </div>
    );
}
