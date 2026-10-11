"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { ForumTheme } from "@/lib/forum-theme"
import {
  saveTemplateAction,
  submitTemplateAction,
} from "@/lib/templates/custom-actions"
import {
  assembleCode,
  fieldIdFromLabel,
  MAX_FIELDS,
  referencedFields,
  slugValue,
  TEMPLATE_KINDS,
  templateDraftSchema,
  wrapperClass,
  type TemplateDraft,
  type TemplateKind,
} from "@/lib/templates/definition"
import {
  buildPreviewDocument,
  MESSAGE_TYPE,
  renderPreviewBody,
  type PreviewMode,
} from "@/lib/templates/preview-document"
import { renderTemplate } from "@/lib/templates/render"
import type { FieldType, TemplateField } from "@/lib/templates/types"

type Status = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED"

type Row = { key: number; field: TemplateField; optionsText: string }

type TemplateBuilderProps = {
  id?: string
  initial: TemplateDraft
  status: Status
  reviewNote?: string | null
  theme: ForumTheme
}

const TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Texte court" },
  { value: "textarea", label: "Texte long" },
  { value: "url", label: "Lien (URL)" },
  { value: "select", label: "Choix unique (boutons)" },
  { value: "dropdown", label: "Choix unique (liste déroulante)" },
]

const SELECT_CLASS =
  "border-input bg-background h-9 w-full border px-3 text-sm disabled:opacity-50"

let nextKey = 1

const toRow = (field: TemplateField): Row => ({
  key: nextKey++,
  field,
  optionsText: (field.options ?? []).map((option) => option.label).join("\n"),
})

/** Options dérivées des lignes ; une ligne conserve la valeur de l'option de même rang. */
function parseOptions(text: string, previous: TemplateField["options"] = []) {
  const taken = new Set<string>()
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((label, index) => {
      const base = previous[index]?.value || slugValue(label)
      let value = base
      for (let n = 2; taken.has(value); n++) value = `${base}-${n}`
      taken.add(value)
      return { value, label }
    })
}

