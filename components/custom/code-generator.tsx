"use client"

import {
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { useAction } from "next-safe-action/hooks"
import { useTheme } from "next-themes"
import Link from "next/link"
import { toast } from "sonner"

import { useConfetti } from "@/components/custom/confetti"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { saveCodeAction } from "@/lib/characters/actions"
import type { ForumTheme } from "@/lib/forum-theme"
import {
  buildPreviewDocument,
  MESSAGE_TYPE,
  renderPreviewBody,
  type PreviewMode,
} from "@/lib/templates/preview-document"
import {
  countLines,
  getOptions,
  getProgress,
  isFieldDone,
  pruneInvalidOptions,
  type SectionProgress,
} from "@/lib/templates/progress"
import { renderTemplate, withDefaults } from "@/lib/templates/render"
import type {
  CodeTemplate,
  TemplateField,
  TemplateValues,
} from "@/lib/templates/types"
import { cn } from "@/lib/utils"

type CodeGeneratorProps = {
  template: CodeTemplate
  theme: ForumTheme
  /** Personnages de l'utilisateur connecté, `null` si anonyme. */
  characters: { id: string; name: string }[] | null
  initialValues?: TemplateValues
  initialCharacterId?: string
}

export function CodeGenerator({
  template,
  theme,
  characters,
  initialValues = {},
  initialCharacterId,
}: CodeGeneratorProps) {
  const { resolvedTheme } = useTheme()
  const [chosenMode, setChosenMode] = useState<PreviewMode | null>(null)
  // `resolvedTheme` n'est connu que côté client : on attend l'hydratation pour
  // que le rendu serveur et le premier rendu client coïncident.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const previewMode: PreviewMode =
    chosenMode ?? (hydrated && resolvedTheme === "dark" ? "dark" : "light")
  const [values, setValues] = useState<TemplateValues>(() =>
    withDefaults(template, initialValues),
  )

  const code = useMemo(
    () => renderTemplate(template, values),
    [template, values],
  )
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  )
  // Le document ne dépend pas du code : seuls le thème et le mode le
  // rechargent. Le contenu est envoyé à l'iframe par message (PreviewPanel).
  const previewDocument = useMemo(
    () => buildPreviewDocument("", theme, previewMode, !isDesktop),
    [theme, previewMode, isDesktop],
  )
  const progress = useMemo(
    () => getProgress(template, values),
    [template, values],
  )
  const { fire: fireConfetti, node: confetti } = useConfetti()
  const [closedSections, setClosedSections] = useState<Set<string>>(new Set())
  const toggleSection = (title: string) =>
    setClosedSections((current) => {
      const next = new Set(current)
      if (!next.delete(title)) next.add(title)
      return next
    })

  const setValue = (id: string, value: string) => {
    const next = pruneInvalidOptions(template, { ...values, [id]: value })
    setValues(next)
    // Confettis au moment précis où la fiche devient complète.
    if (!progress.complete && getProgress(template, next).complete) {
      fireConfetti()
      toast.success("Fiche complète, bravo !")
    }
  }

  const [saveOpen, setSaveOpen] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success("Code copié !")
      fireConfetti()
    } catch {
      toast.error("Impossible de copier : sélectionne le code et copie-le.")
    }
  }

  const [sheetOpen, setSheetOpen] = useState(false)

  const panel = (iframeClassName: string) => (
    <PreviewPanel
      code={code}
      previewDocument={previewDocument}
      previewMode={previewMode}
      onModeChange={setChosenMode}
      canSave={characters !== null}
      onSave={() => setSaveOpen(true)}
      onCopy={copy}
      iframeClassName={iframeClassName}
    />
  )

  return (
    <div className="grid gap-8 pb-24 lg:grid-cols-2 lg:pb-0">
      <form
        className="flex flex-col gap-6"
        onSubmit={(event) => event.preventDefault()}
      >
        <ProgressBar done={progress.done} total={progress.total} />
        {progress.sections.map((section) => (
          <FormSection
            key={section.title}
            section={section}
            open={!closedSections.has(section.title)}
            onToggle={() => toggleSection(section.title)}
          >
            {section.fields.map((field) => (
              <FieldInput
                key={field.id}
                field={field}
                value={values[field.id] ?? ""}
                options={getOptions(field, values)}
                onChange={(value) => setValue(field.id, value)}
              />
            ))}
          </FormSection>
        ))}
      </form>

      {confetti}
      {isDesktop ? (
        <div className="lg:sticky lg:top-24 lg:self-start">
          {panel("h-[75vh]")}
        </div>
      ) : (
        <>
          <Button
            type="button"
            size="lg"
            className="fixed right-4 bottom-4 z-40 h-12 gap-2 px-6 shadow-lg"
            onClick={() => setSheetOpen(true)}
          >
            <EyeIcon className="size-5" />
            Aperçu
          </Button>
          <Drawer
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            shouldScaleBackground={false}
            handleOnly
          >
            <DrawerContent className="h-[90dvh]">
              <DrawerTitle className="sr-only">Aperçu du code</DrawerTitle>
              <DrawerDescription className="sr-only">
                Aperçu en direct et code à copier.
              </DrawerDescription>
              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {panel("h-[calc(90dvh-9rem)]")}
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}

      {characters && (
        <SaveDialog
          open={saveOpen}
          onOpenChange={setSaveOpen}
          templateId={template.id}
          values={values}
          characters={characters}
          initialCharacterId={initialCharacterId}
        />
      )}
    </div>
  )
}

