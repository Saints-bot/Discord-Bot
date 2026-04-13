import { ButtonInteraction, GuildMember } from "discord.js";

const ALLOWED_ROLE_NAME = "Leaderschaft";

export async function handleSanktionDelete(interaction: ButtonInteraction) {
  const member = interaction.member as GuildMember;

  const hasRole = member.roles.cache.some(
    (role) => role.name === ALLOWED_ROLE_NAME
  );

  if (!hasRole) {
    await interaction.reply({
      content: `❌ Nur die **${ALLOWED_ROLE_NAME}** darf Sanktionen löschen.`,
      ephemeral: true,
    });
    return;
  }

  await interaction.message.delete();
  await interaction.reply({ content: "✅ Sanktion wurde gelöscht.", ephemeral: true });
}
