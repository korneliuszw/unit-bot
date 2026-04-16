import { Client, Events, GatewayIntentBits, type Message } from "discord.js";
import { convertMessage, detectBareUnits, formatConversions } from "./convert";
import "dotenv/config";

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

client.once(Events.ClientReady, (c) => {
	console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, (message: Message) => {
	if (message.author.bot) return;

	const conversions = convertMessage(message.content);
	const bareUnits = detectBareUnits(message.content, conversions);
	const all = [...conversions, ...bareUnits];
	if (all.length === 0) return;

	const reply = formatConversions(all);
	message.reply({
		content: reply,
		allowedMentions: { repliedUser: false, users: [], roles: [] },
	});
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
	console.error("DISCORD_TOKEN environment variable is required");
	process.exit(1);
}

client.login(token);
