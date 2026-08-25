'use client';

import React, { useEffect } from 'react';
import { usePathname } from "next/navigation";
import mixpanel from 'mixpanel-browser';
import { v4 as uuidv4 } from 'uuid';
import getTitleFromLocation from './PageTitles';
import Cookies from "js-cookie";
import { filterUsedKeys, getApplicationSource, transformAndMergeObjects, transformObjectKeysWithPrefix } from '../components/Helper';

const isObjectEmpty = (obj) => {
    return Object.keys(obj).length == 0
}

// const env_check = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED;
const env_check = process.env.NEXT_PUBLIC_MIXPANEL_ENABLED;
const MIXPANEL_HARD_DISABLED = true;
const isMixpanelEnabled = () => env_check == 'true' && !MIXPANEL_HARD_DISABLED;

export const events = {
    PAGEVIEW: 'pageview',
    REGISTER: 'register',
    LOGIN: 'login',
    LOGOUT: 'logout'
}

export const trackOTPResend = ({ time_spent }) => {
    const trackingData = {
        extraParams: {
            time_spent
        }
    }
    trackAllCtaClickV2('Resend OTP CTA', trackingData)
}

export const trackProfileUpdate = ({ section, payload }) => {
    const trackingData = {
        extraParams: {
            section,
            payload
        }
    }
    trackAllCtaClickV2('Profile Update', trackingData)
}

export const checkMixpanelIdentity = () => {
    if (!isMixpanelEnabled()) {
        return false;
    }
    const distinctId = mixpanel.get_distinct_id();
    const isDeviceId = !distinctId.includes("@");
    if (isDeviceId) {
        return false;
    }
    return !!distinctId; // Returns true if distinct_id exists
};


export const setMixPanelSessionId = () => {
    if (localStorage.getItem('mixpanel_session_id') == null) {
        localStorage.setItem('mixpanel_session_id', uuidv4())
    }
}

const trackMixPanelPageView = (eventName = null, extraParams = null) => {
    // setMixPanelSessionId()
    const url = window.location.href
    const pathname = window.location.href
    const mixpanel_session_id = localStorage.getItem('mixpanel_session_id')
    const localUserStr = localStorage.getItem('user')
    const user = (localUserStr) ? JSON.parse(localUserStr) : null
    if (user != null && !isObjectEmpty(user)) {
        if (user.email && !isObjectEmpty(user)) {
            mixpanel.identify(user.email)
            // mixpanel.people.set(user)
        }
    }
    if (extraParams != null && eventName != null) {
        mixpanel.track(eventName, {
            url,
            pathname,
            mixpanel_session_id,
            user,
            ...extraParams
        });
    } else {
        if (isEnglishWord(eventName)) {
            mixpanel.track(eventName, {
                url,
                pathname,
                mixpanel_session_id,
                user
            });
        }
    }

}

const trackMixPanelPageViewV2 = (eventName = null, property = null) => {
    const localUserStr = localStorage.getItem('user')
    const user = (localUserStr) ? JSON.parse(localUserStr) : null
    if (property && property?.isIdentity && user != null && !isObjectEmpty(user)) {
        if (user.email && !isObjectEmpty(user)) {
            mixpanel.identify(user.email)
            // mixpanel.people.set(user)
        }
    }

    const source = property?.superProperty?.source || property?.extraParams?.source || getApplicationSource()
    const first_source = source

    // set source and first_source
    if (source) {
        mixpanel.register({
            source: source
        })
        mixpanel.register_once({
            first_source: first_source
        })

        if (user && user?.email) {
            mixpanel.people.set({
                source: source
            })
            mixpanel.people.set_once({
                first_source: first_source
            })
        }
    }

    // superProperty
    if (property && property?.superProperty) {
        mixpanel.register(property?.superProperty);
    }

    // unregister superProperty
    if (property && property?.unregister) {
        mixpanel.unregister(property?.unregister);
    }

    //inherit super Property
    if (property && property?.inheritSuperProperty) {
        mixpanel.register_once(property?.inheritSuperProperty);
    }

    if (property && property?.extraParams && eventName != null) {
        mixpanel.track(eventName, property?.extraParams);
    } else {
        mixpanel.track(eventName);
    }

}

export const trackAllOpportunitiesSearch = (searchText) => {
    const trackingData = {
        extraParams: {
            search_text: searchText
        }
    }
    trackAllCtaClickV2('All Opportunities Search', trackingData)
}
export const trackAllOpportunitiesSort = (filter) => {
    const trackingData = {
        extraParams: {
            filter: filter
        }
    }
    trackAllCtaClickV2('All Opportunities Sort', trackingData)
}
export const trackAllOpportunitiesFilter = (filter) => {
    const trackingData = {
        extraParams: {
            filter: filter
        }
    }
    trackAllCtaClickV2('All Opportunities Filter', trackingData)
}
export const trackAllOpportunitiesJDOpen = ({ detail, isOpen }) => {
    const trackingData = {
        extraParams: {
            ...detail,
            isOpen
        }
    }
    trackAllCtaClickV2('All Opportunities toggle View More', trackingData)
}
export const trackAllOpportunitiesClickApply = ({ detail }) => {
    const trackingData = {
        extraParams: {
            ...detail
        }
    }
    trackAllCtaClickV2('Apply CTA-(All opportunity)', trackingData)
}
export const trackMyOpportunitiesClickApply = ({ detail }) => {
    const trackingData = {
        extraParams: {
            ...detail
        }
    }
    trackAllCtaClickV2('My Opportunities click Save and Apply', trackingData)
}
export const trackMyOpportunitiesJDOpen = ({ detail, isOpen }) => {
    const trackingData = {
        extraParams: {
            ...detail,
            isOpen
        }
    }
    trackAllCtaClickV2('My Opportunities toggle View More', trackingData)
}
export const trackMyOpportunitiesClickTab = (active) => {
    const trackingData = {
        extraParams: {
            active
        }
    }
    trackAllCtaClickV2('My Opportunities click Tab', trackingData)
}
export const trackAllOpportunitiesStartTest = ({ detail }) => {
    const trackingData = {
        extraParams: {
            ...detail
        }
    }
    trackAllCtaClickV2('Take the test-popup-(All opportunity)', trackingData)
}
function getUser() {

    if (!user) {
        return null
    }
}

