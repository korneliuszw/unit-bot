import { describe, expect, test } from "bun:test";
import { convertMessage, detectBareUnits, formatConversions } from "../src/convert";

const closeTo =
	(expected: number, tolerance = 0.05) =>
	(received: number) =>
		Math.abs(received - expected) <= tolerance;

describe("convertMessage", () => {
	describe("basic metric -> imperial", () => {
		test("kg to lbs", () => {
			const c = convertMessage("I weigh 88kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(88);
			expect(c[0].fromUnit).toBe("kg");
			expect(c[0].toUnit).toBe("lbs");
			expect(c[0].toValue).toBeCloseTo(194.0, 0);
		});

		test("km to miles", () => {
			const c = convertMessage("It's 5km away");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(3.11, 1);
			expect(c[0].toUnit).toBe("mi");
		});

		test("celsius to fahrenheit", () => {
			const c = convertMessage("It is 100 celsius outside");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBe(212);
			expect(c[0].toUnit).toBe("°F");
		});

		test("liters to gallons", () => {
			const c = convertMessage("I drank 2 liters of water");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(0.53, 1);
			expect(c[0].toUnit).toBe("gal");
		});
	});

	describe("basic imperial -> metric", () => {
		test("lbs to kg", () => {
			const c = convertMessage("I weigh 200 lbs");
			expect(c).toHaveLength(1);
			expect(c[0].toUnit).toBe("kg");
			expect(c[0].toValue).toBeCloseTo(90.72, 0);
		});

		test("miles to km", () => {
			const c = convertMessage("5 miles to go");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(8.05, 1);
			expect(c[0].toUnit).toBe("km");
		});

		test("fahrenheit to celsius", () => {
			const c = convertMessage("It's 32 fahrenheit");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(0, 0);
			expect(c[0].toUnit).toBe("°C");
		});

		test("gallons to liters", () => {
			const c = convertMessage("I need 3 gallons");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(11.36, 0);
			expect(c[0].toUnit).toBe("L");
		});
	});

	describe("negative values", () => {
		test("negative celsius", () => {
			const c = convertMessage("It's -40 celsius");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(-40);
			expect(c[0].toValue).toBe(-40);
		});

		test("negative fahrenheit", () => {
			const c = convertMessage("It's -40 fahrenheit");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(-40);
			expect(c[0].toValue).toBeCloseTo(-40, 0);
		});

		test("negative meters", () => {
			const c = convertMessage("-5m below sea level");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(-5);
			expect(c[0].toValue).toBeCloseTo(-16.4, 0);
		});
	});

	describe("zero values", () => {
		test("0 kg", () => {
			const c = convertMessage("0kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(0);
			expect(c[0].toValue).toBeCloseTo(0, 0);
		});

		test("0 celsius", () => {
			const c = convertMessage("0 celsius");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(0);
			expect(c[0].toValue).toBe(32);
		});

		test("0 fahrenheit", () => {
			const c = convertMessage("0 fahrenheit");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(0);
			expect(c[0].toValue).toBeCloseTo(-17.78, 1);
		});
	});

	describe("decimal values", () => {
		test("0.5 kg", () => {
			const c = convertMessage("0.5kg of flour");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(0.5);
			expect(c[0].toValue).toBeCloseTo(1.1, 0);
		});

		test("99.9 fahrenheit", () => {
			const c = convertMessage("My temp is 99.9 fahrenheit");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(99.9);
			expect(c[0].toValue).toBeCloseTo(37.72, 1);
		});

		test("3.14159 miles", () => {
			const c = convertMessage("3.14159 miles");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBeCloseTo(3.14159, 4);
		});
	});

	describe("very large values", () => {
		test("1000000 kg", () => {
			const c = convertMessage("1000000kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(1_000_000);
			expect(c[0].toValue).toBeCloseTo(2_204_620, -2);
		});

		test("999999 miles", () => {
			const c = convertMessage("999999 miles");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(999_999);
		});
	});

	describe("very small values", () => {
		test("0.001 kg", () => {
			const c = convertMessage("0.001kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(0.001);
			expect(c[0].toValue).toBeCloseTo(0.0022, 3);
		});

		test("1 mg", () => {
			const c = convertMessage("1 mg of dust");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(1);
			expect(c[0].toUnit).toBe("oz");
		});

		test("1 mm", () => {
			const c = convertMessage("1 mm gap");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(1);
			expect(c[0].toUnit).toBe("in");
		});
	});

	describe("multiple units in one message", () => {
		test("height and weight", () => {
			const c = convertMessage("I'm 180cm tall and weigh 75kg");
			expect(c).toHaveLength(2);
			expect(c[0].fromUnit).toBe("cm");
			expect(c[1].fromUnit).toBe("kg");
		});

		test("three different units", () => {
			const c = convertMessage("Ran 5km, drank 2 liters, lost 2kg");
			expect(c).toHaveLength(3);
		});

		test("duplicate unit only reported once", () => {
			const c = convertMessage("I have 5kg of apples and 5kg of oranges");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(5);
		});

		test("different values same unit both reported", () => {
			const c = convertMessage("Box A is 5kg, box B is 10kg");
			expect(c).toHaveLength(2);
			expect(c[0].value).toBe(5);
			expect(c[1].value).toBe(10);
		});
	});

	describe("unit name variations", () => {
		test("kilogram full name", () => {
			expect(convertMessage("5 kilograms")).toHaveLength(1);
			expect(convertMessage("5 kilogram")).toHaveLength(1);
		});

		test("meter full name", () => {
			expect(convertMessage("100 meters")).toHaveLength(1);
			expect(convertMessage("100 metre")).toHaveLength(1);
			expect(convertMessage("100 metres")).toHaveLength(1);
		});

		test("pound variations", () => {
			expect(convertMessage("10 lb")).toHaveLength(1);
			expect(convertMessage("10 lbs")).toHaveLength(1);
			expect(convertMessage("10 pound")).toHaveLength(1);
			expect(convertMessage("10 pounds")).toHaveLength(1);
		});

		test("foot/feet", () => {
			expect(convertMessage("6 foot")).toHaveLength(1);
			expect(convertMessage("6 feet")).toHaveLength(1);
			expect(convertMessage("6 ft")).toHaveLength(1);
		});

		test("inch/inches", () => {
			expect(convertMessage("12 inch")).toHaveLength(1);
			expect(convertMessage("12 inches")).toHaveLength(1);
			expect(convertMessage("12 in")).toHaveLength(1);
		});

		test("temperature degree symbol", () => {
			expect(convertMessage("25°C")).toHaveLength(1);
		});

		test("fluid ounce variations", () => {
			expect(convertMessage("8 fl oz")).toHaveLength(1);
			expect(convertMessage("8 floz")).toHaveLength(1);
			expect(convertMessage("8 fluid ounce")).toHaveLength(1);
			expect(convertMessage("8 fluid ounces")).toHaveLength(1);
		});

		test("liter/litre spelling", () => {
			expect(convertMessage("2 liters")).toHaveLength(1);
			expect(convertMessage("2 litres")).toHaveLength(1);
			expect(convertMessage("2 litre")).toHaveLength(1);
		});
	});

	describe("spacing variations", () => {
		test("no space between number and unit", () => {
			const c = convertMessage("88kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(88);
		});

		test("space between number and unit", () => {
			const c = convertMessage("88 kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(88);
		});

		test("multiple spaces between number and unit", () => {
			const c = convertMessage("88  kg");
			expect(c).toHaveLength(1);
			expect(c[0].value).toBe(88);
		});

		test("unit at start of message", () => {
			const c = convertMessage("5km is a long way");
			expect(c).toHaveLength(1);
		});

		test("unit at end of message", () => {
			const c = convertMessage("I ran 5km");
			expect(c).toHaveLength(1);
		});

		test("unit followed by punctuation", () => {
			expect(convertMessage("It weighs 5kg.")).toHaveLength(1);
			expect(convertMessage("It weighs 5kg!")).toHaveLength(1);
			expect(convertMessage("It weighs 5kg?")).toHaveLength(1);
			expect(convertMessage("It weighs 5kg, right?")).toHaveLength(1);
		});

		test("unit in middle of sentence", () => {
			const c = convertMessage("The 5km race was hard");
			expect(c).toHaveLength(1);
		});
	});

	describe("case insensitivity", () => {
		test("uppercase units", () => {
			expect(convertMessage("5KG")).toHaveLength(1);
			expect(convertMessage("100CM")).toHaveLength(1);
			expect(convertMessage("10LBS")).toHaveLength(1);
		});

		test("mixed case units", () => {
			expect(convertMessage("5Kg")).toHaveLength(1);
			expect(convertMessage("100Cm")).toHaveLength(1);
		});
	});

	describe("messages with no conversions", () => {
		test("empty string", () => {
			expect(convertMessage("")).toHaveLength(0);
		});

		test("no numbers", () => {
			expect(convertMessage("hello world")).toHaveLength(0);
		});

		test("number without unit", () => {
			expect(convertMessage("I have 5 cats")).toHaveLength(0);
		});

		test("unit without number", () => {
			expect(convertMessage("I weigh kilograms")).toHaveLength(0);
		});

		test("random text", () => {
			expect(convertMessage("the quick brown fox")).toHaveLength(0);
		});
	});

	describe("false positives / tricky inputs", () => {
		test("word containing unit substring (no match for 'in')", () => {
			const c = convertMessage("innovation is key");
			expect(c).toHaveLength(0);
		});

		test("'cm' embedded in a word should not match", () => {
			const c = convertMessage("the acronym is great");
			expect(c).toHaveLength(0);
		});

		test("number that looks like a decimal but isn't a unit", () => {
			const c = convertMessage("version 2.0 is released");
			expect(c).toHaveLength(0);
		});

		test("'in' as a word should not trigger inch conversion", () => {
			const c = convertMessage("I live in Paris");
			expect(c).toHaveLength(0);
		});

		test("'a mile away' has no number", () => {
			expect(convertMessage("a mile away")).toHaveLength(0);
		});

		test("URLs should not false-match", () => {
			const c = convertMessage("check out https://example.com/5km");
			expect(c).toHaveLength(0);
		});

		test("unit followed by slash should not match", () => {
			const c = convertMessage("that's 50cm/s speed");
			expect(c).toHaveLength(0);
		});
	});

	describe("specific conversion accuracy", () => {
		test("1 inch = 2.54 cm", () => {
			const c = convertMessage("1 inch");
			expect(c).toHaveLength(1);
			expect(c[0].toUnit).toBe("cm");
			expect(c[0].toValue).toBeCloseTo(2.54, 1);
		});

		test("freezing point: 0°C = 32°F", () => {
			const c = convertMessage("0 celsius");
			expect(c[0].toValue).toBe(32);
		});

		test("boiling point: 100°C = 212°F", () => {
			const c = convertMessage("100 celsius");
			expect(c[0].toValue).toBe(212);
		});

		test("body temp: 37°C ≈ 98.6°F", () => {
			const c = convertMessage("37 celsius");
			expect(c[0].toValue).toBeCloseTo(98.6, 0);
		});

		test("1 mile = 1.609 km", () => {
			const c = convertMessage("1 mile");
			expect(c[0].toValue).toBeCloseTo(1.609, 2);
		});

		test("1 stone to kg", () => {
			const c = convertMessage("14 stone");
			expect(c).toHaveLength(1);
			expect(c[0].toValue).toBeCloseTo(88.9, 0);
		});

		test("1 gallon = 3.785 liters", () => {
			const c = convertMessage("1 gallon");
			expect(c[0].toValue).toBeCloseTo(3.785, 2);
		});
	});

	describe("all unit aliases produce conversions", () => {
		const aliases: Record<string, string[]> = {
			km: ["km", "kilometer", "kilometers"],
			m: ["m", "meter", "meters"],
			cm: ["cm", "centimeter", "centimeters"],
			mm: ["mm", "millimeter", "millimeters"],
			kg: ["kg", "kilogram", "kilograms"],
			g: ["g", "gram", "grams"],
			l: ["l", "liter", "liters"],
			ml: ["ml", "milliliter", "milliliters"],
			lbs: ["lb", "lbs", "pound", "pounds"],
			oz: ["oz", "ounce", "ounces"],
			ft: ["ft", "foot", "feet"],
			mi: ["mi", "mile", "miles"],
			yd: ["yd", "yard", "yards"],
		};

		for (const [_, aliases_] of Object.entries(aliases)) {
			for (const alias of aliases_) {
				test(`"10 ${alias}" produces a conversion`, () => {
					const c = convertMessage(`10 ${alias}`);
					expect(c).toHaveLength(1);
				});
			}
		}
	});
});

describe("formatConversions", () => {
	test("single conversion", () => {
		const c = convertMessage("88kg");
		const result = formatConversions(c);
		expect(result).toContain("88");
		expect(result).toContain("kg");
		expect(result).toContain("lbs");
	});

	test("multiple conversions separated by newline", () => {
		const c = convertMessage("180cm and 75kg");
		const result = formatConversions(c);
		const lines = result.split("\n");
		expect(lines).toHaveLength(2);
	});

	test("bold markdown formatting", () => {
		const c = convertMessage("5kg");
		const result = formatConversions(c);
		expect(result).toContain("**");
	});

	test("empty array returns empty string", () => {
		expect(formatConversions([])).toBe("");
	});
});
describe("Regular messages", () => {
	test("regular message with no conversions returns empty string", () => {
		const c = convertMessage("Hello, how are you?");
		const result = formatConversions(c);
		expect(result).toBe("");
	});
	test("message with unit mentioned but no value returns empty string", () => {
		const c = convertMessage("I have a kg of flour");
		const result = formatConversions(c);
		expect(result).toBe("");
	});
});

describe("detectBareUnits", () => {
	test("detects bare kg", () => {
		const c = detectBareUnits("We measure things in kg", []);
		expect(c).toHaveLength(1);
		expect(c[0].value).toBe(1);
		expect(c[0].fromUnit).toBe("kg");
		expect(c[0].toUnit).toBe("lbs");
		expect(c[0].toValue).toBeCloseTo(2.2, 0);
	});

	test("detects bare celsius", () => {
		const c = detectBareUnits("the temperature in celsius is fine", []);
		expect(c).toHaveLength(1);
		expect(c[0].fromUnit).toBe("celsius");
		expect(c[0].toUnit).toBe("°F");
	});

	test("detects bare fahrenheit", () => {
		const c = detectBareUnits("I prefer fahrenheit", []);
		expect(c).toHaveLength(1);
		expect(c[0].fromUnit).toBe("fahrenheit");
		expect(c[0].toUnit).toBe("°C");
	});

	test("detects bare mile", () => {
		const c = detectBareUnits("what is a mile?", []);
		expect(c).toHaveLength(1);
		expect(c[0].fromUnit).toBe("mile");
		expect(c[0].toUnit).toBe("km");
		expect(c[0].toValue).toBeCloseTo(1.609, 2);
	});

	test("detects bare gallon", () => {
		const c = detectBareUnits("give me a gallon", []);
		expect(c).toHaveLength(1);
		expect(c[0].fromUnit).toBe("gallon");
		expect(c[0].toUnit).toBe("L");
	});

	test("detects multiple bare units", () => {
		const c = detectBareUnits("I prefer celsius over fahrenheit", []);
		expect(c).toHaveLength(2);
	});

	test("does not duplicate unit already matched with value", () => {
		const conversions = convertMessage("I weigh 88kg");
		const bare = detectBareUnits("I weigh 88kg", conversions);
		expect(bare).toHaveLength(0);
	});

	test("detects bare unit when a different unit has a value", () => {
		const conversions = convertMessage("I ran 5km");
		const bare = detectBareUnits("I ran 5km and lost kilograms", conversions);
		expect(bare).toHaveLength(1);
		expect(bare[0].fromUnit).toBe("kilograms");
	});

	test("deduplicates same bare unit", () => {
		const c = detectBareUnits("kilograms and kilograms everywhere", []);
		expect(c).toHaveLength(1);
	});

	test("skips ambiguous short units like 'in'", () => {
		const c = detectBareUnits("I live in Paris", []);
		expect(c).toHaveLength(0);
	});

	test("skips ambiguous 'm'", () => {
		const c = detectBareUnits("I am m happy", []);
		expect(c).toHaveLength(0);
	});

	test("skips ambiguous 'g'", () => {
		const c = detectBareUnits("g string", []);
		expect(c).toHaveLength(0);
	});

	test("skips ambiguous 'oz'", () => {
		const c = detectBareUnits("the wizard of oz", []);
		expect(c).toHaveLength(0);
	});

	test("skips ambiguous 'ft'", () => {
		const c = detectBareUnits("I ft that", []);
		expect(c).toHaveLength(0);
	});

	test("detects full word 'kilogram' but skips ambiguous 'g'", () => {
		const c = detectBareUnits("weighed in kilogram not g", []);
		expect(c).toHaveLength(1);
		expect(c[0].fromUnit).toBe("kilogram");
	});

	test("empty string returns nothing", () => {
		expect(detectBareUnits("", [])).toHaveLength(0);
	});

	test("no units in text returns nothing", () => {
		expect(detectBareUnits("hello world", [])).toHaveLength(0);
	});

	test("unit at start of message", () => {
		const c = detectBareUnits("kilograms are heavy", []);
		expect(c).toHaveLength(1);
	});

	test("unit at end of message", () => {
		const c = detectBareUnits("I love kilograms", []);
		expect(c).toHaveLength(1);
	});

	test("unit followed by punctuation", () => {
		const c = detectBareUnits("I use kilograms!", []);
		expect(c).toHaveLength(1);
	});

	test("case insensitive bare detection", () => {
		expect(detectBareUnits("I prefer KILOGRAMS", [])).toHaveLength(1);
		expect(detectBareUnits("I prefer Kilograms", [])).toHaveLength(1);
	});
});
