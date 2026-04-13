import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { saveEntry, MemberStatus } from "./wochenabgabeStore.js";
import { scheduleExpiry } from "./wochenabgabeTimer.js";
import { checkChannelById, checkRole } from "./guards.js";

export const STATUS_EMOJI: Record<MemberStatus, string> = {
  hourglass: "⏳",
  check: "✅",
  x: "❌",
};

export function buildWochenabgabeContent(
  datum: string,
  uhrzeit: string,
  abgabe: string,
  members: Record<string, MemberStatus>
): string {
  const memberLines = Object.entries(members)
    .map(([id, status]) => `<@${id}> ${STATUS_EMOJI[status]}`)
    .join("\n");

  return [
    `**Wochenabgabe zum ${datum} bis ${uhrzeit}Uhr**`,
    `Abgabe: ${abgabe}`,
    ``,
    memberLines,
    ``,
    `Diese ist bei der **Leaderschaft** zu bezahlen.`,
  ].join("\n");
}

export function buildWochenabgabeComponents() {
  const btn = new ButtonBuilder()
    .setCustomId("wochenabgabe_bezahlt")
    .setLabel("Als bezahlt markieren")
    .setStyle(ButtonStyle.Success)
    .setEmoji("✅");
  return [new ActionRowBuilder<ButtonBuilder>().addComponents(btn)];
}

export async function handleWochenabgabe(interaction: ChatInputCommandInteraction) {
  if (!(await checkChannelById(interaction, "1483024022022258708"))) return;
  if (!(await checkRole(interaction, "Leaderschaft"))) return;

  const datum = interaction.options.getString("datum", true);
  const uhrzeit = interaction.options.getString("uhrzeit", true);
  const abgabe = interaction.options.getString("abgabe", true);

  const dateParts = datum.split(".");
  const timeParts = uhrzeit.split(":");
  if (dateParts.length !== 3 || timeParts.length !== 2) {
    await interaction.reply({
      content: "❌ Ungültiges Format. Datum: TT.MM.JJJJ · Uhrzeit: HH:MM",
      ephemeral: true,
    });
    return;
  }

  const [day, month, year] = dateParts.map(Number);
  const [hour, minute] = timeParts.map(Number);
  const deadline = new Date(Date.UTC(year, month - 1, day, hour - 1, minute)).getTime();

  if (isNaN(deadline)) {
    await interaction.reply({ content: "❌ Ungültiges Datum oder Uhrzeit.", ephemeral: true });
    return;
  }

  await interaction.deferReply();

  const guild = interaction.guild!;
  try {
    await guild.members.fetch();
  } catch (err) {
    console.error("Could not fetch all members:", err);
  }

  const saintsRole = guild.roles.cache.find((r) => r.name === "Saints");
  if (!saintsRole) {
    await interaction.editReply("❌ Die Rolle **Saints** wurde nicht gefunden.");
    return;
  }

  const members: Record<string, MemberStatus> = {};
  saintsRole.members.forEach((m) => {
    members[m.id] = "hourglass";
  });

  if (Object.keys(members).length === 0) {
    await interaction.editReply("❌ Keine Mitglieder mit der Rolle **Saints** gefunden.");
    return;
  }

  const content = buildWochenabgabeContent(datum, uhrzeit, abgabe, members);
  const message = await interaction.editReply({
    content,
    components: buildWochenabgabeComponents(),
  });

  const entry = {
    messageId: message.id,
    channelId: message.channelId,
    guildId: guild.id,
    deadline,
    datum,
    uhrzeit,
    abgabe,
    members,
  };

  saveEntry(entry);
  scheduleExpiry(entry);
}