export const setRegisterId = (isNew = false) => {
    let registerId = localStorage.getItem('m_session_id')
    let mixpanel_session_id = uuidv4()
    if (registerId == null) {
        localStorage.setItem('m_session_id', mixpanel_session_id)
        return mixpanel_session_id
    } else {
        return registerId
    }
}

export const setNewApplicationId = (isNew = false, keyName = 'application_id') => {
    let applicationId = localStorage.getItem(keyName)
    let mixpanel_application_id = uuidv4()
    if (applicationId == null || isNew) {
        localStorage.setItem(keyName, mixpanel_application_id)
        return mixpanel_application_id
    } else {
        return applicationId
    }
}

export const checkPropertyExists = (property) => {
    if (!isMixpanelEnabled()) {
        return undefined;
    }
    return mixpanel.get_property(property)
}

const Mixpanel = () => {
    const pathname = usePathname()
    useEffect(() => {
        const localUserStr = localStorage.getItem('user')
        const user = (localUserStr) ? JSON.parse(localUserStr) : null
        if (isMixpanelEnabled()) {
            const isObjectEmpty = (obj) => {
                return Object.keys(obj).length == 0
            }
            if (!checkMixpanelIdentity()) {
                if (user && !isObjectEmpty(user)) {
                    mixpanel.identify(user.email)
                    // mixpanel.people.set(user)
                }
            }
        }
    }, [pathname])
    return (<></>)
}

export const trackPocEmailLink = ({ email }) => {
    const trackingData = {
        extraParams: {
            email
        }
    }
    trackAllCtaClickV2('POC-Email link-(Home)', trackingData)
}

export const trackTestimonialViewProfile = ({ url }) => {
    const trackingData = {
        extraParams: {
            url
        }
    }
    trackAllCtaClickV2('Testimonial- View Profile-(Home)', trackingData)
}

export const trackTestimonialReadMore = ({ isOpen }) => {
    const trackingData = {
        extraParams: {
            isOpen
        }
    }
    trackAllCtaClickV2('Testimonial- Read More-(Home)', trackingData)
}

export const trackTalentStoriesVideoOpen = ({ url, type, count }) => {
    const trackingData = {
        extraParams: {
            url, type, count
        }
    }
    trackAllCtaClickV2('Uplers Talent stories-video clicks-(Home)', trackingData)
}

export const trackClientStories = ({ url, type, count }) => {
    const trackingData = {
        extraParams: {
            url, type, count
        }
    }
    trackAllCtaClickV2('Uplers Client stories-video clicks-(Home)', trackingData)
}

export const trackMatcherWhatsapp = ({ data }) => {
    const trackingData = {
        extraParams: {
            ...data
        }
    }
    trackAllCtaClickV2('Matcher - Whatsapp Click', trackingData)
}

export const trackAllCtaClick = (eventName, extraParams = null) => {
    if (isMixpanelEnabled()) {
        trackMixPanelPageView(eventName, extraParams)
    } else {
        return true
    }
}

export const trackAllCtaClickV2 = (eventName, property = {}) => {

    const localUserStr = localStorage.getItem('user')
    const user = (localUserStr) ? JSON.parse(localUserStr) : null
    property = {
        ...property,
        extraParams: {
            ...property["extraParams"],
            build_version: process.env.NEXT_PUBLIC_BUILD_VERSION
        }
    }
    if (isMixpanelEnabled()) {
        if (user !== null) {
            property = {

                ...property,
                extraParams: {
                    ...property["extraParams"],
                    current_ctc: user?.current_ctc,
                    current_state: user?.state,
                    current_city: user?.city,
                    expected_ctc: user?.expected_ctc,
                    total_experience: user?.total_experience,
                    talent_job_title: user?.job_title,
                    is_product: user?.is_product,
                    product_company_count: user?.product_company_count,
                    notice_period: user?.joining_period,
                    job_function: user?.job_function,
                    resume_healthchecked: user?.resume_health?.resume_healthchecked,
                }
            }
        }
        trackMixPanelPageViewV2(eventName, property)
    } else {
        return true
    }
}

export const manualRegisterProperty = (property) => {
    if (isMixpanelEnabled()) {
        mixpanel.register(property);
    }
}

export const timeTrackEvent = (eventName) => {
    if (isMixpanelEnabled()) {
        mixpanel.time_event(eventName)
    }
}

export const identityReset = () => {
    // mixpanel.reset();
    Cookies.remove('mixpanel_session_id')
}

export const manuallyIdentitySet = (user) => {
    if (isMixpanelEnabled()) {
        mixpanel.identify(user.email)
        // mixpanel.people.set(user)
    }
};

function isEnglishWord(str) {
    // Remove any non-alphabetic characters and convert to lowercase
    const cleanedStr = str.replace(/[^A-Za-z]/g, "").toLowerCase();

    // Create a regex pattern to match English words
    const englishWordPattern = /^[A-Za-z]+$/;

    // Test if the cleaned string matches the pattern
    return englishWordPattern.test(cleanedStr);
}
export const mixpanelLoginClickTrack = (email, is_error, reason, method) => {
    let commaSeparatedValues = null
    if (reason != null) {
        const values = Object.values(reason);
        commaSeparatedValues = values.join(', ');
    }
    let trackingData = {
        extraParams: {
            email: email,
            error_or_success: is_error,
            error_reason: commaSeparatedValues,
            method: method
        }
    }
    trackAllCtaClickV2('log_in_clicked', trackingData)
}

export const mixpanelLoggedInTrack = (email, method) => {
    let trackingData = {
        extraParams: {
            email: email,
            method: method
        },
        superProperty: {
            email: email,
            method: method
        }
    }
    localStorage.setItem('new_loggedin', true)
    trackAllCtaClickV2('logged_in', trackingData)
}

