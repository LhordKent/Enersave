import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { getKvConfig } from "@/lib/deployment-config";
import { BmsState, createInitialBmsState } from "@/lib/state-model";

const STORE_KEY = "enersave:bms-state";
const LOCAL_STORE_PATH = process.env.VERCEL
  ? path.join("/tmp", "enersave-bms-state.json")
  : path.join(process.cwd(), ".data", "bms-state.json");

async function readStateFromKv(config: { url: string; token: string }) {
  const response = await fetch(`${config.url}/get/${STORE_KEY}`, {
    headers: {
      Authorization: `Bearer ${config.token}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`KV read failed with ${response.status}`);
  }

  const payload = (await response.json()) as { result: string | null; error?: string };

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result ? (JSON.parse(payload.result) as BmsState) : null;
}

async function writeStateToKv(config: { url: string; token: string }, state: BmsState) {
  const response = await fetch(`${config.url}/set/${STORE_KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(state),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`KV write failed with ${response.status}`);
  }

  const payload = (await response.json()) as { result?: string; error?: string };

  if (payload.error) {
    throw new Error(payload.error);
  }
}

async function readStateFromFile() {
  try {
    const content = await readFile(LOCAL_STORE_PATH, "utf8");
    return JSON.parse(content) as BmsState;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeStateToFile(state: BmsState) {
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(state, null, 2), "utf8");
}

export async function readBmsState() {
  const kvConfig = getKvConfig();

  if (kvConfig) {
    const kvState = await readStateFromKv(kvConfig);
    if (kvState) {
      return kvState;
    }

    const initialState = createInitialBmsState();
    await writeStateToKv(kvConfig, initialState);
    return initialState;
  }

  const fileState = await readStateFromFile();
  if (fileState) {
    return fileState;
  }

  const initialState = createInitialBmsState();
  await writeStateToFile(initialState);
  return initialState;
}

export async function writeBmsState(state: BmsState) {
  const kvConfig = getKvConfig();

  if (kvConfig) {
    await writeStateToKv(kvConfig, state);
    return;
  }

  await writeStateToFile(state);
}

export async function updateBmsState(update: (state: BmsState) => Promise<BmsState> | BmsState) {
  const currentState = await readBmsState();
  const nextState = await update(currentState);
  await writeBmsState(nextState);
  return nextState;
}
