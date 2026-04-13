import { ChatInputCommandInteraction, GuildMember, TextChannel } from "discord.js";

export async function checkChannel(
  interaction: ChatInputCommandInteraction,
  requiredChannelName: string
): Promise<boolean> {
  const channel = interaction.channel as TextChannel;
  if (!channel || channel.name !== requiredChannelName) {
    const targetChannel = interaction.guild?.channels.cache.find(
      (c) => c.name === requiredChannelName
    );
    const mention = targetChannel ? `<#${targetChannel.id}>` : `**#${requiredChannelName}**`;
    await interaction.reply({
      content: `❌ Dieser Befehl kann nur im ${mention} Kanal verwendet werden.`,
      ephemeral: true,
    });
    return false;
  }
  return true;
}

export async function checkChannelById(
  interaction: ChatInputCommandInteraction,
  requiredChannelId: string
): Promise<boolean> {
  if (interaction.channelId !== requiredChannelId) {
    await interaction.reply({
      content: `❌ Dieser Befehl kann nur im <#${requiredChannelId}> Kanal verwendet werden.`,
      ephemeral: true,
    });
    return false;
  }
  return true;
}

export async function checkRole(
  interaction: ChatInputCommandInteraction,
  requiredRoleName: string
): Promise<boolean> {
  const member = interaction.member as GuildMember;
  const hasRole = member.roles.cache.some((r) => r.name === requiredRoleName);
  if (!hasRole) {
    await interaction.reply({
      content: `❌ Nur die **${requiredRoleName}** kann diesen Befehl verwenden.`,
      ephemeral: true,
    });
    return false;
  }
  return true;
}
