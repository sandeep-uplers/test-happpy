'use client';

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL + "/"

export const API_URL = APP_URL + "api/";
export const LRR_API_URL = process.env.NEXT_PUBLIC_LRR_APP_URL + "/api/";

export const UTC_URL = APP_URL + "login";
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME

export const API_LOGIN = API_URL + "sso";
export const API_CLIENT_LOGIN = API_URL + "login-ats";
export const API_PROFILELOGIN = API_URL + "profile/sso";
export const API_DUPLICATE_TALENT_CHECK = API_URL + "duplicate-talent-check";
export const API_JOINUS = API_URL + "joinus";
export const API_REGISTRATION = API_URL + "registration";
export const API_REGISTRATION_LOGS = API_URL + "registration-logs";
export const API_TRACKLINK = API_URL + "link-tracking";
export const API_FEEDBACK = API_URL + "feedback";
// export const API_NPS_FEEDBACK_QUESTIONS = API_URL+"nps/feedback-quetions";
export const API_NPS_FEEDBACK = API_URL + "nps/feedback";
export const API_NPS_FEEDBACK_URL = API_URL + "nps/feedback-quetions";

export const API_OTPVERIFY = API_URL + "otp-verify";
export const API_SIGNUP_TALENT = API_URL + "coresignal/signup-talent";
// export const API_CLIENT_OTPSEND = API_URL + "otp-send-ats";
export const API_OTP_VALITDITY_CHECK = API_URL + "otp-validity-check";
// export const API_CLIENT_OTPVERIFY = API_URL + "otp-verify-ats";
export const API_OTPSEND = API_URL + "otp-send";

export const API_ME = API_URL + "user/me";
export const API_UPDATE_JOB_SEARCH_PREFERENCE = API_URL + "user/job-search-preference";
export const API_TALENT_PROGRESS = API_URL + "talent/progress";
export const API_LOGOUT = API_URL + "logout";

export const API_SET_PASSWORD = API_URL + "talent/set-password";
export const API_STORE_PASSWORD = API_URL + "talent/store-password";

export const API_CLIENT_FORGOT_PASSWORD = API_URL + "forgot-password-ats";
export const API_CLIENT_SET_PASSWORD = API_URL + "set-password-ats";
export const API_CLIENT_STORE_PASSWORD = API_URL + "store-password-ats";

// export const API_POI = API_URL + "point-of-contact";
export const API_HOME_DATA = API_URL + "talent/home-data";
export const API_PROFILE = API_URL + "profile";
export const API_TALENT_PROFILE = API_URL + "talent/profile";

export const API_TALENT_PROFILE_UPSERT = API_URL + "talent/profile-upsert";
export const API_GENERATE_AWS_UPLOAD_URL = API_URL + "talent/generate-upload-url";
export const API_TALENT_DOWNLOAD_RESUME_PROFILE = API_URL + "talent/talent-download-resume-profile";

export const API_TALENT_RESUME = API_URL + "talent/profile/resume";
export const API_TALENT_PROFILE_DELETE = API_URL + "talent/profile/delete-details";
export const API_PROFILEPIC = API_URL + "profile/picture";
export const API_PROFILEDELETE = API_URL + "profile/delete-details";
export const API_ASSESSMENT = API_URL + "assessments";
export const API_ASSESSMENT_V2 = API_URL + "v2/assessments";


export const API_TALENT_VIDEO_RESUME = API_URL + "profile/video-resume";
export const API_TALENT_TID_VIDEO_RESUME = API_URL + "profile/video-resume-tid";

export const API_SKILLS = API_URL + "skills";
export const API_SKILLS_CREATE = API_URL + "skills/create";

export const API_ASSESSMENT_SKILLS = API_URL + "assessment/skills";
export const API_ASSESSMENT_SKILLS_RECOMMEND = API_URL + "assessment/skills/recommend"
export const API_ASSESSMENT_START = API_URL + "assessment/start";
export const API_QUERY = API_URL + "query";

export const API_GET_AWS_FILE = API_URL + "display-file";