export const checkAiMendatoryOrNot = (val) => {
    let checkMadatory = '';
    if (!val || val == 0) {
        checkMadatory = 'optional';
    } else if (val == 1) {
        checkMadatory = 'mandatory';
    } else if (val == 2) {
        checkMadatory = 'video_resume_mandatory';
    }
    return checkMadatory;
}

const hrTotalSkill = (skill) => {
    let totalSkill = skill?.length
    let skillLength = skill?.filter(skillObj => skillObj.skill.type === "must_have").length;
    return {
        'totalSkill': totalSkill,
        'skillLength': skillLength,
    }
}

export const atsHrStatuses = (id = null) => {
    const data = {
        0: 'Open',
        1: 'Active',
        2: 'Closed',
        3: 'Re-Open',
        4: 'Activating',
        5: 'Draft',
    };

    if (id === null) {
        return 'NA';
    } else {
        return data[id] || "";
    }
};

export const jobOpportunityPageLandTrack = (property = null, pageName = 'single-opportunities') => {
    const hrData = property?.hrData;
    const talentData = property?.talentData;
    let skills = hrTotalSkill(hrData?.skills)
    let trackingData = {
        extraParams: {
            number_of_skills: skills?.skillLength,
            total_skills: skills?.totalSkill,
            page: pageName,
            ...talentData,
            ...getHrDetails(hrData)
        },
    }
    trackAllCtaClickV2('job_opportunity_page_land', trackingData)
}

export const applyCtaForOpportunityClicked = (property = null) => {
    const hrData = property?.hrData;
    let skills = hrTotalSkill(hrData?.skills)
    let trackingData = {
        extraParams: {
            cta_clicked: property?.ctaName,
            is_sticky: property?.isSticky != null ? property?.isSticky : 'static',
            number_of_skills: skills?.skillLength,
            total_skills: skills?.totalSkill,
            application_id: setNewApplicationId(true),
            current_state: "NA",
            page: property?.page ?? 'single-opportunity',
            qdrant_score: hrData?.qdrant_score,
            relevancy_score: hrData?.relevancy_score,
            experience_score: hrData?.experience_score,
            location_score: hrData?.location_score,
            ...getHrDetails(hrData)
        }
    }

    trackAllCtaClickV2('apply_cta_for_opportunity_clicked', trackingData)
}

export const editCtaTrack = (property = null) => {
    let pageName = 'all-opportunities'
    const hrData = property?.hrData;
    if (property?.hrId) {
        pageName = 'single-opportunities'
    }
    let skills = hrTotalSkill(hrData?.skills)
    let trackingData = {
        extraParams: {
            application_id: setNewApplicationId(),
            page: pageName,
            number_of_skills: skills?.skillLength,
            total_skills: skills?.totalSkill,
            ...getHrDetails(hrData)
        },
    }
    if (hrData?.if_recommended) {
        trackingData.extraParams.if_recommended = hrData?.if_recommended;
    }
    trackAllCtaClickV2('edit_cta_clicked', trackingData)
}

export const videoResumeCtaClickTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length;
    let regApplyStep1 = JSON.parse(sessionStorage.getItem('regApplyStep1'))
    const hrData = property?.hrData;
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            video_resume_count: property?.count ? property?.count : 1,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            new_existing_user: regApplyStep1 ? 'new' : 'existing',
            ...getHrDetails(hrData)
        }

    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('video_resume_cta_click', trackData)
}

export const videoResumeStartUploadRecordingTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            video_resume_count: property?.count ? property?.count : 1,
            ...getHrDetails(property?.hrData)
        }

    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('video_resume_start_upload_recording', trackData)
}

export const videoSelectUploadTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            video_resume_count: property?.count ? property?.count : 1,
            ...getHrDetails(property?.hrData)
        }

    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('video_select_upload', trackData)
}

export const isVideoUploadedTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length
    let regApplyStep1 = JSON.parse(sessionStorage.getItem('regApplyStep1'))
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            video_type: property?.video_type,
            number_of_skills: totalSkill,
            retry: property?.retry,
            application_id: setNewApplicationId(),
            video_resume_count: property?.count ? property?.count : 1,
            new_existing_user: regApplyStep1 ? 'new' : 'existing',
            ...getHrDetails(property?.hrData)
        }

    }
    if (property.error_or_success) {
        trackData.extraParams.error_or_success = property.error_or_success
        if (property.error_or_success == 'error') {
            trackData.extraParams.error_reason = property.error_reason
        }
    }
    trackAllCtaClickV2('is_video_uploaded', trackData)
}

export const videoCompleteRestartRecordingTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            video_resume_count: property?.count ? property?.count : 1,
            ...getHrDetails(property?.hrData)
        }

    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('video_complete_restart_recording', trackData)
}

