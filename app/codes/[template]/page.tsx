import { notFound } from "next/navigation"

import { PageContainer } from "@/components/custom/page-container"
import { CodeGenerator } from "@/components/custom/code-generator"
import { getForumTheme } from "@/lib/forum-theme"
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

  const theme = await getForumTheme()

  return (
    <PageContainer>
      <p className="label text-crimson">Gabarit</p>
      <h1 className="display mt-2 text-4xl md:text-6xl">{template.title}</h1>
      <p className="text-muted-foreground mt-3 mb-10 max-w-2xl">
        {template.description}
      </p>
      <CodeGenerator template={template} theme={theme} />
    </PageContainer>
  )
}
