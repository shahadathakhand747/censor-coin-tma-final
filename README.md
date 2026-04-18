# Censor Coin TMA

A Telegram Mini App (TMA) for the **Censor Coin** ecosystem — users earn $CENSOR tokens by completing daily content-moderation tasks, entering claim codes, and completing social missions.

---

## Features

- **Splash screen** — animated amber coin with framer-motion entrance
- **Channel verification** — confirms Telegram channel membership via external worker before granting access
- **Daily censoring tasks** — 6 moderation tasks per day (5,000 coins each), rewarded after a Monetag interstitial ad
- **Claim codes** — 7 claim codes per day (3,000 coins each), validated against `PREFIX-YYYYMMDD-vN` format + 25 allowed prefixes
- **Social tasks** — one-time YouTube subscribe & TikTok follow bonuses (10,000 coins each)
- **Referral system** — 6,000 coins per referred user, tracked via Cloudflare Worker
- **TON wallet management** — save / update wallet address with a 14-day cooldown
- **i18n** — 6 languages: English, বাংলা, हिंदी, Español, العربية, Deutsch
- **Cloud storage** — state persisted in `Telegram.WebApp.CloudStorage` (≤ 4 096 bytes), falls back to localStorage in browser dev mode
- **Ad integrations** — Monetag Zone 10883491 (`show_10883491`) + OnClickA Spot 6116695 / Ad 436671
- **Sound effects** — sci-fi click via `use-sound`
- **Dark theme** — amber-400 (#FBBF24) primary on #0D0D0D background

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Routing | react-router-dom v7 |
| State | React Context + Telegram CloudStorage |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animation | framer-motion |
| Icons | @phosphor-icons/react |
| i18n | i18next + react-i18next |
| Telegram API | `window.Telegram.WebApp` (native) |
| Build | pnpm monorepo workspace |

---

## Project Structure

```
src/
├── App.tsx                  # Router + providers
├── main.tsx                 # Entry — calls WebApp.ready() / .expand()
├── index.css                # Dark theme tokens (HSL + hex)
├── components/
│   ├── BottomNav.tsx        # Home / Earn / Profile tab bar
│   ├── ButtonTap.tsx        # Touch-feedback wrapper
│   └── ProtectedRoute.tsx   # Redirects unverified users to /verify
├── context/
│   └── UserContext.tsx      # Global state, CloudStorage writes, daily reset
├── hooks/
│   ├── useTelegramWebApp.ts # WebApp + CloudStorage hooks (native API)
│   ├── useSoundEffects.ts   # use-sound wrapper
│   └── useDisableContextMenu.ts
├── i18n/
│   ├── i18n.ts              # i18next init — en, bn, hi, es, ar, de
│   └── locales/             # en.json  bn.json  hi.json  es.json  ar.json  de.json
├── pages/
│   ├── SplashScreen.tsx     # Animated logo → auto-navigate
│   ├── VerifyPage.tsx       # Channel join + membership verification
│   ├── HomePage.tsx         # Stats dashboard
│   ├── EarnPage.tsx         # Tasks / claim codes / social missions
│   └── ProfilePage.tsx      # Language, wallet, referral, legal
└── types/
    └── index.ts             # CensorCoinUserState, constants, ALLOWED_CLAIM_PREFIXES
```

---

## Environment / External Services

| Service | Purpose |
|---|---|
| `telegram-membership-bot-kwq6.onrender.com` | Verify channel membership |
| `tma-referral-worker.shahadathakhand7.workers.dev` | Register user + count daily referrals |
| `t.me/censorcoin` | Official Telegram channel (ID `-1003925758863`) |
| `t.me/Censorcoin_bot` | Bot for referral deep-links |
| Monetag Zone `10883491` | Rewarded interstitial ads |
| OnClickA Spot `6116695` / Ad `436671` | In-stream TMA rewarded ads |

---

## Coin Economy

| Action | Reward | Limit |
|---|---|---|
| Daily moderation task | 5,000 coins | 6 / day |
| Claim code | 3,000 coins | 7 / day |
| YouTube subscribe | 10,000 coins | once |
| TikTok follow | 10,000 coins | once |
| Referral | 6,000 coins | unlimited |

Daily counters reset at midnight **Asia/Dhaka** (UTC+6).

---

## Claim Code Format

```
PREFIX-YYYYMMDD-vN
```

- `PREFIX` must be one of 25 approved prefixes (`S9t`, `RSt`, `J9r`, `X4k`, `P7m`, …)
- `YYYYMMDD` must match the current date in Asia/Dhaka timezone
- `N` is the version slot 1–7 (one per day per slot)

---

## Development

```bash
pnpm install
pnpm --filter censor-coin-tma dev
```

The app runs in **browser dev mode** when `window.Telegram` is absent — the Verify page shows a "Continue in Browser (Dev Preview)" bypass button and falls back to `localStorage` for persistence.

---

## Build

```bash
pnpm --filter censor-coin-tma build
```

Output is written to `dist/`. The Vite config sets `base: '/'`.

---

## License

Proprietary — © Censor Coin. All rights reserved.
