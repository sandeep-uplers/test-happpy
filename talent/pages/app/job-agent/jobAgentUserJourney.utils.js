export const USER_JOURNEY_STATUS_SLUGS = {
    JUST_EXPLORING: 'just_exploring',
    ACTIVELY_APPLYING: 'actively_applying',
    INTERVIEWING: 'interviewing',
    HAVE_AN_OFFER: 'have_an_offer',
    LAID_OFF: 'laid_off',
};

export const USER_JOURNEY_STATUS_DISPLAY = {
    [USER_JOURNEY_STATUS_SLUGS.JUST_EXPLORING]: 'Just Exploring',
    [USER_JOURNEY_STATUS_SLUGS.ACTIVELY_APPLYING]: 'Actively Applying',
    [USER_JOURNEY_STATUS_SLUGS.INTERVIEWING]: 'Interviewing',
    [USER_JOURNEY_STATUS_SLUGS.HAVE_AN_OFFER]: 'Have an Offer',
    [USER_JOURNEY_STATUS_SLUGS.LAID_OFF]: 'Laid Off',
};

export const INTERVIEWS_PER_WEEK_OPTIONS = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3+' },
];

export const EMPTY_USER_JOURNEY_STATUS = {
    status: null,
    just_exploring: { motivations: [] },
    actively_applying: { applications_per_day: 1, job_boards: [] },
    interviewing: { interviews_per_week: null },
    have_an_offer: { offer_concerns: [] },
    laid_off: { days_since_layoff: null },
};

export const formatJourneyStatusLabel = (slug = '') =>
    slug
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

export const getJourneyStatusSlug = (statusValue, statusMaster = []) => {
    const match = statusMaster?.find((item) => String(item.value) === String(statusValue));
    return match?.label || null;
};

const labelsToValues = (labels = [], master = []) =>
    labels
        .map((label) => master.find((item) => item.label === label)?.value)
        .filter((value) => value != null);

const toMasterValues = (values = []) =>
    (values || [])
        .map((value) => {
            const numeric = Number(value);
            return Number.isNaN(numeric) ? value : numeric;
        })
        .filter((value) => value != null && value !== '');

const extractSubStatusValues = (row = {}) => {
    const list = row.sub_statuses || row.subStatuses || [];
    return list
        .map((item) => item?.sub_status)
        .filter((value) => value != null && value !== '');
};

const parseApiUserJourneyRow = (row = {}) => {
    if (row?.status == null || row?.status === '') {
        return { ...EMPTY_USER_JOURNEY_STATUS };
    }

    const status = Number(row.status);
    const subStatusValues = toMasterValues(extractSubStatusValues(row));
    const form = {
        ...EMPTY_USER_JOURNEY_STATUS,
        status,
    };

    switch (status) {
        case 1:
            form.just_exploring = { motivations: subStatusValues };
            break;
        case 2:
            form.actively_applying = {
                applications_per_day:
                    row.applications_per_day != null ? Number(row.applications_per_day) : 1,
                job_boards: subStatusValues,
            };
            break;
        case 3:
            form.interviewing = {
                interviews_per_week:
                    row.interviews_per_week != null ? Number(row.interviews_per_week) : null,
            };
            break;
        case 4:
            form.have_an_offer = { offer_concerns: subStatusValues };
            break;
        case 5:
            form.laid_off = {
                days_since_layoff:
                    row.days_since_layoff != null && row.days_since_layoff !== ''
                        ? Number(row.days_since_layoff)
                        : null,
            };
            break;
        default:
            break;
    }

    return form;
};

