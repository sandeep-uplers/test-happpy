/**
 * Temporary fixture for the Jobs in Queue tab. Mirrors the live response from
 *   GET /talent/outreach/get-external-apply-pending-jobs
 * → { status, message, data: Row[] }
 *
 * Rows here are wrapped in a top-level `data` key so the shape matches the
 * `response.data.data` slice that the live consumer reads. Toggle
 * `USE_DUMMY_DATA` in JobsInQueueTab.js to switch back to the live API; the
 * fixture file can be deleted once that lands.
 *
 * Row fields:
 *   id              number — pending row id (used for cancel + react key)
 *   title           string — source label / company-ish identifier
 *                            (e.g. "Niyo Solutions Inc.", "www.linkedin.com")
 *   external_link   string — url for the role
 *   job_board       boolean
 *   date            string — pre-formatted relative date ("5 hours ago")
 *   job_title       string — role title (may be empty)
 *   duplicate_job   boolean
 *   external        boolean — drives the Source pill classification
 *   manual_mode     boolean (optional, future) — toggles "On manual mode"
 *                          badge + the Review Outreach CTA. Not yet present
 *                          in this fixture; UI tolerates absence.
 *   outreach_hr_id  number  (optional, future) — used by Review Outreach
 *                          when wired to the backend route.
 */
const jobsInQueueDummyData = {
	"data": [
		{
			"id": 34580,
			"title": "Niyo Solutions Inc.",
			"external_link": "https://niyo.darwinbox.in/ms/candidatev2/main/careers/jobDetails/a677ce45e6b889?from=all",
			"job_board": false,
			"date": "1 day ago",
			"job_title": "SDE 2 React",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 34594,
			"title": "Ultra Platform",
			"external_link": "https://affle.darwinbox.in/ms/candidatev2/main/careers/jobDetails/a69baaa5a000df?from=all",
			"job_board": false,
			"date": "1 day ago",
			"job_title": "SDE II",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 34973,
			"title": "dws.bamboohr.com",
			"external_link": "https://dws.bamboohr.com/careers/55",
			"job_board": false,
			"date": "21 hours ago",
			"job_title": "Middle Frontend Engineer",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 34983,
			"title": "sourceone.keka.com",
			"external_link": "https://sourceone.keka.com/careers/jobdetails/142280",
			"job_board": false,
			"date": "21 hours ago",
			"job_title": "Senior Software Development Manager",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35101,
			"title": "leadsquaredhrms.darwinbox.in",
			"external_link": "https://leadsquaredhrms.darwinbox.in/ms/candidatev2/main/careers/jobDetails/a6a1582894005f",
			"job_board": false,
			"date": "18 hours ago",
			"job_title": "Senior Fullstack Developer",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35430,
			"title": "SecurityScorecard",
			"external_link": "https://job-boards.greenhouse.io/securityscorecard/jobs/7960903",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "Senior Software Engineer",
			"duplicate_job": false,
			"external": false,
			"outreach_hr_id": 35430,
			"has_pending_action": true
		},
		{
			"id": 35432,
			"title": "www.linkedin.com",
			"external_link": "https://www.linkedin.com/jobs/view/4418549714",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35434,
			"title": "www.linkedin.com",
			"external_link": "https://www.linkedin.com/jobs/view/4418578844",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35435,
			"title": "hashnode.freshteam.com",
			"external_link": "https://hashnode.freshteam.com/jobs/UFSSZ87Zaila/fullstack-developer-remote",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35439,
			"title": "takeda.wd3.myworkdayjobs.com",
			"external_link": "https://takeda.wd3.myworkdayjobs.com/en-GB/external/job/IND---Bengaluru/Software-Engineering-Senior-Professional_R0180825",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35444,
			"title": "app.sproutsai.com",
			"external_link": "https://app.sproutsai.com/job-post/details/69e5c841c698d378c5c26303?source=linkedin",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35446,
			"title": "jobs.smartrecruiters.com",
			"external_link": "https://jobs.smartrecruiters.com/SopraSteria1/744000128385588-node-angular-senior-software-engineer?trid=2d92f286-613b-4daf-9dfa-6340ffbecf73",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35448,
			"title": "sprinklr.wd1.myworkdayjobs.com",
			"external_link": "https://sprinklr.wd1.myworkdayjobs.com/careers/job/India---Haryana---Gurgaon/Lead-Software-Engineer_112970-JOB?source=LinkedIn",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35450,
			"title": "ouryahoo.wd5.myworkdayjobs.com",
			"external_link": "https://ouryahoo.wd5.myworkdayjobs.com/en-US/careers/job/India/Fullstack-Software-Dev-Engineer-II_JR0026920",
			"job_board": false,
			"date": "5 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false
		},
		{
			"id": 35466,
			"title": "jaikisan.keka.com",
			"external_link": "https://jaikisan.keka.com/careers/jobdetails/130210",
			"job_board": false,
			"date": "4 hours ago",
			"job_title": "",
			"duplicate_job": false,
			"external": false,
			"manual_mode": true,
			"outreach_hr_id": 35466
		}
	]
};

export default jobsInQueueDummyData;