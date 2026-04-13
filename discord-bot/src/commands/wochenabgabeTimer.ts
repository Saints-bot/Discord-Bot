import { Client, TextChannel } from "discord.js";
import { expireEntry, getAllEntries, WochenabgabeEntry } from "./wochenabgabeStore.js";
import { buildWochenabgabeContent } from "./wochenabgabe.js";

let botClient: Client | null = null;

export function setTimerClient(client: Client) {
  botClient = client;
}

export function scheduleExpiry(entry: WochenabgabeEntry) {
  const delay = entry.deadline - Date.now();
  if (delay <= 0) {
    void doExpire(entry.messageId);
    return;
  }
  console.log(
    `⏰ Wochenabgabe ${entry.messageId} expires in ${Math.round(delay / 60000)} min`
  );
  setTimeout(() => void doExpire(entry.messageId), delay);
}

async function doExpire(messageId: string) {
  if (!botClient) return;
  const updated = expireEntry(messageId);
  if (!updated) return;

  try {
    const channel = (await botClient.channels.fetch(updated.channelId)) as TextChannel;
    const msg = await channel.messages.fetch(messageId);
    const content = buildWochenabgabeContent(
      updated.datum,
      updated.uhrzeit,
      updated.abgabe,
      updated.members
    );
    // Remove the button row after deadline
    await msg.edit({ content, components: [] });
    console.log(`✅ Wochenabgabe ${messageId} expired — hourglasses → ❌`);
  } catch (err) {
    console.error("Failed to expire wochenabgabe:", err);
  }
}

export async function initializeTimers(client: Client) {
  setTimerClient(client);
  const entries = getAllEntries();
  if (entries.length > 0) {
    console.log(`🔄 Restoring ${entries.length} Wochenabgabe timer(s)...`);
    for (const entry of entries) {
      scheduleExpiry(entry);
    }
  }
}
