import { ChatInputCommandInteraction } from "discord.js";
import { checkChannelById, checkRole } from "./guards.js";

export async function handleAufstellung(interaction: ChatInputCommandInteraction) {
  if (!(await checkChannelById(interaction, "1485994064003469523"))) return;
  if (!(await checkRole(interaction, "Leaderschaft"))) return;

  const uhrzeit = interaction.options.getString("uhrzeit", true);
  const todo1 = interaction.options.getString("todo1", true);
  const todo2 = interaction.options.getString("todo2");
  const todo3 = interaction.options.getString("todo3");
  const todo4 = interaction.options.getString("todo4");

  const guild = interaction.guild!;
  const saintsRole = guild.roles.cache.find((r) => r.name === "Saints");
  const saintsRoleMention = saintsRole ? `<@&${saintsRole.id}>` : "@Saints";

  const todos = [todo1, todo2, todo3, todo4].filter(Boolean) as string[];
  const todoLines = todos.map((t) => `- ${t}`).join("\n");

  const content = [
    saintsRoleMention,
    ``,
    `Aufstellung heute um ${uhrzeit}Uhr.`,
    ``,
    `ToDo:`,
    todoLines,
    ``,
    `Jeder der es zeitlich nicht schafft, hat sich abzumelden.`,
  ].join("\n");

  await interaction.deferReply();
  const message = await interaction.editReply({ content });

  await message.react("✅");
  await message.react("❌");
  await message.react("⏳");
}