export const API_TALENT_PROFILE_PREVIEW = API_URL + "profile/preview";
export const API_SINGLE_OPP = API_URL + "talent/hr/single-hr";
export const API_PUBLIC_SINGLE_OPP = API_URL + "single-hr-public";
export const API_MATCH_PERCENT = API_URL + "talent-matchmake";
export const API_BOOKMARK_OPP = API_URL + "talent/hr/update-saved-hr";
export const API_ALL_OPP = API_URL + "talent/hr/opportunities";
export const API_ALL_FEATURED_OPP = API_URL + "talent/hr/all-feature-opportunities";
export const API_MY_OPP = API_URL + "talent/hr/my-opportunities";
export const API_OPP_MASTER = API_URL + "talent/hr/opportunity-master";
export const API_INTERESTED = API_URL + "talent/hr/intrested";
export const API_ACCEPTENCE = API_URL + "talent/hr/clearence";
export const API_SLOT_SELECT = API_URL + "talent/hr/slot-selection";
export const API_OPP_CANCEL = API_URL + "talent/hr/cancel-opportunity";
export const API_INTERVIEW = API_URL + "talent/hr/interviews";
export const API_INTERVIEW_FEEDBACK = API_URL + "talent/hr/feedbacks";
export const API_INDIVIDUAL_MASTER = API_URL + "talent/hr/individual-master";
export const API_START_HR_ASSESSMENT = API_URL + "talent/hr/assign-assessment";
export const API_ASSESSMENT_RETEST = API_URL + "talent/assessment/re-test";
export const API_SKILL_AUTOCORRECT = API_URL + "skills/autocorrect";
export const API_SKILL_AUTOCORRECT_STORE = API_URL + "skills/autocorrect-store";


export const API_OPP_ROLE_MASTER = API_URL + "talent/hr/all-opp-role-master";
export const API_OPP_SKILL_MASTER = API_URL + "talent/hr/all-opp-skill-master";
export const API_OPP_LOCATION_MASTER = API_URL + "talent/hr/all-opp-location-master";
export const API_OPP_COMPANY_MASTER = API_URL + "talent/hr/all-opp-company-master";
export const API_OPP_READY_FILTERS = API_URL + "talent/hr/filter-opportunities";

export const API_SYSTEM_DETAILS = API_URL + "talent-system-details";
export const API_EMAIL_PREFERENCE = API_URL + "talent/email-preference";
export const API_EMAIL_PREFERENCE_UPDATE = API_URL + "talent/email-preference-update";
export const API_TALENT_EMAIL_PREFERENCE = API_URL + "talent/talent-email-preference";


export const API_SNOOZE_EMAIL = API_URL + "candidate/snooze-email";
export const API_SNOOZE_EMAIL_UPDATE = API_URL + "candidate/snooze-email-update";

export const API_VIEW_VIDEO_COUNT = API_URL + "talent/add-video-count";
export const API_VIEW_VIDEO_COUNT_NO_AUTH = API_URL + "add-video-count";

export const API_RESUME_PARSER_FEEDBACK = API_URL + "talent/resume-parser-feedback"
export const API_RECOMMENDED_DATA = API_URL + "talent/recommendations";


export const API_NURTURE_PREFERENCE = API_URL + "talent/nurture-preference";



export const API_PREFERENCE = API_URL + "talent/preferences"
export const API_HRCOMPANY_VIDEO_COUNTER = API_URL + "hr/talent-video-counter-store";
export const API_HRCOMPANY_VIDEO_COUNTER_PUBLIC = API_URL + "hr/public-video-counter-store";

export const API_PASSWORD_OTP_VALIDATE = API_URL + "talent/password-or-otp-verification";
export const API_TALENT_DEACTIVATE = API_URL + "talent/deactivate-account";
export const API_TALENT_REACTIVATE = API_URL + "talent/reactivate-account";
export const API_TALENT_DELETE = API_URL + "talent/soft-delete-talent-account";
export const API_TRACK_TALENT_PACKET = API_URL + "profile-tracking";
export const API_TRACK_TALENT_PAGES = API_URL + "talent-pages-tracking";
export const API_SSO_LOGIN_ACCESS = API_URL + "login-sso";