export const replaceAddNewVideoClickTrack = (property = null) => {
    let regApplyStep1 = JSON.parse(sessionStorage.getItem('regApplyStep1'))
    let totalSkill = property?.hrData?.skills?.length
    const trackData = {
        extraParams: {
            cta_clicked: property?.ctaVal,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            video_resume_count: property?.count ? property?.count : 1,
            source: getApplicationSource(),
            new_existing_user: regApplyStep1 ? 'new' : 'existing',
            ...getHrDetails(property?.hrData)
        }

    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('replace_add_new_video_click', trackData)
}

export const videoResumeToggleTrack = (property = null) => {
    let totalSkill = property?.hrData?.skills?.length
    const trackData = {
        extraParams: {
            visible: property?.visible,
            number_of_skills: totalSkill,
            application_id: setNewApplicationId(),
            ...getHrDetails(property?.hrData)
        }
    }
    if (property?.hrData?.if_recommended) {
        trackData.extraParams.if_recommended = property?.hrData?.if_recommended;
    }
    trackAllCtaClickV2('video_resume_toggle', trackData)
}


export const pageTimeTracking = (url, pageName, user, hrData = null) => {
    const trackingData = {
        extraParams: {
            url_contains: url,
            page_name: pageName,
            name: user?.name,
            email: user?.email,
            source: getApplicationSource(),
            time_in_second: 10,
            ...getHrDetails(hrData)
        }
    }

    trackAllCtaClickV2('page_time_spent', trackingData)
}

// Signup Applyflow tracking start
export const trackSignupApplyFlow = (eventName, property = null, superProps, profile) => {
    const { hrData, ...rest } = property;
    let trackingData = {
        extraParams: {
            ...rest,
            page: window.location.pathname.split('/talent/all-opportunities')?.[1] ? 'single-opportunity' : 'all-opportunities',
            ...getHrDetails(hrData)
        }
    }
    if (superProps) {
        trackingData.superProperty = {
            ...superProps
        }
    }
    if (profile) {
        trackingData.isIdentity = true
    }
    trackAllCtaClickV2(eventName, trackingData)
}

export const talentBookMarkTrack = (property = null, type, fromWhere = 'all-opportunities') => {
    const trackData = {
        extraParams: {
            job_id: property?.HR_Number,
            source: getApplicationSource(),
            AI_optional_or_mandatory: checkAiMendatoryOrNot(property?.ai_mandatory),
            publish_date: property?.hrData?.publish_datetime_ats,
            from_where: fromWhere,
            type: type,
            job_status: atsHrStatuses(property?.hrData?.status),
            hr_status: property?.hrData?.HR_Status,
            aggregator: property?.hrData?.aggregator,
            is_aggregator_job: property?.hrData?.is_aggregator_job,
            job_nature: property?.hrData?.job_nature,
        }
    }
    trackAllCtaClickV2('talent_bookmark_clicked', trackData)
}


export const publicOppoVisitTrack = (hrData) => {
    let trackingData = {
        extraParams: {
            ...getHrDetails(hrData)
        },
    }

    if (checkPropertyExists('is_new_user') == undefined) {
        trackingData.superProperty = {
            is_new_user: true
        }
    }
    trackAllCtaClickV2('public_opportunities_page_visit', trackingData)
}


export const publicOppoApplyCtaTrack = (hrData) => {
    let trackingData = {
        extraParams: {
            ...getHrDetails(hrData)
        },
    }
    trackAllCtaClickV2('public_opportunities_apply_cta', trackingData)
}


export const startVideoScreeningCtaTrack = (trackData) => {
    trackAllCtaClickV2('start_video_screening_cta_clicked', trackData)
}


export const exploreOtherOppoCtaTrack = (hrData) => {
    let trackingData = {
        extraParams: {
            ...getHrDetails(hrData)
        },
    }
    trackAllCtaClickV2('explore_other_opportunites_cta', trackingData)
}


export const managePreferencesCtaTrack = (fromWhere) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere
        }
    }
    trackAllCtaClickV2('manage_preferences_cta', trackingData)
}

export const savePreferencesCtaTrack = (data, fromWhere, ctaName) => {

    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            resume: data?.resume,
            availability: data?.availability,
            form_total_experience: data?.total_experience,
            form_current_ctc: data?.current_ctc,
            current_location: data?.current_location?.label,
            form_expected_ctc: data?.expected_ctc,
            job_title: data?.job_title,
            joining_period: data?.joining_period,
            last_working_day: data?.last_working_day,
            monthly_salary: data?.monthly_salary,
            preferred_method: data?.preferred_method?.join(','),
            serving_notice_period: data?.serving_notice_period,
            from_where: fromWhere,
            cta_clicked: ctaName,
            job_function_id: data?.job_function_id,
            job_function: data?.job_function,
            ctc_breakdown: data?.ctc_breakdown,
            preferred_cities: data?.preferred_cities?.map(item => item.label).join(' or '),
            ...(data?.preferred_modes?.length > 0 && { preferred_modes: data?.preferred_modes?.map(item => item.label).join(', ') })
        }
    }
    trackAllCtaClickV2('save_preferences_cta', trackingData)
}

export const skipPreferencesModalTrack = (data) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            cta_clicked: "Skip",
            ...data
        }
    }
    trackAllCtaClickV2('skip_preferences_modal', trackingData)
}
export const viewMoreDetailsAllJobPageTracking = (data, page, fromWhere = 'cta') => {

    let trackingData = {
        extraParams: {
            page: page,
            from_where: fromWhere,
            ...getHrDetails(data)
        }
    }
    trackAllCtaClickV2('view_more_details_all_job', trackingData)

}

export const extentiopPopupTracking = (data, ctaName) => {

    let trackingData = {
        extraParams: {
            cta_clicked: ctaName,
            ...getHrDetails(data)
        }
    }
    trackAllCtaClickV2('extention_popup_tracking', trackingData)

}

export const confirmAppliedTracking = (data, ctaName) => {

    let trackingData = {
        extraParams: {
            cta_clicked: ctaName,
            ...getHrDetails(data)
        }
    }
    trackAllCtaClickV2('confirm_applied_cta', trackingData)

}

export const getHrDetails = (hrData) => {
    return {
        job_id: hrData?.HR_Number,
        source: getApplicationSource(),
        job_metadata: hrData?.HR_Role,
        AI_optional_or_mandatory: checkAiMendatoryOrNot(hrData?.ai_mandatory),
        if_recommended: hrData?.if_recommended,
        publish_date: hrData?.publish_datetime_ats,
        job_status: atsHrStatuses(hrData?.status),
        hr_status: hrData?.HR_Status,
        aggregator: hrData?.aggregator,
        is_aggregator_job: hrData?.is_aggregator_job,
        job_nature: hrData?.job_nature,
        subsource: hrData?.RequestForTalent,
        sub_source: hrData?.HR_Number,
        hr_mode_of_work: hrData?.ModeOfWork,
        hr_city: hrData?.city,
        current_job_title: hrData?.RequestForTalent,
        hr_yoe: hrData?.YearOfExp,
        is_applied: hrData?.is_applied,
        ai_needed: hrData?.ai_needed,
        screening_status: hrData?.screening_status,
        custom_screening_needed: hrData?.custom_screening_needed,
        job_not_interested: hrData?.job_not_interested,
        job_closed: isJobClosed(hrData),
        qdrant_score: hrData?.qdrant_score,
        relevancy_score: hrData?.relevancy_score,
        experience_score: hrData?.experience_score,
        location_score: hrData?.location_score,
    }
}

