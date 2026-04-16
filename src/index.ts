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
	.setDescription("Add a currency to the server's enabled list")
	.addStringOption((opt) =>
		opt
			.setName("code")
			.setDescription("Currency code (e.g. USD, EUR, JPY)")
			.setRequired(true),
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

const CURRENCIES_REMOVE = new SlashCommandBuilder()
	.setName("currencies-remove")
	.setDescription("Remove a currency from the server's enabled list")
	.addStringOption((opt) =>
		opt
			.setName("code")
			.setDescription("Currency code (e.g. USD, EUR, JPY)")
			.setRequired(true),
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setDMPermission(false);

const CURRENCIES_LIST = new SlashCommandBuilder()
	.setName("currencies-list")
	.setDescription("List all enabled currencies for this server")
	.setDMPermission(false);

const CURRENCIES_RESET = new SlashCommandBuilder()
	.setName("currencies-reset")
	.setDescription("Reset to all supported currencies")
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
			const currencyConversions = convertCurrencies(
				currencyMatches,
				rates,
				enabled,
			);
			const formatted = formatCurrencyConversions(currencyConversions);
			if (formatted) parts.push(formatted);
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
			const code = options.getString("code", true).toUpperCase();
			if (!SUPPORTED_CURRENCIES.includes(code)) {
				await interaction.reply({
					content: `Unknown currency: \`${code}\`. Supported: ${SUPPORTED_CURRENCIES.join(", ")}`,
					ephemeral: true,
				});
				return;
			}
			addCurrency(interaction.guildId, code);
			const enabled = getEnabledCurrencies(interaction.guildId);
			const list = enabled?.join(", ") ?? SUPPORTED_CURRENCIES.join(", ");
			await interaction.reply({
				content: `Added \`${code}\`. Enabled currencies: ${list}`,
				ephemeral: true,
			});
			break;
		}
		case "currencies-remove": {
			const code = options.getString("code", true).toUpperCase();
			const removed = removeCurrency(interaction.guildId, code);
			if (!removed) {
				await interaction.reply({
					content: `\`${code}\` was not in the enabled list.`,
					ephemeral: true,
				});
				return;
			}
			const enabled = getEnabledCurrencies(interaction.guildId);
			const list = enabled?.join(", ") ?? "All (default)";
			await interaction.reply({
				content: `Removed \`${code}\`. Enabled currencies: ${list}`,
				ephemeral: true,
			});
			break;
		}
		case "currencies-list": {
			const enabled = getEnabledCurrencies(interaction.guildId);
			if (enabled === null) {
				await interaction.reply({
					content: `All currencies enabled (default): ${SUPPORTED_CURRENCIES.join(", ")}`,
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
		case "currencies-reset": {
			resetCurrencies(interaction.guildId);
			await interaction.reply({
				content: `Reset to all supported currencies: ${SUPPORTED_CURRENCIES.join(", ")}`,
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