//  NEW API's
export const API_TALENT_PREFERENCES = API_URL + "talent/get-preference";
export const API_SEND_EMAIL_AUTOFILL_EXT = API_URL + "talent/send-auto-fill-extension-email";
export const API_SEND_EMAIL_JOB_LINK = API_URL + "talent/send-job-link-email";
export const API_STORE_EXT_INSTALLED = API_URL + "talent/store-extension-installed";
export const API_GET_TALENT_PROFILE = API_URL + "talent/get-talent-profile-data";
export const API_UPDATE_TALENT_PROFILE = API_URL + "talent/update-profile";
export const API_ASSOCIATE_TALENT_AGR_JOB = API_URL + "talent/associate";
export const API_STORE_APPLY_AGR_JOB = API_URL + "talent/store-job-response";

export const API_VERIFY_CONTACT = API_URL + "talent/verify-contact-number";
export const API_UNLOCK_PROFILE = API_URL + "profile/unlock";
export const API_TEST_REDIRECT_LINK = API_URL + "create-talent-ai-assessment";
export const API_TP_FEEDBACK_SAVE = API_URL + "store-talent-packet-feedback"
export const API_TOUCHPOINT_QUES = API_URL + "new-signup/get-screening-questions"
export const API_TOUCHPOINT_ANS_V2 = LRR_API_URL + "new-signup/save-screening-questions";
export const API_GET_APPLY_STATUS = API_URL + "new-signup/get-apply-status";

export const API_TOUCHPOINT_SAVE_CUSTOM_QUES = API_URL + "new-signup/save-custom-screening-questions";
export const API_TOUCHPOINT_DONE_HR = API_URL + "new-signup/touchpoint-done-and-associate-in-hr";

export const API_SIGNUP_RESUME_HEALTH = API_URL + "new-signup/resume-health";
export const API_SIGNUP_REFERRAL_AGENT = API_URL + "new-signup/referral-agent";
export const API_REFERRAL_AGENT_VERIFY_OTP = API_URL + "new-signup/referral-agent-verify-otp";
export const API_REFERRAL_AGENT_RESEND_OTP = API_URL + "new-signup/referral-agent-resend-otp";
/** Authenticated batch queue for public landing (logged-in users) — same TempHr flow as job-apply-by-link */
export const API_REFERRAL_AGENT_JOB_APPLY_BY_LINKS_BATCH = API_URL + "talent/referral-agent/job-apply-by-links-batch";

/** sessionStorage JSON array of job URLs to queue via referral-agent/job-apply-by-link after Happy.ai public onboarding */
export const SESSION_KEY_PUBLIC_AGENT_PENDING_JOB_LINKS = 'uts_public_agent_pending_job_links';

/** Same URLs kept for UI on Job Agent “run agent” page (not cleared when the queue is processed). Cleared when user removes them later if we add that. */
export const SESSION_KEY_JOB_AGENT_DISPLAY_JOB_URLS = 'uts_job_agent_display_job_urls';

export const API_RESUME_YOE = API_URL + "talent/yoe-parsing";
export const API_COMPANY_DETAILS = API_URL + "get-company-detail";
export const API_COMPANY_SALARY_DATA = API_URL + "get-company-salary-data";
export const API_COMPANY_SALARY_FEEDBACK = API_URL + "company-salary-feedback";
export const API_TALENT_LOCATION_MASTER = API_URL + "common/location-master";

export const API_SIMILAR_JOB = API_URL + "find-similar-job";
export const API_JOB_NOT_INTERESTED = API_URL + "talent/hr/job-not-interested";

export const API_UPLOAD_RESUME_REVIEW = API_URL + "talent/resume-review";

export const API_RESUME_HEALTH_CHECK = API_URL + "talent/resume-health-check";
export const API_RESUME_HEALTH_CHECK_NEW = API_URL + "talent/resume-health-check-new";
export const API_RESUME_TRANSFORM_DOWNLOAD = API_URL + "talent/resume-transform/download";
export const API_UPDATE_TRANSFORMED_RESUME_IN_PROFILE = API_URL + "talent/resume-health-check/update-resume-in-profile";