export const buildApiUserJourneyRowFromForm = (journey = {}, masters = {}) => {
    if (journey?.status == null || journey?.status === '') {
        return null;
    }

    const status = Number(journey.status);
    const subStatuses = [];

    switch (status) {
        case 1:
            toMasterValues(journey.just_exploring?.motivations).forEach((value) => {
                subStatuses.push({ sub_status: value });
            });
            break;
        case 2:
            toMasterValues(journey.actively_applying?.job_boards).forEach((value) => {
                subStatuses.push({ sub_status: value });
            });
            return {
                status,
                applications_per_day: journey.actively_applying?.applications_per_day ?? null,
                interviews_per_week: null,
                days_since_layoff: null,
                sub_statuses: subStatuses,
            };
        case 3:
            return {
                status,
                applications_per_day: null,
                interviews_per_week:
                    journey.interviewing?.interviews_per_week != null &&
                    journey.interviewing?.interviews_per_week !== ''
                        ? Number(journey.interviewing.interviews_per_week)
                        : null,
                days_since_layoff: null,
                sub_statuses: [],
            };
        case 4:
            toMasterValues(journey.have_an_offer?.offer_concerns).forEach((value) => {
                subStatuses.push({ sub_status: value });
            });
            break;
        case 5:
            return {
                status,
                applications_per_day: null,
                interviews_per_week: null,
                days_since_layoff:
                    journey.laid_off?.days_since_layoff != null &&
                    journey.laid_off?.days_since_layoff !== ''
                        ? Number(journey.laid_off.days_since_layoff)
                        : null,
                sub_statuses: [],
            };
        default:
            return null;
    }

    return {
        status,
        applications_per_day: null,
        interviews_per_week: null,
        days_since_layoff: null,
        sub_statuses: subStatuses,
    };
};

const isFormShapedJourney = (row = {}) =>
    row.status != null &&
    !row.sub_statuses &&
    !row.subStatuses &&
    (
        row.just_exploring ||
        row.actively_applying ||
        row.interviewing ||
        row.have_an_offer ||
        row.laid_off
    );

const mergeFormShapedJourney = (row = {}) => ({
    ...EMPTY_USER_JOURNEY_STATUS,
    ...row,
    just_exploring: {
        ...EMPTY_USER_JOURNEY_STATUS.just_exploring,
        ...(row.just_exploring || {}),
    },
    actively_applying: {
        ...EMPTY_USER_JOURNEY_STATUS.actively_applying,
        ...(row.actively_applying || {}),
    },
    interviewing: {
        ...EMPTY_USER_JOURNEY_STATUS.interviewing,
        ...(row.interviewing || {}),
    },
    have_an_offer: {
        ...EMPTY_USER_JOURNEY_STATUS.have_an_offer,
        ...(row.have_an_offer || {}),
    },
    laid_off: {
        ...EMPTY_USER_JOURNEY_STATUS.laid_off,
        ...(row.laid_off || {}),
    },
});

export const parseUserJourneyFromTalent = (talent = {}, masters = {}) => {
    const motivationsMaster = masters.justExploringMotivationsMaster || [];
    const jobBoardsMaster = masters.activelyApplyingJobBoardsMaster || [];
    const concernsMaster = masters.haveAnOfferConcernsMaster || [];
    const layoffMaster = masters.laidOffDaysSinceLayoffMaster || [];

    if (talent?.user_journey_status?.status != null) {
        if (isFormShapedJourney(talent.user_journey_status)) {
            return mergeFormShapedJourney(talent.user_journey_status);
        }
        return parseApiUserJourneyRow(talent.user_journey_status);
    }

    if (talent?.userJourneyStatus?.status != null && talent?.userJourneyStatus?.status !== '') {
        const api = talent.userJourneyStatus;
        const normalizeList = (items = [], master = []) => {
            if (!items?.length) return [];
            const first = items[0];
            if (typeof first === 'number' || (typeof first === 'string' && master.some((m) => String(m.value) === String(first)))) {
                return items.map((item) => {
                    const numeric = Number(item);
                    return Number.isNaN(numeric) ? item : numeric;
                });
            }
            return labelsToValues(items, master);
        };

        return {
            status: Number.isNaN(Number(api.status)) ? api.status : Number(api.status),
            just_exploring: {
                motivations: normalizeList(api.just_exploring?.motivations, motivationsMaster),
            },
            actively_applying: {
                applications_per_day: api.actively_applying?.applications_per_day ?? 1,
                job_boards: normalizeList(api.actively_applying?.job_boards, jobBoardsMaster),
            },
            interviewing: {
                interviews_per_week:
                    api.interviewing?.interviews_per_week != null
                        ? String(api.interviewing.interviews_per_week)
                        : null,
            },
            have_an_offer: {
                offer_concerns: normalizeList(api.have_an_offer?.offer_concerns, concernsMaster),
            },
            laid_off: {
                days_since_layoff:
                    api.laid_off?.days_since_layoff != null && layoffMaster.some(
                        (item) => String(item.value) === String(api.laid_off.days_since_layoff)
                    )
                        ? api.laid_off.days_since_layoff
                        : layoffMaster.find((item) => item.label === api.laid_off?.days_since_layoff)?.value ?? null,
            },
        };
    }

    return { ...EMPTY_USER_JOURNEY_STATUS };
};

