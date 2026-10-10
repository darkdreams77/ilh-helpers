import Link from "next/link"

import { PageContainer } from "@/components/custom/page-container"
import { templates } from "@/lib/templates"

export const metadata = { title: "Codes · ILH" }

export default async function CodesPage({
  searchParams,
}: {
  searchParams: Promise<{ personnage?: string }>
}) {
  const { personnage } = await searchParams
  const query = personnage ? `?personnage=${encodeURIComponent(personnage)}` : ""

  return (
    <PageContainer>
      <p className="label text-crimson">Gabarits</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">Codes</h1>
      <p className="mt-4 mb-10 max-w-xl text-muted-foreground">
        Choisis un code, remplis le formulaire, copie le résultat.
      </p>
      <div className="grid border border-border bg-card md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Link
            key={template.id}
            href={`/codes/${template.id}${query}`}
            className="group flex min-h-56 flex-col justify-between gap-8 p-8 transition-colors hover:bg-band hover:text-band-foreground"
          >
            <span className="label text-crimson group-hover:text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="space-y-3">
              <h2 className="display text-3xl">{template.title}</h2>
              <p className="text-sm text-muted-foreground group-hover:text-band-foreground/70">
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