export const API_CREATE_ORDER_RAZORPAY = API_URL + "talent/razorpay/order/create";
export const API_CAPTURE_ORDER_RAZORPAY = API_URL + "talent/razorpay/order/capture";

export const API_JOB_FUNCTION_MASTER = API_URL + "job-functions-master";

export const API_TALENT_UPDATE_PASSWORD = API_URL + "talent/change-password";

export const API_ACCOUNT_STATUS = API_URL + "talent/account/status";
export const API_ACCOUNT_ANALYTICS = API_URL + "talent/account/analytics";
export const API_LINKEDIN_CONNECT = API_URL + "talent/account/linkedin/connect";
export const API_LINKEDIN_VERIFY = API_URL + "talent/account/linkedin/verify";
export const API_LINKEDIN_DISCONNECT = API_URL + "talent/account/linkedin/disconnect";

export const API_GMAIL_VERIFY = API_URL + "talent/account/gmail/verify";
export const API_GMAIL_DISCONNECT = API_URL + "talent/account/gmail/disconnect";
export const API_GMAIL_SEND_DUMMY_EMAIL = API_URL + "talent/account/gmail/inbox/send";

export const API_OUTREACH_AGENT = API_URL + "talent/account/outreach-agent";
export const API_PREFERRED_COMPANIES = API_URL + "talent/outreach/preference-companies";
export const API_SAVE_PREFERRED_COMPANIES = API_URL + "talent/outreach/save-preference-companies";
export const API_PREFERRED_COMPANIES_LIST = API_URL + "talent/outreach/get-preference-companies";
export const API_STORE_OUTREACH_TEMPLATE = API_URL + "talent/outreach/store-message-template";
export const API_GET_OUTREACH_TEMPLATES = API_URL + "talent/outreach/get-message-templates";
export const API_GET_OUTREACH_STEP = API_URL + "talent/outreach/outreach-step";
/** Happpy GTM concise onboarding (`/talent/happpy`) — BE contract; FE falls back if missing. */
export const API_HAPPPY_GTM_ONBOARDING_STATUS = API_URL + "talent/happpy-gtm/onboarding-status";
export const API_HAPPPY_GTM_PREFERENCES = API_URL + "talent/happpy-gtm/preferences";
export const API_OUTREACH_TRACK_JOURNEY = API_URL + "talent/outreach/track-journey";
export const API_HAPPPY_PUBLIC_PAGE_VISIT = API_URL + "talent/outreach/happpy-public-page-visit";
export const API_HAPPPY_PUBLIC_PAGE_VISIT_1 = API_URL + "talent/outreach/happpy-public-page-visit-1";

