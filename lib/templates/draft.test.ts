import { describe, expect, it } from "vitest"

import { parseDraft, sameValues } from "./draft"
import type { CodeTemplate } from "./types"

const template: CodeTemplate = {
  id: "t",
  title: "t",
  description: "",
  html: "",
  fields: [
    { id: "a", label: "A", type: "text", section: "S" },
    { id: "b", label: "B", type: "text", section: "S" },
  ],
}

describe("draft", () => {
  it("ne garde que les champs du modèle de type texte", () => {
    const raw = JSON.stringify({ a: "x", b: 3, inconnu: "y" })
    expect(parseDraft(raw, template)).toEqual({ a: "x" })
  })

  it("rejette ce qui n'est pas un objet", () => {
    expect(parseDraft(null, template)).toBeNull()
    expect(parseDraft("pas du json", template)).toBeNull()
    expect(parseDraft("[1]", template)).toBeNull()
  })

  it("compare en traitant l'absence comme une chaîne vide", () => {
    expect(sameValues(template, { a: "x" }, { a: "x", b: "" })).toBe(true)
    expect(sameValues(template, { a: "x" }, { a: "y" })).toBe(false)
  })
})
