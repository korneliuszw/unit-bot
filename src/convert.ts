export interface Conversion {
	original: string;
	value: number;
	fromUnit: string;
	toValue: number;
	toUnit: string;
}

interface UnitDef {
	names: string[];
	type: "metric" | "imperial";
	toBase: (v: number) => number;
	fromBase: (v: number) => number;
	category: "length" | "weight" | "temperature" | "volume";
	target: string;
}

const UNITS: UnitDef[] = [
	{
		category: "length",
		type: "metric",
		names: ["km", "kilometer", "kilometers", "kilometre", "kilometres"],
		toBase: (v) => v * 1000,
		fromBase: (v) => v / 1000,
		target: "mi",
	},
	{
		category: "length",
		type: "metric",
		names: ["m", "meter", "meters", "metre", "metres"],
		toBase: (v) => v,
		fromBase: (v) => v,
		target: "ft",
	},
	{
		category: "length",
		type: "metric",
		names: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"],
		toBase: (v) => v / 100,
		fromBase: (v) => v * 100,
		target: "in",
	},
	{
		category: "length",
		type: "metric",
		names: ["mm", "millimeter", "millimeters", "millimetre", "millimetres"],
		toBase: (v) => v / 1000,
		fromBase: (v) => v * 1000,
		target: "in",
	},
	{
		category: "length",
		type: "imperial",
		names: ["mi", "mile", "miles"],
		toBase: (v) => v * 1609.344,
		fromBase: (v) => v / 1609.344,
		target: "km",
	},
	{
		category: "length",
		type: "imperial",
		names: ["yd", "yard", "yards"],
		toBase: (v) => v * 0.9144,
		fromBase: (v) => v / 0.9144,
		target: "m",
	},
	{
		category: "length",
		type: "imperial",
		names: ["ft", "foot", "feet"],
		toBase: (v) => v * 0.3048,
		fromBase: (v) => v / 0.3048,
		target: "m",
	},
	{
		category: "length",
		type: "imperial",
		names: ["in", "inch", "inches"],
		toBase: (v) => v * 0.0254,
		fromBase: (v) => v / 0.0254,
		target: "cm",
	},
	{
		category: "weight",
		type: "metric",
		names: ["kg", "kilogram", "kilograms"],
		toBase: (v) => v,
		fromBase: (v) => v,
		target: "lbs",
	},
	{
		category: "weight",
		type: "metric",
		names: ["g", "gram", "grams"],
		toBase: (v) => v / 1000,
		fromBase: (v) => v * 1000,
		target: "oz",
	},
	{
		category: "weight",
		type: "metric",
		names: ["mg", "milligram", "milligrams"],
		toBase: (v) => v / 1_000_000,
		fromBase: (v) => v * 1_000_000,
		target: "oz",
	},
	{
		category: "weight",
		type: "imperial",
		names: ["lb", "lbs", "pound", "pounds"],
		toBase: (v) => v / 2.20462,
		fromBase: (v) => v * 2.20462,
		target: "kg",
	},
	{
		category: "weight",
		type: "imperial",
		names: ["oz", "ounce", "ounces"],
		toBase: (v) => v / 35.274,
		fromBase: (v) => v * 35.274,
		target: "g",
	},
	{
		category: "weight",
		type: "imperial",
		names: ["st", "stone", "stones"],
		toBase: (v) => v / 0.157473,
		fromBase: (v) => v * 0.157473,
		target: "kg",
	},
	{
		category: "temperature",
		type: "metric",
		names: ["°c", "c", "celsius", "degree celsius", "degrees celsius"],
		toBase: (v) => v,
		fromBase: (v) => v,
		target: "°F",
	},
	{
		category: "temperature",
		type: "imperial",
		names: ["°f", "f", "fahrenheit", "degree fahrenheit", "degrees fahrenheit"],
		toBase: (v) => ((v - 32) * 5) / 9,
		fromBase: (v) => (v * 9) / 5 + 32,
		target: "°C",
	},
	{
		category: "volume",
		type: "metric",
		names: ["l", "liter", "liters", "litre", "litres"],
		toBase: (v) => v,
		fromBase: (v) => v,
		target: "gal",
	},
	{
		category: "volume",
		type: "metric",
		names: ["ml", "milliliter", "milliliters", "millilitre", "millilitres"],
		toBase: (v) => v / 1000,
		fromBase: (v) => v * 1000,
		target: "fl oz",
	},
	{
		category: "volume",
		type: "imperial",
		names: ["gal", "gallon", "gallons"],
		toBase: (v) => v * 3.78541,
		fromBase: (v) => v / 3.78541,
		target: "L",
	},
	{
		category: "volume",
		type: "imperial",
		names: ["qt", "quart", "quarts"],
		toBase: (v) => v * 0.946353,
		fromBase: (v) => v / 0.946353,
		target: "L",
	},
	{
		category: "volume",
		type: "imperial",
		names: ["pt", "pint", "pints"],
		toBase: (v) => v * 0.473176,
		fromBase: (v) => v / 0.473176,
		target: "mL",
	},
	{
		category: "volume",
		type: "imperial",
		names: ["cup", "cups"],
		toBase: (v) => v * 0.236588,
		fromBase: (v) => v / 0.236588,
		target: "mL",
	},
	{
		category: "volume",
		type: "imperial",
		names: [
			"fl oz",
			"floz",
			"fluid ounce",
			"fluid ounces",
			"fl. oz",
			"fl oz.",
			"fl. oz.",
		],
		toBase: (v) => v * 0.0295735,
		fromBase: (v) => v / 0.0295735,
		target: "mL",
	},
];