/** Keys for POST /talent/outreach/track-journey (TalentOutreachTracking). */
export const OUTREACH_JOURNEY_KEY_ONBOARDING_POP_OPENED = "onboarding_pop_opened";
export const ONB_POP_OPENED_SECTION_PREFIX = "onb_pop_opened_";
/** @param {string} section — slug from ONB_POP_OPENED_SECTIONS */
export const buildOnbPopOpenedSectionKey = (section) => `${ONB_POP_OPENED_SECTION_PREFIX}${section}`;
/** Slug → admin report label for onboarding drawer open attribution. */
export const ONB_POP_OPENED_SECTIONS = {
    hero: "Hero Banner",
    navbar: "Navbar",
    how_it_works: "How It Works",
    kinetic_results: "Kinetic Results",
    demo_video: "Demo Video",
    setup_section: "Setup Section",
    pricing_trial: "Pricing — Start Free Trial",
    interview_wall: "Interview Wall",
    pricing_plan_card: "Pricing — Plan Card",
    try_free_band: "Try Free Band",
    payment_success: "Payment Success",
    sticky_mobile: "Sticky Mobile CTA",
};
export const OUTREACH_JOURNEY_KEY_GMAIL_CLICKED = "gmail_clicked";
export const OUTREACH_JOURNEY_KEY_ONB_GMAIL_CONNECTED = "onb_gmail_connected";
export const OUTREACH_JOURNEY_KEY_LINKEDIN_CLICKED = "linkedin_clicked";
export const OUTREACH_JOURNEY_KEY_ONB_LINKEDIN_CONNECTED = "onb_linkedin_connected";
export const API_GET_OUTREACH_DASHBOARD_DATA = API_URL + "talent/outreach/get-outreach-dashboard-data";
export const API_UPDATE_AUTO_RUN_HAPPPY = API_URL + "talent/outreach/consent-auto-run";
/** Latest outreach_onboard_jobs row for the logged-in talent (saved job URLs + funnel stage). */
export const API_GET_ONBOARD_JOBS = API_URL + "talent/outreach/onboard-jobs";
/** Marks outreach_onboard_jobs completed when full Job Agent setup is verified (visit Run agent page). */
export const API_ONBOARD_JOBS_RUN_AGENT_COMPLETE = API_URL + "talent/outreach/onboard-jobs-run-agent-complete";
/** Job Agent home — fast recent activity rows (aggregate counts, no heavy reply payloads) */
export const API_JOB_AGENT_DASHBOARD_RECENT_ACTIVITY = API_URL + "talent/outreach/dashboard-recent-activity";
export const API_JOB_AGENT_AGENT_TAILOR_ACTIVITY = API_URL + "talent/outreach/agent-tailor-activity";
/** Job Agent — positive replies that may need a follow-up (Gmail / LinkedIn reporting filters; default last 15 days). */
export const API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS = API_URL + "talent/outreach/missed-positive-reply-followups";
/** Job Agent — lightweight `{ pending }` for sidebar (same filters as MISSED_REPLY_FOLLOWUPS). */
export const API_JOB_AGENT_MISSED_REPLY_FOLLOWUPS_PENDING = API_URL + "talent/outreach/missed-positive-reply-followups-pending";
export const AUTO_RUN_CONSENT_DEFAULT = 0;
export const AUTO_RUN_CONSENT_GIVEN = 1;
export const AUTO_RUN_CONSENT_REMOVED = 2;
export const isAutoRunConsentOn = (value) => Number(value) !== AUTO_RUN_CONSENT_REMOVED;

export const API_GET_RECOMMENDED_JOBS = API_URL + "talent/outreach/get-recommended-jobs";
export const API_GET_RECOMMENDED_EMAIL_JOBS_META = API_URL + "talent/outreach/recommended-jobs-meta-email";
export const API_GET_RECOMMENDED_EMAIL_JOBS = API_URL + "talent/outreach/recommended-jobs-email";
export const API_CONSENT_EMAIL_JOB_SCAN = API_URL + "talent/outreach/consent-email-job-scan";
export const API_CONSENT_INTERVIEW_EMAIL_SCAN = API_URL + "talent/outreach/consent-interview-email-scan";
export const API_STORE_RECOMMENDED_JOBS = API_URL + "talent/outreach/store-recommended-jobs";
export const API_AUTO_RUN_REQUEST = API_URL + "talent/outreach/auto-run-request";
export const API_OUTREACH_MARK_REPLY_SEEN = API_URL + "talent/outreach/mark-as-seen";
export const API_VERIFY_REFERRAL_CODE = API_URL + "talent/outreach/verify-referral-code";
export const API_CLAIM_REFERRAL_CODE = API_URL + "talent/outreach/claim-referral-code";
export const API_OUTREACH_REFERRAL_LIST = API_URL + "talent/outreach/referral-list";
export const API_OUTREACH_INVITE_TO_MULTIPLE_FRIENDS = API_URL + "talent/outreach/invite-to-multiple-friends";
export const API_OUTREACH_AGENT_PLANS = API_URL + "talent/outreach/agent-plans";
/** Personalised HAPPPY value proof for the subscription / upgrade surface. */
export const API_OUTREACH_VALUE_WITH_HAPPY = API_URL + "talent/outreach/value-with-happy";
export const API_OUTREACH_EXTEND_FREE_TRIAL = API_URL + "talent/outreach/extend-free-trial";
export const API_OUTREACH_CLAIM_DISCOUNT_OFFER = API_URL + "talent/outreach/claim-discount-offer";
export const API_OUTREACH_CLAIM_CUSTOM_LIGHT_PLAN = API_URL + "talent/outreach/claim-custom-light-plan";
export const API_OUTREACH_SUBSCRIBE_MODAL_ACTION = API_URL + "talent/outreach/subscribe-modal-action";

