import { describe, expect, it } from "vitest"

import { presentation } from "./presentation"
import { countWords, getProgress, pruneInvalidOptions } from "./progress"
import type { CodeTemplate } from "./types"

const template: CodeTemplate = {
  id: "t",
  title: "t",
  description: "",
  html: "",
  fields: [
    {
      id: "type",
      label: "Type",
      type: "select",
      section: "A",
      defaultValue: "a",
    },
    { id: "nom", label: "Nom", type: "text", section: "A" },
    {
      id: "texte",
      label: "Texte",
      type: "textarea",
      section: "B",
      minWords: 2,
      showIf: { field: "type", equals: "a" },
    },
  ],
}

describe("progress", () => {
  it("compte les mots", () => {
    expect(countWords("a\n\n b  c \n")).toBe(3)
  })

  it("ignore les selects et exige le minimum de mots", () => {
    const empty = getProgress(template, { type: "a" })
    expect(empty).toMatchObject({ done: 0, total: 2, complete: false })
    const partial = getProgress(template, { type: "a", nom: "x", texte: "une" })
    expect(partial.done).toBe(1)
    const full = getProgress(template, { type: "a", nom: "x", texte: "a b" })
    expect(full.complete).toBe(true)
  })

  it("retire les champs masqués du total", () => {
    const result = getProgress(template, { type: "b", nom: "x" })
    expect(result).toMatchObject({ done: 1, total: 1, complete: true })
  })

  it("vide le groupe quand le type de personnage change", () => {
    const base = { typePersonnage: "etudiant", groupe: "adams house" }
    expect(pruneInvalidOptions(presentation, base).groupe).toBe("adams house")
    expect(
      pruneInvalidOptions(presentation, { ...base, typePersonnage: "citoyen" })
        .groupe,
    ).toBe("")
  })
})
