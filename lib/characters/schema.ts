import { z } from "zod"

import type { CodeTemplate, TemplateValues } from "../templates/types"

export const MAX_FIELD_LENGTH = 20_000
export const MAX_NAME_LENGTH = 80

/**
 * Ne garde que les champs connus du gabarit, sous forme de chaînes bornées.
 * Les valeurs inconnues ou mal typées sont ignorées : ce qui est stocké en
 * base ne dépend jamais de la structure envoyée par le client.
 */
export function sanitizeValues(
  template: CodeTemplate,
  raw: unknown,
): TemplateValues {
  const source =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  const values: TemplateValues = {}
  for (const field of template.fields) {
    const value = source[field.id]
    if (typeof value !== "string") continue
    values[field.id] = value.slice(0, MAX_FIELD_LENGTH)
  }
  return values
}

const name = z.string().trim().min(1).max(MAX_NAME_LENGTH)

export const saveCodeSchema = z
  .object({
    templateId: z.string().min(1).max(100),
    values: z.record(z.string(), z.unknown()),
    characterId: z.string().min(1).max(100).optional(),
    newCharacterName: name.optional(),
  })
  .refine((data) => Boolean(data.characterId) !== Boolean(data.newCharacterName), {
    message: "Choisis un personnage existant ou donne un nom au nouveau.",
  })

export const createCharacterSchema = z.object({ name })

export const idSchema = z.object({ id: z.string().min(1).max(100) })
