import { ChatInputCommandInteraction } from "discord.js";
import { checkChannelById } from "./guards.js";

export async function handleTransporter(interaction: ChatInputCommandInteraction) {
  if (!(await checkChannelById(interaction, "1485287273120399370"))) return;

  const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");

  await interaction.reply({ content: `beendet um ${hh}:${mm}Uhr`, ephemeral: false });
}