const DESKTOP_QUERY = "(min-width: 1024px)"

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

type PreviewPanelProps = {
  code: string
  previewDocument: string
  previewMode: PreviewMode
  onModeChange: (mode: PreviewMode) => void
  canSave: boolean
  onSave: () => void
  onCopy: () => void
  iframeClassName: string
}

/** Onglets Aperçu / Code et leurs actions, utilisé sur la page et dans le sheet mobile. */
function PreviewPanel({
  code,
  previewDocument,
  previewMode,
  onModeChange,
  canSave,
  onSave,
  onCopy,
  iframeClassName,
}: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const previewHtml = useMemo(() => renderPreviewBody(code), [code])
  const sendPreview = useCallback(
    () =>
      iframeRef.current?.contentWindow?.postMessage(
        { type: MESSAGE_TYPE, html: previewHtml },
        "*",
      ),
    [previewHtml],
  )
  // Au changement de code (l'iframe est déjà chargée) ; au chargement : onLoad.
  useEffect(sendPreview, [sendPreview])

  return (
    <Tabs defaultValue="apercu">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="apercu">Aperçu</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <PreviewModeToggle value={previewMode} onChange={onModeChange} />
          {canSave && (
            <Button type="button" variant="outline" onClick={onSave}>
              Enregistrer
            </Button>
          )}
          <Button type="button" onClick={onCopy}>
            Copier
          </Button>
        </div>
      </div>
      {!canSave && (
        <p className="text-muted-foreground mt-3 text-sm">
          <Link href="/connexion" className="underline">
            Connecte-toi
          </Link>{" "}
          pour enregistrer ce code et le retrouver dans ton espace.
        </p>
      )}
      <TabsContent value="apercu">
        <iframe
          ref={iframeRef}
          onLoad={sendPreview}
          title="Aperçu du code"
          sandbox="allow-scripts"
          srcDoc={previewDocument}
          className={cn(
            "border-border w-full border bg-white",
            iframeClassName,
          )}
        />
      </TabsContent>
      <TabsContent value="code">
        <Textarea
          readOnly
          value={code}
          className={cn("font-mono text-xs", iframeClassName)}
          onFocus={(event) => event.currentTarget.select()}
        />
      </TabsContent>
    </Tabs>
  )
}

const NEW_CHARACTER = "__new__"

type SaveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  templateId: string
  values: TemplateValues
  characters: { id: string; name: string }[]
  initialCharacterId?: string
}

