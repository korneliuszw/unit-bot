import {
	Client,
	Events,
	GatewayIntentBits,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type Message,
	type Interaction,
} from "discord.js";
import { convertMessage, detectBareUnits, formatConversions } from "./convert";
import {
	detectCurrencies,
	convertCurrencies,
	formatCurrencyConversions,
	SUPPORTED_CURRENCIES,
} from "./currency";
import { fetchRates, getRates, stopRefresh } from "./rates";
import {
	initStore,
	getEnabledCurrencies,
	addCurrency,
	removeCurrency,
	resetCurrencies,
	listAllCurrencies,
} from "./store";
import "dotenv/config";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

const CURRENCIES_ADD = new SlashCommandBuilder()
	.setName("currencies-add")
	.setDescription("Add currencies to the server's enabled list (comma-separated)")
	.addStringOption((opt) =>
		opt
			.setName("codes")
			.setDescription("Currency codes, e.g. USD,EUR,JPY")
			.setRequired(true),
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

const CURRENCIES_REMOVE = new SlashCommandBuilder()
	.setName("currencies-remove")
	.setDescription("Remove currencies from the server's enabled list (comma-separated)")
	.addStringOption((opt) =>
		opt
			.setName("codes")
			.setDescription("Currency codes, e.g. USD,EUR,JPY")
			.setRequired(true),
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

const CURRENCIES_LIST = new SlashCommandBuilder()
	.setName("currencies-list")
	.setDescription("List enabled currencies for this server")
	.setDMPermission(false);

const CURRENCIES_SUPPORTED = new SlashCommandBuilder()
	.setName("currencies-supported")
	.setDescription("List all supported currencies")
	.setDMPermission(false);

const CURRENCIES_RESET = new SlashCommandBuilder()
	.setName("currencies-reset")
	.setDescription("Clear all enabled currencies (disables currency conversion)")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

client.once(Events.ClientReady, async (c) => {
	console.log(`Logged in as ${c.user.tag}`);

	initStore();
	await fetchRates();

	try {
		await client.application?.commands.set([
			CURRENCIES_ADD,
			CURRENCIES_REMOVE,
			CURRENCIES_LIST,
			CURRENCIES_SUPPORTED,
			CURRENCIES_RESET,
		]);
		console.log("Slash commands registered");
	} catch (err) {
		console.error("Failed to register slash commands:", err);
	}
});

client.on(Events.MessageCreate, (message: Message) => {
	if (message.author.bot) return;

	const content = message.content;
	const parts: string[] = [];

	const conversions = convertMessage(content);
	const bareUnits = detectBareUnits(content, conversions);
	const allUnits = [...conversions, ...bareUnits];
	if (allUnits.length > 0) {
		parts.push(formatConversions(allUnits));
	}

	const currencyMatches = detectCurrencies(content);
	if (currencyMatches.length > 0) {
		const rates = getRates();
		if (Object.keys(rates).length > 1) {
			const enabled = getEnabledCurrencies(message.guildId);
			if (enabled.length > 0) {
				const currencyConversions = convertCurrencies(
					currencyMatches,
					rates,
					enabled,
				);
				const formatted = formatCurrencyConversions(currencyConversions);
				if (formatted) parts.push(formatted);
			}
		}
	}

	if (parts.length === 0) return;

	message.reply({
		content: parts.join("\n\n"),
		allowedMentions: { repliedUser: false, users: [], roles: [] },
	});
});

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (!interaction.inCachedGuild()) return;

	const { commandName, options } = interaction;

	switch (commandName) {
		case "currencies-add": {
			const raw = options.getString("codes", true);
			const codes = raw.split(",").map((s) => s.trim().toUpperCase()).filter((s) => s.length > 0);
			const added: string[] = [];
			const invalid: string[] = [];

			for (const code of codes) {
				if (!SUPPORTED_CURRENCIES.includes(code)) {
					invalid.push(code);
				} else {
					addCurrency(interaction.guildId, code);
					added.push(code);
				}
			}

			const enabled = getEnabledCurrencies(interaction.guildId);
			const lines: string[] = [];
			if (added.length > 0) lines.push(`Added: ${added.join(", ")}`);
			if (invalid.length > 0) lines.push(`Unknown: ${invalid.join(", ")} (use \`/currencies-supported\` to see valid codes)`);
			lines.push(`Enabled: ${enabled.join(", ") || "none"}`);
			await interaction.reply({ content: lines.join("\n"), ephemeral: true });
			break;
		}
		case "currencies-remove": {
			const raw = options.getString("codes", true);
			const codes = raw.split(",").map((s) => s.trim().toUpperCase()).filter((s) => s.length > 0);
			const removed: string[] = [];
			const notFound: string[] = [];

			for (const code of codes) {
				if (removeCurrency(interaction.guildId, code)) {
					removed.push(code);
				} else {
					notFound.push(code);
				}
			}

			const enabled = getEnabledCurrencies(interaction.guildId);
			const lines: string[] = [];
			if (removed.length > 0) lines.push(`Removed: ${removed.join(", ")}`);
			if (notFound.length > 0) lines.push(`Not in enabled list: ${notFound.join(", ")}`);
			lines.push(`Enabled: ${enabled.join(", ") || "none"}`);
			await interaction.reply({ content: lines.join("\n"), ephemeral: true });
			break;
		}
		case "currencies-list": {
			const enabled = getEnabledCurrencies(interaction.guildId);
			if (enabled.length === 0) {
				await interaction.reply({
					content: "No currencies enabled. Use `/currencies-add` to enable currencies, or `/currencies-supported` to see all available currencies.",
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: `Enabled currencies: ${enabled.join(", ")}`,
					ephemeral: true,
				});
			}
			break;
		}
		case "currencies-supported": {
			await interaction.reply({
				content: `Supported currencies: ${SUPPORTED_CURRENCIES.join(", ")}`,
				ephemeral: true,
			});
			break;
		}
		case "currencies-reset": {
			resetCurrencies(interaction.guildId);
			await interaction.reply({
				content: "Cleared all enabled currencies. Currency conversion is now disabled. Use `/currencies-add` to enable specific currencies.",
				ephemeral: true,
			});
			break;
		}
	}
});

process.on("SIGINT", () => {
	stopRefresh();
	client.destroy();
	process.exit(0);
});

process.on("SIGTERM", () => {
	stopRefresh();
	client.destroy();
	process.exit(0);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
	console.error("DISCORD_TOKEN environment variable is required");
	process.exit(1);
}

client.login(token);