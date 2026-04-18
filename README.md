# Censor Coin TMA

Telegram Mini App for the Censor Coin ecosystem. Users earn coins by verifying Telegram membership, completing daily moderation tasks, entering daily claim codes, completing social missions, and referring friends.

## Stack

- React 19 + Vite
- Tailwind CSS v4
- shadcn/ui components
- framer-motion and Lottie animations
- Telegram Mini App APIs and CloudStorage
- i18next localization
- Monetag Telegram SDK and OnClickA TMA rewarded ads

## CloudStorage Schema

User state is persisted under the Telegram CloudStorage key:

```ts
censorCoinUser_v1
```

Stored JSON shape:

| Field | Type | Purpose |
|---|---|---|
| `schema_version` | `1` | Storage schema version |
| `membership_verified` | `boolean` | Whether channel membership was verified |
| `reg_status` | `"unregistered" \| "registered"` | Referral worker registration status |
| `referral_code` | `string` | User referral code for bot deep-links |
| `username` | `string` | Telegram username |
| `first_name` | `string` | Telegram first name |
| `profile_photo_url` | `string \| null` | Telegram profile image URL |
| `total_points` | `number` | Coin balance |
| `total_refers` | `number` | Referral count |
| `today_tasks_completed` | `number` | Daily Monetag task count, max 6 |
| `claim_codes_used` | `string[]` | Daily claim slots used, e.g. `v1` |
| `youtube_task_completed` | `boolean` | One-time YouTube task completion |
| `tiktok_task_completed` | `boolean` | One-time TikTok task completion |
| `last_daily_reset` | `string` | Asia/Dhaka date for daily reset |
| `last_referral_check_date` | `string` | Asia/Dhaka date for referral sync |
| `ton_address` | `string` | Saved TON wallet address |
| `last_ton_address_change` | `string` | ISO timestamp for 14-day cooldown |
| `language` | `en \| bn \| hi \| es \| ar \| de` | Saved UI language |

The serialized state is capped at 4,096 bytes. In browser development mode, storage falls back to `localStorage`.

## API Endpoints

External APIs used by the app:

| Endpoint | Method | Purpose |
|---|---|---|
| `https://telegram-membership-bot-kwq6.onrender.com/verify` | `POST` | Verifies Telegram channel membership for channel `-1003925758863` |
| `https://tma-referral-worker.shahadathakhand7.workers.dev/api/register` | `POST` | Registers the Telegram user and returns a referral code |
| `https://tma-referral-worker.shahadathakhand7.workers.dev/api/daily-referral-count?telegram_id=...` | `GET` | Returns daily referral count used to award referral coins |

Verification request body:

```json
{
  "user_id": 123456789,
  "channel_username": "-1003925758863"
}
```

Registration request body:

```json
{
  "telegram_id": 123456789,
  "username": "telegram_username",
  "first_name": "First",
  "referral_code_used": "OPTIONAL_START_PARAM"
}
```

## Ad Integration Details

### Monetag

- Package: `monetag-tg-sdk`
- Zone ID: `10883491`
- Daily moderation task rewards: `5,000` coins
- First 3 daily tasks use Rewarded Pop: `adHandler('pop')`
- Next 3 daily tasks use Rewarded Interstitial: `adHandler()`

Implementation location: `src/pages/EarnPage.tsx`

```ts
import createAdHandler from 'monetag-tg-sdk'
const adHandler = createAdHandler(10883491)
```

### OnClickA

- Spot ID: `6116695`
- Ad Code ID: `436671`
- Script loaded in `index.html`:

```html
<script src="https://js.onclckvd.com/in-stream-ad-admanager/tma.js"></script>
```

Claim-code rewards use the OnClickA TMA `window.initCdTma({ id })` flow in `src/components/AdComponent.tsx`. Successful rewarded ads call the claim reward handler and award `3,000` coins.

## UI and Sound

- shadcn/ui components are used for buttons, cards, dialogs, inputs, avatar, separator, tabs, and toast support.
- `src/components/ButtonTap.tsx` wraps the shadcn button variant styling with existing tap feedback.
- `public/scifi-click.mp3` is the only click sound used.
- `src/hooks/useGlobalClickSound.ts` plays the existing sci-fi sound on interactive taps not already handled by `ButtonTap`.

## Claim Codes

Format:

```txt
PREFIX-YYYYMMDD-vN
```

Rules:

- `PREFIX` must be one of the approved prefixes in `src/types/index.ts`.
- `YYYYMMDD` must match the current Asia/Dhaka date.
- `vN` must match the current claim slot from `v1` through `v7`.
- Each slot can be claimed once per day.

## Development

```bash
pnpm install
pnpm dev
```

Browser development mode appears when Telegram APIs are unavailable. The Verify screen provides a dev bypass and storage falls back to `localStorage`.

## Build

```bash
npm run build
```

or

```bash
pnpm build
```

The output is written to `dist/`.

## GitHub Pages Deployment

The repository includes `.github/workflows/deploy.yml`.

On every push to `main`, GitHub Actions:

1. Installs pnpm and Node.js.
2. Runs `pnpm install --frozen-lockfile`.
3. Builds with `BASE_PATH=/censor-coin-tma-final/`.
4. Uploads `dist/` as a Pages artifact.
5. Deploys to GitHub Pages.

Expected Pages URL:

```txt
https://shahadathakhand747.github.io/censor-coin-tma-final/
```

## License

Proprietary — © Censor Coin. All rights reserved.
