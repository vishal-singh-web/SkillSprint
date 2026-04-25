# CareerFlow 2026 — Next.js

Next.js 14 (App Router) version of the CareerFlow 2026 site. Same look, same flow, ported from the vanilla HTML/CSS/JS build.

## Stack

- Next.js 14 (App Router)
- React 18
- Plain CSS (one global stylesheet)
- `next/font` for Inter + JetBrains Mono
- Client-side auth using `localStorage` (no backend required)

## Demo login (already seeded)

- **Email:** `demo@careerflow.com`
- **Password:** `careerflow2026`

You can also create a brand-new account on the signup page; it persists in your browser&#39;s `localStorage`.

## Run locally

```bash
# 1. install deps
npm install

# 2. dev server
npm run dev
# → http://localhost:3000

# 3. production build
npm run build
npm start
```

Open in VS Code: `code careerflow-nextjs`.

## Project structure

```
careerflow-nextjs/
├── package.json
├── next.config.mjs
├── jsconfig.json
├── app/
│   ├── layout.js          # root layout, fonts, global CSS, toast mount
│   ├── globals.css        # all styles (ported from styles.css)
│   ├── page.js            # landing (/)
│   ├── login/page.js      # /login
│   ├── signup/page.js     # /signup
│   └── dashboard/page.js  # /dashboard (auth-gated)
├── components/
│   ├── Nav.js             # shared nav with right-slot variants
│   └── Toast.js           # tiny event-driven toast
└── lib/
    └── auth.js            # localStorage-backed session helpers
```

## Routes

| Path         | What                                       |
|--------------|--------------------------------------------|
| `/`          | Landing page (hero, enemies, 4 features, FAQ, CTA) |
| `/signup`    | Boot Agent — create an account             |
| `/login`     | Log in (with demo credentials shown)       |
| `/dashboard` | Interactive dashboard (auth-gated)         |

## What works end-to-end

- Boot Agent / Get Early Access buttons → signup → dashboard
- Signup creates a user in browser storage, signs you in, redirects
- Login validates against stored users (or the seeded demo user)
- Dashboard:
  - 3 Non-Negotiables — checkable, completing all three increments your streak
  - Skill-Gap Scanner — type a repo URL, hit Scan, get a streamed agent response and a fresh score
  - Vibe Check — pick a mood; two anxious/burnt days in a row triggers the auto-pivot card
  - Proof-of-Work Portfolio — personalized to your handle, live activity feed
- Logout returns you to landing
- All dashboard state persists per email across reloads

## Reset

In the browser console:

```js
localStorage.clear();
```

Refresh — the demo user re-seeds automatically.
