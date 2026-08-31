/**
 * Temporary fixture for the Replies tab while the live API is still being
 * shaped. Mirrors the final response contract from
 *   GET /talent/outreach/get-outreach-agent
 * so swapping back to the real endpoint is just flipping USE_DUMMY_DATA in
 * RepliesTab.js. Delete this file once the API is live.
 *
 * Keys consumed by the UI:
 *   id, appliedDate, jobTitle, companyName, companyLogo, applyUrl,
 *   positiveReplies, negativeReplies, totalReplies, replies[]
 * Each reply: id, threadId, source (linkedin|gmail), senderName, senderEmail,
 *             linkedinUrl, replyCategory, sentiment (positive|negative|neutral),
 *             messages[]
 * Each message: id, date, timestamp, senderName, sender, message, threadId
 */
const repliesDummyData = [
    {
        id: 34252,
        appliedDate: '2026-05-26',
        jobTitle: 'Senior Software Engineer',
        companyName: 'Aditi Consulting',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Aditi_Consulting_1773340488_JFlfkDM9DY.jpeg',
        applyUrl: 'https://www.linkedin.com/jobs/view/4417070304',
        positiveReplies: 1,
        negativeReplies: 2,
        totalReplies: 3,
        replies: [
            {
                id: 129704,
                threadId: 'l_129704',
                senderName: 'Aditya Malusare',
                senderEmail: 'adityam@aditiconsulting.com',
                linkedinUrl: 'https://www.linkedin.com/in/aditya-malusare-629623188',
                source: 'linkedin',
                replyCategory: 'Suggested direct application instead',
                sentiment: 'negative',
                messages: [],
            },
            {
                id: 129707,
                threadId: 'l_129707',
                senderName: 'Aneesh Nair',
                senderEmail: null,
                linkedinUrl: 'https://www.linkedin.com/in/aneesh-nair-8a4bb5191',
                source: 'linkedin',
                replyCategory: 'Redirected to other contacts',
                sentiment: 'negative',
                messages: [],
            },
            {
                id: 129715,
                threadId: 'g_129715',
                source: 'gmail',
                senderName: 'Tanisha Mandal',
                senderEmail: 'tanisham@aditiconsulting.com',
                linkedinUrl: 'https://www.linkedin.com/in/tanisha-mandal-4007951b1',
                replyCategory: 'Slots full; will reach out with opportunities',
                sentiment: 'positive',
                messages: [
                    {
                        id: 9247,
                        date: '2026-05-27',
                        timestamp: '11:54:21',
                        senderName: 'Tanisha Mandal',
                        sender: 'tanisham@aditiconsulting.com',
                        message:
                            'Hello Shivam, Thanks for the response. The submittal slots for this role is currently full. Will connect with you soon for relevant job profiles for you. Good luck on your job search!! Thanks & Regards, Tanisha Mandal Technical Recruiter tanisham@aditiconsulting.com O: 06827 422 177',
                        threadId: '19e6559c81ff2e57',
                    },
                    {
                        id: 9303,
                        date: '2026-05-27',
                        timestamp: '21:14:08',
                        senderName: 'You',
                        sender: 'bishtshivam096@gmail.com',
                        message:
                            '👍 Shivam Bisht reacted via Gmail On Wed, May 27, 2026 at 9:59 AM Tanisha Mandal wrote:',
                        threadId: '19e6559c81ff2e57',
                    },
                ],
            },
        ],
    },
    {
        id: 33839,
        appliedDate: '2026-05-25',
        jobTitle: 'Software Engineer (Golang Developer)',
        companyName: 'Sophos',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Sophos_1746774841_Lr7asNnrfj.jpeg',
        applyUrl: 'https://jobs.lever.co/sophos/97a607b0-c141-4b80-a455-9278a5764697/apply?source=LinkedIn',
        positiveReplies: 2,
        negativeReplies: 0,
        totalReplies: 2,
        replies: [
            {
                id: 99417,
                threadId: 'l_99417',
                senderName: 'Rajendra Prasanth S',
                senderEmail: 'rajendra.sekar@sophos.com',
                linkedinUrl: 'https://www.linkedin.com/in/rajendraprasanth0308',
                source: 'linkedin',
                replyCategory: 'Agrees to refer you',
                sentiment: 'positive',
                messages: [],
            },
            {
                id: 99418,
                threadId: 'l_99418',
                senderName: 'Srinivasan Nadar',
                senderEmail: 'srinivasan.nadar@sophos.com',
                linkedinUrl: 'https://www.linkedin.com/in/srinivasan-nadar-08a1b367',
                source: 'linkedin',
                replyCategory: 'Confirmed referral submitted and follow-up inquiry',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
    {
        id: 33825,
        appliedDate: '2026-05-25',
        jobTitle: 'SDE I',
        companyName: 'CSG',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_CSG_1746794545_25pifrbBwf.jpeg',
        applyUrl:
            'https://csgi.wd5.myworkdayjobs.com/CSGCareers/job/India-Remote/SDE-I_31917?source=LinkedIn',
        positiveReplies: 1,
        negativeReplies: 0,
        totalReplies: 1,
        replies: [
            {
                id: 117060,
                threadId: 'l_117060',
                senderName: 'Sudarshan V',
                senderEmail: 'sudarshan.v@csgi.com',
                linkedinUrl: 'https://www.linkedin.com/in/sudarshan-v-3a6622ba',
                source: 'linkedin',
                replyCategory: 'Will check if position is open',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
    {
        id: 33805,
        appliedDate: '2026-05-25',
        jobTitle: 'Software Engineer',
        companyName: 'Momentus Technologies',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Momentus_Technologies_1755010596_3mhsiC5jUl.jpeg',
        applyUrl: 'https://recruiting.paylocity.com/Recruiting/Jobs/Details/4176842?src=LinkedIn',
        positiveReplies: 2,
        negativeReplies: 1,
        totalReplies: 3,
        replies: [
            {
                id: 128598,
                threadId: 'l_128598',
                senderName: 'Pradnya Deole',
                senderEmail: 'pradnya.deole@gomomentus.com',
                linkedinUrl: 'https://www.linkedin.com/in/pradnya-deole-24574944',
                source: 'linkedin',
                replyCategory: 'Following up on your application status',
                sentiment: 'positive',
                messages: [],
            },
            {
                id: 128602,
                threadId: 'l_128602',
                senderName: 'Rakesh Chandra Koppula',
                senderEmail: 'rakesh.chandra@gomomentus.com',
                linkedinUrl: 'https://www.linkedin.com/in/rakesh-chandra-koppula',
                source: 'linkedin',
                replyCategory: 'Shared profile with recruiting team',
                sentiment: 'positive',
                messages: [],
            },
            {
                id: 1285981,
                threadId: 'g_128598',
                source: 'gmail',
                senderName: 'Pradnya Deole',
                senderEmail: 'pradnya.deole@gomomentus.com',
                linkedinUrl: 'https://www.linkedin.com/in/pradnya-deole-24574944',
                replyCategory: 'Acknowledges prior chat, no next steps',
                sentiment: 'negative',
                messages: [
                    {
                        id: 9245,
                        date: '2026-05-27',
                        timestamp: '11:53:15',
                        senderName: 'Pradnya Deole',
                        sender: 'pradnya.deole@gomomentus.com',
                        message:
                            'Shivam, We spoke yesterday. You are expecting 30 LPA. You have also sent a LinkedIn message to me. Hope you remember we spoke in detail. ________________________________',
                        threadId: '19e608d991112a6b',
                    },
                    {
                        id: 9246,
                        date: '2026-05-27',
                        timestamp: '11:53:41',
                        senderName: 'You',
                        sender: 'bishtshivam096@gmail.com',
                        message:
                            '👍 Shivam reacted via Gmail On Wed, 27 May, 2026, 10:58 am Pradnya Deole, wrote:',
                        threadId: '19e608d991112a6b',
                    },
                ],
            },
        ],
    },
    {
        id: 33767,
        appliedDate: '2026-05-25',
        jobTitle: 'Senior Software Engineer',
        companyName: 'YipitData',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_YipitData_1743587276_lJ5XT8UjOx.jpeg',
        applyUrl: 'https://job-boards.greenhouse.io/yipitdatajobs/jobs/7061483?gh_src=9395f1371us',
        positiveReplies: 1,
        negativeReplies: 0,
        totalReplies: 1,
        replies: [
            {
                id: 111327,
                threadId: 'l_111327',
                senderName: 'Bhanu Prakash Kesani',
                senderEmail: null,
                linkedinUrl: 'https://www.linkedin.com/in/bhanu-prakash-kesani-76993821a',
                source: 'linkedin',
                replyCategory: 'Shared referral link',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
    {
        id: 30106,
        appliedDate: '2026-05-17',
        jobTitle: 'Senior Software Engineer',
        companyName: 'Adroit India',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Adroit_India_1779304298_t1shRx2t7R.jpeg',
        applyUrl: 'https://www.linkedin.com/jobs/view/4411590709',
        positiveReplies: 1,
        negativeReplies: 0,
        totalReplies: 1,
        replies: [
            {
                id: 166999,
                threadId: 'l_166999',
                senderName: 'Srikanth Reddy',
                senderEmail: null,
                linkedinUrl: 'https://www.linkedin.com/in/srikanth-reddy-b84641180',
                source: 'linkedin',
                replyCategory: 'Agrees to help with referral',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
    {
        id: 30080,
        appliedDate: '2026-05-17',
        jobTitle: 'Software Development Engineer - Platform Data Team',
        companyName: 'HighLevel',
        companyLogo: 'https://d1h53oncnz25tl.cloudfront.net/company/logo/18651728465130.png',
        applyUrl:
            'https://jobs.lever.co/gohighlevel/ab7a9f29-0a75-4ff3-8f7b-1e38e9a307b4/apply?source=LinkedIn',
        positiveReplies: 1,
        negativeReplies: 2,
        totalReplies: 3,
        replies: [
            {
                id: 16097,
                threadId: 'g_16097',
                source: 'gmail',
                senderName: 'Rahul Chauhan',
                senderEmail: 'rahul.chauhan@gohighlevel.com',
                linkedinUrl: 'https://www.linkedin.com/in/rahul-chauhan-90a597116',
                replyCategory: 'Referral confirmed and completed',
                sentiment: 'positive',
                messages: [
                    {
                        id: 8717,
                        date: '2026-05-21',
                        timestamp: '17:16:03',
                        senderName: 'Rahul Chauhan',
                        sender: 'rahul.chauhan@gohighlevel.com',
                        message: 'Done! Good luck!',
                        threadId: '19e46d33d5011ee5',
                    },
                    {
                        id: 8718,
                        date: '2026-05-21',
                        timestamp: '17:16:09',
                        senderName: 'You',
                        sender: 'bishtshivam096@gmail.com',
                        message:
                            '💖 Shivam reacted via Gmail On Thu, 21 May, 2026, 2:38 pm Rahul Chauhan, wrote:',
                        threadId: '19e46d33d5011ee5',
                    },
                ],
            },
            {
                id: 16081,
                threadId: 'g_16081',
                source: 'gmail',
                senderName: 'Sharad Shinde',
                senderEmail: 'sharad@gohighlevel.com',
                linkedinUrl: 'https://www.linkedin.com/in/shindesharad71',
                replyCategory: 'Directs to standard application process',
                sentiment: 'negative',
                messages: [
                    {
                        id: 8630,
                        date: '2026-05-21',
                        timestamp: '09:28:40',
                        senderName: 'Sharad Shinde',
                        sender: 'sharad@gohighlevel.com',
                        message:
                            'Hey Shivam, Please apply from the given job link, there is no seperate process. Thanks, Sharad ---- *Sharad Vijay Shinde* Staff Engineer | Dev-Automations sharad@gohighlevel.com *HighLevel Inc.* 1801 N. Lamar St. Suite 600 Dallas, Texas 75202 gohighlevel.com',
                        threadId: '19e46d35a5fa9a96',
                    },
                ],
            },
            {
                id: 116269,
                threadId: 'g_116269',
                source: 'gmail',
                senderName: 'Siri Chandana Reddy',
                senderEmail: 'siri.reddy@gohighlevel.com',
                linkedinUrl: 'https://www.linkedin.com/in/sirichandana826',
                replyCategory: 'Profile mismatch for the role',
                sentiment: 'negative',
                messages: [
                    {
                        id: 2792,
                        date: '2026-01-28',
                        timestamp: '15:38:42',
                        senderName: 'Siri Chandana Reddy',
                        sender: 'siri.reddy@gohighlevel.com',
                        message:
                            'Hi Shivam, This is a full stack developer position and your profile seems to be FE specific. Do you want to look at other open roles which are FE oriented to minimise the chance of rejection.',
                        threadId: '19be60ccd537cb19',
                    },
                    {
                        id: 2793,
                        date: '2026-01-28',
                        timestamp: '15:38:47',
                        senderName: 'You',
                        sender: 'bishtshivam096@gmail.com',
                        message:
                            'Thanks for your reply. Ill do that. If you can help me find other positions. Please send me the job portal link. Ill try to find that which matches the requirements. Thanks and regards. Shivam On Wed, 28 Jan, 2026, 3:16 pm Siri Reddy, wrote:',
                        threadId: '19be60ccd537cb19',
                    },
                    {
                        id: 2794,
                        date: '2026-01-28',
                        timestamp: '15:38:52',
                        senderName: 'Siri Chandana Reddy',
                        sender: 'siri.reddy@gohighlevel.com',
                        message:
                            "Here's the link : On Wed, Jan 28, 2026 at 3:19 PM Shivam Bisht wrote:",
                        threadId: '19be60ccd537cb19',
                    },
                    {
                        id: 2795,
                        date: '2026-01-28',
                        timestamp: '15:38:56',
                        senderName: 'You',
                        sender: 'bishtshivam096@gmail.com',
                        message:
                            '♥️ Shivam reacted via Gmail On Wed, 28 Jan, 2026, 3:20 pm Siri Reddy, wrote:',
                        threadId: '19be60ccd537cb19',
                    },
                ],
            },
        ],
    },
    {
        id: 30076,
        appliedDate: '2026-05-17',
        jobTitle: 'IoT Full Stack Developer',
        companyName: 'Gruve',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Gruve_1768470993_eYkYS738gE.jpeg',
        applyUrl: 'https://www.linkedin.com/jobs/view/4413920190',
        positiveReplies: 1,
        negativeReplies: 0,
        totalReplies: 1,
        replies: [
            {
                id: 114523,
                threadId: 'l_114523',
                senderName: 'RAKSHITH KUMAR KN',
                senderEmail: null,
                linkedinUrl: 'https://www.linkedin.com/in/rakshith-kumar-kn-4108b31a3',
                source: 'linkedin',
                replyCategory: 'Agrees to refer',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
    {
        id: 30075,
        appliedDate: '2026-05-17',
        jobTitle: 'Front End Developer',
        companyName: 'Matrix USA',
        companyLogo:
            'https://d1h53oncnz25tl.cloudfront.net/company/logo/lin_Matrix_USA_1776359472_kmZPijl22h.jpeg',
        applyUrl:
            'https://www.comeet.com/jobs/matrix-ifs/19.00F/front-end-developer/3E.A6D?coref=1.11.pAE_FA1B',
        positiveReplies: 1,
        negativeReplies: 0,
        totalReplies: 1,
        replies: [
            {
                id: 148649,
                threadId: 'l_148649',
                senderName: 'Abhilash Adivikatla',
                senderEmail: null,
                linkedinUrl: 'https://www.linkedin.com/in/abhilash-adivikatla-775650202',
                source: 'linkedin',
                replyCategory: 'Will let you know',
                sentiment: 'positive',
                messages: [],
            },
        ],
    },
];

export default repliesDummyData;
