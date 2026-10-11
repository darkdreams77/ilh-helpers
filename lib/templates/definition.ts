import { z } from "zod"

import { scopeCss } from "./css"
import type { TemplateField } from "./types"

/** Préfixe des identifiants des modèles proposés par les membres. */
export const CUSTOM_PREFIX = "u-"

export const MAX_FIELDS = 60

export const TEMPLATE_KINDS = [
  { value: "LINKS", label: "Fiche de liens" },
  { value: "RP", label: "Modèle RP" },
  { value: "SIGNATURE", label: "Signature" },
] as const

export type TemplateKind = (typeof TEMPLATE_KINDS)[number]["value"]

export const kindLabel = (kind: string | undefined) =>
  TEMPLATE_KINDS.find((item) => item.value === kind)?.label

/** Classe unique qui englobe le code d'un modèle (dérivée de son identifiant). */
export const wrapperClass = (id: string) => `ilh-${id}`

/** Code final : CSS préfixé et minifié dans un `<style>`, puis le HTML dans son conteneur. */
export function assembleCode(html: string, css: string, scopeClass: string) {
  const style = scopeCss(css, scopeClass)
  return `${style ? `<style>${style}</style>` : ""}<div class="${scopeClass}">${html}</div>`
}

const FIELD_ID = /^[a-zA-Z][a-zA-Z0-9_-]{0,39}$/
// Ces caractères structurent `{{#if champ=valeur}}` : ils ne peuvent pas figurer dans une valeur.
const OPTION_VALUE = /^[^{}=\n]{1,80}$/

const optionSchema = z.object({
  value: z.string().regex(OPTION_VALUE, "Valeur d'option invalide."),
  label: z.string().trim().min(1, "Libellé d'option requis.").max(120),
})

export const fieldSchema = z.object({
  id: z.string().regex(FIELD_ID, "Identifiant de champ invalide."),
  label: z
    .string()
    .trim()
    .min(1, "Chaque champ a besoin d'un libellé.")
    .max(120),
  type: z.enum(["text", "textarea", "url", "select", "dropdown"]),
  section: z.string().trim().max(60),
  help: z.string().trim().max(400).optional(),
  placeholder: z.string().trim().max(120).optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema).max(40).optional(),
  defaultValue: z.string().max(2000).optional(),
  minWords: z.number().int().min(1).max(5000).optional(),
  showIf: z
    .object({
      field: z.string().regex(FIELD_ID),
      equals: z
        .string()
        .max(80)
        .regex(/^[^{}\n]*$/),
    })
    .optional(),
})

/** Champs référencés par le code, que ce soit en `{{champ}}` ou `{{#if champ…}}`. */
export function referencedFields(html: string): string[] {
  const ids = new Set<string>()
  for (const match of html.matchAll(/\{\{#if ([^}=]+?)(?:=[^}]*)?\}\}/g)) {
    ids.add(match[1].trim())
  }
  for (const match of html.matchAll(/\{\{\s*([\w-]+)\s*\}\}/g)) {
    ids.add(match[1])
  }
  return [...ids]
}

export const templateDraftSchema = z
  .object({
    kind: z.enum(["LINKS", "RP", "SIGNATURE"]),
    title: z
      .string()
      .trim()
      .min(3, "Donne un titre (3 caractères minimum).")
      .max(80),
    description: z.string().trim().max(300),
    fields: z
      .array(fieldSchema)
      .min(1, "Ajoute au moins un champ.")
      .max(MAX_FIELDS),
    html: z.string().min(1, "Le code HTML est vide.").max(60_000),
    css: z.string().max(60_000),
  })
  .superRefine((draft, ctx) => {
    const ids = new Set<string>()
    draft.fields.forEach((field, index) => {
      if (ids.has(field.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["fields", index, "id"],
          message: `L'identifiant « ${field.id} » est utilisé deux fois.`,
        })
      }
      ids.add(field.id)

      if (
        (field.type === "select" || field.type === "dropdown") &&
        !field.options?.length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["fields", index, "options"],
          message: `« ${field.label} » a besoin d'au moins une option.`,
        })
      }
    })

    draft.fields.forEach((field, index) => {
      if (
        field.showIf &&
        (field.showIf.field === field.id || !ids.has(field.showIf.field))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["fields", index, "showIf"],
          message: `La condition de « ${field.label} » vise un champ inexistant.`,
        })
      }
    })

    const unknown = referencedFields(draft.html).filter((id) => !ids.has(id))
    if (unknown.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["html"],
        message: `Le HTML utilise des champs inconnus : ${unknown.join(", ")}.`,
      })
    }
  })

export type TemplateDraft = z.infer<typeof templateDraftSchema>

/** Champs d'un modèle stocké ; `null` si le JSON n'est pas valide. */
export function parseFields(value: unknown): TemplateField[] | null {
  const parsed = z.array(fieldSchema).safeParse(value)
  return parsed.success ? parsed.data : null
}

const strip = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "")

/** Valeur d'option dérivée d'un libellé : « Mon option » → `mon-option`. */
export function slugValue(label: string): string {
  return (
    strip(label)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "option"
  )
}

/** Identifiant de champ dérivé d'un libellé, unique parmi `taken` : « Date de naissance » → `dateDeNaissance`. */
export function fieldIdFromLabel(
  label: string,
  taken: Iterable<string>,
): string {
  const words = strip(label)
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
  let base = words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("")
    .slice(0, 30)
  if (!/^[a-zA-Z]/.test(base)) base = `champ${base}`

  const used = new Set(taken)
  let id = base
  for (let n = 2; used.has(id); n++) id = `${base}${n}`
  return id
}
