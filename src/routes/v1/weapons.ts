import { FastifyInstance } from "fastify";
import { DataStore } from "../../services/dataStore";

function toNumber(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export type RateLimitTiers = {
  timeWindow: string;
  list: { max: number };
  detail: { max: number };
};

export async function registerWeaponRoutes(
  app: FastifyInstance,
  store: DataStore,
  rate: RateLimitTiers
): Promise<void> {
  app.get(
    "/v1/weapons",
    {
      preHandler: app.rateLimit({
        max: rate.list.max,
        timeWindow: rate.timeWindow,
        groupId: "weapons:list",
      }),
    },
    async (req) => {
    const query = req.query as Record<string, unknown>;

    const search = typeof query.search === "string" ? query.search.trim() : "";
    const type = typeof query.type === "string" ? query.type.trim() : "";
    const rarity = toNumber(query.rarity);

    const limit = Math.min(Math.max(toNumber(query.limit) ?? 50, 1), 200);
    const offset = Math.max(toNumber(query.offset) ?? 0, 0);

    let items = store.listWeapons();

    if (search) items = items.filter((w) => includesCI(w.name, search));
    if (type) items = items.filter((w) => (w.type ?? "").toLowerCase() === type.toLowerCase());
    if (rarity !== null) items = items.filter((w) => w.rarity === rarity);

    const total = items.length;
    const paged = items.slice(offset, offset + limit);

    return {
      total,
      limit,
      offset,
      items: paged,
    };
  }
  );

  app.get(
    "/v1/weapons/:id",
    {
      preHandler: app.rateLimit({
        max: rate.detail.max,
        timeWindow: rate.timeWindow,
        groupId: "weapons:detail",
      }),
    },
    async (req, reply) => {
    const { id } = req.params as { id: string };
    const weapon = store.getWeapon(id);
    if (!weapon) {
      reply.code(404);
      return { error: "not_found", message: `Weapon '${id}' not found` };
    }
    return weapon;
  }
  );
}
