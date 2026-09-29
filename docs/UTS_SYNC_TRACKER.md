# UTS → test-happpy sync tracker

Tracks frontend sync from UTS Laravel (`resources/js/Talent/`) into this Next.js app (`talent/`).

## Route scope

| UTS route | test-happpy |
|-----------|-------------|
| `/talent/happpy-ai-agent` | `/` (`app/page.js`) |
| `/talent/referral-ai-agent` | `/talent/referral-ai-agent` |
| `/talent/happpy` | `/talent/happpy` |
| `/talent/job-agent` | `/talent/job-agent` |
| `/talent/job-agent/*` | `/talent/job-agent/*` (wired Next pages only) |

**Path remap:** `uts/resources/js/Talent/` → `test-happpy/talent/`

## Git commands (repeat for next sync)

```bash
UTS=/Applications/MAMP/htdocs/uts
BASELINE=<previous_uts_commit>

git -C "$UTS" log "$BASELINE"..HEAD --oneline -- \
  resources/js/Talent/pages/access-public/HappyJobAgentPublic.js \
  resources/js/Talent/pages/access-public/HappyJobAgentPublic.css \
  resources/js/Talent/pages/access-public/happpy-gtm \
  resources/js/Talent/pages/app/linkedin/HappyJobAgent.js \
  resources/js/Talent/pages/app/happpy-agent \
  resources/js/Talent/pages/app/job-agent \
  resources/js/Talent/pages/app/agent-activity \
  resources/js/Talent/pages/app/agent-onboarding \
  resources/js/Talent/pages/app/jobs-board \
  resources/js/Talent/components/HappyAgentLandingNavbar.js \
  resources/js/Talent/components/HappyAiAgentLayout.js \
  resources/js/Talent/components/ReferralAgentPreviewModal.js \
  resources/js/Talent/helpers/happyAgentPublicSignupSession.js \
  resources/js/Talent/helpers/happyAgentUrlParams.js \
  resources/js/Talent/components/Constant.js

git -C "$UTS" log "$BASELINE"..HEAD --name-only --format="" -- <same paths> | sort -u
```

**Porting helper:** after copying `.js` files from UTS, run:

```bash
node scripts/port-uts-js.mjs talent/path/to/File.js
```

Then apply manual merges listed below.

## Sync history

| Date | UTS branch | Baseline (before) | Synced through | Notes |
|------|------------|-------------------|----------------|--------|
| 2026-09-24 | development | — | `758226b03e` | Prior baseline (“auth drawer” on public landing) |
| 2026-09-29 | development | `758226b03e` | `1ed0a1a68fa` | Happy Agent route sync; `npm run build` OK (Node 22) |

## Manual-merge files (never blind overwrite)

- `talent/pages/access-public/HappyJobAgentPublic.js` — keep `buildReferralAiAgentPath`, `routerCompat`, `ensureModalAppElement`
- `talent/components/HappyAiAgentLayout.js` — keep `/` as public landing
- `talent/components/Constant.js` — keep `NEXT_PUBLIC_*` env; additive UTS exports only
- `talent/pages/app/job-agent/JobAgentDashboardLayout.js` — keep `{children}` + `JobAgentDashboardProvider`
- `talent/pages/app/linkedin/HappyJobAgent.js` — use `next/dynamic` for JobsBoard (not `@loadable/component`)
- `talent/pages/app/linkedin/happyAgentPageAssets.js` — preserve `HAPPPY_RAZORPAY_THEME_COLOR` when merging UTS hero assets

## Files touched (2026-09-29 sync)

| talent/ path | Notes |
|--------------|--------|
| `components/Constant.js` | Auth drawer CTA helpers, upcoming follow-ups APIs, preview/rewrite message APIs |
| `components/HappyAgentLandingNavbar.js` | Ported |
| `components/ReferralAgentPreviewModal.js` | Tailor outreach message; `ensureModalAppElement` |
| `helpers/happyAgentPublicSignupSession.js` | Public auth drawer tracking |
| `pages/access-public/HappyJobAgentPublic.js` | Manual merge + UTS tracking/recaptcha |
| `pages/access-public/HappyJobAgentPublic.css` | LP hero/mobile CSS |
| `pages/access-public/ReferralJobAgentLanding.css` | Reconciliation |
| `pages/access-public/happpy-gtm/HapppyGtmPublic.js` | Funnel tracking |
| `pages/app/agent-activity/AgentActivity.js` | Pending manual banner |
| `pages/app/agent-activity/AgentActivity.css` | Styles |
| `pages/app/agent-activity/PendingManualOutreachBanner.js` | **New** |
| `pages/app/agent-activity/tabs/AllActivityTab.js` | Pending strip, default Success filter |
| `pages/app/agent-activity/tabs/JobsInQueueTab.js` | List screen |
| `pages/app/agent-activity/tabs/UpcomingFollowUpTab.js` | **New** (reconciliation) |
| `pages/app/agent-onboarding/HappyAgentProfileDrawer.js` | **New** (reconciliation) |
| `pages/app/happpy-agent/HapppyAllJobs.js` | Jobs card / all jobs |
| `pages/app/happpy-agent/HapppyJobCardMobile.js` | Badges |
| `pages/app/happpy-agent/HapppySingleOppMobile.js` | Similar jobs / agent status |
| `pages/app/happpy-agent/configure-tabs/PasteJobLinkDrawer.js` | Success/error UX |
| `pages/app/job-agent/ReferFriendDrawer.js` | ₹500 referral copy |
| `pages/app/linkedin/HappyJobAgent.js` | LP content, jobs board, mobile hero |
| `pages/app/linkedin/happyAgentPageAssets.js` | UTS assets + Razorpay color |
| `scripts/port-uts-js.mjs` | **New** — UTS → Next porting automation |

Also synced (CSS / no git diff vs prior if identical): `HapppyAllJobs.css`, `HapppySingleOppMobile.css`, `JobAgentDashboard.css`, `jobs-board/*`, `OutreachAgent.css`.

## Verification (2026-09-29)

- `npm run sync:assets` — no new assets required
- `npm run build` — success on Node 22.21.1
