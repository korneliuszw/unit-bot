export interface CurrencyMatch {
	original: string;
	value: number;
	currency: string;
}

export interface CurrencyConversionTarget {
	value: number;
	currency: string;
}

export interface CurrencyConversion {
	original: string;
	value: number;
	fromCurrency: string;
	targets: CurrencyConversionTarget[];
}

interface CurrencyDef {
	code: string;
	names: string[];
	symbol?: string;
	locale: string;
}

export const SUPPORTED_CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"JPY",
	"PLN",
	"VND",
	"KRW",
	"CNY",
	"INR",
	"PKR",
	"CAD",
	"AUD",
	"CHF",
	"BRL",
	"MXN",
	"SEK",
	"NOK",
	"DKK",
	"CZK",
	"THB",
	"TRY",
	"RUB",
	"ZAR",
	"BTC",
];

const CURRENCY_DEFS: CurrencyDef[] = [
	{ code: "USD", names: ["usd", "dollar", "dollars"], symbol: "$", locale: "en-US" },
	{ code: "EUR", names: ["eur", "euro", "euros"], symbol: "€", locale: "de-DE" },
	{ code: "GBP", names: ["gbp", "pound", "pounds", "quid"], symbol: "£", locale: "en-GB" },
	{ code: "JPY", names: ["jpy", "yen"], symbol: "¥", locale: "ja-JP" },
	{ code: "PLN", names: ["pln", "zł", "zl", "złoty", "złote", "zloty"], locale: "pl-PL" },
	{ code: "VND", names: ["vnd", "dong"], symbol: "₫", locale: "vi-VN" },
	{ code: "KRW", names: ["krw", "won"], symbol: "₩", locale: "ko-KR" },
	{ code: "CNY", names: ["cny", "yuan", "rmb"], locale: "zh-CN" },
	{ code: "INR", names: ["inr", "rupee", "rupees"], symbol: "₹", locale: "en-IN" },
	{ code: "PKR", names: ["pkr", "pakistani rupee", "pakistani rupees"], symbol: "₨", locale: "en-PK" },
	{ code: "CAD", names: ["cad"], symbol: "C$", locale: "en-CA" },
	{ code: "AUD", names: ["aud"], symbol: "A$", locale: "en-AU" },
	{ code: "CHF", names: ["chf"], locale: "de-CH" },
	{ code: "BRL", names: ["brl", "real", "reais"], symbol: "R$", locale: "pt-BR" },
	{ code: "MXN", names: ["mxn", "peso", "pesos"], locale: "es-MX" },
	{ code: "SEK", names: ["sek", "krona", "kronor"], locale: "sv-SE" },
	{ code: "NOK", names: ["nok", "krone", "kroner"], locale: "nb-NO" },
	{ code: "DKK", names: ["dkk"], locale: "da-DK" },
	{ code: "CZK", names: ["czk", "koruna"], locale: "cs-CZ" },
	{ code: "THB", names: ["thb", "baht"], symbol: "฿", locale: "th-TH" },
	{ code: "TRY", names: ["try", "lira"], symbol: "₺", locale: "tr-TR" },
	{ code: "RUB", names: ["rub", "ruble", "rubles"], locale: "ru-RU" },
	{ code: "ZAR", names: ["zar", "rand", "rands"], locale: "en-ZA" },
	{ code: "BTC", names: ["btc", "bitcoin"], symbol: "₿", locale: "en-US" },
];

const CURRENCY_SYMBOLS: CurrencyDef[] = CURRENCY_DEFS.filter(
	(d) => d.symbol !== undefined,
);

const NAME_LOOKUP = new Map<string, string>();
for (const def of CURRENCY_DEFS) {
	for (const name of def.names) {
		NAME_LOOKUP.set(name.toLowerCase(), def.code);
	}
}

const SYMBOL_LOOKUP = new Map<string, string>();
for (const def of CURRENCY_SYMBOLS) {
	SYMBOL_LOOKUP.set(def.symbol!, def.code);
}

const SUFFIX_NAMES_SORTED = CURRENCY_DEFS.flatMap((d) => d.names).sort(
	(a, b) => b.length - a.length,
);
const SUFFIX_NAMES_ESCAPED = SUFFIX_NAMES_SORTED.map((n) =>
	n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
);
const SUFFIX_ALT = SUFFIX_NAMES_ESCAPED.join("|");

const PREFIX_SYMBOLS_SORTED = CURRENCY_SYMBOLS.map((d) => d.symbol!).sort(
	(a, b) => b.length - a.length,
);
const PREFIX_SYMBOLS_ESCAPED = PREFIX_SYMBOLS_SORTED.map((s) =>
	s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
);
const PREFIX_SYMBOL_ALT = PREFIX_SYMBOLS_ESCAPED.join("|");

