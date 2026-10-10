import type { CodeTemplate, TemplateField, TemplateValues } from "./types"

/** Nombre de lignes non vides d'un texte. */
export function countLines(value: string): number {
  return value.split("\n").filter((line) => line.trim() !== "").length
}

/** Champ visible compte tenu des valeurs (`showIf`). */
export function isVisible(field: TemplateField, values: TemplateValues) {
  const { showIf } = field
  return !showIf || (values[showIf.field] ?? "") === showIf.equals
}

/** Un champ est complété s'il est renseigné et atteint son minimum de lignes. */
export function isFieldDone(field: TemplateField, value: string): boolean {
  if (value.trim() === "") return false
  return !field.minLines || countLines(value) >= field.minLines
}

export type SectionProgress = {
  title: string
  fields: TemplateField[]
  done: number
  total: number
}

export type Progress = {
  sections: SectionProgress[]
  done: number
  total: number
  complete: boolean
}

/**
 * Avancement du formulaire. Les champs visibles à choix (`select`) servent à
 * configurer la fiche : ils ne comptent pas dans l'avancement.
 */
export function getProgress(
  template: CodeTemplate,
  values: TemplateValues,
): Progress {
  const grouped = new Map<string, SectionProgress>()
  for (const field of template.fields) {
    if (!isVisible(field, values)) continue
    const section = grouped.get(field.section) ?? {
      title: field.section,
      fields: [],
      done: 0,
      total: 0,
    }
    section.fields.push(field)
    if (field.type !== "select") {
      section.total += 1
      if (isFieldDone(field, values[field.id] ?? "")) section.done += 1
    }
    grouped.set(field.section, section)
  }
  const sections = [...grouped.values()]
  const done = sections.reduce((sum, s) => sum + s.done, 0)
  const total = sections.reduce((sum, s) => sum + s.total, 0)
  return { sections, done, total, complete: total > 0 && done === total }
}
