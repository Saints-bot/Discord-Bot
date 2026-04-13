import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "wochenabgaben.json");

export type MemberStatus = "hourglass" | "check" | "x";

export interface WochenabgabeEntry {
  messageId: string;
  channelId: string;
  guildId: string;
  deadline: number;
  datum: string;
  uhrzeit: string;
  abgabe: string;
  members: Record<string, MemberStatus>;
}

type Store = Record<string, WochenabgabeEntry>;

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function loadStore(): Store {
  ensureDir();
  if (!existsSync(STORE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STORE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveStore(store: Store) {
  ensureDir();
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

export function getEntry(messageId: string): WochenabgabeEntry | undefined {
  return loadStore()[messageId];
}

export function saveEntry(entry: WochenabgabeEntry) {
  const store = loadStore();
  store[entry.messageId] = entry;
  saveStore(store);
}

export function getAllEntries(): WochenabgabeEntry[] {
  return Object.values(loadStore());
}

export function updateMemberStatus(
  messageId: string,
  userId: string,
  status: MemberStatus
): WochenabgabeEntry | undefined {
  const store = loadStore();
  if (!store[messageId]) return undefined;
  store[messageId].members[userId] = status;
  saveStore(store);
  return store[messageId];
}

export function expireEntry(messageId: string): WochenabgabeEntry | undefined {
  const store = loadStore();
  const entry = store[messageId];
  if (!entry) return undefined;
  for (const userId of Object.keys(entry.members)) {
    if (entry.members[userId] === "hourglass") {
      entry.members[userId] = "x";
    }
  }
  store[messageId] = entry;
  saveStore(store);
  return entry;
}
