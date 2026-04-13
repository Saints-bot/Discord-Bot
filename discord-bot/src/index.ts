import { Client, GatewayIntentBits, Events } from "discord.js";
import { registerCommands } from "./commands/register.js";
import { handleTransporter } from "./commands/transporter.js";
import { handleClear } from "./commands/clear.js";
import { handleSanktion } from "./commands/sanktion.js";
import { handleSanktionDelete } from "./commands/sanktionDelete.js";
import { handleWochenabgabe } from "./commands/wochenabgabe.js";
import { handleAufstellung } from "./commands/aufstellung.js";
import {
  handleWochenabgabeBezahlt,
  handleWochenabgabeSelect,
} from "./commands/wochenabgabeInteractions.js";
import { initializeTimers, setTimerClient } from "./commands/wochenabgabeTimer.js";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  throw new Error("DISCORD_BOT_TOKEN environment variable is required.");
}

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`✅ Bot logged in as ${readyClient.user.tag}`);
  setTimerClient(readyClient);
  await registerCommands(readyClient);
  await initializeTimers(readyClient);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Button interactions
    if (interaction.isButton()) {
      if (interaction.customId === "sanktion_delete") {
        await handleSanktionDelete(interaction);
      } else if (interaction.customId === "wochenabgabe_bezahlt") {
        await handleWochenabgabeBezahlt(interaction);
      }
      return;
    }

    // User select menu interactions
    if (interaction.isUserSelectMenu()) {
      if (interaction.customId.startsWith("wochenabgabe_select:")) {
        await handleWochenabgabeSelect(interaction);
      }
      return;
    }

    // Slash commands
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "transporter") {
      await handleTransporter(interaction);
    } else if (interaction.commandName === "clear") {
      await handleClear(interaction);
    } else if (interaction.commandName === "sanktion") {
      await handleSanktion(interaction);
    } else if (interaction.commandName === "wochenabgabe") {
      await handleWochenabgabe(interaction);
    } else if (interaction.commandName === "aufstellung") {
      await handleAufstellung(interaction);
    }
  } catch (err) {
    console.error("Error handling interaction:", err);
    const reply = { content: "❌ Ein Fehler ist aufgetreten.", ephemeral: true };
    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
});

client.login(token);
