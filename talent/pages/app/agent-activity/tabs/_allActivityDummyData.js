/**
 * Temporary fixture for the All Activity tab. Mirrors the live response from
 *   GET /talent/outreach/agent-tailor-activity?page=N&limit=L&...filters
 * → { status, message, data: { list: Row[], total: number } }
 *
 * Toggle `USE_DUMMY_DATA` in AllActivityTab.js to switch back to the live API;
 * once the live endpoint is the source of truth, this file can be deleted.
 *
 * Row contract (per fixture):
 *   label            string  — legacy source bucket: 'Extension' | 'Uplers' | 'External' | 'Internal'
 *   company_name     string
 *   company_logo     string  — URL to the logo image
 *   job_title        string  — role title
 *   apply_url        string  — original posting URL
 *   run_by           'you' | 'auto' — who started the agent (talent vs Auto Run)
 *   row              { source, outreach_hr_id, outreach_status, used_agent, used_tailor,
 *                       activity_date, ... }   — nested mirror used by the inline thread
 *                       fetch (`outreach_hr_id` is the key)
 *   discard_reason   string  — Failed-state explanation surfaced on the pill tooltip
 *   status           number  — `OUTREACH_STATUS` code (mirrors `row.outreach_status`)
 *   status_string    string  — human label (Completed / Failed / etc.)
 *   activity_date    string  — "YYYY-MM-DD HH:mm:ss" (or ISO-like)
 *   used_agent       'Yes' | 'No'
 *   used_tailor      'Yes' | 'No'
 *
 * Forward-compat fields the UI tolerates if/when backend ships them:
 *   source_type      'uplers' | 'linkedin' | 'naukri' | 'company_page'
 *   row.manual_mode  boolean — switches the Pending action from `View Queue` to `Review`
 *   has_reply / replies_count — switches Completed action from `View Thread` to `View Reply`
 */
