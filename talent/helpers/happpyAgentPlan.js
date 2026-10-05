/**
 * Active Happpy Agent free trial (billing plan 1, not expired).
 */
export function isHapppyAgentFreeTrialActive(planState) {
    if (!planState) return false;
    return Number(planState.plan) === 1 && !planState.has_plan_expired;
}

/**
 * Resume health check, transformation, and agent-side tailoring are paid-only
 * (active outreach plan 2+, not expired). Hidden for trial, expired, and unpaid agent access.
 *
 * @param {'agent'|'global'} scope
 *   - `agent` — Happpy Agent surfaces (nav, dashboard, job-agent pages). Treats unknown /
 *     unloaded plan and no outreach plan as locked.
 *   - `global` — App-wide modals (e.g. tailor editor). Only locks after plan is loaded and
 *     user is on trial or expired paid/trial, so legacy work-board tailor still works when the
 *     user has no Happpy Agent subscription.
 */
export function shouldHideHapppyAgentResumeFeatures(planState, scope = 'agent') {
    const agentScope = scope === 'agent';

    if (!planState) {
        return agentScope;
    }

    if (!planState.loaded) {
        return agentScope;
    }

    if (planState.has_plan_expired) {
        return true;
    }

    if (planState.plan == null || planState.plan === '') {
        return agentScope;
    }

    return Number(planState.plan) === 1;
}

const TAILOR_RESUME_PATH = '/talent/job-agent/tailor-resume';

/** Drop "My Resumes" / tailor-resume nav entries when resume features are locked. */
export function filterHapppyAgentResumeNavItems(items, hideResumeNav) {
    if (!hideResumeNav) return items;
    return items.filter(
        (item) => item.to !== TAILOR_RESUME_PATH && item.id !== 'resumes',
    );
}