const isJobClosed = (hrData) => {
    return (hrData && (hrData.status == 0 || hrData.status == 2 || hrData.status == 3 || hrData.HR_Status == 'Lost' || hrData.HR_Status == 'Cancelled' ||
        hrData.HR_Status == 'Completed' || hrData.HR_Status == 'Paused' || hrData.HR_Status == 'Won' || hrData.HR_Status == 'Expired')) ? "Yes" : "No"
}

export const productEngineeringCtaTracking = (fromWhere) => {

    let trackingData = {
        extraParams: {
            from_where: fromWhere
        }
    }
    trackAllCtaClickV2('showcase_product_engineering_cta_click', trackingData)
}

export const productEngineeringTabTracking = (currentTab, previousTab) => {

    let trackingData = {
        extraParams: {
            current_tab: currentTab,
            previous_tab: previousTab,
        }
    }
    trackAllCtaClickV2('product_engineering_tab', trackingData)
}


export const addProductEngineeringTracking = (currentTab, data, ctaName) => {
    let trackingData = {
        extraParams: {
            current_tab: currentTab,
            cta_name: ctaName,
            ...data
        }
    }
    trackAllCtaClickV2('add_product_engineering', trackingData)
}

export const viewAllJobsClickedTracking = () => {
    trackAllCtaClickV2('view_all_jobs_clicked', {})
}

export const viewJobClickedTracking = (
    jobDetails,
    currentHrDetails,
    position = 0
) => {
    const jobId = jobDetails?.link?.split("/").pop();
    let trackingData = {
        extraParams: {
            job_id: jobId,
            location: jobDetails?.location,
            hr_yoe: jobDetails?.experience,
            hr_mode_of_work: jobDetails?.ModeOfWork,
            current_job_title: currentHrDetails?.RequestForTalent,
            matching_job_title: null,
            similar_job_title: jobDetails?.title,
            link: jobDetails?.link,
            hr_city: jobDetails?.city,
            hr_company: jobDetails?.company,
            job_nature: jobDetails?.job_nature,
            card_posiotion: position
        },
    };
    trackAllCtaClickV2("view_job_clicked", trackingData);
};

export const filterUsedTracking = (prefilters, filters, allOppMasterValue, fromWhere = 'allOpportunities') => {
    let filterTrackingData = transformAndMergeObjects(prefilters, filters, allOppMasterValue)

    if (filterTrackingData?.filter_used && (filterTrackingData?.filter_used != 'search' && filterTrackingData[filterTrackingData?.filter_used] !== "")) {
        let trackingData = {
            extraParams: { ...filterTrackingData, from_where: fromWhere }
        }
        trackAllCtaClickV2('talent_filter_used', trackingData)
    } else {
        return true;
    }
}

export const actionProductEngineeringTracking = (currentTab, ctaName) => {
    let trackingData = {
        extraParams: {
            current_tab: currentTab,
            cta_name: ctaName,
        }
    }
    trackAllCtaClickV2('action_product_engineering', trackingData)
}

export const saveLinkedinAgg = (hrData, linkedinUrl, error_or_success, errors = null, fromWhere = 'singleHr') => {
    let trackingData = {
        extraParams: {
            from_where: fromWhere,
            ...getHrDetails(hrData),
            error_or_success: error_or_success,
            errors: errors,
            linkedin_id: linkedinUrl
        },
    }
    trackAllCtaClickV2('save_linkedin_agg', trackingData)
}

export const homePageCTAActionTracking = (ctaName, fromWhere, hrData = null) => {
    let trackingData = {
        extraParams: {
            from_where: fromWhere,
            cta_name: ctaName,
            ...getHrDetails(hrData),
        },
    }
    trackAllCtaClickV2('home_page_cta_action', trackingData)
}

export const singleHrActionTracking = (ctaName, fromWhere, hrData = null) => {
    let trackingData = {
        extraParams: {
            from_where: fromWhere,
            cta_name: ctaName,
            ...getHrDetails(hrData),
        },
    }
    trackAllCtaClickV2('single_hr_top_matching_job_action', trackingData)
}

export const talentRelevancyTracking = (hrData, position = 1, prefilters = {}, filters = {}, allOppMasterValue = {}, fromWhere = 'cta', section = 'all-opportunities-main', similarJobDetails = false) => {

    let trackingData = {
        extraParams: {
            position: position,
            section: section,
            fromWhere: fromWhere,
            ...getHrDetails(hrData)
        },
    };

    // If similarJobDetails is available, exclude filterTrackingData
    if (similarJobDetails && typeof similarJobDetails === 'object') {
        const jobId = similarJobDetails?.link?.split("/").pop();
        trackingData.extraParams = {
            ...trackingData.extraParams,
            job_id: jobId,
            current_job_id: hrData?.HR_Number,
            similar_location: similarJobDetails.location,
            similar_hr_yoe: similarJobDetails.experience,
            similar_hr_mode_of_work: similarJobDetails.ModeOfWork,
            matching_job_title: null,
            similar_job_title: similarJobDetails.title,
            similar_link: similarJobDetails.link,
            similar_hr_city: similarJobDetails.city,
            similar_hr_company: similarJobDetails.company,
            similar_job_nature: similarJobDetails.job_nature,
        };
    } else {
        let filterTrackingData = transformAndMergeObjects(prefilters, filters, allOppMasterValue)
        if (filterTrackingData['filter_used']) {
            filterTrackingData['filter_used'] = filterUsedKeys(filters);
        }
        // If similarJobDetails is not present, include filterTrackingData
        trackingData.extraParams = {
            ...trackingData.extraParams,
            ...filterTrackingData,
        };
    }
    trackAllCtaClickV2('talent_relevancy_tracking', trackingData)
}

