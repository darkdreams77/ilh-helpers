import { notFound } from "next/navigation"

import { CodeGenerator } from "@/components/custom/code-generator"
import { getForumThemeVariables } from "@/lib/forum-theme"
import { getTemplate, templates } from "@/lib/templates"

type PageProps = { params: Promise<{ template: string }> }

export function generateStaticParams() {
  return templates.map((template) => ({ template: template.id }))
}

export async function generateMetadata({ params }: PageProps) {
  const template = getTemplate((await params).template)
  return { title: template ? `${template.title} · ILH` : "Code · ILH" }
}

export default async function CodePage({ params }: PageProps) {
  const template = getTemplate((await params).template)
  if (!template) notFound()

  const themeVariables = await getForumThemeVariables()

  return (
    <>
      <h1 className="mb-1 text-3xl font-bold">{template.title}</h1>
      <p className="mb-8 text-muted-foreground">{template.description}</p>
      <CodeGenerator template={template} themeVariables={themeVariables} />
    </>
  )
}
