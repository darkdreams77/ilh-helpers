import Link from "next/link"

import { PageContainer } from "@/components/custom/page-container"
import { kindLabel } from "@/lib/templates/definition"
import { listLibrary } from "@/lib/templates/library"

export const metadata = { title: "Codes · ILH" }

export default async function CodesPage({
  searchParams,
}: {
  searchParams: Promise<{ personnage?: string }>
}) {
  const { personnage } = await searchParams
  const templates = await listLibrary()
  const query = personnage
    ? `?personnage=${encodeURIComponent(personnage)}`
    : ""

  return (
    <PageContainer>
      <p className="label text-crimson">Modèles</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">Codes</h1>
      <p className="text-muted-foreground mt-4 mb-10 max-w-xl">
        Choisis un code, remplis le formulaire, copie le résultat.
      </p>
      <div className="border-border bg-card grid border md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Link
            key={template.id}
            href={`/codes/${template.id}${query}`}
            className="group hover:bg-band hover:text-band-foreground flex min-h-56 flex-col justify-between gap-8 p-8 transition-colors"
          >
            <span className="label text-crimson group-hover:text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="space-y-3">
              <h2 className="display text-3xl">{template.title}</h2>
              {template.author && (
                <p className="label">
                  {kindLabel(template.kind)} · par {template.author}
                </p>
              )}
              <p className="text-muted-foreground group-hover:text-band-foreground/70 text-sm">
                {template.description}
              </p>
              <span className="label inline-block">Remplir →</span>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