export const allOppoPageLoaded = (isFilter = 'false', filters = null, allOppMasterValue = null) => {
    let filterTrackingData = {};
    if (filters && Object.keys(filters).length > 0 && allOppMasterValue) {
        filterTrackingData = transformAndMergeObjects({}, filters, allOppMasterValue)
    }
    const { filter_used = null, ...restFilterData } = filterTrackingData;
    let trackingData = {
        extraParams: {
            'is_filter': isFilter,
            'fliter': restFilterData,
            'filter_used': filter_used
        },
    }
    trackAllCtaClickV2('All Opportunity Page Loaded', trackingData)
}

export const updateMixpanelUserDetails = (is_check = false) => {
    if (!isMixpanelEnabled()) {
        return true
    }
    if (is_check == true) {
        const currentDate = new Date().toISOString().split('T')[0];
        const lastMixpanleUpdateDate = localStorage.getItem('lm_update');
        if (lastMixpanleUpdateDate && lastMixpanleUpdateDate == currentDate) {
            return true
        }
        localStorage.setItem('lm_update', currentDate)
    }
    const localUserStr = localStorage.getItem('user')
    const user = (localUserStr) ? JSON.parse(localUserStr) : null
    if (user != null && !isObjectEmpty(user)) {
        if (user.email && !isObjectEmpty(user)) {
            mixpanel.identify(user.email)
            // mixpanel.people.set(user)
        }
    }
}

export const talentPacketAction = (action = '') => {
    let trackingData = {
        extraParams: {
            action: action
        }
    }
    trackAllCtaClickV2("talent_packet_action", trackingData)
}

export const pageVisitLoadAndCtaTrack = (eventName) => {
    trackAllCtaClickV2(eventName)
}

export const jobNotInterestedTrack = (trackObj, hrData, filters, allOppMasterValue) => {
    let { filterData, filterUsed } = filters && Object.keys(filters).length > 0
        ? transformObjectKeysWithPrefix(filters, allOppMasterValue, 'filter')
        : {};
    const is_filter = filterUsed && Object.keys(filterData).length > 0 ? true : false

    let trackingData = {
        extraParams: {
            is_filter,
            ...trackObj,
            ...(filterData || {}),
            ...(filterUsed && { filter_used: filterUsed }),
            ...getHrDetails(hrData),
        }
    }
    trackAllCtaClickV2("job_not_interested_action", trackingData)
}

export const resumeReviewAction = (cta_name = '', ABTesting = 'odd') => {
    let trackingData = {
        extraParams: {
            cta_name: cta_name,
            ABTesting: ABTesting,
        }
    }
    trackAllCtaClickV2("resume_review_action", trackingData)
}

export const submitResumeReviewAction = (cta_name = '', file_name = '', ABTesting = 'odd') => {
    let trackingData = {
        extraParams: {
            cta_name: cta_name,
            file_name: file_name,
            ABTesting: ABTesting,
        }
    }
    trackAllCtaClickV2("submit_upload_resume_review", trackingData)
}

export const selectedResumeFileTrack = (file_name = '', ABTesting = 'odd') => {
    let trackingData = {
        extraParams: {
            file_name: file_name,
            ABTesting: ABTesting,
        }
    }
    trackAllCtaClickV2("selected_resume_file", trackingData)
}


export const openUploadResumeModalTracking = (ABTesting = 'odd') => {
    let trackingData = {
        extraParams: {
            ABTesting: ABTesting,
        }
    }
    trackAllCtaClickV2("open_resume_upload_modal", trackingData)
}

export const resumeReviewTransactionStatusTracking = (amount, status, ABTesting = 'odd', source = "RazorPay") => {
    let trackingData = {
        extraParams: {
            amount: amount,
            status: status,
            source: source,
            ABTesting: ABTesting
        }
    }
    trackAllCtaClickV2('transaction_status', trackingData)
}

export const resumeHealthCheckPagerVisitTracking = (fromWhere = "self") => {
    let trackingData = {
        extraParams: {
            from_where: fromWhere,
            source: getApplicationSource(),

        }
    }
    trackAllCtaClickV2('Health Check Page VIsit', trackingData)
}

export const resumeViewResumeTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name
        }
    }
    trackAllCtaClickV2('View Resume', trackingData)
}

export const resumeYoullGetCTAClickedTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('See What Youll Get CTA Clicked', trackingData)
}

export const resumeUploadedTracking = (file_name = '', ctaName = 'upload_resume', fromWhere = 'landing_page') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from_where: fromWhere, // landing_page, results_page
            cta_name: ctaName,  //upload_new_resume, upload_replace_resume, upload_resume
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Resume Uploaded', trackingData)
}

export const resumeHealthCheckInitiatedTracking = (file_name = '', auto_health_checked = false) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            auto_health_checked: auto_health_checked,
        }
    }
    trackAllCtaClickV2('resume_health_check_initiated', trackingData)
}

export const resumeHealthReportGeneratedTracking = (health_check_id = '', resume_score = null) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            health_check_id: health_check_id,
            resume_score: resume_score,
        }
    }
    trackAllCtaClickV2('resume_health_report_generated', trackingData)
}

export const resumeResultPageVisitTracking = (fromWhere = 'landing_page') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere,
        }
    }
    trackAllCtaClickV2('resume_health_report_page_visit', trackingData)
}


export const resumeDashboardPageVisitTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('resume_dashboard_page_visit', trackingData)
}

export const transformResumeClickTracking = (health_check_id = '', cta_of_section = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            health_check_id: health_check_id,
            cta_of_section: cta_of_section,
        }
    }
    trackAllCtaClickV2('transform_resume_click', trackingData)
}
export const viewWeaknessDetailsClickTracking = (section = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            section: section,
        }
    }
    trackAllCtaClickV2('view_weakness_details_click', trackingData)
}

