import { FastifyInstance } from "fastify";
import { DataStore } from "../../services/dataStore";
import {
  toNumber,
  includesCI,
  parsePagination,
  RateLimitTiers,
} from "../../utils/query";
import {
  listWeaponsSchema,
  getWeaponSchema,
  WeaponListQuery,
  IdParams,
} from "../../schemas";

export async function registerWeaponRoutes(
  app: FastifyInstance,
  store: DataStore,
  rate: RateLimitTiers
): Promise<void> {
  app.get<{ Querystring: WeaponListQuery }>(
    "/v1/weapons",
    {
      schema: listWeaponsSchema,
      preHandler: app.rateLimit({
        max: rate.list.max,
        timeWindow: rate.timeWindow,
        groupId: "weapons:list",
      }),
    },
    async (req) => {
      const query = req.query;

      const search = query.search?.trim() ?? "";
      const type = query.type?.trim() ?? "";
      const rarity = toNumber(query.rarity);

      const { limit, offset } = parsePagination(query);

      let items = store.listWeapons();

      if (search) items = items.filter((w) => includesCI(w.name, search));
      if (type)
        items = items.filter(
          (w) => (w.type ?? "").toLowerCase() === type.toLowerCase()
        );
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

  app.get<{ Params: IdParams }>(
    "/v1/weapons/:id",
    {
      schema: getWeaponSchema,
      preHandler: app.rateLimit({
        max: rate.detail.max,
        timeWindow: rate.timeWindow,
        groupId: "weapons:detail",
      }),
    },
    async (req, reply) => {
      const { id } = req.params;
      const weapon = store.getWeapon(id);
      if (!weapon) {
        reply.code(404);
        return { error: "not_found", message: `Weapon '${id}' not found` };
      }
      return weapon;
    }
  );
}
