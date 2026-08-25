'use client';


export const payoutFilterMaster = [
    { "label": "< ₹ 20 lacs", value: "0,20" },
    { "label": "₹ 20 lacs - 30 lacs", value: "20,30" },
    { "label": "₹ 30 lacs - 50 lacs", value: "30,50" },
    { "label": "₹ 50 lacs - 75 lacs", value: "50,75" },
    { "label": "₹ 75 lacs - 1 Cr", value: "75,100" },
    { "label": "> ₹ 1 Cr", value: "100,5000" },
    { "label": "Confidential", value: "Confidential,Confidential" },
]

export const jobPostedDateFilterMaster = [
    { "label": "Within 24 Hours", value: "1", value_name: '1day' },
    { "label": "Within 3 days", value: "2", value_name: '3days' },
    { "label": "Within 1 week", value: "3", value_name: '7days' },
    { "label": "Within 2 weeks", value: "4", value_name: '14days' },
    { "label": "Within 1 month", value: "5", value_name: '30days' },
    // { "label": "Anytime", value: "5" },
]

export const experienceFilterMaster = [
    { "label": "0 - 2 years", value: "0,2" },
    { "label": "2 - 4 years", value: "2,4" },
    { "label": "4 - 6 years", value: "4,6" },
    { "label": "6 - 8 years", value: "6,8" },
    { "label": "8 - 10 years", value: "8,10" },
    { "label": "10 - 12 years", value: "10,12" },
    { "label": "12 - 14 years", value: "12,14" },
]

export const engagementFilterMaster = [
    {
        "label": "Onsite",
        "value": "Onsite"
    },
    {
        "label": "Hybrid",
        "value": "Hybrid"
    },
    {
        "label": "Remote",
        "value": "Remote"
    }
]

export const teamSizeFilterMaster = [
    { "label": "1 - 50 employees", value: "1,50" },
    { "label": "51 - 200 employees", value: "51,200" },
    { "label": "201 - 500 employees", value: "201,500" },
    { "label": "501 - 1000 employees", value: "501,1000" },
    { "label": "1001 - 5000 employees", value: "1001,5000" },
    { "label": "5000+ employees", value: "5000,999999" }
]

export const isObjectVoid = (obj) => {
    if (typeof obj !== 'object') {
        return false;
    }
    if (obj === null) {
        return true;
    }
    if (Object.keys(obj).length === 0) {
        return true;
    }

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            if (key === 'search') {
                continue;
            }
            if (!isObjectVoid(value)) {
                return false;
            }
        }
    }
    return true;
};


export const countAppliedFilters = (filters) => {
    let count = 0;

    for (const sectionKey in filters) {
        const section = filters[sectionKey];

        if (
            typeof section === "object" &&
            section !== null &&
            !Array.isArray(section)
        ) {
            for (const itemKey in section) {
                const item = section[itemKey];

                // Count booleans that are true (e.g., "2,4": true)
                if (typeof item === "boolean" && item === true) {
                    count++;
                }

                // Count non-empty objects (e.g., roles, skills, etc.)
                else if (
                    typeof item === "object" &&
                    item !== null &&
                    Object.keys(item).length > 0
                ) {
                    count++;
                }
            }
        }
    }

    return count;
}