export const resumePaymentPageVisitTracking = (fromWhere = '', odd_or_even = 'odd') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere,
            odd_or_even: odd_or_even,
        }
    }
    trackAllCtaClickV2('resume_payment_page_visit', trackingData)
}


export const resumePaymentEngagementTracking = (event_name = 'payment_slide_changed', misc = {}) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            event_name: event_name,
            ...misc,
        }
    }
    trackAllCtaClickV2(event_name, trackingData)
}

export const resumeTransformClickTracking = (health_check_id = '', is_tailored = false, odd_or_even = 'even') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            health_check_id: health_check_id,
            is_tailored: is_tailored,
            odd_or_even: odd_or_even,
        }
    }
    trackAllCtaClickV2('resume_payment_transform_clicked', trackingData)
}

export const resumePaymentTailoredVisibleTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('resume_payment_tailored_visible', trackingData)
}

export const resumeTransformCancelledTracking = (data) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...data,
        }
    }
    trackAllCtaClickV2('resume_payment_transform_cancelled', trackingData)
}


export const resumeTransformPaidTracking = (data, odd_or_even = 'odd') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...data,
            odd_or_even: odd_or_even,
        }
    }
    trackAllCtaClickV2('resume_payment_transform_paid', trackingData)
}


export const resumeTemplateSelectedTracking = (template_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            template_name: template_name,
        }
    }
    trackAllCtaClickV2('resume_template_selected', trackingData)
}

export const resumeHealthReportDownloadedTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Download Health Report', trackingData)
}

export const resumeHealthReportViewedTracking = (file_name = '', fromWhere = 'results_page') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from_where: fromWhere //pop_up, results_page
        }
    }
    trackAllCtaClickV2('View Transformed Resume', trackingData)
}

export const resumeTransformMyResumeTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
        }
    }
    trackAllCtaClickV2('Transform My Resume', trackingData)
}


export const resumeTransformMyResumeCloseTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Transforming_your_resume_closed', trackingData)
}

export const resumeScoreMeansCTATracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Score Means CTA', trackingData)
}

export const resumeSectionMeasuresCTATracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Section Measures CTA', trackingData)
}

export const resumeTransformReadyResumeCloseTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Transformed_resume_ready_closed', trackingData)
}

export const resumeBannerClickTracking = (banner_event_name = "top_resume_banner_clicked", fix_resume = false) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            fix_resume: fix_resume
        }
    }
    trackAllCtaClickV2(banner_event_name, trackingData)
}


export const resumeBannerVisibleTracking = (banner_event_name = "top_resume_banner_visible", fix_resume = false) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            fix_resume: fix_resume
        }
    }
    trackAllCtaClickV2(banner_event_name, trackingData)
}

export const resumeNavbarCTAClickTracking = (redirectToHealthCheck = false, fix_resume = false) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            redirect_to_health_check: redirectToHealthCheck,
            fix_resume: fix_resume
        }
    }
    trackAllCtaClickV2("resume_navbar_cta_clicked", trackingData)
}


export const resumeReplacedInProfileTracking = (fromWhere = 'preferences_page') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere,
        }
    }
    trackAllCtaClickV2("resume_replaced_in_profile", trackingData)
}
export const saveAndAnalyzeResumeTracking = (fromWhere = 'preferences_page') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere,
        }
    }
    trackAllCtaClickV2("save_and_analyze_resume", trackingData)
}

export const resumePostApplyModalTracking = (event_name = "post_apply_resume_modal_visible", fix_resume = false) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            fix_resume: fix_resume,
        }
    }
    trackAllCtaClickV2(event_name, trackingData)
}

export const resumeHealthReportUpdatedTracking = (file_name = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            file_name: file_name,
            from: checkResumeCheckDate()
        }
    }
    trackAllCtaClickV2('Update Resume in Profile', trackingData)
}

const checkResumeCheckDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const storedDate = sessionStorage.getItem('r_c_date');
    let comingFromLandingPage = 'No';
    if (storedDate === today) {
        comingFromLandingPage = 'Yes';
    }
    return comingFromLandingPage;
}



export const resumeLandingPageVisitTracking = (fromWhere = 'navbar') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            from_where: fromWhere,
        }
    }
    trackAllCtaClickV2('resume_landing_page_visit', trackingData)
}

export const weekendOfferVisibleTracking = (pricing) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            pricing: pricing,
        }
    }
    trackAllCtaClickV2('weekend_offer_visible', trackingData)
}
export const weekendOfferClickedTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('weekend_offer_clicked', trackingData)
}


export const healthcheckPromoteModalVisibleTracking = (modal_type = '') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            modal_type: modal_type,
        }
    }
    trackAllCtaClickV2('healthcheck_promote_modal_visible', trackingData)
}
export const healthcheckPromoteModalClickedTracking = (modal_type = '', popup_or_drawer = 'Popup') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            modal_type: modal_type,
            popup_or_drawer: popup_or_drawer,
        }
    }
    trackAllCtaClickV2('healthcheck_promote_modal_clicked', trackingData)
}

export const healthcheckPromoteAggModalVisibleTracking = (isTransformModal, resumeFlag = null) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            isTransformModal: isTransformModal,
            ...(resumeFlag && { resume_flag: resumeFlag }),
        }
    }
    trackAllCtaClickV2('healthcheck_promote_agg_modal_visible', trackingData)
}
export const healthcheckPromoteAggModalClickedTracking = (isTransformModal, resumeFlag = null) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            isTransformModal: isTransformModal,
            ...(resumeFlag && { resume_flag: resumeFlag }),
        }
    }
    trackAllCtaClickV2('healthcheck_promote_agg_modal_clicked', trackingData)
}


export const fixResumePromoteModalVisibleTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('fix_resume_promote_modal_visible', trackingData)
}
export const fixResumePromoteModalClickedTracking = (cta_position = 'top') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            cta_position: cta_position,
        }
    }
    trackAllCtaClickV2('fix_resume_promote_modal_clicked', trackingData)
}


