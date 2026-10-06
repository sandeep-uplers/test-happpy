import { format } from 'date-fns';

export const UTS_UNSAVED_LEAVE_MESSAGE = 'You have unsaved changes. Leave without saving?';

const normalizeSelectValues = (items = []) => (items || [])
    .filter(Boolean)
    .map((item) => (item?.value != null ? item.value : item))
    .filter((v) => v !== 'None')
    .sort((a, b) => String(a).localeCompare(String(b)));

const formatLastWorkingDayForSnapshot = (value) => {
    if (!value) return null;
    if (value instanceof Date) return format(value, 'yyyy-MM-dd');
    return String(value);
};

const normalizeLocationValue = (value) => {
    if (value == null) return null;
    if (typeof value === 'object' && value.value != null) return value.value;
    return value;
};

export function serializeUtsPreferencesSnapshot(formData, { selectedJSTillDate, pendingResumeFile }) {
    const jobSearchUntil = selectedJSTillDate?.[0]?.value
        ?? formData.job_search_unavailable_until?.[0]?.value
        ?? (Array.isArray(formData.job_search_unavailable_until)
            ? null
            : formData.job_search_unavailable_until)
        ?? null;

    return {
        linkedin_id: String(formData.linkedin_id || '').trim(),
        resume: String(formData.resume || ''),
        pendingResumeFile: Boolean(pendingResumeFile),
        total_experience: String(formData.total_experience ?? '').replaceAll(' ', ''),
        job_function_id: formData.job_function_id ?? null,
        current_location: normalizeLocationValue(formData.current_location),
        current_ctc: String(formData.current_ctc ?? ''),
        expected_ctc: String(formData.expected_ctc ?? ''),
        joining_period: formData.joining_period?.value ?? formData.joining_period ?? null,
        serving_notice_period: formData.serving_notice_period ?? null,
        last_working_day: formatLastWorkingDayForSnapshot(formData.last_working_day),
        preferred_method: normalizeSelectValues(formData.preferred_method),
        preferred_cities: normalizeSelectValues(formData.preferred_cities),
        preferred_modes: normalizeSelectValues(formData.preferred_modes),
        availability: formData.availability ?? null,
        job_search_preference: formData.job_search_preference?.[0]?.value ?? null,
        job_search_unavailable_until: jobSearchUntil,
        ctc_breakdown: formData.ctc_breakdown ? JSON.stringify(formData.ctc_breakdown) : null,
    };
}
