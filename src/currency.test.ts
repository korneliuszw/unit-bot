import { describe, expect, test } from "bun:test";
import {
	detectCurrencies,
	convertCurrencies,
	formatCurrencyConversions,
	SUPPORTED_CURRENCIES,
	type CurrencyMatch,
	type CurrencyConversion,
} from "../src/currency";

const MOCK_RATES: Record<string, number> = {
	USD: 1,
	EUR: 0.85,
	GBP: 0.74,
	JPY: 150,
	PLN: 4,
	VND: 25000,
	KRW: 1300,
	CNY: 7.2,
	INR: 83,
	CAD: 1.35,
	AUD: 1.55,
	CHF: 0.88,
	BRL: 5,
	MXN: 17,
	SEK: 10.5,
	NOK: 10.8,
	DKK: 6.3,
	CZK: 23,
	THB: 35,
	TRY: 30,
	RUB: 80,
	ZAR: 18.5,
	BTC: 0.000015,
};

const ALL_CODES = [...SUPPORTED_CURRENCIES];

describe("SUPPORTED_CURRENCIES", () => {
	test("contains 23 currencies", () => {
		expect(SUPPORTED_CURRENCIES).toHaveLength(23);
	});

	test("includes required currencies", () => {
		expect(SUPPORTED_CURRENCIES).toContain("USD");
		expect(SUPPORTED_CURRENCIES).toContain("EUR");
		expect(SUPPORTED_CURRENCIES).toContain("GBP");
		expect(SUPPORTED_CURRENCIES).toContain("JPY");
		expect(SUPPORTED_CURRENCIES).toContain("PLN");
		expect(SUPPORTED_CURRENCIES).toContain("VND");
		expect(SUPPORTED_CURRENCIES).toContain("KRW");
		expect(SUPPORTED_CURRENCIES).toContain("CNY");
		expect(SUPPORTED_CURRENCIES).toContain("INR");
		expect(SUPPORTED_CURRENCIES).toContain("CAD");
		expect(SUPPORTED_CURRENCIES).toContain("AUD");
		expect(SUPPORTED_CURRENCIES).toContain("CHF");
		expect(SUPPORTED_CURRENCIES).toContain("BRL");
		expect(SUPPORTED_CURRENCIES).toContain("MXN");
		expect(SUPPORTED_CURRENCIES).toContain("SEK");
		expect(SUPPORTED_CURRENCIES).toContain("NOK");
		expect(SUPPORTED_CURRENCIES).toContain("DKK");
		expect(SUPPORTED_CURRENCIES).toContain("CZK");
		expect(SUPPORTED_CURRENCIES).toContain("THB");
		expect(SUPPORTED_CURRENCIES).toContain("TRY");
		expect(SUPPORTED_CURRENCIES).toContain("RUB");
		expect(SUPPORTED_CURRENCIES).toContain("ZAR");
		expect(SUPPORTED_CURRENCIES).toContain("BTC");
	});
});