export const jobDetailsResumePromoVisibleTracking = (banner_type = "Health Check", content_type = 'Default') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            banner_type,
            content_type
        }
    }
    trackAllCtaClickV2('job_details_resume_promo_visible', trackingData)
}
export const jobDetailsResumePromoClickedTracking = (banner_type = "Health Check", content_type = 'Default') => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            banner_type,
            content_type
        }
    }
    trackAllCtaClickV2('job_details_resume_promo_clicked', trackingData)
}


export const applyHoverResumePromoVisibleTracking = (banner_type = "Health Check") => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            banner_type
        }
    }
    trackAllCtaClickV2('apply_hover_resume_promo_visible', trackingData)
}
export const applyHoverResumePromoClickedTracking = (banner_type = "Health Check") => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            banner_type
        }
    }
    trackAllCtaClickV2('apply_hover_resume_promo_clicked', trackingData)
}


export const networkErrorTracking = (data) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...data,
        }
    }
    trackAllCtaClickV2('network_error_triggered', trackingData)
}


export const networkErrorReloadTracking = (data) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...data,
        }
    }
    trackAllCtaClickV2('reload_after_network_error', trackingData)
}


export const manualReloadTracking = () => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
        }
    }
    trackAllCtaClickV2('manual_reload', trackingData)
}

export const careerCoachPageVisitTracking = (extraParams) => {
    let trackingData = {
        extraParams: {
            cc_user_id: extraParams?.user_id || '',
            cc_enc_id: extraParams?.enc_id || null,
            cc_new_user: extraParams?.is_new_user || false,
        }
    }
    trackAllCtaClickV2('career_coach_page_visit', trackingData)
}

export const careerCoachNewUserTracking = (extraParams) => {
    let trackingData = {
        extraParams: {
            cc_user_id: extraParams?.cc_user_id || '',
            cc_enc_id: extraParams?.enc_id || null,
            error_or_success: extraParams?.error_or_success || '',
            error_reason: extraParams?.error_reason,
        }
    }
    trackAllCtaClickV2('career_coach_new_user_tracking', trackingData)
}

export const careerCoachMessageSentTracking = (extraParams) => {
    let trackingData = {
        extraParams: {
            cc_user_id: extraParams?.cc_user_id || '',
            chat_id: extraParams?.chat_id || '',
            message: extraParams?.message || '',
            new_chat: extraParams?.new_chat || false,
            error_or_success: extraParams?.error_or_success || '',
            error_reason: extraParams?.error_reason,
        }
    }
    trackAllCtaClickV2('career_coach_message_sent', trackingData)
}

export const careerCoachResumeUploadTracking = (extraParams) => {
    let trackingData = {
        extraParams: {
            cc_user_id: extraParams?.cc_user_id || '',
            resume: extraParams?.resume || '',
            cta_name: extraParams?.cta_name || 'upload_resume',
            error_or_success: extraParams?.error_or_success || '',
            error_reason: extraParams?.error_reason,
        }
    }
    trackAllCtaClickV2('career_coach_resume_upload', trackingData)
}

export const careerCoachMsgResponseTracking = () => {
    trackAllCtaClickV2('career_coach_msg_response_time')
}


export const resumeReelsTracking = (eventObj) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...eventObj
        }
    }
    trackAllCtaClickV2('resume_reels_interacted', trackingData)
}


export const floatingReelsTracking = (eventObj) => {
    let trackingData = {
        extraParams: {
            source: getApplicationSource(),
            ...eventObj
        }
    }
    trackAllCtaClickV2('floating_reels_interacted', trackingData)
}

export const estimatedSalaryOptionAvailableTracking = (hrData) => {
    let trackingData = {
        extraParams: {
            company_name: hrData?.company?.company_name || '',
            ...getHrDetails(hrData)
        }
    }
    trackAllCtaClickV2('estimated_salary_option_available', trackingData)
}

export const estimatedSalaryDataFetchedTracking = (hrData, salaryData, errorOrSuccess, errorReason = null) => {
    let trackingData = {
        extraParams: {
            error_or_success: errorOrSuccess,
            company_name: hrData?.company?.company_name || '',
            ...getHrDetails(hrData)
        }
    }

    if (errorOrSuccess === 'success' && salaryData) {
        trackingData.extraParams.has_salary_data = salaryData?.has_salary_data || false;
        trackingData.extraParams.company_salary_range = salaryData?.company_salary_range || '';
    }

    if (errorOrSuccess === 'error' && errorReason) {
        trackingData.extraParams.error_reason = errorReason;
    }

    trackAllCtaClickV2('estimated_salary_data_fetched', trackingData)
}

export const salaryEstimationClickedTracking = (hrData, salaryData) => {
    let trackingData = {
        extraParams: {
            has_salary_data: salaryData?.has_salary_data || false,
            company_salary_range: salaryData?.company_salary_range || '',
            company_name: hrData?.company?.company_name || '',
            ...getHrDetails(hrData)
        }
    }
    trackAllCtaClickV2('salary_estimation_clicked', trackingData)
}

export const salaryEstimationFeedbackGivenTracking = (hrData, salaryData, feedbackValue) => {
    let trackingData = {
        extraParams: {
            feedback_type: feedbackValue === 1 ? 'positive' : 'negative',
            has_salary_data: salaryData?.has_salary_data || false,
            company_salary_range: salaryData?.company_salary_range || '',
            company_name: hrData?.company?.company_name || '',
            ...getHrDetails(hrData)
        }
    }
    trackAllCtaClickV2('salary_estimation_feedback_given', trackingData)
}



export const trackTailorPreviewClicked = (sectionId, isBullet = false) => {
    let trackingData = {
        extraParams: {
            section_id: sectionId,
            is_bullet: isBullet,
        }
    }
    trackAllCtaClickV2('tailor_preview_clicked', trackingData)
}

export default Mixpanel;
