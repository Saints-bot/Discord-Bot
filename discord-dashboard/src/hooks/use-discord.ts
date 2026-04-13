import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";

const API_URL = import.meta.env.VITE_API_URL;

// --- Schemas matching the OpenAPI spec ---
const GuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
});

const ChannelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.number(),
});

export type Guild = z.infer<typeof GuildSchema>;
export type Channel = z.infer<typeof ChannelSchema>;

const GuildsResponseSchema = z.object({
  guilds: z.array(GuildSchema),
});

const ChannelsResponseSchema = z.object({
  channels: z.array(ChannelSchema),
});

export type EmbedData = {
  title?: string;
  description?: string;
  color?: string;
  footer?: string;
};

export type SendMessagePayload = {
  channelId: string;
  content?: string;
  embed?: EmbedData;
};

// --- Hooks ---

export function useGuilds() {
  return useQuery({
    queryKey: ["discord", "guilds"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/discord/guilds`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch guilds");
      }

      const data = await res.json();
      return GuildsResponseSchema.parse(data).guilds;
    },
  });
}

export function useChannels(guildId?: string) {
  return useQuery({
    queryKey: ["discord", "channels", guildId],
    queryFn: async () => {
      if (!guildId) return [];

      const res = await fetch(
        `${API_URL}/api/discord/guilds/${guildId}/channels`
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch channels");
      }

      const data = await res.json();
      return ChannelsResponseSchema.parse(data).channels;
    },
    enabled: !!guildId,
  });
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async (payload: SendMessagePayload) => {
      const res = await fetch(`${API_URL}/api/discord/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to send message");
      }

      return res.json();
    },
  });
}