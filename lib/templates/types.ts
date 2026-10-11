export type FieldType = "text" | "textarea" | "url" | "select" | "dropdown"

export type TemplateField = {
  id: string
  label: string
  type: FieldType
  /** Titre de la section du formulaire dans laquelle le champ apparaît ; vide : hors de toute section repliable. */
  section: string
  /** Aide sous le libellé ; `[texte](https://…)` crée un lien. */
  help?: string
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  /** Liste déroulante dont les options dépendent de la valeur d'un autre champ. */
  optionsBy?: {
    field: string
    options: Record<string, { value: string; label: string }[]>
  }
  defaultValue?: string
  /** Nombre de mots minimum attendu (affiche un compteur). */
  minWords?: number
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
  /** CSS propre au modèle, appliqué à l'aperçu (à intégrer à la feuille de style du forum). */
  css?: string
  /** Catégorie d'un modèle proposé par un membre. */
  kind?: "LINKS" | "RP" | "SIGNATURE"
  /** Auteur d'un modèle proposé par un membre. */
  author?: string
}

export type TemplateValues = Record<string, string>
