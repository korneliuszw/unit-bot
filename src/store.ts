import { Database } from "bun:sqlite";
import { SUPPORTED_CURRENCIES } from "./currency";

const DB_PATH = "guild_config.db";

let db: Database;

export function initStore(): void {
	db = new Database(DB_PATH, { create: true });
	db.exec("PRAGMA journal_mode = WAL");
	db.exec(`
		CREATE TABLE IF NOT EXISTS guild_currencies (
			guild_id TEXT NOT NULL,
			currency_code TEXT NOT NULL,
			PRIMARY KEY (guild_id, currency_code)
		)
	`);
}

export function getEnabledCurrencies(guildId: string | null): string[] | null {
	if (!guildId) return null;

	const rows = db
		.prepare("SELECT currency_code FROM guild_currencies WHERE guild_id = ?")
		.all(guildId) as { currency_code: string }[];

	if (rows.length === 0) return null;

	return rows.map((r) => r.currency_code);
}

export function addCurrency(guildId: string, code: string): boolean {
	const upper = code.toUpperCase();
	if (!SUPPORTED_CURRENCIES.includes(upper)) return false;

	db.prepare(
		"INSERT OR IGNORE INTO guild_currencies (guild_id, currency_code) VALUES (?, ?)",
	).run(guildId, upper);
	return true;
}

export function removeCurrency(guildId: string, code: string): boolean {
	const upper = code.toUpperCase();
	const result = db
		.prepare(
			"DELETE FROM guild_currencies WHERE guild_id = ? AND currency_code = ?",
		)
		.run(guildId, upper);
	return result.changes > 0;
}

export function resetCurrencies(guildId: string): void {
	db.prepare("DELETE FROM guild_currencies WHERE guild_id = ?").run(guildId);
}

export function listAllCurrencies(): string[] {
	return [...SUPPORTED_CURRENCIES];
}