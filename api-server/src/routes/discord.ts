import { Router, type IRouter, type Request, type Response } from "express";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

const router: IRouter = Router();

function getRestClient() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN is not set");
  return new REST({ version: "10" }).setToken(token);
}

router.get("/discord/guilds", async (req: Request, res: Response) => {
  try {
    const rest = getRestClient();
    const guilds = (await rest.get(Routes.userGuilds())) as any[];
    res.json({ guilds });
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch guilds");
    res.status(500).json({ error: err.message });
  }
});

router.get("/discord/guilds/:guildId/channels", async (req: Request, res: Response) => {
  try {
    const rest = getRestClient();
    const guildId = String(req.params.guildId);

    const channels = (await rest.get(Routes.guildChannels(guildId))) as any[];
    const textChannels = channels.filter((c) => c.type === 0);
    res.json({ channels: textChannels });
  } catch (err: any) {
    req.log.error({ err }, "Failed to fetch channels");
    res.status(500).json({ error: err.message });
  }
});

router.post("/discord/send", async (req: Request, res: Response) => {
  const { channelId, content, embed } = req.body;

  if (!channelId) {
    res.status(400).json({ error: "channelId is required" });
    return;
  }

  if (!content && !embed) {
    res.status(400).json({ error: "Either content or embed is required" });
    return;
  }

  try {
    const rest = getRestClient();
    const body: Record<string, any> = {};

    if (content) body.content = content;
    if (embed) {
      body.embeds = [
        {
          title: embed.title || undefined,
          description: embed.description || undefined,
          color: embed.color ? parseInt(embed.color.replace("#", ""), 16) : 0x5865f2,
          footer: embed.footer ? { text: embed.footer } : undefined,
        },
      ];
    }

    const message = await rest.post(Routes.channelMessages(channelId), { body });
    res.json({ success: true, message });
  } catch (err: any) {
    req.log.error({ err }, "Failed to send message");
    res.status(500).json({ error: err.message });
  }
});

export default router;
