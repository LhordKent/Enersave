import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("enersave-web", ".next");
const target = resolve(".next");

if (!existsSync(source)) {
  console.error(`Expected Next.js output at ${source}`);
  process.exit(1);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

cpSync(source, target, { recursive: true });
console.log(`Synced ${source} -> ${target}`);
