import { describe, expect, it } from "vitest"

import {
  assembleCode,
  fieldIdFromLabel,
  referencedFields,
  slugValue,
  templateDraftSchema,
} from "./definition"

const valid = {
  kind: "LINKS" as const,
  title: "Fiche de liens",
  description: "",
  css: "",
  fields: [
    { id: "pseudo", label: "Pseudo", type: "text" as const, section: "" },
    {
      id: "type",
      label: "Type",
      type: "select" as const,
      section: "",
      options: [{ value: "a", label: "A" }],
    },
    {
      id: "bonus",
      label: "Bonus",
      type: "text" as const,
      section: "",
      showIf: { field: "type", equals: "a" },
    },
  ],
  html: "<b>{{pseudo}}</b>{{#if type=a}}{{bonus}}{{/if}}{{#if bonus}}!{{/if}}",
}

describe("definition", () => {
  it("liste les champs référencés par le HTML", () => {
    expect(referencedFields(valid.html).sort()).toEqual([
      "bonus",
      "pseudo",
      "type",
    ])
  })

  it("accepte un modèle cohérent", () => {
    expect(templateDraftSchema.safeParse(valid).success).toBe(true)
  })

  it("refuse un champ inconnu dans le HTML", () => {
    const result = templateDraftSchema.safeParse({
      ...valid,
      html: "{{pseudo}}{{fantome}}",
    })
    expect(result.success).toBe(false)
    expect(JSON.stringify(result.error?.issues)).toContain("fantome")
  })

  it("refuse les identifiants en double, les conditions cassées et les listes vides", () => {
    const [pseudo, type, bonus] = valid.fields
    const duplicated = templateDraftSchema.safeParse({
      ...valid,
      fields: [pseudo, { ...type, id: "pseudo" }, bonus],
    })
    expect(duplicated.success).toBe(false)

    const broken = templateDraftSchema.safeParse({
      ...valid,
      fields: [
        pseudo,
        type,
        { ...bonus, showIf: { field: "nope", equals: "a" } },
      ],
    })
    expect(broken.success).toBe(false)

    const noOptions = templateDraftSchema.safeParse({
      ...valid,
      fields: [pseudo, { ...type, options: [] }, bonus],
    })
    expect(noOptions.success).toBe(false)
  })

  it("refuse les valeurs d'option qui casseraient une condition", () => {
    const [pseudo, type, bonus] = valid.fields
    const result = templateDraftSchema.safeParse({
      ...valid,
      fields: [
        pseudo,
        { ...type, options: [{ value: "a=b", label: "A" }] },
        bonus,
      ],
    })
    expect(result.success).toBe(false)
  })

  it("génère des identifiants lisibles et uniques", () => {
    expect(fieldIdFromLabel("Date de naissance", [])).toBe("dateDeNaissance")
    expect(fieldIdFromLabel("Étudiant ?", ["etudiant"])).toBe("etudiant2")
    expect(fieldIdFromLabel("123", [])).toBe("champ123")
    expect(slugValue("Adams House")).toBe("adams-house")
  })

  it("refuse une catégorie inconnue", () => {
    expect(
      templateDraftSchema.safeParse({ ...valid, kind: "AUTRE" }).success,
    ).toBe(false)
  })

  it("assemble le style minifié puis le HTML dans la classe unique", () => {
    expect(assembleCode("<b>x</b>", ".a { color: red }", "ilh-abc")).toBe(
      '<style>.ilh-abc .a{color:red}</style><div class="ilh-abc"><b>x</b></div>',
    )
    expect(assembleCode("<b>x</b>", "", "ilh-abc")).toBe(
      '<div class="ilh-abc"><b>x</b></div>',
    )
  })
})