const NUMBER_PATTERN = String.raw`-?\d[\d,.]*\d|-?\d`;
const POSITIVE_NUMBER = String.raw`\d[\d,.]*\d|\d`;

const SUFFIX_PATTERN = new RegExp(
	`(?<=^|\\s)(${NUMBER_PATTERN})\\s*(${SUFFIX_ALT})(?=\\s|$|[.,!?])`,
	"gi",
);

const PREFIX_PATTERN = new RegExp(
	`(?:^|\\s)(-?)(${PREFIX_SYMBOL_ALT})(${POSITIVE_NUMBER})(?=[\\s.,!?]|$)`,
	"g",
);

function parseNumber(raw: string): number {
	const cleaned = raw.replace(/,/g, "");
	return parseFloat(cleaned);
}

function resolveSuffixCode(name: string): string | undefined {
	return NAME_LOOKUP.get(name.toLowerCase());
}

export function detectCurrencies(text: string): CurrencyMatch[] {
	const results: CurrencyMatch[] = [];
	const seen = new Set<string>();

	const suffixRegex = new RegExp(SUFFIX_PATTERN.source, SUFFIX_PATTERN.flags);
	let match: RegExpExecArray | null;

	while ((match = suffixRegex.exec(text)) !== null) {
		const value = parseNumber(match[1]);
		const currencyName = match[2];
		const code = resolveSuffixCode(currencyName);
		if (!code) continue;

		const key = `${value}:${code}`;
		if (seen.has(key)) continue;
		seen.add(key);

		results.push({
			original: match[0].trim(),
			value,
			currency: code,
		});
	}

	const prefixRegex = new RegExp(PREFIX_PATTERN.source, PREFIX_PATTERN.flags);
	while ((match = prefixRegex.exec(text)) !== null) {
		const neg = match[1];
		const symbol = match[2];
		const rawNum = match[3];
		const code = SYMBOL_LOOKUP.get(symbol);
		if (!code) continue;

		let value = parseNumber(rawNum);
		if (neg === "-") value = -value;

		const key = `${value}:${code}`;
		if (seen.has(key)) continue;
		seen.add(key);

		const original = `${neg}${symbol}${rawNum}`;
		results.push({
			original,
			value,
			currency: code,
		});
	}

	return results;
}

export function convertCurrencies(
	matches: CurrencyMatch[],
	rates: Record<string, number>,
	enabledCurrencies: string[],
): CurrencyConversion[] {
	if (enabledCurrencies.length === 0) return [];

	const targetCurrencies = enabledCurrencies;

	return matches.map((m) => {
		const sourceRate = rates[m.currency];
		if (!sourceRate) {
			return {
				original: m.original,
				value: m.value,
				fromCurrency: m.currency,
				targets: [],
			};
		}

		const targets: CurrencyConversionTarget[] = [];
		for (const targetCode of targetCurrencies) {
			if (targetCode === m.currency) continue;
			const targetRate = rates[targetCode];
			if (!targetRate) continue;

			const valueInUSD = m.value / sourceRate;
			const converted = valueInUSD * targetRate;
			targets.push({ value: converted, currency: targetCode });
		}

		return {
			original: m.original,
			value: m.value,
			fromCurrency: m.currency,
			targets,
		};
	});
}

const NO_DECIMAL_CURRENCIES = new Set(["JPY", "KRW", "VND"]);
const HIGH_PRECISION_CURRENCIES = new Set(["BTC"]);

function formatCurrencyValue(value: number, currencyCode: string): string {
	const def = CURRENCY_DEFS.find((d) => d.code === currencyCode);
	const locale = def?.locale ?? "en-US";

	if (NO_DECIMAL_CURRENCIES.has(currencyCode)) {
		return new Intl.NumberFormat(locale, {
			maximumFractionDigits: 0,
			minimumFractionDigits: 0,
		}).format(Math.round(value));
	}

	if (HIGH_PRECISION_CURRENCIES.has(currencyCode)) {
		return new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 8,
		}).format(value);
	}

	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}

export function formatCurrencyConversions(
	conversions: CurrencyConversion[],
): string {
	if (conversions.length === 0) return "";

	const lines = conversions.map((c) => {
		const targetParts = c.targets.map(
			(t) => `${formatCurrencyValue(t.value, t.currency)} ${t.currency}`,
		);
		return `**${c.original}** ≈ ${targetParts.join(" / ")}`;
	});

	return lines.join("\n");
}
