import Link from "next/link"
import { redirect } from "next/navigation"

import { PageContainer } from "@/components/custom/page-container"
import { DeleteTemplateButton } from "@/components/custom/template-actions"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/helper"
import prisma from "@/lib/prisma"
import { kindLabel } from "@/lib/templates/definition"

export const metadata = { title: "Créateur de modèles · ILH" }

const STATUS_LABEL = {
  DRAFT: "Brouillon",
  PENDING: "En validation",
  PUBLISHED: "Publié",
  REJECTED: "Refusé",
} as const

export default async function CreatorPage() {
  const user = await auth()
  if (!user) redirect("/connexion?type=login")

  const templates = await prisma.customTemplate.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <PageContainer>
      <p className="label text-crimson">Créateur</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">Mes modèles</h1>
      <p className="text-muted-foreground mt-4 mb-8 max-w-xl">
        Crée ton propre modèle de fiche. Après validation par un administrateur,
        il apparaît dans la liste des codes.
      </p>
      <Button asChild className="mb-8">
        <Link href="/createur/nouveau">Nouveau modèle</Link>
      </Button>

      {templates.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun modèle pour l&apos;instant.
        </p>
      ) : (
        <ul className="border-border bg-card divide-border divide-y border">
          {templates.map((template) => (
            <li
              key={template.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="display text-xl">{template.title}</p>
                <p className="label text-muted-foreground">
                  {kindLabel(template.kind)} · {STATUS_LABEL[template.status]} ·{" "}
                  {template.updatedAt.toLocaleDateString("fr-FR")}
                </p>
                {template.status === "REJECTED" && template.reviewNote && (
                  <p className="text-crimson mt-1 text-sm">
                    {template.reviewNote}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/createur/${template.id}`}>
                    {template.status === "DRAFT" ||
                    template.status === "REJECTED"
                      ? "Modifier"
                      : "Voir"}
                  </Link>
                </Button>
                {template.status === "PUBLISHED" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/codes/u-${template.id}`}>Utiliser</Link>
                  </Button>
                )}
                {template.status !== "PUBLISHED" && (
                  <DeleteTemplateButton
                    id={template.id}
                    title={template.title}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
