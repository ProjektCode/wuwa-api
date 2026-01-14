import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

type ValidationError = {
  file: string;
  message: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Expected non-empty string for '${field}'`);
  }
  return value;
}

function expectNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Expected number for '${field}'`);
  }
  return value;
}

function expectOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  return expectNumber(value, field);
}

function validateStatsByLevel(
  value: unknown,
  kind: "character" | "weapon"
): void {
  if (value === undefined) return;
  if (!isObject(value)) throw new Error("Expected object for 'statsByLevel'");

  const requiredLevels = ["20", "50", "90"];
  for (const level of requiredLevels) {
    const entry = value[level];
    if (!isObject(entry)) {
      throw new Error(`Missing or invalid statsByLevel['${level}']`);
    }

    if (kind === "character") {
      expectNumber(entry.hp, `statsByLevel['${level}'].hp`);
      expectNumber(entry.atk, `statsByLevel['${level}'].atk`);
      expectNumber(entry.def, `statsByLevel['${level}'].def`);
    } else {
      expectNumber(entry.atk, `statsByLevel['${level}'].atk`);
    }
  }
}

function validateImages(value: unknown, requiredKeys: string[]): void {
  if (value === undefined) return;
  if (!isObject(value)) throw new Error("Expected object for 'images'");
  for (const key of requiredKeys) {
    const v = value[key];
    if (typeof v !== "string" || !v.startsWith("/v1/images/")) {
      throw new Error(`Expected images.${key} to be a /v1/images/... URL`);
    }
  }
}

function validateCharacterJson(obj: Record<string, unknown>): void {
  expectString(obj.id, "id");
  expectString(obj.name, "name");

  if (obj.rarity !== undefined) expectNumber(obj.rarity, "rarity");
  if (obj.element !== undefined) expectString(obj.element, "element");
  if (obj.weaponType !== undefined) expectString(obj.weaponType, "weaponType");

  validateStatsByLevel(obj.statsByLevel, "character");
  validateImages(obj.images, ["icon", "card", "splash", "attribute"]);

  if (obj.skills !== undefined) {
    if (!Array.isArray(obj.skills)) throw new Error("Expected array for 'skills'");
    for (const [idx, skill] of obj.skills.entries()) {
      if (!isObject(skill)) throw new Error(`Expected skills[${idx}] to be an object`);
      expectString(skill.id, `skills[${idx}].id`);
      expectString(skill.name, `skills[${idx}].name`);
      if (skill.descriptionMd !== undefined) {
        expectString(skill.descriptionMd, `skills[${idx}].descriptionMd`);
      }
      if (skill.scalingMdByRank !== undefined) {
        if (!isObject(skill.scalingMdByRank)) {
          throw new Error(`Expected object for skills[${idx}].scalingMdByRank`);
        }
        for (const rank of ["1", "5", "10"]) {
          if (typeof skill.scalingMdByRank[rank] !== "string") {
            throw new Error(`Expected skills[${idx}].scalingMdByRank['${rank}'] to be string`);
          }
        }
      }
    }
  }
}

function validateWeaponJson(obj: Record<string, unknown>): void {
  expectString(obj.id, "id");
  expectString(obj.name, "name");

  if (obj.rarity !== undefined && obj.rarity !== null) expectNumber(obj.rarity, "rarity");
  if (obj.type !== undefined && obj.type !== null) expectString(obj.type, "type");
  if (obj.secondaryStatType !== undefined && obj.secondaryStatType !== null)
    expectString(obj.secondaryStatType, "secondaryStatType");

  validateStatsByLevel(obj.statsByLevel, "weapon");
  validateImages(obj.images, ["icon"]);

  if (obj.passive !== undefined && obj.passive !== null) {
    if (!isObject(obj.passive)) throw new Error("Expected object for 'passive'");
    expectString(obj.passive.name, "passive.name");
    if (!isObject(obj.passive.descriptionMdByRank)) {
      throw new Error("Expected object for 'passive.descriptionMdByRank'");
    }
  }
}

async function listEntityFiles(entityDir: string): Promise<string[]> {
  let ids: string[];
  try {
    ids = await readdir(entityDir);
  } catch {
    return [];
  }

  return ids.map((id) => path.join(entityDir, id, "en.json"));
}

async function validateFile(filePath: string, kind: "character" | "weapon"): Promise<ValidationError | null> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (err) {
    return { file: filePath, message: `Failed to read: ${String(err)}` };
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    return { file: filePath, message: `Invalid JSON: ${String(err)}` };
  }

  if (!isObject(json)) return { file: filePath, message: "Expected root object" };

  try {
    if (kind === "character") validateCharacterJson(json);
    else validateWeaponJson(json);
  } catch (err) {
    return { file: filePath, message: err instanceof Error ? err.message : String(err) };
  }

  return null;
}

async function main(): Promise<void> {
  const dataRoot = process.env.DATA_ROOT ?? "assets/data";

  const charactersDir = path.join(dataRoot, "characters");
  const weaponsDir = path.join(dataRoot, "weapons");

  const [characterFiles, weaponFiles] = await Promise.all([
    listEntityFiles(charactersDir),
    listEntityFiles(weaponsDir),
  ]);

  const errors: ValidationError[] = [];

  const characterResults = await Promise.all(
    characterFiles.map((f) => validateFile(f, "character"))
  );
  errors.push(...characterResults.filter((e): e is ValidationError => e !== null));

  const weaponResults = await Promise.all(weaponFiles.map((f) => validateFile(f, "weapon")));
  errors.push(...weaponResults.filter((e): e is ValidationError => e !== null));

  console.log(
    `validate-data: characters=${characterFiles.length} weapons=${weaponFiles.length} errors=${errors.length}`
  );

  if (errors.length) {
    for (const e of errors.slice(0, 50)) {
      console.log(`- ${e.file}: ${e.message}`);
    }
    if (errors.length > 50) {
      console.log(`...and ${errors.length - 50} more`);
    }
    process.exitCode = 1;
  }
}

void main();
