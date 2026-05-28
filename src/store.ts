import { Database } from "bun:sqlite";
import { join } from "path";
import { SUPPORTED_CURRENCIES } from "./currency";

const DB_PATH = join(process.env.DATA_DIR ?? ".", "guild_config.db");

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

export function getEnabledCurrencies(guildId: string | null): string[] {
	if (!guildId) return [...SUPPORTED_CURRENCIES];

	const rows = db
		.prepare("SELECT currency_code FROM guild_currencies WHERE guild_id = ?")
		.all(guildId) as { currency_code: string }[];

	return rows.map((r) => r.currency_code);
}

export function addCurrency(guildId: string, code: string): void {
	const upper = code.toUpperCase();

	db.prepare(
		"INSERT OR IGNORE INTO guild_currencies (guild_id, currency_code) VALUES (?, ?)",
	).run(guildId, upper);
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