const allActivityDummyData = [
    {
        "label": "Extension",
        "run_by": "auto",
        "company_name": "realfast",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_realfast_1772020353_m1z2ahsA03.jpeg",
        "job_title": "Forward Deployed Engineer",
        "apply_url": "https://www.linkedin.com/jobs/search/?currentJobId=4412088533&distance=25.0&f_JT=C&f_TPR=r86400&f_WT=2&geoId=102713980&keywords=fullstack&origin=JOBS_HOME_KEYWORD_HISTORY",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 33739,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 2,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-28 15:49:54"
        },
        "discard_reason": "The job was discarded for an unknown reason. Please contact support for assistance.",
        "status": 2,
        "status_string": "Completed",
        "activity_date": "2026-05-28 15:49:54",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "run_by": "auto",
        "company_name": "Huptech HR Solutions",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Huptech_HR_Solutions_1779812848_3aq6xlmBL2.jpeg",
        "job_title": "Full Stack Engineer",
        "apply_url": "https://www.linkedin.com/jobs/view/4416132805",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 34250,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 2,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 19:17:48"
        },
        "discard_reason": "The job was discarded for an unknown reason. Please contact support for assistance.",
        "status": 2,
        "status_string": "Completed",
        "activity_date": "2026-05-27 19:17:48",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Ajackus",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Ajackus_1765348645_SnVmCF4oos.jpeg",
        "job_title": "MERN Stack Developer",
        "apply_url": "https://www.linkedin.com/jobs/search/?currentJobId=4417536421&distance=25.0&f_JT=F&f_TPR=r604800&f_WT=2&geoId=102713980&keywords=full%20stack%20engineer&origin=JOB_SEARCH_PAGE_JOB_FILTER&spellCorrectionEnabled=true",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 33838,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 2,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 18:29:36"
        },
        "discard_reason": "The job was discarded for an unknown reason. Please contact support for assistance.",
        "status": 2,
        "status_string": "Completed",
        "activity_date": "2026-05-27 18:29:36",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Crossing Hurdles",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Crossing_Hurdles_1755010522_Zs4ruJ0CXG.jpeg",
        "job_title": "Fullstack Developer",
        "apply_url": "https://www.linkedin.com/jobs/view/4416524115",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 34243,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 3,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 18:04:55"
        },
        "discard_reason": "No Indian employees were found for outreach at this company via LinkedIn and Gmail.",
        "status": 3,
        "status_string": "Failed",
        "activity_date": "2026-05-27 18:04:55",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Sophos",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Sophos_1746774841_Lr7asNnrfj.jpeg",
        "job_title": "Software Engineer (Golang Developer)",
        "apply_url": "https://jobs.lever.co/sophos/97a607b0-c141-4b80-a455-9278a5764697/apply?source=LinkedIn",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 33839,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 2,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 17:01:51"
        },
        "discard_reason": "The job was discarded for an unknown reason. Please contact support for assistance.",
        "status": 2,
        "status_string": "Completed",
        "activity_date": "2026-05-27 17:01:51",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Turing",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/60271742897373.png",
        "job_title": "Software Engineer (JavaScript)",
        "apply_url": "https://www.linkedin.com/jobs/view/4417329705",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 34244,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 3,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 15:41:27"
        },
        "discard_reason": "No Indian employees were found for outreach at this company via LinkedIn and Gmail.",
        "status": 3,
        "status_string": "Failed",
        "activity_date": "2026-05-27 15:41:27",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Swissinvest Limited",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Swissinvest_Limited_1779302770_0RSxPsl8Vw.jpeg",
        "job_title": "WEB DEVELOPER (REMOTE)",
        "apply_url": "https://www.linkedin.com/jobs/view/4416627035",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 31538,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 3,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 08:53:13"
        },
        "discard_reason": "No Indian employees were found for outreach at this company via LinkedIn and Gmail.",
        "status": 3,
        "status_string": "Failed",
        "activity_date": "2026-05-27 08:53:13",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "RiskProfiler",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_RiskProfiler_1779684763_JWD9uDTB56.jpeg",
        "job_title": "Software Development Engineer II - UI",
        "apply_url": "https://www.linkedin.com/jobs/view/4417796511",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 33831,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 2,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 08:53:13"
        },
        "discard_reason": "The job was discarded for an unknown reason. Please contact support for assistance.",
        "status": 2,
        "status_string": "Completed",
        "activity_date": "2026-05-27 08:53:13",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Sprinx Agylex Global",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Sprinx_Agylex_Global_1779302759_90wuj5cyM0.jpeg",
        "job_title": "Fullstack Product Developer",
        "apply_url": "https://www.linkedin.com/jobs/view/4415960931",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 31539,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 3,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 08:53:11"
        },
        "discard_reason": "No Indian employees were found for outreach at this company via LinkedIn and Gmail.",
        "status": 3,
        "status_string": "Failed",
        "activity_date": "2026-05-27 08:53:11",
        "used_agent": "Yes",
        "used_tailor": "No"
    },
    {
        "label": "Extension",
        "company_name": "Sloka IT Solutions",
        "company_logo": "https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Sloka_IT_Solutions_1779302729_iuRafGV9lq.jpeg",
        "job_title": "Artificial Intelligence Engineer",
        "apply_url": "https://www.linkedin.com/jobs/view/4415603171",
        "row": {
            "source": "internal",
            "temp_id": null,
            "outreach_hr_id": 31544,
            "hr_id": 0,
            "talent_id": 1122770,
            "resume": null,
            "outreach_status": 3,
            "used_agent": "Yes",
            "used_tailor": "No",
            "activity_date": "2026-05-27 08:53:11"
        },
        "discard_reason": "No Indian employees were found for outreach at this company via LinkedIn and Gmail.",
        "status": 3,
        "status_string": "Failed",
        "activity_date": "2026-05-27 08:53:11",
        "used_agent": "Yes",
        "used_tailor": "No"
    }
];

export default allActivityDummyData;