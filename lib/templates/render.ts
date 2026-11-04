import type { CodeTemplate, TemplateValues } from "./types"

const INNERMOST_IF =
  /\{\{#if ([^}=]+?)(?:=([^}]*))?\}\}((?:(?!\{\{#if )[\s\S])*?)\{\{\/if\}\}/

/** Valeurs par défaut des champs, complétées par celles saisies. */
export function withDefaults(
  template: CodeTemplate,
  values: TemplateValues,
): TemplateValues {
  const merged: TemplateValues = {}
  for (const field of template.fields) {
    merged[field.id] = values[field.id] ?? field.defaultValue ?? ""
  }
  return merged
}

/**
 * Les conditions sont évaluées avant les variables, et les variables en une
 * seule passe : une valeur saisie contenant `{{…}}` n'est jamais interprétée.
 */
export function renderTemplate(
  template: CodeTemplate,
  values: TemplateValues,
): string {
  const data = withDefaults(template, values)
  if (template.singleLine) {
    for (const key of Object.keys(data)) {
      data[key] = data[key].replace(/\r?\n/g, "<br>").replace(/\t/g, " ")
    }
  }

  let html = template.html
  let previous: string
  do {
    previous = html
    html = html.replace(INNERMOST_IF, (_, key: string, expected, body) => {
      const actual = data[key.trim()] ?? ""
      const keep =
        expected === undefined ? actual.trim() !== "" : actual === expected
      return keep ? body : ""
    })
  } while (html !== previous)

  return html.replace(
    /\{\{\s*([\w-]+)\s*\}\}/g,
    (_, key: string) => data[key] ?? "",
  )
}
