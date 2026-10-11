import type { CodeTemplate, TemplateValues } from "./types"

const EVENT = "ilh-draft-change"

/** Clé de stockage du brouillon d'un modèle (et du personnage édité, le cas échéant). */
export function draftKey(templateId: string, characterId?: string) {
  return `ilh:draft:${templateId}:${characterId ?? "new"}`
}

/** Lit la valeur brute ; `null` si absente ou si le stockage est inaccessible. */
export function readRawDraft(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeDraft(key: string, values: TemplateValues) {
  try {
    window.localStorage.setItem(key, JSON.stringify(values))
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // stockage plein ou bloqué : le brouillon est un confort, pas une garantie
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new Event(EVENT))
  } catch {
    // voir writeDraft
  }
}

export function subscribeDraft(onChange: () => void) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Valeurs d'un brouillon brut, limitées aux champs du modèle ; `null` si illisible. */
export function parseDraft(
  raw: string | null,
  template: CodeTemplate,
): TemplateValues | null {
  if (!raw) return null
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return null
    }
    const values: TemplateValues = {}
    for (const field of template.fields) {
      const value = (data as Record<string, unknown>)[field.id]
      if (typeof value === "string") values[field.id] = value
    }
    return values
  } catch {
    return null
  }
}

/** Deux jeux de valeurs sont équivalents s'ils coïncident sur les champs du modèle. */
export function sameValues(
  template: CodeTemplate,
  a: TemplateValues,
  b: TemplateValues,
) {
  return template.fields.every(
    (field) => (a[field.id] ?? "") === (b[field.id] ?? ""),
  )
}
