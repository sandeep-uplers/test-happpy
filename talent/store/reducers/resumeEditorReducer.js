'use client';

import { REMOVE_EDITOR_SECTION, RESET_TAILOR_FOR_NEW_JOB, RESET_TRANSFORMED_RESUME_MODAL, SEED_TAILOR, SEED_TRANSFORMED_RESUME, SET_CONFIG_JSON, SET_EXPANDED_SECTION, SET_REPORT_JSON, SET_SELECTED_RESUME, SET_SORTING_JSON, SET_TAILOR_DASHBOARD_RESUME, SET_TAILOR_JSON, SET_TAILOR_MODAL_OPEN, SET_TAILOR_RESUME_DOWNLOADED, SET_TRANSFORMED_RESUME_MODAL_OPEN } from '../actions/actionsTypes';

const initialState = {
    tailor_to_job_modal: false,
    generic_sections: ["interests", "hobbies", "activities", "communication_languages"],
    expanded_section: '',
    tailor_json: {},
    config_json: {
        template_id: 1,
        font_style: "Arial",
        font_size: {
            main_heading: 20,
            section_heading: 13,
            subheader: 12,
            body: 11,
        },
        spacing: {
            section_spacing: 2,
            item_spacing: 5,
            line_spacing: 12,
            top_bottom_margin: 26,
            side_margin: 36
        },
        theme_color: "#0070c0"
    },
    sorting_json: [],
    report_json: {},
    matching_json: {},
    resume_list: {},
    active_job: {
        job_title: '',
        company: {
            company_name: '',
            company_name_initials: '',
            company_logo: ''
        }
    },
    selected_resume: null,
    tailor_dashboard_resume: {},
    is_external_jd: false,
    jd_tailor_resume_id: false,
    inputs: {},
    is_already_tailored: false,
    last_tailored_for_hr: '',
    /** TempHr id when tailoring from Job Agent “run jobs” list (onboard rows); cleared when modal opens without it. */
    external_temp_hr_id: null,
    ready_jd: null,
    outreach_hr_id: null,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_TRANSFORMED_RESUME_MODAL_OPEN:
            return {
                ...state,
                transformation_id: action.payload?.transformation_id,
                tailor_to_job_modal: false,
                jd_tailor_resume_id: false,
                is_external_jd: false,
                is_already_tailored: false,
                partner_job_tailor: false,
                resume_just_updated: false,
                last_tailored_for_hr: '',
                run_referral_agent: false,
                external_temp_hr_id: null,
                ready_jd: null,
            }
        case RESET_TRANSFORMED_RESUME_MODAL:
            return {
                ...state,
                transformation_id: null,
            }

        case SEED_TRANSFORMED_RESUME:
            return {
                ...state,
                ...action.payload,
            }
        case SET_TAILOR_MODAL_OPEN:
            return {
                ...state,
                tailor_to_job_modal: action.payload.hr_enc_id,
                last_tailored_for_hr: action.payload.hr_enc_id || state.last_tailored_for_hr || '',
                active_job: action.payload.active_job || {},
                is_external_jd: action.payload?.is_external_jd || false,
                jd_tailor_resume_id: action.payload?.jd_tailor_resume_id || false,
                partner_job_tailor: action.payload?.partner_job_tailor || false,
                resume_just_updated: action.payload?.resume_just_updated || false,
                is_already_tailored: action.payload?.is_already_tailored || false,
                run_referral_agent: action.payload?.run_referral_agent || false,
                external_temp_hr_id: action.payload?.external_temp_hr_id ?? null,
                ready_jd: action.payload?.ready_jd || null,
                outreach_hr_id: action.payload?.outreach_hr_id || null,
            }
        case RESET_TAILOR_FOR_NEW_JOB:
            return {
                ...state,
                matching_json: {},
                resume_list: {},
                is_external_jd: false,
                jd_tailor_resume_id: action.payload?.jd_tailor_resume_id || false,
                tailor_to_job_modal: action.payload?.tailor_to_job_modal || false,
                is_already_tailored: action.payload?.is_already_tailored || false,
                partner_job_tailor: false,
                resume_just_updated: false,
                inputs: {},
                external_temp_hr_id: null,
                ready_jd: null,
            }
        case SEED_TAILOR:
            return {
                ...state,
                // status: 3, //having some value everytime we seed the tailor. need to be done from api response on successful tailor generation
                ...action.payload
            }
        case SET_TAILOR_RESUME_DOWNLOADED:
            return {
                ...state,
                pdf_download_at: action.payload
            }
        case SET_TAILOR_JSON:
            return {
                ...state,
                tailor_json: { ...action.payload }
            }

        case SET_CONFIG_JSON:
            return {
                ...state,
                config_json: { ...action.payload }
            }

        case SET_SORTING_JSON:
            return {
                ...state,
                sorting_json: [...action.payload]
            }

        case REMOVE_EDITOR_SECTION:
            let newSectionsOrder = [...state.sorting_json];
            newSectionsOrder.forEach(s => {
                if (s.key === action.payload) {
                    s.show = false;
                }
            });
            return {
                ...state,
                sorting_json: [...newSectionsOrder]
            }

        case SET_REPORT_JSON:
            return {
                ...state,
                report_json: { ...action.payload }
            }
        case SET_EXPANDED_SECTION:
            return {
                ...state,
                expanded_section: action.payload
            }

        case SET_TAILOR_DASHBOARD_RESUME:
            return {
                ...state,
                tailor_dashboard_resume: action.payload
            }

        case SET_SELECTED_RESUME:
            return {
                ...state,
                selected_resume: action.payload
            }

        default:
            return state;
    }
}