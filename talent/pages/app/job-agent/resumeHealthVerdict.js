/**
 * Shared resume-health verdict mapping.
 *
 * Maps a resume score (0–100) to a `{ tone, label }` pair used by the
 * dashboard card (`JobAgentProfileResumeHealth`) and the report popup
 * (`JobAgentResumeHealthReport`). Tones drive BEM modifier classes
 * (`...--green`, `...--yellow`, `...--orange`, `...--red`) defined in
 * `JobAgentDashboard.css`, so any change here must keep the tone names
 * in sync with the stylesheet.
 *
 * Palette flows like a traffic light from best to worst:
 *   green  ≥ 85  – Interview Ready
 *   yellow ≥ 70  – Average — may get overlooked
 *   orange ≥ 50  – Needs improvement
 *   red     < 50 – Needs serious improvement
 */
export function getVerdict(score) {
    if (score >= 85) return { tone: 'green', label: 'Interview Ready' };
    if (score >= 70) return { tone: 'yellow', label: 'Average — may get overlooked' };
    if (score >= 50) return { tone: 'orange', label: 'Needs improvement' };
    return { tone: 'red', label: 'Needs serious improvement' };
}