function SaveDialog({
  open,
  onOpenChange,
  templateId,
  values,
  characters,
  initialCharacterId,
}: SaveDialogProps) {
  const [choice, setChoice] = useState(
    initialCharacterId ?? (characters[0]?.id || NEW_CHARACTER),
  )
  const [newName, setNewName] = useState("")
  const isNew = choice === NEW_CHARACTER
  const name = (newName || values.pseudo || "").trim()

  const { execute, isPending } = useAction(saveCodeAction, {
    onSuccess: () => {
      toast.success("Code enregistré !")
      onOpenChange(false)
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Enregistrement impossible.")
    },
  })

  const submit = () =>
    execute({
      templateId,
      values,
      ...(isNew ? { newCharacterName: name } : { characterId: choice }),
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enregistrer ce code</DialogTitle>
          <DialogDescription>
            Il remplace le code déjà enregistré pour ce gabarit et ce
            personnage.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="save-character">Personnage</Label>
            <Select value={choice} onValueChange={setChoice}>
              <SelectTrigger id="save-character">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {characters.map((character) => (
                  <SelectItem key={character.id} value={character.id}>
                    {character.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CHARACTER}>
                  Nouveau personnage…
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isNew && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="save-name">Nom du personnage</Label>
              <Input
                id="save-name"
                value={newName}
                placeholder={values.pseudo}
                maxLength={80}
                onChange={(event) => setNewName(event.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={isPending || (isNew && !name)}
            onClick={submit}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type FieldInputProps = {
  field: TemplateField
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function FieldInput({ field, value, options, onChange }: FieldInputProps) {
  const inputId = `field-${field.id}`
  const done = field.type !== "select" && isFieldDone(field, value)
  const lines = countLines(value)

  return (
    <div className="animate-in fade-in slide-in-from-top-2 flex flex-col gap-2 duration-300">
      <Label htmlFor={inputId} className="flex items-center gap-2">
        <span>
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </span>
        {done && (
          <CheckCircleIcon
            aria-label="Rempli"
            className="animate-in zoom-in text-gold size-4 duration-200"
          />
        )}
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
      {field.minLines && (
        <p
          className={cn(
            "label self-end transition-colors",
            done ? "text-gold" : "text-muted-foreground",
          )}
        >
          {done ? "✓ " : ""}
          {lines}/{field.minLines} lignes
        </p>
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
      {field.type === "dropdown" && (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={inputId}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {field.type === "select" && (
        <RadioGroup
          id={inputId}
          value={value}
          onValueChange={onChange}
          className="flex gap-4"
        >
          {options.map((option) => (
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
      className="border-border flex border"
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

function ProgressBar({ done, total }: { done: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="bg-background/90 border-border sticky top-16 z-10 -mx-1 border-b px-1 py-3 backdrop-blur">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <span className="label">
          {percent === 100 ? "Fiche complète !" : "Ta fiche"}
        </span>
        <span className="display text-lg">
          {done}/{total} · {percent}%
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  )
}

type FormSectionProps = {
  section: SectionProgress
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

/** Section repliable avec compteur de champs remplis. */
function FormSection({ section, open, onToggle, children }: FormSectionProps) {
  const complete = section.total > 0 && section.done === section.total
  const contentId = `section-${section.title}`

  return (
    <fieldset className="border-border bg-card border">
      <legend className="sr-only">{section.title}</legend>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
        className="hover:bg-accent/30 flex w-full items-center gap-3 p-4 text-left transition-colors"
      >
        <span className="display flex-1 text-2xl">{section.title}</span>
        {complete ? (
          <CheckCircleIcon
            aria-label="Section complète"
            className="animate-in zoom-in text-gold size-6 duration-300"
          />
        ) : (
          <span className="label">
            {section.done}/{section.total}
          </span>
        )}
        <ChevronDownIcon
          className={cn(
            "size-5 transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="border-border flex flex-col gap-4 border-t p-4">
            {children}
          </div>
        </div>
      </div>
    </fieldset>
  )
}
