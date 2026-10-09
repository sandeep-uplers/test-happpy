'use client';

/** Happpy Agent landing page — shared static assets (Figma redesign sections) */

const OUTREACH_IMAGE_ROOT = "/images/talent/outreach";

/** Razorpay checkout accent — matches payment modals across Happpy surfaces. */
export const HAPPPY_RAZORPAY_THEME_COLOR = '#231F20';

/* Hero header */
export const HAPPY_HERO_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/hero`;
export const HAPPY_HERO_BG_SRC = `${HAPPY_HERO_ASSET_BASE}/hero-bg.png`;
/** Figma Frame 18 (3070:15685) — mobile-only mint mesh hero background */
export const HAPPY_HERO_BG_MOBILE_SRC = `${HAPPY_HERO_ASSET_BASE}/hero-bg-mobile.svg`;
export const HAPPY_HERO_BG_WEBP_SRCSET = [
    `${HAPPY_HERO_ASSET_BASE}/hero-bg-768.webp 768w`,
    `${HAPPY_HERO_ASSET_BASE}/hero-bg-1280.webp 1280w`,
    `${HAPPY_HERO_ASSET_BASE}/hero-bg.webp 1536w`,
].join(", ");
export const HAPPY_HERO_BG_SIZES = "100vw";
export const HAPPY_HERO_PRELOAD_ID = "happy-agent-hero-bg-preload";
/** Figma 3523:2499 — full hero scene (single composite) */
export const HAPPY_HERO_SCENE_BASE_SRC = `${HAPPY_HERO_ASSET_BASE}/hero-scene-base.jpg`;
export const HAPPY_HERO_SCENE_SRC = HAPPY_HERO_SCENE_BASE_SRC;
/** Figma 3746:2118 — sparkle aura + cursor beside hero CTA */
export const HAPPY_HERO_CTA_SPARKLE_AURA_SRC = `${HAPPY_HERO_ASSET_BASE}/hero-cta-sparkle-aura.png`;
/** @deprecated use HAPPY_HERO_SCENE_BASE_SRC */
export const HAPPY_HERO_SCENE_SKY_SRC = HAPPY_HERO_SCENE_BASE_SRC;
export const HAPPY_HERO_PROGRESS_STEPS = [
    "Configure Agent in just 60 seconds",
    "HAPPPY presents top matches from over 40k jobs...",
    "Run agent on your desired jobs",
    "HAPPPY finds & reached out to relevant referral contacts",
    "You have an insider job referral and an interview offer",
];
export const HAPPY_HERO_PROGRESS_STATUS =
    "HAPPPY reaching out to hiring managers on your behalf...";
/** Figma header chips (3523:2560) — order left to right */
export const HAPPY_HERO_TRUST_CHIPS = [
    "60-second setup",
    "2x interviews",
    "Trusted by 6450+ candidates",
];
export const HAPPY_HERO_TITLE_LINE_1 = "Get interviews";
export const HAPPY_HERO_TITLE_LINE_2 = "in as little as";
export const HAPPY_HERO_TRUST_SPARKLE_SRC = `${HAPPY_HERO_ASSET_BASE}/trust-sparkle.svg`;
export const HAPPY_HERO_EYEBROW_LEFT = "AI referral agent";
export const HAPPY_HERO_EYEBROW_RIGHT = "Not a job board";
export const HAPPY_HERO_TITLE_PREFIX = "Get interviews in as little as";
export const HAPPY_HERO_TITLE_HIGHLIGHT = "4 days";
export const HAPPY_HERO_MOBILE_TITLE_LINE_1 = "Get interviews";
export const HAPPY_HERO_MOBILE_TITLE_LINE_2 = "in as little as";
export const HAPPY_HERO_MOBILE_TITLE_HIGHLIGHT = "4 days";
export const HAPPY_HERO_TITLE_UNDERLINE_SRC = `${HAPPY_HERO_ASSET_BASE}/title-highlight-underline.svg`;
/** Mobile hero stats — underline under “candidates using it” (Figma hero foot) */
export const HAPPY_HERO_CANDIDATES_UNDERLINE_SRC = `${HAPPY_HERO_ASSET_BASE}/candidates-underline.png`;
export const HAPPY_HERO_MOBILE_SUBTITLE_BOLD = "HAPPPY is an AI referral agent";
/** Figma 3200:41293 — mobile hero body (14/20, two lines) */
export const HAPPY_HERO_MOBILE_SUBTITLE_LINES = [
    "A referral agent that finds people inside the target companies and introduces you - ",
    "so real recruiters reply instead of ghosting.",
];
/** Figma 3715:38357 — public referral mobile hero subtitle (single paragraph) */
export const HAPPY_HERO_MOBILE_SUBTITLE_REFERRAL =
    "A referral agent that finds people inside the company and introduces you - so a real recruiter replies";
export const HAPPY_HERO_MOBILE_CTA_LABEL = "Start Getting Interviews";
/** Figma 3715:38981 — mobile hero primary CTA (Telegraf uppercase) */
export const HAPPY_HERO_MOBILE_CTA_LABEL_UPPER = "START GETTING INTERVIEWS";
export const HAPPY_HERO_SUBTITLE_LINE_1 =
    "A referral agent that finds people inside the company and introduces you -";
export const HAPPY_HERO_SUBTITLE_LINE_2 = "so a real recruiter replies";
/** Desktop: sparkle + `desktop` label above the H1. Mobile: value/label stats under the hero CTA. */
export const HAPPY_HERO_TRUST_ITEMS = [
    { value: "2x", label: "more interviews", desktop: "2x interviews" },
    { value: "6,450+", label: "candidates using it", desktop: "Trusted by 6450+ candidates" },
    { value: "60s", label: "setup time", desktop: "60-second setup" },
];

/* Section 2 — Live Results */
export const HAPPY_LIVE_RESULTS_LOGO_CLOUD_SRC = `${OUTREACH_IMAGE_ROOT}/live-results-logo-cloud.png`;
export const HAPPY_LIVE_RESULTS_HEADLINE_UNDERLINE_SRC = `${OUTREACH_IMAGE_ROOT}/live-results-headline-underline.svg`;

/* Section 3 — How It Works */
export const HAPPY_HIW_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/hiw`;
export const HAPPY_HIW_HEADLINE_HIGHLIGHT_SRC = `${HAPPY_HIW_ASSET_BASE}/headline-highlight.svg`;
export const HAPPY_HIW_DEMO_VIDEO_PC_SRC = "/happpy-agent/how-it-works-pc.mp4";
export const HAPPY_HIW_DEMO_VIDEO_MOBILE_SRC = "/happpy-agent/how-it-works-mobile-final.mp4";