/** Job Agent — Leave a review: clip upload then JSON feedback submit. */
export const API_OUTREACH_FEEDBACK_UPLOAD_MEDIA = API_URL + "talent/outreach/feedback/upload-media";
export const API_OUTREACH_FEEDBACK = API_URL + "talent/outreach/feedback";
export const API_OUTREACH_REFINE_MESSAGE = API_URL + "talent/outreach/refine-message";
export const API_OUTREACH_DEFAULT_AUTO_TEMPLATES = API_URL + "talent/outreach/default-auto-templates";


// VIDEO RESUME 

export const API_STORE_VIDEO_RESUME = API_URL + "talent/video/store";
export const API_APPLY_VIDEO_RESUME = API_URL + "talent/video/apply";
export const API_FETCH_VIDEO_RESUME = API_URL + "talent/video/fetch/";
export const API_VISIBILITY_TOGGLE = API_URL + "talent/video/hr-toggle";
export const API_EB_NOTIFY = API_URL + "talent/error-boundry";
export const CHUNK_SIZE = (2 * 1024 * 1024)

export const API_RESUME_DASHBOARD = API_URL + "talent/resume-health-check" + "/dashboard";
export const API_RESUME_PREVIEW = API_URL + "talent/resume-health-check" + "/preview-uploaded-resume";
export const API_VIEW_HEALTH_REPORT = API_URL + "talent/resume-health-check" + "/view-health-report";
export const API_RESUME_HEALTH_CHECK_CREATE_ORDER = API_URL + "talent/resume-health-check" + "/create-order";
export const API_RESUME_HEALTH_CHECK_CAPTURE_ORDER = LRR_API_URL + "talent/resume-health-check" + "/capture-order";
export const API_RESUME_HEALTH_CHECK_REFUND_REQUEST = API_URL + "talent/resume-health-check" + "/refund-request";
export const API_RESUME_HEALTH_CHECK_SUPPORT = API_URL + "talent/resume-health-check" + "/support";
export const API_OUTREACH_SUPPORT = API_URL + "talent/outreach" + "/support";

export const API_SURVEY_POLL = API_URL + "talent/survey/submit";

// Tailored Resume

export const API_TAILOR_RESUME_MATCH = API_URL + "talent/tailor/match";
export const API_TAILOR_RESUME_MATCH_JDEXTRACT = API_URL + "talent/tailor/extract-jd-from-html";
export const API_TAILOR_RESUME_FETCH_AGENT_JD = API_URL + "talent/outreach/job-description";
export const API_TAILOR_RESUME_MATCH_FOR_BACKEND = API_URL + "talent/tailor/match-for-backend";
export const API_TAILOR_RESUME_CREATE_V2 = LRR_API_URL + "talent/tailor/create";
export const API_TAILOR_RESUME_UPDATE = API_URL + "talent/tailor/update";
export const API_TAILOR_RESUME_DOWNLOAD = API_URL + "talent/tailor/download";
export const API_TAILOR_RESUME_UPDATE_TAILOR_RESUME = API_URL + "talent/outreach/update-tailor-resume";


