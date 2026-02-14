/**
 * Fastify JSON Schema definitions for OpenAPI documentation and validation.
 */
import { FastifySchema } from "fastify";

// ============================================================================
// Shared Schema Components
// ============================================================================

const paginationQuerystring = {
  type: "object",
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 200,
      default: 50,
      description: "Maximum number of items to return",
    },
    offset: {
      type: "integer",
      minimum: 0,
      default: 0,
      description: "Number of items to skip",
    },
  },
} as const;

const paginatedResponse = {
  type: "object",
  properties: {
    total: { type: "integer", description: "Total number of matching items" },
    limit: { type: "integer", description: "Limit used for this request" },
    offset: { type: "integer", description: "Offset used for this request" },
  },
  required: ["total", "limit", "offset"],
} as const;

const notFoundResponse = {
  type: "object",
  properties: {
    error: { type: "string", enum: ["not_found"] },
    message: { type: "string" },
  },
  required: ["error", "message"],
} as const;

const badRequestResponse = {
  type: "object",
  properties: {
    error: { type: "string", enum: ["bad_request"] },
    message: { type: "string" },
  },
  required: ["error", "message"],
} as const;

const slugPattern = "^[a-z0-9-]+$";
const imageFilePattern = "^[a-z0-9-]+\\.webp$";

// ============================================================================
// Character Schemas
// ============================================================================

const characterSkillSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    type: { type: "string", nullable: true },
    category: { type: "string", nullable: true },
    descriptionMd: { type: "string", nullable: true },
    scalingMdByRank: {
      type: "object",
      additionalProperties: { type: "string" },
      nullable: true,
    },
  },
  required: ["id", "name"],
} as const;

const stringOrStringArraySchema = {
  anyOf: [
    { type: "string" },
    { type: "array", items: { type: "string" } },
    { type: "null" },
  ],
} as const;

const resonanceChainEntrySchema = {
  type: "object",
  properties: {
    rank: { type: "integer", nullable: true },
    name: { type: "string", nullable: true },
    descriptionMd: { type: "string", nullable: true },
  },
  required: ["name", "descriptionMd"],
} as const;

const characterSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    rarity: { type: "integer", nullable: true },
    element: { type: "string", nullable: true },
    weaponType: { type: "string", nullable: true },
    combatRoles: stringOrStringArraySchema,
    officialIntroduction: { type: "string", nullable: true },
    releaseDate: { type: "string", nullable: true },
    nation: { type: "string", nullable: true },
    gender: { type: "string", nullable: true },
    class: { type: "string", nullable: true },
    birthplace: { type: "string", nullable: true },
    additionalTitles: stringOrStringArraySchema,
    affiliations: stringOrStringArraySchema,
    skinImages: {
      type: "array",
      items: { type: "string" },
      nullable: true,
    },
    resonanceChain: {
      type: "array",
      items: resonanceChainEntrySchema,
      nullable: true,
    },
    statsByLevel: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          hp: { type: "integer" },
          atk: { type: "integer" },
          def: { type: "integer" },
        },
      },
      nullable: true,
    },
    skills: {
      type: "array",
      items: characterSkillSchema,
      nullable: true,
    },
    images: {
      type: "object",
      additionalProperties: { type: "string" },
      nullable: true,
    },
    source: { type: "object", nullable: true },
    lastUpdated: { type: "string", nullable: true },
  },
  required: ["id", "name"],
} as const;

export const listCharactersSchema: FastifySchema = {
  description: "List all characters with optional filtering and pagination",
  tags: ["Characters"],
  querystring: {
    type: "object",
    properties: {
      ...paginationQuerystring.properties,
      search: {
        type: "string",
        description: "Filter by name (case-insensitive substring match)",
      },
      element: {
        type: "string",
        description: "Filter by element (exact match, case-insensitive)",
      },
      weaponType: {
        type: "string",
        description: "Filter by weapon type (exact match, case-insensitive)",
      },
      rarity: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Filter by rarity (1-5 stars)",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        ...paginatedResponse.properties,
        items: {
          type: "array",
          items: characterSchema,
        },
      },
      required: [...paginatedResponse.required, "items"],
    },
  },
};

export const getCharacterSchema: FastifySchema = {
  description: "Get a single character by ID",
  tags: ["Characters"],
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Character ID (slug)",
        pattern: slugPattern,
      },
    },
    required: ["id"],
  },
  response: {
    200: characterSchema,
    404: notFoundResponse,
  },
};

