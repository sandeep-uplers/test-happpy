/**
 * Case-insensitive substring match on company + role fields.
 * Used by tabs that filter client-side on the global search query.
 */
export default function matchesCompanyRoleSearch(row, query, { companyKeys = [], roleKeys = [] } = {}) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;

    const values = [];
    for (const key of companyKeys) {
        values.push(String(row?.[key] ?? '').toLowerCase());
    }
    for (const key of roleKeys) {
        values.push(String(row?.[key] ?? '').toLowerCase());
    }

    return values.some((v) => v.includes(q));
}
