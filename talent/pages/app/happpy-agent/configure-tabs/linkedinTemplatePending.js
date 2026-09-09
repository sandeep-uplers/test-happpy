/** LinkedIn is connected but no saved LinkedIn outreach template yet. */
export function isLinkedinTemplatePending(linkedinConnected, linkedinTemplate) {
    return !!linkedinConnected && !(linkedinTemplate || '').trim();
}
