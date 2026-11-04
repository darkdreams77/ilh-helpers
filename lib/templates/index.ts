import { presentation } from "./presentation"
import type { CodeTemplate } from "./types"

export const templates: CodeTemplate[] = [presentation]

export function getTemplate(id: string): CodeTemplate | undefined {
  return templates.find((template) => template.id === id)
}
