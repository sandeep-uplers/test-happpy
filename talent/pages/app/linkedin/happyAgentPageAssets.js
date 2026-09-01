'use client';

/** Happpy Agent landing page — shared static assets (Figma redesign sections) */

const OUTREACH_IMAGE_ROOT = "/images/talent/outreach";

/** Happpy brand teal — Razorpay checkout accent (Pay button, highlights). */
export const HAPPPY_RAZORPAY_THEME_COLOR = '#086d7e';

/* Hero header */
export const HAPPY_HERO_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/hero`;
export const HAPPY_HERO_BG_SRC = `${HAPPY_HERO_ASSET_BASE}/hero-bg.png`;
export const HAPPY_HERO_BG_WEBP_SRCSET = [
    `${HAPPY_HERO_ASSET_BASE}/hero-bg-768.webp 768w`,
    `${HAPPY_HERO_ASSET_BASE}/hero-bg-1280.webp 1280w`,
    `${HAPPY_HERO_ASSET_BASE}/hero-bg.webp 1536w`,
].join(", ");
export const HAPPY_HERO_BG_SIZES = "100vw";
export const HAPPY_HERO_PRELOAD_ID = "happy-agent-hero-bg-preload";
export const HAPPY_HERO_TRUST_SPARKLE_SRC = `${HAPPY_HERO_ASSET_BASE}/trust-sparkle.svg`;
export const HAPPY_HERO_TITLE_PREFIX = "Get interviews in as little as";
export const HAPPY_HERO_TITLE_HIGHLIGHT = "4 days.";
export const HAPPY_HERO_TITLE_LINES = ["Get interviews in as little as 4 days."];
export const HAPPY_HERO_SUBTITLE_LINE_1 =
    "An AI referral agent that finds people inside the company and introduces you - so a real recruiter replies.";
export const HAPPY_HERO_TRUST_ITEMS = [
    "120-second setup",
    // "Free until referred",
    "2x interviews",
    "Trusted by 2201 candidates",
];

/* Section 2 — Live Results */
export const HAPPY_LIVE_RESULTS_LOGO_CLOUD_SRC = `${OUTREACH_IMAGE_ROOT}/live-results-logo-cloud.png`;
export const HAPPY_LIVE_RESULTS_HEADLINE_UNDERLINE_SRC = `${OUTREACH_IMAGE_ROOT}/live-results-headline-underline.svg`;

/* Section 3 — How It Works */
export const HAPPY_HIW_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/hiw`;
export const HAPPY_HIW_HEADLINE_HIGHLIGHT_SRC = `${HAPPY_HIW_ASSET_BASE}/headline-highlight.svg`;

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

/* Section 4 — Works Anywhere */
export const HAPPY_WORKS_ANYWHERE_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/works-anywhere`;
export const HAPPY_WORKS_ANYWHERE_TITLE_UNDERLINE_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/title-underline.png`;
export const HAPPY_WORKS_ANYWHERE_SECTION_BG_SRC = `${HAPPY_WORKS_ANYWHERE_ASSET_BASE}/section-bg.png`;
export const HAPPY_WORKS_ANYWHERE_FOOTER_HANDWRITING = "And more! same one-click flow";

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
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_SSL_SRC,
        rotate: "-0.46deg",
    },
    {
        label: "Privacy First",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_PRIVACY_SRC,
        rotate: "-7.09deg",
    },
    {
        label: "OAuth 2.O",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_OAUTH_SRC,
        rotate: "0deg",
    },
    {
        label: "24/7 Monitoring",
        underlineSrc: HAPPY_PRIVACY_BADGE_UNDERLINE_MONITORING_SRC,
        rotate: "-1.22deg",
        sparkle: true,
    },
];

/* Testimonials */
export const HAPPY_TESTIMONIALS_TITLE_UNDERLINE_SRC = `${OUTREACH_IMAGE_ROOT}/testimonials-title-underline.svg`;

