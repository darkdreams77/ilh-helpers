import { describe, expect, it } from "vitest"

import { getTemplate } from "../templates"

import { MAX_FIELD_LENGTH, sanitizeValues, saveCodeSchema } from "./schema"

const template = getTemplate("presentation")!

describe("sanitizeValues", () => {
  it("garde les champs connus et ignore le reste", () => {
    expect(
      sanitizeValues(template, { pseudo: "Ana", inconnu: "x", __proto__: "y" }),
    ).toEqual({ pseudo: "Ana" })
  })

  it("ignore les valeurs qui ne sont pas des chaînes", () => {
    expect(sanitizeValues(template, { pseudo: 3, faceclaim: ["a"] })).toEqual({})
  })

  it("tronque les valeurs trop longues", () => {
    const values = sanitizeValues(template, {
      pseudo: "a".repeat(MAX_FIELD_LENGTH + 5),
    })
    expect(values.pseudo).toHaveLength(MAX_FIELD_LENGTH)
  })

  it("tolère une entrée invalide", () => {
    expect(sanitizeValues(template, null)).toEqual({})
    expect(sanitizeValues(template, ["pseudo"])).toEqual({})
  })
})

describe("saveCodeSchema", () => {
  const base = { templateId: "presentation", values: {} }

  it("accepte un personnage existant ou un nouveau nom", () => {
    expect(saveCodeSchema.safeParse({ ...base, characterId: "c1" }).success).toBe(true)
    expect(saveCodeSchema.safeParse({ ...base, newCharacterName: "Ana" }).success).toBe(true)
  })

  it("refuse les deux ou aucun", () => {
    expect(saveCodeSchema.safeParse(base).success).toBe(false)
    expect(
      saveCodeSchema.safeParse({ ...base, characterId: "c1", newCharacterName: "Ana" }).success,
    ).toBe(false)
  })
})
