import { notFound } from "next/navigation"

import { CodeGenerator } from "@/components/custom/code-generator"
import { PageContainer } from "@/components/custom/page-container"
import { auth } from "@/lib/auth/helper"
import {
  findCharacter,
  findCode,
  listCharacters,
} from "@/lib/characters/queries"
import { sanitizeValues } from "@/lib/characters/schema"
import { getForumTheme } from "@/lib/forum-theme"
import { getTemplate, templates } from "@/lib/templates"

type PageProps = {
  params: Promise<{ template: string }>
  searchParams: Promise<{ code?: string; personnage?: string }>
}

export function generateStaticParams() {
  return templates.map((template) => ({ template: template.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const template = getTemplate((await params).template)
  return { title: template ? `${template.title} · ILH` : "Code · ILH" }
}

export default async function CodePage({ params, searchParams }: PageProps) {
  const template = getTemplate((await params).template)
  if (!template) notFound()

  const { code: codeId, personnage } = await searchParams
  const [theme, user] = await Promise.all([getForumTheme(), auth()])

  let characters: { id: string; name: string }[] | null = null
  let initialValues: Record<string, string> = {}
  let initialCharacterId: string | undefined

  if (user) {
    characters = (await listCharacters(user.id)).map(({ id, name }) => ({
      id,
      name,
    }))

    const saved = codeId ? await findCode(user.id, codeId) : null
    if (saved && saved.templateId === template.id) {
      initialValues = sanitizeValues(template, saved.values)
      initialCharacterId = saved.characterId
    } else if (personnage) {
      const character = await findCharacter(user.id, personnage)
      if (character) {
        initialCharacterId = character.id
        initialValues = {
          pseudo: character.name,
          ...(character.faceclaim && { faceclaim: character.faceclaim }),
          ...(character.avatar && { avatar: character.avatar }),
        }
      }
    }
  }

  return (
    <PageContainer>
      <p className="label text-crimson">Modèle</p>
      <h1 className="display mt-2 text-4xl md:text-6xl">{template.title}</h1>
      <p className="text-muted-foreground mt-3 mb-10 max-w-2xl">
        {template.description}
      </p>
      <CodeGenerator
        template={template}
        theme={theme}
        characters={characters}
        initialValues={initialValues}
        initialCharacterId={initialCharacterId}
      />
    </PageContainer>
  )
}