export const buildUserJourneyStatusPayload = (journey = {}, masters = {}) => {
    if (journey?.status == null || journey?.status === '') return null;

    const statusMaster = masters.userJourneyStatusMaster || [];
    const slug = getJourneyStatusSlug(journey.status, statusMaster);
    if (!slug) return null;

    const statusValue = Number.isNaN(Number(journey.status))
        ? journey.status
        : Number(journey.status);

    const payload = { status: statusValue };

    if (slug === USER_JOURNEY_STATUS_SLUGS.JUST_EXPLORING) {
        payload.just_exploring = {
            motivations: toMasterValues(journey.just_exploring?.motivations),
        };
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.ACTIVELY_APPLYING) {
        payload.actively_applying = {
            applications_per_day: journey.actively_applying?.applications_per_day ?? 0,
            job_boards: toMasterValues(journey.actively_applying?.job_boards),
        };
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.INTERVIEWING) {
        payload.interviewing = {
            interviews_per_week:
                journey.interviewing?.interviews_per_week != null &&
                journey.interviewing?.interviews_per_week !== ''
                    ? Number(journey.interviewing.interviews_per_week)
                    : null,
        };
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.HAVE_AN_OFFER) {
        payload.have_an_offer = {
            offer_concerns: toMasterValues(journey.have_an_offer?.offer_concerns),
        };
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.LAID_OFF) {
        const layoffValue = journey.laid_off?.days_since_layoff;
        payload.laid_off = {
            days_since_layoff: Number.isNaN(Number(layoffValue)) ? layoffValue : Number(layoffValue),
        };
    }

    return payload;
};

export const validateUserJourneyStatus = (journey = {}, masters = {}) => {
    if (journey?.status == null || journey?.status === '') {
        return "Please share where you're at in your job search journey right now";
    }

    const slug = getJourneyStatusSlug(journey.status, masters.userJourneyStatusMaster);
    if (!slug) return "Please share where you're at in your job search journey right now";

    if (slug === USER_JOURNEY_STATUS_SLUGS.JUST_EXPLORING) {
        if (!journey.just_exploring?.motivations?.length) {
            return 'Please select what would make you move';
        }
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.ACTIVELY_APPLYING) {
        if (!journey.actively_applying?.job_boards?.length) {
            return 'Please select which job boards you are using';
        }
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.INTERVIEWING) {
        if (
            journey.interviewing?.interviews_per_week == null ||
            journey.interviewing?.interviews_per_week === ''
        ) {
            return 'Please select how many interviews you get per week';
        }
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.HAVE_AN_OFFER) {
        if (!journey.have_an_offer?.offer_concerns?.length) {
            return 'Please share what is holding you back on the current offer';
        }
    } else if (slug === USER_JOURNEY_STATUS_SLUGS.LAID_OFF) {
        if (journey.laid_off?.days_since_layoff == null || journey.laid_off?.days_since_layoff === '') {
            return 'Please share how many days since you were laid off';
        }
    }

    return null;
};
