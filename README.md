# Happpy Agent

Standalone Next.js port of the Happpy Agent pages from the Uplers ATS Laravel app.

| Route | Page | Auth |
| --- | --- | --- |
| `/` | Public Happpy landing | Public |
| `/talent/happpy` | GTM concise onboarding landing (Google sign-in → prefs → Gmail → extension) | Public |
| `/talent/happpy/gmail-callback` | Gmail-as-auth OAuth popup return | Public |
| `/talent/referral-ai-agent` | Authenticated agent page | Requires token |
| `/talent/gmail-connect/:token` | Gmail OAuth callback (popup) | Requires token |

The agent onboarding flow is a drawer rendered on top of both routes, not a separate route.

## Requirements

Node 22 (pinned in `.nvmrc`). Next.js 16 requires Node 20.9+, so the repo default of Node 16 will not work.

```bash
nvm use
```

## Setup

```bash
nvm use
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

In the **UTS** Laravel app, set to the same host you open in the browser (`localhost` and `127.0.0.1` are different origins):

```env
HAPPPY_FRONTEND_URL=http://127.0.0.1:3000
```

The Happpy dev server binds to `127.0.0.1` by default — open **http://127.0.0.1:3000**, not `localhost:3000`, so OAuth callbacks and API calls stay on one origin.

Start UTS on port 8001 (`php artisan serve --port=8001`) before running happpy.

### Environment variables

| Variable | Example (local) | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | `http://127.0.0.1:3000` | Happpy frontend origin (browser API + OAuth popup entry) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | *(same as UTS `MIX_ATS_GOOGLE_CLIENT_ID`)* | Google sign-in on `/talent/happpy` GTM landing |
| `GOOGLE_CLIENT_SECRET` (server only) | *(same as UTS Google OAuth client secret)* | Happpy API route exchanges GIS auth codes (`redirect_uri=postmessage`) before calling UTS |
| `UTS_API_BASE_URL` | `http://127.0.0.1:8001` | Server-only proxy target for `/api/*` |
| `UTS_WEB_BASE_URL` | `http://127.0.0.1:8001` | Server-only target for `/auth/*` rewrites |
| `HAPPPY_FRONTEND_URL` (UTS) | `http://127.0.0.1:3000` | Happpy origin — only when OAuth is started with `?happpy=1` |

Browser calls `{NEXT_PUBLIC_APP_URL}/api/...` same-origin; Next.js forwards to UTS. No CORS config is required on Laravel for API calls. Gmail OAuth uses Next.js rewrites for `/auth/*` and UTS redirects back to `/talent/gmail-connect/:token` on the happpy origin.

## Scripts

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Layout

```
app/                      Next App Router entry points
  api/[...path]/route.js  Catch-all proxy to UTS /api/*
  layout.js               <html>, fonts, global CSS, favicon, hero preload
  providers.js            Redux + reCAPTCHA + Toaster, auth hydration
  page.js                 /
  talent/happpy/page.js
  talent/happpy/gmail-callback/page.js
  talent/auth/google-callback/page.js
  talent/referral-ai-agent/page.js
  talent/gmail-connect/[token]/page.js
lib/
  utsProxy.js             Shared UTS API proxy helper
talent/                   Mirror of the ATS `resources/js/Talent/` tree
  components/ helpers/ pages/ store/ assets/ validation/
styles/
  happpy-tokens.css       Global Happpy colour variables
  fonts.css               @font-face declarations
public/
  fonts/                  Rubik, Montserrat, Telegraf
  images/talent/outreach/  Landing page imagery
```

`talent/` deliberately mirrors the source tree so every relative import inside it is unchanged from the ATS repo, which keeps future re-syncs cheap. It is not called `pages/` because that name is reserved by the Next.js Pages Router.

## Differences from the ATS source

- Routing uses `next/navigation` instead of `react-router`.
- The public landing moved from `/talent/happpy-ai-agent` to `/`.
- Onboarding steps 2-5 are placeholders; step 1 (account connection) is complete.
- `MIX_*` environment variables are `NEXT_PUBLIC_*` here.
- The auth Redux slice hydrates from `localStorage` after mount rather than at import time, which is required for server rendering.
- API requests are proxied through Next.js to UTS instead of calling Laravel directly from the browser.
