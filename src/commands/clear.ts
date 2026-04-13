import { ChatInputCommandInteraction, TextChannel, PermissionFlagsBits } from "discord.js";

export async function handleClear(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: "❌ You need the **Manage Messages** permission to use this command.",
      ephemeral: true,
    });
    return;
  }

  if (!(interaction.channel instanceof TextChannel)) {
    await interaction.reply({
      content: "❌ This command can only be used in a text channel.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const deleted = await interaction.channel.bulkDelete(amount, true);
    await interaction.editReply({
      content: `✅ Successfully deleted **${deleted.size}** message${deleted.size !== 1 ? "s" : ""}.`,
    });
  } catch (err: any) {
    console.error("Error during bulkDelete:", err);
    await interaction.editReply({
      content: `❌ Could not delete messages. Note: Discord only allows bulk deleting messages that are less than 14 days old.\n\`${err.message}\``,
    });
  }
}
