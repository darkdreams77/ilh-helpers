import { notFound, redirect } from "next/navigation"

import { PageContainer } from "@/components/custom/page-container"
import { TemplateBuilder } from "@/components/custom/template-builder"
import { auth } from "@/lib/auth/helper"
import { getForumTheme } from "@/lib/forum-theme"
import prisma from "@/lib/prisma"
import { parseFields, type TemplateDraft } from "@/lib/templates/definition"

export const metadata = { title: "Créateur de modèles · ILH" }

const STARTER: TemplateDraft = {
  kind: "LINKS",
  title: "",
  description: "",
  fields: [{ id: "pseudo", label: "Pseudo", type: "text", section: "" }],
  html: '<div class="ma-fiche">\n  <h2>{{pseudo}}</h2>\n</div>',
  css: ".ma-fiche { padding: 1rem; border: 1px solid currentColor; }",
}

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [{ id }, user] = await Promise.all([params, auth()])
  if (!user) redirect("/connexion?type=login")

  const theme = await getForumTheme()

  if (id === "nouveau") {
    return (
      <PageContainer>
        <p className="label text-crimson">Créateur</p>
        <h1 className="display mt-2 mb-8 text-4xl md:text-6xl">
          Nouveau modèle
        </h1>
        <TemplateBuilder initial={STARTER} status="DRAFT" theme={theme} />
      </PageContainer>
    )
  }

  const row = await prisma.customTemplate.findFirst({
    where: { id, authorId: user.id },
  })
  const fields = row ? parseFields(row.fields) : null
  if (!row || !fields) notFound()

  return (
    <PageContainer>
      <p className="label text-crimson">Créateur</p>
      <h1 className="display mt-2 mb-8 text-4xl md:text-6xl">{row.title}</h1>
      <TemplateBuilder
        id={row.id}
        initial={{
          kind: row.kind,
          title: row.title,
          description: row.description,
          fields,
          html: row.html,
          css: row.css,
        }}
        status={row.status}
        reviewNote={row.reviewNote}
        theme={theme}
      />
    </PageContainer>
  )
}