export const HAPPY_HOW_IT_WORKS_PILLARS = [
    {
        iconSrc: `${HAPPY_HIW_ASSET_BASE}/icon-referral-runs.png`,
        titleLines: ["One-click", "referral runs"],
        body: "Set up takes under 60 seconds. Email goes out from your connected inbox so it looks real personalised LinkedIn outreach too",
        badge: "automated referral",
        badgeUnderlineSrc: `${HAPPY_HIW_ASSET_BASE}/badge-underline-1.svg`,
        badgeUnderlineRotate: "-0.46deg",
    },
    {
        iconSrc: `${HAPPY_HIW_ASSET_BASE}/icon-resume-health.png`,
        titleLines: ["Resume Health Check +", "Transformation"],
        body: "Finds the 12 ATS killers hiding in your resume. Fixes them once. Every outreach after that goes out with an ATS-optimised resume.",
        badge: "optimize once. apply everywhere.",
        badgeUnderlineSrc: `${HAPPY_HIW_ASSET_BASE}/badge-underline-2.svg`,
        badgeUnderlineRotate: "-0.46deg",
    },
    {
        iconSrc: `${HAPPY_HIW_ASSET_BASE}/icon-follow-ups.png`,
        titleLines: ["It Follows Up.", "You Don't Have To."],
        body: "Polite nudges when someone doesn't reply — more conversations with hiring teams and referrers, fewer dropped threads.",
        badge: "automated follow-ups",
        badgeUnderlineSrc: `${HAPPY_HIW_ASSET_BASE}/badge-underline-3.svg`,
        badgeUnderlineRotate: "2.27deg",
    },
];

