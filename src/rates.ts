const API_URL = "https://open.er-api.com/v6/latest/USD";

export interface ExchangeRates {
	rates: Record<string, number>;
	lastUpdated: number;
	nextUpdate: number | null;
}

let currentRates: ExchangeRates = {
	rates: { USD: 1 },
	lastUpdated: 0,
	nextUpdate: null,
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function getRates(): Record<string, number> {
	return currentRates.rates;
}

export async function fetchRates(): Promise<Record<string, number>> {
	try {
		const response = await fetch(API_URL);
		if (!response.ok) {
			console.error(`Failed to fetch exchange rates: ${response.status} ${response.statusText}`);
			return currentRates.rates;
		}

		const data = await response.json();

		if (data.result !== "success" || !data.rates) {
			console.error("Invalid exchange rate response format");
			return currentRates.rates;
		}

		currentRates = {
			rates: data.rates,
			lastUpdated: data.time_last_update_unix ?? Date.now() / 1000,
			nextUpdate: data.time_next_update_unix ?? null,
		};

		console.log(`Exchange rates updated (${Object.keys(data.rates).length} currencies)`);

		scheduleNextRefresh();

		return currentRates.rates;
	} catch (err) {
		console.error("Error fetching exchange rates:", err);
		return currentRates.rates;
	}
}

function scheduleNextRefresh() {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
	}

	let delay = 6 * 60 * 60 * 1000;

	if (currentRates.nextUpdate) {
		const nextUpdateMs = currentRates.nextUpdate * 1000;
		const now = Date.now();
		const timeUntilNext = nextUpdateMs - now;
		if (timeUntilNext > 0) {
			delay = timeUntilNext;
		}
	}

	refreshTimer = setTimeout(() => {
		fetchRates().catch((err) => {
			console.error("Scheduled rate refresh failed:", err);
		});
	}, delay);

	console.log(`Next rate refresh in ${Math.round(delay / 1000 / 60)} minutes`);
}

export function stopRefresh() {
	if (refreshTimer) {
		clearTimeout(refreshTimer);
		refreshTimer = null;
	}
}