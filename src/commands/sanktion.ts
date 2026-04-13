import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { SANKTIONEN } from "./sanktionCatalog.js";
import { checkChannelById, checkRole } from "./guards.js";

const LOG_CHANNEL_ID = "1488579794550394992";

export async function handleSanktion(interaction: ChatInputCommandInteraction) {
  if (!(await checkChannelById(interaction, "1483022758936838194"))) return;
  if (!(await checkRole(interaction, "Leaderschaft"))) return;

  const nummer = interaction.options.getInteger("nummer", true);
  const user = interaction.options.getUser("mitglied", true);

  const sanktion = SANKTIONEN[nummer];
  if (!sanktion) {
    await interaction.reply({ content: "❌ Ungültige Sanktionsnummer.", ephemeral: true });
    return;
  }

  const isBloodout = sanktion.preis === "Bloodout";
  const hasWarn = sanktion.preis.includes("+ Warn");
  const basePreis = sanktion.preis.replace("+ Warn", "").trim();

  let message: string;

  if (isBloodout) {
    message = [
      `**[Verstoß gegen Punkt ${String(nummer).padStart(2, "0")}] — ${sanktion.beschreibung}**`,
      ``,
      `<@${user.id}> erhält in Kürze sein Bloodout`,
    ].join("\n");
  } else {
    const lines = [
      `**[Verstoß gegen Punkt ${String(nummer).padStart(2, "0")}] — ${sanktion.beschreibung}**`,
      ``,
      `<@${user.id}> erhält eine Sanktion in Höhe von **${basePreis}**.`,
      `Diese Sanktion ist innerhalb von **3 Tagen** bei der **Leaderschaft** zu zahlen.`,
    ];
    if (hasWarn) {
      lines.push(`Zusätzlich erhält <@${user.id}> einen Warn.`);
    }
    message = lines.join("\n");
  }

  const deleteButton = new ButtonBuilder()
    .setCustomId("sanktion_delete")
    .setLabel("Sanktion löschen")
    .setStyle(ButtonStyle.Danger)
    .setEmoji("🗑️");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(deleteButton);

  await interaction.reply({ content: message, components: [row], ephemeral: false });

  try {
    const logChannel = interaction.guild?.channels.cache.get(LOG_CHANNEL_ID) as TextChannel | undefined;
    if (logChannel) {
      const now = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const timestamp = `${String(now.getUTCDate()).padStart(2, "0")}.${String(now.getUTCMonth() + 1).padStart(2, "0")}.${now.getUTCFullYear()} ${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} Uhr`;

      const logLines = [
        `📋 **Sanktion vergeben** — ${timestamp}`,
        `**Von:** <@${interaction.user.id}>`,
        `**Gegen:** <@${user.id}>`,
        `**Punkt:** ${String(nummer).padStart(2, "0")} — ${sanktion.beschreibung}`,
        `**Strafe:** ${isBloodout ? "Bloodout" : basePreis}${hasWarn ? " + Warn" : ""}`,
      ];

      await logChannel.send(logLines.join("\n"));
    }
  } catch (err) {
    console.error("Failed to send sanction log:", err);
  }
}