/* Section — Manual vs Happpy Agent */
export const HAPPY_MANUAL_VS_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/manual-vs`;
export const HAPPY_MANUAL_VS_MANUAL_HEADER_ICON_SRC = `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-header-icon.svg`;
export const HAPPY_MANUAL_VS_AGENT_HEADER_LOGO_SRC = `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-header-logo.svg`;

export const HAPPY_MANUAL_VS_MANUAL_ROWS = [
    {
        number: "01",
        text: "Spend hours searching and managing job applications.",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-row-01-icon.svg`,
    },
    {
        number: "02",
        text: "A bot might reject your resume before any human reads it",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-row-02-icon.svg`,
    },
    {
        number: "03",
        text: "1–2 hrs to find the right referral contacts",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-row-03-icon.svg`,
    },
    {
        number: "04",
        text: "Follow-ups get forgotten once you're busy",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-row-04-icon.svg`,
    },
    {
        number: "05",
        text: "Manually finding referral contacts is tedious",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/manual-row-05-icon.svg`,
    },
];

export const HAPPY_MANUAL_VS_AGENT_ROWS = [
    {
        number: "01",
        text: "Send and track referrals effortlessly in one place",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-row-01-icon.svg`,
    },
    {
        number: "02",
        text: "Skips the ATS bot, reached a hiring manager's inbox — no queue",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-row-02-icon.svg`,
    },
    {
        number: "03",
        text: "One-time setup, then outreach in under 60 seconds per job",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-row-03-icon.svg`,
    },
    {
        number: "04",
        text: "Automated follow ups and auto replies",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-row-04-icon.svg`,
    },
    {
        number: "05",
        text: "40,000+ contacts already mapped — zero hours spent hunting",
        iconSrc: `${HAPPY_MANUAL_VS_ASSET_BASE}/agent-row-05-icon.svg`,
    },
];

export const HAPPY_MANUAL_VS_STATS = [
    { value: "40000+", label: "Active jobs with referral contacts" },
    { value: "<60 sec", label: "To configure agent" },
    { value: "0", label: "LinkedIn Premium subscriptions needed" },
];

/** Mobile heading + compare strip (Figma 2922:4801). Desktop title stays unchanged. */
export const HAPPY_MANUAL_VS_MOBILE_TITLE_LEAD = "HAPPPY Agent does it in ";
export const HAPPY_MANUAL_VS_MOBILE_TITLE_HIGHLIGHT = "under 60 seconds.";
export const HAPPY_MANUAL_VS_COMPARE_ARROW_SRC = `${HAPPY_MANUAL_VS_ASSET_BASE}/compare-arrow.svg`;
export const HAPPY_MANUAL_VS_MOBILE_COMPARE = [
    { value: "1-2 hrs", label: "Finding referrals" },
    { value: "<60 sec", label: "Per job, with HAPPPY", accent: true },
];

/** Referral landing desktop stage (Figma 3682:37039) — mobile Figma pending */
export const HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE = `${HAPPY_MANUAL_VS_ASSET_BASE}/referral-v2`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_PORTRAIT_SRC = `${HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE}/hero-portrait.png`;
/** Portrait + doodles + testimonial stack (Figma 3682:37045) */
export const HAPPY_MANUAL_VS_REFERRAL_V2_SCENE_SRC = `${HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE}/scene-right.png`;
/** Mobile scene (Figma 3738:52629) */
export const HAPPY_MANUAL_VS_REFERRAL_V2_SCENE_MOBILE_SRC = `${HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE}/scene-mobile.png`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_TESTIMONIAL_HEART_SRC = `${HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE}/testimonial-heart.svg`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_CTA_ARROW_SRC = `${HAPPY_MANUAL_VS_REFERRAL_V2_ASSET_BASE}/cta-arrow-right.svg`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_CELEBRATE_MASCOT_SRC = `${OUTREACH_IMAGE_ROOT}/mascot-celebrate.svg`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_CTA_LABEL = HAPPY_HERO_MOBILE_CTA_LABEL_UPPER;
export const HAPPY_MANUAL_VS_REFERRAL_V2_BODY_LINE_1 =
    "Manual job hunting is slow, with hours of searching, ATS rejections and forgotten follow-ups. Happpy Agent replaces that with one-time setup, outreach in under ";
