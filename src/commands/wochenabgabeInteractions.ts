import {
  ButtonInteraction,
  UserSelectMenuInteraction,
  ActionRowBuilder,
  UserSelectMenuBuilder,
  GuildMember,
} from "discord.js";
import { getEntry, updateMemberStatus } from "./wochenabgabeStore.js";
import { buildWochenabgabeContent, buildWochenabgabeComponents } from "./wochenabgabe.js";

const LEADERSCHAFT_ROLE = "Leaderschaft";

export async function handleWochenabgabeBezahlt(interaction: ButtonInteraction) {
  const member = interaction.member as GuildMember;
  const hasRole = member.roles.cache.some((r) => r.name === LEADERSCHAFT_ROLE);

  if (!hasRole) {
    await interaction.reply({
      content: `❌ Nur die **${LEADERSCHAFT_ROLE}** kann Zahlungen bestätigen.`,
      ephemeral: true,
    });
    return;
  }

  const entry = getEntry(interaction.message.id);
  if (!entry) {
    await interaction.reply({ content: "❌ Wochenabgabe nicht gefunden.", ephemeral: true });
    return;
  }

  const selectMenu = new UserSelectMenuBuilder()
    .setCustomId(`wochenabgabe_select:${interaction.message.id}`)
    .setPlaceholder("Mitglied auswählen...")
    .setMinValues(1)
    .setMaxValues(1);

  const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectMenu);

  await interaction.reply({
    content: "Wähle das Mitglied aus, das bezahlt hat:",
    components: [row],
    ephemeral: true,
  });
}

export async function handleWochenabgabeSelect(interaction: UserSelectMenuInteraction) {
  const originalMessageId = interaction.customId.split(":")[1];
  const selectedUserId = interaction.values[0];

  const entry = getEntry(originalMessageId);
  if (!entry) {
    await interaction.reply({ content: "❌ Wochenabgabe nicht gefunden.", ephemeral: true });
    return;
  }

  if (!(selectedUserId in entry.members)) {
    await interaction.reply({
      content: "❌ Dieses Mitglied ist nicht in dieser Wochenabgabe.",
      ephemeral: true,
    });
    return;
  }

  const updated = updateMemberStatus(originalMessageId, selectedUserId, "check");
  if (!updated) {
    await interaction.reply({ content: "❌ Fehler beim Aktualisieren.", ephemeral: true });
    return;
  }

  try {
    const channel = interaction.channel;
    if (channel?.isTextBased()) {
      const original = await channel.messages.fetch(originalMessageId);
      await original.edit({
        content: buildWochenabgabeContent(
          updated.datum,
          updated.uhrzeit,
          updated.abgabe,
          updated.members
        ),
        components: buildWochenabgabeComponents(),
      });
    }
  } catch (err) {
    console.error("Failed to update wochenabgabe message:", err);
  }

  await interaction.reply({
    content: `✅ <@${selectedUserId}> wurde als bezahlt markiert.`,
    ephemeral: true,
  });
}