export const listCharacterImagesSchema: FastifySchema = {
  description: "List available images for a character",
  tags: ["Characters"],
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Character ID (slug)",
        pattern: slugPattern,
      },
    },
    required: ["id"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "string" },
        images: {
          type: "array",
          items: {
            type: "object",
            properties: {
              file: { type: "string" },
              url: { type: "string" },
            },
            required: ["file", "url"],
          },
        },
      },
      required: ["id", "images"],
    },
    404: notFoundResponse,
  },
};

export const getCharacterImageSchema: FastifySchema = {
  description: "Get a specific character image file",
  tags: ["Characters"],
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Character ID (slug)",
        pattern: slugPattern,
      },
      file: {
        type: "string",
        description: "Image filename (e.g., icon.webp)",
        pattern: imageFilePattern,
      },
    },
    required: ["id", "file"],
  },
  response: {
    400: badRequestResponse,
    404: notFoundResponse,
  },
};

// ============================================================================
// Weapon Schemas
// ============================================================================

const weaponSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    rarity: { type: "integer", nullable: true },
    type: { type: "string", nullable: true },
    secondaryStatType: { type: "string", nullable: true },
    statsByLevel: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          atk: { type: "integer" },
        },
      },
      nullable: true,
    },
    passive: {
      type: "object",
      properties: {
        name: { type: "string" },
        descriptionMdByRank: {
          type: "object",
          additionalProperties: { type: "string" },
        },
      },
      nullable: true,
    },
    images: {
      type: "object",
      additionalProperties: { type: "string" },
      nullable: true,
    },
    descriptionMd: { type: "string", nullable: true },
    source: { type: "object", nullable: true },
    lastUpdated: { type: "string", nullable: true },
  },
  required: ["id", "name"],
} as const;

export const listWeaponsSchema: FastifySchema = {
  description: "List all weapons with optional filtering and pagination",
  tags: ["Weapons"],
  querystring: {
    type: "object",
    properties: {
      ...paginationQuerystring.properties,
      search: {
        type: "string",
        description: "Filter by name (case-insensitive substring match)",
      },
      type: {
        type: "string",
        description: "Filter by weapon type (exact match, case-insensitive)",
      },
      rarity: {
        type: "integer",
        minimum: 1,
        maximum: 5,
        description: "Filter by rarity (1-5 stars)",
      },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        ...paginatedResponse.properties,
        items: {
          type: "array",
          items: weaponSchema,
        },
      },
      required: [...paginatedResponse.required, "items"],
    },
  },
};

export const getWeaponSchema: FastifySchema = {
  description: "Get a single weapon by ID",
  tags: ["Weapons"],
  params: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Weapon ID (slug)",
        pattern: slugPattern,
      },
    },
    required: ["id"],
  },
  response: {
    200: weaponSchema,
    404: notFoundResponse,
  },
};

// ============================================================================
// Meta Schemas
// ============================================================================

export const metaSchema: FastifySchema = {
  description: "Get API metadata and dataset information",
  tags: ["Meta"],
  response: {
    200: {
      type: "object",
      properties: {
        name: { type: "string" },
        version: { type: "string" },
        poweredBy: { type: "string" },
        dataset: {
          type: "object",
          properties: {
            dataRoot: { type: "string" },
            languages: { type: "array", items: { type: "string" } },
            counts: {
              type: "object",
              properties: {
                characters: { type: "integer" },
                weapons: { type: "integer" },
              },
            },
            lastUpdatedMax: { type: "string", nullable: true },
            fileMtimeMaxMs: { type: "number", nullable: true },
            version: { type: "string" },
          },
        },
      },
    },
  },
};

export const healthSchema: FastifySchema = {
  description: "Health check endpoint",
  tags: ["Meta"],
  response: {
    200: {
      type: "object",
      properties: {
        ok: { type: "boolean" },
      },
      required: ["ok"],
    },
  },
};

// ============================================================================
// TypeScript Types (derived from schemas for route handlers)
// ============================================================================

export type CharacterListQuery = {
  search?: string;
  element?: string;
  weaponType?: string;
  rarity?: string;
  limit?: string;
  offset?: string;
};

export type WeaponListQuery = {
  search?: string;
  type?: string;
  rarity?: string;
  limit?: string;
  offset?: string;
};

export type IdParams = {
  id: string;
};

export type ImageFileParams = {
  id: string;
  file: string;
};
