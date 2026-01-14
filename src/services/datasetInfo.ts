import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

export type DatasetInfo = {
  dataRoot: string;
  languages: string[];
  counts: {
    characters: number;
    weapons: number;
  };
  lastUpdatedMax: string | null;
  fileMtimeMaxMs: number | null;
};

async function listIds(dirPath: string): Promise<string[]> {
  try {
    return await readdir(dirPath);
  } catch {
    return [];
  }
}

async function readEntityLastUpdated(filePath: string): Promise<string | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    const json = JSON.parse(raw) as { lastUpdated?: unknown };
    return typeof json.lastUpdated === "string" ? json.lastUpdated : null;
  } catch {
    return null;
  }
}

async function readEntityMtimeMs(filePath: string): Promise<number | null> {
  try {
    const s = await stat(filePath);
    return s.mtimeMs;
  } catch {
    return null;
  }
}

export async function computeDatasetInfo(dataRoot: string): Promise<DatasetInfo> {
  const charactersDir = path.join(dataRoot, "characters");
  const weaponsDir = path.join(dataRoot, "weapons");

  const [characterIds, weaponIds] = await Promise.all([
    listIds(charactersDir),
    listIds(weaponsDir),
  ]);

  const entityFiles: string[] = [];
  for (const id of characterIds) entityFiles.push(path.join(charactersDir, id, "en.json"));
  for (const id of weaponIds) entityFiles.push(path.join(weaponsDir, id, "en.json"));

  const [lastUpdatedValues, mtimes] = await Promise.all([
    Promise.all(entityFiles.map(readEntityLastUpdated)),
    Promise.all(entityFiles.map(readEntityMtimeMs)),
  ]);

  const lastUpdatedMax = lastUpdatedValues
    .filter((v): v is string => typeof v === "string")
    .sort()
    .at(-1) ?? null;

  const fileMtimeMaxMs = mtimes
    .filter((v): v is number => typeof v === "number")
    .reduce<number | null>((acc, cur) => (acc === null ? cur : Math.max(acc, cur)), null);

  return {
    dataRoot,
    languages: ["en"],
    counts: {
      characters: characterIds.length,
      weapons: weaponIds.length,
    },
    lastUpdatedMax,
    fileMtimeMaxMs,
  };
}
