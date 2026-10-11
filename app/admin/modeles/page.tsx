import Link from "next/link"
import { notFound } from "next/navigation"

import { PageContainer } from "@/components/custom/page-container"
import { ReviewControls } from "@/components/custom/template-actions"
import { isAdmin } from "@/lib/auth/admin"
import { auth } from "@/lib/auth/helper"
import prisma from "@/lib/prisma"
import { kindLabel } from "@/lib/templates/definition"

export const metadata = { title: "Valider les modèles · ILH" }

export default async function ReviewPage() {
  const user = await auth()
  if (!isAdmin(user)) notFound()

  const pending = await prisma.customTemplate.findMany({
    where: { status: "PENDING" },
    orderBy: { updatedAt: "asc" },
    include: { author: { select: { name: true } } },
  })

  return (
    <PageContainer>
      <p className="label text-crimson">Administration</p>
      <h1 className="display mt-2 mb-8 text-5xl md:text-7xl">
        Modèles en attente
      </h1>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">Rien à valider.</p>
      ) : (
        <ul className="space-y-6">
          {pending.map((template) => (
            <li key={template.id} className="border-border bg-card border p-6">
              <p className="display text-2xl">{template.title}</p>
              <p className="label text-muted-foreground">
                {kindLabel(template.kind)} · par{" "}
                {template.author.name ?? "anonyme"} ·{" "}
                {template.updatedAt.toLocaleDateString("fr-FR")}
              </p>
              {template.description && (
                <p className="mt-2 text-sm">{template.description}</p>
              )}
              <Link
                href={`/codes/u-${template.id}`}
                className="label text-crimson mt-2 inline-block underline"
              >
                Tester le formulaire →
              </Link>

              <details className="mt-4">
                <summary className="label cursor-pointer">HTML</summary>
                <pre className="bg-muted mt-2 max-h-96 overflow-auto p-3 text-xs">
                  {template.html}
                </pre>
              </details>
              <details className="mt-2">
                <summary className="label cursor-pointer">CSS</summary>
                <pre className="bg-muted mt-2 max-h-96 overflow-auto p-3 text-xs">
                  {template.css || "(vide)"}
                </pre>
              </details>

              <ReviewControls id={template.id} />
            </li>
          ))}
        </ul>
      )}
    </PageContainer>
  )
}
