# Freedom Unit Nerd Bot

A Discord bot that automatically converts between metric and imperial units and between currencies in chat messages. No commands needed — just type normally. My US friend really struggled when we spoke of kilograms and we struggled when he spoke of lbs. So, here's the fix. 
This bot only works for basic units and assumes the target unit. It does not support converting one unit to another. It does not support complex units. That's not the point.

## What it does

When someone sends a message containing a value with a unit, the bot replies with the equivalent in the other system.

**With a value:**
- "I weigh **88kg**" → bot replies: **88 kg** = **194.01 lbs**
- "It's **5 miles** away" → bot replies: **5 miles** = **8.05 km**
- "**32 celsius** outside" → bot replies: **32 celsius** = **89.6 °F**

**Without a value (assumes 1):**
- "We measure things in **kg**" → bot replies: **1 kg** = **2.2 lbs**
- "What is a **mile**?" → bot replies: **1 mile** = **1.61 km**

### Currency conversion

When someone mentions a currency amount, the bot replies with conversions to all enabled currencies for that server.

**Examples:**
- "I bought this figure for **2000 yen**" → bot replies: **2000 yen** ≈ $13.41 USD / €11.40 EUR / ...
- "**50 zł**" → bot replies: **50 zł** ≈ $12.50 USD / €10.63 EUR / ...
- "**$50**" → bot replies: **$50** ≈ €42.50 EUR / £37.00 GBP / ...
- "Wydalem wczoraj **200zl**, **50 zł** na to, **40 zl** na to, a **100 PLN** na to" → four conversions

## Supported units

| Category | Metric | Imperial |
|---|---|---|
| Length | km, m, cm, mm | mi, yd, ft, in |
| Weight | kg, g, mg | lbs, oz, stone |
| Temperature | °C / celsius | °F / fahrenheit |
| Volume | L, ml | gal, qt, pt, cup, fl oz |

Full word forms work too: `kilograms`, `meters`, `pounds`, `celsius`, `fahrenheit`, `liters`, `gallons`, etc.

## Supported currencies

| Code | Names | Symbol |
|---|---|---|
| USD | dollar, dollars | $ |
| EUR | euro, euros | € |
| GBP | pound, pounds, quid | £ |
| JPY | yen | ¥ |
| PLN | zł, zl, złoty, złote, zloty | — |
| VND | dong | ₫ |
| KRW | won | ₩ |
| CNY | yuan, rmb | — |
| INR | rupee, rupees | ₹ |
| CAD | cad | C$ |
| AUD | aud | A$ |
| CHF | chf | — |
| BRL | real, reais | R$ |
| MXN | peso, pesos | — |
| SEK | krona, kronor | — |
| NOK | krone, kroner | — |
| DKK | dkk | — |
| CZK | koruna | Kč |
| THB | baht | ฿ |
| TRY | lira | ₺ |
| RUB | ruble, rubles | — |

## Currency slash commands

By default, all currencies are enabled. Server admins can limit which currencies appear using slash commands (requires **Manage Server** permission):

- `/currencies-add <code>` — Add a currency to the server's list
- `/currencies-remove <code>` — Remove a currency from the server's list
- `/currencies-list` — Show currently enabled currencies
- `/currencies-reset` — Reset to all currencies

## Setup

### 1. Prerequisites

- [Bun](https://bun.sh/) installed
- A [Discord account](https://discord.com/)

### 2. Create a Discord application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and click **New Application**
2. Give it a name and click **Create**
3. Go to the **Bot** tab and click **Reset Token** → copy the token
4. Under **Privileged Gateway Intents**, enable **Message Content Intent**
5. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Send Messages`, `Read Message History`
   - Copy the generated URL and open it to invite the bot to your server

   The `applications.commands` scope is required for slash commands (`/currencies-add`, `/currencies-remove`, `/currencies-list`, `/currencies-reset`) to appear in Discord.

### 3. Configure and run

```bash
git clone <repo-url>
cd unit-bot
bun install
cp .env.example .env
```

Edit `.env` and paste your bot token:

```
DISCORD_TOKEN=your-actual-token-here
```

Start the bot:

```bash
bun run dev
```

`bun run dev` runs with watch mode (auto-restarts on file changes). Use `bun run start` for production.