/** TempHr::ACTION_TAILOR_DONE_AND_AGENT_RUN — sync onboard TempHr after tailor download from Job Agent run jobs. */
export const API_REFERRAL_AGENT_UPDATE_EXTERNAL_JOB = API_URL + "talent/referral-agent/update-external-job";
export const API_TAILOR_RESUME_UPLOAD_V2 = LRR_API_URL + "talent/tailor/upload";
export const API_TAILOR_RESUME_LIST = API_URL + "talent/tailor/list";
export const API_TAILOR_RESUME_CREATE_ORDER = API_URL + "talent/tailor/order/create";
export const API_TAILOR_RESUME_CAPTURE_ORDER_V2 = LRR_API_URL + "talent/tailor/order/capture";
export const API_TAILOR_RESUME_REFUND_REQUEST = API_URL + "talent/tailor/refund-request";
export const API_TAILOR_RESUME_SUPPORT = API_URL + "talent/tailor/support";
export const API_TAILOR_RESUME_PREVIEW = API_URL + "talent/tailor" + "/preview-uploaded-resume";
export const API_TAILOR_RESUME_JOB_DESCRIPTION = API_URL + "talent/tailor/get-custom-jd/";
export const API_TAILOR_RESUME_FEEDBACK = API_URL + "talent/tailor/feedback";
export const API_TAILOR_RESUME_SIMILAR_JOBS = API_URL + "talent/hr/tailor-jobs";
export const API_TRANSFORMED_RESUME = API_URL + "talent/resume-health-check/get-transform-data";
export const API_TRANSFORMED_RESUME_UPDATE = API_URL + "talent/resume-health-check/update-transform-data";
export const API_TRANSFORMED_RESUME_DOWNLOAD = API_URL + "talent/resume-health-check/download";
export const API_OUTREACH_AGENT_PREVIEW_CONFIG = API_URL + "talent/outreach/preview-config";
export const API_OUTREACH_REWRITE_MESSAGE = API_URL + "talent/outreach/rewrite-message";
export const API_OUTREACH_STORE_MESSAGE_TEMPLATE = API_URL + "talent/outreach/store-message-template";
export const API_OUTREACH_RESUME_TRANSFORM = LRR_API_URL + "talent/resume-health-check/resume-transform";
export const API_GET_LAST_HEALTH_CHECK = API_URL + "talent/outreach/get-last-health-check";

// Extension
export const API_TAILOR_RESUME_EXTENSION_UNINSTALL = API_URL + "talent/tailor/store-extension-uninstall";

/** All TalentPaymentTransaction rows for the logged-in talent (tailor, outreach, resume transform, etc.) */
export const API_TALENT_PAYMENT_TRANSACTIONS = API_URL + "talent/payment-transactions";

// career coach
export const API_CAREER_COACH_PROFILE = API_URL + "career-coach/create-profile";
export const API_CAREER_COACH_GUEST_USER = API_URL + "career-coach/create-guest-user";
export const API_CAREER_COACH_RECENT_CHATS = API_URL + "career-coach/get-chats";
export const API_CAREER_COACH_CHAT_MESSAGES = API_URL + "career-coach/get-chat/";
export const API_CAREER_COACH_UPLOAD_RESUME = API_URL + "career-coach/upload-resume";
export const API_CAREER_COACH_GET_RESUME = API_URL + "career-coach/get-resume";
export const API_CAREER_COACH_FEEDBACK = API_URL + "career-coach/store-feedback";


// new jobs spot landing page
export const API_JOBS_SPOT_CHECK_USER = API_URL + "coresignal/check-user";
export const API_JOBS_SPOT_CREATE_JOB_ALERT = API_URL + "coresignal/create-alert";

//  Constant Values


export const IMAGE_URL = APP_URL + "images/talent/";
export const LOGIN_IMAGE_URL = APP_URL + "images/login/";

export const TRACK_HR_IDS = ["HR1174376884773450", "HR0191124125506", "HR1175403690845778"];
export const TOOLBAR_CONFIG = {
    display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'HISTORY_BUTTONS'],
    INLINE_STYLE_BUTTONS: [
        { label: 'Bold', style: 'BOLD', className: 'custom-css-class' },
        { label: 'Italic', style: 'ITALIC' },
        { label: 'Underline', style: 'UNDERLINE' },
    ],
    BLOCK_TYPE_BUTTONS: [
        { label: 'Bulleted List', style: 'unordered-list-item' },
        { label: 'Ordered List', style: 'ordered-list-item' },
    ],
}