describe("detectCurrencies", () => {
	describe("suffix: currency codes", () => {
		test("USD", () => {
			const m = detectCurrencies("It costs 50 USD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("USD");
		});

		test("EUR", () => {
			const m = detectCurrencies("That is 100 EUR");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(100);
			expect(m[0].currency).toBe("EUR");
		});

		test("GBP", () => {
			const m = detectCurrencies("Price is 30 GBP");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(30);
			expect(m[0].currency).toBe("GBP");
		});

		test("JPY", () => {
			const m = detectCurrencies("I bought this figure for 2000 JPY");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(2000);
			expect(m[0].currency).toBe("JPY");
		});

		test("PLN", () => {
			const m = detectCurrencies("Wydalem 100 PLN");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(100);
			expect(m[0].currency).toBe("PLN");
		});

		test("VND", () => {
			const m = detectCurrencies("500000 VND");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500000);
			expect(m[0].currency).toBe("VND");
		});

		test("KRW", () => {
			const m = detectCurrencies("30000 KRW");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(30000);
			expect(m[0].currency).toBe("KRW");
		});

		test("CNY", () => {
			const m = detectCurrencies("500 CNY");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("CNY");
		});

		test("INR", () => {
			const m = detectCurrencies("1000 INR");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(1000);
			expect(m[0].currency).toBe("INR");
		});

		test("CAD", () => {
			const m = detectCurrencies("25 CAD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(25);
			expect(m[0].currency).toBe("CAD");
		});

		test("AUD", () => {
			const m = detectCurrencies("40 AUD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(40);
			expect(m[0].currency).toBe("AUD");
		});

		test("CHF", () => {
			const m = detectCurrencies("75 CHF");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(75);
			expect(m[0].currency).toBe("CHF");
		});

		test("BRL", () => {
			const m = detectCurrencies("200 BRL");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(200);
			expect(m[0].currency).toBe("BRL");
		});

		test("MXN", () => {
			const m = detectCurrencies("300 MXN");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(300);
			expect(m[0].currency).toBe("MXN");
		});

		test("SEK", () => {
			const m = detectCurrencies("500 SEK");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("SEK");
		});

		test("NOK", () => {
			const m = detectCurrencies("600 NOK");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(600);
			expect(m[0].currency).toBe("NOK");
		});

		test("DKK", () => {
			const m = detectCurrencies("150 DKK");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(150);
			expect(m[0].currency).toBe("DKK");
		});

		test("CZK", () => {
			const m = detectCurrencies("250 CZK");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(250);
			expect(m[0].currency).toBe("CZK");
		});

		test("THB", () => {
			const m = detectCurrencies("800 THB");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(800);
			expect(m[0].currency).toBe("THB");
		});

		test("TRY", () => {
			const m = detectCurrencies("500 TRY");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("TRY");
		});

		test("RUB", () => {
			const m = detectCurrencies("5000 RUB");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(5000);
			expect(m[0].currency).toBe("RUB");
		});

		test("ZAR", () => {
			const m = detectCurrencies("500 ZAR");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("ZAR");
		});

		test("BTC", () => {
			const m = detectCurrencies("0.5 BTC");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(0.5);
			expect(m[0].currency).toBe("BTC");
		});
	});

	describe("suffix: full currency names", () => {
		test("yen", () => {
			const m = detectCurrencies("2000 yen");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(2000);
			expect(m[0].currency).toBe("JPY");
		});

		test("dollar / dollars", () => {
			const m1 = detectCurrencies("50 dollar");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("USD");

			const m2 = detectCurrencies("50 dollars");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("USD");
		});

		test("euro / euros", () => {
			const m1 = detectCurrencies("100 euro");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("EUR");

			const m2 = detectCurrencies("100 euros");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("EUR");
		});

		test("pound / pounds", () => {
			const m1 = detectCurrencies("30 pound");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("GBP");

			const m2 = detectCurrencies("30 pounds");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("GBP");
		});

		test("quid (GBP slang)", () => {
			const m = detectCurrencies("20 quid");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(20);
			expect(m[0].currency).toBe("GBP");
		});

		test("zloty / zloty without diacritic", () => {
			const m1 = detectCurrencies("50 zloty");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("PLN");
		});

		test("dong", () => {
			const m = detectCurrencies("50000 dong");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("VND");
		});

		test("won", () => {
			const m = detectCurrencies("30000 won");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("KRW");
		});

		test("yuan", () => {
			const m = detectCurrencies("100 yuan");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("CNY");
		});

		test("rmb", () => {
			const m = detectCurrencies("100 rmb");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("CNY");
		});

		test("rupee / rupees", () => {
			const m1 = detectCurrencies("500 rupee");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("INR");

			const m2 = detectCurrencies("500 rupees");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("INR");
		});

		test("peso / pesos", () => {
			const m1 = detectCurrencies("100 peso");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("MXN");

			const m2 = detectCurrencies("100 pesos");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("MXN");
		});

		test("krona / kronor (SEK)", () => {
			const m1 = detectCurrencies("50 krona");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("SEK");

			const m2 = detectCurrencies("50 kronor");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("SEK");
		});

		test("krone / kroner (NOK)", () => {
			const m1 = detectCurrencies("50 krone");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("NOK");

			const m2 = detectCurrencies("50 kroner");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("NOK");
		});

		test("baht", () => {
			const m = detectCurrencies("100 baht");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("THB");
		});

		test("lira (TRY)", () => {
			const m = detectCurrencies("500 lira");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("TRY");
		});

		test("real / reais (BRL)", () => {
			const m1 = detectCurrencies("100 real");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("BRL");

			const m2 = detectCurrencies("100 reais");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("BRL");
		});
	});

	describe("suffix: Polish zł variants", () => {
		test("zł with diacritic", () => {
			const m = detectCurrencies("50 zł");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("PLN");
		});

		test("zl without diacritic", () => {
			const m = detectCurrencies("50 zl");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("PLN");
		});

		test("złoty", () => {
			const m = detectCurrencies("50 złoty");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("PLN");
		});

		test("złote", () => {
			const m = detectCurrencies("50 złote");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("PLN");
		});

		test("złoty without diacritic zloty", () => {
			const m = detectCurrencies("50 zloty");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("PLN");
		});

		test("ruble / rubles", () => {
			const m1 = detectCurrencies("5000 ruble");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("RUB");

			const m2 = detectCurrencies("5000 rubles");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("RUB");
		});

		test("rand / rands (ZAR)", () => {
			const m1 = detectCurrencies("500 rand");
			expect(m1).toHaveLength(1);
			expect(m1[0].currency).toBe("ZAR");

			const m2 = detectCurrencies("500 rands");
			expect(m2).toHaveLength(1);
			expect(m2[0].currency).toBe("ZAR");
		});

		test("bitcoin (BTC)", () => {
			const m = detectCurrencies("0.5 bitcoin");
			expect(m).toHaveLength(1);
			expect(m[0].currency).toBe("BTC");
		});
	});

	describe("suffix: no space between number and code", () => {
		test("2000yen", () => {
			const m = detectCurrencies("I paid 2000yen for this");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(2000);
			expect(m[0].currency).toBe("JPY");
		});

		test("50zł", () => {
			const m = detectCurrencies("cost 50zł");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("PLN");
		});

		test("50zl without diacritic", () => {
			const m = detectCurrencies("cost 50zl");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("PLN");
		});

		test("100EUR", () => {
			const m = detectCurrencies("that was 100EUR");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(100);
			expect(m[0].currency).toBe("EUR");
		});

		test("30USD", () => {
			const m = detectCurrencies("costs 30USD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(30);
			expect(m[0].currency).toBe("USD");
		});
	});

	describe("suffix: case insensitivity", () => {
		test("usd / Usd / USD", () => {
			expect(detectCurrencies("50 usd")).toHaveLength(1);
			expect(detectCurrencies("50 Usd")[0].currency).toBe("USD");
			expect(detectCurrencies("50 USD")).toHaveLength(1);
		});

		test("eur / Eur / EUR", () => {
			expect(detectCurrencies("100 eur")).toHaveLength(1);
			expect(detectCurrencies("100 Eur")).toHaveLength(1);
			expect(detectCurrencies("100 EUR")).toHaveLength(1);
		});

		test("jpy / JPY / Yen / YEN", () => {
			expect(detectCurrencies("2000 jpy")).toHaveLength(1);
			expect(detectCurrencies("2000 JPY")).toHaveLength(1);
			expect(detectCurrencies("2000 yen")).toHaveLength(1);
			expect(detectCurrencies("2000 Yen")).toHaveLength(1);
			expect(detectCurrencies("2000 YEN")).toHaveLength(1);
		});
	});

	describe("prefix: currency symbols", () => {
		test("$50 → USD", () => {
			const m = detectCurrencies("That costs $50");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("USD");
		});

		test("€100 → EUR", () => {
			const m = detectCurrencies("It was €100");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(100);
			expect(m[0].currency).toBe("EUR");
		});

		test("£75 → GBP", () => {
			const m = detectCurrencies("Price is £75");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(75);
			expect(m[0].currency).toBe("GBP");
		});

		test("¥2000 → JPY", () => {
			const m = detectCurrencies("I bought it for ¥2000");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(2000);
			expect(m[0].currency).toBe("JPY");
		});

		test("₩50000 → KRW", () => {
			const m = detectCurrencies("₩50000");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50000);
			expect(m[0].currency).toBe("KRW");
		});

		test("₹500 → INR", () => {
			const m = detectCurrencies("₹500");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("INR");
		});

		test("R$200 → BRL", () => {
			const m = detectCurrencies("R$200");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(200);
			expect(m[0].currency).toBe("BRL");
		});

		test("฿300 → THB", () => {
			const m = detectCurrencies("฿300");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(300);
			expect(m[0].currency).toBe("THB");
		});

		test("₫500000 → VND", () => {
			const m = detectCurrencies("₫500000");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500000);
			expect(m[0].currency).toBe("VND");
		});

		test("₺500 → TRY", () => {
			const m = detectCurrencies("₺500");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(500);
			expect(m[0].currency).toBe("TRY");
		});

		test("C$25 → CAD", () => {
			const m = detectCurrencies("C$25");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(25);
			expect(m[0].currency).toBe("CAD");
		});

		test("A$40 → AUD", () => {
			const m = detectCurrencies("A$40");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(40);
			expect(m[0].currency).toBe("AUD");
		});

		test("₿0.5 → BTC", () => {
			const m = detectCurrencies("₿0.5");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(0.5);
			expect(m[0].currency).toBe("BTC");
		});
	});

	describe("prefix: symbol at various positions", () => {
		test("$50 at start of message", () => {
			const m = detectCurrencies("$50 for this item");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
		});

		test("$50 at end of message", () => {
			const m = detectCurrencies("it cost me $50");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
		});

		test("$50 followed by punctuation", () => {
			const m1 = detectCurrencies("it cost $50.");
			expect(m1).toHaveLength(1);
			const m2 = detectCurrencies("it cost $50!");
			expect(m2).toHaveLength(1);
			const m3 = detectCurrencies("it cost $50?");
			expect(m3).toHaveLength(1);
			const m4 = detectCurrencies("it cost $50,");
			expect(m4).toHaveLength(1);
		});
	});

	describe("deduplication", () => {
		test("same value and same currency appears once", () => {
			const m = detectCurrencies("I said 50 USD and then 50 USD again");
			expect(m).toHaveLength(1);
		});

		test("different values same currency both reported", () => {
			const m = detectCurrencies("50 USD and then 100 USD");
			expect(m).toHaveLength(2);
			expect(m[0].value).toBe(50);
			expect(m[1].value).toBe(100);
		});

		test("same value different currencies both reported", () => {
			const m = detectCurrencies("50 USD and 50 EUR");
			expect(m).toHaveLength(2);
		});

		test("$50 and 50 USD deduplicate", () => {
			const m = detectCurrencies("it's $50 or 50 USD depending on view");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("USD");
		});
	});

	describe("multiple currencies in one message", () => {
		test("two different currencies", () => {
			const m = detectCurrencies("I paid 2000 yen for a 15 dollar figure");
			expect(m).toHaveLength(2);
			expect(m[0].currency).toBe("JPY");
			expect(m[1].currency).toBe("USD");
		});

		test("three different currencies", () => {
			const m = detectCurrencies("50 USD is about 46 EUR or 40 GBP");
			expect(m).toHaveLength(3);
		});

		test("mixed prefix and suffix", () => {
			const m = detectCurrencies("¥2000 is about $13 USD");
			expect(m).toHaveLength(2);
		});
	});

	describe("Polish casual speech", () => {
		test("Wydalem wczoraj 200zl, 50 zł na to, 40 zl na to, a 100 PLN na to", () => {
			const m = detectCurrencies(
				"Wydalem wczoraj 200zl, 50 zł na to, 40 zl na to, a 100 PLN na to",
			);
			expect(m).toHaveLength(4);

			expect(m[0].value).toBe(200);
			expect(m[0].currency).toBe("PLN");

			expect(m[1].value).toBe(50);
			expect(m[1].currency).toBe("PLN");

			expect(m[2].value).toBe(40);
			expect(m[2].currency).toBe("PLN");

			expect(m[3].value).toBe(100);
			expect(m[3].currency).toBe("PLN");
		});

		test("50zł no space", () => {
			const m = detectCurrencies("kosztuje 50zł");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50);
			expect(m[0].currency).toBe("PLN");
		});
	});

	describe("negative and zero values", () => {
		test("negative value with suffix", () => {
			const m = detectCurrencies("I lost -50 USD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(-50);
		});

		test("negative value with prefix symbol", () => {
			const m = detectCurrencies("I owe -$50");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(-50);
		});

		test("zero value", () => {
			const m = detectCurrencies("0 USD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(0);
		});
	});

	describe("decimal values", () => {
		test("decimal with suffix", () => {
			const m = detectCurrencies("50.99 USD");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(50.99);
		});

		test("decimal with prefix symbol", () => {
			const m = detectCurrencies("$19.99");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(19.99);
		});

		test("large value", () => {
			const m = detectCurrencies("1000000 VND");
			expect(m).toHaveLength(1);
			expect(m[0].value).toBe(1000000);
		});
	});

	describe("false positives", () => {
		test("no currency in plain text", () => {
			expect(detectCurrencies("hello world")).toHaveLength(0);
		});

		test("number without currency", () => {
			expect(detectCurrencies("I have 5 cats")).toHaveLength(0);
		});

		test("currency word without number", () => {
			expect(detectCurrencies("I like yen")).toHaveLength(0);
		});

		test("'in' should not match INR", () => {
			expect(detectCurrencies("I live in Paris")).toHaveLength(0);
		});

		test("'try' should not match TRY as bare word", () => {
			expect(detectCurrencies("I will try again")).toHaveLength(0);
		});

		test("number followed by non-currency word", () => {
			expect(detectCurrencies("5 meters long")).toHaveLength(0);
		});

		test("URL should not match", () => {
			expect(
				detectCurrencies("check https://example.com/500usd"),
			).toHaveLength(0);
		});

		test("'usd' embedded in word should not match", () => {
			expect(detectCurrencies("sustained damage")).toHaveLength(0);
		});

		test("'eur' embedded in word should not match", () => {
			expect(detectCurrencies("eurozone is great")).toHaveLength(0);
		});
	});

	describe("original text capture", () => {
		test("suffix captures original text", () => {
			const m = detectCurrencies("costs 2000 yen");
			expect(m[0].original).toBe("2000 yen");
		});

		test("suffix code captures original text", () => {
			const m = detectCurrencies("costs 50 USD");
			expect(m[0].original).toBe("50 USD");
		});

		test("suffix zł captures original text", () => {
			const m = detectCurrencies("costs 50 zł");
			expect(m[0].original).toBe("50 zł");
		});

		test("prefix symbol captures original text", () => {
			const m = detectCurrencies("costs $50");
			expect(m[0].original).toBe("$50");
		});

		test("prefix € captures original text", () => {
			const m = detectCurrencies("costs €100");
			expect(m[0].original).toBe("€100");
		});
	});
});

describe("convertCurrencies", () => {
	test("basic JPY to USD conversion", () => {
		const matches = detectCurrencies("2000 yen");
		const conversions = convertCurrencies(matches, MOCK_RATES, ALL_CODES);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].fromCurrency).toBe("JPY");
		expect(conversions[0].value).toBe(2000);

		const usdTarget = conversions[0].targets.find((t) => t.currency === "USD");
		expect(usdTarget).toBeDefined();
		expect(usdTarget!.value).toBeCloseTo(2000 / 150, 2);
	});

	test("basic USD to EUR conversion", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, ALL_CODES);
		expect(conversions).toHaveLength(1);

		const eurTarget = conversions[0].targets.find((t) => t.currency === "EUR");
		expect(eurTarget).toBeDefined();
		expect(eurTarget!.value).toBeCloseTo(100 * 0.85, 2);
	});

	test("source currency is excluded from targets", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, ALL_CODES);
		expect(conversions).toHaveLength(1);
		const usdTarget = conversions[0].targets.find((t) => t.currency === "USD");
		expect(usdTarget).toBeUndefined();
	});

	test("converts to all currencies when full list is provided", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, ALL_CODES);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(22);
	});

	test("returns empty array when enabled currencies is empty", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, []);
		expect(conversions).toHaveLength(0);
	});

	test("converts only to specified enabled currencies", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, [
			"EUR",
			"JPY",
			"PLN",
		]);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(3);

		const currencies = conversions[0].targets.map((t) => t.currency);
		expect(currencies).toContain("EUR");
		expect(currencies).toContain("JPY");
		expect(currencies).toContain("PLN");
	});

	test("does not include source currency even if in enabled list", () => {
		const matches = detectCurrencies("100 USD");
		const conversions = convertCurrencies(matches, MOCK_RATES, [
			"USD",
			"EUR",
		]);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(1);
		expect(conversions[0].targets[0].currency).toBe("EUR");
	});

	test("skips target currency if rate is missing", () => {
		const matches = detectCurrencies("100 USD");
		const partialRates = { USD: 1, EUR: 0.85 };
		const conversions = convertCurrencies(matches, partialRates, ALL_CODES);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(1);
		expect(conversions[0].targets[0].currency).toBe("EUR");
	});

	test("returns empty if source currency rate is missing", () => {
		const matches = detectCurrencies("100 XYZ");
		const match: CurrencyMatch = { original: "100 XYZ", value: 100, currency: "XYZ" };
		const conversions = convertCurrencies([match], MOCK_RATES, ALL_CODES);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(0);
	});

	test("handles multiple matches in one call", () => {
		const m1: CurrencyMatch = { original: "100 USD", value: 100, currency: "USD" };
		const m2: CurrencyMatch = { original: "2000 JPY", value: 2000, currency: "JPY" };
		const conversions = convertCurrencies([m1, m2], MOCK_RATES, ["EUR"]);
		expect(conversions).toHaveLength(2);
		expect(conversions[0].targets).toHaveLength(1);
		expect(conversions[1].targets).toHaveLength(1);
	});

	test("PLN to USD conversion (Polish user scenario)", () => {
		const matches = detectCurrencies("200 PLN");
		const conversions = convertCurrencies(matches, MOCK_RATES, ["USD", "EUR"]);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].fromCurrency).toBe("PLN");
		expect(conversions[0].targets).toHaveLength(2);

		const usdTarget = conversions[0].targets.find((t) => t.currency === "USD");
		expect(usdTarget).toBeDefined();
		expect(usdTarget!.value).toBeCloseTo(200 / 4, 2);

		const eurTarget = conversions[0].targets.find((t) => t.currency === "EUR");
		expect(eurTarget).toBeDefined();
		expect(eurTarget!.value).toBeCloseTo((200 / 4) * 0.85, 2);
	});

	test("JPY to multiple currencies (Japanese user scenario)", () => {
		const matches = detectCurrencies("2000 yen");
		const conversions = convertCurrencies(matches, MOCK_RATES, [
			"USD",
			"EUR",
			"PLN",
			"VND",
		]);
		expect(conversions).toHaveLength(1);
		expect(conversions[0].targets).toHaveLength(4);

		const usdTarget = conversions[0].targets.find((t) => t.currency === "USD");
		expect(usdTarget!.value).toBeCloseTo(2000 / 150, 2);

		const vndTarget = conversions[0].targets.find((t) => t.currency === "VND");
		expect(vndTarget!.value).toBeCloseTo((2000 / 150) * 25000, -1);
	});

	test("Vietnamese dong conversion", () => {
		const matches = detectCurrencies("500000 VND");
		const conversions = convertCurrencies(matches, MOCK_RATES, ["USD"]);
		expect(conversions).toHaveLength(1);
		const usdTarget = conversions[0].targets.find((t) => t.currency === "USD");
		expect(usdTarget!.value).toBeCloseTo(500000 / 25000, 2);
	});
});