export const HAPPY_MANUAL_VS_REFERRAL_V2_BODY_LINE_2 =
    "60 seconds per job, automated follow-ups and 40,000+ contacts already mapped";
/** Figma 3715:38704 — single paragraph on mobile */
export const HAPPY_MANUAL_VS_REFERRAL_V2_BODY_MOBILE = `${HAPPY_MANUAL_VS_REFERRAL_V2_BODY_LINE_1}${HAPPY_MANUAL_VS_REFERRAL_V2_BODY_LINE_2}`;
export const HAPPY_MANUAL_VS_REFERRAL_V2_TESTIMONIAL = "Love it!  Recommended it to my friends";

/* Section 4 — Works Anywhere */
export const HAPPY_WORKS_ANYWHERE_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/works-anywhere`;
/** Figma 3523:3112 / 3523:3114 — teal bracket frame (374×82) behind kicker title */
export const HAPPY_WORKS_ANYWHERE_TITLE_BRACKET_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/title-bracket.svg`;
/** @deprecated use HAPPY_WORKS_ANYWHERE_TITLE_BRACKET_SRC */
export const HAPPY_WORKS_ANYWHERE_TITLE_UNDERLINE_SRC = HAPPY_WORKS_ANYWHERE_TITLE_BRACKET_SRC;
/** Figma 3523:3002 — left illustration (photo, globe, platform bubbles) */
export const HAPPY_WORKS_ANYWHERE_SCENE_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/works-anywhere-scene.png`;
export const HAPPY_WORKS_ANYWHERE_SECTION_BG_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/section-bg.png`;
export const HAPPY_WORKS_ANYWHERE_FOOTER_SPARKLE_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/footer-sparkle.svg`;
export const HAPPY_WORKS_ANYWHERE_FOOTER_HANDWRITING = "And more! same one-click flow";
export const HAPPY_WORKS_ANYWHERE_SUBTITLE = "but we work perfectly fine on all of them";

/* Section 5 — Connect Accounts */
export const HAPPY_SETUP_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/setup`;
export const HAPPY_SETUP_CHECKMARK_SRC = `${HAPPY_SETUP_ASSET_BASE}/checkmark.svg`;

export const HAPPY_HANDWRITING_CLASS = "happy-agent-handwriting";

export const HAPPY_SETUP_HANDWRITING = {
    anyGmailWorks: "Any Gmail works",
    noPremiumNeeded: "No Premium needed",
    connected: "Connected",
    disconnectGmail: "Disconnect Gmail",
    disconnectLinkedin: "Disconnect LinkedIn",
    openDashboard: "Open Job Agent dashboard",
};

