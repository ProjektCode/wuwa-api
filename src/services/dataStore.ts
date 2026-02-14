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

type LoadStats = {
  total: number;
  loaded: number;
  bad: number;
};

export type DataStoreLoadStats = {
  characters: LoadStats;
  weapons: LoadStats;
};

type LoadResult<T> = {
  map: Map<string, T>;
  stats: LoadStats;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadEntities<T extends { id: string }>(
  root: string,
  entityType: string
): Promise<LoadResult<T>> {
  const dirPath = path.join(root, entityType);
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch {
    return {
      map: new Map(),
      stats: { total: 0, loaded: 0, bad: 0 },
    };
  }

  const map = new Map<string, T>();
  let loaded = 0;
  let bad = 0;
  await Promise.all(
    entries.map(async (id) => {
      const filePath = path.join(dirPath, id, "en.json");
      try {
        const entity = await readJsonFile<T>(filePath);
        if (entity?.id) {
          map.set(entity.id, entity);
          loaded += 1;
        } else {
          bad += 1;
        }
      } catch {
        bad += 1;
      }
    })
  );

  return {
    map,
    stats: { total: entries.length, loaded, bad },
  };
}

export async function createDataStore(
  dataRoot: string
): Promise<{ store: DataStore; stats: DataStoreLoadStats }> {
  const [charactersResult, weaponsResult] = await Promise.all([
    loadEntities<Character>(dataRoot, "characters"),
    loadEntities<Weapon>(dataRoot, "weapons"),
  ]);

  const characters = charactersResult.map;
  const weapons = weaponsResult.map;

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
    store: {
      listCharacters: () => [...characters.values()],
      getCharacter: (id) => characters.get(id) ?? null,
      listWeapons: () => [...weapons.values()],
      getWeapon: (id) => weapons.get(id) ?? null,
    },
    stats: {
      characters: charactersResult.stats,
      weapons: weaponsResult.stats,
    },
  };
}
