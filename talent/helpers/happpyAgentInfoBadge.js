import React from 'react';

export const HAPPPY_AGENT_BADGE = {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
};

const PILL_CLASS = {
    [HAPPPY_AGENT_BADGE.PENDING]: 'jad-jobs__pill jad-jobs__pill--pending',
    [HAPPPY_AGENT_BADGE.SUCCESS]: 'jad-jobs__pill jad-jobs__pill--success',
    [HAPPPY_AGENT_BADGE.FAILED]: 'jad-jobs__pill jad-jobs__pill--failed',
};

const LABEL = {
    [HAPPPY_AGENT_BADGE.PENDING]: 'Pending',
    [HAPPPY_AGENT_BADGE.SUCCESS]: 'Success',
    [HAPPPY_AGENT_BADGE.FAILED]: 'Failed',
};

/**
 * Collapses `happpy_agent_info.status_string` into the three badge labels.
 * Backend strings: Pending, Processing, Completed, Failed, Discarded, Queued,
 * Confirmation Required, Unknown.
 */
function variantFromStatusString(statusString) {
    const raw = String(statusString || '').toLowerCase().trim();
    if (!raw) return null;
    if (raw.includes('complete') || raw.includes('success') || raw.includes('sent')) {
        return HAPPPY_AGENT_BADGE.SUCCESS;
    }
    if (raw.includes('fail') || raw.includes('discard')) {
        return HAPPPY_AGENT_BADGE.FAILED;
    }
    if (
        raw.includes('pending') ||
        raw.includes('process') ||
        raw.includes('queue') ||
        raw.includes('confirmation')
    ) {
        return HAPPPY_AGENT_BADGE.PENDING;
    }
    return null;
}

export function formatHapppyAgentRunAgo(value) {
    if (!value) return '';
    const dt = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return '';
    const diffMs = Date.now() - dt.getTime();
    if (diffMs < 0) return 'Just now';
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (days < 30) return `${weeks}wk ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

export function getHapppyAgentBadge(info) {
    if (!info || typeof info !== 'object') return null;
    const variant = variantFromStatusString(info.status_string);
    if (!variant) return null;
    return {
        variant,
        label: LABEL[variant],
        relativeAgo: formatHapppyAgentRunAgo(info.execute_at),
    };
}

/** Every badge leads with "Agent Run", followed by the run time when known. */
function badgeText(badge) {
    const runPrefix = badge.relativeAgo ? `Agent Run ${badge.relativeAgo}` : 'Agent Run';
    return `${runPrefix} • ${badge.label}`;
}

export function HapppyAgentInfoBadge({ info, className = '' }) {
    const badge = getHapppyAgentBadge(info);
    if (!badge) return null;
    const classes = [PILL_CLASS[badge.variant], 'happpy-agent-info-badge', className]
        .filter(Boolean)
        .join(' ');
    return (
        <span className={classes}>
            {badgeText(badge)}
        </span>
    );
}

export function hasHapppyAgentInfo(data) {
    return Boolean(getHapppyAgentBadge(data?.happpy_agent_info));
}
