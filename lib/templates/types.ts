export type FieldType = "text" | "textarea" | "url" | "select"

export type TemplateField = {
  id: string
  label: string
  type: FieldType
  /** Titre de la section du formulaire dans laquelle le champ apparaît. */
  section: string
  help?: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  defaultValue?: string
  /** N'affiche le champ que si le champ `field` vaut `equals`. */
  showIf?: { field: string; equals: string }
}

export type CodeTemplate = {
  id: string
  title: string
  description: string
  fields: TemplateField[]
  /**
   * HTML du code. Syntaxe :
   * - `{{champ}}` insère la valeur saisie, telle quelle (HTML/BBCode autorisés) ;
   * - `{{#if champ=valeur}}…{{/if}}` garde le bloc si le champ vaut `valeur` ;
   * - `{{#if champ}}…{{/if}}` garde le bloc si le champ est renseigné.
   */
  html: string
}

export type TemplateValues = Record<string, string>