/* Section 8 — Privacy & data security */
export const HAPPY_PRIVACY_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/privacy`;
export const HAPPY_PRIVACY_TITLE_UNDERLINE_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/title-underline-security.svg`;
export const HAPPY_PRIVACY_BADGE_UNDERLINE_SSL_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/badge-underline-ssl.svg`;
export const HAPPY_PRIVACY_BADGE_UNDERLINE_PRIVACY_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/badge-underline-privacy.svg`;
export const HAPPY_PRIVACY_BADGE_UNDERLINE_OAUTH_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/badge-underline-oauth.svg`;
export const HAPPY_PRIVACY_BADGE_UNDERLINE_MONITORING_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/badge-underline-monitoring.svg`;
export const HAPPY_PRIVACY_SPARKLE_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/sparkle.svg`;
export const HAPPY_PRIVACY_SHIELD_SRC = `${HAPPY_PRIVACY_ASSET_BASE}/shield.svg`;
export const HAPPY_MASCOT_CHILL_SRC = `${OUTREACH_IMAGE_ROOT}/mascot-chill.svg`;
/** Figma 3523:3607 — Gmail Access card mascot bubble */
export const HAPPY_PRIVACY_GMAIL_MASCOT_MESSAGE = "HAPPPY Agent takes data security seriously";

/** Mobile privacy cards (Figma 2922:4883) — desktop still uses HAPPY_PRIVACY_CARDS. */
export const HAPPY_PRIVACY_MOBILE = {
    titleSuffix: " first",
    access: [
        {
            key: "gmail",
            title: "Gmail access",
            highlight: "Never reads your personal emails, attachments, or drafts",
            items: [
                "Only reads replies to messages the agent sent",
                "Used only to send referral requests on your behalf",
            ],
        },
        {
            key: "linkedin",
            title: "LinkedIn access",
            highlight: "Never reads your other conversations or profile settings",
            items: [
                "Only reads replies to messages the agent sent",
                "Sends connection requests with personalized notes",
            ],
        },
    ],
    security: {
        title: "Data Security",
        items: [
            "No data sold to third parties",
            "Token deleted on disconnect",
            "AES-256 encryption",
            "OAuth 2.0 authentication",
        ],
    },
};

export const HAPPY_PRIVACY_CARDS = [
    {
        title: "Gmail Access",
        items: [
            "Agent only read replies to emails sent by the agent",
            "Send referral requests on your behalf",
            "Never reads your personal emails",
            "Agent never access attachments or drafts",
        ],
    },
    {
        title: "LinkedIn Access",
        items: [
            "Send connection requests with personalized notes",
            "Agent Read only replies to messages we sent",
            "Agent never reads your other conversations",
            "Agent never access your profile settings",
        ],
    },
    {
        title: "Data Security",
        items: [
            "AES-256 encryption at rest",
            "No data sold to third parties",
            "Industry-standard OAuth 2.0 authentication",
            "Disconnect anytime, we delete all tokens instantly",
        ],
    },
];

export const HAPPY_PRIVACY_BADGES = [
    {
        label: "SSL Secured",
        mobileLabel: "SSL SECURED",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_SSL_SRC,
        rotate: "-0.46deg",
    },
    {
        label: "Privacy First",
        mobileLabel: "PRIVACY COMPLIANT",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_PRIVACY_SRC,
        rotate: "-7.09deg",
    },
    {
        label: "OAuth 2.O",
        mobileLabel: "OAUTH 2.0",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_OAUTH_SRC,
        rotate: "0deg",
    },
    {
        label: "24/7 Monitoring",
        mobileLabel: "24/7 monitoring",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_MONITORING_SRC,
        rotate: "-1.22deg",
        sparkle: true,
    },
];

/* Testimonials */
export const HAPPY_TESTIMONIALS_TITLE_UNDERLINE_SRC = `${OUTREACH_IMAGE_ROOT}/testimonials-title-underline.svg`;

/* Section 11 — FAQ */
export const HAPPY_FAQ_GROUPS = [
    {
        heading: "GETTING STARTED",
        items: [
            {
                q: "How long does activation take?",
                a: "Usually under a minute. Referral mail sends from your own address so it lands like a real introduction—not spam. One quick sign-in links your inbox; we don't read your mail, only what you approve to send.",
            },
            {
                q: "What jobs work best with Happpy Agent?",
                a: "Roles posted in the last 24–48 hours. Hiring teams are still actively reviewing candidates; you're more likely to get a reply before the pipeline fills. Older listings often move slower.",
            },
            {
                q: "What happens when I hit my daily job limit?",
                a: "We queue the extra jobs for the next day. Your limit resets every 24 hours. Nothing is lost — it just runs the next day.",
            },
        ],
    },
    {
        heading: "TRUST & AUTHENTICITY",
        items: [
            {
                q: "Won't the messages sound like a bot wrote them?",
                a: "They're written from your resume, your tone, and the specific person you're reaching out to. You review and edit every one before it goes out. If anything sounds off, you change it in one click.",
            },
            {
                q: "Is my LinkedIn account safe?",
                a: "Yes. We cap outreach at 10 jobs a day — well below LinkedIn's safe limits. Messages go out on a randomised schedule that looks human. We haven't had a single account flagged.",
            },
            {
                q: "What happens to my Gmail and LinkedIn data?",
                a: "We use them only for outreach. We don't read your inbox, scrape contacts, or share anything. You can disconnect both with one click, anytime.",
            },
            {
                q: "How does Happpy Agent find official work emails?",
                a: "For each job, we identify recruiters, hiring managers, and relevant peers at the target company. We then look up their official work email—typically on the company domain (e.g. @acme.com)—using trusted third-party B2B data providers such as Lusha, Apollo, ContactOut, and SignalHire. These services cross-reference public professional profiles, company websites, and licensed business contact databases. We prioritise verified work addresses. Accuracy can vary.",
            },
        ],
    },
];

export const HAPPY_FAQ_ITEMS = HAPPY_FAQ_GROUPS.flatMap((group) => group.items);

/* Section 12 — Try free CTA band (Figma 3682:37013) */
export const HAPPY_TRY_FREE_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/try-free`;
export const HAPPY_TRY_FREE_BG_SRC = `${HAPPY_TRY_FREE_ASSET_BASE}/bg.png`;
export const HAPPY_TRY_FREE_PORTRAIT_AGENT_SRC = `${HAPPY_TRY_FREE_ASSET_BASE}/portrait-agent.png`;
export const HAPPY_TRY_FREE_PORTRAIT_PROFESSIONAL_SRC = `${HAPPY_TRY_FREE_ASSET_BASE}/portrait-professional.png`;
export const HAPPY_TRY_FREE_CTA_ARROW_SRC = `${HAPPY_TRY_FREE_ASSET_BASE}/cta-arrow-right.svg`;
export const HAPPY_TRY_FREE_EYEBROW = "Start today";
export const HAPPY_TRY_FREE_CTA_LABEL = "Get started now";
export const HAPPY_TRY_FREE_TITLE_LINES = [
    "Try Free Until You",
    'Hear "Yes"',
];
export const HAPPY_TRY_FREE_SUBTITLE =
    "Fresh postings (24–48h), fastest replies, no credit card, no lock-in, no fluff.";

