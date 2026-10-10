import { describe, expect, it } from "vitest"

import { countLines, getProgress } from "./progress"
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
      minLines: 2,
      showIf: { field: "type", equals: "a" },
    },
  ],
}

describe("progress", () => {
  it("compte les lignes non vides", () => {
    expect(countLines("a\n\n b \n")).toBe(2)
  })

  it("ignore les selects et exige le minimum de lignes", () => {
    const empty = getProgress(template, { type: "a" })
    expect(empty).toMatchObject({ done: 0, total: 2, complete: false })
    const partial = getProgress(template, { type: "a", nom: "x", texte: "une" })
    expect(partial.done).toBe(1)
    const full = getProgress(template, { type: "a", nom: "x", texte: "a\nb" })
    expect(full.complete).toBe(true)
  })

  it("retire les champs masqués du total", () => {
    const result = getProgress(template, { type: "b", nom: "x" })
    expect(result).toMatchObject({ done: 1, total: 1, complete: true })
  })
})
