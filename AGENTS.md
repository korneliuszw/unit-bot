# AGENTS.md

## Commands

- **Run bot:** `bun run dev` (watch mode) or `bun run start`
- **Run all tests:** `bun test src/convert.test.ts src/currency.test.ts`
- **Run unit tests only:** `bun test src/convert.test.ts`
- **Run currency tests only:** `bun test src/currency.test.ts`
- **Type-check:** `bunx tsc --noEmit`
- **Run a single test by name:** `bun test src/convert.test.ts --test-name-pattern "pattern"`

## Architecture

Source files:
- `src/index.ts` — Discord bot entry point. Listens for `MessageCreate` events and `InteractionCreate` for slash commands. Runs unit + currency conversions, replies. Registers slash commands on `ClientReady`.
- `src/convert.ts` — Unit conversion logic. Exports `convertMessage` (value+unit pairs), `detectBareUnits` (unit names without values), `formatConversions`.
- `src/currency.ts` — Currency detection, conversion, and formatting. Exports `detectCurrencies`, `convertCurrencies`, `formatCurrencyConversions`, `SUPPORTED_CURRENCIES`.
- `src/rates.ts` — Exchange rate fetching from open.er-api.com (free, no API key). Auto-refreshes based on API's `time_next_update_unix`. Falls back to last known rates on failure.
- `src/store.ts` — Per-guild currency config via SQLite (`bun:sqlite`). Stores which currencies are enabled per server. Empty list = no currencies enabled (default). DMs get all currencies.

Tests: `src/convert.test.ts`, `src/currency.test.ts`.

Database: `guild_config.db` (SQLite, auto-created on startup).

## Setup

Requires `DISCORD_TOKEN` in `.env` (see `.env.example`). The bot needs the **Message Content Intent** enabled in the Discord Developer Portal. When generating the invite URL, include both `bot` and `applications.commands` scopes — the latter is required for slash commands to register and appear in Discord.

## Key design details

### Unit conversion
- `convertMessage` parses `NUMBER + UNIT` pairs from freeform text. `detectBareUnits` finds unit names without numbers and assumes a value of 1.
- Short ambiguous abbreviations (`in`, `m`, `c`, `f`, `l`, `g`, `ft`, `oz`, `pt`, `qt`, `st`, `yd`) are excluded from bare-unit detection to avoid false positives on common English words. They still work when preceded by a number.
- Deduplication: same value+unit pair appears once; same bare unit appears once.
- Target units per category are hardcoded in `CATEGORY_TARGETS` (e.g. metric length → `m`, imperial length → `ft`).

### Currency conversion
- `detectCurrencies` finds currency amounts via two patterns: suffix (`2000 yen`, `50 zł`, `100 USD`) and prefix symbols (`$50`, `€100`, `¥2000`).
- `convertCurrencies` converts each detected amount to all enabled target currencies using USD as the base cross-rate.
- `SUPPORTED_CURRENCIES` (24 currencies): USD, EUR, GBP, JPY, PLN, VND, KRW, CNY, INR, PKR, CAD, AUD, CHF, BRL, MXN, SEK, NOK, DKK, CZK, THB, TRY, RUB, ZAR, BTC.
- Per-guild config via SQLite: admins use `/currencies-add`, `/currencies-remove`, `/currencies-list`, `/currencies-supported`, `/currencies-reset`. Default is no currencies enabled; admins must explicitly enable currencies. `/currencies-add` and `/currencies-remove` accept comma-separated codes (e.g. `USD,EUR,GBP`). `/currencies-supported` lists all available currencies. `/currencies-reset` clears the enabled list (disables all conversion).
- `try` suffix only matches when preceded by a number (`500 TRY`), avoiding false positive on the English word "try".
- `$` symbol assumed to be USD. Use `C$` for CAD, `A$` for AUD. `₨` symbol for PKR. `₿` symbol for BTC.
- BTC uses high-precision formatting (up to 8 decimal places) due to small fractional values.
- Number formatting uses `Intl.NumberFormat` with per-currency locale.

## Style

- TypeScript with tabs for indentation in `convert.ts` and `currency.ts`, spaces in `index.ts` — follow whatever the file already uses.
- No linter or formatter config exists. Keep it consistent per-file.