/** Public Happpy landing (`HappyJobAgentPublic`) — paid ₹99 trial (not “try free”). */
export const HAPPY_PUBLIC_PAID_TRIAL_TITLE_LINES = [
    "₹99 Until You",
    'Hear "Yes"',
];

export const HAPPY_PUBLIC_PAID_TRIAL_SUBTITLE =
    'Upgrade only when someone replies · Cancel anytime · Fresh postings (24–48h) reply fastest.';

export const HAPPY_PUBLIC_PAID_TRIAL_HERO_NOTE =
    '₹99 until your first "yes" — upgrade only when someone replies';

export const HAPPY_PUBLIC_PAID_TRIAL_CHIP_LABEL = '₹99 until your first "yes"';

/* Section 13 — Footer */
export const HAPPY_FOOTER_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/footer`;
export const HAPPY_FOOTER_LOGO_SRC = `${HAPPY_FOOTER_ASSET_BASE}/happpy-agent-logo-light.svg`;

export const HAPPY_FOOTER_TAGLINE_LINES = [
    "An agent that gets your resume in front of ",
    "humans and follows up until they answer.",
];

export const HAPPY_FOOTER_LINKEDIN_HREF = "https://www.linkedin.com/company/happpy-agent-ai";
export const HAPPY_FOOTER_LINKEDIN_LOGO_SRC = `${HAPPY_FOOTER_ASSET_BASE}/linkedin-logo.svg`;
export const HAPPY_FOOTER_INSTAGRAM_HREF = "https://www.instagram.com/happpy_ai_referral_agent/";
export const HAPPY_FOOTER_INSTAGRAM_LOGO_SRC = `${HAPPY_FOOTER_ASSET_BASE}/instagram-logo.svg`;

export const HAPPY_FOOTER_COLUMNS = [
    {
        title: "PRODUCT",
        links: [
            { label: "How it works", scrollTarget: "value_strip" },
            { label: "Results", scrollTarget: "live_results" },
            // { label: "Pricing", scrollTarget: "pricing" },
            { label: "FAQ", scrollTarget: "faq" },
        ],
    },
    {
        title: "WORKS WITH",
        links: [
            { label: "LinkedIn", href: "https://www.linkedin.com/jobs/", external: true },
            { label: "Naukri", href: "https://www.naukri.com/", external: true },
            { label: "Indeed", href: "https://in.indeed.com/", external: true },
            { label: "Any career page", scrollTarget: "works_anywhere" },
        ],
    },
    // {
    //     title: "COMPANY",
    //     links: [
    //         { label: "About Uplers", href: "https://www.uplers.com/about-us/", external: true },
    //         { label: "Privacy policy", href: "https://www.uplers.com/privacy-policy/", external: true },
    //         { label: "Terms", href: "/talent/legal" },
    //         { label: "Support", href: "/talent/get-a-help" },
    //     ],
    // },
];

export const HAPPY_FOOTER_COPYRIGHT = "© 2026 Happpy Agent — Uplers.";
export const HAPPY_FOOTER_NOTE = "Glassdoor, Lever, Workday & more — same one-click flow.";

/* Section — Kinetic results */
export const HAPPY_KINETIC_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/kinetic`;
export const HAPPY_KINETIC_HEADER_SPARKLE_LARGE_SRC = `${HAPPY_KINETIC_ASSET_BASE}/header-sparkle-large.svg`;
export const HAPPY_KINETIC_HEADER_SPARKLE_SMALL_SRC = `${HAPPY_KINETIC_ASSET_BASE}/header-sparkle-small.svg`;
export const HAPPY_KINETIC_CONCLUSION_UNDERLINE_PRIMARY_SRC = `${HAPPY_KINETIC_ASSET_BASE}/conclusion-underline-primary.svg`;
export const HAPPY_KINETIC_CONCLUSION_UNDERLINE_SECONDARY_SRC = `${HAPPY_KINETIC_ASSET_BASE}/conclusion-underline-secondary.svg`;

