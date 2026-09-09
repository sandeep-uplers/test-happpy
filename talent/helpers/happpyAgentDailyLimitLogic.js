/** Whether auto-run-request succeeded enough to refresh today's quota from the API. */
export function shouldRefreshDailyLimitAfterAutoRun(res) {
    const body = res?.data;
    if (!body || body.status === 'error') return false;
    if (body.status === 'success') return true;
    if (body?.data && Number.isFinite(Number(body.data.applied_jobs))) return true;
    // run_time / external recommended job — 200 with message only, no error status
    return typeof body.message === 'string' && body.message.length > 0 && body.status !== 'error';
}

/** Normalize get-outreach-dashboard-data into dashboard-only fields (not widget quota). */
export function parseDailyLimitFromDashboardResponse(res) {
    const payload = res?.data?.data || {};
    return {
        dashboardData: { ...payload, today_agent_runs: Number(payload.today_agent_runs) || 0 },
        agentPrefFieldsSubmitted: !!payload.agent_pref_fields_submitted,
    };
}

function mapDailyReferralRunEntry(entry = {}) {
    return {
        id: String(entry.id ?? entry.outreach_hr_id ?? ''),
        role: entry.role || '',
        company: entry.company || '',
        hrNumber: entry.hr_number ?? null,
        outreachHrId: entry.outreach_hr_id ?? entry.id ?? null,
        failureReason: entry.failure_reason ?? null,
    };
}

/** Normalize daily-referral-runs into happpyAgent slice fields. */
export function parseDailyReferralRunsResponse(res) {
    const payload = res?.data?.data || {};
    const completed = Array.isArray(payload.completed) ? payload.completed.map(mapDailyReferralRunEntry) : [];
    const failed = Array.isArray(payload.failed) ? payload.failed.map(mapDailyReferralRunEntry) : [];
    const pending = Array.isArray(payload.pending) ? payload.pending.map(mapDailyReferralRunEntry) : [];

    return {
        dailyUsed: Number(payload.used) || 0,
        dailyLimit: Number(payload.max_limit) || 0,
        completedCount: Number(payload.completed_count) || completed.length,
        pendingCount: Number(payload.pending_count) || pending.length,
        failedCount: Number(payload.failed_count) || failed.length,
        dailyReferralRuns: { completed, failed, pending },
    };
}

/** Popover-ready breakdown (camelCase). */
export function normalizeDailyReferralRunsForPopover(runs) {
    if (!runs) {
        return { completed: [], failed: [], pending: [] };
    }
    return {
        completed: runs.completed || [],
        failed: runs.failed || [],
        pending: runs.pending || [],
    };
}

/** UI display value — never show more than the daily cap (e.g. 8/8 not 9/8). */
export function displayDailyUsed(used, limit) {
    const safeUsed = Math.max(0, Number(used) || 0);
    const safeLimit = Number(limit) || 0;
    if (safeLimit <= 0) return safeUsed;
    return Math.min(safeUsed, safeLimit);
}

/**
 * Block-bar segment states for the daily-limit widget.
 * Order: green (completed), red (failed), grey (pending), then empty.
 * Each failed run adds one extra empty block on top of unused quota slots.
 */
export function buildDailyLimitSegmentStates(completedCount, pendingCount, limit, failedCount = 0) {
    const safeLimit = Number(limit) || 0;
    const safeCompleted = Math.max(0, Number(completedCount) || 0);
    const safeFailed = Math.max(0, Number(failedCount) || 0);
    const safePending = Math.max(0, Number(pendingCount) || 0);
    const counted = Math.min(safeLimit, safeCompleted + safeFailed + safePending);
    const clampedCompleted = Math.min(safeCompleted, counted);
    const remainingAfterCompleted = counted - clampedCompleted;
    const clampedFailed = Math.min(safeFailed, remainingAfterCompleted);
    const clampedPending = Math.min(safePending, remainingAfterCompleted - clampedFailed);
    const unusedQuotaSlots = Math.max(0, safeLimit - clampedCompleted - clampedFailed - clampedPending);
    const emptyCount = unusedQuotaSlots + clampedFailed;

    const segments = [];
    for (let i = 0; i < clampedCompleted; i += 1) {
        segments.push('used');
    }
    for (let i = 0; i < clampedFailed; i += 1) {
        segments.push('red');
    }
    for (let i = 0; i < clampedPending; i += 1) {
        segments.push('pending');
    }
    for (let i = 0; i < emptyCount; i += 1) {
        segments.push('empty');
    }

    return segments;
}
