import { Client, REST, Routes, SlashCommandBuilder } from "discord.js";

const commands = [
  new SlashCommandBuilder()
    .setName("transporter")
    .setDescription("Sends the current timestamp in a text box")
    .toJSON(),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Delete a number of messages from this channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("sanktion")
    .setDescription("Sanktion gegen ein Familienmitglied aussprechen")
    .addIntegerOption((option) =>
      option
        .setName("nummer")
        .setDescription("Sanktionsnummer (1–28)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(28)
    )
    .addUserOption((option) =>
      option
        .setName("mitglied")
        .setDescription("Das zu sanktionierende Mitglied")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("wochenabgabe")
    .setDescription("Wochenabgabe für alle Saints-Mitglieder erstellen")
    .addStringOption((option) =>
      option
        .setName("datum")
        .setDescription("Fälligkeitsdatum (TT.MM.JJJJ)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("uhrzeit")
        .setDescription("Fälligkeitszeit (HH:MM)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("abgabe")
        .setDescription("Was abzugeben ist (z.B. 50.000$)")
        .setRequired(true)
    )
    .toJSON(),

  new SlashCommandBuilder()
    .setName("aufstellung")
    .setDescription("Aufstellung für Saints erstellen (nur Leaderschaft)")
    .addStringOption((option) =>
      option
        .setName("uhrzeit")
        .setDescription("Uhrzeit der Aufstellung (z.B. 20:00)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("todo1")
        .setDescription("Erstes ToDo (Pflicht)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("todo2")
        .setDescription("Zweites ToDo (optional)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("todo3")
        .setDescription("Drittes ToDo (optional)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("todo4")
        .setDescription("Viertes ToDo (optional)")
        .setRequired(false)
    )
    .toJSON(),
];

export async function registerCommands(client: Client<true>) {
  const token = process.env.DISCORD_BOT_TOKEN!;
  const rest = new REST({ version: "10" }).setToken(token);

  const guilds = client.guilds.cache;
  if (guilds.size === 0) {
    console.log("⚠️  Bot is not in any guilds — skipping command registration.");
    return;
  }

  for (const [guildId, guild] of guilds) {
    try {
      console.log(`🔄 Registering commands in guild: ${guild.name}`);
      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
      console.log(`✅ Commands registered in: ${guild.name}`);
    } catch (err) {
      console.error(`Failed to register commands in ${guild.name}:`, err);
    }
  }
}
