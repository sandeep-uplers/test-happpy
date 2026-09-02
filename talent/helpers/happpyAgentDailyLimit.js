/** localStorage key for get-outreach-dashboard-data cache (shared with happpyAgent reducer). */
export const HAPPPY_AGENT_DASHBOARD_CACHE_KEY = 'happpy_agent_dashboard_data_cache';

/** Fired after Redux + localStorage are updated following a successful agent run. */
export const HAPPPY_AGENT_DAILY_RUN_RECORDED_EVENT = 'happpy-agent:daily-run-recorded';

/** Count runs from auto-run-request success (single job, external run_time, or batch of up to 3). */
export function countFromAutoRunResponse(res) {
    const applied = Number(res?.data?.data?.applied_jobs);
    if (Number.isFinite(applied)) return Math.max(0, applied);
    // run_time / external recommended job — 200 with message only, one HR created
    if (res?.data?.message) return 1;
    return 0;
}

/** Count runs from referral-agent/job-apply-by-links-batch (0 when sync-only). */
export function countFromReferralLinksBatchResponse(res) {
    const data = res?.data?.data;
    if (data?.sync_only) return 0;
    const queued = Number(data?.queued);
    if (Number.isFinite(queued) && queued > 0) return queued;
    return res?.data?.status === 'success' ? 1 : 0;
}