export const HAPPY_KINETIC_EYEBROW = "TRUE SUCCESS STORY";
export const HAPPY_KINETIC_TITLE = "Why this actually works";
export const HAPPY_KINETIC_SUBTITLE =
    "A real-world breakdown of speed-to-hire using our referral engine.";

export const HAPPY_KINETIC_STEPS = [
    {
        time: "1:30 PM",
        title: "Agent activated",
        body: [
            { text: "A candidate ran the agent on a " },
            { text: "Mobikwik", bold: true },
            { text: " job posting." },
        ],
    },
    {
        time: "Instantly",
        title: "Profile sent to decision makers",
        body: [
            { text: "Typically, a profile like hers reaches " },
            { text: "2 Talent Acquisition Partners", bold: true },
            { text: " and " },
            { text: "2 Hiring Managers", bold: true },
            { text: " for that role." },
        ],
    },
    {
        time: "4:30 PM",
        title: "Interview scheduled",
        body: [
            { text: "Within " },
            { text: "3 hours", bold: true },
            { text: ", she got an interview email from " },
            { text: "Mobikwik", bold: true },
            { text: "." },
        ],
        isLast: true,
    },
];

export const HAPPY_KINETIC_CONCLUSION_TITLE = "Why so fast?";
export const HAPPY_KINETIC_CONCLUSION_BODY = [
    { text: "Her profile reached the right people — including the " },
    { text: "senior engineer", bold: true },
    { text: " hiring for that role. He liked her profile and scheduled the interview " },
    { text: "instantly", bold: true },
    { text: ". No waiting for a bot to read her resume." },
];

