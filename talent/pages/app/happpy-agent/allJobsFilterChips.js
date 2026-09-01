import {
    engagementFilterMaster,
    experienceFilterMaster,
    jobPostedDateFilterMaster,
    payoutFilterMaster,
    teamSizeFilterMaster,
} from '../../../components/Masters';

const CHIP_SECTIONS = [
    'engagements',
    'job_posted_date',
    'experience',
    'locations',
    'payout',
    'roles',
    'skills',
    'maang_plus',
    'team_size',
    'salary_available',
];

const NUMBER_SECTION_LABELS = {
    experience: 'Experience',
    payout: 'Salary Range',
    team_size: 'Team Size',
};

const RANGE_FILTER_MASTERS = {
    experience: experienceFilterMaster,
    payout: payoutFilterMaster,
    team_size: teamSizeFilterMaster,
};

function findMasterItemLabel(section, key, filterMasterData = {}) {
    if (section === 'locations' && filterMasterData.locationMaster?.length) {
        const item = filterMasterData.locationMaster.find((entry) => String(entry.value) === String(key));
        if (item) return item.label_without_count ?? item.label;
    }
    if (section === 'skills' && filterMasterData.skillMaster?.length) {
        const item = filterMasterData.skillMaster.find((entry) => String(entry.value) === String(key));
        if (item) return item.skill_name ?? item.label;
    }
    if (section === 'maang_plus' && filterMasterData.maangMaster?.length) {
        const item = filterMasterData.maangMaster.find((entry) => String(entry.value) === String(key));
        if (item) return item.label;
    }
    if (section === 'roles' && filterMasterData.roleMaster?.length) {
        for (const group of filterMasterData.roleMaster) {
            const option = group.options?.find((entry) => String(entry.value) === String(key));
            if (option) return option.label;
        }
    }
    return null;
}

function resolveRangeChipLabel(section, key) {
    const match = RANGE_FILTER_MASTERS[section]?.find((item) => String(item.value) === String(key));
    if (match) return match.label;

    if (typeof key !== 'string' || !key.includes(',')) return key;

    const [start, end] = key.split(',');
    if (section === 'experience') return `${start} – ${end} years`;
    if (section === 'payout') {
        if (start === 'Confidential' || end === 'Confidential') return 'Confidential';
        return `₹ ${start} – ${end} lacs`;
    }
    if (section === 'team_size') return `${start} – ${end} employees`;
    return key.replace(',', ' – ');
}

function resolveChipLabel(section, key, value, subMaster, filterMasterData) {
    if (RANGE_FILTER_MASTERS[section]) {
        return resolveRangeChipLabel(section, key);
    }
    if (section === 'job_posted_date') {
        if (value && typeof value === 'object') {
            return value.label || value.value_name || key;
        }
        const match = jobPostedDateFilterMaster.find((item) => String(item.value) === String(key));
        if (match) return match.label;
    }
    if (section === 'salary_available') {
        return 'Salary Available';
    }
    if (section === 'engagements') {
        const match = engagementFilterMaster.find((item) => String(item.value) === String(key));
        if (match) return match.label;
    }
    if (subMaster?.[section]?.[key]) {
        return subMaster[section][key];
    }
    const masterLabel = findMasterItemLabel(section, key, filterMasterData);
    if (masterLabel) return masterLabel;
    if (value && typeof value === 'object') {
        return value.label || value.skill_name || value.company_name || key;
    }
    return key;
}

export function buildAllJobsFilterChips(selectedFilters = {}, subMaster = {}, filterMasterData = {}) {
    const chips = [];

    CHIP_SECTIONS.forEach((section) => {
        const sectionValue = selectedFilters[section];
        if (!sectionValue || typeof sectionValue !== 'object') return;

        Object.entries(sectionValue).forEach(([key, value]) => {
            if (!value && value !== true) return;

            const label = resolveChipLabel(section, key, value, subMaster, filterMasterData);
            const sectionLabel = NUMBER_SECTION_LABELS[section];

            chips.push({
                id: `${section}:${key}`,
                section,
                key,
                label,
                sectionLabel: sectionLabel ?? null,
                displayLabel: sectionLabel ? `${sectionLabel}: ${label}` : label,
            });
        });
    });

    return chips;
}

export function removeChipFromFilters(selectedFilters, chip) {
    const next = { ...selectedFilters };
    const sectionValue = { ...(next[chip.section] || {}) };
    delete sectionValue[chip.key];

    if (Object.keys(sectionValue).length === 0) {
        next[chip.section] = chip.section === 'salary_available' ? null : {};
    } else {
        next[chip.section] = sectionValue;
    }

    return next;
}
