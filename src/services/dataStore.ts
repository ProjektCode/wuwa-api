import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export type Character = {
  id: string;
  name: string;
  rarity?: number;
  element?: string;
  weaponType?: string;
  combatRoles?: string | string[] | null;
  officialIntroduction?: string | null;
  releaseDate?: string | null;
  nation?: string | null;
  gender?: string | null;
  class?: string | null;
  birthplace?: string | null;
  additionalTitles?: string | string[] | null;
  affiliations?: string | string[] | null;
  skinImages?: string[] | null;
  resonanceChain?: Array<{
    rank?: number | null;
    name?: string | null;
    descriptionMd?: string | null;
  }> | null;
  statsByLevel?: Record<string, { hp: number; atk: number; def: number }>;
  skills?: Array<{
    id: string;
    name: string;
    type?: string;
    category?: string;
    descriptionMd?: string;
    scalingMdByRank?: Record<string, string>;
  }>;
  images?: Record<string, string>;
  source?: Record<string, unknown>;
  lastUpdated?: string;
};

export type Weapon = {
  id: string;
  name: string;
  rarity?: number;
  type?: string;
  secondaryStatType?: string;
  statsByLevel?: Record<string, Record<string, number | string>>;
  passive?: {
    name: string;
    descriptionMdByRank: Record<string, string>;
  } | null;
  images?: Record<string, string>;
  descriptionMd?: string;
  source?: Record<string, unknown>;
  lastUpdated?: string;
};

export type DataStore = {
  listCharacters(): Character[];
  getCharacter(id: string): Character | null;
  listWeapons(): Weapon[];
  getWeapon(id: string): Weapon | null;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadEntities<T extends { id: string }>(
  root: string,
  entityType: string
): Promise<Map<string, T>> {
  const dirPath = path.join(root, entityType);
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return new Map();
  }

  const map = new Map<string, T>();
  await Promise.all(
    entries.map(async (id) => {
      const filePath = path.join(dirPath, id, "en.json");
      try {
        const entity = await readJsonFile<T>(filePath);
        if (entity?.id) map.set(entity.id, entity);
      } catch {
        // ignore bad entries; importer/CI should catch
      }
    })
  );

  return map;
}

export async function createDataStore(dataRoot: string): Promise<DataStore> {
  const [characters, weapons] = await Promise.all([
    loadEntities<Character>(dataRoot, "characters"),
    loadEntities<Weapon>(dataRoot, "weapons"),
  ]);

  // Normalize character base stats (in-game values are whole numbers).
  for (const c of characters.values()) {
    if (!c.statsByLevel) continue;
    for (const stats of Object.values(c.statsByLevel)) {
      stats.hp = Math.round(stats.hp);
      stats.atk = Math.round(stats.atk);
      stats.def = Math.round(stats.def);
    }
  }

  return {
    listCharacters: () => [...characters.values()],
    getCharacter: (id) => characters.get(id) ?? null,
    listWeapons: () => [...weapons.values()],
    getWeapon: (id) => weapons.get(id) ?? null,
  };
}