export function TemplateBuilder({
  id,
  initial,
  status,
  reviewNote,
  theme,
}: TemplateBuilderProps) {
  const router = useRouter()
  const readOnly = status === "PENDING" || status === "PUBLISHED"

  const [kind, setKind] = useState<TemplateKind>(initial.kind)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [rows, setRows] = useState<Row[]>(() => initial.fields.map(toRow))
  const [html, setHtml] = useState(initial.html)
  const [css, setCss] = useState(initial.css)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<PreviewMode>("light")

  const fields = useMemo(() => rows.map((row) => row.field), [rows])
  const draft: TemplateDraft = { kind, title, description, fields, html, css }
  const validation = templateDraftSchema.safeParse(draft)
  const issues = validation.success
    ? []
    : [...new Set(validation.error.issues.map((issue) => issue.message))]

  const used = useMemo(() => new Set(referencedFields(html)), [html])

  /* --- champs --- */
  const updateField = (key: number, patch: Partial<TemplateField>) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, field: { ...row.field, ...patch } } : row,
      ),
    )

  const setLabel = (key: number, label: string) =>
    setRows((current) => {
      const row = current.find((item) => item.key === key)
      if (!row) return current
      // L'identifiant suit le libellé tant qu'aucun code ne s'y réfère.
      const locked =
        used.has(row.field.id) ||
        current.some((item) => item.field.showIf?.field === row.field.id)
      const others = current
        .filter((item) => item.key !== key)
        .map((item) => item.field.id)
      const nextId = locked ? row.field.id : fieldIdFromLabel(label, others)
      return current.map((item) =>
        item.key === key
          ? { ...item, field: { ...item.field, label, id: nextId } }
          : item,
      )
    })

  const setOptionsText = (key: number, optionsText: string) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key
          ? {
              ...row,
              optionsText,
              field: {
                ...row.field,
                options: parseOptions(optionsText, row.field.options),
              },
            }
          : row,
      ),
    )

  const addField = () =>
    setRows((current) => {
      const label = `Champ ${current.length + 1}`
      return [
        ...current,
        toRow({
          id: fieldIdFromLabel(
            label,
            current.map((row) => row.field.id),
          ),
          label,
          type: "text",
          section: "",
        }),
      ]
    })

  const moveField = (key: number, delta: -1 | 1) =>
    setRows((current) => {
      const index = current.findIndex((row) => row.key === key)
      const target = index + delta
      if (index < 0 || target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const removeField = (key: number) =>
    setRows((current) => {
      const removed = current.find((row) => row.key === key)?.field.id
      return current
        .filter((row) => row.key !== key)
        .map((row) =>
          row.field.showIf?.field === removed
            ? { ...row, field: { ...row.field, showIf: undefined } }
            : row,
        )
    })

  /* --- éditeur HTML --- */
  const htmlRef = useRef<HTMLTextAreaElement>(null)
  const [conditionField, setConditionField] = useState("")
  const [conditionValue, setConditionValue] = useState("")

  const insert = (before: string, after = "") => {
    const area = htmlRef.current
    const start = area?.selectionStart ?? html.length
    const end = area?.selectionEnd ?? html.length
    setHtml(
      html.slice(0, start) +
        before +
        html.slice(start, end) +
        after +
        html.slice(end),
    )
    requestAnimationFrame(() => {
      area?.focus()
      const cursor = start + before.length + (end - start)
      area?.setSelectionRange(cursor, cursor)
    })
  }

  const conditionTarget = fields.find((field) => field.id === conditionField)
  const insertCondition = () => {
    if (!conditionField) return
    const value = conditionValue.trim()
    insert(`{{#if ${conditionField}${value ? `=${value}` : ""}}}`, "{{/if}}")
  }

  /* --- aperçu --- */
  // Même assemblage que le code livré : CSS préfixé, minifié, dans la classe unique.
  const scopeClass = id ? wrapperClass(id) : "ilh-nouveau"
  const previewTemplate = useMemo(
    () => ({
      id: "preview",
      title,
      description,
      fields,
      singleLine: true,
      html: assembleCode(html, css, scopeClass),
    }),
    [title, description, fields, html, css, scopeClass],
  )
  const sample = useMemo(() => {
    const values: Record<string, string> = {}
    for (const field of fields) {
      values[field.id] =
        testValues[field.id] ??
        field.defaultValue ??
        field.options?.[0]?.value ??
        `⟨${field.label}⟩`
    }
    return values
  }, [fields, testValues])
  const previewHtml = useMemo(
    () => renderPreviewBody(renderTemplate(previewTemplate, sample)),
    [previewTemplate, sample],
  )
  const previewDocument = useMemo(
    () => buildPreviewDocument("", theme, mode),
    [theme, mode],
  )
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sendPreview = useCallback(
    () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: MESSAGE_TYPE, html: previewHtml },
        "*",
      ),
    [previewHtml],
  )
  useEffect(sendPreview, [sendPreview])

  /* --- enregistrement --- */
  const save = useAction(saveTemplateAction)
  const submit = useAction(submitTemplateAction)
  const busy = save.isPending || submit.isPending

  const persist = async () => {
    const result = await save.executeAsync({ id, draft })
    if (!result?.data) {
      toast.error(
        result?.serverError ?? issues[0] ?? "Une erreur est survenue.",
      )
      return null
    }
    if (!id) router.replace(`/createur/${result.data.id}`)
    return result.data.id
  }

  const onSave = async () => {
    if (await persist()) toast.success("Brouillon enregistré.")
  }

  // La fenêtre est ouverte tout de suite (sinon le navigateur bloque la
  // pop-up), puis dirigée vers le formulaire une fois le brouillon enregistré.
  const onTest = async () => {
    if (!id && issues.length > 0) {
      toast.error("Complète le modèle avant de le tester.")
      return
    }
    const tab = readOnly ? null : window.open("", "_blank")
    const savedId = readOnly ? id : await persist()
    if (!savedId) {
      tab?.close()
      return
    }
    const url = `/codes/u-${savedId}`
    if (tab) tab.location.href = url
    else window.open(url, "_blank")
  }

  const onSubmit = async () => {
    const savedId = await persist()
    if (!savedId) return
    const result = await submit.executeAsync({ id: savedId })
    if (result?.serverError || result?.validationErrors) {
      toast.error(result.serverError ?? "Une erreur est survenue.")
      return
    }
    toast.success("Envoyé à la validation.")
    router.push("/createur")
    router.refresh()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="min-w-0 space-y-6">
        {status === "REJECTED" && (
          <p className="border-crimson text-crimson border p-4 text-sm">
            Modèle refusé{reviewNote ? ` : ${reviewNote}` : "."} Corrige-le puis
            renvoie-le à la validation.
          </p>
        )}
        {readOnly && (
          <p className="border-border border p-4 text-sm">
            {status === "PENDING"
              ? "En cours de validation : le modèle n'est plus modifiable."
              : "Modèle publié : il n'est plus modifiable."}
          </p>
        )}

        <fieldset disabled={readOnly || busy} className="min-w-0 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="tpl-kind">Catégorie</Label>
            <select
              id="tpl-kind"
              className={SELECT_CLASS}
              value={kind}
              onChange={(event) => setKind(event.target.value as TemplateKind)}
            >
              {TEMPLATE_KINDS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <Label htmlFor="tpl-title">Titre du modèle</Label>
            <Input
              id="tpl-title"
              value={title}
              maxLength={80}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Label htmlFor="tpl-description">
              Description (affichée dans la liste des codes)
            </Label>
            <Textarea
              id="tpl-description"
              value={description}
              maxLength={300}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <Tabs defaultValue="champs">
            <TabsList>
              <TabsTrigger value="champs">Champs</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="test">Valeurs d&apos;aperçu</TabsTrigger>
            </TabsList>

            <TabsContent value="champs" className="space-y-4">
              {rows.map((row, index) => (
                <FieldCard
                  key={row.key}
                  row={row}
                  fields={fields}
                  first={index === 0}
                  last={index === rows.length - 1}
                  onLabel={(label) => setLabel(row.key, label)}
                  onChange={(patch) => updateField(row.key, patch)}
                  onOptions={(text) => setOptionsText(row.key, text)}
                  onMove={(delta) => moveField(row.key, delta)}
                  onRemove={() => removeField(row.key)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addField}
                disabled={rows.length >= MAX_FIELDS}
              >
                Ajouter un champ
              </Button>
            </TabsContent>

            <TabsContent value="html" className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Chaque jeton <code>{"{{champ}}"}</code> sera remplacé par ce que
                le membre saisit dans le champ du formulaire. Clique-en un pour
                l&apos;insérer à l&apos;endroit du curseur ; en rouge : pas
                encore utilisé dans le code.
              </p>
              <div className="flex flex-wrap gap-2">
                {fields.map((field) => (
                  <button
                    key={field.id}
                    type="button"
                    title={field.label}
                    onClick={() => insert(`{{${field.id}}}`)}
                    className={`border px-2 py-1 font-mono text-xs ${
                      used.has(field.id)
                        ? "border-border"
                        : "border-crimson text-crimson"
                    }`}
                  >
                    {`{{${field.id}}}`}
                  </button>
                ))}
              </div>
              <div className="border-border flex flex-wrap items-end gap-2 border p-3">
                <div className="min-w-40 flex-1">
                  <Label className="text-xs">
                    Condition dans le code : afficher le bloc seulement si le
                    champ…
                  </Label>
                  <select
                    className={SELECT_CLASS}
                    value={conditionField}
                    onChange={(event) => {
                      setConditionField(event.target.value)
                      setConditionValue("")
                    }}
                  >
                    <option value="">Choisir un champ</option>
                    {fields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="min-w-40 flex-1">
                  <Label className="text-xs">
                    …a pour valeur (vide : est rempli)
                  </Label>
                  {conditionTarget?.options?.length ? (
                    <select
                      className={SELECT_CLASS}
                      value={conditionValue}
                      onChange={(event) =>
                        setConditionValue(event.target.value)
                      }
                    >
                      <option value="">Renseigné</option>
                      {conditionTarget.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={conditionValue}
                      onChange={(event) =>
                        setConditionValue(event.target.value)
                      }
                    />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!conditionField}
                  onClick={insertCondition}
                >
                  Entourer le texte sélectionné
                </Button>
              </div>
              <Textarea
                ref={htmlRef}
                value={html}
                spellCheck={false}
                aria-label="Code HTML"
                className="min-h-96 font-mono text-xs"
                onChange={(event) => setHtml(event.target.value)}
              />
            </TabsContent>

            <TabsContent value="css" className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Écris du CSS normal : au moment de générer le code, chaque règle
                est préfixée par la classe unique du modèle{" "}
                <code>{id ? `.${scopeClass}` : ".ilh-…"}</code> (attribuée à
                l&apos;enregistrement), minifiée et placée dans un{" "}
                <code>&lt;style&gt;</code> en tête du code. <code>body</code> et{" "}
                <code>:root</code> visent le conteneur du modèle.
              </p>
              <Textarea
                value={css}
                spellCheck={false}
                aria-label="Code CSS"
                className="min-h-96 font-mono text-xs"
                onChange={(event) => setCss(event.target.value)}
              />
            </TabsContent>

            <TabsContent value="test" className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Ces valeurs remplissent le formulaire fictif de l&apos;aperçu :
                change-les pour vérifier que tes conditions affichent bien les
                bons blocs.
              </p>
              {fields.map((field) => (
                <div key={field.id} className="space-y-1">
                  <Label className="text-xs">{field.label}</Label>
                  {field.options?.length ? (
                    <select
                      className={SELECT_CLASS}
                      value={testValues[field.id] ?? field.options[0].value}
                      onChange={(event) =>
                        setTestValues({
                          ...testValues,
                          [field.id]: event.target.value,
                        })
                      }
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      value={testValues[field.id] ?? ""}
                      placeholder={`⟨${field.label}⟩`}
                      onChange={(event) =>
                        setTestValues({
                          ...testValues,
                          [field.id]: event.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </fieldset>

        {issues.length > 0 && !readOnly && (
          <ul className="text-crimson list-disc space-y-1 pl-5 text-sm">
            {issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        )}

        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy || title.trim().length < 3}
              onClick={onSave}
            >
              Enregistrer le brouillon
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy || issues.length > 0}
              onClick={onTest}
            >
              Tester le formulaire
            </Button>
            <Button
              type="button"
              disabled={busy || issues.length > 0}
              onClick={onSubmit}
            >
              Envoyer à un admin pour validation
            </Button>
          </div>
        )}
      </div>

      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="mb-2 flex items-center justify-between">
          <p className="label text-crimson">Aperçu en direct</p>
          <div className="flex gap-1">
            {(["light", "dark"] as const).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={mode === value ? "default" : "outline"}
                onClick={() => setMode(value)}
              >
                {value === "light" ? "Clair" : "Sombre"}
              </Button>
            ))}
          </div>
        </div>
        <iframe
          ref={iframeRef}
          onLoad={sendPreview}
          title="Aperçu du modèle"
          sandbox="allow-scripts"
          srcDoc={previewDocument}
          className="border-border h-[70vh] w-full border bg-white"
        />
      </div>
    </div>
  )
}

type FieldCardProps = {
  row: Row
  fields: TemplateField[]
  first: boolean
  last: boolean
  onLabel: (label: string) => void
  onChange: (patch: Partial<TemplateField>) => void
  onOptions: (text: string) => void
  onMove: (delta: -1 | 1) => void
  onRemove: () => void
}

function FieldCard({
  row,
  fields,
  first,
  last,
  onLabel,
  onChange,
  onOptions,
  onMove,
  onRemove,
}: FieldCardProps) {
  const { field } = row
  const hasOptions = field.type === "select" || field.type === "dropdown"
  const source = fields.find((other) => other.id === field.showIf?.field)

  return (
    <div className="border-border bg-card space-y-3 border p-4">
      <div className="flex items-center justify-between gap-2">
        <code className="bg-muted px-2 py-1 text-xs">{`{{${field.id}}}`}</code>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={first}
            aria-label="Monter"
            onClick={() => onMove(-1)}
          >
            ↑
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={last}
            aria-label="Descendre"
            onClick={() => onMove(1)}
          >
            ↓
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Libellé</Label>
          <Input
            value={field.label}
            maxLength={120}
            onChange={(event) => onLabel(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <select
            className={SELECT_CLASS}
            value={field.type}
            onChange={(event) =>
              onChange({ type: event.target.value as FieldType })
            }
          >
            {TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">
            Section du formulaire (vide : hors section)
          </Label>
          <Input
            value={field.section}
            maxLength={60}
            onChange={(event) => onChange({ section: event.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Exemple grisé dans le champ</Label>
          <Input
            value={field.placeholder ?? ""}
            maxLength={120}
            onChange={(event) => onChange({ placeholder: event.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Aide affichée sous le champ</Label>
        <Input
          value={field.help ?? ""}
          maxLength={400}
          onChange={(event) => onChange({ help: event.target.value })}
        />
      </div>

      {hasOptions && (
        <div className="space-y-1">
          <Label className="text-xs">Options (une par ligne)</Label>
          <Textarea
            value={row.optionsText}
            onChange={(event) => onOptions(event.target.value)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={field.required ?? false}
            onChange={(event) => onChange({ required: event.target.checked })}
          />
          Obligatoire pour compléter la fiche
        </label>
        {field.type === "textarea" && (
          <label className="flex items-center gap-2 text-sm">
            Minimum de mots
            <Input
              type="number"
              min={1}
              max={5000}
              className="w-24"
              value={field.minWords ?? ""}
              onChange={(event) =>
                onChange({
                  minWords: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
            />
          </label>
        )}
      </div>

      <div className="border-border space-y-2 border-t pt-3">
        <Label className="text-xs">
          Dans le formulaire : afficher ce champ seulement si le champ…
        </Label>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className={SELECT_CLASS}
            value={field.showIf?.field ?? ""}
            onChange={(event) =>
              onChange({
                showIf: event.target.value
                  ? { field: event.target.value, equals: "" }
                  : undefined,
              })
            }
          >
            <option value="">Toujours affiché</option>
            {fields
              .filter((other) => other.id !== field.id)
              .map((other) => (
                <option key={other.id} value={other.id}>
                  {other.label}
                </option>
              ))}
          </select>
          {field.showIf &&
            (source?.options?.length ? (
              <select
                className={SELECT_CLASS}
                value={field.showIf.equals}
                onChange={(event) =>
                  onChange({
                    showIf: {
                      field: field.showIf!.field,
                      equals: event.target.value,
                    },
                  })
                }
              >
                <option value="">Choisir une valeur</option>
                {source.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={field.showIf.equals}
                placeholder="a pour valeur…"
                onChange={(event) =>
                  onChange({
                    showIf: {
                      field: field.showIf!.field,
                      equals: event.target.value,
                    },
                  })
                }
              />
            ))}
        </div>
      </div>
    </div>
  )
}