/* Section 11 — FAQ */
export const HAPPY_FAQ_ITEMS = [
    {
        q: "How long does activation take?",
        a: "Usually under a minute. Referral mail sends from your own address so it lands like a real introduction—not spam. One quick sign-in links your inbox; we don't read your mail, only what you approve to send.",
    },
    {
        q: "What jobs work best with Happpy Agent?",
        a: "Roles posted in the last 24–48 hours. Hiring teams are still actively reviewing candidates; you're more likely to get a reply before the pipeline fills. Older listings often move slower.",
    },
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
        q: "What if it doesn't work? Refund how?",
        a: "If you don't get a response in 7 days, we refund that month. No support ticket. No explanation required. One click inside your dashboard.",
    },
    {
        q: "What happens when I hit my daily job limit?",
        a: "We queue the extra jobs for the next day. Your limit resets every 24 hours. Nothing is lost — it just runs the next day.",
    },
    {
        q: "How does Happpy Agent find official work emails?",
        a: "For each job, we identify recruiters, hiring managers, and relevant peers at the target company. We then look up their official work email—typically on the company domain (e.g. @acme.com)—using trusted third-party B2B data providers such as Lusha, Apollo, ContactOut, and SignalHire. These services cross-reference public professional profiles, company websites, and licensed business contact databases. We prioritise verified work addresses. Accuracy can vary.",
    },
];

/* Section 12 — Try free CTA band */
export const HAPPY_TRY_FREE_TITLE_LINES = [
    "Try Free Until You",
    'Hear "Yes"',
];
export const HAPPY_TRY_FREE_SUBTITLE =
    "No credit card · Disconnect anytime · Fresh postings (24–48h) reply fastest.";

/* Section 13 — Footer */
export const HAPPY_FOOTER_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/footer`;
export const HAPPY_FOOTER_LOGO_SRC = `${HAPPY_FOOTER_ASSET_BASE}/happpy-agent-logo-light.svg`;

export const HAPPY_FOOTER_TAGLINE_LINES = [
    "An agent that gets your resume in front of",
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
            { label: "Pricing", scrollTarget: "pricing" },
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

export const HAPPY_KINETIC_EYEBROW = "TRUE SUCCESS STORIES";
export const HAPPY_KINETIC_TITLE = "Why This Actually Works";
export const HAPPY_KINETIC_SUBTITLE = "A real-world breakdown of speed-to-hire using our referral engine";

export const HAPPY_KINETIC_STEPS = [
    {
        time: "1:30 PM",
        title: "Agent activated",
        body: "A candidate ran the agent on a Mobikwik job posting.",
    },
    {
        time: "Instantly",
        title: "Profile sent to decision makers",
        bodyLines: [
            "Her profile went to 2 Talent Acquisition Partners and 2 Hiring Managers",
            "for that role.",
        ],
    },
    {
        time: "4:30 PM",
        title: "Interview scheduled",
        body: "Within 3 hours, she got an interview email from Mobikwik.",
        isLast: true,
    },
];

export const HAPPY_KINETIC_CONCLUSION_TITLE = "Why so fast?";
export const HAPPY_KINETIC_CONCLUSION_BODY =
    "Her profile reached the right people — including the senior engineer hiring for that role. He liked her profile and scheduled the interview instantly. No waiting for a bot to read her resume.";

/* Section — Pricing */
export const HAPPY_PRICING_ASSET_BASE = `${OUTREACH_IMAGE_ROOT}/pricing`;
export const HAPPY_PRICING_FEATURED_GLOW_SRC = `${HAPPY_PRICING_ASSET_BASE}/featured-glow.svg`;
export const HAPPY_PRICING_RIBBON_STAR_SRC = `${HAPPY_PRICING_ASSET_BASE}/ribbon-star.svg`;
export const HAPPY_PRICING_RIBBON_SPARKLE_SRC = `${HAPPY_PRICING_ASSET_BASE}/ribbon-sparkle.svg`;
export const HAPPY_PRICING_CTA_ARROW_SRC = `${HAPPY_PRICING_ASSET_BASE}/cta-arrow.svg`;

export const HAPPY_PRICING_EYEBROW = "PLANS";
export const HAPPY_PRICING_TITLE = "Start free. Pay only when you’re ready";
export const HAPPY_PRICING_FOOTNOTE =
    "All plans include standard resume health check & assistance. One-time setup fee may apply for transformation.";

/** Display-only plan metadata for unauthenticated public landing pricing cards. */
export const PUBLIC_LANDING_PLAN_FALLBACKS = {
    1: { PriceText: 1499, ValidityText: "1 month" },
    3: { PriceText: 2999, ValidityText: "3 months" },
};
