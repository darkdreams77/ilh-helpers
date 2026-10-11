import { describe, expect, it } from "vitest"

import { renderTemplate } from "./render"
import type { CodeTemplate } from "./types"

const make = (html: string): CodeTemplate => ({
  id: "t",
  title: "t",
  description: "",
  html,
  fields: [
    { id: "a", label: "a", type: "text", section: "s", defaultValue: "def" },
    { id: "b", label: "b", type: "text", section: "s" },
    { id: "kind", label: "k", type: "select", section: "s" },
  ],
})

describe("renderTemplate", () => {
  it("remplace les variables sans échapper le HTML ni le BBCode", () => {
    const out = renderTemplate(make("<p>{{a}}</p>"), {
      a: '<b>x</b> [url=https://e.com]y[/url]',
    })
    expect(out).toBe("<p><b>x</b> [url=https://e.com]y[/url]</p>")
  })

  it("utilise la valeur par défaut puis une chaîne vide", () => {
    expect(renderTemplate(make("{{a}}|{{b}}"), {})).toBe("def|")
  })

  it("n'interprète pas la syntaxe dans une valeur saisie", () => {
    const out = renderTemplate(make("{{a}}|{{b}}"), {
      a: "{{b}}",
      b: "{{#if a}}x{{/if}}",
    })
    expect(out).toBe("{{b}}|{{#if a}}x{{/if}}")
  })

  it("gère les conditions d'égalité", () => {
    const t = make("{{#if kind=e}}E{{/if}}{{#if kind=c}}C{{/if}}")
    expect(renderTemplate(t, { kind: "e" })).toBe("E")
    expect(renderTemplate(t, { kind: "c" })).toBe("C")
    expect(renderTemplate(t, {})).toBe("")
  })

  it("gère les conditions de présence", () => {
    const t = make("{{#if b}}[{{b}}]{{/if}}")
    expect(renderTemplate(t, { b: "  " })).toBe("")
    expect(renderTemplate(t, { b: "ok" })).toBe("[ok]")
  })

  it("gère les conditions imbriquées", () => {
    const t = make("{{#if kind=e}}1{{#if b}}2{{/if}}3{{/if}}")
    expect(renderTemplate(t, { kind: "e", b: "x" })).toBe("123")
    expect(renderTemplate(t, { kind: "e" })).toBe("13")
    expect(renderTemplate(t, { kind: "c", b: "x" })).toBe("")
  })
})

import { presentation } from "./presentation"

describe("modèle présentation", () => {
  it("inclut le bloc admission pour un étudiant uniquement", () => {
    const etu = renderTemplate(presentation, {
      typePersonnage: "etudiant",
      admission: "ADM",
      vieBoston: "BOS",
    })
    expect(etu).toContain("ADM")
    expect(etu).not.toContain("BOS")

    const cit = renderTemplate(presentation, {
      typePersonnage: "citoyen",
      admission: "ADM",
      vieBoston: "BOS",
    })
    expect(cit).toContain("BOS")
    expect(cit).not.toContain("ADM")
  })

  it("ne laisse aucune balise de modèle dans le résultat", () => {
    expect(renderTemplate(presentation, {})).not.toMatch(/\{\{|\}\}/)
  })

  it("référence uniquement des champs déclarés", () => {
    const ids = new Set(presentation.fields.map((f) => f.id))
    const used = [...presentation.html.matchAll(/\{\{(?:#if )?([\w-]+)/g)].map(
      (m) => m[1],
    )
    expect(used.filter((id) => !ids.has(id))).toEqual([])
  })
})