function findTargetUnit(unit: UnitDef): UnitDef | undefined {
	const targetLower = unit.target.toLowerCase().replace(/^°/, "°");
	return UNITS.find((u) =>
		u.names.some((n) => n.toLowerCase() === targetLower),
	);
}

const UNIT_NAMES_SORTED = UNITS.flatMap((u) => u.names).sort(
	(a, b) => b.length - a.length,
);
const UNIT_NAMES_ESCAPED = UNIT_NAMES_SORTED.map((n) =>
	n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
);
const UNIT_ALT = UNIT_NAMES_ESCAPED.join("|");

const PATTERN = new RegExp(
	`(?<=^|\\s)(-?\\d+(?:\\.\\d+)?)\\s*(${UNIT_ALT})(?=\\s|$|[.,!?])`,
	"gi",
);

const BARE_PATTERN = new RegExp(
	`(?<=^|\\s)(${UNIT_ALT})(?=\\s|$|[.,!?])`,
	"gi",
);

const AMBIGUOUS_SHORT = new Set([
	"in",
	"m",
	"c",
	"f",
	"l",
	"g",
	"oz",
	"pt",
	"qt",
	"st",
	"yd",
	"ft",
]);

function findUnit(name: string): UnitDef | undefined {
	const lower = name.toLowerCase().replace(/^°/, "°");
	return UNITS.find((u) => u.names.some((n) => n.toLowerCase() === lower));
}

function formatValue(v: number): string {
	if (Math.abs(v) < 0.01) return v.toPrecision(2);
	if (Number.isInteger(v)) return v.toString();
	return parseFloat(v.toFixed(2)).toString();
}

export function convertMessage(text: string): Conversion[] {
	const results: Conversion[] = [];
	const seen = new Set<string>();

	const regex = new RegExp(PATTERN.source, PATTERN.flags);
	let match: RegExpExecArray | null;
	while ((match = regex.exec(text)) !== null) {
		const value = parseFloat(match[1]);
		const unitName = match[2];
		const unit = findUnit(unitName);
		if (!unit) continue;

		const key = `${match[1]}${unitName}`;
		if (seen.has(key)) continue;
		seen.add(key);

		const baseValue = unit.toBase(value);
		const targetUnit = findTargetUnit(unit);
		if (!targetUnit) continue;

		const toValue = targetUnit.fromBase(baseValue);
		results.push({
			original: `${match[1]} ${unitName}`,
			value,
			fromUnit: unitName,
			toValue,
			toUnit: unit.target,
		});
	}

	return results;
}

export function detectBareUnits(
	text: string,
	alreadyMatched: Conversion[],
): Conversion[] {
	const results: Conversion[] = [];
	const matchedUnits = new Set(
		alreadyMatched.map((c) => c.fromUnit.toLowerCase()),
	);
	const seen = new Set<string>();

	const regex = new RegExp(BARE_PATTERN.source, BARE_PATTERN.flags);
	let match: RegExpExecArray | null;
	while ((match = regex.exec(text)) !== null) {
		const unitName = match[1];
		const unit = findUnit(unitName);
		if (!unit) continue;
		if (AMBIGUOUS_SHORT.has(unitName.toLowerCase())) continue;
		if (matchedUnits.has(unitName.toLowerCase())) continue;

		const key = unitName.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);

		const baseValue = unit.toBase(1);
		const targetUnit = findTargetUnit(unit);
		if (!targetUnit) continue;

		const toValue = targetUnit.fromBase(baseValue);
		results.push({
			original: unitName,
			value: 1,
			fromUnit: unitName,
			toValue,
			toUnit: unit.target,
		});
	}

	return results;
}

export function formatConversions(conversions: Conversion[]): string {
	const lines = conversions.map(
		(c) =>
			`**${formatValue(c.value)} ${c.fromUnit}** = **${formatValue(c.toValue)} ${c.toUnit}**`,
	);
	return lines.join("\n");
}