/* Section — Pricing */
export const HAPPY_PRICING_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/pricing`;
export const HAPPY_PRICING_FEATURED_GLOW_SRC = `${HAPPY_PRICING_ASSET_BASE}/featured-glow.svg`;
export const HAPPY_PRICING_RIBBON_STAR_SRC = `${HAPPY_PRICING_ASSET_BASE}/ribbon-star.svg`;
export const HAPPY_PRICING_RIBBON_SPARKLE_SRC = `${HAPPY_PRICING_ASSET_BASE}/ribbon-sparkle.svg`;
export const HAPPY_PRICING_CTA_ARROW_SRC = `${HAPPY_PRICING_ASSET_BASE}/cta-arrow.svg`;

export const HAPPY_PRICING_EYEBROW = "PLANS";
export const HAPPY_PRICING_TITLE = "Start free. Pay only when you’re ready";
export const HAPPY_PRICING_FOOTNOTE =
    "All plans include standard resume health check & assistance.";

/** Display-only plan metadata for unauthenticated public landing pricing cards. */
export const PUBLIC_LANDING_PLAN_FALLBACKS = {
    1: { PriceText: 3999, ValidityText: "1 month" },
    3: { PriceText: 5999, ValidityText: "3 months" },
};

/* Public auth drawer (Figma 2864:26627) */
export const HAPPY_PUBLIC_AUTH_MASCOT_SRC = `${OUTREACH_IMAGE_ROOT}/mascot-chill.svg`;
export const HAPPY_PUBLIC_AUTH_CONTINUE_ARROW_SRC = "/images/talent/arrow-right.svg";
/** Display-only social proof count for the public auth drawer promo bar. */
export const HAPPY_PUBLIC_AUTH_INTERVIEW_COUNT = 807;

/* Public auth drawer trust footer (Figma 3005:6795) */
const AUTH_TRUST_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/auth-trust`;
export const HAPPY_PUBLIC_AUTH_TRUST_HEADLINE =
    "Professionals like you are already landing interviews here.";
export const HAPPY_PUBLIC_AUTH_TRUST_HIGHLIGHT = "You are next!";
export const HAPPY_PUBLIC_AUTH_TRUST_COMPANIES = [
    { name: "Zomato", logo: `${AUTH_TRUST_ASSET_BASE}/zomato.png`, width: 24, height: 24 },
    { name: "Google", logo: `${AUTH_TRUST_ASSET_BASE}/google.png`, width: 24, height: 24 },
    { name: "Microsoft", logo: `${AUTH_TRUST_ASSET_BASE}/microsoft.png`, width: 20, height: 20 },
    { name: "Nike", logo: `${AUTH_TRUST_ASSET_BASE}/nike.png`, width: 28, height: 10 },
    { name: "Swiggy", logo: `${AUTH_TRUST_ASSET_BASE}/swiggy.png`, width: 24, height: 24 },
    { name: "Razorpay", logo: `${AUTH_TRUST_ASSET_BASE}/razorpay.png`, width: 17, height: 20 },
    { name: "GlobalLogic", logo: `${AUTH_TRUST_ASSET_BASE}/globallogic.png`, width: 20, height: 20 },
    { name: "WNS", logo: `${AUTH_TRUST_ASSET_BASE}/wns.png`, width: 19, height: 20 },
    { name: "GE HealthCare", logo: `${AUTH_TRUST_ASSET_BASE}/ge-healthcare.png`, width: 19, height: 20 },
    { name: "Condé Nast", logo: `${AUTH_TRUST_ASSET_BASE}/conde-nast.png`, width: 19, height: 20 },
    { name: "Nexthink", logo: `${AUTH_TRUST_ASSET_BASE}/nexthink.png`, width: 19, height: 20 },
    { name: "MiQ", logo: `${AUTH_TRUST_ASSET_BASE}/miq.png`, width: 22, height: 20 },
    { name: "BlackRock", logo: `${AUTH_TRUST_ASSET_BASE}/blackrock.png`, width: 20, height: 20 },
    { name: "Navan", logo: `${AUTH_TRUST_ASSET_BASE}/navan.png`, width: 19, height: 20 },
    { name: "JustAnswer", logo: `${AUTH_TRUST_ASSET_BASE}/justanswer.png`, width: 19, height: 20 },
    { name: "Attentive.ai", logo: `${AUTH_TRUST_ASSET_BASE}/attentive.png`, width: 20, height: 20 },
    { name: "Diligent", logo: `${AUTH_TRUST_ASSET_BASE}/diligent.png`, width: 20, height: 20 },
    { name: "Credera", logo: `${AUTH_TRUST_ASSET_BASE}/credera.png`, width: 20, height: 20 },
    { name: "myHQ", logo: `${AUTH_TRUST_ASSET_BASE}/myhq.png`, width: 20, height: 20 },
    { name: "Pluang", logo: `${AUTH_TRUST_ASSET_BASE}/pluang.png`, width: 20, height: 20 },
    { name: "+ more every day" },
];
