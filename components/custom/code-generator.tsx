"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { ForumTheme } from "@/lib/forum-theme"
import {
  buildPreviewDocument,
  type PreviewMode,
} from "@/lib/templates/preview-document"
import { renderTemplate, withDefaults } from "@/lib/templates/render"
import type {
  CodeTemplate,
  TemplateField,
  TemplateValues,
} from "@/lib/templates/types"

type CodeGeneratorProps = {
  template: CodeTemplate
  theme: ForumTheme
}

export function CodeGenerator({
  template,
  theme,
}: CodeGeneratorProps) {
  const { resolvedTheme } = useTheme()
  const [chosenMode, setChosenMode] = useState<PreviewMode | null>(null)
  const previewMode: PreviewMode =
    chosenMode ?? (resolvedTheme === "dark" ? "dark" : "light")
  const [values, setValues] = useState<TemplateValues>(() =>
    withDefaults(template, {}),
  )

  const code = useMemo(
    () => renderTemplate(template, values),
    [template, values],
  )
  const previewDocument = useMemo(
    () => buildPreviewDocument(code, theme, previewMode),
    [code, theme, previewMode],
  )

  const sections = useMemo(() => {
    const grouped = new Map<string, TemplateField[]>()
    for (const field of template.fields) {
      grouped.set(field.section, [...(grouped.get(field.section) ?? []), field])
    }
    return [...grouped.entries()]
  }, [template])

  const setValue = (id: string, value: string) =>
    setValues((current) => ({ ...current, [id]: value }))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Code copié !")
    } catch {
      toast.error("Impossible de copier : sélectionne le code et copie-le.")
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        className="flex flex-col gap-8"
        onSubmit={(event) => event.preventDefault()}
      >
        {sections.map(([section, fields]) => (
          <fieldset key={section} className="flex flex-col gap-4">
            <legend className="display mb-2 w-full border-b border-border pb-2 text-2xl">
              {section}
            </legend>
            {fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                onChange={(value) => setValue(field.id, value)}
              />
            ))}
          </fieldset>
        ))}
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Tabs defaultValue="apercu">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="apercu">Aperçu</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <PreviewModeToggle value={previewMode} onChange={setChosenMode} />
              <Button type="button" onClick={copy}>
                Copier le code
              </Button>
            </div>
          </div>
          <TabsContent value="apercu">
            <iframe
              title="Aperçu du code"
              sandbox="allow-scripts"
              srcDoc={previewDocument}
              className="h-[75vh] w-full border border-border bg-white"
            />
          </TabsContent>
          <TabsContent value="code">
            <Textarea
              readOnly
              value={code}
              className="h-[75vh] font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

type FieldInputProps = {
  field: TemplateField
  value: string
  onChange: (value: string) => void
}

function FieldInput({ field, value, onChange }: FieldInputProps) {
  const inputId = `field-${field.id}`

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>
      {field.help && (
        <p className="text-muted-foreground text-sm">{field.help}</p>
      )}
      {field.type === "textarea" && (
        <Textarea
          id={inputId}
          value={value}
          placeholder={field.placeholder}
          rows={6}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {(field.type === "text" || field.type === "url") && (
        <Input
          id={inputId}
          type={field.type}
          value={value}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.type === "select" && (
        <RadioGroup
          id={inputId}
          value={value}
          onValueChange={onChange}
          className="flex gap-4"
        >
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem
                id={`${inputId}-${option.value}`}
                value={option.value}
              />
              <Label htmlFor={`${inputId}-${option.value}`}>
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}

const previewModes = [
  { value: "light", label: "Aperçu clair", Icon: SunIcon },
  { value: "dark", label: "Aperçu sombre", Icon: MoonIcon },
] as const

function PreviewModeToggle({
  value,
  onChange,
}: {
  value: PreviewMode
  onChange: (mode: PreviewMode) => void
}) {
  return (
    <div
      role="group"
      aria-label="Thème de l'aperçu"
      className="flex border border-border"
    >
      {previewModes.map(({ value: mode, label, Icon }) => (
        <Button
          key={mode}
          type="button"
          size="icon"
          variant={value === mode ? "default" : "ghost"}
          className="size-9 rounded-none"
          aria-label={label}
          aria-pressed={value === mode}
          title={label}
          onClick={() => onChange(mode)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  )
}
