# AGENTS.md

## Commands

- **Run bot:** `bun run dev` (watch mode) or `bun run start`
- **Run tests:** `bun test src/convert.test.ts`
- **Type-check:** `bunx tsc --noEmit`
- **Run a single test by name:** `bun test src/convert.test.ts --test-name-pattern "pattern"`

## Architecture

Two source files only:
- `src/index.ts` — Discord bot entry point. Listens for `MessageCreate` events, runs conversions, replies.
- `src/convert.ts` — All unit conversion logic. Exports `convertMessage` (value+unit pairs), `detectBareUnits` (unit names without values, e.g. "we measure in kg"), and `formatConversions`.

Tests live alongside source: `src/convert.test.ts`.

## Setup

Requires `DISCORD_TOKEN` in `.env` (see `.env.example`). The bot needs the **Message Content Intent** enabled in the Discord Developer Portal.

## Key design details

- `convertMessage` parses `NUMBER + UNIT` pairs from freeform text. `detectBareUnits` finds unit names without numbers and assumes a value of 1.
- Short ambiguous abbreviations (`in`, `m`, `c`, `f`, `l`, `g`, `ft`, `oz`, `pt`, `qt`, `st`, `yd`) are excluded from bare-unit detection to avoid false positives on common English words. They still work when preceded by a number.
- Deduplication: same value+unit pair appears once; same bare unit appears once.
- Target units per category are hardcoded in `CATEGORY_TARGETS` (e.g. metric length → `m`, imperial length → `ft`).

## Style

- TypeScript with tabs for indentation in `convert.ts`, spaces in `index.ts` — follow whatever the file already uses.
- No linter or formatter config exists. Keep it consistent per-file.