describe("formatCurrencyConversions", () => {
	test("single conversion formatting", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "2000 yen",
				value: 2000,
				fromCurrency: "JPY",
				targets: [
					{ value: 13.33, currency: "USD" },
					{ value: 11.33, currency: "EUR" },
				],
			},
		];
		const result = formatCurrencyConversions(conversions);
		expect(result).toContain("2000");
		expect(result).toContain("yen");
		expect(result).toContain("USD");
		expect(result).toContain("EUR");
		expect(result).toContain("≈");
	});

	test("multiple conversions separated by newline", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "200 PLN",
				value: 200,
				fromCurrency: "PLN",
				targets: [{ value: 50, currency: "USD" }],
			},
			{
				original: "50 PLN",
				value: 50,
				fromCurrency: "PLN",
				targets: [{ value: 12.5, currency: "USD" }],
			},
		];
		const result = formatCurrencyConversions(conversions);
		const lines = result.split("\n");
		expect(lines).toHaveLength(2);
	});

	test("bold markdown formatting on original amount", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "$50",
				value: 50,
				fromCurrency: "USD",
				targets: [{ value: 42.5, currency: "EUR" }],
			},
		];
		const result = formatCurrencyConversions(conversions);
		expect(result).toContain("**");
	});

	test("empty array returns empty string", () => {
		expect(formatCurrencyConversions([])).toBe("");
	});

	test("approximate symbol (≈) separates original from targets", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "100 EUR",
				value: 100,
				fromCurrency: "EUR",
				targets: [{ value: 117.65, currency: "USD" }],
			},
		];
		const result = formatCurrencyConversions(conversions);
		expect(result).toContain("≈");
	});

	test("targets are separated by /", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "100 USD",
				value: 100,
				fromCurrency: "USD",
				targets: [
					{ value: 85, currency: "EUR" },
					{ value: 74, currency: "GBP" },
					{ value: 15000, currency: "JPY" },
				],
			},
		];
		const result = formatCurrencyConversions(conversions);
		const targetParts = result.split("≈")[1];
		expect(targetParts).toContain("EUR");
		expect(targetParts).toContain("GBP");
		expect(targetParts).toContain("JPY");
	});

	test("includes target currency values", () => {
		const conversions: CurrencyConversion[] = [
			{
				original: "100 USD",
				value: 100,
				fromCurrency: "USD",
				targets: [{ value: 85, currency: "EUR" }],
			},
		];
		const result = formatCurrencyConversions(conversions);
		expect(result).toContain("85");
		expect(result).toContain("EUR");
	});
});