export const PREFERRED_WORK_OF_MODE_OPTIONS = [
    { value: 1, label: "Full Time" },
    { value: 2, label: "Part Time" },
    { value: 3, label: "Contract" },
    { value: 4, label: "Freelance" },
]

export const JobSearchPrefMonthsOptions = [
    { value: 1, label: "1 Month" },
    { value: 2, label: "2 Months" },
    { value: 3, label: "3 Months" },
    { value: 4, label: "4 Months" },
    { value: 5, label: "5 Months" },
    { value: 6, label: "6 Months" },
]

export const AI_INTERVIEW = 'AiInterview';
export const INACTIVE_ASSESSMENT_TOOLS = ['TestGorilla'];

export const ASSESSMENT_LIMIT = 1;


// HR070323111849,HR050523100132 are dummy and works only on local

export const AboutVideoCompanies = {
    'Logiswift': {
        'company_name': 'Logiswift',
        'thumb_40x40': 'work/logiswift_video_thumb_40x40.svg',
        'thumb_160x100': 'work/logiswift_video_thumb_160x100.svg',
        // 'hrs': ['HR070323111849', 'HR171023151547', 'HR170823152054'],
        'video_url': 'https://www.youtube.com/embed/OIwZ9bf9ESk?autoplay=1&mute=1&modestbranding=1&showinfo=0',
        'video_about_txt': 'Logiswift is a unified platform that orchestrates, integrates, and transforms supply chain'
    },
    'InfraCloud Technologies Pvt Ltd': {
        'company_name': 'InfraCloud Technologies Pvt Ltd',
        'thumb_40x40': 'work/InfraCloud_video_thumb_40x40.png',
        'thumb_160x100': 'work/InfraCloud_video_thumb_160x100.png',
        // 'hrs': ['HR050523100132', 'HR090524020625', 'HR100324230558', 'HR181023200804'],
        'video_url': 'https://www.youtube.com/embed/f__bp9229tc?autoplay=1&mute=1&modestbranding=1&showinfo=0',
        'video_about_txt': 'Infracloud Igniting growth and innovation with cloud-native technologies, empowering businesses through transformative products and services.'
    }
}

export const PAYMENT_MODE_ODD = 1499;
export const PAYMENT_MODE_EVEN = 999;
export const TRANSFORMED_RESUME_COUNT = '3,000+';


export const resumeReels = [
    {
        id: 1,
        imgSrc: IMAGE_URL + 'resume/' + 'reel-part1-thumbnail.png',
        videoSrc: "https://d1h53oncnz25tl.cloudfront.net/talent/videos/50-Rec-Final-1080p.mp4",
        videoSrc480: "https://d1h53oncnz25tl.cloudfront.net/talent/videos/50-Rec-Final-480p.mp4",
    },
    {
        id: 2,
        imgSrc: IMAGE_URL + 'resume/' + 'reel-part2-thumbnail.png',
        videoSrc: "https://d1h53oncnz25tl.cloudfront.net/talent/videos/Resume-Secrets-Final-1080p.mp4",
        videoSrc480: "https://d1h53oncnz25tl.cloudfront.net/talent/videos/Resume-Secrets-Final-480p.mp4",
    },
];

export const TAILOR_RESUME_BETA_USERS = [
    "mohitkumar.m@uplers.in",
    "john.george28746237@gmail.com",
    "sandeepuplers@gmail.com",
    "uplersuplers@yopmail.com",
    "ishika03278412@gmail.com",
    "soumya.s@uplers.in",
    "nivedithaqatesting@gmail.com",
    "gurinderpal@uplers.com",
    "djsathwara@gmail.com",
    "codewick11@abc.com"
]

export const defaultCompactConfig = {
    template_id: 6,
    font_style: "Arial",
    font_size: {
        main_heading: 18,
        section_heading: 11,
        subheader: 11,
        body: 11,
    },
    spacing: {
        section_spacing: 2,
        item_spacing: 4,
        line_spacing: 10,
        top_bottom_margin: 18,
        side_margin: 28
    },
    theme_color: "#0070c0"
}